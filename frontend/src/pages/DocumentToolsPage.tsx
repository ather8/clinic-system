import { useState } from 'react'
import { extractTextFromImage, summarizeReport } from '../lib/api'

export default function DocumentToolsPage() {
  // OCR state
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrError, setOcrError] = useState('')

  // Summarizer state
  const [reportText, setReportText] = useState('')
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setOcrError('')
    setOcrLoading(true)
    try {
      const result = await extractTextFromImage(file)
      setExtractedText(result.extracted_text)
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setOcrLoading(false)
    }
  }

  async function handleSummarize(e: React.FormEvent) {
    e.preventDefault()
    if (!reportText.trim()) return
    setSummaryError('')
    setSummaryLoading(true)
    try {
      const result = await summarizeReport(reportText)
      setSummary(result.summary)
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="font-display text-2xl text-ink">Document tools</h1>
        <p className="mt-1 text-sm text-ink/60">
          Extract text from scanned documents and summarize medical reports.
        </p>
      </div>

      {/* OCR section */}
      <section className="rounded-2xl border border-clinic-border bg-white p-6">
        <h2 className="font-display text-lg text-ink">Extract text from an image</h2>

        <form onSubmit={handleExtract} className="mt-4 space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-ink/70 file:mr-3 file:rounded-lg file:border-0 file:bg-clinic-teal file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-clinic-teal/90"
          />
          <button
            type="submit"
            disabled={!file || ocrLoading}
            className="rounded-lg bg-clinic-teal px-5 py-2 text-sm font-medium text-white hover:bg-clinic-teal/90 disabled:opacity-60"
          >
            {ocrLoading ? 'Extracting…' : 'Extract text'}
          </button>
        </form>

        {ocrError && <p className="mt-3 text-sm text-red-600">{ocrError}</p>}

        {extractedText && (
          <div className="mt-4">
            <label className="text-sm font-medium text-ink/80">Extracted text</label>
            <textarea
              readOnly
              value={extractedText}
              rows={6}
              className="mt-1 w-full rounded-lg border border-clinic-border bg-clinic-bg px-3 py-2 text-sm text-ink"
            />
            <button
              type="button"
              onClick={() => setReportText(extractedText)}
              className="mt-2 text-sm font-medium text-clinic-teal hover:underline"
            >
              Use this text in the summarizer below ↓
            </button>
          </div>
        )}
      </section>

      {/* Summarizer section */}
      <section className="rounded-2xl border border-clinic-border bg-white p-6">
        <h2 className="font-display text-lg text-ink">Summarize a medical report</h2>

        <form onSubmit={handleSummarize} className="mt-4 space-y-3">
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Paste or type the report text here…"
            rows={6}
            className="w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          />
          <button
            type="submit"
            disabled={!reportText.trim() || summaryLoading}
            className="rounded-lg bg-clinic-teal px-5 py-2 text-sm font-medium text-white hover:bg-clinic-teal/90 disabled:opacity-60"
          >
            {summaryLoading ? 'Summarizing…' : 'Summarize'}
          </button>
        </form>

        {summaryError && <p className="mt-3 text-sm text-red-600">{summaryError}</p>}

        {summary && (
          <div className="mt-4">
            <label className="text-sm font-medium text-ink/80">Summary</label>
            <div className="mt-1 whitespace-pre-wrap rounded-lg border border-clinic-border bg-clinic-bg px-3 py-2 text-sm text-ink">
              {summary}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}