import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationFormComponent } from './integration-form.component';

describe('IntegrationFormComponent', () => {
  let component: IntegrationFormComponent;
  let fixture: ComponentFixture<IntegrationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegrationFormComponent]
    });
    fixture = TestBed.createComponent(IntegrationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
