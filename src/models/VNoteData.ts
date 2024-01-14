import { VNoteElement } from "./VNoteElement";

export class VNoteData {
    elements: VNoteElement[];
    constructor(elements: VNoteElement[]) {
        this.elements = elements;
    }

    toHTML(): string {
        let html = "";
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            html += element.content.content.toHTML();
        }
        return html;
    }

    toVNoteData(): string {
        return JSON.stringify(this.elements);
    }
    
    static fromVNoteData(data: string): VNoteData {
        const elements = JSON.parse(data);
        return new VNoteData(elements);
    }

    static fromJSON(data: any): VNoteData {
        const elements = JSON.parse(data);
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element.content = VNoteElement.fromJSON(element);
        }
        return new VNoteData(elements);
    }

    
}