'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var IMAGEPREVIEWLIST_CHANGE_MESSAGE = 'ccimagepreviewlistchange';


var CCImagePreviewList = Component.createComponentClass('CCImagePreviewList', {
    container: undefined,
    dom: {
        cls: 'cc-image-preview-list',
        tagName: 'div'
    },
    model: undefined,
    data: {
        get: CCImagePreviewList_get,
        set: CCImagePreviewList_set,
        del: CCImagePreviewList_del,
        splice: CCImagePreviewList_splice,
        event: IMAGEPREVIEWLIST_CHANGE_MESSAGE
    },
    template: {
        template:
            '<div ml-bind="[list]:imageList">\
                <img ml-bind="CCModuleImagePreview[item]:imageItem">\
            </div>'
    }
});

componentsRegistry.add(CCImagePreviewList);

module.exports = CCImagePreviewList;


_.extendProto(CCImagePreviewList, {
    start: CCImagePreviewList$start,
    eachImage: CCImagePreviewList$eachImage
});


function CCImagePreviewList$start() {
    Component.prototype.start.apply(this, arguments);
    this.template.render();
    this.on('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    this._list = this.container.scope.imageList;
    var m = this.model;
    _.defer(function() {
        if (! m.get()) m.set([]);
    });
}


function CCImagePreviewList$eachImage(callback, thisArg) {
    return this._list.list.each(callback, thisArg);
}


function CCImagePreviewList_get() {
    var value = this.model.get();
    return typeof value == 'object' ? _.clone(value) : value;
}


function CCImagePreviewList_set(value) {
    if (Array.isArray(value))
        this._list.data._set(value);
    this.model.set(value);
    _sendChangeMessage.call(this);
    return value;
}


function CCImagePreviewList_del() {
    this._list.data._del();
    this.model.del();
    _sendChangeMessage.call(this);
}


function CCImagePreviewList_splice() { // ... arguments
    var dataFacet = this._list.data;
    dataFacet._splice.apply(dataFacet, arguments);
    this.model.splice.apply(this.model, arguments);
}


function _sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(IMAGEPREVIEWLIST_CHANGE_MESSAGE);
}
