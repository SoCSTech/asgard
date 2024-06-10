export enum UserRoles {
    TECHNICIAN = "Technician",
    STANDARD = "Standard"
}

export interface IUser {
      id: string;
      username: string;
      shortName: string;
      fullName: string;
      initials: string;
      role: UserRoles;
      email: string;
      creationDate: Date;
    profilePictureUrl?: string;
}