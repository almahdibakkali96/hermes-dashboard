// Builds the three Brevo emails (email-1-launch.html, email-2-numbers.html, email-3-last-day.html).
//   node brand/campaign-10k/06-email/build.mjs
// Paste each file in Brevo: Campaigns → Create → Email → design "Code your own" (HTML).
// Generic for everyone (no contact attributes); {{ unsubscribe }} is Brevo's own link.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.arabtides.com';
const IMG = `${SITE}/email`;
const link = (id) => `${SITE}/calendar?utm_source=email&utm_medium=email&utm_campaign=cal-launch&utm_content=${id}`;
const FOR = 'لميناءك';
const NAVY = '#0b2a4a', TEAL = '#0f8b8d', TEXT = '#1f2937', MUTED = '#6b7280';
const FONT = "Tahoma, 'Segoe UI', Arial, sans-serif";

const p = (html, extra = '') => `<p style="margin:0 0 16px;font:16px/1.8 ${FONT};color:${TEXT};${extra}">${html}</p>`;
const n = (v) => `<span dir="ltr" style="unicode-bidi:embed">${v}</span>`;
const button = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 20px">
  <tr><td align="center" bgcolor="${TEAL}" style="border-radius:10px">
    <a href="${href}" style="display:inline-block;padding:14px 30px;font:bold 18px/1.4 ${FONT};color:#ffffff;text-decoration:none;border-radius:10px">${label}</a>
  </td></tr>
</table>`;
const img = (file, alt, href, w = 520) => `
<a href="${href}" style="text-decoration:none"><img src="${IMG}/${file}" width="${w}" alt="${alt}" style="display:block;width:100%;max-width:${w}px;height:auto;margin:4px auto 20px;border:1px solid #e5e7eb;border-radius:8px"></a>`;
const list = (items) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px">${items.map(t =>
  `<tr><td valign="top" style="padding:3px 0 3px 10px;font:bold 16px/1.8 ${FONT};color:${TEAL}">✓</td><td style="padding:3px 0;font:16px/1.8 ${FONT};color:${TEXT}">${t}</td></tr>`).join('')}</table>`;
const price = `<div style="margin:0 0 18px;padding:14px 16px;background:#eef8f8;border-radius:10px;font:16px/1.8 ${FONT};color:${TEXT};text-align:center">
  سعر الإطلاق <b style="font-size:20px;color:${NAVY}">${n('4.99$')}</b> بدل <s style="color:${MUTED}">${n('6.99$')}</s>، حتى ${n('6')} ديسمبر فقط.<br>
  <span style="font-size:14px;color:${MUTED}">دفعة واحدة بلا اشتراك، والتحميل فوري بعد الدفع.</span></div>`;

