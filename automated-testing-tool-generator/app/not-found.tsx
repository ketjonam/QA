'use client'

import Link from 'next/link'
import { ArrowLeft, FileQuestion, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#101828]">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
        <section className="w-full rounded-2xl border border-[#e6e8ec] bg-white p-8 text-center shadow-[0_8px_30px_rgba(16,24,40,.06)] sm:p-12">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#eef3ff] text-[#1458e8]">
            <FileQuestion size={30} aria-hidden="true" />
          </div>
          <p className="mb-2 text-sm font-semibold text-[#1458e8]">404 · Route not found</p>
          <h1 className="text-3xl font-semibold tracking-[-.03em]">This page doesn&apos;t exist</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#667085]">
            The route you entered is unavailable or may have moved. Return to Testpilot to analyze a source and run your test suite.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1458e8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_5px_rgba(20,88,232,.25)] transition hover:bg-[#1049c9] focus:outline-none focus:ring-2 focus:ring-[#1458e8] focus:ring-offset-2">
              <Home size={16} aria-hidden="true" />
              Go to dashboard
            </Link>
            <button type="button" onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d0d5dd] px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#1458e8] focus:ring-offset-2">
              <ArrowLeft size={16} aria-hidden="true" />
              Go back
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#98a2b3]">
            <Search size={14} aria-hidden="true" />
            Check the URL and try again.
          </div>
        </section>
      </div>
    </main>
  )
}
