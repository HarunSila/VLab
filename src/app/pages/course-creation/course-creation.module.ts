import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourseCreationPageRoutingModule } from './course-creation-routing.module';

import { CourseCreationPage } from './course-creation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourseCreationPageRoutingModule
  ],
  declarations: [CourseCreationPage]
})
export class CourseCreationPageModule {}
