import type * as Preset from '@docusaurus/preset-classic';
import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';

const organizationName = 'DbBump';
const projectName = 'DbBump';
const repoUrl = `https://github.com/${organizationName}/${projectName}`;

const config: Config = {
  title: 'DbBump',
  tagline: 'Deploy changes to your database by running SQL scripts from .NET',
  favicon: 'img/favicon.png',

  // Published to GitHub Pages at https://dbbump.github.io/DbBump/
  url: `https://${organizationName.toLowerCase()}.github.io`,
  baseUrl: `/${projectName}/`,
  organizationName,
  projectName,
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          // Docs-only mode: the docs are served from the site root.
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: `${repoUrl}/tree/main/docs-website/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        // Offline search: the index is built at compile time and served as
        // static assets, so it works on GitHub Pages with no search backend.
        hashed: true,
        // The site runs in docs-only mode (docs.routeBasePath === '/'), so the
        // indexer has to be pointed at the root too — it defaults to '/docs'
        // and would otherwise index nothing.
        docsRouteBasePath: '/',
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/icon.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'DbBump',
      logo: {
        alt: 'DbBump logo',
        src: 'img/icon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/api', label: 'API', position: 'left'},
        {
          href: 'https://www.nuget.org/packages/dbbump-core',
          label: 'NuGet',
          position: 'right',
        },
        {
          href: repoUrl,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Overview', to: '/'},
            {label: 'Installation', to: '/installation'},
            {label: 'Getting Started', to: '/getting-started'},
            {label: 'API Reference', to: '/api'},
          ],
        },
        {
          title: 'Packages',
          items: [
            {label: 'dbbump-core', href: 'https://www.nuget.org/packages/dbbump-core'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: repoUrl},
            {label: 'Issues', href: `${repoUrl}/issues`},
            {label: 'Upstream DbUp', href: 'https://github.com/DbUp/DbUp'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DbBump and DbUp contributors. MIT licensed.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'bash', 'powershell', 'json', 'sql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
