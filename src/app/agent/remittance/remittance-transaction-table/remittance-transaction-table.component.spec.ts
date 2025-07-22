import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittanceTransactionTableComponent } from './remittance-transaction-table.component';

describe('RemittanceTransactionTableComponent', () => {
  let component: RemittanceTransactionTableComponent;
  let fixture: ComponentFixture<RemittanceTransactionTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemittanceTransactionTableComponent]
    });
    fixture = TestBed.createComponent(RemittanceTransactionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
