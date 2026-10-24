import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The order here is the order a newcomer should read in: set up and run a first upgrade, learn how
// the engine decides what to run, then each feature in roughly the order you reach for it.
const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Start here',
      collapsed: false,
      items: ['overview', 'installation', 'getting-started', 'how-it-works', 'supported-databases'],
    },
    {
      type: 'category',
      label: 'Scripts',
      collapsed: false,
      items: [
        'scripts/script-providers',
        'scripts/code-scripts',
        'scripts/script-types',
        'scripts/run-group-order',
        'scripts/ordering-and-filtering',
        'scripts/variable-substitution',
        'scripts/preprocessors',
      ],
    },
    {
      type: 'category',
      label: 'Running upgrades',
      collapsed: false,
      items: [
        'running/upgrade-engine',
        'running/creating-the-database',
        'running/journaling',
        'running/transactions',
        'running/timeouts',
        'running/logging',
        'running/html-report',
      ],
    },
    {
      type: 'category',
      label: 'Hosting and deployment',
      collapsed: false,
      items: [
        'hosting/hosting-options',
        'hosting/powershell',
        'hosting/octopus-deploy',
        'hosting/dbops',
        'hosting/convention-check',
      ],
    },
    {
      type: 'category',
      label: 'API reference',
      collapsed: false,
      link: {type: 'doc', id: 'api/index'},
      items: [
        'api/builder',
        'api/upgrade-engine',
        'api/configuration',
        'api/scripts',
        'api/extensibility',
        'api/helpers',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'reference/breaking-changes',
        'reference/schema-downgrading',
        'reference/faq',
        'reference/philosophy',
        'reference/history',
        'reference/contributing',
      ],
    },
  ],
};

export default sidebars;
