///<reference path="../../../../node_modules/@types/jasmine/index.d.ts"/>
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientMock } from '../../../tests/client-mock.spec';
import { AccountAgeComponent } from './account-age.component';
import { CommonModule as NgCommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '../../common/common.module';
import { LegacyModule } from '../legacy/legacy.module';
import { ModalsModule } from '../modals/modals.module';
import { MindsFormsModule } from '../forms/forms.module';

describe('AccountAgeComponent', () => {
  let fixture: ComponentFixture<AccountAgeComponent>;

  const routes: Routes = [
    { path: 'howmanyhours', component: AccountAgeComponent }
  ];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        NgCommonModule,
        RouterModule.forChild(routes),
        CommonModule,
        LegacyModule,
        ModalsModule,
        MindsFormsModule
      ],
      declarations: [AccountAgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountAgeComponent);

    clientMock.response[`api/v2/howmanyhours`] = {
      'status': 'success',
      'seconds' : Date.now() - 3600000
    };
  });

  it('should display a number', () => {
    const instance = fixture.componentInstance;

    expect(instance.hours).not.toBeUndefined();
    expect(instance.hours).not.toBeNaN();
  });
  
});