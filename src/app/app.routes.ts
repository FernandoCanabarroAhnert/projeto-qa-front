import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        title: 'Home',
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
];
