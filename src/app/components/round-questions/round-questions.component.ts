import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Vocabulary } from 'src/app/models/vocabulary';

/*
 * Verwendung: round Seite
 * Funktionalität: Dieses Komponente zeigt eine Fragenrunde an.
 *              Es zeigt immer die erste Frage an und gibt die Möglichkeit, eine Antwort einzugeben.
 *             Es bietet auch die Möglichkeit, die Antwort zu überprüfen und zur nächsten Frage zu wechseln.
 *           Die Fragen können in beiden Sprachen gestellt werden und die Antworten können in beiden Sprachen eingegeben werden.
 * Schnittstellen:
 *    @Input useFirstLanguage: boolean[] - Array, das angibt, ob die Frage in der ersten Sprache gestellt wird
 *    @Input vocabulary: Vocabulary[] - Array mit den Vokabeln, die für die Fragenrunde verwendet werden
*/

// Innere Schnittstelle zur Darstellung einer Frage
interface Question {
  question: string;
  answer: string;
  vocabulary: Vocabulary;
}

@Component({
  selector: 'app-round-questions',
  templateUrl: './round-questions.component.html',
  styleUrls: ['./round-questions.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class RoundQuestionsComponent {
  // ViewChildren Dekorator für die Referenz auf die Fragekarten
  @ViewChildren('questionCard', { read: ElementRef }) questionCards!: QueryList<ElementRef>;
  // Attribute für die Fragenrunde
  currentAnswer: string = '';
  questions: Question[] = [];

  constructor(private cdr: ChangeDetectorRef) { }

  // Funktion zum Erstellen der Fragen aus dem Vokabel-Array
  // -> erstellt eine Frage für jede Vokabel
  createQuestions(vocabulary: Vocabulary[], useFirstLanguage: boolean[]) {
    vocabulary.forEach((vocabulary, index) => {
      this.questions.push({
        question: useFirstLanguage[index] ? vocabulary.term : vocabulary.translation,
        answer: useFirstLanguage[index] ? vocabulary.translation : vocabulary.term,
        vocabulary: vocabulary
      });
    });
    this.cdr.detectChanges();
  }

  // Funktion zum Anzeigen der nächsten Frage -> fügt der ersten Fragekarte die Klasse 'show' hinzu
  showNextQuestion() {
    this.cdr.detectChanges();
    this.questionCards.get(0)!.nativeElement.classList.add('show');
  }
  
  // Funktion zum Anzeigen der nächsten Frage 
  nextQuestion() {
    this.questionCards.get(0)!.nativeElement.classList.remove('show'); // -> entfernt die Klasse 'show' von der ersten Fragekarte
    this.currentAnswer = ''; // -> setzt die aktuelle Antwort zurück
    this.questions.shift(); // -> entfernt die erste Frage aus dem Fragen-Array
    this.questionCards.reset(this.questionCards.toArray().slice(1)); // -> entfernt die erste Fragekarte aus der Fragekarten-Liste
    setTimeout(() => this.showNextQuestion()); // -> zeigt die nächste Frage nach einer kurzen Verzögerung an
  }

  // Funktion zum Überprüfen der Antwort auf die Frage -> dient als Wrapper für die Funktion correctAnswer
  confirmAnswer() {
    return this.correctAnswer(this.questions[0].question, this.currentAnswer, this.questions[0].vocabulary);
  }

  // Funktion zum Überprüfen der Antwort auf die Frage -> gibt true zurück, wenn die Antwort korrekt ist
  correctAnswer(question: String, answer: String, vocabulary: Vocabulary) {
    if(question === vocabulary.term && // Frage ist in der ersten Sprache
        answer.trim().toLowerCase() === vocabulary.translation.trim().toLowerCase() // Antwort stimmt mit der Übersetzung überein
        ) return true;
    else if(question === vocabulary.translation && // Frage ist in der zweiten Sprache
            answer.trim().toLowerCase() === vocabulary.term.trim().toLowerCase() // Antwort stimmt mit dem Wort überein
        ) return true;
    else return false;
  }
}
