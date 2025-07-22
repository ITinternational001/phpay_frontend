import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAndGraphComponent } from './table-and-graph.component';

describe('TableAndGraphComponent', () => {
  let component: TableAndGraphComponent;
  let fixture: ComponentFixture<TableAndGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableAndGraphComponent]
    });
    fixture = TestBed.createComponent(TableAndGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
