import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { marked } from 'marked'

// Markdown zu HTML konvertieren mit spezieller Tabellen-Unterstützung
function markdownToHtml(markdown, profile = {}) {
  const html = marked(markdown, {
    breaks: true,
    gfm: true, // GitHub Flavored Markdown für Tabellen
  })

  // CSS-Styles für professionelle PDF-Generierung
  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 60px;
        background: white;
      }
      
      h1 { display: none; }
      
      h2 {
        color: ${profile.secondaryColor || '#5856D6'};
        font-size: 22px;
        font-weight: 600;
        margin-top: 35px;
        margin-bottom: 20px;
      }
      
      h3 {
        color: #333;
        font-size: 18px;
        font-weight: 600;
        margin-top: 25px;
        margin-bottom: 15px;
      }
      
      p {
        margin-bottom: 15px;
        font-size: 14px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 25px 0;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
      }
      
      th {
        background: ${profile.primaryColor || '#007AFF'};
        color: white;
        font-weight: 600;
        padding: 15px 12px;
        text-align: left;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      td {
        padding: 12px;
        border-bottom: 1px solid #e5e5e5;
      }
      
      tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      
      tr:last-child td {
        border-bottom: none;
      }
      
      /* Spezielle Formatierung für Preisspalten */
      td:last-child, th:last-child {
        text-align: right;
        font-weight: 600;
      }
      
      /* Gesamtsummen-Tabelle */
      table.summary {
        margin-left: auto;
        width: 300px;
        margin-top: 20px;
      }
      
      table.summary th {
        background: #f8f9fa;
        color: #333;
        border: 1px solid #dee2e6;
      }
      
      table.summary td {
        border: 1px solid #dee2e6;
        font-weight: 500;
      }
      
      table.summary tr:last-child {
        background: ${profile.primaryColor || '#007AFF'};
        color: white;
        font-weight: 700;
      }
      
      table.summary tr:last-child td {
        border-color: ${profile.primaryColor || '#007AFF'};
      }
      
      .header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 24px;
        align-items: center;
        margin-bottom: 32px;
      }

      .header-card {
        background: ${profile.primaryColor || '#007AFF'};
        color: #fff;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      }

      .header-meta {
        font-size: 12px;
        color: #f0f4ff;
        opacity: 0.95;
      }
      
      .company-info {
        flex: 1;
      }
      
      .logo {
        max-width: 150px;
        max-height: 80px;
      }
      
      .quote-info {
        text-align: right;
        font-size: 13px;
        color: #666;
      }
      
      .footer {
        margin-top: 50px;
        padding-top: 30px;
        border-top: 1px solid #e5e5e5;
        font-size: 12px;
        color: #666;
        text-align: center;
      }
      
      .highlight {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
      }
      
      strong {
        font-weight: 600;
        color: #333;
      }
      
      @media print {
        body {
          padding: 20px;
        }
        
        .no-print {
          display: none;
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
      <div class="header">
        <div class="header-card">
          <div style="font-size:18px;font-weight:700;line-height:1.2;">${profile.companyName || 'Ihr Unternehmen'}</div>
          <div style="margin-top:6px;font-size:13px;">${profile.address || ''}</div>
          <div class="header-meta">Tel. ${profile.phone || ''} • ${profile.email || ''} • ${profile.website || ''}</div>
        </div>
        <div class="quote-info">
          <div><strong>Angebot</strong></div>
          <div>Datum: ${new Date().toLocaleDateString('de-DE')}</div>
        </div>
      </div>

      ${html}
      <div class="footer">
        <p>Generiert mit Angebote.KI • ${new Date().toLocaleDateString('de-DE')}</p>
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

    // Puppeteer Browser starten
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
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
