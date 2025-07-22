import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentlistComponent } from './agentlist.component';

describe('AgentlistComponent', () => {
  let component: AgentlistComponent;
  let fixture: ComponentFixture<AgentlistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgentlistComponent]
    });
    fixture = TestBed.createComponent(AgentlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
