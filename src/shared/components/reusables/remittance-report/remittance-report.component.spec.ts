import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittanceReportComponent } from './remittance-report.component';

describe('RemittanceReportComponent', () => {
  let component: RemittanceReportComponent;
  let fixture: ComponentFixture<RemittanceReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemittanceReportComponent]
    });
    fixture = TestBed.createComponent(RemittanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
