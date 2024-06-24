import { Injectable } from "@angular/core";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Course } from "src/app/models/course";
import { DatabaseService } from "./db.service";
import { DBStackService } from "./db-stack.service";
import { BehaviorSubject, Observable } from "rxjs";

/*
 * Funktionalität: Dieser Service stellt Methoden zur Verfügung, um auf die Kurse in der Datenbank zuzugreifen und diese zu verwalten.
 * Services: DatabaseService, DBStackService
 */

@Injectable({
    providedIn: 'root'
})
export class DBCourseService {
    private isInitialized = new BehaviorSubject<boolean>(false);    // Speichert den Initialisierungsstatus der Datenbank
    db!: SQLiteDBConnection;    // Speichert die Datenbankverbindung

    constructor(private dbService: DatabaseService, private stackService: DBStackService) {}

    async initDatabaseConnecton(){  // Initialisiert die Datenbankverbindung
        this.dbService.whenInitialized().subscribe((initialized) => {   // Wartet auf die Initialisierung der Datenbank
            if(initialized){ 
                this.db = this.dbService.getDB();  // Holt sich die Datenbankverbindung
                this.isInitialized.next(true); // Setzt den Initialisierungsstatus auf true
            }
        });
    }

    whenInitialized(): Observable<boolean> { // Gibt den Initialisierungsstatus der Datenbank zurück
        return this.isInitialized.asObservable();
    }

    async getCourses() { // Gibt alle Kurse zurück
        const result = await this.db.query('SELECT * FROM course;');
        return result.values as Course[] || [];
    }

    async getCourse(id: number) { // Gibt den Kurs mit der übergebenen ID zurück
        const courses = await this.getCourses();
        return courses.find(course => course.id === id)!;
    }

    async getLastInsertedCourse() { // Gibt den zuletzt eingefügten Kurs zurück
        const id = await this.dbService.getLastInsertedId();
        return await this.getCourse(id);
    }

    async deleteCourse(id: number) { // Löscht den Kurs mit der übergebenen ID
        await this.db.execute(`DELETE FROM course WHERE id = ${id};`);
    }

    async updateCourse(course: Course) {  // Aktualisiert den übergebenen Kurs
        await this.db.execute(`UPDATE course SET source_language_id = ${course.source_language_id}, target_language_id = ${course.target_language_id}, 
                                use_target_language = ${course.use_target_language}, use_source_language = ${course.use_source_language}, 
                                pot_stack_id = ${course.pot_stack_id}, failed_stack_id = ${course.failed_stack_id}, 
                                success_stack_id = ${course.success_stack_id} WHERE id = ${course.id};`);
    }

    async addCourse(source_language_id: number, target_language_id: number) { // Fügt einen neuen Kurs hinzu
        let potStackId: number = 0;
        let failedStackId: number = 0;
        let successStackId: number = 0;
        await this.stackService.addStack('pot') // Erstellt den potStack für den Kurs
            .then(async () => { 
                potStackId = await this.dbService.getLastInsertedId(); // Speichert die ID des potStacks
            })
            .then(async () => {
                await this.stackService.addStack('failed'); // Erstellt den failedStack für den Kurs
                failedStackId = await this.dbService.getLastInsertedId(); // Speichert die ID des failedStacks
            })
            .then(async () => {
                await this.stackService.addStack('success'); // Erstellt den successStack für den Kurs
                successStackId = await this.dbService.getLastInsertedId(); // Speichert die ID des successStacks
            })
            .then(async () => { // Fügt den Kurs in die Datenbank ein
                await this.db.execute(`
                    INSERT INTO course (source_language_id, target_language_id, use_target_language,
                                        use_source_language, pot_stack_id, failed_stack_id, success_stack_id)
                    VALUES (${source_language_id}, ${target_language_id}, 1, 0,
                            ${potStackId}, ${failedStackId}, ${successStackId});
                `);
            });
    }
}