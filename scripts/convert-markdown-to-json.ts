import * as fs from 'fs';
import * as path from 'path';

interface QuestionOption {
  letter: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface Question {
  id: string;
  sectionNumber: number;
  sectionName: string;
  questionNumber: number;
  text: string;
  options: QuestionOption[];
  correctAnswer: string;
  imageUrl?: string;
  imageAlt?: string;
}

const IMAGE_MAPPINGS: Record<string, { imageUrl: string; imageAlt: string }> = {
  // Sekce 5 - Politický systém (pouze 5.10 má obrázek v otázce, 5.1 má obrázky u alternativ)
  '5.10': { imageUrl: 'Small_coat_of_arms_of_the_Czech_Republic.svg', imageAlt: 'Malý státní znak České republiky' },

  // Sekce 12 - Měna a bankovní soustava
  '12.2': { imageUrl: 'Bozena_Nemcova_500_CZK.jpg', imageAlt: 'Bankovka s Boženou Němcovou' },
  '12.4': { imageUrl: '100_Czech_koruna_Obverse.jpg', imageAlt: 'Stokorunová bankovka s Karlem IV.' },

  // Sekce 18 - Příroda a krajina
  '18.4': { imageUrl: 'Mapa_Jizerskohorske_buciny_UNESCO.jpg', imageAlt: 'Mapa s označením Jizerskohorských bučin' },
  '18.6': { imageUrl: 'Ctiněves-a-Říp2017.jpg', imageAlt: 'Hora Říp' },
  '18.7': { imageUrl: 'Mapa_Krusnohorska_hornacka_krajina_UNESCO.jpg', imageAlt: 'Mapa s označením Krušnohoří' },

  // Sekce 19 - Regiony a místa
  '19.3': { imageUrl: 'Sloup_Nejsvětější_Trojice,_Olomouc.jpg', imageAlt: 'Sloup Nejsvětější Trojice v Olomouci' },

  // Sekce 20 - Ochrana životního prostředí
  '20.1': { imageUrl: 'Mapa_Luhacovice.jpg', imageAlt: 'Mapa s označením Luhačovic' },
  '20.4': { imageUrl: 'Mapa_Sumava_Cerne_Certovo_jezero.jpg', imageAlt: 'Mapa s označením Šumavy' },

  // Sekce 23 - Mezinárodní souvislosti (pouze 23.10)
  '23.10': { imageUrl: 'Flag_of_Europe.svg', imageAlt: 'Vlajka Evropské unie' },

  // Sekce 24 - Středověk
  '24.7': { imageUrl: 'Husitská_korouhev.svg', imageAlt: 'Husitský kalich' },

  // Sekce 25 - Novověk (pouze otázky s "(na obrázku)" v textu)
  '25.10': { imageUrl: 'Pomník_MarieTerezie,_Praha-Hradčany.jpg', imageAlt: 'Pomník Marie Terezie v Praze' },

  // Sekce 30 - Umění (pouze otázky 6, 8, 10 mají jeden obrázek; otázky 1-5, 9 mají obrázky u alternativ)
  '30.6': { imageUrl: 'KLG_4953_CZ_-_Žďár_nad_Sázavou,_Wallfahrtskirche_Zelená_Hora.jpg', imageAlt: 'Poutní kostel sv. Jana Nepomuckého na Zelené hoře' },
  '30.7': { imageUrl: 'Národní_památník_na_Vítkově_(05).jpg', imageAlt: 'Socha Jana Žižky na Vítkově' },
  '30.8': { imageUrl: 'Tugendhat_Villa_in_Brno.jpg', imageAlt: 'Vila Tugendhat v Brně' },
  '30.10': { imageUrl: 'Praha_2005-09-19_Main_Station-00.jpg', imageAlt: 'Hlavní nádraží v Praze' },
};

// Mappings for questions where each option has an image
const OPTION_IMAGE_MAPPINGS: Record<string, Record<string, { imageUrl: string; imageAlt: string }>> = {
  '5.1': {
    'A': { imageUrl: 'Small_coat_of_arms_of_the_Czech_Republic.svg', imageAlt: 'Malý státní znak ČR' },
    'B': { imageUrl: 'Flag_of_the_president_of_the_Czech_Republic.svg', imageAlt: 'Vlajka prezidenta ČR' },
    'C': { imageUrl: 'Flag_of_the_Czech_Republic.svg', imageAlt: 'Vlajka České republiky' },
    'D': { imageUrl: 'Coat_of_arms_of_the_Czech_Republic.svg', imageAlt: 'Velký státní znak ČR' },
  },
  '30.1': {
    'A': { imageUrl: 'Praha_1,_Staroměstské_náměstí_605-13_20170809_002.jpg', imageAlt: 'Budova na Staroměstském náměstí' },
    'B': { imageUrl: 'Jurkovičova_vila.jpg', imageAlt: 'Jurkovičova vila' },
    'C': { imageUrl: 'Tančící_dům,_Prague_01.jpg', imageAlt: 'Tančící dům' },
    'D': { imageUrl: 'Dům_U_černé_Matky_Boží_02.JPG', imageAlt: 'Dům U Černé Matky Boží' },
  },
  '30.2': {
    'A': { imageUrl: 'Povodně_v_Praze,_33.jpg', imageAlt: 'Budova v Praze' },
    'B': { imageUrl: 'Brno-Špilberk_2.jpg', imageAlt: 'Hrad Špilberk v Brně' },
    'C': { imageUrl: 'Český_Krumlov,_zámek_Český_Krumlov.JPG', imageAlt: 'Zámek Český Krumlov' },
    'D': { imageUrl: 'Český_Šternberk,_zámek_01.jpg', imageAlt: 'Zámek Český Šternberk' },
  },
  '30.3': {
    'A': { imageUrl: 'Rudolfinum_Prague.jpg', imageAlt: 'Rudolfinum' },
    'B': { imageUrl: 'Praha_2005-0920_národní_divadlo.jpg', imageAlt: 'Národní divadlo' },
    'C': { imageUrl: 'Prag_obecni_dûm_gemeindehaus.jpg', imageAlt: 'Obecní dům' },
    'D': { imageUrl: 'Czech_National_Museum.jpg', imageAlt: 'Národní muzeum' },
  },
  '30.4': {
    'A': { imageUrl: 'Hrad_Křivoklát_(Křivoklát).JPG', imageAlt: 'Hrad Křivoklát' },
    'B': { imageUrl: 'Loket0809.JPG', imageAlt: 'Hrad Loket' },
    'C': { imageUrl: 'Hrad_Karlštejn_06.jpg', imageAlt: 'Hrad Karlštejn' },
    'D': { imageUrl: 'Hrad_Bouzov_(Bouzov),_Bouzov.JPG', imageAlt: 'Hrad Bouzov' },
  },
  '30.5': {
    'A': { imageUrl: 'Jested_002.JPG', imageAlt: 'Ještěd' },
    'B': { imageUrl: 'PetrinObservationTower.jpg', imageAlt: 'Petřínská rozhledna' },
    'C': { imageUrl: 'Hoher_Schneeberg_CZ_Turm.jpg', imageAlt: 'Rozhledna na Děčínském Sněžníku' },
    'D': { imageUrl: 'Lednice,_minaret_(02).jpg', imageAlt: 'Minaret v Lednici' },
  },
  '30.9': {
    'A': { imageUrl: 'Olomoucky_Orloj.jpg', imageAlt: 'Olomoucký orloj' },
    'B': { imageUrl: 'Praha,_Jindřišská,_věž.jpg', imageAlt: 'Jindřišská věž' },
    'C': { imageUrl: 'Prazsky_orloj_celkovy_pohled.jpg', imageAlt: 'Pražský orloj' },
    'D': { imageUrl: 'Žatec,_Chmelový_orloj.jpg', imageAlt: 'Chmelový orloj v Žatci' },
  },
};

function parseCorrectAnswers(answerLine: string): Map<number, string> {
  const answers = new Map<number, string>();
  // Format: "**SPRÁVNÉ ŘEŠENÍ: 1C, 2C, 3D, 4B, 5A, 6C, 7A, 8B, 9B, 10B**"
  const match = answerLine.match(/SPRÁVNÉ ŘEŠENÍ:\s*(.+)\*\*/);
  if (match) {
    const parts = match[1].split(',').map(s => s.trim());
    for (const part of parts) {
      const m = part.match(/(\d+)([A-D])/);
      if (m) {
        answers.set(parseInt(m[1]), m[2]);
      }
    }
  }
  return answers;
}

function parseMarkdownToJson(markdownPath: string, outputPath: string): void {
  const content = fs.readFileSync(markdownPath, 'utf-8');
  const lines = content.split('\n');

  const allQuestions: Question[] = [];
  let currentSection = '';
  let currentSectionNumber = 0;
  let sectionQuestions: Array<{
    questionNumber: number;
    text: string;
    options: QuestionOption[];
  }> = [];

  let currentQuestion: { questionNumber: number; text: string } | null = null;
  let currentOptions: QuestionOption[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse section header
    const sectionMatch = line.match(/^###\s+(\d+)\.\s+(.+)$/);
    if (sectionMatch) {
      // Save previous section if exists
      if (sectionQuestions.length > 0 && currentSectionNumber > 0) {
        // This shouldn't happen as we process on answer line
      }

      currentSectionNumber = parseInt(sectionMatch[1]);
      currentSection = sectionMatch[2];
      sectionQuestions = [];
      continue;
    }

    // Parse answer key - this is when we finalize the section
    if (line.includes('SPRÁVNÉ ŘEŠENÍ:')) {
      // Save current question if exists
      if (currentQuestion && currentOptions.length > 0) {
        sectionQuestions.push({
          questionNumber: currentQuestion.questionNumber,
          text: currentQuestion.text,
          options: currentOptions,
        });
      }

      // Parse answers
      const correctAnswers = parseCorrectAnswers(line);

      // Create Question objects with correct answers
      for (const sq of sectionQuestions) {
        const questionId = `${currentSectionNumber}.${sq.questionNumber}`;
        const correctAnswer = correctAnswers.get(sq.questionNumber) || 'A';

        const fullQuestion: Question = {
          id: questionId,
          sectionNumber: currentSectionNumber,
          sectionName: currentSection,
          questionNumber: sq.questionNumber,
          text: sq.text,
          options: sq.options,
          correctAnswer: correctAnswer,
        };

        // Add image if mapped (but skip 25.5 and 25.10 as they have duplicates)
        if (IMAGE_MAPPINGS[questionId] && questionId !== '25.5' && questionId !== '25.10') {
          fullQuestion.imageUrl = IMAGE_MAPPINGS[questionId].imageUrl;
          fullQuestion.imageAlt = IMAGE_MAPPINGS[questionId].imageAlt;
        }

        // Special handling for section 25.5 - only the sametova revoluce question has an image
        if (questionId === '25.5' && sq.text.includes('Památník na obrázku')) {
          fullQuestion.imageUrl = 'Národní_památník_na_Vítkově_(05).jpg';
          fullQuestion.imageAlt = 'Národní památník na Vítkově';
        }

        // Special handling for section 25.10 - only the Marie Terezie question has an image
        if (questionId === '25.10' && sq.text.includes('panovnice byla z rodu Habsburků')) {
          fullQuestion.imageUrl = 'Pomník_MarieTerezie,_Praha-Hradčany.jpg';
          fullQuestion.imageAlt = 'Pomník Marie Terezie v Praze';
        }

        // Add images to options if mapped
        if (OPTION_IMAGE_MAPPINGS[questionId]) {
          fullQuestion.options = fullQuestion.options.map(opt => ({
            ...opt,
            imageUrl: OPTION_IMAGE_MAPPINGS[questionId][opt.letter]?.imageUrl,
            imageAlt: OPTION_IMAGE_MAPPINGS[questionId][opt.letter]?.imageAlt,
          }));
        }

        allQuestions.push(fullQuestion);
      }

      // Reset for next section
      sectionQuestions = [];
      currentQuestion = null;
      currentOptions = [];
      continue;
    }

    // Parse question number and text
    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (questionMatch && currentSection) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length > 0) {
        sectionQuestions.push({
          questionNumber: currentQuestion.questionNumber,
          text: currentQuestion.text,
          options: currentOptions,
        });
      }

      // Start new question
      const qNum = parseInt(questionMatch[1]);
      currentQuestion = {
        questionNumber: qNum,
        text: questionMatch[2],
      };
      currentOptions = [];
      continue;
    }

    // Append to question text if it continues on next line
    if (currentQuestion && !line.match(/^[A-D]\)/) && line.length > 0 && !line.startsWith('**')) {
      currentQuestion.text += ' ' + line;
      continue;
    }

