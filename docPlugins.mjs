import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const defaultSidebar = require.resolve('./sidebars.js');
const fundamentalsSidebar = require.resolve('./sidebars.fundamentals.js');

/** @type {Array<[string, import('@docusaurus/plugin-content-docs').Options]>} */
const DOC_INSTANCES = [
  ['python', {path: 'python', routeBasePath: 'python', remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex]}],
  ['java', {path: 'java', routeBasePath: 'java'}],
  ['cpp', {path: 'cpp', routeBasePath: 'cpp'}],
  ['instructor', {path: 'instructor', routeBasePath: 'instructor'}],
  ['misc', {path: 'misc', routeBasePath: 'misc'}],
  ['web-design', {path: 'web-design', routeBasePath: 'web-design'}],
  ['scratch', {path: 'scratch', routeBasePath: 'scratch'}],
  ['robotics', {path: 'robotics', routeBasePath: 'robotics'}],
  ['javascript', {path: 'javascript', routeBasePath: 'javascript'}],
  ['angular', {path: 'angular', routeBasePath: 'angular'}],
  ['ios', {path: 'ios', routeBasePath: 'ios'}],
  ['android-kotlin', {path: 'android-kotlin', routeBasePath: 'android-kotlin'}],
  ['game-dev', {path: 'game-dev', routeBasePath: 'game-dev'}],
  ['backend', {path: 'backend', routeBasePath: 'backend'}],
  ['math', {path: 'math', routeBasePath: 'math'}],
  ['math-1', {path: 'classes/math-1', routeBasePath: 'classes/math-1'}],
  ['math-2', {path: 'classes/math-2', routeBasePath: 'classes/math-2'}],
  ['biancheng', {path: 'classes/programming', routeBasePath: 'classes/programming'}],
];

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

export function docPlugins() {
  return DOC_INSTANCES.map(([id, options]) => docPlugin(id, options)).concat([
    docPlugin('fundamentals', {
      path: 'fundamentals',
      routeBasePath: 'fundamentals',
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      sidebarItemsGenerator: fundamentalsSidebarItemsGenerator,
    }),
  ]);
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
