export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface ProfileFormData {
    department?: string | null;
    year?: number | null;
    rollNumber?: string | null;
    designation?: string | null;
}

export interface RegisterUserData {
    email: string;
    username: string;
    password: string;
    role: UserRole;
    department?: string | null;
    student?: {
        create: {
            year: number | null;
            rollNumber: string | null;
            skills: string[];
        }
    };
    teacher?: {
        create: {
            designation: string | null;
            skills: string[];
        }
    };
} 