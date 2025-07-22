import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionRedirectComponent } from './transaction-redirect.component';

describe('TransactionRedirectComponent', () => {
  let component: TransactionRedirectComponent;
  let fixture: ComponentFixture<TransactionRedirectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionRedirectComponent]
    });
    fixture = TestBed.createComponent(TransactionRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
