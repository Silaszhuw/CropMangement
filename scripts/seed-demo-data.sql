BEGIN TRANSACTION;

-- 基础地块：如目标库为空，则补 1 条演示地块。
INSERT INTO fields (
  name,
  area,
  location_province,
  location_city,
  location_county,
  location_detail,
  soil_type,
  soil_ph,
  soil_organic_matter,
  notes
)
SELECT
  '新乡实验田',
  10.0,
  '河南',
  '新乡',
  '新乡县',
  '朗公庙村',
  '壤土',
  6.7,
  19.8,
  '演示数据：用于本地原型联调。'
WHERE NOT EXISTS (
  SELECT 1 FROM fields WHERE name = '新乡实验田'
);

-- 品种参数：字段不含来源列，因此在说明中明确标注为演示参数。
INSERT INTO crop_varieties (
  name,
  code,
  type,
  growth_period,
  yield_potential,
  disease_resistance,
  description,
  is_active
)
SELECT
  '郑单958',
  'ZD958',
  '中晚熟',
  128,
  900,
  '中抗叶部病害，耐密植性中等。',
  '演示数据：依据公开品种介绍整理，用于原型展示，不作为审定参数。',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM crop_varieties WHERE code = 'ZD958'
);

INSERT INTO crop_varieties (
  name,
  code,
  type,
  growth_period,
  yield_potential,
  disease_resistance,
  description,
  is_active
)
SELECT
  '先玉335',
  'XY335',
  '中熟',
  123,
  860,
  '抗倒伏性较好，对常见叶部病害具中等抗性。',
  '演示数据：依据公开品种介绍整理，用于原型展示，不作为审定参数。',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM crop_varieties WHERE code = 'XY335'
);

-- 试验记录：1 条历史已收获记录 + 1 条当前在种记录。
INSERT INTO planting_records (
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
)
SELECT
  (SELECT id FROM fields WHERE name = '新乡实验田' ORDER BY id LIMIT 1),
  (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1),
  2025,
  '春播',
  '2025-05-03',
  '2025-09-25',
  '2025-09-29',
  4500,
  60.0,
  24.0,
  'harvested',
  '演示数据：历史批次，用于联调详情页、评价页与决策页。'
WHERE NOT EXISTS (
  SELECT 1
  FROM planting_records
  WHERE year = 2025
    AND season = '春播'
    AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1)
);

INSERT INTO planting_records (
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
)
SELECT
  (SELECT id FROM fields WHERE name = '新乡实验田' ORDER BY id LIMIT 1),
  (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1),
  2026,
  '春播',
  '2026-04-29',
  '2026-09-22',
  NULL,
  4700,
  60.0,
  22.5,
  'growing',
  '演示数据：当前在种批次，用于联调生育期观测、预测与当年决策页面。'
WHERE NOT EXISTS (
  SELECT 1
  FROM planting_records
  WHERE year = 2026
    AND season = '春播'
    AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1)
);

-- 生长记录。
INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1),
  '2025-05-30',
  'V6',
  38.0,
  6,
  '深绿',
  '未见异常',
  '未见明显虫口',
  23.5,
  24.6,
  12.0,
  '苗期整齐度较好。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1)
    AND record_date = '2025-05-30'
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1),
  '2025-07-08',
  'VT',
  208.0,
  15,
  '正常',
  '下部叶片零星病斑',
  '未见明显虫口',
  20.1,
  29.2,
  4.0,
  '进入抽雄期，群体长势均匀。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1)
    AND record_date = '2025-07-08'
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1),
  '2025-08-15',
  'R3',
  215.0,
  16,
  '正常',
  '穗位叶轻度病斑',
  '零星取食痕',
  21.4,
  27.8,
  18.0,
  '籽粒进入乳熟阶段。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1)
    AND record_date = '2025-08-15'
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  '2026-05-20',
  'V3',
  18.5,
  3,
  '深绿',
  '未见异常',
  '未见明显虫口',
  24.0,
  23.9,
  10.0,
  '拔节前群体整齐。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1)
    AND record_date = '2026-05-20'
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  '2026-06-10',
  'V10',
  128.0,
  10,
  '正常',
  '未见异常',
  '心叶处需持续监测',
  19.6,
  28.1,
  6.0,
  '即将进入大喇叭口至抽雄前阶段。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1)
    AND record_date = '2026-06-10'
);

