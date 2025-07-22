import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittanceCompletedComponent } from './remittance-completed.component';

describe('RemittanceCompletedComponent', () => {
  let component: RemittanceCompletedComponent;
  let fixture: ComponentFixture<RemittanceCompletedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemittanceCompletedComponent]
    });
    fixture = TestBed.createComponent(RemittanceCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
