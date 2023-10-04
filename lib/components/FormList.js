'use strict';

const FORMLIST_CHANGE_MESSAGE = 'mlformlistchange';

const MLFormList = module.exports = milo.createComponentClass({
    className: 'MLFormList',
    facets: {
        container: undefined,
        data: {
            get: MLFormList_get,
            set: MLFormList_set,
            del: MLFormList_del,
            splice: MLFormList_splice,
            event: FORMLIST_CHANGE_MESSAGE
        },
        model: undefined,
        dom: {
            cls: [ 'form-list', 'ml-ui-form-list' ]
        },
        events: {
            messages: {
                click: { subscriber: handleClick, context: 'owner' }
            }
        }
    },
    methods: {
        init: MLFormList$init,
        moveItem: MLFormList$moveItem,
        setItemSchema: MLFormList$setItemSchema,
        destroy: MLFormList$destroy
    }
});

function handleClick (type, event) {
    const component = milo.Component.getContainingComponent(event.target);
    if (component && component.name) {
        const formList = component.getScopeParentWithClass('MLFormList');
        const formItem = component.getScopeParentWithClass('MLFormListItem');
        if (formItem) {
            const item = formItem.item;
            if (component.name === 'downBtn') {
                formList.moveItem(item.index, item.index + 1);
            } else if (component.name === 'upBtn') {
                formList.moveItem(item.index, item.index - 1);
            } else if (component.name === 'deleteBtn') {
                item.removeItem();
            }
        }
    }
}

function MLFormList$init () {
    MLFormList.super.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
}

function MLFormList$setItemSchema (schema) {
    this._subFormSchema = schema.subSchema;
    this._movable = !!schema.allowMove;
    this._deletable = !!schema.allowDelete;
    this._itemLabel = schema.itemLabel;
    this._prepend = schema.allowPrepend;
    showHidePrepend.call(this);
}

function MLFormList$moveItem (fromIndex, toIndex) {
    const toInsert = this.model.m.splice(fromIndex, 1);
    if (toInsert) return this.model.m.splice(toIndex, 0, toInsert[0]);
}

function MLFormList$destroy () {
    if (this._connector) milo.minder.destroyConnector(this._connector);
    this._connector = null;
    MLFormList.super.destroy.apply(this, arguments);
}

function onChildrenBound () {
    const scope = this.container.scope;
    this._connector = milo.minder(this.model, '->>>', scope.list.data).deferChangeMode('<<<->>>');
    scope.addBtn && scope.addBtn.events.on('click', { subscriber: addItem, context: this });
    if (scope.addBtnBefore) {
        scope.addBtnBefore.events.on('click', { subscriber: addItemBefore, context: this });
        showHidePrepend.call(this);
    }
    this.model.m.on('*', { subscriber: _triggerExternalPropagation, context: this });
}

function showHidePrepend() {
    const scope = this.container.scope;
    if (!scope.addBtnBefore) return;
    const model = this.model.get();
    scope.addBtnBefore.el.classList.toggle('hidden', !this._prepend || !model || model.length === 0);
}

function addItem () {
    this.model.m.push({});
}

function addItemBefore () {
    this.model.m.unshift({});
}

function MLFormList_get () {
    const model = this.model.get();
    return model ? _.clone(model) : undefined;
}

function MLFormList_set (value) {
    this.model.set(value);
    _triggerExternalPropagation.call(this);
}

function MLFormList_del () {
    const res = this.model.set([]);
    _triggerExternalPropagation.call(this);
    return res;
}

function MLFormList_splice (index, howmany) {
    const args = [ index, howmany ].concat(Array.prototype.slice.call(arguments, 2));
    this.model.splice.apply(this.model, args);
    _triggerExternalPropagation.call(this);
}

function _triggerExternalPropagation () {
    this.data.dispatchSourceMessage(FORMLIST_CHANGE_MESSAGE);
    showHidePrepend.call(this);
}
