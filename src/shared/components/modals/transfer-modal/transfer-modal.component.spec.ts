import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferModalComponent } from './transfer-modal.component';

describe('TransferModalComponent', () => {
  let component: TransferModalComponent;
  let fixture: ComponentFixture<TransferModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferModalComponent]
    });
    fixture = TestBed.createComponent(TransferModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
