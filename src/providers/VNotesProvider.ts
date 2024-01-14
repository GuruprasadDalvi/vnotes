import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { VNote } from '../models/VNote';

export function activate(context: vscode.ExtensionContext) {
    const vnotesProvider = new VNotesProvider();
    vscode.window.registerTreeDataProvider('vnotesView', vnotesProvider);
    vscode.commands.registerCommand('vnotes.refresh', () => vnotesProvider.refresh());
}

export class VNotesProvider implements vscode.TreeDataProvider<VNote> {
    private _onDidChangeTreeData: vscode.EventEmitter<VNote | undefined> = new vscode.EventEmitter<VNote | undefined>();
    readonly onDidChangeTreeData: vscode.Event<VNote | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: VNote): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.title, vscode.TreeItemCollapsibleState.None);
        treeItem.command = { command: "vnotes.openNote", title: "Open Note", arguments: [element] };
        return treeItem;
    }

    getChildren(element?: VNote): Thenable<VNote[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const dirPath = path.join(process.env.HOME || process.env.USERPROFILE, "vnotes");
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