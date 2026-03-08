---
name: verify-questions
description: >
  Verify that the Czech citizenship test application's question database (questions.json)
  matches the authoritative source document (databanka-otazek-obcanstvi.md). Use this skill
  whenever the user asks to validate, verify, check, or audit the citizenship test questions,
  answers, options, images, or data integrity. Also trigger when the user mentions discrepancies
  between the app and the source, or after importing/updating questions from the source document.
  Trigger on keywords like: ověřit otázky, zkontrolovat odpovědi, validace, porovnat se zdrojem,
  správné odpovědi, chyby v otázkách.
---

# Citizenship Test Question Validator

Validates that `src/assets/data/questions.json` faithfully represents
the source document `databanka-otazek-obcanstvi.md`. Every detail must match — question text,
option text, option order, correct answers, and images.

## Authoritative Source

The original test questions come from the official Czech citizenship test database:
- **Website**: https://cestina-pro-cizince.cz/obcanstvi/databanka-uloh/
- **PDF**: https://cestina-pro-cizince.cz/obcanstvi/wp-content/uploads/2026/01/OBC_databanka_testovychuloh_260105.pdf

The local markdown file `databanka-otazek-obcanstvi.md` is a transcription of this official source.
If there's ever a doubt about the markdown being correct, fetch the PDF or website to verify.

## File Locations (relative to project root)

- **JSON database**: `src/assets/data/questions.json`
- **Source document (local)**: `databanka-otazek-obcanstvi.md`
- **Image files**: `src/assets/images/questions/`

## How the Source Document Works

### Sections
30 sections, each formatted as `### X. SECTION NAME` (e.g., `### 1. ZVYKY A TRADICE`).
Each section contains exactly 10 questions.

### Questions
```
1. Question text (may span multiple lines)?
A) Answer text for option A
B) Answer text for option B
C) Answer text for option C
D) Answer text for option D
```

For image questions, options have just the letter with no text:
```
1. Which image shows X?
A)

B)

C)

D)
```

### Answer Keys
After each section's questions:
```
**SPRÁVNÉ ŘEŠENÍ: 1C, 2C, 3D, 4B, 5A, 6C, 7A, 8B, 9B, 10B**
```

### Image Mapping Tables
Near the end of the file, tables map images to questions:
```
| [filename.jpg](images/filename.jpg) | Úloha X | Description |
```

## How the JSON Works

Array of 300 objects. Each question has:
- `id`: `"{sectionNumber}.{questionNumber}"` (e.g., `"1.1"`)
- `sectionNumber`, `sectionName`, `questionNumber`, `text`
- `options`: array of 4 objects with `letter`, `text`, and optionally `imageUrl`/`imageAlt`
- `correctAnswer`: letter `"A"`, `"B"`, `"C"`, or `"D"`
- Optionally `imageUrl`/`imageAlt` at question level

## Validation Procedure

Read both files fully before starting. Then run these checks systematically.

### Check 1: Question Count
- JSON must contain exactly 300 questions
- 30 sections (sectionNumber 1-30), each with questionNumber 1-10
- No duplicates, no gaps

### Check 2: Section Names
For each section, compare `sectionName` in JSON with the section header in markdown.
Extract the name from `### X. NAME` — the part after the number and dot.

### Check 3: Question Text
For each question, compare `text` in JSON with the question text in markdown.
Markdown questions may span multiple lines — join them with a space before comparing.
Normalize whitespace but content must match exactly.

### Check 4: Option Text and Order (CRITICAL)
For each question with text options:
- Verify options A, B, C, D exist in this exact order
- Verify each option's `text` matches the corresponding letter's text in the markdown
- A swapped option means `correctAnswer` letter points to wrong content — this is a silent bug

For image questions (markdown shows just `A)` with no text):
- Verify JSON options have `text: ""`
- Cannot verify option content from markdown alone — see Check 6 for image validation

