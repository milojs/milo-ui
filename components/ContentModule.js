'use strict';

// milo is global - will only work in browser

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


var ContentModule = Component.createComponentClass('ContentModule', {
    options: undefined,
    container: undefined,
    dom: {
        cls: 'cc-module-relative'
    },
    editor: undefined
});


componentsRegistry.add(ContentModule);

module.exports = ContentModule;


_.extendProto(ContentModule, {
    remove: ContentModule$remove
});


function ContentModule$remove() {
    this.editor.postMessageSync('assetedited', {
        type: 'removed',
        component: this
    });
    Component.prototype.remove.apply(this, arguments);
}
