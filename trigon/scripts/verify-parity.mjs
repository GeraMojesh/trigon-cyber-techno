import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8765/';

const expectedBackgrounds = {
  '#hero': 'rgb(17, 24, 39)',
  '#about': 'rgb(15, 23, 42)',
  '#services': 'rgb(17, 24, 39)',
  '#team': 'rgb(15, 23, 42)',
  '#projects': 'rgb(17, 24, 39)',
  '#dashboard': 'rgb(8, 12, 20)',
  '#contact': 'rgb(11, 17, 32)',
  'footer#footer': 'rgb(11, 17, 32)',
};

function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return rgb;
  return (
    '#' +
    [m[1], m[2], m[3]]
      .map((n) => Number(n).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

const failures = [];
const passes = [];

function pass(msg) {
  passes.push(msg);
  console.log('PASS:', msg);
}

function fail(msg) {
  failures.push(msg);
  console.error('FAIL:', msg);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

  for (const [selector, expected] of Object.entries(expectedBackgrounds)) {
    const el = await page.$(selector);
    if (!el) {
      fail(`Missing element: ${selector}`);
      continue;
    }
    const bg = await el.evaluate((node) => getComputedStyle(node).backgroundColor);
    if (bg === expected) {
      pass(`${selector} background ${bg} (${rgbToHex(bg)})`);
    } else {
      fail(`${selector} expected ${expected}, got ${bg} (${rgbToHex(bg)})`);
    }
  }

  const heroMetrics = await page.evaluate(() => {
    const hero = document.querySelector('#hero') || document.querySelector('.hero-section');
    const canvas = document.querySelector('#cyber-bg');
    if (!hero || !canvas) return { error: 'missing hero or canvas' };

    const heroRect = hero.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    return {
      heroW: hero.clientWidth,
      heroH: hero.clientHeight,
      canvasW: canvas.width,
      canvasH: canvas.height,
      canvasAttrW: canvas.getAttribute('width'),
      canvasAttrH: canvas.getAttribute('height'),
      canvasLeft: canvasRect.left,
      canvasTop: canvasRect.top,
      canvasRight: canvasRect.right,
      canvasBottom: canvasRect.bottom,
      heroLeft: heroRect.left,
      heroTop: heroRect.top,
      heroRight: heroRect.right,
      heroBottom: heroRect.bottom,
    };
  });

  if (heroMetrics.error) {
    fail(heroMetrics.error);
  } else {
    const { heroW, heroH, canvasW, canvasH, canvasLeft, canvasTop, canvasRight, canvasBottom, heroLeft, heroTop, heroRight, heroBottom } = heroMetrics;

    if (canvasW === heroW && canvasH === heroH) {
      pass(`Canvas buffer matches hero: ${canvasW}x${canvasH}`);
    } else {
      fail(`Canvas buffer ${canvasW}x${canvasH} vs hero ${heroW}x${heroH}`);
    }

    const tol = 2;
    const inside =
      canvasLeft >= heroLeft - tol &&
      canvasTop >= heroTop - tol &&
      canvasRight <= heroRight + tol &&
      canvasBottom <= heroBottom + tol;

    if (inside) {
      pass('Canvas bounding box stays within hero');
    } else {
      fail(
        `Canvas overflows hero: canvas [${canvasLeft},${canvasTop}-${canvasRight},${canvasBottom}] hero [${heroLeft},${heroTop}-${heroRight},${heroBottom}]`
      );
    }
  }

  const dragon = await page.evaluate(() => {
    const el = document.querySelector('#dragon-bg');
    if (!el) return { error: 'missing #dragon-bg' };
    const cs = getComputedStyle(el);
    return {
      opacity: cs.opacity,
      mixBlendMode: cs.mixBlendMode,
      filter: cs.filter,
      animationName: cs.animationName,
      width: cs.width,
      height: cs.height,
    };
  });

  if (dragon.error) {
    fail(dragon.error);
  } else {
    const opacity = Number(dragon.opacity);
    const hasFloatOrb = dragon.animationName && dragon.animationName.includes('floatOrb');
    if (hasFloatOrb && opacity >= 0.8 && opacity <= 1) {
      pass(`#dragon-bg opacity ${dragon.opacity} (floatOrb animation range)`);
    } else if (dragon.opacity === '0.5') {
      pass('#dragon-bg opacity 0.5');
    } else {
      fail(`#dragon-bg opacity expected 0.5 or floatOrb range 0.8–1, got ${dragon.opacity}`);
    }

    if (dragon.mixBlendMode === 'screen') pass('#dragon-bg mix-blend-mode screen');
    else fail(`#dragon-bg mix-blend-mode expected screen, got ${dragon.mixBlendMode}`);

    if (dragon.filter && dragon.filter !== 'none') pass(`#dragon-bg filter present: ${dragon.filter.slice(0, 80)}...`);
    else fail('#dragon-bg missing drop-shadow filter');

    if (dragon.animationName && dragon.animationName !== 'none') pass(`#dragon-bg animation: ${dragon.animationName}`);
    else fail('#dragon-bg missing floatOrb animation');
  }

  let bannerReady = true;
  try {
    await page.waitForFunction(
      () => {
        const banner = document.querySelector('#terminal-output .ascii-art.banner');
        return banner && /TRIGON/i.test(banner.textContent || '');
      },
      { timeout: 15000 }
    );
  } catch {
    bannerReady = false;
    fail('ASCII banner did not appear within 15s (#terminal-output .ascii-art.banner)');
  }

  if (bannerReady) {
    const ascii = await page.evaluate(() => {
      const banner = document.querySelector('#terminal-output .ascii-art.banner');
      const text = banner?.textContent || '';
      return { len: text.length, hasTrigon: /TRIGON/i.test(text), preview: text.slice(0, 120) };
    });

    if (ascii.hasTrigon && ascii.len > 50) {
      pass(`ASCII banner contains TRIGON (${ascii.len} chars)`);
    } else {
      fail(`ASCII banner weak or missing TRIGON (len=${ascii.len})`);
    }
  }

  const mojibake = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    return /Ã|â€|Ã¢/.test(bodyText);
  });

  if (!mojibake) pass('No visible mojibake in page text');
  else fail('Visible mojibake detected in page text');

  console.log('\n--- Summary ---');
  console.log(`Passed: ${passes.length}`);
  console.log(`Failed: ${failures.length}`);

  if (failures.length) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
