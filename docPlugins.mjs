import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {createRequire} from 'module';
import {GlobExcludeDefault} from '@docusaurus/utils';

const require = createRequire(import.meta.url);
const defaultSidebar = require.resolve('./sidebars.js');
const fundamentalsSidebar = require.resolve('./sidebars.fundamentals.js');

/** @type {Array<[string, import('@docusaurus/plugin-content-docs').Options]>} */
const DOC_INSTANCES = [
  ['python', {path: 'python', routeBasePath: 'python', remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex]}],
  ['java', {path: 'java', routeBasePath: 'java'}],
  ['cpp', {path: 'cpp', routeBasePath: 'cpp'}],
  ['godot', {path: 'godot', routeBasePath: 'godot'}],
  ['misc', {path: 'misc', routeBasePath: 'misc'}],
  ['robotics', {path: 'robotics', routeBasePath: 'robotics'}],
  ['javascript', {path: 'javascript', routeBasePath: 'javascript'}],
  ['ios', {path: 'ios', routeBasePath: 'ios'}],
  ['game-dev', {path: 'game-dev', routeBasePath: 'game-dev'}],
  ['math', {path: 'math', routeBasePath: 'math', remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex]}],
  ['math-1', {path: 'classes/math-1', routeBasePath: 'classes/math-1', remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex]}],
  ['math-2', {path: 'classes/math-2', routeBasePath: 'classes/math-2', remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex]}],
  ['biancheng', {path: 'classes/programming', routeBasePath: 'classes/programming'}],
];

/** Top-level folders under fundamentals/ (for DOC_FUND_ONLY / DOC_FUND_EXCLUDE). */
export const FUNDAMENTALS_FOLDERS = [
  'algorithms',
  'artificial-intelligence',
  'computer-engineering',
  'data-science',
  'electronics',
  'finance',
  'game-engine-development',
  'graphics',
  'math-and-science',
  'scalable-systems',
];

/** All plugin ids for DOC_BUILD / DOC_BUILD_EXCLUDE. */
export const DOC_INSTANCE_IDS = [
  ...DOC_INSTANCES.map(([id]) => id),
  'fundamentals',
];

export function isSubsetDocBuild() {
  return Boolean(
    process.env.DOC_BUILD ||
      process.env.DOC_BUILD_EXCLUDE ||
      process.env.DOC_FUND_ONLY ||
      process.env.DOC_FUND_EXCLUDE,
  );
}

/** Skip preset docs/ + blog (use with DOC_BUILD for smoke tests). */
export function isMinimalPresetBuild() {
  return process.env.DOC_BUILD_MINIMAL === '1';
}

async function fundamentalsSidebarItemsGenerator({defaultSidebarItemsGenerator, ...args}) {
  const items = await defaultSidebarItemsGenerator(args);
  const byId = new Map(args.docs.map((d) => [d.id, d]));

  const decorate = (list) =>
    list.map((item) => {
      if (item.type === 'category' && Array.isArray(item.items)) {
        return {...item, items: decorate(item.items)};
      }
      if (item.type === 'doc' && String(item.id).includes('computer-engineering/')) {
        const meta = byId.get(item.id);
        const pos = meta?.sidebarPosition;
        const title = item.label || meta?.title;
        if (typeof pos === 'number' && title && !/^\d+\s*-\s*/.test(title)) {
          return {...item, label: `${pos} - ${title}`};
        }
      }
      return item;
    });

  return decorate(items);
}

function docPlugin(id, options) {
  const sidebarPath = id === 'fundamentals' ? fundamentalsSidebar : defaultSidebar;
  return [
    '@docusaurus/plugin-content-docs',
    {
      id,
      sidebarPath,
      ...options,
    },
  ];
}

