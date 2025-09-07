'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function FinalizePage() {
  const router = useRouter()
  const [markdown, setMarkdown] = useState('')
  const [htmlPreview, setHtmlPreview] = useState('')
  const [profile, setProfile] = useState(null)
  const [quoteNumber, setQuoteNumber] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  // Draft aus Session laden
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('angebote-draft')
      if (raw) {
        const data = JSON.parse(raw)
        setMarkdown(data.markdown || '')
        setProfile(data.profile || null)
        setQuoteNumber(data.quoteNumber || '')
      }
    } catch {}
  }, [])

  // Live-Preview via /api/generate-quote markdown->html Render im Browser
  useEffect(() => {
    const controller = new AbortController()
    const render = async () => {
      try {
        const res = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown, profile, preview: true }),
          signal: controller.signal,
        })
        const html = await res.text()
        setHtmlPreview(html)
      } catch {}
    }
    if (markdown) render()
    return () => controller.abort()
  }, [markdown, profile])

  const exportPdf = async () => {
    setIsExporting(true)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, profile }),
      })
      if (!res.ok) throw new Error('Export fehlgeschlagen')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `angebot-${quoteNumber || Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ios-gray-900">Angebot finalisieren</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/')}>Zurück</Button>
          <Button onClick={exportPdf} loading={isExporting}>Als PDF exportieren</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-ios-gray-600">Markdown bearbeiten</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[70vh] p-3 border border-ios-gray-300 rounded-ios font-mono text-sm focus:ring-2 focus:ring-ios-blue focus:border-transparent"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-ios-gray-600 mb-2">Vorschau</div>
            <div className="border border-ios-gray-200 rounded-ios overflow-hidden h-[70vh] bg-white">
              <iframe title="preview" className="w-full h-full" srcDoc={htmlPreview} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


