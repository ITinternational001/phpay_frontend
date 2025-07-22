import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfeeAddFormComponent } from './wfee-add-form.component';

describe('WfeeAddFormComponent', () => {
  let component: WfeeAddFormComponent;
  let fixture: ComponentFixture<WfeeAddFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WfeeAddFormComponent]
    });
    fixture = TestBed.createComponent(WfeeAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
