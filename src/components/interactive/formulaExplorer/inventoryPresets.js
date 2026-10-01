import {clamp, fmt, normalCdf, normalPdf} from './probMath';

function sampleCurve(min, max, compute, count = 100, highlightX = null) {
  const step = (max - min) / count;
  return Array.from({length: count + 1}, (_, index) => {
    const x = min + step * index;
    return {
      x,
      y: compute(x),
      highlight: highlightX != null && Math.abs(x - highlightX) <= step / 2,
    };
  });
}

function basicEoq(demand, orderCost, holdingCost) {
  return Math.sqrt((2 * orderCost * demand) / holdingCost);
}

function normalQuantile(probability) {
  const target = clamp(probability, 0.5, 0.999);
  let low = -8;
  let high = 8;
  for (let iteration = 0; iteration < 64; iteration += 1) {
    const middle = (low + high) / 2;
    if (normalCdf(0, 1, middle) < target) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return (low + high) / 2;
}

function logGamma(z) {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.50734327868691,
    -0.1385710952657201,
    9.984369578019572e-6,
    1.505632735149312e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  const shifted = z - 1;
  let sum = 0.9999999999998099;
  for (let index = 0; index < coefficients.length; index += 1) {
    sum += coefficients[index] / (shifted + index + 1);
  }
  const t = shifted + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(sum);
}

function gammaPdf(shape, scale, x) {
  if (x <= 0 || shape <= 0 || scale <= 0) return 0;
  return Math.exp((shape - 1) * Math.log(x) - x / scale - logGamma(shape) - shape * Math.log(scale));
}

function powerOfTwoIntervals(idealDays, baseDays) {
  const idealK = Math.floor(Math.log2(idealDays / baseDays));
  const firstK = Math.max(0, idealK - 3);
  const lastK = Math.min(10, Math.max(firstK + 6, idealK + 3));
  const exponents = new Set([0]);
  for (let k = firstK; k <= lastK; k += 1) {
    exponents.add(k);
  }
  return [...exponents].sort((a, b) => a - b).map((k) => {
    const period = baseDays * 2 ** k;
    return {
      k,
      period,
      ratio: (period / idealDays + idealDays / period) / 2,
    };
  });
}

export const INVENTORY_PRESETS = {
  inventoryEoqCosts: {
    id: 'inventoryEoqCosts',
    title: 'EOQ cost balance',
    subtitle: 'Change demand and costs - the total-cost curve marks the economic order quantity',
    formula: '$C(Q)=h\\dfrac{Q}{2}+K\\dfrac{D}{Q}\\qquad Q^*=\\sqrt{\\dfrac{2KD}{h}}$',
    params: [
      {
        key: 'demand',
        label: 'D (units/year)',
        meaning: 'Expected annual demand for the item.',
        min: 100,
        max: 5000,
        step: 100,
        default: 1000,
      },
      {
        key: 'orderCost',
        label: 'K (cost/order)',
        meaning: 'Fixed cost to place and receive one order.',
        min: 10,
        max: 200,
        step: 5,
        default: 50,
      },
      {
        key: 'holdingCost',
        label: 'h (cost/unit-year)',
        meaning: 'Annual variable holding cost for one unit.',
        min: 0.5,
        max: 15,
        step: 0.1,
        default: 3.5,
      },
    ],
    example(v) {
      const qStar = basicEoq(v.demand, v.orderCost, v.holdingCost);
      return `At D=${fmt(v.demand, 0)}, K=${fmt(v.orderCost, 0)}, and h=${fmt(v.holdingCost, 2)}, the cost-minimizing batch is about ${fmt(qStar, 1)} units.`;
    },
    compute(v) {
      const qStar = basicEoq(v.demand, v.orderCost, v.holdingCost);
      const minQ = Math.max(1, qStar * 0.15);
      const maxQ = Math.max(minQ + 1, qStar * 2.5);
      const holdingAtOptimum = (v.holdingCost * qStar) / 2;
      const orderingAtOptimum = (v.orderCost * v.demand) / qStar;
      const minimumCost = holdingAtOptimum + orderingAtOptimum;
      return {
        chartType: 'line',
        yLabel: 'order quantity Q (units)',
        series: sampleCurve(
          minQ,
          maxQ,
          (q) => (v.holdingCost * q) / 2 + (v.orderCost * v.demand) / q,
          100,
          qStar,
        ),
        refLineX: qStar,
        refLineY: minimumCost,
        stats: [
          {label: 'EOQ Q*', value: `${fmt(qStar, 1)} units`},
          {label: 'holding at Q*', value: fmt(holdingAtOptimum, 2)},
          {label: 'ordering at Q*', value: fmt(orderingAtOptimum, 2)},
          {label: 'minimum relevant cost', value: fmt(minimumCost, 2)},
        ],
        note: 'The curve includes variable holding and fixed order costs; constant per-unit purchase spend is excluded.',
      };
    },
  },

  inventoryEoqSensitivity: {
    id: 'inventoryEoqSensitivity',
    title: 'EOQ cost sensitivity',
    subtitle: 'Move Q away from EOQ and compare the resulting cost with the minimum',
    formula: '$\\dfrac{C(Q)}{C(Q^*)}=\\dfrac{1}{2}\\left(\\dfrac{Q}{Q^*}+\\dfrac{Q^*}{Q}\\right)$',
    params: [
      {
        key: 'multiple',
        label: 'Q / Q* (batch-size multiple)',
        meaning: '1 is the EOQ; values below or above 1 represent smaller or larger batches.',
        min: 0.25,
        max: 3,
        step: 0.01,
        default: 1.18,
      },
    ],
    example(v) {
      const ratio = (v.multiple + 1 / v.multiple) / 2;
      return `A batch ${fmt(v.multiple, 2)} times the EOQ has modeled relevant cost ${fmt(ratio, 3)} times the minimum.`;
    },
    compute(v) {
      const relativeCost = (multiple) => (multiple + 1 / multiple) / 2;
      const currentCost = relativeCost(v.multiple);
      return {
        chartType: 'line',
        yLabel: 'batch size Q / Q*',
        series: sampleCurve(0.25, 3, relativeCost, 110, v.multiple),
        refLineX: 1,
        refLineY: 1,
        stats: [
          {label: 'Q / Q*', value: fmt(v.multiple, 2)},
          {label: 'cost / minimum', value: fmt(currentCost, 3)},
          {label: 'cost premium', value: `${fmt((currentCost - 1) * 100, 2)}%`},
        ],
        note: 'The curve is symmetric: choosing half the EOQ or twice the EOQ has the same modeled relevant cost.',
      };
    },
  },

  inventoryProductionBatch: {
    id: 'inventoryProductionBatch',
    title: 'Production-batch EOQ',
    subtitle: 'Limited production rate reduces cycle stock compared with an instant delivery',
    formula: '$Q^*_{prod}=\\sqrt{\\dfrac{2KD}{h(1-D/P)}}\\qquad P>D$',
    params: [
      {
        key: 'demand',
        label: 'D (units/year)',
        meaning: 'Annual demand rate.',
        min: 100,
        max: 5000,
        step: 100,
        default: 1000,
      },
      {
        key: 'orderCost',
        label: 'K (setup/order)',
        meaning: 'Fixed cost of starting and receiving one production batch.',
        min: 10,
        max: 200,
        step: 5,
        default: 50,
      },
      {
        key: 'holdingCost',
        label: 'h (cost/unit-year)',
        meaning: 'Annual variable holding cost for one unit.',
        min: 0.5,
        max: 15,
        step: 0.1,
        default: 3.5,
      },
      {
        key: 'capacityRatio',
        label: 'P / D (production capacity ratio)',
        meaning: 'Production rate divided by demand rate; must be greater than 1.',
        min: 1.1,
        max: 8,
        step: 0.1,
        default: 3,
      },
    ],
    example(v) {
      const factor = 1 - 1 / v.capacityRatio;
      const qStar = Math.sqrt((2 * v.orderCost * v.demand) / (v.holdingCost * factor));
      return `With production capacity ${fmt(v.capacityRatio, 1)} times demand, the production-batch optimum is about ${fmt(qStar, 1)} units.`;
    },
    compute(v) {
      const factor = 1 - 1 / v.capacityRatio;
      const qStar = Math.sqrt((2 * v.orderCost * v.demand) / (v.holdingCost * factor));
      const instantEoq = basicEoq(v.demand, v.orderCost, v.holdingCost);
      const minQ = Math.max(1, qStar * 0.15);
      const maxQ = Math.max(minQ + 1, qStar * 2.5);
      const costAt = (q) =>
        (v.orderCost * v.demand) / q + (v.holdingCost * q * factor) / 2;
      return {
        chartType: 'line',
        yLabel: 'order quantity Q (units)',
        series: sampleCurve(minQ, maxQ, costAt, 100, qStar),
        refLineX: qStar,
        refLineY: costAt(qStar),
        stats: [
          {label: 'production-batch Q*', value: `${fmt(qStar, 1)} units`},
          {label: 'instant-delivery EOQ', value: `${fmt(instantEoq, 1)} units`},
          {label: 'maximum stock fraction', value: fmt(factor, 3)},
          {label: 'maximum cycle stock', value: `${fmt(qStar * factor, 1)} units`},
        ],
        note: 'The production rate is P = (P/D) times D; this model requires P > D.',
      };
    },
  },

  inventoryBackorders: {
    id: 'inventoryBackorders',
    title: 'EOQ with planned backorders',
    subtitle: 'Increase the shortage penalty — the optimal planned backlog shrinks',
    formula: '$Q^*=\\sqrt{\\dfrac{2KD(h+b)}{hb}}\\qquad B^*=Q^*\\dfrac{h}{h+b}$',
    params: [
      {
        key: 'demand',
        label: 'D (units/year)',
        meaning: 'Annual demand rate.',
        min: 100,
        max: 5000,
        step: 100,
        default: 1000,
      },
      {
        key: 'orderCost',
        label: 'K (cost/order)',
        meaning: 'Fixed cost to place and receive one order.',
        min: 10,
        max: 200,
        step: 5,
        default: 50,
      },
      {
        key: 'holdingCost',
        label: 'h (cost/unit-year)',
        meaning: 'Annual cost of holding one unit in stock.',
        min: 0.5,
        max: 15,
        step: 0.1,
        default: 3.5,
      },
      {
        key: 'backorderCost',
        label: 'b (penalty/unit-year)',
        meaning: 'Annual penalty for keeping one unit backordered.',
        min: 0.25,
        max: 40,
        step: 0.25,
        default: 3.5,
      },
    ],
    example(v) {
      const qStar = Math.sqrt(
        (2 * v.orderCost * v.demand * (v.holdingCost + v.backorderCost)) /
          (v.holdingCost * v.backorderCost),
      );
      const backlog = (qStar * v.holdingCost) / (v.holdingCost + v.backorderCost);
      return `At a shortage penalty of ${fmt(v.backorderCost, 2)} per unit-year, the model permits a peak backlog of about ${fmt(backlog, 1)} units in a batch of ${fmt(qStar, 1)}.`;
    },
    compute(v) {
      const qStarAt = (penalty) =>
        Math.sqrt(
          (2 * v.orderCost * v.demand * (v.holdingCost + penalty)) /
            (v.holdingCost * penalty),
        );
      const backlogAt = (penalty) =>
        (qStarAt(penalty) * v.holdingCost) / (v.holdingCost + penalty);
      const qStar = qStarAt(v.backorderCost);
      const backlog = backlogAt(v.backorderCost);
      const classicEoq = basicEoq(v.demand, v.orderCost, v.holdingCost);
      const minCost = Math.sqrt(
        (2 * v.orderCost * v.demand * v.holdingCost * v.backorderCost) /
          (v.holdingCost + v.backorderCost),
      );
      return {
        chartType: 'line',
        yLabel: 'penalty b (cost/unit-year)',
        series: sampleCurve(0.25, 40, backlogAt, 159, v.backorderCost),
        refLineX: v.backorderCost,
        stats: [
          {label: 'optimal batch Q*', value: `${fmt(qStar, 1)} units`},
          {label: 'maximum backlog B*', value: `${fmt(backlog, 1)} units`},
          {label: 'no-backorder EOQ', value: `${fmt(classicEoq, 1)} units`},
          {label: 'minimum relevant cost', value: fmt(minCost, 2)},
        ],
        note: 'Curve shows B* as the annual shortage penalty changes. A high penalty drives the planned backlog toward zero.',
      };
    },
  },

  inventoryQuantityDiscount: {
    id: 'inventoryQuantityDiscount',
    title: 'All-units quantity discount',
    subtitle: 'See how a price break changes the full annual cost curve and best feasible batch',
    formula: '$C(Q)=K\\dfrac{D}{Q}+r c(Q)\\dfrac{Q}{2}+c(Q)D$',
    params: [
      {
        key: 'demand',
        label: 'D (units/year)',
        meaning: 'Annual demand for the item.',
        min: 100,
        max: 5000,
        step: 100,
        default: 1000,
      },
      {
        key: 'orderCost',
        label: 'K (cost/order)',
        meaning: 'Fixed order and receiving cost.',
        min: 10,
        max: 200,
        step: 5,
        default: 50,
      },
      {
        key: 'unitPrice',
        label: 'c (regular unit price)',
        meaning: 'Unit price below the discount threshold.',
        min: 5,
        max: 100,
        step: 1,
        default: 10,
      },
      {
        key: 'discountFactor',
        label: 'discounted price / regular price',
        meaning: 'For example, 0.9 means a 10% all-units price reduction at the threshold.',
        min: 0.7,
        max: 0.99,
        step: 0.01,
        default: 0.9,
      },
      {
        key: 'threshold',
        label: 'Qd (discount threshold)',
        meaning: 'Order this quantity or more to receive the discounted unit price on the whole order.',
        min: 25,
        max: 1000,
        step: 25,
        default: 200,
      },
      {
        key: 'holdingRate',
        label: 'r (annual holding rate)',
        meaning: 'Holding cost per unit is modeled as r times its unit price.',
        min: 0.05,
        max: 0.4,
        step: 0.01,
        default: 0.15,
      },
    ],
    example(v) {
      const discountedPrice = v.unitPrice * v.discountFactor;
      return `At Qd=${fmt(v.threshold, 0)}, unit price falls from ${fmt(v.unitPrice, 2)} to ${fmt(discountedPrice, 2)} for every unit in the order.`;
    },
    compute(v) {
      const discountedPrice = v.unitPrice * v.discountFactor;
      const regularHolding = v.holdingRate * v.unitPrice;
      const discountedHolding = v.holdingRate * discountedPrice;
      const regularEoq = basicEoq(v.demand, v.orderCost, regularHolding);
      const discountedEoq = basicEoq(v.demand, v.orderCost, discountedHolding);
      const costAt = (q) => {
        const price = q >= v.threshold ? discountedPrice : v.unitPrice;
        const holding = v.holdingRate * price;
        return (v.orderCost * v.demand) / q + (holding * q) / 2 + price * v.demand;
      };
      const candidates = [
        Math.max(1, Math.min(regularEoq, v.threshold - 1e-6)),
        Math.max(v.threshold, discountedEoq),
      ];
      const bestQ = candidates.reduce((best, q) => (costAt(q) < costAt(best) ? q : best));
      const maxQ = Math.max(v.threshold * 2.2, bestQ * 1.25);
      const series = sampleCurve(1, maxQ, costAt, 120, bestQ);
      series.push(
        {x: v.threshold - 1e-6, y: costAt(v.threshold - 1e-6)},
        {x: v.threshold, y: costAt(v.threshold)},
      );
      series.sort((a, b) => a.x - b.x);
      return {
        chartType: 'line',
        yLabel: 'order quantity Q (units)',
        series,
        refLineX: bestQ,
        refLineY: costAt(bestQ),
        stats: [
          {label: 'best candidate Q', value: `${fmt(bestQ, 1)} units`},
          {label: 'unit price at Q', value: fmt(bestQ >= v.threshold ? discountedPrice : v.unitPrice, 2)},
          {label: 'annual total cost', value: fmt(costAt(bestQ), 2)},
          {label: 'discount threshold', value: `${fmt(v.threshold, 0)} units`},
        ],
        note: 'The lower price applies to every unit only when Q reaches the threshold. The chart includes ordering, holding, and purchase costs.',
      };
    },
  },

  inventoryLeadTime: {
    id: 'inventoryLeadTime',
    title: 'Lead-time demand and reorder point',
    subtitle: 'Slide demand or supplier lead time — both reorder point and pipeline stock scale with dL',
    formula: '$s=dL\\qquad I_{transit}=dL$',
    params: [
      {
        key: 'demandRate',
        label: 'd (units/week)',
        meaning: 'Stable demand rate for the item.',
        min: 0.5,
        max: 30,
        step: 0.5,
        default: 3,
      },
      {
        key: 'leadTime',
        label: 'L (weeks)',
        meaning: 'Fixed supplier lead time.',
        min: 0,
        max: 12,
        step: 0.25,
        default: 2,
      },
    ],
    example(v) {
      const units = v.demandRate * v.leadTime;
      return `At ${fmt(v.demandRate, 1)} units per week and ${fmt(v.leadTime, 2)} weeks of lead time, the baseline reorder point and average pipeline stock are both ${fmt(units, 1)} units.`;
    },
    compute(v) {
      const cover = v.demandRate * v.leadTime;
      return {
        chartType: 'line',
        yLabel: 'lead time L (weeks)',
        series: sampleCurve(0, 12, (leadTime) => v.demandRate * leadTime, 96, v.leadTime),
        refLineX: v.leadTime,
        refLineY: cover,
        stats: [
          {label: 'reorder point s', value: `${fmt(cover, 1)} units`},
          {label: 'average pipeline', value: `${fmt(cover, 1)} units`},
          {label: 'demand rate', value: `${fmt(v.demandRate, 1)} units/week`},
        ],
        note: 'Deterministic baseline with no safety stock; use matching time units for d and L.',
      };
    },
  },

  inventoryPeriodicReview: {
    id: 'inventoryPeriodicReview',
    title: 'Periodic-review protection window',
    subtitle: 'The order-up-to target covers lead time plus the wait until the next review',
    formula: '$S=d(L+R)\\qquad C_s=\\dfrac{dR}{2}\\qquad I_{transit}=dL$',
    params: [
      {
        key: 'demandRate',
        label: 'd (units/week)',
        meaning: 'Stable demand rate.',
        min: 0.5,
        max: 30,
        step: 0.5,
        default: 3,
      },
      {
        key: 'leadTime',
        label: 'L (weeks)',
        meaning: 'Fixed supplier lead time.',
        min: 0,
        max: 16,
        step: 0.25,
        default: 2,
      },
      {
        key: 'reviewPeriod',
        label: 'R (weeks)',
        meaning: 'Time between scheduled reviews.',
        min: 0.5,
        max: 16,
        step: 0.25,
        default: 4,
      },
    ],
    example(v) {
      const target = v.demandRate * (v.leadTime + v.reviewPeriod);
      return `The protection window is ${fmt(v.leadTime + v.reviewPeriod, 2)} weeks, so the baseline order-up-to target is ${fmt(target, 1)} units.`;
    },
    compute(v) {
      const target = v.demandRate * (v.leadTime + v.reviewPeriod);
      const pipeline = v.demandRate * v.leadTime;
      const cycleStock = (v.demandRate * v.reviewPeriod) / 2;
      return {
        chartType: 'line',
        yLabel: 'review interval R (weeks)',
        series: sampleCurve(0, 16, (review) => v.demandRate * (v.leadTime + review), 96, v.reviewPeriod),
        refLineX: v.reviewPeriod,
        refLineY: target,
        stats: [
          {label: 'order-up-to S', value: `${fmt(target, 1)} units`},
          {label: 'pipeline dL', value: `${fmt(pipeline, 1)} units`},
          {label: 'average cycle stock', value: `${fmt(cycleStock, 1)} units`},
          {label: 'average net on-hand', value: `${fmt(cycleStock, 1)} units`},
        ],
        note: 'With the baseline target S=d(L+R), average net on-hand equals cycle stock dR/2; pipeline is separate.',
      };
    },
  },

  inventoryReviewInterval: {
    id: 'inventoryReviewInterval',
    title: 'EOQ as a review interval',
    subtitle: 'The annual cost curve in review-period form; the x-axis uses a 365-day planning year',
    formula: '$C(R)=\\dfrac{K}{R}+h\\dfrac{DR}{2}\\qquad R^*=\\sqrt{\\dfrac{2K}{hD}}$',
    params: [
      {
        key: 'demand',
        label: 'D (units/year)',
        meaning: 'Annual demand forecast.',
        min: 100,
        max: 5000,
        step: 100,
        default: 5000,
      },
      {
        key: 'orderCost',
        label: 'K (cost/order)',
        meaning: 'Fixed cost each time an order is placed.',
        min: 10,
        max: 200,
        step: 5,
        default: 55,
      },
      {
        key: 'holdingCost',
        label: 'h (cost/unit-year)',
        meaning: 'Annual variable holding cost per unit.',
        min: 0.5,
        max: 15,
        step: 0.1,
        default: 3.5,
      },
    ],
    example(v) {
      const years = Math.sqrt((2 * v.orderCost) / (v.holdingCost * v.demand));
      return `The continuous optimum is a review every ${fmt(years * 365, 1)} days, corresponding to batches of about ${fmt(v.demand * years, 1)} units.`;
    },
    compute(v) {
      const yearsAtOptimum = Math.sqrt((2 * v.orderCost) / (v.holdingCost * v.demand));
      const daysAtOptimum = yearsAtOptimum * 365;
      const qStar = v.demand * yearsAtOptimum;
      const minDays = Math.max(1, daysAtOptimum * 0.15);
      const maxDays = Math.max(minDays + 1, daysAtOptimum * 2.5);
      const annualCost = (days) => {
        const years = days / 365;
        return v.orderCost / years + (v.holdingCost * v.demand * years) / 2;
      };
      return {
        chartType: 'line',
        yLabel: 'review interval R (days)',
        series: sampleCurve(minDays, maxDays, annualCost, 100, daysAtOptimum),
        refLineX: daysAtOptimum,
        refLineY: annualCost(daysAtOptimum),
        stats: [
          {label: 'optimal R*', value: `${fmt(daysAtOptimum, 1)} days`},
          {label: 'EOQ batch Q*', value: `${fmt(qStar, 1)} units`},
          {label: 'ordering cost at R*', value: fmt(v.orderCost / yearsAtOptimum, 2)},
          {label: 'cycle-stock cost at R*', value: fmt((v.holdingCost * v.demand * yearsAtOptimum) / 2, 2)},
        ],
        note: 'D and h are annual. A fixed lead time adds a constant pipeline-stock term and does not change this baseline optimum.',
      };
    },
  },

  inventoryPowerOfTwo: {
    id: 'inventoryPowerOfTwo',
    title: 'Power-of-two review schedules',
    subtitle: 'Compare practical review intervals with the continuous optimum',
    formula: '$R_k=2^kR_B\\qquad \\dfrac{C(R)}{C(R^*)}=\\dfrac{1}{2}\\left(\\dfrac{R}{R^*}+\\dfrac{R^*}{R}\\right)$',
    params: [
      {
        key: 'idealDays',
        label: 'R* (ideal days)',
        meaning: 'Continuous-cost optimum before calendar rounding.',
        min: 1,
        max: 180,
        step: 0.1,
        default: 28.9,
      },
      {
        key: 'baseDays',
        label: 'R_B (base days)',
        meaning: 'Smallest available schedule interval; candidates are R_B times powers of two.',
        min: 0.5,
        max: 14,
        step: 0.5,
        default: 1,
      },
    ],
    example(v) {
      const options = powerOfTwoIntervals(v.idealDays, v.baseDays);
      const selected = options.reduce((best, option) => (option.ratio < best.ratio ? option : best));
      return `For an ideal interval of ${fmt(v.idealDays, 1)} days and a ${fmt(v.baseDays, 1)}-day base, choose ${fmt(selected.period, 1)} days (k=${selected.k}), with a modeled cost ratio of ${fmt(selected.ratio, 4)}.`;
    },
    compute(v) {
      const options = powerOfTwoIntervals(v.idealDays, v.baseDays);
      const selected = options.reduce((best, option) => (option.ratio < best.ratio ? option : best));
      return {
        chartType: 'bar',
        yLabel: 'candidate review interval (days)',
        series: options.map((option) => ({
          x: option.period,
          y: option.ratio,
          label: `${fmt(option.period, 1)}d`,
          highlight: option.k === selected.k,
        })),
        refLineY: 1,
        stats: [
          {label: 'chosen interval', value: `${fmt(selected.period, 1)} days`},
          {label: 'power k', value: String(selected.k)},
          {label: 'cost / minimum', value: fmt(selected.ratio, 4)},
          {label: 'cost premium', value: `${fmt((selected.ratio - 1) * 100, 2)}%`},
        ],
        note: 'Bars are labeled in days; bar height is cost divided by the minimum. When feasible neighboring periods bracket R*, the worst modeled premium is about 6.1%.',
      };
    },
  },

  inventorySafetyStock: {
    id: 'inventorySafetyStock',
    title: 'Cycle service and safety stock',
    subtitle: 'Set a Normal-demand cycle target and see the buffer above expected demand',
    formula: '$z_\\alpha=\\Phi^{-1}(\\alpha)\\qquad SS=z_\\alpha\\sigma_d\\qquad \\iota=\\mu_d+SS$',
    params: [
      {
        key: 'mean',
        label: 'mu_d (mean demand/period)',
        meaning: 'Expected demand in one period.',
        min: 10,
        max: 250,
        step: 5,
        default: 100,
      },
      {
        key: 'deviation',
        label: 'sigma_d (demand SD/period)',
        meaning: 'Standard deviation of demand in the same period bucket.',
        min: 1,
        max: 80,
        step: 1,
        default: 25,
      },
      {
        key: 'service',
        label: 'alpha (cycle service target)',
        meaning: 'Probability that demand over the protection period does not exceed the threshold.',
        min: 0.5,
        max: 0.999,
        step: 0.001,
        default: 0.95,
      },
    ],
    example(v) {
      const z = normalQuantile(v.service);
      const safetyStock = z * v.deviation;
      return `For mean ${fmt(v.mean, 0)} and standard deviation ${fmt(v.deviation, 0)}, alpha=${fmt(v.service, 3)} gives z=${fmt(z, 3)} and safety stock about ${fmt(safetyStock, 1)} units.`;
    },
    compute(v) {
      const z = normalQuantile(v.service);
      const safetyStock = z * v.deviation;
      const threshold = v.mean + safetyStock;
      const minDemand = v.mean - 4 * v.deviation;
      const maxDemand = v.mean + 4 * v.deviation;
      return {
        chartType: 'line',
        yLabel: 'demand in one period (units)',
        series: sampleCurve(
          minDemand,
          maxDemand,
          (demand) => normalPdf(v.mean, v.deviation, demand),
          120,
          threshold,
        ),
        shadeToX: threshold,
        refLineX: threshold,
        stats: [
          {label: 'cycle target alpha', value: fmt(v.service, 3)},
          {label: 'service factor z', value: fmt(z, 3)},
          {label: 'safety stock', value: `${fmt(safetyStock, 1)} units`},
          {label: 'required threshold', value: `${fmt(threshold, 1)} units`},
        ],
        note: 'Shaded area is the approximate probability of demand at or below the threshold. Continuous Normal-demand model.',
      };
    },
  },

  inventoryAggregatedSafetyStock: {
    id: 'inventoryAggregatedSafetyStock',
    title: 'Safety stock over multiple periods',
    subtitle: 'Aggregate independent demand buckets across the protection window',
    formula: '$D_\\tau\\sim\\mathcal{N}(\\tau\\mu_d,\\tau\\sigma_d^2)\\qquad SS=z_\\alpha\\sigma_d\\sqrt{\\tau}$',
    params: [
      {
        key: 'periods',
        label: 'tau (periods in protection window)',
        meaning: 'For a fixed lead time this can be L; for periodic review use L + R.',
        min: 1,
        max: 16,
        step: 1,
        default: 4,
      },
      {
        key: 'mean',
        label: 'mu_d (mean/period)',
        meaning: 'Expected demand in each equal-length period.',
        min: 1,
        max: 100,
        step: 1,
        default: 20,
      },
      {
        key: 'deviation',
        label: 'sigma_d (SD/period)',
        meaning: 'Standard deviation in each period; periods are assumed independent.',
        min: 0.5,
        max: 30,
        step: 0.5,
        default: 25,
      },
      {
        key: 'service',
        label: 'alpha (cycle service target)',
        meaning: 'One-sided probability target for the protection-period demand.',
        min: 0.5,
        max: 0.999,
        step: 0.001,
        default: 0.95,
      },
    ],
    example(v) {
      const z = normalQuantile(v.service);
      const aggregateDeviation = v.deviation * Math.sqrt(v.periods);
      return `${fmt(v.periods, 0)} independent periods give aggregate SD ${fmt(aggregateDeviation, 1)}; at alpha=${fmt(v.service, 3)}, safety stock is ${fmt(z * aggregateDeviation, 1)} units.`;
    },
    compute(v) {
      const z = normalQuantile(v.service);
      const aggregateMean = v.mean * v.periods;
      const aggregateDeviation = v.deviation * Math.sqrt(v.periods);
      const safetyStock = z * aggregateDeviation;
      const threshold = aggregateMean + safetyStock;
      const minDemand = aggregateMean - 4 * aggregateDeviation;
      const maxDemand = aggregateMean + 4 * aggregateDeviation;
      return {
        chartType: 'line',
        yLabel: 'demand over protection window (units)',
        series: sampleCurve(
          minDemand,
          maxDemand,
          (demand) => normalPdf(aggregateMean, aggregateDeviation, demand),
          120,
          threshold,
        ),
        shadeToX: threshold,
        refLineX: threshold,
        stats: [
          {label: 'expected demand', value: `${fmt(aggregateMean, 1)} units`},
          {label: 'aggregate SD', value: `${fmt(aggregateDeviation, 1)} units`},
          {label: 'safety stock', value: `${fmt(safetyStock, 1)} units`},
          {label: 'inventory threshold', value: `${fmt(threshold, 1)} units`},
        ],
        note: 'Uses sigma_tau = sigma_d sqrt(tau), valid here for independent equal-variance periods.',
      };
    },
  },

  inventoryCorrelatedDemand: {
    id: 'inventoryCorrelatedDemand',
    title: 'Correlation and pooled demand',
    subtitle: 'Slide correlation to see its effect on the combined standard deviation',
    formula: '$\\sigma_{X+Y}=\\sqrt{\\sigma_X^2+\\sigma_Y^2+2\\rho\\sigma_X\\sigma_Y}$',
    params: [
      {
        key: 'sigmaX',
        label: 'sigma_X (units)',
        meaning: 'Standard deviation of the first product or market.',
        min: 1,
        max: 100,
        step: 1,
        default: 25,
      },
      {
        key: 'sigmaY',
        label: 'sigma_Y (units)',
        meaning: 'Standard deviation of the second product or market.',
        min: 1,
        max: 150,
        step: 1,
        default: 75,
      },
      {
        key: 'correlation',
        label: 'rho (correlation)',
        meaning: 'How demand deviations co-move, from -1 to 1.',
        min: -1,
        max: 1,
        step: 0.05,
        default: 0.5,
      },
    ],
    example(v) {
      const variance = v.sigmaX ** 2 + v.sigmaY ** 2 + 2 * v.correlation * v.sigmaX * v.sigmaY;
      return `With SDs ${fmt(v.sigmaX, 0)} and ${fmt(v.sigmaY, 0)} and rho=${fmt(v.correlation, 2)}, pooled demand has SD ${fmt(Math.sqrt(Math.max(0, variance)), 2)}.`;
    },
    compute(v) {
      const combinedDeviation = (correlation) =>
        Math.sqrt(
          Math.max(
            0,
            v.sigmaX ** 2 + v.sigmaY ** 2 + 2 * correlation * v.sigmaX * v.sigmaY,
          ),
        );
      const pooled = combinedDeviation(v.correlation);
      const independent = Math.sqrt(v.sigmaX ** 2 + v.sigmaY ** 2);
      return {
        chartType: 'line',
        yLabel: 'correlation rho',
        series: sampleCurve(-1, 1, combinedDeviation, 80, v.correlation),
        refLineX: v.correlation,
        stats: [
          {label: 'rho', value: fmt(v.correlation, 2)},
          {label: 'pooled demand SD', value: `${fmt(pooled, 2)} units`},
          {label: 'SD if uncorrelated', value: `${fmt(independent, 2)} units`},
        ],
        note: 'Positive correlation increases pooled variation; negative correlation reduces it. For two series, the variance identity does not require Normality.',
      };
    },
  },

  inventoryPolicySafetyStock: {
    id: 'inventoryPolicySafetyStock',
    title: 'Safety stock by policy',
    subtitle: 'Compare risk periods and inventory targets for continuous and periodic review',
    formula: '$SS_{s,Q}=z_\\alpha\\sigma_d\\sqrt{L},\\quad s=\\mu_dL+SS_{s,Q}\\qquad SS_{R,S}=z_\\alpha\\sigma_d\\sqrt{L+R},\\quad S=\\mu_d(L+R)+SS_{R,S}$',
    params: [
      {
        key: 'mean',
        label: 'mu_d (mean demand/day)',
        meaning: 'Mean demand in the chosen daily bucket.',
        min: 5,
        max: 100,
        step: 5,
        default: 40,
      },
      {
        key: 'deviation',
        label: 'sigma_d (SD/day)',
        meaning: 'Standard deviation in the same daily bucket.',
        min: 0.5,
        max: 40,
        step: 0.1,
        default: 13.6,
      },
      {
        key: 'leadTime',
        label: 'L (days)',
        meaning: 'Fixed supplier lead time.',
        min: 1,
        max: 12,
        step: 1,
        default: 4,
      },
      {
        key: 'reviewPeriod',
        label: 'R (days)',
        meaning: 'Time between scheduled reviews for the periodic policy.',
        min: 1,
        max: 12,
        step: 1,
        default: 1,
      },
      {
        key: 'service',
        label: 'alpha (cycle service target)',
        meaning: 'One-sided service target applied to each policy risk period.',
        min: 0.5,
        max: 0.999,
        step: 0.001,
        default: 0.95,
      },
    ],
    example(v) {
      const z = normalQuantile(v.service);
      const ssContinuous = z * v.deviation * Math.sqrt(v.leadTime);
      const ssPeriodic = z * v.deviation * Math.sqrt(v.leadTime + v.reviewPeriod);
      const reorderPoint = v.mean * v.leadTime + ssContinuous;
      const orderUpTo = v.mean * (v.leadTime + v.reviewPeriod) + ssPeriodic;
      return `At alpha=${fmt(v.service, 3)}, continuous review uses s=${fmt(reorderPoint, 1)}; periodic review uses S=${fmt(orderUpTo, 1)}.`;
    },
    compute(v) {
      const z = normalQuantile(v.service);
      const ssContinuous = z * v.deviation * Math.sqrt(v.leadTime);
      const ssPeriodic = z * v.deviation * Math.sqrt(v.leadTime + v.reviewPeriod);
      const reorderPoint = v.mean * v.leadTime + ssContinuous;
      const orderUpTo = v.mean * (v.leadTime + v.reviewPeriod) + ssPeriodic;
      return {
        chartType: 'line',
        yLabel: 'review period R (days)',
        series: sampleCurve(
          0,
          16,
          (review) => z * v.deviation * Math.sqrt(v.leadTime + review),
          96,
          v.reviewPeriod,
        ),
        refLineX: v.reviewPeriod,
        stats: [
          {label: '(s,Q) safety stock', value: `${fmt(ssContinuous, 1)} units`},
          {label: '(s,Q) reorder point', value: `${fmt(reorderPoint, 1)} units`},
          {label: '(R,S) safety stock', value: `${fmt(ssPeriodic, 1)} units`},
          {label: '(R,S) order-up-to S', value: `${fmt(orderUpTo, 1)} units`},
          {label: 'mean pipeline stock', value: `${fmt(v.mean * v.leadTime, 1)} units`},
        ],
        note: 'Same mean, variation, lead time, and service target; periodic review has the longer risk period L + R.',
      };
    },
  },

  inventoryStockAnalysis: {
    id: 'inventoryStockAnalysis',
    title: 'Analyze on-hand stock',
    subtitle: 'Compare current on-hand with the safety buffer and routine cycle range',
    formula: '$\\bar I_{on\\text{-}hand}=SS_{R,S}+\\dfrac{\\mu_dR}{2}\\qquad I_{transit}=\\mu_dL$',
    params: [
      {
        key: 'mean',
        label: 'mu_d (mean demand/day)',
        meaning: 'Mean demand in the chosen daily bucket.',
        min: 5,
        max: 100,
        step: 5,
        default: 40,
      },
      {
        key: 'deviation',
        label: 'sigma_d (SD/day)',
        meaning: 'Standard deviation in the same daily bucket.',
        min: 0.5,
        max: 40,
        step: 0.1,
        default: 13.6,
      },
      {
        key: 'leadTime',
        label: 'L (days)',
        meaning: 'Fixed supplier lead time.',
        min: 1,
        max: 12,
        step: 1,
        default: 4,
      },
      {
        key: 'reviewPeriod',
        label: 'R (days)',
        meaning: 'Periodic review interval.',
        min: 1,
        max: 12,
        step: 1,
        default: 1,
      },
      {
        key: 'service',
        label: 'alpha (cycle service target)',
        meaning: 'Target used to calculate periodic-policy safety stock.',
        min: 0.5,
        max: 0.999,
        step: 0.001,
        default: 0.95,
      },
      {
        key: 'onHand',
        label: 'current on-hand (units)',
        meaning: 'Physical stock available at the location now.',
        min: 0,
        max: 300,
        step: 1,
        default: 30,
      },
    ],
    example(v) {
      const safetyStock =
        normalQuantile(v.service) * v.deviation * Math.sqrt(v.leadTime + v.reviewPeriod);
      const maximumCycle = v.mean * v.reviewPeriod;
      const assessment =
        v.onHand <= 0
          ? 'a shortage'
          : v.onHand < safetyStock
            ? `${fmt(safetyStock - v.onHand, 1)} units below the safety reference`
            : v.onHand <= safetyStock + maximumCycle
              ? 'inside the routine cycle band'
              : 'above the routine cycle band';
      return `At the selected policy settings, ${fmt(v.onHand, 0)} on-hand units are ${assessment}.`;
    },
    compute(v) {
      const safetyStock =
        normalQuantile(v.service) * v.deviation * Math.sqrt(v.leadTime + v.reviewPeriod);
      const averageCycle = (v.mean * v.reviewPeriod) / 2;
      const maximumCycle = v.mean * v.reviewPeriod;
      const averageOnHand = safetyStock + averageCycle;
      const cycleUpper = safetyStock + maximumCycle;
      const assessment =
        v.onHand <= 0
          ? 'shortage'
          : v.onHand < safetyStock
            ? `${fmt(safetyStock - v.onHand, 1)} below safety reference`
            : v.onHand <= cycleUpper
              ? 'within routine cycle band'
              : `${fmt(v.onHand - cycleUpper, 1)} above cycle band`;
      const orderUpTo = v.mean * (v.leadTime + v.reviewPeriod) + safetyStock;
      return {
        chartType: 'bar',
        yLabel: 'on-hand quantity (units)',
        series: [
          {x: 0, y: v.onHand, label: 'current', highlight: true},
          {x: 1, y: safetyStock, label: 'safety floor'},
          {x: 2, y: averageOnHand, label: 'expected mean'},
          {x: 3, y: cycleUpper, label: 'cycle upper'},
        ],
        stats: [
          {label: 'safety reference', value: `${fmt(safetyStock, 1)} units`},
          {label: 'average on-hand', value: `${fmt(averageOnHand, 1)} units`},
          {label: 'mean in transit', value: `${fmt(v.mean * v.leadTime, 1)} units`},
          {label: 'order-up-to S', value: `${fmt(orderUpTo, 1)} units`},
          {label: 'current assessment', value: assessment},
        ],
        note: 'Pipeline stock is separate from on-hand. Bands are deterministic reference ranges, not guaranteed limits under random demand.',
      };
    },
  },

  inventoryGammaShape: {
    id: 'inventoryGammaShape',
    title: 'Moment-matched gamma demand',
    subtitle: 'Adjust mean, variation, and a justified floor to see support and right-tail skew change',
    formula: '$k=\\dfrac{(\\mu-d_{min})^2}{\\sigma^2}\\qquad \\theta=\\dfrac{\\sigma^2}{\\mu-d_{min}}\\qquad \\gamma_1=\\dfrac{2}{\\sqrt{k}}$',
    params: [
      {
        key: 'mean',
        label: 'mu (mean demand)',
        meaning: 'Mean in the selected demand time bucket.',
        min: 50,
        max: 300,
        step: 5,
        default: 100,
      },
      {
        key: 'deviation',
        label: 'sigma (standard deviation)',
        meaning: 'Standard deviation in the same time bucket.',
        min: 5,
        max: 100,
        step: 1,
        default: 25,
      },
      {
        key: 'minimum',
        label: 'd_min (demand floor)',
        meaning: 'Externally justified lower baseline; constrained below the mean.',
        min: 0,
        max: 40,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      const excessMean = v.mean - v.minimum;
      const shape = (excessMean * excessMean) / (v.deviation * v.deviation);
      const scale = (v.deviation * v.deviation) / excessMean;
      return `Gamma component: shape k=${fmt(shape, 3)}, scale theta=${fmt(scale, 3)}, skewness=${fmt(2 / Math.sqrt(shape), 3)}.`;
    },
    compute(v) {
      const excessMean = v.mean - v.minimum;
      const shape = (excessMean * excessMean) / (v.deviation * v.deviation);
      const scale = (v.deviation * v.deviation) / excessMean;
      const skewness = 2 / Math.sqrt(shape);
      const xMin = v.minimum + Math.max(0.01, excessMean * 0.001);
      const xMax = v.mean + 4 * v.deviation;
      const normalNegativeProbability = normalCdf(v.mean, v.deviation, 0);
      return {
        chartType: 'line',
        yLabel: 'demand x (units)',
        series: sampleCurve(
          xMin,
          xMax,
          (x) => gammaPdf(shape, scale, x - v.minimum),
          120,
        ),
        stats: [
          {label: 'shape k', value: fmt(shape, 3)},
          {label: 'scale theta', value: fmt(scale, 3)},
          {label: 'gamma skewness', value: fmt(skewness, 3)},
          {label: 'Normal P(demand < 0)', value: fmt(normalNegativeProbability, 4)},
        ],
        note: 'The plotted gamma is a moment match, not a goodness-of-fit verdict. The floor must have an operational justification.',
      };
    },
  },

  inventoryMeioSerialCases: {
    id: 'inventoryMeioSerialCases',
    title: 'Serial GSM: safety-stock allocation cost',
    subtitle: 'Compare four feasible risk-period allocations; the lowest units need not have the lowest holding cost',
    formula: '$SS_i=z\\sigma_d\\sqrt{x_i}\\qquad C_h=\\sum_i h_iSS_i$',
    params: [
      {
        key: 'zSigma',
        label: 'z * sigma_d (units)',
        meaning: 'Service factor times per-period demand standard deviation.',
        min: 5,
        max: 100,
        step: 0.125,
        default: 41.125,
      },
      {
        key: 'holdingUpstream',
        label: 'h1 (upstream holding cost)',
        meaning: 'Per-unit cost at the production-side node.',
        min: 0.5,
        max: 10,
        step: 0.5,
        default: 1,
      },
      {
        key: 'holdingMiddle',
        label: 'h2 (middle holding cost)',
        meaning: 'Per-unit cost at the regional node.',
        min: 0.5,
        max: 10,
        step: 0.5,
        default: 2,
      },
      {
        key: 'holdingDownstream',
        label: 'h3 (downstream holding cost)',
        meaning: 'Per-unit cost at the demand-facing node.',
        min: 0.5,
        max: 10,
        step: 0.5,
        default: 4,
      },
    ],
    example(v) {
      const cases = [
        [4, 3, 3],
        [0, 7, 3],
        [4, 0, 6],
        [0, 0, 10],
      ];
      const holdingCosts = [v.holdingUpstream, v.holdingMiddle, v.holdingDownstream];
      const costs = cases.map((riskPeriods) =>
        riskPeriods.reduce(
          (sum, periods, index) => sum + holdingCosts[index] * v.zSigma * Math.sqrt(periods),
          0,
        ),
      );
      const bestCase = costs.indexOf(Math.min(...costs)) + 1;
      return `At the current costs, allocation case ${bestCase} has the lowest safety-stock holding cost (${fmt(costs[bestCase - 1], 1)} cost units).`;
    },
    compute(v) {
      const allocations = [
        [4, 3, 3],
        [0, 7, 3],
        [4, 0, 6],
        [0, 0, 10],
      ];
      const holdingCosts = [v.holdingUpstream, v.holdingMiddle, v.holdingDownstream];
      const cases = allocations.map((riskPeriods) => {
        const safety = riskPeriods.map((periods) => v.zSigma * Math.sqrt(periods));
        const units = safety.reduce((sum, stock) => sum + stock, 0);
        const cost = safety.reduce((sum, stock, index) => sum + stock * holdingCosts[index], 0);
        return {riskPeriods, safety, units, cost};
      });
      const bestCaseIndex = cases.reduce(
        (best, item, index) => (item.cost < cases[best].cost ? index : best),
        0,
      );
      const best = cases[bestCaseIndex];
      return {
        chartType: 'bar',
        yLabel: 'feasible allocation case',
        series: cases.map((item, index) => ({
          x: index + 1,
          y: item.cost,
          label: `Case ${index + 1}`,
          highlight: index === bestCaseIndex,
        })),
        stats: [
          {label: 'lowest-cost case', value: `Case ${bestCaseIndex + 1}`},
          {label: 'minimum holding cost', value: fmt(best.cost, 1)},
          {label: 'safety-stock units in winner', value: fmt(best.units, 1)},
          {label: 'winner risk periods', value: `[${best.riskPeriods.join(', ')}]`},
        ],
        note: 'Only these four allocations are compared. Cycle stock, transport, capacity, and exception-response costs are excluded.',
      };
    },
  },
};