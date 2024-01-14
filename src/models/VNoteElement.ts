import { VNoteContent } from "./VNoteContaint";

export class VNoteElement {
    type: string;
    content: VNoteContent;
    id: number;
    constructor(type: string, content: VNoteContent, id: number) {
        this.type = type;
        this.content = content;
        this.id = id;
    }

    static fromJSON(data: any): VNoteElement {
        return new VNoteElement(data.type, VNoteContent.fromJSON(data), data.id);
    }
}