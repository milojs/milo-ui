'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;

var LINKLIST_CHANGE_MESSAGE = 'cclinklistchange';


var CCLinkList = Component.createComponentClass('CCLinkList', {
    container: undefined,
    events: undefined,
    data: {
        get: CCLinkList_get,
        set: CCLinkList_set,
        del: CCLinkList_del,
        splice: CCLinkList_splice,
        event: LINKLIST_CHANGE_MESSAGE
    },
    model: {
        messages: {
            '*': { subscriber: _.debounce(onListUpdated, 20), context: 'owner' },
            '**': {
                subscriber: _.debounce(updateLinks, 75),
                context: 'owner'
            }
        }
    }
});

componentsRegistry.add(CCLinkList);
module.exports = CCLinkList;

_.extendProto(CCLinkList, {
    init: CCLinkList$init,
    setHostComponent: CCLinkList$setHostComponent
});


var externalLinkDefaults = {
    relatedArticleTypeId: 10,
    previewLink: false,
    getDetails: true
};


function CCLinkList$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
}


function CCLinkList$setHostComponent(hostComponent) {
    this._hostComponent = hostComponent
}


function onChildrenBound() {
    milo.minder(this.model, '->>>', this.container.scope.list.data).deferChangeMode('<<<->>>');

    var saveBtn = this.container.scope.saveBtn;
    saveBtn.events.on('click', { subscriber: onSaveButtonSubscriber, context: this });

    var cancelBtn = this.container.scope.cancelBtn;
    cancelBtn.events.on('click', { subscriber: onCancelButtonSubscriber, context: this });

    var list = this.container.scope.list;
    list.events.on('click', { subscriber: onListClickSubscriber, context: this });
}

function onListClickSubscriber(type, event) {
    if (type == 'click') {
        var elm = event.target;
        var comp = Component.getComponent(elm);
        if (! comp) return;

        var parent = comp.getScopeParent('Item');
        if (parent) {
            var index = parent.item.index;
            var name = comp.name;
            switch (name) {
                case 'editBtn':
                    editItem.call(this, index);
                    break;
                case 'deleteBtn':
                case 'deleteHyperlinkBtn':
                    deleteItem.call(this, index);
                    break;
                case 'editHyperlinkBtn':
                    editHyperlink.call(this, index);
                    break;
            }
        }
    }
}


function deleteItem(index) {
    var self = this;
    var link = this.model.get()[index];
    this.model.splice(index, 1);
    _.deferTicks(function () {
        self._hostComponent.broadcast('deletehyperlink', { id: link.id });
    }, 2);
    _triggerExternalPropagation.call(this);
}


function toggleEditMode(isOn) {
    this.container.scope.saveBtn.el.innerHTML = isOn ? 'Update' : 'Add';
    this.container.scope.cancelBtn.dom.toggleCssClasses('cc-hidden', !isOn);
    if (!isOn) _getAndClearFormData.call(this);
}


function onCancelButtonSubscriber() {
    delete this._saving;
    toggleEditMode.call(this, false);
}


function onListUpdated() {
    var listData = this.model.m.get();
    this.container.scope.list.list.each(function(comp, index) {
        var link = listData[index];
        if (! link) return;
        comp.el.classList.toggle('external-links-auto', link.id ? true : false);
        comp.el.classList.toggle('external-links-manual', link.id ? false : true);
    });
}


function editHyperlink(index) {
    this._hostComponent.broadcast('selecthyperlink', { id: this.model.get()[index].id });
}


function editItem(index, data) {
    var item = this.model.get()[index];
    var urlData = this.container.scope.url.data;
    urlData.set(item.relatedUrl);
    var headlineData = this.container.scope.headline.data;
    headlineData.set(item.headline);
    this.container.scope.saveBtn.el.innerHTML = 'Update';

    this._saving = { index: index };
    toggleEditMode.call(this, true);
}


function CCLinkList_get() {
    var model = this.model.get();
    return model ? _.clone(model) : undefined;
}


function CCLinkList_set(value) {
    this.model.set(value);
    _triggerExternalPropagation.call(this);
}


function CCLinkList_del() {
    var res = this.model.set([]);
    _triggerExternalPropagation.call(this);
    return res;
}


function CCLinkList_splice(index, howmany) { // ... arguments
    var dataFacet = this.container.scope.list.data;
    var args = [index, howmany].concat(Array.prototype.slice.call(arguments, 2));
    this.model.splice.apply(this.model, args);
    _triggerExternalPropagation.call(this);
}


function onSaveButtonSubscriber() {
    if (this._saving) {
        saveExternalLink.call(this, this._saving.index);
    } else {
        addExternalLink.call(this);
    }
}


function validateForm(formData) {
    if (formData.headline && formData.relatedUrl)  {
        return;
    } else {
        throw new Error("Validation Failed");
    }
}


function saveExternalLink(index) {
    try {
        var formData = _getAndClearFormData.call(this, validateForm);
    } catch (e) {
        logger.error("Failed to Save External Link:" + e);
        return;
    }
    var data = this.model.get();
    var externalLink = data[index];
    _.extend(externalLink, externalLinkDefaults);
    _.extend(externalLink, formData);
    this.model.splice(index, 1, externalLink);
    toggleEditMode.call(this, false);
    delete this._saving;
    _triggerExternalPropagation.call(this);
}


function addExternalLink() {
    try {
        var formData = _getAndClearFormData.call(this, validateForm);
    } catch (e) {
        logger.error("Failed to Add External Link:" + e);
        return;
    }
    var externalLink = _.extend(_.clone(externalLinkDefaults), formData);


    var externalLinksModel = this.model;
    var existing = externalLinksModel.get();
    if (!externalLinksModel.get()) {
        externalLinksModel.set([]);
    }
    externalLinksModel.push(externalLink);
    _triggerExternalPropagation.call(this);
}

function updateLinks() {
    var listComp = this.container.scope.list;
    if (!listComp || !listComp.list) return;

    listComp.list.each(function (comp, index) {
        var scope = comp.container.scope;
        scope.relatedUrl.el.href = scope.relatedUrl.el.innerHTML;
    });
}


function _getAndClearFormData(validateFn) {
    var headlineDataPath = this.container.scope.headline.data;
    var urlDataPath = this.container.scope.url.data;

    var IMHyperlink = componentsRegistry.get('IMHyperlink')

    var url = urlDataPath.get()
    var relatedLink = {
        relatedUrl: url && IMHyperlink.prependUrlProtocol(url),
        headline: headlineDataPath.get()
    };

    validateFn && validateFn.call(this, relatedLink);

    urlDataPath.set('');
    headlineDataPath.set('');
    return relatedLink;
}


function _triggerExternalPropagation() {
    this.data.dispatchSourceMessage(LINKLIST_CHANGE_MESSAGE);
}
