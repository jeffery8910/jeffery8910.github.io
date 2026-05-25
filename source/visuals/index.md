---
title: Visual Components
date: 2026-05-12 11:55:00
---

<style>
.vc-wrap{--bg:#071b36;--card:#0e2a4e;--gold:#f1b84b;--text:#eaf2ff;--muted:rgba(234,242,255,.72);color:var(--text)}
.vc-hero{padding:2rem;border-radius:28px;background:radial-gradient(circle at 85% 20%,rgba(241,184,75,.24),transparent 18rem),linear-gradient(135deg,#071b36,#113a73);box-shadow:0 24px 60px rgba(4,15,35,.22);margin:1.5rem 0 2rem}
.vc-hero h2{font-size:clamp(2rem,4vw,3.4rem);line-height:1.08;margin:0 0 .75rem}.vc-hero p{max-width:820px;color:var(--muted);line-height:1.9}
.vc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:1rem;margin:1.5rem 0 2rem}.vc-card{min-height:230px;padding:1.2rem;border-radius:24px;background:radial-gradient(circle at 80% 15%,rgba(241,184,75,.18),transparent 8rem),linear-gradient(145deg,#071b36,#113a73);border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 42px rgba(5,18,42,.15);position:relative;overflow:hidden}.vc-card:after{content:"";position:absolute;left:-20%;right:-20%;bottom:22%;height:70px;background:linear-gradient(90deg,transparent,rgba(241,184,75,.24),rgba(80,157,255,.18),transparent);transform:rotate(-8deg)}.vc-card h3{margin:.3rem 0 .55rem;font-size:1.15rem}.vc-card p{margin:0;color:var(--muted);line-height:1.75;font-size:.92rem}.vc-avatar{width:84px;height:84px;border-radius:28px;background:linear-gradient(145deg,#ffd7aa,#ffb36c);box-shadow:inset 0 -8px 16px rgba(122,65,18,.16),0 16px 34px rgba(0,0,0,.22);position:relative;margin:.4rem 0 .9rem}.vc-avatar:before{content:"";position:absolute;left:18px;top:13px;width:50px;height:23px;border-radius:50% 50% 40% 40%;background:#151923}.vc-avatar:after{content:"●  ●";position:absolute;left:20px;top:39px;color:#141a24;letter-spacing:15px;font-size:10px}.vc-smile{position:absolute;left:32px;top:57px;width:22px;height:10px;border-bottom:3px solid #6d391c;border-radius:0 0 20px 20px}.vc-badges{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.8rem}.vc-badge{font-size:.78rem;padding:.32rem .58rem;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.13);color:var(--muted)}.vc-flow{display:grid;gap:.48rem;margin-top:.9rem}.vc-flow div{padding:.5rem .66rem;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:.86rem}.vc-math{margin-top:.9rem;padding:.85rem;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#f4c86b}.vc-note{color:#5f6b7c;line-height:1.8}
</style>

<div class="vc-wrap">
  <section class="vc-hero">
    <h2>網頁元件提案</h2>
    <p>這裡整理 10 個可以放進 Jeffery Liu 作品集網站的視覺元件。方向是親切、擬人化、教育科技、深藍加暖金，不走冰冷模板感，讓網站更像一個真的在教學、寫程式、做平台的人。</p>
  </section>

  <div class="vc-grid">
    <article class="vc-card"><div class="vc-avatar"><span class="vc-smile"></span></div><h3>1. 首頁 Hero</h3><p>用胖胖可愛的亞洲男生角色作為首頁主視覺，搭配筆電、筆記本和浮動 UI。</p><div class="vc-badges"><span class="vc-badge">Home</span><span class="vc-badge">Persona</span></div></article>
    <article class="vc-card"><div class="vc-avatar"><span class="vc-smile"></span></div><h3>2. 關於我卡片</h3><p>適合放在 About 頁，呈現溫暖、可以聊天、願意一步一步教人的感覺。</p><div class="vc-badges"><span class="vc-badge">About</span><span class="vc-badge">Human</span></div></article>
    <article class="vc-card"><h3>3. Codex 教學流程</h3><p>把 Codex 課程設計成可以被看懂的流程，而不是只放工具名稱。</p><div class="vc-flow"><div>Prompt → Plan</div><div>Code → Test</div><div>Review → Iterate</div></div></article>
    <article class="vc-card"><h3>4. 數學平台區塊</h3><p>給高中數學教學平台使用，強調圖形、解題步驟與可驗證計算。</p><div class="vc-math">f(x)=ax²+bx+c<br>read → solve → check</div></article>
    <article class="vc-card"><h3>5. Projects 展示卡</h3><p>用卡片整理作品，讓訪客快速看到每個專案解決什麼問題。</p><div class="vc-badges"><span class="vc-badge">Math</span><span class="vc-badge">RAG</span><span class="vc-badge">Realtime</span></div></article>
    <article class="vc-card"><h3>6. 學習儀表板</h3><p>適合作業繳交與學習狀態頁，呈現完成率、待協助、提交狀態。</p><div class="vc-flow"><div>78% completed</div><div>12 submitted</div><div>4 need help</div></div></article>
    <article class="vc-card"><h3>7. Scratch 教學元件</h3><p>用遊戲化視覺語言呈現 Scratch、任務卡與初學者程式教育。</p><div class="vc-flow"><div>when clicked</div><div>move 10 steps</div><div>repeat 4</div></div></article>
    <article class="vc-card"><h3>8. RAG 文件工作流</h3><p>呈現文件、檢索、增強、回答與來源，可放在技術文章開頭。</p><div class="vc-flow"><div>Ingest docs</div><div>Retrieve context</div><div>Generate with sources</div></div></article>
    <article class="vc-card"><h3>9. 分享會區塊</h3><p>適合放分享會與 workshop 文章，讓網站保留人的互動感。</p><div class="vc-badges"><span class="vc-badge">Workshop</span><span class="vc-badge">Community</span></div></article>
    <article class="vc-card"><h3>10. 聯絡頁尾</h3><p>用輕鬆方式收尾，邀請讀者看作品、交流想法或追蹤專案更新。</p><div class="vc-badges"><span class="vc-badge">Footer</span><span class="vc-badge">Connect</span></div></article>
  </div>
</div>

這一頁目前先用 CSS 元件呈現，之後可以再把前面生成的圖片壓縮後放進 `/images/`，變成首頁 Hero 或文章封面。
