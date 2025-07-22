import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentAllocationComponent } from './agent-allocation.component';

describe('AgentAllocationComponent', () => {
  let component: AgentAllocationComponent;
  let fixture: ComponentFixture<AgentAllocationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgentAllocationComponent]
    });
    fixture = TestBed.createComponent(AgentAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
