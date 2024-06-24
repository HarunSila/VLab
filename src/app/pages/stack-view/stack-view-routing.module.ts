import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StackViewPage } from './stack-view.page';

const routes: Routes = [
  {
    path: '',
    component: StackViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StackViewPageRoutingModule {}
