import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { VNote } from '../models/VNote';
import { VNOTE_VIEW_NAME } from '../constant/ApplicationConstants';

export function activate(context: vscode.ExtensionContext) {
    const vnotesProvider = new VNotesProvider();
    vscode.window.registerTreeDataProvider(VNOTE_VIEW_NAME, vnotesProvider);
    vscode.commands.registerCommand('vnotes.refresh', () => vnotesProvider.refresh());
}

export class VNotesProvider implements vscode.TreeDataProvider<VNote> {
    private _onDidChangeTreeData: vscode.EventEmitter<VNote | undefined> = new vscode.EventEmitter<VNote | undefined>();
    readonly onDidChangeTreeData: vscode.Event<VNote | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: VNote): vscode.TreeItem {
        // const treeItem = new vscode.TreeItem(element.title, vscode.TreeItemCollapsibleState.None);
        const treeItem = new VNoteNode(element, element.title, vscode.TreeItemCollapsibleState.None);
        treeItem.command = { command: "vnotes.openNote", title: "Open Note", arguments: [element] };
        return treeItem;
    }

    getChildren(element?: VNote): Thenable<VNote[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const dirPath = path.join(process.env.HOME || process.env.USERPROFILE || "" , "vnotes");
            return new Promise(resolve => {
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
                const files = fs.readdirSync(dirPath);
                const vnotes = files.map(file => {
                    const filePath = path.join(dirPath, file);
                    const stats = fs.statSync(filePath);
                    const title = path.basename(file, ".vnote");
                    const creationTimestamp = stats.birthtimeMs;
                    const lastUpdatedTimestamp = stats.mtimeMs;
                    const tag = "vnote";
                    return new VNote(filePath, title, creationTimestamp, lastUpdatedTimestamp, tag);
                });
                resolve(vnotes);
            });
        }
    }
}

class VNoteNode extends vscode.TreeItem {
    constructor(
        public vnote: VNote,
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.vnote.filePath}`;
        this.iconPath = {
            light: path.join(__dirname, '..', '..', 'resources','light', 'Note.svg'),
            dark: path.join(__dirname, '..', '..', 'resources','dark', 'Note.svg')
        };
    }
}