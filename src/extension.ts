// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { VNote } from "./models/VNote";
import { VNotesProvider } from "./providers/VNotesProvider";
import { VNoteManager } from "./manager/VNoteManager";
import { TextContent, TodoItem, VNoteContent } from "./models/VNoteContaint";
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

  vscode.commands.registerCommand("vnotes.addElement", async (element) => {
    console.log("Adding element in command");
    element.id = openedVNote.data.getNextId();
    openedVNote.data.idMap.set(element.id, element.content);

    //Handling the case of a bullate list
    if (element.type =="bl") {
      element.content[0].id = openedVNote.data.getNextId();
      openedVNote.data.idMap.set(element.content[0].id, element.content[0]);
    }
    //Handling the case of a todo list
    else if (element.type =="todoList") {
      element.content[0].id = openedVNote.data.getNextId();
      openedVNote.data.idMap.set(element.content[0].id, element.content[0]);
    }
    console.log(element);
    vnoteManager.addElement(openedVNote, element);
  });

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
      switch (message.command) {
        case "addElement":
          console.log("Adding element in message");
          message.element.id = openedVNote.data.getNextId();
          console.log(message.element);
          let vnoteElement = VNoteElement.fromJSON(message.element);
          console.log("vnoteElement");
          console.log(vnoteElement);
          vnoteManager.addElement(openedVNote, vnoteElement);
          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          break;
      }
    });

    vnote.loadData();
    const content = vnoteManager.getHTMLContent(vnote);
    console.log("HTML content");
    console.log(content);
    panel.webview.html = content;
    openedVNote = vnote;
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
