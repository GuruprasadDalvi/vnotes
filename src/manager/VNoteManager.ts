import { VNote } from "../models/VNote";
import * as fs from "fs";
import { VNoteElement } from "../models/VNoteElement";
import { VNoteData } from "../models/VNoteData";
import { TextContent } from "../models/VNoteContaint";
import { ADD_NEW_ELEMENT_MESSAGE, DELETE_ELEMENT_MESSAGE, SWAP_ELEMENT_MESSAGE, TOGGLE_TODO_MESSAGE, UPDATE_CONTENT_MESSAGE, UPDATE_FOCUS_MESSAGE } from "../constant/MessageConstants";

export class VNoteManager {
  
  deleteNote() {}

  deleteElement(vnote: VNote, id: number) {
    console.log("Deleting element in manager");
    const focusID = vnote.data.deleteElement(+id);
    vnote.save();
    return focusID;
  }
  updateElement(vnote: VNote, id: number, content: string) {
    let element = vnote.data.getElementById(+id);
    element?.updateContent(content);
    vnote.save();
  }
  addElement(vnote: VNote, element: any) {
    vnote.data.addElement(element);
    vnote.save();
  }
  toggleTodoItem(vnote: VNote, id: number) {
    console.log("Toggling todo item");
    let element = vnote.data.getElementById(+id);
    element!.done = !element?.done;
    vnote.save();
  }
  swapToText(vnote: VNote, id: number) {
    console.log("Swapping to text");
    let textElement = new VNoteElement("text", new TextContent("",+id), +id);
    vnote.data.deleteElement(+id);
    vnote.data.addElement(textElement);
    vnote.save();
  }

  swapToNewElement(vnote: VNote, id: number, element: VNoteElement) {
    console.log("Swapping to new element");
    vnote.data.deleteElement(+id);
    vnote.data.addElement(element);
    vnote.data.createIDMap();
    vnote.save();
  }

