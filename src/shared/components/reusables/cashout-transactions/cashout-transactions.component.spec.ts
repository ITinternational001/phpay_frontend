import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashoutTransactionsComponent } from './cashout-transactions.component';

describe('CashoutTransactionsComponent', () => {
  let component: CashoutTransactionsComponent;
  let fixture: ComponentFixture<CashoutTransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashoutTransactionsComponent]
    });
    fixture = TestBed.createComponent(CashoutTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
