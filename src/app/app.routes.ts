import { Routes } from '@angular/router';
import { LatestComponent } from './latest/latest.component';
import { CategoriesComponent } from './categories/categories.component';
import { ViewAppComponent } from './view-app/view-app.component';
import { PopularComponent } from './popular/popular.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AppRouteGuard } from './app.route-guard';

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
    path: 'categories',
    component: CategoriesComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'categories/:categoryId',
    component: CategoriesComponent,
    canDeactivate: [AppRouteGuard],
  },
  {
    path: 'popular',
    component: PopularComponent,
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
