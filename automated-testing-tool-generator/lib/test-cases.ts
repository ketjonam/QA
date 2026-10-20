import type { AppLanguage } from '@/lib/detect-language'

export type Status = 'ready' | 'running' | 'done'

export type TestCase = {
  id: string
  title: string
  area: string
  type: string
  duration: string
  status: Status
  result?: 'passed' | 'failed'
  language: AppLanguage
  steps: string[]
  expected: string
}

type Scenario = {
  title: string
  area: string
  type: string
  steps: string[]
  expected: string
}

const albanian: Scenario[] = [
  {
    title: 'Ngarko {source} me sukses',
    area: 'Ngarkimi i aplikacionit',
    type: 'Smoke',
    steps: [
      'Hap shfletuesin dhe shko te adresa ose aplikacioni i vendosur.',
      'Prit derisa ngarkimi të përfundojë dhe të zhduket çdo tregues pritjeje.',
      'Kontrollo që përgjigjja e hapjes është e suksesshme dhe nuk shfaqet faqe 404 ose 500.',
      'Verifiko që pamja kryesore është e dukshme, e lexueshme dhe nuk mbetet bosh.',
    ],
    expected: 'Aplikacioni hapet plotësisht dhe përdoruesi sheh pamjen kryesore.',
  },
  {
    title: 'Verifiko që faqja ngarkohet pa gabime në console, rrjete ose burime të prishura',
    area: 'Ngarkimi i aplikacionit',
    type: 'Functional',
    steps: [
      'Hap mjetet e zhvilluesit dhe pastro console-in dhe listën e rrjetit.',
      'Rifresko faqen dhe prit ngarkimin e plotë të dokumentit.',
      'Kontrollo që console-i nuk ka gabime të kuqe.',
      'Kontrollo që kërkesat për HTML, stil, skripte dhe imazhe nuk kthejnë 4xx ose 5xx.',
      'Verifiko që nuk ka ikona, imazhe ose skripte të prishura në faqe.',
    ],
    expected: 'Faqja ngarkohet pa gabime në console dhe pa burime të dështuara.',
  },
  {
    title: 'Verifiko që titulli, favicon dhe metadata e faqes janë të sakta',
    area: 'Ngarkimi i aplikacionit',
    type: 'SEO',
    steps: [
      'Hap faqen dhe lexo titullin në skedën e shfletuesit.',
      'Krahaso titullin me emrin e pritur të aplikacionit.',
      'Kontrollo që favicon-i shfaqet dhe nuk është ikona e paracaktuar e shfletuesit.',
      'Lexo përshkrimin meta dhe atributin e gjuhës në dokument.',
      'Verifiko që gjuha e metadata-s përputhet me gjuhën e tekstit të dukshëm.',
    ],
    expected: 'Titulli, favicon-i dhe metadata përshkruajnë saktë faqen dhe gjuhën e saj.',
  },
  {
    title: 'Verifiko që ngjyrat e faqes përputhen me dizajnin dhe kanë kontrast të mjaftueshëm',
    area: 'Ngjyrat',
    type: 'Visual',
    steps: [
      'Hap faqen në pamjen e paracaktuar.',
      'Krahaso ngjyrat e sfondit, tekstit, lidhjeve dhe butonave me dizajnin e pritur.',
      'Kontrollo që tekstet kryesore lexohen qartë mbi sfondin e tyre.',
      'Kaloni mbi butonat, lidhjet dhe fushat dhe verifiko gjendjet hover dhe focus.',
      'Nëse ka temë të çelët ose të errët, ndërroje dhe përsërit kontrollin e kontrastit.',
    ],
    expected: 'Ngjyrat përputhen me dizajnin dhe përmbajtja mbetet e lexueshme.',
  },
  {
    title: 'Verifiko që tekstet dhe kontrollet lexohen në çdo temë dhe gjendje',
    area: 'Ngjyrat',
    type: 'Accessibility',
    steps: [
      'Lexo titujt, etiketat dhe butonat në madhësinë e paracaktuar të tekstit.',
      'Rrit zoom-in e shfletuesit në 200% dhe verifiko që tekstet nuk priten ose mbivendosen.',
      'Lëviz me tastierën dhe verifiko që fokusi është i dukshëm te çdo kontroll.',
      'Kontrollo që çdo fushë ka etiketë të lexueshme në gjuhën e faqes.',
      'Ndrysho temën, nëse ekziston, dhe përsërit leximin e teksteve dhe kontrolleve.',
    ],
    expected: 'Tekstet dhe kontrollet lexohen qartë në çdo madhësi, temë dhe gjendje.',
  },
  {
    title: 'Verifiko që header-i shfaqet saktë dhe logoja të çon në faqen kryesore',
    area: 'Header & footer',
    type: 'Functional',
    steps: [
      'Hap faqen dhe verifiko që header-i është i dukshëm në krye.',
      'Kontrollo që logoja dhe emri i aplikacionit shfaqen të plotë, pa prerje.',
      'Hap një faqe të brendshme, nëse ekziston, pastaj kliko logon.',
      'Verifiko që klikimi kthen te faqja kryesore dhe nuk hap faqe bosh.',
    ],
    expected: 'Header-i është i dukshëm dhe logoja navigon te faqja kryesore.',
  },
  {
    title: 'Verifiko që çdo link, buton dhe menu e header-it mund të klikohet dhe navigon saktë',
    area: 'Header & footer',
    type: 'Navigation',
    steps: [
      'Listo çdo lidhje, buton dhe artikull menuje në header.',
      'Kliko secilin një nga një dhe prit ngarkimin e destinacionit.',
      'Verifiko që secili hap faqen e duhur dhe nuk përfundon në faqe bosh ose gabim.',
      'Në pamjen mobile, hap menynë, kontrollo të njëjtat zgjedhje dhe mbylle pas klikimit.',
      'Verifiko që etiketat janë në gjuhën e faqes dhe nuk janë bosh.',
    ],
    expected: 'Çdo element i header-it klikohet dhe navigon te destinacioni i saktë.',
  },
  {
    title: 'Verifiko që footer-i shfaqet në fund të faqes me linke, kontakte dhe copyright pa typo',
    area: 'Header & footer',
    type: 'Content',
    steps: [
      'Zbrit në fund të faqes.',
      'Verifiko që footer-i shfaqet pas përmbajtjes dhe nuk e mbulon atë.',
      'Kontrollo lidhjet, të dhënat e kontaktit dhe tekstin e së drejtës së autorit.',
      'Lexo çdo tekst për gabime shkrimi dhe për fjalë në një gjuhë tjetër nga gjuha e faqes.',
    ],
    expected: 'Footer-i është i plotë, i lexueshëm dhe pa gabime gjuhësore.',
  },
  {
    title: 'Verifiko që çdo link i footer-it hap destinacionin e saktë pa faqe bosh',
    area: 'Header & footer',
    type: 'Navigation',
    steps: [
      'Mblidh të gjitha lidhjet e dukshme të footer-it.',
      'Kliko secilën lidhje dhe prit hapjen e destinacionit.',
      'Verifiko që destinacioni nuk është faqe bosh, 404 ose gabim serveri.',
      'Për lidhjet e jashtme, verifiko që hapet adresa e saktë.',
      'Kthehu te faqja dhe vazhdo me lidhjen tjetër derisa të mbarojë lista.',
    ],
    expected: 'Çdo lidhje e footer-it hap destinacionin e saktë.',
  },
  {
    title: 'Verifiko që tekstet e faqes nuk kanë typo, përkthime të përziera ose etiketa që mungojnë',
    area: 'Përmbajtja',
    type: 'Content',
    steps: [
      'Lexo titujt, paragrafët, butonat dhe mesazhet e dukshme.',
      'Shëno çdo gabim shkrimi, etiketë bosh ose tekst të papërkthyer.',
      'Kontrollo që gjuha e ndërfaqes mbetet shqip, përveç emrave të markës.',
      'Nëse shfaqet një gjendje boshe ose një mesazh gabimi, verifiko që edhe ai është në shqip.',
    ],
    expected: 'Teksti i dukshëm është i saktë dhe në gjuhën e aplikacionit.',
  },
  {
    title: 'Verifiko që oraret e namazit shfaqen për sabahun, lindjen, drekën, ikindinë, akshamin dhe jacinë',
    area: 'Oraret e namazit',
    type: 'Functional',
    steps: [
      'Hap pamjen kryesore të orareve.',
      'Gjej listën ose kartat e namazeve.',
      'Verifiko që shfaqen sabahu, lindja e diellit, dreka, ikindia, akshami dhe jacia.',
      'Kontrollo që secili emër është në shqip dhe ka një orë përkatëse, jo vlerë bosh.',
    ],
    expected: 'Të gjashtë kohët e namazit shfaqen me emër dhe orë.',
  },
  {
    title: 'Verifiko që oraret e namazit kanë formatin e saktë të orës dhe renditjen e pritshme',
    area: 'Oraret e namazit',
    type: 'Functional',
    steps: [
      'Lexo orën e secilit namaz.',
      'Verifiko që të gjitha orët përdorin të njëjtin format, për shembull 05:12.',
      'Kontrollo që renditja është sabah, lindje, drekë, ikindi, aksham, jaci.',
      'Verifiko që orët ecin sipas ditës dhe nuk përsëriten ose mungojnë pa arsye.',
    ],
    expected: 'Oraret kanë format të qëndrueshëm dhe renditjen e pritshme.',
  },
  {
    title: 'Verifiko që oraret përditësohen kur ndryshon data, shteti ose qyteti',
    area: 'Oraret e namazit',
    type: 'Functional',
    steps: [
      'Shëno oraret e ditës dhe vendit të zgjedhur fillimisht.',
      'Ndrysho datën, nëse kontrolli ekziston, dhe krahaso oraret e reja me të parat.',
      'Zgjidh një shtet tjetër dhe pastaj një qytet tjetër.',
      'Verifiko që oraret dhe emri i vendit të zgjedhur përditësohen.',
      'Kthehu te zgjedhja e parë dhe verifiko që oraret e mëparshme kthehen.',
    ],
    expected: 'Oraret përditësohen sipas datës, shtetit dhe qytetit.',
  },
  {
    title: 'Verifiko që karta e namazit aktiv dhe numërimi mbrapsht pasqyrojnë orarin aktual',
    area: 'Oraret e namazit',
    type: 'Functional',
    steps: [
      'Shiko orën aktuale të pajisjes.',
      'Gjej kartën ose rreshtin e namazit aktiv.',
      'Verifiko që namazi aktiv është koha e radhës sipas orës aktuale.',
      'Lexo numërimin mbrapsht dhe prit të paktën disa sekonda.',
      'Verifiko që numërimi zvogëlohet dhe përputhet me kohën e mbetur deri te namazi tjetër.',
    ],
    expected: 'Karta aktive dhe numërimi mbrapsht pasqyrojnë orarin aktual.',
  },
  {
    title: 'Verifiko që të gjitha shtetet shfaqen dhe mund të zgjidhen në dropdown',
    area: 'Dropdown-i i shteteve',
    type: 'Functional',
    steps: [
      'Hap listën e shteteve.',
      'Kontrollo që emrat shfaqen të plotë, të lexueshëm dhe pa përsëritje boshe.',
      'Kërko Shqipërinë dhe Kosovën kur burimi u shërben atyre, dhe të paktën disa shtete të tjera.',
      'Zgjidh një shtet dhe verifiko që mbetet i zgjedhur pasi lista mbyllet.',
    ],
    expected: 'Shtetet shfaqen në listë dhe secili mund të zgjidhet.',
  },
  {
    title: 'Verifiko që dropdown-i hapet, mbyllet, kërkon dhe ruan shtetin e zgjedhur',
    area: 'Dropdown-i i shteteve',
    type: 'Interaction',
    steps: [
      'Kliko dropdown-in dhe verifiko që lista hapet.',
      'Kliko jashtë listës ose shtyp Esc dhe verifiko që lista mbyllet.',
      'Hape përsëri dhe shkruaj një pjesë të emrit të një shteti.',
      'Verifiko që lista filtrohet sipas tekstit të shkruar.',
      'Zgjidh një rezultat dhe, nëse zgjedhja duhet të ruhet, rifresko faqen.',
      'Verifiko që shteti i zgjedhur mbetet i dukshëm.',
    ],
    expected: 'Dropdown-i hapet, mbyllet, kërkon dhe ruan shtetin e zgjedhur.',
  },
]

