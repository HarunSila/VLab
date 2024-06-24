import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseCreationPage } from './course-creation.page';

const routes: Routes = [
  {
    path: '',
    component: CourseCreationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseCreationPageRoutingModule {}
