import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { RoundQuestionsComponent } from 'src/app/components/round-questions/round-questions.component';
import { Course } from 'src/app/models/course';
import { Vocabulary } from 'src/app/models/vocabulary';
import { DBVocabularyService } from 'src/app/services/db/db-vocabulary.service';

/*
 * Funktionalität: Diese Seite stellt die Runde eines Kurses dar. 
 *                Die Vokabeln der Runde werden in einem Stack verwaltet (roundStack).
 *               Die Sprachrichtungen der Vokabelfragen werden in einem Array verwaltet (useFirstLanguage).
 *              Die Vokabeln, die falsch beantwortet wurden, werden in einem Stack verwaltet (failedStack).
 *             Die Vokabeln, die richtig beantwortet wurden, werden in einem Stack verwaltet (successStack).
 *            Die Vokabeln der Runde werden aus dem Pot-Stack des Kurses entfernt, wenn sie beantwortet wurden.
 *           Wenn der Pot-Stack leer ist, wird zur Kurs-Seite navigiert und die Runde beendet.
 *          Die Vokabelfragen der Runde werden in der Komponente "round-questions" dargestellt.
 *         Die Komponente "round-stacks" stellt failedStack und successStack als Karten dar.
 *        Der Kurs wird aktualisiert, wenn eine Vokabel beantwortet wurde, um den aktuellen Stand zu speichern,
 *        dabei wird die Vokabel dem Success-Stack oder dem Failed-Stack des Kurses hinzugefügt.
 * Komponenten: round-questions, round-stacks
 * Services: CourseService
 * Routen: course Seite
 */

@Component({
  selector: 'app-round',
  templateUrl: './round.page.html',
  styleUrls: ['./round.page.scss'],
})
export class RoundPage implements OnInit, AfterViewInit {
  @ViewChild('questionRef', { static: false }) questionRef!: RoundQuestionsComponent; // Referenz auf die Fragen-Komponente

  roundStack: Vocabulary[] = [];  // Stack für die Vokabeln der Runde
  useFirstLanguage: boolean[] = []; // Array für die Sprachrichtung der Vokabelfragen

  failedStack: Vocabulary[] = []; // Stack für die Vokabeln, die falsch beantwortet wurden
  successStack: Vocabulary[] = []; // Stack für die Vokabeln, die richtig beantwortet wurden
  course!: Course;

  constructor(private router: Router, private dbVocabularyService: DBVocabularyService, private platform: Platform) {
    this.platform.backButton.subscribe(() => this.onNavigateToCourse());
   }

  ngOnInit() {   // Initialisierung der Vokabeln der Runde und der Sprachrichtung
    this.course = history.state.course;
  }

  ngAfterViewInit(): void {
    this.dbVocabularyService.getVocabularyForRound(this.course.failed_stack_id, this.course.pot_stack_id, history.state.numberOfVocabulary)
    .then(vocabularies => {
      this.roundStack = vocabularies
      // Sprachrichtung wird zufällig gewählt, wenn beide Sprachen aktiviert sind
      if(this.course.use_source_language > 0 && this.course.use_target_language > 0) this.useFirstLanguage = this.roundStack.map(() => Math.random() < 0.5);
      else if(this.course.use_source_language > 0) this.useFirstLanguage = this.roundStack.map(() => true);
      else this.useFirstLanguage = this.roundStack.map(() => false);
      this.questionRef.createQuestions(this.roundStack, this.useFirstLanguage); // -> Die Fragen werden erstellt
      this.questionRef.showNextQuestion(); // -> Die erste Frage wird angezeigt
    });
  }

  onNavigateToCourse(){   // Navigieren zur Kurs-Seite und Speichern der Änderungen des Kurses
    this.router.navigate(['/course'], { state: { course: this.course }, replaceUrl: true });
  }

  onNext() {  // Funktion für den Button "Next"
    this.addToFailedStack();  // -> Die Vokabel wird in den failedStack verschoben
  }

  onConfirm() {   // Funktion für den Button "Confirm"
    let correct: boolean = this.questionRef.confirmAnswer(); // -> Die Antwort wird überprüft
    if(correct) this.addToSuccessStack();   // -> Wenn die Antwort korrekt ist, wird die Vokabel in den successStack verschoben
    else this.addToFailedStack();    // -> Wenn die Antwort falsch ist, wird die Vokabel in den failedStack verschoben
  }

  addToSuccessStack() {   // Die Vokabel wird dem Success-Stack hinzugefügt
    this.dbVocabularyService.updateStackId(this.roundStack[0].id!, this.course.success_stack_id)
      .then(() => {
        this.successStack.push(this.roundStack[0]); // -> Die Vokabel wird dem Success-Stack hinzugefügt
        this.updateStatus(); // -> Der Kurs wird aktualisiert
      });
  }

  addToFailedStack() { // Die Vokabel wird dem Failed-Stack hinzugefügt
    this.dbVocabularyService.updateStackId(this.roundStack[0].id!, this.course.failed_stack_id) 
      .then(() => {
        this.failedStack.push(this.roundStack[0]); // -> Die Vokabel wird dem Failed-Stack hinzugefügt
        this.updateStatus();  // -> Der Status wird aktualisiert
      });
  }

  updateStatus() {   // Der Status der Runde wird aktualisiert
    this.roundStack.shift(); // -> Die Vokabel wird aus dem Stack der Runde entfernt
    this.useFirstLanguage.shift(); // -> Die Sprachrichtung für die Vokabel wird aus dem Array entfernt
    // -> Wenn der Pot-Stack leer ist, wird zur Kurs-Seite navigiert und die Runde beendet (Verzögerung um 2 Sekunden zum Anzeigen des letzen Ergebnisses)
    if (this.roundStack.length === 0) setTimeout( () => this.router.navigate(['/course'], { state: {course: this.course}, replaceUrl: true }), 2000);
    this.questionRef.nextQuestion(); // -> Die nächste Frage wird geladen
  }
}
