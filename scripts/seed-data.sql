-- 演示数据种子脚本
-- 用于课程展示，覆盖核心业务场景

-- 1. 清理现有数据（可选，首次运行时注释掉）
-- DELETE FROM parameter_adjustment_records;
-- DELETE FROM growth_stage_observations;
-- DELETE FROM model_parameters;
-- DELETE FROM evaluations;
-- DELETE FROM operation_records;
-- DELETE FROM growth_records;
-- DELETE FROM planting_records;
-- DELETE FROM crop_varieties;
-- DELETE FROM fields;
-- DELETE FROM knowledge_items;
-- DELETE FROM decisions;
-- DELETE FROM app_settings;

-- 2. 地块数据（5个示例地块）
INSERT INTO fields (name, area, location_province, location_city, location_county, location_detail, soil_type, soil_ph, soil_organic_matter, notes) VALUES
('东区试验田1号', 50.5, '河南省', '郑州市', '中牟县', '科技园区东侧', '壤土', 6.8, 18.5, '土壤肥力中等，灌溉便利'),
('西区示范田A', 80.0, '河南省', '郑州市', '中牟县', '科技园区西侧', '沙壤土', 7.2, 22.3, '排水性好，适合密植'),
('北区高产田2号', 120.0, '山东省', '济南市', '章丘区', '黄河滩区北部', '黏壤土', 7.0, 25.8, '保水保肥能力强'),
('南区轮作田B', 65.0, '河北省', '石家庄市', '藁城区', '107国道南侧', '壤土', 6.5, 16.2, '上季种植小麦，轮作玉米'),
('中心对照田', 35.0, '河南省', '郑州市', '中牟县', '科技园区中心', '壤土', 7.1, 20.0, '标准对照试验田');

-- 3. 品种数据（6个典型品种）
INSERT INTO crop_varieties (name, code, type, growth_period, yield_potential, disease_resistance, description, is_active) VALUES
('郑单958', 'ZD958', '中熟', 105, 850.0, '抗大斑病、抗茎腐病', '国审品种，适应性广，高产稳产', 1),
('先玉335', 'XY335', '中早熟', 98, 800.0, '中抗大斑病、抗小斑病', '美系血缘，耐密植，商品性好', 1),
('登海605', 'DH605', '中熟', 108, 900.0, '高抗大斑病、中抗小斑病', '高产品种，适合高肥水地块', 1),
('京科968', 'JK968', '中晚熟', 112, 920.0, '抗大斑病、抗茎腐病、抗倒伏', '耐密植，籽粒脱水快', 1),
('浚单20', 'XD20', '早熟', 95, 750.0, '中抗大斑病', '早熟品种，适合夏播', 1),
('隆平206', 'LP206', '中熟', 103, 820.0, '抗大斑病、中抗丝黑穗病', '综合抗性好，适应性强', 1);

-- 4. 种植记录（10条记录，覆盖不同年份和状态）
INSERT INTO planting_records (field_id, variety_id, year, season, planting_date, expected_harvest_date, actual_harvest_date, planting_density, row_spacing, plant_spacing, status, notes) VALUES
(1, 1, 2024, '春季', '2024-04-15', '2024-08-15', '2024-08-18', 4500, 60, 22, 'harvested', '正常收获，产量达标'),
(2, 2, 2024, '春季', '2024-04-18', '2024-08-10', '2024-08-12', 5000, 60, 20, 'harvested', '密植试验，表现良好'),
(3, 3, 2024, '春季', '2024-04-20', '2024-08-20', NULL, 4200, 65, 23, 'growing', '当前处于灌浆期'),
(4, 4, 2024, '夏季', '2024-06-10', '2024-10-05', NULL, 4800, 60, 21, 'growing', '夏播晚熟品种，长势良好'),
(5, 5, 2024, '夏季', '2024-06-15', '2024-09-25', NULL, 5200, 55, 19, 'growing', '夏播早熟品种，适应性试验'),
(1, 2, 2023, '春季', '2023-04-12', '2023-08-08', '2023-08-10', 4800, 60, 21, 'harvested', '2023年春季种植'),
(2, 1, 2023, '春季', '2023-04-15', '2023-08-15', '2023-08-17', 4500, 60, 22, 'harvested', '2023年对照组'),
(3, 6, 2025, '春季', '2025-04-10', '2025-08-12', NULL, 4600, 60, 22, 'planning', '2025年计划种植'),
(4, 3, 2025, '春季', '2025-04-12', '2025-08-18', NULL, 4400, 65, 23, 'planning', '2025年高产试验'),
(5, 4, 2025, '春季', '2025-04-08', '2025-08-20', NULL, 4700, 60, 21, 'planning', '2025年密植试验');

