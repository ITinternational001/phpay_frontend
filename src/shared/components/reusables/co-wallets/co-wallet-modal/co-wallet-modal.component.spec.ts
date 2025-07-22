import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoWalletModalComponent } from './co-wallet-modal.component';

describe('CoWalletModalComponent', () => {
  let component: CoWalletModalComponent;
  let fixture: ComponentFixture<CoWalletModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoWalletModalComponent]
    });
    fixture = TestBed.createComponent(CoWalletModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
