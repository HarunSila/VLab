import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'course',
    loadChildren: () => import('./pages/course/course.module').then( m => m.CoursePageModule)
  },
  {
    path: 'course-creation',
    loadChildren: () => import('./pages/course-creation/course-creation.module').then( m => m.CourseCreationPageModule)
  },
  {
    path: 'round',
    loadChildren: () => import('./pages/round/round.module').then( m => m.RoundPageModule)
  },
  {
    path: 'stack-view',
    loadChildren: () => import('./pages/stack-view/stack-view.module').then( m => m.StackViewPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
