import { useState, useEffect, useRef } from 'react'
import './App.css'

// Transformer Architecture Scenario: LLM Principles
const TRANSFORMER_SCENARIO = [
  {
    type: 'llm-intro',
    content: "大语言模型（LLM）是基于Transformer架构的深度学习模型，通过大规模数据训练获得理解和生成自然语言的能力。",
    prompt: "介绍大语言模型",
    duration: 3000
  },
  {
    type: 'training-phase',
    content: "训练阶段：模型在数万亿token的文本数据上学习，通过自监督学习理解语言模式、语法、语义和知识。",
    prompt: "展示训练过程",
    stage: 'training',
    duration: 4000
  },
  {
    type: 'encoder-input',
    content: "用户输入：'帮我写一首关于春天的诗'",
    prompt: "接收用户输入",
    stage: 'input',
    sqlStage: 'sql-input',
    sqlContent: "SELECT * FROM users WHERE age > 25",
    duration: 2000
  },
  {
    type: 'tokenization',
    content: "Tokenization（分词）：将文本转换为token序列\n'帮我写一首关于春天的诗' → [帮, 我, 写, 一, 首, 关于, 春天, 的, 诗]",
    prompt: "文本分词处理",
    stage: 'tokenize',
    sqlStage: 'sql-parse',
    sqlContent: "SQL解析：\nSELECT → 查询操作\n* → 所有列\nFROM users → 数据源\nWHERE age > 25 → 过滤条件",
    tokens: ['帮', '我', '写', '一', '首', '关于', '春天', '的', '诗'],
    sqlTokens: ['SELECT', '*', 'FROM', 'users', 'WHERE', 'age', '>', '25'],
    duration: 3000
  },
  {
    type: 'embedding',
    content: "Embedding（词嵌入）：将token转换为高维向量表示\n每个token映射到768维向量空间",
    prompt: "生成词嵌入向量",
    stage: 'embedding',
    sqlStage: 'sql-plan',
    sqlContent: "查询计划生成：\n1. 解析SQL语法树\n2. 优化查询计划\n3. 选择索引策略\n4. 确定执行顺序",
    duration: 3000
  },
  {
    type: 'encoder-layer',
    content: "Encoder层处理：\n1. Self-Attention（自注意力机制）\n2. Feed Forward（前馈网络）\n3. Layer Normalization（层归一化）\n经过12层Encoder处理",
    prompt: "Encoder层处理",
    stage: 'encoder',
    sqlStage: 'sql-execute',
    sqlContent: "SQL执行：\n1. 连接数据库\n2. 执行查询计划\n3. 扫描表/索引\n4. 应用WHERE条件\n5. 返回结果集",
    layer: 1,
    duration: 4000
  },
  {
    type: 'attention',
    content: "Self-Attention机制：\n计算每个token与其他token的关联度\n'春天'与'诗'、'写'有强关联",
    prompt: "计算注意力权重",
    stage: 'attention',
    sqlStage: 'sql-index',
    sqlContent: "索引检索：\n使用age索引快速定位\n扫描符合条件的行\n建立行与行的关联关系",
    duration: 3000
  },
  {
    type: 'decoder-process',
    content: "Decoder处理：\n基于Encoder输出，逐步生成响应文本\ntoken by token生成",
    prompt: "Decoder生成响应",
    stage: 'decoder',
    sqlStage: 'sql-retrieve',
    sqlContent: "数据检索：\n从存储引擎读取数据\n应用过滤条件\n组装结果集\n逐行返回数据",
    duration: 3000
  },
  {
    type: 'output-generation',
    content: "生成输出：\n'春风轻拂面，花开满枝头。\n绿意盎然时，诗意心中留。'",
    prompt: "输出生成结果",
    stage: 'output',
    sqlStage: 'sql-result',
    sqlContent: "查询结果：\n返回匹配的记录\nid: 1, name: '张三', age: 28\nid: 3, name: '李四', age: 30\n...",
    duration: 2000
  },
  {
    type: 'llm-complete',
    content: "完成！大模型通过Transformer架构，将输入文本编码为向量表示，经过多层处理，最终生成符合语境的响应。",
    prompt: "处理完成",
    duration: 0
  }
];

// ReAct Pattern Scenario: Travel Planning
const DEMO_SCENARIO = [
  {
    type: 'human',
    content: "帮我规划一次去日本东京的3天旅行，预算5000元",
    duration: 2000
  },

  // Loop 1
  {
    type: 'period-thought',
    content: "用户想要规划一次去日本东京的3天旅行，预算5000元。我需要：\n1. 查询东京的旅游景点和推荐路线\n2. 了解住宿价格\n3. 计算交通和餐饮费用\n4. 制定详细的行程安排",
    prompt: "分析用户需求，制定旅行规划策略",
    iteration: 1,
    duration: 4000
  },

  {
    type: 'decision-action',
    content: "Search('东京3天旅游攻略 必去景点')",
    tool: 'search',
    prompt: "搜索东京旅游信息和景点推荐",
    iteration: 1,
    duration: 3000
  },
  {
    type: 'observation',
    content: "东京热门景点：浅草寺、东京塔、上野公园、新宿、涩谷、原宿。推荐路线：Day1-浅草寺+上野，Day2-新宿+涩谷，Day3-原宿+购物",
    tool: 'search',
    prompt: "获取景点信息和路线建议",
    iteration: 1,
    duration: 2000
  },

  // Loop 2
  {
    type: 'period-thought',
    content: "已获得景点信息。现在需要查询住宿价格，确保在预算范围内。",
    prompt: "评估已获得信息，决定下一步行动",
    iteration: 2,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "Search('东京经济型酒店价格 3晚')",
    tool: 'search',
    prompt: "搜索住宿价格信息",
    iteration: 2,
    duration: 3000
  },
  {
    type: 'observation',
    content: "经济型酒店：每晚约300-500元，3晚约900-1500元。青年旅舍更便宜，约200-300元/晚",
    tool: 'search',
    prompt: "获取住宿价格数据",
    iteration: 2,
    duration: 2000
  },

  // Loop 3
  {
    type: 'period-thought',
    content: "住宿费用约900-1500元。现在需要计算交通、餐饮和其他费用，确保总预算不超过5000元。",
    prompt: "整合信息，进行预算计算",
    iteration: 3,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "Calculate('交通费: 500 + 餐饮费: 1500 + 住宿费: 1200 + 门票: 300')",
    tool: 'calculator',
    prompt: "计算总费用",
    iteration: 3,
    duration: 3000
  },
  {
    type: 'observation',
    content: "总费用：3500元（交通500 + 餐饮1500 + 住宿1200 + 门票300），在预算范围内，剩余1500元可用于购物和应急",
    tool: 'calculator',
    prompt: "获取计算结果",
    iteration: 3,
    duration: 2000
  },

  {
    type: 'period-thought',
    content: "所有信息已收集完毕。总费用3500元，在5000元预算内。可以制定最终行程方案。",
    prompt: "综合所有信息，准备最终方案",
    iteration: 4,
    duration: 3000
  },

  {
    type: 'finish',
    content: "东京3天旅行规划完成！\n\n行程安排：\nDay1: 浅草寺 → 上野公园 → 东京国立博物馆\nDay2: 新宿 → 涩谷 → 原宿\nDay3: 购物日（银座/新宿）\n\n预算分配：\n住宿：1200元（3晚经济型酒店）\n交通：500元（地铁+JR Pass）\n餐饮：1500元（每日500元）\n门票：300元\n总计：3500元（剩余1500元）",
    duration: 0
  }
];

// Normal Mode Scenario: Direct LLM Call with REST API
const NORMAL_SCENARIO = [
  {
    type: 'rest',
    content: "用户请求：帮我规划一次去日本东京的3天旅行，预算5000元",
    prompt: "接收用户请求",
    duration: 2000
  },
  {
    type: 'rest-api',
    content: "调用REST API获取外部数据...",
    prompt: "调用外部API获取实时数据",
    apiUrl: "https://api.travel.com/tokyo/attractions",
    duration: 3000
  },
  {
    type: 'rest-response',
    content: "API返回数据：\n- 景点信息：浅草寺、东京塔、上野公园等\n- 酒店价格：经济型300-500元/晚\n- 交通费用：地铁日票约50元\n- 餐饮参考：人均150-300元/餐",
    prompt: "接收API响应数据",
    duration: 2000
  },
  {
    type: 'llm',
    content: "正在调用大语言模型处理数据...",
    prompt: "调用LLM处理请求和数据",
    duration: 3000
  },
  {
    type: 'llmout',
    content: "东京3天旅行规划：\n\n【Day 1】\n- 上午：浅草寺（免费，建议2小时）\n- 下午：上野公园 + 东京国立博物馆（门票约30元）\n- 晚上：新宿区用餐（约150元）\n\n【Day 2】\n- 上午：新宿御苑（门票约10元）\n- 下午：涩谷 + 原宿逛街（免费）\n- 晚上：银座购物（预算500元）\n\n【Day 3】\n- 上午：东京塔（门票约100元）\n- 下午：筑地市场 + 购物（预算300元）\n- 晚上：返回\n\n预算分配：\n- 住宿：1200元（3晚经济型酒店）\n- 交通：500元（地铁+JR Pass）\n- 餐饮：1500元（每日500元）\n- 门票：140元\n- 购物：800元\n- 其他：860元\n总计：5000元",
    prompt: "LLM输出结果",
    duration: 0
  }
];

// Text2SQL Scenario: Generate Chart from Natural Language
const TEXT2SQL_SCENARIO = [
  {
    type: 'human',
    content: "帮我生成一个图表，显示2024年每个月的销售额趋势",
    duration: 2000
  },

  // Loop 1: Understand requirement and generate SQL
  {
    type: 'period-thought',
    content: "用户想要生成一个显示2024年每月销售额趋势的图表。我需要：\n1. 理解用户需求：需要查询2024年的销售数据\n2. 确定数据表结构：应该是sales表，包含date和amount字段\n3. 生成SQL查询语句：按月份分组统计销售额",
    prompt: "分析用户需求，理解图表要求",
    iteration: 1,
    duration: 4000
  },

  {
    type: 'decision-action',
    content: "GenerateSQL('SELECT DATE_FORMAT(sale_date, \"%Y-%m\") as month, SUM(amount) as total_sales FROM sales WHERE YEAR(sale_date) = 2024 GROUP BY month ORDER BY month')",
    tool: 'database',
    prompt: "生成SQL查询语句",
    iteration: 1,
    duration: 3000
  },
  {
    type: 'observation',
    content: "SQL查询已生成：\nSELECT DATE_FORMAT(sale_date, \"%Y-%m\") as month, SUM(amount) as total_sales\nFROM sales\nWHERE YEAR(sale_date) = 2024\nGROUP BY month\nORDER BY month",
    tool: 'database',
    prompt: "确认SQL语句正确性",
    iteration: 1,
    duration: 2000
  },

  // Loop 2: Execute SQL and get data
  {
    type: 'period-thought',
    content: "SQL语句已生成。现在需要执行这个查询来获取实际数据。",
    prompt: "准备执行SQL查询",
    iteration: 2,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "ExecuteSQL('SELECT DATE_FORMAT(sale_date, \"%Y-%m\") as month, SUM(amount) as total_sales FROM sales WHERE YEAR(sale_date) = 2024 GROUP BY month ORDER BY month')",
    tool: 'database',
    prompt: "执行SQL查询",
    iteration: 2,
    duration: 3000
  },
  {
    type: 'observation',
    content: "查询结果：\n2024-01: 125000\n2024-02: 138000\n2024-03: 152000\n2024-04: 145000\n2024-05: 168000\n2024-06: 175000\n2024-07: 182000\n2024-08: 195000\n2024-09: 188000\n2024-10: 210000\n2024-11: 225000\n2024-12: 240000",
    tool: 'database',
    prompt: "获取查询结果数据",
    iteration: 2,
    duration: 2000
  },

  // Loop 3: Generate chart
  {
    type: 'period-thought',
    content: "数据已获取。现在需要根据数据生成图表。数据显示销售额从1月的125000增长到12月的240000，呈上升趋势。应该使用折线图或柱状图来展示。",
    prompt: "分析数据，选择图表类型",
    iteration: 3,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "GenerateChart(type='line', data=[{month: '2024-01', sales: 125000}, ...], title='2024年月度销售额趋势')",
    tool: 'chart',
    prompt: "生成图表",
    iteration: 3,
    duration: 3000
  },
  {
    type: 'observation',
    content: "图表已生成：折线图显示2024年1-12月的销售额趋势，整体呈上升趋势，12月达到峰值240000",
    tool: 'chart',
    prompt: "确认图表生成成功",
    iteration: 3,
    duration: 2000
  },

  {
    type: 'period-thought',
    content: "图表已成功生成。任务完成，可以向用户展示结果。",
    prompt: "确认任务完成",
    iteration: 4,
    duration: 2000
  },

  {
    type: 'finish',
    content: "图表生成完成！\n\n已生成2024年月度销售额趋势图：\n- 图表类型：折线图\n- 数据范围：2024年1月-12月\n- 趋势：整体上升，从1月的125,000增长到12月的240,000\n- 峰值：12月达到240,000\n- 增长率：约92%",
    duration: 0
  }
];

const TOOLS = [
  { id: 'search', label: 'Search', angle: -90, icon: '🌐' },
  { id: 'calculator', label: 'Calc', angle: 30, icon: '💰' },
  { id: 'weather', label: 'Map', angle: 150, icon: '🗺️' },
];

