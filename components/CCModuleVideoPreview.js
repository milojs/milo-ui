'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMVIDEO_GROUP_TEMPLATE = '<div>this video\
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
    transfer: undefined,
    container: undefined,
    bigImagePreview: {
        modelPaths: {
            imageSrc: '.fields.stillImage.hostUrl',
            captionText: '.fields.headline',
            id: '.fields.id',
            createdDate: '.fields.createdDate'
        }
    }
});

componentsRegistry.add(CCModuleVideoPreview);

module.exports = CCModuleVideoPreview;


_.extendProto(CCModuleVideoPreview, {
    getMeta: CCModuleVideoPreview$getMeta
});


function CCModuleVideoPreview$getMeta() {
    var model = this.model.get();
    return {
        description: model.fields.headline,
        preview: model.fields.stillImage.hostUrl,
        typeTitle: 'Video'
    }
}


function CCModuleVideoPreview_get() {
    return this.model.get();
}


function CCModuleVideoPreview_set(value) {
    this.model.set(value);
    if (value && value.fields.thumbImage.hostUrl)
        try { this.container.scope.image.el.src = value.fields.thumbImage.hostUrl; } catch(e) {}
    this.transfer.setState(_constructVideoState(value));
}


function CCModuleVideoPreview_del() {
    this.model.del();
    this.container.scope.image.el.removeAttribute(src);
}


function _constructVideoState(value) {
    if (!value) return;
    return {
        outerHTML: CMVIDEO_GROUP_TEMPLATE,
        compClass: 'MIVideoInstance',
        compName: milo.util.componentName(),
        facetsStates: {
            model: {
                state: {
                    videoId: value._id,
                    src: value.fields.stillImage.hostUrl,
                    width: value.fields.stillImage.width,
                    height: value.fields.stillImage.height,
                    headline: value.fields.headline,
                    tag: {
                        id: undefined,
                        name: 'video',
                        style: 2
                    }
                }
            }
        }
    };
}
