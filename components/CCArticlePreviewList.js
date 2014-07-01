'use strict';

var componentsRegistry = milo.registry.components
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
                            <div class="cc-text-light cc-fl">ID: <span class="cc-dark" ml-bind="[data]:id"></span></div>\
                            <div class="cc-text-light cc-posa cc-r5">Modified: <span class="cc-dark" ml-bind="[data]:modifiedDate"></span></span></div>\
                        </div>\
                        <div class="cc-article-title-bar cc-clear cc-width-100 cc-pt5">\
                            <div class="cc-dark-bg cc-text cc-fl cc-light cc-bg-dark cc-plr5 cc-mr5" ml-bind="[data]:status"></div>\
                            <div class="cc-dark cc-lcall cc-bold" ml-bind="[data]:title"></div>\
                        </div>\
                        <div class="cc-article-short-body cc-clear cc-fl cc-width-100 cc-pt5">\
                            <div class="cc-fl cc-mr5" ml-bind="[data container]:thumb">\
                                <img ml-bind="[data]:hostUrl" class="media-object">\
                            </div>\
                            <div class="" ml-bind="[data]:previewText"></div>\
                        </div>\
                        <div class="cc-article-bottom-bar cc-clear cc-pt5">\
                            <div class="cc-text-light cc-fl">Created by: <span ml-bind="[data]:createdBy"></span></div>\
                            <div class="cc-text-light cc-fl cc-pl5"> - <span ml-bind="[data]:createdDate"></span></div>\
                            <span class="cc-article-actions">\
                                <span class="fa fa-search" ml-bind="[events]:previewBtn" title="read-only article"></span>\
                                <span class="cc-icon cc-clone-article-small-icon" ml-bind="[events]:cloneBtn" title="clone article"></span>\
                                <span class="cc-icon cc-scratch-icon" ml-bind="[events]:scratchBtn" title="scratch article"></span>\
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
    result.createdBy = data.fields.authors[0] && data.fields.authors[0].name;
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
    var ddmmyyyy = [
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear()
    ];
    var time = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    ];
    return ddmmyyyy.join('/') + ' ' + time.join(':');
}

function _findThumb(images) {
    if (images)
        return _.find(images, function(image) {
            return image.imageType == 'LL_PUFF_THUMB';
        });
}


