import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualTopupTableComponent } from './manual-topup-table.component';

describe('ManualTopupTableComponent', () => {
  let component: ManualTopupTableComponent;
  let fixture: ComponentFixture<ManualTopupTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManualTopupTableComponent]
    });
    fixture = TestBed.createComponent(ManualTopupTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
