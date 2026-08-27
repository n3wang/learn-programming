// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

const fs = require('fs');
const path = require('path');
const {themes: prismThemes} = require('prism-react-renderer');
const lightCodeTheme = prismThemes.github;
const darkCodeTheme = prismThemes.dracula;

function loadDotEnv(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    return;
  }
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv('.env');

const pistonPort = process.env.PISTON_PORT || '2000';
const pistonHost = (process.env.PISTON_HOST || 'http://127.0.0.1').replace(/\/$/, '');
const pistonExecuteUrl =
  process.env.PISTON_EXECUTE_URL || `${pistonHost}:${pistonPort}/api/v2/execute`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'learn.wangnelson.xyz',
  tagline: 'Your success is my #1 priority!',
  url: 'http://learn.wangnelson.xyz',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'n3wang',
  projectName: 'Learn-programming',
  customFields: {
    pistonExecuteUrl,
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en-GB',
      },
      'zh-Hans': {
        label: '中文',
        htmlLang: 'zh-Hans',
        direction: 'ltr',
      },
    },
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          path: 'docs',

        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          sortPosts: 'ascending',

        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'python',
        path: 'python',
        routeBasePath: 'python',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'java',
        path: 'java',
        routeBasePath: 'java',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'cpp',
        path: 'cpp',
        routeBasePath: 'cpp',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'instructor',
        path: 'instructor',
        routeBasePath: 'instructor',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'misc',
        path: 'misc',
        routeBasePath: 'misc',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'web-design',
        path: 'web-design',
        routeBasePath: 'web-design',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'scratch',
        path: 'scratch',
        routeBasePath: 'scratch',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'robotics',
        path: 'robotics',
        routeBasePath: 'robotics',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'javascript',
        path: 'javascript',
        routeBasePath: 'javascript',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'angular',
        path: 'angular',
        routeBasePath: 'angular',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'ios',
        path: 'ios',
        routeBasePath: 'ios',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'android-kotlin',
        path: 'android-kotlin',
        routeBasePath: 'android-kotlin',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'game-dev',
        path: 'game-dev',
        routeBasePath: 'game-dev',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'backend',
        path: 'backend',
        routeBasePath: 'backend',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'math',
        path: 'math',
        routeBasePath: 'math',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'math-1',
        path: 'classes/math-1',
        routeBasePath: 'classes/math-1',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'math-2',
        path: 'classes/math-2',
        routeBasePath: 'classes/math-2',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'biancheng',
        path: 'classes/programming',
        routeBasePath: 'classes/programming',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'fundamentals',
        path: 'fundamentals',
        routeBasePath: 'fundamentals',
        sidebarPath: require.resolve('./sidebars.js'),
        async sidebarItemsGenerator({defaultSidebarItemsGenerator, ...args}) {
          const items = await defaultSidebarItemsGenerator(args);
          const byId = new Map(args.docs.map((d) => [d.id, d]));

          const decorate = (list) =>
            list.map((item) => {
              if (item.type === 'category' && Array.isArray(item.items)) {
                return {...item, items: decorate(item.items)};
              }
              if (item.type === 'doc' && String(item.id).includes('computer-engineering/')) {
                const pos = byId.get(item.id)?.sidebarPosition;
                if (
                  typeof pos === 'number' &&
                  item.label &&
                  !/^\d+\s*-\s*/.test(item.label)
                ) {
                  return {...item, label: `${pos} - ${item.label}`};
                }
              }
              return item;
            });

          return decorate(items);
        },
      },
    ],
    "docusaurus-plugin-image-zoom"

  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'learn.l0l.in',
        logo: {
          alt: 'Learn Programming',
          src: 'img/logo.svg',
        },

        items: [
          {
            type: 'dropdown',
            label: 'Classes',
            position: 'left',
            items: [
              {
                to: '/classes/math-1/intro',
                label: '数学 初一',
              },
              {
                to: '/classes/math-2/intro',
                label: '数学 初二',
              },
              {
                to: '/classes/programming/intro',
                label: '编程',
              },
            ],
          },
          {
            type: 'dropdown',
            label: 'Programming',
            position: 'left',
            items: [
              {
                type: 'html',
                value: '<div class="dropdown__link" style="opacity:0.65;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;pointer-events:none">Technology</div>',
              },
              {
                to: '/scratch/intro',
                label: 'Scratch',
              },
              {
                to: '/robotics/intro',
                label: 'Robotics',
              },
              {
                to: '/game-dev/intro',
                label: 'Game Design',
              },
              {
                type: 'html',
                value: '<div class="dropdown__link" style="opacity:0.65;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;pointer-events:none">Languages</div>',
              },
              {
                to: '/python/lesson-notes',
                label: 'Python',
              },
              {
                to: '/java/lesson-notes',
                label: 'Java',
              },
              {
                to: '/cpp/lesson-notes',
                label: 'C++',
              },
            ],
          },
          {
            type: 'dropdown',
            label: 'Engineering',
            position: 'left',
            items: [
              {
                to: '/fundamentals/computer-engineering/virtualization/cpu-pipeline',
                label: 'CS Fundamentals',
              },
            ],
          },
          {
            type: 'dropdown',
            label: 'Others',
            position: 'left',
            items: [
              {
                to: '/misc/intro',
                label: 'Misc'
              },
              {
                to: '/blog',
                label: 'Blog'
              }, {
                type: 'doc',
                docId: 'intro',
                label: 'About',
              },
            ]
          },
          ...(false ? [{
            href: 'https://docs.google.com/forms/d/e/1FAIpQLSclM-biiVICBNWiJFPpZC0vTmzIanA3GUtglgMRc9R2ZZwqwQ/viewform?usp=sf_link',
            label: 'Submit HW',
            position: 'right',
          }] : []),
          {
            type: 'custom-siteLanguage',
            position: 'right'
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [{
          title: 'Class Notes',
          items: [{
            label: 'Python',
            to: '/python/lesson-notes',
          },
          {
            label: 'Java',
            to: '/java/lesson-notes',
          },
          {
            label: 'C++',
            to: '/cpp/lesson-notes',
          },
          ],
        }, {
          title: 'Community',
          items: [{
            label: 'Discord',
            href: 'https://discord.gg/pGaJqmbJSm',
          },],
        },
        {
          title: 'Contact',
          items: [

            {
              label: 'Instructor Contact Information',
              to: '/docs/contact',
            },
            {
              label: 'Ask a question',
              href: 'https://docs.google.com/forms/d/e/1FAIpQLSddepUVJeAYT6WRtZR48EKSe9XRbJ-hxFLGYMaMl1F8Ybp9hA/viewform?usp=sf_link',
            }, {
              label: 'Provide Anonymous Feedback',
              href: 'https://docs.google.com/forms/d/e/1FAIpQLSd3ybWqqgq5rV2XKiws1TGvp7fZF2Iz4zVSq18Kat4rMPQkHA/viewform?usp=sf_link',
            },
          ],
        },
        ],
        copyright: `Your success is my #1 priority!`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['java', 'cpp'],
      },
    }),
};

module.exports = config;