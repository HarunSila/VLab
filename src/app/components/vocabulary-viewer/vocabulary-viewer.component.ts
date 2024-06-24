import { CommonModule } from '@angular/common';
import { Component, Input, AfterViewInit, ViewChildren, ElementRef, QueryList, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Vocabulary } from 'src/app/models/vocabulary';
import { SwipeGestureService } from 'src/app/services/swipe-gesture.service';

/*
 * Verwendung: stack-view Seite
 * Funktionalität: Dieses Komponente zeigt die Vokabeln eines Vokabelstapels (Stack) an.
 *              Es zeigt die Vokabeln als Kartenstapel an und bietet die Möglichkeit, durch die Karten zu swipen.
 * Services: SwipeGestureService
 * Schnittstellen:
 *    @Input vocabulary: Vocabulary[] - Array mit den Vokabeln, die angezeigt werden sollen
*/

@Component({
  selector: 'app-vocabulary-viewer',
  templateUrl: './vocabulary-viewer.component.html',
  styleUrls: ['./vocabulary-viewer.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class VocabularyViewerComponent  implements AfterViewInit, OnChanges {
  // ViewChildren Dekorator für die Referenz auf die Vokabelkarten
  @ViewChildren('card', { read: ElementRef }) targetElements!: QueryList<ElementRef>;
  // dynamisches Attribut für die Vokabelansicht -> Übergabe über HTML Tag
  @Input() vocabulary!: Vocabulary[];

  @Output() editClicked: EventEmitter<Vocabulary> = new EventEmitter<Vocabulary>();
  @Output() deleteClicked: EventEmitter<Vocabulary> = new EventEmitter<Vocabulary>();

  constructor(private swipeGestureService: SwipeGestureService) { }

  // Initialisierung der Swipe-Gesten nach dem Initialisieren der View
  ngAfterViewInit() {
    if(this.targetElements.toArray().length > 1)
      this.swipeGestureService.initElementReferences(this.targetElements);
  }

  // Umkehrung der Reihenfolge der Vokabeln, wenn sich das Attribut ändert und es nicht die initiale Änderung ist
  // -> Initialisierung der Swipe-Gesten nach der Umkehrung
  // -> Verzögerung der Initialisierung, um sicherzustellen, dass die View aktualisiert wurde
  ngOnChanges(changes: SimpleChanges): void {
    this.vocabulary = this.vocabulary.reverse();
    if(changes['vocabulary'] && !changes['vocabulary'].firstChange )
      {
        setTimeout(() => {
          this.swipeGestureService.initElementReferences(this.targetElements);
        });
      }
  }

  onEditClicked(vocabulary: Vocabulary) {
    this.editClicked.emit(vocabulary);
  }

  onDeleteClicked(vocabulary: Vocabulary) {
    this.deleteClicked.emit(vocabulary);
  }
}
