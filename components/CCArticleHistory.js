'use strict';

var articleStorage = require('../../storage/article')
    , logger = milo.util.logger
    , moment = require('moment')
    , SaveCommunicationsServerInterface = window.CC.autosave && window.CC.autosave.SaveCommunicationsServerInterface;

var USING_ELASTICSEARCH_SAVE_HISTORY = (window.CC.config.urlToggles && window.CC.config.urlToggles.elasticsearchHistory) || window.CC && window.CC.config && (['development', 'integration'].indexOf(window.CC.config.environment) > -1);

var LIST_TEMPLATE = '<div> \
                        <ul class="list-group" ml-bind="[list,events]:list"> \
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
                        </ul> \
                        <div class="button cc-article-history-more-versions-btn" ml-bind="[events, dom]:more">Show older versions</button> \
                    </div>';

var ARTICLE_STATUS_CSS_LABELS = {
    live: 'label-success',
    raw: 'label-primary',
    held: 'label-warning',
    spiked: 'label-danger'
};

var ArticleHistory = module.exports = milo.createComponentClass({
    className: 'CCArticleHistory',
    facets: {
        container: undefined,
        dom: { cls: ['cc-article-history'] },
        events: undefined,
        model: undefined,
        template: { template: LIST_TEMPLATE, autoRender: true }
    },
    methods: {
        init: ArticleHistory$init,
        fetchHistory: fetchHistory,
        showLocalHistory: showLocalHistory,
        getPaginationPageSize: getPaginationPageSize
    },
});

/**
 * Article History instance method
 * Initialize History
 */
function ArticleHistory$init() {
    ArticleHistory.super.init.apply(this, arguments);

    this.on('childrenbound', onChildrenBound);
}


function onChildrenBound () {
    this.off('childrenbound');

    var historyList = this.container.scope.list;
    var moreButton = this.container.scope.more;

    historyList.events.on('dblclick', { context: this, subscriber: function(msg, event) {
        var listComp = milo.Component.getContainingComponent(event.target, true, 'item');

        if(listComp) {
            milo.mail.postMessage('loadarticleversion', { 
                data: { 
                    version: this.model.get()[listComp.item.index], 
                    currentArticleId: this._currentArticleId
                }
            });
        }
    }});

    moreButton.events.on('click', { context: this, subscriber: function(msg, event) {
        var currentCount = this.container.scope.list.data.get().length;

        showItems.call(this, currentCount + this.getPaginationPageSize());
    }});
}

function fetchHistory (articleId, articleVersion, completeCallback) {
    if (! articleId) return;

    completeCallback = completeCallback || _.noop;
    var self = this;

    self._currentArticleId = articleId;
    self.container.scope.list.data.set([]);
    self.model.set([]);

    self.container.scope.more.dom.hide(); // Hide 'more' button initially (Will be made visible if required after version data has loaded)

    milo.util.request.json(window.CC.config.apiHost + '/assets/article/' + articleId + '/versions', function(err, res) {
        if (err) {
            completeCallback(err, res);
            return logger.error('Cannot load versions list', err);
        }

        var list = mergeWpsCCVersions(res);
        var initialPage = 1;

        // Add additional flag to versionData (isCurrentVersion) and calculate the initial pagination page required to show the current version 
        for(var i = 0; i < list.length; i++) {
            var versionData = list[i];
            var isCurrentVersion = versionData.isCurrentVersion = versionData.id == articleVersion || (i == 0 && articleVersion == 'latest');

            if(isCurrentVersion) initialPage = Math.ceil((i + 1) / self.getPaginationPageSize());
        }

        self.model.set(list);

        showItems.call(self, initialPage * self.getPaginationPageSize());    

        completeCallback(err, list);
    });
}

function showItems(count) {
    var self = this;
    var list = this.model.get();
    var listComp = this.container.scope.list;
    var itemsToShow = list.slice(0, Math.min(count, list.length));

    listComp.data.set(itemsToShow);
    listComp.list.each(function(item, index) {
        var versionData = list[index];
        var status = versionData.status.toLowerCase();
        var statusComp = item.container.scope.status;
        var editorToolComp = item.container.scope.editorTool;

        statusComp.el.classList.add(ARTICLE_STATUS_CSS_LABELS[status]);
        item.el.classList.toggle('active', versionData.isCurrentVersion);

        if (versionData.editorTool != 'CC') editorToolComp.el.classList.add('label', 'label-warning');
    });

    this.container.scope.more.dom.toggle(list.length > count);
}

function getPaginationPageSize() {
    return 8; // No need to make configurable at this point
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
