'use strict';
//TODO: Refactor as soon as possible, very similar to CCModuleImagePreview
var componentsRegistry = milo.registry.components
    , moment = require('moment')
    , fs = require('fs')
    , doT = milo.util.doT
    , Component = componentsRegistry.get('Component');


var CMVIDEO_GROUP_TEMPLATE = '<div>this video</div>';
var LISTITEM_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/article/listItem.dot'));

var activeState = 'article';
milo.mail.on('changeactiveasset', function (msg, data) {
    activeState = data.asset && data.asset.type;
});

var CCModuleVideoPreview = Component.createComponentClass('CCModuleVideoPreview', {
    dom: {
        cls: ['cc-module-video-preview', 'media', 'video']
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
    init: CCModuleVideoPreview$init,
    destroy: CCModuleVideoPreview$destroy,
    getMeta: CCModuleVideoPreview$getMeta
});


function CCModuleVideoPreview$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('stateready', onStateReady);
    milo.mail.on('changeactiveasset', {subscriber: changeActiveState, context: this});
}


function onStateReady() {
    var scope = this.container.scope;
    if (scope.scratch)
        scope.scratch && scope.scratch.events.on('click', { subscriber: sendToScratch, context: this });
}


function changeActiveState() {
    this.transfer.setActiveState(activeState);
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


function CCModuleVideoPreview$destroy() {
    Component.prototype.destroy.apply(this, arguments);

}


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
    //if stillimage is not defined use thumb instead
    value.fields.stillImage = value.fields.stillImage || _.deepClone(value.fields.thumbImage);
    this.model.set(value);
    CCModuleVideoPreview_setChannel.call(this, value.fields.channel);
    if (value && value.fields.thumbImage && value.fields.thumbImage.hostUrl)
        try { this.container.scope.image.el.src = value.fields.thumbImage.hostUrl; } catch(e) {}
        this.transfer.setStateWithKey('article', _constructVideoState(value));
        this.transfer.setStateWithKey('linklist', _constructVideoLinkState(value));
        this.transfer.setActiveState(activeState);
        value = _parseData(value);
        this.data._set(value);
    }

function CCModuleVideoPreview_setChannel(newChannel) {
    if (this._channel)
        this.el.classList.remove(this._channel);

    this._channel = newChannel;
    this.el.classList.add(this._channel);
}

function _parseData(data) {
    var result = {};
    result = data.fields;
    result.createdDate = _dateHelper(data.fields.createdDate);
    return result;
}

function _dateHelper(date) {
    if(!date) return null;
    date = _.toDate(date);
    return date && moment(date).format('MMM DD, YYYY HH:mm');
}


function CCModuleVideoPreview_del() {
    this.model.del();
    this.container.scope.image.el.removeAttribute('src');
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
                    instance: {
                        videoId: value.fields.id
                    },
                    src: value.fields.stillImage && value.fields.stillImage.hostUrl,
                    width: value.fields.stillImage && value.fields.stillImage.width,
                    height: value.fields.stillImage && value.fields.stillImage.height,
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


function _constructVideoLinkState(value) {
    if (!value) return;

    var compName = milo.util.componentName();

    return {
        outerHTML: LISTITEM_TEMPLATE({compName: compName}),
        compName: compName,
        compClass: 'LELinkItem',
        facetsStates: {
            model: {
                state: {
                    videoId: value.fields.id,
                    description: value.fields.headline
                }
            }
        }
    };
}

