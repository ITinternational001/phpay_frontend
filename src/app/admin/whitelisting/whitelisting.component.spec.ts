import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhitelistingComponent } from './whitelisting.component';

describe('WhitelistingComponent', () => {
  let component: WhitelistingComponent;
  let fixture: ComponentFixture<WhitelistingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WhitelistingComponent]
    });
    fixture = TestBed.createComponent(WhitelistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
