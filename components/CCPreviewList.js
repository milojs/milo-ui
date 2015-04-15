'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var PREVIEWLIST_CHANGE_MESSAGE = 'ccpreviewlistchange';


var CCPreviewList = Component.createComponentClass('CCPreviewList', {
    container: undefined,
    dom: {
        cls: ['cc-preview-list', 'cc-clearfix'],
        tagName: 'div'
    },
    model: undefined,
    data: {
        get: CCPreviewList_get,
        set: CCPreviewList_set,
        del: CCPreviewList_del,
        splice: CCPreviewList_splice,
        len: CCPreviewList_len,
        event: PREVIEWLIST_CHANGE_MESSAGE
    }
});

componentsRegistry.add(CCPreviewList);

module.exports = CCPreviewList;


_.extendProto(CCPreviewList, {
    start: CCPreviewList$start,
    eachListItem: CCPreviewList$eachListItem
});


function CCPreviewList$start() {
    Component.prototype.start.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    this._list = this.container.scope.list;
    var m = this.model;
    _.defer(function() {
        if (! m.get()) m.set([]);
    });
}


function CCPreviewList$eachListItem(callback, thisArg) {
    return this._list.list.each(callback, thisArg);
}


function CCPreviewList_get() {
    var value = this.model.get();
    return typeof value == 'object' ? _.clone(value) : value;
}


function CCPreviewList_set(value) {
    if (Array.isArray(value))
        this._list.data._set(value);
    this.model.set(value);
    _sendChangeMessage.call(this);
    return value;
}


function CCPreviewList_del() {
    this._list.data._del();
    this.model.del();
    _sendChangeMessage.call(this);
}


function CCPreviewList_splice() { // ... arguments
    var dataFacet = this._list.data;
    dataFacet._splice.apply(dataFacet, arguments);
    this.model.splice.apply(this.model, arguments);
}


function CCPreviewList_len() {
    return this._list.data._len();
}


function _sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(PREVIEWLIST_CHANGE_MESSAGE);
    // (usedAssets:Post:2) on change in CCPreviewList
    milo.mail.postMessage('assetlistpageloaded');
}
