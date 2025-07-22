import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBalanceFormComponent } from './transfer-balance-form.component';

describe('TransferBalanceFormComponent', () => {
  let component: TransferBalanceFormComponent;
  let fixture: ComponentFixture<TransferBalanceFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferBalanceFormComponent]
    });
    fixture = TestBed.createComponent(TransferBalanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
