import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { BRAND, RIWAYAT, TAFSIRS, TRANSLATIONS } from '../config'
import { Icon, type IconName } from '../components/Icon'
import { Logo, BrandName } from '../components/ui'
import { useInstallPrompt } from '../lib/platform'

export default function Landing() {
  const { t, lang, num } = useT()
  const install = useInstallPrompt()
  const ar = lang === 'ar'

  const features: { icon: IconName; title: string; desc: string }[] = ar ? [
    { icon: 'bookOpen', title: 'المصحف بالرسم العثماني', desc: 'خطوط مجمع الملك فهد لطباعة المصحف الشريف، بعرض صفحة أو صفحتين، مع الوضع الليلي وتكبير الخط.' },
    { icon: 'layers', title: 'ثماني روايات', desc: 'حفص، شعبة، ورش، قالون، الدوري، السوسي، البزي، وقنبل — بنصوص وخطوط معتمدة لكل رواية.' },
    { icon: 'voice', title: 'تلاوات كبار القراء', desc: 'أكثر من ١٥٠ قارئًا، مع تظليل الآية أثناء التلاوة، والتكرار، وضبط السرعة.' },
    { icon: 'book', title: 'مكتبة التفاسير', desc: 'الميسر، الجلالين، الوسيط، البغوي، القرطبي وغيرها بجانب النص القرآني.' },
    { icon: 'translate', title: 'ترجمات المعاني', desc: 'ترجمات معتمدة بأكثر من ١٥ لغة عالمية.' },
    { icon: 'search', title: 'بحث سريع', desc: 'ابحث بالكلمة دون تشكيل، أو برقم الصفحة، أو باسم السورة.' },
    { icon: 'eyeOff', title: 'وضع الحفظ', desc: 'أخفِ الآيات واختبر حفظك، مع تكرار الآية بعدد المرات الذي تريده.' },
    { icon: 'task', title: 'خطة الختمة', desc: 'حدد مدة الختمة وتابع وردك اليومي، والمداومة، وإحصائيات القراءة.' },
    { icon: 'note', title: 'العلامات والملاحظات', desc: 'احفظ مواضعك، ظلّل الآيات، واكتب تأملاتك — كلها محفوظة على جهازك.' },
    { icon: 'radio', title: 'إذاعات القرآن', desc: 'بث مباشر لإذاعات القرآن الكريم من مختلف أنحاء العالم.' },
    { icon: 'mosque', title: 'مواقيت الصلاة والقبلة', desc: 'حساب المواقيت واتجاه القبلة على جهازك حسب موقعك.' },
    { icon: 'download', title: 'يعمل بدون إنترنت', desc: 'نص المصحف مدمج في التطبيق، ويمكن تحميل التلاوات للاستماع دون اتصال.' },
  ] : [
    { icon: 'bookOpen', title: 'Uthmani script Mushaf', desc: 'KFGQPC fonts, single or double page, night mode and adjustable size.' },
    { icon: 'layers', title: 'Eight narrations', desc: 'Hafs, Shu\'bah, Warsh, Qalun, Ad-Duri, As-Susi, Al-Bazzi and Qunbul.' },
    { icon: 'voice', title: 'Renowned reciters', desc: '150+ reciters with verse highlighting, repeat and speed control.' },
    { icon: 'book', title: 'Tafsir library', desc: 'Al-Muyassar, Al-Jalalayn, Al-Waseet, Al-Baghawi, Al-Qurtubi and more.' },
    { icon: 'translate', title: 'Translations', desc: 'Trusted translations of the meanings in 15+ languages.' },
    { icon: 'search', title: 'Fast search', desc: 'Search by word (no diacritics needed), page number or surah.' },
    { icon: 'eyeOff', title: 'Memorization mode', desc: 'Hide verses to test yourself and repeat verses as many times as you need.' },
    { icon: 'task', title: 'Khatma plan', desc: 'Pick a duration, follow your daily wird, streaks and reading stats.' },
    { icon: 'note', title: 'Bookmarks & notes', desc: 'Save places, highlight verses and write reflections — all on your device.' },
    { icon: 'radio', title: 'Quran radio', desc: 'Live Quran radio stations from around the world.' },
    { icon: 'mosque', title: 'Prayer times & Qibla', desc: 'Computed on your device from your location.' },
    { icon: 'download', title: 'Works offline', desc: 'The Quran text is built in, and recitations can be downloaded.' },
  ]

  const stats = [
    { icon: 'layers' as IconName, value: num(RIWAYAT.length), label: ar ? 'روايات للمصحف' : 'Narrations' },
    { icon: 'voice' as IconName, value: '+' + num(150), label: ar ? 'قارئ' : 'Reciters' },
    { icon: 'book' as IconName, value: num(TAFSIRS.length), label: ar ? 'تفاسير' : 'Tafsirs' },
    { icon: 'translate' as IconName, value: num(TRANSLATIONS.length), label: ar ? 'ترجمة' : 'Translations' },
  ]

  const store = (href: string, icon: IconName, top: string, bottom: string) => (
    href ? (
      <a className="store-btn" href={href} target="_blank" rel="noreferrer"><Icon name={icon} /> <span><small>{top}</small><strong>{bottom}</strong></span></a>
    ) : (
      <span className="store-btn disabled" title={ar ? 'قريبًا' : 'Coming soon'}><Icon name={icon} /> <span><small>{ar ? 'قريبًا على' : 'Soon on'}</small><strong>{bottom}</strong></span></span>
    )
  )

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="row"><Logo size={44} /><strong className="h3"><BrandName /></strong></div>
        <nav className="row landing-links">
          <a href="#features">{t('features')}</a>
          <a href="#versions">{t('appVersions')}</a>
          <Link to="/radio">{t('radio')}</Link>
        </nav>
        <div className="row">
          {install && <button className="btn secondary sm" onClick={install}><Icon name="download" size={18} /> {t('installApp')}</button>}
          <Link to="/" className="btn sm">{t('openWebApp')}</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title"><BrandName /></h1>
          <p className="hero-desc">
            {ar
              ? 'منصة متكاملة لقراءة المصحف الشريف، والاستماع إلى التلاوات، ودراسة التفسير، والتعمق في معاني القرآن الكريم — على الويب وسطح المكتب والجوال، مجانًا وبدون إعلانات.'
              : 'An integrated platform to read the Holy Quran, listen to recitations, study tafsir and reflect on its meanings — on the web, desktop and mobile, free and ad-free.'}
          </p>
          <div className="row" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Link to="/read/1" className="btn lg"><Icon name="bookOpen" /> {t('openWebApp')}</Link>
            {store(BRAND.links.appStore, 'apple', 'Download on the', 'App Store')}
            {store(BRAND.links.googlePlay, 'android', 'Get it on', 'Google Play')}
          </div>
        </div>
        <div className="hero-devices" aria-hidden="true">
          <div className="device laptop"><div className="screen"><MiniPage /></div><div className="base" /></div>
          <div className="device phone"><div className="screen"><MiniPage small /></div></div>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="h1 center">{ar ? `عن ${BRAND.nameAr}` : `About ${BRAND.nameEn}`}</h2>
        <p className="center muted section-lead">
          {ar
            ? 'مشروع رقمي وقفي يهدف إلى تقديم المصحف الشريف بطريقة تفاعلية موثوقة ودقيقة، بنصوص مجمع الملك فهد لطباعة المصحف الشريف، وتجربة قراءة واستماع وتفسير تعين على الفهم والتدبر.'
            : 'A non-profit digital project presenting the Holy Quran in an interactive, reliable and accurate way, using King Fahd Complex texts, with reading, listening and tafsir tools that help understanding and reflection.'}
        </p>
        <div className="stat-cards">
          {stats.map((s) => (
            <div key={s.label} className="card stat-card">
              <span className="sug-icon"><Icon name={s.icon} /></span>
              <strong className="h1">{s.value}</strong>
              <span className="muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="features">
        <h2 className="h1 center">{t('features')}</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="card feature">
              <span className="sug-icon"><Icon name={f.icon} /></span>
              <strong className="h3">{f.title}</strong>
              <p className="muted text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="versions">
        <h2 className="h1 center">{t('appVersions')}</h2>
        <div className="versions">
          <Version icon="apple" title={ar ? 'أجهزة آبل (آيفون وآيباد)' : 'Apple devices (iPhone & iPad)'} href={BRAND.links.appStore} />
          <Version icon="android" title={ar ? 'أجهزة أندرويد (الهواتف والأجهزة اللوحية)' : 'Android phones & tablets'} href={BRAND.links.googlePlay || BRAND.links.android} />
          <Version icon="monitor" title={ar ? 'ويندوز' : 'Windows'} href={BRAND.links.windows} />
          <Version icon="monitor" title={ar ? 'ماك ولينكس' : 'macOS & Linux'} href={BRAND.links.mac || BRAND.links.linux} />
          <Version icon="globe" title={ar ? 'الموقع الإلكتروني' : 'Website'} href="/" internal />
        </div>
      </section>

      <footer className="landing-footer">
        <Logo size={56} />
        <strong className="h3"><BrandName /></strong>
        <span className="muted">{ar ? BRAND.taglineAr : BRAND.taglineEn}</span>
        <p className="text-xs muted" style={{ maxWidth: 680 }}>
          {ar ? 'المصادر: نصوص وخطوط المصحف من مجمع الملك فهد لطباعة المصحف الشريف · التفاسير والترجمات من AlQuran Cloud · التلاوات من mp3quran.net و Islamic Network.'
            : 'Sources: Quran text & fonts by King Fahd Glorious Quran Printing Complex · Tafsir & translations via AlQuran Cloud · Recitations via mp3quran.net and Islamic Network.'}
        </p>
        {BRAND.contactEmail && <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>}
      </footer>
    </div>
  )
}

function Version({ icon, title, href, internal }: { icon: IconName; title: string; href: string; internal?: boolean }) {
  const { lang } = useT()
  const label = href ? (lang === 'ar' ? 'تحميل' : 'Download') : (lang === 'ar' ? 'قريبًا' : 'Coming soon')
  const body = (
    <>
      <span className="sug-icon"><Icon name={icon} /></span>
      <strong>{title}</strong>
      <span className={`text-sm ${href ? '' : 'muted'}`}>{internal ? (lang === 'ar' ? 'افتح الآن' : 'Open now') : label} ↓</span>
    </>
  )
  if (internal) return <Link to={href} className="card version">{body}</Link>
  return href ? <a href={href} className="card version" target="_blank" rel="noreferrer">{body}</a> : <div className="card version">{body}</div>
}

function MiniPage({ small }: { small?: boolean }) {
  return (
    <div className={`mini-page ${small ? 'small' : ''}`}>
      <div className="surah-header"><span className="quran">سُورَةُ ٱلْفَاتِحَةِ</span></div>
      <p className="quran">
        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ١ ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ ٢ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ٣ مَٰلِكِ يَوۡمِ ٱلدِّينِ ٤ إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ ٥
      </p>
    </div>
  )
}