-- 5. 生育期观测数据（为种植记录3提供完整观测链）
INSERT INTO growth_stage_observations (planting_record_id, stage_code, stage_name, observation_date, days_after_planting, accumulated_temperature, plant_height, leaf_count, stem_diameter, notes) VALUES
(3, 'VE', '出苗期', '2024-04-27', 7, 85.5, 8.5, 2, 3.2, '出苗整齐，苗情良好'),
(3, 'V6', '六叶期', '2024-05-20', 30, 380.2, 45.0, 6, 12.5, '进入拔节期，长势旺盛'),
(3, 'VT', '抽雄期', '2024-06-18', 59, 785.3, 215.0, 14, 28.5, '雄穗抽出，花粉正常'),
(3, 'R1', '吐丝期', '2024-06-22', 63, 845.0, 230.0, 16, 30.2, '雌穗吐丝，授粉良好'),
(3, 'R3', '乳熟期', '2024-07-15', 86, 1250.8, 245.0, 17, 32.0, '籽粒灌浆，含水量高');

-- 为种植记录4提供部分观测
INSERT INTO growth_stage_observations (planting_record_id, stage_code, stage_name, observation_date, days_after_planting, accumulated_temperature, plant_height, leaf_count, stem_diameter, notes) VALUES
(4, 'VE', '出苗期', '2024-06-17', 7, 95.0, 9.0, 2, 3.5, '夏播出苗快'),
(4, 'V6', '六叶期', '2024-07-08', 28, 420.0, 48.0, 6, 13.0, '生长正常');

-- 6. 生长记录（日常观测数据）
INSERT INTO growth_records (planting_record_id, record_date, growth_stage, plant_height, leaf_count, leaf_color, disease_status, pest_status, soil_moisture, weather_temperature_avg, weather_rainfall, notes) VALUES
(3, '2024-05-01', '三叶期', 18.0, 3, '深绿', '无', '无', 65.0, 22.5, 0, '定期观测'),
(3, '2024-05-10', '五叶期', 32.0, 5, '绿色', '无', '无', 58.0, 24.0, 12.0, '灌溉后长势良好'),
(3, '2024-06-01', '拔节期', 120.0, 10, '浓绿', '无', '轻微蚜虫', 70.0, 26.5, 8.0, '已喷施杀虫剂'),
(4, '2024-06-25', '三叶期', 20.0, 3, '绿色', '无', '无', 72.0, 28.0, 0, '夏播生长快');

-- 7. 农事操作记录
INSERT INTO operation_records (planting_record_id, operation_type, operation_date, details, cost, operator, notes) VALUES
(3, '施肥', '2024-04-14', '{"fertilizer_type": "复合肥", "amount": 50, "nitrogen": 15, "phosphorus": 15, "potassium": 15}', 800.0, '张三', '底肥施用'),
(3, '灌溉', '2024-05-08', '{"method": "喷灌", "water_amount": 40, "duration": 2}', 200.0, '李四', '拔节期灌溉'),
(3, '施肥', '2024-05-25', '{"fertilizer_type": "尿素", "amount": 30, "nitrogen": 46}', 450.0, '张三', '拔节肥追施'),
(3, '植保', '2024-06-02', '{"pesticide": "吡虫啉", "concentration": 0.05, "target": "蚜虫"}', 180.0, '王五', '病虫害防治'),
(4, '施肥', '2024-06-09', '{"fertilizer_type": "复合肥", "amount": 45, "nitrogen": 15, "phosphorus": 15, "potassium": 15}', 720.0, '张三', '夏播底肥');

