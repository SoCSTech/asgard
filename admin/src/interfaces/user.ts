export interface IUser {
    id: string;
    username: string;
    shortName: string;
    fullName: string;
    initials: string;
    role: string;
    email: string;
    creationDate: Date;
    profilePictureUrl?: string;
    isDeleted: boolean;
    totpEnabled: boolean;
    totpSecret: string;
}

export const UserRoles = [
    { label: "Standard", value: "STANDARD" },
    { label: "Technician", value: "TECHNICIAN" },
]