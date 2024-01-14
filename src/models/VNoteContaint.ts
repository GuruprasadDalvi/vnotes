export abstract class VNoteContent {
  toHTML(): string {
    throw new Error("Not implemented");
  }

  static fromJSON(data: any): VNoteContent {
    if (data.type === "text") {
      return new TextContent(data.content, data.id);
    } else if (data.type === "bl") {
      let list: TextContent[] = data.content.map((item: any) => {
        return new TextContent(item.content, item.id);
      });
      return new ListContent(list);
    } else if (data.type === "todoList") {
        let list: TodoItem[] = data.content.map((item: any) => {
            return new TodoItem(item.content, item.done, item.id);
        });
      return new TodoListContent(list);
    }  else if (data.type === "h1") {
      return new Heading1Content(data.content);
    } else if (data.type === "h2") {
      return new Heading2Content(data.content);
    } else if (data.type === "h3") {
      return new Heading3Content(data.content);
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
    return `<div class="container"> <div class="add_button">+</div><INPUT id="${this.id}" class="text"  placeholder="type '/' to enter command mode" value='${this.text}' /> <br/></div>`;
  }
  fromJSON(data: any): VNoteContent {
    return new TextContent(data.text, data.id);
  }
  toJSON(): string {
    return JSON.stringify(this);
  }
}

export class ListContent extends VNoteContent {
  list: TextContent[];
  constructor(list: TextContent[]) {
    super();
    this.list = list;
  }

  toHTML(): string {
    let html = '<ul>';
    for (let i = 0; i < this.list.length; i++) {
      const element = this.list[i];
      html += `<div class="container"> <div class="add_button">+</div><li>${element.text}</li></div>`;
    }
    html += "</ul>";
    return html;
  }
  fromJSON(data: any): VNoteContent {
    return new ListContent(data.list);
  }
  toJSON(): string {
    return JSON.stringify(this);
  }
}

export class TodoListContent extends VNoteContent {
  list: TodoItem[];
  constructor(list: TodoItem[]) {
    super();
    this.list = list;
  }

  toHTML(): string {
    let html = '<ul class="todoList">';
    for (let i = 0; i < this.list.length; i++) {
      const element = this.list[i];
      if (element.done) {
        html += `<div class="container"> <div class="add_button">+</div><li class="checked"><input type="checkbox" checked  >${element.toHTML()}</li></div>`;
      } else {
        html += `<div class="container"> <div class="add_button">+</div><li><input type="checkbox">${element.toHTML()}</li></div>`;
      }
    }
    html += "</ul>";
    return html;
  }

  fromJSON(data: any): VNoteContent {
    return new TodoListContent(data.list);
  }

  toJSON(): string {
    return JSON.stringify(this);
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
    return JSON.stringify(this);
  }
}

export class Heading1Content extends VNoteContent {
  content: string;
  constructor(content: string) {
    super();
    this.content = content;
  }

  toHTML(): string {
    return `<div class="container"> <div class="add_button">+</div><h1>${this.content}</h1></div>`;
  }
}

export class Heading2Content extends VNoteContent {
  content: string;
  constructor(content: string) {
    super();
    this.content = content;
  }

  toHTML(): string {
    return `<div class="container"> <div class="add_button">+</div><h2>${this.content}</h2></div>`;
  }
}

export class Heading3Content extends VNoteContent {
  content: string;
  constructor(content: string) {
    super();
    this.content = content;
  }

  toHTML(): string {
    return `<div class="container"> <div class="add_button">+</div><h3>${this.content}</h3></div>`;
  }
}
