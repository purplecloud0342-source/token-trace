export const TRANSLATIONS = {
  zh: {
    title: "TOKEN TRACE",
    water_ticker: "全球AI查询累计耗水 (2025.1.1 至今):",
    billion_liters: "亿升",
    header: {
      title: "THE INVISIBLE COST OF AI",
      nav_tokens: "Tokens",
      nav_footprint: "Footprint",
      nav_labor: "Labor",
      nav_myths: "Myths",
      nav_action: "Action"
    },
    hero: {
      label: "一场沉浸式的数字散文",
      title: "每一条 Prompt 都有隐形成本。",
      desc: "你向 AI 问了一个问题。在你看不见的地方，这次看似轻盈的对话消耗了电、水、碳——以及人类的劳动。跟随一次查询，从 Token 到地球。",
      placeholder: "问 AI 任何事... 例如：'用一句话解释量子纠缠。'",
      model_label: "选择模型 / SELECT MODEL",
      btn_send_gemini: "发送至 Gemini 3 Flash",
      btn_send_deepseek: "查阅 DeepSeek-R1 (估算)",
      helper: "提交问题以揭秘其隐形消耗...",
      footer_quote: "一个正在消失的湖泊，换取了一次查询的冷却。",
      external_tokenizer: "在 Tiktokenizer 中打开 DeepSeek-R1 详情"
    },
    stats: {
      tokens: "TOTAL TOKENS",
      energy: "ENERGY",
      water: "WATER",
      carbon: "CARBON",
      labor: "LABOR"
    },
    section_1: {
      title: "第一站：Token — AI 语言的原子",
      subtitle: "AI 并不直接阅读汉字或英文单词。你的句子首先会被粉碎成微小的符号单位，称为 Token（令牌）—— 它们是模型拼凑回复所需的拼图碎片。",
      demo_label: "感受拆解 / FEEL THE SPLIT",
      demo_prompt: "输入任何句子，看看模型是如何将其切碎的。",
      your_sentence: "你的句子 / YOUR SENTENCE",
      tokens_stat: "TOKENS",
      words_stat: "词数 / WORDS",
      chars_no_spaces_stat: "字符数 (不含空格) / CHARS (NO SPACES)",
      total_chars_stat: "总字符数 / TOTAL CHARS",
      bpe_desc: "英文：1 个 Token 约等于 4 个英文字母或 0.75 个英文单词。1 个 Token ≈ 1.5-2 个汉字。",
      table_title: "按任务类型估算的 Token 成本",
      table_col_task: "任务",
      table_col_tokens: "典型 TOKEN 消耗",
      table_col_driver: "核心成本驱动力",
      tasks: [
        { name: "短选择题 (MCQ)", tokens: "1–10", driver: "微乎其微" },
        { name: "自由问答 (Explanation)", tokens: "50–300", driver: "输出长度" },
        { name: "复杂推理 (CoT)", tokens: "200–1000+", driver: "思维链长度" },
        { name: "图像生成 (Image Gen)", tokens: "256–4096", driver: "视觉 Token / 分辨率" }
      ],
      logic_final: "最终链路：更长的回复 → 更多 Token → 更高能耗 ↑，更高耗水 ↑，更高碳排放 ↑",
    },
    section_2: {
      title: "第二站 — 谁在为 AI 买单",
      subtitle: "聚光灯外的算力竞赛",
      training_title: "训练阶段：巨大的单次投入",
      training_desc: "训练大语言模型确实极其耗能。GPT-4 拥有约 1.8 万亿参数，在训练期间消耗了约 24 亿千瓦时的电力。国际能源署（IEA）预测，到 2026 年，AI 的电力需求每年可能超过 1,000 太瓦时，几乎相当于日本的全年耗电量。",
      inference_title: "推理阶段：‘长尾’累积效应",
      inference_desc: "单次 AI 查询所消耗的资源极小。每次 ChatGPT 查询消耗约 0.000085 加仑水（约 1/15 茶匙）。然而，每天超过 10 亿次查询，总用水量达到约 322,000 升——相当于一个小镇的日用水量。",
      inference_audit: "推理阶段——即响应查询的过程——现在累积的能耗已超过训练阶段。Mistral AI 的审计报告指出，推理占全生命周期碳排放的 85% 以上。可以这样理解：训练是建造工厂；推理是工厂每天运行——累积成本最终会远超初始建设成本。",
      mistral_case_title: "案例分析：Mistral Large 2 审计数据",
      mistral_case_training: "训练阶段：排放 2.04 万吨 CO₂，耗水 28.1 万立方米。",
      mistral_case_inference: "单次查询 (400 Tokens)：仅排放 1.14 克 CO₂，耗水 45 毫升。单次虽微不足道，可全球累计效应惊人。",
      energy_audit_report: "推理阶段的碳排放目前已占 AI 总消耗的绝大部分。单次查询虽然微小，但在全球规模下，它是最核心的资源驱动力。",
      btn_expand_energy: "深度挖掘：为什么推理阶段占据了长期能源需求的主导？",
      btn_collapse_energy: "收起详情",
      audit_report_label: "Mistral 审计报告",
      inference_stat_label: "推理占全生命周期能耗占比",
    },
    section_infra: {
      title: "算力背后的资源：土地、能源与水",
      energy_card_title: "数据中心",
      energy_card_desc: "行业标准的 WUE（水利用效率）平均为 1.8 升/kWh。一个 1 MW 的数据中心每年仅冷却用水就消耗约 2550 万升。",
      water_card_title: "水：被忽视的缺口",
      water_card_desc: "Google 2023 年环境报告显示，该公司 2022 年消耗了 212 亿升 水（比 2021 年增长 20%）。而水资源补偿计划仅覆盖了约 6%。",
      conflict_title: "资源冲突：亚利桑那州图森市",
      conflict_desc: "2025 年 8 月，图森市议会否决了一个与亚马逊相关的“Project Blue”数据中心项目，该项目每天将消耗数百万加仑的水。在全球水资源压力巨大的枢纽（如金奈），类似的扩张紧张局势也在不断升级。",
      conflict_quote: "“为了保护我们的水、空气和气候。” —— 庆祝这一决定的当地居民",
      carbon_title: "3. 碳排放：一个地理难题",
      carbon_desc_main: "《The Innovation》2025 年分析 369 个大语言模型的研究发现，中国和美国合计贡献了全球 AI 排放量的 99%。而瑞典等低碳地区的贡献仅为 0.1%。",
      carbon_desc_detail: "根据 IEA 数据，中、美、欧合计消耗了全球约 85% 的数据中心电力，但碳强度差异巨大：欧洲约为 174 gCO₂/kWh，美国约为 321 gCO₂/kWh。政策响应各异，从欧洲的强制可再生能源令到中国的“东数西算”工程。",
      analyzer_title: "区域足迹分析仪",
      analyzer_insight_label: "区域洞察：",
      footer_quote: "“在这场算力竞赛中，水资源正成为地缘政治与数字基础设施之间最激烈的冲突前沿。”"
    },
    region_stats: {
      north_america: {
        name: "美国 (亚利桑那州)",
        energy: "全球 AI 负载约 45.5%",
        water: "严重依赖蒸发冷却",
        impact: "缺水区域",
        focus: "高算力负载，碳强度约 321g/kWh。主要采用碳交易政策，但水资源受限。"
      },
      europe: {
        name: "欧洲",
        energy: "平均碳强度约 174g/kWh",
        water: "主要枢纽在德、法、英",
        impact: "强监管区",
        focus: "强制使用可再生能源，且有严格的 EU AI Act 环境足迹披露要求。"
      },
      asia: {
        name: "中国 (西部)",
        energy: "东数西算工程核心区",
        water: "气候干燥但算力集中",
        impact: "枢纽区",
        focus: "碳足迹约 544g/kWh。东数西算目标是在枢纽项目中实现 >75% 的可再生能源利用率。"
      },
      india: {
        name: "印度 (金奈)",
        energy: "高增长区域",
        water: "水资源高度紧张",
        impact: "缺水区域",
        focus: "计算设施扩张导致当地水资源冲突严重。金奈曾发生多次因数据中心耗水引发的社会不满。"
      }
    },
    section_human: {
      station_label: "第三站 / STATION 03 — DATA LABELLING",
      title: "Human‑Powered AI",
      subtitle: "AI 的背后：廉价劳动、心理创伤、算法偏见与数据殖民",
      intro_desc: "ChatGPT 能瞬间写出长文，Midjourney 能一键生成画作——我们惊叹于 AI 是“自动化的技术奇迹”。然而，揭开帘幕，你会发现它实际上是由庞大、廉价且被边缘化的人类劳动力驱动的。所谓“人工智能”，本质上是无数人类劳动的结晶。",
      
      industry_chain_title: "全球数据标注产业链",
      industry_chain_subtitle: "AI 越聪明，底层工人越廉价",
      wage_comparison_title: "可视化工资对比",
      wage_cards: [
        { label: "$1.2 – $2", role: "外包标注员", loc: "肯尼亚 / 菲律宾", bg: "bg-clay/5" },
        { label: "$15+", role: "美国最低时薪", loc: "平均参考值", bg: "bg-white shadow-xl" },
        { label: "$1,100+", role: "顶级算法工程师", loc: "硅谷大厂", bg: "bg-forest text-beige shadow-2xl" }
      ],
      exploitation_map_title: "全球剥削地图 (核心节点)",
      exploitation_map_list: ["肯尼亚 (Nairobi)", "印度 (Hyderabad)", "菲律宾 (Manila)", "委内瑞拉", "乌干达"],
      details_title: "工作实录与细节",
      details_content: "在这些数字流水线上，标注员们每天需要点击成千上万次，识别图像中的行人、交通灯或标注文本的情感。他们面临着极高的 KPI 压力，却几乎没有任何劳动保障、社保或心理辅导。这是一种被剥离了肉体的、纯粹的数字化剥削。",

      moderator_title: " 内容审核员：替 AI“凝视深渊”",
      moderator_subtitle: "AI 的安全，是由真实人类的心理健康换来的",
      case_card_title: "案例分析：OpenAI 肯尼亚团队",
      case_card_content: "审核内容：暴力、仇恨言论、性虐待等极端素材。时薪：低于 2 美元。KPI：每天处理 150-200 段素材。",
      quotes_title: "工人的声音",
      quotes: [
        {
          name: "Mophat Okinyi",
          country: "肯尼亚",
          quote: "“这真的损害了我的心理健康。” —— ChatGPT 内容审核员，负责每天标注数千段涉及极端暴力和性虐待的文本。",
          source: "《时代周刊》/《卫报》，2023"
        },
        {
          name: "Alex Kairu",
          country: "肯尼亚",
          quote: "“它完全摧毁了我。” / “那四个月是我在任何公司中经历过的最糟糕的体验。”",
          source: "路透社 / 《时代周刊》调查报告，2023"
        },
        {
          name: "Stacy (化名)",
          country: "肯尼亚",
          quote: "“十段视频中有七段是极其露骨的。”",
          source: "纪录片《隐形的点击工》 / BBC 采访"
        },
        {
          name: "Joan Kinyua",
          country: "肯尼亚",
          quote: "“世界是个邪恶的地方，没有人会来救你。”",
          source: "“喂养 AI” / 数据工人调查"
        },
        {
          name: "Raj",
          country: "印度",
          quote: "“在我做的 10 个任务中，可能只有两个会被批准，所以我必须做更多任务才能每天赚到 10-30 美元。”",
          source: "TRF 实地调查，2024"
        },
        {
          name: "Nathan Nkunzimana",
          country: "肯尼亚",
          quote: "“每天观看八小时令人震惊的视频——猥亵儿童、谋杀女性……那种恐惧给我带来了毁灭性的心理负担。”",
          source: "肯尼亚内容审核员工会 (CFM)，2024–2025"
        },
        {
          name: "Anita",
          country: "乌干达",
          quote: "“每天工作超过 9 小时，时薪仅约 1.16 美元。为自动驾驶图像进行逐帧标注，休息时间受到严格限制，准确率必须在 95% 以上。”",
          source: "中国经济网 / 环球网调查，《AI 背后的数字工人》"
        }
      ],
      trauma_list_title: "心理创伤成本清单",
      trauma_items: [
        { title: "创伤后应激障碍 (PTSD)", desc: "长期接触极端暴力内容导致的心灵深处损伤。" },
        { title: "病理性闪回", desc: "在日常生活中无预警地重现审核过的恐怖画面。" },
        { title: "系统性支持缺失", desc: "科技大厂将责任外包，工人缺乏合法的心理咨询与医疗服务。" }
      ],
      trauma_footer: "🔽 深度：Karen Hao 谈 AI 的帝国",

      bias_title: "算法偏见的复制与放大",
      bias_subtitle: "AI 不仅反映偏见，还可能会放大它",
      bias_cards_title: "三大核心偏见案例",
      bias_cards: [
        { type: "文本语义偏见", case: "输入“天才”多关联男性，输入“家庭”多关联女性，强化传统性别角色。" },
        { type: "图像生成刻板印象", case: "生成“医生”多为白人男性，生成“护士”多为有色人种女性。" },
        { type: "人脸识别风险", case: "在非白人群体中的错误率显著更高，导致不公正的法律判定与监控。" }
      ],
      bias_cycle_title: "偏见循环图 (The Vicious Cycle)",
      bias_cycle_steps: ["不平等的数据化", "模型无差别学习", "输出强化刻板印象", "社会算法再采用"],
      bias_details_title: "学术研究证据",
      bias_details_content: "Nature 研究显示，由于训练数据中缺乏全球南方的声音，AI 模型在医疗诊断、简历筛选等关键领域存在严重的地域与族群歧视。Naik & Nushi 的实验证明，这种偏见在生成式 AI 中体现得尤为露骨。",

      colonialism_title: "数据殖利用主义：同时剥削人与地球",
      colonialism_subtitle: "全球南方提供资源与劳力",
      comparison_table_title: "资源与利润的不对称流动",
      comparison_data: [
        { label: "劳动力", south: "低薪、极高强度的手工标注", north: "高薪的系统架构与产品运营" },
        { label: "自然资源", south: "锂矿采集、高耗水数据中心、环境污染", north: "清洁、高效的数字化服务终端" },
        { label: "资本收益", south: "极低的微工薪，依赖外包订单", north: "数百亿美元的订阅费与市值增长" }
      ],
      kate_crawford_quote: "“人工智能不是什么中性技术奇迹，而是一个庞大的工业系统，建立在过度榨取地球资源和残酷剥削人类劳动力之上。”",
      sustainable_ai_title: "可持续 AI 的真正定义",
      sustainable_ai_def: "不仅是减少每千瓦时的碳排放，更需要断掉这条将整个人群和生态系统视为“一次性耗材”的殖民链条。构建一个真正公平、透明且具有伦理责任感的数字未来。",
    },
    section_myths: {
      title: "第四站：误区 vs 事实",
      subtitle: "解构 AI 叙事中的常见错觉",
      desc: "为了推动技术普及，许多关于 AI 环境影响的讨论往往过于简化或具有误导性。这里，我们用数据对照常见的几种说法。",
      quote: "“我们必须在为时已晚之前，将‘生态成本’作为衡量人工智能优越性的核心标准之一。”",
      source: "—— 凯特·克劳福德，《人工智能图谱》（Atlas of AI）",
      table_label: "真相清单 / TRUTH LIST",
      table_myth: "普遍误区",
      table_reality: "真相与事实",
      items: [
        { m: "AI 效率提升 = 环境负担降低", r: "杰文斯悖论：效率提升往往会刺激更多使用，最终导致总消耗增加。" },
        { m: "大厂宣称的“碳中和”意味着真正绿色", r: "基于市场的会计准则掩盖了真实的碳强度；水足迹计算经常忽略间接用水。" },
        { m: "训练是 AI 能耗的主要来源", r: "推理阶段目前占 AI 能耗的 65% 以上，且这一比例仍在上升。" },
        { m: "AI 比人类更“环保”", r: "生成同等质量的代码，GPT-4 的碳排放是人类程序员的 5 到 19 倍。" }
      ]
    },
    section_action: {
      title: "终点站：前行的路",
      subtitle: "睿智地使用，而非盲从而行",
      action_list_title: "行动清单",
      actions: [
        "减少无意义的大规模生成尝试",
        "停止向 AI 问好——将问题整合到同一个 Prompt 中以节省资源",
        "在处理简单任务时，优先选择轻量级小模型（SLM）或端侧模型",
        "批判性地阅读 AI 输出，并指出其中隐藏的偏见",
        "支持那些公开能耗和公平劳动实录的透明 AI 平台",
        "不要为了 AI 的营销噱头频繁更换设备——延长电子产品的使用寿命"
      ],
      governance_title: "治理与未来",
      eu_title: "EU AI Act / 欧盟 AI 法案",
      eu_desc: "全球首个综合性法律框架，引入了环境足迹披露要求，从法律层面监管数字文明的消耗上限。",
      un_title: "UN Report 2024 / 联合国 2024 报告",
      un_desc: "强调不环保的资源分配可能加剧全球数字鸿沟，资源贫乏的国家可能会在算力竞赛中支付更高代价。",
      cn_title: "生成式 AI 管理暂行办法 (中国)",
      cn_desc: "要求训练数据的真实性，防止歧视，并为算法修正提供了具有约束力的框架。",
      resources_title: "阅读文献库",
      mlco2_desc: "权威的学术工具，可实时估算模型训练和部署所产生的碳足迹。",
      hidden_desc: "旨在披露全球数据标注行业背后劳动条件的调查项目。"
    },
    section_resources: {
      title: "阅读文献库",
      subtitle: "深度报告、调查记录与学术观察",
      iea_electricity_2026: "（2026年）：全球电力市场年度分析报告，涵盖数据中心用电趋势。",
      iea_ai_climate: "IEA 分析 AI 对气候变化的双重影响。",
      les_sacrifies: "“当我们谈论 AI 时，我们谈论的是在阴影中工作的血肉之躯。” —— 导演 Henri Poulain。这部纪录片深入人工智能产业的“腹部”，揭示了驱动大语言模型运转的隐形人力剥削链。",
      apocaloptimist: "“这是一部手工制作的、发人深省的纪录片，关于人类所创造的最强大的技术……以及如果我们把它弄错了，我们将付出怎样的代价。” —— Focus Features",
    },
    footer: {
      sources: "数据来源：MLCO2 Research, IEA World Energy Outlook, UNEP Global Resource Monitor, Oxford Internet Institute (Ghost Work Project).",
      copy: "© 2026 Token Trace",
      strapline: "Designing a sustainable digital epoch / 构建可持续的数字纪元"
    },
    drawer: {
      title: "我的足迹清单",
      visits: "统计次数",
      tokens: "累计 Token",
      water: "消耗水资源",
      water_bottles: "约 {} 瓶标准饮用水",
      carbon: "碳足迹总量",
      co2_driving: "约 {}KM 汽车行驶等效",
      insight_quote: "“记录足迹并非为了制造焦虑，而是为了重塑我们与数字世界之间的隐形成契约。”",
      source_snippet: "Li et al. (2023)：在微软的美国数据中心训练 GPT-3 可直接蒸发掉 70 万升清洁淡水。",
      source_footer: "数据来源：Google Env Report, Microsoft Env Report, Li et al. (2023)",
      btn_clear: "清除所有本地数据"
    },
    floating_btn: "我的碳足迹清单",
    section_calculator: {
      label: "RESOURCE COST CALCULATOR",
      title: "调整查询量与回复长度。",
      subtitle: "观察电力、水和碳排放随 Token 线性增长。",
      queries_label: "查询次数 / QUERIES",
      tokens_per_reply_label: "单次回复 Token 数 / TOKENS / REPLY",
      btn_add_footprint: "加入我的足迹 / Add to my footprint",
      electricity_label: "电力 / ELECTRICITY",
      water_label: "水 / WATER",
      carbon_label: "碳 / CARBON",
      human_labor_label: "API 调用成本 / API CALL COST",
      electricity_sub: "≈ {} 次手机充电",
      water_sub: "≈ {} 瓶水 (500mL)",
      carbon_sub: "≈ {} km 汽车行驶",
      human_labor_sub: "基于 GPT-4：输入 $0.03-$0.06/1k, 输出 $0.06-$0.12/1k"
    }
  },
  en: {
    title: "TOKEN TRACE",
    water_ticker: "Global AI Cumulative Water Usage (Since 2025.1.1):",
    billion_liters: "Billion L",
    header: {
      title: "THE INVISIBLE COST OF AI",
      nav_tokens: "Tokens",
      nav_footprint: "Footprint",
      nav_labor: "Labor",
      nav_myths: "Myths",
      nav_action: "Action"
    },
    hero: {
      label: "A SCROLLYTELLING ESSAY",
      title: "Every Prompt Has a Hidden Price.",
      desc: "You ask an AI a question. Somewhere you cannot see, that casual exchange consumes electricity, water, carbon — and human labor. Follow one query, from Token to Planet.",
      placeholder: "Ask the AI anything... e.g. 'Explain quantum entanglement in one line.'",
      model_label: "SELECT MODEL",
      btn_send_gemini: "Send to Gemini 3 Flash",
      btn_send_deepseek: "View DeepSeek-R1 (Est.)",
      helper: "Submit a question to reveal its hidden cost...",
      footer_quote: "A disappearing lake, traded for the cooling of a single query.",
      external_tokenizer: "Open DeepSeek-R1 details in Tiktokenizer"
    },
    stats: {
      tokens: "TOTAL TOKENS",
      energy: "ENERGY",
      water: "WATER",
      carbon: "CARBON",
      labor: "LABOR"
    },
    section_1: {
      title: "Tokens: The Atoms of AI Language.",
      subtitle: "AI does not read Chinese characters or English words directly. Your sentence is first shattered into tiny symbolic units called Tokens — pieces of a puzzle the model assembles into a reply.",
      demo_label: "FEEL THE SPLIT",
      demo_prompt: "Type any sentence below. Our tokenizer shows how the model chops it apart.",
      your_sentence: "YOUR SENTENCE",
      tokens_stat: "TOKENS",
      words_stat: "WORDS",
      chars_no_spaces_stat: "CHARACTERS (NO SPACES)",
      total_chars_stat: "TOTAL CHARACTERS",
      bpe_desc: "English: 1 Token is approx. 4 characters or 0.75 words. For other languages, it varies (e.g., 1 Token ≈ 1.5-2 Chinese characters).",
      table_title: "Estimated Token Costs by Task Type",
      table_col_task: "Task",
      table_col_tokens: "Typical Token Consumption",
      table_col_driver: "Key Cost Driver",
      tasks: [
        { name: "Short Multiple Choice (MCQ)", tokens: "1–10", driver: "Negligible" },
        { name: "Free-form Q&A (Explanation)", tokens: "50–300", driver: "Output Length" },
        { name: "Complex Reasoning (CoT)", tokens: "200–1000+", driver: "Chain-of-Thought Length" },
        { name: "Image Generation", tokens: "256–4096", driver: "Visual Tokens / Resolution" }
      ],
      external_tools_title: "Calculator Tools",
      external_tools_desc: "If you need precise calculations for specific models (e.g., GPT-4, DeepSeek).",
      external_tools_btn: "TOKEN CALCULATOR",
      logic_title: "Tokens: The Unit of AI Resource Accountability",
      logic_core: "Core Logic: More Tokens → Higher Energy Use (Strong Linear Relation)",
      logic_evidence_title: "Evidence:",
      logic_evidence_items: [
        { title: "Poddar et al.", desc: "Both input and output lengths correlate linearly with energy, with output's slope being significantly steeper." },
        { title: "Multiple Benchmarks", desc: "Output token correlation with energy r≈0.95, far exceeding that of input." },
        { title: "Dauner et al. (14 models, 7–72B)", desc: "CO₂ emissions increase with generated tokens, strongly correlated with model size and \"thinking length\"." }
      ],
      logic_metric: "Core metric: Energy per token (J/tok)",
      logic_final: "Final chain: Longer responses → More tokens → Higher energy ↑, higher water usage ↑, higher carbon emissions ↑",
    },
    section_2: {
      title: "Station 02 — Who pay for AI",
      subtitle: " The Compute Behind the Curtain",
      training_title: "Training Phase: A Massive One-Time Investment",
      training_desc: "Training LLMs is indeed highly energy-intensive. GPT-4, with ~1.8 trillion parameters, consumed ~2.4 billion kWh during training. The IEA predicts AI power demand could exceed 1,000 TWh annually by 2026, nearly equaling Japan's total usage.",
      inference_title: "Inference Phase: The 'Long Tail' Cumulative Effect",
      inference_desc: "The resources used for a single AI query are extremely small. OpenAI's Sam Altman noted: ChatGPT uses ≈0.000085 gallons of water per query (~1/15th of a teaspoon). However, with 1B+ queries daily, total water usage hits ~322,000 liters—equivalent to a small town's daily consumption.",
      inference_audit: "Inference—the process of responding to queries—now accumulates more energy use than training. Mistral AI's audit points out that inference accounts for over 85% of total lifecycle carbon emissions. Think of it as: Training is building a factory; Inference is the factory running daily—the cumulative cost eventually dwarfs the initial build.",
      mistral_case_title: "Case Study: Mistral Large 2 Audit Data",
      mistral_case_training: "Training: Emitted 20,400 tons of CO₂, used 281,000 m³ of water.",
      mistral_case_inference: "Single Query (400 Tokens): Only 1.14g CO₂, 45ml water. Negligible alone, but massive at global scale.",
      energy_audit_report: "The carbon footprint of inference now dominates AI's total impact. While a single query is tiny, the cumulative global volume makes it the primary resource driver.",
      btn_expand_energy: "Deep Dive: Why Inference Dominates Long-term Energy Demand?",
      btn_collapse_energy: "Collapse Details",
      audit_report_label: "MISTRAL AUDIT REPORT",
      inference_stat_label: "Inference as % of Lifecycle Energy",
    },
    section_infra: {
      title: "Resources Behind Computing Power: Land, Energy and Water",
      energy_card_title: "Data Center",
      energy_card_desc: "The industry average WUE (Water Usage Effectiveness) is ~1.8 L/kWh. A 1 MW data center consumes ~25.5 million liters annually just for cooling.",
      water_card_title: "Water: The Untracked Gap",
      water_card_desc: "Google's 2023 environmental report showed 21.2 billion liters consumed in 2022 (+20% vs 2021). Water replenishment programs cover only ~6%.",
      conflict_title: "Resource Conflict: Tucson, AZ",
      conflict_desc: "In August 2025, Tucson City Council denied an Amazon-linked 'Project Blue' data center that would consume millions of gallons daily. Tensions are rising globally in water-stressed hubs like Chennai.",
      conflict_quote: "“In protection of our water, our air and our climate.” — Local resident celebrating the decision",
      carbon_title: "3. Carbon Emissions: A Geographic Puzzle",
      carbon_desc_main: "A 2025 analysis of 369 LLMs in 'The Innovation' found that China and the US together contribute 99% of global AI emissions. Low-carbon regions like Sweden contribute only 0.1%.",
      carbon_desc_detail: "According to IEA, CN, US, and EU account for ~85% of data center power, but carbon intensities vary wildly: EU is ~174 gCO₂/kWh, while US is ~321 gCO₂/kWh. Policies range from EU's mandatory renewables to China's East-West Compute project.",
      analyzer_title: "Regional Footprint Analyzer",
      analyzer_insight_label: "Regional Insight:",
      footer_quote: "“In this compute race, water is emerging as the most intense clash front between geopolitics and digital infrastructure.”"
    },
    region_stats: {
      north_america: {
        name: "USA (Arizona)",
        energy: "~45.5% of Global AI Load",
        water: "Heavily reliant on evaporative cooling",
        impact: "Stressed Region",
        focus: "High compute load, ~321g/kWh carbon intensity. Focus on carbon credits but facing water limits."
      },
      europe: {
        name: "Europe",
        energy: "Avg. Carbon Intensity ~174g/kWh",
        water: "Hubs in DE, FR, UK",
        impact: "Highly Regulated",
        focus: "Mandatory renewable usage with strict EU AI Act environmental disclosures."
      },
      asia: {
        name: "China (Western)",
        energy: "Core of East-West Compute Project",
        water: "Dry climate but compute-intensive",
        impact: "Major Hub",
        focus: "Avg. ~544g/kWh. Targeting >75% renewable utilization in core hub projects."
      },
      india: {
        name: "India (Chennai)",
        energy: "High Growth Region",
        water: "Severe Water Scarcity",
        impact: "Critical Stressed Region",
        focus: "Compute expansion causes local resource conflicts. Multiple social protests recorded due to water usage."
      }
    },
    section_human: {
      station_label: "STATION 03 — DATA LABELLING",
      title: "Human‑Powered AI",
      subtitle: "Behind AI: Cheap Labor, Psychological Trauma, Algorithmic Bias, and Data Colonialism",
      intro_desc: "ChatGPT can instantly write long texts, and Midjourney can generate stunning artworks with a single click—we marvel that AI is a \"technological miracle of automation.\" However, peeling back the curtain reveals that it is actually driven by a massive, cheap, and marginalized human workforce. The so-called \"artificial intelligence\" is, in essence, the crystallization of immeasurable human labor.",
      
      industry_chain_title: " The Global Data Labeling Industry Chain",
      industry_chain_subtitle: "The smarter AI gets, the cheaper the workers at the bottom",
      wage_comparison_title: "Visual Wage Comparison",
      wage_cards: [
        { label: "$1.2 – $2", role: "Outsourced Annotator", loc: "Kenya / Philippines", bg: "bg-clay/5" },
        { label: "$15+", role: "US Minimum Wage", loc: "Average Reference", bg: "bg-white shadow-xl" },
        { label: "$1,100+", role: "Top Algorithm Engineer", loc: "Silicon Valley Big Tech", bg: "bg-forest text-beige shadow-2xl" }
      ],
      exploitation_map_title: "Global Exploitation Map (Core Nodes)",
      exploitation_map_list: ["Kenya (Nairobi)", "India (Hyderabad)", "Philippines (Manila)", "Venezuela", "Uganda"],
      details_title: "Work Records & Details",
      details_content: "On these digital assembly lines, annotators need to click thousands of times a day, identifying pedestrians, traffic lights, or labeling the sentiment of texts. They face extreme KPI pressure with almost no labor protection, social security, or psychological counseling. This is a form of pure digital exploitation stripped of the body.",
      moderator_title: " Content Moderators: 'Staring into the Abyss' for AI",
      moderator_subtitle: "AI's safety is bought with real human mental health",
      case_card_title: "Case Study: OpenAI Kenya Team",
      case_card_content: "Content moderation: Extreme harmful material (violence, hate speech, abuse). Hourly wage: < $2. KPI: 150-200 segments daily.",
      quotes_title: "Workers' Voices",
      quotes: [
        {
          name: "Mophat Okinyi",
          country: "Kenya",
          quote: "“It has really damaged my mental health.” — ChatGPT content moderator, tasked with labeling thousands of texts involving extreme violence and sexual abuse daily.",
          source: "TIME / The Guardian, 2023"
        },
        {
          name: "Alex Kairu",
          country: "Kenya",
          quote: "“It has destroyed me completely.” / “Those four months were the worst experience I’ve ever had in any company.”",
          source: "Reuters / TIME investigation, 2023"
        },
        {
          name: "Stacy (pseudonym)",
          country: "Kenya",
          quote: "“Seven out of ten videos are graphic.”",
          source: "Documentary “Invisibles Click Workers” / BBC interview"
        },
        {
          name: "Joan Kinyua",
          country: "Kenya",
          quote: "“The world is an evil place, and nobody's coming to save you.”",
          source: "“Feeding AI” / Data Workers‘ Inquiry"
        },
        {
          name: "Raj",
          country: "India",
          quote: "“Of 10 tasks I do, only two may get approved, so I have to do more tasks to make $10–$30 a day.”",
          source: "TRF field investigation, 2024"
        },
        {
          name: "Nathan Nkunzimana",
          country: "Kenya",
          quote: "“Watching eight hours of shocking videos every day – child molestation, murder of a woman… that horror brought me devastating mental burden.”",
          source: "Kenya Content Moderators Union (CFM), 2024–2025"
        },
        {
          name: "Anita",
          country: "Uganda",
          quote: "“Working over 9 hours a day, with a wage of only about $1.16 per hour. Frame by frame annotation for autonomous driving images, break times strictly limited, accuracy must be above 95%.”",
          source: "China Economic Net / Huanqiu.com investigation, “Digital Workers Behind AI”"
        }
      ],
      trauma_list_title: "Psychological Trauma Cost List",
      trauma_items: [
        { title: "Post-Traumatic Stress Disorder (PTSD)", desc: "Damage to the deep psyche from long-term exposure to extreme violence." },
        { title: "Pathological Flashbacks", desc: "Unpredictable re-experiencing of horrific images from moderation in daily life." },
        { title: "Lack of Systemic Support", desc: "Big Tech outsources responsibility; workers lack legal psychological and medical services." }
      ],
      trauma_footer: "🔽 Deep Dive: Karen Hao on the empire of AI",
      bias_title: " Replication and Amplification of Algorithmic Bias",
      bias_subtitle: "AI doesn't just reflect bias; it may amplify it",
      bias_cards_title: "Three Core Bias Cases",
      bias_cards: [
        { type: "Textual Semantic Bias", case: "Inputting 'genius' often associates with men, 'family' with women, reinforcing traditional roles." },
        { type: "Image Generation Stereotypes", case: "Generating 'doctor' yields mostly white men; 'nurse' yields mostly women of color." },
        { type: "Facial Recognition Risks", case: "Significantly higher error rates in non-white groups, leading to unjust legal outcomes." }
      ],
      bias_cycle_title: "The Vicious Cycle of Bias",
      bias_cycle_steps: ["Datafication of Inequality", "Indiscriminate Model Learning", "Output Reinforcement", "Social Algorithm Adoption"],
      bias_details_title: "Academic Research Evidence",
      bias_details_content: "A Nature study shows that due to the lack of Global South voices in training data, AI models exhibit severe regional and ethnic discrimination in critical fields like medical diagnosis and resume screening. Experiments by Naik & Nushi prove this bias is even more explicit in generative AI.",
      colonialism_title: " Data Colonialism",
      colonialism_subtitle: "Global South provides resources & labor, Global North enjoys profits",
      comparison_table_title: "Asymmetric Flow of Resources and Profits",
      comparison_data: [
        { label: "Labor", south: "Low-wage, high-intensity manual annotation", north: "High-paid system architecture and operations" },
        { label: "Natural Resources", south: "Lithium mining, high-water data centers, pollution", north: "Clean, efficient digital service terminals" },
        { label: "Capital Returns", south: "Minimal micro-wages, dependent on outsourcing", north: "Tens of billions in subscriptions and market value" }
      ],
      kate_crawford_quote: "“AI is not a neutral technological miracle, but a colossal industrial system built upon the over-extraction of planetary resources and the ruthless exploitation of labor.”",
      sustainable_ai_title: "The True Definition of Sustainable AI",
      sustainable_ai_def: "It's not just about reducing carbon emissions per kWh; it's about breaking the colonial chain that treats entire populations and ecosystems as 'disposable consumables'. Building a truly fair, transparent, and ethically responsible digital future.",
    },
    section_myths: {
      title: "Station 04: MYTHS VS REALITY",
      subtitle: "Deconstructing common AI misconceptions",
      desc: "To promote technology, many discussions about AI's environmental impact are oversimplified or misleading. Here, we cross-reference common claims with data.",
      quote: "“We must make 'ecological cost' a core metric for AI superiority before it's too late.”",
      source: "— Kate Crawford, Atlas of AI",
      table_label: "TRUTH LIST",
      table_myth: "Common Myths",
      table_reality: "Truths & Facts",
      items: [
        { m: "Greater AI efficiency = lower environmental burden", r: "Jevons Paradox: Better efficiency stimulates more usage, often increasing total consumption." },
        { m: "Corporate 'Net Zero' = Truly Green", r: "Market-based accounting hides real carbon intensity; water metrics often ignore indirect usage." },
        { m: "Training is AI's biggest energy source", r: "Inference now accounts for 65%+ of energy usage and is rising steadily." },
        { m: "AI is 'Greener' than Humans", r: "Generating high-quality code via GPT-4 emits 5-19x more CO₂ than a human programmer." },
        { m: "AI will solve the climate crisis", r: "AI is also used to accelerate fossil fuel extraction; it is a tool, not a saviour" }
      ]
    },
    section_action: {
      title: "THE FINAL STOP: THE PATH AHEAD",
      subtitle: "Use Wisdom, Not Blind Obedience",
      action_list_title: "ACTION CHECKLIST",
      actions: [
        "Reduce meaningless large-scale generational attempts",
        "Stop greeting AI—consolidate questions into one prompt to save resources",
        "Choose lightweight SLMs or on-device models for simple tasks",
        "Read AI outputs critically and report hidden biases",
        "Support transparent AI platforms that disclose energy use and fair labor practices.",
        "Don't upgrade devices for AI marketing hype—keep your old electronics longer."
      ],
      governance_title: "GOVERNANCE & FUTURE",
      eu_title: "EU AI Act",
      eu_desc: "The world's first comprehensive legal framework introducing footprint disclosure requirements.",
      un_title: "UN Report 2024",
      un_desc: "Highlights how unsustainable resource allocation could worsen the global digital divide.",
      cn_title:"China’s GenAI Measures",
      cn_desc:" Mandates training data authenticity, prevents discrimination, provides binding framework for algorithmic correction.",
      resources_title: "RESEARCH RESOURCES",
      mlco2_desc: "Academic tool to estimate carbon footprints of model training and deployment.",
      hidden_desc: "Investigation into working conditions behind the global labeling industry."
    },
    section_resources: {
      title: "RESOURCES",
      subtitle: "Recommended Reading",
      iea_electricity_2026: "Annual analysis of global electricity markets, including trends in data center power usage.",
      iea_ai_climate: "The IEA analyzes the dual impact of AI on climate change.",
      les_sacrifies: "\"When we talk about AI, we are talking about the flesh-and-blood individuals working in the shadows.\" — Director Henri Poulain. An illustration of data colonialism.",
      apocaloptimist: "\"A thought-provoking documentary about the most powerful technology humans have created... and the price we will pay if we get it wrong.\" — Focus Features",
    },
    footer: {
      sources: "Sources: MLCO2 Research, IEA World Energy Outlook, UNEP Global Resource Monitor, Oxford Internet Institute (Ghost Work Project).",
      copy: "© 2026 Token Trace",
      strapline: "Designing a sustainable digital epoch"
    },
    drawer: {
      title: "My Footprint List",
      visits: "Total Visits",
      tokens: "Total Tokens",
      water: "Water Usage",
      water_bottles: "Approx. {} Standard Bottles",
      carbon: "Carbon Footprint",
      co2_driving: "Approx. {}KM Driving Equiv.",
      insight_quote: "“Recording a footprint is not to create panic, but to reshape the digital contract.”",
      source_snippet: "Li et al. (2023): Training GPT-3 in Microsoft’s US data centers can directly evaporate 700k liters of freshwater.",
      source_footer: "Sources: Google Env Report, Microsoft Env Report, Li et al. (2023)",
      btn_clear: "Clear All Local Data"
    },
    floating_btn: "My Carbon Footprint",
    section_calculator: {
      label: "RESOURCE COST CALCULATOR",
      title: "Adjust query volume and reply length.",
      subtitle: "Watch electricity, water and carbon scale linearly with tokens.",
      queries_label: "QUERIES",
      tokens_per_reply_label: "TOKENS / REPLY",
      btn_add_footprint: "Add to my footprint",
      electricity_label: "ELECTRICITY",
      water_label: "WATER",
      carbon_label: "CARBON",
      human_labor_label: "API CALL COST",
      electricity_sub: "≈ {} phone charges",
      water_sub: "≈ {} bottles (500mL)",
      carbon_sub: "≈ {} km by car",
      human_labor_sub: "GPT-4: Input $0.03-$0.06/1k, Output $0.06-$0.12/1k"
    }
  }
};
