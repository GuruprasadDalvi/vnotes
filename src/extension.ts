// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { VNote } from "./models/VNote";
import { VNotesProvider } from "./providers/VNotesProvider";
import { VNoteManager } from "./manager/VNoteManager";
import { ListTextContent, TextContent, TodoItem, VNoteContent } from "./models/VNoteContaint";
import { VNoteElement } from "./models/VNoteElement";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const vnotesProvider = new VNotesProvider();
  const vnoteManager = new VNoteManager();
  let openedVNote: VNote;
  vscode.window.registerTreeDataProvider("vnotesView", vnotesProvider);
  vscode.commands.registerCommand("vnotes.refresh", () =>
    vnotesProvider.refresh()
  );

  const disposable = vscode.commands.registerCommand(
    "vnotes.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from vnotes!");
    }
  );
  vscode.commands.registerCommand("vnotes.addEntry", async () => {
    try {
      const noteName = await vscode.window.showInputBox({
        prompt: "Enter the name of the note",
      });
      if (!noteName) {
        vscode.window.showErrorMessage("You must enter a name for the note");
        return;
      }
      const dirPath = path.join(
        process.env.HOME || process.env.USERPROFILE,
        "vnotes"
      );
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
      const filePath = path.join(dirPath, `${noteName}.vnote`);
      vscode.window.showInformationMessage(`Creating ${filePath}`);
      fs.writeFileSync(filePath, "[]");
      vscode.window.showInformationMessage(`Created ${filePath}`);
      vnotesProvider.refresh();
    } catch (error) {
      vscode.window.showInformationMessage(`Error: ${error}`);
    }
  });

  vscode.commands.registerCommand("vnotes.openNote", (vnote: VNote) => {
    const panel = vscode.window.createWebviewPanel(
      "vnoteView",
      vnote.title,
      vscode.ViewColumn.One,

      {
        enableScripts: true,
        enableCommandUris: true,
      }
    );
    panel.webview.onDidReceiveMessage((message) => {
      console.log("Received message");
      console.log(message);

      switch (message.command) {
        case "addElement":
          console.log("Adding element in message");
          message.element.id = openedVNote.data.getNextId();
          console.log(message.element);

          //Handling the case of a bullate list
          if (message.element.type == "bl") {
            message.element.content[0].id = openedVNote.data.getNextId();
          }
          //Handling the case of a todo list
          else if (message.element.type == "todoList") {
            message.element.content[0].id = openedVNote.data.getNextId();
          }
          else if(message.element.type == "todoItem"){
            //SPACIAL CASE TodoItem
            let sibling = openedVNote.data.getElementById(+message.element.sibling_id);
            let parent_id = sibling.parent_id;
            let parent = openedVNote.data.idMap.get(parent_id);
            parent.list.push(new TodoItem(message.element.content, false, message.element.id, parent_id));
            openedVNote.save();
            openedVNote.data.createIDMap();
            panel.webview.html = vnoteManager.getHTMLContent(vnote);
            panel.webview.postMessage({
              command: "updateFocus",
              id: message.element.id,
            });
            break;
          }
          else if(message.element.type == "listText"){
            //SPACIAL CASE ListText
            let sibling = openedVNote.data.getElementById(+message.element.sibling_id);
            let parent_id = sibling.parent_id;
            let parent = openedVNote.data.idMap.get(parent_id);
            let lt = new ListTextContent(message.element.content, message.element.id);
            lt.parent_id = parent_id;
            parent.list.push(lt);
            openedVNote.save();
            openedVNote.data.createIDMap();
            panel.webview.html = vnoteManager.getHTMLContent(vnote);
            panel.webview.postMessage({
              command: "updateFocus",
              id: message.element.id,
            });
            break;
          }


          let vnoteElement = VNoteElement.fromJSON(message.element);
          console.log("vnoteElement");
          console.log(vnoteElement);
          vnoteManager.addElement(openedVNote, vnoteElement);
          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          if (message.element.type == "bl") {
            panel.webview.postMessage({
              command: "updateFocus",
              id: message.element.content[0].id,
            });
            
          }
          else if (message.element.type == "todoList") {
            panel.webview.postMessage({
              command: "updateFocus",
              id: message.element.content[0].id,
            });
          }
          else {
            panel.webview.postMessage({
              command: "updateFocus",
              id: message.element.id,
            });
          }
          break;
        case "updateContent":
          console.log("Updating element in message");
          const id  = message.id;
          const content = message.content;
          vnoteManager.updateElement(openedVNote, id, content);
          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          break;
        case "toggleTodoItem":
          console.log("Toggling todo item");
          const todoId = message.id;
          vnoteManager.toggleTodoItem(openedVNote, todoId);
          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          break;
        case "deleteElement":
          console.log("Deleting element");
          const elementId = message.id;
          const focusID = vnoteManager.deleteElement(openedVNote, elementId);
          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          if (focusID != -1) {
            panel.webview.postMessage({
              command: "updateFocus",
              id: focusID,
            });
          }
          else{
            panel.webview.postMessage({
              command: "updateFocus",
              id: "newItem",
            });
          }
          break;
      }

    });

    vnote.loadData();
    const content = vnoteManager.getHTMLContent(vnote);
    panel.webview.html = content;
    openedVNote = vnote;
  });

  context.subscriptions.push(disposable);
}