import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CoursePageRoutingModule } from './course-routing.module';

import { CoursePage } from './course.page';
import { CourseMetricsComponent } from 'src/app/components/course-metrics/course-metrics.component';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoursePageRoutingModule,
    CourseMetricsComponent,
    RoundProgressComponent
  ],
  declarations: [CoursePage]
})
export class CoursePageModule {}
