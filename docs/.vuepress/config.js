const { description } = require('../../package')
const glob = require('glob');

let markdownFiles = glob.sync('software/*.md').map( function(f) {
    if(f ==='software/README.md') return '';
    else return f.slice(9).slice(0,-3);
  }
);
// console.log(markdownFiles);


module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Damian Phung',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    // logo: 'assets/img/logo.png',
    editLinks: false,
    // docsDir: '',
    // editLinkText: '',
    lastUpdated: true,
    searchMaxSuggestions: 10,
    searchPlaceholder: 'Search...',
    nav: [
      {
        text: 'Topics',
        items: [
          { text: 'Software Engineering'    , link: '/software/'},
          { text: 'Machine Learning'        , link: '/machine-learning/'}
        ] 
      },
      {
        text: 'Github',
        link: 'https://github.com/damianphung'
      }
    ],
    sidebar: [
      '/',
      '/software/',
      '/machine-learning/'
    ]  
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ]
}
