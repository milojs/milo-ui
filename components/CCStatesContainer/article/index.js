'use strict';


var doT = milo.util.doT
    , fs = require('fs')
    , componentName = milo.util.componentName;

var CMARTICLE_GROUP_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/relatedGroup.dot'));
var CMARTICLE_CI_PAGE_ITEM_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/channelArticlePreview.dot'));
var LISTITEM_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/listItem.dot'));


module.exports = {
    relatedGroupState: relatedGroupState,
    pageItemArticleState: pageItemArticleState,
    linkItemArticleState: linkItemArticleState,
    openArticle: openArticle,
    openArticleFromRelatedGroup: openArticleFromRelatedGroup
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
            model: {
                state: {
                    transferData: [
                        {
                            url: value.articleURL,
                            title: value.headline,

                            //is not using previewText because the text that appears in relatedArticles
                            //is the title not the previewText
                            previewText: value.headline,
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


function openArticle(data) {
    _openArticle(data.articleId);
}


var ARTICLE_ID_PATH = '.cc_transfer.facetsStates.model.state.transferData[0].transferItem.id';

function openArticleFromRelatedGroup() {
    var articleId = this.model.m(ARTICLE_ID_PATH).get();
    _openArticle(articleId);
}


function _openArticle(articleId) {
    if (articleId);
        milo.mail.postMessage('loadasset', {
            editorApp: 'articleEditor',
            assetType: 'article',
            assetId: articleId
        });
}
