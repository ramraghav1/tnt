import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddItinerary } from './add-itinerary';

describe('AddItinerary', () => {
  let component: AddItinerary;
  let fixture: ComponentFixture<AddItinerary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddItinerary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddItinerary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
