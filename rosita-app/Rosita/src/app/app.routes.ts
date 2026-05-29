import { Routes } from '@angular/router';
import { RositaComponent } from './rosita/rosita.component';

export const routes: Routes = [
  { path: '', component: RositaComponent },
  { path: '**', redirectTo: '' }
];