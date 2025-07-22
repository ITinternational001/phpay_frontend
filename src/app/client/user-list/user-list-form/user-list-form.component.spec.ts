import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListFormComponent } from './user-list-form.component';


describe('UserListFormComponent', () => {
  let component: UserListFormComponent;
  let fixture: ComponentFixture<UserListFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserListFormComponent]
    });
    fixture = TestBed.createComponent(UserListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
