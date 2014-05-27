'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;

var RELATEDLIST_CHANGE_MESSAGE = 'ccrelatedlistchange';

var CCRelatedList = Component.createComponentClass('CCRelatedList', {
    container: undefined,
    events: undefined,
    dom: {
        cls: 'cc-relatedlist-group'
    },
    data: {
        get: CCRelatedList_get,
        set: CCRelatedList_set,
        del: CCRelatedList_del,
        splice: CCRelatedList_splice,
        event: RELATEDLIST_CHANGE_MESSAGE
    },
    model: {
        messages: {
            '*': {
                subscriber: _.throttle(onListUpdated, 100),
                context: 'owner'
            },
            '**': {
                subscriber: _.throttle(onInnerChange, 50),
                context: 'owner'
            }
        }
    }
});

componentsRegistry.add(CCRelatedList);
module.exports = CCRelatedList;

_.extendProto(CCRelatedList, {
    init: CCRelatedList$init
});


function CCRelatedList$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    milo.minder(this.container.scope.related.data, '<<<->>>', this.model);

    var saveBtn = this.container.scope.saveBtn;
    saveBtn.events.on('click', { subscriber: onSaveButtonSubscriber, context: this });

    var list = this.container.scope.related;
    list.events.on('click', { subscriber: onListClickSubscriber, context: this });
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


// function swapItems(index1, index2) {
//     var data = this.model.get(),
//         data1 = _.deepClone(data[index1]),
//         data2 = _.deepClone(data[index2]);
//     this.model.splice(index1, 2, data2, data1);
// }


// function deleteItem(index) {
//     this.model.splice(index, 1);
// }


function CCRelatedList_get() {
    var model = this.model.get();
    return model ? _.deepClone(model) : [];
}


function CCRelatedList_set(value) {
    this.model.set(value || []);
    sendChangeMessage.call(this);
}


function CCRelatedList_del() {
    var res = this.model.set([]);
    sendChangeMessage.call(this);
    return res;
}


function CCRelatedList_splice(index, howmany) { // ... arguments
    var args = [index, howmany].concat(Array.prototype.slice.call(arguments, 2));

    this.model.splice.apply(this.model, args);
    sendChangeMessage.call(this);
}


function onSaveButtonSubscriber() {
    var newRelated = this.container.scope.input.data.get();

    var baseUrl = window.CC.config.apiHost;
    var self = this;

    if ( _.isNumeric(newRelated) ) {
        baseUrl += '/article/getRelatedArticle/';

        milo.util.request.json(baseUrl + newRelated, function (err, responseData) {
            if (err) return window.alert('can\'t find article');
            addRelatedArticle.call(self, responseData);
            self.container.scope.input.data.set('');
        });
    } else {
        baseUrl += '/links/remotetitle';

        milo.util.request.post(baseUrl, {url: newRelated}, function (err, responseData) {
            if (err) return window.alert('can\'t find article');
            addRelatedLink.call(self, newRelated, responseData);
            self.container.scope.input.data.set('');
        });
    }
}


function addRelatedLink(url, headline) {
    var relatedData = createCommonRelatedData();
    relatedData.relatedUrl = url.match(/^http:\/\//) ? url : 'http://' + url;
    relatedData.relatedArticleTypeId = 2;
    relatedData.voteFollow = true;
    relatedData.newWindow = true;
    relatedData.headline = headline;
    addRelatedArticle.call(this, relatedData);
}


function addRelatedArticle(relatedData) {
    this.events.postMessage('cmgroup_additem', {
        itemData: relatedData
    });
}

function createCommonRelatedData() {
    return {
        previewLink: false,
        voteFollow: false,
        target: null,
        getDetails: false
    };
}

function onListUpdated() {
    addStylesToList.call(this);
}

function onInnerChange() {
    sendChangeMessage.call(this);
}

function addStylesToList() {
    var baseUrl = window.CC.config.environment == 'production' ? 'http://dailymail.co.uk' : 'http://integration.dailymail.co.uk';
    var listData = this.model.m.get();
    this.container.scope.related.list.each(function (comp, index) {
        if (comp.el._prevStyle) comp.el.classList.remove(comp.el._prevStyle);
        if (!listData[index]) return;

        var typeClass = isExternal(listData[index].relatedArticleTypeId) ? 'cc-relatedlist-external' : 'cc-relatedlist-article';
        var scope = comp.container.scope;
        comp.el.classList.add(typeClass);
        scope.relatedUrl.el.href = scope.relatedUrl.el.innerHTML;
        scope.relatedId.el.href =  baseUrl + scope.relatedUrl.el.innerHTML;
    });
}

function isExternal(type) {
    return type == 10 || type == 2;
}

function sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(RELATEDLIST_CHANGE_MESSAGE);
}
