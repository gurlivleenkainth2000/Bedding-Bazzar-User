import { Routes } from '@angular/router';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { ProductsComponent } from 'src/app/pages/products/products.component';

export const AdminLayoutRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'products', component: ProductsComponent }
];
