import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAccessComponent } from './page-access.component';

describe('PageAccessComponent', () => {
  let component: PageAccessComponent;
  let fixture: ComponentFixture<PageAccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageAccessComponent]
    });
    fixture = TestBed.createComponent(PageAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
