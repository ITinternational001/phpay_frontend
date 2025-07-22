import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsSummaryComponent } from './clients-summary.component';

describe('ClientsSummaryComponent', () => {
  let component: ClientsSummaryComponent;
  let fixture: ComponentFixture<ClientsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientsSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
