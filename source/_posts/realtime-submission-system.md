---
title: 即時作業繳交系統：教室場景的 Realtime 架構
date: 2026-05-11 17:00:00
categories:
  - portfolio
tags:
  - Realtime
  - Classroom
  - Submission Tracker
  - Database
  - Deployment
---

這個專案聚焦在教室作業繳交場景：學生提交作品後，教師需要即時知道誰已完成、誰尚未完成、哪些資料需要補交，以及系統是否能在低成本條件下穩定運作。

## 需求拆解

教室現場的作業繳交系統，不只是表單。它需要同時處理：

- 學生提交狀態。
- 教師即時看板。
- 歷史紀錄查詢。
- 補交與重新提交。
- 權限與資料最小化。
- 免費或低成本部署。
- 網路不穩時的備援規劃。

## 系統設計方向

### 1. 前端

前端可以採用靜態部署，降低維護成本：

- GitHub Pages。
- Cloudflare Pages。
- Netlify。
- Vercel。

前端負責表單、看板、狀態顯示與登入後的資料呈現。

### 2. 後端與資料庫

依照部署限制，可以選擇不同方案：

- Supabase：PostgreSQL、Auth、Realtime。
- Firebase：Authentication、Firestore、Realtime Database。
- Cloudflare：Pages、Workers、D1、Durable Objects。
- Render / Railway：自架 API server 與資料庫連線。

### 3. 即時同步

即時功能可以用：

- Realtime Database。
- WebSocket。
- Server-Sent Events。
- 第三方 realtime provider。
- Cloudflare Durable Objects。

實作重點不是追求複雜，而是讓教師看板能在合理時間內反映提交狀態。

## 資料最小化

為了保護隱私，作業繳交系統應該只保存教學必要欄位，例如：

- 匿名代號。
- 任務名稱。
- 提交時間。
- 完成狀態。
- 作品連結或檔案指標。
- 教師備註。

不應該在公開展示中出現學生姓名、班級、座號、私人信箱或完整原始資料。

## 可展示的技術亮點

- Realtime submission dashboard。
- Role-based view：學生端與教師端分開。
- GitHub Actions / Pages 自動部署。
- API route / serverless function 串接資料庫。
- Mirror / fallback 思維：主系統不可用時，保留備援讀寫策略。
- 以教室流量估算免費額度與架構成本。

## 收穫

這類系統的價值不只在技術，而是在把教學現場的混亂資訊變成可觀察、可追蹤、可改善的資料流。作品集呈現時，最重要的是說明架構思維與隱私設計，而不是公開真實班級資料。
