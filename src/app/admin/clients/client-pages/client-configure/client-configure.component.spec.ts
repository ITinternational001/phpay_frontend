import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientConfigureComponent } from './client-configure.component';

describe('ClientConfigureComponent', () => {
  let component: ClientConfigureComponent;
  let fixture: ComponentFixture<ClientConfigureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientConfigureComponent]
    });
    fixture = TestBed.createComponent(ClientConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
