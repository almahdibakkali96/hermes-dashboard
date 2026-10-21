/**
 * ArabTides — fish guide: species, local Arabic names, seas and fishing notes.
 * Photos live in public/fish/<id>.webp; their credits in src/data/fish-photos.json
 * (both produced by tools/fish-photos/fetch.mjs from Wikimedia Commons).
 */
import photos from '../data/fish-photos.json';
import { portSea, type SeaId } from './seaNames';
import placesIndex from '../data/places/places_index.json';

export type FishKind = 'reef' | 'bottom' | 'pelagic' | 'cephalopod';
export type Method = 'shore' | 'boat';

export interface Fish {
  id: string;
  ar: string;
  en: string;
  sci: string;
  /** Other Arabic names and where they are used */
  local: { name: string; where: string }[];
  seas: SeaId[];
  kind: FishKind;
  methods: Method[];
  size: string;
  /** Best tide stage and time of day */
  tide: string;
  bait: string;
  about: string;
  note?: string;
}

export const kindNames: Record<FishKind, string> = {
  reef: 'أسماك الشعاب والصخور',
  bottom: 'أسماك القاع الرملي والطيني',
  pelagic: 'أسماك المياه المفتوحة',
  cephalopod: 'الحبار والرخويات',
};

export const methodNames: Record<Method, string> = { shore: 'من الشاطئ', boat: 'من القارب' };

