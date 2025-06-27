import { defineUserConfig } from 'vuepress';
import { hopeTheme } from 'vuepress-theme-hope';
import { viteBundler } from '@vuepress/bundler-vite';

export default defineUserConfig({
  bundler: viteBundler(),
  lang: 'zh-TW',
  title: '我的部落格',
  description: '一個由 VuePress 與 VuePress Theme Hope 驅動的部落格。',

  theme: hopeTheme({
    // 最基本的配置
  }),
});
