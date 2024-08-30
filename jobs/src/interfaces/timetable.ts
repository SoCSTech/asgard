export interface ITimetable {
    id: string;
    spaceCode: string;
    name: string;
    creationDate: Date;
    capacity: number;
    canCombine: boolean;
    combinedPartnerId: string;
    combinedPartnerSpaceCode: string;
    isDeleted: boolean;
    dataSource: string;
    dataUrl: string;
    defaultColour: string;
}