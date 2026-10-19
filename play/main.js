/* Icy Tower Roadster — browser presenter.
 *
 * Everything that decides gameplay is C: the unchanged recovered core, and the
 * shared host (win/host/host.c, the same port of the Mac host the Windows
 * build runs) that owns the 50 Hz debt clock, the key semantics
 * (input_state.c), menus, replays and the audio mixer. This file only does
 * what main_sdl.c does on the desktop:
 *   - forwards real input as USB-HID key presses (keyboard, gamepad and the
 *     touch pads all become the same key events, so the C key path is shared);
 *   - calls web_step(now) on a 20 ms schedule (one stepTimer per fire);
 *   - presents it_host_frame (640x480, or the 1280x960 Roadster canvas) with
 *     WebGL, crisp at any size (integer scale when it fits, sharp-bilinear
 *     otherwise), with a Canvas 2D fallback;
 *   - plays it_mixer_render through WebAudio after the first user gesture.
 */
(function () {
  'use strict';
  const root = document.getElementById('game');
  const canvas = document.getElementById('screen');
  const $ = (id) => document.getElementById(id);
  const RATE = 44100;
  const STEP = 0.02;
  const qs = new URLSearchParams(location.search);
  const BUILD = document.documentElement.getAttribute('data-build') || 'dev';
  const versioned = (u) => u + '?v=' + BUILD;

  // ------------------------------------------------------------ storage (always guarded)
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignore */ } },
    keys() { try { const out = []; for (let i = 0; i < localStorage.length; i++) out.push(localStorage.key(i)); return out; } catch (e) { return []; } },
  };
  const PREFIX = 'icytower:';
  function toB64(bytes) {
    let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(str) { const s = atob(str); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }

  // ------------------------------------------------------------ UI helpers
  let toastTimer = 0;
  function toast(msg, ms) {
    const t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms || 4200);
  }
  $('toast').addEventListener('pointerdown', (e) => { e.stopPropagation(); $('toast').hidden = true; });
  function setProgress(f, text) { $('loader-fill').style.width = Math.round(f * 100) + '%'; if (text) $('loader-text').textContent = text; }
  function fail(msg) { $('loader-text').textContent = msg; $('loader-fill').style.background = '#ff6a6a'; }

  // ------------------------------------------------------------ module + data
  let M = null;
  const uploads = new Map();
  const isGzip = (b) => b.length > 2 && b[0] === 0x1f && b[1] === 0x8b;

  async function fetchBytes(url) {
    const r = await fetch(url, { cache: 'force-cache' });
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return new Uint8Array(await r.arrayBuffer());
  }
  async function gunzip(bytes) {
    if (!isGzip(bytes)) return bytes;           // the server already decoded it
    const ds = new DecompressionStream('gzip');
    const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  }
  async function loadPak() {
    if (typeof DecompressionStream === 'function') {
      try { return await gunzip(await fetchBytes(versioned('icytower.pak.gz'))); } catch (e) { /* fall through */ }
    }
    return fetchBytes(versioned('icytower.pak'));
  }

  // Audio data: the C mixer wants the pak's int16 PCM at 44.1 kHz; decode the
  // compressed files back into exactly that.
  const probe = document.createElement('audio');
  const canVorbis = !!(probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"'));
  const canOpus = !!(probe.canPlayType && probe.canPlayType('audio/ogg; codecs="opus"'));
  function decodeWith(ctx, bytes) {
    return new Promise((resolve, reject) => {
      try {
        const p = ctx.decodeAudioData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), resolve, reject);
        if (p && p.then) p.then(resolve, reject);
      } catch (e) { reject(e); }
    });
  }
  async function decodeSound(ctx, s) {
    const oggOk = s.codec === 'opus' ? canOpus : canVorbis;
    const order = oggOk ? ['ogg', 'm4a'] : ['m4a', 'ogg'];
    for (const ext of order) {
      try {
        const buf = await decodeWith(ctx, await fetchBytes(versioned('audio/' + s.key + '.' + ext)));
        return toPcm(buf, s, ext === 'm4a');
      } catch (e) { /* try next */ }
    }
    return new Int16Array(s.frames * s.channels); // silence rather than a broken game
  }
  function toPcm(buf, s, aac) {
    const want = s.frames, ch = s.channels, len = buf.length;
    // The m4a files carry an edit list that skips the AAC encoder priming
    // (2112 samples). Decoders that honour it (Chromium, Firefox, Safari,
    // ffmpeg) return the sound from sample 0 plus < 1024 frames of end
    // padding; one that ignores it returns >= want + 2112 frames with the
    // priming in front. Only then cut it. The Ogg streams decode sample-exact.
    const priming = Math.round(2112 * RATE / (s.rate || RATE));
    const start = aac && len - want >= priming ? priming : 0;
    const chans = []; for (let c = 0; c < buf.numberOfChannels; c++) chans.push(buf.getChannelData(c));
    const out = new Int16Array(want * ch);
    for (let i = 0; i < want; i++) {
      const j = start + i; if (j >= len) break;
      for (let c = 0; c < ch; c++) {
        let v = chans.length === 1 ? chans[0][j] : ch === 1 ? (chans[0][j] + chans[1][j]) * 0.5 : chans[Math.min(c, chans.length - 1)][j];
        v = v < -1 ? -1 : v > 1 ? 1 : v;
        out[i * ch + c] = v < 0 ? Math.round(v * 32768) : Math.round(v * 32767);
      }
    }
    return out;
  }
  // Rebuild the full pak (same layout as win/tools/pack_assets.py) inside wasm memory.
  function buildPak(base, sounds) {
    const dv = new DataView(base.buffer, base.byteOffset, base.byteLength);
    const count = dv.getUint32(8, true);
    const entries = [];
    for (let i = 0; i < count; i++) {
      const o = 12 + i * 72;
      entries.push({ name: base.subarray(o, o + 56), a: dv.getUint32(o + 56, true), b: dv.getUint32(o + 60, true),
                     data: base.subarray(dv.getUint32(o + 68, true), dv.getUint32(o + 68, true) + dv.getUint32(o + 64, true)) });
    }
    for (const s of sounds) {
      const nm = new Uint8Array(56); nm.set(new TextEncoder().encode(s.name).subarray(0, 55));
      entries.push({ name: nm, a: RATE, b: s.channels, data: new Uint8Array(s.pcm.buffer, s.pcm.byteOffset, s.pcm.byteLength) });
    }
    let total = 12 + entries.length * 72; for (const e of entries) total += e.data.length;
    const ptr = M._web_alloc(total);
    const heap = M.HEAPU8, out = new DataView(heap.buffer, ptr, total);
    heap.set(new TextEncoder().encode('ITRPAK1\0'), ptr);
    out.setUint32(8, entries.length, true);
    let off = 12 + entries.length * 72;
    entries.forEach((e, i) => {
      const t = 12 + i * 72;
      heap.set(e.name, ptr + t);
      out.setUint32(t + 56, e.a, true); out.setUint32(t + 60, e.b, true);
      out.setUint32(t + 64, e.data.length, true); out.setUint32(t + 68, off, true);
      heap.set(e.data, ptr + off); off += e.data.length;
    });
    return { ptr, size: total };
  }

  // ------------------------------------------------------------ platform hooks (called from C)
  function hooks() {
    M.icyReadFile = (path, outPtr) => {
      let bytes = null;
      if (path.startsWith('/upload/')) bytes = uploads.get(path) || null;
      else { const v = store.get(PREFIX + path); if (v !== null) bytes = fromB64(v); }
      if (!bytes) return -1;
      const p = M._web_alloc(bytes.length + 1);
      M.HEAPU8.set(bytes, p); M.HEAPU8[p + bytes.length] = 0;
      M.HEAPU32[outPtr >> 2] = p;
      return bytes.length;
    };
    M.icyWriteFile = (path, bytes) => {
      if (path.startsWith('/download/')) { download(path.slice(10), bytes); return true; }
      if (path.indexOf('/records/') >= 0) pruneRecords();
      return store.set(PREFIX + path, toB64(bytes));
    };
    M.icyMessage = (msg) => toast(msg);
    M.icyTextInput = (on) => nameEntry(!!on);
    M.icyFullscreen = (on) => setFullscreen(!!on);
    M.icyOpenReplay = () => pickReplay();
    M.icyQuit = () => { if (document.fullscreenElement) setFullscreen(false); toast('Thanks for playing! Close the tab whenever you like.'); };
  }
  function pruneRecords() {   // keep localStorage bounded: newest 8 record replays
    const keys = store.keys().filter((k) => k && k.startsWith(PREFIX + '/save/records/') && k.endsWith('.itr'));
    if (keys.length < 8) return;
    keys.sort();
    for (const k of keys.slice(0, keys.length - 7)) { store.del(k); store.del(k.replace(/\.itr$/, '.icy.json')); }
  }
  function download(name, bytes) {
    try {
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
      const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
      toast('Replay saved to your downloads.');
    } catch (e) { toast('This browser cannot save files here.'); }
  }
  let uploadSeq = 0;
  async function startReplayBytes(bytes, name) {
    const path = '/upload/' + (++uploadSeq) + '.itr';
    uploads.set(path, bytes);
    const p = M._web_alloc(path.length * 3 + 1); M.stringToUTF8(path, p, path.length * 3 + 1);
    stamp(); const ok = M._web_start_replay_file(p); M._web_free(p);
    if (!ok) toast('Could not play ' + (name || 'that replay') + '.');
    dirty = true; root.focus();
  }
  function pickReplay() {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.itr';
    input.onchange = async () => { const f = input.files && input.files[0]; if (f) startReplayBytes(new Uint8Array(await f.arrayBuffer()), f.name); };
    input.click();
  }
  root.addEventListener('dragover', (e) => { e.preventDefault(); });
  root.addEventListener('drop', async (e) => {
    e.preventDefault();
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && /\.itr$/i.test(f.name)) startReplayBytes(new Uint8Array(await f.arrayBuffer()), f.name);
  });

  // ------------------------------------------------------------ fullscreen
  const fsEl = root;
  const canFullscreen = !!(fsEl.requestFullscreen || fsEl.webkitRequestFullscreen) && document.fullscreenEnabled !== false;
  const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function setFullscreen(on) {
    try {
      if (on && !isFull()) (fsEl.requestFullscreen || fsEl.webkitRequestFullscreen).call(fsEl, { navigationUI: 'hide' });
      else if (!on && isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } catch (e) { /* not allowed (iframe without allowfullscreen) */ }
  }
  function onFullscreenChange() { if (M) M._web_fullscreen_changed(isFull() ? 1 : 0); layout(); }
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  // ------------------------------------------------------------ keys (USB-HID usage ids)
  const HID = { Enter: 40, Escape: 41, Backspace: 42, Tab: 43, Space: 44, Minus: 45, Equal: 46, BracketLeft: 47,
    BracketRight: 48, Backslash: 49, Semicolon: 51, Quote: 52, Backquote: 53, Comma: 54, Period: 55, Slash: 56,
    ArrowRight: 79, ArrowLeft: 80, ArrowDown: 81, ArrowUp: 82, NumpadEnter: 88, NumpadSubtract: 86, NumpadAdd: 87,
    ControlLeft: 224, ShiftLeft: 225, AltLeft: 226, MetaLeft: 227, ControlRight: 228, ShiftRight: 229, AltRight: 230, MetaRight: 231 };
  for (let i = 0; i < 26; i++) HID['Key' + String.fromCharCode(65 + i)] = 4 + i;
  for (let i = 1; i <= 9; i++) HID['Digit' + i] = 29 + i;
  HID.Digit0 = 39;
  const K = { LEFT: 80, RIGHT: 79, UP: 82, DOWN: 81, SPACE: 44, ENTER: 40, ESC: 41, P: 19, BACKSPACE: 42 };

  function stamp() { if (M) M._web_set_time(performance.now() / 1000); }
  // Several sources (keys, pads, gamepad) can hold the same HID key; the C host
  // sees one press and one release, exactly like a single physical key.
  const held = new Map();     // hid -> Set(source)
  function press(source, hid, repeat) {
    let set = held.get(hid); if (!set) held.set(hid, set = new Set());
    const already = set.has(source);
    if (set.size && !already) { set.add(source); return; }
    set.add(source);
    stamp(); M._web_key_down(hid, already && repeat ? 1 : 0); dirty = true;
  }
  function release(source, hid) {
    const set = held.get(hid); if (!set || !set.has(source)) return;
    set.delete(source);
    if (!set.size) { stamp(); M._web_key_up(hid); dirty = true; }
  }
  function releaseAll(source) { for (const [hid, set] of held) if (set.has(source)) release(source, hid); }

  // WASD: A/D/W/S are aliases of the arrow keys (W = jump during play).
  const physical = new Map(); // event.code -> hid it was sent as
  function aliasFor(code) {
    const s = M ? M._web_screen() : 0;
    if (code === 'KeyA') return K.LEFT;
    if (code === 'KeyD') return K.RIGHT;
    if (code === 'KeyW') return s === 1 ? K.SPACE : K.UP;
    if (code === 'KeyS') return s === 1 ? 0 : K.DOWN;
    return HID[code] || 0;
  }
  // event.code is the physical key; a few virtual keyboards, older browsers and
  // automation tools leave it empty or "Unidentified" — derive it from event.key.
  const KEY_CODE = { ' ': 'Space', Spacebar: 'Space', Left: 'ArrowLeft', Right: 'ArrowRight', Up: 'ArrowUp', Down: 'ArrowDown', Esc: 'Escape' };
  function codeOf(e) {
    if (e.code && e.code !== 'Unidentified') return e.code;
    const k = e.key || '';
    if (KEY_CODE[k]) return KEY_CODE[k];
    if (/^[a-z]$/i.test(k)) return 'Key' + k.toUpperCase();
    if (/^[0-9]$/.test(k)) return 'Digit' + k;
    return (HID[k] || k === 'F11') ? k : '';
  }
  let textMode = false;
  window.addEventListener('keydown', (ev) => {
    if (!M) return;
    const e = { code: codeOf(ev), key: ev.key, repeat: ev.repeat, altKey: ev.altKey, metaKey: ev.metaKey, ctrlKey: ev.ctrlKey, preventDefault: () => ev.preventDefault() };
    if (infoOpen()) { if (e.code === 'Escape') { $('info').hidden = true; root.focus({ preventScroll: true }); e.preventDefault(); } return; }
    if (document.activeElement === $('name-input')) return;
    unlockAudio();
    if (e.code === 'F11' || (e.code === 'Enter' && e.altKey)) { e.preventDefault(); if (!e.repeat) toggleFullscreen(); return; }
    if (e.metaKey || e.ctrlKey) return;               // leave browser shortcuts alone
    if (e.code === 'KeyM' && M._web_screen() !== 1 && !e.repeat) { toggleMute(); e.preventDefault(); return; }
    const hid = e.repeat && physical.has(e.code) ? physical.get(e.code) : (textMode ? HID[e.code] || 0 : aliasFor(e.code));
    if (hid) {
      e.preventDefault();
      physical.set(e.code, hid);
      press('kb:' + e.code, hid, e.repeat);
    }
    if (textMode && e.key && e.key.length === 1) { sendText(e.key); e.preventDefault(); }
    if (e.code === 'KeyM' && !e.repeat) syncMute();
  }, { capture: true });
  window.addEventListener('keyup', (e) => {
    if (!M) return;
    const code = codeOf(e), hid = physical.get(code);
    if (hid) { physical.delete(code); release('kb:' + code, hid); e.preventDefault(); }
  }, { capture: true });
  function focusLost() {
    if (!M) return;
    for (const [, set] of held) set.clear(); held.clear(); physical.clear();
    padState.clear(); touchHeld.clear(); renderTouchHeld();
    stamp(); M._web_focus_lost(); dirty = true;
  }
  window.addEventListener('blur', focusLost);
  document.addEventListener('visibilitychange', () => {
    if (!M) return;
    if (document.hidden) {
      // Hidden tabs get no frames; pause like pressing P so nobody dies off-screen.
      focusLost();
      if (M._web_screen() === 1) { stamp(); M._web_key_down(K.P, 0); M._web_key_up(K.P); }
      if (audio.ctx && audio.ctx.state === 'running') audio.ctx.suspend().catch(() => {});
    } else if (audio.ctx && audio.unlocked) audio.ctx.resume().catch(() => {});
  });
  function sendText(str) {
    const n = M.lengthBytesUTF8(str) + 1, p = M._web_alloc(n);
    M.stringToUTF8(str, p, n); M._web_text(p); M._web_free(p); dirty = true;
  }

  // ------------------------------------------------------------ name entry (high score)
  function nameEntry(on) {
    textMode = on;
    const form = $('name-entry'), input = $('name-input');
    if (on && touchMode) {
      form.hidden = false; input.value = '';
      setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }, 30);
    } else if (!on) { form.hidden = true; if (document.activeElement === input) input.blur(); root.focus(); }
  }
  $('name-input').addEventListener('input', () => {
    // Mirror the field into the host's name buffer: clear it, then type the field.
    const v = $('name-input').value.replace(/[^\x20-\x7e]/g, '').slice(0, 7);
    for (let i = 0; i < 8; i++) { stamp(); M._web_key_down(K.BACKSPACE, 0); M._web_key_up(K.BACKSPACE); }
    if (v) sendText(v);
  });
  $('name-entry').addEventListener('submit', (e) => {
    e.preventDefault(); stamp(); M._web_key_down(K.ENTER, 0); M._web_key_up(K.ENTER); dirty = true;
  });

  // ------------------------------------------------------------ gamepad
  const padState = new Map(); // hid -> pressed
  const padRepeat = new Map();
  function pollGamepads(now) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const want = new Set();
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const b = (i) => gp.buttons[i] && gp.buttons[i].pressed;
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      const screen = M._web_screen();
      if (b(14) || ax < -0.5) want.add(K.LEFT);
      if (b(15) || ax > 0.5) want.add(K.RIGHT);
      if (b(12) || ay < -0.5) want.add(K.UP);
      if (b(13) || ay > 0.5) want.add(K.DOWN);
      if (b(0) || (screen === 1 && b(2))) want.add(K.SPACE);
      if (b(1) || b(8)) want.add(K.ESC);
      if (b(9)) want.add(screen === 1 ? K.P : K.ENTER);
    }
    if (want.size) unlockAudio();
    for (const hid of want) {
      if (!padState.has(hid)) { padState.set(hid, now); padRepeat.set(hid, now + 0.4); press('pad', hid, false); }
      else if (hid <= 82 && hid >= 79 && M._web_screen() !== 1 && now >= padRepeat.get(hid)) {
        padRepeat.set(hid, now + 0.12); stamp(); M._web_key_down(hid, 1); dirty = true;   // OS-style menu repeat
      }
    }
    for (const hid of [...padState.keys()]) if (!want.has(hid)) { padState.delete(hid); release('pad', hid); }
  }

  // ------------------------------------------------------------ touch pads
  const mq = (q) => !!(window.matchMedia && matchMedia(q).matches);
  let touchMode = qs.get('touch') === '1' ||
    (qs.get('touch') !== '0' && (mq('(pointer: coarse)') || (navigator.maxTouchPoints > 0 && mq('(hover: none)'))));
  const ICON = {
    left: '<svg viewBox="0 0 24 24"><path d="M15.5 4 7 12l8.5 8z"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M8.5 4 17 12l-8.5 8z"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M4 15.5 12 7l8 8.5z"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M4 8.5 12 17l8-8.5z"/></svg>',
  };
  const touchHeld = new Map(); // pointerId -> hid
  let padLayout = '';
  function btn(hid, html, cls) {
    const b = document.createElement('div');
    b.className = 'tbtn ' + (cls || ''); b.dataset.hid = hid; b.innerHTML = html;
    return b;
  }
  function buildPads(screen) {
    const name = screen === 1 ? 'play' : screen === 2 ? 'pause' : screen === 3 ? 'info' : 'menu';
    if (padLayout === name + layoutKey) return;
    padLayout = name + layoutKey;
    const L = $('pad-left'), R = $('pad-right'); L.innerHTML = ''; R.innerHTML = '';
    const big = sizes.button, wide = sizes.wide;
    const sz = (el, w, h) => { el.style.width = w + 'px'; el.style.height = h + 'px'; return el; };
    if (name === 'play') {
      L.append(sz(btn(K.LEFT, ICON.left), wide, big), sz(btn(K.RIGHT, ICON.right), wide, big));
      R.append(sz(btn(K.SPACE, '<span class="lbl">JUMP</span>', 'round jump'), big * 1.25, big * 1.25));
    } else if (name === 'pause') {
      L.append(sz(btn(K.ESC, '<span class="lbl">EXIT</span>', 'small'), wide, big * 0.8));
      R.append(sz(btn(K.SPACE, '<span class="lbl">RESUME</span>', 'small'), wide * 1.3, big * 0.8));
    } else if (name === 'info') {
      R.append(sz(btn(K.ENTER, '<span class="lbl">OK</span>', 'small'), wide, big * 0.8));
    } else {
      const c = Math.round(Math.min(big * 0.74, sizes.half / 3.7));
      const grid = document.createElement('div');
      Object.assign(grid.style, { display: 'grid', gridTemplateColumns: `repeat(3, ${c}px)`, gridTemplateRows: `repeat(3, ${c}px)`, gap: '4px' });
      const cell = (el, col, row) => { el.style.gridColumn = col; el.style.gridRow = row; grid.append(sz(el, c, c)); };
      cell(btn(K.UP, ICON.up, 'small'), 2, 1); cell(btn(K.LEFT, ICON.left, 'small'), 1, 2);
      cell(btn(K.RIGHT, ICON.right, 'small'), 3, 2); cell(btn(K.DOWN, ICON.down, 'small'), 2, 3);
      L.append(grid);
      const col = document.createElement('div');
      Object.assign(col.style, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' });
      col.append(sz(btn(K.ENTER, '<span class="lbl">OK</span>', 'round'), big, big), sz(btn(K.ESC, '<span class="lbl">BACK</span>', 'small'), big * 0.9, big * 0.42));
      R.append(col);
    }
  }
  function renderTouchHeld() {
    const active = new Set(touchHeld.values());
    for (const el of document.querySelectorAll('.tbtn')) el.classList.toggle('down', active.has(+el.dataset.hid));
  }
  function hidAt(x, y, padEl) {
    // Slide-friendly: anywhere inside a pad counts, nearest button wins.
    let best = 0, bestD = Infinity;
    for (const el of padEl.querySelectorAll('.tbtn')) {
      const r = el.getBoundingClientRect();
      const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom), d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = +el.dataset.hid; }
    }
    return best;
  }
  function padPointer(padEl) {
    const update = (e) => {
      e.preventDefault();
      const hid = hidAt(e.clientX, e.clientY, padEl), old = touchHeld.get(e.pointerId);
      if (hid === old) return;
      if (old) { touchHeld.delete(e.pointerId); if (![...touchHeld.values()].includes(old)) release('touch', old); }
      if (hid) { if (![...touchHeld.values()].includes(hid)) press('touch', hid, false); touchHeld.set(e.pointerId, hid); }
      renderTouchHeld();
    };
    padEl.addEventListener('pointerdown', (e) => {
      touchMode = true; unlockAudio();
      try { padEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      if (navigator.vibrate && M && M._web_screen() === 1) { try { navigator.vibrate(8); } catch (err) { /* ignore */ } }
      update(e);
    });
    padEl.addEventListener('pointermove', (e) => { if (touchHeld.has(e.pointerId) && M._web_screen() === 1) update(e); });
    const end = (e) => {
      const old = touchHeld.get(e.pointerId);
      if (old) { touchHeld.delete(e.pointerId); if (![...touchHeld.values()].includes(old)) release('touch', old); }
      renderTouchHeld();
    };
    padEl.addEventListener('pointerup', end); padEl.addEventListener('pointercancel', end); padEl.addEventListener('lostpointercapture', end);
  }
  padPointer($('pad-left')); padPointer($('pad-right'));
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Taps/clicks on the picture: the original menus accept mouse clicks.
  canvas.addEventListener('pointerdown', (e) => {
    unlockAudio(); root.focus({ preventScroll: true });
    if (!M) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * 640 / r.width, y = (e.clientY - r.top) * 480 / r.height;
    stamp(); M._web_mouse_down(x, y); dirty = true;
    // Dead and waiting for "jump to continue": a tap on the picture continues.
    if (M._web_screen() === 1 && e.pointerType !== 'mouse') { press('tap', K.SPACE, false); setTimeout(() => release('tap', K.SPACE), 60); }
  });

  // ------------------------------------------------------------ HUD buttons
  function toggleFullscreen() { if (M) { stamp(); M._web_toggle_fullscreen(); } else setFullscreen(!isFull()); }
  function toggleMute() { if (!M) return; M._web_set_muted(M._web_muted() ? 0 : 1); syncMute(); unlockAudio(); }
  function syncMute() { if (!M) return; const m = !!M._web_muted(); $('btn-mute').setAttribute('aria-pressed', m ? 'true' : 'false'); store.set(PREFIX + 'muted', m ? '1' : '0'); }
  const tapKey = (hid) => () => { unlockAudio(); press('hud', hid, false); release('hud', hid); root.focus({ preventScroll: true }); };
  $('btn-pause').addEventListener('click', tapKey(K.ESC));
  $('btn-mute').addEventListener('click', () => { toggleMute(); root.focus({ preventScroll: true }); });
  $('btn-full').addEventListener('click', () => { unlockAudio(); toggleFullscreen(); });
  if (!canFullscreen) $('btn-full').hidden = true;
  const infoOpen = () => !$('info').hidden;
  $('btn-info').addEventListener('click', () => {
    unlockAudio();
    if (M && M._web_screen() === 1) { press('hud', K.P, false); release('hud', K.P); }
    $('info').hidden = false; $('info-close').focus();
  });
  $('info-close').addEventListener('click', () => { $('info').hidden = true; root.focus({ preventScroll: true }); });
  for (const b of document.querySelectorAll('.hud-btn')) b.addEventListener('pointerdown', (e) => e.stopPropagation());

  // ------------------------------------------------------------ audio
  // Preferred output: an AudioWorklet playing a ring buffer that the main
  // thread fills from the C mixer once per display frame (the mixer lives in
  // wasm on the main thread, next to the game that triggers its sounds).
  // Fallback (no AudioWorklet, or its module refused e.g. by a CSP): the
  // ScriptProcessor pulling the mixer on demand.
  const WORKLET = `
class IcyMixerOut extends AudioWorkletProcessor {
  constructor(o) {
    super();
    const p = o.processorOptions || {};
    this.n = 65536; this.b = new Float32Array(this.n * 2); this.r = 0; this.w = 0;
    this.max = p.max || 12000; this.keep = p.keep || 4000;
    this.port.onmessage = (e) => {
      const d = e.data, k = d.length >> 1, n = this.n, b = this.b;
      for (let i = 0; i < k; i++) { const j = (this.w + i) % n; b[2 * j] = d[2 * i]; b[2 * j + 1] = d[2 * i + 1]; }
      this.w = (this.w + k) % n;
    };
  }
  process(inputs, outputs) {
    const out = outputs[0], L = out[0], R = out[1] || out[0], m = L.length, n = this.n, b = this.b;
    let level = (this.w - this.r + n) % n;
    if (level > this.max) { this.r = (this.w - this.keep + n) % n; level = this.keep; } // cap latency after a stall
    for (let i = 0; i < m; i++) {
      if (i < level) { const j = (this.r + i) % n; L[i] = b[2 * j]; R[i] = b[2 * j + 1]; } else { L[i] = 0; R[i] = 0; }
    }
    this.r = (this.r + Math.min(m, level)) % n;
    return true;
  }
}
registerProcessor('icy-mixer-out', IcyMixerOut);`;
  const audio = { ctx: null, node: null, unlocked: false, phase: 0, carry: null, mode: 'none', sent: 0, lead: 0 };
  function startScriptProcessor() {
    const size = touchMode ? 2048 : 1024;
    const node = audio.ctx.createScriptProcessor(size, 0, 2);
    node.onaudioprocess = (e) => mixInto(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1), e.outputBuffer.length);
    node.connect(audio.ctx.destination);
    audio.node = node; audio.mode = 'scriptprocessor';
  }
  function startOutput() {
    const ctx = audio.ctx;
    if (!(ctx.audioWorklet && window.AudioWorkletNode && window.Blob && window.URL)) { startScriptProcessor(); return; }
    audio.mode = 'loading';
    let url = null;
    try { url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' })); } catch (e) { startScriptProcessor(); return; }
    ctx.audioWorklet.addModule(url).then(() => {
      const sr = ctx.sampleRate;
      audio.lead = Math.round(sr * (touchMode ? 0.09 : 0.06));
      const node = new AudioWorkletNode(ctx, 'icy-mixer-out', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2],
        processorOptions: { max: Math.round(sr * 0.25), keep: audio.lead } });
      node.connect(ctx.destination);
      audio.node = node; audio.mode = 'worklet'; audio.sent = 0;
    }).catch(() => { startScriptProcessor(); }).then(() => { try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ } });
  }
  // Called once per display frame: top the worklet's buffer up to `lead` ahead of the audio clock.
  function feedAudio() {
    if (audio.mode !== 'worklet' || !audio.ctx || audio.ctx.state !== 'running' || document.hidden) return;
    const sr = audio.ctx.sampleRate, played = Math.floor(audio.ctx.currentTime * sr);
    if (audio.sent < played) audio.sent = played;                 // first feed, or after a stall/suspend
    let n = played + audio.lead - audio.sent;
    if (n <= 0) return;
    if (n > 4096) n = 4096;                                      // web_audio holds 8192 source frames
    const L = new Float32Array(n), R = new Float32Array(n), out = new Float32Array(2 * n);
    mixInto(L, R, n);
    for (let i = 0; i < n; i++) { out[2 * i] = L[i]; out[2 * i + 1] = R[i]; }
    audio.node.port.postMessage(out, [out.buffer]);
    audio.sent += n;
  }
  function unlockAudio() {
    if (!M) return;
    if (audio.unlocked) {
      // iOS/Chrome can suspend or "interrupt" a running context (calls, app
      // switches, hidden tabs); any later gesture resumes it.
      if (audio.ctx && audio.ctx.state !== 'running' && !document.hidden) audio.ctx.resume().catch(() => {});
      return;
    }
    $('tap-hint').hidden = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (navigator.audioSession) { try { navigator.audioSession.type = 'playback'; } catch (e) { /* ignore */ } }
      if (!audio.ctx) {
        try { audio.ctx = new AC({ sampleRate: RATE, latencyHint: 'interactive' }); } catch (e) { audio.ctx = new AC(); }
        startOutput();
        // iOS: a buffer started inside the gesture unlocks output.
        const silent = audio.ctx.createBuffer(1, 1, audio.ctx.sampleRate), src = audio.ctx.createBufferSource();
        src.buffer = silent; src.connect(audio.ctx.destination); src.start(0);
      }
      const p = audio.ctx.resume && audio.ctx.resume();
      audio.unlocked = true;
      if (p && p.catch) p.catch(() => { audio.unlocked = false; });
    } catch (e) { audio.unlocked = false; }
  }
  // Fill n device-rate stereo frames from the C mixer (44.1 kHz), resampling if needed.
  function mixInto(L, R, n) {
    if (!M || document.hidden) { L.fill(0); R.fill(0); return; }
    const sr = audio.ctx.sampleRate;
    if (sr === RATE) {
      const p = M._web_audio(n) >> 2, f = M.HEAPF32;
      for (let i = 0; i < n; i++) { L[i] = f[p + 2 * i]; R[i] = f[p + 2 * i + 1]; }
      return;
    }
    // Linear resampling from the mixer's 44.1 kHz to the device rate. Index 0 is
    // the last frame of the previous block; new frames are 1..need.
    const step = RATE / sr, last = audio.phase + (n - 1) * step, need = Math.floor(last) + 1;
    const p = M._web_audio(need) >> 2, f = M.HEAPF32, carry = audio.carry || [0, 0];
    let pos = audio.phase;
    for (let i = 0; i < n; i++) {
      const i0 = Math.floor(pos), t = pos - i0;
      const a0 = i0 === 0 ? carry[0] : f[p + 2 * (i0 - 1)], b0 = f[p + 2 * i0];
      const a1 = i0 === 0 ? carry[1] : f[p + 2 * (i0 - 1) + 1], b1 = f[p + 2 * i0 + 1];
      L[i] = a0 + (b0 - a0) * t; R[i] = a1 + (b1 - a1) * t;
      pos += step;
    }
    audio.carry = [f[p + 2 * (need - 1)], f[p + 2 * (need - 1) + 1]];
    audio.phase = pos - need;
  }
  for (const ev of ['pointerdown', 'touchend', 'mousedown', 'keydown']) window.addEventListener(ev, unlockAudio, { capture: true, passive: true });

  // ------------------------------------------------------------ presentation
  let gl = null, ctx2d = null, prog = null, tex = null, texW = 0, texH = 0, uScale = null, uTexSize = null;
  const sizes = { button: 76, wide: 92, half: 200 };
  let dest = { w: 640, h: 480, x: 0, y: 0, scale: 1 }, layoutKey = '';
  function initGL() {
    if (qs.get('renderer') === '2d') return false;
    const opts = { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
    if (!gl) return false;
    const vs = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*0.5+0.5,0.5-p.y*0.5);gl_Position=vec4(p,0.0,1.0);}';
    // Sharp bilinear: nearest inside each source pixel, a one-device-pixel blend at its edges.
    const fs = 'precision mediump float;varying vec2 uv;uniform sampler2D t;uniform vec2 ts;uniform vec2 sc;' +
      'void main(){vec2 tx=uv*ts;vec2 f=fract(tx);vec2 r=0.5-0.5/sc;vec2 c=f-0.5;' +
      'vec2 m=(c-clamp(c,-r,r))*sc+0.5;gl_FragColor=vec4(texture2D(t,(floor(tx)+m)/ts).rgb,1.0);}';
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    uScale = gl.getUniformLocation(prog, 'sc'); uTexSize = gl.getUniformLocation(prog, 'ts');
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);
    canvas.addEventListener('webglcontextrestored', () => { try { initGL(); texW = texH = 0; dirty = true; } catch (err) { gl = null; } }, false);
    return true;
  }
  let off2d = null, offCtx = null, img = null;
  function present() {
    const ptr = M._web_frame(), w = M._web_frame_width(), h = M._web_frame_height();
    const pixels = M.HEAPU8.subarray(ptr, ptr + w * h * 4);
    stats.presents++;
    if (gl) {
      if (gl.isContextLost()) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (w !== texW || h !== texH) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels); texW = w; texH = h; }
      else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      // The Roadster frame is the 640x480 picture rendered at 2x (k = 2) so the
      // gas can be soft. When it is shown smaller than its texture, do the
      // sharp-bilinear step on the 640x480 pixel grid instead (each sample
      // lands mid 2x2 block: crisp art edges, gas averaged), never a blurry
      // plain-bilinear downscale.
      const k = (w % 640 === 0 && h % 480 === 0 && w / 640 === h / 480) ? w / 640 : 1;
      const gw = canvas.width < w && k > 1 ? w / k : w, gh = canvas.width < w && k > 1 ? h / k : h;
      const sx = canvas.width / gw, sy = canvas.height / gh;
      gl.uniform2f(uTexSize, gw, gh);
      // Upscaling: sharp bilinear. Downscaling: plain bilinear (scale 1 makes the shader linear).
      gl.uniform2f(uScale, Math.max(1, sx), Math.max(1, sy));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return;
    }
    if (!ctx2d) { ctx2d = canvas.getContext('2d'); }
    if (!off2d || off2d.width !== w || off2d.height !== h) {
      off2d = document.createElement('canvas'); off2d.width = w; off2d.height = h; offCtx = off2d.getContext('2d'); img = offCtx.createImageData(w, h);
    }
    img.data.set(pixels); offCtx.putImageData(img, 0, 0);
    ctx2d.imageSmoothingEnabled = canvas.width < w; // smooth only when shrinking
    ctx2d.drawImage(off2d, 0, 0, canvas.width, canvas.height);
  }

  // ------------------------------------------------------------ layout
  function layout() {
    const dpr = Math.max(1, Math.min(4, window.devicePixelRatio || 1));
    const cs = getComputedStyle(root);
    const pt = parseFloat(cs.paddingTop) || 0, pr = parseFloat(cs.paddingRight) || 0, pb = parseFloat(cs.paddingBottom) || 0, pl = parseFloat(cs.paddingLeft) || 0;
    const W = root.clientWidth - pl - pr, H = root.clientHeight - pt - pb;
    let area = { x: pl, y: pt, w: W, h: H }, hint = null;
    const L = $('pad-left'), R = $('pad-right');
    const portrait = H > W;
    $('touch').hidden = !touchMode;
    const creditH = touchMode && portrait ? (W < 430 ? 44 : 30) : 16;
    if (touchMode && portrait) {
      // Pads in the thumb zone at the bottom; the picture centred above them.
      // The touch zones take every pixel below the picture (each half of the
      // screen is one zone: nearest button wins), the buttons sit low where
      // thumbs rest.
      const hudH = 52, minPad = 190;
      const gameH = Math.min(W * 0.75, H - minPad - hudH - creditH);
      const gameY = pt + Math.max(hudH, Math.min(hudH + 24, (H - creditH - gameH - minPad) / 2));
      area = { x: pl, y: gameY, w: W, h: gameH };
      const top = Math.round(gameY + gameH + 8), padH = Math.max(minPad, pt + H - creditH - top);
      sizes.button = Math.round(Math.max(64, Math.min(108, padH * 0.42, W * 0.25)));
      sizes.wide = Math.round(Math.min(sizes.button * 1.15, W * 0.22));
      sizes.half = W / 2;
      const lift = Math.round(Math.max(10, Math.min(48, (padH - sizes.button * 1.25) * 0.3))) + 'px';
      Object.assign(L.style, { left: pl + 'px', top: top + 'px', width: W / 2 + 'px', height: padH + 'px', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'flex-end', paddingBottom: lift });
      Object.assign(R.style, { left: pl + W / 2 + 'px', top: top + 'px', width: W / 2 + 'px', height: padH + 'px', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'flex-end', paddingBottom: lift });
      hint = { top: area.y + gameH + 14 };
    } else if (touchMode) {
      // Landscape: pads in the side columns next to the picture.
      const side = Math.max(120, Math.min(W * 0.26, (W - H * 4 / 3) / 2));
      area = { x: pl + side, y: pt, w: W - 2 * side, h: H - creditH };
      sizes.button = Math.round(Math.max(60, Math.min(96, side * 0.62, H * 0.3)));
      // LEFT and RIGHT side by side in the left column (a thumb slides sideways).
      sizes.wide = Math.round(Math.max(56, Math.min(sizes.button * 1.05, (side - 28) / 2)));
      sizes.half = side;
      Object.assign(L.style, { left: pl + 'px', top: pt + 'px', width: side + 'px', height: H - creditH + 'px', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', paddingBottom: '0px' });
      Object.assign(R.style, { left: pl + W - side + 'px', top: pt + 'px', width: side + 'px', height: H - creditH + 'px', flexDirection: 'column', alignItems: 'center', paddingBottom: '0px' });
    } else {
      area = { x: pl, y: pt, w: W, h: H - (H > 520 ? creditH : 0) };
    }
    $('credit-line').hidden = !touchMode && H <= 520;
    $('tap-hint').style.top = hint ? hint.top + 'px' : '';
    // Device-pixel exact sizing: integer scale when it fills most of the area,
    // otherwise the largest fit with sharp-bilinear filtering.
    const aw = Math.floor(area.w * dpr), ah = Math.floor(area.h * dpr);
    const fit = Math.min(aw / 640, ah / 480);
    let s = fit;
    const k = Math.floor(fit);
    if (qs.get('scale') === 'integer' ? k >= 1 : (k >= 1 && k / fit >= 0.86)) s = k;
    const dw = Math.max(1, Math.round(640 * s)), dh = Math.max(1, Math.round(480 * s));
    const dx = Math.round(area.x * dpr + (aw - dw) / 2), dy = Math.round(area.y * dpr + (ah - dh) / 2);
    if (canvas.width !== dw || canvas.height !== dh) { canvas.width = dw; canvas.height = dh; }
    Object.assign(canvas.style, { width: dw / dpr + 'px', height: dh / dpr + 'px', left: dx / dpr + 'px', top: dy / dpr + 'px' });
    dest = { w: dw, h: dh, x: dx, y: dy, scale: s };
    layoutKey = [touchMode, portrait, sizes.button, W, H].join(':');
    padLayout = '';
    if (M) { buildPads(M._web_screen()); renderTouchHeld(); }
    dirty = true;
  }
  window.addEventListener('resize', layout);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(root);
  if (window.matchMedia) {
    const mq = matchMedia('(pointer: coarse)');
    const onChange = () => { if (mq.matches) { touchMode = true; layout(); } };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
  }
  window.addEventListener('touchstart', () => { if (!touchMode) { touchMode = true; layout(); } }, { passive: true, capture: true });
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' && !touchMode) { touchMode = true; layout(); } }, { passive: true, capture: true });

  // ------------------------------------------------------------ main loop (mirrors main_sdl.c)
  let dirty = true, lastScreen = -1;
  const stats = { steps: 0, redraws: 0, presents: 0, frames: 0, start: 0, stepTimes: [] };
  window.__icy = { stats, get screen() { return M ? M._web_screen() : -1; }, get dest() { return dest; },
                   get audio() { return { state: audio.ctx ? audio.ctx.state : 'none', unlocked: audio.unlocked, mode: audio.mode, sent: audio.sent, rate: audio.ctx ? audio.ctx.sampleRate : 0 }; },
                   get renderer() { return gl ? 'webgl' : '2d'; },
                   // Verification aid: the exact frame the C host produced, as a PNG data URL.
                   snapshot() {
                     const ptr = M._web_frame(), w = M._web_frame_width(), h = M._web_frame_height();
                     const c = document.createElement('canvas'); c.width = w; c.height = h;
                     const cx = c.getContext('2d'), im = cx.createImageData(w, h);
                     im.data.set(M.HEAPU8.subarray(ptr, ptr + w * h * 4)); cx.putImageData(im, 0, 0);
                     return c.toDataURL('image/png');
                   } };
  function frame() {
    requestAnimationFrame(frame);
    const now = performance.now() / 1000;
    stats.frames++;
    pollGamepads(now);
    // The C debt clock (main_sdl.c / Mac stepTimer) turns elapsed time into
    // whole 20 ms ticks, so it runs 50 ticks/s at any display rate. Asking it
    // every display frame (instead of on a separate 20 ms timer) keeps the same
    // ticks and input sampling but spreads them evenly over the vsyncs.
    stats.steps++;
    if (M._web_step(now)) { dirty = true; stats.redraws++; stats.stepTimes.push(now); if (stats.stepTimes.length > 600) stats.stepTimes.shift(); }
    feedAudio();
    const screen = M._web_screen();
    if (screen !== lastScreen) {
      lastScreen = screen; buildPads(screen); renderTouchHeld();
      $('btn-pause').hidden = screen !== 1;
    }
    if (dirty) { dirty = false; present(); }
  }

  // ------------------------------------------------------------ boot
  async function boot() {
    try {
      if (typeof WebAssembly !== 'object') throw new Error('This browser does not support WebAssembly.');
      setProgress(0.05, 'Loading the tower…');
      const modP = createIcyTower({ locateFile: (p) => versioned(p) });
      const pakP = loadPak();
      const indexP = fetch(versioned('audio/index.json')).then((r) => r.json());
      M = await modP; hooks();
      setProgress(0.25);
      const [base, index] = await Promise.all([pakP, indexP]);
      setProgress(0.4, 'Tuning the thrusters…');
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      let sounds = [];
      if (OAC) {
        const dctx = new OAC(2, RATE, RATE);
        let done = 0;
        sounds = await Promise.all(index.map(async (s) => {
          const pcm = await decodeSound(dctx, s); done++; setProgress(0.4 + 0.5 * done / index.length);
          return { name: s.name, channels: s.channels, pcm };
        }));
      }
      const pak = buildPak(base, sounds);
      const seed = (crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint32Array(1))[0] : (Date.now() >>> 0);
      if (M._web_init(pak.ptr, pak.size, seed) !== 0) throw new Error('The game data could not be opened.');
      if (store.get(PREFIX + 'muted') === '1') M._web_set_muted(1);
      syncMute();
      setProgress(1, 'Ready');
      if (!initGLSafe()) { gl = null; }
      layout();
      $('hud').hidden = false;
      const now = performance.now() / 1000;
      M._web_start(now); stats.start = now;
      $('loader').classList.add('done'); setTimeout(() => { $('loader').hidden = true; }, 400);
      if (!audio.unlocked) $('tap-hint').hidden = false;
      $('tap-hint').textContent = touchMode ? 'Tap anywhere for sound' : 'Click or press any key for sound';
      root.focus({ preventScroll: true });
      requestAnimationFrame(frame);
    } catch (e) {
      console.error(e);
      fail((e && e.message) || 'Something went wrong while loading.');
    }
  }
  function initGLSafe() { try { return initGL(); } catch (e) { console.warn('WebGL unavailable, using canvas', e); gl = null; return false; } }
  layout();
  boot();
})();
