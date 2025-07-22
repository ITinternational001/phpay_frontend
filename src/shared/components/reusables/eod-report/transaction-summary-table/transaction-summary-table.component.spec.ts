import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSummaryTableComponent } from './transaction-summary-table.component';

describe('TransactionSummaryTableComponent', () => {
  let component: TransactionSummaryTableComponent;
  let fixture: ComponentFixture<TransactionSummaryTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionSummaryTableComponent]
    });
    fixture = TestBed.createComponent(TransactionSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
