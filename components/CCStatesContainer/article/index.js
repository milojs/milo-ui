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
    getArticleParams: getArticleParams
};


function pageItemArticleState(value) {
    if (!value) return;
    var compName = componentName();

    var templateData = {
        title: value.headline,
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
                    wpsData: {
                        headline: value.headline,
                        previewText: value.previewText,
                        itemId: parseInt(value.id),
                        itemType: 'article'
                    }
                }
            }
        }
    };
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
    var thumb = _.find(data.images, image => image.imageType == THUMB_IMAGE_TYPE);
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
    if (articleId);
        milo.mail.postMessage('loadasset', {
            editorApp: 'articleEditor',
            assetType: 'article',
            assetId: articleId
        });
}
