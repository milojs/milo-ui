'use strict';

var doT = milo.util.doT
    , fs = require('fs')
    , logger = milo.util.logger;


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
    openModule: openModule,
    getContextMenuConfig: getContextMenuConfig,
    getAssetId,
    getAssetType
};


function getContextMenuConfig(data) {
    var item = (this.constructor.name == 'CCScratchItem') ?
    { name: 'remove', label: 'Remove', action: onRemoveClick } : { name: 'scratch', label: 'Scratch', action: onScratchClick };

    var items =
        [
            { name: 'edit', label: 'Edit', action: onEditClick },
            { divider: true }
        ];
    items.push(item);
    return items;
}

function onRemoveClick(event) {
    this.deleteItem(event);
}

function onEditClick() {
    this.performAction('open');
}


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


function onScratchClick(event) {
    this.scratchItem(event);
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

    var isPuff = /puff/.test(data.styleKey) && type == 'linkList';
    var app = isPuff ? 'puffEditor' : editorTypes[type];

    if (!app || app == 'listEditor' && !CC.config.urlToggles.lists || app == 'puffEditor' && !CC.config.urlToggles.puffs) {
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

function getAssetId(value){
    var type = value.type
        , id = value.id;
    if (type == 'linkListGroup') {
        type = 'linkList';
        id = +this.model.m('.linkListId').get();
    }
    return id;
}

function getAssetType(value){
    return value.type;
}

