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
    value = parseData(value);
    this.data._set(value);
    this.model.set(value);
    this.transfer.setState(_constructRelatedGroupState(value));
}

function parseData(value) {
    value.fields = value.fields || {moduleStyle: ''};
    return {
        id: value._id,
        title: stripHtml(value.fields.title || value.fields.name || value.fields.headline),
        type: value.fields.moduleStyle.replace(/_/g, ' ')
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
        compClass: 'CMModuleInstance',
        compName: milo.util.componentName(),
        facetsStates: {
            model: {
                state: {
                    moduleId: value.id,
                    title: value.title,
                    type: value.type
                }
            }
        }
    };
}
