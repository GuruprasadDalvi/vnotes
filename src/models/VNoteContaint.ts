export abstract class VNoteContent {
  toHTML(): string {
    throw new Error("Not implemented");
  }
  fromJSON(data: any): VNoteContent {
    throw new Error("Not implemented");
  }
  toObject(): any {
    throw new Error("Not implemented");
  }
  parseID(map:  Map<number, VNoteContent>): any {
    console.log("Not implemented");
    console.log(JSON.stringify(map));
    throw new Error("Not implemented in abstract class with map");
  }

  static fromJSON(data: any): VNoteContent {
    if (data.type === "text") {
      return new TextContent(data.content, data.id);
    } else if (data.type === "bl") {
      let list: TextContent[] = data.content.map((item: any) => {
        return new TextContent(item.content, item.id);
      });
      return new ListContent(list, data.id);
    } else if (data.type === "todoList") {
        let list: TodoItem[] = data.content.map((item: any) => {
            return new TodoItem(item.content, item.done, item.id);
        });
      return new TodoListContent(list, data.id);
    }  else if (data.type === "h1") {
      return new Heading1Content(data.content, data.id);
    } else if (data.type === "h2") {
      return new Heading2Content(data.content, data.id);
    } else if (data.type === "h3") {
      return new Heading3Content(data.content, data.id);
    } else {
      throw new Error("Unknown type");
    }
  }
}

export class TextContent extends VNoteContent {
  text: string;
  id: number;
  constructor(text: string, id: number) {
    super();
    this.text = text;
    this.id = id;
  }

  toHTML(): string {
    return `<div class="container"> <div class="add_button">+</div><INPUT id="${this.id}" class="text" tabindex="${this.id}"  placeholder="type '/' to enter command mode" name="editor" value='${this.text}' /> <br/></div>`;
  }
  fromJSON(data: any): VNoteContent {
    return new TextContent(data.text, data.id);
  }
  toJSON(): string {
    return JSON.stringify({ content: this.text, id: this.id, type: "text" });
  }
  toObject(): any {
    return this.text
  }

  parseID(map:  Map<number, VNoteContent>) {
    if (map.has(this.id)) {
      throw new Error("Duplicate id in text");
    }
    map.set(this.id, this);
  }
}

export class ListContent extends VNoteContent {
  list: TextContent[];
  id: number;
  constructor(list: TextContent[], id: number) {
    super();
    this.list = list;
    this.id = id;
  }

  toHTML(): string {
    let html = `<ul id = "${this.id}">`;
    for (let i = 0; i < this.list.length; i++) {
      const element = this.list[i];
      html += `<div class="container"> <div class="add_button">+</div><li><INPUT id="${element.id}" class="text" tabindex="${element.id}"  placeholder="type '/' to enter command mode" name="editor" value='${element.text}' /></li> <br/></div>`;
    }
    html += "</ul>";
    return html;
  }
  fromJSON(data: any): VNoteContent {
    return new ListContent(data.list, data.id);
  }
  toJSON(): string {
    return JSON.stringify(this);
  }
  toObject(): any {
    return this.list.map(item => {
        return {
          content: item.text,
          id: item.id,
          type: "text"
        };
      })
    }

  parseID(map:  Map<number, VNoteContent>) {
    if (map.has(this.id)) {
      throw new Error("Duplicate id in list");
    }
    map.set(this.id, this);
    for (let i = 0; i < this.list.length; i++) {
      const element = this.list[i];
      element.parseID(map);
    }
  }
  
}

export class TodoListContent extends VNoteContent {
  list: TodoItem[];
  id: number;
  constructor(list: TodoItem[], id: number) {
    super();
    this.list = list;
    this.id = id;
  }