/**
 * Binary-search OOM builds (no need to comment plugins in this file):
 *   DOC_BUILD=biancheng DOC_BUILD_MINIMAL=1 npm run build
 *   DOC_BUILD_EXCLUDE=fundamentals npm run build
 *   DOC_BUILD=fundamentals DOC_BUILD_MINIMAL=1 npm run build
 *   DOC_BUILD=fundamentals DOC_FUND_ONLY=algorithms DOC_BUILD_MINIMAL=1 npm run build
 *   DOC_BUILD=fundamentals DOC_FUND_EXCLUDE=computer-engineering,scalable-systems DOC_BUILD_MINIMAL=1 npm run build
 *
 * DOC_BUILD = include plugin ids. DOC_BUILD_EXCLUDE = exclude plugin ids.
 * DOC_FUND_ONLY / DOC_FUND_EXCLUDE = top-level folders under fundamentals/.
 * INCLUDE wins if both are set. DOC_BUILD_MINIMAL=1 disables preset docs/ + blog.
 */
function parseIdList(raw) {
  return new Set(
    String(raw || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function fundamentalsExcludeGlobs() {
  const only = parseIdList(process.env.DOC_FUND_ONLY);
  const excl = parseIdList(process.env.DOC_FUND_EXCLUDE);
  if (only.size === 0 && excl.size === 0) {
    return undefined;
  }

  for (const id of [...only, ...excl]) {
    if (!FUNDAMENTALS_FOLDERS.includes(id)) {
      console.warn(
        `[docPlugins] unknown DOC_FUND folder (ignored): ${id}. Known: ${FUNDAMENTALS_FOLDERS.join(', ')}`,
      );
    }
  }

  const drop =
    only.size > 0
      ? FUNDAMENTALS_FOLDERS.filter((f) => !only.has(f))
      : FUNDAMENTALS_FOLDERS.filter((f) => excl.has(f));

  const kept =
    only.size > 0
      ? FUNDAMENTALS_FOLDERS.filter((f) => only.has(f))
      : FUNDAMENTALS_FOLDERS.filter((f) => !excl.has(f));

  console.log(
    `[docPlugins] fundamentals folders: ${kept.join(', ') || '(none)'} (excluded ${drop.length})`,
  );

  // Must include GlobExcludeDefault — passing `exclude` replaces the plugin default.
  return [
    ...GlobExcludeDefault,
    ...drop.flatMap((folder) => [`${folder}/**/*.{md,mdx}`, `${folder}/**`]),
  ];
}

function fundamentalsPlugin() {
  const exclude = fundamentalsExcludeGlobs();
  return docPlugin('fundamentals', {
    path: 'fundamentals',
    routeBasePath: 'fundamentals',
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    sidebarItemsGenerator: fundamentalsSidebarItemsGenerator,
    ...(exclude ? {exclude} : {}),
  });
}

export function docPlugins() {
  const all = DOC_INSTANCES.map(([id, options]) => docPlugin(id, options)).concat([
    fundamentalsPlugin(),
  ]);

  const include = parseIdList(process.env.DOC_BUILD);
  const exclude = parseIdList(process.env.DOC_BUILD_EXCLUDE);
  if (include.size === 0 && exclude.size === 0) {
    return all;
  }

  const known = new Set(all.map(([, opts]) => opts.id));
  for (const id of [...include, ...exclude]) {
    if (!known.has(id)) {
      console.warn(
        `[docPlugins] unknown DOC_BUILD id (ignored): ${id}. Known: ${DOC_INSTANCE_IDS.join(', ')}`,
      );
    }
  }

  const filtered =
    include.size > 0
      ? all.filter(([, opts]) => include.has(opts.id))
      : all.filter(([, opts]) => !exclude.has(opts.id));

  const kept = filtered.map(([, opts]) => opts.id).join(', ') || '(none)';
  console.log(`[docPlugins] building ${filtered.length}/${all.length} instances: ${kept}`);
  if (isMinimalPresetBuild()) {
    console.log('[docPlugins] DOC_BUILD_MINIMAL=1 — preset docs/ and blog disabled');
  }
  return filtered;
}

export function webpackMemoryPlugin() {
  return {
    name: 'docusaurus-webpack-memory-tune',
    configureWebpack(_config, isServer) {
      if (!isServer) {
        return {};
      }
      return {
        parallelism: 1,
      };
    },
  };
}
