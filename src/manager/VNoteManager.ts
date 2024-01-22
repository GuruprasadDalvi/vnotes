import { VNote } from "../models/VNote";
import * as fs from "fs";
import { VNoteElement } from "../models/VNoteElement";
import { VNoteData } from "../models/VNoteData";

export class VNoteManager {
  constructor() {}
  createNewNote() {}
  openNote() {}
  deleteNote() {}
  updateNote() {}
  saveVNote(vnote: VNote) {}
  addElement(vnote: VNote, element: VNoteElement) {
    console.log("Adding element in manager");
    vnote.data.addElement(element);
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
    if(vNoteData.elements.length === 0) {
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
        }
        .text {
          width: fit-content;
          min-width: 0;
          background-color: transparent;
          border: 0;
          padding: 5px;
          margin: 0;
          outline: none;
          resize: none;
          font-family: inherit;
          font-size: 15px;
          color: white;
          overflow: hidden;
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
          margin-right: 10px;
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
          width: 80px;
          top: 0;
          left: 0;
          list-style: none;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          z-index: 100;
          display: none;
        }
        .tooltipList li {
          border-bottom: 1px solid #bbbbbb;
        }
        .tooltipList li button {
          outline: none;
          border: none;
          padding: 5px;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .tooltipList li button:last-child {
          border-bottom: none;
        }
        .tooltipList li button:hover {
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
      <input
        type="text"
        id="newItem"
        placeholder="type '/' to enter command mode"
        class="text editor"
        name="editor"
      />
      <br />
    </body>
  
    <script>
      const vscode = acquireVsCodeApi();
      let commandMode = false;
      
      const actionElements = {
        h1: {
          type: "h1",
          content: "",
          id: 1,
        },
        h2: {
          type: "h2",
          content: "",
          id: 2,
        },
        h3: {
          type: "h3",
          content: "",
          id: 3,
        },
        todoList: {
          type: "todoList",
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
        text: {
          type: "text",
          content: "",
          id: 16,
        },
        "bullet List": {
          type: "bl",
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
      textInput.addEventListener("keydown", function (event) {
        if (event.key === "/") {
          console.log("command mode");
          commandMode = true;
        }
      });
  
      const addElement = () => {
        let element = {
          type: "text",
          content: "adding test",
          id: 100,
        };
        console.log("Adding element in template");
        console.log(element);
        vscode.postMessage({
          command: "addElement",
          element: element,
        });
      };
      function populateListAction(elementName) {
        elementName = elementName.replace("/", "");
  
        document.getElementById("tooltipList").innerHTML = "";
        const tooltipList = document.getElementById("tooltipList");
        console.log("elementName");
        console.log(elementName);
        for (const [key, value] of Object.entries(actionElements)) {
          if (key.includes(elementName)) {
            let li = document.createElement("li");
            li.setAttribute("id", key);
            let button = document.createElement("button");
            button.innerHTML = key;
            button.addEventListener("click", function () {
              vscode.postMessage({
                command: "addElement",
                element: value,
              });
            });
            li.appendChild(button);
            tooltipList.appendChild(li);
          }
        }
      }

      //Shift focus to newly added element
      window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
          case "updateFocus":
            console.log("focus");
            console.log(message.id);
            document.getElementById(message.id).focus();
            break;
        }
      }
      );
      
      document.getElementsByName("editor").forEach((e) => {
        e.addEventListener("keydown", function (event) {
          if (commandMode) {
            populateListAction(event.target.value + event.key);
          }
          console.log("Pressed key: " + event.key)
          if (event.key === "/") {
            // Show command menu
            let tootTip = document.getElementById("tooltipList");
            tootTip.style.display = "block";
            const caretPosition = getCaretCoordinates();
  
            tootTip.style.top = caretPosition.y + 30 + "px";
            tootTip.style.left = caretPosition.x + "px";
            commandMode = true;
  
            populateListAction(event.target.value);
          }
          if (event.key === "Escape") {
            // Hide command menu
            document.getElementById("tooltipList").style.display = "none";
            document.getElementById("tooltipList").innerHTML = "";
            commandMode = false;
          }
          if (event.key === " ") {
            // Hide command menu
            document.getElementById("tooltipList").style.display = "none";
            document.getElementById("tooltipList").innerHTML = "";
            commandMode = false;
          }
          if (event.key === "Enter") {
            //Check if in command Mode
            if (commandMode) {
              populateListAction(event.target.value);
              //get the first element in command menu
              const firstElement = document.getElementById("tooltipList")
              console.log("firstElement");
              console.log(firstElement);

              //add new element
              let actionKey = firstElement.firstElementChild.id;
              console.log("key for new element");
              console.log(actionKey);
              let element = actionElements[actionKey];
              console.log("Adding element in template");
              console.log(element);
              vscode.postMessage({
                command: "addElement",
                element: element,
              });


              // Hide command menu
              document.getElementById("tooltipList").style.display = "none";
              document.getElementById("tooltipList").innerHTML = "";
              commandMode = false;
            }
            else {
              // Add new item
              let element = {
                type: "text",
                content: event.target.value,
                id: 100,
              };
              console.log("Adding element in template");
              console.log(element);
              vscode.postMessage({
                command: "addElement",
                element: element,
              });
            }
          }
        });
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
