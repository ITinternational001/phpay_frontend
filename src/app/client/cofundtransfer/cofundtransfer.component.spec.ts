import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CofundtransferComponent } from './cofundtransfer.component';

describe('CofundtransferComponent', () => {
  let component: CofundtransferComponent;
  let fixture: ComponentFixture<CofundtransferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CofundtransferComponent]
    });
    fixture = TestBed.createComponent(CofundtransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
