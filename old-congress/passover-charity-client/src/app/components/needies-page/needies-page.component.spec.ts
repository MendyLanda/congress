import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeediesPageComponent } from './needies-page.component';

describe('NeediesPageComponent', () => {
  let component: NeediesPageComponent;
  let fixture: ComponentFixture<NeediesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NeediesPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NeediesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
