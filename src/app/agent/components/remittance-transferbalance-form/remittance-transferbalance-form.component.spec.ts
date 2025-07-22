import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittanceTransferbalanceFormComponent } from './remittance-transferbalance-form.component';

describe('RemittanceTransferbalanceFormComponent', () => {
  let component: RemittanceTransferbalanceFormComponent;
  let fixture: ComponentFixture<RemittanceTransferbalanceFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemittanceTransferbalanceFormComponent]
    });
    fixture = TestBed.createComponent(RemittanceTransferbalanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
