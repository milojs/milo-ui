'use strict';


var articleItem = require('./article')
    , videoItem = require('./video')
    , moduleItem = require('./module');


module.exports = {
    'article': {
        states: [
            {
                editorApp: 'articleEditor',
                createState: articleItem.relatedGroupState,
                isDefault: true
            },
            {
                editorApp: 'channelEditor',
                createState: articleItem.pageItemArticleState
            },
            {
                editorApp: 'listEditor',
                createState: articleItem.linkItemArticleState
            }
        ],
        dragParams: articleItem.getArticleParams,
        methods: [
            {
                method: 'open',
                func: articleItem.openArticle
            },
            {
                method: 'getContextConfig',
                func: articleItem.getContextMenuConfig
            },
            {
                method: 'getAssetId',
                func: articleGetArticleId
            }
        ]
    },
    'module': {
        states: [
            {
                editorApp: 'articleEditor',
                createState: moduleItem.moduleItemState,
                isDefault: true
            },
            {
                editorApp: 'channelEditor',
                createState: moduleItem.pageItemModuleState
            }
        ],
        methods: [
            {
                method: 'open',
                func: moduleItem.openModule
            },
            {
                method: 'getContextConfig',
                func: moduleItem.getContextMenuConfig
            },
            {
                method: 'getAssetId',
                func: moduleItem.getAssetId
            },
            {
                method: 'getAssetType',
                func: moduleItem.getAssetType
            }
        ]
    },
    'video': {
        states: [
            {
                editorApp: 'articleEditor',
                createState: videoItem.videoInstanceState,
                isDefault: true
            },
            {
                editorApp: 'channelEditor',
                createState: videoItem.pageItemVideoState
            },
            {
                editorApp: 'listEditor',
                createState: videoItem.videoLinkItemState
            }
        ],
        methods: [
            {
                method: 'open',
                func: videoItem.openVideo
            },
            {
                method: 'getContextConfig',
                func: videoItem.getContextMenuConfig
            },
            {
                method: 'getAssetId',
                func: videoGetVideoId

            },
            {
                method: 'getAssetType',
                func: videoGetAssetType
             }
        ]
    },
    'CMRelatedGroup': {
        methods: [
            {
                method: 'open',
                func: articleItem.openArticleFromRelatedGroup
            },
            {
                method: 'getAssetId',
                func: relatedGroupGetAssetId
            },
            {
                method: 'getAssetType',
                func: relatedGroupGetAssetType
            }
        ]
    },
    'CMImageGroup': {
        methods: [
            {
                method: 'getAssetId',
                func: imageGroupGetAssetId
            },
            {
                method: 'getAssetType',
                func: imageGroupGetAssetType
            }
        ]
    },
    'CIPageItemLinkListGroup': {
        methods: [
            {
                method: 'getAssetId',
                func: linkListGroupGetAssetId
            },
            {
                method: 'getAssetType',
                func: linkListGroupGetAssetType
            }
        ]
    }
};

function articleGetArticleId(data) { return data.articleId; }

function videoGetVideoId(data) { return data.id; }

function videoGetAssetType(){return 'video'; }

function relatedGroupGetAssetId(){try{var id = this.transfer.getState().facetsStates.model.state.wpsData.itemId; }catch(e){} return id; }

function relatedGroupGetAssetType(){return 'relatedgroup'; }

function imageGroupGetAssetId(){
    var ids = [];
    try{
        _.eachKey(
            _.filterKeys(
                this.transfer.getState().facetsStates.container.scope
                , function(val){
                    return val.compClass == 'CMImage';
                }
            )
            , function(o){
                ids.push(o.facetsStates.model.state.wpsImage.pmsId);
            }
        );
    } catch(e){}
    return ids.join('_');
}

function imageGroupGetAssetType(){return 'imagegroup'; }

function linkListGroupGetAssetType(){try{var type = this.transfer.getState().facetsStates.model.state.wpsData.itemType; }catch(e){} return type; }

function linkListGroupGetAssetId(){try{var id = this.transfer.getState().facetsStates.model.state.wpsData.itemId; }catch(e){} return id; }
