import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopViewDetailsComponent } from './cop-view-details.component';

describe('CopViewDetailsComponent', () => {
  let component: CopViewDetailsComponent;
  let fixture: ComponentFixture<CopViewDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CopViewDetailsComponent]
    });
    fixture = TestBed.createComponent(CopViewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
