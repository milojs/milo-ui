'use strict';

var componentsRegistry = milo.registry.components
    , CCStatesContainer = componentsRegistry.get('CCStatesContainer')
    , componentName = milo.util.componentName;


var articleStatusLabelCSS = {
    'Live': 'label-success',
    'Raw': 'label-primary',
    'Held': 'label-warning',
    'Spiked': 'label-danger'
};


var CCModuleArticlePreview = CCStatesContainer.createComponentClass('CCModuleArticlePreview', {
    dom: {
        cls: 'cc-module-article-preview'
    },
    drag: {
        allowedEffects: 'copy'
    },
    events: {
        messages: {
            'dblclick': { subscriber: onDblClick, context: 'owner' }
        }
    }
    // contextMenu: {
    //     items: [
    //         { name: 'test1', label: 'Test 1', action: function() {  } },
    //         { divider: true },
    //         { name: 'test2', label: 'Test 2', action: function() {  } }
    //     ]
    // }
});

componentsRegistry.add(CCModuleArticlePreview);

module.exports = CCModuleArticlePreview;


_.extendProto(CCModuleArticlePreview, {
    init: CCModuleArticlePreview$init,
    dataFacetSet: CCModuleArticlePreview$dataFacetSet
});


function CCModuleArticlePreview$init() {
    CCStatesContainer.prototype.init.apply(this, arguments);
    this.once('stateready', onStateReady);
}


function onStateReady() {
    var scope = this.container.scope
        , imgData = this.data.path('.thumb.hostUrl')
        , isLogoImage = imgData && imgData.get() == 'http://i.dailymail.co.uk/i/pix/m_logo_154x115px.png';
    scope.thumb.el.classList[isLogoImage ? 'add' : 'remove']('cc-hidden');
    scope.scratchBtn.events.on('click',
        { subscriber: sendToScratch, context: this });
    if (scope.previewBtn) scope.previewBtn.events.on('click',
        { subscriber: previewArticle, context: this });
    if (scope.previewBtn) scope.cloneBtn.events.on('click',
        { subscriber: cloneArticle, context: this });
}


function sendToScratch(type, event) {
    event.stopPropagation();

    var data = this.getTransferItem()
        , itemData = data.itemData;

    var scratchData = {
        data: data,
        meta: {
            metaData: {
                description: '<strong>' + itemData.headline + '</strong> - ' + itemData.previewText,
                preview: itemData.thumb && itemData.thumb.hostUrl,
                typeTitle: 'Article'
            }
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


function cloneArticle(type, event) {
    _postLoadMessage.call(this, 'clonearticle');
}


function previewArticle(type, event) {
    _postLoadMessage.call(this, 'previewasset');
}


function _postLoadMessage(msg) {
    milo.mail.postMessage(msg, {
        editorApp: 'articleEditor',
        assetType: 'article',
        assetId: this.model.m('.id').get()
    });
}


function CCModuleArticlePreview$dataFacetSet(value) {
    CCModuleArticlePreview_setChannel.call(this, value.channel);
    setStatusColor.call(this);
    CCStatesContainer.prototype.dataFacetSet.apply(this, arguments);
}


function setStatusColor() {
    var statusPath = this.container.scope.status;
    _.eachKey(articleStatusLabelCSS , function(cssClass, status){
        statusPath.el.classList.remove(cssClass);
    });
    var statusCssClass = articleStatusLabelCSS[statusPath.data.get()];
    statusPath.el.classList.add(statusCssClass);
}


function CCModuleArticlePreview_setChannel(newChannel) {
    if (this._channel)
        this.el.classList.remove(this._channel);

    this._channel = newChannel;
    this.el.classList.add(this._channel);
}


function onDblClick(msg, event) {
    this.performAction('open');
}
