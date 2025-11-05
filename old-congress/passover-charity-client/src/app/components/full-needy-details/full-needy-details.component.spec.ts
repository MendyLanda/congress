import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullNeedyDetailsComponent } from './full-needy-details.component';

describe('FullNeedyDetailsComponent', () => {
  let component: FullNeedyDetailsComponent;
  let fixture: ComponentFixture<FullNeedyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullNeedyDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullNeedyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
