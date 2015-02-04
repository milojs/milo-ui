'use strict';


var componentsRegistry = milo.registry.components
    , Component = milo.Component
    , activeEditor = require('../../../util/active_editor')
    , check = milo.util.check
    , Match = check.Match
    , logger = milo.util.logger
    , itemStates = require('./item_states');

    console.log(itemStates);


var CCStatesContainer = Component.createComponentClass('CCStatesContainer', {
    data: { // should not be overwritten by subclasses, instead dataFacet... methods should be extended
        get: CCStatesContainer_get,
        set: CCStatesContainer_set,
        del: CCStatesContainer_del
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
    if (this.data.config.get != CCStatesContainer_get)
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


function CCStatesContainer_get() {
    return this.dataFacetGet();
}


function CCStatesContainer_set(data) {
    return this.dataFacetSet(data);
}


function CCStatesContainer_del() {
    return this.dataFacetDel();
}