// DeepResearch Scenario: Deep Research and Report Generation
const DEEPRESEARCH_SCENARIO = [
  {
    type: 'human',
    content: "请深入研究人工智能在医疗领域的应用，并生成一份详细的研究报告",
    duration: 2000
  },

  // Multi-Agent Setup
  {
    type: 'multi-agent-setup',
    content: "启动多Agent协作系统：\n- Agent 1 (研究Agent): 负责搜索和研究\n- Agent 2 (数据Agent): 负责数据收集\n- Agent 3 (分析Agent): 负责数据分析\n- Agent 4 (报告Agent): 负责报告生成",
    agents: ['research', 'data', 'analyze', 'report'],
    duration: 3000
  },

  // Loop 1: Initial research - Multiple agents working in parallel
  {
    type: 'period-thought',
    content: "[研究Agent] 用户要求研究AI在医疗领域的应用。我将搜索最新研究，同时协调其他Agent并行工作。",
    prompt: "研究Agent制定研究计划",
    agent: 'research',
    iteration: 1,
    duration: 3000
  },

  {
    type: 'decision-action',
    content: "[研究Agent] WebSearch('人工智能医疗应用 最新研究 2024')",
    tool: 'websearch',
    prompt: "研究Agent使用WebSearch搜索",
    agent: 'research',
    iteration: 1,
    duration: 3000
  },
  {
    type: 'observation',
    content: "[研究Agent] WebSearch结果：AI在医疗领域的主要应用包括医学影像诊断、药物发现、个性化医疗、机器人辅助手术等。2024年最新进展显示AI诊断准确率已超过90%。",
    tool: 'websearch',
    prompt: "研究Agent获取搜索结果",
    agent: 'research',
    iteration: 1,
    duration: 2000
  },
  {
    type: 'agent-communication',
    content: "[研究Agent → 数据Agent] 发送研究主题和关键词",
    fromAgent: 'research',
    toAgent: 'data',
    message: "研究主题：AI医疗应用，关键词：医学影像、药物研发",
    iteration: 1,
    duration: 2000
  },

  // Loop 2: Parallel agent work
  {
    type: 'period-thought',
    content: "[研究Agent] 已获得基础信息。现在深入研究医学影像诊断领域。",
    prompt: "研究Agent确定深入研究方向",
    agent: 'research',
    iteration: 2,
    duration: 2000
  },
  {
    type: 'decision-action',
    content: "[研究Agent] WebSearch('AI医学影像诊断 准确率 临床应用案例')",
    tool: 'websearch',
    prompt: "研究Agent深入研究医学影像诊断",
    agent: 'research',
    iteration: 2,
    duration: 3000
  },
  {
    type: 'period-thought',
    content: "[数据Agent] 收到研究Agent的请求，开始通过MCP获取数据。",
    prompt: "数据Agent准备获取数据",
    agent: 'data',
    iteration: 2,
    duration: 2000
  },
  {
    type: 'decision-action',
    content: "[数据Agent] MCP.call(server='research-db', resource='papers')",
    tool: 'mcp',
    prompt: "数据Agent通过MCP获取数据",
    agent: 'data',
    mcpServer: 'research-db',
    mcpResource: 'papers',
    iteration: 2,
    duration: 3000
  },
  {
    type: 'observation',
    content: "[研究Agent] 医学影像诊断：AI在CT、MRI、X光片分析中表现优异。案例：Google的AI系统在乳腺癌检测中准确率达94.5%。",
    tool: 'websearch',
    prompt: "研究Agent获取详细信息",
    agent: 'research',
    iteration: 2,
    duration: 2000
  },
  {
    type: 'observation',
    content: "[数据Agent] MCP调用成功：获取了50篇研究论文数据。",
    tool: 'mcp',
    prompt: "数据Agent获取MCP数据",
    agent: 'data',
    iteration: 2,
    duration: 2000
  },
  {
    type: 'agent-communication',
    content: "[数据Agent → 分析Agent] 发送收集到的数据",
    fromAgent: 'data',
    toAgent: 'analyze',
    message: "数据：50篇论文，涵盖医学影像、药物研发等领域",
    iteration: 2,
    duration: 2000
  },

  // Loop 3: Analysis agent processing
  {
    type: 'period-thought',
    content: "[分析Agent] 收到数据Agent的数据，开始进行分析和整理。",
    prompt: "分析Agent开始分析数据",
    agent: 'analyze',
    iteration: 3,
    duration: 2000
  },
  {
    type: 'decision-action',
    content: "[数据Agent] Command('ls -la /data/research/ai_medical/')",
    tool: 'command',
    prompt: "数据Agent执行本地命令",
    agent: 'data',
    iteration: 3,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "[分析Agent] Analyze(data='50篇论文数据', method='trend_analysis')",
    tool: 'analyze',
    prompt: "分析Agent分析数据趋势",
    agent: 'analyze',
    iteration: 3,
    duration: 3000
  },
  {
    type: 'observation',
    content: "[数据Agent] 命令执行结果：发现多个相关数据文件：research_papers.json, clinical_cases.csv, drug_discovery_data.txt",
    tool: 'command',
    prompt: "数据Agent获取命令结果",
    agent: 'data',
    iteration: 3,
    duration: 2000
  },
  {
    type: 'observation',
    content: "[分析Agent] 分析完成：发现AI医疗应用的主要趋势包括诊断准确率提升、药物研发加速、个性化医疗普及。",
    tool: 'analyze',
    prompt: "分析Agent完成分析",
    agent: 'analyze',
    iteration: 3,
    duration: 2000
  },
  {
    type: 'agent-communication',
    content: "[分析Agent → 报告Agent] 发送分析结果",
    fromAgent: 'analyze',
    toAgent: 'report',
    message: "分析结果：主要趋势、典型案例、挑战分析",
    iteration: 3,
    duration: 2000
  },

  // Loop 4: Read data files
  {
    type: 'period-thought',
    content: "已发现数据文件。现在需要读取这些文件以获取更详细的研究数据。",
    prompt: "准备读取数据文件",
    iteration: 4,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "Read('/data/research/ai_medical/research_papers.json')",
    tool: 'read',
    prompt: "读取研究论文数据文件",
    iteration: 4,
    duration: 3000
  },
  {
    type: 'observation',
    content: "文件内容：包含50篇最新研究论文摘要，涵盖AI在药物研发、个性化医疗等领域的应用。关键发现：AlphaFold在蛋白质结构预测方面取得突破，将研发时间缩短70%。",
    tool: 'read',
    prompt: "获取文件内容",
    iteration: 4,
    duration: 2000
  },

  // Loop 6: Research challenges and future
  {
    type: 'period-thought',
    content: "数据文件已读取。现在需要研究AI医疗面临的挑战和未来发展趋势。",
    prompt: "分析挑战和未来趋势",
    iteration: 6,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "WebSearch('AI医疗挑战 数据隐私 监管政策 未来趋势')",
    tool: 'websearch',
    prompt: "使用WebSearch研究挑战和未来趋势",
    iteration: 6,
    duration: 3000
  },
  {
    type: 'observation',
    content: "挑战：数据隐私保护、算法可解释性、监管政策不完善、医疗人员接受度等。未来趋势：AI与医生协作模式、个性化精准医疗、远程医疗智能化、AI辅助手术机器人普及。",
    tool: 'websearch',
    prompt: "获取挑战和趋势信息",
    iteration: 6,
    duration: 2000
  },

  // Loop 7: Write report to file
  {
    type: 'period-thought',
    content: "所有研究信息已收集完毕。现在需要整理信息，生成结构化的研究报告并写入文件。报告应包括：概述、主要应用场景、典型案例、挑战分析、未来展望等部分。",
    prompt: "整理信息，准备生成报告",
    iteration: 7,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "Write('/output/ai_medical_research_report.md', content='# 人工智能在医疗领域的应用研究报告\\n\\n## 概述\\n...')",
    tool: 'write',
    prompt: "写入研究报告到文件",
    iteration: 7,
    duration: 3000
  },
  {
    type: 'observation',
    content: "文件写入成功：报告已保存到 /output/ai_medical_research_report.md，包含完整的章节结构、数据分析和结论。报告共5个章节，约5000字。",
    tool: 'write',
    prompt: "确认文件写入成功",
    iteration: 7,
    duration: 2000
  },

  // Loop 8: Generate final report
  {
    type: 'period-thought',
    content: "报告文件已写入。现在生成最终的研究报告摘要和总结。",
    prompt: "生成最终报告",
    iteration: 8,
    duration: 3000
  },
  {
    type: 'decision-action',
    content: "GenerateReport(title='人工智能在医疗领域的应用研究报告', file='/output/ai_medical_research_report.md')",
    tool: 'report',
    prompt: "生成最终研究报告",
    iteration: 8,
    duration: 3000
  },
  {
    type: 'observation',
    content: "研究报告已生成，包含完整的章节结构、数据分析和结论。报告共5个章节，约5000字，包含多个案例研究和数据图表。",
    tool: 'report',
    prompt: "确认报告生成成功",
    iteration: 8,
    duration: 2000
  },

  {
    type: 'period-thought',
    content: "研究报告已成功生成并保存。任务完成，可以向用户展示最终报告。",
    prompt: "确认任务完成",
    iteration: 9,
    duration: 2000
  },

  {
    type: 'finish',
    content: "深度研究报告生成完成！\n\n《人工智能在医疗领域的应用研究报告》\n\n【概述】\n人工智能在医疗领域应用广泛，涵盖诊断、治疗、药物研发等多个环节，正在深刻改变医疗行业。\n\n【主要应用场景】\n1. 医学影像诊断：AI辅助CT、MRI、X光片分析，准确率超过90%\n2. 药物研发：加速分子设计和筛选，缩短研发周期\n3. 个性化医疗：基于基因和病历数据提供定制化治疗方案\n4. 机器人辅助手术：提高手术精度和安全性\n\n【典型案例】\n- Google AI乳腺癌检测系统：准确率94.5%\n- DeepMind AlphaFold：蛋白质结构预测突破\n- 多家医院部署AI辅助诊断系统\n\n【挑战分析】\n- 数据隐私保护\n- 算法可解释性\n- 监管政策不完善\n- 医疗人员接受度\n\n【未来展望】\n- AI与医生协作模式成为主流\n- 个性化精准医疗普及\n- 远程医疗智能化\n- AI辅助手术机器人广泛应用\n\n报告字数：约5000字\n研究深度：深入\n数据来源：多个权威研究机构",
    duration: 0
  }
];

const TEXT2SQL_TOOLS = [
  { id: 'database', label: 'Database', angle: -90, icon: '🗄️' },
  { id: 'chart', label: 'Chart', angle: 30, icon: '📊' },
  { id: 'sql', label: 'SQL', angle: 150, icon: '💾' },
];

const DEEPRESEARCH_TOOLS = [
  { id: 'websearch', label: 'WebSearch', angle: -90, icon: '🌐' },
  { id: 'mcp', label: 'MCP', angle: -60, icon: '🔌' },
  { id: 'command', label: 'Command', angle: -30, icon: '⚙️' },
  { id: 'read', label: 'Read', angle: 30, icon: '📖' },
  { id: 'write', label: 'Write', angle: 90, icon: '✍️' },
  { id: 'report', label: 'Report', angle: 150, icon: '📄' },
];

// MCP Principle Scenario: LLM calling MCP with context
const MCP_PRINCIPLE_SCENARIO = [
  {
    type: 'human',
    content: "帮我查询今天的天气，并读取一个文件，然后执行一个命令",
    duration: 2000
  },
  {
    type: 'mcp-context-prepare',
    content: "准备上下文提示词：将可用工具描述添加到系统提示词中",
    prompt: "构建包含工具描述的上下文",
    tools: [
      {
        name: 'get_weather',
        description: '获取指定城市的天气信息',
        parameters: { city: 'string', date: 'string' }
      },
      {
        name: 'read_file',
        description: '读取文件内容',
        parameters: { path: 'string' }
      },
      {
        name: 'execute_command',
        description: '执行系统命令',
        parameters: { command: 'string' }
      }
    ],
    duration: 3000
  },
  {
    type: 'mcp-context-show',
    content: "系统提示词（包含工具描述）：\n\n你是一个AI助手，可以使用以下工具：\n\n1. get_weather: 获取指定城市的天气信息\n   参数: {city: string, date: string}\n\n2. read_file: 读取文件内容\n   参数: {path: string}\n\n3. execute_command: 执行系统命令\n   参数: {command: string}\n\n用户请求：帮我查询今天的天气，并读取一个文件，然后执行一个命令",
    prompt: "展示完整的上下文提示词",
    tools: [
      {
        name: 'get_weather',
        description: '获取指定城市的天气信息',
        parameters: { city: 'string', date: 'string' }
      },
      {
        name: 'read_file',
        description: '读取文件内容',
        parameters: { path: 'string' }
      },
      {
        name: 'execute_command',
        description: '执行系统命令',
        parameters: { command: 'string' }
      }
    ],
    duration: 4000
  },
  {
    type: 'mcp-llm-process',
    content: "大模型分析用户请求，决定调用工具",
    prompt: "LLM处理请求并选择工具",
    duration: 3000
  },
  {
    type: 'mcp-tool-call',
    content: "工具调用请求：\n{\n  \"tool\": \"get_weather\",\n  \"arguments\": {\n    \"city\": \"北京\",\n    \"date\": \"today\"\n  }\n}",
    tool: 'get_weather',
    prompt: "生成工具调用请求",
    duration: 3000
  },
  {
    type: 'mcp-server-receive',
    content: "MCP服务器接收请求：\n1. 解析工具调用\n2. 验证参数\n3. 路由到对应工具处理器",
    prompt: "MCP服务器处理请求",
    mcpStage: 'receive',
    duration: 3000
  },
  {
    type: 'mcp-server-execute',
    content: "MCP服务器执行工具：\n调用get_weather工具处理器\n查询天气API\n处理返回数据",
    prompt: "执行工具逻辑",
    mcpStage: 'execute',
    duration: 3000
  },
  {
    type: 'mcp-server-response',
    content: "工具执行结果：\n{\n  \"result\": {\n    \"city\": \"北京\",\n    \"temperature\": \"15°C\",\n    \"condition\": \"晴天\"\n  }\n}",
    prompt: "返回工具执行结果",
    mcpStage: 'response',
    duration: 2000
  },
  {
    type: 'mcp-llm-receive',
    content: "大模型接收工具结果，继续处理用户请求",
    prompt: "LLM接收工具结果",
    duration: 2000
  },
  {
    type: 'mcp-tool-call',
    content: "工具调用请求：\n{\n  \"tool\": \"read_file\",\n  \"arguments\": {\n    \"path\": \"/data/example.txt\"\n  }\n}",
    tool: 'read_file',
    prompt: "调用第二个工具",
    duration: 3000
  },
  {
    type: 'mcp-server-receive',
    content: "MCP服务器接收read_file请求",
    prompt: "MCP服务器处理第二个工具",
    mcpStage: 'receive',
    duration: 2000
  },
  {
    type: 'mcp-server-execute',
    content: "MCP服务器执行read_file：\n读取文件系统\n返回文件内容",
    prompt: "执行文件读取",
    mcpStage: 'execute',
    duration: 3000
  },
  {
    type: 'mcp-server-response',
    content: "文件内容：\n文件读取成功，内容为：\n\"Hello, this is a test file.\"",
    prompt: "返回文件内容",
    mcpStage: 'response',
    duration: 2000
  },
  {
    type: 'mcp-tool-call',
    content: "工具调用请求：\n{\n  \"tool\": \"execute_command\",\n  \"arguments\": {\n    \"command\": \"ls -la\"\n  }\n}",
    tool: 'execute_command',
    prompt: "调用第三个工具",
    duration: 3000
  },
  {
    type: 'mcp-server-receive',
    content: "MCP服务器接收execute_command请求",
    prompt: "MCP服务器处理第三个工具",
    mcpStage: 'receive',
    duration: 2000
  },
  {
    type: 'mcp-server-execute',
    content: "MCP服务器执行命令：\n执行系统命令\n捕获输出结果",
    prompt: "执行系统命令",
    mcpStage: 'execute',
    duration: 3000
  },
  {
    type: 'mcp-server-response',
    content: "命令执行结果：\n命令执行成功，输出：\n\"total 24\ndrwxr-xr-x ...\"",
    prompt: "返回命令执行结果",
    mcpStage: 'response',
    duration: 2000
  },
  {
    type: 'mcp-llm-finalize',
    content: "大模型整合所有工具结果，生成最终回复",
    prompt: "整合结果并生成回复",
    duration: 3000
  },
  {
    type: 'finish',
    content: "任务完成！\n\n已成功调用三个MCP工具：\n1. 天气查询：北京今天15°C，晴天\n2. 文件读取：成功读取example.txt文件\n3. 命令执行：成功执行ls -la命令\n\n所有工具调用都通过MCP协议完成，大模型根据上下文中的工具描述选择合适的工具并正确调用。",
    duration: 0
  }
];

