import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletTransferCompletedComponent } from './wallet-transfer-completed.component';

describe('WalletTransferCompletedComponent', () => {
  let component: WalletTransferCompletedComponent;
  let fixture: ComponentFixture<WalletTransferCompletedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WalletTransferCompletedComponent]
    });
    fixture = TestBed.createComponent(WalletTransferCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
