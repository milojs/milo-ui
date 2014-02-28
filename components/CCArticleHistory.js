'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');

var listTemplate = '\
                        <div> \
                            <ul class="list-group" ml-bind="[list,events]:list"> \
                                <li class="list-group-item" ml-bind="[item]:item"> \
                                    <span ml-bind="[data]:user"></span> \
                                    <span class="pull-right" ml-bind="[data]:createdDate"></span> \
                                </li> \
                            </ul> \
                        </div> \
                    ';


var CCArticleHistory = Component.createComponentClass('CCArticleHistory', {
    dom: {
        cls: 'cc-article-history'
    },
    container: undefined,
    events: undefined,
    model: undefined,
    template: { template: listTemplate }
});

componentsRegistry.add(CCArticleHistory);

module.exports = CCArticleHistory;


_.extendProto(CCArticleHistory, {
    init: CCArticleHistory$init,
    fetchHistory: fetchHistory
});


/**
 * Article History instance method
 * Initialize History
 */
function CCArticleHistory$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
    this.model.set([]);
}

function onChildrenBound () {
    this.off('childrenbound');
    this.template.render().binder();
    milo.minder(this.model, '<<<->>>', this.container.scope.list.data);

    var historyList = this.container.scope.list;

    historyList.events.on('click', { subscriber: clickedHistoryEl, context: this });
}

function clickedHistoryEl (msg, event) {
    var listComp = Component.getContainingComponent(event.target, true, 'item');
    milo.mail.postMessage('loadarticleversion', { versionId: this.model.m('[$1]', listComp.item.index).get().id });
}

function fetchHistory (articleID) {
    var model = this.model;
    
    milo.util.request.json(window.CC.config.apiHost + '/article/listVersions/' + articleID, function(err, res) {
        if (err) logger.error('Cannot load versions list', err);
        model.set(res.list);
    });

    
}
