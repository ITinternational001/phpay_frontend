import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CofTableComponent } from './cof-table.component';

describe('CofTableComponent', () => {
  let component: CofTableComponent;
  let fixture: ComponentFixture<CofTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CofTableComponent]
    });
    fixture = TestBed.createComponent(CofTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
