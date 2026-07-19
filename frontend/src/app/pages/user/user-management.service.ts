import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── User Management DTOs ────────────────────────────────────────
export interface CreateUserRequest {
    firstName: string;
    middleName?: string;
    lastName: string;
    gender?: string;
    emailAddress: string;
    phoneNumber: string;
    tenantId: number;
    organizationId: number;
    branchId: number;
    roleIds: number[];
}

export interface CreateUserResponse {
    userId: number;
    username: string;
    temporaryPassword: string;
    emailSent: boolean;
    resetToken: string;
    resetTokenExpiry: Date;
}

export interface UserListItem {
    userId: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    username: string;
    isActive: boolean;
    roles: string; // Comma-separated role names
    createdDate: Date;
    organizationId: number;
    branchId: number;
}

export interface PasswordResetRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

// ─── Role & Permission DTOs ────────────────────────────────────────
export interface Role {
    id: number;
    tenantId: number;
    productId: number;
    name: string;
    displayName: string;
    description?: string;
    isSystemRole: boolean;
    isActive: boolean;
}

export interface Permission {
    id: number;
    productId: number;
    name: string;
    displayName: string;
    description?: string;
    canCreate?: boolean;
    canRead?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export interface CreateRoleRequest {
    tenantId: number;
    productId: number;
    name: string;
    displayName?: string;
    description?: string;
}

export interface UpdateRoleRequest {
    displayName: string;
    description?: string;
    isActive: boolean;
}

export interface PermissionAssignment {
    permissionId: number;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private apiUrl = `${environment.apiBaseUrl}/UserManagement`;
    private roleUrl = `${environment.apiBaseUrl}/Role`;

    constructor(private http: HttpClient) { }

    // ─── User Management ────────────────────────────────────────
    createUser(request: CreateUserRequest): Observable<ApiResponse<CreateUserResponse>> {
        return this.http.post<ApiResponse<CreateUserResponse>>(`${this.apiUrl}/create`, request);
    }

    createBulkUsers(requests: CreateUserRequest[]): Observable<ApiResponse<CreateUserResponse[]>> {
        return this.http.post<ApiResponse<CreateUserResponse[]>>(`${this.apiUrl}/create-bulk`, requests);
    }

    getUsersByTenant(tenantId: number): Observable<ApiResponse<UserListItem[]>> {
        return this.http.get<ApiResponse<UserListItem[]>>(`${this.apiUrl}/tenant/${tenantId}`);
    }

    getUsersByOrganization(orgId: number): Observable<ApiResponse<UserListItem[]>> {
        return this.http.get<ApiResponse<UserListItem[]>>(`${this.apiUrl}/organization/${orgId}`);
    }

    deactivateUser(userId: number): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${userId}/deactivate`, {});
    }

    reactivateUser(userId: number): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${userId}/reactivate`, {});
    }

    requestPasswordReset(request: PasswordResetRequest): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/password-reset/request`, request);
    }

    resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-reset/confirm`, request);
    }

    // ─── Role Management ────────────────────────────────────────
    getRolesByTenantAndProduct(tenantId: number, productId: number): Observable<ApiResponse<Role[]>> {
        return this.http.get<ApiResponse<Role[]>>(`${this.roleUrl}/tenant/${tenantId}/product/${productId}`);
    }

    getPermissionsByProduct(productId: number): Observable<ApiResponse<Permission[]>> {
        return this.http.get<ApiResponse<Permission[]>>(`${this.roleUrl}/permissions/product/${productId}`);
    }

    getUserPermissions(userId: number): Observable<ApiResponse<Permission[]>> {
        return this.http.get<ApiResponse<Permission[]>>(`${this.roleUrl}/permissions/user/${userId}`);
    }

    createRole(request: CreateRoleRequest): Observable<ApiResponse<{ roleId: number }>> {
        return this.http.post<ApiResponse<{ roleId: number }>>(`${this.roleUrl}/create`, request);
    }

    updateRole(roleId: number, request: UpdateRoleRequest): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.roleUrl}/${roleId}`, request);
    }

    deleteRole(roleId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.roleUrl}/${roleId}`);
    }

    assignPermissionsToRole(roleId: number, permissions: PermissionAssignment[]): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.roleUrl}/${roleId}/permissions`, permissions);
    }

    getRolePermissions(roleId: number): Observable<ApiResponse<Permission[]>> {
        return this.http.get<ApiResponse<Permission[]>>(`${this.roleUrl}/${roleId}/permissions`);
    }
}
