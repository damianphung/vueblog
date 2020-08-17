const { description } = require('../../package')
const fs = require("fs");
const path = require("path");

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
    smoothScroll: true,
    editLinks: false,
    // docsDir: '',
    // editLinkText: '',
    lastUpdated: true,
    searchMaxSuggestions: 10,
    searchPlaceholder: 'Search...',
    nav: [
      {
        text: 'Blog Topics',
        items: [
          { text: 'Software Engineering'    , link: '/software/'},
          { text: 'Machine Learning'        , link: '/machine-learning/'},
          { text: 'No Code'                 , link: '/nocode/'}
        ] 
      },
      {
        text: 'Github',
        link: 'https://github.com/damianphung'
      }
    ],
    sidebar: {
      '/resume/' :  getSideBar("resume", "Resume"),
      '/software/' :  getSideBar("software", "Software"),
      '/machine-learning/' : getSideBar("machine-learning", "Machine Learning"),
      '/nocode/': getSideBar("nocode", "No Code"),
    },    
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    // [
    //   "vuepress-plugin-mailchimp",
    //   {
    //     endpoint: 'https://billyyyyy3320.us4.list-manage.com/subscribe/post?u=4905113ee00d8210c2004e038&amp;id=bd18d40138'
    //   }
    // ],
    // [
    //   "vuepress-plugin-disqus-comment",
    //   {

    //   }
    // ]
    // See https://flowchart.vuepress.ulivz.com/#install
    // "flowchart"
    //
    // See https://github.com/ntnyq/vuepress-plugin-social-share
    // 

  ]
}

function getSideBar(folder, title) {
  const extension = [".md"];
  const files = fs
    .readdirSync(path.join(`${__dirname}/../${folder}`))
    .filter(
      item =>
        item.toLowerCase() != "readme.md" &&
        fs.statSync(path.join(`${__dirname}/../${folder}`, item)).isFile() &&
        extension.includes(path.extname(item))
    );

  return [{ title: title,  sidebarDepth: 2, children: ["", ...files] }];
}