  /**
   * This function will parse the content of the note and return the HTML content
   * Content of the vnote file will be a json list of objects
   * Each object will have a type and a content
   *
   * @param filePath
   * @returns HTML content
   *
   */
  getHTMLContent(vnote: VNote): string {
    let vNoteData: VNoteData = vnote.data;
    if (vNoteData.elements.length === 0) {
      vnote.loadData();
    }
    let generatedHTML = vNoteData.toHTML();

    const creationDateTime = new Date(vnote.creationTimestamp).toLocaleString();
    const lastUpdatedDateTime = new Date(
      vnote.lastUpdatedTimestamp
    ).toLocaleString();
    let template = `
    <html>
    <head>
      <style>
        body {
          font-family: sans-serif;
          overflow-x: hidden;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
        }
        h1 {
          margin-bottom: 0;
        }
        .todoList {
          list-style-type: none;
          list-style-position: inside;
          padding-left: 0;
        }
        .checked {
          text-decoration: line-through;
          text-decoration-color: red;
          brightness: 0.5;
          opacity: 0.5;
        }
        .text {
          min-width: 32ch;
          background-color: transparent;
          border: 0;
          padding: 5px;
          margin: 0;
          outline: none;
          resize: none;
          font-family: inherit;
          font-size: 15px;
          overflow: hidden;
          width: 100%;
          color: var(--vscode-editor-foreground);
        }
        input[type="text"] {
          border: 0;
          outline: none;
          transition: 0.4s ease-in-out;
        }
        input:focus {
          outline: none;
          border-bottom: 1px solid;
        }
        textarea {
          outline: none;
        }
        textarea: focus {
          outline: none;
          border: none;
          border-bottom: 1px solid;
        }
        .add_button {
          width: 20px;
          height: 20px;
          background-color: #ffffff59;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          margin-left: 10px;
          margin-right: 30px;
          outline: none;
          border: none;
          opacity: 0; /* make the button invisible initially */
          transition: opacity 0.3s;
        }
        .container {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .container:hover .add_button {
          opacity: 1; /* make the button visible when the container is hovered */
        }
        .todo_row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
        }
        h2,
        h3,
        h4 {
          margin: 0;
        }
        .h1 {
          font-size: 2em;
          font-weight: bold;
          outline: none;
          border: none;
        }
  
        .h2 {
          font-size: 1.5em;
          font-weight: bold;
          outline: none;
          border: none;
        }
  
        .h3 {
          font-size: 1em;
          font-weight: bold;
          outline: none;
          border: none;
        }
        .tooltipList {
          position: absolute;
          width: 100px;
          top: 0;
          left: 0;
          list-style: none;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
          z-index: 100;
          display: block;
          opacity: 0;
          transition: 400ms ease all;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
          border: 2px solid var(--vscode-editor-hoverHighlightBackground);
          border-radius: 5px;
        }
        .tooltipList li {
          background-color: var(--vscode-editor-background);
          padding: 5px;
          border-bottom: 1px solid var(--vscode-editor-hoverHighlightBackground);
        }
        .tooltipList li button {
          outline: none;
          border: none;
          background-color: transparent;
          color: var(--vscode-editor-foreground);
          padding: 8px 8px 8px 5px;
          width: 100%;
          text-align: left;
          font-size: 1em;
          font-weight: bold;
          transition: 400ms ease all;
          cursor: pointer;
        }
        .tooltipList li button:last-child {
          border-bottom: none;
        }
        .tooltipList li button:hover {
          font-weight: bold;
          font-size: 1.1em;
        }
        .focused_item {
          background-color: var(--vscode-editorLineNumber-activeForeground);
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="tooltipList" id="tooltipList"></div>
      <h1>${vnote.title}</h1>
      Created on: ${creationDateTime}<br />
      Last updated on: ${lastUpdatedDateTime}<br />
      <hr />
      ${generatedHTML}
      <div class="container"> 
        <INPUT id="newItem" class="text" tabindex="-1"  placeholder="type '/' to add new element" name="editor" value='' oninput="addElement()" /> 
        <br/>
      </div>
      <br />
    </body>
  
    <script>
      const vscode = acquireVsCodeApi();
      let commandMode = false;
      
      const actionElements = {
        "Heading 1": {
          type: "h1",
          content: "",
          description: "Add a new h1 element",
          id: 1,
        },
        "Heading 2": {
          type: "h2",
          content: "",
          description: "Add a new h2 element",
          id: 2,
        },
        "Heading 3": {
          type: "h3",
          content: "",
          description: "Add a new h3 element",
          id: 3,
        },
        "Todo List": {
          type: "todoList",
          description: "Add a new list with checkbox",
          content: [
            {
              type: "todoItem",
              content: "",
              done: false,
              id: 4,
            }
          ],
          id: 9,
        },
        Text: {
          type: "text",
          content: "",
          description: "Add a new text element",
          id: 16,
        },
        "Bullet List": {
          type: "bl",
          description: "Add a new bullet list",
          content: [
            {
              type: "text",
              content: "",
              id: 10,
            }
          ],
          id: 17,
        },
      };
      const textInput = document.getElementById("newItem");
      if (textInput) {
        textInput.addEventListener("keydown", function (event) {
          if (event.key === "/") {
            commandMode = true;
          }
        });
      }
  
      const addElement = () => {
        let element = {
          type: "text",
          content: "adding test",
          id: 100,
        };
        vscode.postMessage({
          command: "${ADD_NEW_ELEMENT_MESSAGE}",
          element: element,
        });
      };
      function populateListAction(elementName) {
        elementName = elementName.replace("/", "");
        elementName = elementName.replace("Shift", "");
        elementName = elementName.toLowerCase();
        let count = 0;
        document.getElementById("tooltipList").innerHTML = "";
        const tooltipList = document.getElementById("tooltipList");
        for (const [key, value] of Object.entries(actionElements)) {
          console.log("key: " + key+" elementName: " + elementName);
          if (key.toLowerCase().includes(elementName)) {
            let li = document.createElement("li");
            li.setAttribute("id", key);
            let button = document.createElement("button");
            button.innerHTML = key;
            button.addEventListener("click", function () {
              vscode.postMessage({
                command: "${ADD_NEW_ELEMENT_MESSAGE}",
                element: value,
              });
            });
            if (count === 0) {
              
              li.style.backgroundColor = "var(--vscode-editorLineNumber-activeForeground)";
              li.style.fontSize = "1.1em";
            }
            else{
              li.style.backgroundColor = "var(--vscode-editor-background)";
              li.style.fontSize = "1em";
            }
            
            count++;
            li.appendChild(button);
            tooltipList.appendChild(li);
          }
        }
      }

      //Shift focus to newly added element
      window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
          case "${UPDATE_FOCUS_MESSAGE}":
            console.log("Updating focus: " + message.id);
            let element = document.getElementById(message.id);
            if (element) {
              element.focus();
            }
            else{
              console.log("Element not found so focusing on newItem");
              element = document.getElementById("newItem");
              element.focus();
            }
            break;
        }
      }
      );
      
      document.getElementsByName("editor").forEach((e) => {
        if(e.classList.contains("normalText") ){
        e.style.height = "";
        console.log("e.scrollHeight: " + e.scrollHeight); 
        console.log(e);
        e.style.height = e.scrollHeight + "px"
      }
      });


      document.getElementsByName("editor").forEach((e) => {
        e.addEventListener("keydown", function (event) {
          console.log("key pressed: " + event.key);
          if (event.target.value === "") {
            commandMode = false;
            document.getElementById("tooltipList").style.opacity = "0";
            document.getElementById("tooltipList").innerHTML = "";
          }
          if (commandMode) {
            populateListAction(event.target.value + event.key);
          }
          //Move focus to next child if command mode is active and user down arrow key
         
          if (event.key === "/") {
            // Show command menu
            let tootTip = document.getElementById("tooltipList");
            const caretPosition = getCaretCoordinates();
  
            populateListAction(event.target.value);

            tootTip.style.top = caretPosition.y + 30 + "px";
            tootTip.style.left = caretPosition.x + "px";
            tootTip.style.opacity = "1";
            commandMode = true;
  
          }
          if (event.key === "Escape") {
            // Hide command menu
            document.getElementById("tooltipList").style.opacity = "0";
            document.getElementById("tooltipList").innerHTML = "";
            commandMode = false;
          }
          if (event.key === " ") {
            // Hide command menu
            document.getElementById("tooltipList").style.opacity = "0";
            document.getElementById("tooltipList").innerHTML = "";
            commandMode = false;
          }
          if (event.key === "Backspace") {
            // Hide command menu
            // document.getElementById("tooltipList").style.opacity = "0";
            // document.getElementById("tooltipList").innerHTML = "";
            // commandMode = false;
            if (event.target.value === "") {
              vscode.postMessage({
                command: "${DELETE_ELEMENT_MESSAGE}",
                id: event.target.id,
              });
            }
          }
          if (event.key === "Enter" && !event.shiftKey) {
            //Check if in command Mode
            if (commandMode) {
              populateListAction(event.target.value);
              //get the first element in command menu
              const firstElement = document.getElementById("tooltipList")
              //add new element
              let actionKey = firstElement.firstElementChild.id;
              let element = actionElements[actionKey];

              if(event.target.classList.contains("normalText") ){
                vscode.postMessage({
                  command: "${SWAP_ELEMENT_MESSAGE}",
                  id: event.target.id,
                  element: element,
                });
              }
                else{
                  vscode.postMessage({
                    command: "${ADD_NEW_ELEMENT_MESSAGE}",
                    element: element,
                  });
                }


              // Hide command menu
              document.getElementById("tooltipList").style.display = "none";
              document.getElementById("tooltipList").innerHTML = "";
              commandMode = false;
            }
            else {
              console.log(event.target.classList);
              if(event.target.classList.contains("todoText")){
                // Add new todo item
                console.log("Adding new todo item");
                let element = {
                  type: "todoItem",
                  content: "",
                  done: false,
                  id: 100,
                  sibling_id: event.target.id
                };
                vscode.postMessage({
                  command: "${ADD_NEW_ELEMENT_MESSAGE}",
                  element: element,
                });
              }
              else if(event.target.classList.contains("listText")){
                console.log("Adding new list item");
                // Add new  list item
                let element = {
                  type: "listText",
                  content: "",
                  id: 100,
                  sibling_id: event.target.id
                };
                vscode.postMessage({
                  command: "${ADD_NEW_ELEMENT_MESSAGE}",
                  element: element,
                });
              }
              else{
                // Add new  text item
                let element = {
                  type: "text",
                  content: "",
                  id: 100,
                };
                vscode.postMessage({
                  command: "${ADD_NEW_ELEMENT_MESSAGE}",
                  element: element,
                });
              }
            }
          }
        });


         e.oninput = (event) =>{
          console.log("oninput"); 
          let id = event.target.id;
          let content = event.target.value;
          console.log("id: "+ id);
          console.log("content: "+ content);

          // Update the content
          vscode.postMessage({
            command: "${UPDATE_CONTENT_MESSAGE}",
            id: id,
            content: content,
          });
        }
      });


      document.getElementsByName("todo_box").forEach((e) => {
        e.onchange = (event) => {
          let id = event.target.id.replace("_box", "");
          vscode.postMessage({
            command: "${TOGGLE_TODO_MESSAGE}",
            id: id,
          });
        }

      });
  
      function getCaretCoordinates() {
        let x = 0,
          y = 0;
        let focused = document.activeElement;
        if (!focused) {
          return { x, y };
        }
        const rect = focused.getBoundingClientRect();
        x = rect.left + focused.selectionStart;
        y = rect.top + focused.selectionEnd;
  
        return { x, y };
      }

    </script>
  </html>
  
        `;
    return template;
  }
}
