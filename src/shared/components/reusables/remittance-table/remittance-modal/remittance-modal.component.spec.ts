import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittanceModalComponent } from './remittance-modal.component';

describe('RemittanceModalComponent', () => {
  let component: RemittanceModalComponent;
  let fixture: ComponentFixture<RemittanceModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemittanceModalComponent]
    });
    fixture = TestBed.createComponent(RemittanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
