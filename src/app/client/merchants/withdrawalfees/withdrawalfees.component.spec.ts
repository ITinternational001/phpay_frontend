import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalfeesComponent } from './withdrawalfees.component';

describe('WithdrawalfeesComponent', () => {
  let component: WithdrawalfeesComponent;
  let fixture: ComponentFixture<WithdrawalfeesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WithdrawalfeesComponent]
    });
    fixture = TestBed.createComponent(WithdrawalfeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
