import { Injectable } from "@angular/core";
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from "@capacitor-community/sqlite";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";

/*
 * Funktionalität: Dieser Service stellt Methoden zur Verfügung, um auf die Datenbank zuzugreifen und diese zu verwalten.
 */

const DB_USER = 'user';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    private isInitialized = new BehaviorSubject<boolean>(false); // Speichert den Initialisierungsstatus der Datenbank
    private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite); // Speichert die SQLite-Verbindung
    private db!: SQLiteDBConnection; // Speichert die Datenbankverbindung

    constructor() {}

    async initilizeConnection() { // Initilisierung der Datenbankverbindung
        this.db = await this.sqlite.createConnection(DB_USER, false, 'no-encryption', 1, false); // Erstellt eine neue Datenbankverbindung
        await this.db.open(); // Öffnet die Datenbank
        await this.db.execute(environment.createTableSchema); // Erstellt die Tabellen in der Datenbank
        this.isInitialized.next(true); // Setzt den Initialisierungsstatus auf true
    }

    whenInitialized(): Observable<boolean> { // Gibt den Initialisierungsstatus der Datenbank zurück
        return this.isInitialized.asObservable();
    }

    getDB() { // Gibt die Datenbankverbindung zurück
        return this.db;
    }

    async getLastInsertedId() { // Gibt die ID der zuletzt eingefügten Zeile zurück
        const result = await this.db.query('SELECT last_insert_rowid() as id;');
        return result.values![0].id;
    }     
}