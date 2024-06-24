import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { AddVocabularyModalComponent } from 'src/app/components/add-vocabulary-modal/add-vocabulary-modal.component';
import { CourseMetricsComponent } from 'src/app/components/course-metrics/course-metrics.component';
import { Course } from 'src/app/models/course';
import { Vocabulary } from 'src/app/models/vocabulary';
import { AlertService } from 'src/app/services/alert.service';
import { DBVocabularyService } from 'src/app/services/db/db-vocabulary.service';

/*
 * Funktionalität: Anzeige der Vokabeln eines Stacks. Der Stack kann entweder der Pot-Stack, der Failed-Stack oder der Success-Stack sein.
 *               Der Nutzer kann neue Vokabeln hinzufügen, den Stack zum Pot-Stack verschieben oder zur Kurs-Seite navigieren.
 *              Der Nutzer kann mit der vocabulary-view Komponente durch die Vokabeln swipen.
 * Komponenten: add-vocabulary-modal, vocabulary-view, course-metrics
 * Services: courseService, alertService
 * Routen: course
 */

@Component({
  selector: 'app-stack-view',
  templateUrl: './stack-view.page.html',
  styleUrls: ['./stack-view.page.scss'],
})
export class StackViewPage implements OnInit {
  @ViewChild('courseMetric', { static: false }) courseMetricRef!: CourseMetricsComponent; // Referenz auf die Kurs-Metriken-Komponente
  course!: Course; // Kurs, der die Vokabeln enthält
  stackType!: string; // Typ des Stacks (pot, failed, success)
  currentStackId!: number; // ID des aktuellen Stacks
  vocabularies: Vocabulary[] = []; // Vokabeln des Stacks

  constructor(private router: Router, 
              private alertService: AlertService,
              private dbVocabularyService: DBVocabularyService,
              private cdr: ChangeDetectorRef,
              private modalCtrl: ModalController,
              private platform: Platform) { 
                this.platform.backButton.subscribe(() => this.onNavigateToCourse());
              }


  ngOnInit() {  // Initialisierung der Komponente
    this.course = history.state.course;
    this.stackType = history.state.stackType;
    this.currentStackId = this.stackType === 'pot' ? this.course.pot_stack_id : 
                          this.stackType === 'failed' ? this.course.failed_stack_id : 
                          this.course.success_stack_id;
    this.initVocabularies();
  }

  initVocabularies() {  // Initialisierung der Vokabeln des Stacks
    this.dbVocabularyService.getVocabularyFromStack(this.currentStackId).then(vocabularies => {
      this.vocabularies = vocabularies
      this.cdr.detectChanges();
    });
  }

  onNavigateToCourse(){   // Navigieren zur Kurs-Seite
    this.router.navigate(['/course'], { state: {course: this.course}, replaceUrl: true })
  }

  async onAddNewVocabulary() {   // Funktion für den Button zum Hinzufügen einer neuen Vokabel
    const modal = await this.modalCtrl.create({component: AddVocabularyModalComponent}); // -> Öffnen eines Modals zur Eingabe der neuen Vokabel
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    if(role === 'confirm'){
      data.stack_id = this.currentStackId; // -> Hinzufügen der ID des aktuellen Stacks zur Vokabel
      if(data.description === undefined || data.description === null) data.description = ''; // -> Setzen einer leeren Beschreibung (falls keine angegeben wurde
      this.dbVocabularyService.addVocabulary(data); // -> Hinzufügen der neuen Vokabel zum Stack
      this.initVocabularies(); // -> Aktualisierung der Vokabeln des Stacks
      this.courseMetricRef.initVocabularyAmounts(); // -> Aktualisierung der Kurs-Metriken
    }
  }

  onMoveStackToPot(){   // Funktion für den Button zum Verschieben der Vokabeln vom aktuellen Stack zum Pot-Stack
    this.alertService.moveStackToPotAlert().then((result) => {
      if(result === 'confirm')
        this.dbVocabularyService.moveVocabularyToPot(this.currentStackId, this.course.pot_stack_id) // -> Verschieben der Vokabeln zum Pot-Stack
          .then(() => this.onNavigateToCourse()); // -> Navigieren zur Kurs-Seite
    });
  }

  handleEditVocabulary(vocabulary: Vocabulary) {   // Funktion für das Bearbeiten einer Vokabel
    console.log('Edit Vocabulary: ', vocabulary);
  }

  handleDeleteVocabulary(vocabulary: Vocabulary) {   // Funktion für das Löschen einer Vokabel
    console.log('Delete Vocabulary: ', vocabulary);
  }
}
