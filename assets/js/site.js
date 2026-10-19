/* Icy Tower: Roadster Edition — site behaviour.
   Theme, English/Hebrew, the title-screen menu pointer, the video, and the margin climb. */
(function () {
  'use strict';
  var d = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------- Hebrew ---------------- */
  var ISSUES = 'https://github.com/fire17/icy-tower-roadster/issues';
  var HE = {
    'skip': 'דלגו לקובץ ההוראות',
    'nav.controls': 'שליטה', 'nav.install': 'התקנה', 'nav.roadster': 'הרודסטר', 'nav.credits': 'קרדיטים',
    'lang.label': 'EN', 'lang.aria': 'English',
    'presents': 'fire17 וחברים מציגים מהדורת מעריצים של',
    'h1': 'אייסי טאוור: מהדורת רודסטר',
    'edition': 'מהדורת רודסטר',
    'pitch': 'למגדל של הרולד יש מטפס חדש: הטסלה רודסטר של 2026. הוא עושה סלטות אחוריות במעלה הקומות על מדחפי גז קר, שיורים בדיוק מהמקומות שבהם נמצאות הפיות של המכונית האמיתית.',
    'menu.play': 'לשחק בדפדפן', 'menu.mac': 'הורדה למק', 'menu.instructions': 'הוראות', 'menu.roadster': 'הרודסטר', 'menu.credits': 'קרדיטים',
    'sound': '[ &#9654; לצפייה עם סאונד, 34 שנ׳ ]',
    'video.caption': 'קליפ משחק של 34 שניות, מוקלט מאפליקציית המק.',
    'general.h': 'כללי',
    'general.meta': 'בחינם · בלי פרסומות · בלי חשבונות · בלי מעקב',
    'general.p1': 'אייסי טאוור הוא משחק חינמי משנת 2001 של יוהאן פייץ מ-Free Lunch Design. מטפסים על מגדל בגובה אינסופי, וככל שרצים מהר יותר קופצים גבוה יותר. מהדורת המעריצים הזו שומרת על המשחק הזה ומוסיפה מטפס חדש אחד: הטסלה רודסטר מהדור השני, שטסלה הציגה עפה ב-15 באוקטובר 2026.',
    'general.p2': 'מתחת למכסה המנוע יש בנייה מחדש, נייטיב, של Icy Tower 1.3.1, שהועתקה מהמקור שגרה אחר שגרה, כך שהקפיצות מרגישות בדיוק כמו שאתם זוכרים. זה רץ על מק, על ווינדוס ובדפדפן.',
    'playing.h': 'משחק',
    'playing.meta': 'מקלדת · אותם מקשים כמו ב-2001',
    'keys.run': 'ריצה שמאלה / ימינה', 'keys.jump': 'קפיצה', 'keys.pause': 'השהיה', 'keys.restart': 'התחלה מחדש', 'keys.mute': 'השתקה', 'keys.char': 'החלפת מטפס',
    'climbers': 'ארבעה מטפסים: <b>הרודסטר</b> (ברירת המחדל), <b>הרולד</b>, <b>דיסקו דייב</b> ו-<b>Template</b>. כל משחק חדש מתחיל על קומות הקרח הקלאסיות.',
    'rules.1': 'הרודסטר ממשיך להאיץ כל עוד מחזיקים כיוון. ככל שהוא רץ מהר יותר, הוא קופץ גבוה ורחוק יותר.',
    'rules.2': 'קופצים מהקירות: מסתובבים ושומרים על רוב המהירות.',
    'rules.3': 'נחיתה לפחות שתי קומות מעל נקודת הקפיצה פותחת קומבו. ממשיכים כך לפני שהמד בצד שמאל מתרוקן.',
    'rules.4': 'קופצים מהר מספיק, והמכונית עושה סלטה אחורית. המדחפים יורים לאורך כל הסלטה.',
    'rules.5': 'כל 30 שניות השעון מצלצל והמגדל גולל מהר יותר. אל תיפלו מלמטה.',
    'install.h': 'התקנה',
    'install.meta': 'בחינם · אפליקציות למק ולווינדוס · כל השאר משחקים בדפדפן',
    'install.1': 'מורידים את',
    'install.1b': ' ולוחצים עליו פעמיים כדי לחלץ אותו.',
    'install.2': 'גוררים את האפליקציה לתיקיית Applications.',
    'install.3': 'רק בפעם הראשונה: לחיצה ימנית על האפליקציה (או Control-קליק), בוחרים <b>Open</b> ואז שוב <b>Open</b>. ‏macOS שואל פעם אחת, כי האפליקציה לא עברה notarization של Apple. מאז היא נפתחת כרגיל.',
    'install.sequoia': 'macOS 15 ומעלה ואין כפתור Open? נכנסים ל-<bdi>System Settings</bdi> ← <bdi>Privacy &amp; Security</bdi>, גוללים למטה ולוחצים <b>Open Anyway</b>.',
    'install.other': 'לינוקס, כרומבוק, אייפון, אנדרואיד, או מק או PC שאי אפשר להתקין עליו: לא צריך להתקין כלום.',
    'install.play': '[ &#9654; לשחק בדפדפן ]',
    'roadster.h': 'הרודסטר',
    'roadster.meta': 'נחשף ב-15 באוקטובר 2026 · מקגרגור, טקסס · מקורות למטה',
    'roadster.p1': 'בערב ה-15 באוקטובר 2026, באתר ניסויי הרקטות של SpaceX במקגרגור, טקסס, טסלה שידרה בשידור חי את הרודסטר החדש עושה דברים שמכוניות לא עושות. הוא נסע במעלה קיר מעוקל, עזב אותו הפוך ויישר את עצמו באוויר. הוא קפץ מעל כל שורת הדגמים של טסלה בגלגול חבית מלא. הוא האיץ מ-0 ל-60 מייל לשעה ב-0.81 שניות, לפי טסלה, כשסילונים לבנים יורים מאחור. במכונית לא ישב אף אחד, וכל פעלול היה ריצה מתוכננת אחת.<sup><a href="#src-1">1</a>,<a href="#src-2">2</a>,<a href="#src-6">6</a></sup>',
    'roadster.p2': 'גרסת ה-Rocket העליונה נושאת עשר פיות גז קר, שמוזנות מאוויר דחוס בלחץ של כ-5,500 psi. שום דבר לא בוער. הפליטה היא אדים לבנים שנראים תכלכלים באורות הבמה, אף פעם לא להבה, ולכן הגז במשחק בצבע תכלת-קרח ולבן.<sup><a href="#src-3">3</a>,<a href="#src-4">4</a></sup>',
    'flipstrip': 'איור 1 — שמונה מתוך 64 זוויות הסלטה שרונדרו מראש. פיקסל-ארט מקורי, צויר במיוחד למהדורה הזו.',
    'flipstrip.aria': 'ספרייט הרודסטר בשמונה זוויות של סלטה אחורית: ישר, אף למעלה, אנכי, מעבר לאנכי, הפוך, וחזרה סביב למצב ישר.',
    'nozzles.h': 'עשר פיות, שלושה תפקידים',
    't.group': 'קבוצה', 't.where': 'במכונית האמיתית', 't.fires': 'כיוון', 't.game': 'במשחק',
    't.r.name': 'ראשיות אחוריות', 't.r.where': 'שורה של ארבע בדיפיוזר האחורי, מתחת ללוחית', 't.r.fires': 'ישר אחורה', 't.r.game': 'שובל בזמן ספרינט; פוף כשעומדים במקום',
    't.d.name': 'הרמה', 't.d.where': 'אחת ליד כל גלגל', 't.d.fires': 'ישר למטה', 't.d.game': 'המראה, פולסים באמצע הסלטה, בלימת נחיתה',
    't.n.name': 'צידיות באף', 't.n.where': 'אחת בכל כנף קדמית', 't.n.fires': 'הצידה', 't.n.game': 'פוף קטן לכיוונכם בתחילת הסלטה ובסופה',
    'fx.h': 'מאיפה הגז יוצא',
    'fx.1.h': 'גז בעמידה', 'fx.1': 'בעמידה במקום, הפיות הראשיות האחוריות פולטות פוף ישר אחורה כל 0.6 שניות.',
    'fx.2.h': 'המראה', 'fx.2': 'סילוני ההרמה הקדמיים והאחוריים יורים יחד, חזק יותר בקפיצות גבוהות, ועננים מתגלגלים מתחת לגלגלים.',
    'fx.3.h': 'אף למעלה', 'fx.3': 'בקפיצת סלטה, סילון ההרמה הקדמי ממשיך לירות לבד לרגע ודוחף את האף מעל.',
    'fx.4.h': 'הפוך', 'fx.4': 'הפיות מקובעות לגוף, אז כשהמכונית הפוכה סילוני ה"למטה" מכוונים למעלה, כמו בפריימים ההפוכים של הקיקפליפ של טסלה.',
    'fx.5.h': 'נחיתה', 'fx.5': 'שני סילוני ההרמה בולמים את הנפילה, והגז ניתז הצידה מהפלטפורמה.',
    'liberty': 'חירות אחת שלקחנו: המכונית האמיתית הסתובבה סביב הציר הארוך שלה. מהצד, גלגול כזה נראה כמו מכונית שמראה את הגג ואז את הבטן, אז במגדל היא עושה סלטה אחורית במקום, עם אותן פיות.',
    'sources.h': 'מקורות',
    'src.1': 'החשיפה והקיקפליפ', 'src.2': 'גרסאות, מספר המדחפים', 'src.3': 'פריסת הפיות, ריצת 0.81 שנ׳, טלמטריה',
    'src.4': 'מכלי אוויר דחוס, פיות אחוריות', 'src.5': 'הצילומים של טסלה, נבדקו פריים אחר פריים למיקומי הסילונים',
    'src.6': 'גלגול חבית, נחיתות בענן עיבוי', 'src.7': 'טסלה רודסטר (דור שני)',
    'credits.h': 'קרדיטים',
    'credits.lead1': 'ICY TOWER',
    'credits.who': 'נכתב, עוצב וצויר על ידי יוהאן פייץ. מוזיקה ואפקטים קוליים: אנדרס סבנסון. אייסי טאוור הוא משחק חינמי (freeware).',
    'credits.honour': 'איך המהדורה הזו מכבדת את זה: קרדיט וקישור בכל עמוד, בחינם לתמיד, בלי פרסומות, בלי מעקב, בלי תרומות, ואף פעם לא נארז או נמכר. זו מהדורת מעריצים לא רשמית, שלא נוצרה ולא אושרה על ידי Free Lunch Design. אם אתם מ-Free Lunch Design ורוצים לשנות או להוריד משהו, <a href="' + ISSUES + '">פתחו issue</a> וזה ייעשה.',
    'credits.ours.h': 'המהדורה הזו',
    'credits.ours': 'הפיקסל-ארט של הרודסטר, אפקטי המדחפים והגז, הגרסאות הנייטיב למק, לווינדוס ולדפדפן, והאתר הזה: fire17 וחברים (בני אדם וסוכני AI), 2026.',
    'credits.license': 'החלקים שלנו פתוחים: הקוד תחת MIT, ציור הרודסטר וסרטון המשחק תחת CC BY 4.0. כל מה שמגיע מאייסי טאוור (המגדל, הרולד, המוזיקה, הצלילים, הפונטים, נתוני המשחק) נשאר © Free Lunch Design ואינו מכוסה ברישיונות האלה.',
    'credits.tm.h': 'סימנים מסחריים',
    'credits.tm': 'Tesla ו-Roadster הם סימנים מסחריים של <bdi>Tesla, Inc.</bdi> SpaceX הוא סימן מסחרי של <bdi>Space Exploration Technologies Corp.</bdi> זהו פרויקט מעריצים לא מסחרי ועצמאי, שאינו ממומן או מאושר על ידי Tesla או SpaceX. המכונית צוירה מאפס; לא נעשה שימוש בלוגו או בנכסים של Tesla.',
    'credits.font': 'גופן: <bdi>Cousine (SIL Open Font License)</bdi>.',
    'final.h': 'המגדל בגובה אינסופי. הרודסטר לעולם לא יגיע לפסגה.',
    'final.sub': 'זה לא אומר שלא כדאי לנסות.',
    'final.play': '[ &#9654; לשחק בדפדפן ]', 'final.mac': '[ הורדה למק ]',
    'menu.win': 'הורדה לווינדוס',
    'parity': 'הקלטות מקוריות · מק = ווינדוס = דפדפן · <bdi>145,141</bdi> גיבובי טיקים זהים',
    'menu.play.sub': 'כל מכשיר · לינוקס, כרומבוק, טלפונים · בלי התקנה',
    'menu.mac.sub': '<bdi>Apple Silicon</bdi> · <bdi>macOS 13</bdi> ומעלה · בפעם הראשונה: לחיצה ימנית ← <bdi>Open</bdi>',
    'menu.win.sub': 'ווינדוס <bdi>10/11 64-bit</bdi> · ב-<bdi>SmartScreen</bdi>: <bdi>More info</bdi> ← <bdi>Run anyway</bdi>',
    'faithful.all.h': 'שלושתן',
    'faithful.all': 'גיבובי מצב-משחק מלאים, טיק אחר טיק, זהים במק, בווינדוס ובדפדפן. שרשרת משולבת:',
    'faithful.h': 'נאמן 1:1',
    'faithful.meta': 'אותה ליבת C בכל פלטפורמה · נבדקה מול ההקלטות של המשחק המקורי עצמו',
    'faithful.p1': 'כל הגרסאות מריצות את אותה ליבת משחק בשפת C, שהועתקה מ-Icy Tower 1.3.1. המבחן הוא 16 ההקלטות שמגיעות עם המשחק המקורי. הקלטה שומרת מה השחקן לחץ, לא איפה הוא הגיע, כך שאם חוק פיזיקה אחד היה סוטה ולו במעט, הריצה הייתה נסחפת ונגמרת במקום אחר.',
    'faithful.mac': 'הקלטות מקוריות משחזרות בדיוק את הניקוד, הקומה והקומבו שנרשמו.',
    'faithful.win': 'הקלטות מקוריות משוחזרות, טיק אחר טיק.',
    'faithful.web': 'הקלטות מקוריות משוחזרות, טיק אחר טיק.',
    'install.mac.h': 'מק',
    'install.mac.req': '<bdi>Apple Silicon</bdi> (<bdi>M1</bdi> ומעלה) · <bdi>macOS 13 Ventura</bdi> ומעלה',
    'install.win.h': 'ווינדוס',
    'install.win.req': 'ווינדוס 10 או 11, <bdi>64-bit</bdi>',
    'install.w1b': ', לוחצים עליו לחיצה ימנית ובוחרים Extract All.',
    'install.w2': 'פותחים את התיקייה שחולצה ומריצים את המשחק.',
    'install.w3': 'אם Windows SmartScreen מציג "Windows protected your PC", לוחצים <b>More info</b> ואז <b>Run anyway</b>. הוא שואל כי האפליקציה לא חתומה דיגיטלית.',
    'install.else.h': 'כל השאר',
    'final.win': '[ הורדה לווינדוס ]',
    'disclaimer': 'שחזור של מעריצים — לא קשור ל-<bdi>Free Lunch Design</bdi> ולא מאושר על ידה. <bdi>Icy Tower</bdi> הוא © <bdi>Johan Peitz / Free Lunch Design</bdi>.',
    'foot.releases': 'גרסאות', 'foot.top': 'חזרה לקומה 0'
  };
  var EN = {};
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var ariaNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-aria]'));
  nodes.forEach(function (n) { EN[n.getAttribute('data-i18n')] = n.innerHTML; });
  ariaNodes.forEach(function (n) { EN['aria:' + n.getAttribute('data-i18n-aria')] = n.getAttribute('aria-label'); });
  EN['lang.aria'] = 'עברית';

  function applyLang(lang) {
    var he = lang === 'he';
    d.setAttribute('lang', he ? 'he' : 'en');
    d.setAttribute('dir', he ? 'rtl' : 'ltr');
    nodes.forEach(function (n) {
      var k = n.getAttribute('data-i18n');
      var v = he ? HE[k] : EN[k];
      if (v != null && n.innerHTML !== v) n.innerHTML = v;
    });
    ariaNodes.forEach(function (n) {
      var k = n.getAttribute('data-i18n-aria');
      var v = he ? HE[k] : (EN['aria:' + k] || EN[k]);
      if (v) n.setAttribute('aria-label', v);
    });
    var lb = document.getElementById('lang');
    if (lb) lb.setAttribute('aria-label', he ? 'English' : 'עברית');
    document.title = he ? 'אייסי טאוור: מהדורת רודסטר' : 'Icy Tower: Roadster Edition';
    labelTable();
    placePointer();
  }
  function currentLang() { return d.getAttribute('lang') === 'he' ? 'he' : 'en'; }

  /* table cells carry their column name for the stacked phone layout */
  function labelTable() {
    var t = document.querySelector('.nozzles'); if (!t) return;
    var heads = t.querySelectorAll('thead th');
    t.querySelectorAll('tbody tr').forEach(function (tr) {
      Array.prototype.forEach.call(tr.children, function (c, i) { if (c.tagName === 'TD' && heads[i]) c.setAttribute('data-label', heads[i].textContent.trim()); });
    });
  }

  /* ---------------- theme ---------------- */
  var mqLight = window.matchMedia('(prefers-color-scheme: light)');
  function effectiveTheme() { return d.getAttribute('data-theme') || (mqLight.matches ? 'light' : 'dark'); }
  function syncThemeUI() {
    var t = effectiveTheme(), b = document.getElementById('theme');
    if (b) b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', t === 'dark' ? '#13142a' : '#f3f6fa'); m.removeAttribute('media'); });
  }

  /* ---------------- title-screen menu ---------------- */
  var menu = document.querySelector('.menu');
  var items = menu ? Array.prototype.slice.call(menu.querySelectorAll('.menu__item')) : [];
  var car = menu ? menu.querySelector('.menu__car') : null;
  function select(item) {
    items.forEach(function (i) { i.classList.toggle('is-on', i === item); });
    placePointer();
  }
  function placePointer() {
    if (!car) return;
    var on = menu.querySelector('.menu__item.is-on') || items[0];
    if (!on) return;
    var lab = on.querySelector('span') || on; /* point at the label line, not the sub-line */
    var y = lab.offsetTop + lab.offsetHeight / 2 - (car.offsetHeight || 21) / 2;
    car.style.setProperty('--y', Math.round(y) + 'px');
  }
  items.forEach(function (it, idx) {
    it.addEventListener('pointerenter', function () { select(it); });
    it.addEventListener('focus', function () { select(it); });
    it.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowDown') n = items[(idx + 1) % items.length];
      if (e.key === 'ArrowUp') n = items[(idx - 1 + items.length) % items.length];
      if (n) { e.preventDefault(); n.focus(); }
    });
  });

  /* ---------------- video ---------------- */
  var video = document.getElementById('teaser');
  var shaft = document.querySelector('.shaft');
  var soundBtn = document.getElementById('sound');
  var full = false;
  if (video) {
    if (reduce.matches) { video.removeAttribute('autoplay'); video.pause(); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (full) return;
          if (e.isIntersecting && !reduce.matches) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
          else video.pause();
        });
      }, { threshold: 0.15 }).observe(video);
    }
  }
  if (soundBtn && video) soundBtn.addEventListener('click', function () {
    full = true;
    video.pause();
    video.loop = false; video.muted = false; video.controls = true;
    video.setAttribute('poster', 'assets/video/poster.jpg');
    video.src = 'assets/video/roadster-gameplay.mp4';
    video.load();
    shaft.classList.add('is-full');
    var p = video.play(); if (p && p.catch) p.catch(function () {});
    video.focus({ preventScroll: true });
  });

  /* ---------------- the climb ---------------- */
  var climb = document.querySelector('.climb');
  var cCar = climb && climb.querySelector('.climb__car');
  var cNum = climb && climb.querySelector('.climb__num');
  var lastFloor = -1, lastTen = 0, ticking = false;
  function setFloor(f) {
    var s = ('00' + f).slice(-3);
    if (!cNum.children.length) cNum.innerHTML = '<i>0</i><i>0</i><i>0</i>';
    for (var i = 0; i < 3; i++) {
      var el = cNum.children[i];
      if (el.textContent !== s[i]) {
        el.textContent = s[i];
        if (!reduce.matches) { el.classList.remove('roll'); void el.offsetWidth; el.classList.add('roll'); }
      }
    }
  }
  function puffs() {
    if (reduce.matches) return;
    for (var i = 0; i < 7; i++) {
      var p = document.createElement('span');
      p.className = 'puff';
      p.style.left = (22 + Math.random() * 28) + 'px';
      p.style.top = (44 + Math.random() * 10) + 'px';
      p.style.setProperty('--dx', ((Math.random() - 0.5) * 50).toFixed(1) + 'px');
      p.style.setProperty('--dy', (16 + Math.random() * 30).toFixed(1) + 'px');
      cCar.appendChild(p);
      setTimeout(function (el) { el.remove(); }, 950, p);
    }
  }
  function flip() {
    if (reduce.matches) return;
    climb.classList.remove('is-flipping'); void climb.offsetWidth; climb.classList.add('is-flipping');
    puffs();
  }
  function onScroll() {
    ticking = false;
    if (!climb || getComputedStyle(climb).display === 'none') return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    var trackH = climb.clientHeight - 72 - 42;
    cCar.style.setProperty('--cy', Math.round((1 - p) * trackH) + 'px');
    var f = Math.round(p * 60);
    if (f !== lastFloor) { setFloor(f); lastFloor = f; }
    var ten = Math.floor(f / 10);
    if (ten !== lastTen) { if (ten > lastTen) flip(); lastTen = ten; }
  }
  if (climb) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener('resize', function () { onScroll(); placePointer(); });
  }

  /* ---------------- wire up ---------------- */
  document.getElementById('theme').addEventListener('click', function () {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    d.setAttribute('data-theme', next); store.set('it-theme', next); syncThemeUI();
  });
  document.getElementById('lang').addEventListener('click', function () {
    var next = currentLang() === 'he' ? 'en' : 'he';
    store.set('it-lang', next); applyLang(next);
  });
  if (mqLight.addEventListener) mqLight.addEventListener('change', syncThemeUI);

  applyLang(currentLang());
  syncThemeUI();
  onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placePointer(); onScroll(); });
})();