-- 农事操作。
INSERT INTO operation_records (
  planting_record_id,
  operation_type,
  operation_date,
  details,
  cost,
  operator,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1),
  '播种',
  '2025-05-03',
  '条播建苗，基础密度 4500 株/亩。',
  180.0,
  '王建国',
  '演示数据'
WHERE NOT EXISTS (
  SELECT 1 FROM operation_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1)
    AND operation_type = '播种'
    AND operation_date = '2025-05-03'
);

INSERT INTO operation_records (
  planting_record_id,
  operation_type,
  operation_date,
  details,
  cost,
  operator,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1),
  '追肥',
  '2025-06-01',
  'V6 阶段追施尿素 15 kg/亩，并结合墒情浅中耕。',
  420.0,
  '王建国',
  '演示数据'
WHERE NOT EXISTS (
  SELECT 1 FROM operation_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1)
    AND operation_type = '追肥'
    AND operation_date = '2025-06-01'
);

INSERT INTO operation_records (
  planting_record_id,
  operation_type,
  operation_date,
  details,
  cost,
  operator,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  '播种',
  '2026-04-29',
  '机械播种，目标密度 4700 株/亩。',
  190.0,
  '李红军',
  '演示数据'
WHERE NOT EXISTS (
  SELECT 1 FROM operation_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1)
    AND operation_type = '播种'
    AND operation_date = '2026-04-29'
);

INSERT INTO operation_records (
  planting_record_id,
  operation_type,
  operation_date,
  details,
  cost,
  operator,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  '追肥',
  '2026-06-06',
  '大喇叭口前补施氮肥，并结合病虫监测调整后续管理。',
  460.0,
  '李红军',
  '演示数据'
WHERE NOT EXISTS (
  SELECT 1 FROM operation_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1)
    AND operation_type = '追肥'
    AND operation_date = '2026-06-06'
);

-- 生育期观测。
INSERT INTO growth_stage_observations (
  planting_record_id,
  stage_code,
  stage_name,
  observation_date,
  days_after_planting,
  accumulated_temperature,
  plant_height,
  leaf_count,
  stem_diameter,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  'VE',
  '出苗',
  '2026-05-07',
  8,
  92.0,
  3.0,
  1,
  0.4,
  '出苗整齐，苗势一致。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_stage_observations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1)
    AND stage_code = 'VE'
);

INSERT INTO growth_stage_observations (
  planting_record_id,
  stage_code,
  stage_name,
  observation_date,
  days_after_planting,
  accumulated_temperature,
  plant_height,
  leaf_count,
  stem_diameter,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  'V6',
  '六叶期',
  '2026-05-31',
  32,
  376.0,
  42.0,
  6,
  1.8,
  '株高开始快速增长。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_stage_observations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1)
    AND stage_code = 'V6'
);

INSERT INTO growth_stage_observations (
  planting_record_id,
  stage_code,
  stage_name,
  observation_date,
  days_after_planting,
  accumulated_temperature,
  plant_height,
  leaf_count,
  stem_diameter,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  'VT',
  '抽雄期',
  '2026-06-18',
  50,
  760.0,
  196.0,
  14,
  2.5,
  '进入抽雄窗口，需重点关注吐丝同步与病虫监测。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_stage_observations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1)
    AND stage_code = 'VT'
);

-- 效益评价。
INSERT INTO evaluations (
  planting_record_id,
  evaluation_date,
  evaluation_type,
  actual_yield,
  total_cost,
  total_income,
  net_profit,
  overall_score,
  improvement_suggestions,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1),
  '2025-10-05',
  '产量效益评价',
  842.0,
  1460.0,
  2350.0,
  890.0,
  86.0,
  '可进一步优化中后期病害防控与穗期水肥协同管理。',
  '演示数据'
WHERE NOT EXISTS (
  SELECT 1 FROM evaluations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2025 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'ZD958' LIMIT 1) LIMIT 1)
    AND evaluation_date = '2025-10-05'
);

