'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;

var CCColumnsPreview = Component.createComponentClass('CCColumnsPreview', {
    container: undefined,
    events: undefined,
    data: undefined,
    dom: {
        cls: 'cc-ui-columns'
    },
    template: {
        template: '<div ml-bind="[list]:colItems">\
                            <div ml-bind="[item]:col">\
                                <span ml-bind="[data]:name"></span>\
                            </div>\
                   </div>'
    }
});

componentsRegistry.add(CCColumnsPreview);
module.exports = CCColumnsPreview;

/**
 * Public Api
 */
_.extendProto(CCColumnsPreview, {
    init: MLColumns$init
});

/**
 * Component instance method
 * Initialise the component, wait for childrenbound, setup empty options arrays.
 */
function MLColumns$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}

function onChildrenBound () {
    this.off('childrenbound');
    this.template.render().binder();
}
