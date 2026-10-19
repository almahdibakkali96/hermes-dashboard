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