-- 知识条目：来源字段写入公开网页/PDF，便于追溯。
INSERT INTO knowledge_items (
  category,
  title,
  content,
  tags,
  source,
  is_active
)
SELECT
  '生育期管理',
  '玉米关键生育阶段观测节点（VE-V6-VT-R1-R6）',
  '演示建议将出苗、六叶期、抽雄、吐丝和成熟作为核心观测节点。营养生长期重点记录叶片数、株高和茎粗；抽雄至吐丝阶段重点关注雄穗抽出、雌穗吐丝同步性及病虫风险；成熟期重点记录灌浆完成度和收获窗口，用于模型校准与预测验证。',
  'VE,V6,VT,R1,R6,生育期,观测',
  'https://en.wikipedia.org/wiki/Cereal_growth_staging_scales',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_items WHERE title = '玉米关键生育阶段观测节点（VE-V6-VT-R1-R6）'
);

INSERT INTO knowledge_items (
  category,
  title,
  content,
  tags,
  source,
  is_active
)
SELECT
  '病害',
  '北方叶斑病识别与管理要点',
  '北方叶斑病由 Exserohilum turcicum 引起，典型症状为沿叶脉伸展的长梭形或雪茄状灰褐色病斑。若穗位叶及以上叶片在抽雄、吐丝前后两周显著发病，产量损失风险会上升。管理上应优先选择具中等以上抗性的杂交种，结合秸秆分解和轮作降低初侵染源，并在高风险年份将叶片保护重点放在抽雄至初吐丝阶段。',
  '北方叶斑病,叶部病害,抽雄期,吐丝期,轮作,抗病品种',
  'https://www.extension.purdue.edu/extmedia/BP/BP-84-W.pdf',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_items WHERE title = '北方叶斑病识别与管理要点'
);

INSERT INTO knowledge_items (
  category,
  title,
  content,
  tags,
  source,
  is_active
)
SELECT
  '虫害',
  '草地贪夜蛾危害特征与扩散风险',
  '草地贪夜蛾偏好取食玉米，也可危害 80 余种作物。其幼虫阶段破坏性最强，可取食心叶、叶片乃至果穗；成虫迁飞能力强，单夜可远距离扩散，因此一旦在区域内定殖，通常难以依靠单一措施彻底根除。监测重点应放在苗期至喇叭口期的心叶、虫孔和新鲜虫粪。',
  '草地贪夜蛾,虫害,迁飞,心叶,虫粪,监测',
  'https://www.fao.org/fall-armyworm/background/en/',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_items WHERE title = '草地贪夜蛾危害特征与扩散风险'
);

INSERT INTO knowledge_items (
  category,
  title,
  content,
  tags,
  source,
  is_active
)
SELECT
  '综合防治',
  '草地贪夜蛾综合防治与预警建议',
  '草地贪夜蛾治理不宜依赖单一化学防治。公开资料显示，应将自然控制、良好农艺措施、抗性品种、田间监测和早期干预组合使用。对玉米生产而言，建议把监测预警、分阶段巡田和阈值触发式防治结合起来，并优先使用能支持离线记录和农户反馈的监测工具，以提高区域联防联控效率。',
  '草地贪夜蛾,综合防治,监测预警,农艺措施,抗性品种,FAMEWS',
  'https://www.fao.org/fall-armyworm/en/',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_items WHERE title = '草地贪夜蛾综合防治与预警建议'
);

-- 决策记录：内容中有意包含知识关键词，便于前端“关联决策”联动。
INSERT INTO decisions (
  field_id,
  planting_record_id,
  decision_type,
  decision_category,
  decision_date,
  title,
  content,
  basis_summary,
  recommended_actions,
  status,
  user_feedback
)
SELECT
  (SELECT id FROM fields WHERE name = '新乡实验田' ORDER BY id LIMIT 1),
  NULL,
  '常年决策',
  '播期规划',
  '2026-03-20',
  '春播窗口安排与耐密品种配置建议',
  '结合本地春播条件，建议将主播期控制在 4 月下旬至 5 月上旬，优先配置中熟至中晚熟、耐密植能力较好的品种，并将田间观测节点固定到 VE、V6、VT、R1 和 R6。',
  '生育期管理与历年春播经验表明，关键生育阶段观测越规范，后续模型校准和决策质量越高。',
  '主推中熟耐密品种，目标密度控制在 4500 至 4800 株/亩，并预留抽雄吐丝期病虫监测频次。',
  'accepted',
  '已采纳为 2026 年春播演示方案。'
