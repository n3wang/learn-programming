---
sidebar_position: 1
title: (* ^ ω ^) - Printing Japanese Emoticons
---

*Hello everyone, by the end of this section, you will learn how to create a
program that 'texts' you cute Japanese emoticons!*


Kaomojis (顔文字) are Japanese Emoticons that can be created a set combining different
characters from characters available in our computer. Here a list of emoticons
extracted from [this website](http://kaomoji.ru/en/).
```

(* ^ ω ^)	(´ ∀ ` *)	٩(◕‿◕｡)۶	☆*:.｡.o(≧▽≦)o.｡.:*☆
(o^▽^o)	(⌒▽⌒)☆	<(￣︶￣)>	。.:☆*:･'(*⌒―⌒*)))
ヽ(・∀・)ﾉ	(´｡• ω •｡`)	(￣ω￣)	｀;:゛;｀;･(°ε° )
(o･ω･o)	(＠＾◡＾)	ヽ(*・ω・)ﾉ	(o_ _)ﾉ彡☆
(^人^)	(o´▽`o)	(*´▽`*)	｡ﾟ( ﾟ^∀^ﾟ)ﾟ｡
( ´ ω ` )	(((o(*°▽°*)o)))	(≧◡≦)	(o´∀`o)
(´• ω •`)	(＾▽＾)	(⌒ω⌒)	∑d(°∀°d)
╰(▔∀▔)╯	(─‿‿─)	(*^‿^*)	ヽ(o^ ^o)ﾉ
(✯◡✯)	(◕‿◕)	(*≧ω≦*)	(☆▽☆)
(⌒‿⌒)	＼(≧▽≦)／	ヽ(o＾▽＾o)ノ	☆ ～('▽^人)
(*°▽°*)	٩(｡•́‿•̀｡)۶	(✧ω✧)	ヽ(*⌒▽⌒*)ﾉ
(´｡• ᵕ •｡`)	( ´ ▽ ` )	(￣▽￣)	╰(*´︶`*)╯
ヽ(>∀<☆)ノ	o(≧▽≦)o	(☆ω☆)	(っ˘ω˘ς )
＼(￣▽￣)／	(*¯︶¯*)	＼(＾▽＾)／	٩(◕‿◕)۶
(o˘◡˘o)	\(★ω★)/	\(^ヮ^)/	(〃＾▽＾〃)
(╯✧▽✧)╯	o(>ω<)o	o( ❛ᴗ❛ )o	｡ﾟ(TヮT)ﾟ｡
( ‾́ ◡ ‾́ )	(ﾉ´ヮ`)ﾉ*: ･ﾟ	(b ᵔ▽ᵔ)b	(๑˃ᴗ˂)ﻭ
(๑˘︶˘๑)	( ˙꒳​˙ )	(*꒦ິ꒳꒦ີ)	°˖✧◝(⁰▿⁰)◜✧˖°
(´･ᴗ･ ` )	(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧	(„• ֊ •„)	(.❛ ᴗ ❛.)
(⁀ᗢ⁀)	(￢‿￢ )	(¬‿¬ )	(*￣▽￣)b
( ˙▿˙ )	(¯▿¯)	( ◕▿◕ )	＼(٥⁀▽⁀ )／
(„• ᴗ •„)	(ᵔ◡ᵔ)	( ´ ▿ ` )	

```


## Introduction Exercise
:::important Printing your first Japanese Emoticon.
Write a program that prints: `(*¯︶¯*)`
<details>
<summary>
🧪 See/try the Solution
</summary>

<PistonRunner
  lang="python"
  interactive={false}
  height="220px"
  code={`(* ^ ω ^)	(´ ∀ \` *)	٩(◕‿◕｡)۶	☆*:.｡.o(≧▽≦)o.｡.:*☆
(o^▽^o)	(⌒▽⌒)☆	<(￣︶￣)>	。.:☆*:･'(*⌒―⌒*)))
ヽ(・∀・)ﾉ	(´｡• ω •｡\`)	(￣ω￣)	｀;:゛;｀;･(°ε° )
(o･ω･o)	(＠＾◡＾)	ヽ(*・ω・)ﾉ	(o_ _)ﾉ彡☆
(^人^)	(o´▽\`o)	(*´▽\`*)	｡ﾟ( ﾟ^∀^ﾟ)ﾟ｡
( ´ ω \` )	(((o(*°▽°*)o)))	(≧◡≦)	(o´∀\`o)
(´• ω •\`)	(＾▽＾)	(⌒ω⌒)	∑d(°∀°d)
╰(▔∀▔)╯	(─‿‿─)	(*^‿^*)	ヽ(o^ ^o)ﾉ
(✯◡✯)	(◕‿◕)	(*≧ω≦*)	(☆▽☆)
(⌒‿⌒)	＼(≧▽≦)／	ヽ(o＾▽＾o)ノ	☆ ～('▽^人)
(*°▽°*)	٩(｡•́‿•̀｡)۶	(✧ω✧)	ヽ(*⌒▽⌒*)ﾉ
(´｡• ᵕ •｡\`)	( ´ ▽ \` )	(￣▽￣)	╰(*´︶\`*)╯
ヽ(>∀<☆)ノ	o(≧▽≦)o	(☆ω☆)	(っ˘ω˘ς )
＼(￣▽￣)／	(*¯︶¯*)	＼(＾▽＾)／	٩(◕‿◕)۶
(o˘◡˘o)	\(★ω★)/	\(^ヮ^)/	(〃＾▽＾〃)
(╯✧▽✧)╯	o(>ω<)o	o( ❛ᴗ❛ )o	｡ﾟ(TヮT)ﾟ｡
( ‾́ ◡ ‾́ )	(ﾉ´ヮ\`)ﾉ*: ･ﾟ	(b ᵔ▽ᵔ)b	(๑˃ᴗ˂)ﻭ
(๑˘︶˘๑)	( ˙꒳​˙ )	(*꒦ິ꒳꒦ີ)	°˖✧◝(⁰▿⁰)◜✧˖°
(´･ᴗ･ \` )	(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧	(„• ֊ •„)	(.❛ ᴗ ❛.)
(⁀ᗢ⁀)	(￢‿￢ )	(¬‿¬ )	(*￣▽￣)b
( ˙▿˙ )	(¯▿¯)	( ◕▿◕ )	＼(٥⁀▽⁀ )／
(„• ᴗ •„)	(ᵔ◡ᵔ)	( ´ ▿ \` )	
`}
/>

</details>
:::


:::tip Class Exercise
- Please modify code above a with a different emoticon! You are allowed to copy-paste, you don't need to type in the specific characters to print that face.

:::

## Printing Special Characters

:::important A trickier problem.
Write a program that prints: `/(￣▽￣)\`
- Note how in python there are some characters that when printing, we need to
  **escape** them (for example: `\`).
- That's why on the following example, instead of only having one `\` there are
  2 of them `\\`

<details>
<summary>
🧪 See/try the Solution
</summary>

<PistonRunner
  lang="python"
  interactive={false}
  height="220px"
  code={`(* ^ ω ^)	(´ ∀ \` *)	٩(◕‿◕｡)۶	☆*:.｡.o(≧▽≦)o.｡.:*☆
(o^▽^o)	(⌒▽⌒)☆	<(￣︶￣)>	。.:☆*:･'(*⌒―⌒*)))
ヽ(・∀・)ﾉ	(´｡• ω •｡\`)	(￣ω￣)	｀;:゛;｀;･(°ε° )
(o･ω･o)	(＠＾◡＾)	ヽ(*・ω・)ﾉ	(o_ _)ﾉ彡☆
(^人^)	(o´▽\`o)	(*´▽\`*)	｡ﾟ( ﾟ^∀^ﾟ)ﾟ｡
( ´ ω \` )	(((o(*°▽°*)o)))	(≧◡≦)	(o´∀\`o)
(´• ω •\`)	(＾▽＾)	(⌒ω⌒)	∑d(°∀°d)
╰(▔∀▔)╯	(─‿‿─)	(*^‿^*)	ヽ(o^ ^o)ﾉ
(✯◡✯)	(◕‿◕)	(*≧ω≦*)	(☆▽☆)
(⌒‿⌒)	＼(≧▽≦)／	ヽ(o＾▽＾o)ノ	☆ ～('▽^人)
(*°▽°*)	٩(｡•́‿•̀｡)۶	(✧ω✧)	ヽ(*⌒▽⌒*)ﾉ
(´｡• ᵕ •｡\`)	( ´ ▽ \` )	(￣▽￣)	╰(*´︶\`*)╯
ヽ(>∀<☆)ノ	o(≧▽≦)o	(☆ω☆)	(っ˘ω˘ς )
＼(￣▽￣)／	(*¯︶¯*)	＼(＾▽＾)／	٩(◕‿◕)۶
(o˘◡˘o)	\(★ω★)/	\(^ヮ^)/	(〃＾▽＾〃)
(╯✧▽✧)╯	o(>ω<)o	o( ❛ᴗ❛ )o	｡ﾟ(TヮT)ﾟ｡
( ‾́ ◡ ‾́ )	(ﾉ´ヮ\`)ﾉ*: ･ﾟ	(b ᵔ▽ᵔ)b	(๑˃ᴗ˂)ﻭ
(๑˘︶˘๑)	( ˙꒳​˙ )	(*꒦ິ꒳꒦ີ)	°˖✧◝(⁰▿⁰)◜✧˖°
(´･ᴗ･ \` )	(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧	(„• ֊ •„)	(.❛ ᴗ ❛.)
(⁀ᗢ⁀)	(￢‿￢ )	(¬‿¬ )	(*￣▽￣)b
( ˙▿˙ )	(¯▿¯)	( ◕▿◕ )	＼(٥⁀▽⁀ )／
(„• ᴗ •„)	(ᵔ◡ᵔ)	( ´ ▿ \` )	
`}
/>

</details>
:::






### Exercise
:::tip Fix the following Emoticon printer

In this program we are trying to print the following emoticon: `\>\▽\<\`

The following program throws an error: 
```python
print("\>\▽\<\")
```

- Do you think you can figure out why?

Run with Piston below

<details>
<summary>
🔨 Try fixing it here!
</summary>

<PistonRunner
  lang="python"
  interactive={false}
  height="520px"
  code={`(* ^ ω ^)	(´ ∀ \` *)	٩(◕‿◕｡)۶	☆*:.｡.o(≧▽≦)o.｡.:*☆
(o^▽^o)	(⌒▽⌒)☆	<(￣︶￣)>	。.:☆*:･'(*⌒―⌒*)))
ヽ(・∀・)ﾉ	(´｡• ω •｡\`)	(￣ω￣)	｀;:゛;｀;･(°ε° )
(o･ω･o)	(＠＾◡＾)	ヽ(*・ω・)ﾉ	(o_ _)ﾉ彡☆
(^人^)	(o´▽\`o)	(*´▽\`*)	｡ﾟ( ﾟ^∀^ﾟ)ﾟ｡
( ´ ω \` )	(((o(*°▽°*)o)))	(≧◡≦)	(o´∀\`o)
(´• ω •\`)	(＾▽＾)	(⌒ω⌒)	∑d(°∀°d)
╰(▔∀▔)╯	(─‿‿─)	(*^‿^*)	ヽ(o^ ^o)ﾉ
(✯◡✯)	(◕‿◕)	(*≧ω≦*)	(☆▽☆)
(⌒‿⌒)	＼(≧▽≦)／	ヽ(o＾▽＾o)ノ	☆ ～('▽^人)
(*°▽°*)	٩(｡•́‿•̀｡)۶	(✧ω✧)	ヽ(*⌒▽⌒*)ﾉ
(´｡• ᵕ •｡\`)	( ´ ▽ \` )	(￣▽￣)	╰(*´︶\`*)╯
ヽ(>∀<☆)ノ	o(≧▽≦)o	(☆ω☆)	(っ˘ω˘ς )
＼(￣▽￣)／	(*¯︶¯*)	＼(＾▽＾)／	٩(◕‿◕)۶
(o˘◡˘o)	\(★ω★)/	\(^ヮ^)/	(〃＾▽＾〃)
(╯✧▽✧)╯	o(>ω<)o	o( ❛ᴗ❛ )o	｡ﾟ(TヮT)ﾟ｡
( ‾́ ◡ ‾́ )	(ﾉ´ヮ\`)ﾉ*: ･ﾟ	(b ᵔ▽ᵔ)b	(๑˃ᴗ˂)ﻭ
(๑˘︶˘๑)	( ˙꒳​˙ )	(*꒦ິ꒳꒦ີ)	°˖✧◝(⁰▿⁰)◜✧˖°
(´･ᴗ･ \` )	(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧	(„• ֊ •„)	(.❛ ᴗ ❛.)
(⁀ᗢ⁀)	(￢‿￢ )	(¬‿¬ )	(*￣▽￣)b
( ˙▿˙ )	(¯▿¯)	( ◕▿◕ )	＼(٥⁀▽⁀ )／
(„• ᴗ •„)	(ᵔ◡ᵔ)	( ´ ▿ \` )	
`}
/>

</details>

:::

## Next: Kaomoji Composer

Part 2 — variables, lists, loops, and `append`: [Kaomoji Composer](./kaomoji-composer).

