// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

const {themes: prismThemes} = require('prism-react-renderer');
const lightCodeTheme = prismThemes.github;
const darkCodeTheme = prismThemes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'learn.wangnelson.xyz',
  tagline: 'Your success is my #1 priority!',
  url: 'http://learn.wangnelson.xyz',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'NeneWang',
  projectName: 'Learn-programming',
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
        id: 'scratch-jr',
        path: 'scratch-jr',
        routeBasePath: 'scratch-jr',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'lego',
        path: 'lego',
        routeBasePath: 'lego',
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
        id: 'react-native',
        path: 'react-native',
        routeBasePath: 'react-native',
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
        id: 'fundamentals',
        path: 'fundamentals',
        routeBasePath: 'fundamentals',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    "docusaurus-plugin-image-zoom"

  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'learn.wangnelson.xyz',
        logo: {
          alt: 'Learn Programming',
          src: 'img/logo.svg',
        },

        items: [
          {
            type: 'dropdown',
            label: 'Technology',
            position: 'left',
            items: [
              // {
              //   to: '/web-design/intro',
              //   label: 'Web Design',
              // },
              {
                to: '/scratch/intro',
                label: 'Scratch',
              },
              {
                to: '/scratch-jr/intro',
                label: 'Scratch Jr',
              },
              {
                to: '/lego/intro',
                label: 'Lego Mindstorm',
              },
            ]
          },
          {
            type: 'dropdown',
            label: 'Languages',
            position: 'left',
            items: [

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
            ]
          },
          {
            type: 'dropdown',
            label: 'Advanced',
            position: 'left',
            items: [
              {
                to: '/react-native/lesson-notes',
                label: 'React Native',
              },
            ]
          },
          {
            to: '/fundamentals/intro',
            label: 'Fundamentals',
            position: 'left',
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
          {
            href: 'https://docs.google.com/forms/d/e/1FAIpQLSclM-biiVICBNWiJFPpZC0vTmzIanA3GUtglgMRc9R2ZZwqwQ/viewform?usp=sf_link',
            label: 'Submit HW',
            position: 'right',
          },
          {
            type: 'custom-siteLanguage',
            position: 'right'
          },
          {
            type: 'localeDropdown',
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