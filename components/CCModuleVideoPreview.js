'use strict';
//TODO: Refactor as soon as possible, very similar to CCModuleImagePreview
var componentsRegistry = milo.registry.components
    , moment = require('moment')
    , CCStatesContainer = componentsRegistry.get('CCStatesContainer');


var CCModuleVideoPreview = CCStatesContainer.createComponentClass('CCModuleVideoPreview', {
    dom: {
        cls: ['cc-module-video-preview', 'media']
    },
    drag: {
        allowedEffects: 'copy',
        meta: {
            params: getMetaParams
        }
    },
    events: {
        messages: {
            'dblclick': { subscriber: onDblClick, context: 'owner' }
        }
    },
    container: undefined,
    bigImagePreview: {
        modelPaths: {
            imageSrc: '.stillImage.hostUrl',
            captionText: '.headline',
            id: '.id',
            createdDate: '.createdDate'
        }
    },
    contextMenu: undefined
});

componentsRegistry.add(CCModuleVideoPreview);

module.exports = CCModuleVideoPreview;


_.extendProto(CCModuleVideoPreview, {
    init: CCModuleVideoPreview$init,
    getMeta: CCModuleVideoPreview$getMeta,
    dataFacetSet: CCModuleVideoPreview$dataFacetSet,
    dataFacetDel: CCModuleVideoPreview$dataFacetDel
});


function CCModuleVideoPreview$init() {
    CCStatesContainer.prototype.init.apply(this, arguments);
    this.on('stateready', onStateReady);
}


function onStateReady() {
    var scope = this.container.scope;
    scope.scratch && scope.scratch.events.on('click', { subscriber: sendToScratch, context: this });
    scope.preview && scope.preview.events.on('click', { subscriber: openPreview, context: this });
}

function openPreview(type, event) {
    event.stopPropagation();
    window.open('/video/preview/' + this.model.m('.id').get(), '_blank');
}

function sendToScratch(type, event) {
    event.stopPropagation();

    var metaData = this.getMeta();
    var data = this.getTransferItem()
        , itemData = data.itemData;

    var scratchData = {
        data: data,
        meta: {
            compClass: itemData.compClass,
            compName: itemData.compName,
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


function getMetaParams() {
    return {
        isLive: this.model.m('.isLive').get(),
        isProcessing: this.model.m('.videoStatus').get() == 'Processing',
        styles: JSON.stringify([
            {
                group: 'single'
            },
            {
                group: 'double'
            }
        ])
    };
}


function CCModuleVideoPreview$getMeta() {
    var data = this.model.get();
    return {
        description: data.headline,
        preview: data.stillImage.hostUrl,
        typeTitle: 'Video'
    }
}


function CCModuleVideoPreview$dataFacetSet(value) {
    //if stillimage is not defined use thumb instead
    value = _parseData(value);
    value.stillImage = value.stillImage
                                || (value.thumbImage && _.deepClone(value.thumbImage))
                                || {hostUrl: 'undefined'};

    try { var isLive = value.status.toLowerCase() == 'live'; } catch(e){}
    value.isLive = !!isLive;

    var mainChannel;
    try{ mainChannel = value.channelFrontUrl.match(/[^/]+/)[0]; } catch(e){}
    if(! mainChannel)
        mainChannel = 'news';

    CCModuleVideoPreview_setChannel.call(this, mainChannel);

    try { var hostUrl = value.thumbImage.hostUrl; } catch (e) {}
    try { this.container.scope.image.el.src = hostUrl; } catch (e) {}

    var expireDate = value.titleEndDate;
    this.el.classList.toggle('cc-preview-expires', expireDate);
    if (expireDate)
        this.el.classList.toggle('cc-preview-expires-warning', moment.utc(expireDate).diff(moment.utc(), 'days', true) <= 1);

    CCStatesContainer.prototype.dataFacetSet.call(this, value);
}


function CCModuleVideoPreview_setChannel(newChannel) {
    if (this._channel)
        this.el.classList.remove(this._channel);

    this._channel = newChannel;
    this.el.classList.add(this._channel);
}


function _parseData(data) {
    data = data._source;
    var vsId = data.videoStatusId; // completed = 3, failed = 4, postprocessing = 5
    data.videoStatus = vsId == 3
        ? ''  // for completed videos just don't show any info
        : vsId == 5 ? 'Processing' : 'Error';

    data.modifiedDate = _dateHelper(data.modifiedDate);
    data.createdDate = _dateHelper(data.createdDate);
    data.titleEndDate = _dateHelper(data.titleEndDate, true);
    data.cc_transfer = {
        itemType: 'video',
        itemData: _.clone(data)
    };
    return data;
}


function onDblClick(msg, event) {
    this.performAction('open');
}


function _dateHelper(date, isRelative) {
    date = _.toDate(date);
    if (!date) return null;
    if (isRelative) return date && moment.utc(date).fromNow();
    return date && moment(date).format('MMM DD, YYYY HH:mm');
}


function CCModuleVideoPreview$dataFacetDel() {
    CCStatesContainer.prototype.dataFacetDel.call(this);
    this.container.scope.image.el.removeAttribute('src');
}

function onScratchClick(event) {
    this.scratchItem(event);
}