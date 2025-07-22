import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhitelistingFormComponent } from './whitelisting-form.component';

describe('WhitelistingFormComponent', () => {
  let component: WhitelistingFormComponent;
  let fixture: ComponentFixture<WhitelistingFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WhitelistingFormComponent]
    });
    fixture = TestBed.createComponent(WhitelistingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
