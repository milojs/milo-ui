'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var ARTICLEMODULE_PREVIEWLIST_CHANGE_MESSAGE = 'ccarticlemodulepreviewlistchange';


var CCArticleModulePreviewList = Component.createComponentClass('CCArticleModulePreviewList', {
    container: undefined,
    dom: {
        cls: 'cc-articlemodule-preview-list',
        tagName: 'div'
    },
    model: undefined,
    data: {
        get: CCArticleModulePreviewList_get,
        set: CCArticleModulePreviewList_set,
        del: CCArticleModulePreviewList_del,
        splice: CCArticleModulePreviewList_splice,
        event: ARTICLEMODULE_PREVIEWLIST_CHANGE_MESSAGE
    },
    template: {
        template:
            '<div ml-bind="[list]:ArticleModuleList">\
                <article ml-bind="CCModuleArticleModulePreview[item]:result" >\
                    <span class="cc-articlemodule-id" ml-bind="[data]:id"></span>\
                    <span class="cc-articlemodule-title" ml-bind="[data]:title"></span>\
                    <span class="cc-articlemodule-type" ml-bind="[data]:type"></span>\
                </article>\
            </div>'
    }
});

componentsRegistry.add(CCArticleModulePreviewList);

module.exports = CCArticleModulePreviewList;


_.extendProto(CCArticleModulePreviewList, {
    start: CCArticleModulePreviewList$start,
    eachArticleModule: CCArticleModulePreviewList$eachArticleModule
});


function CCArticleModulePreviewList$start() {
    Component.prototype.start.apply(this, arguments);
    this.template.render();
    this.on('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    this._list = this.container.scope.ArticleModuleList;
    var m = this.model;
    _.defer(function() {
        if (! m.get()) m.set([]);
    });
}


function CCArticleModulePreviewList$eachArticleModule(callback, thisArg) {
    return this._list.list.each(callback, thisArg);
}


function CCArticleModulePreviewList_get() {
    var value = this.model.get();
    return typeof value == 'object' ? _.clone(value) : value;
}


function CCArticleModulePreviewList_set(value) {
    if (Array.isArray(value))
        this._list.data._set(value);
    this.model.set(value);
    _sendChangeMessage.call(this);
    return value;
}


function CCArticleModulePreviewList_del() {
    this._list.data._del();
    this.model.del();
    _sendChangeMessage.call(this);
}


function CCArticleModulePreviewList_splice() { // ... arguments
    var dataFacet = this._list.data;
    dataFacet._splice.apply(dataFacet, arguments);
    this.model.splice.apply(this.model, arguments);
}


function _sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(ARTICLEMODULE_PREVIEWLIST_CHANGE_MESSAGE);
}
