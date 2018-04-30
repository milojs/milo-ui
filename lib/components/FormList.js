'use strict';

const fs = require('fs')
    , formlistitem_dot = fs.readFileSync(__dirname + '/../forms/items/formlistitem.dot', 'utf-8')
    , doT = milo.util.doT;

var MLFormList = module.exports = milo.createComponentClass({
    className: 'MLFormList',
    facets: {
        container: undefined,
        dom: {
            cls: 'ml-ui-form-list'
        },
        model: undefined,
        data: undefined,
        events: {
            messages: {
                click: { subscriber: handleClick, context: 'owner' }
            }
        },
        list: {
            embellishItem: function (item, schema) {
                const formRegistry = milo.registry.components.get('MLForm').registry;
                schema.forEach(function (schemaItem) {
                    const comp = item.container.scope[schemaItem.compName];
                    if (comp) {
                        const formItem = formRegistry.get(schemaItem.type);
                        formItem.itemFunction(comp, schemaItem);
                    }
                });
                return item;
            }
        }
    },
    methods: {
        init: MLFormList$init,
        destroy: MLFormList$destroy,
        setTemplate: MLFormList$setTemplate,
        setOptions: MLFormList$setOptions,
        moveItem: MLFormList$moveItem
    }
});

function handleClick (type, event) {
    const component = milo.Component.getContainingComponent(event.target);
    if (component && component.name) {
        if (component.name === 'downBtn') {
            const item = component.getScopeParent().item;
            item.list.owner.moveItem(item.index, item.index + 1);
        } else if (component.name === 'upBtn') {
            const item = component.getScopeParent().item;
            item.list.owner.moveItem(item.index, item.index - 1);
        } else if (component.name === 'deleteBtn') {
            component.getScopeParent().item.removeItem();
        }
    }
}

function prepareTemplate (label, temp, options) {
    const template = document.createElement('template');
    const itemTemplate = doT.compile(formlistitem_dot);
    const item = itemTemplate(Object.assign({}, options, {
        label: label || 'ITEM',
        itemContent: temp.trim(),
    }));
    template.innerHTML = item;
    return template.content.firstChild;
}

function MLFormList$moveItem (from, to) {
    this.model.splice(from, 1);
    const toInsert = this.list.item(from).data.get();
    return this.model.splice(to, 0, toInsert);
}

function MLFormList$setTemplate (itemLabel, tempComp, tempSchema) {
    this.template = tempComp;
    const elem = prepareTemplate(itemLabel, this.template, this.options);
    const itemSample = milo.binder(elem, this.container.scope).itemSample;
    this.list.setSample(itemSample, tempSchema);
}

function MLFormList$setOptions (options) {
    this.options = {
        allowMove: options.allowMove,
        allowDelete: options.allowDelete
    };
    return this;
}

function MLFormList$init () {
    MLFormList.super.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
}

function MLFormList$destroy () {
    if (this._connector) milo.minder.destroyConnector(this._connector);
    this._connector = null;
    MLFormList.super.destroy.apply(this, arguments);
}

function onChildrenBound () {
    this.model.set([]);
    const addBtn = this.container.scope.addBtn;
    addBtn && addBtn.events.on('click', { subscriber: function () { this.addItem(); }, context: this.list });
    this._connector = milo.minder(this.model, '<<<-', this.data).deferChangeMode('<<<->>>');
}
