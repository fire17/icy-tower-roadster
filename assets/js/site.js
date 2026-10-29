/* Icy Tower: Roadster Edition — site behaviour.
   Theme, English/Hebrew, the title-screen menu pointer, the video, and the margin climb. */
(function () {
  'use strict';
  var d = document.documentElement;
  if (/[?&]touch=1\b/.test(location.search) || (window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches)) d.classList.add('touch');
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
    'menu.play': 'לשחק בדפדפן', 'menu.mac': 'הורדה למק', 'menu.instructions': 'הוראות', 'menu.roadster': 'הרודסטר', 'menu.credits': 'קרדיטים',
    'sound': '[ &#9654; לצפייה עם סאונד ]',
    'general.h': 'כללי',
    'general.meta': 'בחינם · בלי פרסומות · בלי חשבונות · בלי מעקב',
    'general.p1': 'אייסי טאוור הוא משחק חינמי משנת 2001 של יוהאן פייץ מ-Free Lunch Design. מטפסים על מגדל בגובה אינסופי, וככל שרצים מהר יותר קופצים גבוה יותר. מהדורת המעריצים הזו שומרת על המשחק הזה ומוסיפה מטפס חדש אחד: הטסלה רודסטר מהדור השני, שטסלה הציגה עפה ב-15 באוקטובר 2026.',
    'general.p2': 'מתחת למכסה המנוע יש בנייה מחדש, נייטיב, של Icy Tower 1.3.1, שהועתקה מהמקור שגרה אחר שגרה, כך שהקפיצות מרגישות בדיוק כמו שאתם זוכרים. זה רץ על מק, על ווינדוס ובדפדפן.',
    'playing.h': 'משחק',
    'playing.meta': 'מקלדת · אותם מקשים כמו ב-2001',
    'keys.run': 'ריצה שמאלה / ימינה', 'keys.jump': 'קפיצה', 'keys.pause': 'השהיה', 'keys.restart': 'התחלה מחדש', 'keys.mute': 'השתקה', 'keys.char': 'החלפת מטפס',
    'climbers': '116 מטפסים: <b>הרודסטר</b> (ברירת המחדל), <b>הרולד</b>, <b>דיסקו דייב</b>, <b>Template</b> ועוד 112 דמויות של מעריצים, כל אחת עם הצלילים שלה (<a href="credits.html">קרדיטים</a>). מחליפים ב-<kbd>C</kbd>. כל משחק חדש מתחיל על קומות הקרח הקלאסיות.',
    'rules.1': 'הרודסטר ממשיך להאיץ כל עוד מחזיקים כיוון. ככל שהוא רץ מהר יותר, הוא קופץ גבוה ורחוק יותר.',
    'rules.2': 'קופצים מהקירות: מסתובבים ושומרים על רוב המהירות.',
    'rules.3': 'נחיתה לפחות שתי קומות מעל נקודת הקפיצה פותחת קומבו. ממשיכים כך לפני שהמד בצד שמאל מתרוקן.',
    'rules.4': 'קופצים מהר מספיק, והמכונית עושה סלטה אחורית. המדחפים יורים לאורך כל הסלטה.',
    'rules.5': 'כל 30 שניות השעון מצלצל והמגדל גולל מהר יותר. אל תיפלו מלמטה.',
    'install.h': 'התקנה',
    'install.meta': 'בחינם · אפליקציות למק ולווינדוס · כל השאר משחקים בדפדפן',
    'install.1': 'מורידים את',
    'install.1b': ' ולוחצים עליו פעמיים כדי לפתוח אותו.',
    'install.2': 'גוררים את האפליקציה לתיקיית Applications בחלון שנפתח.',
    'install.3': 'פותחים אותה מ-Applications. היא חתומה ומאושרת על ידי Apple, אז היא נפתחת מיד בלי שלבים נוספים.',
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
    'menu.mac.sub': '<bdi>Apple Silicon</bdi> · <bdi>macOS 13</bdi> ומעלה · חתום על ידי Apple, נפתח כרגיל',
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
    'char.roadster': 'טסלה רודסטר', 'char.harold': 'הרולד ההומבוי', 'char.dave': 'דיסקו דייב', 'char.template': 'התבנית',
    'char.roadster.blurb': 'הרודסטר של 2026. עושה סלטות במעלה המגדל על סילוני גז קר שיורים ממיקומי הפיות האמיתיים.',
    'char.harold.blurb': 'המטפס המקורי מאז 2001. כובע גרב, בלי מדחפים, רק רגליים.',
    'char.dave.blurb': 'אפרו, חליפה ורודה, מכנסיים לבנים מתרחבים. המטפס השני של המשחק המקורי, עדיין רוקד במעלה הקומות.',
    'char.template.blurb': 'קווי המתאר הריקים שהמשחק המקורי צירף, כדי שכל אחד יוכל לצייר מטפס משלו.',
    'shaft.aria': 'ארבעת המטפסים', 'shaft.prev': 'המטפס הקודם', 'shaft.next': 'המטפס הבא',
    'ed.harold': 'מהדורה קלאסית', 'ed.dave': 'מהדורת דיסקו דייב', 'ed.roadster': 'מהדורת רודסטר', 'ed.template': 'מהדורת התבנית',
    'pitch.harold': 'הרולד ההומבוי, עם כובע הגרב משוך על העיניים, מטפס על המגדל הזה מאז 2001. המגדל בגובה אינסופי, וככל שרצים מהר יותר קופצים גבוה יותר.',
    'pitch.dave': 'דיסקו דייב עולה לרחבה: אפרו, חליפה ורודה, מכנסיים לבנים מתרחבים. אותו מגדל ואותה פיזיקה, עם יותר סטייל בכל קפיצה.',
    'pitch.roadster': 'למגדל של הרולד יש מטפס חדש: הטסלה רודסטר של 2026. הוא עושה סלטות אחוריות במעלה הקומות על מדחפי גז קר, שיורים בדיוק מהמקומות שבהם נמצאות הפיות של המכונית האמיתית.',
    'pitch.template': 'קווי המתאר הריקים שהמשחק המקורי צירף, כדי שכל אחד יוכל לצייר מטפס משלו. הביאו את הפיקסלים שלכם.',
    'hint.keys': '<bdi dir="ltr">← → / C</bdi> להחלפה · <bdi>M</bdi> להשתקה', 'hint.touch': 'החליקו כדי להחליף מטפס',
    'vol.aria': 'סאונד', 'vol.slider': 'עוצמת קול',
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
    if (typeof volUI === 'function') volUI();
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
  function setPointerChar(id) {
    if (!car || car.getAttribute('data-char') === id) return;
    car.setAttribute('data-char', id);
    if (!reduce.matches) { car.classList.remove('is-swap'); void car.offsetWidth; car.classList.add('is-swap'); }
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

  /* ---------------- sound: the original menu music + each climber's own sounds ----------------
     Opt-in: nothing plays before the first key or tap (the PRESS START press is the natural unlock).
     Files are the game's own, shared with /play/ (play/audio, ogg or m4a). Volume + mute persist. */
  var AUD = 'play/audio/', ac = null, master = null, musicGain = null, musicOn = false, bufs = {};
  var vol = 0.6, muted = false;
  try { var sv = localStorage.getItem('it-vol'); if (sv !== null && !isNaN(+sv)) vol = Math.max(0, Math.min(1, +sv)); muted = localStorage.getItem('it-mute') === '1'; } catch (e) {}
  var EXT = (function () { var a = document.createElement('audio'); return a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"') ? '.ogg' : '.m4a'; })();
  var alog = /[?&]audiolog\b/.test(location.search) ? (window.itAudioLog = []) : null;
  function logA(m) { if (alog) { alog.push(m); console.info('[audio] ' + m); } }
  var SETS = {   /* character sound slots 116-122 (116-118 = the jumps); the Template has none, so it uses the default set */
    harold: ['h116', 'h117', 'h118', 'h119', 'h120', 'h121', 'h122'],
    dave: ['d116', 'd117', 'd118', 'd119', 'd120', 'd121', 'd122'],
    roadster: ['r116', 'r117', 'r118']
  };
  SETS.template = SETS.harold;
  function level() { return muted ? 0 : vol; }
  function load(key) {
    if (!bufs[key]) bufs[key] = fetch(AUD + key + EXT).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (b) { return new Promise(function (res, rej) { ac.decodeAudioData(b, res, rej); }); });
    return bufs[key];
  }
  function unlock() {
    if (ac) return;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC(); master = ac.createGain(); master.gain.value = level(); master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.55; musicGain.connect(master);
    if (ac.resume) ac.resume();
    logA('unlocked ' + ac.state);
    if (!muted) startMusic();
  }
  function startMusic() {
    if (!ac || musicOn) return; musicOn = true;
    load('s3').then(function (buf) {     /* S_BG_MENU: the original menu loop, sample 3 of sfx13 */
      var src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      src.loopStart = 0; src.loopEnd = Math.min(buf.duration, 1006414 / 44100);   /* the original's exact frame count */
      src.connect(musicGain); src.start();
      logA('music s3' + EXT + ' loop=' + src.loop + ' end=' + src.loopEnd.toFixed(3) + 's state=' + ac.state);
    }).catch(function (e) { musicOn = false; logA('music failed ' + e); });
  }
  function playSfx(key, g) {
    if (!ac || muted || !vol) return;
    load(key).then(function (buf) {
      var src = ac.createBufferSource(), gn = ac.createGain(); gn.gain.value = g == null ? 1 : g;
      src.buffer = buf; src.connect(gn); gn.connect(master); src.start();
      logA('sfx ' + key + EXT);
    }).catch(function (e) { logA('sfx failed ' + key + ' ' + e); });
  }
  function charSound(id, user) {
    var set = SETS[id] || SETS.harold;
    if (user) { playSfx('s11', .8); playSfx(set[Math.floor(Math.random() * set.length)], 1); }   /* S_MENU_CHANGE + one of theirs */
    else playSfx(set[Math.floor(Math.random() * Math.min(3, set.length))], .55);                /* auto-rotate: a soft jump */
  }
  var volBox = document.querySelector('.vol'), volBtn = document.getElementById('vol-mute'), volSl = document.getElementById('vol-slider');
  function volUI() {
    if (!volBox) return;
    volBox.classList.toggle('is-muted', muted || !vol);
    volBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    var he = d.getAttribute('lang') === 'he';
    volBtn.setAttribute('aria-label', muted ? (he ? 'השמע סאונד' : 'Unmute sound') : (he ? 'השתק סאונד' : 'Mute sound'));
    volSl.value = Math.round(vol * 100);
  }
  function applyLevel() {
    try { localStorage.setItem('it-vol', String(vol)); localStorage.setItem('it-mute', muted ? '1' : '0'); } catch (e) {}
    if (master) master.gain.setTargetAtTime(level(), ac.currentTime, 0.04);
    if (ac && !muted && vol) startMusic();
    volUI();
  }
  function setMuted(m) { muted = m; logA(m ? 'muted' : 'unmuted'); applyLevel(); }
  if (volBox) {
    var phoneVol = window.matchMedia('(max-width: 600px)'), volTimer = 0;
    function volOpen(o) {   /* phone popover: closes 3 s after the last touch */
      volBox.classList.toggle('is-open', o); clearTimeout(volTimer);
      if (o) volTimer = setTimeout(function () { volOpen(false); }, 3000);
    }
    volBtn.addEventListener('click', function () {
      unlock();
      if (phoneVol.matches && !volBox.classList.contains('is-open')) { volOpen(true); return; }   /* first tap opens */
      setMuted(!muted); if (phoneVol.matches) volOpen(true);
    });
    volSl.addEventListener('input', function () { unlock(); vol = (+volSl.value) / 100; if (vol && muted) muted = false; applyLevel(); if (phoneVol.matches) volOpen(true); });
    document.addEventListener('pointerdown', function (e) { if (!volBox.contains(e.target)) volOpen(false); });
    volUI();
  }
  /* the first key or tap anywhere (the PRESS START press, normally) unlocks audio */
  function gesture(e) {   /* modifier keys are not a user activation, so they never unlock */
    if (e.type === 'keydown' && /^(Shift|Control|Alt|Meta|CapsLock|Tab)$/.test(e.key)) return;
    if (!ac) unlock();
    else if (ac.state === 'suspended' && ac.resume) ac.resume().then(function () { logA('resumed ' + ac.state); });
  }
  window.addEventListener('pointerdown', gesture, true); window.addEventListener('keydown', gesture, true);

  /* ---------------- the shaft: a carousel of the four climbers ---------------- */
  var shaft = document.getElementById('shaft');
  var slides = shaft ? Array.prototype.slice.call(shaft.querySelectorAll('.slide')) : [];
  var dots = shaft ? Array.prototype.slice.call(shaft.querySelectorAll('.shaft__dot')) : [];
  var soundBtn = document.getElementById('sound');
  var DWELL = 10000, cur = 0, timer = null, held = false, inView = true, full = false, userPausedUntil = 0;
  var CLIPS = {};   /* filled from assets/video/chars/clips.json: { id: { src, poster, sound? } } */
  function vid(i) { return slides[i] && slides[i].querySelector('.slide__video'); }
  function posterOnly(i) {
    var c = CLIPS[slides[i].getAttribute('data-char')], v = vid(i);
    if (c && c.poster && v && !v.getAttribute('poster')) v.setAttribute('poster', 'assets/video/chars/' + c.poster);
  }
  function loadClip(i) {
    var sl = slides[i], v = vid(i), c = CLIPS[sl.getAttribute('data-char')];
    if (!c || !v || v.getAttribute('src')) return;
    if (c.poster) { v.setAttribute('poster', 'assets/video/chars/' + c.poster); sl.classList.add('has-video'); }
    v.addEventListener('loadeddata', function () { sl.classList.add('has-video'); }, { once: true });
    v.addEventListener('loadedmetadata', function () {
      if (v.videoWidth) shaft.style.setProperty('--ar', v.videoWidth + ' / ' + v.videoHeight);
    }, { once: true });
    v.addEventListener('error', function () { sl.classList.remove('has-video'); }, { once: true });
    v.src = 'assets/video/chars/' + c.src;
  }
  function playCur() {
    slides.forEach(function (sl, i) {
      var v = vid(i); if (!v || !v.getAttribute('src')) return;
      if (i === cur && inView && !reduce.matches && !full) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else if (!(full && i === cur)) v.pause();
    });
  }
  var first = true, title = document.querySelector('.title');
  function setEdition(id, animate) {
    d.setAttribute('data-edition', id);
    Array.prototype.forEach.call(document.querySelectorAll('[data-ed]'), function (el) { el.classList.toggle('is-on', el.getAttribute('data-ed') === id); });
    if (animate && title) { title.classList.remove('is-swap'); void title.offsetWidth; title.classList.add('is-swap'); }
    if (typeof paintHead === 'function') paintHead();
  }
  var lastUserSwitch = 0;
  function show(i, fromUser) {
    if (fromUser) { var nowS = Date.now(); if (nowS - lastUserSwitch < 250) return; lastUserSwitch = nowS; }
    if (!slides.length) return;
    cur = (i + slides.length) % slides.length;
    var id = slides[cur].getAttribute('data-char');
    slides.forEach(function (sl, k) { var on = k === cur; sl.classList.toggle('is-on', on); if (on) sl.removeAttribute('aria-hidden'); else sl.setAttribute('aria-hidden', 'true'); });
    dots.forEach(function (b, k) { b.classList.toggle('is-on', k === cur); if (k === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    shaft.setAttribute('data-on', id);
    setEdition(id, !first && !reduce.matches);
    if (!first) charSound(id, !!fromUser);
    first = false;
    loadClip(cur); posterOnly((cur + 1) % slides.length);
    playCur();
    setPointerChar(id);
    if (fromUser) userPausedUntil = Date.now() + 20000;
    restartMeter();
  }
  function restartMeter() {
    clearTimeout(timer);
    var auto = !reduce.matches && !full && inView && !document.hidden;
    shaft.classList.remove('is-auto'); void shaft.offsetWidth;
    if (!auto) return;
    var wait = Math.max(DWELL, userPausedUntil - Date.now());
    shaft.style.setProperty('--dwell', wait + 'ms');
    shaft.classList.add('is-auto');
    timer = setTimeout(function tick() { if (held) { timer = setTimeout(tick, 400); return; } show(cur + 1); }, wait);
  }
  function hold(h) { held = h; shaft.classList.toggle('is-held', h); }
  if (shaft) {
    document.getElementById('prev').addEventListener('click', function () { show(cur - 1, true); });
    document.getElementById('next').addEventListener('click', function () { show(cur + 1, true); });
    dots.forEach(function (b) { b.addEventListener('click', function () { show(+b.getAttribute('data-go'), true); }); });
    shaft.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hold(true); });
    shaft.addEventListener('pointerleave', function () { hold(false); });
    shaft.addEventListener('focusin', function () { hold(true); });
    shaft.addEventListener('focusout', function () { hold(false); });
    window.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
      var t = e.target, tag = t && t.tagName;
      if (t && (t.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')) return;   /* never steal typing or the volume slider */
      if (d.classList.contains('boot-on') || e.repeat) return;   /* a held key must not machine-gun the editions */
      var k = e.key, rtl = d.getAttribute('dir') === 'rtl';
      if (k === 'm' || k === 'M') { unlock(); setMuted(!muted); e.preventDefault(); return; }
      if (!inView) return;                                   /* only while the hero is on screen */
      if (k === 'ArrowRight') { show(cur + (rtl ? -1 : 1), true); e.preventDefault(); }
      else if (k === 'ArrowLeft') { show(cur + (rtl ? 1 : -1), true); e.preventDefault(); }
      else if (k === 'c' || k === 'C') { show(cur + 1, true); e.preventDefault(); }
    });
    var portrait = document.querySelector('.edition__portrait');
    if (portrait) {
      portrait.addEventListener('click', function () { show(cur + 1, true); });
      portrait.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { show(cur + 1, true); e.preventDefault(); } });
    }
    var ex = null, edCard = document.querySelector('.edition');   /* swipe on the edition card too */
    if (edCard) {
      edCard.addEventListener('touchstart', function (e) { ex = e.touches[0].clientX; }, { passive: true });
      edCard.addEventListener('touchend', function (e) {
        if (ex == null) return; var dx = e.changedTouches[0].clientX - ex; ex = null;
        if (Math.abs(dx) > 40) show(cur + ((dx < 0) !== (d.getAttribute('dir') === 'rtl') ? 1 : -1), true);
      }, { passive: true });
    }
    var sx = null;   /* swipe between climbers on touch */
    shaft.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    shaft.addEventListener('touchend', function (e) {
      if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) show(cur + ((dx < 0) !== (d.getAttribute('dir') === 'rtl') ? 1 : -1), true);
    }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting; playCur(); restartMeter();
    }, { threshold: 0.2 }).observe(shaft);
    document.addEventListener('visibilitychange', function () { playCur(); restartMeter(); });
    if (reduce.addEventListener) reduce.addEventListener('change', function () { playCur(); restartMeter(); });
    fetch('assets/video/chars/clips.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; }).then(function (j) { CLIPS = j || {}; show(cur); });
  }
  if (soundBtn && shaft) soundBtn.addEventListener('click', function () {
    var ri = slides.findIndex(function (sl) { return sl.getAttribute('data-char') === 'roadster'; }), v = vid(ri), c = CLIPS.roadster || {};
    if (!c.sound) return;
    full = true; clearTimeout(timer); shaft.classList.remove('is-auto'); shaft.classList.add('is-full');
    show(ri); full = true;
    v.loop = false; v.muted = false; v.controls = true;
    v.src = 'assets/video/chars/' + c.sound;
    slides[ri].classList.add('has-video');
    v.addEventListener('loadedmetadata', function () { if (v.videoWidth) shaft.style.setProperty('--ar', v.videoWidth + ' / ' + v.videoHeight); }, { once: true });
    v.load(); var p = v.play(); if (p && p.catch) p.catch(function () {});
    v.focus({ preventScroll: true });
  });

  /* ---------------- ledges: climbers stroll only while on screen ---------------- */
  var ledges = document.querySelectorAll('.ledge');
  if ('IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-live', e.isIntersecting); }); }, { rootMargin: '40px' });
    Array.prototype.forEach.call(ledges, function (l) { lio.observe(l); });
  }

  /* ---------------- combo bursts on hover ---------------- */
  var LADDER = ['GOOD!', 'SWEET!', 'GREAT!', 'SUPER!', 'WOW!', 'AMAZING!', 'EXTREME!', 'FANTASTIC!', 'SPLENDID!', 'NO WAY!'];
  var combo = 0, lastHit = 0, lastEl = null;
  function burst(el) {
    if (reduce.matches) return;
    var now = Date.now();
    if (el === lastEl && now - lastHit < 700) return;
    combo = now - lastHit < 1600 ? Math.min(combo + 1, LADDER.length - 1) : 0;
    lastHit = now; lastEl = el;
    var r = el.getBoundingClientRect(), b = document.createElement('span');
    b.className = 'combo'; b.textContent = LADDER[combo];
    b.style.setProperty('--cs', (1.35 + combo * 0.12).toFixed(2) + 'rem');
    var x = d.getAttribute('dir') === 'rtl' ? r.left + 24 : r.right - 24;
    b.style.left = Math.min(Math.max(x, 70), window.innerWidth - 70) + 'px';
    b.style.top = Math.max(r.top - 12, 8) + 'px';
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 1000);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.menu__item, .block, .parity a'), function (el) {
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') burst(el); });
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

  /* ---------------- title heads: the original menu's bob + sway ----------------
     Exact port of it_original_menu_face_transform (game/native/original_menu_visual.c), 50 Hz menu tick.
     Original cosine table == round(cos * 65536); phase>>15 indices reduce to (tick*k - 128) & 511.
       bob   = fixed_round(cos[(tick*10 - 128) & 511] * 10) + 10   -> 0..20 px, period 51.2 ticks
       angle = cos[(tick*6 - 128) & 511] * 5 (Allegro units, 256 = 360 deg) -> +-7.03 deg, period 85.33 ticks
     Expression: each tick, 1 in 198 chance to advance face (face+1) % 3, as the original. */
  var COS = []; for (var ci = 0; ci < 512; ci++) COS.push(Math.round(Math.cos(ci * Math.PI / 256) * 65536));
  function fixedRound(v) { return (v >> 16) + ((v & 32768) ? 1 : 0); }
  function faceAt(tick) {
    return { bob: fixedRound(COS[(tick * 10 - 128) & 511] * 10) + 10, deg: COS[(tick * 6 - 128) & 511] * 5 / 65536 * 360 / 256 };
  }
  var mtick = 0, mface = 0, acc = 0, lastT = 0, headRaf = 0, headVisible = true;
  var freezeAt = /[?&]facetick=(\d+)/.exec(location.search);   /* test hook: freeze at a given tick */
  function paintHead() {
    var p = document.querySelector('.portrait.is-on'); if (!p) return;
    var ps = parseFloat(getComputedStyle(p.parentNode.parentNode).getPropertyValue('--ps')) || 1, f = faceAt(mtick);
    p.style.transform = 'translateY(' + ((f.bob - 20) * ps).toFixed(2) + 'px) rotate(' + f.deg.toFixed(3) + 'deg)' + (d.getAttribute('dir') === 'rtl' ? ' scaleX(-1)' : '');
    p.style.setProperty('--fr', mface);
  }
  function headLoop(now) {
    headRaf = 0;
    if (!headVisible || reduce.matches) { lastT = 0; return; }
    if (lastT) acc += Math.min(now - lastT, 250);
    lastT = now;
    while (acc >= 20) { acc -= 20; mtick++; if (Math.random() * 198 < 1) mface = (mface + 1) % 3; }
    paintHead();
    headRaf = requestAnimationFrame(headLoop);
  }
  function startHeads() {
    if (freezeAt) { mtick = +freezeAt[1]; paintHead(); window.itFaceTick = function (t, face) { mtick = t; if (face != null) mface = face; paintHead(); }; return; }
    if (reduce.matches) { Array.prototype.forEach.call(document.querySelectorAll('.portrait'), function (p) { p.style.transform = d.getAttribute('dir') === 'rtl' ? 'scaleX(-1)' : ''; p.style.setProperty('--fr', 0); }); return; }
    if (!headRaf) headRaf = requestAnimationFrame(headLoop);
  }
  var edEl = document.querySelector('.edition');
  if (edEl && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { headVisible = es[0].isIntersecting; if (headVisible) startHeads(); }).observe(edEl);
  if (reduce.addEventListener) reduce.addEventListener('change', startHeads);
  startHeads();

  /* ---------------- boot: PRESS START (once per visit; any key or tap skips) ---------------- */
  (function boot() {
    var el = document.getElementById('boot');
    if (!el || !d.classList.contains('boot-on')) return;
    try { sessionStorage.setItem('it-boot', '1'); } catch (e) {}
    var num = document.getElementById('boot-floor'), t0 = Date.now(), loaded = document.readyState === 'complete', done = false, f = 0;
    window.addEventListener('load', function () { loaded = true; });
    function finish() {
      if (done) return; done = true;
      el.classList.add('is-out');
      setTimeout(function () { d.classList.remove('boot-on'); }, 380);
      window.removeEventListener('keydown', finish); window.removeEventListener('pointerdown', finish);
    }
    window.addEventListener('keydown', finish); window.addEventListener('pointerdown', finish);
    (function step() {
      if (done) return;
      var age = Date.now() - t0, cap = (loaded || age > 2200) ? 100 : 80;
      f = Math.min(cap, f + (cap === 100 ? 7 : 3));
      num.textContent = ('00' + f).slice(-3);
      if (f >= 100) { el.classList.add('is-ready'); setTimeout(finish, 650); return; }
      setTimeout(step, 28);
    })();
  })();

  applyLang(currentLang());
  syncThemeUI();
  onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placePointer(); onScroll(); });
})();
