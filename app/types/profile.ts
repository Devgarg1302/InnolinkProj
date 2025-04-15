export interface Experience {
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface Certification {
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
}

export interface StudentProfile {
    name: string;
    email: string;
    bio?: string;
    department: string;
    year: number;
    rollNumber: string;
    skills: string[];
    experiences: Experience[];
    certifications: Certification[];
} 