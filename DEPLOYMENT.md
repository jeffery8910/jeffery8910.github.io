# 網站部署指南

本文件說明如何使用 `deploy.sh` 腳本將您的 VuePress 網站部署到 GitHub Pages。

## 部署流程概述

您的網站是透過 VuePress 建置的，最終會產生靜態檔案。這些靜態檔案需要被推送到您的 GitHub Pages 儲存庫 (`jeffery8910.github.io`) 的 `main` 分支，以便 GitHub Pages 能夠正確顯示您的網站。

`deploy.sh` 腳本自動化了這個過程。

## 使用 `deploy.sh` 腳本

### 1. 確保 SSH Key 設定正確

`deploy.sh` 腳本使用 SSH 方式 (`git@github.com:...`) 來推送程式碼。這要求您已經在您的電腦上設定好 SSH Key，並且將其添加到您的 GitHub 帳戶中。

如果您尚未設定，請參考 GitHub 官方文件：[Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)。

### 2. 確保本地 `main` 分支與遠端同步

在執行部署之前，請確保您本地的 `main` 分支是最新的，並且與遠端儲存庫的 `main` 分支保持一致。

在您的專案根目錄下執行以下指令：

```bash
git fetch origin main
git checkout main
git pull origin main
```

如果您的本地沒有 `main` 分支，或者您想將當前分支重新命名為 `main`，可以使用：

```bash
git branch -M main
```

### 3. 執行部署腳本

每次您想要部署網站時，只需要在您的專案根目錄下（`C:\Users\USER\Desktop\githubpage\`）執行 `deploy.sh` 腳本：

```bash
./deploy.sh
```

**腳本執行步驟：**

1.  **建置網站**：執行 `npm run build`，VuePress 會將您的 Markdown 內容轉換為靜態 HTML、CSS 和 JavaScript 檔案，並將它們輸出到 `docs/.vuepress/dist` 資料夾。
2.  **進入建置目錄**：腳本會進入 `docs/.vuepress/dist` 資料夾。
3.  **初始化 Git 儲存庫**：在 `dist` 資料夾內初始化一個新的 Git 儲存庫。這是因為您只需要將 `dist` 資料夾的內容推送到 GitHub Pages。
4.  **提交變更**：將 `dist` 資料夾內的所有檔案添加到 Git 並提交。
5.  **強制推送**：將 `dist` 資料夾的內容強制推送到 `https://github.com/jeffery8910/jeffery8910.github.io.git` 儲存庫的 `main` 分支。

### 4. 檢查部署結果

部署完成後，稍等幾分鐘，您的網站應該就可以透過 `https://jeffery8910.github.io` 訪問了。

## 本地開發與建置

### 生成 `dist` 資料夾 (建置網站)

在您的專案根目錄下執行以下指令，將您的 VuePress 網站建置成靜態檔案。這些檔案會被輸出到 `docs/.vuepress/dist` 資料夾。

```bash
npm run build
```

### 開啟本地開發伺服器

在您的專案根目錄下執行以下指令，啟動一個本地開發伺服器。您可以在瀏覽器中即時預覽您的網站，通常會在 `http://localhost:8080` 或類似的位址。

```bash
npm run dev
```