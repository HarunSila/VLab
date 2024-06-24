import { Component } from '@angular/core';
import { DatabaseService } from './services/db/db.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { DBCourseService } from './services/db/db-course.service';
import { DBStackService } from './services/db/db-stack.service';
import { DBVocabularyService } from './services/db/db-vocabulary.service';
import { DBLanguageService } from './services/db/db-language.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  
  constructor(  private db: DatabaseService, 
                private dbCourseService: DBCourseService,
                private dbStackService: DBStackService,
                private dbVocabularyService: DBVocabularyService,
                private dbLanguageService: DBLanguageService) {
    this.initApp();
  }

  async initApp() {
    await SplashScreen.show({autoHide: false});
    await this.db.initilizeConnection();
    await this.dbCourseService.initDatabaseConnecton();
    await this.dbStackService.initDatabaseConnecton();
    await this.dbVocabularyService.initDatabaseConnecton();
    await this.dbLanguageService.initDatabaseConnecton();
    await SplashScreen.hide()
  }
}
