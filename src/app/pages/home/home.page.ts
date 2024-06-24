import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Course} from 'src/app/models/course';
import { DBCourseService } from 'src/app/services/db/db-course.service';
import { DragGestureService } from 'src/app/services/drag-gesture.service';

/*
 * Funktionalität: Diese Seite ist die Startseite der App. Sie bietet eine Übersicht über alle Kurse.
 *               Der Benutzer kann durch Drag und Drop auf den Lösch-Button die Introkarte entfernen.
 *             Der Benutzer kann durch Klicken auf den "Create Course"-Button zur course-creation Seite navigieren.
 *           Der Benutzer kann durch Klicken auf einen Kurs zur course Seite navigieren.
 * Kompontenten: CourseCardComponent
 * Services: CourseService, DragGestureService
 * Routen: course-creation Seite, course Seite
 */

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit{
  @ViewChildren('introCard', { read: ElementRef }) targetElements!: QueryList<ElementRef>; // Referenz auf die Introkarte
  @ViewChild('content', { static: false, read: ElementRef }) content!: ElementRef; // Referenz auf den Ion Content
  @ViewChild('deleteButton', { static: false, read: ElementRef }) deleteButton!: ElementRef; // Referenz auf den Lösch-Button
  @ViewChildren('darkenElement', { read: ElementRef }) darkenElements!: QueryList<ElementRef>; // Referenz auf die Elemente, die abgedunkelt werden sollen

  hideIntro = false; // Attribut für das Ausblenden der Introkarte
  courses: Course[] = []; 

  constructor(  private dbCourseService: DBCourseService,
                private dragGestureService: DragGestureService,
                private router: Router) {}

  // Initialisierung der Kurse
  ngOnInit(): void {
    this.dbCourseService.whenInitialized().subscribe(async (initialized) => {
      if(initialized) {
        this.courses = await this.dbCourseService.getCourses();
        if(localStorage.getItem('hideIntro') == 'true'){
          this.targetElements.get(0)!.nativeElement.classList.add('hide-card');
        }
      }
    });
  }

  // Initialisierung der Referenzen im DragGestureService, zur Interaktion mit der Introkarte
  ngAfterViewInit(): void {
    if(this.hideIntro == false) {
      this.dragGestureService.initElementReferences(
        this.targetElements,
        this.content,
        this.darkenElements,
        this.deleteButton,
        undefined,
        undefined
      );
    }
  }

  // Navigation zur course-creation Seite und Zurücksetzen des DragGestureService
  navigateToCourseCreation(): void {
    this.dragGestureService.resetState();
    this.router.navigate(['/course-creation'], { replaceUrl: true });
  }
}
