import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, Platform, ToastController } from '@ionic/angular';
import { Vocabulary } from 'src/app/models/vocabulary';

/*
 * Verwendung: stack-view Seite
 * Funktionalität: Modal-Komponente zum Hinzufügen einer neuen Vokabel
 *               mit Eingabefeldern für Term, Translation und Description
 *              und Bestätigungs- und Abbruch-Button
 *             mit Überprüfung der Eingabe auf maximale Länge
 *            und Anzeige eines Toasts bei Fehleingabe.
*/

@Component({
  selector: 'app-add-vocabulary-modal',
  templateUrl: './add-vocabulary-modal.component.html',
  styleUrls: ['./add-vocabulary-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class AddVocabularyModalComponent {

  // Input Felder der Modal-Komponente zum Erstellen einer neuen Vokabel
  term!: string;
  description!: string;
  translation!: string;

  constructor(private modalCtrl: ModalController, private toastCtrl: ToastController, private platform: Platform) {
    this.platform.backButton.subscribe(() => this.cancel());
  }

  // Button Funktionen zum Schließen der Modal-Komponente ohne Aktion oder zum Bestätigen der Eingabe
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  // Button Funktion zur Überprüfung und Bestätigung der Eingabe
  confirm() {
    if(this.term.length > 50) 
      this.showToast('Term must be less than 30 characters', 5000);
    else if(this.description && this.description.length > 100)
      this.showToast('Description must be less than 60 characters', 5000);
    else if(this.translation.length > 50)
      this.showToast('Translation must be less than 30 characters', 5000);
    else{
      let vocabulary: Vocabulary = {
        term: this.term,
        translation: this.translation,
        description: this.description
      }
      return this.modalCtrl.dismiss(vocabulary, 'confirm');
    }
    return;
  }

  // Funktion zum Anzeigen eines Toasts mit dynamischer Nachricht und Dauer
  async showToast(message: string, duration: number) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      color: 'danger'
    });
    toast.present();
  }
}
