'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , ElementLock = require('../ElementLock')
    , logger = milo.util.logger
    , prependUrlProtocol = require('cc-common').util.prependUrlProtocol
    , text = require('cc-common').text
    , async = require('async');

var RELATEDLIST_CHANGE_MESSAGE = 'ccrelatedlistchange';

var CCRelatedList = Component.createComponentClass('CCRelatedList', {
    container: undefined,
    events: undefined,
    dom: {
        cls: 'cc-relatedlist-group'
    },
    list: undefined,
    data: {
        messages: {
            '**': {
                subscriber: _.debounce(addStylesToList, 75),
                context: 'owner'
            },
            '[*].relatedArticleTypeId': {
                subscriber: updatePartnersView,
                context: 'owner'
            }
        }
    }
});

componentsRegistry.add(CCRelatedList);
module.exports = CCRelatedList;

_.extendProto(CCRelatedList, {
    init: CCRelatedList$init,
    setLinkDefaults: CCRelatedList$setLinkDefaults
});

function CCRelatedList$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
    this.once('stateready', _.deferred(addStylesToList));
}

function CCRelatedList$setLinkDefaults(defaultLink) {
    this._defaultLink = defaultLink;
}


function onChildrenBound() {
    var saveBtn = this.container.scope.saveBtn;
    saveBtn.events.on('click', { subscriber: onSaveButtonClick, context: this });

    var input = this.container.scope.input;
    input.events.on('keypress', { subscriber: onInputKey, context: this })

    this.events.on('click', { subscriber: onListClickSubscriber, context: this });
    this.events.on('change', { subscriber: onListChangeSubscriber, context: this });
}

function updatePartnersView(path, data) {
    var list = this.list;
    _.defer(function () {
        var getIndex = parseInt(path.match(/\[([0-9])\]/)[1], 10);

        var isMoney = list.item(getIndex).container.scope.isMoney.el;

        isMoney.checked = isPartner(data.newValue);
    });
}


function onListClickSubscriber(type, event) {
    var comp = Component.getComponent(event.target);
    if (!comp) return;
    var parent = comp.getScopeParent('Item');
    if (parent) {
        var index = parent.item.index;
        var name = comp.name;

        switch (name) {
            case 'downBtn':
                this.events.postMessage('cmgroup_moveitemat', { index: index, direction: 'down' });
                break;
            case 'upBtn':
                this.events.postMessage('cmgroup_moveitemat', { index: index, direction: 'up' });
                break;
            case 'deleteBtn':
                this.events.postMessage('cmgroup_removeitemat', { index: index });
                break;
        }
    }
}

function onListChangeSubscriber(type, event) {
    var el = event.target;
    var comp = Component.getComponent(el);
    if (!comp) return;
    var parent = comp.getScopeParent('Item');
    if (parent) {
        var index = parent.item.index;
        if (comp.name == 'isMoney') {
            var data = parent.data.get();
            data.relatedArticleTypeId = changeRelatedId(data.relatedArticleTypeId, el.checked);
            parent.data.set(data);
        }
    }
}

function changeRelatedId(linkId, isPartner) {
    if (isExternal(linkId))
        return isPartner ? '11' : '2';
    return isPartner ? '12' : '1';
}


function onInputKey(msg, event) {
    if (event.keyCode == 13) onSaveButtonClick.call(this);
}


function onSaveButtonClick() {
    var newRelated = this.container.scope.input.data.get()
        .split(' ').filter(function(value) {
            return value != '';
        }),
        self = this,
        lock = new ElementLock(self.el, 5000);

    async.series(newRelated.map(function(link, index) {
        return _.partial(getLinkMeta, link);
    }), function (err, success) { // Error is only passed for numeric erorrs (getRelatedArticle)
        lock.unlock();
        self.container.scope.input.data.set('');
        if (!err) return;

        error('DIALOG_RELATED_ARTICLE_NOT_FOUND');

        self.container.scope.input.data.set(
            newRelated.splice(newRelated.indexOf(err)).join(' ')
        );
    });

    function getLinkMeta(urlOrId, callback) {
        var baseUrl = window.CC.config.apiHost;
        if ( _.isNumeric(urlOrId) ) {
            baseUrl += '/article/getRelatedArticle/';

            milo.util.request.json(baseUrl + urlOrId, function (err, responseData) {
                if (err) return callback(urlOrId);

                addRelatedArticle.call(self, _.extend(responseData, self._defaultLink));
                callback(null, urlOrId);
            });
        } else {
            baseUrl += '/links/remotetitle';

            milo.util.request.post(baseUrl, {url: prependUrlProtocol(urlOrId)}, function (err, responseData) {
                if (err) responseData = '';
                addRelatedLink.call(self, urlOrId, responseData);

                callback(null, urlOrId);
            });
        }
    }
}


function addRelatedLink(url, headline) {
    var relatedData = createCommonRelatedData.call(this);
    relatedData.relatedUrl = url.match(/^https?:\/\//) ? url : 'http://' + url;
    relatedData.relatedArticleTypeId = 2;
    relatedData.voteFollow = true;
    relatedData.newWindow = true;
    relatedData.headline = headline;
    addRelatedArticle.call(this, relatedData);
}


function addRelatedArticle(relatedData) {
    if (relatedData.headline != undefined)
        this.events.postMessage('cmgroup_additem', {
            itemData: relatedData
        });
    else error('DIALOG_LINKS_NO_DATA_FOUND')
}

function error(msg) {
    milo.mail.trigger('opendialog', {
        name: msg,
        options: {
            title: 'Error',
            text: text(msg)
        }
    });
}

function createCommonRelatedData() {
    return _.extend(_.clone(this._defaultLink), {
        voteFollow: false,
        target: null,
        getDetails: false
    });
}

function addStylesToList() {
    var baseUrl = window.CC.config.environment == 'production' ? 'http://dailymail.co.uk' : 'http://integration.dailymail.co.uk';
    this.list.each(function (comp, index) {
        if (comp.el._prevStyle) comp.el.classList.remove(comp.el._prevStyle);

        var articleID = comp.container.scope.relatedArticleTypeId.data.get();
        var typeClass = isExternal(articleID) ? 'cc-relatedlist-external' : 'cc-relatedlist-article';
        var scope = comp.container.scope;
        comp.el.classList.add(typeClass);
        scope.relatedUrl.el.href = scope.relatedUrl.el.innerHTML;
        comp.el.classList.toggle('has-error', scope.headline.el.value.length == 0);
        if (!scope.headline.isAutoresized())
            scope.headline.startAutoresize({ minHeight: 24, maxHeight: 84 });
        scope.relatedId.el.href =  baseUrl + scope.relatedUrl.el.innerHTML;
    });
}

function isPartner(type) {
    return type == 11 || type == 12;
}

function isExternal(type) {
    return type == 2 || type == 10 || type == 11;
}

