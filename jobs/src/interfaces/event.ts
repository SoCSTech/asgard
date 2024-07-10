export interface IEvent {
    id: string;
    name: string;
    staff: string;
    moduleCode: string;
    timetableId: string;
    type: string;
    colour: string;
    start: Date;
    end: Date;
    lastModified: Date;
    modifiedBy: string;
    isCombinedSession: boolean;
    group: string;
    externalId: string;
}