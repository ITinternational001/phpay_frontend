import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRemittancesComponent } from './client-remittances.component';

describe('ClientRemittancesComponent', () => {
  let component: ClientRemittancesComponent;
  let fixture: ComponentFixture<ClientRemittancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientRemittancesComponent]
    });
    fixture = TestBed.createComponent(ClientRemittancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
