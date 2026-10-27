/**
 * ArabTides — fish guide: species, local Arabic names, seas and fishing notes.
 * Photos live in public/fish/<id>.webp; their credits in src/data/fish-photos.json
 * (both produced by tools/fish-photos/fetch.mjs from Wikimedia Commons).
 */
import photos from '../data/fish-photos.json';
import portSpecies from '../data/port-species.json';
import { portSea, type SeaId } from './seaNames';
import placesIndex from '../data/places/places_index.json';

export type FishKind = 'reef' | 'bottom' | 'pelagic' | 'shark' | 'cephalopod' | 'crustacean';
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
  /** Slug of an article about this species */
  article?: string;
}

export const kindNames: Record<FishKind, string> = {
  reef: 'أسماك الشعاب والصخور',
  bottom: 'أسماك القاع الرملي والطيني',
  pelagic: 'أسماك المياه المفتوحة',
  shark: 'القروش واللخم',
  cephalopod: 'الحبار والأخطبوط',
  crustacean: 'القشريات',
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
    note: 'تفرض بعض دول الخليج حداً أدنى للطول (في البحرين 42 سم)؛ راجع أنظمة بلدك.',
    article: 'hamour',
  },
  {
    id: 'kanad', ar: 'كنعد', en: 'Narrow-barred Spanish mackerel', sci: 'Scomberomorus commerson',
    local: [{ name: 'كنعد / جنعد', where: 'الخليج العربي وعُمان' }, { name: 'درّاك', where: 'مصر والبحر الأحمر' }],
    seas: ['gulf', 'red', 'indian'], kind: 'pelagic', methods: ['boat', 'shore'], size: '60–120 سم',
    tide: 'المد المتحرك بقوة، والساعات الأولى بعد الفجر حين تتجمع أسراب الطعم.',
    bait: 'سردين أو بوري صغير حي، وطعوم صناعية سريعة تُسحب خلف القارب.',
    about: 'سمكة سريعة مفترسة تتبع أسراب السردين قرب السطح. أسنانها حادة تقطع الخيط، فيُستخدم معها سلك معدني قصير.',
    note: 'تمنع دول مجلس التعاون صيده بالشباك في موسم التكاثر من 15 أغسطس، وفي عُمان يُمنع صيده وبيعه كلياً حتى 15 أكتوبر؛ راجع أنظمة بلدك.',
    article: 'kanad',
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

  // --- Added from iNaturalist observation counts near our ports
  {
    id: 'faskar', ar: 'فسكر', en: 'Twobar seabream', sci: 'Acanthopagrus bifasciatus',
    local: [{ name: 'فسكر', where: 'الخليج العربي' }, { name: 'دنيس أبو خطين', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'reef', methods: ['shore', 'boat'], size: '25–45 سم',
    tide: 'المد الصاعد في الفجر والغروب، قرب الصخور وكواسر الأمواج.',
    bait: 'ربيان، سرطان صغير، بلح البحر.',
    about: 'يعرف بخطين أسودين على الرأس وزعانف صفراء. من أسماك الصخور المحبوبة في الخليج وعُمان والبحر الأحمر.',
  },
  {
    id: 'naiser', ar: 'نيسر', en: 'Blackspot snapper', sci: 'Lutjanus fulviflamma',
    local: [{ name: 'نيسر', where: 'الخليج العربي' }],
    seas: ['gulf', 'red', 'indian'], kind: 'reef', methods: ['shore', 'boat'], size: '20–30 سم',
    tide: 'الغروب وأول الليل، مع تيار متوسط حول الشعاب وأرصفة الموانئ.',
    bait: 'شرائح سمك، ربيان، حبار.',
    about: 'سمكة صغيرة صفراء الخطوط، تحمل بقعة سوداء على جانبها. تتجمع في أسراب حول الشعاب والحطام، وتباع في أسواق الخليج.',
  },
  {
    id: 'sweetlips', ar: 'فرش', en: 'Blackspotted rubberlip', sci: 'Plectorhinchus gaterinus',
    local: [{ name: 'فرش', where: 'الخليج العربي' }],
    seas: ['gulf', 'red', 'indian'], kind: 'reef', methods: ['boat'], size: '30–45 سم',
    tide: 'الليل، حين يخرج من مخابئه للتغذي على القاع الرملي.',
    bait: 'ربيان، سرطان، ديدان.',
    about: 'تقضي نهارها ساكنة تحت حواف الشعاب، وتتميز بشفاه غليظة ونقاط سوداء على جسم أصفر. يختلف لون صغارها تماماً عن الكبار.',
  },
  {
    id: 'wahra', ar: 'وحرة', en: 'Bartail flathead', sci: 'Platycephalus indicus',
    local: [{ name: 'وحرة', where: 'الخليج العربي' }],
    seas: ['gulf', 'indian'], kind: 'bottom', methods: ['shore', 'boat'], size: '30–60 سم',
    tide: 'المد المتحرك فوق القيعان الرملية والطينية، في الصباح والغروب.',
    bait: 'ربيان، سمك صغير حي، وطعوم سيليكون على القاع.',
    about: 'سمكة مسطحة الرأس تدفن نفسها في الرمل ولا يظهر منها إلا عيناها، ثم تنقض على الأسماك الصغيرة المارة.',
    note: 'أشواك الرأس والغطاء الخيشومي حادة؛ أمسكها بحذر.',
  },
  {
    id: 'sbour', ar: 'صبور', en: 'Hilsa shad', sci: 'Tenualosa ilisha',
    local: [{ name: 'صبور', where: 'الكويت والعراق' }],
    seas: ['gulf', 'indian'], kind: 'pelagic', methods: ['boat'], size: '30–50 سم',
    tide: 'يُصطاد بالشباك في الربيع والصيف حين يقترب من مصب شط العرب.',
    bait: 'يُصطاد تجارياً بالشباك الخيشومية، ونادراً بالسنارة.',
    about: 'السمكة الأشهر على موائد الكويت في الصيف. تعيش في البحر، وتصعد إلى شط العرب لتضع بيضها في الماء العذب، وعظامها كثيرة ودقيقة.',
  },
  {
    id: 'redmullet', ar: 'سلطان إبراهيم', en: 'Striped red mullet', sci: 'Mullus surmuletus',
    local: [{ name: 'سلطان إبراهيم', where: 'مصر' }, { name: 'بربوني', where: 'لبنان وسوريا' }, { name: 'تريلية', where: 'تونس' }],
    seas: ['med', 'atlantic'], kind: 'bottom', methods: ['shore', 'boat'], size: '15–30 سم',
    tide: 'النهار، مع مد هادئ فوق القيعان الرملية قرب الصخور.',
    bait: 'ديدان، ربيان صغير، بخطاف صغير على القاع.',
    about: 'تبحث عن طعامها بشاربين تحت ذقنها تنبش بهما الرمل. من أغلى أسماك المائدة في البحر المتوسط.',
  },
  {
    id: 'pandora', ar: 'مرجان', en: 'Common pandora', sci: 'Pagellus erythrinus',
    local: [{ name: 'مرجان', where: 'مصر والشام' }],
    seas: ['med', 'atlantic'], kind: 'bottom', methods: ['boat', 'shore'], size: '15–35 سم',
    tide: 'الفجر والغروب، فوق القيعان الرملية والصخرية على أعماق متوسطة.',
    bait: 'ديدان، حبار، ربيان.',
    about: 'سمكة وردية من عائلة الدنيس، تعيش في أسراب قرب القاع. تبدأ حياتها أنثى ثم يتحول كثير منها إلى ذكور.',
  },
  {
    id: 'salema', ar: 'شلبة', en: 'Salema', sci: 'Sarpa salpa',
    local: [{ name: 'شلبة', where: 'تونس وليبيا' }],
    seas: ['med', 'atlantic'], kind: 'reef', methods: ['shore'], size: '20–35 سم',
    tide: 'النهار، مع المد فوق الصخور المغطاة بالطحالب.',
    bait: 'طحالب خضراء، عجين خبز، بخطاف صغير وعوامة.',
    about: 'سمكة نباتية تسبح في أسراب كبيرة بخطوط ذهبية. قد يسبب أكل رأسها أو أحشائها في بعض المواسم هلوسات تستمر أياماً.',
    note: 'نظّفها جيداً وتخلص من الرأس والأحشاء قبل الطهي.',
  },
  {
    id: 'sardine', ar: 'سردين', en: 'European pilchard', sci: 'Sardina pilchardus',
    local: [{ name: 'سردين', where: 'المغرب ومصر والجزائر' }, { name: 'سردينة', where: 'تسمية عامة' }],
    seas: ['atlantic', 'med'], kind: 'pelagic', methods: ['boat', 'shore'], size: '12–20 سم',
    tide: 'الليل، حين تقترب الأسراب من الأضواء.',
    bait: 'يُصطاد بالشباك، أو بسلسلة خطافات صغيرة (سابيكي).',
    about: 'المغرب أكبر مصدّر للسردين المعلّب في العالم. وهو أيضاً من أفضل الطعوم الحية لأسماك كبيرة كثيرة.',
  },
  {
    id: 'mackerel', ar: 'إسقمري', en: 'Atlantic chub mackerel', sci: 'Scomber colias',
    local: [{ name: 'إسقمري', where: 'الفصحى' }, { name: 'ماكريل', where: 'مصر' }, { name: 'كبايلا', where: 'المغرب' }],
    seas: ['atlantic', 'med'], kind: 'pelagic', methods: ['shore', 'boat'], size: '20–35 سم',
    tide: 'الصباح الباكر والغروب، مع المد المتحرك عند أرصفة الموانئ.',
    bait: 'شرائح سردين، وسلسلة خطافات بريش لامع.',
    about: 'يسبح في أسراب سريعة، وغالباً ما يُصطاد منه عدد كبير دفعة واحدة. من الأسماك الشعبية الرخيصة في المغرب العربي.',
  },
  {
    id: 'sole', ar: 'سمك موسى', en: 'Common sole', sci: 'Solea solea',
    local: [{ name: 'موسى', where: 'مصر والشام' }, { name: 'صول', where: 'المغرب العربي' }],
    seas: ['med', 'atlantic'], kind: 'bottom', methods: ['shore', 'boat'], size: '20–40 سم',
    tide: 'الليل، مع المد الصاعد فوق الرمل والطين.',
    bait: 'ديدان رملية، ربيان صغير.',
    about: 'يولد بعين على كل جانب، ثم تنتقل إحدى عينيه إلى الجانب الآخر فيعيش مستلقياً على القاع. وتروي الحكاية الشعبية أنه انشق نصفين حين ضرب موسى البحر بعصاه.',
  },
  {
    id: 'scorpionfish', ar: 'عقرب البحر', en: 'Black scorpionfish', sci: 'Scorpaena porcus',
    local: [{ name: 'عقرب البحر', where: 'تسمية عامة' }],
    seas: ['med', 'atlantic'], kind: 'reef', methods: ['shore', 'boat'], size: '15–30 سم',
    tide: 'الليل، بين الصخور في المياه الضحلة.',
    bait: 'شرائح سمك، ربيان.',
    about: 'يتخفى بين الصخور والطحالب حتى يكاد لا يُرى، ثم يبتلع فريسته في جزء من الثانية. لحمه ممتاز في الحساء.',
    note: 'أشواك ظهره سامة ولسعتها مؤلمة جداً؛ لا تمسكه بيدك المجردة.',
  },
  {
    id: 'bluefin', ar: 'التونة الحمراء', en: 'Atlantic bluefin tuna', sci: 'Thunnus thynnus',
    local: [{ name: 'التن الأحمر', where: 'تونس والمغرب' }, { name: 'تونة زرقاء الزعانف', where: 'تسمية عامة' }],
    seas: ['atlantic', 'med'], kind: 'pelagic', methods: ['boat'], size: '100–300 سم',
    tide: 'الربيع، حين تعبر مضيق جبل طارق إلى المتوسط لتتكاثر.',
    bait: 'سمك حي، وطعوم تُسحب خلف القارب؛ ويُصطاد تقليدياً بشباك المصائد الثابتة.',
    about: 'أكبر أنواع التونة؛ يتجاوز وزنها ستمئة كيلوغرام. تهاجر بين الأطلسي والمتوسط، وما زالت المصائد التقليدية تنصب لها على سواحل المغرب وتونس.',
    note: 'صيدها خاضع لحصص دولية صارمة.',
  },
  {
    id: 'swordfish', ar: 'أبو سيف', en: 'Swordfish', sci: 'Xiphias gladius',
    local: [{ name: 'أبو سيف', where: 'تسمية عامة' }],
    seas: ['med', 'atlantic', 'indian'], kind: 'pelagic', methods: ['boat'], size: '120–300 سم',
    tide: 'الليل في المياه العميقة، حين يصعد قرب السطح.',
    bait: 'حبار، سمك كامل، يُصطاد بخيوط طويلة من القوارب.',
    about: 'يستخدم منقاره الطويل المسطح كالسيف ليضرب أسراب الأسماك. يدفئ عينيه ودماغه بعضو خاص ليرى جيداً في المياه الباردة العميقة.',
  },
  {
    id: 'octopus', ar: 'أخطبوط', en: 'Common octopus', sci: 'Octopus vulgaris',
    local: [{ name: 'أخطبوط', where: 'تسمية عامة' }, { name: 'قرنيط', where: 'تونس وليبيا' }],
    seas: ['med', 'atlantic'], kind: 'cephalopod', methods: ['shore', 'boat'], size: '30–90 سم',
    tide: 'الجزر، حين تنكشف الصخور والجحور في المياه الضحلة.',
    bait: 'طعم صناعي خاص بالأخطبوط، أو سرطان مربوط.',
    about: 'له ثلاثة قلوب ودم أزرق، ويغير لونه وملمس جلده في لحظة. سواحل المغرب وموريتانيا من أغنى مناطق صيده في العالم.',
  },
  {
    id: 'bluecrab', ar: 'السرطان الأزرق', en: 'Blue swimming crab', sci: 'Portunus segnis',
    local: [{ name: 'قبقب', where: 'الخليج العربي' }, { name: 'كابوريا', where: 'مصر' }],
    seas: ['gulf', 'red', 'indian', 'med'], kind: 'crustacean', methods: ['shore', 'boat'], size: '12–20 سم',
    tide: 'المد الصاعد في الليل، فوق القيعان الرملية والطينية الضحلة.',
    bait: 'رؤوس سمك أو دجاج في سلة أو شبكة قاع.',
    about: 'سرطان سبّاح بأرجل خلفية كالمجاديف. عبر قناة السويس وانتشر في تونس حتى لقّبه الصيادون «داعش» لأنه يمزق الشباك، ثم صار من صادرات تونس.',
  },
  {
    id: 'shrimp', ar: 'ربيان', en: 'Green tiger prawn', sci: 'Penaeus semisulcatus',
    local: [{ name: 'ربيان', where: 'الخليج العربي' }, { name: 'جمبري', where: 'مصر' }, { name: 'قمبري', where: 'تونس' }],
    seas: ['gulf', 'red', 'indian', 'med'], kind: 'crustacean', methods: ['boat'], size: '10–25 سم',
    tide: 'الليل، حين يخرج من الرمل ليتغذى؛ وأوفر صيده في الأحمال.',
    bait: 'يُصطاد بشباك الجر من القوارب، وبالشبك اليدوي في الضحضاح.',
    about: 'يختبئ في الرمل نهاراً ويخرج ليلاً. يفتتح موسمه في الكويت والسعودية بعد أشهر من المنع، فيصبح حدثاً ينتظره الجميع.',
    note: 'موسم صيده محدد في دول الخليج؛ راجع مواعيد الفتح والمنع في بلدك.',
  },
  {
    id: 'lobster', ar: 'جراد البحر', en: 'European spiny lobster', sci: 'Palinurus elephas',
    local: [{ name: 'جراد البحر', where: 'الفصحى' }, { name: 'استاكوزا', where: 'مصر والشام' }, { name: 'لنقوست', where: 'المغرب العربي' }],
    seas: ['med', 'atlantic'], kind: 'crustacean', methods: ['boat'], size: '20–50 سم',
    tide: 'الليل، حين يخرج من الشقوق الصخرية.',
    bait: 'يُصطاد بالأقفاص المطعّمة بالسمك.',
    about: 'ليس له مخالب كبيرة، بل قرنا استشعار طويلان شائكان يصدر بهما صوتاً كالصرير ليخيف أعداءه. يعيش عشرات السنين.',
    note: 'يُمنع صيد الإناث الحاملات للبيض والصغار في معظم الدول.',
  },
  {
    id: 'blacktip', ar: 'قرش أسود الطرف', en: 'Blacktip shark', sci: 'Carcharhinus limbatus',
    local: [{ name: 'جرجور', where: 'الخليج العربي (للقروش عامة)' }, { name: 'قرش أسود الطرف', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'shark', methods: ['boat', 'shore'], size: '120–200 سم',
    tide: 'المد المتحرك في المياه الضحلة الدافئة.',
    bait: 'لا يُنصح باستهدافه؛ أطلقه إن علق بالخطاف.',
    about: 'أشهر قروش الخليج، تعرفه من الأطراف السوداء لزعانفه. يقفز أحياناً خارج الماء وهو يدور حول نفسه أثناء مطاردة الأسماك.',
    note: 'تمنع بعض دول الخليج صيد القروش أو تقيده في مواسم محددة.',
  },
  {
    id: 'hammerhead', ar: 'قرش أبو مطرقة', en: 'Great hammerhead', sci: 'Sphyrna mokarran',
    local: [{ name: 'أبو مطرقة', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'shark', methods: [], size: '250–450 سم',
    tide: 'يُشاهد في الغطس عند حواف الشعاب العميقة.',
    bait: 'لا يُصطاد؛ أطلقه فوراً إن علق بالخطاف.',
    about: 'رأسه العريض كالمطرقة يحمل حواس تلتقط الإشارات الكهربائية للأسماك المدفونة في الرمل، وخاصة اللخم الذي يحبه.',
    note: 'مهدد بالانقراض بدرجة حرجة.',
  },
  {
    id: 'whaleshark', ar: 'القرش الحوتي', en: 'Whale shark', sci: 'Rhincodon typus',
    local: [{ name: 'القرش الحوتي', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'shark', methods: [], size: '5–12 متر',
    tide: 'يُشاهد في الصيف عند تجمعات العوالق، قبالة قطر وجيبوتي وعُمان.',
    bait: 'لا يُصطاد؛ محمي.',
    about: 'أكبر سمكة في العالم، لكنه مسالم تماماً ويتغذى على العوالق الدقيقة. تتجمع المئات منه كل صيف في حقل الشاهين قبالة قطر.',
    note: 'مهدد بالانقراض ومحمي في معظم الدول العربية.',
  },
  {
    id: 'bluespotray', ar: 'لخمة منقطة بالأزرق', en: 'Bluespotted ribbontail ray', sci: 'Taeniura lymma',
    local: [{ name: 'لخمة', where: 'الخليج والبحر الأحمر' }],
    seas: ['red', 'indian'], kind: 'shark', methods: [], size: '25–35 سم (عرض القرص)',
    tide: 'المد العالي، حين تخرج من تحت الشعاب إلى الرمل الضحل.',
    bait: 'لا تُصطاد.',
    about: 'من أجمل ما يراه الغطاسون في البحر الأحمر بنقاطها الزرقاء اللامعة. تختبئ نهاراً تحت حواف المرجان.',
    note: 'في ذيلها شوكة سامة؛ امشِ في الماء الضحل بخطوات جارّة كي لا تدوس عليها.',
  },
  {
    id: 'torpedo', ar: 'الرعّاد', en: 'Marbled electric ray', sci: 'Torpedo marmorata',
    local: [{ name: 'رعّاد', where: 'تسمية عامة' }],
    seas: ['med', 'atlantic'], kind: 'shark', methods: [], size: '30–60 سم',
    tide: 'الليل، مدفوناً في الرمل.',
    bait: 'لا يُصطاد.',
    about: 'يصعق فريسته بتيار كهربائي قد يصل إلى مئتي فولت. استخدمه الأطباء الإغريق والرومان لعلاج الصداع.',
    note: 'لا تلمسه حتى لو بدا ميتاً؛ صعقته مؤلمة.',
  },
  {
    id: 'lionfish', ar: 'سمكة الأسد', en: 'Devil firefish', sci: 'Pterois miles',
    local: [{ name: 'سمكة الأسد', where: 'تسمية عامة' }],
    seas: ['red', 'indian', 'med'], kind: 'reef', methods: ['shore'], size: '20–35 سم',
    tide: 'الغروب والليل، حين تخرج للصيد.',
    bait: 'تُصطاد بالحربة في الغطس للحد من انتشارها في المتوسط.',
    about: 'موطنها البحر الأحمر، لكنها عبرت قناة السويس وغزت شرق المتوسط فأكلت صغار الأسماك المحلية. لحمها لذيذ ويُشجع على أكلها.',
    note: 'أشواكها سامة جداً؛ اللسعة تحتاج إلى غمر المكان في ماء ساخن وزيارة الطبيب.',
  },
  {
    id: 'puffer', ar: 'سمكة الأرنب', en: 'Silver-cheeked toadfish', sci: 'Lagocephalus sceleratus',
    local: [{ name: 'أرنب', where: 'مصر ولبنان' }],
    seas: ['red', 'med'], kind: 'pelagic', methods: ['shore', 'boat'], size: '30–70 سم',
    tide: 'تظهر في كل الأوقات وتقطع الخيوط بأسنانها.',
    bait: 'تأخذ أي طعم؛ اقطع الخيط وأطلقها بحذر.',
    about: 'غزت المتوسط عبر قناة السويس. أسنانها الأربعة كالمقص تقطع الشباك والخيوط، وجسمها يحمل سماً قاتلاً لا يزول بالطهي.',
    note: 'سامة قاتلة: لا تأكلها أبداً، ولا تبعها.',
  },
  {
    id: 'napoleon', ar: 'نابليون', en: 'Humphead wrasse', sci: 'Cheilinus undulatus',
    local: [{ name: 'نابليون', where: 'مصر والبحر الأحمر' }],
    seas: ['red', 'indian'], kind: 'reef', methods: [], size: '100–200 سم',
    tide: 'يُشاهد في الغطس على حواف الشعاب في كل الأوقات.',
    bait: 'لا يُصطاد؛ محمي.',
    about: 'سُمّي نابليون لنتوء على جبينه يشبه قبعة القائد الفرنسي. فضولي يقترب من الغطاسين، ويأكل نجم البحر الشوكي الذي يدمر المرجان.',
    note: 'مهدد بالانقراض وتجارته مقيدة دولياً.',
  },
  {
    id: 'sohal', ar: 'الجرّاح العربي', en: 'Sohal surgeonfish', sci: 'Acanthurus sohal',
    local: [{ name: 'سمكة الجرّاح', where: 'تسمية عامة' }],
    seas: ['red', 'gulf', 'indian'], kind: 'reef', methods: [], size: '25–40 سم',
    tide: 'يُرى في الأمواج المتكسرة على حافة الشعاب الضحلة.',
    bait: 'لا يُستهدف بالصيد.',
    about: 'على جانبي ذيله شوكة حادة كمشرط الجرّاح، يرفعها حين يدافع عن منطقته من الطحالب. شرس مع الأسماك الأخرى وأحياناً مع الغطاسين.',
  },
  {
    id: 'angelfish', ar: 'سمكة الملاك', en: 'Yellowbar angelfish', sci: 'Pomacanthus maculosus',
    local: [{ name: 'سمكة الملاك', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'reef', methods: [], size: '20–50 سم',
    tide: 'تُرى في الغطس حول الشعاب والحطام.',
    bait: 'لا تُستهدف بالصيد.',
    about: 'من أكثر الأسماك التي يصورها الغطاسون في الخليج، بلونها الأزرق وبقعتها الصفراء. صغارها مخططة بالأبيض والأزرق حتى تبدو نوعاً آخر.',
  },
  {
    id: 'clownfish', ar: 'سمكة المهرج', en: 'Red Sea clownfish', sci: 'Amphiprion bicinctus',
    local: [{ name: 'سمكة المهرج', where: 'تسمية عامة' }, { name: 'نيمو', where: 'شائع' }],
    seas: ['red'], kind: 'reef', methods: [], size: '10–14 سم',
    tide: 'تُرى في الغطس طوال اليوم داخل شقائق النعمان البحرية.',
    bait: 'لا تُصطاد.',
    about: 'تعيش بين لوامس شقائق النعمان اللاسعة دون أن تتأذى. تولد كلها ذكوراً، وأكبرها في المجموعة يتحول إلى أنثى.',
  },
  {
    id: 'seahorse', ar: 'حصان البحر', en: 'Spotted seahorse', sci: 'Hippocampus kuda',
    local: [{ name: 'حصان البحر', where: 'تسمية عامة' }, { name: 'فرس البحر', where: 'تسمية عامة' }],
    seas: ['gulf', 'red', 'indian'], kind: 'reef', methods: [], size: '10–17 سم',
    tide: 'يُرى في المياه الهادئة بين الأعشاب البحرية وجذور المانغروف.',
    bait: 'لا يُصطاد.',
    about: 'الذكر هو الذي يحمل البيض في جيب على بطنه حتى يفقس. يتمسك بالأعشاب بذيله، وتتحرك كل عين من عينيه وحدها.',
    note: 'تجارته مقيدة دولياً؛ أعده إلى الماء إن علق في الشبكة.',
    article: 'seahorse',
  },
];

export interface FishPhoto { w: number; h: number; artist: string; license: string; licenseUrl: string; source: string }
export const fishPhotos = photos as Record<string, FishPhoto>;

/** "N species" in Arabic: 3–10 take the plural أنواع, other numbers the accusative singular نوعاً */
export const speciesCount = (n: number) => (n >= 3 && n <= 10 ? `${n} أنواع` : `${n} نوعاً`);

/** Species nobody targets (protected, or released if caught): their pages are about the animal, not fishing it */
export const notTargeted = (f: Fish) => f.bait.startsWith('لا ');

/** Name as people search it: "سمك" before true fish we fish for, never before squid, crabs, sharks or "سمكة …" */
export function fishLabel(f: Fish): string {
  const bare = notTargeted(f) || f.kind === 'cephalopod' || f.kind === 'crustacean' || f.kind === 'shark' || f.ar.startsWith('سمك');
  return bare ? f.ar : `سمك ${f.ar}`;
}

/** The first other local name (e.g. فرس البحر, درّاك, استاكوزا), for titles */
export function fishAltName(f: Fish): string | undefined {
  if (f.ar.includes('(')) return undefined;
  const plain = (s: string) => s.replace(/^ال/, '');
  return f.local.flatMap(l => l.name.split(' / ')).find(n => !f.ar.includes(plain(n)) && !plain(n).includes(plain(f.ar)));
}

/** Page title: fishing guide for species we fish for, a field guide for the rest */
export function fishTitle(f: Fish): string {
  const make = (alt?: string) => {
    const name = `${fishLabel(f)}${alt ? ` (${alt})` : ''}`;
    if (notTargeted(f)) return `${name} في البحار العربية: الأسماء والموطن والحماية`;
    return f.ar.startsWith('سمكة') ? `${name}: أسماؤها المحلية وأفضل وقت لصيدها` : `${name}: أسماؤه المحلية وأفضل وقت لصيده`;
  };
  // Over ~58 characters (plus " — ArabTides") Google cuts the title, so drop the bracketed name
  const full = make(fishAltName(f));
  return full.length > 58 ? make() : full;
}

// iNaturalist research-grade observations within 50 km of each port (tools/fish-photos/inat-counts.mjs)
const observations = portSpecies as Record<string, [string, number][]>;
// Our names → the name iNaturalist files the species under, where they differ
const INAT_NAME: Record<string, string> = { 'Sepia pharaonis': 'Acanthosepion pharaonis' };

/** How many times a species was recorded near a port (genus-level for "spp." entries) */
export function observedNear(f: Fish, portId: string): number {
  const name = INAT_NAME[f.sci] || f.sci;
  const genus = name.endsWith('spp.') ? name.split(' ')[0] + ' ' : null;
  return (observations[portId] || [])
    .filter(([n]) => genus ? n.startsWith(genus) : n === name)
    .reduce((s, [, c]) => s + c, 0);
}

/** Species for a port page: those recorded near the port first (most-recorded first), then the rest of its sea */
export function fishForPort(portId: string): { fish: Fish[]; observed: Set<string> } {
  const sea = portSea[portId];
  const inSea = fish.filter(f => f.seas.includes(sea));
  const counts = new Map(inSea.map(f => [f.id, observedNear(f, portId)]));
  const seen = inSea.filter(f => counts.get(f.id)! > 0).sort((a, b) => counts.get(b.id)! - counts.get(a.id)!);
  return { fish: [...seen, ...inSea.filter(f => !counts.get(f.id))], observed: new Set(seen.map(f => f.id)) };
}

/** Ports whose sea a species lives in */
export function portsForFish(f: Fish) {
  return (placesIndex as { id: string; name_ar: string; country: string }[])
    .filter(p => f.seas.includes(portSea[p.id]));
}
