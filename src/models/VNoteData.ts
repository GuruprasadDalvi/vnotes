import { VNoteContent } from "./VNoteContaint";
import { VNoteElement } from "./VNoteElement";

export class VNoteData {
    elements: VNoteElement[];
    idMap!: Map<number, VNoteContent>;
    constructor(elements: VNoteElement[]) {
        this.elements = elements;
    }

    toHTML(): string {
        let html = "";
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            html += element.content.toHTML();
        }
        return html;
    }

    toVNoteData(): string {
        let data = [];
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            
                const obj = element.toObject();
                data.push(obj);
        }
        return JSON.stringify(data, null, 4);
    }
    
    static fromVNoteData(data: string): VNoteData {
        const elements = JSON.parse(data);
        return new VNoteData(elements);
    }

    /**
     * Parsing the JSON data from the file
     * @param data json data from the file
     * @returns vnoteData 
     */
    static fromJSON(data: any): VNoteData {
        const elements = JSON.parse(data);
        let newElements = [];
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            newElements.push(VNoteElement.fromJSON(element));
            element = newElements[i];
        }
        console.log("newElements");
        console.log(newElements);
        return new VNoteData(newElements);
    }

    addElement(element: VNoteElement) {
        this.elements.push(element);
    }
    

    getNextId(): number {
        return this.idMap.size + 1;
    }



    createIDMap(): Map<number, VNoteContent> {
        let idMap = new Map<number, VNoteContent>();
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            element.parseID(idMap);
        }
        this.idMap = idMap;
        console.log("idMap");
        console.log(idMap);
        return idMap;
    }
}