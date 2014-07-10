'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMARTICLE_GROUP_TEMPLATE = '\
    <div ml-bind="CMRelatedGroup:newRelated" class="cc-module-related-group">\
        <div class="relatedItemsTopBorder">&nbsp;</div>\
        <div class="relatedItems">\
            <h4 ml-bind="[data]:relatedCaption"></h4>\
            <ul ml-bind="[list]:relatedList">\
                <li ml-bind="CMRelated[item]:result">\
                    <a ml-bind="[data]:title" target="_blank">\
                    </a>\
                </li>\
            </ul>\
        </div>\
    </div>';


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
    init: CCModuleArticlePreview$init
});


function CCModuleArticlePreview$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('stateready', function() {
        this.container.scope.scratchBtn.events.on('click',
            { subscriber: sendToScratch, context: this });
        this.container.scope.previewBtn && this.container.scope.previewBtn.events.on('click',
            { subscriber: previewArticle, context: this });
        this.container.scope.cloneBtn && this.container.scope.cloneBtn.events.on('click',
            { subscriber: cloneArticle, context: this });
    });
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
    milo.mail.postMessage('clonearticle', {
        assetType: 'article',
        assetId: this.model.m('.id').get()
    });
}

function previewArticle(type, event) {
    milo.mail.postMessage('previewasset', {
        assetType: 'article',
        assetId: this.model.m('.id').get()
    });
}


function CCModuleArticlePreview_set(value) {
    CCModuleArticlePreview_setChannel.call(this, value.channel);
    this.model.set(value);
    this.data._set(value);

    var settings = window.CC.user.ccProfile.settings || {};
    if(settings.showPreviewImages === undefined)
        settings.showPreviewImages = true;
    var srcAttr = settings.showPreviewImages ? 'src' : 'data-src';

    if (value.thumb.hostUrl) {
        this.container.scope.image.el.removeAttribute('src');
        this.container.scope.image.el.setAttribute(srcAttr, value.thumb.hostUrl);
    }

    //if(thumbData.hostUrl == "http://i.dailymail.co.uk/i/pix/m_logo_154x115px.png")
    //    thumb.el.classList.add('cc-hidden');
    //else
    //    thumb.el.classList.remove('cc-hidden');


    this.transfer.setState(_constructRelatedGroupState(value));
}


function CCModuleArticlePreview_setChannel(newChannel) {
    if (this._channel)
        this.el.classList.remove(this._channel);

    this._channel = newChannel;
    this.el.classList.add(this._channel);
}

function _constructRelatedGroupState(value) {
    if (!value) return;

    return {
        outerHTML: CMARTICLE_GROUP_TEMPLATE,
        compClass: 'CMRelatedGroup',
        compName: milo.util.componentName(),
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
