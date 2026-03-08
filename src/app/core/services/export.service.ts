import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Statistics } from '../models/statistics.model';
import { AnsweredQuestion } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToPDF(statistics: Statistics, answeredQuestions: AnsweredQuestion[]): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Test Českého Občanství - Statistiky', 14, 20);

    doc.setFontSize(12);
    doc.text(`Datum: ${new Date().toLocaleDateString('cs-CZ')}`, 14, 30);

    doc.setFontSize(14);
    doc.text('Celkové Statistiky', 14, 45);

    const overviewData = [
      ['Celkem otázek', statistics.totalQuestions.toString()],
      ['Zodpovězeno', statistics.answeredQuestions.toString()],
      ['Správně', statistics.correctAnswers.toString()],
      ['Špatně', statistics.incorrectAnswers.toString()],
      ['Úspěšnost', `${statistics.successRate.toFixed(1)}%`],
      ['Průměrný čas', `${statistics.averageTimePerQuestion.toFixed(1)}s`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Metrika', 'Hodnota']],
      body: overviewData,
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;

    doc.setFontSize(14);
    doc.text('Statistiky po Sekcích', 14, finalY + 15);

    const sectionData = statistics.sectionStats.map(section => [
      `${section.sectionNumber}. ${section.sectionName}`,
      section.answeredQuestions.toString(),
      section.correctAnswers.toString(),
      section.incorrectAnswers.toString(),
      `${section.successRate.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Sekce', 'Zodpovězeno', 'Správně', 'Špatně', 'Úspěšnost']],
      body: sectionData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const filename = `test-obcanstvi-${Date.now()}.pdf`;
    doc.save(filename);
  }

  exportToCSV(answeredQuestions: AnsweredQuestion[]): void {
    const headers = [
      'ID Otázky',
      'Vaše odpověď',
      'Správná odpověď',
      'Výsledek',
      'Čas (s)',
      'Datum',
    ];

    const rows = answeredQuestions.map(q => [
      q.questionId,
      q.userAnswer,
      q.correctAnswer,
      q.isCorrect ? 'Správně' : 'Špatně',
      q.timeSpentSeconds.toString(),
      new Date(q.answeredAt).toLocaleString('cs-CZ'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `test-obcanstvi-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
