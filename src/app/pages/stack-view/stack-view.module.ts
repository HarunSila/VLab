import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StackViewPageRoutingModule } from './stack-view-routing.module';

import { StackViewPage } from './stack-view.page';
import { CourseMetricsComponent } from 'src/app/components/course-metrics/course-metrics.component';
import { VocabularyViewerComponent } from 'src/app/components/vocabulary-viewer/vocabulary-viewer.component';
import { AddVocabularyModalComponent } from 'src/app/components/add-vocabulary-modal/add-vocabulary-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StackViewPageRoutingModule,
    CourseMetricsComponent,
    VocabularyViewerComponent,
    AddVocabularyModalComponent
  ],
  declarations: [StackViewPage]
})
export class StackViewPageModule {}
