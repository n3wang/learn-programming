const SPACING = 8;

const COLORS = {
  'text.secondary': 'var(--ifm-color-emphasis-700, #666)',
  'text.primary': 'var(--ifm-font-color-base, #1c1e21)',
  divider: 'var(--ifm-color-emphasis-300, #dadde1)',
  'grey.100': '#f5f5f5',
  'grey.200': '#eeeeee',
  'action.hover': 'rgba(0, 0, 0, 0.04)',
  'primary.main': 'var(--ifm-color-primary, #3578e5)',
};

const SPACING_KEYS = {
  m: ['margin'],
  mt: ['marginTop'],
  mb: ['marginBottom'],
  ml: ['marginLeft'],
  mr: ['marginRight'],
  mx: ['marginLeft', 'marginRight'],
  my: ['marginTop', 'marginBottom'],
  p: ['padding'],
  pt: ['paddingTop'],
  pb: ['paddingBottom'],
  pl: ['paddingLeft'],
  pr: ['paddingRight'],
  px: ['paddingLeft', 'paddingRight'],
  py: ['paddingTop', 'paddingBottom'],
  gap: ['gap'],
};

function resolveColor(val) {
  return typeof val === 'string' ? COLORS[val] ?? val : val;
}

function spacing(val) {
  return typeof val === 'number' ? `${val * SPACING}px` : val;
}

/** Minimal subset of MUI `sx` used across simulators. */
export function sxToStyle(sx) {
  if (!sx) return undefined;
  if (Array.isArray(sx)) {
    return Object.assign({}, ...sx.map(sxToStyle).filter(Boolean));
  }
  const style = {};
  for (const [key, val] of Object.entries(sx)) {
    if (SPACING_KEYS[key]) {
      const px = spacing(val);
      for (const prop of SPACING_KEYS[key]) style[prop] = px;
      continue;
    }
    if (key === 'bgcolor') {
      style.backgroundColor = resolveColor(val);
      continue;
    }
    if (key === 'borderColor') {
      style.borderColor = resolveColor(val);
      continue;
    }
    if (key === 'color' && typeof val === 'string') {
      style.color = resolveColor(val);
      continue;
    }
    if (key === 'backgroundColor' && typeof val === 'string') {
      style.backgroundColor = resolveColor(val);
      continue;
    }
    style[key] = typeof val === 'string' ? resolveColor(val) : val;
  }
  return style;
}

export function mergeStyle(sx, style) {
  return {...sxToStyle(sx), ...style};
}