-- 8. 效益评价（已收获记录）
INSERT INTO evaluations (planting_record_id, evaluation_date, evaluation_type, actual_yield, total_cost, total_income, net_profit, overall_score, improvement_suggestions, notes) VALUES
(1, '2024-08-25', '最终评价', 42.8, 6500.0, 11800.0, 5300.0, 4.5, '产量达标，建议适当增加密度；控制后期灌溉以提高籽粒商品性', '整体表现良好'),
(2, '2024-08-20', '最终评价', 46.5, 7200.0, 12800.0, 5600.0, 4.8, '密植效果显著，产量提升明显；注意加强中后期病虫害监测', '高产示范成功'),
(6, '2023-08-15', '最终评价', 44.2, 6800.0, 12200.0, 5400.0, 4.6, '品种表现稳定，管理到位', '2023年春季总结'),
(7, '2023-08-22', '最终评价', 41.5, 6500.0, 11400.0, 4900.0, 4.3, '对照组表现正常', '2023年对照组');

-- 9. 模型参数（生育期模型核心参数）
INSERT INTO model_parameters (parameter_group, parameter_name, parameter_key, default_value, current_value, min_value, max_value, unit, description) VALUES
('thermal', '基础温度', 'thermal.base_temp', 10.0, 10.0, 8.0, 12.0, '°C', '玉米生长发育的起始温度'),
('thermal', '最适温度', 'thermal.optimal_temp', 26.0, 26.0, 24.0, 28.0, '°C', '生长发育最适宜温度'),
('thermal', '最高温度', 'thermal.max_temp', 35.0, 35.0, 33.0, 38.0, '°C', '生长发育上限温度'),
('variety', '出苗期积温', 'variety.ve_gdd', 85.0, 85.0, 70.0, 100.0, '°C·d', '播种到出苗所需积温'),
('variety', '六叶期积温', 'variety.v6_gdd', 300.0, 300.0, 250.0, 350.0, '°C·d', '出苗到六叶期所需积温'),
('variety', '抽雄期积温', 'variety.vt_gdd', 400.0, 400.0, 350.0, 450.0, '°C·d', '六叶期到抽雄期所需积温'),
('variety', '吐丝期积温', 'variety.r1_gdd', 60.0, 60.0, 50.0, 80.0, '°C·d', '抽雄到吐丝所需积温'),
('variety', '乳熟期积温', 'variety.r3_gdd', 400.0, 400.0, 350.0, 450.0, '°C·d', '吐丝到乳熟所需积温'),
('variety', '成熟期积温', 'variety.r6_gdd', 350.0, 350.0, 300.0, 400.0, '°C·d', '乳熟到成熟所需积温'),
('soil', 'pH下限', 'soil.ph_min', 6.0, 6.0, 5.5, 6.5, '', '土壤pH最低适宜值'),
('soil', 'pH上限', 'soil.ph_max', 7.5, 7.5, 7.0, 8.0, '', '土壤pH最高适宜值'),
('soil', '有机质下限', 'soil.organic_matter_min', 15.0, 15.0, 12.0, 18.0, 'g/kg', '土壤有机质最低适宜值');

-- 10. 参数调整记录（演示参数校准过程）
INSERT INTO parameter_adjustment_records (parameter_id, old_value, new_value, adjustment_reason, adjusted_by, adjusted_at) VALUES
(6, 400.0, 380.0, '根据2024年观测数据，该品种抽雄期积温需求偏低', '系统管理员', '2024-07-01 10:30:00'),
(9, 350.0, 370.0, '成熟期延长，调整参数以提高预测准确性', '系统管理员', '2024-08-10 14:20:00'),
(6, 380.0, 400.0, '恢复默认值，继续观测', '系统管理员', '2024-08-25 09:15:00');

