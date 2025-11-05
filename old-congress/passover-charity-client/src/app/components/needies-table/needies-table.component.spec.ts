import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeediesTableComponent } from './needies-table.component';

describe('NeediesTableComponent', () => {
  let component: NeediesTableComponent;
  let fixture: ComponentFixture<NeediesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NeediesTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NeediesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
