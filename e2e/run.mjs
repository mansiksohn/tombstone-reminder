/**
 * 전체 흐름을 한 번에 밟아보는 검사.
 *
 *   npm run e2e              빌드부터 다시
 *   npm run e2e -- --fast    이미 빌드돼 있으면 건너뛴다
 *
 * 랜딩 → 붙여넣기 → 문장 고르기 → 미리보기 → 게시 → 내 묘비 →
 * 쿠키를 비운 다른 방문자로 공개 묘비 방문 → 헌화 → 공유 카드.
 *
 * 왜 빌드부터 하는가: NEXT_PUBLIC_* 는 빌드 시점에 번들에 구워진다.
 * 스텁 주소를 넣어 빌드하지 않으면 앱이 진짜 Supabase를 부르고, 검사는
 * 엉뚱한 곳에서 실패한다. 실제로 한 번 여기에 속아 30분을 썼다.
 *
 * 크롬은 CHROME_PATH로 지정할 수 있다. 없으면 흔한 자리를 찾아본다.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as stub from './stub-supabase.mjs';

const STUB_PORT = Number(process.env.E2E_STUB_PORT || 4996);
const APP_PORT = Number(process.env.E2E_APP_PORT || 3400);
const CDP_PORT = Number(process.env.E2E_CDP_PORT || 9222);
const ROOT = path.join(import.meta.dirname, '..');
const FAST = process.argv.includes('--fast');

const ENV = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${STUB_PORT}`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'stub-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'stub-service-role-key',
};

const EULOGY = [
  '## 그 사람에 대하여',
  '',
  '- **새벽에 깨어 있는 사람**이었습니다.',
  '- 무언가를 오래 붙잡고 있었습니다.',
  '',
  '---',
  '',
  '1. 같은 질문을 여러 번 다르게 물었습니다.',
  '',
  '> "잘 살았다고 말해줄 수 있을까요?"',
  '',
  '마지막으로 물었던 것은 *그것*이었습니다.',
].join('\n');

const results = [];
function check(label, ok, detail = '') {
  results.push({ label, ok });
  const mark = ok ? '  [32m✓[0m' : '  [31m✗[0m';
  console.log(`${mark} ${label}${detail ? `  — ${detail}` : ''}`);
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];

  // Playwright가 받아둔 브라우저 (이 저장소의 원격 개발 환경 기본값)
  const pwRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (fs.existsSync(pwRoot)) {
    for (const dir of fs.readdirSync(pwRoot)) {
      if (!dir.startsWith('chromium')) continue;
      for (const rel of ['chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
        candidates.unshift(path.join(pwRoot, dir, rel));
      }
    }
  }

  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      '크롬을 찾지 못했습니다. CHROME_PATH에 실행 파일 경로를 지정해주세요.\n' +
        '  예: CHROME_PATH=/usr/bin/chromium npm run e2e',
    );
  }
  return found;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(label, probe, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (await probe()) return;
    } catch {
      // 아직 안 떴다.
    }
    await wait(400);
  }
  throw new Error(`${label}이(가) ${timeoutMs}ms 안에 준비되지 않았습니다.`);
}

/** CDP 세션. 페이지 하나를 붙잡고 명령을 주고받는다. */
async function connect() {
  const targets = await (await fetch(`http://localhost:${CDP_PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message.result);
      pending.delete(message.id);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const next = ++id;
      pending.set(next, resolve);
      ws.send(JSON.stringify({ id: next, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
  });

  return {
    send,
    close: () => ws.close(),
    async evaluate(expression) {
      const result = await send('Runtime.evaluate', {
        expression, awaitPromise: true, returnByValue: true,
      });
      return result?.result?.value;
    },
    async goto(url, settleMs = 2500) {
      await send('Page.navigate', { url });
      await wait(settleMs);
    },
  };
}

async function main() {
  const chrome = findChrome();
  const children = [];
  let stubServer;

  // npm start는 next를, next는 next-server를 낳는다. 부모만 죽이면
  // 손자가 포트를 붙잡은 채 남는다. detached로 띄워 프로세스 그룹을
  // 만들어두고, 그룹째(-pid) 신호를 보낸다.
  const cleanup = () => {
    for (const child of children) {
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* 이미 죽었다 */ }
    }
    try { stubServer?.close(); } catch { /* 위와 같다 */ }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(130); });

  if (!FAST) {
    console.log('\n빌드 중… (스텁 주소를 번들에 굽는다)');
    const build = spawnSync('npm', ['run', 'build'], { cwd: ROOT, env: ENV, stdio: 'inherit' });
    if (build.status !== 0) throw new Error('빌드 실패');
  } else if (!fs.existsSync(path.join(ROOT, '.next'))) {
    throw new Error('--fast를 쓰려면 먼저 한 번 빌드해야 합니다.');
  }

  // 앞선 실행이 덜 끝났거나 다른 것이 포트를 잡고 있으면, 여기서
  // 날것의 EADDRINUSE 스택이 뜨는 대신 무엇을 하면 되는지 말한다.
  try {
    stubServer = await stub.start(STUB_PORT);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      throw new Error(
        `${STUB_PORT} 포트를 이미 무언가 쓰고 있습니다.\n` +
          '  앞선 실행이 덜 끝났을 수 있습니다. 정리하거나 다른 포트를 쓰세요:\n' +
          `    E2E_STUB_PORT=4995 npm run e2e`,
      );
    }
    throw error;
  }
  console.log(`\n스텁 Supabase  http://127.0.0.1:${STUB_PORT}`);

  children.push(
    spawn('npm', ['start'], {
      cwd: ROOT,
      env: { ...ENV, PORT: String(APP_PORT) },
      stdio: 'ignore',
      detached: true,
    }),
  );
  await waitFor('앱', async () => (await fetch(`http://localhost:${APP_PORT}/`)).ok);
  console.log(`앱            http://localhost:${APP_PORT}`);

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-chrome-'));
  children.push(
    spawn(chrome, [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${profile}`,
      '--no-sandbox',
      '--disable-gpu',
      'about:blank',
    ], { stdio: 'ignore', detached: true }),
  );
  await waitFor('크롬', async () => (await fetch(`http://localhost:${CDP_PORT}/json/version`)).ok);
  console.log(`크롬          ${chrome}\n`);

  const page = await connect();
  const state = async () => (await fetch(`http://127.0.0.1:${STUB_PORT}/__state`)).json();
  const app = (p) => `http://localhost:${APP_PORT}${p}`;

  const setTextarea = (value) => page.evaluate(`(() => {
    const ta = document.querySelector('textarea');
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, ${JSON.stringify(value)});
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);

  const clickText = (selector, text) => page.evaluate(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
      .find((e) => e.textContent.trim().includes(${JSON.stringify(text)}));
    if (!el) return false;
    el.click();
    return true;
  })()`);

  await fetch(`http://127.0.0.1:${STUB_PORT}/__reset`);
  await page.send('Network.clearBrowserCookies');

  console.log('[1] 비로그인 랜딩');
  await page.goto(app('/'));
  check('랜딩이 뜬다', (await page.evaluate('location.pathname')) === '/');
  check('질문 카드가 있다', await page.evaluate(`!!document.querySelector('.prompt-card')`));
  check('AI 링크 3개', (await page.evaluate(`document.querySelectorAll('.model-link').length`)) === 3);
  check('로그인 링크가 있다', await page.evaluate(`!!document.querySelector('.landing-secondary-link')`));
  // 추도문은 공개 URL에 걸린다. 이 단락이 빠지면 모델이 실명·소속을 끌어올 수 있다.
  check('질문에 개인정보 제약이 있다',
    (await page.evaluate(`document.querySelector('.prompt-card').textContent`))
      .includes('개인정보는 절대 언급하지 마세요'));
  // 랜딩은 한 화면이다. CTA가 접히면 붙여넣기로 넘어가는 길이 안 보인다.
  check('CTA가 화면 안에 있다', await page.evaluate(
    `document.querySelector('.landing-cta').getBoundingClientRect().bottom <= innerHeight + 1`));

  console.log('\n[2] 붙여넣기 (마크다운 섞인 실제 LLM 답변 형태)');
  await page.goto(app('/new'));
  check('붙여넣기 단계로 시작',
    (await page.evaluate(`document.querySelector('.compose-lead').textContent`)).includes('붙여넣'));
  await setTextarea(EULOGY);
  await clickText('.source-chip', 'Claude');
  await wait(300);
  check('출처가 선택된다', await page.evaluate(`!!document.querySelector('.source-chip[aria-pressed="true"]')`));
  await clickText('.compose-actions button', '다음');
  await wait(800);

  console.log('\n[3] 문장 고르기');
  const cards = JSON.parse(await page.evaluate(
    `JSON.stringify([...document.querySelectorAll('.sentence-card')].map((b) => b.textContent))`));
  check('후보가 만들어진다', cards.length > 0, `${cards.length}개`);
  const dirty = cards.filter((s) => /^[#>\-*+]|^\d+[.)]\s|\*\*|__|~~/.test(s));
  check('마크다운이 남지 않는다', dirty.length === 0, dirty.length ? dirty.join(' / ') : '');
  check('컨트롤이 화면 안에 있다', await page.evaluate(
    `(() => { const r = document.querySelector('.compose-actions').getBoundingClientRect();
       return r.bottom <= innerHeight + 1; })()`));

  await page.evaluate(`document.querySelectorAll('.sentence-card')[0].click(), true`);
  await wait(300);
  await clickText('.compose-actions button', '다음');
  await wait(900);

  console.log('\n[4] 미리보기');
  check('미리보기 도달',
    (await page.evaluate(`document.querySelector('.compose-lead').textContent`)).includes('새겨집니다'));
  // '게시하기'만 보면 두 문구 모두 통과해 아무것도 확인하지 못한다.
  const loggedOutLabel = await page.evaluate(
    `[...document.querySelectorAll('.compose-actions button')].map((b) => b.textContent).join('|')`);
  check('비로그인이면 "로그인하고 게시하기"', loggedOutLabel.includes('로그인하고 게시하기'));

  console.log('\n[5] 로그인 후 게시');
  await page.send('Network.setCookie', {
    name: stub.COOKIE_NAME, value: stub.sessionCookie(), domain: 'localhost', path: '/',
  });
  await page.goto(app('/new'));
  await setTextarea(EULOGY);
  await clickText('.source-chip', 'Claude');
  await clickText('.compose-actions button', '다음');
  await wait(700);
  await page.evaluate(`document.querySelectorAll('.sentence-card')[0].click(), true`);
  await clickText('.compose-actions button', '다음');
  await wait(700);
  const loggedInLabel = await page.evaluate(
    `[...document.querySelectorAll('.compose-actions button')].map((b) => b.textContent).join('|')`);
  check('로그인이면 "게시하기"',
    loggedInLabel.includes('게시하기') && !loggedInLabel.includes('로그인하고'));
  await clickText('.compose-actions button', '게시');
  await wait(2500);

  const saved = (await state()).tomb;
  check('추도문이 저장된다', Boolean(saved.eulogy), `${(saved.eulogy || '').length}자`);
  check('각인이 저장된다', Boolean(saved.tomb_name), saved.tomb_name || '');
  check('출처가 저장된다', saved.eulogy_source === 'claude', String(saved.eulogy_source));
  check('게시 상태가 된다', saved.status === 'published', saved.status);
  // 게시가 끝나면 완료 화면이 아니라 내 묘비로 간다. 손으로 옮겨가지
  // 않고 그대로 확인하는 것이 중요하다 — 자동으로 넘어가는지를 보는 것이다.
  check('게시하면 내 묘비로 넘어간다', (await page.evaluate('location.pathname')) === '/me');
  check('넘어간 화면에 방금 새긴 각인이 있다',
    (await page.evaluate(`document.querySelector('.tombstone-name')?.textContent ?? ''`))
      .includes(saved.tomb_name));
  check('넘어간 화면에 공유 링크가 있다',
    Boolean(await page.evaluate(`document.querySelector('.share-url')?.textContent`)));

  console.log('\n[6] 로그인 사용자의 홈');
  await page.goto(app('/'));
  check('홈이 내 묘비다', (await page.evaluate('location.pathname')) === '/me');
  check('각인이 묘비에 보인다',
    (await page.evaluate(`document.querySelector('.tombstone-name')?.textContent ?? ''`)).length > 0);

  console.log('\n[7] 다른 방문자의 헌화');
  await page.send('Network.clearBrowserCookies');
  await page.goto(app(`/t/${saved.slug}`));
  check('공개 묘비가 열린다', (await page.evaluate('location.pathname')) === `/t/${saved.slug}`);
  const shownEulogy = await page.evaluate(
    `document.querySelector('.eulogy-body')?.textContent ?? ''`);
  check('추도문이 보인다', shownEulogy.length > 0, `${shownEulogy.length}자`);

  // 저장은 원문 그대로, 보여줄 때만 장식을 벗긴다. 붙여넣은 추도문에는
  // 일부러 마크다운을 섞어뒀으므로 여기서 회귀가 잡힌다.
  const leftover = /(^|\n)\s*(#{1,6}\s|[-*+]\s|>\s|\d+[.)]\s)|\*\*|__|~~/;
  check('추도문에 마크다운이 보이지 않는다', !leftover.test(shownEulogy),
    shownEulogy.slice(0, 40).replace(/\n/g, '⏎'));
  check('저장된 원문은 그대로다', (await state()).tomb.eulogy.includes('## 그 사람에 대하여'));
  const before = (await state()).flowers.length;
  await page.evaluate(`document.querySelector('.add-flower-button')?.click(), true`);
  await wait(2000);
  const after = (await state()).flowers;
  check('헌화가 저장된다', after.length === before + 1, `${before} → ${after.length}`);
  check('방문자 해시가 원문이 아니다',
    after.length > 0 && /^[0-9a-f]{64}$/.test(after.at(-1).visitor_hash || ''));

  console.log('\n[8] 공유 카드');
  const card = await (await fetch(app(`/t/${saved.slug}/opengraph-image`))).arrayBuffer();
  check('OG 이미지가 생성된다', card.byteLength > 10_000, `${Math.round(card.byteLength / 1024)}KB`);
  const html = await (await fetch(app(`/t/${saved.slug}`))).text();
  check('og:image가 이 묘비를 가리킨다', html.includes(`/t/${saved.slug}/opengraph-image`));

  page.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n통과 ${results.length - failed.length} / ${results.length}`);
  if (failed.length) {
    console.log('\n실패:');
    failed.forEach((r) => console.log(`  ✗ ${r.label}`));
  }
  cleanup();
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error('\n구동 실패:', error.message);
  process.exit(2);
});
