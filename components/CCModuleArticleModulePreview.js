'use strict';

var fs = require('fs')
    , doT = milo.util.doT
    , logger = milo.util.logger
    , componentsRegistry = milo.registry.components
    , CCStatesContainer = componentsRegistry.get('CCStatesContainer');


var CMARTICLEMODULE_GROUP_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/modules/articleModulePreview.dot'))();
var CHANNEL_MODULE_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/modules/channelModulePreview.dot'));


var channelModuleTypes = {
    'standardModule': {
        compClass: 'CIPageItemStandardModule'
    },
    'gallery': {
        compClass: 'CIPageItemGallery'
    },
    'module': {
        compClass: 'CIPageItemModule'
    },
    'linkListGroup': {
        compClass: 'CIPageItemLinkListGroup'
    },
    'poll': {
        compClass: 'CIPageItemPoll'
    }
};


var CCModuleArticleModulePreview = CCStatesContainer.createComponentClass('CCModuleArticleModulePreview', {
    dom: {
        cls: 'cc-module-articlemodule-preview'
    },
    drag: {
        allowedEffects: 'copy',
        meta: {
            params: getMetaParams
        }
    },
    data: {
        set: CCModuleArticleModulePreview_set
    },
    model: {
        messages: {
            '.styles': { context: 'owner', subscriber: onStyleGroupChange },
            '.styles[*].group': { context: 'owner', subscriber: onStyleGroupChange }
        }
    },
    events: {
        messages: {
            'dblclick': { context: 'owner', subscriber: onModuleClick }
        }
    }
});

componentsRegistry.add(CCModuleArticleModulePreview);


module.exports = CCModuleArticleModulePreview;


function CCModuleArticleModulePreview_set(value) {
    var self = this;

    var stylesPromise = window.CC.config.data.itemStyles;
    stylesPromise.then(function (dontUse, data) {
        value = parseData(value, data);
        self.transfer.setStateWithKey('articleEditor', _makeModuleStateForArticle(value), true);
        self.transfer.setStateWithKey('channelEditor', _makeModuleStateForChannel(value));
        self.setActiveState();
        self.data._set(value);
        self.model.set(value);
    }).error(function (error) {
        milo.util.logger.error('itemStyles config returned with an error.');
    });

}


function parseData(value, styleData) {
    var fields = value._source = value._source || {};
    // var linkListGroupIds = fields['linkListGroups.linkListGroupId'];
    var linkListGroups = fields.linkListGroups ? fields.linkListGroups.map(mapGroup) : [];

    fields.moduleStyle = fields.moduleStyle || fields.galleryPreviewStyle || fields.pollPreviewStyle || fields.path
        || (linkListGroups[0] && linkListGroups.style) || '';

    var moduleType = getModuleType(value._type);
    var moduleId = linkListGroups.length ? linkListGroups[0].id : value._id;
    var moduleStyle = linkListGroups.length ? linkListGroups[0].style : fields.moduleStyle;

    // Set state
    if (!styleData.linklist) styleData.linklist = styleData.linkListGroup;
    try { var styleArr = styleData[moduleType][moduleStyle]; } catch(e) {}
    styleArr = styleArr || [];
    styleArr = styleArr.map(function (style) {
        return {
            group: style.group_name,
            id: style.id,
            name: style.jsp_name
        };
    });

    try { var isLive = fields.status.toLowerCase() == 'live'; } catch(e){}

    return {
        id: moduleId,
        title: stripHtml(fields.title || fields.name || fields.headline),
        type: moduleType,
        styles: styleArr,
        styleName: moduleStyle.replace(/_/g, ' '),
        styleKey: moduleStyle,
        isLive: !!isLive,
        linkListGroups: linkListGroups,
        linkListId: linkListGroups.length ? value._id : null
    };

    function getModuleType(moduleType) {
        if (moduleType == 'linklist')
            return 'linkListGroup';
        else if (moduleType == 'standardmodule')
            return 'standardModule';
        else
            return moduleType;
    }
}


function mapGroup(group) {
    return {
        id: group.linkListGroupId,
        style: group.linkListGroupStyle,
        title: group.title
    };
}


function onStyleGroupChange(msg, data) {
    if (! Array.isArray(data.newValue)) return;

    var done = [];
    var str = data.newValue.reduce(function (prev, style) {
        if (done.indexOf(style.group) == -1) {
            done.push(style.group);
            var box = '<span class="cc-width ' + style.group + '">'
                        + style.group.charAt(0).toUpperCase() + '</span>';
            return prev + box;
        }
        return prev;
    }, '');

    this.container.scope.width.el.innerHTML = str;
}


function stripHtml(text) {
    var tmp = document.createElement('div');
    tmp.innerHTML = text;
    return tmp.textContent || tmp.innerText || '';
}


function getMetaParams () {
    return {
        styles: JSON.stringify(this.model.m('.styles').get()),
        isLive: this.model.m('.isLive').get()
    };
}


var editorTypes = {
    //'standardModule': 'moduleEditor',
    'module': 'moduleEditor',
    'gallery': 'listEditor',
    'linkList': 'listEditor',
    'poll': 'pollEditor'
};
function onModuleClick(moduleData) {
    var state = this.transfer.getStateWithKey('article');
    var type = state.facetsStates.model.state.tag.name;
    var id = state.facetsStates.model.state.tag.id;
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
        return;
    }

    milo.mail.postMessage('loadasset', {
        editorApp: app,
        assetType: type.toLowerCase(),
        assetId: +id
    });
}


function _makeModuleStateForArticle(value) {
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

function _makeModuleStateForChannel(value) {
    if (!value) return;
    var channelModuleConfig = getChannelConfig(value.type);
    if (!channelModuleConfig) return logger.log(value.type, 'not supported');
    var compName = milo.util.componentName();

    return {
        outerHTML: CHANNEL_MODULE_TEMPLATE({compName: compName, compClass: channelModuleConfig.compClass}),
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

function getChannelConfig(type) {
    return channelModuleTypes[type] || '';
}

