import { Routes } from '@angular/router';

export const inventoryV2Routes: Routes = [
    // Locations
    { path: 'locations', loadComponent: () => import('./locations/location-list').then(m => m.LocationList) },

    // Hotels
    { path: 'hotels', loadComponent: () => import('./hotels/hotel-list').then(m => m.HotelList) },
    { path: 'hotels/new', loadComponent: () => import('./hotels/hotel-form').then(m => m.HotelForm) },
    { path: 'hotels/edit/:id', loadComponent: () => import('./hotels/hotel-form').then(m => m.HotelForm) },
    { path: 'hotels/:id', loadComponent: () => import('./hotels/hotel-form').then(m => m.HotelForm) },

    // Vehicles
    { path: 'vehicles', loadComponent: () => import('./vehicles/vehicle-list').then(m => m.VehicleList) },
    { path: 'vehicles/new', loadComponent: () => import('./vehicles/vehicle-form').then(m => m.VehicleForm) },
    { path: 'vehicles/edit/:id', loadComponent: () => import('./vehicles/vehicle-form').then(m => m.VehicleForm) },

    // Guides
    { path: 'guides', loadComponent: () => import('./guides/guide-list').then(m => m.GuideList) },

    // Activities
    { path: 'activities', loadComponent: () => import('./activities/activity-list').then(m => m.ActivityList) },

    // Seasons
    { path: 'seasons', loadComponent: () => import('./seasons/season-list').then(m => m.SeasonList) },

    // Currency & Exchange Rates
    { path: 'currencies', loadComponent: () => import('./currency/currency-list').then(m => m.CurrencyList) },

    // Vehicle Routes
    { path: 'vehicle-routes', loadComponent: () => import('./vehicle-routes/vehicle-route-list').then(m => m.VehicleRouteList) },

    // Default redirect
    { path: '', redirectTo: 'locations', pathMatch: 'full' }
];
