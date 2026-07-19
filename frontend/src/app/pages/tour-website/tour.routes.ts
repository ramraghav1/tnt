import { Routes } from '@angular/router';
import { TourHome } from './tour-home';
import { TourPackageDetail } from './tour-package-detail';

export const tourRoutes: Routes = [
    {
        path: '',
        component: TourHome,
        title: 'TNT Travels — Nepal Tour & Trekking Packages | Best Adventure Tours'
    },
    {
        path: 'package/:slug',
        component: TourPackageDetail
    }
];
