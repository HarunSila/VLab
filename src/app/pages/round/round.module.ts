import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoundPageRoutingModule } from './round-routing.module';

import { RoundPage } from './round.page';
import { RoundStacksComponent } from 'src/app/components/round-stacks/round-stacks.component';
import { RoundQuestionsComponent } from 'src/app/components/round-questions/round-questions.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoundPageRoutingModule,
    RoundStacksComponent,
    RoundQuestionsComponent
  ],
  declarations: [RoundPage]
})
export class RoundPageModule {}
