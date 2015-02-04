'use strict';

var doT = milo.util.doT
    , fs = require('fs');


var CMARTICLEMODULE_GROUP_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/articleModulePreview.dot'))();

var channelModuleTypes = {
    'standardModule': {
        compClass: 'CIPageItemStandardModule',
        template: doT.compile(fs.readFileSync(__dirname + '/channelStandardModulePreview.dot'))
    },
    'gallery': {
        compClass: 'CIPageItemGallery',
        template: doT.compile(fs.readFileSync(__dirname + '/channelGalleryPreview.dot'))
    },
    'module': {
        compClass: 'CIPageItemModule',
        template: doT.compile(fs.readFileSync(__dirname + '/channelModulePreview.dot'))
    },
    'linkListGroup': {
        compClass: 'CIPageItemLinkListGroup',
        template: doT.compile(fs.readFileSync(__dirname + '/channelLinkListGroupPreview.dot'))
    },
    'poll': {
        compClass: 'CIPageItemPoll',
        template: doT.compile(fs.readFileSync(__dirname + '/channelPollPreview.dot'))
    }
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
                    linkListGroups: value.linkListGroups
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
    var channelModuleConfig = channelModuleTypes[value.type] || '';
    if (!channelModuleConfig) return logger.log(value.type, 'not supported');
    var compName = milo.util.componentName();

    return {
        outerHTML: channelModuleConfig.template({compName: compName}),
        compClass: channelModuleConfig.compClass,
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
                    styles: value.styles
                }
            }
        }
    };
}


function openModule(data) {

}
