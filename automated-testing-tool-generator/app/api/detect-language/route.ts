import { detectLanguage, detectLanguageFromHtml } from '@/lib/detect-language'

export const dynamic = 'force-dynamic'

async function readLimitedText(response: Response, limit = 400_000) {
  if (!response.body) return (await response.text()).slice(0, limit)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let received = 0
  let text = ''
  while (received < limit) {
    const { done, value } = await reader.read()
    if (done || !value) break
    received += value.byteLength
    text += decoder.decode(value, { stream: true })
  }
  text += decoder.decode()
  await reader.cancel().catch(() => undefined)
  return text.slice(0, limit)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const url = body?.url
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url.trim())) {
    return Response.json({ error: 'Vendos një URL http ose https.' }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetch(url.trim(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'TestpilotLanguageDetector/1.0',
      },
    })
    const payload = await readLimitedText(response)
    const contentType = response.headers.get('content-type') ?? ''
    const detection = /html|xml|text/i.test(contentType) || payload.trimStart().startsWith('<')
      ? detectLanguageFromHtml(payload, url)
      : detectLanguage(payload, url, 'package')

    return Response.json({
      language: detection.language,
      confidence: detection.confidence,
      signals: detection.signals,
      status: response.status,
      finalUrl: response.url,
    })
  } catch {
    return Response.json({ error: 'Nuk u lexua dot faqja. Po përdoret analiza e adresës.' }, { status: 422 })
  } finally {
    clearTimeout(timeout)
  }
}