const MCP_TOOLS = [
  { id: 'get_weather', label: 'Weather', angle: -90, icon: '🌤️' },
  { id: 'read_file', label: 'Read', angle: 30, icon: '📖' },
  { id: 'execute_command', label: 'Command', angle: 150, icon: '⚙️' },
];

// Agent-specific tools mapping
const AGENT_TOOLS = {
  research: [
    { id: 'websearch', label: 'WebSearch', angle: -90, icon: '🌐' },
    { id: 'read', label: 'Read', angle: 0, icon: '📖' },
  ],
  data: [
    { id: 'mcp', label: 'MCP', angle: -90, icon: '🔌' },
    { id: 'command', label: 'Command', angle: 0, icon: '⚙️' },
    { id: 'read', label: 'Read', angle: 90, icon: '📖' },
  ],
  analyze: [
    { id: 'read', label: 'Read', angle: -90, icon: '📖' },
    { id: 'websearch', label: 'WebSearch', angle: 0, icon: '🌐' },
  ],
  report: [
    { id: 'write', label: 'Write', angle: -90, icon: '✍️' },
    { id: 'report', label: 'Report', angle: 0, icon: '📄' },
  ],
};

// Claude Skill Lifecycle Scenario: 研判报告生成
const CLAUDE_SKILL_SCENARIO = [
  {
    type: 'lifecycle-intro',
    content: "Claude Skill 模式允许大模型调用本地定义的工具（Skills）来扩展其能力。本演示将展示生成研判报告的完整流程。",
    duration: 3000
  },
  {
    type: 'skill-file-read',
    content: "1. 读取 Skill 文件 (Read Skill Files)\n从本地文件系统读取 Skill 定义文件，获取工具描述信息。",
    code: `// 读取 Skill 文件: ./skills/generate_assessment_report.json
{
  "name": "generate_assessment_report",
  "description": "生成研判报告，包含威胁分析和应对建议",
  "parameters": {
    "topic": {
      "type": "string",
      "description": "报告主题"
    },
    "data_sources": {
      "type": "array",
      "description": "数据源列表"
    }
  }
}

// 读取其他 Skill 文件...
// ./skills/query_knowledge_base.json
// ./skills/analyze_trend.json
// ./skills/export_pdf.json`,
    step: 'read',
    duration: 4000
  },
  {
    type: 'skill-context-prepare',
    content: "准备上下文提示词：将 Skill 文件描述添加到系统提示词中",
    prompt: "构建包含 Skill 描述的上下文",
    skills: [
      {
        name: 'generate_assessment_report',
        description: '生成研判报告，包含威胁分析和应对建议',
        parameters: { topic: 'string', data_sources: 'array' }
      },
      {
        name: 'query_knowledge_base',
        description: '查询知识库，获取相关信息',
        parameters: { query: 'string', top_k: 'number' }
      },
      {
        name: 'analyze_trend',
        description: '分析趋势数据',
        parameters: { metric: 'string', time_range: 'string' }
      },
      {
        name: 'export_pdf',
        description: '导出PDF文件',
        parameters: { file_path: 'string' }
      }
    ],
    step: 'context-prepare',
    duration: 3000
  },
  {
    type: 'skill-context-show',
    content: "系统提示词（包含 Skill 描述）：\n\n你是一个AI助手，可以使用以下 Skills：\n\n1. generate_assessment_report: 生成研判报告，包含威胁分析和应对建议\n   参数: {topic: string, data_sources: array}\n\n2. query_knowledge_base: 查询知识库，获取相关信息\n   参数: {query: string, top_k: number}\n\n3. analyze_trend: 分析趋势数据\n   参数: {metric: string, time_range: string}\n\n4. export_pdf: 导出PDF文件\n   参数: {file_path: string}\n\n【对比 MCP】\nMCP 模式：一次性将所有工具信息加载到上下文，工具描述完整但占用较多 token。\nClaude Skill 模式：按需读取 Skill 文件，只加载必要的工具描述，更灵活高效。",
    prompt: "展示完整的上下文提示词（包含 Skill 描述）",
    skills: [
      {
        name: 'generate_assessment_report',
        description: '生成研判报告，包含威胁分析和应对建议',
        parameters: { topic: 'string', data_sources: 'array' }
      },
      {
        name: 'query_knowledge_base',
        description: '查询知识库，获取相关信息',
        parameters: { query: 'string', top_k: 'number' }
      },
      {
        name: 'analyze_trend',
        description: '分析趋势数据',
        parameters: { metric: 'string', time_range: 'string' }
      },
      {
        name: 'export_pdf',
        description: '导出PDF文件',
        parameters: { file_path: 'string' }
      }
    ],
    step: 'context-show',
    duration: 5000
  },
  {
    type: 'skill-register',
    content: "2. Skill 注册完成 (Skill Registration)\n所有 Skill 已成功注册到 Claude 上下文中。",
    code: `// 已注册的 Skills:
1. generate_assessment_report (生成研判报告)
   - args: { topic: string, data_sources: array }
2. query_knowledge_base (查询知识库)
   - args: { query: string, top_k: number }
3. analyze_trend (趋势分析)
   - args: { metric: string, time_range: string }
4. export_pdf (导出PDF)
   - args: { file_path: string }`,
    step: 'register',
    duration: 3000
  },
  {
    type: 'human',
    content: "请帮我生成一份关于近期网络安全态势的研判报告，需要包含威胁分析和应对建议。",
    step: 'input',
    duration: 3000
  },
  {
    type: 'llm-think',
    content: "3. 模型规划 (Planning)\nClaude 分析用户意图，决定调用 'generate_assessment_report'。",
    prompt: `Thought: 用户需要'网络安全研判报告'
-> 匹配工具 'generate_assessment_report'
-> 需要先查询知识库获取最新威胁情报
Parameters:
- topic: 'cybersecurity'
- include: ['threat_analysis', 'recommendations']`,
    step: 'plan',
    duration: 3000
  },
  {
    type: 'llm-call',
    content: "4. 工具调用 (Tool Call)\nClaude 生成JSON格式的工具调用请求。",
    code: `{
  "type": "tool_use",
  "name": "generate_assessment_report",
  "input": { 
    "topic": "网络安全态势",
    "data_sources": ["threat_intel_db", "incident_logs"],
    "sections": ["威胁分析", "风险评估", "应对建议"]
  }
}`,
    step: 'call',
    duration: 3000
  },
  {
    type: 'local-exec',
    content: "5. 本地执行 (Execution)\n本地Skill开始执行，涉及多步数据处理流程。",
    script: `> [Skill] 启动 generate_assessment_report...
> [Step 1] 连接威胁情报数据库...
> [Step 2] 查询近30天安全事件: 1,247条记录
> [Step 3] 调用趋势分析模块...
> [Step 4] 生成风险评估矩阵...
> [Step 5] 渲染报告模板 (Markdown)...
> [Done] 报告已保存: ./reports/security_assessment_2024Q4.md`,
    step: 'execute',
    duration: 5000
  },
  {
    type: 'skill-result',
    content: "6. 执行结果 (Result)\n本地Skill将结果返回给Claude。",
    code: `{
  "status": "success",
  "file_path": "./reports/security_assessment_2024Q4.md",
  "summary": "发现高危威胁3项，中危12项。建议优先处理勒索软件防护。",
  "pages": 15
}`,
    step: 'result',
    duration: 3000
  },
  {
    type: 'llm-final',
    content: "7. 最终响应 (Response)\nClaude 整合结果，向用户汇报。",
    response: `研判报告已生成完毕！

📄 文件：security_assessment_2024Q4.md (共15页)
🔴 高危威胁：3项
🟡 中危威胁：12项
💡 首要建议：加强勒索软件防护措施`,
    step: 'finish',
    duration: 4000
  },
  {
    type: 'finish',
    content: "演示结束：通过Skill模式，Claude可以调用本地能力完成复杂的研判分析任务。",
    duration: 0
  }
];

// RAG Principle Scenario: Data Chunking, Retrieval, and Generation
const RAG_SCENARIO = [
  {
    type: 'human',
    content: "请基于知识库回答：公司的人工智能政策是什么？",
    duration: 2000
  },
  {
    type: 'rag-intro',
    content: "RAG (Retrieval-Augmented Generation) 流程演示：\n1. 数据处理：切片、向量化\n2. 数据检索：语义匹配、召回\n3. 增强生成：将检索结果作为上下文提交给LLM",
    duration: 3000
  },
  // Phase 1: Data Processing
  {
    type: 'rag-process',
    stage: 'document',
    content: "原始文档 (Policy.pdf)：\n'公司鼓励员工使用人工智能工具提高效率。\n严禁将公司机密数据上传至公共AI平台。\n所有AI生成的内容必须经过人工审核。'",
    prompt: "加载原始知识库文档",
    duration: 3000
  },
  {
    type: 'rag-process',
    stage: 'chunking',
    content: "文本切片 (Chunking)：\nChunk 1: '公司鼓励员工使用人工智能工具提高效率。'\nChunk 2: '严禁将公司机密数据上传至公共AI平台。'\nChunk 3: '所有AI生成的内容必须经过人工审核。'",
    prompt: "执行文本切片 (Fixed Size / Semantic)",
    duration: 3000
  },
  {
    type: 'rag-process',
    stage: 'embedding',
    content: "向量化 (Embedding)：\nChunk 1 -> [0.12, -0.45, 0.88, ...]\nChunk 2 -> [-0.33, 0.56, 0.12, ...]\nChunk 3 -> [0.78, -0.11, 0.34, ...]",
    prompt: "调用 Embedding 模型生成向量",
    duration: 3000
  },
  {
    type: 'rag-process',
    stage: 'indexing',
    content: "入库存储 (Vector DB)：\n将向量和对应文本及其Metadata (Source, Page) 存入向量数据库。",
    prompt: "构建向量索引",
    duration: 2000
  },
  // Phase 2: Retrieval
  {
    type: 'rag-process',
    stage: 'query',
    content: "用户查询：'公司的人工智能政策是什么？'\n\n-> 生成查询向量：\nQuery -> [0.15, -0.40, 0.82, ...]",
    prompt: "处理用户查询并向量化",
    duration: 3000
  },
  {
    type: 'rag-process',
    stage: 'retrieval',
    content: "向量检索 (Vector Search)：\n计算余弦相似度 (Cosine Similarity)...\n\nTop 3 匹配：\n1. Chunk 1 (Score: 0.92)\n2. Chunk 2 (Score: 0.88)\n3. Chunk 3 (Score: 0.85)",
    prompt: "执行向量相似度检索",
    duration: 3000
  },
  {
    type: 'rag-process',
    stage: 'recall',
    content: "数据召回 (Recall)：\n根据阈值 (Threshold > 0.8) 筛选有效片段。\n召回结果：\n- '鼓励使用工具...'\n- '严禁上传机密...'\n- '需人工审核...'",
    prompt: "筛选并召回相关切片",
    duration: 3000
  },
  {
    type: 'rag-process',
    stage: 'multi-recall',
    content: "多路召回 (Multi-Route Recall) - 多知识库模拟：\n\n知识库1 (Policy DB)：\n  路线1 - 向量检索：Chunk 1, Chunk 2, Chunk 3\n  路线2 - 关键词匹配：Chunk 2, Chunk 4\n\n知识库2 (HR DB)：\n  路线1 - 向量检索：Chunk A, Chunk B\n  路线2 - 语义检索：Chunk A, Chunk C\n\n知识库3 (Tech DB)：\n  路线1 - 混合检索：Chunk X, Chunk Y\n  路线2 - 向量检索：Chunk X, Chunk Z\n\n总计：3个知识库 × 2条路线 = 6路召回\n合并去重后得到候选集",
    prompt: "执行多知识库多路召回策略",
    duration: 4000
  },
  {
    type: 'rag-process',
    stage: 'merge',
    content: "数据合并 (Merge)：\n合并多路召回结果，去重并排序：\n1. Chunk 1 (Score: 0.92, Route: 1,3)\n2. Chunk 2 (Score: 0.88, Route: 1,2)\n3. Chunk 3 (Score: 0.85, Route: 1,3)\n4. Chunk 4 (Score: 0.82, Route: 2)\n\n最终选择 Top 3 作为上下文",
    prompt: "合并并排序多路召回结果",
    duration: 3000
  },
  // Phase 3: Generation
  {
    type: 'rag-process',
    stage: 'context',
    content: "构建上下文 (Context Construction)：\nPrompt:\n'基于以下上下文回答问题：\n[Context]\n1. ...鼓励使用...\n2. ...严禁上传...\n3. ...需人工审核...\n\n[Question]\n公司的人工智能政策是什么？'",
    prompt: "组装 System Prompt 和 Context",
    duration: 4000
  },
  {
    type: 'rag-process',
    stage: 'generation',
    content: "LLM 生成 (Generation)：\n根据公司政策，员工可以使用AI工具提效，但必须遵守两点核心规定：\n1. 严禁上传机密数据到公共平台；\n2. 生成内容必须经人工审核。",
    prompt: "LLM 基于上下文生成回答",
    duration: 4000
  },
  {
    type: 'rag-process',
    stage: 'structured-output',
    content: "结构化输出 (Structured Output)：\n{\n  \"answer\": \"根据公司政策，员工可以使用AI工具提效，但必须遵守两点核心规定：1. 严禁上传机密数据到公共平台；2. 生成内容必须经人工审核。\",\n  \"sources\": [\"Policy.pdf: Page 1\", \"Policy.pdf: Page 2\"],\n  \"confidence\": 0.92\n}",
    prompt: "生成结构化输出结果",
    duration: 3000
  },
  {
    type: 'finish',
    content: "RAG 演示完成！\n完整流程：数据切片 -> 数据入库 -> 数据召回 -> 多路召回 -> 数据合并 -> 结构化输出",
    duration: 0
  }
];

