import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningBalanceReportComponent } from './running-balance-report.component';

describe('RunningBalanceReportComponent', () => {
  let component: RunningBalanceReportComponent;
  let fixture: ComponentFixture<RunningBalanceReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RunningBalanceReportComponent]
    });
    fixture = TestBed.createComponent(RunningBalanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