WHERE NOT EXISTS (
  SELECT 1 FROM decisions WHERE title = '春播窗口安排与耐密品种配置建议'
);

INSERT INTO decisions (
  field_id,
  planting_record_id,
  decision_type,
  decision_category,
  decision_date,
  title,
  content,
  basis_summary,
  recommended_actions,
  status,
  user_feedback
)
SELECT
  (SELECT id FROM fields WHERE name = '新乡实验田' ORDER BY id LIMIT 1),
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  '当年决策',
  '追肥管理',
  '2026-06-11',
  'V10-VT 阶段氮肥补施与水分协同建议',
  '当前群体已进入 V10 以后阶段，建议将追肥窗口前移至抽雄前，结合墒情补施速效氮并保持根区有效水分，避免抽雄吐丝期出现脱肥和花粒期胁迫。',
  '大喇叭口至抽雄前是产量形成的重要阶段，需把水肥供应与生育进程观测结合。',
  '追施氮肥后 3 至 5 天复查叶色与长势，如遇高温少雨及时补灌。',
  'pending',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM decisions WHERE title = 'V10-VT 阶段氮肥补施与水分协同建议'
);

INSERT INTO decisions (
  field_id,
  planting_record_id,
  decision_type,
  decision_category,
  decision_date,
  title,
  content,
  basis_summary,
  recommended_actions,
  status,
  user_feedback
)
SELECT
  (SELECT id FROM fields WHERE name = '新乡实验田' ORDER BY id LIMIT 1),
  (SELECT id FROM planting_records WHERE year = 2026 AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'XY335' LIMIT 1) LIMIT 1),
  '当年决策',
  '病虫害防治',
  '2026-06-19',
  '草地贪夜蛾监测与早防建议',
  '田间已进入抽雄窗口，需重点巡查心叶残留取食孔、虫粪和功能叶损伤情况。草地贪夜蛾迁飞快、扩散范围大，应以早期发现、分区监测和综合防治为主，避免单纯依赖一次性药剂处理。',
  'FAO 资料强调草地贪夜蛾对玉米危害重、扩散快，需将监测预警、农艺措施和综合防治联动实施。',
  '连续 3 天开展样点巡查；达到预警阈值时再组织针对性防治，并同步记录虫口与防治反馈。',
  'pending',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM decisions WHERE title = '草地贪夜蛾监测与早防建议'
);

-- 新增演示地块：补充更多列表、详情和联动页面展示样本。
INSERT INTO fields (
  name,
  area,
  location_province,
  location_city,
  location_county,
  location_detail,
  soil_type,
  soil_ph,
  soil_organic_matter,
  notes
)
SELECT
  '鹤壁示范田',
  8.4,
  '河南',
  '鹤壁',
  '浚县',
  '善堂镇',
  '潮土',
  7.1,
  17.3,
  '演示数据：场景化夏播地块，用于补充病害、虫害与评价样例。'
WHERE NOT EXISTS (
  SELECT 1 FROM fields WHERE name = '鹤壁示范田'
);

INSERT INTO crop_varieties (
  name,
  code,
  type,
  growth_period,
  yield_potential,
  disease_resistance,
  description,
  is_active
)
SELECT
  '京科968',
  'JK968',
  '中熟',
  125,
  880,
  '抗倒性较好，对叶部病害具中等抗性。',
  '演示数据：依据公开品种介绍整理，用于原型展示，不作为审定参数。',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM crop_varieties WHERE code = 'JK968'
);

INSERT INTO planting_records (
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
)
SELECT
  (SELECT id FROM fields WHERE name = '鹤壁示范田' ORDER BY id LIMIT 1),
  (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1),
  2024,
  '夏播',
  '2024-06-14',
  '2024-10-01',
  '2024-10-03',
  5000,
  60.0,
  20.5,
  'harvested',
  '演示数据：历史夏播批次，重点模拟抽雄后叶部病害巡查与评价记录。'