    // Parse options (text is optional for questions with images in options)
    const optionMatch = line.match(/^([A-D])\)\s*(.*)$/);
    if (optionMatch && currentQuestion) {
      currentOptions.push({
        letter: optionMatch[1],
        text: optionMatch[2] || '',
      });
    }
  }

  // Write output
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf-8');

  console.log(`✅ Successfully converted ${allQuestions.length} questions`);
  console.log(`📁 Output written to: ${outputPath}`);

  // Verify sections
  const sections = new Set(allQuestions.map(q => q.sectionNumber));
  console.log(`📊 Sections: ${sections.size}`);

  // Verify images
  const questionsWithImages = allQuestions.filter(q => q.imageUrl);
  console.log(`🖼️  Questions with images: ${questionsWithImages.length}`);

  // Verify first section answers
  const section1 = allQuestions.filter(q => q.sectionNumber === 1).slice(0, 10);
  console.log('\n📝 First 10 answers from Section 1:');
  section1.forEach(q => {
    console.log(`  ${q.id}: ${q.correctAnswer}`);
  });
}

// Main execution
const markdownPath = '/Users/radekdrlik/_my_projects/my-home-claude/databanka-otazek-obcanstvi.md';
const outputPath = path.join(__dirname, '..', 'src', 'assets', 'data', 'questions.json');

parseMarkdownToJson(markdownPath, outputPath);
