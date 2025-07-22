import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommsPerClientComponent } from './comms-per-client.component';

describe('CommsPerClientComponent', () => {
  let component: CommsPerClientComponent;
  let fixture: ComponentFixture<CommsPerClientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommsPerClientComponent]
    });
    fixture = TestBed.createComponent(CommsPerClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
