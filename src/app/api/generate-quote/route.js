import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const DEFAULT_PROFILE = {
  companyName: 'Ihr Unternehmen',
  primaryColor: '#007AFF',
  secondaryColor: '#5856D6',
  logo: null,
  address: 'Musterstraße 123, 12345 Musterstadt',
  phone: '+49 123 456789',
  email: 'info@unternehmen.de',
  website: 'www.unternehmen.de',
  bankDetails: {
    bank: 'Musterbank',
    iban: 'DE12 3456 7890 1234 5678 90',
    bic: 'MUSTDE2MXXX'
  },
  taxId: 'DE123456789',
  preferences: {
    tone: 'professionell und freundlich',
    structure: 'detailliert mit Tabellen',
    paymentTerms: '14 Tage netto',
    validityPeriod: '30 Tage'
  }
}

export async function POST(request) {
  try {
    const { transcript, profile = DEFAULT_PROFILE } = await request.json()
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'Kein Transkript vorhanden' }, 
        { status: 400 }
      )
    }

    // Prompt für GPT-4o erstellen
    const systemPrompt = `Du bist ein Experte für die Erstellung professioneller B2B-Angebote. 
    
Erstelle basierend auf der Transkription ein vollständiges, professionelles Angebot im Markdown-Format.

WICHTIGE ANFORDERUNGEN:
- Verwende ausschließlich deutsche Sprache
- Erstelle eine klare Struktur mit Überschriften
- Integriere Tabellen für Positionen/Preise (verwende Markdown-Tabellen-Syntax)
- Ton: ${profile.preferences?.tone || 'professionell und freundlich'}
- Struktur: ${profile.preferences?.structure || 'detailliert mit Tabellen'}
- Zahlungsziel: ${profile.preferences?.paymentTerms || '14 Tage netto'}
- Gültigkeitsdauer: ${profile.preferences?.validityPeriod || '30 Tage'}

FIRMENINFORMATIONEN:
- Firmenname: ${profile.companyName}
- Adresse: ${profile.address}
- Telefon: ${profile.phone}
- E-Mail: ${profile.email}
- Website: ${profile.website}
- Steuernummer: ${profile.taxId}

BANKVERBINDUNG:
- Bank: ${profile.bankDetails?.bank}
- IBAN: ${profile.bankDetails?.iban}
- BIC: ${profile.bankDetails?.bic}

STRUKTUR DES ANGEBOTS:
1. Angebots-Header mit Firmendaten
2. Anschrift des Kunden (falls erkennbar)
3. Angebotsnummer und Datum
4. Betreff
5. Einleitungstext
6. Leistungsbeschreibung mit Tabelle (Position | Beschreibung | Menge | Einzelpreis | Gesamtpreis)
7. Gesamtsumme (Netto, MwSt., Brutto)
8. Zahlungskonditionen
9. Gültigkeitsdauer
10. Abschlusstext
11. Kontaktdaten

WICHTIG: 
- Verwende realistische Preise basierend auf der beschriebenen Leistung
- Berechne MwSt. (19%) korrekt
- Formatiere Preise als deutsche Währung (z.B. 1.234,56 €)
- Erstelle professionelle Tabellen mit korrekter Markdown-Syntax`

    const userPrompt = `Erstelle ein professionelles Angebot basierend auf dieser Transkription:

"${transcript}"

Analysiere die Anfrage und erstelle ein vollständiges Angebot mit allen notwendigen Details, realistischen Preisen und professioneller Formatierung.`

    const { text } = await generateText({
      model: openai('gpt-5-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7
    })

    // Angebotsnummer generieren
    const quoteNumber = `ANG-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    
    // Datum formatieren
    const currentDate = new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Markdown mit dynamischen Werten ergänzen
    let finalMarkdown = text
      .replace(/\{ANGEBOTSNUMMER\}/g, quoteNumber)
      .replace(/\{DATUM\}/g, currentDate)
      .replace(/\{FIRMENNAME\}/g, profile.companyName)

    return NextResponse.json({
      markdown: finalMarkdown,
      quoteNumber,
      generatedAt: new Date().toISOString(),
      profile: profile.companyName,
      success: true
    })

  } catch (error) {
    console.error('Angebots-Generierungs-Fehler:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Angebotserstellung' }, 
      { status: 500 }
    )
  }
}
