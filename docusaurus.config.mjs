// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {themes as prismThemes} from 'prism-react-renderer';
import {docPlugins, isMinimalPresetBuild, isSubsetDocBuild, webpackMemoryPlugin} from './docPlugins.mjs';

const lightCodeTheme = prismThemes.github;
const darkCodeTheme = prismThemes.dracula;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Dev server (`npm start`) → local Piston. Production build → public API.
// Override anytime with PISTON_EXECUTE_URL (or PISTON_HOST / PISTON_PORT).
const isDevServer = process.argv.includes('start');
const defaultPistonExecuteUrl = isDevServer
  ? 'http://127.0.0.1:2000/api/v2/execute'
  : 'https://piston.l.l0l.in/api/v2/execute';

function resolvePistonExecuteUrl() {
  if (process.env.PISTON_EXECUTE_URL) {
    return process.env.PISTON_EXECUTE_URL;
  }
  if (process.env.PISTON_HOST) {
    const host = process.env.PISTON_HOST.replace(/\/$/, '');
    const port = process.env.PISTON_PORT;
    const withPort =
      port && !/:[0-9]+$/.test(host) ? `${host}:${port}` : host;
    return `${withPort}/api/v2/execute`;
  }
  return defaultPistonExecuteUrl;
}

const pistonExecuteUrl = resolvePistonExecuteUrl();

const minimalPreset = isMinimalPresetBuild();
const subsetBuild = isSubsetDocBuild();

function othersNavItems() {
  if (minimalPreset) {
    return [];
  }
  return [
    {to: '/misc/intro', label: 'Misc'},
    {to: '/blog', label: 'Blog'},
    {type: 'doc', docId: 'intro', label: 'About'},
  ];
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'learn.wangnelson.xyz',
  tagline: 'Your success is my #1 priority!',
  url: 'http://learn.wangnelson.xyz',
  baseUrl: '/',
  onBrokenLinks: subsetBuild ? 'warn' : 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'n3wang',
  projectName: 'Learn-programming',
  customFields: {
    pistonExecuteUrl,
  },
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV',
      crossorigin: 'anonymous',
    },
  ],
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
  clientModules: [require.resolve('./src/client/googleTranslateDomPatch.js')],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: minimalPreset
          ? false
          : {
              sidebarPath: path.resolve(__dirname, './sidebars.js'),
              path: 'docs',
            },
        blog: minimalPreset
          ? false
          : {
              showReadingTime: true,
              sortPosts: 'ascending',
            },
        theme: {
          customCss: path.resolve(__dirname, './src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    ...docPlugins(),
    webpackMemoryPlugin,
    'docusaurus-plugin-image-zoom',
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        disableSwitch: true,
      },
      docs: {
        sidebar: {
          hideable: true,
        },
      },
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
              {
                to: '/godot/lesson-notes',
                label: 'Godot',
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
              {
                to: '/fundamentals/math-and-science/intro',
                label: 'Math and Science',
              },
              {
                to: '/fundamentals/data-science/intro',
                label: 'Data Science',
              },
              {
                to: '/fundamentals/electronics/intro',
                label: 'Electronics',
              },
              {
                to: '/fundamentals/finance/intro',
                label: 'Finance',
              },
            ],
          },
          ...(minimalPreset
            ? []
            : [
                {
                  type: 'dropdown',
                  label: '*',
                  position: 'left',
                  items: othersNavItems(),
                },
              ]),
          ...(false ? [{
            href: 'https://docs.google.com/forms/d/e/1FAIpQLSclM-biiVICBNWiJFPpZC0vTmzIanA3GUtglgMRc9R2ZZwqwQ/viewform?usp=sf_link',
            label: 'Submit HW',
            position: 'right',
          }] : []),
          {
            type: 'custom-siteSettings',
            position: 'right',
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
          {
            label: 'Godot',
            to: '/godot/lesson-notes',
          },
          ],
        }, {
          title: 'Games',
          items: [{
            label: 'Fighting Game',
            to: '/misc/fighting-game',
          },],
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
            ...(minimalPreset
              ? []
              : [
                  {
                    label: 'Instructor Contact Information',
                    to: '/docs/contact',
                  },
                ]),
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

export default config;
