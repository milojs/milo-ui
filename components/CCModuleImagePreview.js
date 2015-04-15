'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;


var CMIMAGE_GROUP_TEMPLATE = '<div class="artSplitter mol-img-group" ml-bind="CMImageGroup:newImage">\
    <div ml-bind="CMImage[data]:img0" class="mol-img"><img ml-bind="[data,events]:img"></div>\
    <p class="imageCaption" ml-bind="CMImageCaption:imgCaption0"></p>\
</div>';


var CCModuleImagePreview = Component.createComponentClass('CCModuleImagePreview', {
    dom: {
        cls: 'cc-module-image-preview'
    },
    drag: {
        allowedEffects: 'copyLink'
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
    this.on('stateready', onStateReady);

    var isInFrame = !!window.frameElement;
    this._postMethod = isInFrame ? 'trigger' : 'postMessage';
    this._subscribePrefix = isInFrame ? 'message:' : '';
    this._assetId = this.model.m('.assetTransferId');
    subscribeUsedAssetsHash.call(this);
}

function subscribeUsedAssetsHash() {
    var refresh;

    // (usedAssets:Listen:3) in CMImage
    // this component is at the top window
    milo.mail.on('usedassetshash', { context: this, subscriber: refreshHighlight });

    function refreshHighlight(msg, hashData) {
        var self = this;
        if(refresh) window.clearTimeout(refresh);
        refresh = window.setTimeout(function(){
            _refreshHighlight.call(self, msg, hashData);
        }, 100);
    }

    function _refreshHighlight(msg, hashData) {
        var addOrRemove;
        if(_.isEqual(hashData, {}))
            addOrRemove = 'remove';
        else {
            if(this.destroyed || !this.model.get() || !this.el) return;

            var assetId = this._assetId && this._assetId.get();

            if(!assetId)
                return logger.error('could not get assetId on ' + this.constructor.name);

            var hash = hashData.imagegroup;
            addOrRemove = hash && hash[assetId] ? 'add' : 'remove';
        }
        this.el && this.el.classList[addOrRemove]('cc-exists-in-asset');
    }
}


function CCModuleImagePreview$getMeta() {
    var model = this.model.get();
    return {
        description: model.caption,
        preview: model.thumbUrl,
        typeTitle: 'Image'
    };
}


function onStateReady() {
    var scope = this.container.scope
        , imgComponent = scope.image;

    if (imgComponent && imgComponent.events)
        imgComponent.events.on('error', onImageError);

    if (scope.scratch)
        scope.scratch.events.on('click', { subscriber: sendToScratch, context: this });

    function onImageError() {
        this.owner.el.src = 'http://i.dailymail.co.uk/i/pix/m_logo_154x115px.png';
    }
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

    milo.mail[this._postMethod]('addtoscratch', scratchData);
    milo.mail.once(this._subscribePrefix + 'addedtoscratch', onAddedToScratch.bind(this, event));
}


function onAddedToScratch(event, msg, data) {
    var options = { x: event.clientX-30, y: event.clientY-5, animationCls: 'cc-fade-in-out'};

    if (data.err)
        options.iconCls = 'glyphicon glyphicon-remove-sign';
    else
        options.iconCls = 'glyphicon glyphicon-ok-sign';
    
    milo.mail[this._postMethod]('iconnotification', {options: options});
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
