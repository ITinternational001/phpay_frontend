import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentDownlineComponent } from './agent-downline.component';

describe('AgentDownlineComponent', () => {
  let component: AgentDownlineComponent;
  let fixture: ComponentFixture<AgentDownlineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgentDownlineComponent]
    });
    fixture = TestBed.createComponent(AgentDownlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
