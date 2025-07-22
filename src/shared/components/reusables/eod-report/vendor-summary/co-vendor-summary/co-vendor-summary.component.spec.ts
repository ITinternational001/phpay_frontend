import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoVendorSummaryComponent } from './co-vendor-summary.component';

describe('CoVendorSummaryComponent', () => {
  let component: CoVendorSummaryComponent;
  let fixture: ComponentFixture<CoVendorSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoVendorSummaryComponent]
    });
    fixture = TestBed.createComponent(CoVendorSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
