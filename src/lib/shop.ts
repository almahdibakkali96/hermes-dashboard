/**
 * ArabTides shop settings — the two URLs to paste are here.
 *
 * 1. STRIPE_GUIDE_URL: your Stripe Payment Link for the guide (fixed price),
 *    e.g. 'https://buy.stripe.com/xxxxxxxx'. While empty, the Buy button shows "قريباً".
 *    In Stripe, set the link's "After payment" redirect to https://www.arabtides.com/guide/thanks
 *
 * 2. SIGNUP_URL: the Google Apps Script web-app URL (ends with /exec) that writes
 *    emails into your Google Sheet — see tools/signup-sheet/README.md.
 *    While empty, the form still gives the free cheat sheet but no email is stored.
 *
 * Either can also be set as a Vercel environment variable (PUBLIC_STRIPE_GUIDE_URL,
 * PUBLIC_SIGNUP_URL), which overrides the value here.
 */
// ▼▼▼ Paste your URLs between the quotes ▼▼▼
const STRIPE_LINK = '';
const SHEET_WEBAPP = '';
// ▲▲▲

export const STRIPE_GUIDE_URL: string = import.meta.env.PUBLIC_STRIPE_GUIDE_URL || STRIPE_LINK;
export const SIGNUP_URL: string = import.meta.env.PUBLIC_SIGNUP_URL || SHEET_WEBAPP;

export const GUIDE = {
  title: 'دليل القمر والمد والجزر للصيادين',
  subtitle: 'كيف تختار أفضل يوم وأفضل ساعة للصيد في البحار العربية',
  price: 5,
  currency: 'USD',
  priceLabel: '5$',
  pages: 28,
  chapters: [
    { icon: '🌙', title: 'لماذا يهتم الصياد بالقمر؟', text: 'من الجاذبية إلى التيار إلى الطعام — وما يقوله العلم بصراحة.' },
    { icon: '🌗', title: 'أطوار القمر وما تعنيه للصيد', text: 'الأطوار الثمانية، متى يشرق القمر ويغرب، والصيد في ليالي البدر والمحاق.' },
    { icon: '🌊', title: 'كيف يعمل المد والجزر', text: 'الانتفاختان، المد الربيعي والمحاقي، وأنواع المد في الموانئ العربية.' },
    { icon: '📋', title: 'قراءة جدول المد', text: 'أربعة أرقام تكفيك، وقاعدة الأثني عشر، وما يربك المبتدئين.' },
    { icon: '⏱️', title: 'فترات السولونار', text: 'الفترات الكبرى والصغرى، ومتى تكون أقوى، وكيف تحسبها بنفسك.' },
    { icon: '🎯', title: 'اجمع كل شيء', text: 'طريقة من أربع خطوات قبل كل رحلة، مع جدول قرار ومثال محلول.' },
    { icon: '🗺️', title: 'البحار العربية', text: 'الخليج، الأطلسي، المحيط الهندي، البحر الأحمر والمتوسط — بالأرقام.' },
    { icon: '📄', title: 'الورقة المختصرة', text: 'كل الدليل في صفحة واحدة تطبعها أو تحفظها في هاتفك.' },
  ],
};

export const CHEAT_SHEET_PDF = 'downloads/ArabTides-cheat-sheet-free.pdf';
