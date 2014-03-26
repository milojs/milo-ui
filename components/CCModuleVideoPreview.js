'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMVIDEO_GROUP_TEMPLATE = '<div class="videoPreview">\
    </div>';


var CCModuleVideoPreview = Component.createComponentClass('CCModuleVideoPreview', {
    dom: {
        cls: 'cc-module-video-preview'
    },
    drag: {
        allowedEffects: 'copy'
    },
    data: {
        get: CCModuleVideoPreview_get,
        set: CCModuleVideoPreview_set,
        del: CCModuleVideoPreview_del
    },
    model: undefined,
    events: undefined,
    transfer: undefined
});

componentsRegistry.add(CCModuleVideoPreview);

module.exports = CCModuleVideoPreview;


function CCModuleVideoPreview_get() {
    return this.model.get();
}


function CCModuleVideoPreview_set(value) {
    this.model.set(value);
    if (value && value.fields.thumbImage.hostUrl)
        this.el.src = value.fields.thumbImage.hostUrl;
    this.transfer.setState(_constructVideoState(value));
}


function CCModuleVideoPreview_del() {
    this.model.del();
    this.el.removeAttribute(src);
}


function _constructVideoState(value) {
    if (!value) return;
    return {
        outerHTML: CMVIDEO_GROUP_TEMPLATE
    };
}
