/* HAKON - belge ve broşür sayfaları: A4 görünüm + yazdırma
   Kullanım: sayfaya <script src="belge.js"></script> eklenir (klasör derinliğine göre ../ ile).
   Sayfadaki tüm görsel içeriği tek bir A4 sayfasına sığdırır, "A4 olarak yazdır" düğmesi koyar. */
(function () {
  var EN = /\/eng\//i.test(location.pathname);
  var LABEL = EN ? 'Print (A4)' : 'A4 olarak yazdır';
  // Yazdırılabilir alan: A4 - 8 mm kenar boşluğu = 194 x 281 mm (96 dpi'de px, 4 px pay bırakıldı)
  var PORT = { w: 733, h: 1058 };
  var LAND = { w: 1058, h: 729 };

  function start() {
    var body = document.body;
    if (!body || body.tagName !== 'BODY' || body.getAttribute('data-belge')) return;
    if (!body.getElementsByTagName('img').length) return;
    body.setAttribute('data-belge', '1');

    // 1) Mevcut içeriği bir kabın içine al ve gerçek boyutunu ölç
    var inner = document.createElement('div');
    inner.className = 'hk-inner';
    while (body.firstChild) inner.appendChild(body.firstChild);
    inner.style.cssText = 'position:absolute;left:0;top:0;';
    body.appendChild(inner);
    var w = inner.offsetWidth, h = inner.offsetHeight;
    if (!w || !h) {                       // ölçülemediyse sayfayı olduğu gibi bırak
      while (inner.firstChild) body.appendChild(inner.firstChild);
      body.removeChild(inner);
      return;
    }

    // 2) Yön (dikey/yatay) ve ölçek
    var land = w > h * 1.08;
    var P = land ? LAND : PORT;
    var s = Math.min(P.w / w, P.h / h);

    // 3) Stil
    var st = document.createElement('style');
    st.textContent =
      '@page{size:A4 ' + (land ? 'landscape' : 'portrait') + ';margin:8mm}' +
      'html,body{margin:0!important;padding:0!important;background:#e9ecef!important}' +
      '.hk-bar{position:fixed;top:0;left:0;right:0;height:44px;background:#0b2f5b;text-align:center;z-index:9;box-shadow:0 1px 4px rgba(0,0,0,.3)}' +
      '.hk-bar button{margin-top:8px;padding:6px 18px;font:bold 13px Arial,sans-serif;background:#fff;color:#0b2f5b;border:0;border-radius:4px;cursor:pointer}' +
      '.hk-wrap{padding:56px 0 16px;text-align:center}' +
      '.hk-sheet{position:relative;display:inline-block;overflow:hidden;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.35);text-align:left}' +
      '.hk-inner{transform-origin:0 0}' +
      '@media print{' +
        'html,body{background:#fff!important}' +
        '.hk-bar{display:none!important}' +
        '.hk-wrap{padding:0!important;zoom:1!important}' +
        '.hk-sheet{display:block;box-shadow:none!important;break-inside:avoid;page-break-inside:avoid}' +
      '}';
    document.getElementsByTagName('head')[0].appendChild(st);

    // 4) Yapı: [yazdır çubuğu] + [A4 sayfa [içerik]]
    var sheet = document.createElement('div');
    sheet.className = 'hk-sheet';
    sheet.style.width = P.w + 'px';
    sheet.style.height = P.h + 'px';
    inner.style.left = Math.round((P.w - w * s) / 2) + 'px';
    inner.style.top = Math.round((P.h - h * s) / 2) + 'px';
    inner.style.transform = 'scale(' + s + ')';
    inner.style.webkitTransform = 'scale(' + s + ')';
    body.removeChild(inner);
    sheet.appendChild(inner);

    var wrap = document.createElement('div');
    wrap.className = 'hk-wrap';
    wrap.appendChild(sheet);

    var bar = document.createElement('div');
    bar.className = 'hk-bar';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = LABEL;
    btn.onclick = function () { window.print(); };
    bar.appendChild(btn);

    body.appendChild(bar);
    body.appendChild(wrap);

    // 5) Ekranda pencereye sığdır (yazdırırken devre dışı)
    function fit() {
      var f = Math.min(1, (window.innerWidth - 20) / P.w);
      wrap.style.zoom = f > 0 ? f : 1;
    }
    fit();
    window.addEventListener('resize', fit);
  }

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
