import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './users/auth.guard';
import { RoleGuard } from './users/role.guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
  { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule) },
  { 
    path: 'student', 
    loadChildren: () => import('./student/student.module').then(m => m.StudentModule),
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['student'] }
  },
  { 
    path: 'company', 
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule),
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['company'] }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}