import { defineUserConfig } from 'vuepress';
import { gungnirTheme } from 'vuepress-theme-gungnir';
import { viteBundler } from '@vuepress/bundler-vite';

export default defineUserConfig({
  bundler: viteBundler(),
  lang: 'zh-TW',
  title: '我的部落格',
  description: '一個由 VuePress 與 Gungnir 主題驅動的部落格。',

  theme: gungnirTheme({
    personalInfo: {
      name: "我的部落格",
      avatar: "/img/avatar.jpeg", // 請替換為你的頭像路徑
      description: "一個由 VuePress 與 Gungnir 主題驅動的部落格。",
      sns: {
        github: "your-github-username", // 請替換為你的 GitHub 用戶名
      },
    },

    navbar: [
      { text: '首頁', link: '/' },
      { text: '文章', link: '/posts/' }, // Gungnir 主題通常將文章放在 /posts/ 下
    ],

    sidebar: {
      '/posts/': [
        {
          text: '我的文章',
          children: [
            '/posts/my-first-post.md',
          ],
        },
      ],
    },

    // 繁體中文配置
    locales: {
      '/': {
        lang: 'zh-TW',
        title: '我的部落格',
        description: '一個由 VuePress 與 Gungnir 主題驅動的部落格。',
      },
    },

    blog: {}, // 添加空的博客配置
  }),
});
