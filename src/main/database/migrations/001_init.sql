CREATE TABLE IF NOT EXISTS fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  area REAL NOT NULL,
  location_province TEXT,
  location_city TEXT,
  location_county TEXT,
  location_detail TEXT,
  coordinates TEXT,
  soil_type TEXT,
  soil_ph REAL,
  soil_organic_matter REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fields_name ON fields(name);
CREATE INDEX IF NOT EXISTS idx_fields_location ON fields(location_province, location_city);

CREATE TABLE IF NOT EXISTS crop_varieties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  type TEXT NOT NULL,
  growth_period INTEGER,
  yield_potential REAL,
  disease_resistance TEXT,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crop_varieties_type ON crop_varieties(type);
CREATE INDEX IF NOT EXISTS idx_crop_varieties_is_active ON crop_varieties(is_active);

CREATE TABLE IF NOT EXISTS planting_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  field_id INTEGER NOT NULL,
  variety_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  season TEXT NOT NULL,
  planting_date TEXT NOT NULL,
  expected_harvest_date TEXT,
  actual_harvest_date TEXT,
  planting_density INTEGER,
  row_spacing REAL,
  plant_spacing REAL,
  status TEXT NOT NULL DEFAULT 'planning',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE RESTRICT,
  FOREIGN KEY (variety_id) REFERENCES crop_varieties(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_planting_records_field_id ON planting_records(field_id);
CREATE INDEX IF NOT EXISTS idx_planting_records_variety_id ON planting_records(variety_id);
CREATE INDEX IF NOT EXISTS idx_planting_records_year ON planting_records(year);
CREATE INDEX IF NOT EXISTS idx_planting_records_status ON planting_records(status);

CREATE TABLE IF NOT EXISTS growth_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planting_record_id INTEGER NOT NULL,
  record_date TEXT NOT NULL,
  growth_stage TEXT NOT NULL,
  plant_height REAL,
  leaf_count INTEGER,
  leaf_color TEXT,
  disease_status TEXT,
  pest_status TEXT,
  soil_moisture REAL,
  weather_temperature_avg REAL,
  weather_rainfall REAL,
  photo_paths TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planting_record_id) REFERENCES planting_records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_growth_records_planting_record_id ON growth_records(planting_record_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_record_date ON growth_records(record_date);
CREATE INDEX IF NOT EXISTS idx_growth_records_growth_stage ON growth_records(growth_stage);

CREATE TABLE IF NOT EXISTS operation_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planting_record_id INTEGER NOT NULL,
  operation_type TEXT NOT NULL,
  operation_date TEXT NOT NULL,
  details TEXT,
  cost REAL,
  operator TEXT,
  photo_paths TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planting_record_id) REFERENCES planting_records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_operation_records_planting_record_id ON operation_records(planting_record_id);
CREATE INDEX IF NOT EXISTS idx_operation_records_operation_type ON operation_records(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_records_operation_date ON operation_records(operation_date);

CREATE TABLE IF NOT EXISTS knowledge_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  source TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_items_category ON knowledge_items(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_is_active ON knowledge_items(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_title ON knowledge_items(title);

CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  field_id INTEGER,
  planting_record_id INTEGER,
  decision_type TEXT NOT NULL,
  decision_category TEXT NOT NULL,
  decision_date TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  basis_summary TEXT,
  recommended_actions TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  user_feedback TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
  FOREIGN KEY (planting_record_id) REFERENCES planting_records(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_decisions_field_id ON decisions(field_id);
CREATE INDEX IF NOT EXISTS idx_decisions_planting_record_id ON decisions(planting_record_id);
CREATE INDEX IF NOT EXISTS idx_decisions_decision_type ON decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_decisions_decision_category ON decisions(decision_category);
CREATE INDEX IF NOT EXISTS idx_decisions_decision_date ON decisions(decision_date);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);

CREATE TABLE IF NOT EXISTS evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planting_record_id INTEGER NOT NULL,
  evaluation_date TEXT NOT NULL,
  evaluation_type TEXT NOT NULL,
  actual_yield REAL,
  total_cost REAL,
  total_income REAL,
  net_profit REAL,
  overall_score REAL,
  improvement_suggestions TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planting_record_id) REFERENCES planting_records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evaluations_planting_record_id ON evaluations(planting_record_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluation_date ON evaluations(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluation_type ON evaluations(evaluation_type);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_settings_config_key ON app_settings(config_key);
