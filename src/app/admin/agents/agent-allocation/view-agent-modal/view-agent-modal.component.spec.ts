import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAgentModalComponent } from './view-agent-modal.component';

describe('ViewAgentModalComponent', () => {
  let component: ViewAgentModalComponent;
  let fixture: ComponentFixture<ViewAgentModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAgentModalComponent]
    });
    fixture = TestBed.createComponent(ViewAgentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
