import { Injectable } from "@angular/core";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Stack } from "src/app/models/stack";
import { DatabaseService } from "./db.service";

/*
 *  Funktionalität: Dieser Service stellt Methoden zur Verfügung, um auf die Stacks in der Datenbank zuzugreifen und diese zu verwalten.
 *  Services: DatabaseService
 */

@Injectable({
    providedIn: 'root'
})
export class DBStackService {
    db!: SQLiteDBConnection; // Speichert die Datenbankverbindung
    
    constructor(private dbService: DatabaseService) {}

    async initDatabaseConnecton(){ // Initialisiert die Datenbankverbindung
        this.dbService.whenInitialized().subscribe((initialized) => { // Wartet auf die Initialisierung der Datenbank
            if(initialized){
                this.db = this.dbService.getDB(); // Holt sich die Datenbankverbindung
            }
        });
    }

    async getStacks() { // Gibt alle Stacks zurück
        const result = await this.db.query('SELECT * FROM stack;');
        return result.values as Stack[] || [];
    }
    
    async getStack(id: number) { // Gibt den Stack mit der übergebenen ID zurück
        const stacks = await this.getStacks();
        return stacks.find(stack => stack.id === id)!;
    }

    async addStack(status: string) { // Fügt einen neuen Stack hinzu
        return await this.db.execute(`INSERT INTO stack (status) VALUES ('${status}');`);
    }

    async deleteStack(id: number) { // Löscht den Stack mit der übergebenen ID
        await this.db.execute(`DELETE FROM stack WHERE id = ${id};`);
    } 

    async deleteStacks(ids: number[]) { // Löscht die Stacks mit den übergebenen IDs
        ids.forEach(async id => {
            await this.deleteStack(id); // Löscht jeden Stack
        });
    }
}