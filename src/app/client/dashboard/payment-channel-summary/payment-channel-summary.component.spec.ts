import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentChannelSummaryComponent } from './payment-channel-summary.component';

describe('PaymentChannelSummaryComponent', () => {
  let component: PaymentChannelSummaryComponent;
  let fixture: ComponentFixture<PaymentChannelSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentChannelSummaryComponent]
    });
    fixture = TestBed.createComponent(PaymentChannelSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
