'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  FileCode2,
  FileText,
  FlaskConical,
  Gauge,
  Globe2,
  LayoutDashboard,
  Loader2,
  Monitor,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  XCircle,
} from 'lucide-react'
import { detectLanguage, languageNote, type AppLanguage, type LanguageDetection } from '@/lib/detect-language'
import { readFileSample } from '@/lib/read-source-text'
import { buildTestsFromSource, type TestCase } from '@/lib/test-cases'

const initialSource = 'https://ramazan.mateocela.com'
type LanguageMode = 'auto' | AppLanguage

function withDemoResults(test: TestCase, index: number, failedIndex = 3): TestCase {
  return { ...test, status: 'done', duration: `${(0.8 + index * 0.4).toFixed(1)}s`, result: index === failedIndex ? 'failed' : 'passed' }
}

async function detectUrl(url: string): Promise<{ language: AppLanguage; note: string } | null> {
  try {
    const response = await fetch('/api/detect-language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await response.json() as Partial<LanguageDetection>
    if (!response.ok || (data.language !== 'sq' && data.language !== 'en')) return null
    return { language: data.language, note: languageNote(data.language, 'page', data.signals?.[0]) }
  } catch {
    return null
  }
}

export default function Page() {
  const initialDetection = detectLanguage(initialSource, initialSource)
  const [source, setSource] = useState(initialSource)
  const [mode, setMode] = useState<'url' | 'apk'>('url')
  const [languageMode, setLanguageMode] = useState<LanguageMode>('auto')
  const [language, setLanguage] = useState<AppLanguage>(initialDetection.language)
  const [languageNoteText, setLanguageNoteText] = useState(languageNote(initialDetection.language, 'address', initialDetection.signals[0]))
  const [tests, setTests] = useState<TestCase[]>(() => buildTestsFromSource(initialSource, initialDetection.language).map((test, index) => withDemoResults(test, index)))
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'bugs'>('overview')
  const [phase, setPhase] = useState<'idle' | 'generating' | 'running' | 'complete'>('complete')
  const [selected, setSelected] = useState('TC-004')
  const [runStarted, setRunStarted] = useState(false)
  const [environment, setEnvironment] = useState('Production')
  const [notice, setNotice] = useState('')
  const [environmentCount, setEnvironmentCount] = useState(1)
  const [selectedFile, setSelectedFile] = useState('')
  const [apkFile, setApkFile] = useState<File | null>(null)
  const [detecting, setDetecting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sourceRef = useRef(source)
  const languageModeRef = useRef(languageMode)
  const requestSeq = useRef(0)
  sourceRef.current = source
  languageModeRef.current = languageMode

  const passed = tests.filter((test) => test.result === 'passed').length
  const failed = tests.filter((test) => test.result === 'failed').length
  const progress = phase === 'generating' ? 32 : phase === 'running' ? 68 : phase === 'complete' ? 100 : 0

  const selectedTest = tests.find((test) => test.id === selected) ?? tests[0]
  const caseLanguage = selectedTest?.language ?? language

  const runLabel = useMemo(() => {
    if (detecting) return caseLanguage === 'sq' ? 'Duke lexuar gjuhën…' : 'Reading language…'
    if (phase === 'generating') return caseLanguage === 'sq' ? 'Duke krijuar test case…' : 'Generating test cases…'
    if (phase === 'running') return caseLanguage === 'sq' ? 'Duke ekzekutuar suiten…' : 'Executing test suite…'
    if (phase === 'complete') return caseLanguage === 'sq' ? 'Ekzekuto përsëri' : 'Run again'
    return caseLanguage === 'sq' ? 'Krijo dhe ekzekuto testet' : 'Generate & run tests'
  }, [caseLanguage, detecting, phase])

  useEffect(() => {
    const seq = ++requestSeq.current
    let cancelled = false
    void (async () => {
      const detected = await detectUrl(initialSource)
      if (cancelled || requestSeq.current !== seq || languageModeRef.current !== 'auto' || sourceRef.current.trim() !== initialSource || !detected) return
      applyDetection(initialSource, detected, true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function applyDetection(value: string, detected: { language: AppLanguage; note: string }, demo = false) {
    const sourceTests = buildTestsFromSource(value, detected.language).map((test, index) => (demo ? withDemoResults(test, index) : test))
    setLanguage(detected.language)
    setLanguageNoteText(detected.note)
    setTests(sourceTests)
    setSelected((current) => (sourceTests.some((test) => test.id === current) ? current : sourceTests[0]?.id ?? ''))
    if (!demo) setPhase('idle')
  }

  async function resolveLanguage(value: string, file: File | null, preferred: LanguageMode = languageMode): Promise<{ language: AppLanguage; note: string }> {
    if (preferred !== 'auto') return { language: preferred, note: languageNote(preferred, 'manual') }
    if (mode === 'apk' && file) {
      const sample = await readFileSample(file)
      const detection = detectLanguage(sample, file.name, 'package')
      return { language: detection.language, note: languageNote(detection.language, 'apk', detection.signals[0]) }
    }
    if (mode === 'url') {
      const detected = await detectUrl(value)
      if (detected) return detected
    }
    const fallback = detectLanguage(value, value)
    return { language: fallback.language, note: languageNote(fallback.language, 'address', fallback.signals[0]) }
  }

  async function analyzeSource(file = apkFile, preferred: LanguageMode = languageMode) {
    if (detecting || phase === 'generating' || phase === 'running') return
    const value = mode === 'apk' ? file?.name || selectedFile : source.trim()
    if (!value) {
      setNotice(mode === 'apk' ? 'Zgjidh një APK përpara analizës.' : 'Vendos një URL përpara analizës.')
      if (mode === 'apk') fileInputRef.current?.click()
      return
    }
    const seq = ++requestSeq.current
    setDetecting(true)
    setNotice(mode === 'apk' ? 'Duke lexuar gjuhën e APK-së…' : 'Duke lexuar gjuhën e faqes…')
    const detected = await resolveLanguage(value, file, preferred)
    if (requestSeq.current !== seq) return
    const sourceTests = buildTestsFromSource(value, detected.language)
    applyDetection(value, detected)
    setActiveTab('tests')
    setDetecting(false)
    setNotice(detected.language === 'sq'
      ? `Burimi u analizua: ${value}. Gjuha e lexuar është shqip, prandaj u krijuan ${sourceTests.length} test case në shqip, secili me hapat e ekzekutimit.`
      : `Source analyzed: ${value}. Detected language is English, so ${sourceTests.length} test cases were written in English, each with execution steps.`)
  }

  function chooseLanguageMode(next: LanguageMode) {
    setLanguageMode(next)
    languageModeRef.current = next
    const value = mode === 'apk' ? apkFile?.name || selectedFile : source.trim()
    if (next === 'auto') {
      if (value) void analyzeSource(apkFile, 'auto')
      return
    }
    const note = languageNote(next, 'manual')
    if (!value) {
      setLanguage(next)
      setLanguageNoteText(note)
      return
    }
    applyDetection(value, { language: next, note })
    setNotice(next === 'sq'
      ? `Gjuha e test case-ve u caktua në shqip. U krijuan testet me hapat e ekzekutimit për ${value}.`
      : `Test case language set to English. Cases and execution steps were rewritten for ${value}.`)
  }

  async function generateAndRun() {
    if (phase === 'generating' || phase === 'running' || detecting) return
    const value = mode === 'apk' ? apkFile?.name || selectedFile : source.trim()
    if (!value) {
      setNotice(mode === 'apk' ? 'Zgjidh një APK përpara ekzekutimit.' : 'Vendos një URL përpara ekzekutimit.')
      return
    }

    const seq = ++requestSeq.current
    setDetecting(true)
    setNotice(languageMode === 'sq' || language === 'sq' ? `Duke lexuar gjuhën për ${value}…` : `Reading language for ${value}…`)
    const detected = await resolveLanguage(value, apkFile)
    if (requestSeq.current !== seq) return
    const sourceTests = buildTestsFromSource(value, detected.language)
    setLanguage(detected.language)
    setLanguageNoteText(detected.note)
    setDetecting(false)
    setNotice(detected.language === 'sq' ? `Ekzekutimi nisi për ${value}. Test case-t po shkruhen në shqip.` : `Run started for ${value}. Test cases are being written in English.`)
    setRunStarted(true)
    setPhase('generating')
    setActiveTab('overview')
    setSelected(sourceTests[0]?.id ?? 'TC-001')
    setTests(sourceTests)

    window.setTimeout(() => {
      setPhase('running')
      setTests(sourceTests.map((test, index) => ({ ...test, status: index < 2 ? 'done' : 'running' })))
    }, 900)

    window.setTimeout(() => {
      setPhase('complete')
      setTests(sourceTests.map((test, index) => withDemoResults(test, index, sourceTests.length - 2)))
      setNotice(detected.language === 'sq'
        ? `Ekzekutimi përfundoi për ${value}. U kryen ${sourceTests.length} test case në shqip, secili me hapat e vet.`
        : `Run completed for ${value}. ${sourceTests.length} English test cases were executed, each with its own steps.`)
    }, 2100)
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#101828]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[238px] shrink-0 border-r border-[#e6e8ec] bg-white px-4 py-5 lg:flex lg:flex-col">
          <div className="mb-9 flex items-center gap-2 px-2"><div className="grid size-8 place-items-center rounded-lg bg-[#1458e8] text-white"><FlaskConical size={17} /></div><span className="text-[15px] font-bold tracking-tight">Testpilot</span><span className="rounded bg-[#eef3ff] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#1458e8]">Beta</span></div>
          <nav className="space-y-1 text-sm">
            <SidebarItem icon={<LayoutDashboard size={17} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarItem icon={<FileText size={17} />} label="Test suites" badge="3" active={activeTab === 'tests'} onClick={() => setActiveTab('tests')} />
            <SidebarItem icon={<AlertTriangle size={17} />} label="Issues" badge="2" active={activeTab === 'bugs'} onClick={() => setActiveTab('bugs')} />
            <SidebarItem icon={<Gauge size={17} />} label="Performance" onClick={() => setNotice('Performance metrics are available after the next run.')} />
          </nav>
          <div className="mt-8 px-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#98a2b3]">Workspace</div>
          <nav className="mt-2 space-y-1 text-sm"><SidebarItem icon={<Monitor size={17} />} label="Environments" onClick={() => setNotice(`${environmentCount} environment${environmentCount === 1 ? '' : 's'} configured.`)} /><SidebarItem icon={<Settings2 size={17} />} label="Settings" onClick={() => setNotice('Settings panel is ready for configuration.')} /></nav>
          <div className="mt-auto rounded-xl border border-[#e6e8ec] bg-[#fafbfc] p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">Monthly usage</span><MoreHorizontal size={15} className="text-[#98a2b3]" /></div><div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[#e6e8ec]"><div className="h-full w-[38%] rounded-full bg-[#1458e8]" /></div><div className="flex justify-between text-[11px] text-[#667085]"><span>38 runs</span><span>100 runs</span></div></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[68px] items-center justify-between border-b border-[#e6e8ec] bg-white px-5 md:px-8"><div><div className="text-xs text-[#98a2b3]">Workspace / Projects /</div><div className="text-sm font-semibold">Northstar web app</div></div><div className="flex items-center gap-3"><button onClick={() => setEnvironment(environment === 'Production' ? 'Staging' : 'Production')} className="hidden items-center gap-2 rounded-lg border border-[#e6e8ec] bg-white px-3 py-2 text-xs font-medium text-[#475467] shadow-sm sm:flex"><CircleDot size={14} className="text-[#12b76a]" /> {environment} <ChevronRight size={13} /></button><div className="grid size-8 place-items-center rounded-full bg-[#dbe8ff] text-xs font-bold text-[#1458e8]">AS</div></div></header>
          <div className="mx-auto max-w-[1320px] px-5 py-7 md:px-8">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#667085]"><span className="size-2 rounded-full bg-[#12b76a]" /> Last run completed 4 min ago</div><h1 className="text-[28px] font-semibold tracking-[-.03em]">Test automation</h1><p className="mt-1 text-sm text-[#667085]">Generate, execute, and review tests in the language of the source.</p></div><button onClick={generateAndRun} disabled={detecting || phase === 'generating' || phase === 'running'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1458e8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_5px_rgba(20,88,232,.25)] transition hover:bg-[#1049c9] disabled:cursor-wait disabled:opacity-70"><Sparkles size={16} /> {runLabel}</button></div>

            <div className="mb-7 rounded-xl border border-[#dfe4eb] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,.03)]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold"><Upload size={16} className="text-[#1458e8]" /> Application source</div>
                <span className="rounded-full bg-[#eef3ff] px-2 py-1 text-[11px] font-semibold text-[#1458e8]">{languageNoteText}</span>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex rounded-lg bg-[#f2f4f7] p-1 text-xs font-semibold">
                  <button onClick={() => setMode('url')} className={`rounded-md px-3 py-2 ${mode === 'url' ? 'bg-white text-[#1458e8] shadow-sm' : 'text-[#667085]'}`}><Globe2 size={14} className="mr-1.5 inline" />URL</button>
                  <button onClick={() => setMode('apk')} className={`rounded-md px-3 py-2 ${mode === 'apk' ? 'bg-white text-[#1458e8] shadow-sm' : 'text-[#667085]'}`}><Smartphone size={14} className="mr-1.5 inline" />APK</button>
                </div>
                <div className="relative flex-1">
                  {mode === 'url' ? <><Search size={16} className="absolute left-3 top-3 text-[#98a2b3]" /><input value={source} onChange={(event) => setSource(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void analyzeSource() }} className="h-10 w-full rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-3 text-sm outline-none ring-[#1458e8] placeholder:text-[#98a2b3] focus:ring-2" placeholder="https://your-app.com" /></> : <><input ref={fileInputRef} type="file" accept=".apk,application/vnd.android.package-archive" className="sr-only" onChange={(event) => { const file = event.target.files?.[0] ?? null; setApkFile(file); setSelectedFile(file?.name ?? ''); if (file) void analyzeSource(file) }} /><button type="button" onClick={() => fileInputRef.current?.click()} className="h-10 w-full rounded-lg border border-dashed border-[#b8c7e6] bg-[#f7faff] px-3 text-left text-sm text-[#667085] hover:border-[#1458e8]">{selectedFile || 'Select an Android APK file'}</button></>}
                </div>
                <button onClick={() => void analyzeSource()} disabled={detecting} className="h-10 rounded-lg border border-[#d0d5dd] px-4 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb] disabled:opacity-60">{detecting ? 'Duke lexuar…' : 'Analyze source'}</button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#667085]">Gjuha e test case-ve</span>
                <div className="flex rounded-lg bg-[#f2f4f7] p-1 text-xs font-semibold">
                  {([['auto', 'Auto'], ['sq', 'Shqip'], ['en', 'English']] as const).map(([value, label]) => <button key={value} onClick={() => chooseLanguageMode(value)} className={`rounded-md px-3 py-1.5 ${languageMode === value ? 'bg-white text-[#1458e8] shadow-sm' : 'text-[#667085]'}`}>{label}</button>)}
                </div>
                <span className="text-xs text-[#98a2b3]">Auto lexon faqen ose APK-në. Nëse gjuha është shqip, testet dhe hapat shkruhen në shqip.</span>
              </div>
            </div>

            {notice && <button onClick={() => setNotice('')} className="mb-5 flex w-full items-center justify-between rounded-lg border border-[#dbe8ff] bg-[#f7faff] px-3 py-2 text-left text-xs text-[#1458e8]">{notice}<XCircle size={14} /></button>}

            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4"><Metric label="Test cases" value={tests.length.toString()} icon={<FileCode2 size={16} />} tone="blue" /><Metric label="Passed" value={passed.toString()} icon={<Check size={16} />} tone="green" /><Metric label="Failed" value={failed.toString()} icon={<XCircle size={16} />} tone="red" /><Metric label="Coverage" value="87%" icon={<ShieldCheck size={16} />} tone="purple" /></div>

            <div className="mb-5 flex items-center gap-1 border-b border-[#e6e8ec]"><TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Run overview</TabButton><TabButton active={activeTab === 'tests'} onClick={() => setActiveTab('tests')}>Test cases <span className="ml-1 rounded-full bg-[#f2f4f7] px-1.5 py-0.5 text-[10px]">{tests.length}</span></TabButton><TabButton active={activeTab === 'bugs'} onClick={() => setActiveTab('bugs')}>Bugs <span className="ml-1 rounded-full bg-[#fef3f2] px-1.5 py-0.5 text-[10px] text-[#b42318]">2</span></TabButton></div>

            {activeTab === 'overview' && <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><div className="rounded-xl border border-[#e6e8ec] bg-white p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Execution progress</h2><p className="mt-1 text-xs text-[#667085]">{phase === 'complete' ? 'All test cases have been executed.' : 'The test runner is working through your generated suite.'}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${phase === 'complete' ? 'bg-[#ecfdf3] text-[#027a48]' : 'bg-[#eff8ff] text-[#175cd3]'}`}>{phase === 'complete' ? 'Completed' : phase === 'idle' ? 'Not started' : 'In progress'}</span></div><div className="mb-6 flex items-center gap-4"><div className="relative size-[118px] shrink-0 rounded-full" style={{ background: `conic-gradient(#1458e8 ${progress * 3.6}deg, #eef2f6 0)` }}><div className="absolute inset-[9px] grid place-items-center rounded-full bg-white"><div className="text-center"><div className="text-2xl font-bold">{progress}%</div><div className="text-[10px] text-[#98a2b3]">complete</div></div></div></div><div className="grid flex-1 grid-cols-3 gap-2 text-center"><MiniStat value={passed} label="Passed" color="text-[#12b76a]" /><MiniStat value={failed} label="Failed" color="text-[#f04438]" /><MiniStat value="00:07" label="Duration" color="text-[#344054]" /></div></div><div className="space-y-3 border-t border-[#f2f4f7] pt-4"><RunStep icon={<Sparkles size={15} />} title="Test cases generated" detail={`${tests.length} scenarios · ${language === 'sq' ? 'shqip, me hapa' : 'English, with steps'}`} done={phase !== 'idle'} /><RunStep icon={<Play size={15} />} title="Browser execution" detail="Chromium · 1280 × 720" done={phase === 'complete'} active={phase === 'running'} /><RunStep icon={<FileText size={15} />} title="Report compiled" detail="Bugs, screenshots, and logs" done={phase === 'complete'} /></div></div><div className="rounded-xl border border-[#e6e8ec] bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Detected issues</h2><button onClick={() => setActiveTab('bugs')} className="text-xs font-semibold text-[#1458e8]">View all <ArrowUpRight size={13} className="ml-1 inline" /></button></div><Issue severity="High" title="Invitation request returns 500" meta="TC-004 · Members" /><Issue severity="Medium" title="Error state missing accessible label" meta="TC-005 · Navigation" /><div className="mt-5 rounded-lg bg-[#f8f9fc] p-3 text-xs leading-5 text-[#667085]">The report compares expected behavior with observed output and attaches execution evidence for every failed step.</div></div></div>}

            {activeTab !== 'overview' && <div className="overflow-hidden rounded-xl border border-[#e6e8ec] bg-white"><div className="flex items-center justify-between border-b border-[#e6e8ec] p-5"><div><h2 className="font-semibold">{activeTab === 'tests' ? 'Generated test cases' : 'Bug report'}</h2><p className="mt-1 text-xs text-[#667085]">{activeTab === 'tests' ? (language === 'sq' ? 'Raste testimi në shqip. Zgjidh njërin për të parë hapat e ekzekutimit.' : 'Test cases in the detected language. Select one to read its execution steps.') : 'Issues found during the latest execution run.'}</p></div><button onClick={() => setNotice('Report export queued successfully.')} className="rounded-lg border border-[#d0d5dd] px-3 py-2 text-xs font-semibold hover:bg-[#f9fafb]">Export report</button></div>{activeTab === 'tests' ? <div className="grid xl:grid-cols-[1.15fr_.85fr]"><div className="divide-y divide-[#f2f4f7] border-b border-[#f2f4f7] xl:border-b-0 xl:border-r">{tests.map((test) => <button key={test.id} onClick={() => setSelected(test.id)} className={`flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#fafbfc] ${selected === test.id ? 'bg-[#f7faff]' : ''}`}><div className="w-16 shrink-0 font-mono text-xs text-[#667085]">{test.id}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{test.title}</div><div className="mt-1 text-xs text-[#98a2b3]">{test.area} · {test.type} · {test.steps.length} {test.language === 'sq' ? 'hapa' : 'steps'}</div></div><div className="hidden text-xs text-[#667085] sm:block"><Clock3 size={13} className="mr-1 inline" />{test.duration}</div><StatusBadge test={test} /><ChevronRight size={15} className="text-[#98a2b3]" /></button>)}</div>{selectedTest && <StepsPanel test={selectedTest} />}</div> : <div className="divide-y divide-[#f2f4f7]"><IssueRow severity="High" title="Invitation request returns 500" description="POST /api/invitations responds with an internal server error when a valid email is submitted." test="TC-004" /><IssueRow severity="Medium" title="Error state missing accessible label" description="The navigation error state has no aria-label or visible recovery instruction." test="TC-005" /></div>}</div>}
            <div className="mt-6 flex items-center justify-between text-xs text-[#98a2b3]"><span>Testpilot engine v1.8 · Chromium runner</span><button onClick={() => { setEnvironmentCount((count) => count + 1); setNotice('New environment added.'); }} className="flex items-center gap-1 font-medium text-[#667085] hover:text-[#1458e8]"><Plus size={14} /> Add environment</button></div>
          </div>
        </section>
      </div>
    </main>
  )
}

function StepsPanel({ test }: { test: TestCase }) {
  const albanian = test.language === 'sq'
  return (
    <div className="p-5">
      <div className="font-mono text-[11px] text-[#98a2b3]">{test.id} · {albanian ? 'Shqip' : 'English'}</div>
      <h3 className="mt-1 text-sm font-semibold leading-5">{test.title}</h3>
      <div className="mt-1 text-xs text-[#98a2b3]">{test.area} · {test.type}</div>
      <div className="mt-4 text-xs font-semibold">{albanian ? 'Hapat e ekzekutimit' : 'Execution steps'}</div>
      <ol className="mt-2 space-y-2">
        {test.steps.map((step, index) => <li key={step} className="flex gap-2 text-xs leading-5 text-[#344054]"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#eef3ff] text-[10px] font-bold text-[#1458e8]">{index + 1}</span><span>{step}</span></li>)}
      </ol>
      <div className="mt-4 rounded-lg bg-[#f8f9fc] p-3">
        <div className="text-[11px] font-semibold text-[#667085]">{albanian ? 'Rezultati i pritur' : 'Expected result'}</div>
        <p className="mt-1 text-xs leading-5 text-[#344054]">{test.expected}</p>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, badge, onClick }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string; onClick?: () => void }) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium ${active ? 'bg-[#eef3ff] text-[#1458e8]' : 'text-[#667085] hover:bg-[#f8f9fc]'}`}>{icon}<span className="flex-1">{label}</span>{badge && <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-[#667085] shadow-sm">{badge}</span>}</button> }
function Metric({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) { return <div className="rounded-xl border border-[#e6e8ec] bg-white p-4"><div className={`mb-3 grid size-8 place-items-center rounded-lg bg-${tone === 'blue' ? '[#eef3ff]' : tone === 'green' ? '[#ecfdf3]' : tone === 'red' ? '[#fef3f2]' : '[#f4f3ff]'} ${tone === 'blue' ? 'text-[#1458e8]' : tone === 'green' ? 'text-[#12b76a]' : tone === 'red' ? 'text-[#f04438]' : 'text-[#7a5af8]'}`}>{icon}</div><div className="text-2xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-xs text-[#667085]">{label}</div></div> }
function MiniStat({ value, label, color }: { value: string | number; label: string; color: string }) { return <div><div className={`text-xl font-semibold ${color}`}>{value}</div><div className="mt-1 text-[10px] text-[#98a2b3]">{label}</div></div> }
function RunStep({ icon, title, detail, done, active }: { icon: React.ReactNode; title: string; detail: string; done?: boolean; active?: boolean }) { return <div className="flex items-center gap-3"><div className={`grid size-8 place-items-center rounded-full ${done ? 'bg-[#ecfdf3] text-[#12b76a]' : active ? 'bg-[#eef3ff] text-[#1458e8]' : 'bg-[#f2f4f7] text-[#98a2b3]'}`}>{done ? <Check size={15} /> : active ? <Loader2 size={15} className="animate-spin" /> : icon}</div><div className="flex-1"><div className="text-xs font-semibold">{title}</div><div className="mt-0.5 text-[11px] text-[#98a2b3]">{detail}</div></div>{done && <span className="text-[11px] font-semibold text-[#12b76a]">Done</span>}</div> }
function Issue({ severity, title, meta }: { severity: string; title: string; meta: string }) { return <div className="mb-3 rounded-lg border border-[#f2f4f7] p-3"><div className="flex items-start gap-3"><div className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${severity === 'High' ? 'bg-[#fef3f2] text-[#b42318]' : 'bg-[#fffaeb] text-[#b54708]'}`}>{severity}</div><div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs text-[#98a2b3]">{meta}</div></div></div></div> }
function IssueRow({ severity, title, description, test }: { severity: string; title: string; description: string; test: string }) { return <div className="flex gap-4 p-5"><div className={`mt-0.5 rounded px-2 py-1 text-[10px] font-bold ${severity === 'High' ? 'bg-[#fef3f2] text-[#b42318]' : 'bg-[#fffaeb] text-[#b54708]'}`}>{severity}</div><div><div className="text-sm font-semibold">{title}</div><p className="mt-1 max-w-2xl text-xs leading-5 text-[#667085]">{description}</p><div className="mt-2 font-mono text-[10px] text-[#98a2b3]">Found in {test}</div></div></div> }
function StatusBadge({ test }: { test: TestCase }) { const label = test.status === 'running' ? 'Running' : test.status === 'ready' ? 'Ready' : test.result === 'failed' ? 'Failed' : 'Passed'; return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${label === 'Passed' ? 'bg-[#ecfdf3] text-[#027a48]' : label === 'Failed' ? 'bg-[#fef3f2] text-[#b42318]' : label === 'Running' ? 'bg-[#eff8ff] text-[#175cd3]' : 'bg-[#f2f4f7] text-[#667085]'}`}>{label}</span> }
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={`border-b-2 px-4 py-3 text-xs font-semibold ${active ? 'border-[#1458e8] text-[#1458e8]' : 'border-transparent text-[#667085] hover:text-[#344054]'}`}>{children}</button> }

export const dynamic = 'force-dynamic'

// Keep the prototype deterministic in preview while leaving the runner surface ready for a real execution API.
// The source URL/APK input and report model are intentionally separated from the view so a backend runner can replace the simulation.
