import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EodReportComponent } from './eod-report.component';

describe('EodReportComponent', () => {
  let component: EodReportComponent;
  let fixture: ComponentFixture<EodReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EodReportComponent]
    });
    fixture = TestBed.createComponent(EodReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
