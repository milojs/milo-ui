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
        set: CCModuleArticleModulePreview_set,
        messages: {
            '.styleGroup': {context: 'owner', subscriber: onStyleGroupChange}
        }
    },
    model: undefined,
    events: undefined,
    transfer: undefined
});

componentsRegistry.add(CCModuleArticleModulePreview);

module.exports = CCModuleArticleModulePreview;


function CCModuleArticleModulePreview_set(value) {
    var self = this;

    var stylesPromise = window.CC.config.data.itemStyles;
    stylesPromise.then(function (dontUse, data) {
        value = parseData(value, data);
        self.transfer.setState(_constructRelatedGroupState(value));
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
    fields.moduleStyle = fields.moduleStyle || fields.galleryPreviewStyle || 
        (fields['linkListGroups.linkListGroupStyle'] && fields['linkListGroups.linkListGroupStyle'][0]) || '';

    var moduleType = getModuleType(value._type);
    var moduleId = linkListGroups.length ? linkListGroups[0].id : value._id;
    var moduleStyle = linkListGroups.length ? linkListGroups[0].style : fields.moduleStyle;

    // Set state
    if (!styleData.linklist) styleData.linklist = styleData.linkListGroup;
    try { var styleObj = styleData[moduleType][moduleStyle]; } catch(e) {}
    return {
        id: moduleId,
        title: stripHtml(fields.title || fields.name || fields.headline),
        type: moduleType,
        styleId: styleObj && styleObj.id,
        styleName: moduleStyle.replace(/_/g, ' '),
        styleKey: moduleStyle,
        styleGroup: styleObj && styleObj.group_name,
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
    this.dom.removeCssClasses(['single', 'triple', 'double']);
    if (data.newValue)
        this.dom.addCssClasses(data.newValue);
}

function stripHtml(text) {
    var tmp = document.createElement('div');
    tmp.innerHTML = text;
    return tmp.textContent || tmp.innerText || '';
}

function getMetaParams () {
    return {
        styleGroup: this.model.m('.styleGroup').get()
    };
}

function _constructRelatedGroupState(value) {
    if (!value) return;

    return {
        outerHTML: CMARTICLEMODULE_GROUP_TEMPLATE,
        compClass: 'MIStandard',
        compName: milo.util.componentName(),
        facetsStates: {
            model: {
                state: {
                    title: value.title,
                    styleName: value.styleKey,
                    styleGroup: value.styleGroup,
                    tag: {
                        id: value.id,
                        name: value.type,
                        style: value.styleId
                    },
                    linkListGroups: value.linkListGroups
                }
            }
        }
    };
}
