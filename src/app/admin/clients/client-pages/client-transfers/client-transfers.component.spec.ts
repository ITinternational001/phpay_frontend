import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTransfersComponent } from './client-transfers.component';

describe('ClientTransfersComponent', () => {
  let component: ClientTransfersComponent;
  let fixture: ComponentFixture<ClientTransfersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientTransfersComponent]
    });
    fixture = TestBed.createComponent(ClientTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
