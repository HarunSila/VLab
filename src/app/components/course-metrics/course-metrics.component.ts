import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Course } from 'src/app/models/course';
import { DBVocabularyService } from 'src/app/services/db/db-vocabulary.service';

/*
 * Verwendung: course Seite, stack-view Seite
 * Funktionalität: Dieses Komponente zeigt die Metriken eines Kurses an.
 *                Es zeigt die Anzahl der Karten im Pot, im Failed-Stack und im Success-Stack an.
 *               Die Anzahl wird in einer Badge dargestellt, die bei jedem Wechsel der Anzeige
 *              eine Sprung-Animation ausführt.
 *               Bei Klick auf den Button wird der Nutzer zur Stack-Ansicht weitergeleitet.
 *              Der Button kann blockiert werden, um die Navigation zu verhindern.
 * Schnittstellen:
 *    @Input course: Der Kurs, zu dem die Metriken angezeigt werden sollen.
 *    @Input pot: Der Pot-Stack des Kurses.
 *    @Input failed: Der Failed-Stack des Kurses.
 *    @Input success: Der Success-Stack des Kurses.
 *    @Input blockButtonPress: Blockiert das Drücken des Buttons, um die Navigation zu verhindern.
 * Routen: stack-view Seite
*/

@Component({
  selector: 'app-course-metrics',
  templateUrl: './course-metrics.component.html',
  styleUrls: ['./course-metrics.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class CourseMetricsComponent  implements OnInit {
   // Dynamische Attribute für die Anzeige der Metriken -> Übergabe durch HTML Tag
  @Input() course: Course | undefined; // Kurs, zu dem die Metriken angezeigt werden sollen
  @Input() blockButtonPress: boolean | undefined; // Blockiert das Drücken des Buttons, um die Navigation zu verhindern
  @Input() potStackId: number | undefined; // ID des Pot-Stacks
  @Input() failedStackId: number | undefined; // ID des Failed-Stacks
  @Input() successStackId: number | undefined; // ID des Success-Stacks

  potStackLength = 0; // Anzahl der Karten im Pot-Stack
  failedStackLength = 0; // Anzahl der Karten im Failed-Stack
  successStackLength = 0; // Anzahl der Karten im Success-Stack

  // Attribute für die Animation der Badges
  potJumpActive = false;
  failedJumpActive = false;
  successJumpActive = false;

  badgeTypes = ['pot', 'failed', 'success'];
  currentBadgeIndex = 0;

  constructor(private router: Router, private dbVocabularyService: DBVocabularyService) { }

  // Initialisierug der Vokabelanzahlen für die Badges, sowie Auslösen der ersten Badge-Animation
  ngOnInit() {
    this.initVocabularyAmounts();
    this.triggerNextBadgeAnimation();
  }

  initVocabularyAmounts() {
    if(this.potStackId) this.dbVocabularyService.countVocabularyFromStack(this.potStackId).then(amount => this.potStackLength = amount);
    if(this.failedStackId) this.dbVocabularyService.countVocabularyFromStack(this.failedStackId).then(amount => this.failedStackLength = amount);
    if(this.successStackId) this.dbVocabularyService.countVocabularyFromStack(this.successStackId).then(amount => this.successStackLength = amount);
  }

  // Funktion zum Anzeigen der nächsten Badge-Animation
  // -> rekursiver Aufruf mit 1 Sekunde Verzögerung
  // -> springt zwischen den Badges 'pot', 'failed' und 'success'
  // -> ruft Funktion zum Auslösen der Sprung-Animation auf
  triggerNextBadgeAnimation(): void {
    const currentBadgeType = this.badgeTypes[this.currentBadgeIndex];
    this.triggerJumpAnimation(currentBadgeType);
    this.currentBadgeIndex = (this.currentBadgeIndex + 1) % this.badgeTypes.length;
    setTimeout(() => {
      this.triggerNextBadgeAnimation();
    }, 1000);
  }

  // Funktion zum Auslösen der Sprung-Animation für die übergebene Badge Art
  // -> setzt die entsprechende Variable für die Animation auf true
  // -> setzt die Variable nach 500ms wieder auf false
  triggerJumpAnimation(badgeType: string): void {
    switch (badgeType) {
      case 'pot':
        this.potJumpActive = true;
        setTimeout(() => {
          this.potJumpActive = false;
        }, 500);
        break;
      case 'failed':
        this.failedJumpActive = true;
        setTimeout(() => {
          this.failedJumpActive = false;
        }, 500);
        break;
      case 'success':
        this.successJumpActive = true;
        setTimeout(() => {
          this.successJumpActive = false;
        }, 500);
        break;
    }
  }

  // Funktion zum Navigieren zur Stackansicht bei Klick auf den Button
  // -> blockiert das Drücken des Buttons, wenn blockButtonPress gesetzt ist
  onStackPress(stackType: string){
    if(!this.blockButtonPress)
      this.router.navigate(['/stack-view'], { state: { course: this.course, stackType: stackType }, replaceUrl: true });
  }
}
