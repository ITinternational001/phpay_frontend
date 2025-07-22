import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalIncomeComponent } from './total-income.component';

describe('TotalIncomeComponent', () => {
  let component: TotalIncomeComponent;
  let fixture: ComponentFixture<TotalIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalIncomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
