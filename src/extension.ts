// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { VNote } from "./models/VNote";
import { VNotesProvider } from "./providers/VNotesProvider";
import { VNoteManager } from "./manager/VNoteManager";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const vnotesProvider = new VNotesProvider();
  const vnoteManager = new VNoteManager();
  vscode.window.registerTreeDataProvider("vnotesView", vnotesProvider);
  vscode.commands.registerCommand("vnotes.refresh", () =>
    vnotesProvider.refresh()
  );

  console.log('Congratulations, your extension "vnotes" is now active!');

  const disposable = vscode.commands.registerCommand(
    "vnotes.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from vnotes!");
    }
  );
  const addNewNote = vscode.commands.registerCommand(
    "vnotes.addEntry",
    async () => {
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
    }
  );

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

    const content = vnoteManager.getHTMLContent(vnote);
    panel.webview.html = content;
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
