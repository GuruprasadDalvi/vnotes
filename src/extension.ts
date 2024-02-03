import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { VNote } from "./models/VNote";
import { VNotesProvider } from "./providers/VNotesProvider";
import { VNoteManager } from "./manager/VNoteManager";
import { ListTextContent, TodoItem } from "./models/VNoteContaint";
import { VNoteElement } from "./models/VNoteElement";
import {
  FOCUS_DELAY,
  NEW_FILE_TEMPLATE,
  USER_INPUT_MESSAGE,
  USER_WARNING_MESSAGE,
  VNOTE_VIEW_NAME,
} from "./constant/ApplicationConstants";
import { CREATE_VNOTE, OPEN_VNOTE, REFRESH_VNOTE_PROVIDER } from "./constant/CommandConstants";
import { ADD_NEW_ELEMENT_MESSAGE, DELETE_ELEMENT_MESSAGE, SWAP_ELEMENT_MESSAGE, TOGGLE_TODO_MESSAGE, UPDATE_CONTENT_MESSAGE, UPDATE_FOCUS_MESSAGE } from "./constant/MessageConstants";

export function activate(context: vscode.ExtensionContext) {
  const vnotesProvider = new VNotesProvider();
  const vnoteManager = new VNoteManager();
  let openedVNote: VNote;
  
  //Map of vnote title to webview panel
  const vnotePanels = new Map<string, vscode.WebviewPanel>();

  vscode.window.registerTreeDataProvider(VNOTE_VIEW_NAME, vnotesProvider);

  //Refresh the vnote provider
  vscode.commands.registerCommand(REFRESH_VNOTE_PROVIDER, () =>
    vnotesProvider.refresh()
  );

  //Create a new note
  vscode.commands.registerCommand(CREATE_VNOTE, async () => {
    try {
      const noteName = await vscode.window.showInputBox({
        prompt: USER_INPUT_MESSAGE,
      });

      //If the user cancels the input box
      if (!noteName) {
        vscode.window.showErrorMessage(USER_WARNING_MESSAGE);
        return;
      }

      //Generating the file path
      const dirPath = path.join(
        process.env.HOME || process.env.USERPROFILE || "",
        "vnotes"
      );

      //Creating the directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }

      //Creating the file
      const filePath = path.join(dirPath, `${noteName}.vnote`);
      vscode.window.showInformationMessage(`Creating ${filePath}`);
      fs.writeFileSync(filePath, NEW_FILE_TEMPLATE);
      vscode.window.showInformationMessage(`Created ${filePath}`);
      vnotesProvider.refresh();
    } catch (error) {
      vscode.window.showInformationMessage(`Error: ${error}`);
    }
  });

  //Open a VNote
  vscode.commands.registerCommand(OPEN_VNOTE, (vnote: VNote) => {

    //If the vnote is already opened
    if (vnotePanels.has(vnote.title)) {
      const panel = vnotePanels.get(vnote.title);
      if (panel) {
        panel.reveal(vscode.ViewColumn.One);
        return;
      }
    }

    const panel = vscode.window.createWebviewPanel(
      VNOTE_VIEW_NAME,
      vnote.title,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        enableCommandUris: true,
      }
    );

    //Handle messages from the webview
    panel.webview.onDidReceiveMessage((message) => {

      switch (message.command) {
        case ADD_NEW_ELEMENT_MESSAGE:
          //Generate a new id for the element
          message.element.id = openedVNote.data.getNextId();

          //Handling the case of a bullate list
          if (message.element.type == "bl") {
            //Generate a new id for the first element of the list
            message.element.content[0].id = openedVNote.data.getNextId();
          }
          //Handling the case of a todo list
          else if (message.element.type == "todoList") {
            //Generate a new id for the first element of the list
            message.element.content[0].id = openedVNote.data.getNextId();
          } else if (message.element.type == "todoItem") {
            //SPACIAL CASE TodoItem, create a new todo item
            let sibling = openedVNote.data.getElementById(
              +message.element.sibling_id
            );
            let parent_id = sibling?.parent_id || 0;
            let parent = openedVNote.data.idMap.get(parent_id);
            parent?.list.push(
              new TodoItem(
                message.element.content,
                false,
                message.element.id,
                parent_id
              )
            );
            openedVNote.save();
            openedVNote.data.createIDMap();
            panel.webview.html = vnoteManager.getHTMLContent(vnote);
            console.log("new todo element id: " + message.element.id);
            //sleep for 500ms
            setTimeout(() => {
              panel.webview.postMessage({
                command: UPDATE_FOCUS_MESSAGE,
                id: message.element.id,
              });
            }, FOCUS_DELAY);
            break;
          } else if (message.element.type == "listText") {
            //SPACIAL CASE ListText
            let sibling = openedVNote.data.getElementById(
              +message.element.sibling_id
            );
            let parent_id = sibling?.parent_id || 0;
            let parent = openedVNote.data.idMap.get(parent_id);
            let lt = new ListTextContent(
              message.element.content,
              message.element.id
            );
            lt.parent_id = parent_id;
            parent?.list.push(lt);
            openedVNote.save();
            openedVNote.data.createIDMap();
            panel.webview.html = vnoteManager.getHTMLContent(vnote);
            console.log("new list element id: " + message.element.id);

            setTimeout(() => {
              panel.webview.postMessage({
                command: UPDATE_FOCUS_MESSAGE,
                id: message.element.id,
              });
            }, FOCUS_DELAY);
            break;
          }

          let vnoteElement = VNoteElement.fromJSON(message.element);
          vnoteManager.addElement(openedVNote, vnoteElement);
          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          if (message.element.type == "bl") {

            setTimeout(() => {
              panel.webview.postMessage({
                command: UPDATE_FOCUS_MESSAGE,
                id: message.element.content[0].id,
              });
            }, FOCUS_DELAY);
          } else if (message.element.type == "todoList") {
            console.log(
              "Updating focus to first element of todo: " +
                message.element.content[0].id
            );

            setTimeout(() => {
              panel.webview.postMessage({
                command: UPDATE_FOCUS_MESSAGE,
                id: message.element.content[0].id,
              });
            }, FOCUS_DELAY);
          } else {
            console.log("Updating focus to new element: " + message.element.id);

            setTimeout(() => {
              panel.webview.postMessage({
                command: UPDATE_FOCUS_MESSAGE,
                id: message.element.id,
              });
            }, FOCUS_DELAY);
          }
          break;
        case UPDATE_CONTENT_MESSAGE:
          const id = message.id;
          const content = message.content;
          vnoteManager.updateElement(openedVNote, id, content);
          // panel.webview.html = vnoteManager.getHTMLContent(vnote);
          break;
        case TOGGLE_TODO_MESSAGE:
          console.log("Toggling todo item");
          const todoId = message.id;
          vnoteManager.toggleTodoItem(openedVNote, todoId);
          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          break;
        case DELETE_ELEMENT_MESSAGE:
          console.log("Deleting element");
          const elementId = message.id;
          const focusID = vnoteManager.deleteElement(openedVNote, elementId);
          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          if (focusID != -1) {
            console.log("Updating focus to element: " + focusID);
            setTimeout(() => {
              panel.webview.postMessage({
                command: UPDATE_FOCUS_MESSAGE,
                id: focusID,
              });
            }, FOCUS_DELAY);
          } else {
            setTimeout(() => {
              panel.webview.postMessage({
                command: UPDATE_FOCUS_MESSAGE,
                id: message.element.id,
              });
            }, FOCUS_DELAY);
          }
          break;
        case SWAP_ELEMENT_MESSAGE:
          console.log("Swapping to new element");
          const newElementId = +message.id;
          message.element.id = newElementId;
          let idToFocus = newElementId;

          //SPACIAL CASE todo List
          if (message.element.type == "todoList") {
            message.element.content[0].id = openedVNote.data.getNextId();
            idToFocus = message.element.content[0].id;
          } else if (message.element.type == "bl") {
            message.element.content[0].id = openedVNote.data.getNextId();
            idToFocus = message.element.content[0].id;
          }
          let newVNoteElement = VNoteElement.fromJSON(message.element);
          vnoteManager.swapToNewElement(
            openedVNote,
            newElementId,
            newVNoteElement
          );

          panel.webview.html = vnoteManager.getHTMLContent(vnote);
          setTimeout(() => {
            panel.webview.postMessage({
              command: UPDATE_FOCUS_MESSAGE,
              id: idToFocus,
            });
          }, FOCUS_DELAY);
          break;
      }
    });


    const isDarkMode =
      vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
    panel.iconPath = vscode.Uri.file(
      path.join(
        __dirname,
        "..",
        "resources",
        isDarkMode ? "dark" : "light",
        "Note.svg"
      )
    );
    vnotePanels.set(vnote.title, panel);

    panel.onDidDispose(() => {
      vnotePanels.delete(vnote.title);
    });
    vnote.loadData();
    const content = vnoteManager.getHTMLContent(vnote);
    panel.webview.html = content;
    openedVNote = vnote;
  });
}
