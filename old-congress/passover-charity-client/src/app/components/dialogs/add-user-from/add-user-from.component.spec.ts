import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserFromComponent } from './add-user-from.component';

describe('AddUserFromComponent', () => {
  let component: AddUserFromComponent;
  let fixture: ComponentFixture<AddUserFromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUserFromComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
