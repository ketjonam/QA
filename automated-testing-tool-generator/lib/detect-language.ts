export type AppLanguage = 'sq' | 'en'
export type LanguageProfile = 'page' | 'package'

export type LanguageDetection = {
  language: AppLanguage
  confidence: number
  signals: string[]
}

const SQ_WORDS: Record<string, number> = {
  shqip: 4,
  shqipëri: 4,
  shqiperi: 3,
  kosovë: 3,
  kosove: 2,
  kosova: 2,
  është: 2,
  eshte: 2,
  janë: 2,
  për: 2,
  që: 2,
  një: 2,
  çdo: 2,
  dhe: 1,
  nuk: 1,
  ballina: 3,
  hyrje: 2,
  hyr: 2,
  kërko: 2,
  kerko: 2,
  namaz: 3,
  namazi: 3,
  ramazan: 3,
  sabahu: 3,
  ikindia: 3,
  akshami: 3,
  jacia: 3,
  faleminderit: 4,
  aplikacioni: 3,
  aplikacion: 2,
  përmbajtja: 3,
  permbajtja: 2,
  qyteti: 2,
  shteti: 2,
  orari: 2,
  mirësevini: 4,
  miresevini: 3,
  juaj: 2,
  lutem: 2,
  vazhdo: 2,
  anulo: 2,
  ruaj: 2,
  fshij: 2,
  regjistrohu: 3,
  fjalekalimi: 4,
  fjalëkalimi: 4,
  ndihmë: 2,
  ndihme: 2,
  cilësimet: 3,
  cilesimet: 3,
  rifresko: 2,
  përditëso: 2,
  perditeso: 2,
  kontakte: 2,
  lajme: 2,
  zgjidh: 2,
  tirana: 2,
  tiranë: 2,
  prishtinë: 2,
  prishtine: 2,
}

const EN_WORDS: Record<string, number> = {
  the: 1,
  and: 1,
  with: 1,
  this: 1,
  that: 1,
  from: 1,
  your: 1,
  page: 1,
  login: 2,
  welcome: 2,
  loading: 1,
  button: 1,
  menu: 1,
  footer: 2,
  header: 2,
  search: 1,
  settings: 2,
  please: 2,
  password: 2,
  email: 1,
  home: 1,
  about: 1,
  contact: 1,
  example: 1,
}

const GENERIC_EN = new Set(['the', 'and', 'with', 'this', 'that', 'from', 'your', 'home', 'page'])

function scoreWords(tokens: string[], weights: Record<string, number>, skip?: Set<string>) {
  const counts: Record<string, number> = {}
  let score = 0
  const matched: string[] = []
  for (const token of tokens) {
    if (skip?.has(token)) continue
    const weight = weights[token]
    if (!weight) continue
    const seen = counts[token] ?? 0
    if (seen >= 8) continue
    counts[token] = seen + 1
    score += weight
    if (seen === 0) matched.push(token)
  }
  return { score, matched }
}

function hintScore(value: string) {
  const lower = value.toLowerCase()
  let score = 0
  const signals: string[] = []
  if (/(^|[./_\-\s])(shqip|shqiperi|kosov|tiran|prishtin|namaz|ramazan)([./_\-\s]|$)/.test(lower) || lower.includes('mateocela')) {
    score += 6
    signals.push('adresa ose emri duket shqip')
  }
  if (/(^|[./_\-])sq([./_\-]|$)/.test(lower)) {
    score += 6
    signals.push('kodi sq')
  }
  return { score, signals }
}

export function detectLanguage(text: string, sourceHint = '', profile: LanguageProfile = 'page'): LanguageDetection {
  const specials = text.match(/[ëçËÇ]/g)?.length ?? 0
  const tokens = text.toLowerCase().match(/[a-zëç]+/g) ?? []
  const albanian = scoreWords(tokens, SQ_WORDS)
  const english = scoreWords(tokens, EN_WORDS, profile === 'package' ? GENERIC_EN : undefined)
  const hint = hintScore(sourceHint)
  const hasAlbanianResources = /values-sq|values-b\+sq|strings-sq|\/sq\/strings/i.test(text)

  let sqScore = albanian.score + Math.min(specials * 2, 16) + hint.score + (hasAlbanianResources ? 20 : 0)
  let enScore = english.score
  const signals = [...albanian.matched.slice(0, 6).map((word) => `shqip: ${word}`), ...hint.signals]

  if (specials > 0) signals.push(`ë/ç ×${specials}`)
  if (hasAlbanianResources) signals.push('resources values-sq')

  if (profile === 'package') {
    const language: AppLanguage = sqScore >= 4 || specials >= 2 || hasAlbanianResources ? 'sq' : 'en'
    return {
      language,
      confidence: language === 'sq' ? Math.min(0.95, 0.55 + sqScore / 40) : enScore > 0 ? 0.6 : 0.45,
      signals: signals.length ? signals : ['nuk u gjet tekst shqip në APK'],
    }
  }

  const langAttr = text.match(/<html[^>]*\blang=["']([a-zA-Z-]+)["']/i)?.[1]?.toLowerCase()
  if (langAttr?.startsWith('sq')) {
    sqScore += 30
    signals.push(`lang=${langAttr}`)
  } else if (langAttr?.startsWith('en')) {
    enScore += 30
    signals.push(`lang=${langAttr}`)
  }

  let language: AppLanguage = 'en'
  if (sqScore >= 8 && sqScore >= enScore) language = 'sq'
  else if (enScore > sqScore && enScore >= 4) language = 'en'
  else if (sqScore > enScore && sqScore >= 6) language = 'sq'
  else language = enScore >= sqScore ? 'en' : 'sq'

  const winner = Math.max(sqScore, enScore)
  const total = sqScore + enScore
  return {
    language,
    confidence: total === 0 ? 0.4 : Math.min(0.98, winner / total),
    signals: signals.length ? signals : ['pa sinjale të forta gjuhësore'],
  }
}

export function detectLanguageFromHtml(html: string, sourceHint = ''): LanguageDetection {
  const withoutAssets = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
  const langTag = withoutAssets.match(/<html[^>]*\blang=["']([a-zA-Z-]+)["']/i)?.[0] ?? ''
  const visible = withoutAssets.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')
  return detectLanguage(`${langTag}\n${visible}`, sourceHint, 'page')
}

export function languageNote(language: AppLanguage, origin: 'page' | 'apk' | 'address' | 'manual', signal?: string) {
  const useful = signal && !signal.startsWith('pa sinjale') && !signal.startsWith('nuk u gjet') ? signal : ''
  const detail = useful ? ` · ${useful}` : ''
  if (language === 'sq') {
    if (origin === 'page') return `Shqip · lexuar nga faqja${detail}`
    if (origin === 'apk') return `Shqip · lexuar nga APK${detail}`
    if (origin === 'manual') return 'Shqip · zgjedhur manualisht'
    return `Shqip · nga adresa${detail}`
  }
  if (origin === 'page') return `English · read from the page${detail}`
  if (origin === 'apk') return `English · read from the APK${detail}`
  if (origin === 'manual') return 'English · selected manually'
  return `English · from the address${detail}`
}
