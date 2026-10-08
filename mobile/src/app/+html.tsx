import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * TEMPORARY: web HTML shell for capturing the app's screens into Figma.
 * Loads Figma's html-to-design capture script and, when the URL carries a
 * capture (or #phone), pins the page to a 412 × 926 phone viewport (the Figma
 * file's "Android Compact" frame) so layouts render as on a phone even in a
 * wide desktop window. Remove once the captures are done.
 */
const PHONE_VIEWPORT = `
(function () {
  if (!/figmacapture|phone/.test(location.hash)) return;
  var W = 412, H = 926;
  // Chrome pauses animation frames while the window is hidden (e.g. behind Figma), which stalls
  // the capture; fall back to timers, which keep running (throttled) in the background.
  var nativeRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) {
    if (document.visibilityState === 'visible') return nativeRaf(cb);
    return setTimeout(function () { cb(performance.now()); }, 16);
  };
  window.cancelAnimationFrame = (function (nativeCancel) {
    return function (id) { nativeCancel(id); clearTimeout(id); };
  })(window.cancelAnimationFrame.bind(window));
  try {
    var proto = Object.getPrototypeOf(window.visualViewport);
    Object.defineProperty(proto, 'width', { get: function () { return W; } });
    Object.defineProperty(proto, 'height', { get: function () { return H; } });
    Object.defineProperty(proto, 'scale', { get: function () { return 1; } });
  } catch (e) {}
  var style = document.createElement('style');
  style.textContent = 'html, body { width: ' + W + 'px !important; height: ' + H + 'px !important; overflow: hidden !important; }'
    + ' #root { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; transform: translateZ(0); }';
  document.head.appendChild(style);

  // The app registers each weight as its own family ("InterDisplay-SemiBold"). Re-register
  // them as one "Inter Display" family with weights and point all text at it, so captured
  // Figma text uses the same font names as the file's existing screens.
  var WEIGHTS = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };
  var facesAdded = false;
  function aliasFonts(keepScroll) {
    var css = '';
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules;
      try { rules = document.styleSheets[i].cssRules; } catch (e) { continue; }
      for (var j = 0; j < rules.length; j++) {
        var r = rules[j];
        if (!r.style || !/font-face/i.test(r.cssText)) continue;
        var m = /InterDisplay-(Regular|Medium|SemiBold|Bold)/.exec(r.style.getPropertyValue('font-family'));
        if (m) css += '@font-face{font-family:"Inter Display";font-weight:' + WEIGHTS[m[1]] + ';src:' + r.style.getPropertyValue('src') + ';}';
      }
    }
    if (!facesAdded && css) {
      var faces = document.createElement('style');
      faces.textContent = css;
      document.head.appendChild(faces);
      facesAdded = true;
    }
    var all = document.querySelectorAll('#root *');
    for (var k = 0; k < all.length; k++) {
      var el = all[k];
      var family = getComputedStyle(el).fontFamily;
      var w = /InterDisplay-(Regular|Medium|SemiBold|Bold)/.exec(family);
      el.style.fontFamily = '"Inter Display"';
      el.style.fontWeight = w ? String(WEIGHTS[w[1]]) : (getComputedStyle(el).fontWeight || '400');
    }
    // Capture every page at its top (e.g. a lazy list can scroll itself while loading rows);
    // scrolling back also brings the navigation bar back.
    if (!keepScroll) {
      // Web focus can land on a row's menu button and scroll it into view; clear it first.
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      for (var q = 0; q < all.length; q++) {
        if (all[q].scrollTop > 0) all[q].scrollTop = 0;
        if (all[q].scrollLeft > 0) all[q].scrollLeft = 0;
      }
    }
    // The capture misreads percentage flex-basis (e.g. Overview's 4-up Quick actions grid);
    // pin those elements to their rendered pixel width.
    for (var p = 0; p < all.length; p++) {
      var node = all[p];
      // flex: 1 compiles to a 0% basis; only real percentage widths need pinning.
      var basis = getComputedStyle(node).flexBasis;
      if (/%$/.test(basis) && parseFloat(basis) > 0) {
        var width = node.getBoundingClientRect().width;
        node.style.flexBasis = width + 'px';
        node.style.flexGrow = '0';
        node.style.flexShrink = '0';
      }
    }
  }
  // Manual captures: set the page up (tabs, sheets, scroll), then call
  // __captureRoot(captureId, keepScroll) to prepare it and send it to Figma.
  window.__captureRoot = function (captureId, keepScroll) {
    aliasFonts(keepScroll);
    // Let the app redraw after the scroll reset (collapsing header, navigation bar) first.
    return new Promise(function (resolve) { setTimeout(resolve, 1200); }).then(function () {
      aliasFonts(true);
      return window.figma.captureForDesign({
        captureId: captureId,
        endpoint: 'https://mcp.figma.com/mcp/capture/' + captureId + '/submit?bindVariables=true',
        selector: '#root',
      });
    });
  };
  // Presses the nth control with the given label (tabs, buttons, chips) to set a page up for capture.
  window.__clickText = function (text, nth) {
    var leaves = Array.prototype.filter.call(document.querySelectorAll('#root *'), function (e) {
      return e.childElementCount === 0 && e.textContent.trim() === text;
    });
    var el = leaves[nth || 0];
    if (!el) return 'missing: ' + text;
    var c = el;
    while (c && c.id !== 'root' && !(['button', 'tab', 'radio', 'link', 'checkbox', 'menuitem', 'switch'].indexOf(c.getAttribute('role')) >= 0 || c.tagName === 'BUTTON' || c.tabIndex >= 0)) c = c.parentElement;
    (c && c.id !== 'root' ? c : el).click();
    return 'clicked ' + text;
  };
  // Hash-triggered captures run on a timer; routes are bundled on first visit in
  // development, so re-apply as late content renders.
  if (/figmacapture/.test(location.hash)) {
    window.addEventListener('load', function () { [1500, 3500, 6000, 8500].forEach(function (t) { setTimeout(function () { aliasFonts(false); }, t); }); });
  }
})();
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover: the page reaches the screen edges and reads the safe-area insets (iPhone home bar). */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <ScrollViewStyleReset />
        {/* Size the app to the visible screen (dvh), not 100vh, which on phone browsers includes the area under the
            browser's toolbar — that hid the bottom navigation bar. */}
        <style dangerouslySetInnerHTML={{ __html: 'html, body { height: 100%; } body, #root { height: 100vh; height: 100dvh; }' }} />
        {process.env.NODE_ENV === 'development' ? (
          <>
            <script dangerouslySetInnerHTML={{ __html: PHONE_VIEWPORT }} />
            <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
          </>
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
