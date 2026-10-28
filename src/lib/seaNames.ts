/**
 * ArabTides — which sea each port is on (pure data, no imports; also used by Node scripts)
 */

export type SeaId = 'atlantic' | 'med' | 'red' | 'gulf' | 'indian';

export const seas: Record<SeaId, { name: string; color: string }> = {
  atlantic: { name: 'المحيط الأطلسي', color: '#0ea5e9' },
  med: { name: 'البحر الأبيض المتوسط', color: '#8b5cf6' },
  red: { name: 'البحر الأحمر', color: '#f43f5e' },
  gulf: { name: 'الخليج العربي', color: '#0d9488' },
  indian: { name: 'بحر العرب وخليج عدن والمحيط الهندي', color: '#f59e0b' },
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
};
