import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitylogsComponent } from './activitylogs.component';

describe('ActivitylogsComponent', () => {
  let component: ActivitylogsComponent;
  let fixture: ComponentFixture<ActivitylogsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActivitylogsComponent]
    });
    fixture = TestBed.createComponent(ActivitylogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
