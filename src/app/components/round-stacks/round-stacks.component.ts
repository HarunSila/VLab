import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Vocabulary } from 'src/app/models/vocabulary';

/*
 * Verwendung: round Seite
 * Funktionalität: Dieses Komponente zeigt die Vokabeln an, die in der Fragenrunde falsch und richtig beantwortet wurden.
 *          Es zeigt die Vokabeln in zwei Listen an, die jeweils die falsch und richtig beantworteten Vokabeln enthalten.
 *        Die Vokabeln werden in der Übersetzung angezeigt.
 * Schnittstellen:
 *    @Input failedStack: Vocabulary[] - Array mit den Vokabeln, die falsch beantwortet wurden
 *    @Input successStack: Vocabulary[] - Array mit den Vokabeln, die richtig beantwortet wurden
*/

@Component({
  selector: 'app-round-stacks',
  templateUrl: './round-stacks.component.html',
  styleUrls: ['./round-stacks.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class RoundStacksComponent {
  // dynamische Attribute für die Fragenrunde -> Übergabe über HTML Tag
  @Input() failedStack: Vocabulary[] = [];
  @Input() successStack: Vocabulary[] = [];

  constructor() { }
}
