'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMIMAGE_GROUP_TEMPLATE = '<div class="artSplitter" ml-bind="CMImageGroup:newImage">\
    <div ml-bind="CMImage[data]:img0"><img ml-bind="[data]:img"></div>\
    <p class="imageCaption" ml-bind="CMImageCaption:imgCaption0">[caption]</p>\
</div>';


var CCModuleImagePreview = Component.createComponentClass('CCModuleImagePreview', {
    dom: {
        cls: 'cc-module-image-preview'
    },
    drag: {
        allowedEffects: 'copy'
    },
    data: {
        get: CCModuleImagePreview_get,
        set: CCModuleImagePreview_set,
        del: CCModuleImagePreview_del
    },
    model: undefined,
    events: undefined,
    transfer: undefined,
    container: undefined,
    bigImagePreview: {
        modelPaths: {
            imageSrc: '.proofUrl',
            captionText: '.caption'
        }
    }
});

componentsRegistry.add(CCModuleImagePreview);

module.exports = CCModuleImagePreview;

_.extendProto(CCModuleImagePreview, {
    init: CCModuleImagePreview$init,
    getMeta: CCModuleImagePreview$getMeta
});


function CCModuleImagePreview$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('stateready', _init);
}


function CCModuleImagePreview$getMeta() {
    var model = this.model.get();
    return {
        description: model.caption,
        preview: model.thumbUrl,
        typeTitle: 'Image'
    };
}


function _init() {
    var imgEl = this.el.getElementsByTagName('img')[0];
    imgEl.addEventListener('error', function () {
        this.src = 'http://i.dailymail.co.uk/i/pix/m_logo_154x115px.png';
    });
}

function CCModuleImagePreview_get() {
    return this.model.get();
}


function CCModuleImagePreview_set(value) {
    this.model.set(value);
    if (value && value.thumbUrl)
        this.container.scope.image.el.src = value.thumbUrl;
    this.transfer.setState(_constructImageGroupState(value));
}


function CCModuleImagePreview_del() {
    this.model.del();
    this.container.scope.image.el.removeAttribute(src);
}


function _constructImageGroupState(value) {
    if (!value) return;
    value.caption = milo.util.dom.stripHtml(value.caption);
    
    return {
        outerHTML: CMIMAGE_GROUP_TEMPLATE,
        compClass: 'CMImageGroup',
        compName: milo.util.componentName(),
        facetsStates: {
            data: {
                state: {
                    imgCaption0: "" //value.caption
                }
            },
            container: {
                scope: {
                    img0: {
                        facetsStates: {
                            model: {
                                state: {
                                    transferItem: value,
                                    url: value.proofUrl
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}
