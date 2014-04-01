'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMARTICLEMODULE_GROUP_TEMPLATE = '<div>article module</div>';

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
        var styleId = data[value.type] && data[value.type][value.styleKey];
        value.styleId = styleId;
        self.transfer.setState(_constructRelatedGroupState(value));

    }).error(function (error) {
        milo.util.logger.error('itemStyles config returned with an error.');
    });
    
}

function parseData(value) {
    value.fields = value.fields || {moduleStyle: ''};
    return {
        id: value._id,
        title: stripHtml(value.fields.title || value.fields.name || value.fields.headline),
        type: value._type,
        styleName: value.fields.moduleStyle.replace(/_/g, ' '),
        styleKey: value.fields.moduleStyle
    };
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
