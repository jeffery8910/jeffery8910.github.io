/* scripts/inject-opencc-toggle.js
 * 將「繁／簡切換」按鈕與 opencc-js 注入到所有輸出的 HTML（</body> 前）
 */
hexo.extend.filter.register('after_render:html', function (html) {
  const BTN_HTML = `
  <style>
    #ocToggle {
      position: fixed; right: 16px; bottom: 16px; z-index: 99999;
      padding: 10px 14px; border-radius: 9999px; border: 1px solid rgba(0,0,0,.15);
      background: rgba(255,255,255,.9); backdrop-filter: blur(6px);
      font-size: 14px; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.08);
    }
    #ocToggle:hover { box-shadow: 0 8px 22px rgba(0,0,0,.13); }
  </style>
  <button id="ocToggle" aria-label="切換繁/簡">切換</button>
  <script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js"></script>
  <script>
    (function () {
      function ready(fn){ if(document.readyState!=='loading'){fn()} else {document.addEventListener('DOMContentLoaded', fn)}}
      function init() {
        var html = document.documentElement;
        var lang = (html.getAttribute('lang') || 'zh-TW').toLowerCase();
        var isTW = /tw|hant/.test(lang);
        // 原始頁面為繁體（建置後即為繁）→ 轉簡體；否則相反
        var from = isTW ? 'twp' : 'cn';
        var to   = isTW ? 'cn'  : 'twp';
        var fromTag = isTW ? 'zh-TW' : 'zh-CN';
        var toTag   = isTW ? 'zh-CN' : 'zh-TW';

        var conv = OpenCC.Converter({ from: from, to: to });
        var handler = OpenCC.HTMLConverter(conv, document.documentElement, fromTag, toTag);
        var converted = false;
        var btn = document.getElementById('ocToggle');
        btn.textContent = isTW ? '简体' : '繁體';

        btn.addEventListener('click', function(){
          if (!converted) {
            handler.convert(); converted = true;
            btn.textContent = isTW ? '繁體' : '简体';
          } else {
            handler.restore(); converted = false;
            btn.textContent = isTW ? '简体' : '繁體';
          }
        });
      }
      function waitOpenCC(){
        if (window.OpenCC && OpenCC.Converter) { ready(init); }
        else { setTimeout(waitOpenCC, 50); }
      }
      waitOpenCC();
    })();
  </script>
  `;

  // 安全注入到 </body> 前；若找不到，就附加在文末
  if (html.includes('</body>')) {
    return html.replace('</body>', BTN_HTML + '\n</body>');
  } else {
    return html + BTN_HTML;
  }
});
