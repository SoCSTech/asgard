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
}