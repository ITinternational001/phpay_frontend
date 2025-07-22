import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBalanceModalComponent } from './transfer-balance-modal.component';

describe('TransferBalanceModalComponent', () => {
  let component: TransferBalanceModalComponent;
  let fixture: ComponentFixture<TransferBalanceModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferBalanceModalComponent]
    });
    fixture = TestBed.createComponent(TransferBalanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
