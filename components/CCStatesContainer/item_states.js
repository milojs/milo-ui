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
        dragParams: articleItem.getArticleParams,
        methods: [
            {
                method: 'open',
                func: articleItem.openArticle
            },
            {
                method: 'getContextConfig',
                func: articleItem.getContextMenuConfig
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
            }
        ]
    },
    'CMRelatedGroup': {
        methods: [
            {
                method: 'open',
                func: articleItem.openArticleFromRelatedGroup
            }
        ]
    }
};

