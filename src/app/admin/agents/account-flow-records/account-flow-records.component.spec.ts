import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountFlowRecordsComponent } from './account-flow-records.component';

describe('AccountFlowRecordsComponent', () => {
  let component: AccountFlowRecordsComponent;
  let fixture: ComponentFixture<AccountFlowRecordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountFlowRecordsComponent]
    });
    fixture = TestBed.createComponent(AccountFlowRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
