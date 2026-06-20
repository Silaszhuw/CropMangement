-- Phase 1: 高优先级表 - 支持三级界面核心功能

-- 模型参数表
CREATE TABLE IF NOT EXISTS model_parameters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parameter_group TEXT NOT NULL,
  parameter_name TEXT NOT NULL,
  parameter_key TEXT NOT NULL UNIQUE,
  default_value REAL NOT NULL,
  current_value REAL NOT NULL,
  min_value REAL,
  max_value REAL,
  unit TEXT,
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_model_parameters_group ON model_parameters(parameter_group);
CREATE INDEX IF NOT EXISTS idx_model_parameters_key ON model_parameters(parameter_key);

-- 生育期观测数据表
CREATE TABLE IF NOT EXISTS growth_stage_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planting_record_id INTEGER NOT NULL,
  stage_code TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  observation_date TEXT NOT NULL,
  days_after_planting INTEGER,
  accumulated_temperature REAL,
  plant_height REAL,
  leaf_count INTEGER,
  stem_diameter REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planting_record_id) REFERENCES planting_records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_growth_stage_observations_planting_record_id ON growth_stage_observations(planting_record_id);
CREATE INDEX IF NOT EXISTS idx_growth_stage_observations_stage_code ON growth_stage_observations(stage_code);
CREATE INDEX IF NOT EXISTS idx_growth_stage_observations_date ON growth_stage_observations(observation_date);

-- 参数调整记录表
CREATE TABLE IF NOT EXISTS parameter_adjustment_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parameter_id INTEGER NOT NULL,
  old_value REAL NOT NULL,
  new_value REAL NOT NULL,
  adjustment_reason TEXT,
  adjusted_by TEXT,
  adjusted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parameter_id) REFERENCES model_parameters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parameter_adjustment_records_parameter_id ON parameter_adjustment_records(parameter_id);
CREATE INDEX IF NOT EXISTS idx_parameter_adjustment_records_date ON parameter_adjustment_records(adjusted_at);

-- 插入默认模型参数
INSERT INTO model_parameters (parameter_group, parameter_name, parameter_key, default_value, current_value, min_value, max_value, unit, description) VALUES
-- 光温参数组
('photoperiod', '基础光周期', 'photoperiod.base', 12.5, 12.5, 10.0, 14.0, 'h', '玉米对光周期敏感的基础值'),
('photoperiod', '光周期敏感系数', 'photoperiod.sensitivity', 0.05, 0.05, 0.0, 0.2, '', '光周期对生育期的影响系数'),
('thermal', '基础温度', 'thermal.base_temp', 10.0, 10.0, 6.0, 12.0, '°C', '玉米生长的基础温度'),
('thermal', '最适温度', 'thermal.optimal_temp', 28.0, 28.0, 24.0, 32.0, '°C', '玉米生长的最适温度'),
('thermal', '最高温度', 'thermal.max_temp', 40.0, 40.0, 35.0, 45.0, '°C', '玉米生长的最高温度'),

-- 品种参数组
('variety', 'VE-V6积温', 'variety.ve_v6_gdd', 350.0, 350.0, 250.0, 450.0, '°C·d', '出苗到六叶期所需积温'),
('variety', 'V6-VT积温', 'variety.v6_vt_gdd', 450.0, 450.0, 350.0, 550.0, '°C·d', '六叶期到抽雄期所需积温'),
('variety', 'VT-R1积温', 'variety.vt_r1_gdd', 60.0, 60.0, 40.0, 80.0, '°C·d', '抽雄到吐丝所需积温'),
('variety', 'R1-R3积温', 'variety.r1_r3_gdd', 280.0, 280.0, 200.0, 350.0, '°C·d', '吐丝到乳熟期所需积温'),
('variety', 'R3-R6积温', 'variety.r3_r6_gdd', 550.0, 550.0, 450.0, 650.0, '°C·d', '乳熟到完熟所需积温'),

-- 土壤参数组
('soil', '适宜土壤pH下限', 'soil.ph_min', 6.0, 6.0, 5.0, 6.5, '', '适宜玉米生长的土壤pH下限'),
('soil', '适宜土壤pH上限', 'soil.ph_max', 7.5, 7.5, 7.0, 8.5, '', '适宜玉米生长的土壤pH上限'),
('soil', '适宜有机质含量', 'soil.organic_matter', 20.0, 20.0, 15.0, 30.0, 'g/kg', '适宜的土壤有机质含量');