-- 11. 专家知识库（栽培知识）
INSERT INTO knowledge_items (category, title, content, tags, source, is_active) VALUES
('施肥管理', '玉米氮肥分次施用技术', '玉米氮肥应采用"底肥+追肥"的分次施用模式。底肥施用量占总量的40-50%，拔节期追施30-40%，大喇叭口期追施20-30%。注意避免一次性过量施用导致前期徒长和后期脱肥。', '["氮肥", "施肥技术", "分次施用"]', '农技推广中心', 1),
('灌溉管理', '玉米关键生育期灌溉策略', '玉米一生需水关键期：拔节期、抽雄期、灌浆期。拔节期灌溉促进茎秆生长，抽雄期灌溉保证授粉质量，灌浆期灌溉确保籽粒充实。每次灌水量40-60mm，避免大水漫灌。', '["灌溉", "需水规律", "关键期"]', '《玉米栽培学》', 1),
('密度管理', '不同品种适宜种植密度', '早熟品种可适当加大密度至5000-5500株/亩，中熟品种4500-5000株/亩，晚熟品种4000-4500株/亩。紧凑型品种可比平展型品种增加500株/亩左右。', '["种植密度", "品种特性"]', '农业科学院', 1),
('病虫害防治', '玉米大斑病综合防治', '选用抗病品种是基础；及时清除田间病残体；发病初期喷施25%吡唑醚菌酯乳油1500倍液或50%多菌灵可湿性粉剂500倍液，间隔7-10天再喷1次。', '["大斑病", "病害防治", "药剂防治"]', '植保站', 1),
('品种选择', '黄淮海夏玉米品种选择要点', '夏玉米生育期短，应选择生育期95-110天的品种；优先选择耐高温、抗倒伏、抗病性强的品种；兼顾产量潜力和稳产性。', '["品种选择", "黄淮海", "夏玉米"]', '区域试验总结', 1);

-- 12. 病虫害知识库
INSERT INTO knowledge_items (category, title, content, tags, source, is_active) VALUES
('病害识别', '玉米大斑病症状识别', '叶片上出现梭形或长椭圆形病斑，长5-10cm，宽1-2cm，灰褐色或黄褐色，边缘暗褐色。严重时病斑连片，整叶枯死。多从下部叶片开始发病，逐渐向上蔓延。', '["大斑病", "症状", "叶部病害"]', '《玉米病虫害图谱》', 1),
('虫害识别', '玉米螟危害特征', '玉米螟幼虫蛀入茎秆、雄穗和果穗，造成茎折、雄穗折断、果穗腐烂。被害茎秆节间有排粪孔，孔外有虫粪。心叶期可见叶片排孔。', '["玉米螟", "钻蛀性害虫", "危害症状"]', '植保手册', 1),
('病害防治', '玉米丝黑穗病综合防治', '种子处理：用2%戊唑醇干拌种剂按种子量0.2%拌种；土壤处理：重病地块播前亩施石灰50-100kg调节土壤pH；农业防治：轮作倒茬、清除病株。', '["丝黑穗病", "种传病害", "综合防治"]', '植保站技术指导', 1),
('虫害防治', '玉米蚜虫化学防治技术', '蚜虫发生初期，可选用10%吡虫啉可湿性粉剂2000倍液、25%噻虫嗪水分散粒剂5000倍液喷雾。注意轮换用药，避免产生抗药性。', '["蚜虫", "刺吸式害虫", "化学防治"]', '农药使用手册', 1);

