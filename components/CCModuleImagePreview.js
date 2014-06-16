'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMIMAGE_GROUP_TEMPLATE = '<div class="artSplitter" ml-bind="CMImageGroup:newImage">\
    <div ml-bind="CMImage[data]:img0"><img ml-bind="[data]:img"></div>\
    <p class="imageCaption" ml-bind="CMImageCaption:imgCaption0"></p>\
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
    
    var scope = this.container.scope;
    scope.scratch && scope.scratch.events.on('click', { subscriber: sendToScratch, context: this });
}

function CCModuleImagePreview_get() {
    return this.model.get();
}


function CCModuleImagePreview_set(value) {
    this.model.set(value);

    if (!value) return;

    var isLandscape = isLandscapeImage(value);
    this.el.classList.toggle('cc-landscape', isLandscape);
    this.el.classList.toggle('cc-portrait', !isLandscape);

    if (value.thumbUrl)
        this.container.scope.image.el.src = _createThumbUrl.call(this, value.thumbUrl);
    this.transfer.setState(_constructImageGroupState(value));
}

function isLandscapeImage(value) {
    return (value.propertyProductionWidth / value.propertyProductionHeight) > 1;
}

//generated a new thumb using the width as a ref
function _createThumbUrl(thumbUrl) {

    //if someone request better images uncomment this
    // var scaledWidth = this.el.offsetWidth;

    // if (scaledWidth == 0)
    //     return thumbUrl;

    // thumbUrl = decodeURIComponent(thumbUrl);

    // //use the original image when generating the new image
    // thumbUrl = thumbUrl.replace('type=t', 'type=o');

    // var originalWidth = /(?:width=)([0-9]+),/.exec(thumbUrl)[1];
    // var originalHeight = /(?:height=)([0-9]+),/.exec(thumbUrl)[1];
    // var scaledHeight = Math.round(scaledWidth * parseInt(originalHeight, 10) / parseInt(originalWidth, 10));

    // thumbUrl = thumbUrl.replace(/width=[0-9]+/, 'width=' + scaledWidth);
    // thumbUrl = thumbUrl.replace(/height=[0-9]+/, 'height=' + scaledHeight);


    return thumbUrl;
}


function CCModuleImagePreview_del() {
    this.model.del();
    this.container.scope.image.el.removeAttribute(src);
}


function sendToScratch(type, event) {
    event.stopPropagation();

    var state = this.transfer.getState();
    var metaData = this.getMeta();

    var scratchData = {
        data: state,
        meta: {
            compClass: state.compClass,
            compName: state.compName,
            metaData: metaData
        }
    };

    milo.mail.postMessage('addtoscratch', scratchData);
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


function _constructImageGroupState(value) {
    if (!value) return;
    value.caption = milo.util.dom.stripHtml(value.caption);
    
    return {
        outerHTML: CMIMAGE_GROUP_TEMPLATE,
        compClass: 'CMImageGroup',
        compName: milo.util.componentName(),
        facetsStates: {
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
