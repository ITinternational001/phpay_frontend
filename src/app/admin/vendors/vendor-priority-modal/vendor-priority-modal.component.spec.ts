import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorPriorityModalComponent } from './vendor-priority-modal.component';

describe('VendorPriorityModalComponent', () => {
  let component: VendorPriorityModalComponent;
  let fixture: ComponentFixture<VendorPriorityModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorPriorityModalComponent]
    });
    fixture = TestBed.createComponent(VendorPriorityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
