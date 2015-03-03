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
    performAction: CCStatesContainer$performAction,
    getTransferItem: CCStatesContainer$getTransferItem,
    getDragParams: CCStatesContainer$getDragParams,

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
    this.model.set(data);
    this.data._set(data);
    if (data) this.setTransferStates(data.cc_transfer);
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


function CCStatesContainer$performAction(action) {
    var itemType = this._itemType || this.model.m('.meta.compClass').get();
    try { var actions = itemStates[itemType].actions; } catch(e) {}

    if (actions) {
        var actionInfo = _.find(actions, function(a) {
            return a.action == action;
        });
        if (actionInfo) actionInfo.func.call(this, this._itemData);
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
