import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceTransferTableComponent } from './balance-transfer-table.component';

describe('BalanceTransferTableComponent', () => {
  let component: BalanceTransferTableComponent;
  let fixture: ComponentFixture<BalanceTransferTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BalanceTransferTableComponent]
    });
    fixture = TestBed.createComponent(BalanceTransferTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
