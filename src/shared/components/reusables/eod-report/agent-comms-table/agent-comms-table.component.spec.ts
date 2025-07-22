import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentCommsTableComponent } from './agent-comms-table.component';

describe('AgentCommsTableComponent', () => {
  let component: AgentCommsTableComponent;
  let fixture: ComponentFixture<AgentCommsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgentCommsTableComponent]
    });
    fixture = TestBed.createComponent(AgentCommsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
