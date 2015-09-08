'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;

var CCImageGroupCaptionList = Component.createComponentClass('CCImageGroupCaptionList', {
    container: undefined,
    events: undefined,
    list: undefined,
    dom: {
        cls: 'cc-imagegroup-group',
        tagName: 'ul'
    },
    data: undefined
});

componentsRegistry.add(CCImageGroupCaptionList);
module.exports = CCImageGroupCaptionList;
