import { ElementRef, Injectable, QueryList } from "@angular/core";
import { GestureController, GestureDetail } from "@ionic/angular";

/*
 *  Funktionalität: Service für die Swipe-Geste. Der Service ermöglicht es, Elemente in einer Liste durch eine Swipe-Geste zu verschieben.
 *                 Die Swipe-Geste kann nach oben oder nach unten ausgeführt werden.
 *                Beim Verschieben der Elemente wird die Z-Index, Transform und Scale Eigenschaft der Elemente verändert, 
 *                sodass ein Kartenstapel entsteht. 
 *               Auf der stack-view Seite kann der Nutzer durch die Vokabeln swipen, um die nächste oder vorherige Vokabel anzuzeigen.
 */

@Injectable({
    providedIn: 'root'
})
export class SwipeGestureService {

    targetElementRefs: QueryList<ElementRef> | undefined; // Referenzen auf die Elemente, die verschoben werden sollen

    currentTargetElement: ElementRef | undefined; // Referenz auf das aktuelle Element, das verschoben wird

    constructor(private gestureCtrl: GestureController) {} 

    // Initialisiert die Referenzen auf die Elemente, die verschoben werden sollen
    initElementReferences(targetElementRefs: QueryList<ElementRef>) {
        this.targetElementRefs = targetElementRefs;
        this.targetElementRefs.forEach((element) => this.setupSwipeGesture(element.nativeElement)); // Initialisiert für jedes Element eine Swipe-Geste
        let maxDisplayedCards = 6 > this.targetElementRefs.length ? this.targetElementRefs.length : 6; // Anzahl der maximal angezeigten Karten (max 6)
        for (let i = 0; i < maxDisplayedCards; i++) {  // Setzt die Z-Index, Transform und Scale Werte für die Karten, sodass ein Kartenstapel entsteht
            this.targetElementRefs.toArray()[i].nativeElement.style.zIndex = maxDisplayedCards - i;
            this.targetElementRefs.toArray()[i].nativeElement.style.transform = `translateY(${-i * 20}px)`;
            this.targetElementRefs.toArray()[i].nativeElement.style.scale = 1 - i * 0.05;
        }
    }

    // Initialisiert eine Swipe-Geste für ein Element
    setupSwipeGesture(targetElementRef: HTMLElement) {
        const gesture = this.gestureCtrl.create({
            el: targetElementRef,
            gestureName: 'swipe-gesture',
            threshold: 0,
            onStart: () => {},
            onMove: (ev) => { // Wird aufgerufen, wenn das Element verschoben wird
                const swipeDetail = ev as GestureDetail;
                if(swipeDetail.deltaY < 0) { // Wenn das Element nach oben verschoben wird
                    // Beweget die letzte Karte nach oben
                    this.currentTargetElement = this.targetElementRefs!.toArray()[this.getLastCardIndex()]; // Referenz auf das letzte Element im Array
                    this.currentTargetElement.nativeElement.style.transform = `translateY(${swipeDetail.deltaY}px)`;
                    this.currentTargetElement.nativeElement.style.scale = (1 + Math.abs(swipeDetail.deltaY) / 2000).toString();
                } else { // Wenn das Element nach unten verschoben wird
                    // Beweget die erste Karte nach unten
                    this.currentTargetElement = this.targetElementRefs!.toArray()[0]; // Referenz auf das erste Element im Array
                    this.currentTargetElement.nativeElement.style.transform = `translateY(${swipeDetail.deltaY}px)`;
                    this.currentTargetElement.nativeElement.style.scale = (1 - Math.abs(swipeDetail.deltaY) / 1000).toString();
                }
                
            },
            onEnd: (ev) => { // Wird aufgerufen, wenn das Element losgelassen wird
                const swipeDetail = ev as GestureDetail;
                if (swipeDetail.deltaY < 0) { // Wenn das Element nach oben verschoben wurde
                    this.onSwipeUp(); // Verschiebt die Karten nach oben
                } else { // Wenn das Element nach unten verschoben wurde
                    this.onSwipeDown(); // Verschiebt die Karten nach unten
                }
                this.resetState(); // Setzt die Z-Index, Transform und Scale Werte der Karten zurück
                this.initElementReferences(this.targetElementRefs!); // Initialisiert die Referenzen auf die Elemente neu
            },
        });
        gesture.enable(true);
    }

    // Verschiebt die Karten nach oben
    onSwipeUp() {
        let references: ElementRef[] = [];
        references.push(this.targetElementRefs!.toArray()[this.getLastCardIndex()]); // Fügt das letzte Element im Array an den Anfang hinzu
        for (let i = 0; i < this.getLastCardIndex(); i++) { // Fügt die restlichen Elemente an das Ende hinzu
            references.push(this.targetElementRefs!.toArray()[i]);
        }
        this.targetElementRefs!.reset(references); // Setzt die Referenzen auf die Elemente neu
    }

    // Verschiebt die Karten nach unten
    onSwipeDown() {
        let references: ElementRef[] = [];
        for (let i = 1; i < this.targetElementRefs!.length; i++) { // Fügt alle Elemente bis auf das erste an den Anfang hinzu
            references.push(this.targetElementRefs!.toArray()[i]);
        }
        references.push(this.targetElementRefs!.toArray()[0]); // Fügt das erste Element an das Ende hinzu
        this.targetElementRefs!.reset(references);
    }

    // Gibt den Index des letzten Elements im Array zurück
    getLastCardIndex() {
        return 6 >= this.targetElementRefs!.length ? this.targetElementRefs!.length-1 : 6;
    }

    // Setzt die Z-Index, Transform und Scale Werte der Karten zurück
    resetState() {
        this.targetElementRefs!.forEach((element) => {
            element.nativeElement.style.zIndex = 1;
            element.nativeElement.style.transform = `translateY(${0}px)`;
            element.nativeElement.style.scale = 1;
        });
    }
}