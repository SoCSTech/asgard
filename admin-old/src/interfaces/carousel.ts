export interface ICarouselItem {
    id: string;
    carousel: string;
    lastModified: Date;
    modifiedBy: string;
    type: string;
    contentUrl: string;
    name: string;
    isDeleted: boolean;
    durationMs: number;
    order: number;
}

export interface ICarousel {
    carousel: {
        id: string;
        timetable: string;
        lastModified: Date;
        modifiedBy: string;
        isDeleted: boolean;
    },
    items: [
        ICarouselItem
    ]
}