import { randInt, pickOne } from './rng.js'

export const DIFFICULTIES = {
  easy: { label: 'Easy', blurb: 'add, subtract, small times tables' },
  medium: { label: 'Medium', blurb: 'full times tables, 2-digit sums, division' },
  hard: { label: 'Hard', blurb: 'bigger products, long division, two-step' }
}

const add = (a, b) => ({ text: a + ' + ' + b, answer: a + b })
const sub = (a, b) => ({ text: a + ' − ' + b, answer: a - b })
const mul = (a, b) => ({ text: a + ' × ' + b, answer: a * b })
// Division is built from the product, so the quotient is always whole.
const div = (divisor, quotient) => ({ text: divisor * quotient + ' ÷ ' + divisor, answer: quotient })

const GENERATORS = {
  easy: [
    (rng) => add(randInt(rng, 1, 12), randInt(rng, 1, 12)),
    (rng) => {
      const a = randInt(rng, 5, 20)
      return sub(a, randInt(rng, 1, a))
    },
    (rng) => mul(randInt(rng, 2, 5), randInt(rng, 2, 5)),
    (rng) => div(randInt(rng, 2, 5), randInt(rng, 2, 5))
  ],
  medium: [
    (rng) => mul(randInt(rng, 3, 12), randInt(rng, 3, 12)),
    (rng) => div(randInt(rng, 2, 12), randInt(rng, 2, 12)),
    (rng) => add(randInt(rng, 20, 99), randInt(rng, 11, 60)),
    (rng) => {
      const a = randInt(rng, 30, 99)
      return sub(a, randInt(rng, 11, a - 1))
    }
  ],
  hard: [
    (rng) => mul(randInt(rng, 12, 49), randInt(rng, 3, 9)),
    (rng) => div(randInt(rng, 3, 15), randInt(rng, 6, 25)),
    (rng) => {
      const a = randInt(rng, 3, 12)
      const b = randInt(rng, 3, 12)
      const c = randInt(rng, 2, 30)
      return { text: a + ' × ' + b + ' + ' + c, answer: a * b + c }
    },
    (rng) => {
      const a = randInt(rng, 4, 12)
      const b = randInt(rng, 4, 12)
      const c = randInt(rng, 2, a * b - 1)
      return { text: a + ' × ' + b + ' − ' + c, answer: a * b - c }
    },
    (rng) => {
      const a = randInt(rng, 3, 20)
      const b = randInt(rng, 3, 20)
      const c = randInt(rng, 2, 9)
      return { text: '(' + a + ' + ' + b + ') × ' + c, answer: (a + b) * c }
    },
    (rng) => {
      const a = randInt(rng, 200, 899)
      return sub(a, randInt(rng, 101, a - 1))
    }
  ]
}

// The "= ?" is added by the view, so `text` is just the left-hand side.
export function generateProblem(difficulty, rng = Math.random) {
  const generator = pickOne(rng, GENERATORS[difficulty] || GENERATORS.easy)
  return { ...generator(rng), difficulty }
}
