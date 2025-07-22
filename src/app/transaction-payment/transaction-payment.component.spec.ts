import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPaymentComponent } from './transaction-payment.component';

describe('TransactionPaymentComponent', () => {
  let component: TransactionPaymentComponent;
  let fixture: ComponentFixture<TransactionPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionPaymentComponent]
    });
    fixture = TestBed.createComponent(TransactionPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
