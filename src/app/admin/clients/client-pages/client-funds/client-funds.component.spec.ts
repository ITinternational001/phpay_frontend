import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFundsComponent } from './client-funds.component';

describe('ClientFundsComponent', () => {
  let component: ClientFundsComponent;
  let fixture: ComponentFixture<ClientFundsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientFundsComponent]
    });
    fixture = TestBed.createComponent(ClientFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
