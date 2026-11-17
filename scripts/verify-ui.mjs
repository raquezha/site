import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9231;
const BASE_URL = process.env.SITE_URL || "http://localhost:4321";

// 1. Token-to-CSS parity check
const tokens = JSON.parse(fs.readFileSync(path.join(siteRoot, "tokens/raquezha-net.tokens.json"), "utf8"));
const css = fs.readFileSync(path.join(siteRoot, "public/site.css"), "utf8");

let tokenCount = 0;
function walkTokens(node) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$") || !v || typeof v !== "object") continue;
    if ("$value" in v) {
      const webVar = v.$extensions?.["com.nodesign"]?.codeSyntax?.WEB;
      if (webVar) {
        assert.ok(css.includes(`${webVar}:`), `Missing CSS token ${webVar} in public/site.css`);
        tokenCount++;
      }
    } else {
      walkTokens(v);
    }
  }
}
walkTokens(tokens);

// Relative luminance + WCAG contrast helper for rgb(r, g, b)
function parseRgb(str) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(str || "");
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function luminance([r, g, b]) {
  const toLin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}
function contrastRatio(rgbA, rgbB) {
  const l1 = luminance(rgbA);
  const l2 = luminance(rgbB);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Ensure dev server is reachable (or spawn one temporarily)
let devProc = null;
async function ensureServer() {
  try {
    const res = await fetch(BASE_URL);
    if (res.ok) return;
  } catch {}
  devProc = spawn("npm", ["run", "dev", "--", "--port", "4321"], { cwd: siteRoot, stdio: "ignore" });
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Dev server did not start at ${BASE_URL}`);
}

await ensureServer();

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--user-data-dir=/tmp/chrome-cdp-verify-ui",
  "about:blank",
]);

async function waitForPort() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (res.ok) return await res.json();
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Chrome CDP did not start");
}

try {
  const targets = await waitForPort();
  const pageTarget = targets.find((t) => t.type === "page");
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      const listener = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener("message", listener);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        }
      };
      ws.addEventListener("message", listener);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await send("Page.enable");
  await send("Runtime.enable");

  async function inspect(url, width, expression, mobile = false) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 2, mobile });
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 700));
    const res = await send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression,
    });
    return res?.result?.value;
  }

  // 2. Verify Home (1440px & 390px)
  for (const [w, mobile] of [[1440, false], [390, true]]) {
    const home = await inspect(`${BASE_URL}/`, w, `(() => {
      const h1 = document.querySelector('.homepage h1');
      const h1s = getComputedStyle(h1);
      const bodyS = getComputedStyle(document.body);
      const row = document.querySelector('.writing .title');
      const rowS = row ? getComputedStyle(row) : null;
      const footer = document.querySelector('.footer');
      const footerS = getComputedStyle(footer);
      const homeCat = document.querySelector('.home-cat')?.getBoundingClientRect();
      const footerCat = document.querySelector('.footer-cat')?.getBoundingClientRect();
      return {
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
        bodyBg: bodyS.backgroundColor,
        bodyColor: bodyS.color,
        fontFamily: bodyS.fontFamily,
        h1Size: h1s.fontSize,
        h1Lh: h1s.lineHeight,
        rowSize: rowS?.fontSize,
        rowLh: rowS?.lineHeight,
        footerSize: footerS.fontSize,
        footerLh: footerS.lineHeight,
        homeCat: homeCat ? { w: Math.round(homeCat.width), h: Math.round(homeCat.height) } : null,
        footerCat: footerCat ? { w: Math.round(footerCat.width), h: Math.round(footerCat.height) } : null,
      };
    })()`, mobile);

    assert.equal(home.overflowX, false, `Home horizontal overflow at ${w}px`);
    assert.equal(home.bodyBg, "rgb(253, 253, 252)", "Home background must match --surface-background (#fdfdfc)");
    assert.equal(home.bodyColor, "rgb(17, 17, 17)", "Home ink must match --content-primary (#111111)");
    assert.match(home.fontFamily, /Inter/i);
    assert.equal(home.h1Size, "16px");
    assert.equal(home.h1Lh, "24px");
    assert.equal(home.rowSize, "14px");
    assert.equal(home.rowLh, "17px");
    assert.equal(home.footerSize, "12px");
    assert.equal(home.footerLh, "18px");
    assert.deepEqual(home.homeCat, { w: 22, h: 14 });
    assert.deepEqual(home.footerCat, { w: 22, h: 12 });
  }

  // 3. Verify Kitchen-Sink Post (1440px & 390px)
  const postDesktop = await inspect(`${BASE_URL}/writing/_ui-kitchen-sink`, 1440, `(async () => {
    const post = document.querySelector('.post');
    const postS = getComputedStyle(post);
    const h1 = document.querySelector('.post > header h1');
    const h1S = getComputedStyle(h1);
    const icon = document.querySelector('.post-toc .back-icon')?.getBoundingClientRect();
    const tocTitle = document.querySelector('.post-toc-post-title');
    const topOpacity = getComputedStyle(tocTitle).opacity;

    const pre = document.querySelector('.article pre');
    const preS = getComputedStyle(pre);
    const code = document.querySelector('.article pre code');
    const codeS = getComputedStyle(code);
    const spans = Array.from(document.querySelectorAll('.article pre code span[style*="color"]')).slice(0, 12);
    const spanColors = spans.map((el) => getComputedStyle(el).color);

    const h2 = document.querySelector('#typography--inline-marks');
    h2?.scrollIntoView({ block: 'start' });
    await new Promise((r) => setTimeout(r, 250));
    const scrolledOpacity = getComputedStyle(tocTitle).opacity;

    const doodle = document.querySelector('.post-doodle')?.getBoundingClientRect();
    const table = document.querySelector('.article table');
    const mark = document.querySelector('.article mark');
    const figcaption = document.querySelector('.post figcaption');
    const figcaptionS = figcaption ? getComputedStyle(figcaption) : null;
    const video = document.querySelector('.post video');
    const videoS = video ? getComputedStyle(video) : null;
    const note = document.querySelector('.post .note');
    const noteS = note ? getComputedStyle(note) : null;
    const ack = document.querySelector('#acknowledgements');
    const postFooter = document.querySelector('.footer');
    const postFooterS = postFooter ? getComputedStyle(postFooter) : null;

    return {
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      postSize: postS.fontSize,
      postLh: postS.lineHeight,
      postColor: postS.color,
      h1Size: h1S.fontSize,
      h1Lh: h1S.lineHeight,
      icon: icon ? { w: Math.round(icon.width), h: Math.round(icon.height) } : null,
      topOpacity,
      scrolledOpacity,
      preOverflow: preS.overflow,
      preRadius: preS.borderRadius,
      preBg: preS.backgroundColor,
      codeOverflowX: codeS.overflowX,
      spanColors,
      doodleH: doodle ? Math.round(doodle.height) : null,
      hasTable: Boolean(table),
      hasMark: Boolean(mark),
      figcaptionSize: figcaptionS?.fontSize,
      figcaptionLh: figcaptionS?.lineHeight,
      videoRadius: videoS?.borderRadius,
      noteBg: noteS?.backgroundColor,
      hasAck: Boolean(ack),
      footerSize: postFooterS?.fontSize,
      footerLh: postFooterS?.lineHeight,
    };
  })()`);

  assert.equal(postDesktop.overflowX, false, "Post horizontal overflow at 1440px");
  assert.equal(postDesktop.postSize, "14px");
  assert.equal(postDesktop.postLh, "20px");
  assert.equal(postDesktop.postColor, "rgb(17, 17, 17)");
  assert.equal(postDesktop.h1Size, "14px");
  assert.equal(postDesktop.h1Lh, "20px");
  assert.deepEqual(postDesktop.icon, { w: 14, h: 14 });
  assert.equal(postDesktop.topOpacity, "0", "TOC post title must be hidden at top of page");
  assert.equal(postDesktop.scrolledOpacity, "1", "TOC post title must appear when scrolled past H1");
  assert.equal(postDesktop.preOverflow, "hidden");
  assert.equal(postDesktop.preRadius, "8px");
  assert.equal(postDesktop.preBg, "rgb(20, 20, 20)");
  assert.equal(postDesktop.codeOverflowX, "auto");
  assert.equal(postDesktop.doodleH, 28);
  assert.ok(postDesktop.hasTable && postDesktop.hasMark, "Kitchen sink must render table and marks");
  assert.equal(postDesktop.figcaptionSize, "12px");
  assert.equal(postDesktop.figcaptionLh, "16px");
  assert.equal(postDesktop.videoRadius, "6px");
  assert.equal(postDesktop.noteBg, "rgb(248, 248, 248)");
  assert.equal(postDesktop.hasAck, true, "Kitchen sink must render Acknowledgements heading");
  assert.equal(postDesktop.footerSize, "12px");
  assert.equal(postDesktop.footerLh, "18px");

  const bgRgb = parseRgb(postDesktop.preBg);
  assert.ok(postDesktop.spanColors.length > 0, "Expected Shiki syntax token spans");
  for (const c of postDesktop.spanColors) {
    const fgRgb = parseRgb(c);
    const ratio = contrastRatio(fgRgb, bgRgb);
    assert.ok(ratio >= 3.0, `Code token ${c} on ${postDesktop.preBg} has low contrast (${ratio.toFixed(2)})`);
  }

  const postMobileOverflow = await inspect(
    `${BASE_URL}/writing/_ui-kitchen-sink`,
    390,
    `document.documentElement.scrollWidth > window.innerWidth`,
    true
  );
  assert.equal(postMobileOverflow, false, "Post horizontal overflow at 390px");

  // 4. Verify Figma Screens (v2) Canonical Sample Fixture (Footnotes, Acknowledgements, Callout, Task checkboxes)
  const figmaSample = await inspect(`${BASE_URL}/writing/_figma-samples`, 1440, `(() => {
    const h2After = getComputedStyle(document.querySelector('.post h2'), '::after');
    const calloutS = getComputedStyle(document.querySelector('.post .callout'));
    const footnoteS = getComputedStyle(document.querySelector('.post .footnotes'));
    const footnoteRule = getComputedStyle(document.querySelector('.post .footnotes'), '::before');
    const ackH3 = getComputedStyle(document.querySelector('.post .acknowledgements h3'));
    const ackP = getComputedStyle(document.querySelector('.post .acknowledgements p'));
    const checkbox = document.querySelector('.post input[type="checkbox"]');
    return {
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      h2HasDivider: h2After.height === '1px' && h2After.backgroundColor === 'rgb(242, 242, 242)',
      calloutPad: calloutS.paddingTop,
      footnoteFont: footnoteS.fontSize,
      footnoteRuleWidth: footnoteRule.width,
      ackH3Size: ackH3.fontSize,
      ackPSize: ackP.fontSize,
      hasCheckbox: Boolean(checkbox),
    };
  })()`);

  assert.equal(figmaSample.overflowX, false, "Figma sample horizontal overflow at 1440px");
  assert.equal(figmaSample.h2HasDivider, true, "H2 must render 1px #f2f2f2 divider via ::after");
  assert.equal(figmaSample.calloutPad, "27px");
  assert.equal(figmaSample.footnoteFont, "11px");
  assert.equal(figmaSample.footnoteRuleWidth, "50px");
  assert.equal(figmaSample.ackH3Size, "11px");
  assert.equal(figmaSample.ackPSize, "11px");
  assert.equal(figmaSample.hasCheckbox, true, "Figma sample must render task checkboxes");

  ws.close();
  console.log(`site UI parity ok (${tokenCount} tokens, Home + Kitchen-Sink + Figma Samples 1440px/390px, contrast >= 3.0)`);
} finally {
  chrome.kill();
  if (devProc) devProc.kill();
}
