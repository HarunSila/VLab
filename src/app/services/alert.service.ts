import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";

/*
 * Funktionalität: Anzeige von Alerts für verschiedene Aktionen in der Anwendung.
 *               Die Alerts werden über den AlertController von Ionic erstellt und angezeigt.
 *              Über initAlert() wird ein Alert mit den übergebenen Parametern initialisiert.
 *             Für verschiedene Aktionen gibt es spezifische Funktionen, die initAlert() mit entsprechenden Parametern aufrufen 
 *             und das Ergebnis bei Bedarf zurückgeben.
 */

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    constructor(private alertController: AlertController) { }

    // Alert für das Verschieben des Stacks zum Pot-Stack -> Rückgabe des Ergebnisses
    async moveStackToPotAlert(){
        const alert = await this.initAlert('Move stack to pot?', [
            { text: 'Cancel', role: 'cancel', cssClass: 'alert-button-cancel'},
            { text: 'OK', role: 'confirm', cssClass: 'alert-button-confirm'}
        ]);
        await alert.present();
        const result = await alert.onDidDismiss();
        return result.role;
    }

    // ALert für das Löschen eines Kurses -> Rückgabe des Ergebnisses
    async deleteCourseAlert(){
        const alert = await this.initAlert('Delete Course', [
            { text: 'Cancel', role: 'cancel', cssClass: 'alert-button-cancel'},
            { text: 'OK', role: 'confirm', cssClass: 'alert-button-confirm' },
        ]);
        await alert.present();
        const result = await alert.onDidDismiss();
        return result.role;
    }

    // Alert für das Hinzufügen einer neuen Sprache -> Error-Alert
    async addLanguageErrorAlert(){
        const alert = await this.initAlert('You can only have 14 languages.', [
            { text: 'OK', role: 'confirm', cssClass: 'alert-button-confirm'}
        ]);
        await alert.present();
    }

    // Alert für das Hinzufügen einer neuen Sprache 
    // -> Bietet ein Eingabefeld für die Sprache und gibt die Eingabe zurück, wenn der Nutzer auf OK klickt
    async addLanguageAlert(){
        const alert = await this.initAlert('New Language',
        [
            { text: 'Cancel', role: 'cancel', cssClass: 'alert-button-cancel' },
            { text: 'OK', role: 'confirm', cssClass: 'alert-button-confirm' }
        ],
        [{
            name: 'userInput',
            placeholder: 'Language',
            attributes: {
                maxlength: 12
            },
            value: '' 
        }]);

        await alert.present();
        const result = await alert.onDidDismiss();
        const role = result.role;
        return role === 'confirm' ?  result.data.values.userInput : '';
    } 

    // Initialisiert einen Alert mit den übergebenen Parametern für den Header, die Buttons und (optional) die Input-Felder
    async initAlert( header: string, buttons: any[], inputFields?: any[]){
        return await this.alertController.create({
            header: header,
            inputs: inputFields ? inputFields : [],
            buttons: buttons,
            cssClass: 'custom-alert'
        });
    }
}