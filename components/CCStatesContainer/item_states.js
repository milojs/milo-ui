'use strict';


var componentName = milo.util.componentName
    , article = require('./article')
    , module = require('./module');


var itemStates = module.exports = {
    'article': {
        states: [
            {
                editorApp: 'articleEditor',
                createState: article.relatedGroupState,
                isDefault: true
            },
            {
                editorApp: 'channelEditor',
                createState: article.pageItemArticleState
            },
            {
                editorApp: 'listEditor',
                createState: article.linkItemArticleState
            }
        ],
        actions: [
            { 
                action: 'open',
                func: article.openArticle
            }
        ]
    },
    'module': {
        states: [
            {
                editorApp: 'articleEditor',
                createState: module.moduleItemState,
                isDefault: true
            },
            {
                editorApp: 'channelEditor',
                createState: module.pageItemModuleState
            }
        ],
        actions: [
            {
                action: 'open',
                func: module.openModule
            }
        ]
    }
};
