import { Routes } from '@angular/router';
import { ProposalView } from './proposal-view';
import { ProposalPayment } from './proposal-payment';
import { ProposalFeedback } from './proposal-feedback';

export const proposalPublicRoutes: Routes = [
    {
        path: ':token',
        component: ProposalView,
        title: 'Your Itinerary Proposal'
    },
    {
        path: ':token/payment',
        component: ProposalPayment,
        title: 'Payment — Itinerary Proposal'
    },
    {
        path: ':token/feedback',
        component: ProposalFeedback,
        title: 'Feedback — Itinerary Proposal'
    }
];
