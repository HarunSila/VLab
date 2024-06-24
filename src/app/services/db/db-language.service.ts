import { Injectable } from "@angular/core";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { ToastController } from "@ionic/angular";
import { Language } from "src/app/models/language";
import { DatabaseService } from "./db.service";

/*
 * Funktionalität: Dieser Service stellt Methoden zur Verfügung, um auf die Sprachen in der Datenbank zuzugreifen und diese zu verwalten.
 * Services: DatabaseService
 */

@Injectable({
    providedIn: 'root'
})
export class DBLanguageService {
    db!: SQLiteDBConnection; // Speichert die Datenbankverbindung

    constructor(private dbService: DatabaseService, private toastCtrl: ToastController) {}

    async initDatabaseConnecton(){ // Initialisiert die Datenbankverbindung
        this.dbService.whenInitialized().subscribe((initialized) => { // Wartet auf die Initialisierung der Datenbank
            if(initialized){
                this.db = this.dbService.getDB(); // Holt sich die Datenbankverbindung
            }
        });
    }

    async getLanguages() { // Gibt alle Sprachen zurück
        return await this.db.query('SELECT * FROM language;');
    }

    async getLanguage(id: number) { // Gibt die Sprache mit der übergebenen ID zurück
        const result = await this.db.query('SELECT * FROM language;');
        const languages = result.values as Language[] || [];
        return languages.find(language => language.id === id);
    }
    
    async addLanguage(name: string) { // Fügt eine neue Sprache hinzu
        await this.db.query('INSERT INTO language (name) VALUES (?);', [name]);
    }

    async deleteLanguage(id: number) { // Löscht die Sprache mit der übergebenen ID
        try {
            await this.db.execute(`DELETE FROM language WHERE id = ${id}`);
        } catch (error) {   // Fehlerbehandlung, falls die Sprache nicht gelöscht werden kann, weil sie in einem Kurs verwendet wird
            this.toastCtrl.create({
                message: 'Die Sprache konnte nicht gelöscht werden, da sie in einem Kurs verwendet wird.',
                duration: 2000,
                color: 'danger'
            }).then(toast => toast.present());
        }
    }
}