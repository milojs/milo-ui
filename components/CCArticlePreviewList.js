'use strict';

var componentsRegistry = milo.registry.components
    , moment = require('moment')
    , Component = componentsRegistry.get('Component');


var ARTICLEPREVIEWLIST_CHANGE_MESSAGE = 'ccarticlepreviewlistchange';


var CCArticlePreviewList = Component.createComponentClass('CCArticlePreviewList', {
    container: undefined,
    dom: {
        cls: 'cc-related-preview-list',
        tagName: 'div'
    },
    model: undefined,
    data: {
        get: CCArticlePreviewList_get,
        set: CCArticlePreviewList_set,
        del: CCArticlePreviewList_del,
        splice: CCArticlePreviewList_splice,
        len: CCArticlePreviewList_len,
        event: ARTICLEPREVIEWLIST_CHANGE_MESSAGE
    },
    template: {
        template:
            '<span ml-bind="[list]:relatedArticles">\
            <article ml-bind="CCModuleArticlePreview[item]:result" class="media" >\
                <span class="bocc channel-bar"></span>\
                <div>\
                    <div>\
                        <div class="cc-article-top-bar">\
                            <div class="cc-id"><span ml-bind="[data]:id"></span></div>\
                            <div class="cc-created"> <span ml-bind="[data]:createdDate"></span></div>\
                            <div class="cc-modified">Modified: <span ml-bind="[data]:modifiedDate"></span></span></div>\
                        </div>\
                        <div class="cc-article-title-bar">\
                            <div class="cc-status" ml-bind="[data]:status"></div>\
                            <div class="cc-article-title" ml-bind="[data]:headline"></div>\
                        </div>\
                        <div class="cc-article-short-body">\
                            <div class="cc-preview-image" ml-bind="[data container]:thumb">\
                                <img ml-bind="[data]:hostUrl" class="media-object">\
                            </div>\
                            <div class="" ml-bind="[data]:previewText"></div>\
                        </div>\
                        <div class="cc-article-bottom-bar">\
                            <div class="cc-created-by"><span ml-bind="[data]:createdBy"></span></div>\
                            <span class="cc-article-actions">\
                                <span class="fa fa-search cc-debug" ml-bind="[events]:previewBtn" title="read-only article"></span>\
                                <span class="cc-icon cc-clone-article-small-icon" ml-bind="[events]:cloneBtn" title="Clone this article"></span>\
                                <span class="cc-icon cc-scratch-icon" ml-bind="[events]:scratchBtn" title="Scratch this article"></span>\
                            </span>\
                        </div>\
                    </div>\
                </div>\
            </article>\
            </span>'
    }
});

componentsRegistry.add(CCArticlePreviewList);

module.exports = CCArticlePreviewList;


_.extendProto(CCArticlePreviewList, {
    start: CCArticlePreviewList$start,
    eachListItem: CCArticlePreviewList$eachListItem
});


function CCArticlePreviewList$start() {
    Component.prototype.start.apply(this, arguments);
    this.template.render();
    this.on('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    this._list = this.container.scope.relatedArticles;
    this.model.set([]);
}


function CCArticlePreviewList$eachListItem(callback, thisArg) {
    return this._list.list.each(callback, thisArg);
}


function CCArticlePreviewList_get() {
    var value = this.model.get();
    return typeof value == 'object' ? _.clone(value) : value;
}


function CCArticlePreviewList_set(value) {
    this._list.data._set(value);
    this.model.set(value);
    _sendChangeMessage.call(this);
    return value;
}


function CCArticlePreviewList_del() {
    this._list.data._del();
    this.model.del();
    _sendChangeMessage.call(this);
}


function CCArticlePreviewList_splice() { // ... arguments
    var dataFacet = this._list.data;
    dataFacet._splice.apply(dataFacet, arguments);
    this.model.splice.apply(this.model, arguments);
}


function CCArticlePreviewList_len() {
    return this._list.data._len();
}


function _sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(ARTICLEPREVIEWLIST_CHANGE_MESSAGE);
}
