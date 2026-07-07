// The 9 groups of the وسيلة (physical chart structure).
// - Groups 0-7 hold the 99 names of Allah.
// - Group 8 holds the 4 vocative dua phrases (not counted as names).

export const BOUQUETS = [
  { id: 'famous',    order: 0, title: 'الأسماء المشهورة',        color: 'gold', size: 5,  rows: 1, isDua: false },
  { id: 'jamia',     order: 1, title: 'الأسماء الجامعة',           color: 'teal', size: 15, rows: 3, isDua: false },
  { id: 'ilm',       order: 2, title: 'العلم والقرب والفتح',       color: 'gold', size: 15, rows: 3, isDua: false },
  { id: 'wilaya',    order: 3, title: 'الولاية والكرم والتوحيد',   color: 'teal', size: 15, rows: 3, isDua: false },
  { id: 'hidaya',    order: 4, title: 'الهداية والعطاء واللطف',    color: 'gold', size: 15, rows: 3, isDua: false },
  { id: 'rububiyya', order: 5, title: 'الربوبية والقدرة والنصر',   color: 'teal', size: 15, rows: 3, isDua: false },
  { id: 'mulk',      order: 6, title: 'الملك والحفظ والإجابة',     color: 'gold', size: 15, rows: 3, isDua: false },
  { id: 'khitam',    order: 7, title: 'أسماء الختام',               color: 'teal', size: 4,  rows: 1, isDua: false },
  { id: 'duaa',      order: 8, title: 'جمل دعائية جامعة',          color: 'gold', size: 4,  rows: 1, isDua: true  },
]

export const TOTAL_NAMES = 99 // 5 + 6*15 + 4

// Opening + closing hadiths that wrap the وسيلة (the sandwich)
export const OPENING_HADITH = {
  text: 'اللَّهُمَّ إِنِّي أَشْهَدُكَ وَأَشْهَدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ، لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ',
  source: 'من حديث أنس بن مالك رضي الله عنه',
}

export const CLOSING_HADITH = {
  text: 'أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ، سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي',
  source: 'من حديث عبد الله بن مسعود رضي الله عنه',
}
