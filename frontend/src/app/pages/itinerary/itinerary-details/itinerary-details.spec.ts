import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryDetails } from './itinerary-details';

describe('ItineraryDetails', () => {
  let component: ItineraryDetails;
  let fixture: ComponentFixture<ItineraryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItineraryDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
