import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoTransactionSummaryComponent } from './co-transaction-summary.component';

describe('CoTransactionSummaryComponent', () => {
  let component: CoTransactionSummaryComponent;
  let fixture: ComponentFixture<CoTransactionSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoTransactionSummaryComponent]
    });
    fixture = TestBed.createComponent(CoTransactionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
