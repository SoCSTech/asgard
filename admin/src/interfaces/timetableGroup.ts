export interface ITimetableGroup {
    id: string;
    internalName: string;
    name: string;
    subtitle: string;
    lastModified: Date;
    modifiedBy: string;
    isDeleted: boolean;
    displayInfoPane: boolean;
    displayInfoPaneQR: boolean;
    infoPaneText: string;
    infoPaneQRUrl: string;
    object: string;
    verbAvailable: string;
    verbUnavailable: string;
}