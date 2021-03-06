﻿///ts:import=app
import app = require('../app'); ///ts:import:generated

export interface IRichTextEditor {
    setText(text: string): void;
    getText(): string;
    setId(id: string): void;
    initEditor(): void;
}

export class CKEditorRichText implements IRichTextEditor {
    private id: string;

    public setId(id: string) {
        this.id = id;
    }

    public getText(): string {
        var editor = this.getInstance();
        if (editor != null) {
            return editor.getData();
        }
        else {
            return "";
        }
    }

    public setText(text: string): void {
        var editor = this.getInstance();
        if (editor != null) {
            editor.setData(text);
        }
    }

    public initEditor(): void {
        $('#' + this.id).ckeditor();
    }

    private getInstance(): any {
        return CKEDITOR.instances[this.id];
    }
}

export interface IRichTextEditorFactory {
    create(id: string): IRichTextEditor;
}

export class CKEditorFactory implements IRichTextEditorFactory {
    public create(id: string): CKEditorRichText {
        var editor: CKEditorRichText = new CKEditorRichText();
        editor.setId(id);
        return editor;
    }
}

export interface IDocumentLocation {
    reload(): void;
}

export class DocumentLocation implements IDocumentLocation {
    public reload(): void {
        location.reload();
    }
}

angular.module(app.getModuleName()).service('richTextService', [CKEditorRichText]);
angular.module(app.getModuleName()).service('richTextFactory', [CKEditorFactory]);
angular.module(app.getModuleName()).service('documentLocation', [DocumentLocation]);
