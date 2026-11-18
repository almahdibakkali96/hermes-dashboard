/**
 * ArabTides — which sea each port is on (pure data, no imports; also used by Node scripts)
 */

export type SeaId = 'atlantic' | 'med' | 'red' | 'gulf' | 'indian' | 'world';

export const seas: Record<SeaId, { name: string; color: string }> = {
  atlantic: { name: 'المحيط الأطلسي', color: '#0ea5e9' },
  med: { name: 'البحر الأبيض المتوسط', color: '#8b5cf6' },
  red: { name: 'البحر الأحمر', color: '#f43f5e' },
  gulf: { name: 'الخليج العربي', color: '#0d9488' },
  indian: { name: 'بحر العرب وخليج عدن والمحيط الهندي', color: '#f59e0b' },
  world: { name: 'خارج العالم العربي', color: '#64748b' }, // world places (src/lib/regions.ts): no fish list
};

export const portSea: Record<string, SeaId> = {
  casablanca: 'atlantic', agadir: 'atlantic', tangier: 'atlantic', rabat: 'atlantic', 'el-jadida': 'atlantic',
  safi: 'atlantic', essaouira: 'atlantic', dakhla: 'atlantic', 'al-hoceima': 'med', nouadhibou: 'atlantic', nouakchott: 'atlantic',
  algiers: 'med', oran: 'med', tunis: 'med', sfax: 'med', 'tripoli-ly': 'med', benghazi: 'med', alexandria: 'med', 'port-said': 'med',
  bizerte: 'med', sousse: 'med', gabes: 'med', djerba: 'med', mahdia: 'med', zuwara: 'med', 'al-khoms': 'med', misrata: 'med', sirte: 'med', tobruk: 'med',
  gaza: 'med', beirut: 'med', 'tripoli-lb': 'med', latakia: 'med', tartus: 'med',
  hurghada: 'red', 'port-sudan': 'red', aqaba: 'red', jeddah: 'red', kaec: 'red', hodeidah: 'red',
  dammam: 'gulf', khobar: 'gulf', 'al-uqair': 'gulf', dubai: 'gulf', 'umm-al-quwain': 'gulf', 'abu-dhabi': 'gulf', 'ras-al-khaimah': 'gulf', doha: 'gulf', manama: 'gulf', 'kuwait-city': 'gulf', 'umm-qasr': 'gulf', bushehr: 'gulf', 'bandar-abbas': 'gulf',
  aden: 'indian', mukalla: 'indian', shihr: 'indian', muscat: 'indian', sohar: 'indian', sur: 'indian', salalah: 'indian', fujairah: 'indian', djibouti: 'indian',
  berbera: 'indian', mogadishu: 'indian', moroni: 'indian',
  // added in #077 (tools/tides/arab-places.txt)
  mdiq: 'med', martil: 'med', 'cabo-negro': 'med', fnideq: 'med', nador: 'med', saidia: 'med', ghazaouet: 'med', mostaganem: 'med', tipaza: 'med', bejaia: 'med', jijel: 'med', skikda: 'med', annaba: 'med', tabarka: 'med', kelibia: 'med', hammamet: 'med', monastir: 'med', chebba: 'med', kerkennah: 'med', skhira: 'med', zarzis: 'med', derna: 'med', 'marsa-matruh': 'med', 'el-alamein': 'med', baltim: 'med', 'ras-el-bar': 'med', 'el-arish': 'med', sidon: 'med', tyre: 'med', byblos: 'med',
  asilah: 'atlantic', larache: 'atlantic', 'moulay-bousselham': 'atlantic', kenitra: 'atlantic', temara: 'atlantic', skhirat: 'atlantic', bouznika: 'atlantic', mohammedia: 'atlantic', 'dar-bouazza': 'atlantic', 'sidi-rahal': 'atlantic', oualidia: 'atlantic', imsouane: 'atlantic', taghazout: 'atlantic', 'sidi-ifni': 'atlantic', 'tan-tan': 'atlantic', tarfaya: 'atlantic', laayoune: 'atlantic', boujdour: 'atlantic',
  suez: 'red', 'ain-sokhna': 'red', 'ras-sudr': 'red', zafarana: 'red', 'ras-gharib': 'red', 'el-tor': 'red', 'sharm-el-sheikh': 'red', dahab: 'red', safaga: 'red', 'marsa-alam': 'red', duba: 'red', 'al-wajh': 'red', umluj: 'red', yanbu: 'red', 'al-lith': 'red', qunfudhah: 'red', jazan: 'red', farasan: 'red', mocha: 'red',
  khafji: 'gulf', manifa: 'gulf', jubail: 'gulf', 'ras-tanura': 'gulf', qatif: 'gulf', 'al-khiran': 'gulf', salmiya: 'gulf', failaka: 'gulf', 'al-ruwais-qa': 'gulf', 'al-khor': 'gulf', 'al-wakrah': 'gulf', 'khor-al-udaid': 'gulf', dukhan: 'gulf', sharjah: 'gulf', ajman: 'gulf', 'ruwais-ae': 'gulf', mirfa: 'gulf', khasab: 'gulf',
  dibba: 'indian', 'khor-fakkan': 'indian', shinas: 'indian', saham: 'indian', barka: 'indian', quriyat: 'indian', 'ras-al-hadd': 'indian', masirah: 'indian', duqm: 'indian', mirbat: 'indian', socotra: 'indian', tadjoura: 'indian', bosaso: 'indian', kismayo: 'indian', mutsamudu: 'indian',
};
