# Test Občanství

Interaktivní skill pro testování otázek z databáze českého občanství s automatickým sledováním pokroku.

## Co tento skill dělá

- ✅ Náhodně vybírá otázky z databáze 219 testových úloh
- ✅ Zobrazuje možnosti A-D a čeká na vaši odpověď
- ✅ Okamžitě vyhodnocuje správnost odpovědi
- ✅ Sleduje, které otázky jste již správně zodpověděli
- ✅ Nezobrazuje znovu správně zodpovězené otázky
- ✅ Ukládá stav mezi sezeními
- ✅ Umožňuje reset pro nový začátek

## Jak používat

### Spuštění testu

Napište jednoduše:
```
/test-obcanstvi
```

### Zobrazení statistik

```
/test-obcanstvi stats
```

### Reset (začít znovu)

```
/test-obcanstvi reset
```

## Příklad použití

```
👤 Uživatel: /test-obcanstvi

🤖 Claude:
📊 Stav testu: 0/219 otázek správně zodpovězeno (0%)

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

📊 Pokrok: 1/219 otázek (0.5%)
   Správně: 1 | Špatně: 0 | Úspěšnost: 100%
```

## Témata otázek

Databáze obsahuje 219 otázek rozdělených do těchto témat:

### Základní právní informace (99 otázek)
1. Zvyky a tradice (10)
2. Doprava (10)
3. Zdravotní a záchranný systém (10)
4. Vzdělávání (10)
5. Politický systém (10)
6. Zákonodárná a výkonná moc (10)
7. Soudní moc a ochrana občanů (10)
8. Volby (10)
9. Základní právní pojmy, správní a trestní právo (10)
10. Občanské právo (10)
11. Rodinné právo (10)
12. Měna a bankovní soustava (10)
13. Daňová soustava (10)
14. Sociální zabezpečení (10)
15. Zaměstnání (10)
16. Podnikání (10)

### Základní geografické informace (60 otázek)
17. Poloha, rozloha a přírodní poměry (10)
18. Příroda a krajina (10)
19. Regiony a místa (10)
20. Ochrana životního prostředí (10)
21. Sociokulturní souvislosti (10)
22. Socioekonomické souvislosti (10)
23. Mezinárodní souvislosti (10)

### Základní historické a kulturní informace (60 otázek)
24. Středověk (10)
25. Novověk (10)
26. Dějiny Československa do roku 1948 (10)
27. Dějiny Československa od roku 1948 do roku 1989 (10)
28. Dějiny Česka od roku 1989 (10)

## Technické detaily

### Ukládání stavu

Stav testu se ukládá do souboru:
```
.claude/skills/test-obcanstvi/state.json
```

Struktura:
```json
{
  "correct": ["1.1", "1.2", "2.3"],
  "incorrect": ["3.1", "4.5"],
  "total_attempts": 45,
  "started_at": "2026-02-02T10:30:00Z",
  "last_updated": "2026-02-02T11:45:00Z"
}
```

### Formát otázek

Každá otázka má jedinečné ID ve formátu `<sekce>.<číslo>`:
- `1.1` = první otázka v sekci 1 (Zvyky a tradice)
- `2.5` = pátá otázka v sekci 2 (Doprava)
- `16.10` = desátá otázka v sekci 16 (Podnikání)

### Algoritmus výběru otázek

1. Vyfiltruje již správně zodpovězené otázky
2. Upřednostní otázky, které byly zodpovězeny špatně (pro upevnění znalostí)
3. Z tohoto seznamu náhodně vybere jednu otázku

## Časté otázky

**Q: Co se stane po zodpovězení všech otázek?**
A: Zobrazí se gratulace a kompletní statistiky. Můžete provést reset a začít znovu.

**Q: Mohu vidět, které otázky jsem zodpověděl špatně?**
A: Momentálně ne, ale špatně zodpovězené otázky se budou opakovat, dokud je nezodpovíte správně.

**Q: Ztratím pokrok, když zavřu terminál?**
A: Ne, stav se ukládá do souboru a přetrvá mezi sezeními.

**Q: Mohu si vybrat konkrétní téma?**
A: V současné verzi se otázky vybírají náhodně ze všech témat. Toto může být přidáno v budoucnu.

**Q: Některé otázky mají obrázky. Jak to funguje?**
A: V databázi jsou otázky s poznámkou "Na obrázku...". Tyto otázky se zobrazí, ale obrázek není dostupný. Můžete odpovědět na základě kontextu nebo je přeskočit.

## Zdroj dat

Databanka testových úloh z českých reálií
- Zdroj: [cestina-pro-cizince.cz](https://cestina-pro-cizince.cz/obcanstvi/databanka-uloh/#test)
- Autor: Národní pedagogický institut České republiky, 2026

## Příspěvky a vylepšení

Máte nápady na vylepšení? Budeme rádi za:
- Možnost filtrovat otázky podle tématu
- Export výsledků do PDF
- Režim "bleskové opakování" (flashcards)
- Časový limit na otázku
- Obtížnostní úrovně

## Licence

Tento skill je open-source a volně dostupný pro použití.
