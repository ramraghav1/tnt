import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryList } from './itinerary-list';

describe('ItineraryList', () => {
  let component: ItineraryList;
  let fixture: ComponentFixture<ItineraryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItineraryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
