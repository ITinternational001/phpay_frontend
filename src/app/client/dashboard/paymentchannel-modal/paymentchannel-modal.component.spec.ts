import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentchannelModalComponent } from './paymentchannel-modal.component';

describe('PaymentchannelModalComponent', () => {
  let component: PaymentchannelModalComponent;
  let fixture: ComponentFixture<PaymentchannelModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentchannelModalComponent]
    });
    fixture = TestBed.createComponent(PaymentchannelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
