import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBalanceRequestTableComponent } from './transfer-balance-request-table.component';

describe('TransferBalanceRequestTableComponent', () => {
  let component: TransferBalanceRequestTableComponent;
  let fixture: ComponentFixture<TransferBalanceRequestTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferBalanceRequestTableComponent]
    });
    fixture = TestBed.createComponent(TransferBalanceRequestTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
