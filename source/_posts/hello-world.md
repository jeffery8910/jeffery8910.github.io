---
title: 匿名化作品集總覽：教學工程、AI 協作與即時學習系統
date: 2026-05-11 16:30:00
categories:
  - portfolio
tags:
  - EdTech
  - RAG
  - Codex
  - Scratch
  - Realtime
  - Deployment
---

這個網站整理的是一組去識別化的專案經驗：重點放在「我解決過什麼問題、如何設計系統、如何把教學需求轉成可維護的技術流程」，而不是公開個人身分資訊。

為了保護隱私，本站不放真實姓名、學校、班級、學生資料、個人照片、私人聯絡方式或可反推身分的細節。以下內容以匿名作品集方式呈現。

## 作品集主軸

### 1. 教學工程與 Scratch 課程設計

將國中資訊科技課程中的變數、列表、主程式、副程式等概念，整理成可視覺化、可操作、可逐步練習的教材。重點不是只講語法，而是把學生能理解的遊戲任務拆成可執行流程：

- 用任務卡引導學生理解程式邏輯。
- 把抽象概念轉成圖卡、流程圖與範例專案。
- 用出口檢核與作品歷程觀察學生是否真正理解。

### 2. RAG、Codex 與 AI 協作工作流

整理一套人機協作流程：先用文件、課程規則與專案目標建立上下文，再讓 AI 協助產生程式、測試、部署與教學素材。重點是讓 AI 受規則約束，而不是任意產生結果。

核心做法包含：

- 使用 Markdown / AGENTS.md 描述專案規則與任務邊界。
- 將教學需求轉成可執行的 coding task。
- 以 Pull Request、commit、diff review 保留修改脈絡。
- 對產出內容進行人工審查與去識別化。

### 3. 即時作業繳交與學習狀態看板

設計教室場景中的作業繳交系統：學生可提交作品，教師可即時查看完成狀態、缺交狀態與歷史紀錄。這類系統需要同時考慮前端體驗、資料模型、權限、部署成本與備援設計。

常見技術規劃包含：

- 靜態前端部署：GitHub Pages、Cloudflare Pages、Netlify。
- 後端與資料：Supabase、Firebase、Cloudflare D1、PostgreSQL。
- 即時同步：Realtime Database、WebSocket、Durable Objects 或第三方 realtime provider。
- 隱私設計：最小化收集資料，只保留教學必要欄位。

### 4. Open Generative UI 與精確數學視覺化

針對數學教育與生成式介面，採用「AI 產生受控規格，確定性引擎負責計算與繪圖」的設計。這可以降低 AI 直接畫錯圖、算錯排列組合或錯誤呈現機率問題的風險。

設計原則：

- AI 不直接輸出最終圖表。
- AI 只輸出 MathSpec、graph schema 或 step schema。
- deterministic engine 驗算數值。
- 前端 renderer 根據已驗證資料畫圖。

## 技術能力摘要

- Frontend：React、Vite、Markdown-first site、Hexo / Astro 類靜態站規劃。
- Backend：Express、FastAPI、Axum、REST API、Webhook 設計。
- Database：MongoDB、PostgreSQL、Supabase、Cloudflare D1。
- AI Workflow：RAG、prompt engineering、Codex-style agent workflow、AGENTS.md 專案規則。
- Deployment：GitHub Pages、Vercel、Render、Cloudflare Pages、GitHub Actions。
- Teaching Design：Scratch 課程、遊戲化任務、學習歷程、出口檢核、作品評量。

## 隱私處理原則

本站所有案例都採用匿名化描述：

1. 不公開個人真實姓名與可聯絡資訊。
2. 不公開學生姓名、班級、座號、帳號與作品原始資料。
3. 不公開內部系統截圖中可能含有個資的內容。
4. 專案說明只保留技術設計、教學方法與可公開的成果摘要。
5. 所有資料以「可被公開閱讀」為預設標準。

## 目前可閱讀的專案文章

- Scratch 教學工程：把程式概念變成可操作任務
- RAG 與 Codex 協作：從文件到可維護專案
- 即時作業繳交系統：教室場景的 realtime 架構
- 精確生成式 UI：讓 AI 產生規格而不是直接產生答案

這個網站會持續整理為一份公開、可維護、低個資風險的技術作品集。
