// API Client for backend communication
// Replaces Supabase client

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getToken(): string | null {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                return { error: data.error || data.message || 'Request failed' };
            }

            return { data };
        } catch (error) {
            console.error('API request failed:', error);
            return { error: 'Network error. Please try again.' };
        }
    }

    // GET request
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // POST request
    async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    // PUT request
    async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // Auth methods
    async login(email: string, password: string) {
        const result = await this.post<{ user: User; token: string }>('/auth/login', { email, password });
        if (result.data?.token) {
            this.setToken(result.data.token);
        }
        return result;
    }

    async register(email: string, password: string, full_name?: string) {
        const result = await this.post<{ user: User; token: string }>('/auth/register', { email, password, full_name });
        if (result.data?.token) {
            this.setToken(result.data.token);
        }
        return result;
    }

    async logout() {
        await this.post('/auth/logout');
        this.setToken(null);
    }

    async getMe() {
        return this.get<{ user: User }>('/auth/me');
    }
}

// Type definitions
export interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    roles?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface Student {
    id: string;
    enrollment_number: string;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    date_of_birth: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    course_id: string | null;
    batch_id: string | null;
    status: 'active' | 'inactive' | 'dropped' | 'graduated';
    admission_date: string | null;
    total_fee: number | null;
    paid_fee: number | null;
    fee_status: 'paid' | 'pending' | 'overdue' | 'partial';
    notes: string | null;
    courses?: { name: string } | null;
    batches?: { name: string } | null;
}

export interface Course {
    id: string;
    name: string;
    description: string | null;
    duration_months: number | null;
    fee_amount: number;
    image_url: string | null;
    is_active: boolean | null;
}

export interface Batch {
    id: string;
    name: string;
    course_id: string | null;
    start_date: string | null;
    end_date: string | null;
    capacity: number | null;
    is_active: boolean | null;
    courses?: { name: string } | null;
}

export interface Faculty {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    qualification: string | null;
    specialization: string | null;
    experience_years: number | null;
    joining_date: string | null;
    salary: number | null;
    address: string | null;
    is_active: boolean | null;
    bio: string | null;
    avatar_url: string | null;
}

export interface Test {
    id: string;
    name: string;
    course_id: string | null;
    batch_id: string | null;
    max_marks: number;
    passing_marks: number;
    test_date: string | null;
    description: string | null;
    is_active: boolean | null;
    courses?: { name: string } | null;
    batches?: { name: string } | null;
}

export interface Mark {
    id: string;
    student_id: string;
    test_id: string;
    marks_obtained: number;
    remarks: string | null;
    student_name?: string;
    enrollment_number?: string;
}

export interface FeePayment {
    id: string;
    student_id: string;
    amount: number;
    payment_date: string | null;
    payment_method: string | null;
    receipt_number: string | null;
    notes: string | null;
    student_name?: string;
    enrollment_number?: string;
}

export interface Enquiry {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    course_interest: string | null;
    message: string | null;
    status: string | null;
    created_at: string | null;
}

export interface Settings {
    institute?: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website: string;
        logo_url: string;
    };
    academic?: {
        current_session: string;
        session_start: string;
        session_end: string;
    };
    fees?: {
        late_fee_percentage: number;
        grace_period_days: number;
    };
}

// Create and export singleton instance
export const api = new ApiClient(API_BASE_URL);

export default api;
