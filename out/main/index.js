import { ipcMain, app, BrowserWindow } from "electron";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
let database = null;
function ensureDatabaseDirectory(app2) {
  const userDataPath = app2.getPath("userData");
  const dataDirectory = join(userDataPath, "data");
  if (!existsSync(dataDirectory)) {
    mkdirSync(dataDirectory, { recursive: true });
  }
  return dataDirectory;
}
function openDatabase(app2) {
  if (database) {
    return database;
  }
  const dataDirectory = ensureDatabaseDirectory(app2);
  const databasePath = join(dataDirectory, "app.db");
  database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  return database;
}
function getDatabase() {
  if (!database) {
    throw new Error("Database has not been initialized yet.");
  }
  return database;
}
function ensureMetaTables(database2) {
  database2.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
function resolveMigrationDirectory(options) {
  if (!options.isPackaged && existsSync(options.developmentDirectory)) {
    return options.developmentDirectory;
  }
  if (existsSync(options.packagedDirectory)) {
    return options.packagedDirectory;
  }
  return options.fallbackDirectory;
}
function runMigrations(database2, options) {
  ensureMetaTables(database2);
  const appliedVersions = new Set(
    database2.prepare("SELECT version FROM schema_migrations").all().map(
      (row) => row.version
    )
  );
  const migrationDirectory = resolveMigrationDirectory(options);
  const migrationFiles = readdirSync(migrationDirectory).filter((file) => file.endsWith(".sql")).sort((left, right) => left.localeCompare(right));
  for (const fileName of migrationFiles) {
    if (appliedVersions.has(fileName)) {
      continue;
    }
    const migrationPath = join(migrationDirectory, fileName);
    const sql = readFileSync(migrationPath, "utf-8");
    const applyMigration = database2.transaction(() => {
      database2.exec(sql);
      database2.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(fileName);
    });
    applyMigration();
  }
}
const currentDirectory$1 = dirname(fileURLToPath(import.meta.url));
function initializeDatabase(app2) {
  const database2 = openDatabase(app2);
  runMigrations(database2, {
    isPackaged: app2.isPackaged,
    developmentDirectory: join(process.cwd(), "src/main/database/migrations"),
    packagedDirectory: join(process.resourcesPath, "migrations"),
    fallbackDirectory: join(currentDirectory$1, "migrations")
  });
  return database2;
}
class BaseRepository {
  constructor(database2) {
    this.database = database2;
  }
  getPaginationClause(options) {
    if (!options?.limit) {
      return "";
    }
    const offset = options.offset ?? 0;
    return ` LIMIT ${options.limit} OFFSET ${offset}`;
  }
}
function mapField(row) {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    locationProvince: row.location_province,
    locationCity: row.location_city,
    locationCounty: row.location_county,
    locationDetail: row.location_detail,
    coordinates: row.coordinates,
    soilType: row.soil_type,
    soilPh: row.soil_ph,
    soilOrganicMatter: row.soil_organic_matter,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
class FieldsRepository extends BaseRepository {
  constructor(database2) {
    super(database2);
  }
  findAll() {
    const rows = this.database.prepare("SELECT * FROM fields ORDER BY updated_at DESC, id DESC").all();
    return rows.map(mapField);
  }
  findById(id) {
    const row = this.database.prepare("SELECT * FROM fields WHERE id = ?").get(id);
    return row ? mapField(row) : null;
  }
  create(input) {
    const result = this.database.prepare(
      `INSERT INTO fields (
          name,
          area,
          location_province,
          location_city,
          location_county,
          location_detail,
          coordinates,
          soil_type,
          soil_ph,
          soil_organic_matter,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      input.name,
      input.area,
      input.locationProvince ?? null,
      input.locationCity ?? null,
      input.locationCounty ?? null,
      input.locationDetail ?? null,
      input.coordinates ?? null,
      input.soilType ?? null,
      input.soilPh ?? null,
      input.soilOrganicMatter ?? null,
      input.notes ?? null
    );
    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Failed to create field.");
    }
    return created;
  }
  update(input) {
    this.database.prepare(
      `UPDATE fields SET
          name = ?,
          area = ?,
          location_province = ?,
          location_city = ?,
          location_county = ?,
          location_detail = ?,
          coordinates = ?,
          soil_type = ?,
          soil_ph = ?,
          soil_organic_matter = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
    ).run(
      input.name,
      input.area,
      input.locationProvince ?? null,
      input.locationCity ?? null,
      input.locationCounty ?? null,
      input.locationDetail ?? null,
      input.coordinates ?? null,
      input.soilType ?? null,
      input.soilPh ?? null,
      input.soilOrganicMatter ?? null,
      input.notes ?? null,
      input.id
    );
    const updated = this.findById(input.id);
    if (!updated) {
      throw new Error(`Field ${input.id} not found after update.`);
    }
    return updated;
  }
  delete(id) {
    this.database.prepare("DELETE FROM fields WHERE id = ?").run(id);
  }
}
const IPC_CHANNELS = {
  fields: {
    list: "fields:list",
    getById: "fields:getById",
    create: "fields:create",
    update: "fields:update",
    remove: "fields:remove"
  },
  cropVarieties: {
    list: "cropVarieties:list",
    getById: "cropVarieties:getById",
    create: "cropVarieties:create",
    update: "cropVarieties:update",
    remove: "cropVarieties:remove"
  },
  plantingRecords: {
    list: "plantingRecords:list",
    getById: "plantingRecords:getById",
    create: "plantingRecords:create",
    update: "plantingRecords:update",
    remove: "plantingRecords:remove"
  }
};
function ok$2(data) {
  return { success: true, data };
}
function fail$2(error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown IPC error"
  };
}
function registerFieldsIpc() {
  const repository = new FieldsRepository(getDatabase());
  ipcMain.handle(IPC_CHANNELS.fields.list, async () => {
    try {
      return ok$2(repository.findAll());
    } catch (error) {
      return fail$2(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.fields.getById, async (_, id) => {
    try {
      return ok$2(repository.findById(id));
    } catch (error) {
      return fail$2(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.fields.create, async (_, input) => {
    try {
      return ok$2(repository.create(input));
    } catch (error) {
      return fail$2(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.fields.update, async (_, input) => {
    try {
      return ok$2(repository.update(input));
    } catch (error) {
      return fail$2(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.fields.remove, async (_, id) => {
    try {
      repository.delete(id);
      return ok$2(void 0);
    } catch (error) {
      return fail$2(error);
    }
  });
}
function mapCropVariety(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    growthPeriod: row.growth_period,
    yieldPotential: row.yield_potential,
    diseaseResistance: row.disease_resistance,
    description: row.description,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
class CropVarietiesRepository extends BaseRepository {
  constructor(database2) {
    super(database2);
  }
  findAll() {
    const rows = this.database.prepare("SELECT * FROM crop_varieties ORDER BY updated_at DESC, id DESC").all();
    return rows.map(mapCropVariety);
  }
  findById(id) {
    const row = this.database.prepare("SELECT * FROM crop_varieties WHERE id = ?").get(id);
    return row ? mapCropVariety(row) : null;
  }
  create(input) {
    const result = this.database.prepare(
      `INSERT INTO crop_varieties (
          name,
          code,
          type,
          growth_period,
          yield_potential,
          disease_resistance,
          description,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      input.name,
      input.code ?? null,
      input.type,
      input.growthPeriod ?? null,
      input.yieldPotential ?? null,
      input.diseaseResistance ?? null,
      input.description ?? null,
      input.isActive === false ? 0 : 1
    );
    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Failed to create crop variety.");
    }
    return created;
  }
  update(input) {
    this.database.prepare(
      `UPDATE crop_varieties SET
          name = ?,
          code = ?,
          type = ?,
          growth_period = ?,
          yield_potential = ?,
          disease_resistance = ?,
          description = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
    ).run(
      input.name,
      input.code ?? null,
      input.type,
      input.growthPeriod ?? null,
      input.yieldPotential ?? null,
      input.diseaseResistance ?? null,
      input.description ?? null,
      input.isActive === false ? 0 : 1,
      input.id
    );
    const updated = this.findById(input.id);
    if (!updated) {
      throw new Error(`Crop variety ${input.id} not found after update.`);
    }
    return updated;
  }
  delete(id) {
    this.database.prepare("DELETE FROM crop_varieties WHERE id = ?").run(id);
  }
}
function ok$1(data) {
  return { success: true, data };
}
function fail$1(error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown IPC error"
  };
}
function registerCropVarietiesIpc() {
  const repository = new CropVarietiesRepository(getDatabase());
  ipcMain.handle(IPC_CHANNELS.cropVarieties.list, async () => {
    try {
      return ok$1(repository.findAll());
    } catch (error) {
      return fail$1(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.cropVarieties.getById, async (_, id) => {
    try {
      return ok$1(repository.findById(id));
    } catch (error) {
      return fail$1(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.cropVarieties.create, async (_, input) => {
    try {
      return ok$1(repository.create(input));
    } catch (error) {
      return fail$1(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.cropVarieties.update, async (_, input) => {
    try {
      return ok$1(repository.update(input));
    } catch (error) {
      return fail$1(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.cropVarieties.remove, async (_, id) => {
    try {
      repository.delete(id);
      return ok$1(void 0);
    } catch (error) {
      return fail$1(error);
    }
  });
}
function mapPlantingRecord(row) {
  return {
    id: row.id,
    fieldId: row.field_id,
    varietyId: row.variety_id,
    year: row.year,
    season: row.season,
    plantingDate: row.planting_date,
    expectedHarvestDate: row.expected_harvest_date,
    actualHarvestDate: row.actual_harvest_date,
    plantingDensity: row.planting_density,
    rowSpacing: row.row_spacing,
    plantSpacing: row.plant_spacing,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
class PlantingRecordsRepository extends BaseRepository {
  constructor(database2) {
    super(database2);
  }
  findAll() {
    const rows = this.database.prepare("SELECT * FROM planting_records ORDER BY updated_at DESC, id DESC").all();
    return rows.map(mapPlantingRecord);
  }
  findById(id) {
    const row = this.database.prepare("SELECT * FROM planting_records WHERE id = ?").get(id);
    return row ? mapPlantingRecord(row) : null;
  }
  create(input) {
    const result = this.database.prepare(
      `INSERT INTO planting_records (
          field_id,
          variety_id,
          year,
          season,
          planting_date,
          expected_harvest_date,
          actual_harvest_date,
          planting_density,
          row_spacing,
          plant_spacing,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      input.fieldId,
      input.varietyId,
      input.year,
      input.season,
      input.plantingDate,
      input.expectedHarvestDate ?? null,
      input.actualHarvestDate ?? null,
      input.plantingDensity ?? null,
      input.rowSpacing ?? null,
      input.plantSpacing ?? null,
      input.status ?? "planning",
      input.notes ?? null
    );
    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Failed to create planting record.");
    }
    return created;
  }
  update(input) {
    this.database.prepare(
      `UPDATE planting_records SET
          field_id = ?,
          variety_id = ?,
          year = ?,
          season = ?,
          planting_date = ?,
          expected_harvest_date = ?,
          actual_harvest_date = ?,
          planting_density = ?,
          row_spacing = ?,
          plant_spacing = ?,
          status = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
    ).run(
      input.fieldId,
      input.varietyId,
      input.year,
      input.season,
      input.plantingDate,
      input.expectedHarvestDate ?? null,
      input.actualHarvestDate ?? null,
      input.plantingDensity ?? null,
      input.rowSpacing ?? null,
      input.plantSpacing ?? null,
      input.status ?? "planning",
      input.notes ?? null,
      input.id
    );
    const updated = this.findById(input.id);
    if (!updated) {
      throw new Error(`Planting record ${input.id} not found after update.`);
    }
    return updated;
  }
  delete(id) {
    this.database.prepare("DELETE FROM planting_records WHERE id = ?").run(id);
  }
}
function ok(data) {
  return { success: true, data };
}
function fail(error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown IPC error"
  };
}
function registerPlantingRecordsIpc() {
  const repository = new PlantingRecordsRepository(getDatabase());
  ipcMain.handle(IPC_CHANNELS.plantingRecords.list, async () => {
    try {
      return ok(repository.findAll());
    } catch (error) {
      return fail(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.plantingRecords.getById, async (_, id) => {
    try {
      return ok(repository.findById(id));
    } catch (error) {
      return fail(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.plantingRecords.create, async (_, input) => {
    try {
      return ok(repository.create(input));
    } catch (error) {
      return fail(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.plantingRecords.update, async (_, input) => {
    try {
      return ok(repository.update(input));
    } catch (error) {
      return fail(error);
    }
  });
  ipcMain.handle(IPC_CHANNELS.plantingRecords.remove, async (_, id) => {
    try {
      repository.delete(id);
      return ok(void 0);
    } catch (error) {
      return fail(error);
    }
  });
}
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1200,
    minHeight: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(currentDirectory, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }
  void mainWindow.loadFile(join(currentDirectory, "../renderer/index.html"));
}
app.whenReady().then(() => {
  initializeDatabase(app);
  registerFieldsIpc();
  registerCropVarietiesIpc();
  registerPlantingRecordsIpc();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
