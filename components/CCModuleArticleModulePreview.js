'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMARTICLEMODULE_GROUP_TEMPLATE = '<div><div class="cc-modulePreview-content" ml-bind=":modulePreview">article module</div></div>';

var CCModuleArticleModulePreview = Component.createComponentClass('CCModuleArticleModulePreview', {
    dom: {
        cls: 'cc-module-articlemodule-preview'
    },
    drag: {
        allowedEffects: 'copy'
    },
    data: {
        set: CCModuleArticleModulePreview_set
    },
    model: undefined,
    events: undefined,
    transfer: undefined
});

componentsRegistry.add(CCModuleArticleModulePreview);

module.exports = CCModuleArticleModulePreview;


function CCModuleArticleModulePreview_set(value) {
    var self = this;
    value = parseData(value);
    this.data._set(value);
    this.model.set(value);

    var stylesPromise = window.CC.config.data.itemStyles;
    stylesPromise.then(function (dontUse, data) {
        if (!data.linklist)
            data.linklist = data.linkListGroup;

        try { var styleId = data[value.type][value.styleKey].id; } catch(e) {}
        value.styleId = styleId;
        self.transfer.setState(_constructRelatedGroupState(value));

    }).error(function (error) {
        milo.util.logger.error('itemStyles config returned with an error.');
    });
    
}

function parseData(value) {
    var fields = value.fields = value.fields || {};
    fields.moduleStyle = fields.moduleStyle || fields.galleryPreviewStyle || 
        (fields['linkListGroups.linkListGroupStyle'] && fields['linkListGroups.linkListGroupStyle'][0]) || '';

    var moduleType = getModuleType(value._type);

    return {
        id: value._id,
        title: stripHtml(fields.title || fields.name || fields.headline),
        type: moduleType,
        styleName: fields.moduleStyle.replace(/_/g, ' '),
        styleKey: fields.moduleStyle
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

function stripHtml(text) {
    var tmp = document.createElement('div');
    tmp.innerHTML = text;
    return tmp.textContent || tmp.innerText || '';
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
                    tag: {
                        id: value.id,
                        name: value.type,
                        style: value.styleId
                    }
                }
            }
        }
    };
}
