/** OpenCV RGB histograms and background subtraction. */

export default {
  title: 'OpenCV images',
  lead:
    '8-bit RGB has 256 levels per channel (≈16.7M colors). Histograms of tones separate ripe vs green fruit; frame differences drop static backgrounds.',
  steps: [
    {
      caption:
        'calcHist fills 256 bins per channel. Compare red vs green mass in the histogram (or mean R/G) as a ripeness feature.',
    },
    {
      ask: 'Background subtraction in video mainly keeps…',
      choices: [
        {label: 'pixels that change across frames (foreground)', ok: true},
        {label: 'only the Dense layer bias', ok: false},
        {label: 'η(t) from the perceptron schedule', ok: false},
      ],
      caption:
        'OpenCV’s MOG2 is a statistical background model; a teaching proxy is mean absolute frame difference + threshold.',
    },
  ],
};
