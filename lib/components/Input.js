'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , { handlePaste, removePasteHandler } = require('./paste');


var MLInput = Component.createComponentClass('MLInput', {
    data: undefined,
    events: undefined,
    dom: {
        cls: 'ml-ui-input'
    }
});

componentsRegistry.add(MLInput);

module.exports = MLInput;

_.extendProto(MLInput, {
    init: MLInput$init,
    destroy: MLInput$destroy,
    disable: MLInput$disable,
    isDisabled: MLInput$isDisabled,
    setMaxLength: MLInput$setMaxLength
});

function MLInput$init() {
    Component.prototype.init.apply(this, arguments);
    handlePaste.call(this);
}

function MLInput$destroy() {
    removePasteHandler.call(this);
    Component.prototype.destroy.apply(this, arguments);
}

function MLInput$disable(disable) {
    this.el.disabled = disable;
}

function MLInput$isDisabled() {
    return !!this.el.disabled;
}

function MLInput$setMaxLength(length) {
    this.el.setAttribute('maxlength', length);
}
