
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

export interface IDocumentLocation {
    reload(): void;
}

export class DocumentLocation implements IDocumentLocation {
    public reload(): void {
        location.reload();
    }
}
