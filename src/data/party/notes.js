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
  'ohm-12v-4ohm': {
    en: `$$I=\\frac{V}{R}=\\frac{12}{4}=3\\ \\mathrm{A}$$

Same Ohm as the electronics pack — current is what the battery must actually supply.`,
    zh: `$$I=\\frac{V}{R}=\\frac{12}{4}=3\\ \\mathrm{A}$$

和电子题同一条欧姆定律——这就是电池真要吐出的电流。`,
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
