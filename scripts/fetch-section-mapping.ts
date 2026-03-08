/**
 * Script to fetch and analyze all sections from Czech citizenship test website
 * Creates comprehensive mapping of questions and their image types
 */

interface SectionImageData {
  sectionNumber: number;
  sectionName: string;
  questions: QuestionImageInfo[];
}

interface QuestionImageInfo {
  questionNumber: number;
  questionId: string;
  imageType: 'none' | 'question_image' | 'option_images' | 'both';
  description: string;
}

interface SectionMapping {
  totalSections: number;
  sections: SectionImageData[];
  summary: {
    totalQuestions: number;
    questionsWithImages: number;
    questionsWithQuestionImage: number;
    questionsWithOptionImages: number;
    sectionsWithImages: number;
  };
}

// Manual data collection from website analysis
// This will be populated by fetching each section
const sectionMappingData: SectionMapping = {
  totalSections: 30,
  sections: [],
  summary: {
    totalQuestions: 0,
    questionsWithImages: 0,
    questionsWithQuestionImage: 0,
    questionsWithOptionImages: 0,
    sectionsWithImages: 0
  }
};

// Section names from the website
const sectionNames = [
  "ZVYKY A TRADICE",
  "DOPRAVA",
  "ZDRAVOTNÍ A ZÁCHRANNÝ SYSTÉM",
  "VZDĚLÁVÁNÍ",
  "POLITICKÝ SYSTÉM",
  "ZÁKONODÁRNÁ A VÝKONNÁ MOC",
  "SOUDNÍ MOC A OCHRANA OBČANŮ",
  "VOLBY",
  "ZÁKLADNÍ PRÁVNÍ POJMY, SPRÁVNÍ A TRESTNÍ PRÁVO",
  "OBČANSKÉ PRÁVO",
  "RODINNÉ PRÁVO",
  "MĚNA A BANKOVNÍ SOUSTAVA",
  "DAŇOVÁ SOUSTAVA",
  "SOCIÁLNÍ ZABEZPEČENÍ",
  "ZAMĚSTNÁNÍ",
  "PODNIKÁNÍ",
  "POLOHA, ROZLOHA A PŘÍRODNÍ POMĚRY",
  "PŘÍRODA A KRAJINA",
  "REGIONY A MÍSTA",
  "OCHRANA ŽIVOTNÍHO PROSTŘEDÍ",
  "SOCIOKULTURNÍ SOUVISLOSTI",
  "VZNIK ČESKÉHO STÁTU",
  "MEZINÁRODNÍ SOUVISLOSTI DĚJIN ČESKÝCH ZEMÍ",
  "STŘEDOVĚK",
  "NOVOVĚK",
  "19. A PRVNÍ POLOVINA 20. STOLETÍ",
  "VZNIK A VÝVOJ ČESKOSLOVENSKA",
  "VZNIK A VÝVOJ ČESKÉ REPUBLIKY",
  "LITERATURA",
  "UMĚNÍ"
];

console.log('Section names loaded:', sectionNames.length);
console.log('This script provides the structure for section mapping.');
console.log('Data will be collected via web scraping and manual analysis.');
