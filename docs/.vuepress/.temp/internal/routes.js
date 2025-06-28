export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/test.html", { loader: () => import(/* webpackChunkName: "test.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/test.html.js"), meta: {"title":"測試頁面"} }],
  ["/guide/", { loader: () => import(/* webpackChunkName: "guide_index.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/guide/index.html.js"), meta: {"title":"我的部落格"} }],
  ["/posts/my-first-post.html", { loader: () => import(/* webpackChunkName: "posts_my-first-post.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/posts/my-first-post.html.js"), meta: {"title":"我的第一篇 Gungnir 博客文章"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
]);
