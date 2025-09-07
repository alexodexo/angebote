# 🚀 Angebote.KI

**Von Sprache zu professionellem Angebot in wenigen Minuten!**

Angebote.KI ist eine revolutionäre SaaS-Anwendung, die mithilfe modernster KI-Technologie aus Sprachaufnahmen vollständige, professionelle Angebote als PDF erstellt.

## ✨ Features

- 🎙️ **Audio-Aufnahme & Upload**: Direkte Aufnahme oder Upload von Audio-Dateien
- 🤖 **KI-powered Transkription**: Präzise Spracherkennung mit Deepgram
- ✍️ **Intelligente Angebotserstellung**: GPT-4o erstellt professionelle Angebote
- 📄 **PDF-Generation**: Automatische Konvertierung zu hochwertigen PDFs
- 🎨 **Corporate Identity**: Anpassbare Profile für Ihr Unternehmen
- 💫 **Moderne UI**: iOS-inspiriertes Design mit hochwertigen Animationen
- ⚡ **Blitzschnell**: Kompletter Workflow in unter 2 Minuten

## 🛠️ Tech Stack

- **Framework**: Next.js 15 mit App Router
- **Styling**: Tailwind CSS mit iOS-Design System
- **Animationen**: Framer Motion
- **KI Services**: 
  - Deepgram (Transkription)
  - OpenAI GPT-4o (Angebotserstellung)
- **PDF-Generation**: Puppeteer + Marked
- **Audio**: Web Audio API + React Dropzone

## 🚀 Installation

1. **Repository klonen**
   ```bash
   git clone https://github.com/alexodexo/angebote.git
   cd angebote
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Environment Variables konfigurieren**
   ```bash
   cp env.example .env.local
   ```
   
   Füge deine API-Keys hinzu:
   ```env
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Development Server starten**
   ```bash
   npm run dev
   ```

5. **App öffnen**
   Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser

## 🔧 API Keys Setup

### Deepgram API Key
1. Gehe zu [deepgram.com](https://deepgram.com)
2. Erstelle einen Account
3. Navigiere zu API Keys
4. Erstelle einen neuen API Key
5. Füge ihn in `.env.local` ein

### OpenAI API Key
1. Gehe zu [platform.openai.com](https://platform.openai.com)
2. Erstelle einen Account
3. Navigiere zu API Keys
4. Erstelle einen neuen API Key
5. Füge ihn in `.env.local` ein

## 📱 Verwendung

1. **Profil erstellen**: Klicke auf "Profile" und erstelle dein Unternehmensprofil
2. **Audio aufnehmen**: Nutze die Aufnahmefunktion oder lade eine Datei hoch
3. **Verarbeitung**: Schaue zu, wie die KI dein Angebot erstellt
4. **Download**: Lade dein fertiges PDF-Angebot herunter

## 🎨 Design System

Das Design basiert auf Apples iOS Human Interface Guidelines:

- **Farben**: iOS-inspirierte Farbpalette
- **Typografie**: SF Pro / Inter Font Stack  
- **Komponenten**: Native iOS-Komponenten nachempfunden
- **Animationen**: Flüssige, natürliche Übergänge
- **Glassmorphism**: Moderne Glaseffekte

## 🏗️ Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── transcribe/    # Deepgram Transkription
│   │   ├── generate-quote/# GPT-4o Angebotserstellung
│   │   └── generate-pdf/  # PDF-Generation
│   ├── globals.css        # Globale Styles
│   ├── layout.js          # Root Layout
│   └── page.js            # Hauptseite
├── components/            # React Komponenten
│   ├── ui/               # UI Komponenten
│   ├── AudioRecorder.js  # Audio-Aufnahme
│   ├── ProcessingAnimation.js # Ladeanimationen
│   └── ProfileManager.js # Profilverwaltung
└── lib/
    └── utils.js          # Utility-Funktionen
```

## 🔄 Workflow

1. **Audio Input** → Aufnahme oder Upload
2. **Transkription** → Deepgram konvertiert Audio zu Text
3. **KI-Generierung** → GPT-4o erstellt Markdown-Angebot
4. **PDF-Export** → Puppeteer konvertiert zu professionellem PDF

## 🚀 Deployment

### Vercel (Empfohlen)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t angebote-ki .
docker run -p 3000:3000 angebote-ki
```

## 🤝 Contributing

Contributions sind willkommen! Bitte:

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Commit deine Änderungen
4. Push zum Branch
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt steht unter der MIT Lizenz - siehe [LICENSE](LICENSE) für Details.

## 🙏 Credits

- **Design**: Inspiriert von Apple's iOS Design System
- **Icons**: Lucide React
- **Animationen**: Framer Motion
- **KI**: OpenAI GPT-4o & Deepgram

---

**Entwickelt mit ❤️ für die Zukunft der Angebotserstellung**