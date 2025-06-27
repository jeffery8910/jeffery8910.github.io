module.exports = {
  theme: 'vdoing', // 使用 Vdoing 主題

  locales: {
    '/': {
      lang: 'zh-TW', // 將預設語言設定為繁體中文
      title: "我的部落格", // 網站標題
      description: '一個由 VuePress 與 Vdoing 主題驅動的部落格。', // 網站描述
    }
  },

  themeConfig: {
    // 主題配置
    nav: [
      { text: '首頁', link: '/' },
      { text: '文章', link: '/pages/folder1/test1.md' } // 範例：指向一篇範例文章
    ],
    sidebar: 'structuring', // 'structuring' | { mode: 'structuring', collapsable: Boolean} | 'auto' | 自定義
    locales: {
      '/': {
        selectText: '選擇語言',
        label: '繁體中文',
        editLinkText: '在 GitHub 上編輯此頁',
        nav: [
          { text: '首頁', link: '/' },
          { text: '文章', link: '/pages/folder1/test1.md' } // 範例：指向一篇範例文章
        ]
      }
    }
  },

  base: '/', // 部屬站台的基本路徑。如果你想將網站部署到 https://USERNAME.github.io/REPO_NAME/（也就是说你的仓库在 https://github.com/USERNAME/REPO_NAME）， então 将 base 设置为 "/REPO_NAME/"。

  // markdown 配置 (可選)
  markdown: {
    lineNumbers: true // 代碼塊顯示行號
  },

  // 外掛程式配置 (可選)
  // plugins: [
  //   // 可以加入 Vdoing 主題推薦的一些外掛程式，例如：
  //   // 'vuepress-plugin-baidu-tongji', // 百度統計
  //   // ['fulltext-search'], // 全文搜尋
  // ]
}