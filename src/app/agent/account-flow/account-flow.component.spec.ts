import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountFlowComponent } from './account-flow.component';

describe('AccountFlowComponent', () => {
  let component: AccountFlowComponent;
  let fixture: ComponentFixture<AccountFlowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountFlowComponent]
    });
    fixture = TestBed.createComponent(AccountFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
