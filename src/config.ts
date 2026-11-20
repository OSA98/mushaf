// Central app configuration. Change the brand here and it updates everywhere
// (app name, landing page, PWA manifest title is in vite.config.ts).
export const BRAND = {
  nameAr: 'مصحف الأزهر الشريف',
  nameEn: 'Al-Azhar Mushaf',
  taglineAr: 'اقرأ، استمع، تدبّر',
  taglineEn: 'Read, Listen, Reflect',
  contactEmail: '',
  // Store links — fill these in after publishing the native apps.
  links: {
    appStore: '',
    googlePlay: '',
    windows: '',
    mac: '',
    linux: '',
    github: '',
  },
}

export type RiwayaId = 'hafs' | 'shuba' | 'warsh' | 'qalun' | 'douri' | 'sousi' | 'bazzi' | 'qunbul'

export const RIWAYAT: { id: RiwayaId; ar: string; en: string; keyword: string }[] = [
  { id: 'hafs', ar: 'حفص عن عاصم', en: "Hafs 'an 'Asim", keyword: 'حفص' },
  { id: 'shuba', ar: 'شعبة عن عاصم', en: "Shu'bah 'an 'Asim", keyword: 'شعبة' },
  { id: 'warsh', ar: 'ورش عن نافع', en: "Warsh 'an Nafi'", keyword: 'ورش' },
  { id: 'qalun', ar: 'قالون عن نافع', en: "Qalun 'an Nafi'", keyword: 'قالون' },
  { id: 'douri', ar: 'الدوري عن أبي عمرو', en: "Ad-Duri 'an Abi 'Amr", keyword: 'الدوري' },
  { id: 'sousi', ar: 'السوسي عن أبي عمرو', en: "As-Susi 'an Abi 'Amr", keyword: 'السوسي' },
  { id: 'bazzi', ar: 'البزي عن ابن كثير', en: "Al-Bazzi 'an Ibn Kathir", keyword: 'البزي' },
  { id: 'qunbul', ar: 'قنبل عن ابن كثير', en: "Qunbul 'an Ibn Kathir", keyword: 'قنبل' },
]

// Verse-by-verse reciters (Hafs numbering) served by the Islamic Network CDN.
// Used for synchronized verse highlighting and repeat.
export const VERSE_RECITERS: { id: string; ar: string; en: string; bitrate: number }[] = [
  { id: 'ar.abdulsamad', ar: 'عبد الباسط عبد الصمد', en: 'Abdul Basit Abdul Samad', bitrate: 64 },
  { id: 'ar.alafasy', ar: 'مشاري راشد العفاسي', en: 'Mishary Alafasy', bitrate: 128 },
  { id: 'ar.husary', ar: 'محمود خليل الحصري', en: 'Mahmoud Khalil Al-Husary', bitrate: 128 },
  { id: 'ar.husarymujawwad', ar: 'الحصري (مجوّد)', en: 'Al-Husary (Mujawwad)', bitrate: 128 },
  { id: 'ar.mahermuaiqly', ar: 'ماهر المعيقلي', en: 'Maher Al-Muaiqly', bitrate: 128 },
  { id: 'ar.abdurrahmaansudais', ar: 'عبد الرحمن السديس', en: 'Abdurrahman As-Sudais', bitrate: 192 },
  { id: 'ar.saoodshuraym', ar: 'سعود الشريم', en: 'Saud Ash-Shuraym', bitrate: 128 },
  { id: 'ar.hudhaify', ar: 'علي الحذيفي', en: 'Ali Al-Hudhaify', bitrate: 128 },
  { id: 'ar.muhammadayyoub', ar: 'محمد أيوب', en: 'Muhammad Ayyoub', bitrate: 128 },
  { id: 'ar.muhammadjibreel', ar: 'محمد جبريل', en: 'Muhammad Jibreel', bitrate: 128 },
  { id: 'ar.shaatree', ar: 'أبو بكر الشاطري', en: 'Abu Bakr Ash-Shaatree', bitrate: 128 },
  { id: 'ar.ahmedajamy', ar: 'أحمد بن علي العجمي', en: 'Ahmed Al-Ajamy', bitrate: 128 },
  { id: 'ar.abdullahbasfar', ar: 'عبد الله بصفر', en: 'Abdullah Basfar', bitrate: 192 },
  { id: 'ar.hanirifai', ar: 'هاني الرفاعي', en: 'Hani Ar-Rifai', bitrate: 192 },
  { id: 'ar.ibrahimakhbar', ar: 'إبراهيم الأخضر', en: 'Ibrahim Al-Akhdar', bitrate: 32 },
]

export const TAFSIRS: { id: string; ar: string; en: string }[] = [
  { id: 'ar.muyassar', ar: 'التفسير الميسر', en: 'Al-Muyassar' },
  { id: 'ar.jalalayn', ar: 'تفسير الجلالين', en: 'Al-Jalalayn' },
  { id: 'ar.waseet', ar: 'التفسير الوسيط (طنطاوي)', en: 'Al-Waseet (Tantawi)' },
  { id: 'ar.baghawi', ar: 'تفسير البغوي', en: 'Al-Baghawi' },
  { id: 'ar.qurtubi', ar: 'تفسير القرطبي', en: 'Al-Qurtubi' },
  { id: 'ar.miqbas', ar: 'تنوير المقباس', en: 'Tanwir al-Miqbas' },
]

export const TRANSLATIONS: { id: string; name: string; lang: string }[] = [
  { id: 'en.sahih', name: 'English — Saheeh International', lang: 'en' },
  { id: 'en.pickthall', name: 'English — Pickthall', lang: 'en' },
  { id: 'fr.hamidullah', name: 'Français — Hamidullah', lang: 'fr' },
  { id: 'es.cortes', name: 'Español — Cortés', lang: 'es' },
  { id: 'de.aburida', name: 'Deutsch — Abu Rida', lang: 'de' },
  { id: 'tr.diyanet', name: 'Türkçe — Diyanet', lang: 'tr' },
  { id: 'id.indonesian', name: 'Bahasa Indonesia — Kemenag', lang: 'id' },
  { id: 'ms.basmeih', name: 'Bahasa Melayu — Basmeih', lang: 'ms' },
  { id: 'ur.jalandhry', name: 'اردو — جالندھری', lang: 'ur' },
  { id: 'fa.ansarian', name: 'فارسی — انصاریان', lang: 'fa' },
  { id: 'ru.kuliev', name: 'Русский — Кулиев', lang: 'ru' },
  { id: 'bn.bengali', name: 'বাংলা — Muhiuddin Khan', lang: 'bn' },
  { id: 'zh.jian', name: '中文 — Ma Jian', lang: 'zh' },
  { id: 'sw.barwani', name: 'Kiswahili — Al-Barwani', lang: 'sw' },
  { id: 'ha.gumi', name: 'Hausa — Gumi', lang: 'ha' },
]

export const API = {
  alquran: 'https://api.alquran.cloud/v1',
  verseAudio: (edition: string, bitrate: number, globalAyah: number) =>
    `https://cdn.islamic.network/quran/audio/${bitrate}/${edition}/${globalAyah}.mp3`,
  mp3quran: 'https://mp3quran.net/api/v3',
}
