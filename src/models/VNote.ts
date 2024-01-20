import { VNoteData } from "./VNoteData";
import * as fs from 'fs';

export class VNote {
    filePath: string;
    title: string;
    creationTimestamp: number;
    lastUpdatedTimestamp: number;
    tag: string;
    data: VNoteData;

    constructor(filePath: string, title: string, creationTimestamp: number, lastUpdatedTimestamp: number, tag: string) {
        this.filePath = filePath;
        this.title = title;
        this.creationTimestamp = creationTimestamp;
        this.lastUpdatedTimestamp = lastUpdatedTimestamp;
        this.tag = tag;
        this.data = new VNoteData([]); // Initialize with an empty instance of VNoteData
    }

    save() {
        const content = this.data.toVNoteData();
        fs.writeFileSync(this.filePath, content);
    }

    loadData() {
        const content = fs.readFileSync(this.filePath, 'utf8');
        this.data = VNoteData.fromJSON(content);
        this.data.createIDMap();
    }
}
