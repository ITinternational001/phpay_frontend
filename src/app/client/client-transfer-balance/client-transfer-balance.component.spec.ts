import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTransferBalanceComponent } from './client-transfer-balance.component';

describe('ClientTransferBalanceComponent', () => {
  let component: ClientTransferBalanceComponent;
  let fixture: ComponentFixture<ClientTransferBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientTransferBalanceComponent]
    });
    fixture = TestBed.createComponent(ClientTransferBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
