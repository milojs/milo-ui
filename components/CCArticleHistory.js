'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , articleStorage = require('../../storage/article')
    , logger = milo.util.logger
    , moment = require('moment')
    , SaveCommunicationsServerInterface = window.CC.autosave.SaveCommunicationsServerInterface;

var USING_ELASTICSEARCH_SAVE_HISTORY = window.CC.config.urlToggles && window.CC.config.urlToggles.elasticsearchHistory;

var listTemplate = '<ul class="list-group" ml-bind="[list,events]:list"> \
                        <li class="list-group-item" ml-bind="[item]:item"> \
                            <div class="row"> \
                                <span class="date col-md-6" ml-bind="[data]:createdDate"></span> \
                                <span class="status col-md-6 text-right"> \
                                    <span class="label" ml-bind="[data]:status"></span> \
                                </span> \
                            </div> \
                            <div class="row"> \
                                <span class="user col-md-6" ml-bind="[data]:user"></span> \
                                <span class="col-md-6 text-right"> \
                                    <span ml-bind="[data]:editorTool" class="editor-tool"></span> \
                                </span> \
                            </div> \
                        </li> \
                    </ul>';

var CCArticleHistory = Component.createComponentClass('CCArticleHistory', {
    dom: {
        cls: ['cc-article-history']
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

    historyList.events.on('dblclick', { subscriber: clickedHistoryEl, context: this });
}


function clickedHistoryEl (msg, event) {
    var listComp = Component.getContainingComponent(event.target, true, 'item');
    milo.mail.postMessage('loadarticleversion',
        { data: { version: this.model.m('[$1]', listComp.item.index).get(), currentArticleId: this._currentArticleId} });
}


var articleStatusLabelCSS = {
    'live': 'label-success',
    'raw': 'label-primary',
    'held': 'label-warning',
    'spiked': 'label-danger'
};

function fetchHistory (articleID, currentArticleId) {
    if (! articleID) return;
    var self = this;

    this.container.scope.list.data.set([]);
    this.model.set([]);
    this._currentArticleId = articleID;

    milo.util.request.json(window.CC.config.apiHost + '/assets/article/' + articleID + '/versions', function(err, res) {
        if (err) return logger.error('Cannot load versions list', err);
        var list = mergeWpsCCVersions(res);
        var list = Array.isArray(list) ? list : [];

        self.container.scope.list.data.set(list);
        self.container.scope.list.list.each(function(item, index) {
            var status = list[index].status.toLowerCase();
            var statusComp = item.container.scope.status;
            var editorToolComp = item.container.scope.editorTool;

            statusComp.el.classList.add(articleStatusLabelCSS[status]);
            item.el.classList.toggle('active', currentArticleId == list[index].id || (index == 0 && currentArticleId == 'latest'));

            if (list[index].editorTool != 'CC') editorToolComp.el.classList.add('label', 'label-warning');
        });

        self.model.set(list);
    });
}


function mergeWpsCCVersions(res) {
    var ccVersions = res.ccVersions || [];

    var wpsVersions = JSON.parse(res.wpsVersions);
    wpsVersions = wpsVersions.data || [];

    ccVersions = transformCCVersions(ccVersions);
    wpsVersions = transformWPSVersions(wpsVersions);

    var combined = wpsVersions.concat(ccVersions);
    combined.sort(function(a, b) {
        return new Date(b.createdDate) - new Date(a.createdDate);
    });

    combined.forEach(function(version) {
        version.createdDate = moment(version.createdDate).format('MMM DD, YYYY HH:mm');
    });

    return combined;

    function transformCCVersions(ccVersions) {
        return ccVersions.map(function(v) {
            v.editorTool = 'CC';
            return v;
        });
    }

    function transformWPSVersions(wpsVersions) {
        return wpsVersions.map(function(v) {
            var editorTool = (v.editorTool || '').toLowerCase();
            if (editorTool != 'cc') {
                v.user = v.modifiedBy;
                v.id = v.articleVersionId;
                return v;
            }
        }).filter(_.identity);
    }
}


function showLocalHistory(editingSessionId) {

    var saveComminicationServerInterface = new SaveCommunicationsServerInterface(),
        self = this;

    if (USING_ELASTICSEARCH_SAVE_HISTORY) {
        var serverData = saveComminicationServerInterface.editingSessionsIdGet('article', editingSessionId).then(function(serverData) {
            var code = serverData[0];
            var data = serverData[1];

            var list = data && data.states && data.states.map(function(item) {
                return {
                    id: item.href,
                    editingSessionId: editingSessionId,
                    storage: 'local',
                    createdDate: fromNow(item.timeEdited),
                    user: item.status
                };
            }).reverse();

            self.container.scope.list.data.set(list);
            self.model.set(list);

        });
        return;
    }


    // ===== OLD CODE ======================================================
    var ids = articleStorage.getVersionIds(editingSessionId)
        , versions = articleStorage.getVersionMetas(editingSessionId);

    var list = ids && ids.reverse().map(function(id, index) {
            var version = versions[id]
                , isOpenedVersion = index == ids.length - 1
                , createdDate = version && version.time
                , user = version && version.versionType;
            return {
                id: id,
                storage: 'local',
                createdDate: fromNow(createdDate),
                user: user
            };
        });
    list = list || [];

    this.container.scope.list.data.set(list);
    this.model.set(list);
    // ===== /OLD CODE =====================================================


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
        return moment(date).format('MMM DD, YYYY HH:mm');
}
