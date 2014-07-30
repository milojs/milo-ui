'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , ElementLock = require('../ElementLock')
    , logger = milo.util.logger
    , prependUrlProtocol = require('cc-common').util.prependUrlProtocol
    , text = require('cc-common').text;

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
    saveBtn.events.on('click', { subscriber: onSaveButtonSubscriber, context: this });

    this.events.on('click', { subscriber: onListClickSubscriber, context: this });
}


function onListClickSubscriber(type, event) {
    var elm = event.target;
    var comp = Component.getComponent(elm);
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


function onSaveButtonSubscriber() {
    var newRelated = this.container.scope.input.data.get();

    var baseUrl = window.CC.config.apiHost;
    var self = this;

    var lock = new ElementLock(self.el, 5000);

    if ( _.isNumeric(newRelated) ) {
        baseUrl += '/article/getRelatedArticle/';

        milo.util.request.json(baseUrl + newRelated, function (err, responseData) {
            lock.unlock();
            if (err) return window.alert('can\'t find article');
            addRelatedArticle.call(self, _.extend(responseData, self._defaultLink));
            self.container.scope.input.data.set('');
        });
    } else {
        newRelated = prependUrlProtocol(newRelated);
        baseUrl += '/links/remotetitle';

        milo.util.request.post(baseUrl, {url: newRelated}, function (err, responseData) {
            lock.unlock();
            if (err) return window.alert('can\'t find article');
            addRelatedLink.call(self, newRelated, responseData);
            self.container.scope.input.data.set('');
        });
    }
}


function addRelatedLink(url, headline) {
    var relatedData = createCommonRelatedData.call(this);
    relatedData.relatedUrl = url.match(/^http:\/\//) ? url : 'http://' + url;
    relatedData.relatedArticleTypeId = 2;
    relatedData.voteFollow = true;
    relatedData.newWindow = true;
    relatedData.headline = headline;
    addRelatedArticle.call(this, relatedData);
}


function addRelatedArticle(relatedData) {
    if (relatedData.headline)
        this.events.postMessage('cmgroup_additem', {
            itemData: relatedData
        });
    else
        milo.mail.trigger('opendialog', {
            name: 'cannotaddrelatedlink',
            options: {
                title: 'Error',
                text: text('DIALOG_LINKS_NO_DATA_FOUND')
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
        scope.relatedId.el.href =  baseUrl + scope.relatedUrl.el.innerHTML;
    });
}

function isExternal(type) {
    return type == 10 || type == 2;
}