  toHTML(): string {
    let html = '<ul class="todoList">';
    for (let i = 0; i < this.list.length; i++) {
      const element = this.list[i];
      if (element.done) {
        html += `<div class="container"> <div class="add_button">+</div><li class="checked"><input type="checkbox" id="${element.id}_box" name="todo_box"  checked  ><INPUT id="${element.id}" class="text checked" tabindex="${element.id}"  placeholder="type '/' to enter command mode" name="editor" value='${element.content}' /></li></div>`;
      } else {
        html += `<div class="container"> <div class="add_button">+</div><li><input type="checkbox" id="${element.id}_box" name="todo_box" ><INPUT id="${element.id}" class="text"  tabindex="${element.id}"  placeholder="type '/' to enter command mode" name="editor" value='${element.content}' /></li></div>`;
      }
    }
    html += "</ul>";
    return html;
  }

  fromJSON(data: any): VNoteContent {
    return new TodoListContent(data.list, data.id);
  }

  toJSON(): string {
    let list = this.list.map(item => {
      return item.toJSON();
    });
    return JSON.stringify({ list: list, type: "todoList", id: this.id });
  }

  toObject(): any {
    return this.list.map(item => {
        return item.toObject();
      })
    };

  parseID(map:  Map<number, VNoteContent>) {
    if (map.has(this.id)) {
      throw new Error("Duplicate id in todo list");
    }
    map.set(this.id, this);
    for (let i = 0; i < this.list.length; i++) {
      const element = this.list[i];
      element.parseID(map);
    }
  }
  
}

export class TodoItem extends VNoteContent {
  content: string;
  done: boolean;
  id: number;
  constructor(content: string, done: boolean, id: number) {
    super();
    this.content = content;
    this.done = done;
    this.id = id;
  }

  toHTML(): string {
    return `${this.content}`;
  }

  fromJSON(data: any): VNoteContent {
    return new TodoItem(data.content, data.done, data.id);
  }

  toJSON(): string {
    return JSON.stringify({ content: this.content, id: this.id, type: "todo", done: this.done });
  }

  toObject(): any {
    return {
      content: this.content,
      done: this.done,
      id: this.id,
      type: "todo"
    };
  }

  parseID(map:  Map<number, VNoteContent>) {
    if (map.has(this.id)) {
      throw new Error("Duplicate id in todo item");
    }
    map.set(this.id, this);
  }
}

export class Heading1Content extends VNoteContent {
  content: string;
  id: number;
  constructor(content: string, id: number) {
    super();
    this.content = content;
    this.id = id;
  }

  toHTML(): string {
    return `<div class="container"> <button class="add_button" onclick="addElement()">+</button><h1><INPUT id="${this.id}" class="text h1" tabindex="${this.id}"  placeholder="Heading 1" name="editor" value='${this.content}' /></h1></div>`;
  }

  toObject(): any {
    return this.content
  }

  parseID(map:  Map<number, VNoteContent>) {
    if (map.has(this.id)) {
      throw new Error("Duplicate id in heading 1");
    }
    map.set(this.id, this);
  }
}

export class Heading2Content extends VNoteContent {
  content: string;
  id: number;
  constructor(content: string, id: number) {
    super();
    this.content = content;
    this.id = id;
  }

  toHTML(): string {
    return `<div class="container"> <button class="add_button" onclick="addElement()">+</button><h2><INPUT id="${this.id}" class="text h2"  tabindex="${this.id}"  placeholder="Heading 2" name="editor" value='${this.content}' /></h2></div>`;
  }

  toObject(): any {
    return this.content
  }

  parseID(map:  Map<number, VNoteContent>) {
    if (map.has(this.id)) {
      throw new Error("Duplicate id in heading 2");
    }
    map.set(this.id, this);
  }
}

export class Heading3Content extends VNoteContent {
  content: string;
  id: number;
  constructor(content: string, id: number) {
    super();
    this.content = content;
    this.id = id;
  }

  toHTML(): string {
    return `<div class="container"> <button class="add_button" onclick="addElement()">+</button><h3><INPUT id="${this.id}" class="text h3"  tabindex="${this.id}"  placeholder="Heading 3" name="editor" value='${this.content}' /></h3></div>`;
  }

  toObject(): any {
    return this.content
  }

  parseID(map:  Map<number, VNoteContent>) {
    if (map.has(this.id)) {
      throw new Error("Duplicate id in heading 3");
    }
    map.set(this.id, this);
  }
}
