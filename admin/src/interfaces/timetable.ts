export interface ITimetable {
    id: string;
    spaceCode: string;
    name: string;
    creationDate: Date;
    capacity: number;
    canCombine: boolean;
    combinedPartnerId: string;
    isDeleted: boolean;
    dataSource: string;
}