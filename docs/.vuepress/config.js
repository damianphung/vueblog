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
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['script', {}, `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('1NcBzoT465waWWN61-3A76fKVLl5hU2bx0omS00UWVA',{api_host:'https://app.posthog.com'}); 
    `]
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
        text: 'Notes',
        items: [
          { text: 'Software Engineering'    , link: '/software/'},
          { text: 'Machine Learning'        , link: '/machine-learning/'}
          // { text: 'No Code'                 , link: '/nocode/'}
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
      // '/nocode/': getSideBar("nocode", "No Code"),
    },    
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    // ['minimal-analytics', { ga: 'G-YL1YJRWKPY', trackEvent: true }],
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