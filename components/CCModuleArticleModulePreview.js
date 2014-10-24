'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMARTICLEMODULE_GROUP_TEMPLATE = '<div><div class="cc-modulePreview-content" ml-bind=":modulePreview">article module</div></div>';

var CCModuleArticleModulePreview = Component.createComponentClass('CCModuleArticleModulePreview', {
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
    },
    transfer: undefined
});

componentsRegistry.add(CCModuleArticleModulePreview);

module.exports = CCModuleArticleModulePreview;


function CCModuleArticleModulePreview_set(value) {
    var self = this;

    var stylesPromise = window.CC.config.data.itemStyles;
    stylesPromise.then(function (dontUse, data) {
        value = parseData(value, data);
        self.transfer.setState(_constructModuleState(value));
        self.data._set(value);
        self.model.set(value);
    }).error(function (error) {
        milo.util.logger.error('itemStyles config returned with an error.');
    });
    
}


function parseData(value, styleData) {
    var fields = value.fields = value.fields || {};
    var linkListGroupIds = fields['linkListGroups.linkListGroupId'];
    var linkListGroups = [];
    linkListGroupIds && linkListGroupIds.forEach(function (groupId, index) {
        linkListGroups.push({
            id: groupId,
            style: fields['linkListGroups.linkListGroupStyle'][index],
            title: fields['linkListGroups.title'][index]
        });
    });
    fields.moduleStyle = fields.moduleStyle || fields.galleryPreviewStyle || fields.pollPreviewStyle || fields.path
        || (fields['linkListGroups.linkListGroupStyle'] && fields['linkListGroups.linkListGroupStyle'][0]) || '';

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
    
    return {
        id: moduleId,
        title: stripHtml(fields.title || fields.name || fields.headline),
        type: moduleType,
        styles: styleArr,
        styleName: moduleStyle.replace(/_/g, ' '),
        styleKey: moduleStyle,
        linkListGroups: linkListGroups
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
        styles: JSON.stringify(this.model.m('.styles').get())
    };
}


var editorTypes = {
    //'standardModule': 'moduleEditor',
    //'gallery': 'moduleEditor',
    'module': 'moduleEditor',
    'linkList': 'listEditor',
    'poll': 'pollEditor'
};
function onModuleClick(moduleData) {
    var state = this.transfer.getState();
    var id = state.facetsStates.model.state.tag.id;
    var type = state.facetsStates.model.state.tag.name;
    type = type == 'linkListGroup' ? 'linkList' : type;
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


function _constructModuleState(value) {
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
                        id: value.id,
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
