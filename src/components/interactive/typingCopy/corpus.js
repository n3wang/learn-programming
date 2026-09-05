/**
 * Documentation-style English text for the typing copy game.
 * Characters allowed in EN: letters, digits, spaces, period, comma only.
 * Each item has en (words) and zh (memory prompt for levels 3–5).
 * Target: >= 2000 English words of coherent sentences.
 */

function sanitizeEn(s) {
  return String(s)
    .replace(/[’‘]/g, '')
    .replace(/[—–‑]/g, ' ')
    .replace(/[^a-zA-Z0-9 .,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RAW = [
  {
    en: "A README file explains how to install and run a project. It lists the main commands, folders, and known issues. Good docs help new contributors start quickly.",
    zh: "README 文件说明如何安装和运行项目。它列出主要命令、文件夹和已知问题。好的文档能帮助新贡献者快速上手。",
  },
  {
    en: "Version control stores history for every change. A commit captures a snapshot with a short message. Branches let people work in parallel without breaking the main line.",
    zh: "版本控制保存每次更改的历史。提交会用简短说明记录一次快照。分支让人们并行工作而不破坏主线。",
  },
  {
    en: "An API endpoint receives a request and returns a response. Status codes show success or failure. Clear error messages make debugging much easier for clients.",
    zh: "API 端点接收请求并返回响应。状态码表示成功或失败。清晰的错误信息能让客户端调试容易得多。",
  },
  {
    en: "Unit tests check small pieces of code in isolation. Integration tests check how modules work together. Run the suite before every release to catch regressions early.",
    zh: "单元测试在隔离环境中检查小块代码。集成测试检查模块如何协同工作。发布前运行整套测试以及早发现回归。",
  },
  {
    en: "A style guide keeps naming and formatting consistent. Linters enforce many rules automatically. Consistent style reduces review time and merge conflicts.",
    zh: "风格指南保持命名与格式一致。代码检查工具会自动强制许多规则。一致的风格能减少评审时间和合并冲突。",
  },
  {
    en: "Markdown uses plain text with light markup for headings, lists, and links. Many docs sites render Markdown into HTML. Keep sentences short and examples concrete.",
    zh: "Markdown 用纯文本加轻量标记表示标题、列表和链接。许多文档站点会把 Markdown 渲染成 HTML。句子宜短，例子宜具体。",
  },
  {
    en: "Environment variables configure secrets and hosts without hardcoding them. Never commit private keys to the repository. Document every required variable in the setup guide.",
    zh: "环境变量用于配置密钥和主机，避免写死在代码里。切勿把私钥提交到仓库。在安装指南中记录每个必需变量。",
  },
  {
    en: "Continuous integration builds the project on every push. Failed checks block a merge until the build is green. Fast feedback keeps the main branch stable.",
    zh: "持续集成在每次推送时构建项目。检查失败会阻止合并，直到构建通过。快速反馈能保持主分支稳定。",
  },
  {
    en: "A changelog lists user facing changes by version. Group entries into added, fixed, and changed. Readers should understand the impact without opening every commit.",
    zh: "更新日志按版本列出面向用户的变更。条目可分成新增、修复和变更。读者应无需打开每个提交就能理解影响。",
  },
  {
    en: "Caching stores recent results to avoid repeating expensive work. Invalidate the cache when the source data changes. Measure hit rates to confirm the cache helps.",
    zh: "缓存保存最近结果，避免重复昂贵计算。源数据变化时要使缓存失效。测量命中率以确认缓存有用。",
  },
  {
    en: "Logging records events while the program runs. Use levels such as info, warn, and error. Structured logs are easier to search in production systems.",
    zh: "日志记录程序运行时的事件。可使用 info、warn、error 等级别。结构化日志在生产系统中更易搜索。",
  },
  {
    en: "Accessibility means more people can use the product. Provide text alternatives for images and enough color contrast. Keyboard navigation should reach every control.",
    zh: "无障碍意味着更多人能使用产品。为图片提供文本替代并保证足够对比度。键盘导航应能到达每个控件。",
  },
  {
    en: "A pull request proposes changes for review. Describe the problem, the approach, and how to test it. Small focused requests are easier to review and merge.",
    zh: "拉取请求提出变更以供评审。说明问题、方案和如何测试。小而专注的请求更易评审和合并。",
  },
  {
    en: "Databases store structured data for later queries. Indexes speed up common lookups. Back up data regularly and practice restoring from a backup.",
    zh: "数据库保存结构化数据以便日后查询。索引能加快常见查找。应定期备份并练习从备份恢复。",
  },
  {
    en: "Security reviews look for unsafe input handling and leaked secrets. Validate user input on the server. Prefer the least privilege for every service account.",
    zh: "安全评审查找不安全的输入处理与泄露的密钥。在服务器端验证用户输入。每个服务账号应遵循最小权限。",
  },
  {
    en: "Performance work starts with measurement, not guesses. Profile the slow path before rewriting code. Optimize the hottest loops first and verify with benchmarks.",
    zh: "性能工作从测量开始，而不是猜测。重写代码前先分析慢路径。优先优化最热循环并用基准验证。",
  },
  {
    en: "Design docs capture the why before large builds start. List goals, non goals, and open questions. Update the doc when the plan changes during implementation.",
    zh: "设计文档在大型开发开始前记录原因。列出目标、非目标和未决问题。实施中计划变化时要更新文档。",
  },
  {
    en: "Containers package an app with its dependencies. The same image can run on a laptop and a server. Keep images small and rebuild them from a clean base.",
    zh: "容器把应用及其依赖打包在一起。同一镜像可在笔记本和服务器上运行。保持镜像精简并从干净基础重建。",
  },
  {
    en: "Code review is a conversation, not a contest. Ask questions when intent is unclear. Approve when the change is correct, clear, and tested enough for the risk.",
    zh: "代码评审是对话，不是竞赛。意图不清时要提问。当变更正确、清晰且测试与风险相匹配时再批准。",
  },
  {
    en: "Release notes tell users what shipped and how to upgrade. Call out breaking changes near the top. Link to longer migration guides when steps are complex.",
    zh: "发布说明告诉用户发布了什么以及如何升级。把破坏性变更写在靠前位置。步骤复杂时链接到更长的迁移指南。",
  },
  {
    en: "A makefile can wrap common build tasks behind short names. Document each target with a one line comment. Prefer simple targets that do one clear job well.",
    zh: "Makefile 可用短名称封装常见构建任务。用一行注释说明每个目标。优先做单一清晰工作的简单目标。",
  },
  {
    en: "Feature flags let you ship code without turning it on for everyone. Roll out slowly and watch metrics for errors. Remove old flags after the change is stable.",
    zh: "功能开关让你可以发布代码而不对所有人启用。缓慢放量并观察错误指标。变更稳定后移除旧开关。",
  },
  {
    en: "Issue trackers hold bugs, tasks, and questions in one place. Write a clear title and steps to reproduce. Link related pull requests so history stays connected.",
    zh: "问题跟踪器把缺陷、任务和问题放在一处。写清标题与复现步骤。关联相关拉取请求以保持历史连贯。",
  },
  {
    en: "Static analysis finds many bugs without running the program. Treat new warnings as work to finish soon. Suppressions need a short comment that explains why.",
    zh: "静态分析无需运行程序即可发现许多缺陷。把新警告当作应尽快完成的工作。抑制规则需要简短说明原因。",
  },
  {
    en: "A package manager installs libraries with known versions. Lock files keep installs repeatable across machines. Audit dependencies often for security updates.",
    zh: "包管理器按已知版本安装库。锁定文件让各机器安装可重复。经常审计依赖以获取安全更新。",
  },
  {
    en: "HTTP methods describe the intent of a request. Get reads data while post creates new resources. Put and patch update data while delete removes it.",
    zh: "HTTP 方法描述请求意图。GET 读取数据，POST 创建新资源。PUT 与 PATCH 更新数据，DELETE 删除数据。",
  },
  {
    en: "JSON is a common format for APIs and config files. Keep keys short and nested structures shallow. Validate shapes so bad payloads fail early.",
    zh: "JSON 是 API 与配置文件的常见格式。键名宜短，嵌套宜浅。校验结构以便坏载荷尽早失败。",
  },
  {
    en: "A schema describes the shape of data you expect. Share schemas between services when possible. Version schemas so older clients can keep working.",
    zh: "模式描述你期望的数据形状。可能时在服务间共享模式。为模式做版本，以便旧客户端继续工作。",
  },
  {
    en: "Retries can fix brief network failures automatically. Add backoff so you do not flood a busy service. Cap the retry count and log the final failure.",
    zh: "重试可自动修复短暂网络故障。加入退避以免压垮繁忙服务。限制重试次数并记录最终失败。",
  },
  {
    en: "Timeouts stop a call from waiting forever. Choose values based on real latency data. Fail fast when a dependency is clearly down.",
    zh: "超时可避免调用永久等待。根据真实延迟数据选择取值。依赖明显宕机时快速失败。",
  },
  {
    en: "Idempotent operations can run twice with the same result. Use idempotency keys for payments and creates. Clients can safely retry when the network drops.",
    zh: "幂等操作执行两次结果相同。为支付与创建使用幂等键。网络中断时客户端可安全重试。",
  },
  {
    en: "Monitoring watches live systems for health and load. Alerts should wake people only for real problems. Dashboards help teams see trends over days and weeks.",
    zh: "监控观察线上系统健康与负载。告警应只为真实问题叫醒人。仪表盘帮助团队看到数日与数周趋势。",
  },
  {
    en: "Tracing follows a request across many services. Span names should match the work they cover. Sample carefully so storage costs stay reasonable.",
    zh: "链路追踪跟随请求跨越多个服务。跨度名称应匹配其覆盖的工作。谨慎采样以控制存储成本。",
  },
  {
    en: "A runbook lists steps for common incidents. Keep commands copy ready and in order. Review runbooks after each real outage.",
    zh: "运维手册列出常见事故步骤。命令应可复制且按顺序排列。每次真实故障后复查手册。",
  },
  {
    en: "Backwards compatible changes avoid breaking old clients. Add fields before you remove old ones. Deprecate slowly and publish dates for removal.",
    zh: "向后兼容的变更避免破坏旧客户端。先加字段再删旧字段。缓慢弃用并公布移除日期。",
  },
  {
    en: "Semantic versioning signals how risky an update is. Major bumps may break callers. Minor and patch bumps should stay safer for upgrades.",
    zh: "语义化版本提示更新风险大小。主版本升级可能破坏调用方。次版本与补丁升级对升级更安全。",
  },
  {
    en: "A monorepo keeps many projects in one repository. Shared libraries are easier to change together. Tooling must scale so builds stay fast.",
    zh: "单体仓库把多个项目放在同一仓库。共享库更易一起改动。工具链必须可扩展以保持构建快速。",
  },
  {
    en: "Microservices split a system into smaller deployable parts. Each service should own its data. Network calls replace in process function calls.",
    zh: "微服务把系统拆成更小的可部署部分。每个服务应拥有自己的数据。网络调用取代进程内函数调用。",
  },
  {
    en: "Message queues decouple producers from consumers. Messages should be small and self contained. Dead letter queues hold poison messages for later review.",
    zh: "消息队列解耦生产者与消费者。消息应小且自包含。死信队列存放毒消息供稍后审查。",
  },
  {
    en: "A health check tells load balancers if an instance is ready. Keep checks cheap and side effect free. Separate live checks from deeper dependency checks.",
    zh: "健康检查告诉负载均衡实例是否就绪。检查应廉价且无副作用。把存活检查与更深依赖检查分开。",
  },
  {
    en: "Blue green deploys switch traffic to a new environment. Rollbacks become a traffic switch again. Keep both environments in sync during the cutover.",
    zh: "蓝绿部署把流量切到新环境。回滚再次变成流量切换。切换期间保持两套环境同步。",
  },
  {
    en: "Canary releases send a small slice of traffic first. Watch errors and latency before wider rollout. Abort quickly when the canary looks unhealthy.",
    zh: "金丝雀发布先发送一小部分流量。扩大放量前观察错误与延迟。金丝雀不健康时迅速中止。",
  },
  {
    en: "Feature ownership means a team answers for a product area. On call rotations share night and weekend load. Handoffs need clear notes about open risks.",
    zh: "功能归属意味着团队对产品区域负责。值班轮换分担夜间与周末负载。交接需要关于未决风险的清晰记录。",
  },
  {
    en: "Technical debt is work you postpone for speed now. Track debt items like any other backlog work. Pay debt when it slows new features too much.",
    zh: "技术债是你为当前速度推迟的工作。像其他待办一样跟踪债务项。当它过度拖慢新功能时偿还。",
  },
  {
    en: "A spike is short research with a clear question. Time box the spike and write findings down. Decide next steps with evidence from the spike.",
    zh: "探索性研究是有明确问题的短调研。给探索限时并写下发现。用探索证据决定下一步。",
  },
  {
    en: "Acceptance criteria describe when a story is done. Write them before coding starts when you can. Demo the criteria so everyone agrees on done.",
    zh: "验收标准描述故事何时完成。可能时在编码前写好。演示标准以便大家对完成达成一致。",
  },
  {
    en: "User stories focus on who wants what and why. Keep stories small enough to finish in days. Split large stories before they block a sprint.",
    zh: "用户故事关注谁想要什么以及为什么。故事宜小到几天内完成。大故事阻塞冲刺前先拆分。",
  },
  {
    en: "Standup meetings share progress and blockers briefly. Speak about work not about people. Take deeper talks offline after the standup.",
    zh: "站会简短分享进度与阻碍。谈工作而非谈人。站会后线下深入讨论。",
  },
  {
    en: "Retrospectives look at process after a release or sprint. Capture what went well and what to try next. Assign owners so action items actually happen.",
    zh: "回顾会在发布或冲刺后审视流程。记录顺利之处与下一步尝试。指定负责人以便行动项真正落地。",
  },
  {
    en: "Pair programming puts two people on one task. Knowledge spreads and reviews happen earlier. Rotate pairs so habits do not become silos.",
    zh: "结对编程让两个人做同一任务。知识扩散且评审更早发生。轮换搭档以免习惯变成孤岛。",
  },
  {
    en: "Mob programming involves a whole team on one problem. It helps for hard design choices. Keep sessions focused and end with clear notes.",
    zh: "群体编程让整个团队攻克一个问题。这对艰难设计选择有帮助。保持会议专注并以清晰笔记结束。",
  },
  {
    en: "Documentation debt grows when code changes without doc updates. Link docs from the code that they describe. Delete pages that nobody trusts anymore.",
    zh: "代码变更却不更新文档时，文档债会增长。从它们描述的代码链接到文档。删除无人再信任的页面。",
  },
  {
    en: "Tutorials teach a path from zero to a working result. Guides explain concepts with more depth. Reference pages list exact options and defaults.",
    zh: "教程教从零到可运行结果的路径。指南更深入解释概念。参考页列出确切选项与默认值。",
  },
  {
    en: "Search on a docs site needs good titles and headings. Put the most common tasks near the top. Add examples next to abstract rules.",
    zh: "文档站搜索需要好的标题与小标题。把最常见任务放在靠前位置。在抽象规则旁加入例子。",
  },
  {
    en: "Screenshots go stale when the UI changes. Prefer short clips or live embeds when possible. Caption every image with what matters in it.",
    zh: "界面变化时截图会过时。可能时优先短视频或实时嵌入。为每张图标注关键信息。",
  },
  {
    en: "Copy editing removes noise from public docs. Prefer active voice and short paragraphs. Define terms the first time they appear.",
    zh: "文案编辑去掉公开文档中的噪音。优先主动语态与短段落。术语首次出现时给出定义。",
  },
  {
    en: "Localization adapts product text for other languages. Keep source strings free of slang when you can. Leave room in layouts for longer translations.",
    zh: "本地化把产品文本适配到其他语言。可能时让源字符串少用俚语。在布局中为更长译文留出空间。",
  },
  {
    en: "Keyboard shortcuts speed up power users. Document them in a cheatsheet page. Avoid stealing shortcuts the browser already uses.",
    zh: "键盘快捷键加快重度用户操作。在速查页记录它们。避免占用浏览器已使用的快捷键。",
  },
  {
    en: "Forms should validate early and explain errors clearly. Mark required fields in a consistent way. Save drafts when forms are long.",
    zh: "表单应尽早校验并清楚说明错误。用一致方式标记必填字段。表单很长时保存草稿。",
  },
  {
    en: "Empty states guide users when there is no data yet. Offer a next action instead of a blank screen. Keep empty state art light and optional.",
    zh: "空状态在尚无数据时引导用户。提供下一步行动而非空白屏。空状态插画宜轻量且可选。",
  },
  {
    en: "Loading indicators show that work is still happening. Prefer skeletons for content shaped layouts. Avoid spinners that never stop spinning.",
    zh: "加载指示器显示工作仍在进行。对有形状的内容布局优先骨架屏。避免永不停止的转圈。",
  },
  {
    en: "Error pages should say what failed and what to try. Include a way to contact support. Log enough detail for engineers without leaking secrets.",
    zh: "错误页应说明失败内容与可尝试步骤。提供联系支持的方式。为工程师记录足够细节且不泄露密钥。",
  },
  {
    en: "Analytics help teams learn how features are used. Collect the least data that answers the question. Respect privacy laws and user consent.",
    zh: "分析帮助团队了解功能如何被使用。只收集能回答问题的最少数据。尊重隐私法律与用户同意。",
  },
  {
    en: "A B tests compare two variants with real traffic. Decide the metric before the test starts. Stop tests that are clearly hurting users.",
    zh: "A/B 测试用真实流量比较两个变体。测试开始前先决定指标。明确伤害用户的测试应停止。",
  },
  {
    en: "Roadmaps communicate direction without fake precision. Separate committed work from ideas under study. Revisit the roadmap when reality changes.",
    zh: "路线图传达方向而不假装精确。把已承诺工作与研究中想法分开。现实变化时复查路线图。",
  },
  {
    en: "OKRs link goals to measurable results. Keep objectives few and easy to remember. Review progress in public so teams align.",
    zh: "OKR 把目标与可衡量结果相连。目标宜少且易记。公开回顾进度以便团队对齐。",
  },
  {
    en: "Incident severity guides how fast people respond. Critical issues need immediate attention. Low severity items can wait for business hours.",
    zh: "事故严重级别指导响应速度。严重问题需要立即关注。低级别事项可等到工作时间。",
  },
  {
    en: "Postmortems explain outages without blaming people. Focus on systems and missing safeguards. Share action items with dates and owners.",
    zh: "事后复盘解释故障而不责备个人。关注系统与缺失的防护。分享带日期与负责人的行动项。",
  },
  {
    en: "Capacity planning estimates future load and cost. Use growth trends not single peak days. Leave headroom for spikes and failed nodes.",
    zh: "容量规划估计未来负载与成本。使用增长趋势而非单日峰值。为尖峰与故障节点留出余量。",
  },
  {
    en: "Cost awareness keeps cloud bills under control. Tag resources by team and service. Delete unused disks and idle machines regularly.",
    zh: "成本意识控制云账单。按团队与服务给资源打标签。定期删除未用磁盘与空闲机器。",
  },
  {
    en: "Secrets managers store passwords and tokens safely. Rotate secrets on a schedule. Never print secrets into logs or tickets.",
    zh: "密钥管理器安全存放密码与令牌。按计划轮换密钥。切勿把密钥打印到日志或工单。",
  },
  {
    en: "Network policies limit which services may talk. Default deny is safer than default allow. Review rules when architectures change.",
    zh: "网络策略限制哪些服务可以通信。默认拒绝比默认允许更安全。架构变化时复查规则。",
  },
  {
    en: "Least privilege means each role gets only needed access. Review permissions during hiring and leaving. Prefer short lived credentials over long lived keys.",
    zh: "最小权限意味着每个角色只获所需访问。入职与离职时复查权限。优先短时凭证而非长期密钥。",
  },
  {
    en: "Encryption protects data at rest and in transit. Use modern protocols and strong defaults. Manage certificates before they expire.",
    zh: "加密保护静态与传输中的数据。使用现代协议与强默认值。在证书过期前管理它们。",
  },
  {
    en: "Threat models list what you protect and from whom. Update them when new features ship. Share models with security partners early.",
    zh: "威胁模型列出保护对象与对手。新功能上线时更新它们。尽早与安全伙伴分享模型。",
  },
  {
    en: "Bug bounty programs invite outside researchers. Pay for valid reports and fix them promptly. Publish a clear scope so effort is focused.",
    zh: "漏洞赏金计划邀请外部研究者。为有效报告付费并迅速修复。公布清晰范围以便聚焦努力。",
  },
  {
    en: "Compliance frameworks set minimum security practices. Map controls to real systems and owners. Automate evidence collection when you can.",
    zh: "合规框架设定最低安全实践。把控制映射到真实系统与负责人。可能时自动化证据收集。",
  },
  {
    en: "Data retention policies say how long you keep records. Delete data you no longer need. Tell users what you store and why.",
    zh: "数据保留策略说明记录保存多久。删除不再需要的数据。告知用户你存储什么以及为什么。",
  },
  {
    en: "Backup tests prove restores work under pressure. Practice restores on a schedule. Store backups in a separate failure domain.",
    zh: "备份测试证明高压下仍能恢复。按计划练习恢复。把备份存在独立故障域。",
  },
  {
    en: "Disaster recovery plans cover region wide failures. Define recovery time and data loss goals. Run game days to rehearse the plan.",
    zh: "灾难恢复计划覆盖区域级故障。定义恢复时间与数据丢失目标。举办演练日排练计划。",
  },
  {
    en: "Service level objectives set reliability targets. Error budgets show room for change. Freeze risky deploys when the budget is spent.",
    zh: "服务级别目标设定可靠性指标。错误预算显示变更空间。预算耗尽时冻结高风险部署。",
  },
  {
    en: "Latency percentiles describe user experience better than averages. Watch the tail not only the mean. Slow outliers often hide serious bugs.",
    zh: "延迟百分位数比平均值更能描述用户体验。关注尾部而非仅均值。缓慢异常常隐藏严重缺陷。",
  },
  {
    en: "Throughput measures how much work a system completes. Saturation shows when resources are nearly full. Graph both to understand bottlenecks.",
    zh: "吞吐量衡量系统完成多少工作。饱和度显示资源何时接近用尽。同时画图以理解瓶颈。",
  },
  {
    en: "Garbage collection pauses can surprise latency charts. Tune heap sizes with measured data. Prefer algorithms that fit your workload.",
    zh: "垃圾回收停顿可能让延迟图意外。用测量数据调整堆大小。优先适合工作负载的算法。",
  },
  {
    en: "Connection pools reuse expensive network sessions. Size pools for peak concurrency. Fail clearly when the pool is exhausted.",
    zh: "连接池复用昂贵的网络会话。按峰值并发设定池大小。池耗尽时清楚失败。",
  },
  {
    en: "Rate limits protect services from overload. Return clear signals so clients can slow down. Prefer fair limits across tenants.",
    zh: "速率限制保护服务免于过载。返回清晰信号以便客户端减速。跨租户优先公平限制。",
  },
  {
    en: "Circuit breakers stop calling a sick dependency. Open the circuit after repeated failures. Half open probes decide when to close again.",
    zh: "熔断器停止调用不健康依赖。多次失败后打开熔断。半开探测决定何时再次关闭。",
  },
  {
    en: "Bulkheads isolate failures inside one part of a system. Separate thread pools and queues by workload. One noisy neighbor should not sink everything.",
    zh: "舱壁隔离系统一部分内的故障。按工作负载分离线程池与队列。一个吵闹邻居不应拖垮一切。",
  },
  {
    en: "Graceful shutdown finishes in flight work before exit. Drain load balancer traffic first. Force exit only after a final timeout.",
    zh: "优雅停机在退出前完成进行中的工作。先排空负载均衡流量。仅在最终超时后强制退出。",
  },
  {
    en: "Read replicas scale read heavy databases. Writes still go to the primary node. Be aware of replication lag for fresh reads.",
    zh: "只读副本扩展读多写少的数据库。写入仍进入主节点。新鲜读取需注意复制延迟。",
  },
  {
    en: "Sharding splits data across many database nodes. Choose a shard key that spreads load evenly. Resharding is hard so plan growth early.",
    zh: "分片把数据拆到多个数据库节点。选择能均匀分散负载的分片键。再分片很难，故尽早规划增长。",
  },
  {
    en: "Migrations change database schemas safely over time. Prefer expand and contract steps. Avoid long locks during peak traffic.",
    zh: "迁移随时间安全改变数据库模式。优先扩展再收缩步骤。高峰流量时避免长时间锁。",
  },
  {
    en: "ORMs map objects to tables for convenience. Know the queries they generate under the hood. Fall back to SQL for complex reports.",
    zh: "ORM 为方便把对象映射到表。了解其底层生成的查询。复杂报表可退回 SQL。",
  },
  {
    en: "Transactions keep related writes atomic. Keep transactions short to reduce lock time. Know your isolation level and its tradeoffs.",
    zh: "事务保持相关写入原子性。缩短事务以减少锁时间。了解隔离级别及其权衡。",
  },
  {
    en: "Soft deletes mark rows instead of removing them. They complicate unique constraints and queries. Hard delete when privacy rules require it.",
    zh: "软删除标记行而非真正移除。它们使唯一约束与查询更复杂。隐私规则要求时硬删除。",
  },
  {
    en: "Pagination keeps large lists usable. Prefer cursor based pages for stable results. Always return a clear next page token.",
    zh: "分页让大列表可用。稳定结果优先游标分页。始终返回清晰的下一页令牌。",
  },
  {
    en: "Search indexes trade storage for faster queries. Rebuild indexes when relevance rules change. Monitor query latency after content spikes.",
    zh: "搜索索引用存储换更快查询。相关性规则变化时重建索引。内容暴增后监控查询延迟。",
  },
  {
    en: "Full text search matches words inside documents. Stemming helps related word forms match. Ranking quality matters more than raw speed alone.",
    zh: "全文搜索匹配文档内词语。词干提取帮助相关词形匹配。排序质量比单纯原始速度更重要。",
  },
  {
    en: "Geospatial queries find points near a location. Use the right index type for maps. Test accuracy at city and street scales.",
    zh: "地理空间查询查找靠近某位置的点。为地图使用合适索引类型。在城市与街道尺度测试精度。",
  },
  {
    en: "Time series databases store metrics efficiently. Downsample old data to save space. Align scrape intervals with alert needs.",
    zh: "时序数据库高效存储指标。对旧数据降采样以省空间。对齐抓取间隔与告警需求。",
  },
  {
    en: "Batch jobs process large volumes on a schedule. Make jobs restartable after failure. Emit progress so operators can watch them.",
    zh: "批处理任务按计划处理大量数据。让任务失败后可重启。发出进度以便运维观察。",
  },
  {
    en: "Streaming pipelines handle events as they arrive. Plan for out of order and duplicate events. Exactly once delivery is harder than it sounds.",
    zh: "流式管道在事件到达时处理它们。为乱序与重复事件做计划。恰好一次投递比听起来更难。",
  },
  {
    en: "ETL jobs extract transform and load data for analytics. Keep transforms tested like application code. Separate raw landing zones from curated tables.",
    zh: "ETL 任务为分析提取转换并加载数据。像应用代码一样测试转换。把原始落地区与整理后的表分开。",
  },
  {
    en: "Data catalogs help people find trustworthy datasets. Document owners freshness and grain. Mark deprecated tables so nobody rebuilds on them.",
    zh: "数据目录帮助人们找到可信数据集。记录所有者、新鲜度与粒度。标记弃用表以免有人再建其上。",
  },
  {
    en: "Notebooks are great for exploration and teaching. Promote stable analysis into tested pipelines. Do not treat notebooks as production services.",
    zh: "笔记本适合探索与教学。把稳定分析提升为经测试的流水线。不要把笔记本当作生产服务。",
  },
  {
    en: "Machine learning features need careful versioning. Training data should be reproducible. Monitor model drift after deployment.",
    zh: "机器学习特征需要谨慎版本管理。训练数据应可复现。部署后监控模型漂移。",
  },
  {
    en: "Prompt engineering shapes generative model behavior. Store prompts next to evaluation cases. Guardrails reduce unsafe or off topic answers.",
    zh: "提示工程塑造生成模型行为。把提示与评估用例放在一起。护栏减少不安全或跑题回答。",
  },
  {
    en: "Embeddings turn text into vectors for similarity search. Choose dimensions that fit your index. Re embed when the model version changes.",
    zh: "嵌入把文本变成向量以便相似搜索。选择适合索引的维度。模型版本变化时重新嵌入。",
  },
  {
    en: "Evaluation sets measure quality with known answers. Automate scoring where you can. Human review still catches subtle failures.",
    zh: "评估集用已知答案衡量质量。可能时自动化打分。人工评审仍能发现细微失败。",
  },
  {
    en: "Content moderation filters harmful user uploads. Combine automated checks with human escalation. Log decisions for later audits.",
    zh: "内容审核过滤有害用户上传。把自动检查与人工升级结合。记录决定供日后审计。",
  },
  {
    en: "Spam controls protect forms and comment systems. Rate limit anonymous traffic more strictly. Challenge suspicious clients with extra checks.",
    zh: "反垃圾控制保护表单与评论系统。对匿名流量更严格限速。用额外检查挑战可疑客户端。",
  },
  {
    en: "Session cookies identify signed in browsers. Mark cookies secure and http only. Rotate session ids after login and privilege changes.",
    zh: "会话 cookie 识别已登录浏览器。将 cookie 标为 secure 与 http only。登录与权限变更后轮换会话 id。",
  },
  {
    en: "OAuth lets users grant limited access to apps. Request only the scopes you need. Handle revoked tokens without crashing the client.",
    zh: "OAuth 让用户向应用授予有限访问。只请求你需要的范围。处理被撤销令牌且不让客户端崩溃。",
  },
  {
    en: "Single sign on reduces password fatigue across tools. Central identity makes offboarding faster. Protect the identity provider like critical infrastructure.",
    zh: "单点登录减少跨工具密码疲劳。集中身份使离职流程更快。像关键基础设施一样保护身份提供方。",
  },
  {
    en: "Multi factor authentication stops many stolen password attacks. Prefer app based codes or hardware keys. Backup codes need safe storage advice.",
    zh: "多因素认证阻止许多被盗密码攻击。优先应用验证码或硬件密钥。备用码需要安全存放建议。",
  },
  {
    en: "Password reset flows must prove identity carefully. Expire reset links quickly. Notify the account when a reset succeeds.",
    zh: "密码重置流程必须谨慎证明身份。重置链接应快速过期。重置成功时通知账户。",
  },
  {
    en: "Account lockouts slow repeated guessing attacks. Unlock with time delays or support review. Avoid lockouts that enable denial of service.",
    zh: "账户锁定减缓反复猜测攻击。用延时或支持审核解锁。避免可被用于拒绝服务的锁定。",
  },
  {
    en: "Input sanitization blocks script injection in web pages. Encode output for the right context. Prefer frameworks that escape by default.",
    zh: "输入净化阻止网页中的脚本注入。按正确上下文编码输出。优先默认转义的框架。",
  },
  {
    en: "Cross site request forgery tricks browsers into unwanted actions. Use anti forgery tokens on state changing forms. Same site cookie rules add defense.",
    zh: "跨站请求伪造诱使浏览器执行非自愿操作。在改状态表单上使用防伪令牌。SameSite cookie 规则增加防护。",
  },
  {
    en: "Clickjacking hides UI under transparent layers. Frame busting headers reduce the risk. Critical actions should require re authentication.",
    zh: "点击劫持把界面藏在透明层下。防嵌套头可降低风险。关键操作应要求重新认证。",
  },
  {
    en: "Dependency updates bring fixes and new features. Automate pull requests for patch releases. Review majors before you merge them.",
    zh: "依赖更新带来修复与新功能。为补丁发布自动创建拉取请求。合并主版本前先评审。",
  },
  {
    en: "Licenses decide how you may reuse open source. Track licenses in your dependency tree. Avoid mixing incompatible license terms.",
    zh: "许可证决定你如何复用开源。在依赖树中跟踪许可证。避免混用不兼容条款。",
  },
  {
    en: "Changelogs in libraries guide upgrade work. Read migration notes before bumping majors. Pin versions when reproducibility matters most.",
    zh: "库的更新日志指导升级工作。提升主版本前阅读迁移说明。可复现性最重要时锁定版本。",
  },
  {
    en: "Binary artifacts should be built from tagged sources. Sign releases when your threat model needs it. Publish checksums next to download links.",
    zh: "二进制产物应从打标签的源码构建。威胁模型需要时签名发布。在下载链接旁公布校验和。",
  },
  {
    en: "Reproducible builds make the same input yield the same binary. Record tool versions in the build graph. Avoid timestamps that change every run.",
    zh: "可复现构建使相同输入得到相同二进制。在构建图中记录工具版本。避免每次运行都变的时间戳。",
  },
  {
    en: "Editor configs share formatting across a team. Commit the config file with the project. Format on save to remove style debates.",
    zh: "编辑器配置在团队间共享格式。把配置文件提交进项目。保存时格式化以减少风格争论。",
  },
  {
    en: "Git hooks can run checks before a commit lands. Keep hooks fast so people do not disable them. Prefer shared tooling over personal only scripts.",
    zh: "Git 钩子可在提交落地前运行检查。保持钩子快速以免被人禁用。优先共享工具而非仅个人脚本。",
  },
  {
    en: "Branch protection requires reviews before merges. Require green status checks as well. Allow admins emergency overrides with logging.",
    zh: "分支保护要求合并前评审。同时要求状态检查通过。允许管理员紧急覆盖并记录日志。",
  },
  {
    en: "Code owners routes reviews to the right experts. Keep the owners file updated as teams change. Avoid owner rules that create endless bottlenecks.",
    zh: "代码所有者把评审路由到合适专家。团队变化时更新所有者文件。避免造成无尽瓶颈的所有者规则。",
  },
  {
    en: "Draft pull requests signal work that is not ready. Use them for early feedback on design. Mark ready when tests and docs are in place.",
    zh: "草稿拉取请求表示工作尚未就绪。用它们获取早期设计反馈。测试与文档就绪后标为可评审。",
  },
  {
    en: "Stacked pull requests break large changes into layers. Each layer should build and test alone. Rebase carefully to keep the stack clean.",
    zh: "堆叠拉取请求把大变更拆成多层。每层应能独立构建与测试。小心变基以保持堆叠整洁。",
  },
  {
    en: "Commit messages explain why a change exists. Use the body for context and tradeoffs. Avoid messages that only repeat the diff.",
    zh: "提交说明解释变更为何存在。用正文写上下文与权衡。避免只重复差异的说明。",
  },
  {
    en: "Squash merges keep history tidy on the main branch. Preserve detail in the pull request page. Choose a policy and stick to it.",
    zh: "挤压合并让主分支历史整洁。在拉取请求页保留细节。选定策略并坚持执行。",
  },
  {
    en: "Rebase rewrites local commits onto a newer base. Never rebase shared published history. Communicate before force pushing a personal branch.",
    zh: "变基把本地提交改写到更新的基底上。切勿变基已共享的已发布历史。强制推送个人分支前先沟通。",
  },
  {
    en: "Cherry picks copy a commit onto another branch. Use them for urgent fixes on release lines. Prefer merging when histories should stay linked.",
    zh: "拣选把提交复制到另一分支。用于发布线上的紧急修复。历史应保持关联时优先合并。",
  },
  {
    en: "Tags mark release points in history. Annotated tags store message and author metadata. Protect tags that customers depend on.",
    zh: "标签标记历史中的发布点。附注标签存储说明与作者元数据。保护客户所依赖的标签。",
  },
  {
    en: "Semantic search finds docs by meaning not only keywords. Combine it with classic keyword search. Evaluate results with real support questions.",
    zh: "语义搜索按含义而非仅关键词查找文档。把它与经典关键词搜索结合。用真实支持问题评估结果。",
  },
  {
    en: "Internal platforms give teams paved roads for shipping. Invest in templates and golden paths. Measure adoption and remove unused platform pieces.",
    zh: "内部平台为团队提供发布的铺好道路。投资模板与黄金路径。衡量采用并移除未用平台部件。",
  },
  {
    en: "Developer experience covers local setup and feedback speed. Slow tools push people toward shortcuts. Survey teams and fix the top pain points.",
    zh: "开发者体验涵盖本地安装与反馈速度。缓慢工具促使人们走捷径。调查团队并修复最大痛点。",
  },
  {
    en: "Onboarding checklists help new hires become productive. Assign a buddy for the first weeks. Keep the checklist short and current.",
    zh: "入职清单帮助新人提高效率。前几周指定一位伙伴。保持清单简短且最新。",
  },
  {
    en: "Knowledge sharing sessions spread skills across teams. Record talks when remote people cannot attend. Publish notes next to the recording link.",
    zh: "知识分享会把技能扩散到各团队。远程无法参加时录制讲座。在录制链接旁发布笔记。",
  },
  {
    en: "Mentoring pairs experienced people with learners. Set goals for the mentoring period. Check in regularly and adjust the plan.",
    zh: "导师制把有经验者与学习者配对。为辅导期设定目标。定期沟通并调整计划。",
  },
  {
    en: "Career ladders describe growth without mystery. Separate management and technical tracks clearly. Review ladders yearly as the company changes.",
    zh: "职业阶梯描述成长且不神秘。清楚分开管理与技术轨道。公司变化时每年复查阶梯。",
  },
  {
    en: "Hiring rubrics make interviews more consistent. Score evidence not gut feelings alone. Calibrate interviewers so scores mean the same thing.",
    zh: "招聘量表让面试更一致。依据证据而非仅凭直觉打分。校准面试官使分数含义相同。",
  },
  {
    en: "Take home exercises should respect candidate time. Grade with a published checklist. Offer feedback when you reject a candidate.",
    zh: "带回家练习应尊重候选人时间。用公开清单评分。拒绝候选人时提供反馈。",
  },
  {
    en: "Offer letters state role level pay and start date. Align verbal promises with written terms. Keep a record of negotiations and decisions.",
    zh: "录用信写明职位级别薪酬与入职日期。口头承诺与书面条款对齐。保留谈判与决定记录。",
  },
  {
    en: "Remote work needs clear written communication. Over communicate decisions and owners. Create rituals that build trust across time zones.",
    zh: "远程工作需要清晰书面沟通。过度沟通决定与负责人。建立跨时区建立信任的仪式。",
  },
  {
    en: "Office days work best with a clear purpose. Prefer collaboration heavy work for in person time. Publish the schedule early so travel can plan.",
    zh: "到岗日最好有明确目的。面对面时间优先高协作工作。尽早公布日程以便差旅规划。",
  },
  {
    en: "Meeting agendas prevent wandering discussions. End with decisions owners and due dates. Cancel meetings that no longer have a purpose.",
    zh: "会议议程避免讨论跑偏。以决定、负责人与截止日期结束。取消不再有目的的会议。",
  },
  {
    en: "Async updates replace many status meetings. Keep updates short and linked to artifacts. Read updates before asking for a live sync.",
    zh: "异步更新取代许多状态会议。更新宜短并链接到产物。请求实时同步前先阅读更新。",
  },
  {
    en: "Decision records capture important choices and reasons. Store them where future readers will look. Link related tickets and design docs.",
    zh: "决策记录保存重要选择与理由。存放在未来读者会找的地方。链接相关工单与设计文档。",
  },
  {
    en: "Risk registers list threats to a project timeline. Review risks in planning meetings. Escalate early when mitigation is not enough.",
    zh: "风险登记列出对项目时间线的威胁。在规划会议中复查风险。缓解不足时尽早升级。",
  },
  {
    en: "Budgets constrain what a team can buy and hire. Track spend against the plan monthly. Re forecast when scope changes significantly.",
    zh: "预算约束团队可购买与招聘的范围。每月对照计划跟踪支出。范围显著变化时重新预测。",
  },
  {
    en: "Vendor reviews check security cost and lock in. Prefer exit plans before you sign. Rebid contracts when markets move.",
    zh: "供应商评审查安全、成本与锁定。签约前优先退出计划。市场变化时重新招标合同。",
  },
  {
    en: "Open source stewardship keeps community projects healthy. Respond to issues and review contributions. Publish a roadmap the community can trust.",
    zh: "开源维护让社区项目保持健康。回应问题并评审贡献。发布社区可信任的路线图。",
  },
  {
    en: "Code of conduct pages set behavior expectations. Enforce them fairly and promptly. Protect reporters from retaliation.",
    zh: "行为准则页设定行为期望。公平迅速地执行。保护举报者免受报复。",
  },
  {
    en: "Inclusive language welcomes a wider audience. Avoid idioms that do not translate well. Ask for feedback from diverse readers.",
    zh: "包容性语言欢迎更广泛读者。避免不易翻译的习语。向多元读者征求反馈。",
  },
  {
    en: "Plain language laws ask for clarity in public text. Short words beat clever phrases. Test docs with people outside your team.",
    zh: "简明语言要求要求公共文本清晰。短词胜过花哨短语。用团队外的人测试文档。",
  },
  {
    en: "Support macros speed replies without sounding robotic. Personalize with account specific details. Escalate when macros cannot solve the issue.",
    zh: "支持宏加快回复且不显机械。用账户特定细节个性化。宏无法解决问题时升级。",
  },
  {
    en: "Knowledge base articles answer repeated questions. Link them from tickets and chatbots. Retire articles that no longer match the product.",
    zh: "知识库文章回答重复问题。从工单与聊天机器人链接它们。淘汰不再匹配产品的文章。",
  },
  {
    en: "Customer interviews reveal jobs to be done. Ask open questions and listen more than you talk. Capture quotes that explain real pain.",
    zh: "客户访谈揭示待完成工作。提开放问题并多听少说。记录解释真实痛点的原话。",
  },
  {
    en: "Personas summarize audiences without replacing research. Keep personas grounded in evidence. Update them when markets shift.",
    zh: "人物画像概括受众且不取代研究。让画像基于证据。市场变化时更新它们。",
  },
  {
    en: "Journey maps show steps across a whole experience. Mark emotions and failure points along the path. Use the map to prioritize fixes.",
    zh: "旅程图展示完整体验中的步骤。沿路径标记情绪与失败点。用地图优先排序修复。",
  },
  {
    en: "Wireframes explore layout before visual polish. Keep them low fidelity at first. Validate flows before investing in pixels.",
    zh: "线框图在视觉打磨前探索布局。起初保持低保真。投入像素前先验证流程。",
  },
  {
    en: "Design systems share components and tokens. Document usage with do and do not examples. Version the system like any other library.",
    zh: "设计系统共享组件与令牌。用可做与不可做例子记录用法。像其他库一样为系统做版本。",
  },
  {
    en: "Accessibility reviews belong in every design critique. Check contrast focus order and labels. Invite people who use assistive tech when you can.",
    zh: "无障碍评审应进入每次设计评议。检查对比度、焦点顺序与标签。可能时邀请使用辅助技术的人。",
  },
  {
    en: "Motion should clarify not distract. Respect reduced motion preferences. Keep animations short and purposeful.",
    zh: "动效应澄清而非干扰。尊重减少动效偏好。动画宜短且有目的。",
  },
  {
    en: "Dark mode needs its own contrast checks. Do not only invert light colors. Test charts and maps in both themes.",
    zh: "深色模式需要自己的对比度检查。不要只反转浅色。在两种主题下测试图表与地图。",
  },
  {
    en: "Print styles still matter for reports and tickets. Hide navigation and decorative chrome. Ensure page breaks do not split tables badly.",
    zh: "打印样式对报告与工单仍重要。隐藏导航与装饰性界面。确保分页不会严重拆散表格。",
  },
  {
    en: "Offline support helps field and travel users. Cache critical reads and queue writes. Tell users clearly when they are offline.",
    zh: "离线支持帮助现场与差旅用户。缓存关键读取并排队写入。离线时清楚告知用户。",
  },
  {
    en: "Progressive web apps can install on home screens. Service workers power offline caches. Keep update prompts calm and informative.",
    zh: "渐进式网络应用可安装到主屏幕。Service Worker 驱动离线缓存。更新提示宜平静且信息充分。",
  },
  {
    en: "Native apps need store review cycles. Plan release trains around those delays. Share code with web when it reduces risk.",
    zh: "原生应用需要商店审核周期。围绕这些延迟规划发布列车。能降低风险时与网页共享代码。",
  },
  {
    en: "Deep links open the right screen from messages. Handle missing app installs gracefully. Test links on multiple devices and mail clients.",
    zh: "深链接从消息打开正确屏幕。优雅处理未安装应用的情况。在多设备与邮件客户端测试链接。",
  },
  {
    en: "Push notifications must earn attention. Send fewer higher value messages. Offer quiet hours and topic controls.",
    zh: "推送通知必须赢得注意。发送更少但更高价值的消息。提供免打扰时段与主题控制。",
  },
  {
    en: "Email templates should render across major clients. Keep layouts simple and table friendly. Include a plain text alternative always.",
    zh: "邮件模板应在主要客户端渲染。布局宜简单且适合表格。始终包含纯文本替代。",
  },
  {
    en: "SMS is short and expensive compared to email. Use it for urgent authentication and alerts. Avoid marketing spam on SMS channels.",
    zh: "短信相对邮件更短更贵。用于紧急认证与告警。避免在短信渠道做营销骚扰。",
  },
  {
    en: "Chat ops brings alerts into team chat rooms. Thread noisy bots so humans can still talk. Page people only for actionable alerts.",
    zh: "聊天运维把告警带进团队聊天室。把吵闹机器人放进线程以便人仍能交谈。只为可行动告警呼叫人员。",
  },
  {
    en: "Status pages tell customers about incidents. Update them on a steady cadence during outages. Write a clear all clear when service returns.",
    zh: "状态页向客户告知事故。故障期间按稳定节奏更新。服务恢复时写清解除通知。",
  },
  {
    en: "Public APIs need stronger stability promises. Publish deprecation policies with timelines. Offer sandboxes for partners to try safely.",
    zh: "公开 API 需要更强稳定性承诺。公布带时间线的弃用政策。为合作伙伴提供可安全试用的沙箱。",
  },
  {
    en: "Partner portals share docs keys and support contacts. Keep onboarding steps numbered and short. Track partner success with shared metrics.",
    zh: "合作伙伴门户共享文档、密钥与支持联系人。入门步骤宜编号且短。用共享指标跟踪伙伴成功。",
  },
  {
    en: "Marketplace listings need accurate screenshots and permissions. Review third party apps before you promote them. Remove listings that stop receiving updates.",
    zh: "市场列表需要准确截图与权限说明。推广前审查第三方应用。移除停止更新的列表。",
  },
  {
    en: "Billing systems must be correct and auditable. Idempotent charges prevent double billing. Give finance clear export formats.",
    zh: "计费系统必须正确且可审计。幂等扣款防止重复计费。给财务清晰导出格式。",
  },
  {
    en: "Invoices should itemize what customers paid for. Include tax details required by law. Store invoice PDFs for later disputes.",
    zh: "发票应分项列出客户所付内容。包含法律要求的税务细节。保存发票 PDF 以备日后争议。",
  },
  {
    en: "Refunds need clear eligibility rules. Automate simple cases and review edge cases. Notify both customer and finance systems.",
    zh: "退款需要清晰资格规则。自动化简单案例并审查边缘案例。同时通知客户与财务系统。",
  },
  {
    en: "Usage based pricing needs reliable metering. Aggregate events into billable units carefully. Show usage dashboards so bills are not surprises.",
    zh: "按量计费需要可靠计量。小心把事件汇总成计费单位。展示用量仪表盘以免账单意外。",
  },
  {
    en: "Contracts define deliverables timelines and payment terms. Legal and product should review drafts together. Store signed copies in a searchable archive.",
    zh: "合同定义交付物、时间线与付款条款。法务与产品应一起审阅草稿。把已签副本存入可搜索档案。",
  },
  {
    en: "Procurement checks vendors before money is spent. Security and privacy reviews belong in that path. Prefer standard terms when risk is low.",
    zh: "采购在花钱前检查供应商。安全与隐私评审应进入该路径。风险低时优先标准条款。",
  },
  {
    en: "Inventory systems track physical and digital assets. Reconcile counts on a regular cadence. Flag missing assets quickly.",
    zh: "库存系统跟踪实体与数字资产。按规律核对数量。迅速标记缺失资产。",
  },
  {
    en: "Shipping integrations need accurate addresses and weights. Validate addresses before labels print. Track packages and notify on delays.",
    zh: "物流集成需要准确地址与重量。打印标签前校验地址。跟踪包裹并在延误时通知。",
  },
  {
    en: "Warehouse workflows benefit from clear barcodes. Scan events should update inventory in near real time. Design for intermittent network coverage.",
    zh: "仓库流程受益于清晰条码。扫描事件应近实时更新库存。为间歇网络覆盖做设计。",
  },
  {
    en: "Point of sale systems must stay up during peak hours. Queue sales when the network drops. Reconcile offline sales when connectivity returns.",
    zh: "收银系统必须在高峰时段保持可用。网络中断时排队销售。连通恢复后核对离线销售。",
  },
  {
    en: "Loyalty programs reward repeat customers. Keep earning rules simple and fair. Protect points balances like money.",
    zh: "忠诚度计划奖励回头客。积分规则宜简单公平。像金钱一样保护积分余额。",
  },
  {
    en: "Gift cards create deferred revenue liabilities. Track redemptions carefully. Watch for fraud patterns on card numbers.",
    zh: "礼品卡产生递延收入负债。仔细跟踪兑换。留意卡号上的欺诈模式。",
  },
  {
    en: "Coupons should expire and have clear limits. Prevent stacking that destroys margins. Log every redemption for later analysis.",
    zh: "优惠券应过期并有清晰限制。防止叠加破坏利润。记录每次兑换供日后分析。",
  },
  {
    en: "Returns policies balance customer trust and cost. Publish steps and time windows clearly. Inspect returned goods before restocking.",
    zh: "退货政策平衡客户信任与成本。清楚公布步骤与时限。重新入库前检查退货。",
  },
  {
    en: "Quality assurance samples products against standards. Record defects with photos and codes. Feed findings back into manufacturing.",
    zh: "质量保证对照标准抽检产品。用照片与代码记录缺陷。把发现反馈到制造。",
  },
  {
    en: "Safety manuals protect people and machines. Translate critical warnings carefully. Train new operators before solo shifts.",
    zh: "安全手册保护人员与机器。仔细翻译关键警告。单独上岗前培训新操作员。",
  },
  {
    en: "Maintenance schedules prevent expensive downtime. Track parts wear and replacement dates. Stock critical spares near the equipment.",
    zh: "维护计划防止昂贵停机。跟踪零件磨损与更换日期。在设备旁储备关键备件。",
  },
  {
    en: "Sensor data helps predict equipment failures. Calibrate sensors and watch for drift. Combine alerts with human inspection.",
    zh: "传感器数据帮助预测设备故障。校准传感器并观察漂移。把告警与人工检查结合。",
  },
  {
    en: "Energy dashboards show where power is spent. Fix the largest waste first. Re measure after each improvement.",
    zh: "能源仪表盘显示电力花在何处。先修复最大浪费。每次改进后重新测量。",
  },
  {
    en: "Water and waste metrics matter for sustainability goals. Publish progress without greenwashing. Prefer verified third party reports.",
    zh: "水与废弃物指标对可持续目标重要。公布进展且不做漂绿。优先经核实的第三方报告。",
  },
  {
    en: "Carbon accounting needs consistent scopes and methods. Track both direct and purchased energy. Set reduction targets with owners.",
    zh: "碳核算需要一致范围与方法。跟踪直接与外购能源。设定带负责人的减排目标。",
  },
  {
    en: "Open data portals publish datasets for the public. Provide schemas and update schedules. Offer feedback channels for bad data reports.",
    zh: "开放数据门户向公众发布数据集。提供模式与更新计划。为坏数据报告提供反馈渠道。",
  },
  {
    en: "Civic tech projects serve residents not only agencies. Co design with community groups. Measure outcomes that matter locally.",
    zh: "公民科技项目服务居民而非仅机构。与社区团体共同设计。衡量当地重要结果。",
  },
  {
    en: "Education platforms need clear progress signals. Celebrate small wins to keep learners going. Protect student privacy by default.",
    zh: "教育平台需要清晰进度信号。庆祝小胜利以保持学习者动力。默认保护学生隐私。",
  },
  {
    en: "Classroom tools should work on limited bandwidth. Prefer text first content when video fails. Support offline worksheets when possible.",
    zh: "课堂工具应在有限带宽下工作。视频失败时优先文本内容。可能时支持离线作业纸。",
  },
  {
    en: "Homework systems need fair deadlines and extensions. Show rubrics before students begin. Return feedback while the work is still fresh.",
    zh: "作业系统需要公平截止日期与延期。学生开始前展示评分标准。在作业仍新鲜时返回反馈。",
  },
  {
    en: "Parent portals summarize attendance and grades. Keep language clear for non experts. Offer translation for major languages in the community.",
    zh: "家长门户汇总出勤与成绩。对非专家保持语言清晰。为社区主要语言提供翻译。",
  },
  {
    en: "Library catalogs help people find books and media. Accurate metadata beats fancy covers. Offer holds and renewals online.",
    zh: "图书馆目录帮助人们找书与媒体。准确元数据胜过花哨封面。提供线上预约与续借。",
  },
  {
    en: "Museum apps can enrich visits with short stories. Do not force phones into every gallery. Offer quiet modes without sound.",
    zh: "博物馆应用可用短故事丰富参观。不要强迫每间展厅都用手机。提供无声音的安静模式。",
  },
  {
    en: "Travel apps need accurate times across time zones. Show local time clearly next to UTC when needed. Handle daylight saving transitions carefully.",
    zh: "旅行应用需要跨时区准确时间。需要时在 UTC 旁清楚显示本地时间。小心处理夏令时切换。",
  },
  {
    en: "Maps should label roads and landmarks clearly. Offline map packs help remote travel. Recenter controls must stay easy to find.",
    zh: "地图应清楚标注道路与地标。离线地图包帮助偏远旅行。重新居中控件必须易找。",
  },
  {
    en: "Weather widgets fail when they scare without context. Show confidence and update times. Link to detailed forecasts for planning.",
    zh: "天气部件在无上下文惊吓时失败。显示置信度与更新时间。链接详细预报以便规划。",
  },
  {
    en: "Fitness trackers estimate activity with sensors. Be honest about accuracy limits. Let users correct obvious bad readings.",
    zh: "健身追踪器用传感器估计活动。诚实说明精度限制。让用户纠正明显错误读数。",
  },
  {
    en: "Health records require strong access controls. Audit who viewed sensitive charts. Share data only with explicit consent.",
    zh: "健康记录需要强访问控制。审计谁查看了敏感病历。仅在明确同意下共享数据。",
  },
  {
    en: "Telemedicine visits need reliable video and audio. Provide a fallback phone path. Test devices before the appointment starts.",
    zh: "远程医疗问诊需要可靠视频与音频。提供电话备用路径。预约开始前测试设备。",
  },
  {
    en: "Pharmacy systems check interactions and dosages. Alert clinicians without alert fatigue. Keep formularies updated with current stock.",
    zh: "药房系统检查相互作用与剂量。提醒临床医生且避免告警疲劳。用当前库存更新处方集。",
  },
  {
    en: "Lab results should arrive with reference ranges. Flag abnormal values for follow up. Explain next steps in plain language.",
    zh: "化验结果应附参考范围到达。标记异常值以便随访。用简明语言解释下一步。",
  },
  {
    en: "Appointment reminders reduce no shows. Send them at useful lead times. Allow easy reschedule links.",
    zh: "预约提醒减少爽约。在有用提前量发送。提供简易改期链接。",
  },
  {
    en: "Waitlist tools fill canceled slots quickly. Notify patients in priority order. Expire offers so slots do not stay frozen.",
    zh: "候补工具快速填补取消名额。按优先顺序通知患者。让要约过期以免名额冻结。",
  },
  {
    en: "Clinic websites list services hours and directions. Keep phone numbers accurate. Offer translation for common languages nearby.",
    zh: "诊所网站列出服务、时间与路线。保持电话号码准确。为附近常用语言提供翻译。",
  },
  {
    en: "Public health alerts must be timely and precise. Avoid panic while urging action. Cite sources for claims.",
    zh: "公共卫生告警必须及时且精确。在敦促行动时避免恐慌。为主张引用来源。",
  },
  {
    en: "Crisis hotlines need visible entry points. Route callers to trained responders. Log only what policy allows.",
    zh: "危机热线需要显眼入口。把来电者路由到受训应答者。仅记录政策允许的内容。",
  },
  {
    en: "Shelter systems match people to available beds. Respect privacy while coordinating care. Update vacancy data often.",
    zh: "收容系统把人匹配到可用床位。在协调照护时尊重隐私。经常更新空位数据。",
  },
  {
    en: "Food bank inventory tracks donations and distribution. Forecast demand around holidays. Publish needs lists for donors.",
    zh: "食物银行库存跟踪捐赠与分发。在节日前后预测需求。为捐赠者公布需求清单。",
  },
  {
    en: "Volunteer scheduling balances shifts fairly. Send confirmations and reminders. Thank volunteers with specific impact notes.",
    zh: "志愿者排班公平平衡班次。发送确认与提醒。用具体影响说明感谢志愿者。",
  },
  {
    en: "Donation receipts should meet tax rules. Automate issuance after successful charges. Keep donor histories accurate.",
    zh: "捐赠收据应符合税务规则。成功扣款后自动开具。保持捐赠历史准确。",
  },
  {
    en: "Grant reports prove funds were used as promised. Collect metrics continuously not only at the end. Share stories alongside numbers.",
    zh: "资助报告证明资金按承诺使用。持续收集指标而非仅在结束时。在数字旁分享故事。",
  },
  {
    en: "Nonprofit boards need timely financial summaries. Highlight risks and cash runway. Separate operations from restricted funds clearly.",
    zh: "非营利董事会需要及时财务摘要。突出风险与现金跑道。清楚分开运营与受限资金。",
  },
  {
    en: "Advocacy campaigns coordinate messages across channels. Track commitments from decision makers. Archive materials for later campaigns.",
    zh: "倡导活动跨渠道协调信息。跟踪决策者承诺。为后续活动归档材料。",
  },
  {
    en: "Petitions should verify signatures carefully. Show progress toward the goal. Deliver results to the target audience.",
    zh: "请愿应仔细核实签名。展示朝目标的进展。把结果送达目标受众。",
  },
  {
    en: "Town hall meetings work better with timed questions. Publish minutes afterward. Offer remote access when possible.",
    zh: "市政厅会议用限时提问效果更好。会后公布纪要。可能时提供远程接入。",
  },
  {
    en: "Budget hearings need plain summaries for residents. Visualize spending by category. Invite written comments before votes.",
    zh: "预算听证会需要面向居民的简明摘要。按类别可视化支出。投票前邀请书面意见。",
  },
  {
    en: "Transit apps show arrivals delays and disruptions. Crowd source reports when sensors lag. Keep accessibility info next to stop details.",
    zh: "公交应用显示到站、延误与中断。传感器滞后时众包报告。把无障碍信息放在站点详情旁。",
  },
  {
    en: "Bike share systems need station health dashboards. Rebalance bikes before peak hours. Report broken docks quickly.",
    zh: "共享单车系统需要站点健康仪表盘。高峰前重新平衡车辆。迅速报告损坏停靠点。",
  },
  {
    en: "Parking guidance reduces circling for spots. Update occupancy often. Price signals can shift demand.",
    zh: "停车引导减少绕圈找位。经常更新占用情况。价格信号可转移需求。",
  },
  {
    en: "EV chargers need uptime and payment reliability. Show connector types clearly. Queue management helps at busy sites.",
    zh: "电动车充电桩需要可用时间与支付可靠。清楚显示接头类型。繁忙站点需要排队管理。",
  },
  {
    en: "Smart building controls save energy and comfort. Keep overrides simple for facilities staff. Log changes for accountability.",
    zh: "智能楼宇控制节省能源并提升舒适。为设施人员保持覆盖操作简单。记录变更以便问责。",
  },
  {
    en: "Access badges expire when people leave. Disable credentials the same day. Audit doors that stay unlocked after hours.",
    zh: "门禁徽章在人员离开时过期。当天禁用凭证。审计下班后仍解锁的门。",
  },
  {
    en: "Visitor management logs guests and hosts. Print temporary badges with clear dates. Escort policies should match building risk.",
    zh: "访客管理记录客人与接待人。打印带清晰日期的临时徽章。陪同政策应匹配建筑风险。",
  },
  {
    en: "Package rooms need photos and pickup codes. Notify recipients when mail arrives. Purge abandoned items on a schedule.",
    zh: "包裹间需要照片与取件码。邮件到达时通知收件人。按计划清理遗弃物品。",
  },
  {
    en: "Lost and found catalogs items with photos. Set pickup deadlines. Donate unclaimed goods responsibly.",
    zh: "失物招领用照片编目物品。设定取件期限。负责任地捐赠无人认领物品。",
  },
  {
    en: "Event check in should be fast at the door. Support offline badge scanning. Sync attendance when the network returns.",
    zh: "活动签到应在门口快速完成。支持离线徽章扫描。网络恢复时同步出勤。",
  },
  {
    en: "Ticketing systems prevent double booking seats. Hold carts briefly then release. Offer accessible seating options.",
    zh: "票务系统防止座位重复预订。短暂保留购物车后释放。提供无障碍座位选项。",
  },
  {
    en: "Waitlists for popular classes should be transparent. Show position and odds when you can. Auto enroll when seats open if users opt in.",
    zh: "热门课程候补应透明。可能时显示位置与几率。用户选择加入时座位开放自动入学。",
  },
  {
    en: "Course catalogs need accurate prerequisites. Sync enrollment rules with the registrar. Archive old terms without breaking links.",
    zh: "课程目录需要准确先修要求。与注册处同步入学规则。归档旧学期且不破坏链接。",
  },
  {
    en: "Transcripts must be tamper resistant. Offer official and unofficial copies. Encrypt downloads and expire links.",
    zh: "成绩单必须防篡改。提供正式与非正式副本。加密下载并使链接过期。",
  },
  {
    en: "Research repositories store papers and data. Require licenses on uploads. Mint persistent identifiers for citation.",
    zh: "研究库存储论文与数据。上传时要求许可证。为引用铸造持久标识符。",
  },
  {
    en: "Lab notebooks capture methods and results. Timestamp entries and prevent silent edits. Export for audits when required.",
    zh: "实验笔记本记录方法与结果。为条目打时间戳并防止静默编辑。需要时导出供审计。",
  },
  {
    en: "Citation managers keep sources organized. Sync libraries across devices. Format bibliographies to the required style.",
    zh: "文献管理器保持来源有序。跨设备同步库。按要求格式生成参考文献。",
  },
  {
    en: "Peer review platforms track rounds and decisions. Blind or open review must be explicit. Protect reviewer identities when policy requires.",
    zh: "同行评审平台跟踪轮次与决定。盲审或公开评审必须明确。政策要求时保护审稿人身份。",
  },
  {
    en: "Conference CFPs need clear dates and topics. Accept talks with speaker support details. Publish schedules in multiple formats.",
    zh: "会议征稿需要清晰日期与主题。接受演讲时附讲者支持细节。以多种格式发布日程。",
  },
  {
    en: "Speaker portals collect slides and bios. Remind speakers before deadlines. Test AV setups the day before.",
    zh: "讲者门户收集幻灯片与简介。截止日期前提醒讲者。前一天测试音视频设备。",
  },
  {
    en: "Sponsor packages should list benefits clearly. Track deliverables through the event. Send post event reports with metrics.",
    zh: "赞助套餐应清楚列出权益。贯穿活动跟踪交付物。发送带指标的活动后报告。",
  },
  {
    en: "Volunteer checklists keep events running smoothly. Brief teams before doors open. Celebrate wins after teardown.",
    zh: "志愿者清单让活动顺利运转。开门前向团队简报。撤场后庆祝成果。",
  },
  {
    en: "Photography policies respect attendee consent. Offer badge stickers for no photo preferences. Secure raw files after the event.",
    zh: "摄影政策尊重与会者同意。为不拍照偏好提供徽章贴纸。活动后妥善保管原始文件。",
  },
  {
    en: "Livestreams need stable uplink and backups. Moderate chat with clear rules. Archive video with captions when possible.",
    zh: "直播需要稳定上行与备份。用清晰规则管理聊天。可能时把视频连字幕归档。",
  },
  {
    en: "Captioning improves access for many viewers. Prefer human review for important sessions. Offer transcripts for search later.",
    zh: "字幕提升许多观众的可及性。重要场次优先人工审校。提供文字稿以便日后搜索。",
  },
  {
    en: "Translation booths support multilingual audiences. Share glossaries with interpreters early. Record which languages were offered.",
    zh: "同传厢支持多语言听众。尽早与口译员共享术语表。记录提供了哪些语言。",
  },
  {
    en: "Surveys after events measure satisfaction. Keep them short and mobile friendly. Share results with organizers and speakers.",
    zh: "活动后调查衡量满意度。保持简短且适合手机。与组织者与讲者分享结果。",
  },
  {
    en: "Community guidelines keep forums healthy. Moderate with consistent standards. Explain removals when you can.",
    zh: "社区准则保持论坛健康。用一致标准管理。可能时解释移除原因。",
  },
  {
    en: "Reputation systems reward helpful contributions. Guard against brigading and sock puppets. Reset scores when abuse is proven.",
    zh: "声誉系统奖励有帮助的贡献。防范刷分与马甲。证实滥用时重置分数。",
  },
  {
    en: "Moderation queues prioritize severe reports. Dual review reduces single moderator bias. Appeal paths should exist for bans.",
    zh: "管理队列优先处理严重举报。双人审阅减少单一版主偏见。封禁应有申诉路径。",
  },
  {
    en: "Block lists and mute tools give users control. Defaults should protect without hiding everything. Explain how to undo accidental blocks.",
    zh: "屏蔽与静音工具给用户控制权。默认应保护且不隐藏一切。说明如何撤销误屏蔽。",
  },
  {
    en: "Age gates protect younger users from adult content. Verify ages with appropriate methods. Design experiences that fit each age band.",
    zh: "年龄门槛保护未成年远离成人内容。用合适方法验证年龄。设计适合各年龄段的体验。",
  },
  {
    en: "Parental controls should be understandable. Avoid dark patterns that trap families. Provide clear unlock paths for adults.",
    zh: "家长控制应易于理解。避免困住家庭的黑暗模式。为成人提供清晰解锁路径。",
  },
  {
    en: "Safety centers collect help resources in one place. Localize emergency numbers carefully. Keep content reviewed by experts.",
    zh: "安全中心把求助资源集中一处。仔细本地化紧急电话。保持内容由专家审阅。",
  },
  {
    en: "Trust and safety teams need clear playbooks. Escalate novel threats quickly. Measure both precision and recall of enforcement.",
    zh: "信任与安全团队需要清晰剧本。迅速升级新颖威胁。衡量执法精确率与召回率。",
  },
  {
    en: "Fraud detection scores risky actions in real time. Combine rules with machine learned signals. Review false positives to tune thresholds.",
    zh: "欺诈检测实时给风险行为打分。把规则与机器学习信号结合。审查误报以调整阈值。",
  },
  {
    en: "Chargeback workflows need evidence packages. Respond within network deadlines. Learn patterns to prevent repeats.",
    zh: "拒付流程需要证据包。在网络时限内响应。学习模式以防重复。",
  },
  {
    en: "KYC checks verify customer identity where required. Minimize data collection for the risk level. Secure stored identity documents.",
    zh: "KYC 检查在需要处核实客户身份。按风险级别尽量少收集数据。妥善保管身份证件。",
  },
  {
    en: "AML monitoring looks for suspicious money flows. Alert compliance with actionable context. Retrain models as typologies evolve.",
    zh: "反洗钱监控查找可疑资金流。向合规告警并提供可行动上下文。类型演变时重新训练模型。",
  },
  {
    en: "Sanctions screening blocks prohibited parties. Keep lists fresh and performant. Handle fuzzy name matches carefully.",
    zh: "制裁筛查阻止被禁对象。保持名单新鲜且性能良好。小心处理模糊姓名匹配。",
  },
  {
    en: "Trade compliance tracks export controls. Classify products and destinations correctly. Train staff who ship internationally.",
    zh: "贸易合规跟踪出口管制。正确分类产品与目的地。培训从事国际发货的人员。",
  },
  {
    en: "Customs documents must match shipment contents. Automate forms when volume is high. Keep broker contacts up to date.",
    zh: "海关文件必须与货物内容一致。量大时自动化表格。保持报关行联系方式最新。",
  },
  {
    en: "Tariff engines calculate duties from rules tables. Version the tables with effective dates. Audit samples of calculated results.",
    zh: "关税引擎根据规则表计算关税。用生效日期为表做版本。抽审计算结果样本。",
  },
  {
    en: "Supply chain visibility tracks goods in motion. Share ETAs with buyers early. Flag delays before they surprise customers.",
    zh: "供应链可见性跟踪在途货物。尽早与买家分享预计到达。在延误惊吓客户前标记。",
  },
  {
    en: "Supplier scorecards measure quality and delivery. Share scores in regular business reviews. Reward improvement not only volume.",
    zh: "供应商记分卡衡量质量与交付。在定期业务评审中分享分数。奖励改进而非仅销量。",
  },
  {
    en: "Purchase orders lock price quantity and dates. Match invoices to orders before payment. Investigate mismatches quickly.",
    zh: "采购订单锁定价格数量与日期。付款前把发票与订单匹配。迅速调查不匹配。",
  },
  {
    en: "Three way match compares order receipt and invoice. Automate clear matches. Route exceptions to humans.",
    zh: "三单匹配比较订单、收货与发票。自动化清晰匹配。把例外交给人工。",
  },
  {
    en: "Accounts payable aging shows what you owe. Prioritize discounts and critical vendors. Forecast cash needs from the schedule.",
    zh: "应付账款账龄显示你欠什么。优先折扣与关键供应商。从计划预测现金需求。",
  },
  {
    en: "Accounts receivable aging shows what customers owe. Escalate overdue balances politely then firmly. Offer payment plans when policy allows.",
    zh: "应收账款账龄显示客户欠什么。先礼貌后坚决地升级逾期余额。政策允许时提供付款计划。",
  },
  {
    en: "Cash flow forecasts combine inflows and outflows. Update them when large deals move. Keep a buffer for surprises.",
    zh: "现金流预测结合流入与流出。大交易变动时更新。为意外保留缓冲。",
  },
  {
    en: "Treasury policies set investment and debt limits. Separate duties for approvals and execution. Report positions to leadership regularly.",
    zh: "资金政策设定投资与债务限额。审批与执行职责分离。定期向领导层报告头寸。",
  },
  {
    en: "Internal audit samples controls for effectiveness. Findings should be specific and actionable. Track remediation to closure.",
    zh: "内部审计抽查控制有效性。发现应具体且可行动。跟踪整改直至关闭。",
  },
  {
    en: "External auditors need timely evidence packages. Centralize document collection. Avoid last minute surprises in fieldwork.",
    zh: "外部审计需要及时证据包。集中收集文件。避免现场工作最后一刻意外。",
  },
  {
    en: "Board packets arrive with enough reading time. Highlight decisions needed in the meeting. Append deep dives for those who want more.",
    zh: "董事会材料应有足够阅读时间到达。突出会议需要的决定。为想深入者附加详细材料。",
  },
  {
    en: "Minutes capture motions votes and action items. Circulate drafts for correction quickly. Store approved minutes securely.",
    zh: "会议纪要记录动议、表决与行动项。迅速传阅草稿以便更正。安全存放已批准纪要。",
  },
  {
    en: "Bylaws define how an organization governs itself. Train new directors on key clauses. Amend carefully with proper votes.",
    zh: "章程定义组织如何自我治理。就关键条款培训新董事。以适当表决谨慎修订。",
  },
  {
    en: "Conflict of interest policies require disclosure. Recuse people from related votes. Keep disclosure forms current each year.",
    zh: "利益冲突政策要求披露。让相关人员回避相关表决。每年保持披露表最新。",
  },
  {
    en: "Whistleblower channels must be confidential and safe. Investigate claims promptly and fairly. Protect good faith reporters.",
    zh: "举报渠道必须保密且安全。迅速公平调查主张。保护善意举报者。",
  },
  {
    en: "Ethics training renews awareness of expected conduct. Use realistic scenarios not only slides. Track completion without shaming people.",
    zh: "道德培训更新对期望行为的意识。使用真实场景而非仅幻灯片。跟踪完成情况且不羞辱人。",
  },
  {
    en: "Records management sets retention and destruction rules. Hold records when litigation is pending. Prove destruction when schedules require it.",
    zh: "记录管理设定保留与销毁规则。诉讼未决时保留记录。计划要求时证明已销毁。",
  },
  {
    en: "E discovery collects documents for legal cases. Preserve relevant systems early. Cull duplicates before review to save cost.",
    zh: "电子取证为法律案件收集文件。尽早保全相关系统。审查前去重以节省成本。",
  },
  {
    en: "Legal hold notices freeze deletion for custodians. Track acknowledgements. Release holds when cases close.",
    zh: "法律保留通知冻结保管人删除。跟踪确认。案件结束时解除保留。",
  },
  {
    en: "Contract lifecycle tools manage drafts approvals and renewals. Alert owners before terms expire. Store searchable final PDFs.",
    zh: "合同生命周期工具管理草稿、审批与续约。条款到期前提醒负责人。存放可搜索的最终 PDF。",
  },
  {
    en: "Clause libraries speed contract drafting. Keep clauses reviewed by counsel. Version clauses when laws change.",
    zh: "条款库加快合同起草。保持条款经律师审阅。法律变化时为条款做版本。",
  },
  {
    en: "Signature workflows collect the right signers in order. Verify identity for high risk deals. Archive certificates of completion.",
    zh: "签名流程按顺序收集正确签署人。高风险交易核实身份。归档完成证明。",
  },
  {
    en: "Patent filings protect inventions for a limited time. Work with counsel on claims language. Track maintenance fees carefully.",
    zh: "专利申请在有限时间内保护发明。与律师合作撰写权利要求。仔细跟踪维持费。",
  },
  {
    en: "Trademarks protect brand names and logos. Search before you launch publicly. Enforce against confusingly similar marks.",
    zh: "商标保护品牌名与标志。公开发布前先检索。对易混淆近似标志执行权利。",
  },
  {
    en: "Copyright covers original creative works automatically. Register when enforcement needs are higher. Respect licenses when you reuse others work.",
    zh: "版权自动覆盖原创作品。执行需求更高时进行登记。复用他人作品时尊重许可。",
  },
  {
    en: "Trade secrets stay valuable through secrecy. Limit access and use agreements. Investigate leaks quickly.",
    zh: "商业秘密通过保密保持价值。限制访问并使用协议。迅速调查泄露。",
  },
  {
    en: "Open source notices must ship with binaries when required. Keep attribution text accurate. Automate notice generation in builds.",
    zh: "开源声明在需要时必须随二进制发布。保持署名文本准确。在构建中自动生成声明。",
  },
  {
    en: "Contributor license agreements clarify IP from outside patches. Offer a clear alternative for small fixes. Store signed CLAs with the project.",
    zh: "贡献者许可协议澄清外部补丁的知识产权。为小修复提供清晰替代。把已签 CLA 与项目一起存放。",
  },
  {
    en: "Security champions embed practices inside product teams. Give them time and training. Celebrate catches that prevented incidents.",
    zh: "安全倡导者把实践嵌入产品团队。给予时间与培训。庆祝避免事故的发现。",
  },
  {
    en: "Bug bashes invite the whole company to find issues. Scope the target build clearly. Triage findings the same week.",
    zh: "缺陷攻坚邀请全公司找问题。清楚界定目标构建范围。同一周内分拣发现。",
  },
  {
    en: "Dogfooding means using your own product daily. Capture friction in a shared backlog. Fix dogfood pain before customers feel it.",
    zh: "自用测试意味着每天使用自己的产品。把摩擦记入共享待办。在客户感受前修复自用痛点。",
  },
  {
    en: "Beta programs gather feedback from willing users. Set expectations about stability. Close the loop when you ship their requests.",
    zh: "测试计划从愿意的用户收集反馈。设定关于稳定性的期望。在交付他们的需求时闭环。",
  },
  {
    en: "Early access gates unfinished features carefully. Collect telemetry with consent. Exit criteria should be written before launch.",
    zh: "早期访问谨慎限制未完成功能。在同意下收集遥测。上线前写好退出标准。",
  },
  {
    en: "Launch checklists cover docs support and marketing. Assign a single launch owner. Hold a go no go meeting with clear votes.",
    zh: "上线清单覆盖文档、支持与市场。指定单一上线负责人。举行有明确表决的是否上线会议。",
  },
  {
    en: "War rooms coordinate responses during major launches. Keep a single source of truth channel. Rotate tired people out of the room.",
    zh: "战时指挥室在重大上线期间协调响应。保持单一事实来源频道。把疲惫的人轮换出房间。",
  },
  {
    en: "Hotfixes patch urgent production bugs. Keep the change tiny and reviewed. Backport to release branches when needed.",
    zh: "热修复紧急修补生产缺陷。保持变更很小且经评审。需要时回移植到发布分支。",
  },
  {
    en: "Forward fixes land on main then flow to releases. Prefer them when process allows. Document which releases received the fix.",
    zh: "正向修复先落在主分支再流向发布。流程允许时优先采用。记录哪些发布收到了修复。",
  },
  {
    en: "Release trains ship on a predictable cadence. Scope features to fit the train. Missed trains wait for the next one.",
    zh: "发布列车按可预测节奏发车。把功能范围调整到适合列车。错过的列车等待下一班。",
  },
  {
    en: "Feature freezes stop risky changes before milestones. Announce freeze windows early. Allow only approved exception fixes.",
    zh: "功能冻结在里程碑前停止高风险变更。尽早宣布冻结窗口。只允许批准的例外修复。",
  },
  {
    en: "Code freezes are stricter than feature freezes. Limit merges to the release branch. Plan holiday coverage during freezes.",
    zh: "代码冻结比功能冻结更严格。限制向发布分支合并。冻结期间规划假期覆盖。",
  },
  {
    en: "Stabilization periods focus on bugs not features. Track burn down of open defects. Raise the bar for new work entering.",
    zh: "稳定期关注缺陷而非功能。跟踪未解决缺陷燃尽。提高新工作进入的门槛。",
  },
  {
    en: "Release candidates are build candidates for shipping. Test them like production. Promote only after checklist completion.",
    zh: "发布候选是准备发货的构建候选。像生产一样测试它们。仅在清单完成后提升。",
  },
  {
    en: "Golden images capture known good machine states. Rebuild them on a schedule. Scan images for vulnerabilities before reuse.",
    zh: "黄金镜像捕获已知良好机器状态。按计划重建它们。复用前扫描镜像漏洞。",
  },
  {
    en: "Infrastructure as code describes servers in files. Review changes like application code. Apply changes through pipelines not by hand.",
    zh: "基础设施即代码用文件描述服务器。像应用代码一样评审变更。通过流水线而非手工应用变更。",
  },
  {
    en: "Terraform plans show what will change before apply. Store state securely with locking. Break large stacks into smaller ones.",
    zh: "Terraform 计划在应用前显示将变更内容。安全存放状态并加锁。把大堆栈拆成更小的。",
  },
  {
    en: "Kubernetes schedules containers across a cluster. Set resource requests and limits wisely. Use readiness probes before sending traffic.",
    zh: "Kubernetes 在集群上调度容器。明智设定资源请求与限制。发送流量前使用就绪探针。",
  },
  {
    en: "Helm charts package Kubernetes applications. Pin chart versions for stability. Values files should stay readable.",
    zh: "Helm chart 打包 Kubernetes 应用。锁定 chart 版本以保稳定。取值文件应保持可读。",
  },
  {
    en: "Service meshes add traffic policy and mTLS. Start simple before advanced routing. Watch proxy CPU cost carefully.",
    zh: "服务网格增加流量策略与 mTLS。在高级路由前先保持简单。仔细观察代理 CPU 成本。",
  },
  {
    en: "Ingress controllers terminate TLS and route HTTP. Keep certificates renewed automatically. Rate limit at the edge when needed.",
    zh: "入口控制器终止 TLS 并路由 HTTP。保持证书自动续期。需要时在边缘限速。",
  },
  {
    en: "DNS records must match where traffic should go. Lower TTLs before planned cutovers. Verify propagation before celebrating.",
    zh: "DNS 记录必须匹配流量应去之处。计划切换前降低 TTL。庆祝前验证传播。",
  },
  {
    en: "CDN caches bring content closer to users. Purge carefully after releases. Protect origins from direct abuse.",
    zh: "CDN 缓存把内容带到更靠近用户处。发布后小心刷新。保护源站免受直接滥用。",
  },
  {
    en: "WAF rules block common web attacks. Tune to reduce false positives. Log blocks for later analysis.",
    zh: "WAF 规则阻止常见网络攻击。调优以减少误报。记录拦截供日后分析。",
  },
  {
    en: "DDoS protection absorbs volumetric floods. Practice runbooks with your provider. Keep alternate paths ready.",
    zh: "DDoS 防护吸收流量型洪水。与供应商演练手册。保持备用路径就绪。",
  },
  {
    en: "Bot management distinguishes humans from scripts. Challenge suspicious clients gently. Allow good bots that you need.",
    zh: "机器人管理区分人类与脚本。温和挑战可疑客户端。允许你需要的好机器人。",
  },
  {
    en: "Edge computing runs logic near users. Keep edge functions small and stateless. Sync critical writes back to core systems.",
    zh: "边缘计算在靠近用户处运行逻辑。保持边缘函数小且无状态。把关键写入同步回核心系统。",
  },
  {
    en: "IoT fleets need secure device identity. Rotate device credentials. Plan for intermittent connectivity.",
    zh: "物联网机群需要安全设备身份。轮换设备凭证。为间歇连接做计划。",
  },
  {
    en: "OTA updates patch devices in the field. Stage rollouts and watch failure rates. Keep a last known good firmware.",
    zh: "空中更新在现场修补设备。分阶段放量并观察失败率。保留已知良好固件。",
  },
  {
    en: "Digital twins mirror physical assets in software. Keep models updated with sensor feeds. Use twins for what if planning.",
    zh: "数字孪生在软件中镜像实体资产。用传感器馈送保持模型更新。用孪生做假设规划。",
  },
  {
    en: "Simulation environments test rare failure modes. Make them cheap to recreate. Share scenarios across teams.",
    zh: "仿真环境测试罕见故障模式。让它们廉价可重建。跨团队共享场景。",
  },
  {
    en: "Chaos engineering injects failures on purpose. Start in non production then expand carefully. Always have a stop switch.",
    zh: "混沌工程故意注入故障。先从非生产开始再谨慎扩大。始终有停止开关。",
  },
  {
    en: "Game days rehearse incidents with a schedule. Assign roles like in a real event. Write improvements into the backlog after.",
    zh: "演练日按计划排练事故。像真实事件一样分配角色。之后把改进写入待办。",
  },
  {
    en: "Tabletop exercises talk through scenarios without touching systems. They find gaps in communication. Follow up with technical drills.",
    zh: "桌面演练不碰系统只走场景。它们发现沟通缺口。随后进行技术演练。",
  },
  {
    en: "Business continuity keeps critical work going during disruption. Identify essential processes first. Test alternate sites and staff plans.",
    zh: "业务连续性在中断期间维持关键工作。先识别必要流程。测试备用站点与人员计划。",
  },
  {
    en: "Insurance policies transfer some residual risk. Know what is covered and what is not. Update coverage as the business grows.",
    zh: "保险保单转移部分剩余风险。知道什么在保什么不在。业务增长时更新保障。",
  },
  {
    en: "Crisis communications speak with one calm voice. Prepare templates before you need them. Update customers more often than feels comfortable.",
    zh: "危机沟通用一个冷静声音说话。在需要前准备模板。比感觉舒服更频繁地更新客户。",
  },
  {
    en: "Brand guidelines keep visual identity consistent. Provide downloadable assets and examples. Review partner materials for compliance.",
    zh: "品牌指南保持视觉识别一致。提供可下载资产与例子。审查合作伙伴材料是否合规。",
  },
  {
    en: "Press kits give journalists accurate facts. Keep bios photos and boilerplate ready. Respond quickly to correction requests.",
    zh: "新闻资料包给记者准确事实。准备好简介、照片与标准表述。迅速响应更正请求。",
  },
  {
    en: "Social media policies set voice and escalation paths. Separate personal and brand accounts clearly. Archive posts required by regulation.",
    zh: "社交媒体政策设定语气与升级路径。清楚分开个人与品牌账号。按法规要求归档帖子。",
  },
  {
    en: "Community managers welcome newcomers and guide norms. Highlight great contributions publicly. Enforce rules without public humiliation.",
    zh: "社区经理欢迎新人并引导规范。公开突出优秀贡献。执行规则且不做公开羞辱。",
  },
  {
    en: "Ambassador programs empower expert users. Give them early access and recognition. Listen when they report friction.",
    zh: "大使计划赋能专家用户。给予早期访问与认可。他们报告摩擦时倾听。",
  },
  {
    en: "User groups host local meetups and talks. Offer speakers and venue support. Capture notes for people who could not attend.",
    zh: "用户组举办本地聚会与讲座。提供讲者与场地支持。为无法参加者记录笔记。",
  },
  {
    en: "Hackathons spark prototypes and hiring interest. Define judging criteria up front. Help winning ideas find a path after the event.",
    zh: "黑客松激发原型与招聘兴趣。事先定义评审标准。帮助获奖想法在活动后找到路径。",
  },
  {
    en: "Internal hack weeks recharge teams and explore ideas. Protect calendar time for deep work. Demo day should feel celebratory.",
    zh: "内部黑客周让团队充电并探索想法。为深度工作保护日历时间。演示日应有庆祝感。",
  },
  {
    en: "Idea portals collect suggestions from anyone. Triage with product and engineering. Close the loop when ideas ship or decline.",
    zh: "想法门户收集任何人的建议。由产品与工程分拣。想法上线或拒绝时闭环。",
  },
  {
    en: "Roadmap voting can mislead if only loud users vote. Weight feedback with research. Explain how votes influence priorities.",
    zh: "路线图投票若仅有响应用户投票会误导。用研究加权反馈。解释投票如何影响优先级。",
  },
  {
    en: "Customer advisory boards give strategic input. Meet on a regular cadence. Act on themes not only individual asks.",
    zh: "客户顾问委员会提供战略输入。按规律会面。按主题而非仅个人要求行动。",
  },
  {
    en: "NPS surveys measure willingness to recommend. Follow up with detractors personally. Track drivers behind the scores.",
    zh: "NPS 调查衡量推荐意愿。亲自跟进贬损者。跟踪分数背后的驱动因素。",
  },
  {
    en: "CSAT scores capture satisfaction after interactions. Ask while the experience is fresh. Share trends with frontline teams.",
    zh: "CSAT 分数捕捉互动后的满意度。在体验仍新鲜时提问。与一线团队分享趋势。",
  },
  {
    en: "CES measures how easy a task felt. Lower effort often raises loyalty. Fix the hardest steps first.",
    zh: "CES 衡量任务感觉有多容易。更低费力常提升忠诚。先修复最难步骤。",
  },
  {
    en: "Churn analysis finds why customers leave. Combine quantitative and qualitative signals. Assign owners to top churn drivers.",
    zh: "流失分析找出客户离开原因。结合定量与定性信号。为主要流失驱动指定负责人。",
  },
  {
    en: "Expansion revenue grows accounts that already trust you. Spot unused capacity and new use cases. Time asks after clear wins.",
    zh: "扩展收入来自已信任你的账户增长。发现未用容量与新用例。在明确胜利后再提出请求。",
  },
  {
    en: "Onboarding journeys teach the first success path. Remove steps that do not help activation. Celebrate the first meaningful outcome.",
    zh: "入门旅程教导第一条成功路径。移除无助于激活的步骤。庆祝第一个有意义结果。",
  },
  {
    en: "Activation metrics mark when value starts. Define them with product and data teams. Instrument events before you optimize.",
    zh: "激活指标标记价值何时开始。与产品与数据团队一起定义。优化前先埋点事件。",
  },
  {
    en: "Retention cohorts show who stays over time. Compare channels and plans carefully. Invest where retention is healthiest.",
    zh: "留存队列显示谁随时间留下。仔细比较渠道与套餐。投资留存最健康之处。",
  },
  {
    en: "Referral programs reward users who invite others. Prevent self referral abuse. Pay rewards only after qualified actions.",
    zh: "推荐计划奖励邀请他人的用户。防止自我推荐滥用。仅在合格行动后支付奖励。",
  },
  {
    en: "Affiliate tracking attributes sales to partners. Use durable click identifiers. Disclose relationships where required.",
    zh: "联盟跟踪把销售归因到合作伙伴。使用持久点击标识。在需要处披露关系。",
  },
  {
    en: "Ad campaigns need clear goals and budgets. Track conversions not only clicks. Pause ads that waste spend.",
    zh: "广告活动需要清晰目标与预算。跟踪转化而非仅点击。暂停浪费支出的广告。",
  },
  {
    en: "Landing pages should match ad promises. One primary call to action works best. Test headlines with real traffic.",
    zh: "落地页应匹配广告承诺。一个主要行动号召效果最好。用真实流量测试标题。",
  },
  {
    en: "SEO improves discovery through useful content. Earn links with genuine value. Avoid tricks that search engines punish.",
    zh: "SEO 通过有用内容改善发现。用真正价值赢得链接。避免搜索引擎惩罚的伎俩。",
  },
  {
    en: "Content calendars plan publishing cadence. Balance evergreen and timely pieces. Repurpose strong posts across channels.",
    zh: "内容日历规划发布节奏。平衡常青与时效内容。把强帖跨渠道再利用。",
  },
  {
    en: "Editorial standards keep brand voice consistent. Fact check claims before publishing. Correct errors publicly when needed.",
    zh: "编辑标准保持品牌语气一致。发布前核实主张。需要时公开更正错误。",
  },
  {
    en: "Style guides for writers cover tone and terms. Provide examples of good and bad lines. Update the guide as the product evolves.",
    zh: "写作者风格指南覆盖语气与术语。提供好坏句子例子。产品演进时更新指南。",
  },
  {
    en: "Glossary pages define product vocabulary. Link terms from docs and UI. Keep translations aligned with the glossary.",
    zh: "术语表页定义产品词汇。从文档与界面链接术语。保持译文与术语表对齐。",
  },
  {
    en: "Release blogs announce what is new. Show screenshots and short demos. Invite feedback in comments or a form.",
    zh: "发布博客宣布新内容。展示截图与短演示。在评论或表单中邀请反馈。",
  },
  {
    en: "Case studies tell customer success stories. Get written approval before publishing. Quantify outcomes when customers allow it.",
    zh: "案例研究讲述客户成功故事。发布前获得书面批准。客户允许时量化结果。",
  },
  {
    en: "White papers explore a topic in depth. Gate downloads only when sales needs leads. Offer an ungated summary for wider reach.",
    zh: "白皮书深入探讨一个主题。仅在销售需要线索时设下载门槛。提供未设门槛摘要以扩大触达。",
  },
  {
    en: "Webinars educate and generate interest. Practice the dry run including screen share. Send slides and recording afterward.",
    zh: "网络研讨会教育并产生兴趣。包括屏幕共享做彩排。会后发送幻灯片与录制。",
  },
  {
    en: "Podcasts build audience through conversation. Edit for clarity without losing personality. Publish show notes with timestamps.",
    zh: "播客通过对话建立受众。为清晰剪辑且不失去个性。发布带时间戳的节目说明。",
  },
  {
    en: "Newsletters earn attention in crowded inboxes. Lead with the most useful link. Make unsubscribe easy and respected.",
    zh: "新闻通讯在拥挤收件箱中赢得注意。以最有用链接开头。让退订容易且受尊重。",
  },
  {
    en: "Community forums need searchable archives. Tag threads by product area. Highlight solved answers for future readers.",
    zh: "社区论坛需要可搜索档案。按产品区域为帖子打标签。为未来读者突出已解决答案。",
  },
  {
    en: "Chatbots handle simple questions at scale. Escalate to humans when confidence is low. Learn from transcripts with privacy care.",
    zh: "聊天机器人大规模处理简单问题。置信度低时升级到人工。在注意隐私下从对话学习。",
  },
  {
    en: "Knowledge graphs connect entities and relations. They power richer search and recommendations. Keep graph quality with curation workflows.",
    zh: "知识图谱连接实体与关系。它们驱动更丰富搜索与推荐。用策展工作流保持图谱质量。",
  },
  {
    en: "Recommendation systems suggest next actions or items. Explain why when users might distrust the list. Allow easy dismissal of bad suggestions.",
    zh: "推荐系统建议下一步行动或条目。用户可能不信任列表时解释原因。允许轻易忽略坏建议。",
  },
  {
    en: "Personalization should feel helpful not creepy. Prefer on device signals when possible. Give users controls over personalization.",
    zh: "个性化应有帮助而非令人毛骨悚然。可能时优先设备端信号。给用户个性化控制。",
  },
  {
    en: "Privacy dashboards show what data you hold. Offer download and delete requests. Complete requests within promised timelines.",
    zh: "隐私仪表盘显示你持有的数据。提供下载与删除请求。在承诺时限内完成请求。",
  },
  {
    en: "Consent banners must be honest and usable. Equal weight for accept and reject when required. Store consent proof with timestamps.",
    zh: "同意横幅必须诚实且可用。需要时接受与拒绝同等权重。用时间戳存储同意证明。",
  },
  {
    en: "Cookie policies explain tracking technologies. Categorize cookies by purpose. Update the policy when vendors change.",
    zh: "Cookie 政策解释跟踪技术。按目的分类 cookie。供应商变化时更新政策。",
  },
  {
    en: "Data processing agreements bind vendors to rules. Review subprocessors lists regularly. Exit if a vendor cannot meet standards.",
    zh: "数据处理协议约束供应商遵守规则。定期审查子处理方名单。若供应商无法达标则退出。",
  },
  {
    en: "Breach notification clocks start when you confirm an incident. Prepare contact trees in advance. Practice drafting notices before a real event.",
    zh: "确认事故后开始违规通知计时。提前准备联系树。在真实事件前练习起草通知。",
  },
  {
    en: "Table stakes security includes patching and backups. Do the boring basics every week. Fancy tools do not replace fundamentals.",
    zh: "基本盘安全包括打补丁与备份。每周做枯燥基础工作。花哨工具不能取代基本功。",
  },
  {
    en: "Zero trust assumes breach and verifies continuously. Authenticate every request strongly. Limit lateral movement with segmentation.",
    zh: "零信任假设已失陷并持续验证。强认证每个请求。用分段限制横向移动。",
  },
  {
    en: "Privileged access workstations harden admin activity. Separate email browsing from admin tasks. Record sessions for sensitive changes.",
    zh: "特权访问工作站加固管理活动。把邮件浏览与管理任务分开。为敏感变更录制会话。",
  },
  {
    en: "Just in time access grants privileges temporarily. Require tickets and approvals. Expire grants automatically.",
    zh: "即时访问临时授予特权。要求工单与审批。自动使授权过期。",
  },
  {
    en: "Secrets scanning stops keys from landing in git. Block pushes that contain high entropy secrets. Rotate anything that already leaked.",
    zh: "密钥扫描阻止密钥进入 git。阻止包含高熵密钥的推送。轮换任何已泄露内容。",
  },
  {
    en: "Container scanning finds vulnerable packages in images. Fail builds on critical findings. Rebuild base images often.",
    zh: "容器扫描发现镜像中的脆弱包。对严重发现使构建失败。经常重建基础镜像。",
  },
  {
    en: "Infrastructure scanning checks cloud misconfigurations. Fix public buckets and open security groups first. Track exceptions with expiry dates.",
    zh: "基础设施扫描检查云错误配置。先修复公开存储桶与开放安全组。用到期日跟踪例外。",
  },
  {
    en: "Penetration tests simulate attacker techniques. Scope carefully and schedule windows. Remediate findings with owners and dates.",
    zh: "渗透测试模拟攻击者技术。仔细界定范围并安排窗口。由负责人与日期整改发现。",
  },
  {
    en: "Red teams operate like adversaries over longer periods. Share lessons without exposing sensitive methods publicly. Invest in detection based on what they find.",
    zh: "红队在更长时间像对手一样行动。分享教训且不公开敏感方法。根据他们的发现投资检测。",
  },
  {
    en: "Blue teams defend and detect every day. Tune alerts to reduce noise. Celebrate quiet periods that still stay vigilant.",
    zh: "蓝队每天防御与检测。调优告警以减少噪音。庆祝仍保持警惕的安静期。",
  },
  {
    en: "Purple teaming blends attack and defense learning. Run joint exercises with shared goals. Turn findings into detection content quickly.",
    zh: "紫队结合攻防学习。以共享目标进行联合演练。迅速把发现变成检测内容。",
  },
  {
    en: "Threat intelligence informs what to watch for. Prefer actionable intel over noise. Share relevant bits with on call engineers.",
    zh: "威胁情报告知应关注什么。优先可行动情报而非噪音。与值班工程师分享相关片段。",
  },
  {
    en: "Vulnerability management tracks issues to closure. Score with severity and exploitability. Prove fixes with retests.",
    zh: "漏洞管理跟踪问题直至关闭。用严重性与可利用性评分。用复测证明修复。",
  },
  {
    en: "Patch Tuesday habits keep desktops current. Stage patches then deploy widely. Have rollback plans for bad updates.",
    zh: "补丁星期二习惯保持桌面最新。先暂存补丁再广泛部署。为坏更新准备回滚计划。",
  },
  {
    en: "Endpoint detection watches laptops and servers for threats. Respond quickly to high confidence alerts. Isolate hosts when needed.",
    zh: "终端检测观察笔记本与服务器威胁。对高置信告警迅速响应。需要时隔离主机。",
  },
  {
    en: "Mobile device management enforces policies on phones. Separate work and personal data when possible. Wipe lost devices according to policy.",
    zh: "移动设备管理在手机上执行策略。可能时分开工作与个人数据。按政策擦除丢失设备。",
  },
  {
    en: "Browser isolation reduces risk from risky sites. Use it for high risk roles first. Measure productivity impact honestly.",
    zh: "浏览器隔离降低风险站点危害。先用于高风险角色。诚实衡量生产力影响。",
  },
  {
    en: "Secure coding training builds safer habits. Practice with realistic vulnerable apps. Measure improvement with fewer repeat bug classes.",
    zh: "安全编码培训建立更安全习惯。用真实脆弱应用练习。用更少重复缺陷类别衡量改进。",
  },
  {
    en: "Threat modeling workshops fit in design reviews. Use a simple method the team will repeat. Capture mitigations as tickets.",
    zh: "威胁建模工作坊适合设计评审。使用团队会重复的简单方法。把缓解措施记为工单。",
  },
  {
    en: "Abuse cases describe how features can be misused. Write them beside happy path stories. Build guards for the worst plausible abuse.",
    zh: "滥用案例描述功能如何被误用。写在开心路径故事旁边。为最坏合理滥用建立防护。",
  },
  {
    en: "Security questionnaires arrive from enterprise buyers. Keep a living answer library. Escalate novel questions to experts.",
    zh: "安全问卷来自企业买家。保持活的答案库。把新问题升级给专家。",
  },
  {
    en: "Trust centers publish security posture publicly. Keep documents dated and accurate. Offer deeper reviews under NDA when needed.",
    zh: "信任中心公开安全态势。保持文件注明日期且准确。需要时在 NDA 下提供更深入审查。",
  },
  {
    en: "Customer security reviews can unblock large deals. Prepare demos of controls not only slides. Follow up on commitments in writing.",
    zh: "客户安全评审可解锁大交易。准备控制演示而非仅幻灯片。书面跟进承诺。",
  },
  {
    en: "Bug trackers for security need private visibility. Restrict access to need to know. Disclose responsibly after fixes ship.",
    zh: "安全缺陷跟踪器需要私密可见性。限制为知悉必要访问。修复发布后负责任披露。",
  },
  {
    en: "Coordinated disclosure balances user safety and researcher credit. Agree on timelines early. Publish clear advisories with CVEs when appropriate.",
    zh: "协调披露平衡用户安全与研究者荣誉。尽早商定时间线。适当时发布带 CVE 的清晰公告。",
  },
  {
    en: "Patch notes for security should be unambiguous. Tell users what to upgrade and why. Avoid hiding severity behind vague words.",
    zh: "安全补丁说明应不含糊。告诉用户升级什么以及为什么。避免用模糊词隐藏严重性。",
  },
  {
    en: "Hardening guides list secure defaults step by step. Test guides on a clean machine. Keep screenshots matched to current UI.",
    zh: "加固指南逐步列出安全默认。在干净机器上测试指南。保持截图匹配当前界面。",
  },
  {
    en: "Baseline images should disable unused services. Apply CIS style benchmarks thoughtfully. Document intentional deviations.",
    zh: "基线镜像应禁用未用服务。有思考地应用 CIS 类基准。记录有意偏离。",
  },
  {
    en: "Network diagrams stay useful when they are current. Store them next to runbooks. Update after every major topology change.",
    zh: "网络图在保持最新时才有用。把它们存放在运维手册旁。每次重大拓扑变更后更新。",
  },
  {
    en: "Asset inventories list what you must protect. Automate discovery where you can. Reconcile cloud and on prem sources weekly.",
    zh: "资产清单列出必须保护的对象。可能时自动发现。每周核对云与本地来源。",
  },
  {
    en: "Software bills of materials list components in a build. Generate SBOMs in CI. Use them when responding to vulnerability news.",
    zh: "软件物料清单列出构建中的组件。在 CI 中生成 SBOM。响应漏洞新闻时使用它们。",
  },
  {
    en: "License compliance scans catch forbidden packages. Block builds that violate policy. Offer approved alternatives in docs.",
    zh: "许可证合规扫描抓住禁用包。阻止违反政策的构建。在文档中提供批准替代。",
  },
  {
    en: "Data classification labels sensitivity levels. Handle restricted data with stronger controls. Train staff to label correctly.",
    zh: "数据分类标记敏感级别。用更强控制处理受限数据。培训员工正确标记。",
  },
  {
    en: "Tokenization replaces sensitive values with surrogates. Keep vaults highly available. Limit who can detokenize.",
    zh: "令牌化用替代值替换敏感值。保持保险库高可用。限制谁可以去令牌化。",
  },
  {
    en: "Field level encryption protects specific columns. Manage keys outside the database. Plan key rotation without long downtime.",
    zh: "字段级加密保护特定列。在数据库外管理密钥。规划密钥轮换且无长时间停机。",
  },
  {
    en: "Homomorphic encryption enables compute on ciphertext in limited cases. Know the performance cost. Prefer simpler controls when they suffice.",
    zh: "同态加密在有限情况下允许对密文计算。了解性能成本。够用时优先更简单控制。",
  },
  {
    en: "Secure enclaves isolate sensitive computation. Attest code before sending secrets. Design for enclave memory limits.",
    zh: "安全飞地隔离敏感计算。发送密钥前证明代码。为飞地内存限制做设计。",
  },
  {
    en: "Differential privacy adds noise to protect individuals in aggregates. Tune epsilon with care. Document privacy loss budgets.",
    zh: "差分隐私在聚合中加噪以保护个体。谨慎调节 epsilon。记录隐私损失预算。",
  },
  {
    en: "Federated learning trains models without centralizing raw data. Secure aggregation helps. Evaluate accuracy tradeoffs honestly.",
    zh: "联邦学习在不集中原始数据下训练模型。安全聚合有帮助。诚实评估精度权衡。",
  },
  {
    en: "Synthetic data can unlock testing without real PII. Validate that it preserves needed distributions. Do not treat synthetic as perfectly safe.",
    zh: "合成数据可在无真实个人身份信息下解锁测试。验证它保留所需分布。不要把合成当作完全安全。",
  },
  {
    en: "Data clean rooms let parties analyze overlapping customers carefully. Control queries and exports. Audit every job that runs.",
    zh: "数据洁净室让各方谨慎分析重叠客户。控制查询与导出。审计每个运行作业。",
  },
  {
    en: "Consent management platforms store preference signals. Honor global privacy controls. Propagate changes to downstream systems quickly.",
    zh: "同意管理平台存储偏好信号。遵守全球隐私控制。迅速把变更传播到下游系统。",
  },
  {
    en: "Preference centers let users choose email topics. Sync choices to marketing tools. Make unsubscribe from all one click.",
    zh: "偏好中心让用户选择邮件主题。把选择同步到营销工具。一键退订全部。",
  },
  {
    en: "Double opt in confirms email subscriptions. Reduce fake signups. Store confirmation timestamps.",
    zh: "双重确认确认邮件订阅。减少虚假注册。存储确认时间戳。",
  },
  {
    en: "Suppression lists stop mail to bounced or opted out addresses. Sync suppressions across tools. Never re mail suppressed people.",
    zh: "抑制名单停止向退信或退订地址发信。跨工具同步抑制。切勿再给被抑制的人发信。",
  },
  {
    en: "Deliverability health depends on reputation and content. Authenticate mail with SPF DKIM and DMARC. Warm new domains gradually.",
    zh: "送达率健康取决于声誉与内容。用 SPF、DKIM 与 DMARC 认证邮件。逐步预热新域名。",
  },
  {
    en: "Transactional mail must arrive even when marketing pauses. Separate sending domains when possible. Monitor bounce spikes closely.",
    zh: "事务邮件即使营销暂停也必须到达。可能时分开发送域名。密切监控退信尖峰。",
  },
  {
    en: "Template previews catch broken merges before send. Test across dark and light clients. Keep legal footers accurate.",
    zh: "模板预览在发送前抓住损坏合并。跨深浅色客户端测试。保持法律页脚准确。",
  },
  {
    en: "Canary emails go to staff before full blasts. Include a kill switch for bad campaigns. Learn from near misses.",
    zh: "金丝雀邮件在全量发送前发给员工。为坏活动提供紧急停止。从侥幸事件学习。",
  },
  {
    en: "Subject lines should set honest expectations. Avoid spam trigger phrases when you can. Personalize carefully without being creepy.",
    zh: "主题行应设定诚实期望。可能时避免垃圾触发短语。谨慎个性化且不令人不适。",
  },
  {
    en: "Preview text supports the subject line. Do not waste it on placeholder copy. Test truncation on mobile.",
    zh: "预览文本支持主题行。不要浪费在占位文案上。在手机上测试截断。",
  },
  {
    en: "Send time optimization guesses when users read mail. Validate with experiments. Respect quiet hours preferences.",
    zh: "发送时间优化猜测用户何时读邮件。用实验验证。尊重免打扰时段偏好。",
  },
  {
    en: "List hygiene removes inactive addresses over time. Reengagement campaigns try once then suppress. Keep engagement metrics honest.",
    zh: "名单卫生随时间移除不活跃地址。重新参与活动尝试一次然后抑制。保持参与指标诚实。",
  },
  {
    en: "CRM systems store customer relationships and history. Deduplicate contacts aggressively. Define ownership so follow ups happen.",
    zh: "CRM 系统存储客户关系与历史。积极去除重复联系人。定义所有权以便跟进发生。",
  },
  {
    en: "Sales playbooks describe stages and next actions. Update them when win patterns change. Coach with call recordings carefully.",
    zh: "销售剧本描述阶段与下一步行动。赢单模式变化时更新。谨慎用通话录音辅导。",
  },
  {
    en: "Lead scoring prioritizes who to call first. Combine fit and intent signals. Retrain scores as markets shift.",
    zh: "线索评分优先决定先打给谁。结合匹配与意向信号。市场变化时重新训练分数。",
  },
  {
    en: "Pipeline reviews forecast revenue with discipline. Separate commit from upside. Challenge slips with data not blame.",
    zh: "管道评审有纪律地预测收入。分开承诺与上行。用数据而非责备挑战拖延。",
  },
  {
    en: "Quota setting aligns incentives with strategy. Avoid quotas that reward harmful shortcuts. Adjust mid year only with care.",
    zh: "配额设定使激励与战略对齐。避免奖励有害捷径的配额。年中调整须谨慎。",
  },
  {
    en: "Commission systems must be transparent and timely. Automate calculations when volume is high. Resolve disputes with written policies.",
    zh: "佣金系统必须透明及时。量大时自动计算。用书面政策解决争议。",
  },
  {
    en: "CPQ tools configure complex quotes correctly. Prevent impossible bundles. Version price books carefully.",
    zh: "CPQ 工具正确配置复杂报价。阻止不可能的捆绑。谨慎为价格册做版本。",
  },
  {
    en: "Order forms capture what was sold. Sync them to billing without manual retyping. Flag nonstandard terms for legal review.",
    zh: "订单表捕获所售内容。同步到计费且无需手工重打。标记非标准条款供法务审查。",
  },
  {
    en: "Renewal motions start before contracts expire. Show value delivered since last term. Offer expansions that match usage.",
    zh: "续约动作在合同到期前开始。展示上一期以来交付的价值。提供匹配用量的扩展。",
  },
  {
    en: "Customer success plans set mutual goals. Review progress on a cadence. Rescue accounts when health scores drop.",
    zh: "客户成功计划设定共同目标。按节奏复查进展。健康分数下降时挽救账户。",
  },
  {
    en: "Health scores combine usage support and sentiment. Explain the score to customers. Act before the score hits red.",
    zh: "健康分数结合用量、支持与情绪。向客户解释分数。在分数变红前行动。",
  },
  {
    en: "QBR meetings review outcomes with stakeholders. Bring insights not only dashboards. Leave with agreed next experiments.",
    zh: "季度业务评审与利益相关者复查结果。带来洞察而非仅仪表盘。带着商定的下一步实验离开。",
  },
  {
    en: "Escalation paths clear blockers for customers. Define severity and response times. Close the loop when issues resolve.",
    zh: "升级路径为客户清除阻碍。定义严重性与响应时间。问题解决时闭环。",
  },
  {
    en: "Implementation projects need scopes and milestones. Staff them with clear RACI charts. Celebrate go live and schedule optimization.",
    zh: "实施项目需要范围与里程碑。用清晰 RACI 图配置人员。庆祝上线并安排优化。",
  },
  {
    en: "Professional services deliver custom outcomes. Productize repeatable packages when you can. Protect margins with change orders.",
    zh: "专业服务交付定制结果。可能时把可重复套餐产品化。用变更单保护利润。",
  },
  {
    en: "Training catalogs teach customers and partners. Offer role based learning paths. Measure completion and skill application.",
    zh: "培训目录教导客户与合作伙伴。提供基于角色的学习路径。衡量完成与技能应用。",
  },
  {
    en: "Certification exams validate skills fairly. Rotate question banks. Publish what the credential means.",
    zh: "认证考试公平验证技能。轮换题库。公布证书含义。",
  },
  {
    en: "Partner enablement keeps resellers effective. Share demo environments and talk tracks. Reward partners who deliver quality.",
    zh: "伙伴赋能保持经销商有效。分享演示环境与话术。奖励交付质量的伙伴。",
  },
  {
    en: "Channel conflict policies clarify who owns accounts. Mediate disputes quickly. Update rules as the channel matures.",
    zh: "渠道冲突政策澄清谁拥有账户。迅速调解争议。渠道成熟时更新规则。",
  },
  {
    en: "Marketplace revenue share must be spelled out. Pay partners on a reliable schedule. Provide self serve earnings dashboards.",
    zh: "市场收入分成必须写明。按可靠计划向伙伴付款。提供自助收益仪表盘。",
  },
  {
    en: "Co marketing funds need receipts and brand rules. Approve creatives before spend. Measure leads generated together.",
    zh: "联合营销资金需要收据与品牌规则。花费前批准创意。一起衡量产生的线索。",
  },
  {
    en: "Event sponsorships should map to pipeline goals. Capture badge scans ethically. Follow up within a few days.",
    zh: "活动赞助应映射到管道目标。合乎伦理地捕获徽章扫描。几天内跟进。",
  },
  {
    en: "Booth staffing needs product experts and greeters. Rotate shifts to avoid burnout. Capture notes after each conversation.",
    zh: "展位人员需要产品专家与迎宾。轮换班次以免倦怠。每次对话后记录笔记。",
  },
  {
    en: "Swag should be useful not wasteful. Choose sustainable materials when you can. Track inventory so you do not over order.",
    zh: "赠品应有用而非浪费。可能时选择可持续材料。跟踪库存以免过量订购。",
  },
  {
    en: "Demo environments reset to a clean state often. Seed them with realistic sample data. Protect demo accounts from abuse.",
    zh: "演示环境经常重置到干净状态。用现实样本数据填充。保护演示账户免受滥用。",
  },
  {
    en: "Sandbox accounts isolate experiments from production. Expire unused sandboxes. Cap resource spend per sandbox.",
    zh: "沙箱账户把实验与生产隔离。使未用沙箱过期。限制每个沙箱资源花费。",
  },
  {
    en: "Trial experiences should reach value quickly. Remind users before trials end. Convert with clear upgrade paths.",
    zh: "试用体验应快速达到价值。试用结束前提醒用户。用清晰升级路径转化。",
  },
  {
    en: "Freemium tiers must stay valuable yet sustainable. Limit costly features carefully. Watch for abuse of free quotas.",
    zh: "免费增值层级必须保持有价值且可持续。谨慎限制昂贵功能。留意免费配额滥用。",
  },
  {
    en: "Usage dashboards help customers avoid surprise bills. Alert before soft limits. Offer upgrades in context.",
    zh: "用量仪表盘帮助客户避免账单惊喜。在软限制前提醒。在上下文中提供升级。",
  },
  {
    en: "Plan comparison tables should be honest. Highlight differences that matter. Link to detailed pricing footnotes.",
    zh: "套餐比较表应诚实。突出重要差异。链接详细定价脚注。",
  },
  {
    en: "Grandfathered plans need clear communication. Explain when they end. Offer migration incentives fairly.",
    zh: "保留旧套餐需要清晰沟通。说明何时结束。公平提供迁移激励。",
  },
  {
    en: "Credits and free months need expiry rules. Apply them automatically when possible. Show remaining credits in billing UI.",
    zh: "积分与免费月需要过期规则。可能时自动应用。在计费界面显示剩余积分。",
  },
  {
    en: "Tax engines calculate rates by location. Keep nexus rules updated. Remit on time to stay compliant.",
    zh: "税务引擎按地点计算税率。保持经营关联规则更新。按时汇缴以保持合规。",
  },
  {
    en: "Currency support needs accurate exchange handling. Display prices in local currency clearly. Settle in currencies your bank supports.",
    zh: "货币支持需要准确汇兑处理。清楚以本地货币显示价格。用银行支持的货币结算。",
  },
  {
    en: "Invoice reminders reduce late payments. Escalate politely with clear next steps. Offer multiple payment methods.",
    zh: "发票提醒减少逾期付款。用清晰下一步礼貌升级。提供多种支付方式。",
  },
  {
    en: "Dunning flows retry failed card charges. Notify customers before service interruption. Pause gracefully when retries fail.",
    zh: "催收流程重试失败的卡扣款。服务中断前通知客户。重试失败时优雅暂停。",
  },
  {
    en: "Payment method updates should be easy and secure. Tokenize cards through providers. Confirm changes with a receipt.",
    zh: "支付方式更新应容易且安全。通过提供商令牌化卡。用回执确认变更。",
  },
  {
    en: "Charge notifications explain every debit. Include invoice links. Support disputes with a clear contact.",
    zh: "扣款通知解释每笔借记。包含发票链接。用清晰联系方式支持争议。",
  },
  {
    en: "Financial close processes lock periods carefully. Reconcile subledgers to the general ledger. Document late adjustments.",
    zh: "财务结账流程谨慎锁定期间。把子账核对到总账。记录迟来调整。",
  },
  {
    en: "Audit trails record who changed financial data. Keep them immutable. Restrict who can edit posted entries.",
    zh: "审计追踪记录谁更改了财务数据。保持不可变。限制谁可编辑已过账分录。",
  },
  {
    en: "Revenue recognition follows accounting standards carefully. Automate schedules when contracts are complex. Involve finance early in deal structure.",
    zh: "收入确认谨慎遵循会计准则。合同复杂时自动生成时间表。交易结构尽早让财务参与。",
  },
  {
    en: "Deferred revenue balances need clear aging. Release revenue as performance obligations complete. Reconcile to billing systems monthly.",
    zh: "递延收入余额需要清晰账龄。履约义务完成时确认收入。每月与计费系统核对。",
  },
  {
    en: "Cost centers allocate shared expenses fairly. Publish allocation methods. Revisit them when org charts change.",
    zh: "成本中心公平分摊共享费用。公布分摊方法。组织架构变化时复查。",
  },
  {
    en: "Transfer pricing needs documentation between entities. Align with tax advice. Keep intercompany invoices orderly.",
    zh: "转让定价需要实体间文件。与税务建议对齐。保持公司间发票有序。",
  },
  {
    en: "Cap tables track ownership and dilution. Update after every financing. Share summaries with the board.",
    zh: "股权表跟踪所有权与稀释。每轮融资后更新。与董事会分享摘要。",
  },
  {
    en: "Option grants need clear vesting schedules. Educate employees on tax basics. Keep grant paperwork complete.",
    zh: "期权授予需要清晰归属时间表。就税务基础教育员工。保持授予文件完整。",
  },
  {
    en: "409A valuations set strike prices carefully. Refresh them as required. Store reports with legal counsel.",
    zh: "409A 估值谨慎设定行权价。按要求刷新。与法律顾问一起存放报告。",
  },
  {
    en: "Fundraising data rooms organize diligence files. Control access tightly. Keep versions current during the process.",
    zh: "融资资料室组织尽职调查文件。严格控制访问。过程中保持版本最新。",
  },
  {
    en: "Pitch decks tell a concise company story. Lead with problem and insight. Practice delivery until timing is tight.",
    zh: "路演稿讲述简洁公司故事。以问题与洞见开场。练习表达直到时间紧凑。",
  },
  {
    en: "Investor updates share progress risks and asks. Be honest about misses. Send them on a predictable cadence.",
    zh: "投资人更新分享进展、风险与请求。对未达成诚实。按可预测节奏发送。",
  },
  {
    en: "Board decks focus on decisions and risks. Append metrics for deep readers. Rehearse the narrative aloud.",
    zh: "董事会材料聚焦决定与风险。为深度读者附加指标。大声排练叙述。",
  },
  {
    en: "OKR reviews inspect progress mid cycle. Adjust key results when reality shifts. Avoid sandbagging scores.",
    zh: "OKR 复查在周期中检查进展。现实变化时调整关键结果。避免故意压低分数。",
  },
  {
    en: "Performance reviews need written evidence. Calibrate across managers. Separate compensation talks when culture prefers it.",
    zh: "绩效评估需要书面证据。跨管理者校准。当文化偏好时分开谈薪酬。",
  },
  {
    en: "Promotion packets argue readiness with examples. Include peer and cross functional input. Communicate outcomes kindly and clearly.",
    zh: "晋升材料用例子论证准备度。包含同事与跨职能输入。友善清楚沟通结果。",
  },
  {
    en: "PIP plans set improvement expectations. Provide coaching resources. Decide outcomes by the written date.",
    zh: "绩效改进计划设定改进期望。提供辅导资源。按书面日期决定结果。",
  },
  {
    en: "Exit interviews capture honest feedback. Look for patterns across leavers. Act on themes you can fix.",
    zh: "离职面谈捕捉诚实反馈。寻找离职者之间的模式。对你能修复的主题采取行动。",
  },
  {
    en: "Alumni networks keep relationships warm. Share company news selectively. Rehire paths should stay open when fit remains.",
    zh: "校友网络保持关系温暖。有选择地分享公司新闻。适合仍在时保持重新雇佣路径开放。",
  },
  {
    en: "Internship programs need meaningful projects. Assign mentors and mid point checkins. Convert strong interns with timely offers.",
    zh: "实习计划需要有意义项目。指定导师与中期检查。用及时录用转化优秀实习生。",
  },
  {
    en: "Apprenticeships combine work and structured learning. Measure skills gained not only hours. Partner with schools when helpful.",
    zh: "学徒制结合工作与结构化学习。衡量获得技能而非仅小时数。有帮助时与学校合作。",
  },
  {
    en: "Continuing education stipends support growth. Publish what expenses qualify. Celebrate certificates that help the team.",
    zh: "继续教育津贴支持成长。公布哪些费用符合资格。庆祝有助团队的证书。",
  },
  {
    en: "Conference travel needs budget and purpose. Share notes after attending. Prefer talks that teach the wider team.",
    zh: "会议差旅需要预算与目的。参加后分享笔记。优先能教给更广团队的讲座。",
  },
  {
    en: "Book clubs spread shared vocabulary. Pick books with practical takeaways. Rotate facilitators each month.",
    zh: "读书会传播共享词汇。选择有实用收获的书。每月轮换主持。",
  },
  {
    en: "Writing clubs improve clarity through critique. Keep sessions kind and specific. Publish internal essays when useful.",
    zh: "写作会通过评议提升清晰度。保持会议友善且具体。有用时发布内部文章。",
  },
  {
    en: "Talk rehearsals improve external speaking. Record practice runs. Invite tough questions early.",
    zh: "演讲排练改善对外发言。录制练习。尽早邀请刁钻问题。",
  },
  {
    en: "Demo days showcase prototypes to stakeholders. Limit slides and maximize working software. Capture follow up interest immediately.",
    zh: "演示日向利益相关者展示原型。限制幻灯片并最大化可运行软件。立即记录后续兴趣。",
  },
  {
    en: "Office hours invite drop in questions. Publish the schedule widely. Take notes for common themes.",
    zh: "办公时间欢迎随时提问。广泛公布日程。为常见主题做笔记。",
  },
  {
    en: "Ask me anything sessions build trust. Prepare hard topics in advance. Follow up on unanswered questions in writing.",
    zh: "随便问环节建立信任。提前准备难题。书面跟进未回答问题。",
  },
  {
    en: "Town halls align large groups on direction. Keep updates crisp. Leave time for live questions.",
    zh: "全员大会让大群体在方向上对齐。保持更新简洁。留出现场提问时间。",
  },
  {
    en: "All hands notes should land the same day. Include links to deeper materials. Translate when the workforce needs it.",
    zh: "全员会议笔记应当天落地。包含更深材料链接。当员工需要时翻译。",
  },
  {
    en: "Culture docs describe how we work together. Revisit them when the company scales. Hire and promote in line with them.",
    zh: "文化文档描述我们如何一起工作。公司扩展时复查。按它们招聘与晋升。",
  },
  {
    en: "Values without behaviors stay posters on a wall. Define observable actions for each value. Recognize people who model them.",
    zh: "没有行为的价值观只是墙上海报。为每个价值观定义可观察行动。表彰践行者。",
  },
  {
    en: "Psychological safety lets people raise risks early. Leaders model curiosity over blame. Reward messengers of bad news.",
    zh: "心理安全让人尽早提出风险。领导示范好奇而非责备。奖励坏消息的传递者。",
  },
  {
    en: "Feedback culture prefers timely specific notes. Teach how to give and receive feedback. Avoid feedback only at review time.",
    zh: "反馈文化偏好及时具体意见。教导如何给予与接收反馈。避免只在评估时反馈。",
  },
  {
    en: "Meeting free blocks protect deep work. Guard them like customer meetings. Batch interruptions into open hours.",
    zh: "无会议时段保护深度工作。像客户会议一样守护它们。把打断集中到开放时间。",
  },
  {
    en: "Focus mode tools silence non urgent noise. Teach teams when to break through. Respect focus status across time zones.",
    zh: "专注模式工具静音非紧急噪音。教导团队何时可以打断。跨时区尊重专注状态。",
  },
  {
    en: "Documentation sprints clear doc debt quickly. Pair writers with subject experts. Measure pages updated and questions reduced.",
    zh: "文档冲刺迅速清理文档债。让写作者与主题专家结对。衡量更新页数与减少的问题。",
  },
  {
    en: "Cleanup weeks retire dead code and flags. Celebrate deletion as progress. Leave the codebase easier for the next person.",
    zh: "清理周退役死代码与开关。把删除当作进步庆祝。让下一任更容易看懂代码库。",
  },
  {
    en: "Readme driven development writes the interface first. Align the team before coding deeply. Update the readme when reality diverges.",
    zh: "README 驱动开发先写接口。深入编码前对齐团队。现实偏离时更新 README。",
  },
  {
    en: "Architecture decision records stay short and dated. Link alternatives considered. Point to code that implements the decision.",
    zh: "架构决策记录宜短并注明日期。链接考虑过的替代。指向实现决策的代码。",
  },
  {
    en: "RFC processes invite wide review of proposals. Set comment deadlines. Summarize the final decision clearly.",
    zh: "RFC 流程邀请对提案广泛评审。设定评论截止日期。清楚总结最终决定。",
  },
  {
    en: "Working groups tackle cross team problems for a season. Publish charter and end date. Dissolve when the goal is met.",
    zh: "工作组用一个阶段攻克跨团队问题。公布章程与结束日期。目标达成即解散。",
  },
  {
    en: "Guilds connect people with shared crafts. Share practices without creating another hierarchy. Host lightweight learning sessions.",
    zh: "行会连接有共同技艺的人。分享实践且不制造另一层级。举办轻量学习会。",
  },
  {
    en: "Communities of practice improve skills together. Rotate leadership. Capture reusable playbooks.",
    zh: "实践社区一起提升技能。轮换领导。沉淀可复用剧本。",
  },
  {
    en: "Shadowing days let people learn by watching. Prepare hosts with agendas. Debrief what the visitor noticed.",
    zh: "跟岗日让人通过观察学习。为接待者准备议程。复盘访客注意到的内容。",
  },
  {
    en: "Rotation programs build empathy across teams. Keep rotations long enough to contribute. Bring lessons back to the home team.",
    zh: "轮岗计划建立跨团队共情。轮岗须足够长才能贡献。把教训带回原团队。",
  },
  {
    en: "Staff engineer career paths reward technical leadership. Clarify how influence is measured. Avoid forcing everyone into management.",
    zh: "主任工程师职业路径奖励技术领导力。澄清如何衡量影响力。避免强迫人人进入管理。",
  },
  {
    en: "Engineering managers grow people and systems. Protect maker time for their teams. Practice difficult conversations early.",
    zh: "工程经理培养人与系统。为团队保护创造时间。尽早练习困难对话。",
  },
  {
    en: "Product managers connect users problems and delivery. Write crisp problem statements. Partner closely with design and engineering.",
    zh: "产品经理连接用户问题与交付。写出清晰问题陈述。与设计与工程紧密合作。",
  },
  {
    en: "Designers advocate for clarity and inclusion. Prototype before polishing. Test with real users often.",
    zh: "设计师倡导清晰与包容。打磨前先做原型。经常与真实用户测试。",
  },
  {
    en: "Data analysts turn questions into trustworthy answers. Share methods not only charts. Challenge vanity metrics kindly.",
    zh: "数据分析师把问题变成可信答案。分享方法而非仅图表。友善挑战虚荣指标。",
  },
  {
    en: "SREs balance feature speed with reliability. Error budgets guide risk taking. Automate toil whenever it repeats.",
    zh: "SRE 平衡功能速度与可靠性。错误预算指导冒险。只要重复就自动化琐事。",
  },
  {
    en: "Security engineers partner early in design. Prefer enabling controls over blockers. Teach as they review.",
    zh: "安全工程师尽早参与设计。优先赋能控制而非阻挡。在评审中教学。",
  },
  {
    en: "Technical writers make complex ideas teachable. Embed with product teams. Measure doc success with task completion.",
    zh: "技术写作者让复杂想法可教。嵌入产品团队。用任务完成衡量文档成功。",
  },
  {
    en: "Support engineers turn pain into product insights. Tag tickets with root causes. Close the loop when fixes ship.",
    zh: "支持工程师把痛点变成产品洞察。用根因给工单打标签。修复上线时闭环。",
  },
  {
    en: "Solutions architects map customer needs to designs. Stay close to delivery constraints. Update reference architectures often.",
    zh: "解决方案架构师把客户需求映射到设计。紧贴交付约束。经常更新参考架构。",
  },
  {
    en: "Release managers coordinate ships across teams. Own the calendar and risk list. Communicate slips early.",
    zh: "发布经理跨团队协调发货。拥有日历与风险清单。尽早沟通延期。",
  },
  {
    en: "Program managers drive multi team outcomes. Clarify dependencies and dates. Remove blockers without owning every task.",
    zh: "项目集经理推动多团队结果。澄清依赖与日期。清除阻碍且不拥有每项任务。",
  },
  {
    en: "Scrum masters improve team process. Protect the team from thrash. Coach rather than command.",
    zh: "Scrum Master 改进团队流程。保护团队免受折腾。辅导而非命令。",
  },
  {
    en: "Agile coaches scale healthy practices carefully. Adapt frameworks to context. Avoid cargo cult rituals.",
    zh: "敏捷教练谨慎扩展健康实践。按情境调整框架。避免形式主义仪式。",
  },
  {
    en: "Quality engineers prevent bugs as well as find them. Shift testing earlier. Automate the boring checks.",
    zh: "质量工程师既预防也发现缺陷。把测试前移。自动化枯燥检查。",
  },
  {
    en: "Build engineers keep pipelines green and fast. Cache wisely. Fail builds with actionable messages.",
    zh: "构建工程师保持流水线绿色且快。明智缓存。用可行动消息使构建失败。",
  },
  {
    en: "Tooling teams remove friction from daily work. Prioritize by developer pain. Sunset tools that no longer help.",
    zh: "工具团队去除日常工作摩擦。按开发者痛点排序优先级。淘汰不再有帮助的工具。",
  },
  {
    en: "Platform teams provide self serve capabilities. Treat internal teams as customers. Publish SLAs they can trust.",
    zh: "平台团队提供自助能力。把内部团队当作客户。公布他们可信任的服务级别协议。",
  },
  {
    en: "Data platform teams enable reliable analytics. Enforce schemas and access controls. Make datasets discoverable.",
    zh: "数据平台团队促成可靠分析。强制模式与访问控制。让数据集可发现。",
  },
  {
    en: "ML platform teams productize training and serving. Standardize feature stores carefully. Observe models in production.",
    zh: "机器学习平台团队把训练与服务产品化。谨慎标准化特征库。在生产中观察模型。",
  },
  {
    en: "Design ops scale design systems and research ops. Reduce duplicated effort. Keep libraries healthy.",
    zh: "设计运营扩展设计系统与研究运营。减少重复劳动。保持组件库健康。",
  },
  {
    en: "Research ops recruit participants ethically. Maintain panels and incentives. Protect PII throughout studies.",
    zh: "研究运营合乎伦理地招募参与者。维护样本库与激励。在研究全过程保护个人身份信息。",
  },
  {
    en: "IT support keeps employees productive. Track ticket themes. Fix root causes not only symptoms.",
    zh: "IT 支持保持员工高效。跟踪工单主题。修复根因而非仅症状。",
  },
  {
    en: "Identity teams own directories and SSO. Automate joiner mover leaver flows. Audit orphaned accounts.",
    zh: "身份团队拥有目录与单点登录。自动化入职调动离职流程。审计孤儿账户。",
  },
  {
    en: "Network teams keep connectivity reliable. Document change windows. Monitor both latency and loss.",
    zh: "网络团队保持连接可靠。记录变更窗口。同时监控延迟与丢包。",
  },
  {
    en: "Storage teams balance cost and durability. Tier cold data. Test restores from every tier.",
    zh: "存储团队平衡成本与耐久。冷数据分层。测试每一层的恢复。",
  },
  {
    en: "Database administrators care for engines and backups. Tune queries with evidence. Plan failovers before they are needed.",
    zh: "数据库管理员照料引擎与备份。用证据调优查询。在需要前规划故障转移。",
  },
  {
    en: "Messaging admins keep mail flowing. Fight spoofing with authentication. Watch queue depths during campaigns.",
    zh: "消息管理员保持邮件畅通。用认证对抗伪造。活动期间观察队列深度。",
  },
  {
    en: "Collaboration admins configure chat and docs tools. Enforce retention and DLP rules. Train people on secure sharing.",
    zh: "协作管理员配置聊天与文档工具。执行保留与数据防泄漏规则。培训人们安全分享。",
  },
  {
    en: "AV teams support rooms and events. Test setups early. Keep spare cables and adapters.",
    zh: "音视频团队支持会议室与活动。尽早测试设置。准备备用线缆与转接器。",
  },
  {
    en: "Facilities teams keep workplaces safe and pleasant. Track work orders. Plan capacity for headcount growth.",
    zh: "设施团队保持工作场所安全舒适。跟踪工单。为人数增长规划容量。",
  },
  {
    en: "Reception teams welcome guests professionally. Follow visitor policies. Escalate emergencies calmly.",
    zh: "前台团队专业欢迎访客。遵守访客政策。冷静升级紧急情况。",
  },
  {
    en: "Executive assistants multiply leader effectiveness. Protect focus time. Coordinate across many calendars.",
    zh: "行政助理放大领导者效能。保护专注时间。协调多个日历。",
  },
  {
    en: "Chiefs of staff connect strategy and execution. Drive agendas and follow through. Keep communication tight.",
    zh: "参谋长连接战略与执行。推动议程并跟进。保持沟通紧密。",
  },
  {
    en: "Founders set vision and early culture. Stay close to customers longer than feels necessary. Hire people who improve the average.",
    zh: "创始人设定愿景与早期文化。比感觉必要更久地贴近客户。招聘能提高平均水平的人。",
  },
  {
    en: "Boards advise and govern. Ask hard questions kindly. Support management without micromanaging.",
    zh: "董事会建议与治理。友善提出难题。支持管理层且不微观管理。",
  },
  {
    en: "Investors provide capital and networks. Align on timelines and metrics. Avoid surprising each other in public.",
    zh: "投资人提供资本与网络。在时间线与指标上对齐。避免在公开场合互相意外。",
  },
  {
    en: "Customers fund the mission with their trust. Earn renewal through reliable value. Listen harder when they complain.",
    zh: "客户用信任资助使命。通过可靠价值赢得续约。他们抱怨时更努力倾听。",
  },
  {
    en: "Users succeed when products stay out of the way. Remove friction relentlessly. Measure outcomes that matter to them.",
    zh: "当产品不碍事时用户成功。不懈去除摩擦。衡量对他们重要的结果。",
  },
  {
    en: "Communities thrive on shared purpose and respect. Host spaces intentionally. Moderate with courage and care.",
    zh: "社区因共同目的与尊重而繁荣。有意地主持空间。以勇气与关怀管理。",
  },
  {
    en: "Open source maintainers balance generosity and burnout. Set boundaries on response times. Celebrate contributors often.",
    zh: "开源维护者平衡慷慨与倦怠。设定响应时间边界。经常庆祝贡献者。",
  },
  {
    en: "Students learn faster with clear worked examples. Practice spaced retrieval. Sleep still matters for memory.",
    zh: "学生用清晰例题学得更快。练习间隔提取。睡眠对记忆仍然重要。",
  },
  {
    en: "Teachers need tools that respect limited prep time. Prefer reusable templates. Surface class insights without extra busywork.",
    zh: "教师需要尊重有限备课时间的工具。优先可复用模板。呈现课堂洞察且无额外琐事。",
  },
  {
    en: "Parents want clarity without jargon. Summarize next steps. Offer office hours for harder questions.",
    zh: "家长想要无行话的清晰。总结下一步。为更难问题提供答疑时间。",
  },
  {
    en: "Learners retain more when they teach others. Explain concepts aloud. Write short notes in your own words.",
    zh: "学习者在教他人时保留更多。大声解释概念。用自己的话写短笔记。",
  },
  {
    en: "Typing practice builds fluency for coding and writing. Accuracy first then speed. Short daily sessions beat rare long ones.",
    zh: "打字练习为编程与写作建立流畅。先准确再速度。每天短练习胜过偶尔长时间。",
  },
  {
    en: "Spaced repetition schedules reviews when memory fades. Keep cards atomic. Suspend cards that are poorly written.",
    zh: "间隔重复在记忆消退时安排复习。保持卡片原子化。暂停写得差的卡片。",
  },
  {
    en: "Active recall beats rereading for durable learning. Close the book and try to remember. Check answers after you struggle.",
    zh: "主动回忆对持久学习胜过重读。合上书尝试记住。挣扎后再核对答案。",
  },
  {
    en: "Interleaving topics improves transfer of skills. Mix problem types in practice. Reflect on which strategy you used.",
    zh: "交错主题改善技能迁移。在练习中混合题型。反思你用了哪种策略。",
  },
  {
    en: "Worked examples scaffold early problem solving. Fade the steps as skill grows. Compare your solution to the model.",
    zh: "例题为早期解题搭脚手架。技能增长时淡化步骤。把你的解法与范例比较。",
  },
  {
    en: "Error analysis turns mistakes into lessons. Keep an error log. Revisit similar problems a day later.",
    zh: "错误分析把失误变成教训。保留错误日志。一天后再做类似题。",
  },
  {
    en: "Goal setting works when goals are specific. Track progress visibly. Adjust goals when they stop stretching you.",
    zh: "目标设定在目标具体时有效。可见地跟踪进度。目标不再拉伸你时调整。",
  },
  {
    en: "Habits form through cues routines and rewards. Start tiny. Stack new habits onto existing ones.",
    zh: "习惯通过线索、惯例与奖励形成。从小开始。把新习惯叠在已有习惯上。",
  },
  {
    en: "Focus improves when phones leave the room. Use timers for deep sessions. Take real breaks between blocks.",
    zh: "手机离开房间时专注提升。用计时器做深度时段。块与块之间真正休息。",
  },
  {
    en: "Sleep debt hurts judgment and mood. Protect a consistent bedtime. Avoid bright screens late when you can.",
    zh: "睡眠债伤害判断与情绪。保护稳定就寝时间。可能时避免深夜亮屏。",
  },
  {
    en: "Exercise supports cognition and stress control. Short walks still help. Consistency beats intensity alone.",
    zh: "运动支持认知与压力控制。短走仍有帮助。坚持胜过仅有强度。",
  },
  {
    en: "Nutrition affects energy across the day. Prefer steady meals over sugar spikes. Stay hydrated while studying.",
    zh: "营养影响全天能量。优先稳定餐食而非糖分尖峰。学习时保持补水。",
  },
  {
    en: "Social connection buffers hard seasons. Ask for help early. Offer help when you have capacity.",
    zh: "社会连接缓冲艰难季节。尽早求助。有余力时提供帮助。",
  },
  {
    en: "Kindness scales cultures better than fear. Thank people specifically. Assume good intent then verify facts.",
    zh: "善意比恐惧更能扩展文化。具体感谢人们。先假设善意再核实事实。",
  }
];

export const TYPING_CORPUS = RAW.map((row) => ({
  en: sanitizeEn(row.en),
  zh: row.zh,
}));

export function wordsFromEn(en) {
  return sanitizeEn(en)
    .split(' ')
    .map((w) => w.trim())
    .filter(Boolean);
}

export function pickParagraph(excludeIndex = -1) {
  if (TYPING_CORPUS.length === 0) {
    return {index: 0, en: 'Type this sample sentence carefully.', zh: '请仔细输入这个示例句子。'};
  }
  let index = Math.floor(Math.random() * TYPING_CORPUS.length);
  if (TYPING_CORPUS.length > 1 && index === excludeIndex) {
    index = (index + 1) % TYPING_CORPUS.length;
  }
  return {index, ...TYPING_CORPUS[index]};
}

/** Flatten many paragraphs into a long word list, reshuffling as needed. */
export function buildWordQueue(minWords) {
  const out = [];
  let guard = 0;
  while (out.length < minWords && guard < 500) {
    guard += 1;
    const {index, en, zh} = pickParagraph();
    const words = wordsFromEn(en);
    out.push({words, zh, en, paraIndex: index});
  }
  return out;
}
