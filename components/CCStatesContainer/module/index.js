'use strict';

var doT = milo.util.doT
    , fs = require('fs');


var CMARTICLEMODULE_GROUP_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/articleModulePreview.dot'))();
var CHANNEL_MODULE_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/channelModulePreview.dot'));

var channelModuleTypes = {
    'standardModule': 'CIPageItemStandardModule',
    'gallery': 'CIPageItemGallery',
    'module': 'CIPageItemModule',
    'linkListGroup': 'CIPageItemLinkListGroup',
    'poll': 'CIPageItemPoll'
};


module.exports = {
    moduleItemState: moduleItemState,
    pageItemModuleState: pageItemModuleState,
    openModule: openModule
};


function moduleItemState(value) {
    if (!value) return;

    var width = value.styles && value.styles.length == 1 && value.styles[0].group == 'single'
                    ? 'floatRightMod'
                    : 'fullWidthMod';
    return {
        outerHTML: CMARTICLEMODULE_GROUP_TEMPLATE,
        compClass: 'MIStandard',
        compName: milo.util.componentName(),
        facetsStates: {
            model: {
                state: {
                    title: value.title,
                    styleName: value.styleKey,
                    styles: value.styles,
                    tag: {
                        id: +value.id,
                        name: value.type,
                        style: value.styleId
                    },
                    linkListGroups: value.linkListGroups,
                    cc_scratch: {
                        itemType: 'module',
                        itemData: value
                    }
                }
            },
            inspector: {
                state: { //quoteLayout is a legacy name, should be 'layout' but requires a migration to fix.
                    quoteLayout: width
                }
            }
        }
    };
}


function pageItemModuleState(value) {
    if (!value) return;
    var channelModuleClass = channelModuleTypes[value.type] || '';
    if (!channelModuleClass) return logger.log(value.type, 'not supported');
    var compName = milo.util.componentName();

    return {
        outerHTML: CHANNEL_MODULE_TEMPLATE({compName: compName,  compClass: channelModuleClass }),
        compClass: channelModuleClass,
        compName: compName,
        facetsStates: {
            model: {
                state: {
                    wpsData: {
                        itemId: +value.id,
                        itemType: value.type,
                        itemStyle: value.styleKey,
                        title: value.title
                    },
                    styles: value.styles,
                    cc_scratch: {
                        itemType: 'module',
                        itemData: value
                    }
                }
            }
        }
    };
}


var editorTypes = {
    //'standardModule': 'moduleEditor',
    'module': 'moduleEditor',
    'gallery': 'listEditor',
    'linkList': 'listEditor',
    'poll': 'pollEditor'
};
function openModule(data) {
    var type = data.type
        , id = data.id;
    if (type == 'linkListGroup') {
        type = 'linkList';
        id = +this.model.m('.linkListId').get();
    }
    var app = editorTypes[type];

    if (!app
        || (app == 'pollEditor' && !CC.config.urlToggles.polls)
        || (app == 'listEditor' && !CC.config.urlToggles.lists)) {
        milo.mail.postMessage('opendialog', {
            name: 'wrong_editor_' + type,
            options: {
                title: 'Unable to edit',
                text: 'There is no editor for the module type: ' + type
            }
        });
    } else
        milo.mail.postMessage('loadasset', {
            editorApp: app,
            assetType: type.toLowerCase(),
            assetId: +id
        });
}
