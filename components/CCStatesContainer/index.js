'use strict';


var componentsRegistry = milo.registry.components
    , Component = milo.Component
    , activeEditor = require('../../../util/active_editor')
    , check = milo.util.check
    , Match = check.Match
    , logger = milo.util.logger
    , itemStates = require('./item_states');


var CCStatesContainer = Component.createComponentClass('CCStatesContainer', {
    data: { // should not be overwritten by subclasses, instead dataFacet... methods should be extended
        get: 'dataFacetGet',
        set: 'dataFacetSet',
        del: 'dataFacetDel'
    },
    model: undefined,
    transfer: undefined
});


componentsRegistry.add(CCStatesContainer);

module.exports = CCStatesContainer;


_.extendProto(CCStatesContainer, {
    init: CCStatesContainer$init,
    destroy: CCStatesContainer$destroy,
    setActiveState: CCStatesContainer$setActiveState,
    setTransferStates: CCStatesContainer$setTransferStates,
    performAction: CCStatesContainer$callMethod, //deprecated
    callMethod: CCStatesContainer$callMethod,
    getTransferItem: CCStatesContainer$getTransferItem,
    getDragParams: CCStatesContainer$getDragParams,
    scratchItem: CCStatesContainer$scratchItem,
    deleteItem: CCStatesContainer$deleteItem,

    dataFacetGet: CCStatesContainer$dataFacetGet,
    dataFacetSet: CCStatesContainer$dataFacetSet,
    dataFacetDel: CCStatesContainer$dataFacetDel
});


function CCStatesContainer$init() {
    Component.prototype.init.apply(this, arguments);
    subscribeAssetChange.call(this, 'on');
    checkDataFacet.call(this);
}


function checkDataFacet() {
    if (this.data.config.get != 'dataFacetGet')
        logger.error('data facet cannot be added to the subclass of CCStatesContainer');
}


function CCStatesContainer$destroy() {
    subscribeAssetChange.call(this, 'off');
    Component.prototype.destroy.apply(this, arguments);
}


function CCStatesContainer$setActiveState(key) {
    this.transfer.setActiveState(key || activeEditor.get());
}


function CCStatesContainer$setTransferStates(data) {
    if (isComponentState(data)) {
        delete this._itemType;
        delete this._itemData;
        this.transfer.setState(data);
    } else {
        this._itemType = data.itemType;
        this._itemData = data.itemData;
        var states = createItemStates(data);
        states.forEach(function (stateObj) {
            this.transfer.setStateWithKey(stateObj.editorApp, stateObj.state, stateObj.isDefault);
        }, this); 
        this.setActiveState();   
    }
}


function CCStatesContainer$dataFacetGet() {
    return this.model.get();
}


function CCStatesContainer$dataFacetSet(data) {
    var ccTransfer = data.cc_transfer;
    delete data.cc_transfer;

    this.model.set(data);
    this.data._set(data);
    if (data) this.setTransferStates(ccTransfer);
    if(ccTransfer) {
        var contextMenuConfig = this.performAction('getContextConfig') ;
        this.contextMenu.config.items = contextMenuConfig;
    }

}

function CCStatesContainer$dataFacetDel() {
    this.model.del();
}


function isComponentState(data) {
    return Match.test(data, Match.ObjectIncluding({
        compName: String,
        compClass: String,
        outerHTML: String
    }));
}


function createItemStates(data) {
    check(data, {
        itemType: String,
        itemData: Object
    });
    return itemStates[data.itemType].states.map(function(stateInfo) {
        return {
            editorApp: stateInfo.editorApp,
            state: stateInfo.createState(data.itemData),
            isDefault: stateInfo.isDefault
        };
    });
}


function subscribeAssetChange(onOff) {
    milo.mail[onOff]('changeactiveasset', { subscriber: changeActiveState, context: this });
}


function changeActiveState(msg, data) {
    var editorApp = data.newAsset && data.newAsset.editorApp;
    this.transfer.setActiveState(editorApp);
}


function CCStatesContainer$callMethod(method) {
    var itemType = this._itemType || this.model.m('.meta.compClass').get();
    try { var methods = itemStates[itemType].methods; } catch(e) {}

    if (methods) {
        var methodInfo = _.find(methods, function(m) {
            return m.method == method;
        });
        if (methodInfo) return methodInfo.func.call(this, this._itemData);
    }
}


function CCStatesContainer$getDragParams() {
    var itemType = this._itemType || this.model.m('.meta.compClass').get();
    try { var params = itemStates[itemType].dragParams; } catch(e) {}
    return typeof params == 'function' 
                    ? params.call(this, this._itemData)
                    : params;
}


function CCStatesContainer$getTransferItem() {
    if (this._itemType)
        return {
            itemType: this._itemType,
            itemData: this._itemData
        };
    else
        return this.transfer.getState();
}

function CCStatesContainer$scratchItem(event) {
    if (!this.getMeta) return logger.warn('Item does not provide scratch meta data.');
        var meta = { metaData: this.getMeta() };

    if (this.model) var scratchData = this.model.m('.cc_scratch').get();
    if (!scratchData) {
        scratchData = this.getTransferItem();
    }

    var data = {
        data: scratchData,
        meta: meta
    };
    milo.mail.postMessage('addtoscratch', data);
    milo.mail.once('addedtoscratch', onAddedToScratch.bind(this, event));
}

function onAddedToScratch(event, msg, data) {
    var options = { x: event.pageX-30, y: event.pageY-5, animationCls: 'cc-fade-in-out'};

    if (data.err)
        options.iconCls = 'glyphicon glyphicon-remove-sign';
    else
        options.iconCls = 'glyphicon glyphicon-ok-sign';

    milo.mail.postMessage('iconnotification', {options: options});
}

function CCStatesContainer$deleteItem(event) {
    var url = [
        window.CC.config.apiHost,
        'scratch/delete',
        this.model.m('.id').get()
    ].join('/');
    var self = this;

    milo.util.request.get(url, function (err) {
        if (err) return;

        self.item.removeItem();
    });
}


function cloneArticle(type, event) {
    _postLoadMessage.call(this, 'cloneasset');
}


function previewArticle(type, event) {
    _postLoadMessage.call(this, 'previewasset');
}



function _postLoadMessage(msg) {
    milo.mail.postMessage(msg, {
        editorApp: 'articleEditor',
        assetType: 'article',
        assetId: this.model.m('.id').get()
    });
}