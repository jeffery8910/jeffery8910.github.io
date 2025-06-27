import { defineUserConfig } from 'vuepress';
import { hopeTheme } from 'vuepress-theme-hope';
import { viteBundler } from '@vuepress/bundler-vite';

export default defineUserConfig({
  bundler: viteBundler(),
  lang: 'zh-TW',
  title: '我的部落格',
  description: '一個由 VuePress 與 VuePress Theme Hope 驅動的部落格。',

  theme: hopeTheme({
    // 主題配置
    navbar: [
      { text: '首頁', link: '/' },
      { text: '文章', link: '/pages/folder1/test1.md' },
    ],

    sidebar: {
      '/pages/': [
        {
          text: 'Folder 1',
          collapsible: true,
          children: [
            '/pages/folder1/test1.md',
          ],
        },
      ],
    },

    locales: {
      '/': {
        // 語言選擇器中的文字
        selectLanguageName: '繁體中文',
        selectLanguageText: '選擇語言',
        selectLanguageAriaLabel: '選擇語言',

        // 頁面元數據
        lastUpdatedText: '上次更新',
        contributorsText: '貢獻者',

        // 編輯鏈接
        editLinkText: '在 GitHub 上編輯此頁',

        // 導航欄
        navbar: [
          { text: '首頁', link: '/' },
          { text: '文章', link: '/pages/folder1/test1.md' },
        ],

        // 側邊欄
        sidebar: {
          '/pages/': [
            {
              text: 'Folder 1',
              collapsible: true,
              children: [
                '/pages/folder1/test1.md',
              ],
            },
          ],
        },
      },
    },
  }),
});
