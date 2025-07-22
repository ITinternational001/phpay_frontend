import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallettransferHistoryComponent } from './wallettransfer-history.component';

describe('WallettransferHistoryComponent', () => {
  let component: WallettransferHistoryComponent;
  let fixture: ComponentFixture<WallettransferHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WallettransferHistoryComponent]
    });
    fixture = TestBed.createComponent(WallettransferHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
