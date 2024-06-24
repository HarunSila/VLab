import { AfterViewInit, ChangeDetectorRef, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { Course } from 'src/app/models/course';
import { AlertService } from 'src/app/services/alert.service';
import { DBCourseService } from 'src/app/services/db/db-course.service';
import { DBLanguageService } from 'src/app/services/db/db-language.service';
import { DBStackService } from 'src/app/services/db/db-stack.service';
import { DBVocabularyService } from 'src/app/services/db/db-vocabulary.service';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';

/*
 * Funktionalität: Diese Seite zeigt die Details eines Kurses an. Der Benutzer kann hier den Kurs löschen oder einen neuen Runde starten.
 *                Die Anzahl der Vokabeln, die in der Runde abgefragt werden sollen, kann hier ebenfalls festgelegt werden.
 *              Die Sprachen, in denen die Vokabeln abgefragt werden sollen, können ebenfalls festgelegt werden.
 *            Die Vokabelstapel des Kurses (potStack, failedStack, successStack) werden hier ebenfalls angezeigt und 
 *            können durch Klicken auf die Karten angezeigt werden.
 * Komponenten: course-metrics           
 * Services: CourseService, AlertService
 * Routen: home Seite, round Seite
*/

@Component({
  selector: 'app-course',
  templateUrl: './course.page.html',
  styleUrls: ['./course.page.scss'],
})
export class CoursePage implements OnInit, AfterViewInit {
  @ViewChild('roundProgress', {static: false}) roundProgressRef!: RoundProgressComponent;  // Referenz auf das Fortschrittsbalken-Element
  course!: Course;  // Kurs, der angezeigt wird
  maxProgress = 0;  // Maximale Anzahl an Vokabeln, die abgefragt werden können
  current = 0;  // Aktuelle Anzahl an Vokabeln, die richtig beantwortet wurden
  radius = 60;  // Radius für den Kreis des Fortschrittsbalkens
  numberOfVocabulary = "10";  // Anzahl der Vokabeln, die in der Runde abgefragt werden sollen
  potStackLength = 0;  // Anzahl der Vokabeln im Pot-Stack
  failedStackLength = 0;  // Anzahl der Vokabeln im Failed-Stack
  sourceLanguage = '';  // Quellsprache für die Fragen
  targetLanguage = '';  // Zielsprache für die Fragen
  progressColor = '';  // Farbe des Fortschrittsbalkens 

  constructor(private router: Router,
              private dbLanguageService: DBLanguageService,
              private dbVocabularyService: DBVocabularyService,
              private dbCourseService: DBCourseService,
              private dbStackService: DBStackService,
              private cdr: ChangeDetectorRef,
              private alertService: AlertService,
              private toastCtrl: ToastController,
              private platform: Platform) { 
                this.platform.backButton.subscribe(() => this.navigateToHome());
              }

  ngOnInit() {
    this.course = history.state.course;   // Initialisierung des Kurses

    this.dbLanguageService.getLanguage(this.course.source_language_id).then(language => this.sourceLanguage = language!.name);   // -> Festlegen der Quellsprache für die Fragen
    this.dbLanguageService.getLanguage(this.course.target_language_id).then(language => this.targetLanguage = language!.name);   // -> Festlegen der Zielsprache für die Fragen

    this.dbVocabularyService.countVocabularyFromStack(this.course.pot_stack_id!)
      .then(amount => this.potStackLength = amount);   // -> Berechnung der Anzahl der Vokabeln im Pot-Stack (potStackLength)
    this.dbVocabularyService.countVocabularyFromStack(this.course.failed_stack_id!)
      .then(amount => this.failedStackLength = amount);   // -> Berechnung der Anzahl der Vokabeln im Failed-Stack (failedStackLength)
  }

  ngAfterViewInit(): void { // Initialisierung der Vokabelanzahl nach dem Initialisieren der View
    Promise.all([
      this.dbVocabularyService.countVocabularyFromCourse(this.course.pot_stack_id!, this.course.failed_stack_id!, this.course.success_stack_id!),
      this.dbVocabularyService.countVocabularyFromStack(this.course.success_stack_id!)
    ]).then(([courseAmount, successAmount]) => {
      // Set maxProgress and current to the amount of vocabulary in the course and the amount of vocabulary in the success stack
      this.roundProgressRef.max = courseAmount;
      this.maxProgress = courseAmount;
      this.roundProgressRef.current = successAmount;
      this.current = successAmount;
    });
  }

  navigateToHome(): void {   // Navigation zur Home-Seite
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  getProgressColor(){   // Festlegen der Farbe des Fortschrittsbalkens basierend auf dem Fortschritt
    let percentage = Math.round(this.current / this.maxProgress * 100)/100;
    if (percentage >= 0.67) {
      return getComputedStyle(document.documentElement).getPropertyValue('--ion-color-success');
    } else if (percentage >= 0.34) {
      return getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning');
    } else {
      return getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');
    }
  }
  
  // Festlegen des Overlay-Stils für das Label des Fortschrittsbalkens
  // siehe Demo der Dokumentation: https://github.com/crisbeto/angular-svg-round-progressbar
  getOverlayStyle() {
    return {
      top: '50%',
      bottom: 'auto',
      left: '50%',
      transform: 'translateY(-50%) ' + 'translateX(-50%)',
      fontSize: this.radius / 3.5 + 'px',
    };
  }
  
  updateNumberOfVocabulary(event: CustomEvent) {    // Speichern der Anzahl der Vokabeln, die in der Runde abgefragt werden sollen
    this.numberOfVocabulary = event.detail.value;
  }

  onDelete() {    // Funktion des Buttons "Löschen" -> Löschen des Kurses und Navigation zur Home-Seite
    this.alertService.deleteCourseAlert().then((result) => {
      if(result === 'confirm') {
        this.dbVocabularyService.deleteVocabularyFromStacks([this.course.pot_stack_id!, this.course.failed_stack_id!, this.course.success_stack_id!])
          .then(() => this.dbCourseService.deleteCourse(this.course.id!))
          .then(() => this.dbStackService.deleteStacks([this.course.pot_stack_id!, this.course.failed_stack_id!, this.course.success_stack_id!]))
          .then(() => {
            this.toastCtrl.create({
              message: 'The course has been deleted.',
              duration: 2000,
              color: 'success'
            }).then(toast => toast.present());
            this.cdr.detectChanges();
            this.router.navigate(['/home'], { replaceUrl: true });
          });
      }
    });
  }

  // Festlegen der Anzahl der Vokabeln, die in der Runde abgefragt werden sollen
  getNumberOfVocabulary() {
    if(Number(this.numberOfVocabulary) > this.potStackLength + this.failedStackLength) {
      return this.potStackLength + this.failedStackLength;
    } else return Number(this.numberOfVocabulary); 
  }

  // Funktion des Buttons "Runde starten" -> Navigation zur Runde-Seite
  onStartRound(){
    // -> Überprüfung, ob genügend Vokabeln im Pot-Stack vorhanden sind und ob mindestens eine Sprache für die Fragen ausgewählt wurde
    if(this.potStackLength + this.failedStackLength > 0 && (this.course.use_source_language > 0 || this.course.use_target_language > 0)){ 
      // -> Übergeben des Kurses und der Anzahl der Vokabeln, die in der Runde abgefragt werden sollen
      this.dbCourseService.updateCourse(this.course).then(() => {   
        // -> Speichern des Kurses und der Änderungen, wenn die Runde gestartet wird
        this.router.navigate(['/round'], {state: {course: this.course, numberOfVocabulary: this.getNumberOfVocabulary()}, replaceUrl: true });
      });
    } else if (this.potStackLength < 1) {
      this.toastCtrl.create({
        message: 'There are no vocabulary in the pot stack. Please add some vocabulary to the pot stack to start the round.',
        duration: 5000,
        color: 'danger'
      }).then(toast => toast.present());
    } else {
      this.toastCtrl.create({
        message: 'Please select at least one language for the questions to start the round.',
        duration: 5000,
        color: 'danger'
      }).then(toast => toast.present());
    }
  }
}
