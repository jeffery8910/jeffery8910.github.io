export const redirects = JSON.parse("{\"/@pages/archivesPage.html\":\"/archives/\",\"/@pages/categoriesPage.html\":\"/categories/\",\"/@pages/tagsPage.html\":\"/tags/\",\"/pages/folder1/test1.html\":\"/pages/35bc95/\"}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":""} }],
  ["/archives/", { loader: () => import(/* webpackChunkName: "archives_index.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/archives/index.html.js"), meta: {"title":"归档"} }],
  ["/categories/", { loader: () => import(/* webpackChunkName: "categories_index.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/categories/index.html.js"), meta: {"title":"分类"} }],
  ["/tags/", { loader: () => import(/* webpackChunkName: "tags_index.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/tags/index.html.js"), meta: {"title":"标签"} }],
  ["/pages/35bc95/", { loader: () => import(/* webpackChunkName: "pages_35bc95_index.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/pages/35bc95/index.html.js"), meta: {"title":"我的第一篇文章"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
  ["/pages/", { loader: () => import(/* webpackChunkName: "pages_index.html" */"C:/Users/USER/Desktop/githubpage/docs/.vuepress/.temp/pages/pages/index.html.js"), meta: {"title":"Pages"} }],
]);
