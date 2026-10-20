/**
 * ArabTides — article registry (index page, sitemap, llms.txt, related links)
 */

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  /** One-line summary shown on cards and in llms.txt */
  summary: string;
  published: string; // YYYY-MM-DD
  updated: string;   // YYYY-MM-DD
  readingMinutes: number;
  icon: string;
  tag: string;
}

export const articles: ArticleMeta[] = [
  {
    slug: 'solunar-fishing-hours',
    title: 'ساعات الصيد الذهبية: ما هي فترات السولونار وكيف تستخدمها؟',
    description: 'شرح الفترات الكبرى والصغرى في نظرية السولونار، وكيف يحددها القمر، ومتى تكون أقوى، مع أوقات اليوم في موانئ عربية.',
    summary: 'كيف يحدد عبور القمر وشروقه وغروبه ساعات نشاط الأسماك، وكيف تجمعها مع حركة المد لتختار ساعة الصيد.',
    published: '2026-10-20',
    updated: '2026-10-20',
    readingMinutes: 6,
    icon: '🌙',
    tag: 'دليل',
  },
  {
    slug: 'moon-phases-fishing',
    title: 'أطوار القمر والصيد: هل البدر أفضل أم المحاق؟',
    description: 'كيف تؤثر أطوار القمر على المد والجزر ونشاط الأسماك: البدر والمحاق والتربيع، ومواعيد الأطوار القادمة مع مدى المد في موانئ عربية.',
    summary: 'أطوار القمر الثمانية وما يعنيه كل طور للمد والصيد، مع مواعيد البدر والمحاق القادمة ومدى المد عندها.',
    published: '2026-10-20',
    updated: '2026-10-20',
    readingMinutes: 6,
    icon: '🌕',
    tag: 'دليل',
  },
  {
    slug: 'tide-safety-rule-of-twelfths',
    title: 'السلامة أثناء الصيد: قاعدة الاثني عشر وكيف لا يحاصرك المد',
    description: 'كيف يرتفع الماء ساعة بساعة حسب قاعدة الاثني عشر، ولماذا يكون المد أسرع في منتصفه، ونصائح عملية للصيد الآمن على الصخور والسواحل المكشوفة.',
    summary: 'قاعدة بسيطة لتقدير سرعة ارتفاع الماء، مثال حقيقي من الكويت، وقائمة سلامة قبل كل رحلة صيد.',
    published: '2026-10-20',
    updated: '2026-10-20',
    readingMinutes: 5,
    icon: '⚠️',
    tag: 'سلامة',
  },
  {
    slug: 'gulf-tides-fishing-guide',
    title: 'المد والجزر في الخليج العربي: دليل الصياد من الكويت إلى دبي',
    description: 'دليل المد والجزر في موانئ الخليج العربي: لماذا يكون المد مختلطاً، وأين يكون أقوى وأضعف، وأوقات المد اليوم في الكويت والدمام والمنامة والدوحة ودبي.',
    summary: 'أرقام المد في موانئ الخليج العربي الستة، وشرح المد المختلط، وأوقات اليوم، ونصائح الصيد في الخليج.',
    published: '2026-10-20',
    updated: '2026-10-20',
    readingMinutes: 6,
    icon: '🏝️',
    tag: 'بيانات',
  },
  {
    slug: 'how-to-read-tide-table',
    title: 'كيف تقرأ جدول المد والجزر؟ دليل مبسّط للصيادين',
    description: 'دليل عملي لقراءة جدول المد والجزر: المد العالي والجزر المنخفض، أنواع المد، المد الربيعي والمحاقي، وأفضل وقت للصيد.',
    summary: 'شرح خطوة بخطوة لقراءة أوقات المد والجزر وارتفاعاتها، والفرق بين المد الربيعي والمحاقي، ومتى تخرج للصيد.',
    published: '2026-10-20',
    updated: '2026-10-20',
    readingMinutes: 6,
    icon: '🌊',
    tag: 'دليل',
  },
  {
    slug: 'strongest-tides-arab-world',
    title: 'أين يكون المد أقوى في العالم العربي؟ ترتيب 36 ميناءً',
    description: 'مقارنة مدى المد والجزر في 36 ميناءً عربياً من الأطلسي إلى الخليج: أين يصل الفرق إلى 4 أمتار، ولماذا يكاد يختفي في المتوسط والبحر الأحمر.',
    summary: 'ترتيب الموانئ العربية حسب أقصى مدى يومي للمد والجزر خلال السنة، محسوب من نموذج EOT20، مع شرح الأسباب لكل بحر.',
    published: '2026-10-20',
    updated: '2026-10-20',
    readingMinutes: 5,
    icon: '📊',
    tag: 'بيانات',
  },
];

export const articleBySlug = (slug: string) => articles.find(a => a.slug === slug)!;
