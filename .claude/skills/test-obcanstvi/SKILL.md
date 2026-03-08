---
name: test-obcanstvi
description: Testování otázek z databáze českého občanství. Náhodně vybírá otázky, zobrazuje možnosti A-D, čeká na odpověď uživatele, zobrazuje správnou odpověď a sleduje pokrok. Použijte při přípravě na zkoušku z občanství, testování znalostí českých reálií, nebo procvičování otázek. Klíčová slova - test občanství, zkouška, otázky, procvičování, reset testu.
disable-model-invocation: true
---

# Test Občanství

Interaktivní testování otázek z databáze českého občanství s evidencí pokroku.

## Funkce

- **Náhodný výběr otázek** z celé databáze
- **Interaktivní testování** s možnostmi A-D
- **Okamžitá zpětná vazba** - zobrazení správné odpovědi po vaší volbě
- **Sledování pokroku** - správně zodpovězené otázky se již neobjevují
- **Statistiky** - počet správných/špatných odpovědí, procento úspěšnosti
- **Reset stavu** - možnost začít znovu

## Použití

### Zahájení testu

```
/test-obcanstvi
```

nebo

```
/test-obcanstvi start
```

### Zobrazení statistik

```
/test-obcanstvi stats
```

### Reset testu (začít znovu)

```
/test-obcanstvi reset
```

## Jak test funguje

1. **Výběr otázky**: Náhodně se vybere otázka, která ještě nebyla správně zodpovězena
2. **Zobrazení**: Zobrazí se text otázky a možnosti A-D
3. **Vaše odpověď**: Napište písmeno A, B, C nebo D
4. **Vyhodnocení**: Zobrazí se, zda jste odpověděli správně a jaká byla správná odpověď
5. **Pokračování**: Automaticky se vybere další otázka

## Formát otázek

Otázky jsou rozděleny do témat:
- Zvyky a tradice
- Doprava
- Zdravotní a záchranný systém
- Vzdělávání
- Politický systém
- Zákonodárná a výkonná moc
- Soudní moc a ochrana občanů
- Volby
- Základní právní pojmy
- Občanské právo
- Rodinné právo
- Měna a bankovní soustava
- Daňová soustava
- Sociální zabezpečení
- Zaměstnání
- Podnikání
- Geografie a příroda
- Historie

## Ukládání pokroku

Stav testu se ukládá do:
```
.claude/skills/test-obcanstvi/state.json
```

Tento soubor obsahuje:
- ID správně zodpovězených otázek
- ID špatně zodpovězených otázek
- Celkový počet pokusů
- Statistiky

## Příklad použití

```
👤 Uživatel: /test-obcanstvi

🤖 Claude:
📊 Stav testu: 0/235 otázek správně zodpovězeno (0%)

📝 Otázka 1.1 (ZVYKY A TRADICE)
Který svátek slaví Češi i lidé po celém světě 8. března?

A) Den matek.
B) Den učitelů.
C) Mezinárodní den žen.
D) Mezinárodní den dětí.

Vaše odpověď (A/B/C/D):

👤 Uživatel: C

🤖 Claude:
✅ SPRÁVNĚ!

Správná odpověď: C) Mezinárodní den žen.

📊 Pokrok: 1/235 otázek (0.4%)
   Správně: 1 | Špatně: 0 | Úspěšnost: 100%

[Další otázka se zobrazí automaticky...]
```

## Poznámky

- Otázky se vybírají náhodně z celého balíku
- Správně zodpovězené otázky se již neobjevují (dokud neprovedete reset)
- Špatně zodpovězené otázky se mohou opakovat
- Některé otázky obsahují obrázky - v těch případech je uvedeno "Na obrázku..."
- Po zodpovězení všech otázek se zobrazí gratulace a statistiky

## Interní poznámky pro Clauda

### Workflow

1. **Načti stav**: Přečti `state.json` nebo vytvoř nový prázdný stav
2. **Parsuj databázi**: Přečti `databanka-otazek-obcanstvi.md` a extrahuj všechny otázky
3. **Vyfiltruj otázky**: Vyber pouze otázky, které ještě nebyly správně zodpovězeny
4. **Náhodný výběr**: Vyber náhodnou otázku ze zbývajících
5. **Zobraz otázku**: Zobraz číslo otázky, téma, text a možnosti
6. **Čekej na odpověď**: Vyžádej si odpověď od uživatele
7. **Vyhodnoť**: Porovnej s správnou odpovědí
8. **Ulož stav**: Aktualizuj `state.json`
9. **Zobraz statistiky**: Zobraz aktuální pokrok
10. **Opakuj**: Pokud nejsou všechny otázky zodpovězeny, pokračuj dalším kolem

### Struktura state.json

```json
{
  "correct": ["1.1", "1.2", "2.3", ...],
  "incorrect": ["3.1", "4.5", ...],
  "total_attempts": 45,
  "started_at": "2026-02-02T10:30:00Z",
  "last_updated": "2026-02-02T11:45:00Z"
}
```

### Parsování otázek

Formát v databázi:
```
### 1. ZVYKY A TRADICE
1. Text otázky?
A) Možnost A.
B) Možnost B.
C) Možnost C.
D) Možnost D.

**SPRÁVNÉ ŘEŠENÍ: 1C, 2C, 3D, ...**
```

- Každá sekce má název (např. "1. ZVYKY A TRADICE")
- Otázky jsou číslovány 1-10 v každé sekci
- ID otázky = "sekce.číslo" (např. "1.1", "1.2", "2.1")
- Správné odpovědi jsou na konci sekce ve formátu "1C, 2C, 3D"

### Spuštění Python skriptu

Pro náhodný výběr a správu stavu použij:
```bash
python scripts/quiz_manager.py [command]
```

Commands:
- `next` - Vrátí další náhodnou otázku
- `answer <question_id> <answer>` - Zaznamenává odpověď
- `stats` - Zobrazí statistiky
- `reset` - Resetuje stav

### Upozornění

- **Vždy ukazuj jen jednu otázku najednou**
- **Neopakuj správně zodpovězené otázky** (dokud není reset)
- **Špatně zodpovězené otázky se mohou opakovat** (pro upevnění)
- **Buď trpělivý** - počkej na odpověď uživatele, nenabízej nápovědy
- **Zobrazuj pokrok** po každé odpovědi
