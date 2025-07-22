import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfBrandsComponent } from './list-of-brands.component';

describe('ListOfBrandsComponent', () => {
  let component: ListOfBrandsComponent;
  let fixture: ComponentFixture<ListOfBrandsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListOfBrandsComponent]
    });
    fixture = TestBed.createComponent(ListOfBrandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
