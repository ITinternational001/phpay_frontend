import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittanceTableComponent } from './remittance-table.component';

describe('RemittanceTableComponent', () => {
  let component: RemittanceTableComponent;
  let fixture: ComponentFixture<RemittanceTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemittanceTableComponent]
    });
    fixture = TestBed.createComponent(RemittanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
