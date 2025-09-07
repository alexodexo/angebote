import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { marked } from 'marked'

// Dynamischer Import für Vercel Chromium
async function getBrowserConfig() {
  if (process.env.VERCEL) {
    try {
      const chromium = await import('@sparticuz/chromium')
      return {
        executablePath: await chromium.executablePath(),
        args: [
          ...chromium.args,
          '--hide-scrollbars',
          '--disable-web-security',
        ],
      }
    } catch (error) {
      console.warn('Chromium import failed, using default puppeteer')
    }
  }
  
  return {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ]
  }
}

// Markdown zu HTML konvertieren mit spezieller Tabellen-Unterstützung
function markdownToHtml(markdown, profile = {}) {
  const html = marked(markdown, {
    breaks: true,
    gfm: true, // GitHub Flavored Markdown für Tabellen
  })

  // CSS-Styles für professionelle B2B PDF-Generierung
  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Source Sans Pro', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.5;
        color: #2c3e50;
        background: white;
        font-size: 11pt;
      }
      
      .document {
        max-width: 210mm;
        margin: 0 auto;
        padding: 25mm 20mm;
        min-height: 297mm;
      }
      
      h1 { display: none; }
      
      h2 {
        color: #34495e;
        font-size: 16pt;
        font-weight: 700;
        margin: 20pt 0 12pt 0;
        text-transform: uppercase;
        letter-spacing: 0.5pt;
        border-bottom: 2pt solid #bdc3c7;
        padding-bottom: 6pt;
      }
      
      h3 {
        color: #34495e;
        font-size: 13pt;
        font-weight: 600;
        margin: 16pt 0 8pt 0;
      }
      
      p {
        margin-bottom: 8pt;
        text-align: justify;
        line-height: 1.4;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30pt;
        padding-bottom: 15pt;
        border-bottom: 1pt solid #34495e;
      }
      
      .company-section {
        flex: 1;
      }
      
      .company-name {
        font-size: 18pt;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 6pt;
      }
      
      .company-details {
        font-size: 9pt;
        color: #7f8c8d;
        line-height: 1.3;
      }
      
      .document-info {
        text-align: right;
        font-size: 10pt;
        color: #34495e;
        min-width: 120pt;
      }
      
      .document-title {
        font-size: 14pt;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 4pt;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16pt 0;
        font-size: 10pt;
        border: 1pt solid #bdc3c7;
      }
      
      th {
        background: #34495e;
        color: white;
        font-weight: 600;
        padding: 10pt 8pt;
        text-align: left;
        font-size: 9pt;
        text-transform: uppercase;
        letter-spacing: 0.3pt;
        border: 1pt solid #2c3e50;
      }
      
      td {
        padding: 8pt;
        border: 1pt solid #bdc3c7;
        vertical-align: top;
      }
      
      tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      
      /* Rechtsbündige Zahlen */
      td:last-child, th:last-child,
      td.amount, th.amount {
        text-align: right;
        font-weight: 600;
      }
      
      /* Summentabelle */
      .summary-table {
        width: 200pt;
        margin: 16pt 0 0 auto;
        font-size: 10pt;
      }
      
      .summary-table td {
        padding: 6pt 8pt;
        border: 1pt solid #bdc3c7;
      }
      
      .summary-table .total-row {
        background: #34495e;
        color: white;
        font-weight: 700;
      }
      
      .summary-table .total-row td {
        border-color: #2c3e50;
      }
      
      .terms-section {
        margin-top: 20pt;
        padding-top: 12pt;
        border-top: 1pt solid #ecf0f1;
      }
      
      .terms-section h3 {
        font-size: 12pt;
        margin-bottom: 8pt;
      }
      
      .terms-section p {
        font-size: 10pt;
        margin-bottom: 6pt;
      }
      
      ul, ol {
        margin: 8pt 0 8pt 20pt;
      }
      
      li {
        margin-bottom: 4pt;
        font-size: 10pt;
      }
      
      strong {
        font-weight: 600;
        color: #2c3e50;
      }
      
      .highlight-box {
        background: #ecf0f1;
        border-left: 4pt solid #3498db;
        padding: 10pt;
        margin: 12pt 0;
        font-size: 10pt;
      }
      
      .contact-footer {
        margin-top: 25pt;
        padding-top: 12pt;
        border-top: 1pt solid #bdc3c7;
        font-size: 9pt;
        color: #7f8c8d;
        text-align: center;
      }
      
      @page {
        margin: 20mm;
        size: A4;
      }
      
      @media print {
        .document {
          padding: 0;
          margin: 0;
        }
      }
    </style>
  `

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Angebot</title>
      ${styles}
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="company-section">
            <div class="company-name">${profile.companyName || 'Ihr Unternehmen'}</div>
            <div class="company-details">
              ${profile.address ? profile.address.replace(/\n/g, '<br>') : ''}<br>
              ${profile.phone ? 'Tel. ' + profile.phone : ''} ${profile.phone && profile.email ? '•' : ''} ${profile.email || ''}<br>
              ${profile.website || ''} ${profile.website && profile.taxId ? '•' : ''} ${profile.taxId ? 'USt-IdNr.: ' + profile.taxId : ''}
            </div>
          </div>
          <div class="document-info">
            <div class="document-title">ANGEBOT</div>
            <div>Datum: ${new Date().toLocaleDateString('de-DE')}</div>
          </div>
        </div>

        ${html}
      </div>
    </body>
    </html>
  `
}

export async function POST(request) {
  let browser = null
  
  try {
    const { markdown, profile = {}, preview = false } = await request.json()
    
    if (!markdown) {
      return NextResponse.json(
        { error: 'Kein Markdown-Inhalt vorhanden' }, 
        { status: 400 }
      )
    }

    // HTML generieren
    const html = markdownToHtml(markdown, profile)

    if (preview) {
      // Für die Vorschau geben wir das HTML direkt zurück
      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    // Browser-Konfiguration für Vercel/Local
    const browserConfig = await getBrowserConfig()
    
    // Puppeteer Browser starten
    browser = await puppeteer.launch({
      headless: 'new',
      ...browserConfig
    })

    const page = await browser.newPage()
    
    // HTML-Inhalt setzen
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    // PDF generieren
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    })

    await browser.close()
    browser = null

    // PDF als Response zurückgeben
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="angebot-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF-Generierungs-Fehler:', error)
    
    if (browser) {
      await browser.close()
    }
    
    return NextResponse.json(
      { error: 'Fehler bei der PDF-Generierung' }, 
      { status: 500 }
    )
  }
}
