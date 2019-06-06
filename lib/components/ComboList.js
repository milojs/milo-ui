'use strict';
const moment = require('moment');

const { Component, registry, util } = milo;
const { check } = util;
const componentsRegistry = registry.components;
const Match = check.Match;

const COMBO_LIST_CHANGE_MESSAGE = 'mlcombolistchange';

const MLComboList = Component.createComponentClass('MLComboList', {
    dom: {
        cls: 'ml-ui-combo-list'
    },
    data: {
        get: MLComboList_get,
        set: MLComboList_set,
        del: MLComboList_del,
        event: COMBO_LIST_CHANGE_MESSAGE
    },
    events: undefined,
    container: undefined,
    model: {
        messages: {
            '***': { subscriber: onItemsChange, context: 'owner' }
        }
    },
    template: {
        template: `
            <div ml-bind="MLSuperCombo:combo"></div>
            <div ml-bind="MLList:list">
                <div ml-bind="MLListItem:item">
                    <div ml-bind="[container, data]:item" class="form-tooltip">
                        <div class="form-tooltip-anchor">
                            <span ml-bind="[data]:tooltipAnchor" > </span>
                            <span class="form-tooltip-anchor-bottom">◢◣</span>
                        </div>
                        <div class="form-tooltip-content-wrapper">
                            <div class="form-tooltip-content" ml-bind="[data]:tooltip"></div>
                        </div>
                    </div>
                    <div class="list-item">
                        <span ml-bind="[data]:label"></span>
                        <span ml-bind="[events]:deleteBtn" class="glyphicon glyphicon-remove"></span>
                    </div>
                </div>
            </div>
        `
    }
});


componentsRegistry.add(MLComboList);

module.exports = MLComboList;


_.extendProto(MLComboList, {
    init: MLComboList$init,
    setOptions: MLComboList$setOptions,
    setDataValidation: MLComboList$setDataValidation,
    toggleAddButton: MLComboList$toggleAddButton,
    destroy: MLComboList$destroy,
    setAddItemPrompt: MLComboList$setAddItemPrompt,
    clearComboInput: MLComboList$clearComboInput,
    showCreatedByTooltips: MLComboList$showCreatedByTooltips
});


function MLComboList$init() {
    Component.prototype.init.apply(this, arguments);
    this.model.set([]);
    this.once('childrenbound', onChildrenBound);
}

function MLComboList$setDataValidation(dataValidation) {
    check(dataValidation, Match.Optional(Function));
    this._dataValidation = dataValidation;
}

function MLComboList$setOptions(options) {
    const parsedOptions = this._showCreatedByTooltip ? addCreatedByTooltipToModel(options) : options;
    this._combo.setOptions(parsedOptions);
}


function MLComboList$clearComboInput() {
    this._combo.clearComboInput();
}

/**
 * Component instance method
 * Hides add button
 * @param {Boolean} show
 */
function MLComboList$toggleAddButton(show) {
    this._combo.toggleAddButton(show);
}


function MLComboList$setAddItemPrompt(prompt) {
    this._combo.setAddItemPrompt(prompt);
}

function MLComboList$destroy() {
    Component.prototype.destroy.apply(this, arguments);
    if (this._connector) milo.minder.destroyConnector(this._connector);
    this._connector = null;
}

function onChildrenBound() {
    this.template.render().binder();
    componentSetup.call(this);
}

function componentSetup() {
    _.defineProperties(this, {
        '_combo': this.container.scope.combo,
        '_list': this.container.scope.list
    });
    this._connector = milo.minder(this._list.model, '<<<->>>', this.model);
    this._combo.data.on('', { subscriber: onComboChange, context: this });
    this._combo.on('additem', { subscriber: onAddItem, context: this });
}

function onComboChange(msg, data) {
    if (data.newValue && runDataValidation.call(this, msg, data)) {
        this._list.model.push(data.newValue);
    }
    this._combo.data.del();
    // because of supercombo listeners off you have to set _value explicitly
    this._combo.data._value = '';
}

function runDataValidation(msg, data) {
    return this._dataValidation
        ? this._dataValidation(msg, data, this._list.model.get())
        : true;
}

function onItemsChange(msg, data) {
    this.data.dispatchSourceMessage(COMBO_LIST_CHANGE_MESSAGE);
}

function MLComboList_get() {
    const value = this.model.get();
    return (value && typeof value === 'object') ? _.clone(value) : value;
}

function MLComboList_set(value) {
    const parsedValue = this._showCreatedByTooltip && Array.isArray(value) ? addCreatedByTooltipToModel(value) : value;
    this.model.set(parsedValue);
}

function MLComboList_del() {
    return this.model.set([]);
}


function onAddItem(msg, data) {
    this.postMessage('additem', data);
    this.events.postMessage('milo_combolistadditem', data);
}

function MLComboList$showCreatedByTooltips(toShow = false) {
    this._showCreatedByTooltip = toShow;
}

const addCreatedByTooltipToModel = (model) => {
    if (!model || !Array.isArray(model)) return model;
    return model.map(m => {
        if (m.value) {
            const { createdBy, createdDate } = m.value;
            const tooltipDetails = createdBy === null || createdDate === null
                ? 'No author information available'
                : `
                        <div class="created-by">Created by ${createdBy}</div>
                        <div class="created-date">${moment(createdDate).format('LT, D MMMM Y')}</div>
                    `;
            m.item = {
                tooltipAnchor: '<i class="fa fa-user"></i>',
                tooltip: tooltipDetails
            };
        }
        return m;
    });
};
