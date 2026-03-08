# Test Českého Občanství 🇨🇿

Moderní Angular 17+ aplikace pro interaktivní test českého občanství s 291 otázkami z českých reálií.

## 🌐 Nasazení

**Živá aplikace:** https://test-obcansvi.vercel.app

## ✨ Funkce

- ✅ 291 otázek rozdělených do 26 sekcí
- 🎲 Náhodný výběr otázek s prevencí okamžitého opakování
- 📊 Detailní statistiky a sledování pokroku
- 💾 Automatické ukládání pomocí IndexedDB
- 🌓 Dark mode s podporou systémových preferencí
- 📱 Responzivní design
- ⌨️ Klávesové zkratky (A-D pro odpovědi)
- 🖼️ 30 obrázků s lazy loadingem
- 📄 Export statistik do PDF/CSV
- ⚡ Optimalizovaný výkon s Angular Signals

## 🚀 Rychlý Start

### Instalace

```bash
cd czech-citizenship-test
npm install
```

### Vývoj

```bash
npm start
```

Aplikace běží na `http://localhost:4200`

### Build

```bash
npm run build
```

Produkční build se vytvoří v `dist/czech-citizenship-test/`

## 📁 Struktura Projektu

```
czech-citizenship-test/
├── src/
│   ├── app/
│   │   ├── core/               # Services, guards, models
│   │   ├── shared/             # Sdílené komponenty
│   │   ├── features/           # Feature moduly
│   │   │   ├── home/           # Úvodní stránka
│   │   │   ├── quiz/           # Kvíz
│   │   │   └── statistics/     # Statistiky
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── data/
│   │   │   └── questions.json  # 291 otázek
│   │   └── images/
│   │       └── questions/      # 44 obrázků
│   └── styles.scss
└── scripts/
    └── convert-markdown-to-json.ts
```

## 🎮 Jak Používat

1. **Úvodní Stránka** - Zobrazuje statistiky a tlačítka pro start
2. **Kvíz** - Náhodné otázky s okamžitou zpětnou vazbou
3. **Statistiky** - Detailní přehled s exportem do PDF/CSV
4. **Dark Mode** - Přepínač v hlavičce (🌙/☀️)

### Klávesové zkratky
- `A`, `B`, `C`, `D` - Výběr odpovědi
- `Enter` / `Space` - Pokračování na další otázku

## 🧠 Technologie

- Angular 17.3.0 (Standalone Components)
- Angular Signals (State Management)
- IndexedDB (via idb)
- jsPDF + jsPDF-AutoTable
- SCSS + CSS Variables

## 📊 Data

- **Zdroj:** Národní pedagogický institut ČR, 2026
- **Otázky:** 291 z 26 tematických sekcí
- **Obrázky:** 30 otázek s ilustracemi

## ✅ Verifikace

```bash
# Počet otázek
cat src/assets/data/questions.json | jq 'length'
# Výsledek: 291

# Počet obrázků
ls src/assets/images/questions/ | wc -l
# Výsledek: 44
```

## 🎯 Hlavní Komponenty

- **QuizService** - Logika kvízu s prevencí opakování
- **StorageService** - IndexedDB persistence
- **ThemeService** - Dark mode management
- **ExportService** - PDF/CSV export

## 🐛 Debug

Vymazání IndexedDB:
```javascript
indexedDB.deleteDatabase('czech-citizenship-test');
location.reload();
```

## 📄 Licence

Otázky © Národní pedagogický institut České republiky, 2026

---

Made with ❤️ and Angular 17+
