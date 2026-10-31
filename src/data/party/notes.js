/**
 * Curious reveal notes for Bets & Wagers. Markdown + `$...$` / `$$...$$` KaTeX.
 * Original classroom prose — not copied from a textbook listing.
 */
export const NOTES = {
  'math-sum-100': {
    en: `Gauss, as a schoolboy, paired $1+100$, $2+99$, … — fifty pairs of $101$.

$$\\frac{n(n+1)}{2} = \\frac{100\\times 101}{2} = 5050$$`,
    zh: `高斯小时候把 $1+100$、$2+99$……配成五十对，每对都是 $101$。

$$\\frac{n(n+1)}{2} = \\frac{100\\times 101}{2} = 5050$$`,
  },
  'math-primes-1000': {
    en: `The sieve of Eratosthenes crosses out multiples of $2,3,5,\\ldots$ until $\\sqrt{1000}\\approx 31.6$. What is left is **168** primes (2 through 997).`,
    zh: `埃拉托斯特尼筛法划掉 $2,3,5,\\ldots$ 的倍数，一直筛到 $\\sqrt{1000}\\approx 31.6$。剩下 **168** 个质数（从 2 到 997）。`,
  },
  'math-1000th-prime': {
    en: `There is no tidy closed formula for the $n$th prime. Tables (and a patient sieve) put $p_{1000}=7919$. Prime gaps around here are still only tens, not hundreds.`,
    zh: `第 $n$ 个质数没有简单闭式。查表（或耐心筛）得到 $p_{1000}=7919$。这一带的质数间隙还只是几十，不是几百。`,
  },
  'math-digits-2-100': {
    en: `Digit count of $n$ is $\\lfloor\\log_{10} n\\rfloor+1$.

$$\\lfloor 100\\log_{10} 2\\rfloor+1 = \\lfloor 30.103\\rfloor+1 = 31$$

Same trick as the wheat-on-a-chessboard story: doubling runs away in a hurry.`,
    zh: `$n$ 的位数是 $\\lfloor\\log_{10} n\\rfloor+1$。

$$\\lfloor 100\\log_{10} 2\\rfloor+1 = \\lfloor 30.103\\rfloor+1 = 31$$

和棋盘麦粒故事一样：翻倍会跑得很快。`,
  },
  'math-2-16': {
    en: `$2^{10}=1024\\approx 10^3$, so $2^{16}=2^{10}\\times 2^6=1024\\times 64=65536$. That is also the count of 16-bit unsigned integers ($0$ through $65535$), plus one.`,
    zh: `$2^{10}=1024\\approx 10^3$，所以 $2^{16}=2^{10}\\times 2^6=1024\\times 64=65536$。也正好是 16 位无符号整数的个数（$0$ 到 $65535$）再加一。`,
  },
  'math-8-factorial': {
    en: `$$8! = 8\\times 7\\times 6\\times 5\\times 4\\times 3\\times 2\\times 1 = 40320$$

A Rubik's Cube has far more arrangements ($43\\,252\\,003\\,274\\,489\\,856\\,000$) — factorials grow even faster than that once $n$ is large.`,
    zh: `$$8! = 8\\times 7\\times 6\\times 5\\times 4\\times 3\\times 2\\times 1 = 40320$$

魔方的状态数是 $43\\,252\\,003\\,274\\,489\\,856\\,000$——$n$ 再大一点，阶乘会比这还疯。`,
  },
  'math-111-squared': {
    en: `$$111^2 = (100+11)^2 = 10000+2\\times 100\\times 11+121 = 12321$$

The palindrome $12321$ is the square of a repunit of three $1$s.`,
    zh: `$$111^2 = (100+11)^2 = 10000+2\\times 100\\times 11+121 = 12321$$

回文数 $12321$ 正好是三个 $1$ 的平方。`,
  },
  'math-20-gon': {
    en: `Interior angle sum of an $n$-gon:

$$(n-2)\\times 180^\\circ = 18\\times 180 = 3240^\\circ$$

A regular icosagon was a favourite “nearly a circle” in old geometry books.`,
    zh: `$n$ 边形内角和：

$$(n-2)\\times 180^\\circ = 18\\times 180 = 3240^\\circ$$

正二十边形在老几何书里常被当成“快要变成圆”的例子。`,
  },
  'math-seconds-day': {
    en: `$$24\\times 60\\times 60 = 86400$$

A pendulum clock's second-hand is literally counting those. Leap seconds exist because Earth does not keep perfect $86400$-second days.`,
    zh: `$$24\\times 60\\times 60 = 86400$$

摆钟的秒针就是在数这个。因为地球自转并不完美，才有了闰秒。`,
  },
  'math-fermat': {
    en: `Andrew Wiles sketched the proof in a 1993 Cambridge lecture, then spent a year patching a hole with Richard Taylor. Fermat had claimed a “marvellous proof” in a book margin around 1637 — and never wrote it down.`,
    zh: `安德鲁·怀尔斯 1993 年在剑桥的讲座上勾出证明，又花一年和泰勒补上漏洞。费马约 1637 年在书页空白处写过“奇妙的证明”——却再也没写下来。`,
  },
  'math-planets': {
    en: `Eight since Pluto was reclassified a dwarf planet in 2006. The IAU wanted a tidy orbit-clearing rule; the public wanted nine. Classroom mnemonic: *My Very Educated Mother Just Served Us Noodles*.`,
    zh: `2006 年冥王星被改列为矮行星后就是八颗。国际天文学联合会要一条干净的“清轨道”规则，大家却还想要九颗。口诀：水金地火木土天海。`,
  },
  'math-sun-million-km': {
    en: `One astronomical unit is about $1.496\\times 10^8$ km, so **150 million km** is the usual classroom round. Light takes about $8$ minutes $20$ seconds to cross it.`,
    zh: `一个天文单位约 $1.496\\times 10^8$ 千米，课堂上就说 **1.5 亿千米**。光走完大约要 $8$ 分 $20$ 秒。`,
  },
  'math-continents': {
    en: `Seven in the model taught in most English-speaking schools (Africa, Antarctica, Asia, Europe, North America, Oceania, South America). Some atlases merge Europe+Asia into Eurasia and count six.`,
    zh: `英语课本里通常是七大洲。有的地图把欧亚算成一块，就变成六个。`,
  },
  'math-piano-keys': {
    en: `**88** keys ($A_0$ to $C_8$) became standard with Steinway in the 1880s. Seven octaves plus a minor third — enough for most orchestral scores.`,
    zh: `斯坦威在 1880 年代把 **88** 键（$A_0$ 到 $C_8$）做成了标准：七个八度再加一个小三度，够大多数乐队总谱用。`,
  },
  'math-bones': {
    en: `Adults have **206**; babies start with about 270 that fuse. The femur is the longest, the stapes in the ear the smallest.`,
    zh: `成人 **206** 块；婴儿大约 270 块，后来愈合。股骨最长，耳里的镫骨最小。`,
  },
  'math-teeth': {
    en: `**32** if all four wisdom teeth erupt ($8+8+8+8$ by type). Many adults have some pulled — so “typical” in a classroom photo may look like 28.`,
    zh: `四颗智齿都长齐就是 **32**（切牙、尖牙、前磨、磨牙各 8）。很多人拔过智齿，班上的“典型”可能看起来是 28。`,
  },
  'math-chess-squares': {
    en: `An $8\\times 8$ grid is $64$ little squares — but if you also count $2\\times 2$, $3\\times 3$, … you get $1^2+\\cdots+8^2=204$ squares hiding in the board.`,
    zh: `$8\\times 8$ 是 $64$ 个小格——若再数 $2\\times 2$、$3\\times 3$……一共藏着 $1^2+\\cdots+8^2=204$ 个正方形。`,
  },
  'math-cards': {
    en: `**52** cards: 4 suits $\\times$ 13 ranks. 52 weeks in a year is a coincidence people love to point at. Jokers are extras for games that want a wild.`,
    zh: `**52** 张：4 花色 $\\times$ 13 点数。有人爱提“一年 52 周”，其实是巧合。大小王是给需要百搭的游戏备用的。`,
  },
  'math-hours-week': {
    en: `$$7\\times 24 = 168$$

Same number as primes below 1000 — a tidy coincidence, nothing deeper.`,
    zh: `$$7\\times 24 = 168$$

和小于 1000 的质数个数相同——整齐的巧合，没有更深的含义。`,
  },
  'math-minutes-day': {
    en: `$$24\\times 60 = 1440$$

A “1,440-minute day” is how some planners write a to-do list: every minute is a slot.`,
    zh: `$$24\\times 60 = 1440$$

有的日程本把一天写成 1440 个一分钟格子。`,
  },
  'math-moon-year': {
    en: `Apollo 11, 20 July **1969**: Armstrong and Aldrin walked; Collins stayed in orbit. The landing computer was asking for a 1202 alarm — and they landed anyway.`,
    zh: `阿波罗 11 号，**1969** 年 7 月 20 日：阿姆斯特朗和奥尔德林走路，科林斯留在轨道上。着陆电脑还在报 1202 警报——他们还是落下了。`,
  },
  'math-everest-m': {
    en: `**8849 m** (China–Nepal 2020 joint survey). The peak grows a few millimetres a year as India keeps shoving into Asia. Older textbooks still say 8848.`,
    zh: `**8849 米**（2020 年中尼联合测高）。印度板块还在挤亚洲，峰顶每年再长几毫米。旧课本仍写 8848。`,
  },
  'math-chromosomes': {
    en: `**46** = 23 pairs. 22 autosome pairs plus XX or XY. Banana cells have more chromosomes than we do — count is not a brain-size prize.`,
    zh: `**46** = 23 对。22 对常染色体，再加 XX 或 XY。香蕉的染色体比人还多——条数不是聪明奖。`,
  },
  'math-us-states': {
    en: `**50** since Hawaii joined in 1959. The flag added a star for each; 48-star flags still turn up in old movies.`,
    zh: `夏威夷 1959 年加入后是 **50** 州。国旗每加入一州加一颗星；老电影里还能看到 48 星旗。`,
  },
  'math-circle-deg': {
    en: `Babylonians liked base 60, and $360$ is a friendly multiple of $2,3,4,5,6,8,9,10$. Radians ($2\\pi$) are what calculus prefers.`,
    zh: `巴比伦人喜欢六十进制，$360$ 又正好能被 $2,3,4,5,6,8,9,10$ 整除。微积分更喜欢弧度 $2\\pi$。`,
  },
  'phys-principia': {
    en: `Newton published the *Principia* in **1687**, paid for by Edmond Halley (the comet guy) after the Royal Society was broke. Three laws plus universal gravitation, in Latin, with almost no calculus written out.`,
    zh: `牛顿 **1687** 年出版《原理》，印刷费是哈雷（彗星那位）垫的——皇家学会当时没钱。三大定律加上万有引力，拉丁文，几乎不把微积分写出来。`,
  },
  'phys-telephone': {
    en: `Bell’s US patent 174,465 is dated 7 March **1876**. Elisha Gray filed a caveat the same day; the fight over “who was first” still makes a good argument in class.`,
    zh: `贝尔的美国专利 174,465 日期是 **1876** 年 3 月 7 日。同一天格雷也交了预告——“到底谁先”到现在还够课堂上吵一架。`,
  },
  'phys-xrays': {
    en: `Röntgen, **1895**, in Würzburg: a covered cathode tube still lit a fluorescent screen. He X-rayed his wife’s hand; she said she had seen her own death. He never patented it.`,
    zh: `伦琴 **1895** 年在维尔茨堡：包起来的阴极射线管仍能点亮荧光屏。他给妻子的手拍了片，她说像看见了自己的死。他没有申请专利。`,
  },
  'phys-flight': {
    en: `17 December **1903**, Kitty Hawk: 12 seconds, 37 metres, headwind included. The Wrights were bicycle mechanics who obsessed over a wind tunnel before they trusted a propeller.`,
    zh: `**1903** 年 12 月 17 日，基蒂霍克：12 秒，37 米，还算上逆风。莱特兄弟是自行车匠，先迷上风洞才肯相信螺旋桨。`,
  },
  'phys-relativity': {
    en: `Einstein’s *annus mirabilis* **1905**: photoelectric effect, Brownian motion, $E=mc^2$, and special relativity — written at the Bern patent office between examining other people’s gadgets.`,
    zh: `爱因斯坦的奇迹年 **1905**：光电效应、布朗运动、$E=mc^2$、狭义相对论——都在伯尔尼专利局审别人小发明的间隙写成。`,
  },
  'phys-transistor': {
    en: `Bardeen, Brattain and Shockley at Bell Labs, December **1947**. Point-contact germanium first; Shockley’s junction transistor became the one factories could copy. The vacuum tube never recovered.`,
    zh: `巴丁、布拉顿、肖克利，贝尔实验室，**1947** 年 12 月。先是锗点接触管，肖克利的结型管才是工厂能复制的那种。真空管再也没缓过来。`,
  },
  'phys-higgs': {
    en: `CERN announced the Higgs-like boson on 4 July **2012**. Peter Higgs had written the mechanism in 1964; he was in the auditorium and wiped his eyes. The particle is why other particles can have mass.`,
    zh: `CERN 在 **2012** 年 7 月 4 日宣布类希格斯粒子。希格斯 1964 年写下机制；当天他坐在报告厅里擦眼睛。正因为有它，别的粒子才能有质量。`,
  },
  'phys-sound': {
    en: `At $20^\\circ\\mathrm{C}$, $v\\approx 343$ m/s. A rough classroom fit is

$$v \\approx 331 + 0.6\\,T$$

with $T$ in °C. Mach 1 on a cool day is slower than on a hot runway.`,
    zh: `$20^\\circ\\mathrm{C}$ 时约 $343$ m/s。课堂近似：

$$v \\approx 331 + 0.6\\,T$$

$T$ 用摄氏度。冷天的 1 马赫比热跑道上更慢。`,
  },
  'phys-earth-diameter': {
    en: `Mean diameter $\\approx 12\\,742$ km (equator a bit fatter). Eratosthenes estimated the circumference from two shadows and a camel caravan — off by only a few percent.`,
    zh: `平均直径约 $12\\,742$ km（赤道更胖一点）。埃拉托斯特尼用两处影子和商队距离估过周长，只偏了几个百分点。`,
  },
  'phys-boiling-kelvin': {
    en: `$$T_\\mathrm{K} = T_{^\\circ\\mathrm{C}} + 273.15 \\Rightarrow 100+273.15 = 373.15\\ \\mathrm{K}$$

Rounded to **373 K**. Kelvin starts at absolute zero; no degree sign.`,
    zh: `$$T_\\mathrm{K} = T_{^\\circ\\mathrm{C}} + 273.15 \\Rightarrow 100+273.15 = 373.15\\ \\mathrm{K}$$

取整 **373 K**。开尔文从绝对零度起算，后面不写小圆圈。`,
  },
  'el-color-1k': {
    en: `Bands: brown $1$, black $0$, red $\\times 10^2$.

$$10\\times 10^{2} = 1000\\ \\Omega$$

Mnemonic: *Better Be Right* — brown black red.`,
    zh: `色环：棕 $1$、黑 $0$、红 $\\times 10^2$。

$$10\\times 10^{2} = 1000\\ \\Omega$$`,
  },
  'el-color-47k': {
    en: `Yellow $4$, violet $7$, orange $\\times 10^3$:

$$47\\times 10^{3} = 47\\,000\\ \\Omega$$`,
    zh: `黄 $4$、紫 $7$、橙 $\\times 10^3$：

$$47\\times 10^{3} = 47\\,000\\ \\Omega$$`,
  },
  'el-tolerance': {
    en: `Gold fourth band $\\Rightarrow \\pm 5\\%$. Silver is $\\pm 10\\%$, brown $\\pm 1\\%$. Gold is the “ordinary” resistor you dump in a classroom bin.`,
    zh: `第四环金色 $\\Rightarrow \\pm 5\\%$。银色 $\\pm 10\\%$，棕色 $\\pm 1\\%$。金色就是零件盒里最普通的那种。`,
  },
  'el-ohm': {
    en: `Ohm’s law:

$$I = \\frac{V}{R} = \\frac{12}{4} = 3\\ \\mathrm{A}$$

Georg Ohm published this in 1827; his colleagues were not kind about it at first.`,
    zh: `欧姆定律：

$$I = \\frac{V}{R} = \\frac{12}{4} = 3\\ \\mathrm{A}$$

欧姆 1827 年发表，同事们一开始并不买账。`,
  },
  'el-power': {
    en: `$$P = VI = 5\\times 2 = 10\\ \\mathrm{W}$$

A phone charger at 10 W is a slow sip; a kettle is two thousand.`,
    zh: `$$P = VI = 5\\times 2 = 10\\ \\mathrm{W}$$

10 W 的手机充电头只是小口喝；烧水壶是两千瓦。`,
  },
  'el-parallel': {
    en: `Equal resistors in parallel: $R/2$.

$$\\frac{1}{R} = \\frac{1}{100}+\\frac{1}{100} \\Rightarrow R=50\\ \\Omega$$`,
    zh: `两个相同电阻并联就是一半：

$$\\frac{1}{R} = \\frac{1}{100}+\\frac{1}{100} \\Rightarrow R=50\\ \\Omega$$`,
  },
  'el-cap-series': {
    en: `Capacitors in series add like resistors in parallel:

$$\\frac{1}{C} = \\frac{1}{10}+\\frac{1}{10} \\Rightarrow C=5\\ \\mu\\mathrm{F}$$`,
    zh: `电容串联像电阻并联：

$$\\frac{1}{C} = \\frac{1}{10}+\\frac{1}{10} \\Rightarrow C=5\\ \\mu\\mathrm{F}$$`,
  },
  'el-cap-code': {
    en: `Code $104$ means $10\\times 10^{4}$ picofarads $= 100\\,000\\ \\mathrm{pF} = 100\\ \\mathrm{nF}$. The third digit is the power of ten, like a resistor band.`,
    zh: `代号 $104$ 表示 $10\\times 10^{4}$ 皮法 $= 100\\,000\\ \\mathrm{pF} = 100\\ \\mathrm{nF}$。第三位是十的幂，和电阻色环同一套路。`,
  },
  'el-tempco': {
    en: `$$0.00393 = 3930\\times 10^{-6} = 3930\\ \\mathrm{ppm}/^\\circ\\mathrm{C}$$

Copper warms up, resistance creeps up — which is why precision shunts care about temperature.`,
    zh: `$$0.00393 = 3930\\times 10^{-6} = 3930\\ \\mathrm{ppm}/^\\circ\\mathrm{C}$$

铜一热电阻就爬——所以精密分流器很在乎温度。`,
  },
  'el-resistivity': {
    en: `Copper is about $1.68\\times 10^{-8}\\ \\Omega\\cdot\\mathrm{m}$ at $20^\\circ\\mathrm{C}$ — among the lowest of cheap metals. Silver wins, but nobody wires a house in silver.`,
    zh: `铜在 $20^\\circ\\mathrm{C}$ 约 $1.68\\times 10^{-8}\\ \\Omega\\cdot\\mathrm{m}$，便宜金属里几乎最低。银更低，但没人用银给整栋房子布线。`,
  },
  'el-si-diode': {
    en: `A silicon p–n junction sits near **0.7 V** when it conducts. Below that it is almost an open circuit — the knee of the $I$–$V$ curve.`,
    zh: `硅 p–n 结导通时约 **0.7 V**。低于这个几乎开路——就是 $I$–$V$ 曲线的膝盖。`,
  },
  'el-ge-diode': {
    en: `Germanium’s smaller band gap drops closer to **0.3 V**. Old radios loved Ge diodes; they leak more and hate heat.`,
    zh: `锗的禁带更窄，压降大约 **0.3 V**。老收音机爱用锗管：漏电更大，也更怕热。`,
  },
  'el-tau': {
    en: `$$\\tau = RC = 10\\times 10^{3}\\times 100\\times 10^{-6} = 1\\ \\mathrm{s}$$

After about $5\\tau$ a capacitor is as charged as you will wait for.`,
    zh: `$$\\tau = RC = 10\\times 10^{3}\\times 100\\times 10^{-6} = 1\\ \\mathrm{s}$$

大约 $5\\tau$ 之后，电容就充到你愿意再等的程度了。`,
  },
  'el-tau-pct': {
    en: `$$1-e^{-1} \\approx 0.632 = 63.2\\%$$

That $e$ is the same $e$ from compound interest — charging is “continuous compounding” of leftover voltage.`,
    zh: `$$1-e^{-1} \\approx 0.632 = 63.2\\%$$

这里的 $e$ 和复利里的 $e$ 是同一个——充电就是剩余电压在“连续复利”。`,
  },
  'el-led': {
    en: `$$R = \\frac{V_\\mathrm{s}-V_\\mathrm{LED}}{I} = \\frac{9-2}{0.020} = 350\\ \\Omega$$

Skip the resistor and the LED wins a very short, bright life.`,
    zh: `$$R = \\frac{V_\\mathrm{s}-V_\\mathrm{LED}}{I} = \\frac{9-2}{0.020} = 350\\ \\Omega$$

不串电阻，LED 会过上很短很亮的一生。`,
  },
  'el-beta': {
    en: `$$I_\\mathrm{C} = \\beta I_\\mathrm{B} = 100\\times 20\\,\\mu\\mathrm{A} = 2\\ \\mathrm{mA}$$

$\\beta$ is a messy parameter — real transistors wander. Design so the exact number hardly matters.`,
    zh: `$$I_\\mathrm{C} = \\beta I_\\mathrm{B} = 100\\times 20\\,\\mu\\mathrm{A} = 2\\ \\mathrm{mA}$$

$\\beta$ 很野，真管子会飘。设计时最好让精确值不怎么要紧。`,
  },
  'el-adc': {
    en: `$$2^{10} = 1024$$

Levels run $0$ through $1023$. A 10-bit Arduino analogRead is this many buckets for 0–5 V.`,
    zh: `$$2^{10} = 1024$$

编号从 $0$ 到 $1023$。Arduino 的 10 位 analogRead 就是把 0–5 V 切成这么多格。`,
  },
  'el-lc': {
    en: `$$f_0 = \\frac{1}{2\\pi\\sqrt{LC}} = \\frac{1}{2\\pi\\sqrt{10^{-3}\\times 10^{-6}}}\\approx 5033\\ \\mathrm{Hz}$$

Thomson’s formula — the LC “tank” hums at that pitch.`,
    zh: `$$f_0 = \\frac{1}{2\\pi\\sqrt{LC}} = \\frac{1}{2\\pi\\sqrt{10^{-3}\\times 10^{-6}}}\\approx 5033\\ \\mathrm{Hz}$$

汤姆孙公式——LC“水箱”就在这个音高上嗡嗡响。`,
  },
  'el-555': {
    en: `$$f = \\frac{1.44}{(R_1+2R_2)C} = \\frac{1.44}{(10+20)\\times 10^{3}\\times 10\\times 10^{-6}} = 4.8\\ \\mathrm{Hz}$$

Hans Camenzind drew the 555 in 1971; it is still the chip students solder first.`,
    zh: `$$f = \\frac{1.44}{(R_1+2R_2)C} = \\frac{1.44}{(10+20)\\times 10^{3}\\times 10\\times 10^{-6}} = 4.8\\ \\mathrm{Hz}$$

卡曼津德 1971 年画出 555，到现在仍是学生第一个焊的芯片。`,
  },
  'el-db': {
    en: `$$10\\log_{10} 2 \\approx 3.01\\ \\mathrm{dB}$$

Engineers say “plus 3 dB” and mean *about double the power*. Alexander Graham Bell’s name is hiding in “bel”.`,
    zh: `$$10\\log_{10} 2 \\approx 3.01\\ \\mathrm{dB}$$

工程师说“加 3 dB”就是功率大约翻倍。贝尔的名字藏在 bel 里。`,
  },
  'robo-mars-wheels': {
    en: `Sojourner, Spirit, Opportunity, Curiosity, Perseverance: **six** wheels on a rocker-bogie. If one wheel hangs in a hole, the others still reach dirt.`,
    zh: `旅居者、勇气号、机遇号、好奇号、毅力号：**六个**轮子，摇臂悬架。一个轮子掉坑里，别的还能着地。`,
  },
  'robo-servo-wires': {
    en: `Three wires: **brown/black** ground, **red** $+5\\,\\mathrm{V}$, **orange/yellow** PWM pulse. The pulse width (about $1$–$2$ ms) is the angle.`,
    zh: `三根线：棕/黑地、红 $+5\\,\\mathrm{V}$、橙/黄 PWM。脉冲宽度（大约 $1$–$2$ ms）就是角度。`,
  },
  'robo-servo-deg': {
    en: `Hobby servos are geared for about **$180^\\circ$**. Continuous-rotation “servos” are just motors in the same plastic — they never stop at an angle.`,
    zh: `航模舵机齿轮大概转到 **$180^\\circ$**。能连续转的“舵机”其实是同一外壳里的电机，不会停在某个角。`,
  },
  'robo-usb-volts': {
    en: `Classic USB is **5 V**. USB-C can negotiate 9, 15, 20 V (and more) — but a blue Arduino still expects five.`,
    zh: `经典 USB 是 **5 V**。USB-C 可以谈到 9、15、20 V——但蓝色 Arduino 仍要五伏。`,
  },
  'robo-aa-volts': {
    en: `Alkaline AA is **1.5 V** fresh; rechargeable NiMH sits near $1.2\\,\\mathrm{V}$. Four alkalines make a tidy 6 V pack.`,
    zh: `碱性 5 号新的是 **1.5 V**；充电镍氢大约 $1.2\\,\\mathrm{V}$。四节碱性刚好凑 6 V。`,
  },
  'robo-uno-analog': {
    en: `Uno labels **A0–A5** — six analog inputs, 10-bit each. A4/A5 double as I²C, so using a sensor bus steals two.`,
    zh: `Uno 的 **A0–A5** 共六个模拟口，各 10 位。A4/A5 又是 I²C，接总线就占掉两个。`,
  },
  'robo-pi-gpio': {
    en: `The 40-pin header arrived with the Pi B+ in 2014 (old Model B had 26). Not all 40 are GPIO — some are 5 V, 3.3 V, ground.`,
    zh: `40 针排是 2014 年 B+ 带上的（老 Model B 只有 26）。40 脚并不全是 GPIO，有的是 5 V、3.3 V、地。`,
  },
  'robo-8bit-max': {
    en: `$$2^8-1 = 255$$

Unsigned 8-bit: $0\\ldots 255$. That is why old video-game health bars stop at 255.`,
    zh: `$$2^8-1 = 255$$

无符号 8 位：$0\\ldots 255$。老游戏血条停在 255，就是这个。`,
  },
  'robo-asimov-laws': {
    en: `Asimov wrote **three** laws in the 1940s (don’t harm humans, obey, protect yourself — in that order), then spent decades writing stories where they break.`,
    zh: `阿西莫夫 1940 年代写下 **三条**（不伤害人、服从、保护自己，按这个顺序），然后用几十年写它们如何被钻空子。`,
  },
  'robo-roomba-year': {
    en: `iRobot shipped the first Roomba in **2002**. Colin Angle, Helen Greiner and Rodney Brooks had been building packing-peanut-eating robots at MIT first.`,
    zh: `iRobot **2002** 年推出第一台 Roomba。安格尔、格赖纳、布鲁克斯原先在 MIT 做吃泡沫填料的机器人。`,
  },
  'astro-moon-walkers': {
    en: `**12** men, Apollo 11–17 (skipping 13). No one has been back since 1972. Harrison Schmitt, a geologist, was the only scientist among them.`,
    zh: `**12** 人，阿波罗 11–17（13 没登上）。1972 年后再没人回去。地质学家施密特是其中唯一的科学家。`,
  },
  'astro-first-human': {
    en: `Yuri Gagarin, 12 April **1961**, *Vostok 1* — 108 minutes, one orbit. He was 27. The ejector seat, not the capsule, brought him to the field.`,
    zh: `加加林，**1961** 年 4 月 12 日，“东方 1 号”——108 分钟，一圈。他 27 岁。把他送到田里的是弹射座椅，不是返回舱。`,
  },
  'astro-iss-orbit': {
    en: `About **90 minutes** at $\\approx 400$ km: 16 sunrises a day. Crews see a new dawn while you finish one class period.`,
    zh: `大约 **90 分钟**，高度约 400 km：一天 16 次日出。你上一节课，他们能看完一轮黎明。`,
  },
  'astro-apollo-landings': {
    en: `Six landings: 11, 12, 14, 15, 16, 17. Apollo 13 looped the Moon and came home without touching it — “successful failure.”`,
    zh: `六次着陆：11、12、14、15、16、17。阿波罗 13 绕月回家，没踩上去——“成功的失败”。`,
  },
  'astro-shuttles-flew': {
    en: `Five orbiters flew: Columbia, Challenger, Discovery, Atlantis, Endeavour. Enterprise only did atmospheric tests. Two were lost.`,
    zh: `五架真正入轨：哥伦比亚、挑战者、发现、亚特兰蒂斯、奋进。企业号只做大气试飞。两架失事。`,
  },
  'home-ar-volts': {
    en: `Argentina (and most of Europe) uses **220–230 V**. Plugging a US 120 V kettle in will make it very excited, briefly.`,
    zh: `阿根廷（和大部分欧洲）是 **220–230 V**。把美国 120 V 烧水壶插上去，它会短暂地非常兴奋。`,
  },
  'home-ar-hertz': {
    en: `**50 Hz** — clocks with synchronous motors stay honest. The US 60 Hz standard is why imported turntables used to sound a little drunk.`,
    zh: `**50 Hz**——同步电机的钟才走得准。美国是 60 Hz，所以进口电唱机曾经会有点“醉音”。`,
  },
  'home-us-volts': {
    en: `Nominal **120 V** (really $\\approx 110$–$125$). Edison’s early DC was 110 V; Tesla/Westinghouse AC kept a similar number so bulbs still fitted.`,
    zh: `标称 **120 V**（实际大约 $110$–$125$）。爱迪生早期直流是 110 V；特斯拉/威斯汀豪斯的交流电沿用相近数字，好让灯泡还能用。`,
  },
  'ohm-10v-5ohm': {
    en: `$$I=\\frac{10}{5}=2\\ \\mathrm{A}$$`,
    zh: `$$I=\\frac{10}{5}=2\\ \\mathrm{A}$$`,
  },
  'watt-12v-2a': {
    en: `$$P=VI=12\\times 2=24\\ \\mathrm{W}$$

A small desk lamp. James Watt’s name stuck because steam engines needed a unit for “how hard is this working?”`,
    zh: `$$P=VI=12\\times 2=24\\ \\mathrm{W}$$

大约一盏小台灯。瓦特的名字留下来，是因为蒸汽机需要一个“有多费劲”的单位。`,
  },
  'watt-220v-2a': {
    en: `$$P=220\\times 2=440\\ \\mathrm{W}$$

A chunky space heater starts around here; hair dryers go past a kilowatt.`,
    zh: `$$P=220\\times 2=440\\ \\mathrm{W}$$

小型暖风机大概这个量级；吹风机能过一千瓦。`,
  },
  'conv-3km-m': {
    en: `$$3\\ \\mathrm{km} = 3\\times 1000 = 3000\\ \\mathrm{m}$$

*Kilo-* means thousand — kilometre, kilogram, kilobyte (almost).`,
    zh: `$$3\\ \\mathrm{km} = 3\\times 1000 = 3000\\ \\mathrm{m}$$

“千”就是 kilo：千米、千克、千字节（差不多）。`,
  },
  'conv-4m-cm': {
    en: `$$4\\ \\mathrm{m} = 4\\times 100 = 400\\ \\mathrm{cm}$$`,
    zh: `$$4\\ \\mathrm{m} = 4\\times 100 = 400\\ \\mathrm{cm}$$`,
  },
  'conv-hour-s': {
    en: `$$60\\times 60 = 3600$$

A “kilosecond” is $1000\\,\\mathrm{s}\\approx 17$ minutes — SI people quietly prefer that to hours.`,
    zh: `$$60\\times 60 = 3600$$

一千秒大约 17 分钟——国际单位的人悄悄更喜欢用秒，而不是小时。`,
  },
  'el-series': {
    en: `In series the resistances simply add:

$$R = 220 + 330 = 550\\ \\Omega$$`,
    zh: `串联时电阻直接相加：

$$R = 220 + 330 = 550\\ \\Omega$$`,
  },
  'el-divider': {
    en: `A voltage divider gives $V_{out} = V\\cdot\\frac{R_2}{R_1+R_2}$. Equal resistors split it in half: $9\\div 2 = 4.5\\ \\mathrm{V}$.`,
    zh: `分压公式 $V_{出} = V\\cdot\\frac{R_2}{R_1+R_2}$。两个电阻相等就对半分：$9\\div 2 = 4.5\\ \\mathrm{V}$。`,
  },
  'robo-uno-digital': {
    en: `Pins **D0–D13**: fourteen. Six of them (3, 5, 6, 9, 10, 11) can also do PWM, and D0/D1 double as the serial port.`,
    zh: `**D0–D13**，一共十四个。其中 3、5、6、9、10、11 六个还能输出 PWM，D0/D1 同时是串口。`,
  },
  'robo-uno-clock': {
    en: `The ATmega328P runs from a **16 MHz** crystal: sixteen million ticks a second, about one simple instruction per tick.`,
    zh: `ATmega328P 用 **16 MHz** 晶振：每秒一千六百万拍，简单指令差不多一拍一条。`,
  },
  'robo-gpio-volts': {
    en: `Raspberry Pi and ESP32 pins are **3.3 V** logic. Feeding them 5 V from an Uno-style sensor can damage them — use a level shifter or a divider.`,
    zh: `树莓派和 ESP32 都是 **3.3 V** 逻辑。直接接 5 V 的传感器信号可能烧脚，要用电平转换或分压。`,
  },
  'robo-pwm-127': {
    en: `\`analogWrite\` takes $0$–$255$:

$$\\frac{127}{255}\\approx 49.8\\% \\approx 50\\%$$

The pin is on about half the time, so an LED looks about half as bright.`,
    zh: `\`analogWrite\` 取值 $0$–$255$：

$$\\frac{127}{255}\\approx 49.8\\% \\approx 50\\%$$

引脚大约一半时间是高电平，LED 看起来大约一半亮。`,
  },
  'robo-sonar': {
    en: `Sound goes there **and back**, at about $0.0343\\ \\mathrm{cm/\\mu s}$:

$$d = \\frac{580\\times 0.0343}{2}\\approx 10\\ \\mathrm{cm}$$

That is why HC-SR04 code often just divides the echo time by 58.`,
    zh: `声音要**去再回**，速度约 $0.0343\\ \\mathrm{cm/\\mu s}$：

$$d = \\frac{580\\times 0.0343}{2}\\approx 10\\ \\mathrm{cm}$$

所以 HC-SR04 的程序常常直接把回波时间除以 58。`,
  },
  'g7-solve': {
    en: `Move $x$ terms left, numbers right:

$$3x + 2x = 32 - 7,\\quad 5x = 25,\\quad x = 5$$

Check: $3\\cdot 5+7 = 22 = 32-10$.`,
    zh: `移项：含 $x$ 的到左边，数字到右边。

$$3x + 2x = 32 - 7,\\quad 5x = 25,\\quad x = 5$$

检验：$3\\times 5+7 = 22 = 32-10$。`,
  },
  'g7-bolt-nut': {
    en: `Let $x$ make bolts. Nuts must be twice the bolts:

$$2000(22-x) = 2\\times 1200x \\Rightarrow 44000 = 4400x \\Rightarrow x = 10$$`,
    zh: `设 $x$ 人生产螺钉。螺母数是螺钉数的 2 倍：

$$2000(22-x) = 2\\times 1200x \\Rightarrow 44000 = 4400x \\Rightarrow x = 10$$`,
  },
  'g7-table-legs': {
    en: `Let $x$ m³ go to tops. Legs $= 4\\times$ tops:

$$400(12-x) = 4\\times 20x \\Rightarrow 4800 = 480x \\Rightarrow x = 10$$

That is 200 tables; the other 2 m³ make 800 legs.`,
    zh: `设 $x$ m³ 做桌面。桌腿数 $= 4\\times$ 桌面数：

$$400(12-x) = 4\\times 20x \\Rightarrow 4800 = 480x \\Rightarrow x = 10$$

正好 200 张桌子，剩下 2 m³ 做 800 条腿。`,
  },
  'g7-book-sorting': {
    en: `Call the whole job $1$; one person does $\\frac{1}{40}$ per hour.

$$\\frac{4x}{40} + \\frac{8(x+2)}{40} = 1 \\Rightarrow 12x + 16 = 40 \\Rightarrow x = 2$$`,
    zh: `把总工作量看作 $1$，一人每小时做 $\\frac{1}{40}$。

$$\\frac{4x}{40} + \\frac{8(x+2)}{40} = 1 \\Rightarrow 12x + 16 = 40 \\Rightarrow x = 2$$`,
  },
  'g7-profit-pair': {
    en: `Percentages are of each **cost**, not the price:

$$1.25a = 60 \\Rightarrow a = 48,\\qquad 0.75b = 60 \\Rightarrow b = 80$$

Cost $128$, takings $120$: a loss of **8**. Same price, ±p%, always loses.`,
    zh: `百分比是相对各自的**进价**：

$$1.25a = 60 \\Rightarrow a = 48,\\qquad 0.75b = 60 \\Rightarrow b = 80$$

进价共 $128$，收入 $120$，亏 **8** 元。售价相同、一盈一亏同样百分比，总是亏。`,
  },
  'g7-markup': {
    en: `Price $= 1.5x\\times 0.8 = 1.2x$, so

$$1.2x - x = 28 \\Rightarrow x = 140$$`,
    zh: `售价 $= 1.5x\\times 0.8 = 1.2x$，所以

$$1.2x - x = 28 \\Rightarrow x = 140$$`,
  },
  'g7-cost-60': {
    en: `Profit is 25% **of the cost**: $60\\times 0.25 = 15$, so the price is $60 + 15 = 75$.`,
    zh: `利润是**进价**的 25%：$60\\times 25\\% = 15$，售价 $= 60 + 15 = 75$。`,
  },
  'g7-price-cut': {
    en: `Revenue stays the same when

$$0.8(1+x) = 1 \\Rightarrow 1+x = 1.25 \\Rightarrow x = 25\\%$$

Not 20%: the cut is taken from a bigger base than the gain.`,
    zh: `总金额不变：

$$0.8(1+x) = 1 \\Rightarrow 1+x = 1.25 \\Rightarrow x = 25\\%$$

不是 20%：降价和增量的「基数」不一样。`,
  },
  'g7-quota': {
    en: `Equal per-person output:

$$\\frac{4x+20}{4} = \\frac{6x-20}{5} \\Rightarrow 20x + 100 = 24x - 80 \\Rightarrow x = 45$$`,
    zh: `人均相等：

$$\\frac{4x+20}{4} = \\frac{6x-20}{5} \\Rightarrow 20x + 100 = 24x - 80 \\Rightarrow x = 45$$`,
  },
  'g7-promo': {
    en: `For $100\\le t<200$ the first deal costs $t-50$:

$$t - 50 = 0.6t \\Rightarrow 0.4t = 50 \\Rightarrow t = 125$$

Cheaper than 125? Take 40% off. Dearer? Take the 50 off.`,
    zh: `$100\\le t<200$ 时满减实付 $t-50$：

$$t - 50 = 0.6t \\Rightarrow 0.4t = 50 \\Rightarrow t = 125$$

低于 125 元选六折，高于 125 元选满减。`,
  },
  'g7-diophantus': {
    en: `$$\\frac{x}{6}+\\frac{x}{12}+\\frac{x}{7}+5+\\frac{x}{2}+4 = x$$

The fractions add to $\\frac{75}{84}x$, so $\\frac{9}{84}x = 9$ and $x = 84$.`,
    zh: `$$\\frac{x}{6}+\\frac{x}{12}+\\frac{x}{7}+5+\\frac{x}{2}+4 = x$$

分数部分合起来是 $\\frac{75}{84}x$，所以 $\\frac{9}{84}x = 9$，$x = 84$。`,
  },
  'g7-unbeaten': {
    en: `Unbeaten means 0 losses, so draws $= 14 - w$:

$$3w + (14-w) = 28 \\Rightarrow 2w = 14 \\Rightarrow w = 7$$`,
    zh: `不败就是负 0 场，平场 $= 14 - w$：

$$3w + (14-w) = 28 \\Rightarrow 2w = 14 \\Rightarrow w = 7$$`,
  },
  'g7-cube-edges': {
    en: `4 on top, 4 on the bottom, 4 standing up: **12**. A cube also has 6 faces and 8 vertices — and $8 - 12 + 6 = 2$.`,
    zh: `上面 4 条、下面 4 条、竖着 4 条，共 **12** 条。正方体还有 6 个面、8 个顶点，而且 $8 - 12 + 6 = 2$。`,
  },
  'g7-hex-prism': {
    en: `Two hexagon ends plus one rectangle per side: $2 + 6 = 8$. An $n$-sided prism has $n + 2$ faces.`,
    zh: `上下两个六边形底面，加上每条边一个侧面：$2 + 6 = 8$。$n$ 棱柱有 $n + 2$ 个面。`,
  },
  'g7-segments': {
    en: `Every pair of points makes a segment:

$$\\frac{5\\times 4}{2} = 10$$`,
    zh: `任意两点确定一条线段：

$$\\frac{5\\times 4}{2} = 10$$`,
  },
  'g7-four-lines': {
    en: `Each pair of lines can cross once: $1, 3, 6, \\ldots$ — for $n$ lines at most $\\frac{n(n-1)}{2}$, so 4 lines give **6**.`,
    zh: `每两条直线最多一个交点：$1, 3, 6, \\ldots$——$n$ 条直线最多 $\\frac{n(n-1)}{2}$ 个，4 条就是 **6** 个。`,
  },
  'g7-extend-ab': {
    en: `$AC = AB + \\frac{1}{3}AB = \\frac{4}{3}AB$ and $AC = 2\\,DC = 4$, so

$$AB = 4\\times\\frac{3}{4} = 3$$`,
    zh: `$AC = AB + \\frac{1}{3}AB = \\frac{4}{3}AB$，又 $AC = 2\\,DC = 4$，所以

$$AB = 4\\times\\frac{3}{4} = 3$$`,
  },
  'g7-deg-min': {
    en: `$1^\\circ = 60'$, so $0.4^\\circ = 0.4\\times 60' = 24'$.`,
    zh: `$1^\\circ = 60'$，所以 $0.4^\\circ = 0.4\\times 60' = 24'$。`,
  },
  'g7-deg-sec': {
    en: `$1^\\circ = 60'$ and $1' = 60''$, so $1^\\circ = 60\\times 60 = 3600''$ — the same 60s as an hour.`,
    zh: `$1^\\circ = 60'$，$1' = 60''$，所以 $1^\\circ = 60\\times 60 = 3600''$——和一小时的进率一样。`,
  },
  'g7-supplement': {
    en: `$180^\\circ - 150^\\circ = 30^\\circ$ is the angle; its complement is $90^\\circ - 30^\\circ = 60^\\circ$. A shortcut: supplement − complement is always $90^\\circ$.`,
    zh: `这个角是 $180^\\circ - 150^\\circ = 30^\\circ$，余角是 $90^\\circ - 30^\\circ = 60^\\circ$。捷径：补角比余角总是大 $90^\\circ$。`,
  },
  'g7-sup-3comp': {
    en: `$$180 - x = 3(90 - x) \\Rightarrow 180 - x = 270 - 3x \\Rightarrow x = 45$$`,
    zh: `$$180 - x = 3(90 - x) \\Rightarrow 180 - x = 270 - 3x \\Rightarrow x = 45$$`,
  },
  'g7-minute-hand': {
    en: `A full turn in 60 minutes: $360^\\circ\\div 60 = 6^\\circ$. The hour hand is slower: $30^\\circ$ an hour, $0.5^\\circ$ a minute.`,
    zh: `60 分钟转一整圈：$360^\\circ\\div 60 = 6^\\circ$。时针慢得多：每小时 $30^\\circ$，每分钟 $0.5^\\circ$。`,
  },
  'g7-clock-325': {
    en: `Minute hand: $25\\times 6 = 150^\\circ$. Hour hand: $3\\times 30 + 25\\times 0.5 = 102.5^\\circ$.

$$150 - 102.5 = 47.5^\\circ$$`,
    zh: `分针：$25\\times 6 = 150^\\circ$。时针：$3\\times 30 + 25\\times 0.5 = 102.5^\\circ$。

$$150 - 102.5 = 47.5^\\circ$$`,
  },
  'g7-bisect-twice': {
    en: `Each bisection halves: $\\angle AOC = 2\\times 35 = 70^\\circ$, then $\\angle AOB = 2\\times 70 = 140^\\circ$.`,
    zh: `每平分一次就减半，倒推回去翻倍：$\\angle AOC = 2\\times 35 = 70^\\circ$，$\\angle AOB = 2\\times 70 = 140^\\circ$。`,
  },
  'g7-eq-2x5': {
    en: `Subtract 5, then divide by 2:

$$2x = 12,\\quad x = 6$$`,
    zh: `两边减 5，再除以 2：

$$2x = 12,\\quad x = 6$$`,
  },
  'g7-eq-5x': {
    en: `$$x = 45\\div 5 = 9$$`,
    zh: `$$x = 45\\div 5 = 9$$`,
  },
  'g7-eq-xdiv4': {
    en: `First peel off the $+3$, then undo the divide:

$$\\frac{x}{4} = 7,\\quad x = 28$$`,
    zh: `先两边减 3，再乘 4：

$$\\frac{x}{4} = 7,\\quad x = 28$$`,
  },
  'g7-eq-paren': {
    en: `$$x - 1 = 18\\div 3 = 6,\\quad x = 7$$`,
    zh: `$$x - 1 = 18\\div 3 = 6,\\quad x = 7$$`,
  },
  'g7-eq-2step': {
    en: `$$4x = 19 + 9 = 28,\\quad x = 7$$`,
    zh: `$$4x = 19 + 9 = 28,\\quad x = 7$$`,
  },
  'g7-eq-both': {
    en: `Move $x$ left, numbers right:

$$8 + 4 = 3x - x,\\quad 12 = 2x,\\quad x = 6$$`,
    zh: `含 $x$ 的到左边，数字到右边：

$$8 + 4 = 3x - x,\\quad 12 = 2x,\\quad x = 6$$`,
  },
  'g7-time-2h30': {
    en: `$$2\\times 60 + 30 = 150$$

An hour is 60 minutes — same 60 as degrees in a right angle.`,
    zh: `$$2\\times 60 + 30 = 150$$

1 小时 = 60 分钟，和直角的 60 分一样是六十进制。`,
  },
  'g7-time-3h20': {
    en: `$$3\\times 60 + 20 = 200$$`,
    zh: `$$3\\times 60 + 20 = 200$$`,
  },
  'g7-time-180min': {
    en: `$$180\\div 60 = 3$$`,
    zh: `$$180\\div 60 = 3$$`,
  },
  'g7-time-5min': {
    en: `$$5\\times 60 = 300$$`,
    zh: `$$5\\times 60 = 300$$`,
  },
  'g7-time-2days': {
    en: `$$2\\times 24 = 48$$

A day is 24 hours because Earth turns once — clocks just split that turn.`,
    zh: `$$2\\times 24 = 48$$

一天 24 小时，是地球自转一周；钟只是把这一周切开。`,
  },
  'g7-time-quarter': {
    en: `A quarter of $60$ minutes is $15$. Clock faces mark that as the 3.`,
    zh: `$60$ 分钟的四分之一是 $15$。钟面上的 3 就是一刻。`,
  },
  'g7-km-2-5': {
    en: `*Kilo-* means thousand:

$$2.5\\times 1000 = 2500\\ \\mathrm{m}$$`,
    zh: `「千」就是 kilo：

$$2.5\\times 1000 = 2500\\ \\mathrm{m}$$`,
  },
  'g7-m-8000': {
    en: `$$8000\\div 1000 = 8\\ \\mathrm{km}$$`,
    zh: `$$8000\\div 1000 = 8\\ \\mathrm{km}$$`,
  },
  'g7-km-3-200': {
    en: `$$3\\times 1000 + 200 = 3200\\ \\mathrm{m}$$`,
    zh: `$$3\\times 1000 + 200 = 3200\\ \\mathrm{m}$$`,
  },
  'g7-speed-60-2': {
    en: `Distance = speed $\\times$ time:

$$60\\times 2 = 120\\ \\mathrm{km}$$`,
    zh: `路程 = 速度 $\\times$ 时间：

$$60\\times 2 = 120\\ \\mathrm{km}$$`,
  },
  'g7-cm-3m': {
    en: `$$3\\times 100 = 300\\ \\mathrm{cm}$$`,
    zh: `$$3\\times 100 = 300\\ \\mathrm{cm}$$`,
  },
  'g7-ratio-2-3': {
    en: `$2 + 3 = 5$ parts, each $10\\div 5 = 2$ L. Water is 3 parts: $3\\times 2 = 6$.`,
    zh: `$2 + 3 = 5$ 份，每份 $10\\div 5 = 2$ 升。水占 3 份：$3\\times 2 = 6$。`,
  },
  'g7-ratio-36': {
    en: `$1 + 2 = 3$ parts: $36\\div 3 = 12$ each. The $1$-part share is **12**.`,
    zh: `$1 + 2 = 3$ 份：$36\\div 3 = 12$。小的一份是 1 份，就是 **12**。`,
  },
  'g7-ratio-4-5': {
    en: `$$\\frac{4}{5} = \\frac{20}{x} \\Rightarrow 4x = 100 \\Rightarrow x = 25$$`,
    zh: `$$\\frac{4}{5} = \\frac{20}{x} \\Rightarrow 4x = 100 \\Rightarrow x = 25$$`,
  },
  'g7-ratio-map': {
    en: `$$4\\ \\mathrm{cm}\\times 100000 = 400000\\ \\mathrm{cm} = 4000\\ \\mathrm{m} = 4\\ \\mathrm{km}$$

$1:100000$ means 1 cm on paper is 1 km on the ground.`,
    zh: `$$4\\ \\mathrm{cm}\\times 100000 = 400000\\ \\mathrm{cm} = 4000\\ \\mathrm{m} = 4\\ \\mathrm{km}$$

$1:100000$ 就是图上 1 厘米，实地 1 千米。`,
  },
  'g7-ratio-recipe': {
    en: `$$\\frac{12}{3}\\times 5 = 4\\times 5 = 20$$`,
    zh: `$$\\frac{12}{3}\\times 5 = 4\\times 5 = 20$$`,
  },
  'g8-basketball': {
    en: `$$\\begin{cases} x + y = 22 \\\\ 2x + y = 40 \\end{cases}$$

Subtract: $x = 18$ wins, $y = 4$ losses.`,
    zh: `$$\\begin{cases} x + y = 22 \\\\ 2x + y = 40 \\end{cases}$$

两式相减：胜 $x = 18$ 场，负 $y = 4$ 场。`,
  },
  'g8-positive-solutions': {
    en: `$y = 7 - 2x$ must stay positive: $x = 1, 2, 3$ give $y = 5, 3, 1$. **3** pairs — one equation alone has many solutions.`,
    zh: `$y = 7 - 2x$ 要是正整数：$x = 1, 2, 3$ 时 $y = 5, 3, 1$，共 **3** 组。一个二元一次方程单独有很多组解。`,
  },
  'g8-tickets': {
    en: `$$\\begin{cases} x + y = 30 \\\\ 50x + 30y = 1140 \\end{cases}$$

$50x + 30(30-x) = 1140 \\Rightarrow 20x = 240 \\Rightarrow x = 12$.`,
    zh: `$$\\begin{cases} x + y = 30 \\\\ 50x + 30y = 1140 \\end{cases}$$

$50x + 30(30-x) = 1140 \\Rightarrow 20x = 240 \\Rightarrow x = 12$。`,
  },
  'g8-chicken-rabbit': {
    en: `$$\\begin{cases} x + y = 35 \\\\ 2x + 4y = 94 \\end{cases}$$

Halve the second and subtract: $y = 47 - 35 = 12$ rabbits, 23 chickens. An ancient puzzle from the *Sunzi Suanjing*.`,
    zh: `$$\\begin{cases} x + y = 35 \\\\ 2x + 4y = 94 \\end{cases}$$

第二式除以 2 再减第一式：兔 $y = 47 - 35 = 12$ 只，鸡 23 只。出自《孙子算经》。`,
  },
  'g8-cattle': {
    en: `$$\\begin{cases} 30x + 15y = 675 \\\\ 42x + 20y = 940 \\end{cases}$$

From the first, $y = 45 - 2x$; substitute: $2x + 900 = 940$, so $x = 20$ kg and $y = 5$ kg.`,
    zh: `$$\\begin{cases} 30x + 15y = 675 \\\\ 42x + 20y = 940 \\end{cases}$$

由第一式 $y = 45 - 2x$，代入得 $2x + 900 = 940$，大牛 $x = 20$ kg，小牛 $y = 5$ kg。`,
  },
  'g8-trucks': {
    en: `$$\\begin{cases} 2x + 3y = 15.5 \\\\ 5x + 6y = 35 \\end{cases}$$

Double the first and subtract: $x = 4$, then $y = 2.5$. So $3\\times 4 + 5\\times 2.5 = 24.5$ t.`,
    zh: `$$\\begin{cases} 2x + 3y = 15.5 \\\\ 5x + 6y = 35 \\end{cases}$$

第一式乘 2 再相减：$x = 4$，$y = 2.5$。所以 $3\\times 4 + 5\\times 2.5 = 24.5$ t。`,
  },
  'g8-slopes': {
    en: `Minutes become hours:

$$\\frac{x}{30} + \\frac{y}{40} = \\frac{54}{60},\\qquad \\frac{x}{50} + \\frac{y}{40} = \\frac{42}{60}$$

Subtract: $x = 15$ km of slope, then $y = 16$ km flat — **31** km.`,
    zh: `分钟化成小时：

$$\\frac{x}{30} + \\frac{y}{40} = \\frac{54}{60},\\qquad \\frac{x}{50} + \\frac{y}{40} = \\frac{42}{60}$$

相减得坡路 $x = 15$ km，平路 $y = 16$ km，全程 **31** km。`,
  },
  'g8-grain': {
    en: `$$\\begin{cases} x + y = 450 \\\\ 0.6y - 0.4x = 30 \\end{cases}$$

So $x = 240$, $y = 210$. Check: $126 - 96 = 30$.`,
    zh: `$$\\begin{cases} x + y = 450 \\\\ 0.6y - 0.4x = 30 \\end{cases}$$

解得 $x = 240$，$y = 210$。检验：剩 $126 - 96 = 30$ t。`,
  },
  'g8-pens': {
    en: `$5x + 3y = 19$ with whole numbers. Try $x = 1, 2, 3$: only $x = 2$ leaves $9$, a multiple of 3, so $y = 3$.`,
    zh: `$5x + 3y = 19$，都是正整数。试 $x = 1, 2, 3$：只有 $x = 2$ 剩下 9 元，是 3 的倍数，$y = 3$。`,
  },
  'g8-water': {
    en: `$$\\begin{cases} 12x + 2y = 37.6 \\\\ 12x + 5y = 47.2 \\end{cases}$$

Subtract: $3y = 9.6$, $y = 3.2$; then $x = 2.6$.`,
    zh: `$$\\begin{cases} 12x + 2y = 37.6 \\\\ 12x + 5y = 47.2 \\end{cases}$$

相减：$3y = 9.6$，$y = 3.2$；再得 $x = 2.6$。`,
  },
  'g8-ring-run': {
    en: `Laps per minute add when running towards each other and subtract when chasing:

$$\\frac1x + \\frac1y = \\frac12,\\qquad \\frac1x - \\frac1y = \\frac16$$

Add: $\\frac2x = \\frac23$, so $x = 3$ min (and $y = 6$).`,
    zh: `反向时速度相加，同向时速度相减：

$$\\frac1x + \\frac1y = \\frac12,\\qquad \\frac1x - \\frac1y = \\frac16$$

相加：$\\frac2x = \\frac23$，$x = 3$ 分钟（$y = 6$）。`,
  },
  'g8-three-digit': {
    en: `Digits $x, y, z$: $y = 2x$, $3x - z = \\frac{y}{4}$, $x + y + z = 11$.

That gives $x = 2$, $y = 4$, $z = 5$ — the number is $100x + 10y + z = 245$, not "2, 4, 5".`,
    zh: `设百、十、个位为 $x, y, z$：$y = 2x$，$3x - z = \\frac{y}{4}$，$x + y + z = 11$。

解得 $x = 2$，$y = 4$，$z = 5$。题目问的是三位数 $100x + 10y + z = 245$。`,
  },
  'g8-ratio': {
    en: `Let the common ratio be $k$: $x = 2k$, $y = 3k$, $z = 4k$.

$$4k - 3k + 8k = 9k = 27 \\Rightarrow k = 3,\\ z = 12$$`,
    zh: `设公比为 $k$：$x = 2k$，$y = 3k$，$z = 4k$。

$$4k - 3k + 8k = 9k = 27 \\Rightarrow k = 3,\\ z = 12$$`,
  },
  'g8-cyclic': {
    en: `Add all three: each letter appears twice.

$$2(x+y+z) = 3 + 4 + 5 = 12 \\Rightarrow x + y + z = 6$$`,
    zh: `三式相加，每个字母出现两次：

$$2(x+y+z) = 3 + 4 + 5 = 12 \\Rightarrow x + y + z = 6$$`,
  },
  'g8-car': {
    en: `$2x > 210 \\Rightarrow x > 105$. Exactly 105 km/h only just reaches 210 km, so it does not count.`,
    zh: `$2x > 210 \\Rightarrow x > 105$。正好 105 km/h 只能刚好到 210 km，不算「以上」。`,
  },
  'g8-x-minus-7': {
    en: `Property 1: add 7 to both sides and the sign stays — $x > 33$.`,
    zh: `性质 1：两边加 7，不等号方向不变，$x > 33$。`,
  },
  'g8-two-thirds': {
    en: `Multiply both sides by the positive $\\frac32$; the sign stays:

$$x > 50\\times\\frac32 = 75$$`,
    zh: `两边乘正数 $\\frac32$，方向不变：

$$x > 50\\times\\frac32 = 75$$`,
  },
  'g8-largest-int': {
    en: `$$3x - 3 < x + 6 \\Rightarrow 2x < 9 \\Rightarrow x < 4.5$$

The largest whole number below 4.5 is **4**.`,
    zh: `$$3x - 3 < x + 6 \\Rightarrow 2x < 9 \\Rightarrow x < 4.5$$

小于 4.5 的最大整数是 **4**。`,
  },
  'g8-poetry': {
    en: `$$10x - 5(20 - x) > 90 \\Rightarrow 15x > 190 \\Rightarrow x > 12\\tfrac23$$

Questions come whole, so at least **13**.`,
    zh: `$$10x - 5(20 - x) > 90 \\Rightarrow 15x > 190 \\Rightarrow x > 12\\tfrac23$$

题数是整数，至少答对 **13** 题。`,
  },
  'g8-shops': {
    en: `$$100 + 0.9(x - 100) < 50 + 0.95(x - 50)$$

$$10 + 0.9x < 2.5 + 0.95x \\Rightarrow 7.5 < 0.05x \\Rightarrow x > 150$$

At exactly 150 they tie; below it shop B wins.`,
    zh: `$$100 + 0.9(x - 100) < 50 + 0.95(x - 50)$$

$$10 + 0.9x < 2.5 + 0.95x \\Rightarrow 7.5 < 0.05x \\Rightarrow x > 150$$

正好 150 元一样；不到 150 元去乙更省。`,
  },
  'g8-int-count': {
    en: `First: $2x > -5$, so $x > -2.5$. Second: $2x \\le 8$, so $x \\le 4$.

Whole numbers in $-2.5 < x \\le 4$: $-2, -1, 0, 1, 2, 3, 4$ — **7**.`,
    zh: `第一个：$2x > -5$，$x > -2.5$。第二个：$2x \\le 8$，$x \\le 4$。

$-2.5 < x \\le 4$ 里的整数：$-2, -1, 0, 1, 2, 3, 4$，共 **7** 个。`,
  },
  'g8-books': {
    en: `$n$ students, $3n + 8$ books. The last student gets between 1 and 2:

$$1 \\le 3n + 8 - 5(n-1) < 3 \\Rightarrow 5 < n \\le 6$$

So $n = 6$ and there are $3\\times 6 + 8 = 26$ books.`,
    zh: `设 $n$ 人，书 $3n + 8$ 本。最后一人分到 1 到 2 本：

$$1 \\le 3n + 8 - 5(n-1) < 3 \\Rightarrow 5 < n \\le 6$$

所以 $n = 6$，书有 $3\\times 6 + 8 = 26$ 本。`,
  },
  'g8-sys-sum-diff': {
    en: `Add the two equations — the $y$ terms cancel:

$$2x = 16,\\quad x = 8,\\quad y = 4$$`,
    zh: `两式相加，$y$ 消掉：

$$2x = 16,\\quad x = 8,\\quad y = 4$$`,
  },
  'g8-sys-sub': {
    en: `Subtract the second from the first:

$$x = 4,\\quad y = 7 - 4 = 3$$`,
    zh: `第一式减第二式：

$$x = 4,\\quad y = 7 - 4 = 3$$`,
  },
  'g8-sys-2y': {
    en: `Both have $2y$ — subtract:

$$2x = 8,\\quad x = 4,\\quad y = 2$$`,
    zh: `两式都有 $2y$，相减：

$$2x = 8,\\quad x = 4,\\quad y = 2$$`,
  },
  'g8-sys-add': {
    en: `Add: the $y$ terms cancel.

$$3x = 18,\\quad x = 6,\\quad y = 7$$`,
    zh: `相加，$y$ 消掉：

$$3x = 18,\\quad x = 6,\\quad y = 7$$`,
  },
  'g8-sys-elim': {
    en: `The $2y$ and $-2y$ cancel if you add:

$$8x = 32,\\quad x = 4,\\quad y = 2$$`,
    zh: `$2y$ 和 $-2y$ 相加抵消：

$$8x = 32,\\quad x = 4,\\quad y = 2$$`,
  },
  'g8-sys-xy15': {
    en: `$x = 15 - y$. Substitute:

$$2(15 - y) + 3y = 36 \\Rightarrow 30 + y = 36 \\Rightarrow y = 6$$`,
    zh: `$x = 15 - y$，代入：

$$2(15 - y) + 3y = 36 \\Rightarrow 30 + y = 36 \\Rightarrow y = 6$$`,
  },
  'g8-sys-3var': {
    en: `Add all three: each letter appears twice.

$$2(x+y+z) = 36 \\Rightarrow x+y+z = 18$$

Then $y = 18 - (x+z) = 18 - 14 = 4$.`,
    zh: `三式相加，每个字母出现两次：

$$2(x+y+z) = 36 \\Rightarrow x+y+z = 18$$

所以 $y = 18 - (x+z) = 18 - 14 = 4$。`,
  },
  'g8-sys-two-num': {
    en: `$$\\begin{cases} x + y = 18 \\\\ x - y = 4 \\end{cases}$$

Add: $2x = 22$, so the larger is $x = 11$.`,
    zh: `$$\\begin{cases} x + y = 18 \\\\ x - y = 4 \\end{cases}$$

相加：$2x = 22$，较大的是 $x = 11$。`,
  },
  'g8-sys-fruit': {
    en: `$$3a + 2(8 - a) = 20 \\Rightarrow a + 16 = 20 \\Rightarrow a = 4$$`,
    zh: `$$3a + 2(8 - a) = 20 \\Rightarrow a + 16 = 20 \\Rightarrow a = 4$$`,
  },
  'g8-sys-class': {
    en: `$$b + g = 40,\\quad b = g + 6$$

$$2g + 6 = 40 \\Rightarrow g = 17,\\quad b = 23$$`,
    zh: `$$b + g = 40,\\quad b = g + 6$$

$$2g + 6 = 40 \\Rightarrow g = 17,\\quad b = 23$$`,
  },
  'g8-ineq-2x3': {
    en: `$$2x > 8,\\quad x > 4$$`,
    zh: `$$2x > 8,\\quad x > 4$$`,
  },
  'g8-ineq-5x': {
    en: `Divide by the positive 5 — the sign stays: $x \\le 8$.`,
    zh: `两边除以正数 5，方向不变：$x \\le 8$。`,
  },
  'g8-ineq-3x4': {
    en: `$$3x < 21,\\quad x < 7$$`,
    zh: `$$3x < 21,\\quad x < 7$$`,
  },
  'g8-ineq-4x8': {
    en: `$$4x \\ge 20,\\quad x \\ge 5$$`,
    zh: `$$4x \\ge 20,\\quad x \\ge 5$$`,
  },
  'g8-ineq-xdiv3': {
    en: `$$\\frac{x}{3} \\le 4,\\quad x \\le 12$$`,
    zh: `$$\\frac{x}{3} \\le 4,\\quad x \\le 12$$`,
  },
  'g8-ineq-flip': {
    en: `Divide by $-2$ and **flip** the sign:

$$x < 9$$`,
    zh: `两边除以 $-2$，不等号**变向**：

$$x < 9$$`,
  },
  'g8-ineq-paren': {
    en: `$$x + 3 < 10,\\quad x < 7$$`,
    zh: `$$x + 3 < 10,\\quad x < 7$$`,
  },
  'g8-ineq-largest': {
    en: `$$2x < 14,\\quad x < 7$$

The largest whole number below 7 is **6**.`,
    zh: `$$2x < 14,\\quad x < 7$$

小于 7 的最大整数是 **6**。`,
  },
  'g8-ineq-smallest': {
    en: `$$x \\ge \\frac{20}{3} \\approx 6.67$$

Whole numbers start at **7**.`,
    zh: `$$x \\ge \\frac{20}{3} \\approx 6.67$$

最小整数解是 **7**。`,
  },
  'g8-ineq-count': {
    en: `$4, 5, 6, 7, 8, 9$ — **6** numbers. The endpoints 3 and 10 stay out because of the strict $<$.`,
    zh: `$4, 5, 6, 7, 8, 9$，共 **6** 个。两端的 3 和 10 因为是严格小于，不算。`,
  },
  'g8-ineq-both': {
    en: `$3, 4, 5, 6, 7, 8$ — **6**. The 2 is out ($x > 2$); the 8 stays ($x \\le 8$).`,
    zh: `$3, 4, 5, 6, 7, 8$，共 **6** 个。2 不算（$x > 2$），8 算（$x \\le 8$）。`,
  },
  'g8-ineq-avg': {
    en: `$$\\frac{75+78+82+x}{4} > 80 \\Rightarrow 235 + x > 320 \\Rightarrow x > 85$$`,
    zh: `$$\\frac{75+78+82+x}{4} > 80 \\Rightarrow 235 + x > 320 \\Rightarrow x > 85$$`,
  },
  'ar-aconcagua-m': {
    en: `Aconcagua is **6961 m** tall, the highest point of both the Americas and the Southern Hemisphere.`,
    zh: `阿空加瓜山高 **6961 米**，是美洲和南半球的最高点。`,
  },
  'ar-obelisco-m': {
    en: `It is **67.5 m** tall, built in 1936 for the city’s 400th birthday, in only 31 days.`,
    zh: `高 **67.5 米**，1936 年为纪念建城 400 年而建，只用了 31 天。`,
  },
  'ar-carbon-m': {
    en: `It lies **105 m** below sea level. Aconcagua, the highest point of the Americas, is in the same country: more than 7 km higher.`,
    zh: `它低于海平面 **105 米**。美洲最高点阿空加瓜山也在阿根廷，高出 7 公里还多。`,
  },
  'ar-plata-km': {
    en: `About **220 km** at the mouth, which is why it is often called the widest river in the world.`,
    zh: `河口处约 **220 公里**，常被称为世界上最宽的河。`,
  },
  'ar-area-km2': {
    en: `$2\\,780\\,400$ km², about **2780** thousand km². The 8th largest country in the world, about $0.29$ times the size of China.`,
    zh: `$2\\,780\\,400$ 平方公里，约 **2780** 千平方公里。世界第八大国家，大约是中国面积的 $0.29$ 倍。`,
  },
  'ar-iguazu-falls': {
    en: `About **275** falls along nearly $2.7$ km of river. The biggest, the Devil’s Throat (Garganta del Diablo), is U-shaped.`,
    zh: `约 **275** 道瀑布，绵延近 $2.7$ 公里。最大的一道“魔鬼咽喉”呈 U 形。`,
  },
  'ar-provinces': {
    en: `**23** provinces, plus the Autonomous City of Buenos Aires, which is not a province.`,
    zh: `**23** 个省，另有布宜诺斯艾利斯自治市，它不算省。`,
  },
  'ar-independence': {
    en: `On **9 July 1816**, in Tucumán. That is why the widest avenue in Buenos Aires is called *9 de Julio*.`,
    zh: `**1816 年 7 月 9 日**在图库曼宣布。所以布宜诺斯艾利斯最宽的大道叫“7 月 9 日大道”。`,
  },
  'ar-flag': {
    en: `On 27 February **1812**, by the Paraná river in Rosario, four years before independence.`,
    zh: `**1812 年** 2 月 27 日，在罗萨里奥的巴拉那河畔，比独立早四年。`,
  },
  'ar-subte': {
    en: `Line A opened in **1913**: the first underground railway in Latin America and the whole Southern Hemisphere.`,
    zh: `**1913 年**开通 A 线：拉丁美洲乃至整个南半球的第一条地铁。`,
  },
  'ar-teatro-colon': {
    en: `It opened on 25 May **1908** and is famous for some of the best acoustics in the world.`,
    zh: `**1908 年** 5 月 25 日开幕，以世界顶级的音响效果闻名。`,
  },
  'ar-world-cups': {
    en: `**1978**, **1986** and **2022**. The 2022 final against France went to penalties after a 3–3 draw.`,
    zh: `**1978**、**1986** 和 **2022** 年。2022 年决赛与法国 3–3 战平，点球取胜。`,
  },
  'ar-hand-of-god': {
    en: `In the **1986** World Cup quarter-final against England. Four minutes later he scored the “Goal of the Century”, and Argentina went on to win the cup.`,
    zh: `**1986 年**世界杯四分之一决赛对英格兰。四分钟后他又打进“世纪进球”，阿根廷最终夺冠。`,
  },
  'ar-messi-ballon': {
    en: `**8**: 2009, 2010, 2011, 2012, 2015, 2019, 2021 and 2023, more than any other player.`,
    zh: `**8** 次：2009、2010、2011、2012、2015、2019、2021、2023 年，史上最多。`,
  },
  'ar-messi-debut': {
    en: `He debuted on 16 October 2004, aged **17**. He had moved from Rosario to Barcelona at 13.`,
    zh: `2004 年 10 月 16 日首秀，当时 **17** 岁。他 13 岁从罗萨里奥来到巴塞罗那。`,
  },
  'ar-fangio': {
    en: `**5**, in 1951 and 1954–1957. His record stood for 46 years until Michael Schumacher passed it.`,
    zh: `**5** 次：1951 年和 1954–1957 年。这个纪录保持了 46 年，才被舒马赫打破。`,
  },
  'ar-nobel': {
    en: `**5**: Carlos Saavedra Lamas (Peace, 1936), Bernardo Houssay (Medicine, 1947), Luis Leloir (Chemistry, 1970), Adolfo Pérez Esquivel (Peace, 1980) and César Milstein (Medicine, 1984).`,
    zh: `**5** 位：萨韦德拉·拉马斯（和平奖，1936）、乌赛（医学奖，1947）、莱洛伊尔（化学奖，1970）、佩雷斯·埃斯基维尔（和平奖，1980）、米尔斯坦（医学奖，1984）。`,
  },
  'cn-everest-cm': {
    en: `The new height is **8848.86 m**. The China–Nepal border runs over the summit, so the two countries announced it together.`,
    zh: `新高程为 **8848.86 米**。中尼边界正好穿过峰顶，所以两国共同宣布了这个数字。`,
  },
  'cn-great-wall-km': {
    en: `The survey counted **21 196 km** of walls, trenches and natural barriers built over about 2000 years.`,
    zh: `测量共计 **21 196 公里**的墙体、壕堑和天然屏障，修建跨越约 2000 年。`,
  },
  'cn-yangtze-km': {
    en: `About **6300 km**. Only the Nile and the Amazon are longer.`,
    zh: `约 **6300 公里**。只有尼罗河和亚马孙河比它长。`,
  },
  'cn-grand-canal-km': {
    en: `About **1776 km**. Its oldest parts are about 2500 years old.`,
    zh: `约 **1776 公里**。最早的河段已有约 2500 年历史。`,
  },
  'cn-hzmb-km': {
    en: `About **55 km**. It opened in 2018 and is the longest sea crossing of its kind.`,
    zh: `约 **55 公里**。2018 年通车，是同类中最长的跨海工程。`,
  },
  'cn-three-gorges-m': {
    en: `The dam is **181 m** tall and about $2.3$ km long. Its power station has the largest capacity in the world.`,
    zh: `坝高 **181 米**，长约 $2.3$ 公里。它的水电站装机容量世界第一。`,
  },
  'cn-shanghai-tower-m': {
    en: `It is **632 m** tall. Its twisting shape cuts wind loads by about a quarter.`,
    zh: `高 **632 米**。它扭转的外形让风荷载减少了约四分之一。`,
  },
  'cn-leshan-m': {
    en: `It is **71 m** tall, carved between 713 and 803: the largest stone Buddha in the world.`,
    zh: `高 **71 米**，开凿于 713–803 年，是世界上最大的石刻佛像。`,
  },
  'cn-hsr-kmh': {
    en: `**350 km/h**, among the fastest regular train services in the world. At that speed Beijing to Shanghai takes about 4.5 hours.`,
    zh: `每小时 **350 公里**，是世界上最快的常规列车之一。北京到上海只要约 4.5 小时。`,
  },
  'cn-yao-cm': {
    en: `Yao Ming is **229 cm** tall, one of the tallest players in NBA history.`,
    zh: `姚明身高 **229 厘米**，是 NBA 历史上最高的球员之一。`,
  },
  'cn-yao-allstar': {
    en: `**8** times, every season from 2003 to 2011 except 2010, when he was injured.`,
    zh: `**8** 次：2003–2011 年间除 2010 年（受伤）外每年都入选。`,
  },
  'cn-li-na': {
    en: `**2**: the French Open in 2011, the first for any Asian player, and the Australian Open in 2014.`,
    zh: `**2** 个：2011 年法网（亚洲球员首个）和 2014 年澳网。`,
  },
  'cn-ethnic-groups': {
    en: `**56**: the Han majority and 55 minority groups such as the Zhuang, Hui, Uyghur, Miao and Tibetan peoples.`,
    zh: `**56** 个：汉族和壮族、回族、维吾尔族、苗族、藏族等 55 个少数民族。`,
  },
  'cn-common-chars': {
    en: `**3500**: 2,500 common characters plus 1,000 less common ones. Knowing them covers almost all everyday text.`,
    zh: `**3500** 个：2500 个常用字加 1000 个次常用字，几乎覆盖日常所有文字。`,
  },
  'cn-terracotta': {
    en: `About **8000** soldiers, plus horses and chariots, made to guard the first emperor, Qin Shi Huang. Found by farmers digging a well in 1974.`,
    zh: `约 **8000** 个陶俑，还有战马和战车，为秦始皇守陵。1974 年农民打井时发现。`,
  },
  'cn-wild-pandas': {
    en: `The fourth national survey found **1864** wild pandas, up 17% from the survey before. In 2016 they were moved from “endangered” to “vulnerable”.`,
    zh: `第四次全国调查发现 **1864** 只，比上一次增加 17%。2016 年大熊猫由“濒危”降为“易危”。`,
  },
  'cn-prc-year': {
    en: `On 1 October **1949**, which is why 1 October is National Day (国庆节).`,
    zh: `**1949 年** 10 月 1 日，所以 10 月 1 日是国庆节。`,
  },
  'cn-yang-liwei': {
    en: `On Shenzhou 5 in October **2003**. China became the third country to send a person into space on its own rocket.`,
    zh: `**2003 年** 10 月乘神舟五号。中国成为第三个独立把人送上太空的国家。`,
  },
  'cn-2008-golds': {
    en: `**48** gold medals, the first time China topped the gold-medal table.`,
    zh: `**48** 枚金牌，中国首次位居金牌榜第一。`,
  },
  'cn-winter-olympics': {
    en: `Summer **2008**, Winter **2022**. Some 2008 venues, like the Water Cube, were reused for 2022.`,
    zh: `夏季 **2008**，冬季 **2022**。“水立方”等 2008 年场馆在 2022 年被再次使用。`,
  },
};

export function noteFor(question, lang = 'en') {
  if (!question) return '';
  const row = NOTES[question.id];
  if (lang === 'zh') {
    if (row && row.zh) return row.zh;
    if (question.noteZh) return question.noteZh;
    if (question.note) return question.note;
  } else if (row && row.en) {
    return row.en;
  } else if (question.note) {
    return question.note;
  }

  const hint = String(question.hint || '').trim();
  if (question.type === 'place') {
    if (hint) {
      return lang === 'zh' ? `**为什么是这一项**\n\n${hint}` : `**Why this chip**\n\n${hint}`;
    }
    return lang === 'zh'
      ? '把硬币押在能让句子成立的那一项。空白处就是要填的符号或结果。'
      : 'Put the coin on the chip that makes the sentence true. The blank is the missing sign or result.';
  }
  return hint;
}

/** Note stored on a reveal result, in the screen language. */
export function noteFromResult(result, lang = 'en') {
  if (!result) return '';
  if (lang === 'zh') return result.noteZh || result.note || result.hint || '';
  return result.note || result.noteZh || result.hint || '';
}
