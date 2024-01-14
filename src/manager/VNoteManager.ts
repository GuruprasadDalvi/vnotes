import { VNote } from "../models/VNote";
import * as fs from 'fs';
import { VNoteElement } from "../models/VNoteElement";
import { VNoteData } from "../models/VNoteData";

export class VNoteManager {
    constructor() {
    }
    createNewNote() {
    }
    openNote() {
    }
    deleteNote() {
    }
    updateNote() {
        
    }

    addElement(vnote: VNote, element: VNoteElement) {
            
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
        const content = fs.readFileSync(vnote.filePath, 'utf8');
        let vNoteData: VNoteData = VNoteData.fromJSON(content);
        let generatedHTML = vNoteData.toHTML(); 

        let htmlContent = "";
        const jsonContent = JSON.parse(content);
        for (let i = 0; i < jsonContent.length; i++) {
            const element = jsonContent[i];
            if (element.type === "h1") {
                htmlContent+= `<div class="container"> <div class="add_button">+</div><h2>${element.content}</h2></div>`;
            }
            else if (element.type === "h2") {
                htmlContent+= `<div class="container"> <div class="add_button">+</div><h3>${element.content}</h3></div>`;
            }
            else if (element.type === "h3") {
                htmlContent+= `<div class="container"> <div class="add_button">+</div><h4>${element.content}</h4></div>`;
            }
            else if (element.type === "bl") {
                let listContent = "";
                for (let j = 0; j < element.content.length; j++) {
                    const item = element.content[j];
                    listContent += `<li>${item.content}</li>`;
                }
                htmlContent+= `<div class="container"> <div class="add_button">+</div><ul>${listContent}</ul></div>`;
            }
            else if (element.type === "todoList") {
                let listContent = "";
                for (let j = 0; j < element.content.length; j++) {
                    const item = element.content[j];
                    if (item.done) {
                        listContent += `<li class="checked"><input type="checkbox" checked  >${item.content}</li>`;
                    }
                    else {
                        listContent += `<li><input type="checkbox">${item.content}</li>`;
                    }
                }
                htmlContent+= `<div class="container"> <div class="add_button">+</div><ul class="todoList">${listContent}</ul></div>`;
            }
            else if (element.type === "text") {
                htmlContent+= `<div class="container"> <div class="add_button">+</div><INPUT id="${element.id}" class="text"  placeholder="type '/' to enter command mode" value='${element.content}' /> <br/></div>` ;
            }
        }

        const creationDateTime = new Date(vnote.creationTimestamp).toLocaleString();
        const lastUpdatedDateTime = new Date(vnote.lastUpdatedTimestamp).toLocaleString();
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
                            width: 100ch;
                            min-width: 0;
                            background-color: transparent;
                            border: 0;
                            padding: 10px;
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

                    </style>
                </head>
                <body>
                    <h1>${vnote.title}</h1>
                    Created on: ${creationDateTime}<br/>
                    Last updated on: ${lastUpdatedDateTime}<br/>
                    <hr/>
                    ${generatedHTML}
                    <input type="text" id="newItem" placeholder="type '/' to enter command mode" class="text" onchange = {} > <br/>
                    
                </body>
            </html>
        `;
        console.log("template")
        console.log(template)
        return template;
    }

}