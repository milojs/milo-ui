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
                            <div class="cc-article-title" ml-bind="[data]:title"></div>\
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
    eachArticle: CCArticlePreviewList$eachArticle
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


function CCArticlePreviewList$eachArticle(callback, thisArg) {
    return this._list.list.each(callback, thisArg);
}


function CCArticlePreviewList_get() {
    var value = this.model.get();
    return typeof value == 'object' ? _.clone(value) : value;
}


function CCArticlePreviewList_set(value) {
    value = _parseMultiple(value);
    if (Array.isArray(value))
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
    var args = Array.prototype.slice.call(arguments);
    var dataFacet = this._list.data;
    args = args.slice(0, 2).concat(_parseMultiple(args.slice(2)));
    dataFacet._splice.apply(dataFacet, args);
    this.model.splice.apply(this.model, args);
}


function _sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(ARTICLEPREVIEWLIST_CHANGE_MESSAGE);
}

function _parseMultiple(multiple) {
    if (Array.isArray(multiple)) {
        return multiple.map(function (item) {
            return _parseData(item);
        });
    }
    return _parseData(multiple);
}

function _parseData(data) {
    var result = {};

    // Set the data in the search result
    result.id = data._id;
    result.type = data._type;
    result.title = data.fields.headline;
    result.previewText = data.fields.previewText;
    result.channel = data.fields.topParentChannel || data.fields.channel;
    result.createdBy = (data.fields.authors && data.fields.authors[0] && data.fields.authors[0].name) || '';
    result.createdDate = _dateHelper(data.fields.createdDate);
    result.modifiedDate = _dateHelper(data.fields.modifiedDate);
    result.status = data.fields.status;
    result.url = data.fields.articleURL;

    // Search through the images and find the puff thumb
    result.thumb = _findThumb(data.fields && data.fields.images);
    return result;
}

function _dateHelper(date) {
    if(!date) return null;
    date = _.toDate(date);

    return date && moment(date).format('MMM DD, YYYY HH:mm');
    //// native solution
    //var options = {
    //    year: "numeric", hour12:false, month: "short",
    //    day: "2-digit", hour: "2-digit", minute: "2-digit"
    //};
    //return date.toLocaleTimeString("en-gb",options).replace(/( [^ ]+)/,function(str,gr1){return gr1+','})
}

function _findThumb(images) {
    if (images)
        return _.find(images, function(image) {
            return image.imageType == 'LL_PUFF_THUMB';
        });
}