### Check 5: Correct Answers (CRITICAL)
Parse each section's `**SPRÁVNÉ ŘEŠENÍ: ...**` line.
Format: `1C, 2B, 3A, ...` where number = question number, letter = correct answer.
For every question, verify `correctAnswer` in JSON matches the source answer key.

### Check 6: Image Verification
From the image mapping tables in the markdown:
- Verify referenced images have corresponding `imageUrl` fields in JSON
- Verify each image file exists on disk in the images directory
- For image-option questions, verify `correctAnswer` points to the option whose `imageAlt`
  matches what the question asks about (e.g., question asks "which is Masaryk?" →
  correctAnswer must point to option with imageAlt containing "Masaryk")

**Verifying image file integrity:**
- Use `file` command (e.g., `file image.jpg`) to confirm the file is a valid image (JPEG/PNG/SVG).
  If it returns "HTML document text", the file is corrupt — it's an error page that was saved instead of the real image.
- If a file is corrupt or missing, check the source website for the correct image:
  https://cestina-pro-cizince.cz/obcanstvi/databanka-uloh/
  The source shows the actual images used in the test — match these visually.

**How to fix a corrupt or wrong image:**
1. Identify the correct image by looking at the source website for that question
2. Search Wikimedia Commons API for a matching image:
   `curl -s "https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=KEYWORD&srnamespace=6&srlimit=10&format=json"`
3. When multiple candidates exist, get URLs for all of them:
   `curl -s "https://commons.wikimedia.org/w/api.php?action=query&titles=File:FILENAME&prop=imageinfo&iiprop=url&format=json"`
4. Download thumbnails of all candidates to compare:
   `curl -sL "URL_TO_THUMBNAIL" -o /tmp/candidate_N.jpg`
5. Use the Read tool to visually inspect each candidate and compare with the source website.
   Download ALL variants before deciding — sometimes image series (e.g. -00, -01, -02) differ significantly.
6. Download the best matching full-resolution image to /tmp first:
   `curl -L "URL" -o /tmp/best_candidate.jpg`
7. **Crop if needed** — the Wikimedia image may include extra sky/foreground not present in the source.
   Use macOS `sips` to crop (it crops from the center):
   `sips --cropToHeightWidth HEIGHT WIDTH /tmp/best_candidate.jpg --out /tmp/cropped.jpg`
   Then use the Read tool to visually verify the crop matches the source framing.
   Iterate the crop dimensions until the composition closely matches the source.
8. Copy the final image to the assets directory:
   `cp /tmp/cropped.jpg "/path/to/images/NewFilename.jpg"`
9. Verify it's a valid image: `file "/path/to/images/NewFilename.jpg"`
10. Update `imageUrl` in questions.json to the new filename if changed
11. Delete the old corrupt file

**Important**: Always visually compare using the Read tool at each step — thumbnail, crop, final.
The goal is to match the source website's framing as closely as possible, not just find any photo of the subject.

### Check 7: ID Consistency
Each `id` must equal `"{sectionNumber}.{questionNumber}"` and be unique across all 300 questions.

## Output Format

```
## Validation Results

Total questions checked: 300/300
Sections checked: 30/30

### Issues Found: X

1. **[Section X, Q Y]** - Brief description
   - Expected: ...
   - Found: ...

2. ...

### Checklist
- [x] Question count (300)
- [x] Section names
- [x] Question text
- [x] Option text and order
- [x] Correct answers
- [x] Images
- [x] ID consistency
```

If everything passes, confirm all 300 questions validated successfully.

## Common Pitfalls Found in Past Validations

These are real bugs we've caught before — pay extra attention to these patterns:

1. **Swapped options**: Options B and D swapped between source and JSON. The correctAnswer
   letter matched the answer key, but pointed to wrong content. Always compare option TEXT
   not just the letter.

2. **Wrong correctAnswer on image questions**: correctAnswer pointed to wrong image because
   the person verifying couldn't see images in the markdown. Use `imageAlt` to verify which
   option shows the right image.

3. **Off-by-one in answer key**: correctAnswer "A" when source says "C" — a parsing error
   during initial data import.
