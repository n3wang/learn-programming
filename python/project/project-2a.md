---
sidebar_position: 3
title: 💯 2a - Using python to calculate things
---

# Calculating Things 💯

改代码，按运行，让输出对上目标。 Fix the code, press Run, match the target.

<br />

## Profit

<ExerciseSet>

<Exercise title="profit">

$$Profit = Revenue - Cost$$

`revenue` 收入 − `cost` 成本

<OutputChallenge
  title="profit"
  target={`40`}
  starter={`revenue = 100
cost = 60
print(revenue + cost)
`}
/>
</Exercise>

<Exercise title="profit_with_returns">

$$Profit = Revenue - Cost - Returns$$

`returns` 退货

<OutputChallenge
  title="profit_with_returns"
  target={`30`}
  starter={`revenue = 100
cost = 60
returns = 10
print(revenue - cost)
`}
/>
</Exercise>

<Exercise title="margin">

$$Margin = \frac{Profit}{Revenue} \times 100$$

`profit` 利润 ÷ `revenue` 收入 × 100

<OutputChallenge
  title="margin"
  target={`40.0`}
  starter={`profit = 40
revenue = 100
print(profit / revenue)
`}
/>
</Exercise>

<Exercise title="margin_round">

$$Margin = \mathrm{round}\left(\frac{Profit}{Revenue} \times 100,\ 1\right)$$

保留 1 位小数 (round to 1 decimal)

<OutputChallenge
  title="margin_round"
  target={`42.9`}
  starter={`profit = 33
revenue = 77
print((profit / revenue) * 100)
`}
/>
</Exercise>

</ExerciseSet>

## Growing Money

<ExerciseSet>

<Exercise title="double_money">

$$Money = Principal \times (1 + Rate)$$

`principal` 本金 × (1 + `rate` 利率)

<OutputChallenge
  title="double_money"
  target={`200.0`}
  starter={`principal = 100
rate = 1.0
print(round(principal + rate, 2))
`}
/>
</Exercise>

<Exercise title="grow_two_years">

$$Money = Principal \times (1 + Rate)^{Years}$$

`years` 年数

<OutputChallenge
  title="grow_two_years"
  target={`121.0`}
  starter={`principal = 100
rate = 0.10
years = 2
print(round(principal * (1 + rate), 2))
`}
/>
</Exercise>

<Exercise title="grow_five_years">

$$Money = \mathrm{round}\left(Principal \times (1 + Rate)^{Years},\ 2\right)$$

保留 2 位小数 (round to 2 decimals)

<OutputChallenge
  title="grow_five_years"
  target={`255.26`}
  starter={`principal = 200
rate = 0.05
years = 5
money = principal * (1 + rate) ** years
print(money)
`}
/>
</Exercise>

</ExerciseSet>

## Physics

<ExerciseSet>

<Exercise title="final_velocity">

$$v = v_0 + a t$$

`v0` 初速度 + `a` 加速度 × `t` 时间

<OutputChallenge
  title="final_velocity"
  target={`32`}
  starter={`v0 = 2
a = 3
t = 10
print(v0 + a)
`}
/>
</Exercise>

<Exercise title="final_velocity_2">

$$v = v_0 + a t$$

同上公式 (same formula), new numbers

<OutputChallenge
  title="final_velocity_2"
  target={`13`}
  starter={`v0 = 5
a = 2
t = 4
print(v0 * a * t)
`}
/>
</Exercise>

<Exercise title="distance">

$$d = v_0 t + \frac{1}{2} a t^2$$

`d` 位移 = `v0` 初速度 × `t` 时间 + 1/2 × `a` 加速度 × `t`²

<OutputChallenge
  title="distance"
  target={`20.0`}
  starter={`v0 = 0
a = 10
t = 2
print(v0 * t + a * t ** 2)
`}
/>
</Exercise>

<Exercise title="distance_2">

$$d = v_0 t + \frac{1}{2} a t^2$$

同上公式 (same formula), new numbers

<OutputChallenge
  title="distance_2"
  target={`27.0`}
  starter={`v0 = 3
a = 4
t = 3
print(v0 * t ** 2 + 0.5 * a * t)
`}
/>
</Exercise>

</ExerciseSet>

## Charts

<ExerciseSet>

<Exercise title="store_profit">

$$Profit = Revenue - Cost$$ (per quarter)

`revenue` 收入 − `cost` 成本

<ChartChallenge
  title="store_profit"
  kind="bar"
  functionName="store_profit"
  hint="a=(Q1, 150); b=(Q2, 250); c=(Q3, 100)"
  categories={["Q1", "Q2", "Q3"]}
  targetValues={[150, 250, 100]}
  ylabel="Profit ($)"
  starter={`def store_profit():
    revenue = [400, 550, 300]
    cost = [250, 300, 200]
    return [r + c for r, c in zip(revenue, cost)]
`}
/>
</Exercise>

<Exercise title="cups_revenue">

$$Revenue = Price \times Quantity$$

`price` 单价 × `quantity` 数量

<ChartChallenge
  title="cups_revenue"
  kind="bar"
  functionName="cups_revenue"
  hint="a=(Coffee, 30); b=(Tea, 30); c=(Juice, 20)"
  categories={["Coffee", "Tea", "Juice"]}
  targetValues={[30, 30, 20]}
  ylabel="Revenue ($)"
  starter={`def cups_revenue():
    prices = [3, 2, 4]
    quantities = [10, 15, 5]
    return prices
`}
/>
</Exercise>

<Exercise title="budget_split">

$$Amount = Share \times Budget$$

`share` 占比 × `budget` 预算

<ChartChallenge
  title="budget_split"
  kind="pie"
  functionName="budget_split"
  hint="a=(Rent, 500); b=(Food, 300); c=(Fun, 200)"
  categories={["Rent", "Food", "Fun"]}
  targetValues={[500, 300, 200]}
  starter={`def budget_split():
    budget = 1000
    shares = [0.5, 0.3, 0.2]
    return shares
`}
/>
</Exercise>

</ExerciseSet>
