import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { tenantRoutes } from './tenant/tenant.routes';
import { UserManagement } from './user/user-management/user-management';
import { RoleManagement } from './user/role-management/role-management';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { 
        path: 'tenant', 
        children: tenantRoutes,
        data: { breadcrumb: 'Tenant Management' }
    },
    {
        path: 'users',
        component: UserManagement,
        data: { breadcrumb: 'User Management' }
    },
    {
        path: 'roles',
        component: RoleManagement,
        data: { breadcrumb: 'Role Management' }
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