-- 13. 决策记录（常年决策和当年决策示例）
INSERT INTO decisions (field_id, planting_record_id, decision_type, decision_category, decision_date, title, content, basis_summary, recommended_actions, status, user_feedback) VALUES
(1, NULL, '常年决策', '品种选择', '2024-03-01', '东区试验田1号2024年品种选择建议', '根据该地块土壤条件（壤土、pH 6.8、有机质18.5 g/kg）和历史表现，建议选择郑单958或先玉335。郑单958适应性广、稳产性好；先玉335耐密植、商品性佳。', '地块土壤中等肥力，排灌条件良好，历史产量稳定在800-850 kg/亩', '["优先考虑郑单958作为主栽品种", "可配置20%面积试种先玉335", "播期安排在4月中旬"]', 'executed', '采纳建议，最终选择郑单958'),
(3, 3, '当年决策', '田间管理', '2024-06-05', '北区高产田2号当前管理建议', '当前处于大喇叭口期，是产量形成关键期。建议：1）追施尿素30 kg/亩；2）灌水40-50mm；3）注意监测玉米螟，必要时施药防治。', '品种登海605，生长正常，前期管理到位，土壤墒情适中', '["6月8日前完成追肥", "6月10日灌溉", "设置性诱剂监测玉米螟"]', 'completed', '已按建议执行，效果良好'),
(2, NULL, '常年决策', '种植规划', '2025-01-15', '西区示范田A 2025年种植规划', '2025年建议继续进行密植高产试验，目标密度5500株/亩，品种选择先玉335或京科968。加强水肥管理，配套机械化作业。', '该地块土壤沙壤，排水良好，2024年密植试验表现优秀', '["提前做好地块整理", "配备精量播种机", "准备充足底肥"]', 'pending', NULL);

-- 14. 应用配置
INSERT INTO app_settings (config_key, config_value, description) VALUES
('system.name', '玉米优质高效栽培管理系统', '系统名称'),
('system.version', '1.0.0', '系统版本'),
('simulation.default_avg_temp', '26', '模拟默认平均温度(°C)'),
('prediction.confidence_threshold', '3', '预测置信度判断阈值（观测阶段数）'),
('export.format', 'xlsx', '数据导出默认格式');

-- 15. 补充更多生育期观测（为演示"适宜生育进程模拟"提供对比数据）
INSERT INTO growth_stage_observations (planting_record_id, stage_code, stage_name, observation_date, days_after_planting, accumulated_temperature, plant_height, leaf_count, stem_diameter, notes) VALUES
(1, 'VE', '出苗期', '2024-04-22', 7, 82.0, 8.0, 2, 3.0, '出苗正常'),
(1, 'V6', '六叶期', '2024-05-18', 33, 395.0, 42.0, 6, 12.0, '拔节开始'),
(1, 'VT', '抽雄期', '2024-06-20', 66, 820.0, 220.0, 15, 29.0, '雄穗展开'),
(1, 'R1', '吐丝期', '2024-06-24', 70, 880.0, 235.0, 16, 30.5, '吐丝正常'),
(1, 'R3', '乳熟期', '2024-07-18', 94, 1320.0, 240.0, 17, 31.5, '籽粒灌浆'),
(1, 'R6', '成熟期', '2024-08-18', 125, 1850.0, 240.0, 17, 31.5, '完全成熟');

INSERT INTO growth_stage_observations (planting_record_id, stage_code, stage_name, observation_date, days_after_planting, accumulated_temperature, plant_height, leaf_count, stem_diameter, notes) VALUES
(2, 'VE', '出苗期', '2024-04-25', 7, 88.0, 9.0, 2, 3.3, '密植出苗好'),
(2, 'V6', '六叶期', '2024-05-22', 34, 410.0, 46.0, 6, 12.8, '密植长势旺'),
(2, 'VT', '抽雄期', '2024-06-15', 58, 780.0, 210.0, 14, 28.0, '密植雄穗'),
(2, 'R1', '吐丝期', '2024-06-19', 62, 835.0, 225.0, 15, 29.5, '授粉充分'),
(2, 'R3', '乳熟期', '2024-07-12', 85, 1240.0, 235.0, 16, 31.0, '籽粒饱满'),
(2, 'R6', '成熟期', '2024-08-12', 116, 1790.0, 235.0, 16, 31.0, '成熟收获');

-- 完成
-- 数据总结：
-- - 5个地块（不同土壤和位置）
-- - 6个品种（覆盖早、中、晚熟）
-- - 10条种植记录（已收获4条、生长中3条、计划中3条）
-- - 18条生育期观测（覆盖完整生育期）
-- - 4条生长记录（日常监测）
-- - 5条农事操作
-- - 4条效益评价
-- - 12个模型参数
-- - 3条参数调整记录
-- - 9条知识条目（栽培+病虫害）
-- - 3条决策记录
-- - 5条系统配置
