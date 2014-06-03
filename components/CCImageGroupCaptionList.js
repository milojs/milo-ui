'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;

var IMAGEGROUPCAPTION_CHANGE_MESSAGE = 'ccimagegroupcaptionchange';

var CCImageGroupCaptionList = Component.createComponentClass('CCImageGroupCaptionList', {
    container: undefined,
    events: undefined,
    dom: {
        cls: 'cc-imagegroup-group'
    },
    data: {
        get: CCImageGroupCaptionList_get,
        set: CCImageGroupCaptionList_set,
        del: CCImageGroupCaptionList_del,
        splice: CCImageGroupCaptionList_splice,
        event: IMAGEGROUPCAPTION_CHANGE_MESSAGE
    },
    model: undefined
    //model: {
    //    messages: {
    //        '*': {
    //            subscriber: _.throttle(onListUpdated, 100),
    //            context: 'owner'
    //        },
    //        '**': {
    //            subscriber: _.throttle(onInnerChange, 50),
    //            context: 'owner'
    //        }
    //    }
    //}
});

componentsRegistry.add(CCImageGroupCaptionList);
module.exports = CCImageGroupCaptionList;

_.extendProto(CCImageGroupCaptionList, {
    init: CCImageGroupCaptionList$init
});


function CCImageGroupCaptionList$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    milo.minder(this.container.scope.imagesList.data, '<<<-', this.model);
}


function CCImageGroupCaptionList_get() {
    var model = this.model.get();
    return model ? _.deepClone(model) : [];
}


function CCImageGroupCaptionList_set(value) {
   debugger;
    this.model.set(value || []);
    sendChangeMessage.call(this);
}


function CCImageGroupCaptionList_del() {
    debugger;
    var res = this.model.set([]);
    sendChangeMessage.call(this);
    return res;
}


function CCImageGroupCaptionList_splice(index, howmany) { // ... arguments
    var args = [index, howmany].concat(Array.prototype.slice.call(arguments, 2));

    this.model.splice.apply(this.model, args);
    sendChangeMessage.call(this);
}

function sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(IMAGEGROUPCAPTION_CHANGE_MESSAGE);
}
