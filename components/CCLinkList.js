'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;


var listTemplate = '\
<ul ml-bind="[list, events]:list">                 \
    <li ml-bind="[item]:result" class="linklist-item">  \
        <span class="linklist-wrap"><span ml-bind="[data]:headline"></span> (<span ml-bind="[data]:relatedUrl"></span>)</span>  \
        <button ml-bind="[events]:editBtn">edit</button>    \
        <button ml-bind="[events]:deleteBtn">x</button>     \
    </li> \
</ul> \
<label>Url</label>\
<input type="text" ml-bind="[data]:url" class="form-control ml-ui-input"> \
<label>Headline</label>\
<input type="text" ml-bind="[data]:headline" class="form-control ml-ui-input"> \
<button ml-bind="[events]:saveBtn"  class="btn btn-default ml-ui-button"> Add </button>  \
<button ml-bind="[events, dom]:cancelBtn"  class="btn btn-default ml-ui-button cc-hidden"> Cancel </button>  \
</li>                                                   \
</ul>';

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
            '*': {
                subscriber: _sendChangeMessage,
                context: 'owner'
            }
        }
    },
    template: {
        template: listTemplate,
        interpolate: false
    }
});

componentsRegistry.add(CCLinkList);
module.exports = CCLinkList;

_.extendProto(CCLinkList, {
    init: CCLinkList$init
});


function CCLinkList$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    this.template.render().binder();

    milo.minder(this.container.scope.list.data, '<<<->>>', this.model);

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
        var parent = comp.getScopeParent('Item');
        if (parent) {
            var index = parent.item.index;
            var name = comp.name;

            switch (name) {
                case 'editBtn':
                    editItem.call(this, index);
                    break;
                case 'deleteBtn':
                    deleteItem.call(this, index);
                    break;
            }
        }
    }
}

function deleteItem(index) {
    this.model.splice(index, 1);
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
    _sendChangeMessage.call(this);
}


function CCLinkList_del() {
    var res = this.model.set([]);
    _sendChangeMessage.call(this);
    return res;
}


function CCLinkList_splice(index, howmany) { // ... arguments
    var dataFacet = this.container.scope.list.data;
    var args = [index, howmany].concat(Array.prototype.slice.call(arguments, 2));

    dataFacet._splice.apply(dataFacet, args);

    this.model.splice.apply(this.model, args);
    _sendChangeMessage.call(this);
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
    var value = data[index];
    _.extend(value, formData);


    this.model.splice(index, 1, value);

    toggleEditMode.call(this, false);

    delete this._saving;
}


function addExternalLink() {
    try {
        var formData = _getAndClearFormData.call(this, validateForm);
    } catch (e) {
        logger.error("Failed to Add External Link:" + e);
        return;
    }
    var externalLinksModel = this.model;
    if (!externalLinksModel.get()) externalLinksModel.set([]);
    externalLinksModel.push(formData);
}


function _getAndClearFormData(validateFn) {
    var urlData = this.container.scope.url.data;
    var headlineData = this.container.scope.headline.data;
    var relatedLink = {
        relatedUrl: urlData.get(),
        headline: headlineData.get()
    };

    validateFn && validateFn.call(this, relatedLink);

    urlData.set('');
    headlineData.set('');

    return relatedLink;
}


function _sendChangeMessage() {
    this.data.getMessageSource().dispatchMessage(LINKLIST_CHANGE_MESSAGE);
}
