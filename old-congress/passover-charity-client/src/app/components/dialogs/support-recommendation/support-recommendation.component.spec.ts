import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportRecommendationComponent } from './support-recommendation.component';

describe('SupportRecommendationComponent', () => {
  let component: SupportRecommendationComponent;
  let fixture: ComponentFixture<SupportRecommendationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupportRecommendationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
