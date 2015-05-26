'use strict';


var doT = milo.util.doT
    , fs = require('fs')
    , componentName = milo.util.componentName;

var CMARTICLE_GROUP_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/relatedGroup.dot'));
var CMARTICLE_CI_PAGE_ITEM_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/channelArticlePreview.dot'));
var LISTITEM_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/listItem.dot'));
var THUMB_IMAGE_TYPE = 'ARTICLE_PREVIEW_THUMB';

module.exports = {
    relatedGroupState: relatedGroupState,
    pageItemArticleState: pageItemArticleState,
    linkItemArticleState: linkItemArticleState,
    openArticle: openArticle,
    openArticleFromRelatedGroup: openArticleFromRelatedGroup,
    getArticleParams: getArticleParams,
    getContextMenuConfig: getContextMenuConfig

};

function getContextMenuConfig(data) {

    var item = (this.constructor.name == 'CCScratchItem') ?
    { name: 'remove', label: 'Remove', action: onRemoveClick } : { name: 'scratch', label: 'Scratch', action: onScratchClick };

    var items =
    [
        { name: 'edit', label: 'Edit', action: onEditClick },
        { divider: true },
        { name: 'preview', label: 'Preview', action: previewArticle},
        { divider: true },
        { name: 'clone', label: 'Clone', action: cloneArticle }
    ];

    if (window.CC.config.urlToggles.channels) {
        items.push({ divider: true });
        items.push({ name: 'showImages', label: 'Show images', action: showArticleImages });
    }

    items.splice(4,0,item);
    items.splice(5,0,{ divider: true });
    return items;
}


function cloneArticle(type, event) {
    _postToClone.call(this, 'cloneasset');
}


function previewArticle(type, event) {
    _postLoadMessage.call(this, 'previewassetinwindow');
}


function _postToClone(msg) {
    var id = this.model.m('.articleId').get() ? this.model.m('.articleId').get() : this._itemData.articleId;
    milo.mail.postMessage(msg, {
        editorApp: 'articleEditor',
        assetType: 'article',
        assetId: id
    });
}


function _postLoadMessage(msg) {
    var itemData = this._itemData;
    var data = this.model;
    var id = data.m('.articleId').get() ? data.m('.articleId').get() : itemData.articleId;
    var parentChannel = data.m('.topParentChannel').get() ? data.m('.topParentChannel').get() :  itemData.topParentChannel;
    var channel = data.m('.channel').get() ? data.m('.channel').get() : itemData.channel;
    milo.mail.postMessage(msg , {
        articleId: id,
        pageURL: data.m('.articleURL').get() ? data.m('.articleURL').get() : itemData.articleURL,
        channel: parentChannel ? parentChannel : channel ,
        subchannel: parentChannel ? channel : null
    });
}

function onScratchClick(event) {
    this.scratchItem(event);
}

function onEditClick() {
    this.performAction('open');
}

function onRemoveClick(event) {
    this.deleteItem(event);
}

function showArticleImages() {
    var articleId = this._itemData.articleId ? this._itemData.articleId : this.model.m('.cc_transfer.itemData.articleId').get();
    milo.mail.postMessage('showarticleimages', {articleId: articleId});
}


function pageItemArticleState(value) {
    if (!value) return;
    var data = value.ppiData || value;
    var compName = componentName();

    var templateData = {
        title: data.headline,
        previewText: data.previewText,
        previewImg: data.thumb && data.thumb.hostUrl || '',
        compName: compName,
        showPreviewLinks: data.showPreviewLinks || getDefaultPreviewLinkStatus(data)
    };

    //todo create article item for channel <- does this mean article property for channel item model?
    return {
        outerHTML: CMARTICLE_CI_PAGE_ITEM_TEMPLATE(templateData),
        compClass: 'CIPageItemArticle',
        compName: compName,
        facetsStates: {
            model: {
                state: {
                    wpsData: {
                        headline: data.headline,
                        previewText: data.previewText,
                        itemId: parseInt(data.itemId ? data.itemId : data.articleId),
                        itemType: 'article',
                        showPreviewLinks: data.showPreviewLinks || getDefaultPreviewLinkStatus(data)
                    }
                }
            }
        }
    };
}


function getDefaultPreviewLinkStatus(data) {
    var previewLinks = data.relatedArticles 
                        && data.relatedArticles.filter((link) => link.previewLink);
    return !!(previewLinks && previewLinks.length);
}


function relatedGroupState(value) {
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
            inspector: {
                state: {
                    relatedArticles: [
                        createWpsData(value)
                    ]
                }
            }
        }
    };

    function createWpsData(value) {
        return  {
            headline: value.headline,
            newWindow: false,
            previewLink: false,
            relatedArticleTypeId: 1,
            relatedId: Number(value.articleId),
            relatedUrl: value.articleURL,
            target: null,
            voteFollow: false
        };
    }
}


function linkItemArticleState(value) {
    if (!value) return;

    var compName = componentName();

    return {
        outerHTML: LISTITEM_TEMPLATE({compName: compName}),
        compClass: 'LELinkItem',
        compName: compName,
        facetsStates: {
            model: {
                state: {
                    articleId: +value.articleId,
                    description: value.headline,
                    longDescription: value.previewText,
                    status: 'Live'
                }
            }
        }
    };
}


function getArticleParams(data) {
    var thumb = data.images ? _.find(data.images, image => image.imageType == THUMB_IMAGE_TYPE) : '' ;
    return {
        hostUrl: thumb && thumb.hostUrl || '',
        imageType: THUMB_IMAGE_TYPE,
        articleId: data.id
    };
}


function openArticle(data) {
    _openArticle(data.articleId);
}


function openArticleFromRelatedGroup() {
    var state = this.transfer.getState();
    try {
        var articleId = state.facetsStates.inspector.state.relatedArticles[0].relatedId;
    } catch (e) {}
    articleId && _openArticle(articleId);
}


function _openArticle(articleId) {
    if (articleId)
        milo.mail.postMessage('loadasset', {
            editorApp: 'articleEditor',
            assetType: 'article',
            assetId: articleId
        });
}
