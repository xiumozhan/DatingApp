export interface Photo {
    id: number;
    url: string;
    description: string;
    dateAdded: Date;
    isAvatar: boolean;
    width: number;
    height: number;
    thumbnailUrl: string;
    selected?: boolean;
}
