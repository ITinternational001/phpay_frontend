import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalCommissionComponent } from './total-commission.component';

describe('TotalCommissionComponent', () => {
  let component: TotalCommissionComponent;
  let fixture: ComponentFixture<TotalCommissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalCommissionComponent]
    });
    fixture = TestBed.createComponent(TotalCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
