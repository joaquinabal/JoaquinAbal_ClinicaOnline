import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
    {path: 'usuarios',
  //canActivate: [AdminGuard], // Protegido por guard
  loadChildren: () => import('./components/admin/usuarios/usuarios.module').then(m => m.UsuariosModule)},
   {
    path: 'login',
    component: LoginComponent
   },
  {
    path: 'registro',
    loadChildren: () => import('./components/auth/registro/registro.module').then(m => m.RegistroModule)
  },
  { path: '**', redirectTo: '' }
];
