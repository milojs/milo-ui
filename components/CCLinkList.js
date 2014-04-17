'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;


var listTemplate = '\
<ul ml-bind="[list, events]:list">                 \
    <li ml-bind="[item]:result" class="list-item">  \
        <span ml-bind="[data]:label"></span>                \
        <button ml-bind="[events]:editBtn">edit</button>    \
        <button ml-bind="[events]:deleteBtn">x</button>     \
    </li> \
</ul> \
<input type="text" ml-bind="[data]:url" class="form-control ml-ui-input"> \
<input type="text" ml-bind="[data]:headline" class="form-control ml-ui-input"> \
<button ml-bind="[Events]:saveBtn"  class="btn btn-default ml-ui-button"> Add </button>  \
</li>                                                   \
</ul>';


var CCLinkList = Component.createComponentClass('CCLinkList', {
    container: undefined,
    events: undefined,
    data: {
        get: CCLinkList_get,
        set: CCLinkList_set,
        del: CCLinkList_del,
        splice: CCLinkList_splice
    },
    model: undefined,
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


function onChildrenBound () {
    this.template.render().binder();
    milo.minder(this.container.scope.list.data, '<<<->>>', this.model);
    var saveBtn = this.container.scope.saveBtn;
    saveBtn.events.on('click', { subscriber: onSaveButtonSubscriber, context: this });
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

            switch(name) {
                case 'editBtn':
                    editItem.call(this, index);
                    break;
                case 'deleteBtn':
                    deleteItem.call(this,index);
                    break;
            }
        }
    }
}

function deleteItem(index) {
    this.model.splice(index, 1);
}


function editItem(index, data) {
    var item = this.model.get()[index];

    console.log("Editing", index, item);

    var urlData = this.container.scope.url.data;
    urlData.set(item.value.relatedUrl);

    var headlineData = this.container.scope.headline.data;
    headlineData.set(item.value.headline);

    this.container.scope.saveBtn.el.innerHTML = 'Save';

    this._saving = { index : index };

}


function CCLinkList_get() {
    var model = this.model.get();
    return model ? _.clone(model) : undefined;
}

function CCLinkList_set(value) {
    this.model.set(value.map(function(item) {
        return makeItem(item);
    }));
}

function CCLinkList_del() {
    return this.model.set([]);
}

function CCLinkList_splice(index, howmany) { // ... arguments
    var dataFacet = this.container.scope.list.data;
    var args = [index, howmany].concat(Array.prototype.slice.call(arguments, 2).map(function() {
        return makeItem(args);
    }));
    dataFacet._splice.apply(dataFacet, args);
    this.model.splice.apply(this.model, args);
}


function onSaveButtonSubscriber() {
    if (this._saving) {
        saveExternalLink.call(this, this._saving.index);
        delete this._saving;
    } else {
        addExternalLink.call(this);
    }
}

function makeItem(data) {
    return { label: makeLabel(data), value: data };
}

function makeLabel(relatedLink) {
    return relatedLink.headline + ' ('+ relatedLink.relatedUrl +')'
}


function saveExternalLink(index) {
    var formData = _getAndClearFormData.call(this);

    console.log("from Edited", formData);

    var data = this.model.get();
    var value = data[index].value;
    _.extend(value, formData);

    data[index] = {
        label: makeLabel(formData),
        value: value
    };
    //data[index].value = _.extend(data[index].value, formData);

    console.log("New data", index, data);

    this.model.set(data);
}

function addExternalLink() {
    var formData = _getAndClearFormData.call(this);

    var externalLinksModel = this.model;
    if (!externalLinksModel.get()) externalLinksModel.set([]);
    externalLinksModel.push({ label: makeLabel(formData), value: formData } );
}

function _getAndClearFormData() {
    var urlData = this.container.scope.url.data;
    var headlineData = this.container.scope.headline.data;
    var relatedLink = {
        relatedUrl: urlData.get(),
        headline: headlineData.get()
    };
    urlData.set('');
    headlineData.set('');

    return relatedLink;


}

