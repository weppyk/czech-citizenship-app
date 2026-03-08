# Příklady použití skillu Test Občanství

## Příklad 1: První spuštění

```
👤 Uživatel: /test-obcanstvi

🤖 Claude:
📊 Stav testu: 0/219 otázek správně zodpovězeno (0%)

📝 Otázka 8.4 (VOLBY)
Pan Svoboda se stal krajským zastupitelem. Krajští zastupitelé zvolili pana
Svobodu nejvyšším představitelem kraje. Kterou funkci teď vykonává pan Svoboda?

A) Senátor.
B) Poslanec.
C) Hejtman.
D) Primátor.

Vaše odpověď (A/B/C/D):

👤 Uživatel: C

🤖 Claude:
✅ SPRÁVNĚ!

Správná odpověď: C) Hejtman.

📊 Pokrok: 1/219 otázek (0.5%)
   Správně: 1 | Špatně: 0 | Úspěšnost: 100%

───────────────────────────────────────────────────

📝 Otázka 3.6 (ZDRAVOTNÍ A ZÁCHRANNÝ SYSTÉM)
Které telefonní číslo má jednotný záchranný systém (hasiči, policie,
zdravotnická záchranná služba) ve všech státech Evropské unie?

A) 112.
B) 150.
C) 911.
D) 999.

Vaše odpověď (A/B/C/D):
```

## Příklad 2: Špatná odpověď

```
👤 Uživatel: B

🤖 Claude:
❌ ŠPATNĚ!

Vaše odpověď: B) 150.
Správná odpověď: A) 112.

📊 Pokrok: 1/219 otázek (0.5%)
   Správně: 1 | Špatně: 1 | Úspěšnost: 50%

⚠️  Tato otázka se bude opakovat, dokud ji nezodpovíte správně.

───────────────────────────────────────────────────

📝 Otázka 15.3 (ZAMĚSTNÁNÍ)
Který z těchto údajů musí být podle zákona v každém případě v pracovní smlouvě?

A) Pracovní doba.
B) Počet dnů dovolené.
C) Místo výkonu práce.
D) Termín výplaty mzdy.

Vaše odpověď (A/B/C/D):
```

## Příklad 3: Zobrazení statistik

```
👤 Uživatel: /test-obcanstvi stats

🤖 Claude:
📊 STATISTIKY
==================================================
Celkem otázek:           219
Správně zodpovězeno:     15 (6.8%)
Špatně zodpovězeno:      3
Zbývá zodpovědět:        204
Celkem pokusů:           18
Úspěšnost:               83.3%

Zahájeno:                2026-02-02 10:30:00
Poslední aktualizace:    2026-02-02 11:45:23
```

## Příklad 4: Reset testu

```
👤 Uživatel: /test-obcanstvi reset

🤖 Claude:
⚠️  VAROVÁNÍ: Toto smaže veškerý váš pokrok!

Jste si jisti, že chcete resetovat test? (ano/ne):

👤 Uživatel: ano

🤖 Claude:
✅ Stav testu byl resetován.
Celkem otázek: 219

Můžete začít znovu pomocí: /test-obcanstvi
```

## Příklad 5: Dokončení všech otázek

```
👤 Uživatel: D

🤖 Claude:
✅ SPRÁVNĚ!

Správná odpověď: D) Rozsudkem.

📊 Pokrok: 219/219 otázek (100%)
   Správně: 219 | Špatně: 0 | Úspěšnost: 100%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 GRATULUJEME! 🎉

Úspěšně jste zodpověděli všechny otázky z databáze českého občanství!

📊 FINÁLNÍ STATISTIKY
==================================================
Celkem otázek:           219
Správně zodpovězeno:     219 (100%)
Celkem pokusů:           245
Úspěšnost:               89.4%
Doba testování:          2 hodiny 15 minut

Skvělá práce! Můžete provést reset a procvičit si otázky znovu:
/test-obcanstvi reset
```

## Příklad 6: Pokračování po přerušení

```
👤 Uživatel: /test-obcanstvi

🤖 Claude:
👋 Vítejte zpět!

📊 Váš pokrok: 45/219 otázek (20.5%)
   Správně: 45 | Špatně: 8 | Úspěšnost: 84.9%

Poslední aktivita: 2026-02-01 18:30:00

Pokračujeme v testu...

───────────────────────────────────────────────────

📝 Otázka 12.7 (MĚNA A BANKOVNÍ SOUSTAVA)
Paní Svobodová si kupuje nové auto za 650 000 korun. Chce zaplatit v hotovosti,
ale prodejce nemůže podle zákona tak velkou peněžní částku přijmout.
Jakou maximální částku v hotovosti může prodejce přijmout?

A) 100 000 Kč.
B) 270 000 Kč.
C) 400 000 Kč.
D) 470 000 Kč.

Vaše odpověď (A/B/C/D):
```

## Příklad 7: Prioritizace špatně zodpovězených otázek

```
👤 Uživatel: /test-obcanstvi

🤖 Claude:
📊 Pokrok: 50/219 otázek (22.8%)
   Špatně zodpovězené: 5 otázek čekají na opakování

⚠️  Nyní se zaměříme na otázky, které jste zodpověděli špatně.

───────────────────────────────────────────────────

📝 Otázka 3.6 (ZDRAVOTNÍ A ZÁCHRANNÝ SYSTÉM) - OPAKOVÁNÍ
Které telefonní číslo má jednotný záchranný systém?

A) 112.
B) 150.
C) 911.
D) 999.

💡 Tuto otázku jste zodpověděli špatně. Zkuste to znovu!

Vaše odpověď (A/B/C/D):
```

## Tipy pro efektivní učení

1. **Pravidelné krátké session**: Raději 15 minut denně než 2 hodiny najednou
2. **Opakování špatných odpovědí**: Skill automaticky upřednostňuje otázky, které jste zodpověděli špatně
3. **Sledujte pokrok**: Pravidelně kontrolujte statistiky pomocí `/test-obcanstvi stats`
4. **Nezkoušejte hádání**: Pokud nevíte, zkuste si odpověď nejdřív nastudovat
5. **Reset po dokončení**: Po úspěšném dokončení udělejte reset a zkuste dosáhnout 100% úspěšnosti
