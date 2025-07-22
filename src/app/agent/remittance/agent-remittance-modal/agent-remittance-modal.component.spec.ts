import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentRemittanceModalComponent } from './agent-remittance-modal.component';

describe('AgentRemittanceModalComponent', () => {
  let component: AgentRemittanceModalComponent;
  let fixture: ComponentFixture<AgentRemittanceModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgentRemittanceModalComponent]
    });
    fixture = TestBed.createComponent(AgentRemittanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
