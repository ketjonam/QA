function u16(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8)
}

function u32(bytes: Uint8Array, offset: number) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0
}

function findEocd(bytes: Uint8Array) {
  const start = Math.max(0, bytes.length - 22 - 65_535)
  for (let index = bytes.length - 22; index >= start; index -= 1) {
    if (u32(bytes, index) === 0x06054b50) return index
  }
  return -1
}

type ZipEntry = { name: string; method: number; compressedSize: number; localOffset: number }

function parseCentralDirectory(directory: Uint8Array) {
  const entries: ZipEntry[] = []
  let offset = 0
  while (offset + 46 <= directory.length && entries.length < 8000) {
    if (u32(directory, offset) !== 0x02014b50) break
    const method = u16(directory, offset + 10)
    const compressedSize = u32(directory, offset + 20)
    const nameLength = u16(directory, offset + 28)
    const extraLength = u16(directory, offset + 30)
    const commentLength = u16(directory, offset + 32)
    const localOffset = u32(directory, offset + 42)
    const name = new TextDecoder('utf-8').decode(directory.subarray(offset + 46, offset + 46 + nameLength))
    entries.push({ name, method, compressedSize, localOffset })
    offset += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

function utf16leSample(bytes: Uint8Array) {
  let run = ''
  let output = ''
  const limit = Math.min(bytes.length, 1_500_000)
  for (let index = 0; index + 1 < limit && output.length < 40_000; index += 2) {
    const code = bytes[index] | (bytes[index + 1] << 8)
    const isText = (code >= 32 && code <= 126) || code === 0xeb || code === 0xcb || code === 0xe7 || code === 0xc7
    if (isText) run += String.fromCharCode(code)
    else {
      if (run.length >= 4) output += `${run}\n`
      run = ''
    }
  }
  if (run.length >= 4) output += run
  return output
}

function decodeSample(bytes: Uint8Array) {
  const decoder = new TextDecoder('utf-8', { fatal: false })
  return `${decoder.decode(bytes.subarray(0, Math.min(bytes.length, 400_000)))}\n${utf16leSample(bytes)}`
}

async function inflateRaw(data: Uint8Array) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  const inflated = new Uint8Array(await new Response(stream).arrayBuffer())
  return inflated.subarray(0, 1_500_000)
}

async function readZipEntry(file: File, entry: ZipEntry) {
  if (entry.compressedSize <= 0 || entry.compressedSize > 1_500_000) return null
  const header = new Uint8Array(await file.slice(entry.localOffset, entry.localOffset + 30).arrayBuffer())
  if (header.length < 30 || u32(header, 0) !== 0x04034b50) return null
  const dataStart = entry.localOffset + 30 + u16(header, 26) + u16(header, 28)
  const compressed = new Uint8Array(await file.slice(dataStart, dataStart + entry.compressedSize).arrayBuffer())
  if (entry.method === 0) return compressed
  if (entry.method === 8) return inflateRaw(compressed)
  return null
}

async function readApkText(file: File) {
  const tailSize = Math.min(file.size, 70_000)
  const tail = new Uint8Array(await file.slice(Math.max(0, file.size - tailSize)).arrayBuffer())
  const eocdOffset = findEocd(tail)
  if (eocdOffset < 0) return ''
  const directorySize = u32(tail, eocdOffset + 12)
  const directoryOffset = u32(tail, eocdOffset + 16)
  if (directorySize === 0xffffffff || directoryOffset === 0xffffffff || directorySize > 2_000_000) return ''
  const directory = new Uint8Array(await file.slice(directoryOffset, directoryOffset + directorySize).arrayBuffer())
  const entries = parseCentralDirectory(directory)
  const names = entries.map((entry) => entry.name).join('\n')
  const selected = entries.filter((entry) => /resources\.arsc$|strings\.xml$|values-sq|\/sq\/|\.json$|\.txt$|AndroidManifest\.xml$/i.test(entry.name)).slice(0, 6)
  const chunks = [names]
  for (const entry of selected) {
    try {
      const bytes = await readZipEntry(file, entry)
      if (bytes) chunks.push(decodeSample(bytes))
    } catch {
      chunks.push(entry.name)
    }
  }
  return chunks.join('\n').slice(0, 120_000)
}

async function readRawSample(file: File) {
  const headSize = Math.min(file.size, 1_500_000)
  const tailSize = Math.min(file.size, 200_000)
  const head = new Uint8Array(await file.slice(0, headSize).arrayBuffer())
  const tail = file.size > headSize ? new Uint8Array(await file.slice(file.size - tailSize).arrayBuffer()) : new Uint8Array()
  return `${decodeSample(head)}\n${decodeSample(tail)}`.slice(0, 120_000)
}

export async function readFileSample(file: File) {
  try {
    const apkText = await readApkText(file)
    if (apkText.trim()) return `${file.name}\n${apkText}`
  } catch {
    // Fall back to a plain byte sample when the package is not a readable zip.
  }
  return `${file.name}\n${await readRawSample(file)}`
}
