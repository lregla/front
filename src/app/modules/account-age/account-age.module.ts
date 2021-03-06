import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule as NgFormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '../../common/common.module';
import { LegacyModule } from '../legacy/legacy.module';
import { ModalsModule } from '../modals/modals.module';
import { MindsFormsModule } from '../forms/forms.module';

import { AccountAgeComponent } from './account-age.component';

const routes: Routes = [
  { path: 'howmanyhours', component: AccountAgeComponent }
];

@NgModule({
  imports: [
    NgCommonModule,
    RouterModule.forChild(routes),
    CommonModule,
    LegacyModule,
    ModalsModule,
    MindsFormsModule,
  ],
  declarations: [
    AccountAgeComponent
  ],
  entryComponents: [
    AccountAgeComponent
  ]
})

export class AccountAgeModule {
}
