'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


var LISTITEM_CHANGE_MESSAGE = 'mllistitemchange';

var MLListItemSimple = Component.createComponentClass('MLListItemSimple', {
    container: undefined,
    dom: undefined,
    data: {
        get: MLListItemSimple_get,
        set: MLListItemSimple_set,
        del: MLListItemSimple_del,
        event: LISTITEM_CHANGE_MESSAGE
    },
    model: undefined,
    item: undefined
});

componentsRegistry.add(MLListItemSimple);

module.exports = MLListItemSimple;


function MLListItemSimple_get() {
    var value = this.model.get();
    return value !== null && typeof value == 'object' ? _.clone(value) : value;
}


function MLListItemSimple_set(value) {
    if (typeof value == 'object')
        this.data._set(value);
    this.model.set(value);
    _sendChangeMessage.call(this);
    return value;
}


function MLListItemSimple_del() {
    this.data._del();
    this.model.del();
    _sendChangeMessage.call(this);
}


function _sendChangeMessage() {
    this.data.dispatchSourceMessage(LISTITEM_CHANGE_MESSAGE);
}
