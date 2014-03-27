'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var VIDEOPREVIEWLIST_CHANGE_MESSAGE = 'ccvideopreviewlistchange';


var CCVideoPreviewList = Component.createComponentClass('CCVideoPreviewList', {
    container: undefined,
    dom: {
        cls: 'cc-video-preview-list',
        tagName: 'div'
    },
    model: undefined,
    data: {
        get: CCVideoPreviewList_get,
        set: CCVideoPreviewList_set,
        del: CCVideoPreviewList_del,
        splice: CCVideoPreviewList_splice,
        event: VIDEOPREVIEWLIST_CHANGE_MESSAGE
    },
    template: {
        template:
            '<div ml-bind="[list]:videoList">\
                <img ml-bind="CCModuleVideoPreview[item]:videoItem">\
            </div>'
    }
});

componentsRegistry.add(CCVideoPreviewList);

module.exports = CCVideoPreviewList;


_.extendProto(CCVideoPreviewList, {
    start: CCVideoPreviewList$start,
    eachVideo: CCVideoPreviewList$eachVideo
});


function CCVideoPreviewList$start() {
    Component.prototype.start.apply(this, arguments);
    this.template.render();
    this.on('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    this._list = this.container.scope.videoList;
    this.model.set([]);
}


function CCVideoPreviewList$eachVideo(callback, thisArg) {
    return this._list.list.each(callback, thisArg);
}


function CCVideoPreviewList_get() {
    var value = this.model.get();
    return typeof value == 'object' ? _.clone(value) : value;
}


function CCVideoPreviewList_set(value) {
    if (Array.isArray(value))
        this._list.data._set(value);
    this.model.set(value);
    _sendChangeMessage.call(this);
    return value;
}


function CCVideoPreviewList_del() {
    this._list.data._del();
    this.model.del();
    _sendChangeMessage.call(this);
}


function CCVideoPreviewList_splice() { // ... arguments
    var dataFacet = this._list.data;
    dataFacet._splice.apply(dataFacet, arguments);
    this.model.splice.apply(this.model, arguments);
}


function _sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(VIDEOPREVIEWLIST_CHANGE_MESSAGE);
}
