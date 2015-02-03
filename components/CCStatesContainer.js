'use strict';


var componentsRegistry = milo.registry.components
    , Component = milo.Component
    , activeEditor = require('../../util/active_editor');


var CCStatesContainer = Component.createComponentClass('CCStatesContainer', {
    transfer: undefined
});


componentsRegistry.add(CCStatesContainer);

module.exports = CCStatesContainer;


_.extendProto(CCStatesContainer, {
    init: CCStatesContainer$init,
    destroy: CCStatesContainer$destroy,
    setActiveState: CCStatesContainer$setActiveState
});


function CCStatesContainer$init() {
    Component.prototype.init.apply(this, arguments);
    subscribeAssetChange.call(this, 'on');
}


function CCStatesContainer$destroy() {
    subscribeAssetChange.call(this, 'off');
    Component.prototype.destroy.apply(this, arguments);
}


function CCStatesContainer$setActiveState(key) {
    this.transfer.setActiveState(key || activeEditor.get());
}


function subscribeAssetChange(onOff) {
    milo.mail[onOff]('changeactiveasset', { subscriber: changeActiveState, context: this });
}


function changeActiveState(msg, data) {
    var editorApp = data.newAsset && data.newAsset.editorApp;
    this.transfer.setActiveState(editorApp);
}
