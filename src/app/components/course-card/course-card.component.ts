import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonProgressBar, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Course } from 'src/app/models/course';
import { Router } from '@angular/router';
import { DBLanguageService } from 'src/app/services/db/db-language.service';
import { DBVocabularyService } from 'src/app/services/db/db-vocabulary.service';

/*
 * Verwendung: home Seite
 * Funktionalität: Kurskarte, die die Sprachen und den Fortschritt des Kurses anzeigt
 *               und bei Klick auf die Karte zur Kursseite navigiert
 * Schnittstellen:
 *    @Input color: Die Farbe der Kurskarte.
 *    @Input course: Der Kurs, der auf der Karte angezeigt wird.
 * Routen: course Seite
*/

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class CourseCardComponent implements OnInit {
  @ViewChild(IonProgressBar) progressBar!: IonProgressBar;
  
  @Input() course!: Course; // dynamisches Attribut für die Kurskarte -> Übergabe über HTML Tag

  sourceLanugage: string = '';
  targetLanguae: string = '';
  progress: number = 0;

  constructor(  private router: Router, 
                private dbLanguageService: DBLanguageService, 
                private dbVocabularyService: DBVocabularyService) { }

  ngOnInit(): void {
      this.dbLanguageService.getLanguage(this.course.source_language_id).then(language => this.sourceLanugage = language!.name); // Setzen der Quellsprache
      this.dbLanguageService.getLanguage(this.course.target_language_id).then(language => this.targetLanguae = language!.name); // Setzen der Zielsprache
      this.dbVocabularyService.countVocabularyFromCourse(this.course.pot_stack_id, this.course.failed_stack_id, this.course.success_stack_id)
        .then(amount => this.progress = amount) // Speichere die Anzahl der Vokabeln im Kurs
        .then(() => this.dbVocabularyService.countVocabularyFromStack(this.course.success_stack_id)
          .then(amount => this.progress > 0 ? this.progress = (Math.round(amount / this.progress * 100) / 100) : 0)); // Berechnung des Fortschritts     
  }

  // Funktion zum Anpassen der Farbe des Fortschrittsbalkens je nach Fortschritt
  getProgressColor(value: number) {
      if(value >= 0.67) {
        return 'success'
      } else if(value >= 0.34) {
        return 'warning'
      } else {
        return 'danger'
      }
  }

  // Funktion zum Navigieren zur Kursseite bei Klick auf die Kurskarte
  onCourseClick() {
    this.router.navigate(['/course'], { state: { course: this.course }, replaceUrl: true });
  }
}
