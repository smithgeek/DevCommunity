var CKEditorRichText = (function () {
    function CKEditorRichText() {
    }
    CKEditorRichText.prototype.setId = function (id) {
        this.id = id;
    };

    CKEditorRichText.prototype.getText = function () {
        var editor = this.getInstance();
        if (editor != null) {
            return editor.getData();
        } else {
            return "";
        }
    };

    CKEditorRichText.prototype.setText = function (text) {
        var editor = this.getInstance();
        if (editor != null) {
            editor.setData(text);
        }
    };

    CKEditorRichText.prototype.getInstance = function () {
        return CKEDITOR.instances[this.id];
    };
    return CKEditorRichText;
})();

var DocumentLocation = (function () {
    function DocumentLocation() {
    }
    DocumentLocation.prototype.reload = function () {
        location.reload();
    };
    return DocumentLocation;
})();
//# sourceMappingURL=Browser.js.map
