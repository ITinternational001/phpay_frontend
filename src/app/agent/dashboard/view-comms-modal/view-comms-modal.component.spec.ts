import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCommsModalComponent } from './view-comms-modal.component';

describe('ViewCommsModalComponent', () => {
  let component: ViewCommsModalComponent;
  let fixture: ComponentFixture<ViewCommsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCommsModalComponent]
    });
    fixture = TestBed.createComponent(ViewCommsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