const english: Scenario[] = [
  {
    title: 'Load {source} successfully',
    area: 'Website loading',
    type: 'Smoke',
    steps: [
      'Open the browser and go to the submitted address or application.',
      'Wait until loading finishes and any waiting indicator disappears.',
      'Check that the open response succeeds and no 404 or 500 page is shown.',
      'Verify that the main view is visible, readable, and not left blank.',
    ],
    expected: 'The application opens fully and the user sees the main view.',
  },
  {
    title: 'Verify the page loads without console errors, network failures, or broken resources',
    area: 'Website loading',
    type: 'Functional',
    steps: [
      'Open developer tools and clear the console and network list.',
      'Reload the page and wait for the document to finish loading.',
      'Check that the console has no red errors.',
      'Check that HTML, style, script, and image requests do not return 4xx or 5xx.',
      'Verify that the page has no broken icons, images, or scripts.',
    ],
    expected: 'The page loads without console errors or failed resources.',
  },
  {
    title: 'Verify title, favicon, and page metadata are correct',
    area: 'Website loading',
    type: 'SEO',
    steps: [
      'Open the page and read the title on the browser tab.',
      'Compare the title with the expected application name.',
      'Check that the favicon is shown and is not the browser default icon.',
      'Read the meta description and the document language attribute.',
      'Verify that the metadata language matches the visible page language.',
    ],
    expected: 'The title, favicon, and metadata describe the page and its language.',
  },
  {
    title: 'Verify colors match the expected design and provide sufficient contrast',
    area: 'Colors',
    type: 'Visual',
    steps: [
      'Open the page in the default view.',
      'Compare background, text, link, and button colors with the expected design.',
      'Check that primary text is clearly readable against its background.',
      'Hover and focus buttons, links, and fields and verify those states.',
      'If a light or dark theme exists, switch it and repeat the contrast check.',
    ],
    expected: 'Colors match the design and the content stays readable.',
  },
  {
    title: 'Verify text and controls remain readable in every theme and state',
    area: 'Colors',
    type: 'Accessibility',
    steps: [
      'Read headings, labels, and buttons at the default text size.',
      'Increase browser zoom to 200% and verify that text is not clipped or overlapping.',
      'Move with the keyboard and verify that focus is visible on every control.',
      'Check that every field has a readable label in the page language.',
      'Change the theme, if one exists, and read the text and controls again.',
    ],
    expected: 'Text and controls stay readable at every size, theme, and state.',
  },
  {
    title: 'Verify the header is visible and the logo navigates to the homepage',
    area: 'Header & footer',
    type: 'Functional',
    steps: [
      'Open the page and verify that the header is visible at the top.',
      'Check that the logo and application name are complete and not clipped.',
      'Open an inner page if one exists, then click the logo.',
      'Verify that the click returns to the homepage and does not open a blank page.',
    ],
    expected: 'The header is visible and the logo navigates to the homepage.',
  },
  {
    title: 'Verify every header link, button, and menu can be clicked and navigates correctly',
    area: 'Header & footer',
    type: 'Navigation',
    steps: [
      'List every link, button, and menu item in the header.',
      'Click each one and wait for the destination to load.',
      'Verify that each opens the correct page and does not end on a blank or error page.',
      'On a mobile viewport, open the menu, check the same choices, and close it after the click.',
      'Verify that the labels are in the page language and are not empty.',
    ],
    expected: 'Every header element can be clicked and navigates to the correct destination.',
  },
  {
    title: 'Verify the footer contains links, contact details, copyright, and no typos',
    area: 'Header & footer',
    type: 'Content',
    steps: [
      'Scroll to the bottom of the page.',
      'Verify that the footer appears after the content and does not cover it.',
      'Check the links, contact details, and copyright text.',
      'Read every string for typos and for words in a language other than the page language.',
    ],
    expected: 'The footer is complete, readable, and free of language errors.',
  },
  {
    title: 'Verify every footer link opens the correct destination without blank pages',
    area: 'Header & footer',
    type: 'Navigation',
    steps: [
      'Collect every visible footer link.',
      'Click each link and wait for the destination to open.',
      'Verify that the destination is not a blank page, a 404, or a server error.',
      'For external links, verify that the correct address opens.',
      'Return to the page and continue until every footer link has been checked.',
    ],
    expected: 'Every footer link opens the correct destination.',
  },
  {
    title: 'Verify visible copy has no typos, mixed languages, or missing labels',
    area: 'Content',
    type: 'Content',
    steps: [
      'Read the visible headings, paragraphs, buttons, and messages.',
      'Note any typo, empty label, or untranslated string.',
      'Check that the interface language stays consistent, except for brand names.',
      'If an empty state or error message appears, verify that it uses the same language.',
    ],
    expected: 'Visible text is correct and written in the application language.',
  },
  {
    title: 'Verify prayer times display Fajr, sunrise, Dhuhr, Asr, Maghrib, and Isha',
    area: 'Prayer times',
    type: 'Functional',
    steps: [
      'Open the main prayer-times view.',
      'Find the prayer list or cards.',
      'Verify that Fajr, sunrise, Dhuhr, Asr, Maghrib, and Isha are shown.',
      'Check that each name is in the page language and has a time instead of an empty value.',
    ],
    expected: 'All six prayer times are shown with a name and a time.',
  },
  {
    title: 'Verify prayer times use the correct time format and expected order',
    area: 'Prayer times',
    type: 'Functional',
    steps: [
      'Read the time of each prayer.',
      'Verify that every time uses the same format, for example 05:12.',
      'Check that the order is Fajr, sunrise, Dhuhr, Asr, Maghrib, Isha.',
      'Verify that the times progress through the day and are not duplicated or missing without reason.',
    ],
    expected: 'Prayer times use a consistent format and the expected order.',
  },
  {
    title: 'Verify prayer times update when the date, country, or city changes',
    area: 'Prayer times',
    type: 'Functional',
    steps: [
      'Record the times for the initially selected day and place.',
      'Change the date if that control exists, and compare the new times with the first ones.',
      'Select another country and then another city.',
      'Verify that the times and the selected place name update.',
      'Return to the first selection and verify that the earlier times come back.',
    ],
    expected: 'Prayer times update according to the date, country, and city.',
  },
  {
    title: 'Verify the active prayer card and countdown reflect the current schedule',
    area: 'Prayer times',
    type: 'Functional',
    steps: [
      'Note the current time on the device.',
      'Find the active prayer card or row.',
      'Verify that the active prayer is the next one according to the current time.',
      'Read the countdown and wait at least a few seconds.',
      'Verify that the countdown decreases and matches the time remaining until the next prayer.',
    ],
    expected: 'The active card and countdown reflect the current schedule.',
  },
  {
    title: 'Verify all countries are available and selectable in the dropdown',
    area: 'Country dropdown',
    type: 'Functional',
    steps: [
      'Open the country list.',
      'Check that names are complete, readable, and not empty duplicates.',
      'Look for the countries this source is expected to serve, including several entries beyond the default.',
      'Select a country and verify that it stays selected after the list closes.',
    ],
    expected: 'Countries appear in the list and each one can be selected.',
  },
  {
    title: 'Verify the dropdown opens, closes, supports search, and saves the selected country',
    area: 'Country dropdown',
    type: 'Interaction',
    steps: [
      'Click the dropdown and verify that the list opens.',
      'Click outside the list or press Esc and verify that the list closes.',
      'Open it again and type part of a country name.',
      'Verify that the list filters to the typed text.',
      'Select a result and refresh the page if the selection is supposed to persist.',
      'Verify that the selected country remains visible.',
    ],
    expected: 'The dropdown opens, closes, searches, and keeps the selected country.',
  },
]

const scenarios: Record<AppLanguage, Scenario[]> = { sq: albanian, en: english }

export function buildTestsFromSource(value: string, language: AppLanguage): TestCase[] {
  const sourceName = value.split('/').pop()?.replace(/\.apk$/i, '') || value
  const host = value.replace(/^https?:\/\//, '').split('/')[0] || (language === 'sq' ? 'aplikacionin' : 'application')
  const label = sourceName || host
  return scenarios[language].map((scenario, index) => ({
    id: `TC-${String(index + 1).padStart(3, '0')}`,
    title: scenario.title.replaceAll('{source}', label),
    area: scenario.area,
    type: scenario.type,
    duration: '—',
    status: 'ready',
    language,
    steps: scenario.steps,
    expected: scenario.expected,
  }))
}
