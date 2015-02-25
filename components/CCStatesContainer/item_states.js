'use strict';


var componentName = milo.util.componentName
    , articleItem = require('./article')
    , videoItem = require('./video')
    , moduleItem = require('./module');


var itemStates = module.exports = {
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
        actions: [
            {
                action: 'open',
                func: articleItem.openArticle
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
        actions: [
            {
                action: 'open',
                func: moduleItem.openModule
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
        actions: [
            {
                action: 'open',
                func: videoItem.openVideo
            }
        ]
    },
    'CMRelatedGroup': {
        actions: [
            {
                action: 'open',
                func: articleItem.openArticleFromRelatedGroup
            }
        ]
    }
};

