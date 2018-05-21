'use strict';

const componentsRegistry = milo.registry.components;
const FORM_LIST_CHANGE_MESSAGE = 'formlistchange';

module.exports = milo.createComponentClass({
    className: 'MLFormListItem',
    facets: {
        container: undefined,
        data: {
            get: MLFormListItem_get,
            set: MLFormListItem_set,
            del: MLFormListItem_del,
            event: FORM_LIST_CHANGE_MESSAGE
        },
        item: undefined,
        template: {
            template: '\
                <label class="form-item-label">ITEM</label>\
                <span class="form-list-controls">\
                    <span class="control-movable" style="display: none">\
                        <i ml-bind="[events]:downBtn" class="fa fa-arrow-down"></i>\
                        <i ml-bind="[events]:upBtn" class="fa fa-arrow-up"></i>\
                    </span>\
                    <i ml-bind="[events]:deleteBtn" class="fa fa-times control-deletable" style="display: none"></i>\
                </span>\
            ',
            interpolate: false,
            autoRender: true
        },
        dom: {
            cls: 'form-list-item'
        },
    },
    methods: {
        setupSubformOnce: MLFormListItem$setupSubformOnce,
        renderSubform: MLFormListItem$renderSubform
    }
});

function MLFormListItem_get() {
    var value = this._form && this._form.model.get();
    return (value && typeof value === 'object') ? _.clone(value) : value;
}

function MLFormListItem_set(value) {
    this.setupSubformOnce();
    this._form.model.set(value);
}

function MLFormListItem_del() {
    this.setupSubformOnce();

    this._form && this._form.model.del();
}

function MLFormListItem$setupSubformOnce() {
    if (this._form || this.name === 'itemSample') return;

    const schema = getFormList(this)._subFormSchema;
    this._form = this.renderSubform(schema);
    this._form.model.on('***', { subscriber: function () {
        this.data.dispatchSourceMessage(FORM_LIST_CHANGE_MESSAGE);
    }, context: this });
}

function MLFormListItem$renderSubform(schema) {
    const MLForm = componentsRegistry.get('MLForm');
    const formHost = getFormHost(this);
    const oldDomCls = MLForm.getFacetConfig('dom').cls;
    const formlist = getFormList(this);

    MLForm.getFacetConfig('dom').cls = '';
    const newForm = MLForm.createForm(schema, formHost);
    MLForm.getFacetConfig('dom').cls = oldDomCls;

    if (formlist._itemLabel) this.el.querySelector('.form-item-label').innerHTML = formlist._itemLabel;
    toggleDisplay(this.el.querySelector('.control-movable'), formlist._movable);
    toggleDisplay(this.el.querySelector('.control-deletable'), formlist._deletable);

    newForm.insertInto(this.el);

    return newForm;
}

function toggleDisplay (el, visible) {
    const value = visible ? 'block' : 'none';
    el.style.display = value;
}

function getFormList (comp) {
    return comp.getScopeParentWithClass('MLFormList');
}

function getFormHost(comp) {
    const form = comp.getScopeParentWithClass('MLForm');
    return form && form.getHostObject();
}
