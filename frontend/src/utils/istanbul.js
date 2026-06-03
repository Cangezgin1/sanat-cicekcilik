// Ana 6 ilçe
export const MAIN_DISTRICTS = ['Esenyurt', 'Avcılar', 'Beylikdüzü', 'Büyükçekmece', 'Küçükçekmece', 'Bahçeşehir']

// Diğer İstanbul ilçeleri (ana 6 hariç)
export const OTHER_ISTANBUL_DISTRICTS = [
  'Adalar', 'Arnavutköy', 'Ataşehir', 'Bağcılar', 'Bahçelievler',
  'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz',
  'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler',
  'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören',
  'Kadıköy', 'Kağıthane', 'Kartal', 'Maltepe', 'Pendik',
  'Sancaktepe', 'Sarıyer', 'Silivri', 'Şile', 'Şişli',
  'Sultanbeyli', 'Sultangazi', 'Tuzla', 'Ümraniye', 'Üsküdar',
  'Zeytinburnu'
].filter(d => !MAIN_DISTRICTS.includes(d)).sort()
