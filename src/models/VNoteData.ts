import { VNoteContent } from "./VNoteContaint";
import { VNoteElement } from "./VNoteElement";

export class VNoteData {
  elements: VNoteElement[];
  idMap!: Map<number, VNoteContent>;
  maxId: number = -1;
  sortedIds: number[] = [];
  metadata: object = {};
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
    const output = {
      "metadata": this.metadata,
      "data": data
    }
    return JSON.stringify(output, null, 4);
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
  static fromJSON(jsonString: any): VNoteData {
    const jsonData = JSON.parse(jsonString);
    const elements = jsonData["data"] || JSON.parse("[]")
    let newElements = [];
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];
      newElements.push(VNoteElement.fromJSON(element));
      element = newElements[i];
    }
    console.log("newElements");
    console.log(newElements);
    const vnoteData = new VNoteData(newElements);
    vnoteData.metadata = jsonData["metadata"] || JSON.parse("{}")
    return vnoteData;
  }

  addElement(element: VNoteElement) {
    this.elements.push(element);
    this.idMap.set(element.id, element.content);
    switch (element.type) {
      case "todoList":
        console.log("Added todo list");
        this.idMap.set(element.content.list[0].id, element.content.list[0]);
        break;
      case "bl":
        console.log("Added bl");
        this.idMap.set(element.content.list[0].id, element.content.list[0]);
        break;
      default:
        console.log("Added new element");
        break;
    }
    console.log("Added new element");
  }

  getNextId(): number {
    this.maxId++;
    return this.maxId;
  }

  /**
   *
   * @param id id of the element to update
   * @returns id of element to focus
   */
  deleteElement(id: number) {
    let newFocusId = -1;
    if (this.sortedIds.length != this.idMap.size) {
      this.generateSortedIDs();
    }
    let index = this.elements.findIndex((element) => {
      //Deleting item from todo list
      if (element.type == "todoList") {
        let l = element.content.list.length;
        console.log("length" + l);
        for (let i = 0; i < element.content.list.length; i++) {
          const item = element.content.list[i];
          if (item.id == id) {
            if (l == 1) {
              return true;
            }
            console.log("Deleting item from todo list, id: " + id);
            element.content.list.splice(i, 1);
            newFocusId = element.content.list[i - 1].id;
            return false;
          }
        }
      } else if (element.type == "bl") {
        let l = element.content.list.length;
        console.log("length" + l);
        for (let i = 0; i < element.content.list.length; i++) {
          const item = element.content.list[i];
          if (l == 1) {
            return true;
          }
          if (item.id == id) {
            console.log("Deleting item from bl, id: " + id);
            element.content.list.splice(i, 1);
            newFocusId = element.content.list[i - 1].id;
            return false;
          }
        }
      } else {
        console.log("Deleting item, id: " + id);
        if (element.id == id) {
          return true;
        }
      }
    });
    if (index != -1) {
      this.elements.splice(index, 1);
      this.idMap.delete(id);
    }

    newFocusId = this.sortedIds[this.sortedIds.indexOf(id) - 1];
    this.sortedIds.splice(this.sortedIds.indexOf(id), 1);
    return newFocusId;
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
    //Getting max key
    if (idMap.size > 0) {
      this.maxId = Math.max(...idMap.keys());
    }
    this.sortedIds = Array.from(idMap.keys()).sort((a, b) => a - b);
    return idMap;
  }

  generateSortedIDs() {
    this.sortedIds = Array.from(this.idMap.keys()).sort((a, b) => a - b);
  }

  getElementById(id: number): VNoteContent | undefined{
    return this.idMap.get(id);
  }
}