export const fish: Fish[] = [
  {
    id: 'hamour', ar: 'هامور', en: 'Orange-spotted grouper', sci: 'Epinephelus coioides',
    local: [{ name: 'هامور', where: 'الخليج العربي' }, { name: 'وقار', where: 'مصر والبحر الأحمر' }],
    seas: ['gulf', 'red', 'indian'], kind: 'reef', methods: ['boat', 'shore'], size: '40–80 سم',
    tide: 'حول وقفة المد (الدقائق التي يتوقف فيها التيار)، وفي الفجر والغروب.',
    bait: 'سمك حي أو شرائح سمك، حبار، ربيان كبير.',
    about: 'أشهر أسماك الخليج على الموائد. يعيش قرب الصخور والشعاب والحطام، ويهاجم الطعم ثم يندفع إلى جحره، لذا يجب رفعه بسرعة بعيداً عن القاع.',
    note: 'تفرض بعض دول الخليج حداً أدنى للطول أو موسم منع في فترة التكاثر؛ راجع أنظمة بلدك.',
  },
  {
    id: 'kanad', ar: 'كنعد', en: 'Narrow-barred Spanish mackerel', sci: 'Scomberomorus commerson',
    local: [{ name: 'كنعد / جنعد', where: 'الخليج العربي وعُمان' }, { name: 'درّاك', where: 'مصر والبحر الأحمر' }],
    seas: ['gulf', 'red', 'indian'], kind: 'pelagic', methods: ['boat', 'shore'], size: '60–120 سم',
    tide: 'المد المتحرك بقوة، والساعات الأولى بعد الفجر حين تتجمع أسراب الطعم.',
    bait: 'سردين أو بوري صغير حي، وطعوم صناعية سريعة تُسحب خلف القارب.',
    about: 'سمكة سريعة مفترسة تتبع أسراب السردين قرب السطح. أسنانها حادة تقطع الخيط، فيُستخدم معها سلك معدني قصير.',
    note: 'تمنع دول مجلس التعاون صيده في موسم التكاثر (من منتصف أغسطس إلى منتصف أكتوبر تقريباً).',
  },
  {
    id: 'sobaity', ar: 'سبيطي', en: 'Sobaity seabream', sci: 'Sparidentex hasta',
    local: [{ name: 'سبيطي', where: 'الكويت والعراق' }],
    seas: ['gulf'], kind: 'bottom', methods: ['shore', 'boat'], size: '30–50 سم',
    tide: 'من الفجر حتى قمة المد العالي، ثم عند الغروب.',
    bait: 'بوري صغير حي، ربيان حي، سردين صغير.',
    about: 'من أكثر الأسماك طلباً في شمال الخليج. حذر جداً، ويحتاج إلى خيط رفيع وثقل خفيف وصبر.',
  },
  {
    id: 'shaem', ar: 'شعم', en: 'Yellowfin seabream', sci: 'Acanthopagrus latus',
    local: [{ name: 'شعم', where: 'الخليج العربي' }, { name: 'دنيس الخليج', where: 'تسمية عامة' }],
    seas: ['gulf'], kind: 'reef', methods: ['shore', 'boat'], size: '20–40 سم',
    tide: 'المد الصاعد في الفجر والغروب.',
    bait: 'ربيان مقشر، سرطان صغير، ديدان.',
    about: 'يعيش بين الصخور وأرصفة الموانئ ومصبات الأخوار، ويُعرف بزعانفه الصفراء. من أسهل الأهداف للمبتدئين من الشاطئ.',
  },
  {
    id: 'safi', ar: 'صافي', en: 'Rabbitfish', sci: 'Siganus spp.',
    local: [{ name: 'صافي', where: 'الإمارات وعُمان' }, { name: 'بطاطا', where: 'الكويت' }, { name: 'سيجان', where: 'مصر والشام' }],
    seas: ['gulf', 'red', 'med'], kind: 'reef', methods: ['shore'], size: '20–35 سم',
    tide: 'النهار مع مد متوسط فوق الصخور والأعشاب البحرية.',
    bait: 'عجين خبز، ربيان صغير، طحالب خضراء، بخطاف صغير لأن فمه صغير.',
    about: 'سمكة نباتية تتغذى على الطحالب. وصلت إلى شرق البحر المتوسط عبر قناة السويس وانتشرت فيه.',
    note: 'أشواك زعانفها سامة ومؤلمة؛ أمسكها بقطعة قماش. في الإمارات يُمنع صيدها في موسم التكاثر في الربيع.',
  },
  {
    id: 'nuwaibi', ar: 'نويبي', en: 'Tigertooth croaker', sci: 'Otolithes ruber',
    local: [{ name: 'نويبي', where: 'الكويت والعراق' }],
    seas: ['gulf', 'indian'], kind: 'bottom', methods: ['shore', 'boat'], size: '30–60 سم',
    tide: 'الليل والغروب، والمياه العكرة مع تيار المد.',
    bait: 'ربيان، سردين، شرائح حبار.',
    about: 'يكثر في المياه الطينية والأخوار. له نابان حادان في مقدمة الفم، فيُفضّل استخدام ليدر أقوى.',
  },
  {
    id: 'nagroor', ar: 'نقرور', en: 'Javelin grunter', sci: 'Pomadasys kaakan',
    local: [{ name: 'نقرور', where: 'الخليج العربي' }],
    seas: ['gulf', 'indian'], kind: 'bottom', methods: ['shore', 'boat'], size: '30–60 سم',
    tide: 'الغروب وأول الليل، مع بداية المد الصاعد.',
    bait: 'ربيان، سرطان، شرائح حبار.',
    about: 'سمكة قاعية تصدر صوت نقيق عند إخراجها من الماء. تنقر الطعم عدة مرات قبل أن تبتلعه، فانتظر الشدة الحقيقية.',
  },
  {
    id: 'sheri', ar: 'شعري', en: 'Spangled emperor', sci: 'Lethrinus nebulosus',
    local: [{ name: 'شعري', where: 'الخليج العربي' }, { name: 'شعور', where: 'السعودية واليمن' }],
    seas: ['gulf', 'red', 'indian'], kind: 'reef', methods: ['boat', 'shore'], size: '30–60 سم',
    tide: 'الصباح الباكر وبعد العصر، مع تيار متوسط.',
    bait: 'حبار، ربيان، سرطان.',
    about: 'من أسماك الشعاب الشائعة، يتميز بنقاط زرقاء على جسمه وخطوط زرقاء على الوجه. يتغذى قرب القاع الرملي المجاور للشعاب.',
    note: 'في الإمارات يُمنع صيده في موسم التكاثر في الربيع.',
  },
  {
    id: 'queenfish', ar: 'ضلعة', en: 'Talang queenfish', sci: 'Scomberoides commersonnianus',
    local: [{ name: 'ضلعة', where: 'الخليج العربي' }, { name: 'سمكة الملكة', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'pelagic', methods: ['shore', 'boat'], size: '50–90 سم',
    tide: 'المد المتحرك عند مداخل الأخوار، في الصباح الباكر والغروب.',
    bait: 'بوري أو سردين حي، وطعوم سطحية (بوبر).',
    about: 'من أفضل أهداف الرمي من الشاطئ في الخليج. تقفز خارج الماء عند اصطيادها وتقاوم بقوة.',
  },
  {
    id: 'jesh', ar: 'جش', en: 'Trevally', sci: 'Carangoides spp.',
    local: [{ name: 'جش', where: 'الخليج العربي' }, { name: 'تريفالي', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'pelagic', methods: ['boat', 'shore'], size: '40–70 سم',
    tide: 'المد المتحرك فوق الشعاب، صباحاً.',
    bait: 'سردين حي، وطعوم معدنية (جيج).',
    about: 'عائلة من الأسماك القوية التي تصطاد في مجموعات. تندفع نحو الشعاب عند اصطيادها، فاضبط فرامل البكرة جيداً.',
  },
  {
    id: 'gt', ar: 'جش كبير (GT)', en: 'Giant trevally', sci: 'Caranx ignobilis',
    local: [{ name: 'جش كبير', where: 'الخليج وعُمان' }],
    seas: ['red', 'indian'], kind: 'pelagic', methods: ['boat', 'shore'], size: '60–150 سم',
    tide: 'الفجر، مع التيار القوي عند الرؤوس الصخرية وحواف الشعاب.',
    bait: 'طعوم سطحية كبيرة (بوبر)، أو سمك حي كبير.',
    about: 'أقوى أسماك الشعاب مقاومة، وهدف رئيسي لصيد الرياضة في عُمان والبحر الأحمر. يحتاج إلى معدات ثقيلة جداً.',
    note: 'يُستحسن إطلاقه بعد الصيد، فالأفراد الكبيرة بطيئة النمو.',
  },
  {
    id: 'tuna', ar: 'جيذر', en: 'Yellowfin tuna', sci: 'Thunnus albacares',
    local: [{ name: 'جيذر', where: 'عُمان والخليج' }, { name: 'تونة صفراء الزعانف', where: 'تسمية عامة' }],
    seas: ['red', 'indian'], kind: 'pelagic', methods: ['boat'], size: '60–150 سم',
    tide: 'الصباح الباكر في المياه العميقة، حيث تظهر الطيور والدلافين.',
    bait: 'سردين حي، حبار، وطعوم معدنية ثقيلة.',
    about: 'تونة المحيط المفتوح، تُصطاد من القوارب بعيداً عن الساحل. ابحث عن تجمعات الطيور وفوران الماء.',
  },
  {
    id: 'longtail', ar: 'تونة طويلة الذيل', en: 'Longtail tuna', sci: 'Thunnus tonggol',
    local: [{ name: 'تونة طويلة الذيل', where: 'الخليج العربي وعُمان' }],
    seas: ['gulf', 'indian'], kind: 'pelagic', methods: ['boat'], size: '50–100 سم',
    tide: 'الصباح الباكر عند فوران الماء.',
    bait: 'سردين حي، وطعوم معدنية سريعة.',
    about: 'التونة الأكثر انتشاراً في الخليج، تقترب من الساحل أكثر من غيرها. سريعة الحركة، فارمِ أمام السرب لا في وسطه.',
  },
  {
    id: 'dorado', ar: 'دورادو', en: 'Mahi-mahi', sci: 'Coryphaena hippurus',
    local: [{ name: 'ماهي ماهي', where: 'تسمية عامة' }, { name: 'دورادو', where: 'تسمية عامة' }],
    seas: ['indian', 'med'], kind: 'pelagic', methods: ['boat'], size: '60–120 سم',
    tide: 'النهار، حول الأجسام العائمة في عرض البحر.',
    bait: 'سردين، حبار، وطعوم تُسحب خلف القارب.',
    about: 'سمكة ملونة سريعة النمو تتجمع تحت الأخشاب والعوامات الطافية. تظهر في البحر المتوسط في الخريف.',
  },
  {
    id: 'sailfish', ar: 'أبو شراع', en: 'Sailfish', sci: 'Istiophorus platypterus',
    local: [{ name: 'أبو شراع', where: 'تسمية عامة' }],
    seas: ['indian'], kind: 'pelagic', methods: ['boat'], size: '150–250 سم',
    tide: 'النهار في المياه الدافئة العميقة، مع أسراب السردين.',
    bait: 'سمك حي، وطعوم تُسحب على السطح.',
    about: 'من أسرع أسماك البحر، بزعنفة ظهرية كبيرة كالشراع. يُصطاد قبالة عُمان واليمن والصومال للرياضة.',
    note: 'يُطلق عادة بعد الصيد.',
  },
  {
    id: 'coraltrout', ar: 'نجل', en: 'Roving coral grouper', sci: 'Plectropomus pessuliferus',
    local: [{ name: 'نجل', where: 'السعودية والبحر الأحمر' }, { name: 'سلمان البحر المرجاني', where: 'تسمية عامة' }],
    seas: ['red'], kind: 'reef', methods: ['boat'], size: '40–80 سم',
    tide: 'الفجر والغروب، مع تيار متوسط على حواف الشعاب.',
    bait: 'سمك حي، وطعوم معدنية بطيئة (سلو جيج).',
    about: 'هامور أحمر منقط بالأزرق من أجمل أسماك البحر الأحمر. يسكن الشعاب المرجانية ويختبئ في شقوقها.',
  },
  {
    id: 'parrot', ar: 'حريد', en: 'Rusty parrotfish', sci: 'Scarus ferrugineus',
    local: [{ name: 'حريد', where: 'البحر الأحمر والخليج' }, { name: 'سمك الببغاء', where: 'تسمية عامة' }],
    seas: ['red', 'indian'], kind: 'reef', methods: ['shore', 'boat'], size: '25–40 سم',
    tide: 'النهار مع المد العالي فوق الشعاب الضحلة.',
    bait: 'ربيان، سرطان صغير، طحالب.',
    about: 'يكشط المرجان بأسنانه الملتحمة ليأكل الطحالب، ويحوّله إلى رمل أبيض. ينام ليلاً داخل كيس من المخاط.',
  },
  {
    id: 'hamra', ar: 'حمرا', en: 'Red snapper', sci: 'Lutjanus malabaricus',
    local: [{ name: 'حمرا / حمراء', where: 'الخليج العربي' }, { name: 'بهار', where: 'البحر الأحمر' }, { name: 'نهاش', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'reef', methods: ['boat'], size: '40–80 سم',
    tide: 'الليل والفجر، مع تيار متوسط فوق الشعاب العميقة.',
    bait: 'شرائح سمك، حبار، سمك حي.',
    about: 'سمكة حمراء من أسماك الأعماق المتوسطة، مطلوبة في الأسواق. تُصطاد من القوارب فوق الشعاب والقيعان الصخرية.',
  },
  {
    id: 'cobia', ar: 'سكل', en: 'Cobia', sci: 'Rachycentron canadum',
    local: [{ name: 'سكل', where: 'الخليج العربي' }, { name: 'كوبيا', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'pelagic', methods: ['boat', 'shore'], size: '60–120 سم',
    tide: 'المد المتحرك قرب العوامات والمنصات والحطام.',
    bait: 'سمك حي، حبار، سرطان.',
    about: 'سمكة قوية بنية اللون تشبه القرش في شكلها، وترافق السلاحف والأجسام الكبيرة. تقاوم طويلاً حتى بجانب القارب.',
  },
  {
    id: 'barracuda', ar: 'باراكودا', en: 'Great barracuda', sci: 'Sphyraena barracuda',
    local: [{ name: 'جد', where: 'الخليج العربي' }, { name: 'باراكودا', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian', 'med', 'atlantic'], kind: 'pelagic', methods: ['boat', 'shore'], size: '50–120 سم',
    tide: 'المد المتحرك عند حواف الشعاب ومداخل الموانئ، صباحاً.',
    bait: 'طعوم صناعية سريعة، سمك حي.',
    about: 'مفترسة طويلة الجسم بأسنان حادة جداً. تنتشر أنواعها في كل البحار العربية، ويحتاج صيدها إلى سلك معدني.',
    note: 'قد تحمل الأفراد الكبيرة سم السيغواتيرا في بعض الشعاب؛ تجنب أكل الكبيرة منها.',
  },
  {
    id: 'zubaidi', ar: 'زبيدي', en: 'Silver pomfret', sci: 'Pampus argenteus',
    local: [{ name: 'زبيدي', where: 'الكويت والعراق والخليج' }],
    seas: ['gulf', 'indian'], kind: 'bottom', methods: ['boat'], size: '20–30 سم',
    tide: 'يُصطاد غالباً بالشباك في المياه الطينية مع التيار.',
    bait: 'نادراً ما يأخذ الطعم؛ يُصطاد تجارياً بالشباك.',
    about: 'سمكة فضية مسطحة، من أغلى أسماك المائدة في الكويت. تكثر قرب مصب شط العرب.',
  },
  {
    id: 'seabass', ar: 'قاروص', en: 'European sea bass', sci: 'Dicentrarchus labrax',
    local: [{ name: 'قاروص', where: 'مصر وتونس' }, { name: 'ذئب البحر', where: 'تسمية عامة' }, { name: 'ليبراكس', where: 'مصر' }],
    seas: ['med', 'atlantic'], kind: 'pelagic', methods: ['shore', 'boat'], size: '30–70 سم',
    tide: 'المد الصاعد في الليل والغروب، والمياه المضطربة بعد الريح.',
    bait: 'ديدان، سردين، حبار، وطعوم صناعية.',
    about: 'أشهر أهداف الصيد من الشاطئ في المتوسط والأطلسي. يقترب من الشاطئ في المياه البيضاء عند تكسر الأمواج.',
  },
  {
    id: 'dorade', ar: 'دنيس', en: 'Gilthead seabream', sci: 'Sparus aurata',
    local: [{ name: 'دنيس', where: 'مصر والشام' }, { name: 'وراطة', where: 'تونس' }, { name: 'دوراد', where: 'المغرب والجزائر' }],
    seas: ['med', 'atlantic'], kind: 'bottom', methods: ['shore', 'boat'], size: '25–50 سم',
    tide: 'المد الصاعد في الفجر والغروب، والمياه الهادئة.',
    bait: 'سرطان، محار، ديدان، ربيان.',
    about: 'تُعرف بخط ذهبي بين عينيها. تكسر بأسنانها القوية الأصداف والسرطانات قرب القاع الرملي والصخري.',
  },
  {
    id: 'sar', ar: 'شرغوش', en: 'White seabream', sci: 'Diplodus sargus',
    local: [{ name: 'شرغوش', where: 'تونس والمغرب والجزائر' }, { name: 'سرغوس', where: 'مصر وليبيا' }],
    seas: ['med', 'atlantic'], kind: 'reef', methods: ['shore'], size: '20–40 سم',
    tide: 'المياه المتحركة بين الصخور، في الفجر والغروب وبعد هياج البحر.',
    bait: 'ديدان، سرطان، بلح البحر.',
    about: 'من أكثر الأسماك شيوعاً على صخور المتوسط، بخطوط سوداء عمودية. يقترب من الصخور حين تعكّر الأمواج الماء.',
  },
  {
    id: 'marmar', ar: 'مرمار', en: 'Sand steenbras', sci: 'Lithognathus mormyrus',
    local: [{ name: 'مرمار', where: 'مصر وتونس وليبيا' }],
    seas: ['med', 'atlantic'], kind: 'bottom', methods: ['shore'], size: '20–35 سم',
    tide: 'المد الصاعد فوق الشواطئ الرملية، في الصباح والغروب.',
    bait: 'ديدان رملية، ربيان صغير.',
    about: 'سمكة رملية فضية بخطوط عمودية داكنة، تنبش الرمل بحثاً عن الديدان في المياه الضحلة.',
  },
  {
    id: 'boori', ar: 'بوري', en: 'Flathead grey mullet', sci: 'Mugil cephalus',
    local: [{ name: 'بوري', where: 'مصر والشام والمغرب العربي' }, { name: 'ميد', where: 'الخليج (للصغير منه)' }],
    seas: ['med', 'atlantic', 'red'], kind: 'pelagic', methods: ['shore'], size: '25–50 سم',
    tide: 'المد الصاعد في الموانئ ومصبات الأنهار.',
    bait: 'عجين خبز، وطعم نباتي، بخطاف صغير وعوامة.',
    about: 'يعيش في أسراب في الموانئ والبحيرات الساحلية، ويحتمل المياه المالحة والعذبة. يُستخدم صغيره طعماً حياً للأسماك الكبيرة.',
  },
  {
    id: 'wagar', ar: 'وقار', en: 'Dusky grouper', sci: 'Epinephelus marginatus',
    local: [{ name: 'وقار', where: 'مصر' }, { name: 'هامور المتوسط', where: 'تسمية عامة' }],
    seas: ['med', 'atlantic'], kind: 'reef', methods: ['boat', 'shore'], size: '40–90 سم',
    tide: 'وقفة المد والفجر، فوق القيعان الصخرية.',
    bait: 'سمك حي، حبار، أخطبوط.',
    about: 'أكبر هامور في البحر المتوسط. بطيء النمو ويبدأ حياته أنثى ثم يتحول إلى ذكر عند الكبر.',
    note: 'محمي أو مقيد الصيد في عدة دول متوسطية؛ أطلق الصغير منه.',
  },
  {
    id: 'meagre', ar: 'كوربين', en: 'Meagre', sci: 'Argyrosomus regius',
    local: [{ name: 'كوربين', where: 'المغرب العربي' }, { name: 'لوت', where: 'مصر' }],
    seas: ['atlantic', 'med'], kind: 'bottom', methods: ['shore', 'boat'], size: '60–150 سم',
    tide: 'الليل، مع المد القوي في الأحمال قرب المصبات.',
    bait: 'بوري حي، حبار، سردين.',
    about: 'سمكة كبيرة تصدر صوتاً كالطبل في موسم التكاثر. تكثر على سواحل موريتانيا والمغرب ومصبات الأنهار.',
  },
  {
    id: 'leerfish', ar: 'ليشة', en: 'Leerfish', sci: 'Lichia amia',
    local: [{ name: 'ليشة', where: 'تونس والمغرب والجزائر' }],
    seas: ['med', 'atlantic'], kind: 'pelagic', methods: ['shore', 'boat'], size: '50–100 سم',
    tide: 'المد المتحرك عند مداخل الموانئ والمصبات، صباحاً وغروباً.',
    bait: 'بوري حي، وطعوم سطحية.',
    about: 'مفترسة سريعة تطارد البوري في المياه الضحلة، وتشتهر بقوتها وقفزها.',
  },
  {
    id: 'dentex', ar: 'دنتكس', en: 'Common dentex', sci: 'Dentex dentex',
    local: [{ name: 'دنتكس', where: 'المغرب العربي ومصر' }],
    seas: ['med', 'atlantic'], kind: 'reef', methods: ['boat'], size: '40–80 سم',
    tide: 'الفجر، مع التيار فوق القيعان الصخرية العميقة.',
    bait: 'سمك حي، حبار، وطعوم معدنية بطيئة.',
    about: 'من أقوى أسماك القيعان الصخرية في المتوسط، بأسنان أمامية بارزة. يُصطاد من القوارب على أعماق متوسطة.',
  },
  {
    id: 'amberjack', ar: 'أمبرجاك', en: 'Greater amberjack', sci: 'Seriola dumerili',
    local: [{ name: 'أمبرجاك', where: 'تسمية عامة' }],
    seas: ['med', 'atlantic', 'red', 'indian'], kind: 'pelagic', methods: ['boat'], size: '60–150 سم',
    tide: 'المد المتحرك فوق الحطام والقيعان الصخرية العميقة.',
    bait: 'سمك حي، وطعوم معدنية (جيج).',
    about: 'سمكة ضخمة قوية تسحب الخيط نحو القاع. هدف شائع لصيد الجيج العمودي.',
  },
  {
    id: 'squid', ar: 'كاليماري', en: 'European squid', sci: 'Loligo vulgaris',
    local: [{ name: 'كاليماري', where: 'مصر والشام' }, { name: 'حبار', where: 'تسمية عامة' }],
    seas: ['med', 'atlantic'], kind: 'cephalopod', methods: ['shore', 'boat'], size: '15–40 سم',
    tide: 'الليل، وخاصة حول الغروب، تحت أضواء الأرصفة.',
    bait: 'طعم صناعي خاص بالحبار (إيجي).',
    about: 'يقترب من الأضواء ليلاً لاصطياد الأسماك الصغيرة. يُستخدم طعماً ممتازاً لأسماك كثيرة.',
  },
  {
    id: 'sepia', ar: 'خثاق', en: 'Pharaoh cuttlefish', sci: 'Sepia pharaonis',
    local: [{ name: 'خثاق', where: 'الكويت والعراق' }, { name: 'سوبيا', where: 'مصر والشام' }],
    seas: ['gulf', 'red', 'indian', 'med', 'atlantic'], kind: 'cephalopod', methods: ['shore', 'boat'], size: '15–35 سم',
    tide: 'الغروب والليل، في مياه هادئة صافية.',
    bait: 'طعم صناعي خاص بالحبار (إيجي) يُسحب ببطء.',
    about: 'تغير لونها بسرعة للتخفي. صدفتها الداخلية البيضاء هي «عظم الحبار» الذي يُلقى على الشواطئ.',
  },
];

export interface FishPhoto { w: number; h: number; artist: string; license: string; licenseUrl: string; source: string }
export const fishPhotos = photos as Record<string, FishPhoto>;

/** Species found in a given port's sea */
export function fishForPort(portId: string): Fish[] {
  const sea = portSea[portId];
  return fish.filter(f => f.seas.includes(sea));
}

/** Ports whose sea a species lives in */
export function portsForFish(f: Fish) {
  return (placesIndex as { id: string; name_ar: string; country: string }[])
    .filter(p => f.seas.includes(portSea[p.id]));
}
