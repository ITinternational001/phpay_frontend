import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBalanceHistroyTableComponent } from './transfer-balance-histroy-table.component';

describe('TransferBalanceHistroyTableComponent', () => {
  let component: TransferBalanceHistroyTableComponent;
  let fixture: ComponentFixture<TransferBalanceHistroyTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferBalanceHistroyTableComponent]
    });
    fixture = TestBed.createComponent(TransferBalanceHistroyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
