'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CCArticleHistory = Component.createComponentClass('CCArticleHistory', {
    dom: {
        cls: 'cc-article-history'
    },
    container: undefined,
    events: undefined,
    template: { template: '<div ml-bind=":list"></div>' }
});

componentsRegistry.add(CCArticleHistory);

module.exports = CCArticleHistory;


_.extendProto(CCArticleHistory, {
    init: CCArticleHistory$init
});


/**
 * Article History instance method
 * Initialize History
 */
function CCArticleHistory$init() {
    Component.prototype.init.apply(this, arguments);
  
    this.on('childrenbound', onChildrenBound);
}

function onChildrenBound () {
    this.off('childrenbound');
    this.template.render().binder();
}
