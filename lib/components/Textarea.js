'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , logger = milo.util.logger
    , { handlePaste, removePasteHandler } = require('./paste');


var MLTextarea = Component.createComponentClass('MLTextarea', {
    data: undefined,
    events: undefined,
    dom: {
        cls: 'ml-ui-textarea'
    }
});

componentsRegistry.add(MLTextarea);

module.exports = MLTextarea;

_.extendProto(MLTextarea, {
    init: MLTextarea$init,
    destroy: MLTextarea$destroy,
    startAutoresize: MLTextarea$startAutoresize,
    stopAutoresize: MLTextarea$stopAutoresize,
    isAutoresized: MLTextarea$isAutoresized,
    disable: MLTextarea$disable
});

function MLTextarea$init() {
    Component.prototype.init.apply(this, arguments);
    handlePaste.call(this);
}

function MLTextarea$destroy() {
    removePasteHandler.call(this);
    Component.prototype.destroy.apply(this, arguments);
}

function MLTextarea$startAutoresize(options) {
    if (this._autoresize)
        return logger.warn('MLTextarea startAutoresize: autoresize is already on');
    this._autoresize = true;
    this._autoresizeOptions = options;

    _adjustAreaHeight.call(this);
    _manageSubscriptions.call(this, 'on');
}


function _manageSubscriptions(onOff) {
    this.events[onOff]('click', { subscriber: _adjustAreaHeight, context: this });
    this.data[onOff]('', { subscriber: _adjustAreaHeight, context: this });
}


function _adjustAreaHeight() {
    this.el.style.height = 0;

    var newHeight = this.el.scrollHeight
        , minHeight = this._autoresizeOptions.minHeight
        , maxHeight = this._autoresizeOptions.maxHeight;

    newHeight = newHeight >= maxHeight
                ? maxHeight
                : newHeight <= minHeight
                ? minHeight
                : newHeight;

    this.el.style.height = newHeight + 'px';
}


function MLTextarea$stopAutoresize() {
    if (! this._autoresize)
        return logger.warn('MLTextarea stopAutoresize: autoresize is not on');
    this._autoresize = false;
    _manageSubscriptions.call(this, 'off');
}


function MLTextarea$isAutoresized() {
    return this._autoresize;
}


function MLTextarea$disable(disable) {
    this.el.disabled = disable;
}
