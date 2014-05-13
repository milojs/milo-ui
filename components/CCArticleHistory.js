'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , articleStorage = require('../../storage/article')
    , logger = milo.util.logger
    , moment = require('moment');


var listTemplate = '<ul class="list-group" ml-bind="[list,events]:list"> \
                        <li class="list-group-item" ml-bind="[item]:item"> \
                            <div class="row"> \
                                <span class="date col-md-6" ml-bind="[data]:createdDate"></span> \
                                <span class="status col-md-6 text-right" ml-bind="[data]:status"></span> \
                            </div> \
                            <div class="row"> \
                                <span class="user col-md-6" ml-bind="[data]:user"></span> \
                                <span class="col-md-6 text-right" ml-bind="[data]:editorTool"></span> \
                            </div> \
                        </li> \
                    </ul>';

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
    fetchHistory: fetchHistory,
    showLocalHistory: showLocalHistory
});


/**
 * Article History instance method
 * Initialize History
 */
function CCArticleHistory$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
    var m = this.model;
    _.defer(function() {
        if (! m.get()) m.set([]);
    });
}


function onChildrenBound () {
    this.off('childrenbound');
    this.template.render().binder();
    //milo.minder(this.model, '<<<->>>', this.container.scope.list.data);

    var historyList = this.container.scope.list;

    historyList.events.on('click', { subscriber: clickedHistoryEl, context: this });
}


function clickedHistoryEl (msg, event) {
    var listComp = Component.getContainingComponent(event.target, true, 'item');
    milo.mail.postMessage('loadarticleversion',
        { data: { version: this.model.m('[$1]', listComp.item.index).get(), currentArticleId: this._currentArticleId} });
}


function fetchHistory (articleID) {
    var self = this;

    this.container.scope.list.data.set([]);
    this.model.set([]);
    this._currentArticleId = articleID;

    milo.util.request.json(window.CC.config.apiHost + '/article/listVersions/' + articleID, function(err, res) {
        if (err) logger.error('Cannot load versions list', err);
        var list = mergeWpsCCVersions(res);
        var list = Array.isArray(list) ? list : [];
        self.container.scope.list.data.set(list);
        self.model.set(list);
    });
}


function mergeWpsCCVersions(res) {
    // TODO: editorTool should be comming back from the WPS endpoint and "cc" should be filtered out
    // waiting for a WPS release

    // var wpsVersions = res.wpsVersions || [];
    // var wpsVersions = JSON.parse(wpsVersions).data.map(function(v) {
    //     return { editorTool: 'wps', createdDate: v.createdDate, user: v.modifiedBy, id: v.articleVersionId };
    // });
    
    // var data = wpsVersions.concat(res.ccVersions);
    var data = res.ccVersions || [];
    data.sort(function(a, b) {
        return new Date(b.createdDate) - new Date(a.createdDate);
    });
    
    data.forEach(function(version) {
        version.createdDate = moment(version.createdDate).format('DD/MM/YY HH:mm');
    });
    
    return data;
}


function showLocalHistory(articleStorageId) {
    var ids = articleStorage.getVersionIds(articleStorageId)
        , versions = articleStorage.getVersionMetas(articleStorageId);
    
    var list = ids && ids.reverse().map(function(id, index) {
            var version = versions[id]
                , isOpenedVersion = index == ids.length - 1
                , createdDate = version && version.time;
            return {
                id: id,
                storage: 'local',
                createdDate: fromNow(createdDate),
                user: version.versionType
            };
        });
    list = list || [];
    this.container.scope.list.data.set(list);
    this.model.set(list);
}


function fromNow(date) {
    var period = Math.floor((new Date - new Date(date)) / 1000);
    if (period == 0)
        return 'just now'; 
    else if (period > 0 && period < 60) {
        var S = period > 1 ? 's' : '';
        return (period) + ' second' + S + ' ago';
    } else if (period < 2700)
        return moment(date).fromNow();
    else
        return moment(date).format('DD/MM/YY HH:mm');
}
