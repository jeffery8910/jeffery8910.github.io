#!/usr/bin/env sh

# 當發生錯誤時中止腳本
set -e

# 建置
npm run build

# 進入建置輸出目錄
cd docs/.vuepress/dist

# 如果是部署到自定義域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 部署到 https://<USERNAME>.github.io
# 注意：這裡的 main 是指目標儲存庫的分支名稱
git push -f git@github.com:jeffery8910/jeffery8910.github.io.git main

cd -