WHERE NOT EXISTS (
  SELECT 1
  FROM planting_records
  WHERE field_id = (SELECT id FROM fields WHERE name = '鹤壁示范田' ORDER BY id LIMIT 1)
    AND year = 2024
    AND season = '夏播'
    AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1)
);

INSERT INTO planting_records (
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
)
SELECT
  (SELECT id FROM fields WHERE name = '鹤壁示范田' ORDER BY id LIMIT 1),
  (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1),
  2026,
  '夏播',
  '2026-06-16',
  '2026-10-05',
  NULL,
  5100,
  60.0,
  20.0,
  'growing',
  '演示数据：当前夏播批次，用于联调苗期虫害监测、巡田决策与阶段观测页面。'
WHERE NOT EXISTS (
  SELECT 1
  FROM planting_records
  WHERE field_id = (SELECT id FROM fields WHERE name = '鹤壁示范田' ORDER BY id LIMIT 1)
    AND year = 2026
    AND season = '夏播'
    AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1)
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '2024-07-05',
  'V5',
  31.0,
  5,
  '深绿',
  '未见异常',
  '未见明显虫口',
  22.8,
  27.1,
  16.0,
  '苗期长势均匀，群体整齐度较好。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND record_date = '2024-07-05'
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '2024-08-03',
  'VT',
  224.0,
  16,
  '正常',
  '下部叶片见零星病斑',
  '未见明显虫口',
  20.3,
  29.0,
  8.0,
  '进入抽雄窗口，后续重点关注吐丝同步和叶部病害。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND record_date = '2024-08-03'
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '2024-08-28',
  'R3',
  228.0,
  16,
  '正常',
  '穗位叶附近出现疑似灰斑病长矩形病斑',
  '未见明显虫口',
  24.6,
  27.4,
  32.0,
  '连续高湿后病害风险上升，需加强穗位叶及以上功能叶巡查。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND record_date = '2024-08-28'
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '2024-09-18',
  'R5',
  229.0,
  16,
  '正常偏淡',
  '病斑扩展受控',
  '未见明显虫口',
  18.7,
  24.8,
  6.0,
  '灌浆后期长势稳定，病害未进一步扩展到上部功能叶。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND record_date = '2024-09-18'
);

INSERT INTO growth_records (
  planting_record_id,
  record_date,
  growth_stage,
  plant_height,
  leaf_count,
  leaf_color,
  disease_status,
  pest_status,
  soil_moisture,
  weather_temperature_avg,
  weather_rainfall,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '2026-06-20',
  'VE',
  4.2,
  1,
  '鲜绿',
  '未见异常',
  '苗带周边需关注心叶受害与虫粪',
  26.1,
  29.4,
  11.0,
  '出苗基本整齐，进入苗期虫害早查窗口。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND record_date = '2026-06-20'
);