function App() {
  const [mode, setMode] = useState('transformer'); // 'transformer', 'react', 'text2sql', 'deepresearch', 'mcp', or 'normal'
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [activeTool, setActiveTool] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  // Track completed transformer stages to persist content after execution
  const [completedStages, setCompletedStages] = useState({
    input: null,      // 输入阶段内容
    tokenize: null,   // 分词阶段内容
    embedding: null,  // 嵌入阶段内容
    encoder: null,    // 编码器阶段内容
    attention: null,  // 注意力阶段内容
    decoder: null,    // 解码器阶段内容
    output: null,     // 输出阶段内容
    // SQL相关阶段
    sqlInput: null,
    sqlParse: null,
    sqlPlan: null,
    sqlExecute: null,
    sqlIndex: null,
    sqlRetrieve: null,
    sqlResult: null
  });
  const traceEndRef = useRef(null);
  const chatEndRef = useRef(null);
  const llmPanelRef = useRef(null);
  const mysqlPanelRef = useRef(null);
  const inputSectionRef = useRef(null);
  const encoderSectionRef = useRef(null);
  const decoderSectionRef = useRef(null);
  const sqlInputSectionRef = useRef(null);
  const sqlExecuteSectionRef = useRef(null);
  const sqlResultSectionRef = useRef(null);

  // Auto-scroll logic - ENABLED per user request
  useEffect(() => {
    if (traceEndRef.current) traceEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // useEffect(() => {
  //   if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  // }, [logs]);

  // Auto-scroll comparison panels based on current step
  useEffect(() => {
    if (mode !== 'transformer') return;

    let scenario;
    if (mode === 'transformer') {
      scenario = TRANSFORMER_SCENARIO;
    } else if (mode === 'react') {
      scenario = DEMO_SCENARIO;
    } else if (mode === 'text2sql') {
      scenario = TEXT2SQL_SCENARIO;
    } else if (mode === 'deepresearch') {
      scenario = DEEPRESEARCH_SCENARIO;
    } else if (mode === 'mcp') {
      scenario = MCP_PRINCIPLE_SCENARIO;
    } else if (mode === 'claudeskill') {
      scenario = CLAUDE_SKILL_SCENARIO;
    } else {
      scenario = NORMAL_SCENARIO;
    }
    const currentStep = stepIndex >= 0 && stepIndex < scenario.length ? scenario[stepIndex] : null;

    if (!currentStep) return;

    const scrollToSection = (sectionRef, panelRef) => {
      if (sectionRef.current && panelRef.current) {
        const sectionTop = sectionRef.current.offsetTop;
        const panelHeight = panelRef.current.clientHeight;
        const sectionHeight = sectionRef.current.offsetHeight;

        // Calculate target scroll position (center the section in viewport)
        const targetScroll = sectionTop - (panelHeight / 2) + (sectionHeight / 2);

        panelRef.current.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }
    };

    // Small delay to ensure DOM is updated
    const timeout = setTimeout(() => {
      // Scroll based on current stage
      if (currentStep.stage === 'input' || currentStep.stage === 'tokenize') {
        scrollToSection(inputSectionRef, llmPanelRef);
        scrollToSection(sqlInputSectionRef, mysqlPanelRef);
      } else if (currentStep.stage === 'embedding' || currentStep.stage === 'encoder' || currentStep.stage === 'attention') {
        scrollToSection(encoderSectionRef, llmPanelRef);
        scrollToSection(sqlExecuteSectionRef, mysqlPanelRef);
      } else if (currentStep.stage === 'decoder' || currentStep.stage === 'output') {
        scrollToSection(decoderSectionRef, llmPanelRef);
        scrollToSection(sqlResultSectionRef, mysqlPanelRef);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [mode, stepIndex]);

  // Main Loop
  useEffect(() => {
    if (!isRunning) return;

    let scenario;
    if (mode === 'transformer') {
      scenario = TRANSFORMER_SCENARIO;
    } else if (mode === 'react') {
      scenario = DEMO_SCENARIO;
    } else if (mode === 'text2sql') {
      scenario = TEXT2SQL_SCENARIO;
    } else if (mode === 'deepresearch') {
      scenario = DEEPRESEARCH_SCENARIO;
    } else if (mode === 'mcp') {
      scenario = MCP_PRINCIPLE_SCENARIO;
    } else if (mode === 'claudeskill') {
      scenario = CLAUDE_SKILL_SCENARIO;
    } else if (mode === 'rag') {
      scenario = RAG_SCENARIO;
    } else {
      scenario = NORMAL_SCENARIO;
    }

    if (stepIndex >= scenario.length) {
      const timeout = setTimeout(() => setIsRunning(false), 2000);
      return () => clearTimeout(timeout);
    }

    const currentStep = scenario[stepIndex];
    let stepDuration = currentStep.duration;

    // Update Logs
    setLogs(prev => {
      // Avoid duplicates
      if (prev.length > 0 && prev[prev.length - 1] === currentStep) return prev;
      return [...prev, currentStep];
    });

    // Save completed transformer stages for persistent display
    if (mode === 'transformer' && currentStep.stage) {
      setCompletedStages(prev => {
        const newStages = { ...prev };
        // Save LLM stages
        if (currentStep.stage === 'input') {
          newStages.input = currentStep;
        } else if (currentStep.stage === 'tokenize') {
          newStages.tokenize = currentStep;
        } else if (currentStep.stage === 'embedding') {
          newStages.embedding = currentStep;
        } else if (currentStep.stage === 'encoder') {
          newStages.encoder = currentStep;
        } else if (currentStep.stage === 'attention') {
          newStages.attention = currentStep;
        } else if (currentStep.stage === 'decoder') {
          newStages.decoder = currentStep;
        } else if (currentStep.stage === 'output') {
          newStages.output = currentStep;
        }
        // Save SQL stages
        if (currentStep.sqlStage === 'sql-input') {
          newStages.sqlInput = currentStep;
        } else if (currentStep.sqlStage === 'sql-parse') {
          newStages.sqlParse = currentStep;
        } else if (currentStep.sqlStage === 'sql-plan') {
          newStages.sqlPlan = currentStep;
        } else if (currentStep.sqlStage === 'sql-execute') {
          newStages.sqlExecute = currentStep;
        } else if (currentStep.sqlStage === 'sql-index') {
          newStages.sqlIndex = currentStep;
        } else if (currentStep.sqlStage === 'sql-retrieve') {
          newStages.sqlRetrieve = currentStep;
        } else if (currentStep.sqlStage === 'sql-result') {
          newStages.sqlResult = currentStep;
        }
        return newStages;
      });
    }

    // Handle Tool Activation
    if (currentStep.type === 'decision-action' || currentStep.type === 'observation' || currentStep.type === 'mcp-tool-call') {
      setActiveTool(currentStep.tool);
    } else {
      setActiveTool(null);
    }

    // Update iteration count
    if (currentStep.iteration) {
      setCurrentIteration(currentStep.iteration);
    }

    const timer = setTimeout(() => {
      setStepIndex(prev => prev + 1);
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [stepIndex, isRunning, mode]);

  const handleStart = () => {
    setLogs([]);
    setStepIndex(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    setLogs([]);
    setStepIndex(-1);
    setIsRunning(false);
    setActiveTool(null);
    setCurrentIteration(0);
    setCompletedStages({
      input: null,
      tokenize: null,
      embedding: null,
      encoder: null,
      attention: null,
      decoder: null,
      output: null,
      sqlInput: null,
      sqlParse: null,
      sqlPlan: null,
      sqlExecute: null,
      sqlIndex: null,
      sqlRetrieve: null,
      sqlResult: null
    });
  };

  const handleModeChange = (newMode) => {
    if (isRunning) return;
    setMode(newMode);
    handleReset();
  };

  let scenario;
  if (mode === 'transformer') {
    scenario = TRANSFORMER_SCENARIO;
  } else if (mode === 'react') {
    scenario = DEMO_SCENARIO;
  } else if (mode === 'text2sql') {
    scenario = TEXT2SQL_SCENARIO;
  } else if (mode === 'deepresearch') {
    scenario = DEEPRESEARCH_SCENARIO;
  } else if (mode === 'mcp') {
    scenario = MCP_PRINCIPLE_SCENARIO;
  } else if (mode === 'claudeskill') {
    scenario = CLAUDE_SKILL_SCENARIO;
  } else if (mode === 'rag') {
    scenario = RAG_SCENARIO;
  } else {
    scenario = NORMAL_SCENARIO;
  }
  const currentStep = stepIndex >= 0 && stepIndex < scenario.length ? scenario[stepIndex] : null;
  const isThinking = currentStep?.type === 'period-thought';
  const isAction = currentStep?.type === 'decision-action';
  const isObservation = currentStep?.type === 'observation';

  // Separating logs for display
  const chatMessages = logs.filter(l => l.type === 'human' || l.type === 'finish' || l.type === 'llmout' || (mode === 'mcp' && l.type === 'finish'));
  const traceLogs = logs; // Trace shows everything, including chat, but formatted differently

  // Get current cycle info
  const getCurrentCycleInfo = () => {
    if (!currentStep || !currentStep.iteration) return null;
    // Include current step in the search, but avoid duplicates
    const allSteps = [...logs];
    if (currentStep && !logs.find(l => l === currentStep)) {
      allSteps.push(currentStep);
    }
    const cycleSteps = allSteps.filter(s => s.iteration === currentStep.iteration);
    return {
      thought: cycleSteps.find(s => s.type === 'period-thought'),
      action: cycleSteps.find(s => s.type === 'decision-action'),
      observation: cycleSteps.find(s => s.type === 'observation')
    };
  };

  const cycleInfo = getCurrentCycleInfo();

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">
            {mode === 'react' ? '✈️' : mode === 'text2sql' ? '📊' : mode === 'mcp' ? '🔌' : '⚡'}
          </div>
          <div>
            <h1>大模型原理场景演示</h1>
            <span className="subtitle">
              {mode === 'react' ? 'Thought → Action → Observation' :
                mode === 'text2sql' ? 'Text2SQL → Chart Generation' :
                  mode === 'deepresearch' ? 'Deep Research → Report Generation' :
                    mode === 'mcp' ? 'LLM → MCP → Tool Execution' :
                      mode === 'claudeskill' ? 'Skill Definition → LLM Plan → Local Execution' :
                        'REST → LLM → LLM Output'}
            </span>
          </div>
        </div>
        <div className="controls">
          <button onClick={handleReset} disabled={isRunning && stepIndex === -1}>Reset</button>
          <button className="primary" onClick={handleStart} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Start Trace'}
          </button>
        </div>
      </header>

      {/* MODE TABS */}
      <div className="mode-tabs">
        <button
          className={`tab-button ${mode === 'transformer' ? 'active' : ''}`}
          onClick={() => handleModeChange('transformer')}
          disabled={isRunning}
        >
          <span className="tab-icon">🧠</span>
          <span>大模型原理</span>
        </button>
        <button
          className={`tab-button ${mode === 'normal' ? 'active' : ''}`}
          onClick={() => handleModeChange('normal')}
          disabled={isRunning}
        >
          <span className="tab-icon">⚡</span>
          <span>基本使用</span>
        </button>
        <button
          className={`tab-button ${mode === 'react' ? 'active' : ''}`}
          onClick={() => handleModeChange('react')}
          disabled={isRunning}
        >
          <span className="tab-icon">🔄</span>
          <span>智能体</span>
        </button>
        <button
          className={`tab-button ${mode === 'text2sql' ? 'active' : ''}`}
          onClick={() => handleModeChange('text2sql')}
          disabled={isRunning}
        >
          <span className="tab-icon">📊</span>
          <span>Text2SQL</span>
        </button>
        <button
          className={`tab-button ${mode === 'deepresearch' ? 'active' : ''}`}
          onClick={() => handleModeChange('deepresearch')}
          disabled={isRunning}
        >
          <span className="tab-icon">🔬</span>
          <span>DeepResearch</span>
        </button>
        <button
          className={`tab-button ${mode === 'mcp' ? 'active' : ''}`}
          onClick={() => handleModeChange('mcp')}
          disabled={isRunning}
        >
          <span className="tab-icon">🔌</span>
          <span>MCP原理</span>
        </button>
        <button
          className={`tab-button ${mode === 'claudeskill' ? 'active' : ''}`}
          onClick={() => handleModeChange('claudeskill')}
          disabled={isRunning}
        >
          <span className="tab-icon">🛠️</span>
          <span>Claude Skill</span>
        </button>
        <button
          className={`tab-button ${mode === 'rag' ? 'active' : ''}`}
          onClick={() => handleModeChange('rag')}
          disabled={isRunning}
        >
          <span className="tab-icon">📑</span>
          <span>RAG原理</span>
        </button>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="main-content">

        {/* LEFT: VISUALIZATIONS & CHAT */}
        <section className={`visualization-panel ${mode === 'transformer' ? 'mode-transformer' : ''}`}>

          {/* Mode-specific Display */}
          {mode === 'transformer' ? (
            /* Transformer Architecture Display */
            <div className="transformer-display">
              <div className="cycle-header">
                <span className="cycle-title">Transformer 架构流程</span>
              </div>
              <div className="transformer-stages">
                <div className={`transformer-stage ${currentStep?.stage === 'training' ? 'active' : ''}`}>
                  <div className="stage-icon">📚</div>
                  <div className="stage-label">训练阶段</div>
                </div>
                <div className="stage-arrow">→</div>
                <div className={`transformer-stage ${currentStep?.stage === 'input' || currentStep?.stage === 'tokenize' ? 'active' : ''}`}>
                  <div className="stage-icon">📥</div>
                  <div className="stage-label">输入处理</div>
                </div>
                <div className="stage-arrow">→</div>
                <div className={`transformer-stage ${currentStep?.stage === 'embedding' || currentStep?.stage === 'encoder' || currentStep?.stage === 'attention' ? 'active' : ''}`}>
                  <div className="stage-icon">🔧</div>
                  <div className="stage-label">Encoder</div>
                </div>
                <div className="stage-arrow">→</div>
                <div className={`transformer-stage ${currentStep?.stage === 'decoder' ? 'active' : ''}`}>
                  <div className="stage-icon">⚙️</div>
                  <div className="stage-label">Decoder</div>
                </div>
                <div className="stage-arrow">→</div>
                <div className={`transformer-stage ${currentStep?.stage === 'output' ? 'active' : ''}`}>
                  <div className="stage-icon">📤</div>
                  <div className="stage-label">输出生成</div>
                </div>
              </div>
            </div>
          ) : mode === 'deepresearch' ? (
            /* Multi-Agent Display */
            <div className="multi-agent-display">
              <div className="cycle-header">
                <span className="cycle-title">多Agent协作系统</span>
                {currentIteration > 0 && (
                  <span className="iteration-badge">第 {currentIteration} 轮</span>
                )}
              </div>
              <div className="agent-status-grid">
                {['research', 'data', 'analyze', 'report'].map((agentId) => {
                  const agentInfo = {
                    research: { name: '研究Agent', icon: '🔍', color: '#00f2fe' },
                    data: { name: '数据Agent', icon: '📊', color: '#4caf50' },
                    analyze: { name: '分析Agent', icon: '🧠', color: '#ff9800' },
                    report: { name: '报告Agent', icon: '📄', color: '#9c27b0' }
                  }[agentId];

                  const isActive = currentStep?.agent === agentId;
                  const isCommunicating = currentStep?.type === 'agent-communication' &&
                    (currentStep?.fromAgent === agentId || currentStep?.toAgent === agentId);

                  return (
                    <div
                      key={agentId}
                      className={`agent-status-card ${isActive ? 'active' : ''} ${isCommunicating ? 'communicating' : ''}`}
                      style={{ '--agent-color': agentInfo.color }}
                    >
                      <div className="agent-status-icon">{agentInfo.icon}</div>
                      <div className="agent-status-name">{agentInfo.name}</div>
                      {isActive && (
                        <div className="agent-status-action">
                          {currentStep?.type === 'period-thought' && '💭 思考中'}
                          {currentStep?.type === 'decision-action' && '⚡ 执行中'}
                          {currentStep?.type === 'observation' && '👁️ 观察中'}
                        </div>
                      )}
                      {isCommunicating && (
                        <div className="agent-status-action">
                          {currentStep?.fromAgent === agentId ? '📤 发送中' : '📥 接收中'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : mode === 'mcp' ? (
            /* MCP Principle Display */
            <div className="mcp-principle-display">
              <div className="cycle-header">
                <span className="cycle-title">MCP 调用流程</span>
              </div>
              <div className="mcp-flow-steps">
                <div className={`mcp-flow-step ${currentStep?.type === 'mcp-context-prepare' || currentStep?.type === 'mcp-context-show' ? 'active' : ''}`}>
                  <div className="step-icon">📝</div>
                  <div className="step-label">上下文准备</div>
                </div>
                <div className="flow-arrow">→</div>
                <div className={`mcp-flow-step ${currentStep?.type === 'mcp-llm-process' ? 'active' : ''}`}>
                  <div className="step-icon">🤖</div>
                  <div className="step-label">LLM处理</div>
                </div>
                <div className="flow-arrow">→</div>
                <div className={`mcp-flow-step ${currentStep?.type === 'mcp-tool-call' ? 'active' : ''}`}>
                  <div className="step-icon">🔧</div>
                  <div className="step-label">工具调用</div>
                </div>
                <div className="flow-arrow">→</div>
                <div className={`mcp-flow-step ${currentStep?.type === 'mcp-server-receive' || currentStep?.type === 'mcp-server-execute' || currentStep?.type === 'mcp-server-response' ? 'active' : ''}`}>
                  <div className="step-icon">🔌</div>
                  <div className="step-label">MCP服务器</div>
                </div>
                <div className="flow-arrow">→</div>
                <div className={`mcp-flow-step ${currentStep?.type === 'mcp-llm-receive' || currentStep?.type === 'mcp-llm-finalize' ? 'active' : ''}`}>
                  <div className="step-icon">✅</div>
                  <div className="step-label">结果返回</div>
                </div>
              </div>
            </div>
          ) : mode === 'claudeskill' ? (
            /* Claude Skill Display */
            <div className="skill-lifecycle-display">
              <div className="cycle-header">
                <span className="cycle-title">Claude Skill Lifecycle</span>
              </div>

              {/* Context Panel - Similar to MCP */}
              {(currentStep?.type === 'skill-context-prepare' || currentStep?.type === 'skill-context-show' || currentStep?.type === 'skill-file-read') && (
                <div className="mcp-context-panel" style={{ marginBottom: '20px' }}>
                  <div className="context-header">
                    <div className="context-icon">📝</div>
                    <div className="context-title">Skill 文件读取与上下文构建</div>
                  </div>
                  <div className="context-content">
                    {currentStep?.type === 'skill-file-read' && (
                      <div className="tools-description">
                        <div className="tools-intro">正在读取 Skill 文件...</div>
                        <div className="tools-list">
                          <div className="tool-description-item">
                            <div className="tool-name">📄 ./skills/generate_assessment_report.json</div>
                            <div className="tool-desc">生成研判报告，包含威胁分析和应对建议</div>
                          </div>
                          <div className="tool-description-item">
                            <div className="tool-name">📄 ./skills/query_knowledge_base.json</div>
                            <div className="tool-desc">查询知识库，获取相关信息</div>
                          </div>
                          <div className="tool-description-item">
                            <div className="tool-name">📄 ./skills/analyze_trend.json</div>
                            <div className="tool-desc">分析趋势数据</div>
                          </div>
                          <div className="tool-description-item">
                            <div className="tool-name">📄 ./skills/export_pdf.json</div>
                            <div className="tool-desc">导出PDF文件</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {currentStep?.type === 'skill-context-show' && currentStep?.skills && (
                      <div className="tools-description">
                        <div className="tools-intro">系统提示词（包含 Skill 描述）：</div>
                        <div className="tools-list">
                          {currentStep.skills.map((skill, index) => (
                            <div key={index} className="tool-description-item">
                              <div className="tool-name">{index + 1}. {skill.name}</div>
                              <div className="tool-desc">{skill.description}</div>
                              <div className="tool-params">参数: {JSON.stringify(skill.parameters)}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(156, 39, 176, 0.1)', borderRadius: '5px', fontSize: '12px' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>【对比 MCP】</div>
                          <div>MCP 模式：一次性将所有工具信息加载到上下文，工具描述完整但占用较多 token。</div>
                          <div style={{ marginTop: '5px' }}>Claude Skill 模式：按需读取 Skill 文件，只加载必要的工具描述，更灵活高效。</div>
                        </div>
                      </div>
                    )}
                    {currentStep?.type === 'skill-context-prepare' && (
                      <div className="preparing-context">正在准备上下文提示词（从 Skill 文件读取描述）...</div>
                    )}
                  </div>
                </div>
              )}

              <div className="skill-diagram-container">
                {/* 1. Define/Read */}
                <div className={`skill-node node-define ${['read', 'define', 'register', 'context-prepare', 'context-show'].includes(currentStep?.step) ? 'active' : ''}`}>
                  <div className="skill-node-icon">📝</div>
                  <div className="skill-node-label">Skill Files</div>
                  {['read', 'context-prepare', 'context-show', 'register'].includes(currentStep?.step) && <div className="connection-check">✓</div>}
                </div>

                {/* Arrow */}
                <div className="skill-arrow">→</div>

                {/* 2. LLM */}
                <div className={`skill-node node-llm ${['plan', 'call', 'finish', 'register', 'context-show'].includes(currentStep?.step) ? 'active' : ''}`}>
                  <div className="skill-node-icon">🧠</div>
                  <div className="skill-node-label">Claude LLM</div>
                  {currentStep?.step === 'call' && <div className="skill-pulse-ring"></div>}
                </div>

                {/* Arrow */}
                <div className="skill-arrow">⇄</div>

                {/* 3. Execute */}
                <div className={`skill-node node-execute ${['execute', 'result', 'call'].includes(currentStep?.step) ? 'active' : ''}`}>
                  <div className="skill-node-icon">💻</div>
                  <div className="skill-node-label">Local Execution</div>
                  {currentStep?.step === 'execute' && <div className="executing-spinner"></div>}
                </div>
              </div>

              {/* Prompt/Code Display Area */}
              <div className="skill-info-panel">
                <div className="panel-header">
                  <span className="panel-title">
                    {currentStep?.step === 'read' ? 'Skill File Reading' :
                      currentStep?.step === 'context-prepare' ? 'Context Preparation' :
                        currentStep?.step === 'context-show' ? 'System Prompt (with Skills)' :
                          currentStep?.step === 'define' ? 'Skill Definition (JSON)' :
                            currentStep?.step === 'register' ? 'System Prompt Injection' :
                              currentStep?.step === 'plan' ? 'Thinking Process' :
                                currentStep?.step === 'call' ? 'Tool Call Payload' :
                                  currentStep?.step === 'execute' ? 'Local Terminal' :
                                    currentStep?.step === 'result' ? 'Tool Result Payload' :
                                      currentStep?.step === 'finish' ? 'Final Response' : 'Info'}
                  </span>
                </div>
                <div className="panel-content">
                  <pre>
                    {currentStep?.code || currentStep?.prompt || currentStep?.script || currentStep?.response || currentStep?.content || "Waiting..."}
                  </pre>
                </div>
              </div>
            </div>
          ) : mode === 'rag' ? (
            /* RAG Visualization */
            <div className="rag-display">
              <div className="cycle-header">
                <span className="cycle-title">RAG (检索增强生成) 流程</span>
                {currentStep?.stage && (
                  <span className="iteration-badge">
                    {currentStep.stage === 'document' ? '原始文档' :
                      currentStep.stage === 'chunking' ? '数据切片' :
                        currentStep.stage === 'embedding' ? '向量化' :
                          currentStep.stage === 'indexing' ? '数据入库' :
                            currentStep.stage === 'query' ? '查询处理' :
                              currentStep.stage === 'retrieval' ? '向量检索' :
                                currentStep.stage === 'recall' ? '数据召回' :
                                  currentStep.stage === 'multi-recall' ? '多路召回' :
                                    currentStep.stage === 'merge' ? '数据合并' :
                                      currentStep.stage === 'context' ? '构建上下文' :
                                        currentStep.stage === 'generation' ? 'LLM生成' :
                                          currentStep.stage === 'structured-output' ? '结构化输出' : '准备中'}
                  </span>
                )}
              </div>

              <div className="rag-visualization">
                <div className="rag-process-details">
                  {currentStep?.prompt && (
                    <div className="rag-detail-item">
                      <div className="rag-detail-label">操作</div>
                      <div className="rag-detail-content" style={{ color: 'var(--primary-color)' }}>
                        {currentStep.prompt}
                      </div>
                    </div>
                  )}

                  {currentStep?.content && (
                    <div className="rag-detail-item">
                      <div className="rag-detail-label">详情</div>
                      <div className="rag-detail-content">
                        {currentStep.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : mode === 'react' || mode === 'text2sql' ? (
            /* ReAct Cycle Display */
            <div className="react-cycle-display">
              <div className="cycle-header">
                <span className="cycle-title">ReAct 循环</span>
                {currentIteration > 0 && (
                  <span className="iteration-badge">第 {currentIteration} 轮</span>
                )}
              </div>
              <div className="cycle-steps">
                <div className={`cycle-step thought-step ${isThinking ? 'active' : ''}`}>
                  <div className="step-icon">💭</div>
                  <div className="step-label">Thought</div>
                  <div className="step-prompt">
                    {currentStep?.type === 'period-thought' && currentStep.prompt ? currentStep.prompt :
                      cycleInfo?.thought?.prompt || '思考阶段'}
                  </div>
                </div>
                <div className="cycle-arrow">→</div>
                <div className={`cycle-step action-step ${isAction ? 'active' : ''}`}>
                  <div className="step-icon">⚡</div>
                  <div className="step-label">Action</div>
                  <div className="step-prompt">
                    {currentStep?.type === 'decision-action' && currentStep.prompt ? currentStep.prompt :
                      cycleInfo?.action?.prompt || '行动阶段'}
                  </div>
                </div>
                <div className="cycle-arrow">→</div>
                <div className={`cycle-step observation-step ${isObservation ? 'active' : ''}`}>
                  <div className="step-icon">👁️</div>
                  <div className="step-label">Observation</div>
                  <div className="step-prompt">
                    {currentStep?.type === 'observation' && currentStep.prompt ? currentStep.prompt :
                      cycleInfo?.observation?.prompt || '观察阶段'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Normal Mode Display */
            <div className="normal-mode-display">
              <div className="cycle-header">
                <span className="cycle-title">普通模式流程</span>
              </div>
              <div className="cycle-steps">
                <div className={`cycle-step rest-step ${currentStep?.type === 'rest' ? 'active' : ''}`}>
                  <div className="step-icon">📥</div>
                  <div className="step-label">REST</div>
                  <div className="step-prompt">
                    {currentStep?.type === 'rest' && currentStep.prompt ? currentStep.prompt : '接收请求'}
                  </div>
                </div>
                <div className="cycle-arrow">→</div>
                <div className={`cycle-step rest-api-step ${currentStep?.type === 'rest-api' ? 'active' : ''}`}>
                  <div className="step-icon">🌐</div>
                  <div className="step-label">REST API</div>
                  <div className="step-prompt">
                    {currentStep?.type === 'rest-api' && currentStep.prompt ? currentStep.prompt : '调用外部API'}
                  </div>
                </div>
                <div className="cycle-arrow">→</div>
                <div className={`cycle-step rest-response-step ${currentStep?.type === 'rest-response' ? 'active' : ''}`}>
                  <div className="step-icon">📡</div>
                  <div className="step-label">API Response</div>
                  <div className="step-prompt">
                    {currentStep?.type === 'rest-response' && currentStep.prompt ? currentStep.prompt : '接收数据'}
                  </div>
                </div>
                <div className="cycle-arrow">→</div>
                <div className={`cycle-step llm-step ${currentStep?.type === 'llm' ? 'active' : ''}`}>
                  <div className="step-icon">🤖</div>
                  <div className="step-label">LLM</div>
                  <div className="step-prompt">
                    {currentStep?.type === 'llm' && currentStep.prompt ? currentStep.prompt : '调用大模型'}
                  </div>
                </div>
                <div className="cycle-arrow">→</div>
                <div className={`cycle-step llmout-step ${currentStep?.type === 'llmout' ? 'active' : ''}`}>
                  <div className="step-icon">📤</div>
                  <div className="step-label">LLM Output</div>
                  <div className="step-prompt">
                    {currentStep?.type === 'llmout' && currentStep.prompt ? currentStep.prompt : '输出结果'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1. Agent Animation Stage */}
          <div className="stage-container">
            {mode === 'transformer' ? (
              /* Transformer Architecture Visualization with MySQL Comparison */
              <div className="comparison-container">
                {/* Left: LLM Architecture */}
                <div className="comparison-panel llm-panel" ref={llmPanelRef}>
                  <div className="panel-header">
                    <div className="panel-icon">🧠</div>
                    <div className="panel-title">大语言模型 (LLM)</div>
                  </div>

                  {/* Input Section */}
                  <div className="transformer-section input-section" ref={inputSectionRef}>
                    <div className="section-label">输入</div>
                    {/* 显示当前步骤或已完成的输入阶段内容 */}
                    {(currentStep?.stage === 'input' || currentStep?.stage === 'tokenize' || completedStages.input || completedStages.tokenize) && (
                      <div className="input-text">
                        {(currentStep?.stage === 'input' || currentStep?.stage === 'tokenize')
                          ? (currentStep?.content?.split('\n')[0] || '用户输入文本')
                          : ((completedStages.tokenize || completedStages.input)?.content?.split('\n')[0] || '用户输入文本')}
                      </div>
                    )}
                    {/* 显示当前或已完成的tokens */}
                    {((currentStep?.stage === 'tokenize' && currentStep?.tokens) || completedStages.tokenize?.tokens) && (
                      <div className="tokens-display">
                        {(currentStep?.stage === 'tokenize' ? currentStep.tokens : completedStages.tokenize.tokens).map((token, i) => (
                          <span key={i} className="token-item">{token}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Encoder Section */}
                  <div className="transformer-section encoder-section" ref={encoderSectionRef}>
                    <div className="section-label">Encoder</div>
                    {/* 显示当前步骤或已完成的Encoder阶段内容 */}
                    {(currentStep?.stage === 'embedding' || currentStep?.stage === 'encoder' || currentStep?.stage === 'attention' || completedStages.embedding || completedStages.encoder || completedStages.attention) && (
                      <>
                        <div className="encoder-layers">
                          {[1, 2, 3, 4, 5, 6].map((layerNum) => (
                            <div
                              key={layerNum}
                              className={`encoder-layer ${currentStep?.stage === 'encoder' && currentStep?.layer === layerNum ? 'active' : ''}`}
                            >
                              <div className="layer-label">Layer {layerNum}</div>
                              <div className="layer-components">
                                <div className="component">Self-Attn</div>
                                <div className="component">FFN</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* 显示当前或已完成的attention矩阵 */}
                        {(currentStep?.stage === 'attention' || completedStages.attention) && (
                          <div className="attention-visualization">
                            <div className="attention-label">Self-Attention 机制</div>
                            <div className="attention-matrix">
                              {(() => {
                                const tokens = currentStep?.stage === 'attention'
                                  ? currentStep?.tokens
                                  : (completedStages.attention?.tokens || completedStages.tokenize?.tokens);
                                return tokens?.slice(0, 5).map((token, i) => (
                                  <div key={i} className="attention-row">
                                    {tokens.slice(0, 5).map((_, j) => (
                                      <div
                                        key={j}
                                        className={`attention-cell ${i === j ? 'self' : Math.abs(i - j) <= 1 ? 'strong' : 'weak'}`}
                                        style={{ opacity: i === j ? 1 : Math.abs(i - j) <= 1 ? 0.7 : 0.3 }}
                                      >
                                        {i === j ? '1.0' : Math.abs(i - j) <= 1 ? '0.6' : '0.2'}
                                      </div>
                                    ))}
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Decoder Section */}
                  <div className="transformer-section decoder-section" ref={decoderSectionRef}>
                    <div className="section-label">Decoder</div>
                    {/* 显示当前步骤或已完成的Decoder阶段内容 */}
                    {(currentStep?.stage === 'decoder' || currentStep?.stage === 'output' || completedStages.decoder || completedStages.output) && (
                      <div className="decoder-output">
                        {(currentStep?.stage === 'output' && currentStep?.content) || completedStages.output?.content ? (
                          <div className="output-text">
                            {currentStep?.stage === 'output'
                              ? currentStep.content.split('\n').slice(1).join('\n')
                              : completedStages.output?.content.split('\n').slice(1).join('\n')}
                          </div>
                        ) : (
                          <div className="generating">生成中...</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Comparison Lines */}
                <div className="comparison-lines">
                  <div className={`comparison-line ${currentStep?.stage === 'input' || currentStep?.stage === 'tokenize' ? 'active' : ''}`}>
                    <div className="line-label">输入解析</div>
                  </div>
                  <div className={`comparison-line ${currentStep?.stage === 'embedding' || currentStep?.stage === 'encoder' ? 'active' : ''}`}>
                    <div className="line-label">处理执行</div>
                  </div>
                  <div className={`comparison-line ${currentStep?.stage === 'attention' ? 'active' : ''}`}>
                    <div className="line-label">关联检索</div>
                  </div>
                  <div className={`comparison-line ${currentStep?.stage === 'decoder' || currentStep?.stage === 'output' ? 'active' : ''}`}>
                    <div className="line-label">结果输出</div>
                  </div>
                </div>

                {/* Right: MySQL Architecture */}
                <div className="comparison-panel mysql-panel" ref={mysqlPanelRef}>
                  <div className="panel-header">
                    <div className="panel-icon">🗄️</div>
                    <div className="panel-title">MySQL 数据库</div>
                  </div>

                  {/* SQL Input Section */}
                  <div className="mysql-section sql-input-section" ref={sqlInputSectionRef}>
                    <div className="section-label">SQL输入</div>
                    {/* 显示当前步骤或已完成的SQL输入阶段内容 */}
                    {(currentStep?.sqlStage === 'sql-input' || currentStep?.sqlStage === 'sql-parse' || completedStages.sqlInput || completedStages.sqlParse) && (
                      <div className="sql-text">
                        {(currentStep?.sqlStage === 'sql-input' || currentStep?.sqlStage === 'sql-parse')
                          ? (currentStep?.sqlContent || 'SELECT * FROM users WHERE age > 25')
                          : ((completedStages.sqlParse || completedStages.sqlInput)?.sqlContent || 'SELECT * FROM users WHERE age > 25')}
                      </div>
                    )}
                    {/* 显示当前或已完成的SQL tokens */}
                    {((currentStep?.sqlStage === 'sql-parse' && currentStep?.sqlTokens) || completedStages.sqlParse?.sqlTokens) && (
                      <div className="sql-tokens-display">
                        {(currentStep?.sqlStage === 'sql-parse' ? currentStep.sqlTokens : completedStages.sqlParse.sqlTokens).map((token, i) => (
                          <span key={i} className="sql-token-item">{token}</span>
                        ))}
                      </div>
                    )}
                    {/* 显示SQL解析详情 */}
                    {((currentStep?.sqlStage === 'sql-parse' && currentStep?.sqlContent) || completedStages.sqlParse?.sqlContent) && (
                      <div className="sql-parse-detail">
                        {currentStep?.sqlStage === 'sql-parse' ? currentStep.sqlContent : completedStages.sqlParse.sqlContent}
                      </div>
                    )}
                  </div>

                  {/* SQL Execution Section */}
                  <div className="mysql-section sql-execute-section" ref={sqlExecuteSectionRef}>
                    <div className="section-label">查询执行</div>
                    {/* 显示当前步骤或已完成的SQL执行阶段内容 */}
                    {(currentStep?.sqlStage === 'sql-plan' || currentStep?.sqlStage === 'sql-execute' || currentStep?.sqlStage === 'sql-index' || completedStages.sqlPlan || completedStages.sqlExecute || completedStages.sqlIndex) && (
                      <>
                        <div className="sql-steps">
                          <div className={`sql-step ${currentStep?.sqlStage === 'sql-plan' ? 'active' : ''}`}>
                            <div className="step-icon">📋</div>
                            <div className="step-label">查询计划</div>
                            {/* 显示当前或已完成的查询计划 */}
                            {((currentStep?.sqlStage === 'sql-plan' && currentStep?.sqlContent) || completedStages.sqlPlan?.sqlContent) && (
                              <div className="step-detail">
                                {currentStep?.sqlStage === 'sql-plan' ? currentStep.sqlContent : completedStages.sqlPlan.sqlContent}
                              </div>
                            )}
                          </div>
                          <div className={`sql-step ${currentStep?.sqlStage === 'sql-execute' ? 'active' : ''}`}>
                            <div className="step-icon">⚙️</div>
                            <div className="step-label">执行引擎</div>
                            {/* 显示当前或已完成的执行引擎内容 */}
                            {((currentStep?.sqlStage === 'sql-execute' && currentStep?.sqlContent) || completedStages.sqlExecute?.sqlContent) && (
                              <div className="step-detail">
                                {currentStep?.sqlStage === 'sql-execute' ? currentStep.sqlContent : completedStages.sqlExecute.sqlContent}
                              </div>
                            )}
                          </div>
                          <div className={`sql-step ${currentStep?.sqlStage === 'sql-index' ? 'active' : ''}`}>
                            <div className="step-icon">🔍</div>
                            <div className="step-label">索引检索</div>
                            {/* 显示当前或已完成的索引检索内容 */}
                            {((currentStep?.sqlStage === 'sql-index' && currentStep?.sqlContent) || completedStages.sqlIndex?.sqlContent) && (
                              <div className="step-detail">
                                {currentStep?.sqlStage === 'sql-index' ? currentStep.sqlContent : completedStages.sqlIndex.sqlContent}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* SQL Result Section */}
                  <div className="mysql-section sql-result-section" ref={sqlResultSectionRef}>
                    <div className="section-label">查询结果</div>
                    {/* 显示当前步骤或已完成的SQL结果阶段内容 */}
                    {(currentStep?.sqlStage === 'sql-retrieve' || currentStep?.sqlStage === 'sql-result' || completedStages.sqlRetrieve || completedStages.sqlResult) && (
                      <div className="sql-result-output">
                        {(currentStep?.sqlStage === 'sql-result' && currentStep?.sqlContent) || completedStages.sqlResult?.sqlContent ? (
                          <div className="result-text">
                            {currentStep?.sqlStage === 'sql-result' ? currentStep.sqlContent : completedStages.sqlResult.sqlContent}
                          </div>
                        ) : (
                          <div className="retrieving">检索中...</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : mode === 'deepresearch' ? (
              /* Multi-Agent Visualization */
              <div className="multi-agent-visualization">
                {['research', 'data', 'analyze', 'report'].map((agentId, index) => {
                  const agentInfo = {
                    research: { name: '研究Agent', icon: '🔍', color: '#00f2fe' },
                    data: { name: '数据Agent', icon: '📊', color: '#4caf50' },
                    analyze: { name: '分析Agent', icon: '🧠', color: '#ff9800' },
                    report: { name: '报告Agent', icon: '📄', color: '#9c27b0' }
                  }[agentId];

                  const isActive = currentStep?.agent === agentId;
                  const isUsingTool = isActive && (currentStep?.type === 'decision-action' || currentStep?.type === 'observation') && currentStep?.tool;
                  const activeTool = isUsingTool ? currentStep.tool :
                    (isActive && agentId === 'report' && ['write', 'report'].includes(currentStep.tool)) ? currentStep.tool : null;

                  // Hack: force report agent to use tools if specified in step
                  const forceShowTools = agentId === 'report' && (currentStep?.tool === 'write' || currentStep?.tool === 'report');
                  const finalAgentTools = forceShowTools ? AGENT_TOOLS['report'] : (AGENT_TOOLS[agentId] || []);
                  const showTools = (isUsingTool || forceShowTools) && finalAgentTools.length > 0;

                  const angle = index * 90 - 90; // Start from top
                  const rad = (angle * Math.PI) / 180;
                  const x = 150 * Math.cos(rad);
                  const y = 150 * Math.sin(rad);

                  return (
                    <div
                      key={agentId}
                      className="agent-container"
                      style={{
                        transform: `translate(calc(50% + ${x}px - 50px), calc(50% + ${y}px - 50px))`,
                        '--agent-color': agentInfo.color
                      }}
                    >
                      {/* Agent Node */}
                      <div className={`multi-agent-node ${isActive ? 'active' : ''} ${isUsingTool ? 'using-tool' : ''}`}>
                        <div className="agent-icon">{agentInfo.icon}</div>
                        <div className="agent-name">{agentInfo.name}</div>
                        {isActive && (
                          <div className="agent-status">
                            {currentStep?.type === 'period-thought' && '💭 思考中'}
                            {currentStep?.type === 'decision-action' && '⚡ 执行中'}
                            {currentStep?.type === 'observation' && '👁️ 观察中'}
                          </div>
                        )}
                      </div>

                      {/* Agent Tools Orbit - Only show when agent is using a tool */}
                      {showTools && (
                        <>
                          <div className="agent-tools-orbit">
                            {finalAgentTools.map((tool) => {
                              const toolRad = (tool.angle * Math.PI) / 180;
                              const toolX = 120 * Math.cos(toolRad);
                              const toolY = 120 * Math.sin(toolRad);
                              const isToolActive = activeTool === tool.id;

                              return (
                                <div
                                  key={tool.id}
                                  className={`agent-tool-node ${isToolActive ? 'active' : ''}`}
                                  style={{
                                    transform: `translate(${toolX}px, ${toolY}px)`
                                  }}
                                >
                                  <span className="agent-tool-icon">{tool.icon}</span>
                                  <span className="agent-tool-label">{tool.label}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Tool Connection Beam */}
                          <svg className="agent-tool-beams" width="300" height="300" viewBox="0 0 300 300">
                            <defs>
                              {finalAgentTools.map((tool) => {
                                if (activeTool !== tool.id) return null;
                                const isObs = currentStep?.type === 'observation';
                                return (
                                  <marker key={tool.id} id={`agent-arrow-${agentId}-${tool.id}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                                    <polygon points="0 0, 10 3, 0 6" fill={isObs ? "#4caf50" : agentInfo.color} />
                                  </marker>
                                );
                              })}
                            </defs>
                            {finalAgentTools.map((tool) => {
                              if (activeTool !== tool.id) return null;

                              const toolRad = (tool.angle * Math.PI) / 180;
                              const toolX = 80 * Math.cos(toolRad);
                              const toolY = 80 * Math.sin(toolRad);
                              // Agent center is at (50, 50) in the container, which is (100, 100) in the 200x200 SVG
                              const cx = 150;
                              const cy = 150;

                              // Tool position: center + offset
                              const tx = cx + toolX;
                              const ty = cy + toolY;

                              const isObs = currentStep?.type === 'observation';

                              return (
                                <g key={tool.id}>
                                  <line
                                    x1={cx}
                                    y1={cy}
                                    x2={tx}
                                    y2={ty}
                                    stroke={isObs ? "#4caf50" : agentInfo.color}
                                    strokeWidth="3"
                                    strokeDasharray="6,4"
                                    markerEnd={`url(#agent-arrow-${agentId}-${tool.id})`}
                                    className="agent-beam-line"
                                  />
                                  <circle r="6" fill={isObs ? "#4caf50" : agentInfo.color} className="agent-beam-pulse">
                                    <animateMotion
                                      path={`M ${isObs ? tx : cx} ${isObs ? ty : cy} L ${isObs ? cx : tx} ${isObs ? cy : ty}`}
                                      dur="1s"
                                      repeatCount="indefinite"
                                    />
                                  </circle>
                                </g>
                              );
                            })}
                          </svg>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Agent Communication Lines */}
                {currentStep?.type === 'agent-communication' && (
                  <svg className="agent-communication-svg" width="600" height="600" viewBox="0 0 600 600">
                    {(() => {
                      const agentList = ['research', 'data', 'analyze', 'report'];
                      const fromIndex = agentList.indexOf(currentStep?.fromAgent || '');
                      const toIndex = agentList.indexOf(currentStep?.toAgent || '');
                      if (fromIndex === -1 || toIndex === -1) return null;

                      const fromRad = (fromIndex * 90 - 90) * Math.PI / 180;
                      const toRad = (toIndex * 90 - 90) * Math.PI / 180;
                      const r = 150;
                      const cx = 300;
                      const cy = 300;
                      const fromX = cx + r * Math.cos(fromRad);
                      const fromY = cy + r * Math.sin(fromRad);
                      const toX = cx + r * Math.cos(toRad);
                      const toY = cy + r * Math.sin(toRad);

                      return (
                        <g key={`${fromIndex}-${toIndex}`}>
                          <defs>
                            <marker id="comm-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill="#9c27b0" />
                            </marker>
                          </defs>
                          <line
                            x1={fromX}
                            y1={fromY}
                            x2={toX}
                            y2={toY}
                            stroke="#9c27b0"
                            strokeWidth="3"
                            strokeDasharray="6,4"
                            markerEnd="url(#comm-arrowhead)"
                            className="communication-line"
                          />
                          <circle r="8" fill="#9c27b0" className="communication-pulse">
                            <animateMotion
                              path={`M ${fromX} ${fromY} L ${toX} ${toY}`}
                              dur="1.5s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </g>
                      );
                    })()}
                  </svg>
                )}

                {/* Central Coordinator */}
                <div className="agent-coordinator">
                  <div className="coordinator-icon">🎯</div>
                  <div className="coordinator-label">协调中心</div>
                </div>
              </div>
            ) : mode === 'rag' ? (
              /* RAG Visualization - Central Stage */
              <div className="rag-visualization">
                <div className="rag-flow-container">
                  {/* Step 1: 数据切片 */}
                  <div className={`rag-flow-step ${['document', 'chunking', 'embedding'].includes(currentStep?.stage) ? 'active' : ''}`}>
                    <div className="rag-step-icon">✂️</div>
                    <div className="rag-step-label">数据切片</div>
                    {currentStep?.stage === 'document' && (
                      <div className="rag-step-status">加载文档中...</div>
                    )}
                    {currentStep?.stage === 'chunking' && (
                      <div className="rag-step-chunks">
                        <div className="rag-chunk-item">Chunk 1</div>
                        <div className="rag-chunk-item">Chunk 2</div>
                        <div className="rag-chunk-item">Chunk 3</div>
                      </div>
                    )}
                    {currentStep?.stage === 'embedding' && (
                      <div className="rag-step-status">向量化中...</div>
                    )}
                  </div>

                  <div className="rag-connector">
                    {['embedding', 'indexing'].includes(currentStep?.stage) && <div className="rag-flow-particle"></div>}
                  </div>

                  {/* Step 2: 数据入库 */}
                  <div className={`rag-flow-step ${['indexing', 'query'].includes(currentStep?.stage) ? 'active' : ''}`}>
                    <div className="rag-step-icon">🗄️</div>
                    <div className="rag-step-label">数据入库</div>
                    {currentStep?.stage === 'indexing' && (
                      <div className="rag-step-status">向量索引构建中...</div>
                    )}
                    {currentStep?.stage === 'query' && (
                      <div className="rag-step-status">查询向量化中...</div>
                    )}
                  </div>

                  <div className="rag-connector">
                    {['retrieval', 'recall'].includes(currentStep?.stage) && <div className="rag-flow-particle"></div>}
                  </div>

                  {/* Step 3: 数据召回 */}
                  <div className={`rag-flow-step ${currentStep?.stage === 'retrieval' || currentStep?.stage === 'recall' ? 'active' : ''}`}>
                    <div className="rag-step-icon">🔍</div>
                    <div className="rag-step-label">数据召回</div>
                    {currentStep?.stage === 'retrieval' && (
                      <div className="rag-step-status">相似度计算中...</div>
                    )}
                    {currentStep?.stage === 'recall' && (
                      <div className="rag-step-chunks">
                        <div className="rag-chunk-item active">Chunk 1</div>
                        <div className="rag-chunk-item active">Chunk 2</div>
                        <div className="rag-chunk-item active">Chunk 3</div>
                      </div>
                    )}
                  </div>

                  <div className="rag-connector">
                    {['multi-recall'].includes(currentStep?.stage) && <div className="rag-flow-particle"></div>}
                  </div>

                  {/* Step 4: 多路召回 */}
                  <div className={`rag-flow-step ${currentStep?.stage === 'multi-recall' ? 'active' : ''}`} style={{ minWidth: '200px', maxWidth: '220px' }}>
                    <div className="rag-step-icon">🔄</div>
                    <div className="rag-step-label">多路召回</div>
                    {currentStep?.stage === 'multi-recall' && (
                      <div className="rag-multi-routes">
                        <div className="rag-kb-group">
                          <div className="rag-kb-title">📚 知识库1: Policy DB</div>
                          <div className="rag-route">路线1: 向量检索</div>
                          <div className="rag-route">路线2: 关键词匹配</div>
                        </div>
                        <div className="rag-kb-group">
                          <div className="rag-kb-title">📚 知识库2: HR DB</div>
                          <div className="rag-route">路线1: 向量检索</div>
                          <div className="rag-route">路线2: 语义检索</div>
                        </div>
                        <div className="rag-kb-group">
                          <div className="rag-kb-title">📚 知识库3: Tech DB</div>
                          <div className="rag-route">路线1: 混合检索</div>
                          <div className="rag-route">路线2: 向量检索</div>
                        </div>
                        <div style={{ marginTop: '6px', padding: '4px', background: 'rgba(0, 242, 254, 0.15)', borderRadius: '4px', fontSize: '0.65rem', textAlign: 'center', color: 'var(--primary-color)' }}>
                          总计: 6路召回
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rag-connector">
                    {['merge'].includes(currentStep?.stage) && <div className="rag-flow-particle"></div>}
                  </div>

                  {/* Step 5: 数据合并 */}
                  <div className={`rag-flow-step ${currentStep?.stage === 'merge' ? 'active' : ''}`}>
                    <div className="rag-step-icon">🔗</div>
                    <div className="rag-step-label">数据合并</div>
                    {currentStep?.stage === 'merge' && (
                      <div className="rag-step-status">合并去重排序中...</div>
                    )}
                  </div>

                  <div className="rag-connector">
                    {['context', 'generation', 'structured-output'].includes(currentStep?.stage) && <div className="rag-flow-particle"></div>}
                  </div>

                  {/* Step 6: 结构化输出 */}
                  <div className={`rag-flow-step ${currentStep?.stage === 'context' || currentStep?.stage === 'generation' || currentStep?.stage === 'structured-output' ? 'active' : ''}`}>
                    <div className="rag-step-icon">📊</div>
                    <div className="rag-step-label">结构化输出</div>
                    {currentStep?.stage === 'context' && (
                      <div className="rag-step-status">构建上下文中...</div>
                    )}
                    {currentStep?.stage === 'generation' && (
                      <div className="rag-step-status">LLM 生成中...</div>
                    )}
                    {currentStep?.stage === 'structured-output' && (
                      <div className="rag-step-status">✓ 输出完成</div>
                    )}
                  </div>
                </div>
              </div>
            ) : mode === 'mcp' ? (
              /* MCP Principle Visualization */
              <div className="mcp-principle-visualization">
                {/* Context Panel */}
                {(currentStep?.type === 'mcp-context-prepare' || currentStep?.type === 'mcp-context-show') && (
                  <div className="mcp-context-panel">
                    <div className="context-header">
                      <div className="context-icon">📝</div>
                      <div className="context-title">上下文提示词</div>
                    </div>
                    <div className="context-content">
                      {currentStep?.type === 'mcp-context-show' && currentStep?.tools && (
                        <div className="tools-description">
                          <div className="tools-intro">系统提示词（包含工具描述）：</div>
                          <div className="tools-list">
                            {currentStep.tools.map((tool, index) => (
                              <div key={index} className="tool-description-item">
                                <div className="tool-name">{index + 1}. {tool.name}</div>
                                <div className="tool-desc">{tool.description}</div>
                                <div className="tool-params">参数: {JSON.stringify(tool.parameters)}</div>
                              </div>
                            ))}
                          </div>
                          <div className="user-request">用户请求：{currentStep.content.split('\n').pop()}</div>
                        </div>
                      )}
                      {currentStep?.type === 'mcp-context-prepare' && (
                        <div className="preparing-context">正在准备上下文提示词...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* LLM and MCP Server Visualization */}
                <div className="mcp-interaction-container">
                  {/* LLM Core */}
                  <div className={`mcp-llm-core ${currentStep?.type === 'mcp-llm-process' || currentStep?.type === 'mcp-llm-receive' || currentStep?.type === 'mcp-llm-finalize' ? 'active' : ''}`}>
                    <div className="llm-icon">🤖</div>
                    <div className="llm-label">大语言模型</div>
                    {currentStep?.type === 'mcp-llm-process' && (
                      <div className="llm-status">分析请求中...</div>
                    )}
                    {currentStep?.type === 'mcp-llm-receive' && (
                      <div className="llm-status">接收结果中...</div>
                    )}
                    {currentStep?.type === 'mcp-llm-finalize' && (
                      <div className="llm-status">生成回复中...</div>
                    )}
                  </div>

                  {/* Tools Orbit */}
                  {currentStep?.type === 'mcp-tool-call' && (
                    <div className="mcp-tools-orbit">
                      {MCP_TOOLS.map((tool) => {
                        const rad = (tool.angle * Math.PI) / 180;
                        const x = 180 * Math.cos(rad);
                        const y = 180 * Math.sin(rad);
                        const isActive = activeTool === tool.id;
                        const scale = isActive ? 1.2 : 1;

                        return (
                          <div
                            key={tool.id}
                            className={`mcp-tool-node ${isActive ? 'active' : ''}`}
                            style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
                          >
                            <span className="tool-icon">{tool.icon}</span>
                            <span className="tool-label">{tool.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Connection SVG */}
                  {(currentStep?.type === 'mcp-tool-call' || currentStep?.type === 'mcp-server-receive' || currentStep?.type === 'mcp-server-execute' || currentStep?.type === 'mcp-server-response') && (
                    <svg className="mcp-connection-svg" width="600" height="400" viewBox="0 0 600 400">
                      <defs>
                        <marker id="mcp-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#9c27b0" />
                        </marker>
                      </defs>
                      {/* LLM to MCP Server */}
                      <line
                        x1="100"
                        y1="200"
                        x2="500"
                        y2="200"
                        stroke={currentStep?.type === 'mcp-tool-call' ? "#9c27b0" : currentStep?.type === 'mcp-server-response' ? "#4caf50" : "rgba(156, 39, 176, 0.3)"}
                        strokeWidth="3"
                        strokeDasharray="8,4"
                        markerEnd="url(#mcp-arrow)"
                        className="mcp-connection-line"
                      />
                      {currentStep?.type === 'mcp-tool-call' && (
                        <circle r="8" fill="#9c27b0" className="mcp-pulse-circle">
                          <animateMotion path="M 100 200 L 500 200" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {currentStep?.type === 'mcp-server-response' && (
                        <circle r="8" fill="#4caf50" className="mcp-pulse-circle">
                          <animateMotion path="M 500 200 L 100 200" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </svg>
                  )}

                  {/* MCP Server */}
                  <div className={`mcp-server-core ${currentStep?.type === 'mcp-server-receive' || currentStep?.type === 'mcp-server-execute' || currentStep?.type === 'mcp-server-response' ? 'active' : ''}`}>
                    <div className="mcp-server-icon">🔌</div>
                    <div className="mcp-server-label">MCP服务器</div>
                    {currentStep?.type === 'mcp-server-receive' && (
                      <div className="mcp-server-stage">
                        <div className="stage-item active">1. 接收请求</div>
                        <div className="stage-item">2. 验证参数</div>
                        <div className="stage-item">3. 路由处理</div>
                      </div>
                    )}
                    {currentStep?.type === 'mcp-server-execute' && (
                      <div className="mcp-server-stage">
                        <div className="stage-item completed">1. 接收请求</div>
                        <div className="stage-item completed">2. 验证参数</div>
                        <div className="stage-item active">3. 执行工具</div>
                      </div>
                    )}
                    {currentStep?.type === 'mcp-server-response' && (
                      <div className="mcp-server-stage">
                        <div className="stage-item completed">1. 接收请求</div>
                        <div className="stage-item completed">2. 验证参数</div>
                        <div className="stage-item completed">3. 执行工具</div>
                        <div className="stage-item active">4. 返回结果</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tool Call Details */}
                {currentStep?.type === 'mcp-tool-call' && (
                  <div className="mcp-tool-call-details">
                    <div className="tool-call-header">工具调用请求</div>
                    <div className="tool-call-content">
                      <pre>{currentStep.content}</pre>
                    </div>
                  </div>
                )}

                {/* Server Response Details */}
                {currentStep?.type === 'mcp-server-response' && (
                  <div className="mcp-server-response-details">
                    <div className="response-header">工具执行结果</div>
                    <div className="response-content">
                      <pre>{currentStep.content}</pre>
                    </div>
                  </div>
                )}
              </div>
            ) : mode === 'react' || mode === 'text2sql' ? (
              <>
                {/* Tools Orbit */}
                <div className="tools-orbit">
                  {(mode === 'react' ? TOOLS : TEXT2SQL_TOOLS).map((tool) => {
                    const rad = (tool.angle * Math.PI) / 180;
                    const x = 180 * Math.cos(rad);
                    const y = 180 * Math.sin(rad);
                    const isActive = activeTool === tool.id;
                    const scale = isActive ? 1.2 : 1;

                    return (
                      <div
                        key={tool.id}
                        className={`tool-node ${isActive ? 'active' : ''}`}
                        style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
                      >
                        <span className="tool-icon">{tool.icon}</span>
                        <span className="tool-label">{tool.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Beams */}
                <svg className="beams-svg" width="600" height="600" viewBox="0 0 600 600">
                  {(mode === 'react' ? TOOLS : mode === 'text2sql' ? TEXT2SQL_TOOLS : DEEPRESEARCH_TOOLS).map(tool => {
                    const isActive = activeTool === tool.id;
                    // Always render SVG but control visibility via opacity or line checks
                    if (!isActive) return null;

                    const rad = (tool.angle * Math.PI) / 180;
                    // Center is 300,300 in CSS terms
                    const cx = 300;
                    const cy = 300;
                    const r = 180; // Must match orbit R

                    // Target
                    const tx = cx + r * Math.cos(rad);
                    const ty = cy + r * Math.sin(rad);

                    const isObs = currentStep?.type === 'observation';

                    return (
                      <g key={tool.id}>
                        <line x1={cx} y1={cy} x2={tx} y2={ty}
                          stroke={isObs ? "#4caf50" : "#00f2fe"}
                          strokeWidth="3" strokeDasharray="6,4" className="beam-line" />
                        <circle r="6" fill={isObs ? "#4caf50" : "#00f2fe"}>
                          <animateMotion path={`M ${isObs ? tx : cx} ${isObs ? ty : cy} L ${isObs ? cx : tx} ${isObs ? cy : ty}`}
                            dur="0.8s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    )
                  })}
                </svg>

                {/* Core */}
                <div className={`agent-core ${isThinking ? 'thinking' : ''}`}>
                  <div className="core-inner"></div>
                  <div className="core-ring"></div>
                </div>

                <div className="status-label">
                  {currentStep && (
                    <span className={`badge ${currentStep.type}`}>
                      {currentStep.type.toUpperCase().replace('PERIOD-', '').replace('DECISION-', '')}
                    </span>
                  )}
                </div>

                {/* MCP Call Animation for DeepResearch mode */}
                {mode === 'deepresearch' && (currentStep?.type === 'decision-action' || currentStep?.type === 'observation') && currentStep?.tool === 'mcp' && (
                  <div className="mcp-animation-overlay">
                    <div className="mcp-server">
                      <div className="mcp-server-icon">🔌</div>
                      <div className="mcp-server-label">MCP Server</div>
                      {currentStep?.mcpServer && (
                        <div className="mcp-server-name">{currentStep.mcpServer}</div>
                      )}
                      {currentStep?.mcpResource && (
                        <div className="mcp-resource">Resource: {currentStep.mcpResource}</div>
                      )}
                    </div>
                    <svg className="mcp-connection" width="500" height="300" viewBox="0 0 500 300">
                      <defs>
                        <marker id="mcp-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#9c27b0" />
                        </marker>
                        <linearGradient id="mcp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9c27b0" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#673ab7" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      <line
                        x1="50"
                        y1="150"
                        x2="450"
                        y2="150"
                        stroke={currentStep?.type === 'observation' ? "#4caf50" : "url(#mcp-gradient)"}
                        strokeWidth="4"
                        strokeDasharray="10,5"
                        markerEnd="url(#mcp-arrowhead)"
                        className="mcp-line"
                      />
                      {currentStep?.type === 'decision-action' && (
                        <circle r="10" fill="#9c27b0" className="mcp-pulse">
                          <animateMotion path="M 50 150 L 450 150" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {currentStep?.type === 'observation' && (
                        <circle r="10" fill="#4caf50" className="mcp-pulse">
                          <animateMotion path="M 450 150 L 50 150" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {/* Protocol indicator */}
                      <text x="250" y="140" textAnchor="middle" fill="#9c27b0" fontSize="12" fontWeight="bold" opacity="0.7">
                        MCP Protocol
                      </text>
                    </svg>
                    <div className="llm-core">
                      <div className="llm-icon">🤖</div>
                      <div className="llm-label">智能体</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Normal Mode: LLM Visualization with REST API */
              <div className="llm-visualization">
                {/* REST API Call Animation */}
                {(currentStep?.type === 'rest-api' || currentStep?.type === 'rest-response') && (
                  <div className="rest-api-animation">
                    <div className="api-server">
                      <div className="server-icon">🌐</div>
                      <div className="server-label">外部API</div>
                      {currentStep?.apiUrl && (
                        <div className="api-url">{currentStep.apiUrl}</div>
                      )}
                    </div>
                    <svg className="api-connection" width="400" height="200" viewBox="0 0 400 200">
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#ff9800" />
                        </marker>
                      </defs>
                      <line
                        x1="50"
                        y1="100"
                        x2="350"
                        y2="100"
                        stroke={currentStep?.type === 'rest-response' ? "#4caf50" : "#ff9800"}
                        strokeWidth="3"
                        strokeDasharray="8,4"
                        markerEnd="url(#arrowhead)"
                        className="api-line"
                      />
                      {currentStep?.type === 'rest-api' && (
                        <circle r="8" fill="#ff9800" className="api-pulse">
                          <animateMotion path="M 50 100 L 350 100" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {currentStep?.type === 'rest-response' && (
                        <circle r="8" fill="#4caf50" className="api-pulse">
                          <animateMotion path="M 350 100 L 50 100" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </svg>
                    <div className="llm-core">
                      <div className="llm-icon">🤖</div>
                      <div className="llm-label">大语言模型</div>
                    </div>
                  </div>
                )}

                {/* LLM Processing Animation */}
                {currentStep?.type === 'llm' && (
                  <div className="llm-core processing">
                    <div className="llm-icon">🤖</div>
                    <div className="llm-label">大语言模型</div>
                    <div className="processing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                {/* Default/Other States */}
                {!['rest-api', 'rest-response', 'llm'].includes(currentStep?.type || '') && (
                  <div className={`llm-core ${currentStep?.type === 'llmout' ? 'completed' : ''}`}>
                    <div className="llm-icon">🤖</div>
                    <div className="llm-label">大语言模型</div>
                  </div>
                )}

                <div className="llm-status">
                  {currentStep && (
                    <span className={`badge ${currentStep.type}`}>
                      {currentStep.type.toUpperCase().replace('REST-', '')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Chat Interface */}
          {mode !== 'transformer' && mode !== 'mcp' && (
            <div className="chat-interface">
              <div className="chat-messages">
                {chatMessages.length === 0 && <div className="empty-chat">Waiting for user input...</div>}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.type}`}>
                    <div className="bubble-avatar">
                      {msg.type === 'human' || msg.type === 'rest' ? '👤' : '🤖'}
                    </div>
                    <div className="bubble-content">{msg.content}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}
        </section>

        {/* RIGHT: INTERNAL TRACE (The "Brain") */}
        <section className="trace-panel">
          <div className="trace-header">
            <h3>Internal Monologue & Execution Trace</h3>
            <span className="live-indicator">{isRunning ? '● LIVE' : '○ IDLE'}</span>
          </div>
          <div className="trace-feed">
            {traceLogs.map((log, i) => (
              <div key={i} className={`trace-item ${log.type} ${log.type === 'rag-process' && log.stage ? `rag-${log.stage}` : ''}`}>
                <div className="trace-meta">
                  {log.type === 'period-thought' && <span className="trace-icon">💭</span>}
                  {log.type === 'decision-action' && <span className="trace-icon">⚡</span>}
                  {log.type === 'observation' && <span className="trace-icon">👁️</span>}
                  {log.type === 'human' && <span className="trace-icon">🗣️</span>}
                  {log.type === 'finish' && <span className="trace-icon">🏁</span>}
                  {log.type === 'rest' && <span className="trace-icon">📥</span>}
                  {log.type === 'rest-api' && <span className="trace-icon">🌐</span>}
                  {log.type === 'rest-response' && <span className="trace-icon">📡</span>}
                  {log.type === 'llm' && <span className="trace-icon">🤖</span>}
                  {log.type === 'llmout' && <span className="trace-icon">📤</span>}
                  {log.type === 'mcp-context-prepare' && <span className="trace-icon">📝</span>}
                  {log.type === 'mcp-context-show' && <span className="trace-icon">📋</span>}
                  {log.type === 'mcp-llm-process' && <span className="trace-icon">🤖</span>}
                  {log.type === 'mcp-tool-call' && <span className="trace-icon">🔧</span>}
                  {log.type === 'mcp-server-receive' && <span className="trace-icon">📥</span>}
                  {log.type === 'mcp-server-execute' && <span className="trace-icon">⚙️</span>}
                  {log.type === 'mcp-server-response' && <span className="trace-icon">📤</span>}
                  {log.type === 'mcp-llm-receive' && <span className="trace-icon">📥</span>}
                  {log.type === 'mcp-llm-finalize' && <span className="trace-icon">✅</span>}
                  {log.type === 'skill-file-read' && <span className="trace-icon">📄</span>}
                  {log.type === 'skill-context-prepare' && <span className="trace-icon">📝</span>}
                  {log.type === 'skill-context-show' && <span className="trace-icon">📋</span>}
                  {log.type === 'skill-register' && <span className="trace-icon">✅</span>}
                  {log.type === 'lifecycle-intro' && <span className="trace-icon">🎯</span>}
                  {log.type === 'llm-think' && <span className="trace-icon">💭</span>}
                  {log.type === 'llm-call' && <span className="trace-icon">🔧</span>}
                  {log.type === 'local-exec' && <span className="trace-icon">⚙️</span>}
                  {log.type === 'skill-result' && <span className="trace-icon">📤</span>}
                  {log.type === 'llm-final' && <span className="trace-icon">✅</span>}
                  {log.type === 'rag-intro' && <span className="trace-icon">📚</span>}
                  {log.type === 'rag-process' && (
                    log.stage === 'document' ? <span className="trace-icon">📄</span> :
                      log.stage === 'chunking' ? <span className="trace-icon">✂️</span> :
                        log.stage === 'embedding' ? <span className="trace-icon">🔢</span> :
                          log.stage === 'indexing' ? <span className="trace-icon">🗄️</span> :
                            log.stage === 'query' ? <span className="trace-icon">❓</span> :
                              log.stage === 'retrieval' ? <span className="trace-icon">🔍</span> :
                                log.stage === 'recall' ? <span className="trace-icon">📥</span> :
                                  log.stage === 'multi-recall' ? <span className="trace-icon">🔄</span> :
                                    log.stage === 'merge' ? <span className="trace-icon">🔗</span> :
                                      log.stage === 'context' ? <span className="trace-icon">📝</span> :
                                        log.stage === 'generation' ? <span className="trace-icon">🤖</span> :
                                          log.stage === 'structured-output' ? <span className="trace-icon">📊</span> :
                                            <span className="trace-icon">⚙️</span>
                  )}
                  <span className="step-type">
                    {log.type === 'rag-process' && log.stage ?
                      log.stage === 'document' ? 'DOCUMENT' :
                        log.stage === 'chunking' ? 'CHUNKING' :
                          log.stage === 'embedding' ? 'EMBEDDING' :
                            log.stage === 'indexing' ? 'INDEXING' :
                              log.stage === 'query' ? 'QUERY' :
                                log.stage === 'retrieval' ? 'RETRIEVAL' :
                                  log.stage === 'recall' ? 'RECALL' :
                                    log.stage === 'multi-recall' ? 'MULTI-RECALL' :
                                      log.stage === 'merge' ? 'MERGE' :
                                        log.stage === 'context' ? 'CONTEXT' :
                                          log.stage === 'generation' ? 'GENERATION' :
                                            log.stage === 'structured-output' ? 'STRUCTURED-OUTPUT' :
                                              'RAG-PROCESS' :
                      log.type.replace('period-', '').replace('decision-', '').replace('mcp-', '').replace('rag-', '').toUpperCase()}
                  </span>
                  {log.iteration && (
                    <span className="iteration-tag">循环 #{log.iteration}</span>
                  )}
                </div>
                {log.prompt && (
                  <div className="trace-prompt">
                    <span className="prompt-label">提示词:</span>
                    <span className="prompt-text">{log.prompt}</span>
                  </div>
                )}
                <div className="trace-content">
                  {log.type === 'decision-action' || log.type === 'mcp-tool-call' ? (
                    <code className="active-code">&gt; {log.content}</code>
                  ) : log.type === 'rag-process' && log.stage ? (
                    <div className="text-content">
                      {log.content}
                      {log.stage === 'multi-recall' && (
                        <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '6px', fontSize: '0.85rem' }}>
                          <strong>多知识库召回结果：</strong>
                          <div style={{ marginTop: '6px' }}>
                            <div>📚 知识库1 (Policy DB): 2条路线 → 4个Chunk</div>
                            <div>📚 知识库2 (HR DB): 2条路线 → 3个Chunk</div>
                            <div>📚 知识库3 (Tech DB): 2条路线 → 3个Chunk</div>
                            <div style={{ marginTop: '6px', color: 'var(--primary-color)' }}>总计: 6路召回 → 10个候选Chunk</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-content">{log.content}</div>
                  )}
                  {log.tool && <span className="tool-tag">Tool: {log.tool}</span>}
                  {log.tools && (
                    <div className="tools-list-trace">
                      {log.tools.map((tool, idx) => (
                        <div key={idx} className="tool-item-trace">
                          <strong>{tool.name}</strong>: {tool.description}
                        </div>
                      ))}
                    </div>
                  )}
                  {log.apiUrl && <span className="api-tag">API: {log.apiUrl}</span>}
                  {log.mcpServer && (
                    <span className="mcp-tag">
                      MCP Server: {log.mcpServer}
                      {log.mcpResource && ` | Resource: ${log.mcpResource}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={traceEndRef} />
          </div>
        </section>

      </div>
    </div>
  )
}

export default App
