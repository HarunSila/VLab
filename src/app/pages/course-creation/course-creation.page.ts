import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Language } from 'src/app/models/language';
import { AlertService } from 'src/app/services/alert.service';
import { DBCourseService } from 'src/app/services/db/db-course.service';
import { DBLanguageService } from 'src/app/services/db/db-language.service';
import { DatabaseService } from 'src/app/services/db/db.service';
import { DragGestureService } from 'src/app/services/drag-gesture.service';

/* 
 * Funktionalität: Diese Seite ermöglicht es dem Benutzer, einen neuen Kurs zu erstellen. 
  *               Der Benutzer kann durch Drag Gesten die Sprachen auswählen, in denen der Kurs erstellt werden soll.
  *              Der Benutzer kann durch Klicken auf den "Ready"-Button den Kurs erstellen und zur Kurs-Seite navigieren.
  *             Der Benutzer kann durch Klicken auf den "Add"-Button eine neue Sprache hinzufügen.
  *            Der Benutzer kann maximal 14 Sprachen hinzufügen.
  *          Der Benutzer kann durch Drag and Drop auf den "Delete"-Button eine Sprache löschen.
  * Services: CourseService, DragGestureService, AlertService
  * Routen: home Seite, course Seite
 */

@Component({
  selector: 'app-course-creation',
  templateUrl: './course-creation.page.html',
  styleUrls: ['./course-creation.page.scss'],
})
export class CourseCreationPage implements OnInit, OnDestroy {
  @ViewChildren('langCard', { read: ElementRef }) targetElements!: QueryList<ElementRef>;  // Referenz auf die Sprachkarten
  @ViewChild('content', { static: false, read: ElementRef }) content!: ElementRef; // Referenz auf den Ion Content
  @ViewChild('deleteButton', { static: false, read: ElementRef }) deleteButton!: ElementRef; // Referenz auf den Lösch-Button
  @ViewChildren('darkenElement', { read: ElementRef }) darkenElements!: QueryList<ElementRef>; // Referenz auf die Elemente, die abgedunkelt werden sollen

  @ViewChild('firstDropZoneRef', { static: false, read: ElementRef }) firstDropZoneRef!: ElementRef; // Referenz auf die erste Drop-Zone
  @ViewChild('secondDropZoneRef', { static: false, read: ElementRef}) secondDropZoneRef!: ElementRef; // Referenz auf die zweite Drop-Zone

  languages: Language[] = []; // Array für die Sprachen

  readyDisabled = true; // Flag für die Deaktivierung des "Ready"-Buttons

  private subscription!: Subscription; // Subscription für das Löschevent der Sprachen im DragGestureService

  constructor(  private dbLanguageService: DBLanguageService, 
                private dbCourseService: DBCourseService,
                protected dragGestureService: DragGestureService, 
                private cdr: ChangeDetectorRef,
                private router: Router,
                private alertService: AlertService,
                private platform: Platform) { 
                  this.platform.backButton.subscribe(() => this.navigateToHome());
                }

  ngOnInit() { // Initialisierung der Sprachen, sowie Subscription für das Lösch-Event der Sprachen im DragGestureService
    this.loadLanguages();
    this.subscription = this.dragGestureService.languageDeleteEvent.subscribe((id: number) =>{ 
      this.dbLanguageService.deleteLanguage(id).then(() =>this.loadLanguages());
    });
  }

  ngOnDestroy(): void { // Beenden der Subscription beim Verlassen der Seite
    this.subscription.unsubscribe();
  }

  loadLanguages() { // Laden der Sprachen aus der Datenbank
    this.dbLanguageService.getLanguages().then((result) => {
      this.languages = result.values as Language[] || [];
      this.cdr.detectChanges(); // -> Aktualisierung der Referenzen
      this.initDragGesture(); // -> Initialisierung der Referenzen im DragGestureService
    });
  }

  initDragGesture(): void { // Initialisierung der Referenzen im DragGestureService, zur Interaktion mit den Sprachkarten
    this.dragGestureService.resetState();
    this.dragGestureService.initElementReferences(
      this.targetElements, this.content, this.darkenElements, this.deleteButton, this.firstDropZoneRef, this.secondDropZoneRef
    );
  }

  navigateToHome(): void { // Navigation zur Menü-Seite und Zurücksetzen des DragGestureService
    this.dragGestureService.resetState();
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  onAddNewLanguage() { // Überprüfung, ob die Eingabe der Sprachen korrekt ist
    if(this.languages.length < 14) this.initAlertNewLanguage(); // -> Wenn ja, wird die initAlertNewLanguage-Methode aufgerufen
    else this.alertService.addLanguageErrorAlert();   // -> Wenn nein, wird ein Error Alert angezeigt
  }

  async initAlertNewLanguage() { // Initialisierung des Alerts für das Hinzufügen einer neuen Sprache
    const userInput =  await this.alertService.addLanguageAlert();
    if(userInput.length > 0) {
      this.dbLanguageService.addLanguage(userInput).then(() => this.loadLanguages()) // -> Hinzufügen der neuen Sprache in die Datenbank
    } 
  }

  enableReadyButton(): boolean { // Überprüfung, ob sowohl die erste als auch die zweite Sprache ausgewählt wurden
    let a = Number(this.dragGestureService.firstLanguageId);
    let b = Number(this.dragGestureService.learningLanguageId);
    return a > 0 && b > 0;  // -> Wenn ja, wird der "Ready"-Button aktiviert
  }

  onReady(){  // Funktion für den "Ready"-Button -> Erstellen eines neuen Kurses und Navigation zur Kurs-Seite
    this.dbCourseService.addCourse(this.dragGestureService.firstLanguageId, this.dragGestureService.learningLanguageId) // -> Erstellen eines neuen Kurses
      .then(() => {
        return this.dbCourseService.getLastInsertedCourse();  // -> Laden des zuletzt erstellten Kurses
      })
      .then((course) => { 
        this.dragGestureService.resetState(); // -> Zurücksetzen des DragGestureService
        this.router.navigate(['/course'], { state:{course: course}, replaceUrl: true }); // -> Navigation zur Kurs-Seite
    });
  }
}
