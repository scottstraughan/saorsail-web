import { Routes } from '@angular/router';
import { LatestComponent } from './latest/latest.component';
import { ViewAppComponent } from './view-app/view-app.component';
import { PopularComponent } from './popular/popular.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AppRouteGuard } from './app.route-guard';
import { BrowseComponent } from './browse/browse.component';
import { FavoritesComponent } from './favorites/favorites.component';

export const routes: Routes = [
  {
    path: 'welcome',
    component: WelcomeComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'latest',
    component: LatestComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'latest/:sort',
    component: LatestComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'browse',
    component: BrowseComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'popular',
    component: PopularComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'app/:appPackageName',
    component: ViewAppComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'app/:appPackageName/:appPackageVersion',
    component: ViewAppComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: '**',
    redirectTo: 'latest',
    canDeactivate: [AppRouteGuard],
  },
];
