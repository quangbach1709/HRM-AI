import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType, ROLE_DEFAULT_PATHS } from '@/types/auth';
import { Staff } from '@/types/staff';
import { Person } from '@/types/person';
import { authApi } from '@/services/api';
import { staffApi } from '@/services/staffApi';
import { personApi } from '@/services/personApi';
import { useToast } from '@/hooks/use-toast';

const AUTH_STORAGE_KEY = 'hrm_user';
const TOKEN_STORAGE_KEY = 'hrm_token';
const STAFF_STORAGE_KEY = 'hrm_staff';
const PERSON_STORAGE_KEY = 'hrm_person';

// Map backend roles to frontend roles
// Backend: ROLE_ADMIN, ROLE_USER, ROLE_MANAGER, ROLE_HR
// Frontend: admin, employee, manager, hr
const mapBackendRole = (backendRole: string): UserRole => {
    const role = backendRole.replace('ROLE_', '').toLowerCase();
    // Map 'user' from backend to 'employee' on frontend
    if (role === 'user') return 'employee';
    return role as UserRole;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [staff, setStaff] = useState<Staff | null>(null);
    const [person, setPerson] = useState<Person | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch staff and person data
    const fetchStaffAndPerson = async () => {
        try {
            const [staffData, personData] = await Promise.all([
                staffApi.getCurrent().catch((err) => {
                    console.error('Error fetching staff:', err);
                    toast({
                        title: 'Lỗi',
                        description: err.message || 'Không thể tải thông tin nhân viên',
                        variant: 'destructive',
                    });
                    return null;
                }),
                personApi.getCurrent().catch((err) => {
                    console.error('Error fetching person:', err);
                    toast({
                        title: 'Lỗi',
                        description: err.message || 'Không thể tải thông tin cá nhân',
                        variant: 'destructive',
                    });
                    return null;
                }),
            ]);

            setStaff(staffData);
            setPerson(personData);

            if (staffData) {
                localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffData));
            }
            if (personData) {
                localStorage.setItem(PERSON_STORAGE_KEY, JSON.stringify(personData));
            }
        } catch (error) {
            console.error('Error fetching staff/person:', error);
        }
    };

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
                const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
                const storedStaff = localStorage.getItem(STAFF_STORAGE_KEY);
                const storedPerson = localStorage.getItem(PERSON_STORAGE_KEY);

                if (storedUser && storedToken) {
                    // Verify token is still valid by calling /me endpoint
                    try {
                        const response = await authApi.getCurrentUser(storedToken);
                        const roles = response.roles?.map(mapBackendRole) || ['employee'];
                        const userData: User = {
                            id: response.id,
                            staffId: response.staffId,
                            name: response.username,
                            email: response.email,
                            roles: roles,
                        };
                        setUser(userData);
                        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));

                        // Load cached staff/person or fetch fresh
                        if (storedStaff) {
                            setStaff(JSON.parse(storedStaff));
                        }
                        if (storedPerson) {
                            setPerson(JSON.parse(storedPerson));
                        }

                        // Refresh staff/person data in background
                        fetchStaffAndPerson();
                    } catch {
                        // Token invalid, clear storage
                        localStorage.removeItem(AUTH_STORAGE_KEY);
                        localStorage.removeItem(TOKEN_STORAGE_KEY);
                        localStorage.removeItem(STAFF_STORAGE_KEY);
                        localStorage.removeItem(PERSON_STORAGE_KEY);
                        setUser(null);
                        setStaff(null);
                        setPerson(null);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string): Promise<{ error: string | null }> => {
        try {
            const response = await authApi.login({ username: email, password });

            const roles = response.roles?.map(mapBackendRole) || ['employee'];

            const userData: User = {
                id: response.id,
                staffId: response.staffId,
                name: response.username,
                email: response.email,
                roles: roles,
            };

            setUser(userData);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
            localStorage.setItem(TOKEN_STORAGE_KEY, response.token);

            // Fetch and cache staff/person data after login
            await fetchStaffAndPerson();

            return { error: null };
        } catch (error: any) {
            return { error: error.message || 'Đăng nhập thất bại' };
        }
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        setStaff(null);
        setPerson(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(STAFF_STORAGE_KEY);
        localStorage.removeItem(PERSON_STORAGE_KEY);
    };

    const hasRole = (role: UserRole): boolean => {
        if (!user) return false;
        return user.roles.includes(role);
    };

    const hasAnyRole = (roles: UserRole[]): boolean => {
        if (!user) return false;
        return roles.some(role => user.roles.includes(role));
    };

    const isAuthenticated = !!user;

    // Refresh user data (staff and person)
    const refreshUserData = async () => {
        await fetchStaffAndPerson();
    };

    const value: AuthContextType = {
        user,
        staff,
        person,
        isLoading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        hasAnyRole,
        refreshUserData,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useDefaultPath(): string {
    const { user } = useAuth();
    if (!user) return '/login';
    return ROLE_DEFAULT_PATHS[user.roles[0]] || '/employee';
}