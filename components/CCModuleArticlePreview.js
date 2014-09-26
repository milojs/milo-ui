'use strict';

var fs = require('fs')
    , doT = milo.util.doT
    , componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , componentName = milo.util.componentName;


var CMARTICLE_GROUP_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/article/relatedGroup.dot'));
var CMARTICLE_CI_PAGE_ITEM_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/article/channelArticlePreview.dot'));

var articleStatusLabelCSS = {
    'Live': 'label-success',
    'Raw': 'label-primary',
    'Held': 'label-warning',
    'Spiked': 'label-danger'
};

var activeState = 'article';
milo.mail.on('changeactiveasset', function (msg, data) {
    activeState = data.asset && data.asset.type;
});

var CCModuleArticlePreview = Component.createComponentClass('CCModuleArticlePreview', {
    dom: {
        cls: 'cc-module-article-preview'
    },
    drag: {
        allowedEffects: 'copy'
    },
    data: {
        set: CCModuleArticlePreview_set
    },
    model: undefined,
    events: undefined,
    transfer: undefined
});

componentsRegistry.add(CCModuleArticlePreview);

module.exports = CCModuleArticlePreview;


_.extendProto(CCModuleArticlePreview, {
    init: CCModuleArticlePreview$init,
    destroy: CCModuleArticlePreview$destroy,
    changeActiveState: CCModuleArticlePreview$changeActiveState
});


function CCModuleArticlePreview$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('stateready', function() {
        if(this.data.get().thumb.hostUrl == "http://i.dailymail.co.uk/i/pix/m_logo_154x115px.png")
            this.container.scope.thumb.el.classList.add('cc-hidden');
        else
            this.container.scope.thumb.el.classList.remove('cc-hidden');
        this.container.scope.scratchBtn.events.on('click',
            { subscriber: sendToScratch, context: this });
        this.container.scope.previewBtn && this.container.scope.previewBtn.events.on('click',
            { subscriber: previewArticle, context: this });
        this.container.scope.cloneBtn && this.container.scope.cloneBtn.events.on('click',
            { subscriber: cloneArticle, context: this });
    });

    milo.mail.on('changeactiveasset', {subscriber: this.changeActiveState, context: this});
}

function CCModuleArticlePreview$changeActiveState() {
    this.transfer.setActiveState(activeState);
}

function sendToScratch(type, event) {
    event.stopPropagation();

    var state = this.transfer.getState();
    var data = this.data.get();

    var scratchData = {
        data: state,
        meta: {
            compClass: state.compClass,
            compName: state.compName,
            metaData: {
                description: '<strong>' + data.title + '</strong> - ' + data.previewText,
                preview: data.thumb && data.thumb.hostUrl,
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


function CCModuleArticlePreview_set(value) {
    CCModuleArticlePreview_setChannel.call(this, value.channel);
    this.data._set(value);
    setStatusColor.call(this);
    this.model.set(value);
    this.transfer.setStateWithKey('channel', _constructArticleState(value));
    this.transfer.setStateWithKey('article', _constructRelatedGroupState(value));
    this.transfer.setActiveState(activeState);
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

function CCModuleArticlePreview$destroy() {
    Component.prototype.destroy.apply(this, arguments);
    milo.mail.offMessages({
        'changeactiveasset': { subscriber: this.changeActiveState, context: this}
    });
}

function _constructArticleState(value) {
    if (!value) return;
    var compName = componentName();

    var templateData = {
        title: value.title,
        previewText: value.previewText,
        previewImg: value.thumb && value.thumb.hostUrl || '',
        compName: compName
    };

    //todo create article item for channel
    return {
        outerHTML: CMARTICLE_CI_PAGE_ITEM_TEMPLATE(templateData),
        compClass: 'CIPageItemArticle',
        compName: compName,
        facetsStates: {
            model: {
                state: {
                    headline: value.title,
                    previewText: value.previewText,
                    image: {
                        hostUrl: value.thumb && value.thumb.hostUrl || ''
                    },
                    itemId: value.id,
                    itemType: 'article'
                }
            }
        }
    };
}

function _constructRelatedGroupState(value) {
    if (!value) return;
    var compName = componentName();

    var templateData = {
        compName: compName
    };

    return {
        outerHTML: CMARTICLE_GROUP_TEMPLATE(templateData),
        compClass: 'CMRelatedGroup',
        compName: compName,
        facetsStates: {
            model: {
                state: {
                    transferData: [
                        {
                            url: value.url,
                            title: value.title,

                            //is not using previewText because the text that appears in relatedArticles
                            //is the title not the previewText
                            previewText: value.title,
                            transferItem: value,
                            wpsRelated: createWpsData(value)
                        }
                    ]
                }
            }
        }
    };

    function createWpsData(value) {
        return  {
            headline: value.title,
            newWindow: false,
            previewLink: false,
            relatedArticleTypeId: 1,
            relatedId: Number(value.id),
            relatedUrl: value.url,
            target: null,
            voteFollow: false
        };
    }
}
