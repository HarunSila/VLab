import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DragGestureService } from './services/drag-gesture.service';
import { AlertService } from './services/alert.service';
import { SwipeGestureService } from './services/swipe-gesture.service';
import { DatabaseService } from './services/db/db.service';
import { DBCourseService } from './services/db/db-course.service';
import { DBLanguageService } from './services/db/db-language.service';
import { DBStackService } from './services/db/db-stack.service';
import { DBVocabularyService } from './services/db/db-vocabulary.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DragGestureService, AlertService, SwipeGestureService, DatabaseService,
    DBCourseService, DBLanguageService, DBStackService, DBVocabularyService],
  bootstrap: [AppComponent],
})
export class AppModule {}
