export class VNote {
    filePath: string;
    title: string;
    creationTimestamp: number;
    lastUpdatedTimestamp: number;
    tag: string;

    constructor(filePath: string, title: string, creationTimestamp: number, lastUpdatedTimestamp: number, tag: string) {
        this.filePath = filePath;
        this.title = title;
        this.creationTimestamp = creationTimestamp;
        this.lastUpdatedTimestamp = lastUpdatedTimestamp;
        this.tag = tag;
    }
}
