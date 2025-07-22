import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPasswordResetComponent } from './client-password-reset.component';

describe('ClientPasswordResetComponent', () => {
  let component: ClientPasswordResetComponent;
  let fixture: ComponentFixture<ClientPasswordResetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientPasswordResetComponent]
    });
    fixture = TestBed.createComponent(ClientPasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
