import type { IEvent } from "./event";
import type { ITimetable } from "./timetable";

export interface TimetableListData {
    groupId: string;
    timetable: ITimetable;
    order: number;
    location: string;
    events: IEvent[];
}

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
    timetables: TimetableListData[];
}