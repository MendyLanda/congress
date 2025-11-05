import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNeedyFormComponent } from './add-needy-form.component';

describe('AddNeedyFormComponent', () => {
  let component: AddNeedyFormComponent;
  let fixture: ComponentFixture<AddNeedyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNeedyFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNeedyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
