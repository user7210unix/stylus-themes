// ==UserScript==
// @name         Endchan Image Hover
// @namespace    endchan-imagehover
// @version      2.0.0
// @description  Hover thumbnails to preview full images, follows cursor, respects viewport height. Works on LynxChan/8TailedLynx (endchan).
// @match        *://endchan.org/*
// @match        *://endchan.net/*
// @match        *://endchan.gg/*
// @match        *://magrathea.endchan.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ── config ──────────────────────────────────────────────────
  var OFFSET_X = 25;   // px gap right of cursor
  var MARGIN   = 6;    // min px from viewport edge
  // ────────────────────────────────────────────────────────────

  var preview  = null;   // the floating <img>
  var active   = null;   // current anchor element
  var mx = 0, my = 0;   // last mouse position (clientX/Y)

  // ── create preview element ──────────────────────────────────
  function makePreview() {
    var el = document.createElement('img');
    el.id  = 'ec-hover-preview';
    Object.assign(el.style, {
      position:       'fixed',
      zIndex:         '2147483647',
      display:        'none',
      pointerEvents:  'none',
      maxWidth:       'none',
      border:         'none',
      padding:        '0',
      margin:         '0',
      background:     'transparent',
    });
    document.body.appendChild(el);
    return el;
  }

  // ── work out display size and position ──────────────────────
  function reposition() {
    if (!preview || preview.style.display === 'none') return;

    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var nw = preview.naturalWidth  || 1;
    var nh = preview.naturalHeight || 1;

    // scale so it never exceeds viewport height
    var maxH  = vh - MARGIN * 2;
    var scale = nh > maxH ? maxH / nh : 1;
    // also never exceed ~90% of viewport width
    var maxW  = Math.round(vw * 0.9);
    if (nw * scale > maxW) scale = maxW / nw;

    var dw = Math.round(nw * scale);
    var dh = Math.round(nh * scale);

    preview.style.width  = dw + 'px';
    preview.style.height = dh + 'px';

    // horizontal: right of cursor; flip left if overflows
    var left = mx + OFFSET_X;
    if (left + dw + MARGIN > vw) left = mx - OFFSET_X - dw;
    if (left < MARGIN) left = MARGIN;

    // vertical: centred on cursor; clamp to viewport
    var top = my - Math.round(dh / 2);
    if (top < MARGIN) top = MARGIN;
    if (top + dh + MARGIN > vh) top = vh - dh - MARGIN;

    preview.style.left = left + 'px';
    preview.style.top  = top  + 'px';
  }

  // ── resolve full-size URL from an anchor ────────────────────
  // LynxChan/8TailedLynx: the <a href> IS already the full file URL.
  // Anchors of interest:
  //   .imgLink   (LynxChan default uploadCell structure)
  //   .linkThumb (8TailedLynx override)
  // Both point directly to the media file in their href.
  function fullUrl(anchor) {
    var href = anchor.href || '';
    // only handle image types we can <img> inline
    if (/\.(jpe?g|png|gif|webp|bmp|avif|jxl)(\?|#|$)/i.test(href)) {
      return href;
    }
    // fallback: strip the thumbnail prefix from the child img src
    // LynxChan thumb URLs: /.media/t_<hash>.<ext>  →  /.media/<hash>.<ext>
    var img = anchor.querySelector('img');
    if (img && img.src) {
      var src = img.src.replace(/\/t_([^/?#]+)$/, '/$1');
      if (/\.(jpe?g|png|gif|webp|bmp|avif|jxl)(\?|#|$)/i.test(src)) {
        return src;
      }
    }
    return null;
  }

  // ── check if element is (or is inside) a thumbnail anchor ───
  function thumbAnchor(el) {
    // walk up a few levels — the event target may be the img inside the link
    var node = el;
    for (var i = 0; i < 4; i++) {
      if (!node || node === document.body) break;
      if (node.tagName === 'A') {
        if (
          node.classList.contains('imgLink')   ||   // LynxChan standard
          node.classList.contains('linkThumb')       // 8TailedLynx
        ) return node;
        // generic fallback: any <a> directly wrapping only an <img>
        // with an image href inside .uploadCell
        var parent = node.closest
          ? node.closest('.uploadCell')
          : null;
        if (parent && /\.(jpe?g|png|gif|webp|bmp|avif|jxl)(\?|#|$)/i.test(node.href || '')) {
          return node;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  // ── hide ────────────────────────────────────────────────────
  function hide() {
    active = null;
    if (preview) {
      preview.style.display = 'none';
      preview.src = '';
    }
  }

  // ── events ──────────────────────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    if (active) reposition();
  }, { passive: true });

  document.addEventListener('mouseover', function (e) {
    var a = thumbAnchor(e.target);
    if (!a || a === active) return;

    var src = fullUrl(a);
    if (!src) return;

    active = a;
    if (!preview) preview = makePreview();

    preview.style.display = 'none';
    preview.src = src;

    // if already cached/complete, show immediately
    if (preview.complete && preview.naturalWidth > 0) {
      preview.style.display = 'block';
      reposition();
    }
  }, { passive: true });

  document.addEventListener('mouseout', function (e) {
    var a = thumbAnchor(e.target);
    if (a && a === active) hide();
  }, { passive: true });

  // show once the image has loaded (so naturalWidth is known)
  document.addEventListener('load', function (e) {
    if (e.target === preview && active) {
      preview.style.display = 'block';
      reposition();
    }
  }, true);

  // reposition on scroll (preview is fixed so it stays put otherwise)
  document.addEventListener('scroll', function () {
    if (active) reposition();
  }, { passive: true, capture: true });

})();