/** NumPy arrays vs. plain Python lists, and true matrix operations. */

export default {
  title: 'NumPy arrays',
  lead: 'A Python list is a flexible container. A NumPy array is a uniform, fixed-type block built for fast, vectorized math — and for actual matrix algebra.',
  steps: [
    {
      caption: 'Plain Python: `L = [1,2,3]; L+L` concatenates to `[1,2,3,1,2,3]`. NumPy: `a = array([1,2,3]); a+a` adds elementwise to `[2,4,6]`.',
    },
    {
      ask: 'Multiplying two NumPy 2D arrays with `*` (not `dot`) performs…',
      choices: [
        {label: 'elementwise (direct) multiplication, not true matrix multiplication', ok: true},
        {label: 'the standard row-by-column matrix product', ok: false},
        {label: 'a shape error — arrays cannot be multiplied with *', ok: false},
      ],
      caption: 'Use `dot(A, B)` (or `A @ B`) for the real matrix product; `A * B` multiplies element-by-element.',
    },
    {
      ask: 'Every element of a single NumPy array must…',
      choices: [
        {label: 'be the same data type (uniform array)', ok: true},
        {label: 'be a Python list itself', ok: false},
        {label: 'be unique — no repeated values allowed', ok: false},
      ],
      caption: 'Mixed int/float input is upcast to one common float64 dtype for the whole array.',
    },
    {
      ask: 'To solve Ax=b for the unknown vector x, the most direct NumPy approach is…',
      choices: [
        {label: 'numpy.linalg.solve(A, b)', ok: true},
        {label: 'A * b (elementwise multiply)', ok: false},
        {label: 'A.append(b)', ok: false},
      ],
      caption: 'solve() uses Gaussian elimination/LU internally and is both faster and more numerically stable than computing an explicit inverse.',
    },
  ],
};
