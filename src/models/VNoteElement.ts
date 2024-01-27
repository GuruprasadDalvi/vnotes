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

    toObject(): any {
        return {
            type: this.type,
            content: this.content.toObject(),
            id: this.id
        }
    }

    parseID(map:  Map<number, VNoteContent>) {
        this.content.parseID(map);
    }

    setContent(content: VNoteContent) {
        this.content = content;
    }

    updateContent(content: string) {
        this.content.updateContent(content);
    }
}