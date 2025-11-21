'use strict';

function onPaste(e) {
    e.stopPropagation();
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    if (html) {
        // html
        let escaped = html.replace(/<\/?[^>]+(>|$)/g, "");
        // entities
        escaped = escaped.replace(/&nbsp;/g, ' ');
        escaped = escaped.replace(/&amp;/g, '&');
        escaped = escaped.replace(/&lt;/g, '<');
        escaped = escaped.replace(/&gt;/g, '>');
        escaped = escaped.replace(/&quot;/g, '"');
        // utf entities
        escaped = escaped.replace(/&#(\d+);/g, (_, dec) => {
            return String.fromCharCode(dec);
        });
        this.data.set(escaped); // strip HTML tags
        return;
    }
    const text = e.clipboardData.getData('text');
    if (text) {
        this.data.set(text);
        return;
    }
}

function handlePaste() {    
    this.__onPaste = onPaste.bind(this);
    this.el.addEventListener('paste', this.__onPaste);
}

function removePasteHandler() {
    if (this.__onPaste) {
        this.el.removeEventListener('paste', this.__onPaste);
        this.__onPaste = null;
    }
}

module.exports = {
    handlePaste,
    removePasteHandler
};
