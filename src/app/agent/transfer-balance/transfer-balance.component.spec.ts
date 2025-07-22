import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBalanceComponent } from './transfer-balance.component';

describe('TransferBalanceComponent', () => {
  let component: TransferBalanceComponent;
  let fixture: ComponentFixture<TransferBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferBalanceComponent]
    });
    fixture = TestBed.createComponent(TransferBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
