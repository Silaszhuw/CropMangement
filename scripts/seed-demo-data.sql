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

COMMIT;