INSERT INTO operation_records (
  planting_record_id,
  operation_type,
  operation_date,
  details,
  cost,
  operator,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '播种',
  '2024-06-14',
  '麦茬夏播，机械精量播种，目标密度 5000 株/亩。',
  205.0,
  '赵国强',
  '演示数据'
WHERE NOT EXISTS (
  SELECT 1 FROM operation_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND operation_type = '播种'
    AND operation_date = '2024-06-14'
);

INSERT INTO operation_records (
  planting_record_id,
  operation_type,
  operation_date,
  details,
  cost,
  operator,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '追肥',
  '2024-07-11',
  'V6 阶段追施尿素 12 kg/亩，并结合中耕保墒。',
  390.0,
  '赵国强',
  '演示数据'
WHERE NOT EXISTS (
  SELECT 1 FROM operation_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND operation_type = '追肥'
    AND operation_date = '2024-07-11'
);

INSERT INTO operation_records (
  planting_record_id,
  operation_type,
  operation_date,
  details,
  cost,
  operator,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '病害监测',
  '2024-08-29',
  '高湿天气后重点巡查穗位叶及以上功能叶，记录矩形病斑与扩展趋势。',
  120.0,
  '赵国强',
  '依据公开病害识别资料整理的演示记录'
WHERE NOT EXISTS (
  SELECT 1 FROM operation_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND operation_type = '病害监测'
    AND operation_date = '2024-08-29'
);

INSERT INTO operation_records (
  planting_record_id,
  operation_type,
  operation_date,
  details,
  cost,
  operator,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '播种',
  '2026-06-16',
  '麦收后抢墒播种，播后完成封闭除草和苗情标记。',
  215.0,
  '刘海峰',
  '演示数据'
WHERE NOT EXISTS (
  SELECT 1 FROM operation_records
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND operation_type = '播种'
    AND operation_date = '2026-06-16'
);

INSERT INTO growth_stage_observations (
  planting_record_id,
  stage_code,
  stage_name,
  observation_date,
  days_after_planting,
  accumulated_temperature,
  plant_height,
  leaf_count,
  stem_diameter,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  'V6',
  '六叶期',
  '2024-07-10',
  26,
  402.0,
  43.0,
  6,
  1.9,
  '苗势整齐，适合开展第一次关键节点建档。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_stage_observations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND stage_code = 'V6'
);

INSERT INTO growth_stage_observations (
  planting_record_id,
  stage_code,
  stage_name,
  observation_date,
  days_after_planting,
  accumulated_temperature,
  plant_height,
  leaf_count,
  stem_diameter,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  'R1',
  '吐丝期',
  '2024-08-09',
  56,
  862.0,
  226.0,
  16,
  2.7,
  '吐丝较集中，适合叠加病害与授粉同步性观测。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_stage_observations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND stage_code = 'R1'
);

INSERT INTO growth_stage_observations (
  planting_record_id,
  stage_code,
  stage_name,
  observation_date,
  days_after_planting,
  accumulated_temperature,
  plant_height,
  leaf_count,
  stem_diameter,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  'R5',
  '蜡熟期',
  '2024-09-16',
  94,
  1478.0,
  229.0,
  16,
  2.8,
  '灌浆进入后期，可用于和评价数据联动核对。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_stage_observations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND stage_code = 'R5'
);

INSERT INTO growth_stage_observations (
  planting_record_id,
  stage_code,
  stage_name,
  observation_date,
  days_after_planting,
  accumulated_temperature,
  plant_height,
  leaf_count,
  stem_diameter,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2026 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  'VE',
  '出苗',
  '2026-06-20',
  4,
  86.0,
  4.2,
  1,
  0.5,
  '当前以整齐度和苗期虫害早查为主。'
WHERE NOT EXISTS (
  SELECT 1 FROM growth_stage_observations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2026 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND stage_code = 'VE'
);

INSERT INTO evaluations (
  planting_record_id,
  evaluation_date,
  evaluation_type,
  actual_yield,
  total_cost,
  total_income,
  net_profit,
  overall_score,
  improvement_suggestions,
  notes
)
SELECT
  (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '2024-10-08',
  '产量效益评价',
  798.0,
  1525.0,
  2290.0,
  765.0,
  82.0,
  '可继续优化吐丝至灌浆期高湿条件下的叶部病害预警与巡查频次。',
  '演示数据：与灰斑病监测场景联动。'
WHERE NOT EXISTS (
  SELECT 1 FROM evaluations
  WHERE planting_record_id = (SELECT id FROM planting_records WHERE year = 2024 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1)
    AND evaluation_date = '2024-10-08'
);

INSERT INTO knowledge_items (
  category,
  title,
  content,
  tags,
  source,
  is_active
)
SELECT
  '病害',
  '玉米灰斑病高湿高温风险与识别要点',
  '公开资料显示，灰斑病在持续高湿和温暖条件下风险上升，病斑多呈沿叶脉受限的长矩形灰褐色病斑。对原型演示而言，可把抽雄后到成熟前设置为重点巡查窗口，并优先记录穗位叶及以上功能叶的病斑扩展情况。',
  '灰斑病,叶部病害,高湿,吐丝期,成熟期,病斑识别',
  'https://extension.umn.edu/corn-pest-management/gray-leaf-spot-corn',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_items WHERE title = '玉米灰斑病高湿高温风险与识别要点'
);

INSERT INTO knowledge_items (
  category,
  title,
  content,
  tags,
  source,
  is_active
)
SELECT
  '虫害',
  '草地贪夜蛾心叶危害与倒Y头纹识别提示',
  'UF/IFAS 资料提示，草地贪夜蛾幼虫常在玉米心叶或叶片取食，形成成排穿孔和破碎叶缘；成熟幼虫头部可见浅色倒Y纹。演示场景可据此把苗期至喇叭口期的心叶、虫孔和新鲜虫粪设为高频巡查项。',
  '草地贪夜蛾,倒Y纹,心叶,虫孔,虫粪,苗期',
  'https://edis.ifas.ufl.edu/publication/IN255',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_items WHERE title = '草地贪夜蛾心叶危害与倒Y头纹识别提示'
);

INSERT INTO knowledge_items (
  category,
  title,
  content,
  tags,
  source,
  is_active
)
SELECT
  '监测预警',
  'FAO 草地贪夜蛾常态化巡田与记录建议',
  'FAO 将可持续治理、监测和农户能力建设作为草地贪夜蛾控制的重要组成部分，并明确 FAMEWS 应在每次田间巡查和诱捕器检查时使用。用于本地原型时，适合把巡田日期、样点数量、虫口级别和处置反馈作为标准化演示字段。',
  'FAO,FAMEWS,监测预警,巡田,诱捕器,综合治理',
  'https://www.fao.org/fall-armyworm/en/',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_items WHERE title = 'FAO 草地贪夜蛾常态化巡田与记录建议'
);

INSERT INTO decisions (
  field_id,
  planting_record_id,
  decision_type,
  decision_category,
  decision_date,
  title,
  content,
  basis_summary,
  recommended_actions,
  status,
  user_feedback
)
SELECT
  (SELECT id FROM fields WHERE name = '鹤壁示范田' ORDER BY id LIMIT 1),
  NULL,
  '常年决策',
  '病害监测',
  '2026-07-20',
  '吐丝后灰斑病高风险窗口巡查建议',
  '若地块进入吐丝后连续高湿天气，应将巡查重点放在穗位叶及以上功能叶，优先识别沿叶脉受限的长矩形病斑，并根据扩展趋势决定是否升级处置。',
  '灰斑病在高湿温暖条件下风险上升，且常在吐丝到成熟阶段发展，对功能叶保护价值较高。',
  '连续 5 至 7 天保持病害巡查；同步记录病斑位置、面积等级和天气条件，必要时评估是否采取进一步防控。',
  'pending',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM decisions WHERE title = '吐丝后灰斑病高风险窗口巡查建议'
);

INSERT INTO decisions (
  field_id,
  planting_record_id,
  decision_type,
  decision_category,
  decision_date,
  title,
  content,
  basis_summary,
  recommended_actions,
  status,
  user_feedback
)
SELECT
  (SELECT id FROM fields WHERE name = '鹤壁示范田' ORDER BY id LIMIT 1),
  (SELECT id FROM planting_records WHERE year = 2026 AND season = '夏播' AND variety_id = (SELECT id FROM crop_varieties WHERE code = 'JK968' LIMIT 1) LIMIT 1),
  '当年决策',
  '虫害监测',
  '2026-06-21',
  '苗期草地贪夜蛾样点巡查与记录建议',
  '当前批次处于出苗后早期阶段，建议按固定样点检查心叶穿孔、虫粪和可疑幼虫，并把疑似虫株位置与复查结果纳入连续记录。',
  'FAO 强调常态化监测和记录，UF/IFAS 资料显示草地贪夜蛾在玉米心叶期危害特征明显，适合在苗期建立标准化巡查流程。',
  '按日或隔日完成 1 轮样点检查；发现可疑虫株后补拍照片并记录是否出现倒Y头纹、虫孔和新鲜虫粪。',
  'accepted',
  '已纳入 2026 夏播批次演示巡田流程。'
WHERE NOT EXISTS (
  SELECT 1 FROM decisions WHERE title = '苗期草地贪夜蛾样点巡查与记录建议'
);

COMMIT;
