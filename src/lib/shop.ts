/**
 * ArabTides shop settings — the two URLs to paste are here.
 *
 * 1. STRIPE_GUIDE_URL: your Stripe Payment Link (fixed price, 2.99 USD), e.g.
 *    'https://buy.stripe.com/xxxxxxxx'. While empty, promos offer the free cheat sheet instead and /guide collects interest.
 *    One link is shared by every 2.99 product: each Buy button appends
 *    ?client_reference_id=<product id>, which Stripe stores on the payment, so the
 *    dashboard shows which product was bought. Set the link's "After payment"
 *    redirect to https://www.arabtides.com/guide/thanks
 *
 * 2. SIGNUP_URL: the Google Apps Script web-app URL (ends with /exec) that writes
 *    emails into your Google Sheet — see tools/signup-sheet/README.md.
 *    While empty, the form still gives the free cheat sheet but no email is stored.
 *
 * Either can also be set as a Vercel environment variable (PUBLIC_STRIPE_GUIDE_URL,
 * PUBLIC_SIGNUP_URL), which overrides the value here.
 */
// ▼▼▼ Paste your URLs between the quotes ▼▼▼
const STRIPE_LINK = 'https://buy.stripe.com/5kQcN52Gp09CaFj3wT7Zu00';
const SHEET_WEBAPP = 'https://script.google.com/macros/s/AKfycbxaf_1RR9Iuvavu0QPvdTLPvIvNnoKf8B8Jcn6VYF9NwGLuRoO9lNbSAWXojAPoXyij/exec';
// ▲▲▲

export const STRIPE_GUIDE_URL: string = import.meta.env.PUBLIC_STRIPE_GUIDE_URL || STRIPE_LINK;
export const SIGNUP_URL: string = import.meta.env.PUBLIC_SIGNUP_URL || SHEET_WEBAPP;

/** Sales are open only once a Stripe link is set. Until then the site hides prices and Buy
 *  buttons, presents the guide as "coming soon" and only collects emails. */
export const SALES_OPEN = Boolean(STRIPE_GUIDE_URL);

export const GUIDE = {
  id: 'moon-tide-guide',   // Stripe client_reference_id — letters, digits, - and _ only
  title: 'دليل القمر والمد والجزر للصيادين',
  subtitle: 'كيف تختار أفضل يوم وأفضل ساعة للصيد في البحار العربية',
  price: 2.99,
  currency: 'USD',
  priceLabel: '2.99$',
  pages: 44,
  chapters: [
    { icon: '🌙', title: 'لماذا يهتم الصياد بالقمر؟', text: 'من الجاذبية إلى التيار إلى الطعام — وما يقوله العلم بصراحة.' },
    { icon: '🌗', title: 'أطوار القمر وما تعنيه للصيد', text: 'الأطوار الثمانية، متى يشرق القمر ويغرب، والصيد في ليالي البدر والمحاق.' },
    { icon: '🌊', title: 'كيف يعمل المد والجزر', text: 'الانتفاختان، المد الربيعي والمحاقي، وأنواع المد في الموانئ العربية.' },
    { icon: '📋', title: 'قراءة جدول المد', text: 'أربعة أرقام تكفيك، وقاعدة الأثني عشر، وما يربك المبتدئين.' },
    { icon: '⏱️', title: 'فترات السولونار', text: 'الفترات الكبرى والصغرى، ومتى تكون أقوى، وكيف تحسبها بنفسك.' },
    { icon: '🎯', title: 'اجمع كل شيء', text: 'طريقة من أربع خطوات قبل كل رحلة، مع جدول قرار ومثال محلول.' },
    { icon: '🗺️', title: 'البحار العربية', text: 'الخليج، الأطلسي، المحيط الهندي، البحر الأحمر والمتوسط — بالأرقام.' },
    { icon: '🐟', title: 'متى يأكل كل سمك؟', text: '52 نوعاً من الخليج والبحر الأحمر والأطلسي والمتوسط: أفضل مرحلة مد وساعة وطعم لكل نوع.' },
    { icon: '📅', title: 'تقويم الصيد لـ12 شهراً', text: 'من نوفمبر 2026 إلى أكتوبر 2027: أيام المد القوي والقمر، ومواسم المنع والصيد في الدول العربية.' },
    { icon: '📄', title: 'الورقة المختصرة', text: 'كل الدليل في صفحة واحدة تطبعها أو تحفظها في هاتفك.' },
  ],
};

/** Buy URL for a product on the shared Payment Link ('' while no link is set). */
export function buyUrl(productId: string): string {
  if (!STRIPE_GUIDE_URL) return '';
  const u = new URL(STRIPE_GUIDE_URL);
  u.searchParams.set('client_reference_id', productId);
  return u.href;
}

export const CHEAT_SHEET_PDF = 'downloads/ArabTides-cheat-sheet-free.pdf';
