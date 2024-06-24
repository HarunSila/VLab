import { ElementRef, EventEmitter, Injectable, QueryList } from "@angular/core";
import { GestureController, GestureDetail } from "@ionic/angular";

/*
 * Funktionalität: Service für die Drag-Gesture. Der Service ermöglicht das Verschieben von Elementen auf der Oberfläche.
 *                Es wird überprüft, ob ein Element über einem anderen Element liegt und entsprechende Aktionen werden ausgeführt.
 *              Der Service wird genutzt, um die Sprachen auf der course-creation Seite zu verschieben und auszuwählen.
 *             Es wird überprüft, ob eine Sprache über der Drop-Zone für die erste Sprache oder die Lernsprache liegt.
 *            Wenn eine Sprache über der Drop-Zone liegt, wird sie an die Position der Drop-Zone verschoben und die Auswahl wird gespeichert.
 *           Wenn eine Sprache über dem Löschen-Button liegt, wird sie gelöscht.
 *          Der Service wird auch genutzt, um die Intro-Karte auf der home Seite zu verschieben und auszublenden.
 */

@Injectable({
    providedIn: 'root'
  })
  export class DragGestureService {
    languageDeleteEvent: EventEmitter<number> = new EventEmitter<number>(); // Event zum Löschen einer Sprache
    selectFirstLanguageEvent: EventEmitter<number> = new EventEmitter<number>(); // Event zum Auswählen der ersten Sprache
    selectLearningLanguageEvent: EventEmitter<number> = new EventEmitter<number>(); // Event zum Auswählen der Lernsprache

    startDrag = false; // Flag, ob ein Drag-Vorgang gestartet wurde
    targetElementRefs: QueryList<ElementRef> | undefined; // Referenzen auf die Elemente, die bewegt werden können
    contentElementRef: ElementRef | undefined; // Referenz auf das Element, das den Hintergrund abdunkelt
    darkenElements: QueryList<ElementRef> | undefined; // Referenzen auf die Elemente, die abgedunkelt werden
    deleteButtonRef: ElementRef | undefined; // Referenz auf den Button zum Löschen eines Elements

    firstDropZoneRef: ElementRef | undefined; // Referenz auf die Drop-Zone für die erste Sprache
    secondDropZoneRef: ElementRef | undefined; // Referenz auf die Drop-Zone für die Lernsprache

    targetElementRect: DOMRect | undefined; // Rechteck des bewegten Elements

    firstLanguageId = 0; // ID der ersten Sprache
    learningLanguageId = 0; // ID der Lernsprache
    
    dropMixReady = false; // Flag, ob beide Sprachen ausgewählt wurden

    constructor(private gestureCtrl: GestureController) {}
    
    // Initialisierung der Referenzen auf die Elemente
    initElementReferences(
        targetElementRefs: QueryList<ElementRef> ,
        contentElementRef: ElementRef,
        darkenElements: QueryList<ElementRef>,
        deleteButtonRef: ElementRef,
        firstDropZoneRef?: ElementRef,
        secondDropZoneRef?: ElementRef,
    ) {
        this.contentElementRef = contentElementRef;
        this.darkenElements = darkenElements;
        this.deleteButtonRef = deleteButtonRef;
        this.targetElementRefs = targetElementRefs;

        if(firstDropZoneRef) this.firstDropZoneRef = firstDropZoneRef;
        if(secondDropZoneRef) this.secondDropZoneRef = secondDropZoneRef;

        this.targetElementRefs!.forEach((element) => this.setupDragGesture(element)); // Konfiguration der Drag-Gesture für jedes Element
    }

    // Konfiguration der Drag-Gesture für ein Element
    setupDragGesture(targetElementRef: ElementRef): void {
        const gesture = this.gestureCtrl.create({
          el: targetElementRef.nativeElement,
          gestureName: 'card-drag',
          threshold: 0,
          onStart: () => this.onDragStart(targetElementRef), // Event-Handler für den Start des Drag-Vorgangs
          onMove: (ev) => this.onDragMove(ev, targetElementRef), // Event-Handler für die Bewegung des Elements
          onEnd: () => this.onDragEnd(targetElementRef), // Event-Handler für das Ende des Drag-Vorgangs (Drop)
        });
        gesture.enable(true); // Aktivierung der Gesture
      }

      // Event-Handler für den Start des Drag-Vorgangs
      onDragStart(targetElementRef: ElementRef){
        this.targetElementRect = targetElementRef.nativeElement.getBoundingClientRect(); // Rechteck des bewegten Elements wird gespeichert
        this.startDrag = true; // Flag für den Drag-Vorgang wird gesetzt
        this.showDarkOverlay(targetElementRef); // Hintergrund wird abgedunkelt
      }

      // Event-Handler für die Bewegung des Elements
      onDragMove(ev: GestureDetail, targetElementRef: ElementRef){
        if (this.startDrag) {
            // Element wird verschoben entsprechend der Bewegung des Fingers
            targetElementRef.nativeElement.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          }
          // Überprüfung, ob das Element über dem Löschen-Button liegt
          if (this.isElementOverlapping(targetElementRef, this.deleteButtonRef!)) {
            this.deleteButtonRef!.nativeElement.style.transform = 'scale(1.2)'; // Button wird vergrößert
          } else this.deleteButtonRef!.nativeElement.style.transform = 'scale(1)'; // Button wird auf Normalgröße gesetzt
      }

      // Event-Handler für das Ende des Drag-Vorgangs (Drop)
      onDragEnd(targetElementRef: ElementRef){
        // Überprüfung, ob das Element über dem Löschen-Button liegt
        if (this.isElementOverlapping(targetElementRef, this.deleteButtonRef!)) {
            this.deleteDropAction(targetElementRef); // Löschen des Elements
            // Wenn das Element zu löschende Element eine ausgewählte Sprache ist, wird die Auswahl zurückgesetzt
            if(this.firstLanguageId === targetElementRef.nativeElement.id) this.firstLanguageId = 0;
            if(this.learningLanguageId === targetElementRef.nativeElement.id) this.learningLanguageId = 0;
        } 
        // Überprüfung, ob das Element über der Drop-Zone für die erste Sprache liegt
        else if (this.firstDropZoneRef && this.isElementOverlapping(targetElementRef, this.firstDropZoneRef)
                && this.firstLanguageId === 0) {
                        this.selectLanguage(targetElementRef, this.firstDropZoneRef, true); // Auswahl der ersten Sprache
        } 
        // Überprüfung, ob das Element über der Drop-Zone für die Lernsprache liegt
        else if(this.secondDropZoneRef && this.isElementOverlapping(targetElementRef, this.secondDropZoneRef) 
                && this.learningLanguageId === 0) {
                        this.selectLanguage(targetElementRef, this.secondDropZoneRef, false); // Auswahl der Lernsprache
        } 
        // Wenn das Element nicht über einer Drop-Zone liegt, wird es an seine ursprüngliche Position zurückgesetzt,
        // es erhält den ursprünglichen Style und die Auswahl der Sprache (falls zutreffend) wird zurückgesetzt
        else {
            targetElementRef.nativeElement.style.opacity = '0.8';
            targetElementRef.nativeElement.style.zIndex = '0';
            targetElementRef.nativeElement.style.transform = `translate(0, 0)`;
            if(this.firstLanguageId === targetElementRef.nativeElement.id) this.firstLanguageId = 0;
            if(this.learningLanguageId === targetElementRef.nativeElement.id) this.learningLanguageId = 0;
        }
        this.startDrag = false; // Flag für den Drag-Vorgang wird zurückgesetzt
        this.hideDarkOverlay(); // Hintergrund wird zurückgesetzt

        if(this.firstLanguageId > 0 && this.learningLanguageId > 0) this.dropMixReady = true; // Flag für den Ready-Zustand wird gesetzt
      }

      // Überprüfung, ob zwei Elemente sich überlappen
      isElementOverlapping(targetElementRef: ElementRef, elementToOverlap: ElementRef): boolean {
        const rectA = targetElementRef.nativeElement.getBoundingClientRect(); // Rechteck des bewegten Elements
        const rectB = elementToOverlap.nativeElement.getBoundingClientRect(); // Rechteck des Elements, über das geprüft wird
        return ( // Überlappung wird geprüft
          rectA.left < rectB.right && 
          rectA.right > rectB.left &&
          rectA.top < rectB.bottom &&
          rectA.bottom > rectB.top
        );
      }

      // Löschen des Elements
      deleteDropAction(targetElementRef: ElementRef): void {
        if(targetElementRef.nativeElement.classList.contains('intro-card')){ // Überprüfung, ob das zu löschende Element die Intro-Karte ist
            localStorage.setItem('hideIntro', 'true'); // Intro-Karte wird ausgeblendet
            targetElementRef.nativeElement.classList.add('hide-card'); // Intro-Karte wird ausgeblendet
        } else if(targetElementRef.nativeElement.classList.contains('lang-card')){ // Überprüfung, ob das zu löschende Element eine Sprache ist
            // Das zu löschende Element wird aus der Liste der Elemente entfernt 
            const filteredRefs  = this.targetElementRefs!.filter((element) => element.nativeElement.id !== targetElementRef.nativeElement.id);
            this.targetElementRefs!.reset(filteredRefs); // Die Liste der Elementreferenzen für die bewegbaren Karten wird zurückgesetzt
            this.languageDeleteEvent.emit(targetElementRef.nativeElement.id);  // Event zum Löschen der Sprache wird ausgelöst
            this.targetElementRefs!.forEach((element) => element.nativeElement.style.transform = `translate(0, 0)`); // Alle Elemente werden an ihre ursprüngliche Position zurückgesetzt
            this.firstLanguageId = 0; // Auswahl der ersten Sprache wird zurückgesetzt
            this.learningLanguageId = 0; // Auswahl der Lernsprache wird zurückgesetzt
        }
      }
      
      // Auswahl einer Sprache
      selectLanguage(targetElementRef: ElementRef, dropZoneRef: ElementRef, firstLang: boolean): void {
        const rectA = this.targetElementRect!; // Rechteck des bewegten Elements
        const rectB = dropZoneRef.nativeElement.getBoundingClientRect(); // Rechteck der Drop-Zone
        const posX = rectB.left - rectA.left + (rectB.width - rectA.width) / 2; // xPosition des Elements wird berechnet
        const poxY = rectB.top - rectA.top + (rectB.height - rectA.height) / 2; // yPosition des Elements wird berechnet
        targetElementRef.nativeElement.style.transform = `translate(${posX}px, ${poxY}px)`; // Element wird an die Position der Drop-Zone verschoben
        firstLang ? this.firstLanguageId = targetElementRef.nativeElement.id : this.learningLanguageId = targetElementRef.nativeElement.id; // ID der ausgewählten Sprache wird gespeichert
      }

      // Abdeckung des Hintergrunds
      showDarkOverlay(targetElementRef: ElementRef): void {
        targetElementRef.nativeElement.style.opacity = '1';
        targetElementRef.nativeElement.style.zIndex = '1000';
        this.contentElementRef!.nativeElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.darkenElements!.forEach((element) => element.nativeElement.style.opacity = '0');
        this.deleteButtonRef!.nativeElement.style.display = 'block';
      }

      // Zurücksetzen der Hintergrundabdeckung
      hideDarkOverlay(): void {
        this.contentElementRef!.nativeElement.style.backgroundColor = 'transparent'; 
        this.darkenElements!.forEach((element) => element.nativeElement.style.opacity = '1');
        this.deleteButtonRef!.nativeElement.style.display = 'none';
      }

      // Zurücksetzen des Service-Status
      resetState() {
        this.targetElementRefs = undefined;
        this.contentElementRef = undefined;
        this.darkenElements = undefined;
        this.deleteButtonRef = undefined;
        this.firstDropZoneRef = undefined;
        this.secondDropZoneRef = undefined;
        this.firstLanguageId = 0;
        this.learningLanguageId = 0;
      }
  }