function page({ title, preheader, body }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9" dir="rtl">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f1f5f9">${preheader}&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f1f5f9">
<tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px" dir="rtl">
    <tr><td bgcolor="${NAVY}" style="padding:18px 24px;border-radius:14px 14px 0 0;text-align:right">
      <a href="${SITE}/?utm_source=email&utm_medium=email&utm_campaign=cal-launch" style="font:bold 22px/1 Arial, sans-serif;color:#ffffff;text-decoration:none" dir="ltr">Arab<span style="color:#5eead4">Tides</span></a>
    </td></tr>
    <tr><td bgcolor="#ffffff" style="padding:28px 24px 12px;text-align:right" dir="rtl">
${body}
      ${p('فريق <span dir="ltr">ArabTides</span>', `color:${MUTED}`)}
    </td></tr>
    <tr><td style="padding:16px 24px;text-align:center;font:12px/1.8 ${FONT};color:${MUTED}" dir="rtl">
      وصلتك هذه الرسالة لأنك سجّلت بريدك في <a href="${SITE}" style="color:${MUTED}">arabtides.com</a>.<br>
      <a href="{{ unsubscribe }}" style="color:${MUTED}">إلغاء الاشتراك</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
`;
}

const emails = {
  'email-1-launch.html': {
    subject: `تقويم 2027 ${FOR} جاهز`,
    preheader: 'سنة كاملة يوماً بيوم، بسعر الإطلاق 4.99$ حتى 6 ديسمبر',
    body: [
      `<h1 style="margin:0 0 16px;font:bold 24px/1.5 ${FONT};color:${NAVY}">تقويم الصيد والمد والجزر ${n('2027')} ${FOR}</h1>`,
      p('مرحباً،'),
      p('سجّلت بريدك في <span dir="ltr">ArabTides</span>، فأردنا أن تكون من أول من يعرف: تقويم 2027 صار متاحاً. ملف <span dir="ltr">PDF</span> واحد لميناءك، فيه السنة كاملة يوماً بيوم:'),
      list([
        'المد والجزر لكل يوم بالساعة والارتفاع',
        `تقييم الصيد من ${n('1')} إلى ${n('5')} لكل يوم`,
        `أفضل ${n('12')} يوماً في السنة لتحجزها من الآن`,
        'يُقرأ دون إنترنت ويُطبع',
      ]),
      img('month.jpg', 'صفحة شهر يناير من تقويم 2027', link('e1-img')),
      price,
      button(link('e1'), 'احجز تقويمك الآن'),
      p('والموقع يبقى مجانياً كما هو. التقويم لمن يريد السنة كلها في هاتفه، حتى على الصخور حيث لا إنترنت.', `font-size:15px;color:${MUTED}`),
    ].join('\n'),
  },
  'email-2-numbers.html': {
    subject: 'كم يوماً ممتازاً للصيد في ميناءك سنة 2027؟',
    preheader: 'حسبنا السنة كلها يوماً بيوم لكل ميناء',
    body: [
      p('مرحباً،'),
      p(`حسبنا سنة ${n('2027')} كاملة لكل ميناء، يوماً بيوم. في دبي مثلاً:`),
      `<div style="margin:0 0 18px;padding:18px 16px;background:#eef8f8;border-radius:12px;text-align:center">
        <div style="font:bold 28px/1.5 ${FONT};color:${NAVY}">${n('103')} يوماً ممتازاً</div>
        <div style="font:16px/1.8 ${FONT};color:${TEXT}">للصيد خلال السنة، وأفضل شهر: <b style="color:${TEAL}">أكتوبر</b></div>
      </div>`,
      p('اختر ميناءك في الصفحة لترى أرقامه.'),
      p('كل يوم منها مكتوب في التقويم بتاريخه وساعات المد وأفضل فترات الصيد، وصفحة «أفضل الأيام» تجمعها لك لتحجزها من الآن.'),
      img('best-days.jpg', 'صفحة أفضل أيام السنة من تقويم 2027', link('e2-img')),
      p('<b>كيف نعرف المد قبل سنة؟</b> المد يتبع القمر والشمس، وحركتهما معروفة بدقة، فيُحسب المد مسبقاً كما يُحسب الكسوف قبل وقوعه بسنوات. أما الريح والطقس فيغيّران البحر يوماً بيوم، فراجع النشرة الجوية قبل خروجك.'),
      price,
      button(link('e2'), 'اختر ميناءك واحجز تقويمك'),
    ].join('\n'),
  },
  'email-3-last-day.html': {
    subject: 'آخر يوم لسعر الإطلاق 4.99$',
    preheader: 'الليلة عند 23:59 بتوقيت مكة يعود السعر إلى 6.99$',
    body: [
      p('مرحباً،'),
      p(`تذكير قصير: اليوم آخر يوم لسعر إطلاق تقويم ${n('2027')}. الليلة عند ${n('23:59')} بتوقيت مكة يعود السعر من ${n('4.99$')} إلى ${n('6.99$')}.`),
      img('cover-generic.jpg', 'غلاف تقويم الصيد والمد والجزر 2027', link('e3-img'), 300),
      p(`سنة كاملة ${FOR}: المد والجزر لكل يوم، وتقييم الصيد، وأفضل أيام السنة. ملف واحد في هاتفك، يعمل دون إنترنت.`),
      button(link('e3'), 'احجز بسعر الإطلاق'),
      p('وإن اشتريته من قبل فشكراً لك، وتجاهل هذه الرسالة.', `font-size:15px;color:${MUTED}`),
    ].join('\n'),
  },
};

for (const [file, e] of Object.entries(emails)) {
  writeFileSync(join(DIR, file), page({ title: e.subject, preheader: e.preheader, body: e.body }));
  console.log(`${file}\n  subject: ${e.subject}\n  preview: ${e.preheader}`);
}
