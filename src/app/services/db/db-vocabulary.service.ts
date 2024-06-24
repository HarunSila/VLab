import { Injectable } from "@angular/core";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { DatabaseService } from "./db.service";
import { Vocabulary } from "src/app/models/vocabulary";

/*
 * Funktionalität: Dieser Service stellt Methoden zur Verfügung, um auf die Vokabeln in der Datenbank zuzugreifen und diese zu verwalten.
 * Services: DatabaseService
 */

@Injectable({
    providedIn: 'root'
})
export class DBVocabularyService {
    db!: SQLiteDBConnection; // Speichert die Datenbankverbindung
    
    constructor(private dbService: DatabaseService) {}

    async initDatabaseConnecton(){ // Initialisiert die Datenbankverbindung
        this.dbService.whenInitialized().subscribe((initialized) => { // Wartet auf die Initialisierung der Datenbank
            if(initialized){
                this.db = this.dbService.getDB(); // Holt sich die Datenbankverbindung
            }
        });
    }

    async getVocabularyFromStack(stackId: number) { // Gibt alle Vokabeln aus dem Stack mit der übergebenen ID zurück
        const result = await this.db.query(`SELECT * FROM vocabulary WHERE stack_id = ${stackId}`);
        return result.values as Vocabulary[] || [];
    }

    async getVocabularyForRound(failedStackId: number, potStackId: number, limit: number) { // Gibt die Vokabeln für die Runde zurück
        const failedStack = await this.getVocabularyFromStack(failedStackId); // Holt sich die Vokabeln aus dem Failed-Stack
        const potStack = await this.getVocabularyFromStack(potStackId); // Holt sich die Vokabeln aus dem Pot-Stack
        const vocabularies = failedStack.concat(potStack); // Fügt die Vokabeln aus dem Failed-Stack und dem Pot-Stack zusammen
        return vocabularies.slice(0, limit); // Gibt die ersten limit Vokabeln zurück
    }

    async countVocabularyFromStack(stackId: number) { // Gibt die Anzahl der Vokabeln aus dem Stack mit der übergebenen ID zurück
        const vocabularies = await this.getVocabularyFromStack(stackId); 
        return vocabularies.length
    }

    async countVocabularyFromCourse(potStackId: number, failedStackId: number, successStackId: number) { // Gibt die Anzahl der Vokabeln aus den Stacks eines Kurses zurück
        const potStack = await this.countVocabularyFromStack(potStackId); // Berechnet die Anzahl der Vokabeln im Pot-Stack
        const failedStack = await this.countVocabularyFromStack(failedStackId); // Berechnet die Anzahl der Vokabeln im Failed-Stack
        const successStack = await this.countVocabularyFromStack(successStackId); // Berechnet die Anzahl der Vokabeln im Success-Stack
        return potStack + failedStack + successStack; // Gibt die Summe der Vokabeln zurück
    }

    async deleteVocabularyFromStacks(stackIds: number[]) { // Löscht die Vokabeln aus den Stacks mit den übergebenen IDs
        stackIds.forEach(async stackId => {
            await this.db.execute(`DELETE FROM vocabulary WHERE stack_id = ${stackId}`);
        });
    }

    async addVocabulary(vocabulary: Vocabulary) { // Fügt eine neue Vokabel hinzu
        await this.db.execute(`INSERT INTO vocabulary (term, translation, description, stack_id) VALUES 
                                ('${vocabulary.term}', '${vocabulary.translation}', '${vocabulary.description}', ${vocabulary.stack_id})`);
    }

    async moveVocabularyToPot(stackId: number, potStackId: number) { // Verschiebt die Vokabeln aus dem Stack mit der übergebenen ID in den Pot-Stack
        await this.db.execute(`UPDATE vocabulary SET stack_id = ${potStackId} WHERE stack_id = ${stackId}`);
    }

    async updateStackId(vocabularyId: number, stackId: number) { // Aktualisiert den Stack der Vokabel mit der übergebenen ID
        await this.db.execute(`UPDATE vocabulary SET stack_id = ${stackId} WHERE id = ${vocabularyId}`);
    }

    async updateVocabulary(vocabulary: Vocabulary) { // Aktualisiert die Vokabel
        await this.db.execute(`UPDATE vocabulary SET term = '${vocabulary.term}', translation = '${vocabulary.translation}', description = '${vocabulary.description}' WHERE id = ${vocabulary.id}`);
    }

    async deleteVocabulary(vocabularyId: number) { // Löscht die Vokabel mit der übergebenen ID
        await this.db.execute(`DELETE FROM vocabulary WHERE id = ${vocabularyId}`);
    }
}