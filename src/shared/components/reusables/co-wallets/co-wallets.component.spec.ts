import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoWalletsComponent } from './co-wallets.component';

describe('CoWalletsComponent', () => {
  let component: CoWalletsComponent;
  let fixture: ComponentFixture<CoWalletsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoWalletsComponent]
    });
    fixture = TestBed.createComponent(CoWalletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
