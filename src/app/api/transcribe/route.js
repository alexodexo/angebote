import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@deepgram/sdk'

const deepgram = createClient(process.env.DEEPGRAM_API_KEY)

export async function POST(request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio')
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Keine Audio-Datei gefunden' }, 
        { status: 400 }
      )
    }

    // Audio-Datei in Buffer konvertieren
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    
    // Deepgram-Transkription
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: 'nova-2',
        language: 'de',
        smart_format: true,
        punctuate: true,
        paragraphs: true,
        utterances: true,
        diarize: false,
      }
    )

    if (error) {
      console.error('Deepgram-Fehler:', error)
      return NextResponse.json(
        { error: 'Transkription fehlgeschlagen' }, 
        { status: 500 }
      )
    }

    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript

    if (!transcript) {
      return NextResponse.json(
        { error: 'Keine Transkription möglich' }, 
        { status: 500 }
      )
    }

    // Zusätzliche Metadaten extrahieren
    const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0
    const duration = result?.metadata?.duration || 0
    
    return NextResponse.json({
      transcript,
      confidence,
      duration,
      success: true
    })

  } catch (error) {
    console.error('Transkriptions-Fehler:', error)
    return NextResponse.json(
      { error: 'Server-Fehler bei der Transkription' }, 
      { status: 500 }
    )
  }
}
