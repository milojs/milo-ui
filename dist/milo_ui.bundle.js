;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLButton = Component.createComponentClass('MLButton', {
    events: undefined,
    dom: {
        cls: 'ml-ui-button'
    }
});

componentsRegistry.add(MLButton);

module.exports = MLButton;

_.extendProto(MLButton, {
    disable: MLButton$disable,
    isDisabled: MLButton$isDisabled
});

function MLButton$disable(disable) {
    this.el.disabled = disable;
}

function MLButton$isDisabled() {
    return !!this.el.disabled;
}
},{}],2:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components,
    uniqueId = milo.util.uniqueId;

var CHECKED_CHANGE_MESSAGE = 'mlcheckgroupchange',
    ELEMENT_NAME_PROPERTY = '_mlCheckGroupElementID',
    ELEMENT_NAME_PREFIX = 'ml-check-group-';

var MLCheckGroup = Component.createComponentClass('MLCheckGroup', {
    data: {
        set: MLCheckGroup_set,
        get: MLCheckGroup_get,
        del: MLCheckGroup_del,
        splice: undefined,
        event: CHECKED_CHANGE_MESSAGE
    },
    model: {
        messages: {
            '***': { subscriber: onOptionsChange, context: 'owner' }
        }
    },
    events: {
        messages: {
            'click': { subscriber: onGroupClick, context: 'owner' }
        }
    },
    container: undefined,
    dom: {
        cls: 'ml-ui-check-group'
    },
    template: {
        template: '{{~ it.checkOptions :option }} \
                        {{##def.elID:{{= it.elementName }}-{{= option.value }}#}} \
                        <span class="{{= it._renderOptions.optionCssClass || "' + ELEMENT_NAME_PREFIX + 'option" }}"> \
                            <input id="{{# def.elID }}" type="checkbox" value="{{= option.value }}" name="{{= it.elementName }}"> \
                            <label for="{{# def.elID }}">{{= option.label }}</label> \
                        </span> \
                    {{~}} \
                    {{?it._renderOptions.selectAll}} \
                        {{##def.allID:{{= it.elementName }}-all#}} \
                        <span class="' + ELEMENT_NAME_PREFIX + 'all"> \
                            <input id="{{# def.allID }}" type="checkbox" value="all" name="all"> \
                            <label for="{{# def.allID }}">All</label> \
                        </span> \
                    {{?}}'
    }
});

componentsRegistry.add(MLCheckGroup);

module.exports = MLCheckGroup;

_.extendProto(MLCheckGroup, {
    init: MLCheckGroup$init,
    destroy: MLCheckGroup$destroy,
    setSelectAll: MLCheckGroup$setSelectAll
});

/**
 * Component instance method
 * Initialize radio group and setup
 */
function MLCheckGroup$init() {
    _.defineProperty(this, ELEMENT_NAME_PROPERTY, ELEMENT_NAME_PREFIX + uniqueId());
    this._renderOptions = {};
    this._checkEls = {};
    Component.prototype.init.apply(this, arguments);
}

function MLCheckGroup$setSelectAll(selectAll) {
    this._renderOptions.selectAll = selectAll;
}

/**
 * Sets group value
 * Replaces the data set operation to deal with radio buttons
 *
 * @param {Mixed} value The value to be set
 */
function MLCheckGroup_set(valueObj) {
    _.eachKey(this._checkEls, function (el, key) {
        el.checked = !!valueObj[key];
    });
}

/**
 * Gets group value
 * Retrieves the selected value of the group
 *
 * @return {String}
 */
function MLCheckGroup_get() {
    return _.mapKeys(this._checkEls, function (el) {
        return el.checked;
    });
}

/**
 * Deleted group value
 * Deletes the value of the group, setting it to empty
 */
function MLCheckGroup_del() {
    _.eachKey(this._optionEls, function (el) {
        el.checked = false;
    });
    return undefined;
}

/**
 * Manage radio children clicks
 */
function onGroupClick(eventType, event) {
    var clickedElement = event.target;

    if (clickedElement.type !== 'checkbox') return;

    if (clickedElement.name === 'all') {
        _.eachKey(this._checkEls, function (el, key) {
            el.checked = clickedElement.checked;
        });
    } else {
        var isChecked = clickedElement.checked && isAllElementChecked.call(this);
        setAllChecked.call(this, isChecked);
    }

    dispatchChangeMessage.call(this);
}

function setAllChecked(checked) {
    if (this._renderOptions.selectAll) this.el.querySelector('input[name="all"]').checked = checked;
}

function isAllElementChecked(data) {
    return _.everyKey(this._checkEls, function (el) {
        return el.checked;
    });
}

// Post the data change
function dispatchChangeMessage() {
    this.data.dispatchSourceMessage(CHECKED_CHANGE_MESSAGE);
}

// Set radio button children on model change
function onOptionsChange(path, data) {
    this.template.render({
        checkOptions: this.model.get(),
        elementName: this[ELEMENT_NAME_PROPERTY],
        _renderOptions: this._renderOptions
    });

    this._checkEls = {};
    var self = this;
    _.forEach(this.el.querySelectorAll('input[type="checkbox"]'), function (el) {
        if (el.name != 'all') self._checkEls[el.value] = el;
    });
}

function MLCheckGroup$destroy() {
    delete this._checkEls;
    Component.prototype.destroy.apply(this, arguments);
}
},{}],3:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var COMBO_CHANGE_MESSAGE = 'mlcombochange';

var DATALIST_TEMPLATE = '{{~ it.comboOptions :option }} \
                            <option value="{{= option.label }}"></option> \
                         {{~}}';

var MLCombo = Component.createComponentClass('MLCombo', {
    events: undefined,
    data: {
        get: MLCombo_get,
        set: MLCombo_set,
        del: MLCombo_del,
        splice: undefined,
        event: COMBO_CHANGE_MESSAGE
    },
    model: {
        messages: {
            '***': { subscriber: onOptionsChange, context: 'owner' }
        }
    },
    dom: {
        cls: 'ml-ui-datalist'
    },
    container: undefined
});

componentsRegistry.add(MLCombo);

module.exports = MLCombo;

_.extendProto(MLCombo, {
    init: MLCombo$init
});

function MLCombo$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}

function onChildrenBound() {
    _.defineProperties(this, {
        '_comboInput': this.container.scope.input,
        '_comboList': this.container.scope.datalist
    });

    this._comboList.template.set(DATALIST_TEMPLATE);

    this._comboInput.data.on('input', { subscriber: dispatchChangeMessage, context: this });
}

function MLCombo_get() {
    if (!this._comboInput) return;
    return this._comboInput.data.get();
}

function MLCombo_set(value) {
    return changeComboData.call(this, 'set', value);
}

function MLCombo_del() {
    return changeComboData.call(this, 'del');
}

function changeComboData(method, value) {
    if (!this._comboInput) return;
    var result = this._comboInput.data[method](value);
    dispatchChangeMessage.call(this);
    return result;
}

// Post the data change
function dispatchChangeMessage() {
    this.data.dispatchSourceMessage(COMBO_CHANGE_MESSAGE);
}

function onOptionsChange(msg, data) {
    this._comboList.template.render({
        comboOptions: this.model.get()
    });
}
},{}],4:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components,
    check = milo.util.check,
    Match = check.Match;

var COMBO_LIST_CHANGE_MESSAGE = 'mlcombolistchange';

var MLComboList = Component.createComponentClass('MLComboList', {
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
        template: '<div ml-bind="MLSuperCombo:combo"></div>\
                   <div ml-bind="MLList:list">\
                       <div ml-bind="MLListItem:item" class="list-item">\
                           <span ml-bind="[data]:label"></span>\
                           <span ml-bind="[events]:deleteBtn" class="glyphicon glyphicon-remove"></span>\
                       </div>\
                   </div>'
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
    clearComboInput: MLComboList$clearComboInput
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

function MLComboList$setOptions(arr) {
    this._combo.setOptions(arr);
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
    this._connector && milo.minder.destroyConnector(this._connector);
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
    if (data.newValue && runDataValidation.call(this, msg, data)) this._list.model.push(data.newValue);
    this._combo.data.del();
    // because of supercombo listeners off you have to set _value explicitly
    this._combo.data._value = '';
}

function runDataValidation(msg, data) {
    return this._dataValidation ? this._dataValidation(msg, data, this._list.model.get()) : true;
}

function onItemsChange(msg, data) {
    this.data.dispatchSourceMessage(COMBO_LIST_CHANGE_MESSAGE);
}

function MLComboList_get() {
    var value = this.model.get();
    return typeof value == 'object' ? _.clone(value) : value;
}

function MLComboList_set(value) {
    this.model.set(value);
}

function MLComboList_del() {
    return this.model.set([]);
}

function onAddItem(msg, data) {
    this.postMessage('additem', data);
    this.events.postMessage('milo_combolistadditem', data);
}
},{}],5:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLDate = Component.createComponentClass('MLDate', {
    events: undefined,
    data: {
        get: MLDate_get,
        set: MLDate_set,
        del: MLDate_del
    },
    dom: {
        cls: 'ml-ui-date'
    }
});

_.extendProto(MLDate, {
    getMin: MLDate$getMin,
    setMin: MLDate$setMin,
    getMax: MLDate$getMax,
    setMax: MLDate$setMax
});

componentsRegistry.add(MLDate);

module.exports = MLDate;

function MLDate$getMin() {
    return _.date(this.el.min);
}

function MLDate$setMin(value) {
    var date = _.toDate(value);

    this.el.min = date ? toISO8601Format(date) : '';
}

function MLDate$getMax() {
    return _.date(this.el.max);
}

function MLDate$setMax(value) {
    var date = _.toDate(value);

    this.el.max = date ? toISO8601Format(date) : '';
}

function MLDate_get() {
    return _.toDate(this.el.value);
}

function MLDate_set(value) {
    var date = _.toDate(value);

    this.el.value = date ? toISO8601Format(date) : '';

    dispatchInputMessage.call(this);
}

function MLDate_del() {
    this.el.value = '';

    dispatchInputMessage.call(this);
}

function dispatchInputMessage() {
    this.data.dispatchSourceMessage('input'); // Dispatch the 'input' (usually dispatched by the underlying <input> element) event so that the data change can be listened to
}

function toISO8601Format(date) {
    var dateArr = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())];

    var dateStr = dateArr.join('-');

    return dateStr;

    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
}
},{}],6:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLDropTarget = Component.createComponentClass('MLDropTarget', ['drop']);

componentsRegistry.add(MLDropTarget);

module.exports = MLDropTarget;
},{}],7:[function(require,module,exports){
'use strict';

var doT = milo.util.doT,
    componentsRegistry = milo.registry.components,
    Component = milo.Component,
    uniqueId = milo.util.uniqueId;

var TREE_TEMPLATE = '<ul class="ml-ui-foldtree-list">\
                        {{~ it.data.items :item:index }}\
                            {{ var hasSubTree = item.items && item.items.length; }}\
                            <li {{? hasSubTree }}class="ml-ui-foldtree--has-multiple"{{?}}>\
                                <div class="ml-ui-foldtree-item" data-item-id="{{= it.itemIDs[index] }}">\
                                    {{? hasSubTree }}\
                                        <div class="ml-ui-foldtree-button"></div>\
                                    {{?}}\
                                    {{= it.itemTemplate({ item: item }) }}\
                                </div>\
                                {{? hasSubTree }}\
                                    {{= it.treeTemplate(item) }}\
                                {{?}}\
                            </li>\
                        {{~}}\
                    </ul>';

var DEFAULT_COMPILED_ITEM_TEMPLATE = doT.compile('\
            <span class="ml-ui-foldtree-label">\
                {{= it.item.label }}\
            </span>'),
    COMPILED_TREE_TEMPLATE = doT.compile(TREE_TEMPLATE);

var MLFoldTree = Component.createComponentClass('MLFoldTree', {
    container: undefined,
    events: {
        messages: {
            'click dblclick': { subscriber: onItemEvent, context: 'owner' }
        }
    },
    dom: {
        cls: 'ml-ui-foldtree-main'
    }
});

componentsRegistry.add(MLFoldTree);

module.exports = MLFoldTree;

_.extendProto(MLFoldTree, {
    setItemTemplate: MLFoldTree$setItemTemplate,
    renderTree: MLFoldTree$renderTree,
    setActiveItem: MLFoldTree$setActiveItem,
    toggleItem: MLFoldTree$toggleItem
});

function foldUnfold(el, opened) {
    if (opened) el.classList.add('ml-ui-foldtree--unfold', opened);else el.classList.toggle('ml-ui-foldtree--unfold');
}

function itemMessage(msg, el) {
    var id = el.getAttribute('data-item-id'),
        item = this._itemsMap[id];

    this.postMessage('mlfoldtree_' + msg, {
        item: item,
        el: el
    });
}

function onItemEvent(msg, e) {
    var el = e.target;
    if (el.classList.contains('ml-ui-foldtree-button')) foldUnfold(el.parentNode.parentNode);else if (el.classList.contains('ml-ui-foldtree-label')) itemMessage.call(this, msg, el.parentNode);else return;
    e.stopPropagation();
}

function MLFoldTree$setItemTemplate(templateStr) {
    this._itemTemplate = doT.compile(templateStr);
}

function MLFoldTree$renderTree(data) {
    var self = this;
    this._data = data;
    self._itemsMap = {};
    this.el.innerHTML = _renderTree(data);

    function _renderTree(data) {
        if (data.items) var itemsIDs = _.map(data.items, function (item) {
            var id = item.id || uniqueId();
            if (self._itemsMap[id]) throw new Error('MLFoldTree: item has duplicate ID:' + id);
            self._itemsMap[id] = item;
            return id;
        });

        return COMPILED_TREE_TEMPLATE({
            itemIDs: itemsIDs,
            data: data,
            itemTemplate: self._itemTemplate || DEFAULT_COMPILED_ITEM_TEMPLATE,
            treeTemplate: _renderTree
        });
    }
}

function MLFoldTree$setActiveItem(id, cssClass) {
    cssClass = cssClass || 'ml-ui-foldtree-active';
    var items = this.el.querySelectorAll('div.ml-ui-foldtree-item');
    _.forEach(items, function (item) {
        item.classList.remove(cssClass);
    });
    if (id) {
        var item = this.el.querySelector('div.ml-ui-foldtree-item[data-item-id="' + id + '"]');
        item.classList.add(cssClass);
    }
}

function MLFoldTree$toggleItem(id, opened) {
    var item = this.el.querySelector('div.ml-ui-foldtree-item[data-item-id="' + id + '"]');
    foldUnfold(item.parentNode, opened);
}
},{}],8:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLGroup = Component.createComponentClass('MLGroup', {
    container: undefined,
    data: undefined,
    events: undefined,
    dom: {
        cls: 'ml-ui-group'
    }
});

componentsRegistry.add(MLGroup);

module.exports = MLGroup;
},{}],9:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLHyperlink = Component.createComponentClass('MLHyperlink', {
    events: undefined,
    data: undefined,
    dom: {
        cls: 'ml-ui-hyperlink'
    }
});

componentsRegistry.add(MLHyperlink);

module.exports = MLHyperlink;
},{}],10:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var IMAGE_CHANGE_MESSAGE = 'mlimagechange';

var MLImage = Component.createComponentClass('MLImage', {
    data: {
        set: MLImage_set,
        get: MLImage_get,
        del: MLImage_del,
        splice: undefined,
        event: IMAGE_CHANGE_MESSAGE
    },
    model: {
        messages: {
            '.src': { subscriber: onModelChange, context: 'owner' }
        }
    },
    events: undefined,
    container: undefined,
    dom: {
        tagName: 'img',
        cls: 'ml-ui-image'
    }
});

componentsRegistry.add(MLImage);

module.exports = MLImage;

_.extendProto(MLImage, {
    init: MLImage$init
});

/**
 * Component instance method
 * Initialize radio group and setup
 */
function MLImage$init() {
    Component.prototype.init.apply(this, arguments);
}

/**
 * Sets image value
 * Replaces the data set operation to deal with radio buttons
 *
 * @param {Mixed} value The value to be set
 */
function MLImage_set(value) {
    this.model.set(value);
    return value;
}

/**
 * Gets group value
 * Retrieves the selected value of the group
 *
 * @return {String}
 */
function MLImage_get() {
    var value = this.model.get();
    return value && typeof value == 'object' ? _.clone(value) : value;
}

/**
 * Deleted group value
 * Deletes the value of the group, setting it to empty
 */
function MLImage_del() {
    this.model.del();
}

// Post the data change
function dispatchChangeMessage() {
    this.data.dispatchSourceMessage(IMAGE_CHANGE_MESSAGE);
}

function onModelChange(path, data) {
    this.el.src = data.newValue;
    dispatchChangeMessage.call(this);
}
},{}],11:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLInput = Component.createComponentClass('MLInput', {
    data: undefined,
    events: undefined,
    dom: {
        cls: 'ml-ui-input'
    }
});

componentsRegistry.add(MLInput);

module.exports = MLInput;

_.extendProto(MLInput, {
    disable: MLInput$disable,
    isDisabled: MLInput$isDisabled,
    setMaxLength: MLInput$setMaxLength
});

function MLInput$disable(disable) {
    this.el.disabled = disable;
}

function MLInput$isDisabled() {
    return !!this.el.disabled;
}

function MLInput$setMaxLength(length) {
    this.el.setAttribute('maxlength', length);
}
},{}],12:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var INPUT_LIST_CHANGE_MESSAGE = 'mlinputlistchange';

var asyncHandler = function (value, callback) {
    callback(value);
};

var MLInputList = Component.createComponentClass('MLInputList', {
    dom: {
        cls: 'ml-ui-input-list'
    },
    data: {
        get: MLInputList_get,
        set: MLInputList_set,
        del: MLInputList_del,
        splice: MLInputList_splice,
        event: INPUT_LIST_CHANGE_MESSAGE
    },
    events: undefined,
    container: undefined,
    model: {
        messages: {
            '***': { subscriber: onItemsChange, context: 'owner' }
        }
    },
    template: {
        template: '\
            <div ml-bind="MLList:list">\
                <div ml-bind="MLListItem:item" class="list-item">\
                    <span ml-bind="[data]:label"></span>\
                    <span ml-bind="[events]:deleteBtn" class="glyphicon glyphicon-remove"></span>\
                </div>\
            </div>\
            <input type="text" ml-bind="MLInput:input" class="form-control">\
            <button ml-bind="MLButton:button" class="btn btn-default">\
                Add\
            </button>'
    }
});

componentsRegistry.add(MLInputList);

module.exports = MLInputList;

_.extendProto(MLInputList, {
    init: MLInputList$init,
    setAsync: MLInputList$setAsync,
    setPlaceHolder: MLInputList$setPlaceHolder,
    destroy: MLInputList$destroy
});

function MLInputList$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
    this.model.set([]);
}

function onChildrenBound() {
    render.call(this);
}

function MLInputList$setPlaceHolder(placeHolder) {
    this._input.el.setAttribute('placeHolder', placeHolder);
}

function MLInputList$setAsync(newHandler) {
    asyncHandler = newHandler || asyncHandler;
}

function MLInputList$destroy() {
    Component.prototype.destroy.apply(this, arguments);
    this._connector && milo.minder.destroyConnector(this._connector);
    this._connector = null;
}

function render() {
    this.template.render().binder();
    componentSetup.call(this);
}

function componentSetup() {
    _.defineProperties(this, {
        '_input': this.container.scope.input,
        '_button': this.container.scope.button,
        '_list': this.container.scope.list
    });
    this._connector = milo.minder(this._list.model, '<<<->>>', this.model);
    this._button.events.on('click', { subscriber: onClick, context: this });
}

function onClick(msg) {
    var value = this._input.data.get(0);
    if (this._input.data) asyncHandler(value, function (label, value) {
        this._list.model.push({ label: label, value: value });
    }.bind(this));
    this._input.data.del();
}

function onItemsChange(msg, data) {
    this.data.dispatchSourceMessage(INPUT_LIST_CHANGE_MESSAGE);
}

function MLInputList_get() {
    var model = this.model.get();
    return model ? _.clone(model) : undefined;
}

function MLInputList_set(value) {
    this.model.set(value);
}

function MLInputList_del() {
    return this.model.set([]);
}

function MLInputList_splice() {
    // ... arguments
    this.model.splice.apply(this.model, arguments);
}
},{}],13:[function(require,module,exports){
'use strict';

var MLList = module.exports = milo.createComponentClass({
    className: 'MLList',
    facets: {
        dom: {
            cls: 'ml-ui-list'
        },
        data: undefined,
        events: undefined,
        model: undefined,
        list: undefined
    },
    methods: {
        init: MLList$init,
        destroy: MLList$destroy,
        removeItem: MLList$removeItem,
        moveItem: MLList$moveItem
    }
});

function MLList$init() {
    MLList.super.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}

function MLList$destroy() {
    this._connector && milo.minder.destroyConnector(this._connector);
    this._connector = null;
    MLList.super.destroy.apply(this, arguments);
}

function MLList$removeItem(index) {
    this.model.splice(index, 1);
}

function MLList$moveItem(from, to) {
    var splicedData = this.model.splice(from, 1);
    return this.model.splice(to, 0, splicedData[0]);
}

function onChildrenBound() {
    this.model.set([]);
    this._connector = milo.minder(this.model, '<<<-', this.data).deferChangeMode('<<<->>>');
}
},{}],14:[function(require,module,exports){
'use strict';

var DragDrop = milo.util.dragDrop;

var MLListItem = module.exports = milo.createComponentClass({
    className: 'MLListItem',
    superClassName: 'MLListItemSimple',
    facets: {
        drag: {
            messages: {
                'dragstart': { subscriber: onDragStart, context: 'owner' }
            },
            meta: {
                params: 'getMetaData'
            }
        },
        drop: {
            messages: {
                'dragenter': { subscriber: onDragHover, context: 'owner' },
                'dragover': { subscriber: onDragHover, context: 'owner' },
                'dragleave': { subscriber: onDragOut, context: 'owner' },
                'drop': { subscriber: onItemDrop, context: 'owner' }
            },
            allow: {
                components: isComponentAllowed
            }
        }
    },
    methods: {
        init: MLListItem$init,
        moveItem: MLListItem$moveItem,
        removeItem: MLListItem$removeItem,
        getMetaData: MLListItem$getMetaData,
        isDropAllowed: MLListItem$isDropAllowed
    }
});

function MLListItem$init() {
    MLListItem.super.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}

function onChildrenBound() {
    var deleteBtn = this.container.scope.deleteBtn;
    deleteBtn && deleteBtn.events.on('click', { subscriber: this.removeItem, context: this });
}

function MLListItem$removeItem() {
    try {
        var listOwner = this.item.list.owner;
    } catch (e) {}
    listOwner && listOwner.removeItem(this.item.index);
}

function MLListItem$moveItem(index) {
    var listOwner = this.item.list.owner;
    listOwner && listOwner.moveItem(this.item.index, index);
}

function MLListItem$isDropAllowed(meta /*, dragDrop*/) {
    var Component = milo.registry.components.get(meta.compClass);

    return meta.params && _.isNumeric(meta.params.index) && (Component == MLListItem || Component.prototype instanceof MLListItem) && draggingFromSameList.call(this);
}

function draggingFromSameList(comp) {
    comp = comp || DragDrop.service.getCurrentDragSource();
    try {
        var sourceList = comp.item.list;
    } catch (e) {}
    return sourceList == this.item.list;
}

function isComponentAllowed() {
    return this.isDropAllowed.apply(this, arguments);
}

function onItemDrop(eventType, event) {
    onDragOut.call(this);
    var dt = new DragDrop(event);
    var meta = dt.getComponentMeta();
    var state = dt.getComponentState();
    var listOwner = this.item.list.owner;
    var index = meta.params && meta.params.index;
    var dropPosition = DragDrop.getDropPositionY(event, this.el);
    var isBelow = dropPosition == 'below';
    var isAbove = dropPosition == 'above';
    var targetIndex;

    if (draggingFromSameList.call(this)) {
        if (state.compName == this.name) return;
        var stateIndex = state.facetsStates.item.state.index;
        var isMoveDown = stateIndex < this.item.index;
        var isSamePosition;
        if (isMoveDown) {
            isSamePosition = isAbove && stateIndex + 1 == this.item.index;
            if (isSamePosition) return;
            targetIndex = this.item.index - isAbove;
        } else {
            //move up
            isSamePosition = isBelow && stateIndex - 1 == this.item.index;
            if (isSamePosition) return;
            targetIndex = this.item.index + isBelow;
        }
        listOwner.moveItem(+index, targetIndex, state);
    } else {
        targetIndex = this.item.index + isBelow;
        try {
            var data = state.facetsStates.data.state;
        } catch (e) {}
        listOwner.data.splice(targetIndex, 0, data);
    }
}

function onDragStart() /*eventType, event*/{
    DragDrop.service.once('dragdropcompleted', { subscriber: onDragDropCompleted, context: this });
}

function onDragHover() /*eventType, event*/{
    this.dom.addCssClasses('ml-drag-over');
}

function onDragOut() /*eventType, event*/{
    this.dom.removeCssClasses('ml-drag-over');
}

function onDragDropCompleted(msg, data) {
    var dropTarget = data.component;
    var droppedInAnotherList = data.eventType == 'drop' && !draggingFromSameList.call(this, dropTarget);
    if (droppedInAnotherList) this.item.removeItem();
}

function MLListItem$getMetaData() {
    return {
        index: this.item.index
    };
}
},{}],15:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var LISTITEM_CHANGE_MESSAGE = 'mllistitemchange';

var MLListItemSimple = Component.createComponentClass('MLListItemSimple', {
    container: undefined,
    dom: undefined,
    data: {
        get: MLListItemSimple_get,
        set: MLListItemSimple_set,
        del: MLListItemSimple_del,
        event: LISTITEM_CHANGE_MESSAGE
    },
    model: undefined,
    item: undefined
});

componentsRegistry.add(MLListItemSimple);

module.exports = MLListItemSimple;

function MLListItemSimple_get() {
    var value = this.model.get();
    return value !== null && typeof value == 'object' ? _.clone(value) : value;
}

function MLListItemSimple_set(value) {
    if (typeof value == 'object') this.data._set(value);
    this.model.set(value);
    _sendChangeMessage.call(this);
    return value;
}

function MLListItemSimple_del() {
    this.data._del();
    this.model.del();
    _sendChangeMessage.call(this);
}

function _sendChangeMessage() {
    this.data.dispatchSourceMessage(LISTITEM_CHANGE_MESSAGE);
}
},{}],16:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components,
    uniqueId = milo.util.uniqueId;

var RADIO_CHANGE_MESSAGE = 'mlradiogroupchange',
    ELEMENT_NAME_PROPERTY = '_mlRadioGroupElementID',
    ELEMENT_NAME_PREFIX = 'ml-radio-group-';

var MLRadioGroup = Component.createComponentClass('MLRadioGroup', {
    data: {
        set: MLRadioGroup_set,
        get: MLRadioGroup_get,
        del: MLRadioGroup_del,
        splice: undefined,
        event: RADIO_CHANGE_MESSAGE
    },
    model: {
        messages: {
            '***': { subscriber: onOptionsChange, context: 'owner' }
        }
    },
    events: {
        messages: {
            'click': { subscriber: onGroupClick, context: 'owner' }
        }
    },
    container: undefined,
    dom: {
        cls: 'ml-ui-radio-group'
    },
    template: {
        template: '{{~ it.radioOptions :option }} \
                        {{##def.elID:{{= it.elementName }}-{{= option.value }}#}} \
                        <span class="{{= it._renderOptions.optionCssClass || "' + ELEMENT_NAME_PREFIX + 'option" }}"> \
                            <input id="{{# def.elID }}" type="radio" value="{{= option.value }}" name="{{= it.elementName }}"> \
                            <label for="{{# def.elID }}">{{= option.label }}</label> \
                        </span> \
                   {{~}}'
    }
});

componentsRegistry.add(MLRadioGroup);

module.exports = MLRadioGroup;

_.extendProto(MLRadioGroup, {
    init: MLRadioGroup$init,
    destroy: MLRadioGroup$destroy,
    setRenderOptions: MLRadioGroup$setRenderOptions
});

/**
 * Component instance method
 * Initialize radio group and setup
 */
function MLRadioGroup$init() {
    _.defineProperty(this, '_radioList', [], _.CONF);
    _.defineProperty(this, ELEMENT_NAME_PROPERTY, ELEMENT_NAME_PREFIX + uniqueId());
    this._renderOptions = {};
    Component.prototype.init.apply(this, arguments);
}

function MLRadioGroup$setRenderOptions(options) {
    this._renderOptions = options;
}

/**
 * Sets group value
 * Replaces the data set operation to deal with radio buttons
 *
 * @param {Mixed} value The value to be set
 */
function MLRadioGroup_set(value) {
    var options = this._radioList,
        setResult;
    if (options.length) {
        options.forEach(function (radio) {
            radio.checked = radio.value == value;
            if (radio.checked) setResult = value;
        });

        dispatchChangeMessage.call(this);

        return setResult;
    }
}

/**
 * Gets group value
 * Retrieves the selected value of the group
 *
 * @return {String}
 */
function MLRadioGroup_get() {
    var checked = _.find(this._radioList, function (radio) {
        return radio.checked;
    });

    return checked && checked.value || undefined;
}

/**
 * Deleted group value
 * Deletes the value of the group, setting it to empty
 */
function MLRadioGroup_del() {
    var options = this._radioList;
    if (options.length) options.forEach(function (radio) {
        radio.checked = false;
    });

    dispatchChangeMessage.call(this);
    return undefined;
}

/**
 * Manage radio children clicks
 */
function onGroupClick(eventType, event) {
    if (event.target.type == 'radio') dispatchChangeMessage.call(this);
}

// Post the data change
function dispatchChangeMessage() {
    this.data.dispatchSourceMessage(RADIO_CHANGE_MESSAGE);
}

// Set radio button children on model change
function onOptionsChange(path, data) {
    this.template.render({
        radioOptions: this.model.get(),
        elementName: this[ELEMENT_NAME_PROPERTY],
        _renderOptions: this._renderOptions
    });

    var radioEls = this.el.querySelectorAll('input[type="radio"]'),
        options = _.toArray(radioEls);

    this._radioList.length = 0;
    this._radioList.splice.apply(this._radioList, [0, 0].concat(options));
}

function MLRadioGroup$destroy() {
    delete this._radioList;
    Component.prototype.destroy.apply(this, arguments);
}
},{}],17:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var SELECT_CHANGE_MESSAGE = 'mlselectchange';

var MLSelect = Component.createComponentClass('MLSelect', {
    dom: {
        cls: 'ml-ui-select'
    },
    data: {
        set: MLSelect_set,
        get: MLSelect_get,
        del: MLSelect_del,
        splice: undefined,
        event: SELECT_CHANGE_MESSAGE
    },
    events: {
        messages: {
            'change': { subscriber: dispatchChangeMessage, context: 'owner' }
        }
    },
    model: {
        messages: {
            '**': { subscriber: onOptionsChange, context: 'owner' }
        }
    },
    template: {
        template: '{{~ it.selectOptions :option }} \
                        <option value="{{= option.value }}" {{? option.selected }}selected{{?}}>{{= option.label }}</option> \
                   {{~}}'
    }
});

componentsRegistry.add(MLSelect);

module.exports = MLSelect;

_.extendProto(MLSelect, {
    init: MLSelect$init,
    setOptions: MLSelect$setOptions,
    disable: MLSelect$disable
});

function MLSelect$init() {
    Component.prototype.init.apply(this, arguments);
    this._optionEls = {};
    this._isMultiple = this.el.hasAttribute('multiple');
}

function MLSelect$setOptions(options) {
    // Set options temporarily disables model subscriptions (As a workaround for performance issues relating to model updates / template re-rendering)
    var modelChangeListener = { context: this, subscriber: onOptionsChange };

    this.model.off('**', modelChangeListener);
    this.model.set(options);
    this.model.on('**', modelChangeListener);

    onOptionsChange.call(this);
}

function MLSelect$disable(disable) {
    this.el.disabled = disable;
}

function MLSelect_set(strOrObj) {
    if (!this._isMultiple) this.el.value = strOrObj;else {
        var valueObj = {};
        if (strOrObj && typeof strOrObj == 'object') valueObj = strOrObj;else valueObj[strOrObj] = true;
        _.eachKey(this._optionEls, function (el, key) {
            el.selected = !!valueObj[key];
        });
    }
    dispatchChangeMessage.call(this);
}

function MLSelect_get() {
    if (!this._isMultiple) return this.el.value;else {
        return _.mapKeys(this._optionEls, function (el) {
            return el.selected;
        });
    }
}

function MLSelect_del() {
    if (!this._isMultiple) this.el.value = undefined;else {
        _.eachKey(this._optionEls, function (el) {
            el.selected = false;
        });
    }
    dispatchChangeMessage.call(this);
}

function dispatchChangeMessage() {
    this.data.dispatchSourceMessage(SELECT_CHANGE_MESSAGE);
}

function onOptionsChange(path, data) {
    this.template.render({ selectOptions: this.model.get() });
    this._optionEls = {};
    var self = this;
    _.forEach(this.el.querySelectorAll('option'), function (el) {
        self._optionEls[el.value] = el;
    });
    //dispatchChangeMessage.call(this);
}
},{}],18:[function(require,module,exports){
'use strict';

/**
 * MLSuperCombo
 * A combo select list with intelligent scrolling of super large lists.
 */

var Component = milo.Component,
    componentsRegistry = milo.registry.components,
    doT = milo.util.doT,
    logger = milo.util.logger;

var COMBO_OPEN = 'ml-ui-supercombo-open';
var COMBO_CHANGE_MESSAGE = 'mlsupercombochange';

var OPTIONS_TEMPLATE = '{{~ it.comboOptions :option:index }}\
                            <div {{? option.selected}}class="selected" {{?}}data-value="{{= index }}">{{= option.label }}</div>\
                        {{~}}';

var MAX_RENDERED = 100;
var BUFFER = 25;
var DEFAULT_ELEMENT_HEIGHT = 20;

var MLSuperCombo = Component.createComponentClass('MLSuperCombo', {
    events: {
        messages: {
            'mouseleave': { subscriber: onMouseLeave, context: 'owner' },
            'mouseover': { subscriber: onMouseOver, context: 'owner' }
        }
    },
    data: {
        get: MLSuperCombo_get,
        set: MLSuperCombo_set,
        del: MLSuperCombo_del,
        splice: undefined,
        event: COMBO_CHANGE_MESSAGE
    },
    dom: {
        cls: 'ml-ui-supercombo'
    },
    template: {
        template: '<input ml-bind="[data, events]:input" class="form-control ml-ui-input">\
                   <div ml-bind="[dom]:addItemDiv" class="ml-ui-supercombo-add">\
                        <span ml-bind=":addPrompt"></span>\
                        <button ml-bind="[events, dom]:addBtn" class="btn btn-default ml-ui-button">Add</button>\
                   </div>\
                   <div ml-bind="[dom, events]:list" class="ml-ui-supercombo-dropdown">\
                       <div ml-bind="[dom]:before"></div>\
                       <div ml-bind="[template, dom, events]:options" class="ml-ui-supercombo-options"></div>\
                       <div ml-bind="[dom]:after"></div>\
                   </div>'
    },
    container: undefined
});

componentsRegistry.add(MLSuperCombo);

module.exports = MLSuperCombo;

/**
 * Public Api
 */
_.extendProto(MLSuperCombo, {
    init: MLSuperCombo$init,
    showOptions: MLSuperCombo$showOptions,
    hideOptions: MLSuperCombo$hideOptions,
    toggleOptions: MLSuperCombo$toggleOptions,
    setOptions: MLSuperCombo$setOptions,
    initOptionsURL: MLSuperCombo$initOptionsURL,
    setFilteredOptions: MLSuperCombo$setFilteredOptions,
    update: MLSuperCombo$update,
    toggleAddButton: MLSuperCombo$toggleAddButton,
    setAddItemPrompt: MLSuperCombo$setAddItemPrompt,
    setPlaceholder: MLSuperCombo$setPlaceholder,
    setFilter: MLSuperCombo$setFilter,
    clearComboInput: MLSuperCombo_del
});

/**
 * Component instance method
 * Initialise the component, wait for childrenbound, setup empty options arrays.
 */
function MLSuperCombo$init() {
    Component.prototype.init.apply(this, arguments);

    this.once('childrenbound', onChildrenBound);

    _.defineProperties(this, {
        _optionsData: [],
        _filteredOptionsData: [],
        _filterFunc: defaultFilter
    }, _.WRIT);
}

/**
 * Handler for init childrenbound listener. Renders template.
 */
function onChildrenBound() {
    this.template.render().binder();
    componentSetup.call(this);
}

/**
 * Define instance properties, get subcomponents, call setup sub-tasks
 */
function componentSetup() {
    var scope = this.container.scope;

    _.defineProperties(this, {
        _comboInput: scope.input,
        _comboList: scope.list,
        _comboOptions: scope.options,
        _comboBefore: scope.before,
        _comboAfter: scope.after,
        _comboAddItemDiv: scope.addItemDiv,
        _comboAddPrompt: scope.addPrompt,
        _comboAddBtn: scope.addBtn,
        _optionTemplate: doT.compile(OPTIONS_TEMPLATE)
    });

    _.defineProperties(this, {
        _startIndex: 0,
        _endIndex: MAX_RENDERED,
        _hidden: false,
        _elementHeight: DEFAULT_ELEMENT_HEIGHT,
        _total: 0,
        _optionsHeight: 200,
        _lastScrollPos: 0,
        _currentValue: null,
        _selected: null,
        _isAddButtonShown: false
    }, _.WRIT);

    // Component Setup
    this.dom.setStyles({ position: 'relative' });
    setupComboList(this._comboList, this._comboOptions, this);
    setupComboInput(this._comboInput, this);
    setupComboBtn(this._comboAddBtn, this);

    this.events.on('keydown', { subscriber: changeSelected, context: this });
    //this.events.on('mouseleave', { subscriber: MLSuperCombo$hideOptions, context: this });
}

/**
 * Component instance method
 * Shows or hides option list.
 *
 * @param {Boolean} show true to show, false to hide
 */
function MLSuperCombo$toggleOptions(show) {
    this._hidden = !show;
    this._comboList.dom.toggle(show);
}

/**
 * Component instance method
 * Shows options list
 */
function MLSuperCombo$showOptions() {
    // Position the list to maximise the amount of visible content
    var bounds = this.el.getBoundingClientRect();
    var pageHeight = Math.max(this.el.ownerDocument.documentElement.clientHeight, window.innerHeight || 0);
    var listTopStyle = ''; // Positions options underneath the combobox (Default behaviour)
    var bottomOverlap = bounds.bottom + this._optionsHeight - pageHeight;

    if (bottomOverlap > 0) {
        var topOverlap = this._optionsHeight - bounds.top;

        if (topOverlap < bottomOverlap) {
            listTopStyle = -this._optionsHeight + 'px'; // Position options above the combobox
        }
    }

    this._comboList.dom.setStyles({ top: listTopStyle });
    this._hidden = false;
    this.el.classList.add(COMBO_OPEN);
    this._comboList.dom.toggle(true);
}

/**
 * Component instance method
 * Hides options list
 */
function MLSuperCombo$hideOptions() {
    this._hidden = true;
    this.el.classList.remove(COMBO_OPEN);
    this._comboList.dom.toggle(false);
}

/**
 * Component instance method
 * Hides add button
 */
function MLSuperCombo$toggleAddButton(show, options) {
    this._comboAddItemDiv.dom.toggle(show);
    if (options && options.preserveState) this.__showAddOnClick = this._isAddButtonShown;
    this._isAddButtonShown = show;
}

function MLSuperCombo$setAddItemPrompt(prompt) {
    this._addItemPrompt = prompt;
    this._comboAddPrompt.el.innerHTML = prompt;
    this.toggleAddButton(false);
}

function MLSuperCombo$setPlaceholder(placeholder) {
    this._comboInput.el.placeholder = placeholder;
}

/**
 * Set the filter function used in the text field
 * @param {Function} func A function with the arguments `[text, option]` which will interate 
 * through all `options`, testing each against the entered `text`. WARNING: Setting a function 
 * could interfere with logic use to determing if an item is unique for the add item button.
 */
function MLSuperCombo$setFilter(func) {
    this._filterFunc = func;
}

/**
 * Component instance method
 * Sets the options of the dropdown
 *
 * @param {Array[Object]} arr the options to set with label and value pairs. Value can be an object.
 */
function MLSuperCombo$setOptions(arr) {
    this._optionsData = arr;
    this.setFilteredOptions(arr);

    setSelected.call(this, arr[0]);
}

/**
 * Component instance method
 * Initialise the remote options of the dropdown
 *
 * @param {Object} options the options to initialise.
 */
function MLSuperCombo$initOptionsURL(options) {
    this._optionsURL = options.url;
    this._formatOptionsURL = options.formatOptions || function (e) {
        return e;
    };
}

/**
 * Private method
 * Sets the options of the dropdown based on a request
 */
function _getOptionsURL(cb) {
    var url = this._optionsURL,
        queryString = this._comboInput.data.get();

    cb = cb || _.noop;
    milo.util.request.post(url, { name: queryString }, function (err, response) {
        if (err) {
            logger.error('Can not search for "' + queryString + '"');
            return cb(new Error('Request error'));
        }

        var responseData = _.jsonParse(response);
        if (responseData) cb(null, responseData);else cb(new Error('Data error'));
    });
}

/**
 * Component instance method
 * Sets the filtered options, which is a subset of normal options
 *
 * @param {[type]} arr The options to set
 */
function MLSuperCombo$setFilteredOptions(arr) {
    if (!arr) return logger.error('setFilteredOptions: parameter is undefined');
    this._filteredOptionsData = arr;
    this._total = arr.length;
    this.update();
}

/**
 * Component instance method
 * Updates the list. This is used on scroll, and makes use of the filteredOptions to
 * intelligently show a subset of the filtered list at a time.
 */
function MLSuperCombo$update() {
    var wasHidden = this._hidden;

    var arrToShow = this._filteredOptionsData.slice(this._startIndex, this._endIndex);

    this._comboOptions.template.render({
        comboOptions: arrToShow
    });

    this._elementHeight = this._elementHeight || DEFAULT_ELEMENT_HEIGHT;

    if (wasHidden) this.hideOptions();

    var beforeHeight = this._startIndex * this._elementHeight;
    var afterHeight = (this._total - this._endIndex) * this._elementHeight;
    this._comboBefore.el.style.height = beforeHeight + 'px';
    this._comboAfter.el.style.height = afterHeight > 0 ? afterHeight + 'px' : '0px';
}

/**
 * Setup the combo list
 *
 * @param  {Component} list
 * @param  {Array} options
 * @param  {Component} self
 */
function setupComboList(list, options, self) {
    self.toggleAddButton(false);
    options.template.set(OPTIONS_TEMPLATE);

    list.dom.setStyles({
        overflow: 'scroll',
        height: self._optionsHeight + 'px',
        width: '100%',
        position: 'absolute',
        zIndex: 10
        // top: yPos + 'px',
        // left: xPos + 'px',
    });

    self.hideOptions();
    list.events.onMessages({
        'click': { subscriber: onListClick, context: self },
        'scroll': { subscriber: onListScroll, context: self }
    });
}

/**
 * Setup the input component
 *
 * @param  {Component} input
 * @param  {Component} self
 */
function setupComboInput(input, self) {
    input.events.once('focus', function () {
        input.data.on('', { subscriber: onDataChange, context: self });
        input.events.on('click', { subscriber: onInputClick, context: self });
        input.events.on('keydown', { subscriber: onEnterKey, context: self });
    });
}

/**
 * Setup the button
 * @param  {Component} btn
 * @param  {Component} self
 */
function setupComboBtn(btn, self) {
    btn.events.on('click', { subscriber: onAddBtn, context: self });
}

/**
 * Custom data facet get method
 */
function MLSuperCombo_get() {
    return this._currentValue;
}

/**
 * Custom data facet set method
 * @param {Variable} obj
 */
function MLSuperCombo_set(obj) {
    this._currentValue = obj;
    this._comboInput.data.set(obj && obj.label);
    this.data.dispatchSourceMessage(COMBO_CHANGE_MESSAGE);

    var self = this;

    _.defer(function () {
        self.hideOptions();
        self.setFilteredOptions(self._optionsData);
        self.update();
    });
}

/**
 * Custom data facet del method
 */
function MLSuperCombo_del() {
    this._currentValue = null;
    this._comboInput.data.set('');
    this.data.dispatchSourceMessage(COMBO_CHANGE_MESSAGE);
}

/**
 * Input data change handler
 * When the input data changes, this method filters the optionsData, and sets the first element
 * to be selected.
 * @param  {String} msg
 * @param  {Objext} data
 */
function onDataChange(msg, data) {
    var text = data.newValue && data.newValue.trim();
    if (this._optionsURL) {
        var self = this;
        _getOptionsURL.call(this, function (err, responseData) {
            if (err || !responseData) return;
            try {
                var options = responseData.data.map(self._formatOptionsURL);
                self.setOptions(options);
                _updateOptionsAndAddButton.call(self, text, self._optionsData);
            } catch (e) {
                logger.error('Data error', e);
            }
        });
    } else {
        var filteredData = _filterData.call(this, text);
        _updateOptionsAndAddButton.call(this, text, filteredData);
    }
}

function _filterData(text) {
    return this._optionsData.filter(_.partial(this._filterFunc, text));
}

function defaultFilter(text, option) {
    if (!option.label) return false;
    var label = option.label.toLowerCase();
    return label.trim().toLowerCase().indexOf(text.toLowerCase()) == 0;
}

function _updateOptionsAndAddButton(text, filteredArr) {
    if (!text) {
        this.toggleAddButton(false, { preserveState: true });
        setSelected.call(this, filteredArr[0]);
    } else {
        if (filteredArr.length && _.find(filteredArr, isExactMatch)) {
            this.toggleAddButton(false, { preserveState: true });
        } else if (this._addItemPrompt) {
            this.toggleAddButton(this._optionsData.length > 1 || this._optionsURL);
        }

        if (filteredArr.length) {
            this.showOptions();
            setSelected.call(this, filteredArr[0]);
        } else {
            this.hideOptions();
        }
    }

    this.setFilteredOptions(filteredArr);
    this._comboList.el.scrollTop = 0;

    function isExactMatch(item) {
        return item.label.toLowerCase() === text.toLowerCase();
    }
}

/**
 * A map of keyCodes to directions
 * @type {Object}
 */
var directionMap = { '40': 1, '38': -1 };

/**
 * List keydown handler
 * Changes the selected list item by finding the adjacent item and setting it to selected.
 *
 * @param  {string} type
 * @param  {Event} event
 */
function changeSelected(type, event) {
    //TODO test mocha
    var direction = directionMap[event.keyCode];

    if (direction) _changeSelected.call(this, direction);
}

function _changeSelected(direction) {
    // TODO: refactor and tidy up, looks like some code duplication.
    var selected = this.el.querySelector('.selected');
    var newSelection = this._filteredOptionsData[0]; // Default if no selectedEl
    var scrollPos = this._comboList.el.scrollTop;
    var selectedPos = selected ? selected.offsetTop : 0;
    var relativePos = selectedPos - scrollPos;

    if (selected) {
        var index = _getDataValueFromElement.call(this, selected);
        newSelection = this._filteredOptionsData[index + direction];
    }

    setSelected.call(this, newSelection);
    this.update();

    if (relativePos > this._optionsHeight - this._elementHeight * 2 && direction === 1) this._comboList.el.scrollTop += this._elementHeight * direction * 5;

    if (relativePos < this._elementHeight && direction === -1) this._comboList.el.scrollTop += this._elementHeight * direction * 5;
}

/**
 * Mouse over handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onMouseOver(type, event) {
    this._mouseIsOver = true;
}

/**
 * Mouse leave handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onMouseLeave(type, event) {
    var self = this;
    this._mouseIsOver = false;
    if (this._mouseOutTimer) clearInterval(this._mouseOutTimer);
    this._mouseOutTimer = setTimeout(function () {
        if (!self._mouseIsOver) _onMouseLeave.call(self);
    }, 750);
}

function _onMouseLeave() {
    this.hideOptions();
    this.toggleAddButton(false, { preserveState: true });
}

/**
 * Input click handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onInputClick(type, event) {
    this.showOptions();
    this._comboInput.el.setSelectionRange(0, this._comboInput.el.value.length);
    if (this.__showAddOnClick) this.toggleAddButton(true);
}

/**
 * Enter key handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onEnterKey(type, event) {
    if (event.keyCode == 13) {
        if (this._selected) _setData.call(this);
    }
}

/**
 * Add button handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onAddBtn(type, event) {
    var data = { label: this._comboInput.el.value };
    this.postMessage('additem', data);
    this.events.postMessage('milo_supercomboadditem', data);
    this.toggleAddButton(false, { preserveState: true });
}

/**
 * List click handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onListClick(type, event) {
    var index = _getDataValueFromElement.call(this, event.target);
    var data = this._filteredOptionsData[index];

    setSelected.call(this, data);
    _setData.call(this);
    this.update();
}

/**
 * List scroll handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onListScroll(type, event) {
    var scrollPos = event.target.scrollTop,
        direction = scrollPos > this._lastScrollPos ? 'down' : 'up',
        firstChild = this._comboOptions.el.lastElementChild,
        lastChild = this._comboOptions.el.firstElementChild,
        lastElPosition = firstChild ? firstChild.offsetTop : 0,
        firstElPosition = lastChild ? lastChild.offsetTop : 0,
        distFromLastEl = lastElPosition - scrollPos - this._optionsHeight + this._elementHeight,
        distFromFirstEl = scrollPos - firstElPosition,
        elsFromStart = Math.floor(distFromFirstEl / this._elementHeight),
        elsToTheEnd = Math.floor(distFromLastEl / this._elementHeight),
        totalElementsBefore = Math.floor(scrollPos / this._elementHeight) - BUFFER;

    if (direction == 'down' && elsToTheEnd < BUFFER || direction == 'up' && elsFromStart < BUFFER) {
        this._startIndex = totalElementsBefore > 0 ? totalElementsBefore : 0;
        this._endIndex = totalElementsBefore + MAX_RENDERED;
        this._elementHeight = firstChild.style.height;
        this.update();
    }
    this._lastScrollPos = scrollPos;
}

/**
 * Private method
 * Retrieves the data-value attribute value from the element and returns it as an index of
 * the filteredOptions
 *
 * @param  {Element} el
 * @return {Number}
 */
function _getDataValueFromElement(el) {
    return Number(el.getAttribute('data-value')) + this._startIndex;
}

/**
 * Private method
 * Sets the data of the SuperCombo, taking care to reset some things and temporarily
 * unsubscribe data listeners.
 */
function _setData() {
    this.hideOptions();
    this.toggleAddButton(false);
    this._comboInput.data.off('', { subscriber: onDataChange, context: this });
    //supercombo listeners off
    this.data.set(this._selected);
    this._comboInput.data.on('', { subscriber: onDataChange, context: this });
    //supercombo listeners on
}

function setSelected(value) {
    if (this._selected) delete this._selected.selected;

    if (value) {
        this._selected = value;
        this._selected.selected = true;
    }
}
},{}],19:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLText = Component.createComponentClass('MLText', {
    data: undefined,
    events: undefined,
    dom: {
        cls: 'ml-ui-text'
    }
});

componentsRegistry.add(MLText);

module.exports = MLText;
},{}],20:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components,
    logger = milo.util.logger;

var MLTextarea = Component.createComponentClass('MLTextarea', {
    data: undefined,
    events: undefined,
    dom: {
        cls: 'ml-ui-textarea'
    }
});

componentsRegistry.add(MLTextarea);

module.exports = MLTextarea;

_.extendProto(MLTextarea, {
    startAutoresize: MLTextarea$startAutoresize,
    stopAutoresize: MLTextarea$stopAutoresize,
    isAutoresized: MLTextarea$isAutoresized,
    disable: MLTextarea$disable
});

function MLTextarea$startAutoresize(options) {
    if (this._autoresize) return logger.warn('MLTextarea startAutoresize: autoresize is already on');
    this._autoresize = true;
    this._autoresizeOptions = options;

    _adjustAreaHeight.call(this);
    _manageSubscriptions.call(this, 'on');
}

function _manageSubscriptions(onOff) {
    this.events[onOff]('click', { subscriber: _adjustAreaHeight, context: this });
    this.data[onOff]('', { subscriber: _adjustAreaHeight, context: this });
}

function _adjustAreaHeight() {
    this.el.style.height = 0;

    var newHeight = this.el.scrollHeight,
        minHeight = this._autoresizeOptions.minHeight,
        maxHeight = this._autoresizeOptions.maxHeight;

    newHeight = newHeight >= maxHeight ? maxHeight : newHeight <= minHeight ? minHeight : newHeight;

    this.el.style.height = newHeight + 'px';
}

function MLTextarea$stopAutoresize() {
    if (!this._autoresize) return logger.warn('MLTextarea stopAutoresize: autoresize is not on');
    this._autoresize = false;
    _manageSubscriptions.call(this, 'off');
}

function MLTextarea$isAutoresized() {
    return this._autoresize;
}

function MLTextarea$disable(disable) {
    this.el.disabled = disable;
}
},{}],21:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLTime = Component.createComponentClass('MLTime', {
    events: undefined,
    data: {
        get: MLTime_get,
        set: MLTime_set,
        del: MLTime_del
    },
    dom: {
        cls: 'ml-ui-time'
    }
});

componentsRegistry.add(MLTime);

module.exports = MLTime;

var TIME_REGEX = /^([0-9]{1,2})(?:\:|\.)([0-9]{1,2})$/,
    TIME_TEMPLATE = 'hh:mm';

function MLTime_get() {
    var timeStr = this.el.value;
    var match = timeStr.match(TIME_REGEX);
    if (!match) return;
    var hours = match[1],
        mins = match[2];
    if (hours > 23 || mins > 59) return;
    var time = new Date(1970, 0, 1, hours, mins);

    return _.toDate(time);
}

function MLTime_set(value) {
    var time = _.toDate(value);
    if (!time) {
        this.el.value = '';
        return;
    }

    var timeStr = TIME_TEMPLATE.replace('hh', pad(time.getHours())).replace('mm', pad(time.getMinutes()));

    this.el.value = timeStr;
    return timeStr;

    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
}

function MLTime_del() {
    this.el.value = '';
}
},{}],22:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components;

var MLWrapper = Component.createComponentClass('MLWrapper', {
    container: undefined,
    data: undefined,
    events: undefined,
    dom: {
        cls: 'ml-ui-wrapper'
    }
});

componentsRegistry.add(MLWrapper);

module.exports = MLWrapper;
},{}],23:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components,
    check = milo.util.check,
    Match = check.Match;

var ALERT_CSS_CLASSES = {
    success: 'alert-success',
    warning: 'alert-warning',
    info: 'alert-info',
    danger: 'alert-danger',
    fixed: 'alert-fixed'
};

var MLAlert = Component.createComponentClass('MLAlert', {
    container: undefined,
    events: undefined,
    dom: {
        cls: ['ml-bs-alert', 'alert', 'fade'],
        attributes: {
            'role': 'alert',
            'aria-hidden': 'true'
        }
    },
    template: {
        template: '\
            {{? it.close }}\
                <button ml-bind="[events]:closeBtn" type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>\
            {{?}}\
            {{= it.message}}'
    }
});

componentsRegistry.add(MLAlert);

module.exports = MLAlert;

_.extend(MLAlert, {
    createAlert: MLAlert$$createAlert,
    openAlert: MLAlert$$openAlert
});

_.extendProto(MLAlert, {
    openAlert: MLAlert$openAlert,
    closeAlert: MLAlert$closeAlert
});

/**
 * Creates and returns a new alert instance. To create and open at the same time use [openAlert](#MLAlert$$openAlert)
 * `options` is an object with the following properties:
 *
 *      message: string alert message
 *      type:    optional string the type of alert message, one of success, warning, info, danger, fixed
 *               default 'info'
 *      close:   optional false to prevent user from closing
 *               or true (default) to enable closing and render a close button
 *      timeout: optional timer, in milliseconds to automatically close the alert
 *
 * @param {Object} options alert configuration
 */
function MLAlert$$createAlert(options) {
    check(options, {
        message: String,
        type: Match.Optional(String),
        close: Match.Optional(Boolean),
        timeout: Match.Optional(Number)
    });

    var alert = MLAlert.createOnElement();

    options = _prepareOptions(options);

    var alertCls = ALERT_CSS_CLASSES[options.type];
    alert.dom.addCssClasses(alertCls);

    alert._alert = {
        options: options,
        visible: false
    };

    alert.template.render(options).binder();

    var alertScope = alert.container.scope;

    if (options.close) alertScope.closeBtn.events.on('click', { subscriber: _onCloseBtnClick, context: alert });

    if (options.timeout) setTimeout(function () {
        if (alert._alert.visible) alert.closeAlert();
    }, options.timeout);

    return alert;
}

/**
 * Create and show alert popup
 *
 * @param {Object} options object with message, type, close and timeout
 * @return {MLAlert} the alert instance
 */
function MLAlert$$openAlert(options) {
    var alert = MLAlert.createAlert(options);
    alert.openAlert();
    return alert;
}

function _onCloseBtnClick(type, event) {
    this.closeAlert();
}

function _prepareOptions(options) {
    options = _.clone(options);
    options.close = typeof options.close == 'undefined' || options.close === true;
    options.timeout = Math.floor(options.timeout);
    options.type = options.type || 'info';

    return options;
}

/**
 * Open the alert
 */
function MLAlert$openAlert() {
    _toggleAlert.call(this, true);
}

/**
 * Close the alert
 */
function MLAlert$closeAlert() {
    _toggleAlert.call(this, false);
    this.destroy();
}

function _toggleAlert(doShow) {
    doShow = typeof doShow == 'undefined' ? !this._alert.visible : !!doShow;

    var addRemove = doShow ? 'add' : 'remove',
        appendRemove = doShow ? 'appendChild' : 'removeChild';

    this._alert.visible = doShow;

    document.body[appendRemove](this.el);
    this.dom.toggle(doShow);
    this.el.setAttribute('aria-hidden', !doShow);
    this.el.classList[addRemove]('in');
    this.el[doShow ? 'focus' : 'blur']();
}
},{}],24:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components,
    componentName = milo.util.componentName,
    logger = milo.util.logger,
    check = milo.util.check,
    Match = check.Match;

var DEFAULT_BUTTONS = [{ type: 'default', label: 'OK', result: 'OK' }];

var CLOSE_OPTIONS = ['backdrop', 'keyboard', 'button'];

/* TODO - use in template
var BUTTON_CSS_CLASSES = {
    default: 'btn-default',
    primary: 'btn-primary',
    success: 'btn-success',
    info: 'btn-info',
    warning: 'btn-warning',
    danger: 'btn-danger',
    link: 'btn-link'
};
*/

/**
 * Dialog class to show custom dialog boxes based on configuration - see [createDialog](#MLDialog$$createDialog) method.
 * Only one dialog can be opened at a time - trying to open another will log error to console. Currently opened dialog can be retrieved using [getCurrentDialog](#MLDialog$$getCurrentDialog) class method.
 */
var MLDialog = Component.createComponentClass('MLDialog', {
    container: undefined,
    events: undefined,
    dom: {
        cls: ['ml-bs-dialog', 'modal', 'fade'],
        attributes: {
            'role': 'dialog',
            'aria-hidden': 'true'
        }
    },
    template: {
        template: '\
            <div class="modal-dialog {{= it.cssClass }}">\
                <div class="modal-content">\
                    {{? it.title }}\
                        <div class="modal-header">\
                            {{? it.close.button }}\
                                <button ml-bind="[events]:closeBtn" type="button" class="close">&times;</button>\
                            {{?}}\
                            <h4 class="modal-title">{{= it.title }}</h4>\
                        </div>\
                    {{?}}\
                    {{? it.html || it.text }}\
                        <div class="modal-body" ml-bind="[container]:dialogBody">\
                            {{? it.html }}\
                                {{= it.html }}\
                            {{??}}\
                                <p>{{= it.text }}</p>\
                            {{?}}\
                        </div>\
                    {{?}}\
                    {{? it.buttons && it.buttons.length }}\
                        <div class="modal-footer">\
                            {{~ it.buttons :btn }}\
                                <button type="button"\
                                    class="btn btn-{{= btn.type }}{{? btn.cls }} {{= btn.cls }}{{?}}"\
                                    ml-bind="[events]:{{= btn.name }}">{{= btn.label }}</button>\
                            {{~}}\
                        </div>\
                    {{?}}\
                </div>\
            </div>'
    }
});

componentsRegistry.add(MLDialog);

module.exports = MLDialog;

_.extend(MLDialog, {
    createDialog: MLDialog$$createDialog,
    openDialog: MLDialog$$openDialog,
    getOpenedDialog: MLDialog$$getOpenedDialog
});

_.extendProto(MLDialog, {
    openDialog: MLDialog$openDialog,
    closeDialog: MLDialog$closeDialog,
    destroy: MLDialog$destroy
});

/**
 * Creates and returns dialog instance. To create and open at the same time [openDialog](#MLDialog$$openDialog)
 * `options` is an object with the following properties:
 *
 *     title: optional dialog title
 *     html: optional dialog text as html (will take precedence over text if both text nd html are passed)
 *       or
 *     text: optional dialog text
 *     close: optional false to prevent backdrop and esc key from closing the dialog and removing close button in top right corner
 *            or true (default) to enable all close options
 *            or object with properties
 *         backdrop: false or true (default), close dialog when backdrop clicked
 *         keyboard: false or true (default), close dialog when esc key is pressed
 *         button: false or true (default), show close button in the header (won't be shown if there is no header when title is not passed)
 *     buttons: optional array of buttons configurations, where each button config is an object
 *         name:   optional name of component, should be unique and should not be `closeBtn`, if not passed a timestamp based name will be used
 *         type:   button type, will determine button CSS style. Possible types are: defult, primary, success, info, warning, danger, link (map to related bootstrap button styles)
 *         label:  button label
 *         close:  optional false to prevent this button from closing dialog
 *         result: string with dialog close result that will be passed to dialog subscriber as the first parameter
 *         data:   any value/object or function to create data that will be passed to dialog subscriber as the second parameter.
 *                 If function is passed it will be called with dialog as context and button options as parameter.
 *
 *     If `title` is not passed, dialog will not have title section
 *     If neither `text` nor `html` is passed, dialog will not have body section.
 *     If `buttons` are not passed, there will only be OK button.
 *
 * When dialog is closed, the subscriber is called with reault and optional data as defined in buttons configurations.
 * If backdrop is clicked or ESC key is pressed the result will be 'dismissed'
 * If close button in the top right corner is clicked, the result will be 'closed' (default result)
 *
 * @param {Object} options dialog configuration
 * @param {Function} initialize function that is called to initialize the dialog
 */
function MLDialog$$createDialog(options, initialize) {
    check(options, {
        title: Match.Optional(String),
        html: Match.Optional(String),
        text: Match.Optional(String),
        close: Match.Optional(Match.OneOf(Boolean, {
            backdrop: Match.Optional(Boolean),
            keyboard: Match.Optional(Boolean),
            button: Match.Optional(Boolean)
        })),
        buttons: Match.Optional([{
            name: Match.Optional(String),
            type: String,
            label: String,
            close: Match.Optional(Boolean),
            result: Match.Optional(String),
            data: Match.Optional(Match.Any),
            cls: Match.Optional(String)
        }]),
        cssClass: Match.Optional(String)
    });

    var dialog = MLDialog.createOnElement();

    options = _prepareOptions(options);
    dialog._dialog = {
        options: options,
        visible: false
    };

    dialog.template.render(options).binder();

    var dialogScope = dialog.container.scope;

    if (options.close.backdrop) dialog.events.on('click', { subscriber: _onBackdropClick, context: dialog });

    if (options.title && options.close.button) dialogScope.closeBtn.events.on('click', { subscriber: _onCloseBtnClick, context: dialog });

    options.buttons.forEach(function (btn) {
        var buttonSubscriber = {
            subscriber: _.partial(_dialogButtonClick, btn),
            context: dialog
        };
        dialogScope[btn.name].events.on('click', buttonSubscriber);
    });

    if (initialize) initialize(dialog);
    return dialog;
}

function _dialogButtonClick(button) {
    if (button.close !== false) _toggleDialog.call(this, false);

    var data = _.result(button.data, this, button);
    _dispatchResult.call(this, button.result, data);
}

function _dispatchResult(result, data) {
    var subscriber = this._dialog.subscriber;
    if (typeof subscriber == 'function') subscriber.call(this, result, data);else subscriber.subscriber.call(subscriber.context, result, data);
}

function _onBackdropClick(eventType, event) {
    if (event.target == this.el) this.closeDialog('dismissed');
}

function _onCloseBtnClick() {
    this.closeDialog('closed');
}

function _onKeyDown(event) {
    if (openedDialog && openedDialog._dialog.options.close.keyboard && event.keyCode == 27) // esc key
        openedDialog.closeDialog('dismissed');
}

function _prepareOptions(options) {
    options = _.clone(options);
    options.buttons = _.clone(options.buttons || DEFAULT_BUTTONS);
    options.buttons.forEach(function (btn) {
        btn.name = btn.name || componentName();
    });

    options.close = typeof options.close == 'undefined' || options.close === true ? _.object(CLOSE_OPTIONS, true) : typeof options.close == 'object' ? _.mapToObject(CLOSE_OPTIONS, function (opt) {
        return options.close[opt] !== false;
    }) : _.object(CLOSE_OPTIONS, false);

    return options;
}

/**
 * Create and show dialog popup
 *
 * @param {Object} options object with title, text and buttons. See [createDialog](#MLDialog$$createDialog) for more information.
 * @param {Function|Object} subscriber optional subscriber function or object that is passed result and optional data. Unless context is defined, dialog will be the context.
 */
function MLDialog$$openDialog(options, subscriber, initialize) {
    var dialog = MLDialog.createDialog(options, initialize);
    dialog.openDialog(subscriber);
    return dialog;
}

function _toggleDialog(doShow) {
    doShow = typeof doShow == 'undefined' ? !this._dialog.visible : !!doShow;

    var addRemove = doShow ? 'add' : 'remove',
        appendRemove = doShow ? 'appendChild' : 'removeChild';

    this._dialog.visible = doShow;

    if (doShow && !dialogsInitialized) _initializeDialogs();

    document.body[appendRemove](this.el);
    if (backdropEl) document.body[appendRemove](backdropEl);
    this.dom.toggle(doShow);
    this.el.setAttribute('aria-hidden', !doShow);
    document.body.classList[addRemove]('modal-open');
    this.el.classList[addRemove]('in');

    openedDialog = doShow ? this : undefined;
    this.el[doShow ? 'focus' : 'blur']();
}

var dialogsInitialized, backdropEl;

function _initializeDialogs() {
    backdropEl = document.createElement('div');
    backdropEl.className = 'modal-backdrop fade in';
    document.addEventListener('keydown', _onKeyDown);
    dialogsInitialized = true;
}

var openedDialog;

/**
 * Opens dialog instance.
 * Subscriber object should have the same format as the subscriber for the Messenger (although Messenger is not used) - either function or object with subscriber and context properties.
 *
 * @param {Function|Object} subscriber subscriber object
 */
function MLDialog$openDialog(subscriber) {
    check(subscriber, Match.OneOf(Function, { subscriber: Function, context: Match.Any }));

    if (openedDialog) return logger.warn('MLDialog openDialog: can\'t open dialog, another dialog is already open');

    this._dialog.subscriber = subscriber;
    _toggleDialog.call(this, true);
}

/**
 * Closes dialog instance, optionally passing result and data to dialog subscriber.
 * If no result is passed, 'closed' will be passed to subscriber.
 *
 * @param {String} result dialog result, passed as the first parameter to subcsriber
 * @param {Any} data optional dialog data, passed as the second parameter to subscriber
 */
function MLDialog$closeDialog(result, data) {
    if (!openedDialog) return logger.warn('MLDialog closeDialog: can\'t close dialog, no dialog open');

    result = result || 'closed';

    _toggleDialog.call(this, false);
    _dispatchResult.call(this, result, data);
}

/**
 * Returns currently opened dialog
 *
 * @return {MLDialog}
 */
function MLDialog$$getOpenedDialog() {
    return openedDialog;
}

function MLDialog$destroy() {
    document.removeEventListener('keydown', _onKeyDown);
    Component.prototype.destroy.apply(this, arguments);
}
},{}],25:[function(require,module,exports){
'use strict';

var Component = milo.Component,
    componentsRegistry = milo.registry.components,
    logger = milo.util.logger,
    DOMListeners = milo.util.domListeners;

var TOGGLE_CSS_CLASS = 'dropdown-toggle',
    MENU_CSS_CLASS = 'dropdown-menu';

var MLDropdown = Component.createComponentClass('MLDropdown', {
    events: undefined,
    dom: {
        cls: ['ml-bs-dropdown', 'dropdown']
    }
});

componentsRegistry.add(MLDropdown);

module.exports = MLDropdown;

_.extendProto(MLDropdown, {
    start: MLDropdown$start,
    destroy: MLDropdown$destroy,
    toggleMenu: MLDropdown$toggleMenu,
    showMenu: MLDropdown$showMenu,
    hideMenu: MLDropdown$hideMenu
});

function MLDropdown$start() {
    var toggleEl = this.el.querySelector('.' + TOGGLE_CSS_CLASS),
        menuEl = this.el.querySelector('.' + MENU_CSS_CLASS);

    if (!(toggleEl && menuEl)) return logger.error('MLDropdown:', TOGGLE_CSS_CLASS, 'or', MENU_CSS_CLASS, 'isn\'t found');

    var doc = window.document,
        clickHandler = this.toggleMenu.bind(this, undefined);

    var listeners = new DOMListeners();
    this._dropdown = {
        menu: menuEl,
        visible: false,
        listeners: listeners
    };
    this.hideMenu();
    var self = this;

    listeners.add(toggleEl, 'click', clickHandler);
    //maybe only add this events if is open?
    listeners.add(doc, 'mouseout', onDocOut);
    listeners.add(doc, 'click', onClick);

    function onDocOut(event) {
        var target = event.target,
            relatedTarget = event.relatedTarget,
            listeners = self._dropdown.listeners;

        if (isIframe(target)) listeners.remove(target.contentWindow.document, 'click', onClick);

        if (isIframe(relatedTarget)) listeners.add(relatedTarget.contentWindow.document, 'click', onClick);
    }

    function onClick(event) {
        if (!self.el.contains(event.target)) self.hideMenu();
    }
}

function isIframe(el) {
    return el && el.tagName == 'IFRAME';
}

function MLDropdown$destroy() {
    this._dropdown.listeners.removeAll();
    delete this._dropdown;
    Component.prototype.destroy.apply(this, arguments);
}

function MLDropdown$showMenu() {
    this.toggleMenu(true);
}

function MLDropdown$hideMenu() {
    this.toggleMenu(false);
}

function MLDropdown$toggleMenu(doShow) {
    doShow = typeof doShow == 'undefined' ? !this._dropdown.visible : !!doShow;

    this._dropdown.visible = doShow;

    var menu = this._dropdown.menu;
    menu.style.display = doShow ? 'block' : 'none';
}
},{}],26:[function(require,module,exports){
'use strict';

var formGenerator = require('./generator'),
    Component = milo.Component,
    componentsRegistry = milo.registry.components,
    logger = milo.util.logger,
    formRegistry = require('./registry'),
    async = require('async');

var FORM_VALIDATION_FAILED_CSS_CLASS = 'has-error';

/**
 * A component class for generating forms from schema
 * To create form class method [createForm](#MLForm$$createForm) should be used.
 * Form schema has the following format:
 * ```
 * var schema = {
 *     css: {
 *                             // Optional CSS facet configuration
 *         classes: { ... }
 *     },
 *     items: [
 *         {
 *             type: '<type of ui control>',
 *                             // can be group, select, input, button, radio,
 *                             // hyperlink, checkbox, list, time, date
 *             compName: '<component name>',
 *                             // optional name of component, should be unique within the form
 *                             // (or form group), only needs tobe used when component needs to be
 *                             // manipilated in some event handler and it cannot be accessed via modelPath
 *                             // using `modelPathComponent` method
 *                             // (which is a preferred way to access conponents in form)
 *             label: '<ui control label>',
 *                             // optional label, will not be added if not defined
 *                             // or empty string
 *             altText: '<alt text or title>',
 *                             // optional alt text string on buttons and hyperlinks
 *             modelPath: '<model mapping>',
 *                             // path in model where the value will be stored.
 *                             // Most types of items require this property,
 *                             // some items may have this property (button, e.g.),
 *                             // "group" must NOT have this property.
 *                             // Warning will be logged if these rules are not followed.
 *                             // Items without this property will not be in model
 *                             // (apart from "group which subitems will be in model
 *                             // if they have this property)
 *                             // This property allows to have fixed form model structure
 *                             // while changing view structure of the form
 *                             // See Model.
 *             modelPattern: 'mapping extension pattern',
 *                            // (string)
 *             notInModel: true,
 *                             //allows to NOT include modelPath where otherwise it would be required
 *             messages: {                      // to subscribe to messages on item's component facets
 *                 events: {                    // facet to subscribe to
 *                     '<message1>': onMessage1 // message and subscriber function
 *                     '<msg2> <msg3>': {       // subscribe to 2 messages
 *                         subscriber: onMessage2,
 *                         context: context     // context can be an object or a string:
 *                                              //    "facet": facet instance will be used as context
 *                                              //    "owner": item component instance will be used as context
 *                                              //    "form": the form component instance will be used as context
 *                                              //    "host": host object passed to createForm method will be used as context
 *                     }
 *                 }
 *             },
 *             translate: {          // optional data translation functions
 *                 context: Object   // optional context that will be passed to translate functions, 'host' means the hostObject passed to Form.createForm
 *                 toModel: func1,   // translates item data from view to model
 *                 fromModel: func2  // translates item data from model to view
 *             },
 *             validate: {           // optional data validation functions
 *                 context: Object   // optional context that will be passed to validate functions, 'host' means the hostObject passed to Form.createForm
 *                 toModel:   func1 | [func1, func2, ...],// validates item data when it is changed in form
 *                 fromModel: func2 | [func3, func4, ...] // opposite, but not really used and does not make form invalid if it fails.
 *                                                        // Can be used to prevent data being shown in the form.
 *             },                    // data validation functions should accept two parameters: data and callback (they are asynchronous).
 *                                   // when validation is finished, callback should be called with (error, response) parameters.
 *                                   // response should have properties valid (Boolean) and optional reason (String - reason of validation failure).
 *                                   // Note!: at the moment, if callback is called with error parameter which is not falsy, validation will be passed.
 *             <item specific>: {<item configuration>}
 *                             // "select" supports "selectOptions" - array of objects
 *                             // with properties "value" and "label"
 *                             // "radio" supports "radioOptions" with the same format
 *             items: [
 *                 { ... } //, ... - items inside "group" or "wrapper" item
 *             ]
 *         } // , ... more items
 *     ]
 * }
 */
var MLForm = Component.createComponentClass('MLForm', {
    dom: {
        cls: 'ml-form'
    },
    css: undefined, // Facet config can be set via form schema
    model: undefined,
    container: undefined,
    data: undefined,
    events: undefined
});

componentsRegistry.add(MLForm);

module.exports = MLForm;

_.extend(MLForm, {
    createForm: MLForm$$createForm,
    registerSchemaKey: MLForm$$registerSchemaKey,
    registerValidation: MLForm$$registerValidation,
    validatorResponse: MLForm$$validatorResponse,
    generator: formGenerator,
    registry: formRegistry
});

_.extendProto(MLForm, {
    getHostObject: MLForm$getHostObject,
    isValid: MLForm$isValid,
    validateModel: MLForm$validateModel,
    getInvalidControls: MLForm$getInvalidControls,
    getInvalidReasons: MLForm$getInvalidReasons,
    getInvalidReasonsText: MLForm$getInvalidReasonsText,
    modelPathComponent: MLForm$modelPathComponent,
    modelPathSchema: MLForm$modelPathSchema,
    viewPathComponent: MLForm$viewPathComponent,
    viewPathSchema: MLForm$viewPathSchema,
    getModelPath: MLForm$getModelPath,
    getViewPath: MLForm$getViewPath,
    destroy: MLForm$destroy
});

var SCHEMA_KEYWORDS = _.object(['type', 'compName', 'label', 'altText', 'modelPath', 'modelPattern', 'notInModel', 'messages', 'translate', 'validate', 'items', 'selectOptions', 'radioOptions', 'comboOptions', 'comboOptionsURL', 'addItemPrompt', 'placeHolder', 'value', 'dataValidation', 'asyncHandler', 'autoresize', 'maxLength'], true);

/**
 * MLForm class method
 * Creates form from schema.
 * Form data can be obtained from its Model (`form.model`), reactive connection to form's model can also be used.
 *
 * @param {Object} schema form schema, as described above
 * @param {Object} hostObject form host object, used to define as message subscriber context in schema - by convention the context should be defined as "host"
 * @param {Object} formData data to initialize the form with
 * @param {String} template optional form template, will be used instead of automatically generated from schema. Not recommended to use, as it will have to be maintained to be consistent with schema for bindings.
 * @return {MLForm}
 */
function MLForm$$createForm(schema, hostObject, formData, template) {
    var FormClass = this;
    var form = _createFormComponent(FormClass);
    _.defineProperty(form, '_hostObject', hostObject);
    var formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations;
    _processFormSchema();
    _createFormConnectors();
    _manageFormValidation();

    // set original form data
    if (formData) form.model.m.set(formData);

    if (schema.css) form.css.config = schema.css;

    return form;

    function _createFormComponent(FormClass) {
        template = template || formGenerator(schema);
        return FormClass.createOnElement(undefined, template);
    }

    function _processFormSchema() {
        // model paths translation rules
        formViewPaths = {};
        formModelPaths = {};
        modelPathTranslations = {};
        dataTranslations = { fromModel: {}, toModel: {} };
        dataValidations = { fromModel: {}, toModel: {} };

        // process form schema
        try {
            processSchema.call(form, form, schema, '', formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations);
        } catch (e) {
            logger.debug('formViewPaths before error: ', formViewPaths);
            logger.debug('formModelPaths before error: ', formModelPaths);
            logger.debug('modelPathTranslations before error: ', modelPathTranslations);
            logger.debug('dataTranslations before error: ', dataTranslations);
            logger.debug('dataValidations before error: ', dataValidations);
            throw e;
        }

        form._formViewPaths = formViewPaths;
        form._formModelPaths = formModelPaths;
        form._modelPathTranslations = modelPathTranslations;
        form._dataTranslations = dataTranslations;
        form._dataValidations = dataValidations;
    }

    function _createFormConnectors() {
        var connectors = form._connectors = [];

        // connect form view to form model using translation rules from modelPath properties of form items
        connectors.push(milo.minder(form.data, '<->', form.model, { // connection depth is defined on field by field basis by pathTranslation
            pathTranslation: modelPathTranslations,
            dataTranslation: {
                '<-': dataTranslations.fromModel,
                '->': dataTranslations.toModel
            },
            dataValidation: {
                '<-': dataValidations.fromModel,
                '->': dataValidations.toModel
            }
        }));

        if (schema.css) {
            connectors.push(milo.minder(form.model, '->>>', form.css));
        }
    }

    function _manageFormValidation() {
        form._invalidFormControls = {};

        form.model.on('validated', createOnValidated(true));
        form.data.on('validated', createOnValidated(false));

        function createOnValidated(isFromModel) {
            var pathCompMethod = isFromModel ? 'modelPathComponent' : 'viewPathComponent',
                pathSchemaMethod = isFromModel ? 'modelPathSchema' : 'viewPathSchema';

            return function (msg, response) {
                var component = form[pathCompMethod](response.path),
                    schema = form[pathSchemaMethod](response.path),
                    label = schema.label,
                    modelPath = schema.modelPath;

                if (component) {
                    var parentEl = component.el.parentNode;
                    parentEl.classList.toggle(FORM_VALIDATION_FAILED_CSS_CLASS, !response.valid);

                    var reason;
                    if (response.valid) delete form._invalidFormControls[modelPath];else {
                        reason = {
                            label: label || '',
                            reason: response.reason,
                            reasonCode: response.reasonCode
                        };
                        form._invalidFormControls[modelPath] = {
                            component: component,
                            reason: reason
                        };
                    }

                    var data = _.clone(response);

                    if (!isFromModel) data.path = form.getModelPath(data.path);

                    if (reason) {
                        data.reason = reason; // a bit hacky, replacing string with object created above
                        delete data.reasonCode;
                    }
                    form.postMessage('validation', data);
                } else logger.error('Form: component for path ' + response.path + ' not found');
            };
        }
    }
}

/**
 * Custom schema keywords
 */
var schemaKeywordsRegistry = {};
function MLForm$$registerSchemaKey(keyword, processKeywordFunc, replaceKeyword) {
    if (SCHEMA_KEYWORDS[keyword]) throw new Error('Keyword', keyword, 'is used by MLForm class or one of pre-registered form items and cannot be overridden');

    if (!replaceKeyword && schemaKeywordsRegistry[keyword]) throw new Error('Keyword', keyword, 'is already registered. Pass true as the third parameter to replace it');

    schemaKeywordsRegistry[keyword] = processKeywordFunc;
}

/**
 * Predefined form validation functions
 */
var validationFunctions = {
    'required': validateRequired
};
function MLForm$$registerValidation(name, func, replaceFunc) {
    if (!replaceFunc && validationFunctions[name]) throw new Error('Validating function', name, 'is already registered. Pass true as the third parameter to replace it');

    validationFunctions[name] = func;
}

/**
 * Returns the form host object.
 * @return {Component}
 */
function MLForm$getHostObject() {
    return this._hostObject;
}

/**
 * Returns current validation status of the form
 * Will not validate fields that were never changed in view
 *
 * @return {Boolean}
 */
function MLForm$isValid() {
    return Object.keys(this._invalidFormControls).length == 0;
}

/**
 * Runs 'toModel' validators defined in schema on the current model of the form
 * can be used to mark as invaid all required fields or to explicitely validate
 * form when it is saved. Returns validation state of the form via callback
 *
 * @param {Function} callback
 */
function MLForm$validateModel(callback) {
    var validations = [],
        self = this;

    _.eachKey(this._dataValidations.fromModel, function (validators, modelPath) {
        var data = this.model.m(modelPath).get();
        validators = Array.isArray(validators) ? validators : [validators];

        if (validators && validators.length) {
            validations.push({
                modelPath: modelPath,
                data: data,
                validators: validators
            });
        }
    }, this);

    var allValid = true;
    async.each(validations, function (validation, nextValidation) {
        var lastResponse;
        async.every(validation.validators,
        // call validator
        function (validator, next) {
            validator(validation.data, function (err, response) {
                lastResponse = response || {};
                next(lastResponse.valid || err);
            });
        },
        // post validation result of item to form
        function (valid) {
            lastResponse.path = validation.modelPath;
            lastResponse.valid = valid;
            self.model.postMessage('validated', lastResponse);
            if (!valid) allValid = false;
            nextValidation(null);
        });
    },
    // post form validation result
    function (err) {
        self.postMessage('validationcompleted', { valid: allValid });
        callback && callback(allValid);
    });
}

/**
 * Returns map of invalid controls and reasons (view paths are keys)
 *
 * @return {Object}
 */
function MLForm$getInvalidControls() {
    return this._invalidFormControls;
}

/**
 * Returns an array of objects with all reasons for the form being invalid
 *
 * @return {Array[Object]}
 */
function MLForm$getInvalidReasons() {
    var invalidControls = this.getInvalidControls();
    var reasons = _.reduceKeys(invalidControls, function (memo, invalidControl, compName) {
        memo.push(invalidControl.reason);
        return memo;
    }, [], this);
    return reasons;
}

/**
 * Returns a multiline string with all reasons for the form being invalid
 *
 * @return {String}
 */
function MLForm$getInvalidReasonsText() {
    var reasons = this.getInvalidReasons();
    return reasons.reduce(function (memo, reason) {
        return memo + (reason.label || '') + ' - ' + reason.reason + '\n';
    }, '');
}

/**
 * Returns component for a given modelPath
 *
 * @param {String} modelPath
 * @return {Component}
 */
function MLForm$modelPathComponent(modelPath) {
    var modelPathObj = this._formModelPaths[modelPath];
    return modelPathObj && modelPathObj.component;
}

/**
 * Returns form schema for a given modelPath
 *
 * @param {String} modelPath
 * @return {Object}
 */
function MLForm$modelPathSchema(modelPath) {
    var modelPathObj = this._formModelPaths[modelPath];
    return modelPathObj && modelPathObj.schema;
}

/**
 * Returns component for a given view path (path as defined in Data facet)
 *
 * @param {String} viewPath
 * @return {Component}
 */
function MLForm$viewPathComponent(viewPath) {
    var viewPathObj = this._formViewPaths[viewPath];
    return viewPathObj && viewPathObj.component;
}

/**
 * Returns form schema for a given view path item (path as defined in Data facet)
 *
 * @param {String} viewPath
 * @return {Object}
 */
function MLForm$viewPathSchema(viewPath) {
    var viewPathObj = this._formViewPaths[viewPath];
    return viewPathObj && viewPathObj.schema;
}

/**
 * Converts view path of the component in the form to the model path of the connected data
 *
 * @param {string} viewPath view path of the component
 * @return {string} model path of connected data
 */
function MLForm$getModelPath(viewPath) {
    return this._modelPathTranslations[viewPath];
}

/**
 * Converts model path of the connected data to view path of the component in the form
 * 
 * @param {string} modelPath model path of connected data
 * @return {string} view path of the component
 */
function MLForm$getViewPath(modelPath) {
    return _.findKey(this._modelPathTranslations, function (mPath, vPath) {
        return mPath == modelPath;
    });
}

function MLForm$destroy() {
    Component.prototype.destroy.apply(this, arguments);

    this._connectors && this._connectors.forEach(milo.minder.destroyConnector);
    this._connectors = null;
}

/**
 * See item_types.js for item classes and templates
 * Map of items types to items components classes
 * UI components are defined in `milo`
 */

// var _itemsSchemaRules = _.mapKeys(itemTypes, function(className, itemType) {
//     return {
//         // CompClass: componentsRegistry.get(className),
//         func: itemsFunctions[itemType] || doNothing,
//         modelPathRule: modelPathRules[itemType] || 'required'
//     };
// });
// function doNothing() {}


/**
 * Processes form schema to subscribe for messages as defined in schema. Performs special processing for some types of items.
 * Returns translation rules for Connector object.
 * This function is called recursively for groups (and subgroups)
 *
 * @private
 * @param {Component} comp form or group component
 * @param {Object} schema form or group schema
 * @param {String} viewPath current view path, used to generate Connector translation rules
 * @param {Object} formViewPaths view paths accumulated so far (have component and schema properties)
 * @param {Object} formModelPaths view paths accumulated so far (have component and schema properties)
 * @param {Object} modelPathTranslations model path translation rules accumulated so far
 * @param {Object} dataTranslations data translation functions so far
 * @param {Object} dataValidations data validation functions so far
 * @return {Object}
 */
function processSchema(comp, schema, viewPath, formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations) {
    viewPath = viewPath || '';
    formViewPaths = formViewPaths || {};
    formModelPaths = formModelPaths || {};
    modelPathTranslations = modelPathTranslations || {};
    dataTranslations = dataTranslations || {};
    dataTranslations.fromModel = dataTranslations.fromModel || {};
    dataTranslations.toModel = dataTranslations.toModel || {};

    dataValidations = dataValidations || {};
    dataValidations.fromModel = dataValidations.fromModel || {};
    dataValidations.toModel = dataValidations.toModel || {};

    if (schema.items) _processSchemaItems.call(this, comp, schema.items, viewPath, formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations);

    if (schema.messages) _processSchemaMessages.call(this, comp, schema.messages);

    var itemRule = schema.type && formRegistry.get(schema.type);
    var hostObject = this.getHostObject();

    if (viewPath) {
        formViewPaths[viewPath] = {
            schema: schema,
            component: comp
        };

        if (itemRule) {
            //check(comp.constructor, itemTypes[schema.type].CompClass);
            itemRule.itemFunction && itemRule.itemFunction.call(hostObject, comp, schema);
            _processItemTranslations.call(this, viewPath, schema);
        } else throw new Error('unknown item type ' + schema.type);
    }

    for (var keyword in schemaKeywordsRegistry) {
        if (schema.hasOwnProperty(keyword)) {
            var processKeywordFunc = schemaKeywordsRegistry[keyword];
            processKeywordFunc(hostObject, comp, schema);
        }
    }

    return modelPathTranslations;

    function _processItemTranslations(viewPath, schema) {
        var modelPath = schema.modelPath,
            modelPattern = schema.modelPattern || '',
            notInModel = schema.notInModel,
            translate = schema.translate,
            validate = schema.validate;

        if (viewPath) {
            _addDataTranslation.call(this, translate, 'toModel', viewPath);

            switch (itemRule.modelPathRule) {
                case 'prohibited':
                    if (modelPath) throw new Error('modelPath is prohibited for item type ' + schema.type);
                    break;
                case 'required':
                    if (!(modelPath || notInModel)) throw new Error('modelPath is required for item type ' + schema.type + ' . Add "notInModel: true" to override');
                // falling through to 'optional'
                case 'optional':
                    if (modelPath) {
                        formModelPaths[modelPath] = {
                            schema: schema,
                            component: comp
                        };

                        if (!notInModel) {
                            _addModelPathTranslation(viewPath, modelPath, modelPattern);
                            _addDataTranslation.call(this, translate, 'fromModel', modelPath);
                            _addDataValidation.call(this, validate, 'toModel', viewPath);
                            _addDataValidation.call(this, validate, 'fromModel', modelPath);
                        }
                    }
                    break;
                default:
                    throw new Error('unknown modelPath rule for item type ' + schema.type);
            }
        }
    }

    function _addModelPathTranslation(viewPath, modelPath, pathPattern) {
        if (viewPath in modelPathTranslations) throw new Error('duplicate view path ' + viewPath);else if (_.keyOf(modelPathTranslations, modelPath)) throw new Error('duplicate model path ' + modelPath + ' for view path ' + viewPath);else modelPathTranslations[viewPath + pathPattern] = modelPath + pathPattern;
    }

    function _addDataTranslation(translate, direction, path) {
        var translateFunc = translate && translate[direction];
        if (!translateFunc) return;
        if (typeof translateFunc == 'function') {
            if (translate.context) {
                var context = getFunctionContext.call(this, translate.context);

                translateFunc = translateFunc.bind(context);
            }
            dataTranslations[direction][path] = translateFunc;
        } else {
            throw new Error(direction + ' translator for ' + path + ' should be function');
        }
    }

    function _addDataValidation(validate, direction, path) {
        var validators = validate && validate[direction];
        if (!validators) return;

        var form = this;
        var formValidators = dataValidations[direction][path] = [];

        if (Array.isArray(validators)) validators.forEach(_addValidatorFunc);else _addValidatorFunc(validators);

        function _addValidatorFunc(validator) {
            if (typeof validator == 'string') var valFunc = getValidatorFunction(validator);else if (validator instanceof RegExp) valFunc = makeRegexValidator(validator);else if (typeof validator == 'function') valFunc = validator;else throw new Error(direction + ' validator for ' + path + ' should be function or string');

            if (validate.context) {
                var context = getFunctionContext.call(form, validate.context);

                valFunc = valFunc.bind(context);
            }

            formValidators.push(valFunc);
        }
    }
}

function getValidatorFunction(validatorName) {
    var valFunc = validationFunctions[validatorName];
    if (!valFunc) throw new Error('Form: unknown validator function name ' + validatorName);
    return valFunc;
}

function makeRegexValidator(validatorRegExp) {
    return function (data, callback) {
        var valid = validatorRegExp.test(data),
            response = MLForm$$validatorResponse(valid, 'should match pattern');
        callback(null, response);
    };
}

/**
 * Processes items of the form (or group).
 * Component that has items should have Container facet.
 * Returns translation rules for Connector.
 *
 * @private
 * @param {Component} comp form or group component
 * @param {Array} items list of items in schema
 * @param {String} viewPath current view path, used to generate Connector translation rules
 * @param {Object} formViewPaths view paths accumulated so far (have component and schema properties)
 * @param {Object} formModelPaths view paths accumulated so far (have component and schema properties)
 * @param {Object} modelPathTranslations model path translation rules accumulated so far
 * @param {Object} dataTranslations data translation functions so far
 * @param {Object} dataValidations data validation functions so far
 * @return {Object}
 */
function _processSchemaItems(comp, items, viewPath, formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations) {
    if (!comp.container) return logger.warn('Form Warning: schema has items but component has no container facet');

    items.forEach(function (item) {
        if (!item.compName) return; // No component, only markup

        var itemComp = comp.container.scope[item.compName],
            compViewPath = viewPath + '.' + item.compName;
        if (!itemComp) throw new Error('component "' + item.compName + '" is not in scope (or subscope) of form');
        processSchema.call(this, itemComp, item, compViewPath, formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations);
    }, this);
}

/**
 * Subscribes to messages on facets of items' component as defined in schema
 */
function _processSchemaMessages(comp, messages) {
    var form = this;
    _.eachKey(messages, function (facetMessages, facetName) {
        var facet = comp[facetName];
        if (!facet) throw new Error('schema has subscriptions for facet "' + facetName + '" of form component "' + comp.name + '", but component has no facet');
        facetMessages = _.clone(facetMessages);
        _.eachKey(facetMessages, function (subscriber, messageType) {
            var context = typeof subscriber == 'object' ? subscriber.context : null;

            // Avoid changing event subscriptions whose context is 'facet' or 'owner'.
            if (context && context != 'facet' && context != 'owner') {
                context = getFunctionContext.call(form, context);

                facetMessages[messageType] = {
                    subscriber: subscriber.subscriber,
                    context: context
                };
            }
        });
        facet.onConfigMessages(facetMessages);
    });
}

/**
 * Returns the object to bind a function to as defined by a section of the form schema.
 *
 * Currently supported inputs are:
 *  - {Object} - Any object
 *  - {String} 'form' - The form
 *  - {String} 'host' - The form's host object
 */
function getFunctionContext(context) {
    if (context == 'form') context = this;else if (context == 'host') context = this.getHostObject();

    if (context && typeof context != 'object') throw new Error('Invalid context supplied - Expected {String} [host,form], or {Object}');

    return context;
}

/**
 * Validation functions
 */
function validateRequired(data, callback) {
    var valid = typeof data != 'undefined' && (typeof data != 'string' || data.trim() != '');
    var response = MLForm$$validatorResponse(valid, 'please enter a value', 'REQUIRED');
    callback(null, response);
}

function MLForm$$validatorResponse(valid, reason, reasonCode) {
    return valid ? { valid: true } : { valid: false, reason: reason, reasonCode: reasonCode };
}
},{"./generator":27,"./registry":29,"async":32}],27:[function(require,module,exports){
'use strict';

var doT = milo.util.doT,
    fs = require('fs'),
    componentsRegistry = milo.registry.components,
    miloCount = milo.util.count,
    componentName = milo.util.componentName,
    formRegistry = require('./registry');

require('./item_types');

var cachedItems = {};

module.exports = formGenerator;

var partials = {
    label: "{{? it.item.label }}\n    <label>{{= it.item.label}}</label>\n{{?}}\n",
    formGroup: "<div\n    {{? it.item.altText }}title=\"{{= it.item.altText}}\" {{?}}\n    class=\"form-group{{? it.item.wrapCssClass}} {{= it.item.wrapCssClass }}{{?}}\"\n>\n"
};

var dotDef = {
    partials: partials
};

/*
 * Generates form HTML based on the schema.
 * It does not create components for the form DOM, milo.binder should be called separately on the form's element.
 *
 * @param {Array} schema array of form elements descriptors
 * @return {String}
 */
function formGenerator(schema) {
    //getItemsClasses();

    var renderedItems = schema.items.map(renderItem);
    return renderedItems.join('');

    function renderItem(item) {
        var itemType = cachedItems[item.type];

        if (!itemType) {
            var newItemType = formRegistry.get(item.type);
            itemType = cachedItems[item.type] = {
                CompClass: newItemType.compClass && componentsRegistry.get(newItemType.compClass),
                compClass: newItemType.compClass,
                template: doT.compile(newItemType.template, dotDef)
            };
        }

        item.compName = itemType.CompClass ? item.compName || componentName() : null;

        var domFacetConfig = itemType.CompClass && itemType.CompClass.getFacetConfig('dom'),
            tagName = domFacetConfig && domFacetConfig.tagName || 'div';

        var template = itemType.template;
        return template({
            item: item,
            compName: item.compName,
            compClass: itemType.compClass,
            tagName: tagName,
            formGenerator: formGenerator,
            miloCount: miloCount,
            disabled: item.disabled,
            multiple: item.multiple
        });
    }
}
},{"./item_types":28,"./registry":29,"fs":33}],28:[function(require,module,exports){
'use strict';

var fs = require('fs'),
    formRegistry = require('./registry');

var group_dot = "<div ml-bind=\"MLGroup:{{= it.compName }}\"{{? it.item.wrapCssClass}} class=\"{{= it.item.wrapCssClass }}\"{{?}}>\n    {{# def.partials.label }}\n    {{= it.formGenerator(it.item) }}\n</div>\n",
    wrapper_dot = "<span ml-bind=\"MLWrapper:{{= it.compName }}\"{{? it.item.wrapCssClass}} class=\"{{= it.item.wrapCssClass }}\"{{?}}>\n    {{= it.formGenerator(it.item) }}\n</span>\n",
    select_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <span class=\"custom-select\">\n        <select ml-bind=\"MLSelect:{{= it.compName }}\"\n                {{? it.disabled }}disabled {{?}}\n                {{? it.multiple }}multiple {{?}}\n                class=\"form-control\">\n        </select>\n    </span>\n</div>\n",
    input_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <input type=\"{{= it.item.inputType || 'text' }}\"\n            {{? it.item.inputName }}name=\"{{= it.item.inputName }}\"{{?}}\n            ml-bind=\"MLInput:{{= it.compName }}\"\n            {{? it.item.placeholder }}placeholder=\"{{= it.item.placeholder}}\"{{?}}\n            {{? it.disabled }}disabled {{?}}\n            class=\"form-control\">\n</div>\n",
    textarea_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <textarea ml-bind=\"MLTextarea:{{= it.compName }}\"\n        {{? it.disabled }}disabled {{?}}\n        class=\"form-control\"\n        {{? it.item.placeholder }}placeholder=\"{{= it.item.placeholder}}\"{{?}}\n        {{? it.item.autoresize }}rows=\"{{= it.item.autoresize.minLines }}\"{{?}}></textarea>\n</div>",
    button_dot = "<div {{? it.item.altText }}title=\"{{= it.item.altText}}\" {{?}}class=\"btn-toolbar{{? it.item.wrapCssClass}} {{= it.item.wrapCssClass }}{{?}}\">\n    <button ml-bind=\"MLButton:{{= it.compName }}\"\n        {{? it.disabled }}disabled {{?}}\n        class=\"btn btn-default {{? it.item.itemCssClass}} {{= it.item.itemCssClass }}{{?}}\">\n        {{= it.item.label || '' }}\n    </button>\n</div>\n",
    hyperlink_dot = "{{# def.partials.formGroup }}\n    <a {{? it.item.href}}href=\"{{= it.item.href }}\"{{?}}\n        {{? it.item.target}}target=\"{{= it.item.target }}\"{{?}}   \n        ml-bind=\"MLHyperlink:{{= it.compName }}\" \n        class=\"hyperlink hyperlink-default\">\n        {{= it.item.label || '' }}\n    </a>\n</div>",
    checkbox_dot = "{{# def.partials.formGroup }}\n  <input type=\"checkbox\"\n    id=\"{{= it.compName }}\"\n    ml-bind=\"MLInput:{{= it.compName }}\"\n    {{? it.disabled }}disabled {{?}}\n    class=\"{{= it.item.itemCssClass || ''}}\">\n  <label for=\"{{= it.compName }}\">{{= it.item.label}}</label>\n</div>\n",
    list_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <ul ml-bind=\"MLList:{{= it.compName }}\"\n            {{? it.disabled }}disabled {{?}}>\n        <li ml-bind=\"MLListItem:itemSample\" class=\"list-item\">\n            <span ml-bind=\"[data]:label\"></span>\n            {{? it.editBtn }}<button ml-bind=\"[events]:editBtn\">edit</button>{{?}}\n            <button ml-bind=\"[events]:deleteBtn\" class=\"btn btn-default glyphicon glyphicon-remove\"> </button>\n        </li>\n    </ul>\n</div>\n",
    time_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <input type=\"time\"\n            ml-bind=\"MLTime:{{= it.compName }}\"\n            class=\"form-control\">\n</div>",
    date_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <input type=\"date\"\n            ml-bind=\"MLDate:{{= it.compName }}\"\n            class=\"form-control\">\n</div>",
    combo_dot = "<div ml-bind=\"MLCombo:{{= it.compName }}\" class=\"form-group{{? it.item.wrapCssClass}} {{= it.item.wrapCssClass }}{{?}}\">\n    {{# def.partials.label }}\n    {{ var listID = 'ml-combo-datalist-' + it.miloCount(); }}\n    <input ml-bind=\"[data, events]:input\"\n            name=\"{{= listID }}\"\n            list=\"{{= listID }}\"\n            {{? it.disabled }}disabled {{?}}\n            class=\"form-control\">\n    <datalist id=\"{{= listID }}\" ml-bind=\"[template]:datalist\"></datalist>\n</div>",
    image_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <img {{? it.item.src }}src=\"{{= it.item.src }}\"{{?}}\n        ml-bind=\"MLImage:{{= it.compName }}\"\n        {{? it.item.width }}width=\"{{= it.item.width }}\"{{?}}\n        {{? it.item.height }}height=\"{{= it.item.height }}\"{{?}}>\n</div>\n",
    droptarget_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n        <img {{? it.item.src }}src=\"{{= it.item.src }}\"{{?}}\n            ml-bind=\"MLDropTarget:{{= it.compName }}\"\n            {{? it.item.width }}width=\"{{= it.item.width }}\"{{?}}\n            {{? it.item.height }}height=\"{{= it.item.height }}\"{{?}}>\n</div>\n",
    text_dot = "{{var tagName = it.item.tagName || 'span';}}\n<{{=tagName}} ml-bind=\"MLText:{{= it.compName }}\"{{? it.item.wrapCssClass}} class=\"{{= it.item.wrapCssClass }}\"{{?}}>\n    {{? it.item.label }}\n        {{= it.item.label}}\n    {{?}}\n</{{=tagName}}>\n",
    clear_dot = '<div class="cc-clear"></div>';

formRegistry.add('group', { compClass: 'MLGroup', template: group_dot, modelPathRule: 'prohibited' });
formRegistry.add('wrapper', { compClass: 'MLWrapper', template: wrapper_dot, modelPathRule: 'prohibited' });
formRegistry.add('select', { compClass: 'MLSelect', template: select_dot, itemFunction: processSelectSchema });
formRegistry.add('input', { compClass: 'MLInput', template: input_dot, itemFunction: processInputSchema });
formRegistry.add('inputlist', { compClass: 'MLInputList', itemFunction: processInputListSchema });
formRegistry.add('textarea', { compClass: 'MLTextarea', template: textarea_dot, itemFunction: processTextareaSchema });
formRegistry.add('button', { compClass: 'MLButton', template: button_dot, modelPathRule: 'optional' });
formRegistry.add('radio', { compClass: 'MLRadioGroup', itemFunction: processRadioSchema });
formRegistry.add('checkgroup', { compClass: 'MLCheckGroup', itemFunction: processCheckGroupSchema });
formRegistry.add('hyperlink', { compClass: 'MLHyperlink', template: hyperlink_dot, modelPathRule: 'optional' });
formRegistry.add('checkbox', { compClass: 'MLInput', template: checkbox_dot });
formRegistry.add('list', { compClass: 'MLList', template: list_dot });
formRegistry.add('time', { compClass: 'MLTime', template: time_dot });
formRegistry.add('date', { compClass: 'MLDate', template: date_dot });
formRegistry.add('combo', { compClass: 'MLCombo', template: combo_dot, itemFunction: processComboSchema });
formRegistry.add('supercombo', { compClass: 'MLSuperCombo', itemFunction: processSuperComboSchema });
formRegistry.add('combolist', { compClass: 'MLComboList', itemFunction: processComboListSchema });
formRegistry.add('image', { compClass: 'MLImage', template: image_dot });
formRegistry.add('droptarget', { compClass: 'MLDropTarget', template: droptarget_dot, modelPathRule: 'prohibited' });
formRegistry.add('text', { compClass: 'MLText', template: text_dot, modelPathRule: 'optional' });
formRegistry.add('clear', { template: clear_dot });

function processSelectSchema(comp, schema) {
    var options = schema.selectOptions;
    setComponentOptions(comp, options, setComboOptions);
}

function processRadioSchema(comp, schema) {
    var options = schema.radioOptions;
    setComponentOptions(comp, options, setComponentModel);
}

function processCheckGroupSchema(comp, schema) {
    var options = schema.checkOptions;
    comp.setSelectAll(!!schema.selectAll);
    setComponentOptions(comp, options, setComponentModel);
}

function processComboSchema(comp, schema) {
    var options = schema.comboOptions;
    setComponentOptions(comp, options, setComponentModel);
}

function processSuperComboSchema(comp, schema) {
    var options = schema.comboOptions,
        optionsURL = schema.comboOptionsURL,
        addItemPrompt = schema.addItemPrompt,
        placeHolder = schema.placeHolder;

    _.deferTicks(function () {
        if (addItemPrompt) comp.setAddItemPrompt(addItemPrompt);
        if (placeHolder) comp.setPlaceholder(placeHolder);
        setComponentOptions(comp, options, setComboOptions);
        if (optionsURL) comp.initOptionsURL(optionsURL);
    }, 2);
}

function processComboListSchema(comp, schema) {
    var options = schema.comboOptions,
        addItemPrompt = schema.addItemPrompt,
        placeHolder = schema.placeHolder;

    _.deferTicks(function () {
        if (addItemPrompt) comp.setAddItemPrompt(addItemPrompt);
        if (placeHolder) comp.setPlaceholder(placeHolder);
        comp.setDataValidation(schema.dataValidation);
        setComponentOptions(comp, options, setComboOptions);
    }, 2);
}

function processInputListSchema(comp, schema) {
    comp.setAsync(schema.asyncHandler);
    comp.setPlaceHolder(schema.placeHolder);
}

function processTextareaSchema(comp, schema) {
    if (schema.autoresize) _.deferMethod(comp, 'startAutoresize', schema.autoresize);
}

function processInputSchema(comp, schema) {
    if (_.isNumeric(schema.maxLength)) comp.setMaxLength(schema.maxLength);
}

function setComponentOptions(comp, options, setModelFunc) {
    if (options) {
        if (typeof options.then == 'function') {
            setModelFunc(comp, [{ value: 0, label: 'loading...' }]);
            options.then(function (data) {
                setModelFunc(comp, data);
            }, function () {
                setModelFunc(comp, [{ value: 0, label: 'loading error' }]);
            });
        } else setModelFunc(comp, options);
    }
}

function setComponentModel(comp, data) {
    comp.model.set(data);
    // _.deferMethod(comp.model, 'set', data);
    // doing it with defer makes channel not set when the article is opened
}

function setComboOptions(comp, data) {
    comp.setOptions(data);
}
},{"./registry":29,"fs":33}],29:[function(require,module,exports){
'use strict';

var logger = milo.util.logger,
    check = milo.util.check,
    Match = check.Match;

var formTypes = {};
var defaults = {};

var formRegistry = module.exports = {
    get: registry_get,
    add: registry_add,
    setDefaults: registry_setDefaults
};

var DEFAULT_TEMPLATE = '{{# def.partials.formGroup }}\
                            {{# def.partials.label }}\
                            <{{= it.tagName}} ml-bind="{{= it.compClass}}:{{= it.compName }}">\
                            </{{= it.tagName}}>\
                        </div>';

formRegistry.setDefaults({
    template: DEFAULT_TEMPLATE,
    modelPathRule: 'required',
    itemFunction: null
});

function registry_get(name) {
    var formItem = name && formTypes[name];

    if (!formItem) return logger.error('Form item ' + name + ' not registered');

    return formItem;
}

function registry_add(name, newFormItem) {
    check(name, String);
    check(newFormItem, {
        compClass: Match.Optional(String),
        template: Match.Optional(String),
        modelPathRule: Match.Optional(String),
        itemFunction: Match.Optional(Function)
    });

    var formItem = _.clone(defaults);
    _.extend(formItem, newFormItem);

    if (name && formTypes[name]) return logger.error('Form item ' + name + ' already registered');

    formTypes[name] = formItem;
    return true;
}

function registry_setDefaults(newDefaults) {
    check(defaults, Object);
    defaults = newDefaults;
}
},{}],30:[function(require,module,exports){
'use strict';

if (!(window.milo && window.milo.milo_version)) throw new Error('milo is not available');

/**
 * `milo-ui`
 *
 * This bundle will register additional component classes for UI
 */

require('./use_components');
},{"./use_components":31}],31:[function(require,module,exports){
'use strict';

require('./components/Group');
require('./components/Wrapper');
require('./components/Text');
require('./components/Select');
require('./components/Input');
require('./components/InputList');
require('./components/Textarea');
require('./components/RadioGroup');
require('./components/CheckGroup');
require('./components/Button');
require('./components/Hyperlink');
require('./components/List');
require('./components/ListItemSimple');
require('./components/ListItem');
require('./components/Time');
require('./components/Date');
require('./components/Combo');
require('./components/SuperCombo');
require('./components/ComboList');
require('./components/Image');
require('./components/DropTarget');
require('./components/FoldTree');

require('./components/bootstrap/Alert');
require('./components/bootstrap/Dialog');
require('./components/bootstrap/Dropdown');

require('./forms/Form');
},{"./components/Button":1,"./components/CheckGroup":2,"./components/Combo":3,"./components/ComboList":4,"./components/Date":5,"./components/DropTarget":6,"./components/FoldTree":7,"./components/Group":8,"./components/Hyperlink":9,"./components/Image":10,"./components/Input":11,"./components/InputList":12,"./components/List":13,"./components/ListItem":14,"./components/ListItemSimple":15,"./components/RadioGroup":16,"./components/Select":17,"./components/SuperCombo":18,"./components/Text":19,"./components/Textarea":20,"./components/Time":21,"./components/Wrapper":22,"./components/bootstrap/Alert":23,"./components/bootstrap/Dialog":24,"./components/bootstrap/Dropdown":25,"./forms/Form":26}],32:[function(require,module,exports){
var process=require("__browserify_process"),global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

},{"__browserify_process":34}],33:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],34:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[30])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9CdXR0b24uanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvQ2hlY2tHcm91cC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21iby5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21ib0xpc3QuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvRGF0ZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Ecm9wVGFyZ2V0LmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0ZvbGRUcmVlLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0dyb3VwLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0h5cGVybGluay5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbWFnZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dExpc3QuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvTGlzdC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbVNpbXBsZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9SYWRpb0dyb3VwLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1NlbGVjdC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9TdXBlckNvbWJvLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1RleHQuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGV4dGFyZWEuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGltZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9XcmFwcGVyLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9BbGVydC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9ib290c3RyYXAvRGlhbG9nLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bi5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvZm9ybXMvRm9ybS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvZm9ybXMvZ2VuZXJhdG9yLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9mb3Jtcy9pdGVtX3R5cGVzLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9mb3Jtcy9yZWdpc3RyeS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvbWlsb191aS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvdXNlX2NvbXBvbmVudHMuanMiLCIvY2Mtc3JjL21pbG8tdWkvbm9kZV9tb2R1bGVzL2FzeW5jL2xpYi9hc3luYy5qcyIsIi9jYy1zcmMvbWlsby11aS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2ZzLmpzIiwiL2NjLXNyYy9taWxvLXVpL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeHNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudCxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBNTEJ1dHRvbiA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxCdXR0b24nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWJ1dHRvbidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEJ1dHRvbik7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxCdXR0b247XG5cbl8uZXh0ZW5kUHJvdG8oTUxCdXR0b24sIHtcbiAgICBkaXNhYmxlOiBNTEJ1dHRvbiRkaXNhYmxlLFxuICAgIGlzRGlzYWJsZWQ6IE1MQnV0dG9uJGlzRGlzYWJsZWRcbn0pO1xuXG5mdW5jdGlvbiBNTEJ1dHRvbiRkaXNhYmxlKGRpc2FibGUpIHtcbiAgICB0aGlzLmVsLmRpc2FibGVkID0gZGlzYWJsZTtcbn1cblxuZnVuY3Rpb24gTUxCdXR0b24kaXNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLmVsLmRpc2FibGVkO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cyxcbiAgICB1bmlxdWVJZCA9IG1pbG8udXRpbC51bmlxdWVJZDtcblxudmFyIENIRUNLRURfQ0hBTkdFX01FU1NBR0UgPSAnbWxjaGVja2dyb3VwY2hhbmdlJyxcbiAgICBFTEVNRU5UX05BTUVfUFJPUEVSVFkgPSAnX21sQ2hlY2tHcm91cEVsZW1lbnRJRCcsXG4gICAgRUxFTUVOVF9OQU1FX1BSRUZJWCA9ICdtbC1jaGVjay1ncm91cC0nO1xuXG52YXIgTUxDaGVja0dyb3VwID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTENoZWNrR3JvdXAnLCB7XG4gICAgZGF0YToge1xuICAgICAgICBzZXQ6IE1MQ2hlY2tHcm91cF9zZXQsXG4gICAgICAgIGdldDogTUxDaGVja0dyb3VwX2dldCxcbiAgICAgICAgZGVsOiBNTENoZWNrR3JvdXBfZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENIRUNLRURfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjbGljayc6IHsgc3Vic2NyaWJlcjogb25Hcm91cENsaWNrLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWNoZWNrLWdyb3VwJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICd7e34gaXQuY2hlY2tPcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7IyNkZWYuZWxJRDp7ez0gaXQuZWxlbWVudE5hbWUgfX0te3s9IG9wdGlvbi52YWx1ZSB9fSN9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ7ez0gaXQuX3JlbmRlck9wdGlvbnMub3B0aW9uQ3NzQ2xhc3MgfHwgXCInICsgRUxFTUVOVF9OQU1FX1BSRUZJWCArICdvcHRpb25cIiB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cInt7IyBkZWYuZWxJRCB9fVwiIHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwie3s9IG9wdGlvbi52YWx1ZSB9fVwiIG5hbWU9XCJ7ez0gaXQuZWxlbWVudE5hbWUgfX1cIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwie3sjIGRlZi5lbElEIH19XCI+e3s9IG9wdGlvbi5sYWJlbCB9fTwvbGFiZWw+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXG4gICAgICAgICAgICAgICAgICAgIHt7fn19IFxcXG4gICAgICAgICAgICAgICAgICAgIHt7P2l0Ll9yZW5kZXJPcHRpb25zLnNlbGVjdEFsbH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7eyMjZGVmLmFsbElEOnt7PSBpdC5lbGVtZW50TmFtZSB9fS1hbGwjfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiJyArIEVMRU1FTlRfTkFNRV9QUkVGSVggKyAnYWxsXCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwie3sjIGRlZi5hbGxJRCB9fVwiIHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwiYWxsXCIgbmFtZT1cImFsbFwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ7eyMgZGVmLmFsbElEIH19XCI+QWxsPC9sYWJlbD4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcbiAgICAgICAgICAgICAgICAgICAge3s/fX0nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxDaGVja0dyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTENoZWNrR3JvdXA7XG5cbl8uZXh0ZW5kUHJvdG8oTUxDaGVja0dyb3VwLCB7XG4gICAgaW5pdDogTUxDaGVja0dyb3VwJGluaXQsXG4gICAgZGVzdHJveTogTUxDaGVja0dyb3VwJGRlc3Ryb3ksXG4gICAgc2V0U2VsZWN0QWxsOiBNTENoZWNrR3JvdXAkc2V0U2VsZWN0QWxsXG59KTtcblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXplIHJhZGlvIGdyb3VwIGFuZCBzZXR1cFxuICovXG5mdW5jdGlvbiBNTENoZWNrR3JvdXAkaW5pdCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnR5KHRoaXMsIEVMRU1FTlRfTkFNRV9QUk9QRVJUWSwgRUxFTUVOVF9OQU1FX1BSRUZJWCArIHVuaXF1ZUlkKCkpO1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMgPSB7fTtcbiAgICB0aGlzLl9jaGVja0VscyA9IHt9O1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5mdW5jdGlvbiBNTENoZWNrR3JvdXAkc2V0U2VsZWN0QWxsKHNlbGVjdEFsbCkge1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMuc2VsZWN0QWxsID0gc2VsZWN0QWxsO1xufVxuXG4vKipcbiAqIFNldHMgZ3JvdXAgdmFsdWVcbiAqIFJlcGxhY2VzIHRoZSBkYXRhIHNldCBvcGVyYXRpb24gdG8gZGVhbCB3aXRoIHJhZGlvIGJ1dHRvbnNcbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgc2V0XG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cF9zZXQodmFsdWVPYmopIHtcbiAgICBfLmVhY2hLZXkodGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCwga2V5KSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSAhIXZhbHVlT2JqW2tleV07XG4gICAgfSk7XG59XG5cbi8qKlxuICogR2V0cyBncm91cCB2YWx1ZVxuICogUmV0cmlldmVzIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiB0aGUgZ3JvdXBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cF9nZXQoKSB7XG4gICAgcmV0dXJuIF8ubWFwS2V5cyh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHJldHVybiBlbC5jaGVja2VkO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIERlbGV0ZWQgZ3JvdXAgdmFsdWVcbiAqIERlbGV0ZXMgdGhlIHZhbHVlIG9mIHRoZSBncm91cCwgc2V0dGluZyBpdCB0byBlbXB0eVxuICovXG5mdW5jdGlvbiBNTENoZWNrR3JvdXBfZGVsKCkge1xuICAgIF8uZWFjaEtleSh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBlbC5jaGVja2VkID0gZmFsc2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBNYW5hZ2UgcmFkaW8gY2hpbGRyZW4gY2xpY2tzXG4gKi9cbmZ1bmN0aW9uIG9uR3JvdXBDbGljayhldmVudFR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIGNsaWNrZWRFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgaWYgKGNsaWNrZWRFbGVtZW50LnR5cGUgIT09ICdjaGVja2JveCcpIHJldHVybjtcblxuICAgIGlmIChjbGlja2VkRWxlbWVudC5uYW1lID09PSAnYWxsJykge1xuICAgICAgICBfLmVhY2hLZXkodGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCwga2V5KSB7XG4gICAgICAgICAgICBlbC5jaGVja2VkID0gY2xpY2tlZEVsZW1lbnQuY2hlY2tlZDtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGlzQ2hlY2tlZCA9IGNsaWNrZWRFbGVtZW50LmNoZWNrZWQgJiYgaXNBbGxFbGVtZW50Q2hlY2tlZC5jYWxsKHRoaXMpO1xuICAgICAgICBzZXRBbGxDaGVja2VkLmNhbGwodGhpcywgaXNDaGVja2VkKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gc2V0QWxsQ2hlY2tlZChjaGVja2VkKSB7XG4gICAgaWYgKHRoaXMuX3JlbmRlck9wdGlvbnMuc2VsZWN0QWxsKSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJhbGxcIl0nKS5jaGVja2VkID0gY2hlY2tlZDtcbn1cblxuZnVuY3Rpb24gaXNBbGxFbGVtZW50Q2hlY2tlZChkYXRhKSB7XG4gICAgcmV0dXJuIF8uZXZlcnlLZXkodGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gZWwuY2hlY2tlZDtcbiAgICB9KTtcbn1cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENIRUNLRURfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG4vLyBTZXQgcmFkaW8gYnV0dG9uIGNoaWxkcmVuIG9uIG1vZGVsIGNoYW5nZVxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcih7XG4gICAgICAgIGNoZWNrT3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKSxcbiAgICAgICAgZWxlbWVudE5hbWU6IHRoaXNbRUxFTUVOVF9OQU1FX1BST1BFUlRZXSxcbiAgICAgICAgX3JlbmRlck9wdGlvbnM6IHRoaXMuX3JlbmRlck9wdGlvbnNcbiAgICB9KTtcblxuICAgIHRoaXMuX2NoZWNrRWxzID0ge307XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIF8uZm9yRWFjaCh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgaWYgKGVsLm5hbWUgIT0gJ2FsbCcpIHNlbGYuX2NoZWNrRWxzW2VsLnZhbHVlXSA9IGVsO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBNTENoZWNrR3JvdXAkZGVzdHJveSgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2hlY2tFbHM7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnQsXG4gICAgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG52YXIgQ09NQk9fQ0hBTkdFX01FU1NBR0UgPSAnbWxjb21ib2NoYW5nZSc7XG5cbnZhciBEQVRBTElTVF9URU1QTEFURSA9ICd7e34gaXQuY29tYm9PcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwie3s9IG9wdGlvbi5sYWJlbCB9fVwiPjwvb3B0aW9uPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19JztcblxudmFyIE1MQ29tYm8gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQ29tYm8nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MQ29tYm9fZ2V0LFxuICAgICAgICBzZXQ6IE1MQ29tYm9fc2V0LFxuICAgICAgICBkZWw6IE1MQ29tYm9fZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWRhdGFsaXN0J1xuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQ29tYm8pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQ29tYm87XG5cbl8uZXh0ZW5kUHJvdG8oTUxDb21ibywge1xuICAgIGluaXQ6IE1MQ29tYm8kaW5pdFxufSk7XG5cbmZ1bmN0aW9uIE1MQ29tYm8kaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuZnVuY3Rpb24gb25DaGlsZHJlbkJvdW5kKCkge1xuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICdfY29tYm9JbnB1dCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmlucHV0LFxuICAgICAgICAnX2NvbWJvTGlzdCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmRhdGFsaXN0XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jb21ib0xpc3QudGVtcGxhdGUuc2V0KERBVEFMSVNUX1RFTVBMQVRFKTtcblxuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5vbignaW5wdXQnLCB7IHN1YnNjcmliZXI6IGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib19nZXQoKSB7XG4gICAgaWYgKCF0aGlzLl9jb21ib0lucHV0KSByZXR1cm47XG4gICAgcmV0dXJuIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5nZXQoKTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib19zZXQodmFsdWUpIHtcbiAgICByZXR1cm4gY2hhbmdlQ29tYm9EYXRhLmNhbGwodGhpcywgJ3NldCcsIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib19kZWwoKSB7XG4gICAgcmV0dXJuIGNoYW5nZUNvbWJvRGF0YS5jYWxsKHRoaXMsICdkZWwnKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlQ29tYm9EYXRhKG1ldGhvZCwgdmFsdWUpIHtcbiAgICBpZiAoIXRoaXMuX2NvbWJvSW5wdXQpIHJldHVybjtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY29tYm9JbnB1dC5kYXRhW21ldGhvZF0odmFsdWUpO1xuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFBvc3QgdGhlIGRhdGEgY2hhbmdlXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19DSEFOR0VfTUVTU0FHRSk7XG59XG5cbmZ1bmN0aW9uIG9uT3B0aW9uc0NoYW5nZShtc2csIGRhdGEpIHtcbiAgICB0aGlzLl9jb21ib0xpc3QudGVtcGxhdGUucmVuZGVyKHtcbiAgICAgICAgY29tYm9PcHRpb25zOiB0aGlzLm1vZGVsLmdldCgpXG4gICAgfSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnQsXG4gICAgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzLFxuICAgIGNoZWNrID0gbWlsby51dGlsLmNoZWNrLFxuICAgIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cbnZhciBDT01CT19MSVNUX0NIQU5HRV9NRVNTQUdFID0gJ21sY29tYm9saXN0Y2hhbmdlJztcblxudmFyIE1MQ29tYm9MaXN0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTENvbWJvTGlzdCcsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktY29tYm8tbGlzdCdcbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTENvbWJvTGlzdF9nZXQsXG4gICAgICAgIHNldDogTUxDb21ib0xpc3Rfc2V0LFxuICAgICAgICBkZWw6IE1MQ29tYm9MaXN0X2RlbCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0xJU1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IG1sLWJpbmQ9XCJNTFN1cGVyQ29tYm86Y29tYm9cIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdDpsaXN0XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0SXRlbTppdGVtXCIgY2xhc3M9XCJsaXN0LWl0ZW1cIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltkYXRhXTpsYWJlbFwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltldmVudHNdOmRlbGV0ZUJ0blwiIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj4nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxDb21ib0xpc3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQ29tYm9MaXN0O1xuXG5fLmV4dGVuZFByb3RvKE1MQ29tYm9MaXN0LCB7XG4gICAgaW5pdDogTUxDb21ib0xpc3QkaW5pdCxcbiAgICBzZXRPcHRpb25zOiBNTENvbWJvTGlzdCRzZXRPcHRpb25zLFxuICAgIHNldERhdGFWYWxpZGF0aW9uOiBNTENvbWJvTGlzdCRzZXREYXRhVmFsaWRhdGlvbixcbiAgICB0b2dnbGVBZGRCdXR0b246IE1MQ29tYm9MaXN0JHRvZ2dsZUFkZEJ1dHRvbixcbiAgICBkZXN0cm95OiBNTENvbWJvTGlzdCRkZXN0cm95LFxuICAgIHNldEFkZEl0ZW1Qcm9tcHQ6IE1MQ29tYm9MaXN0JHNldEFkZEl0ZW1Qcm9tcHQsXG4gICAgY2xlYXJDb21ib0lucHV0OiBNTENvbWJvTGlzdCRjbGVhckNvbWJvSW5wdXRcbn0pO1xuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMubW9kZWwuc2V0KFtdKTtcbiAgICB0aGlzLm9uY2UoJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRzZXREYXRhVmFsaWRhdGlvbihkYXRhVmFsaWRhdGlvbikge1xuICAgIGNoZWNrKGRhdGFWYWxpZGF0aW9uLCBNYXRjaC5PcHRpb25hbChGdW5jdGlvbikpO1xuICAgIHRoaXMuX2RhdGFWYWxpZGF0aW9uID0gZGF0YVZhbGlkYXRpb247XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHNldE9wdGlvbnMoYXJyKSB7XG4gICAgdGhpcy5fY29tYm8uc2V0T3B0aW9ucyhhcnIpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRjbGVhckNvbWJvSW5wdXQoKSB7XG4gICAgdGhpcy5fY29tYm8uY2xlYXJDb21ib0lucHV0KCk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgYWRkIGJ1dHRvblxuICogQHBhcmFtIHtCb29sZWFufSBzaG93XG4gKi9cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHRvZ2dsZUFkZEJ1dHRvbihzaG93KSB7XG4gICAgdGhpcy5fY29tYm8udG9nZ2xlQWRkQnV0dG9uKHNob3cpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRzZXRBZGRJdGVtUHJvbXB0KHByb21wdCkge1xuICAgIHRoaXMuX2NvbWJvLnNldEFkZEl0ZW1Qcm9tcHQocHJvbXB0KTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib0xpc3QkZGVzdHJveSgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgJiYgbWlsby5taW5kZXIuZGVzdHJveUNvbm5lY3Rvcih0aGlzLl9jb25uZWN0b3IpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcigpLmJpbmRlcigpO1xuICAgIGNvbXBvbmVudFNldHVwLmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudFNldHVwKCkge1xuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICdfY29tYm8nOiB0aGlzLmNvbnRhaW5lci5zY29wZS5jb21ibyxcbiAgICAgICAgJ19saXN0JzogdGhpcy5jb250YWluZXIuc2NvcGUubGlzdFxuICAgIH0pO1xuXG4gICAgdGhpcy5fY29ubmVjdG9yID0gbWlsby5taW5kZXIodGhpcy5fbGlzdC5tb2RlbCwgJzw8PC0+Pj4nLCB0aGlzLm1vZGVsKTtcbiAgICB0aGlzLl9jb21iby5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uQ29tYm9DaGFuZ2UsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgdGhpcy5fY29tYm8ub24oJ2FkZGl0ZW0nLCB7IHN1YnNjcmliZXI6IG9uQWRkSXRlbSwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuZnVuY3Rpb24gb25Db21ib0NoYW5nZShtc2csIGRhdGEpIHtcbiAgICBpZiAoZGF0YS5uZXdWYWx1ZSAmJiBydW5EYXRhVmFsaWRhdGlvbi5jYWxsKHRoaXMsIG1zZywgZGF0YSkpIHRoaXMuX2xpc3QubW9kZWwucHVzaChkYXRhLm5ld1ZhbHVlKTtcbiAgICB0aGlzLl9jb21iby5kYXRhLmRlbCgpO1xuICAgIC8vIGJlY2F1c2Ugb2Ygc3VwZXJjb21ibyBsaXN0ZW5lcnMgb2ZmIHlvdSBoYXZlIHRvIHNldCBfdmFsdWUgZXhwbGljaXRseVxuICAgIHRoaXMuX2NvbWJvLmRhdGEuX3ZhbHVlID0gJyc7XG59XG5cbmZ1bmN0aW9uIHJ1bkRhdGFWYWxpZGF0aW9uKG1zZywgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmFsaWRhdGlvbiA/IHRoaXMuX2RhdGFWYWxpZGF0aW9uKG1zZywgZGF0YSwgdGhpcy5fbGlzdC5tb2RlbC5nZXQoKSkgOiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvbkl0ZW1zQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoQ09NQk9fTElTVF9DSEFOR0VfTUVTU0FHRSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0X2dldCgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgPyBfLmNsb25lKHZhbHVlKSA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdF9zZXQodmFsdWUpIHtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0X2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5zZXQoW10pO1xufVxuXG5mdW5jdGlvbiBvbkFkZEl0ZW0obXNnLCBkYXRhKSB7XG4gICAgdGhpcy5wb3N0TWVzc2FnZSgnYWRkaXRlbScsIGRhdGEpO1xuICAgIHRoaXMuZXZlbnRzLnBvc3RNZXNzYWdlKCdtaWxvX2NvbWJvbGlzdGFkZGl0ZW0nLCBkYXRhKTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudCxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBNTERhdGUgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRGF0ZScsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxEYXRlX2dldCxcbiAgICAgICAgc2V0OiBNTERhdGVfc2V0LFxuICAgICAgICBkZWw6IE1MRGF0ZV9kZWxcbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1kYXRlJ1xuICAgIH1cbn0pO1xuXG5fLmV4dGVuZFByb3RvKE1MRGF0ZSwge1xuICAgIGdldE1pbjogTUxEYXRlJGdldE1pbixcbiAgICBzZXRNaW46IE1MRGF0ZSRzZXRNaW4sXG4gICAgZ2V0TWF4OiBNTERhdGUkZ2V0TWF4LFxuICAgIHNldE1heDogTUxEYXRlJHNldE1heFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEYXRlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTERhdGU7XG5cbmZ1bmN0aW9uIE1MRGF0ZSRnZXRNaW4oKSB7XG4gICAgcmV0dXJuIF8uZGF0ZSh0aGlzLmVsLm1pbik7XG59XG5cbmZ1bmN0aW9uIE1MRGF0ZSRzZXRNaW4odmFsdWUpIHtcbiAgICB2YXIgZGF0ZSA9IF8udG9EYXRlKHZhbHVlKTtcblxuICAgIHRoaXMuZWwubWluID0gZGF0ZSA/IHRvSVNPODYwMUZvcm1hdChkYXRlKSA6ICcnO1xufVxuXG5mdW5jdGlvbiBNTERhdGUkZ2V0TWF4KCkge1xuICAgIHJldHVybiBfLmRhdGUodGhpcy5lbC5tYXgpO1xufVxuXG5mdW5jdGlvbiBNTERhdGUkc2V0TWF4KHZhbHVlKSB7XG4gICAgdmFyIGRhdGUgPSBfLnRvRGF0ZSh2YWx1ZSk7XG5cbiAgICB0aGlzLmVsLm1heCA9IGRhdGUgPyB0b0lTTzg2MDFGb3JtYXQoZGF0ZSkgOiAnJztcbn1cblxuZnVuY3Rpb24gTUxEYXRlX2dldCgpIHtcbiAgICByZXR1cm4gXy50b0RhdGUodGhpcy5lbC52YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIE1MRGF0ZV9zZXQodmFsdWUpIHtcbiAgICB2YXIgZGF0ZSA9IF8udG9EYXRlKHZhbHVlKTtcblxuICAgIHRoaXMuZWwudmFsdWUgPSBkYXRlID8gdG9JU084NjAxRm9ybWF0KGRhdGUpIDogJyc7XG5cbiAgICBkaXNwYXRjaElucHV0TWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBNTERhdGVfZGVsKCkge1xuICAgIHRoaXMuZWwudmFsdWUgPSAnJztcblxuICAgIGRpc3BhdGNoSW5wdXRNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoSW5wdXRNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoJ2lucHV0Jyk7IC8vIERpc3BhdGNoIHRoZSAnaW5wdXQnICh1c3VhbGx5IGRpc3BhdGNoZWQgYnkgdGhlIHVuZGVybHlpbmcgPGlucHV0PiBlbGVtZW50KSBldmVudCBzbyB0aGF0IHRoZSBkYXRhIGNoYW5nZSBjYW4gYmUgbGlzdGVuZWQgdG9cbn1cblxuZnVuY3Rpb24gdG9JU084NjAxRm9ybWF0KGRhdGUpIHtcbiAgICB2YXIgZGF0ZUFyciA9IFtkYXRlLmdldEZ1bGxZZWFyKCksIHBhZChkYXRlLmdldE1vbnRoKCkgKyAxKSwgcGFkKGRhdGUuZ2V0RGF0ZSgpKV07XG5cbiAgICB2YXIgZGF0ZVN0ciA9IGRhdGVBcnIuam9pbignLScpO1xuXG4gICAgcmV0dXJuIGRhdGVTdHI7XG5cbiAgICBmdW5jdGlvbiBwYWQobikge1xuICAgICAgICByZXR1cm4gbiA8IDEwID8gJzAnICsgbiA6IG47XG4gICAgfVxufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIE1MRHJvcFRhcmdldCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxEcm9wVGFyZ2V0JywgWydkcm9wJ10pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MRHJvcFRhcmdldCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEcm9wVGFyZ2V0OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRvVCA9IG1pbG8udXRpbC5kb1QsXG4gICAgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzLFxuICAgIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIHVuaXF1ZUlkID0gbWlsby51dGlsLnVuaXF1ZUlkO1xuXG52YXIgVFJFRV9URU1QTEFURSA9ICc8dWwgY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1saXN0XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7fiBpdC5kYXRhLml0ZW1zIDppdGVtOmluZGV4IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyB2YXIgaGFzU3ViVHJlZSA9IGl0ZW0uaXRlbXMgJiYgaXRlbS5pdGVtcy5sZW5ndGg7IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkge3s/IGhhc1N1YlRyZWUgfX1jbGFzcz1cIm1sLXVpLWZvbGR0cmVlLS1oYXMtbXVsdGlwbGVcInt7P319PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1pdGVtXCIgZGF0YS1pdGVtLWlkPVwie3s9IGl0Lml0ZW1JRHNbaW5kZXhdIH19XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PyBoYXNTdWJUcmVlIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWwtdWktZm9sZHRyZWUtYnV0dG9uXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PSBpdC5pdGVtVGVtcGxhdGUoeyBpdGVtOiBpdGVtIH0pIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGhhc1N1YlRyZWUgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s9IGl0LnRyZWVUZW1wbGF0ZShpdGVtKSB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e359fVxcXG4gICAgICAgICAgICAgICAgICAgIDwvdWw+JztcblxudmFyIERFRkFVTFRfQ09NUElMRURfSVRFTV9URU1QTEFURSA9IGRvVC5jb21waWxlKCdcXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1sYWJlbFwiPlxcXG4gICAgICAgICAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWwgfX1cXFxuICAgICAgICAgICAgPC9zcGFuPicpLFxuICAgIENPTVBJTEVEX1RSRUVfVEVNUExBVEUgPSBkb1QuY29tcGlsZShUUkVFX1RFTVBMQVRFKTtcblxudmFyIE1MRm9sZFRyZWUgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRm9sZFRyZWUnLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnY2xpY2sgZGJsY2xpY2snOiB7IHN1YnNjcmliZXI6IG9uSXRlbUV2ZW50LCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWZvbGR0cmVlLW1haW4nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxGb2xkVHJlZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxGb2xkVHJlZTtcblxuXy5leHRlbmRQcm90byhNTEZvbGRUcmVlLCB7XG4gICAgc2V0SXRlbVRlbXBsYXRlOiBNTEZvbGRUcmVlJHNldEl0ZW1UZW1wbGF0ZSxcbiAgICByZW5kZXJUcmVlOiBNTEZvbGRUcmVlJHJlbmRlclRyZWUsXG4gICAgc2V0QWN0aXZlSXRlbTogTUxGb2xkVHJlZSRzZXRBY3RpdmVJdGVtLFxuICAgIHRvZ2dsZUl0ZW06IE1MRm9sZFRyZWUkdG9nZ2xlSXRlbVxufSk7XG5cbmZ1bmN0aW9uIGZvbGRVbmZvbGQoZWwsIG9wZW5lZCkge1xuICAgIGlmIChvcGVuZWQpIGVsLmNsYXNzTGlzdC5hZGQoJ21sLXVpLWZvbGR0cmVlLS11bmZvbGQnLCBvcGVuZWQpO2Vsc2UgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnbWwtdWktZm9sZHRyZWUtLXVuZm9sZCcpO1xufVxuXG5mdW5jdGlvbiBpdGVtTWVzc2FnZShtc2csIGVsKSB7XG4gICAgdmFyIGlkID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWl0ZW0taWQnKSxcbiAgICAgICAgaXRlbSA9IHRoaXMuX2l0ZW1zTWFwW2lkXTtcblxuICAgIHRoaXMucG9zdE1lc3NhZ2UoJ21sZm9sZHRyZWVfJyArIG1zZywge1xuICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICBlbDogZWxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gb25JdGVtRXZlbnQobXNnLCBlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnbWwtdWktZm9sZHRyZWUtYnV0dG9uJykpIGZvbGRVbmZvbGQoZWwucGFyZW50Tm9kZS5wYXJlbnROb2RlKTtlbHNlIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ21sLXVpLWZvbGR0cmVlLWxhYmVsJykpIGl0ZW1NZXNzYWdlLmNhbGwodGhpcywgbXNnLCBlbC5wYXJlbnROb2RlKTtlbHNlIHJldHVybjtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xufVxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHNldEl0ZW1UZW1wbGF0ZSh0ZW1wbGF0ZVN0cikge1xuICAgIHRoaXMuX2l0ZW1UZW1wbGF0ZSA9IGRvVC5jb21waWxlKHRlbXBsYXRlU3RyKTtcbn1cblxuZnVuY3Rpb24gTUxGb2xkVHJlZSRyZW5kZXJUcmVlKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gICAgc2VsZi5faXRlbXNNYXAgPSB7fTtcbiAgICB0aGlzLmVsLmlubmVySFRNTCA9IF9yZW5kZXJUcmVlKGRhdGEpO1xuXG4gICAgZnVuY3Rpb24gX3JlbmRlclRyZWUoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5pdGVtcykgdmFyIGl0ZW1zSURzID0gXy5tYXAoZGF0YS5pdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBpZCA9IGl0ZW0uaWQgfHwgdW5pcXVlSWQoKTtcbiAgICAgICAgICAgIGlmIChzZWxmLl9pdGVtc01hcFtpZF0pIHRocm93IG5ldyBFcnJvcignTUxGb2xkVHJlZTogaXRlbSBoYXMgZHVwbGljYXRlIElEOicgKyBpZCk7XG4gICAgICAgICAgICBzZWxmLl9pdGVtc01hcFtpZF0gPSBpdGVtO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gQ09NUElMRURfVFJFRV9URU1QTEFURSh7XG4gICAgICAgICAgICBpdGVtSURzOiBpdGVtc0lEcyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBpdGVtVGVtcGxhdGU6IHNlbGYuX2l0ZW1UZW1wbGF0ZSB8fCBERUZBVUxUX0NPTVBJTEVEX0lURU1fVEVNUExBVEUsXG4gICAgICAgICAgICB0cmVlVGVtcGxhdGU6IF9yZW5kZXJUcmVlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gTUxGb2xkVHJlZSRzZXRBY3RpdmVJdGVtKGlkLCBjc3NDbGFzcykge1xuICAgIGNzc0NsYXNzID0gY3NzQ2xhc3MgfHwgJ21sLXVpLWZvbGR0cmVlLWFjdGl2ZSc7XG4gICAgdmFyIGl0ZW1zID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYubWwtdWktZm9sZHRyZWUtaXRlbScpO1xuICAgIF8uZm9yRWFjaChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKGNzc0NsYXNzKTtcbiAgICB9KTtcbiAgICBpZiAoaWQpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5tbC11aS1mb2xkdHJlZS1pdGVtW2RhdGEtaXRlbS1pZD1cIicgKyBpZCArICdcIl0nKTtcbiAgICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKGNzc0NsYXNzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIE1MRm9sZFRyZWUkdG9nZ2xlSXRlbShpZCwgb3BlbmVkKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5tbC11aS1mb2xkdHJlZS1pdGVtW2RhdGEtaXRlbS1pZD1cIicgKyBpZCArICdcIl0nKTtcbiAgICBmb2xkVW5mb2xkKGl0ZW0ucGFyZW50Tm9kZSwgb3BlbmVkKTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudCxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBNTEdyb3VwID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEdyb3VwJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktZ3JvdXAnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxHcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxHcm91cDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudCxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBNTEh5cGVybGluayA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxIeXBlcmxpbmsnLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1oeXBlcmxpbmsnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxIeXBlcmxpbmspO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSHlwZXJsaW5rOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIElNQUdFX0NIQU5HRV9NRVNTQUdFID0gJ21saW1hZ2VjaGFuZ2UnO1xuXG52YXIgTUxJbWFnZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxJbWFnZScsIHtcbiAgICBkYXRhOiB7XG4gICAgICAgIHNldDogTUxJbWFnZV9zZXQsXG4gICAgICAgIGdldDogTUxJbWFnZV9nZXQsXG4gICAgICAgIGRlbDogTUxJbWFnZV9kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogSU1BR0VfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnLnNyYyc6IHsgc3Vic2NyaWJlcjogb25Nb2RlbENoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICB0YWdOYW1lOiAnaW1nJyxcbiAgICAgICAgY2xzOiAnbWwtdWktaW1hZ2UnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxJbWFnZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxJbWFnZTtcblxuXy5leHRlbmRQcm90byhNTEltYWdlLCB7XG4gICAgaW5pdDogTUxJbWFnZSRpbml0XG59KTtcblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXplIHJhZGlvIGdyb3VwIGFuZCBzZXR1cFxuICovXG5mdW5jdGlvbiBNTEltYWdlJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2V0cyBpbWFnZSB2YWx1ZVxuICogUmVwbGFjZXMgdGhlIGRhdGEgc2V0IG9wZXJhdGlvbiB0byBkZWFsIHdpdGggcmFkaW8gYnV0dG9uc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBzZXRcbiAqL1xuZnVuY3Rpb24gTUxJbWFnZV9zZXQodmFsdWUpIHtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEdldHMgZ3JvdXAgdmFsdWVcbiAqIFJldHJpZXZlcyB0aGUgc2VsZWN0ZWQgdmFsdWUgb2YgdGhlIGdyb3VwXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBNTEltYWdlX2dldCgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgPyBfLmNsb25lKHZhbHVlKSA6IHZhbHVlO1xufVxuXG4vKipcbiAqIERlbGV0ZWQgZ3JvdXAgdmFsdWVcbiAqIERlbGV0ZXMgdGhlIHZhbHVlIG9mIHRoZSBncm91cCwgc2V0dGluZyBpdCB0byBlbXB0eVxuICovXG5mdW5jdGlvbiBNTEltYWdlX2RlbCgpIHtcbiAgICB0aGlzLm1vZGVsLmRlbCgpO1xufVxuXG4vLyBQb3N0IHRoZSBkYXRhIGNoYW5nZVxuZnVuY3Rpb24gZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoSU1BR0VfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5mdW5jdGlvbiBvbk1vZGVsQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLmVsLnNyYyA9IGRhdGEubmV3VmFsdWU7XG4gICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnQsXG4gICAgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG52YXIgTUxJbnB1dCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxJbnB1dCcsIHtcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWlucHV0J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MSW5wdXQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSW5wdXQ7XG5cbl8uZXh0ZW5kUHJvdG8oTUxJbnB1dCwge1xuICAgIGRpc2FibGU6IE1MSW5wdXQkZGlzYWJsZSxcbiAgICBpc0Rpc2FibGVkOiBNTElucHV0JGlzRGlzYWJsZWQsXG4gICAgc2V0TWF4TGVuZ3RoOiBNTElucHV0JHNldE1heExlbmd0aFxufSk7XG5cbmZ1bmN0aW9uIE1MSW5wdXQkZGlzYWJsZShkaXNhYmxlKSB7XG4gICAgdGhpcy5lbC5kaXNhYmxlZCA9IGRpc2FibGU7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXQkaXNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLmVsLmRpc2FibGVkO1xufVxuXG5mdW5jdGlvbiBNTElucHV0JHNldE1heExlbmd0aChsZW5ndGgpIHtcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnbWF4bGVuZ3RoJywgbGVuZ3RoKTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudCxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBJTlBVVF9MSVNUX0NIQU5HRV9NRVNTQUdFID0gJ21saW5wdXRsaXN0Y2hhbmdlJztcblxudmFyIGFzeW5jSGFuZGxlciA9IGZ1bmN0aW9uICh2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayh2YWx1ZSk7XG59O1xuXG52YXIgTUxJbnB1dExpc3QgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MSW5wdXRMaXN0Jywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1pbnB1dC1saXN0J1xuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MSW5wdXRMaXN0X2dldCxcbiAgICAgICAgc2V0OiBNTElucHV0TGlzdF9zZXQsXG4gICAgICAgIGRlbDogTUxJbnB1dExpc3RfZGVsLFxuICAgICAgICBzcGxpY2U6IE1MSW5wdXRMaXN0X3NwbGljZSxcbiAgICAgICAgZXZlbnQ6IElOUFVUX0xJU1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICdcXFxuICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0Omxpc3RcIj5cXFxuICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdEl0ZW06aXRlbVwiIGNsYXNzPVwibGlzdC1pdGVtXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltkYXRhXTpsYWJlbFwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiW2V2ZW50c106ZGVsZXRlQnRuXCIgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbWwtYmluZD1cIk1MSW5wdXQ6aW5wdXRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxcXG4gICAgICAgICAgICA8YnV0dG9uIG1sLWJpbmQ9XCJNTEJ1dHRvbjpidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiPlxcXG4gICAgICAgICAgICAgICAgQWRkXFxcbiAgICAgICAgICAgIDwvYnV0dG9uPidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTElucHV0TGlzdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxJbnB1dExpc3Q7XG5cbl8uZXh0ZW5kUHJvdG8oTUxJbnB1dExpc3QsIHtcbiAgICBpbml0OiBNTElucHV0TGlzdCRpbml0LFxuICAgIHNldEFzeW5jOiBNTElucHV0TGlzdCRzZXRBc3luYyxcbiAgICBzZXRQbGFjZUhvbGRlcjogTUxJbnB1dExpc3Qkc2V0UGxhY2VIb2xkZXIsXG4gICAgZGVzdHJveTogTUxJbnB1dExpc3QkZGVzdHJveVxufSk7XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vbmNlKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbiAgICB0aGlzLm1vZGVsLnNldChbXSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICByZW5kZXIuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Qkc2V0UGxhY2VIb2xkZXIocGxhY2VIb2xkZXIpIHtcbiAgICB0aGlzLl9pbnB1dC5lbC5zZXRBdHRyaWJ1dGUoJ3BsYWNlSG9sZGVyJywgcGxhY2VIb2xkZXIpO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdCRzZXRBc3luYyhuZXdIYW5kbGVyKSB7XG4gICAgYXN5bmNIYW5kbGVyID0gbmV3SGFuZGxlciB8fCBhc3luY0hhbmRsZXI7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JGRlc3Ryb3koKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fY29ubmVjdG9yICYmIG1pbG8ubWluZGVyLmRlc3Ryb3lDb25uZWN0b3IodGhpcy5fY29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoKS5iaW5kZXIoKTtcbiAgICBjb21wb25lbnRTZXR1cC5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnRTZXR1cCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAnX2lucHV0JzogdGhpcy5jb250YWluZXIuc2NvcGUuaW5wdXQsXG4gICAgICAgICdfYnV0dG9uJzogdGhpcy5jb250YWluZXIuc2NvcGUuYnV0dG9uLFxuICAgICAgICAnX2xpc3QnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5saXN0XG4gICAgfSk7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbWlsby5taW5kZXIodGhpcy5fbGlzdC5tb2RlbCwgJzw8PC0+Pj4nLCB0aGlzLm1vZGVsKTtcbiAgICB0aGlzLl9idXR0b24uZXZlbnRzLm9uKCdjbGljaycsIHsgc3Vic2NyaWJlcjogb25DbGljaywgY29udGV4dDogdGhpcyB9KTtcbn1cblxuZnVuY3Rpb24gb25DbGljayhtc2cpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLl9pbnB1dC5kYXRhLmdldCgwKTtcbiAgICBpZiAodGhpcy5faW5wdXQuZGF0YSkgYXN5bmNIYW5kbGVyKHZhbHVlLCBmdW5jdGlvbiAobGFiZWwsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2xpc3QubW9kZWwucHVzaCh7IGxhYmVsOiBsYWJlbCwgdmFsdWU6IHZhbHVlIH0pO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5faW5wdXQuZGF0YS5kZWwoKTtcbn1cblxuZnVuY3Rpb24gb25JdGVtc0NoYW5nZShtc2csIGRhdGEpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKElOUFVUX0xJU1RfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdF9nZXQoKSB7XG4gICAgdmFyIG1vZGVsID0gdGhpcy5tb2RlbC5nZXQoKTtcbiAgICByZXR1cm4gbW9kZWwgPyBfLmNsb25lKG1vZGVsKSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Rfc2V0KHZhbHVlKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdF9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWwuc2V0KFtdKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Rfc3BsaWNlKCkge1xuICAgIC8vIC4uLiBhcmd1bWVudHNcbiAgICB0aGlzLm1vZGVsLnNwbGljZS5hcHBseSh0aGlzLm1vZGVsLCBhcmd1bWVudHMpO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1MTGlzdCA9IG1vZHVsZS5leHBvcnRzID0gbWlsby5jcmVhdGVDb21wb25lbnRDbGFzcyh7XG4gICAgY2xhc3NOYW1lOiAnTUxMaXN0JyxcbiAgICBmYWNldHM6IHtcbiAgICAgICAgZG9tOiB7XG4gICAgICAgICAgICBjbHM6ICdtbC11aS1saXN0J1xuICAgICAgICB9LFxuICAgICAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgICAgICBtb2RlbDogdW5kZWZpbmVkLFxuICAgICAgICBsaXN0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIG1ldGhvZHM6IHtcbiAgICAgICAgaW5pdDogTUxMaXN0JGluaXQsXG4gICAgICAgIGRlc3Ryb3k6IE1MTGlzdCRkZXN0cm95LFxuICAgICAgICByZW1vdmVJdGVtOiBNTExpc3QkcmVtb3ZlSXRlbSxcbiAgICAgICAgbW92ZUl0ZW06IE1MTGlzdCRtb3ZlSXRlbVxuICAgIH1cbn0pO1xuXG5mdW5jdGlvbiBNTExpc3QkaW5pdCgpIHtcbiAgICBNTExpc3Quc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub24oJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5mdW5jdGlvbiBNTExpc3QkZGVzdHJveSgpIHtcbiAgICB0aGlzLl9jb25uZWN0b3IgJiYgbWlsby5taW5kZXIuZGVzdHJveUNvbm5lY3Rvcih0aGlzLl9jb25uZWN0b3IpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG4gICAgTUxMaXN0LnN1cGVyLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gTUxMaXN0JHJlbW92ZUl0ZW0oaW5kZXgpIHtcbiAgICB0aGlzLm1vZGVsLnNwbGljZShpbmRleCwgMSk7XG59XG5cbmZ1bmN0aW9uIE1MTGlzdCRtb3ZlSXRlbShmcm9tLCB0bykge1xuICAgIHZhciBzcGxpY2VkRGF0YSA9IHRoaXMubW9kZWwuc3BsaWNlKGZyb20sIDEpO1xuICAgIHJldHVybiB0aGlzLm1vZGVsLnNwbGljZSh0bywgMCwgc3BsaWNlZERhdGFbMF0pO1xufVxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQoW10pO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG1pbG8ubWluZGVyKHRoaXMubW9kZWwsICc8PDwtJywgdGhpcy5kYXRhKS5kZWZlckNoYW5nZU1vZGUoJzw8PC0+Pj4nKTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBEcmFnRHJvcCA9IG1pbG8udXRpbC5kcmFnRHJvcDtcblxudmFyIE1MTGlzdEl0ZW0gPSBtb2R1bGUuZXhwb3J0cyA9IG1pbG8uY3JlYXRlQ29tcG9uZW50Q2xhc3Moe1xuICAgIGNsYXNzTmFtZTogJ01MTGlzdEl0ZW0nLFxuICAgIHN1cGVyQ2xhc3NOYW1lOiAnTUxMaXN0SXRlbVNpbXBsZScsXG4gICAgZmFjZXRzOiB7XG4gICAgICAgIGRyYWc6IHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAgICAgJ2RyYWdzdGFydCc6IHsgc3Vic2NyaWJlcjogb25EcmFnU3RhcnQsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1ldGE6IHtcbiAgICAgICAgICAgICAgICBwYXJhbXM6ICdnZXRNZXRhRGF0YSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZHJvcDoge1xuICAgICAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICAgICAnZHJhZ2VudGVyJzogeyBzdWJzY3JpYmVyOiBvbkRyYWdIb3ZlciwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgICAgICdkcmFnb3Zlcic6IHsgc3Vic2NyaWJlcjogb25EcmFnSG92ZXIsIGNvbnRleHQ6ICdvd25lcicgfSxcbiAgICAgICAgICAgICAgICAnZHJhZ2xlYXZlJzogeyBzdWJzY3JpYmVyOiBvbkRyYWdPdXQsIGNvbnRleHQ6ICdvd25lcicgfSxcbiAgICAgICAgICAgICAgICAnZHJvcCc6IHsgc3Vic2NyaWJlcjogb25JdGVtRHJvcCwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWxsb3c6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBpc0NvbXBvbmVudEFsbG93ZWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgICBpbml0OiBNTExpc3RJdGVtJGluaXQsXG4gICAgICAgIG1vdmVJdGVtOiBNTExpc3RJdGVtJG1vdmVJdGVtLFxuICAgICAgICByZW1vdmVJdGVtOiBNTExpc3RJdGVtJHJlbW92ZUl0ZW0sXG4gICAgICAgIGdldE1ldGFEYXRhOiBNTExpc3RJdGVtJGdldE1ldGFEYXRhLFxuICAgICAgICBpc0Ryb3BBbGxvd2VkOiBNTExpc3RJdGVtJGlzRHJvcEFsbG93ZWRcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRpbml0KCkge1xuICAgIE1MTGlzdEl0ZW0uc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub24oJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdmFyIGRlbGV0ZUJ0biA9IHRoaXMuY29udGFpbmVyLnNjb3BlLmRlbGV0ZUJ0bjtcbiAgICBkZWxldGVCdG4gJiYgZGVsZXRlQnRuLmV2ZW50cy5vbignY2xpY2snLCB7IHN1YnNjcmliZXI6IHRoaXMucmVtb3ZlSXRlbSwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRyZW1vdmVJdGVtKCkge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciBsaXN0T3duZXIgPSB0aGlzLml0ZW0ubGlzdC5vd25lcjtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIGxpc3RPd25lciAmJiBsaXN0T3duZXIucmVtb3ZlSXRlbSh0aGlzLml0ZW0uaW5kZXgpO1xufVxuXG5mdW5jdGlvbiBNTExpc3RJdGVtJG1vdmVJdGVtKGluZGV4KSB7XG4gICAgdmFyIGxpc3RPd25lciA9IHRoaXMuaXRlbS5saXN0Lm93bmVyO1xuICAgIGxpc3RPd25lciAmJiBsaXN0T3duZXIubW92ZUl0ZW0odGhpcy5pdGVtLmluZGV4LCBpbmRleCk7XG59XG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kaXNEcm9wQWxsb3dlZChtZXRhIC8qLCBkcmFnRHJvcCovKSB7XG4gICAgdmFyIENvbXBvbmVudCA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cy5nZXQobWV0YS5jb21wQ2xhc3MpO1xuXG4gICAgcmV0dXJuIG1ldGEucGFyYW1zICYmIF8uaXNOdW1lcmljKG1ldGEucGFyYW1zLmluZGV4KSAmJiAoQ29tcG9uZW50ID09IE1MTGlzdEl0ZW0gfHwgQ29tcG9uZW50LnByb3RvdHlwZSBpbnN0YW5jZW9mIE1MTGlzdEl0ZW0pICYmIGRyYWdnaW5nRnJvbVNhbWVMaXN0LmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIGRyYWdnaW5nRnJvbVNhbWVMaXN0KGNvbXApIHtcbiAgICBjb21wID0gY29tcCB8fCBEcmFnRHJvcC5zZXJ2aWNlLmdldEN1cnJlbnREcmFnU291cmNlKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHNvdXJjZUxpc3QgPSBjb21wLml0ZW0ubGlzdDtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHJldHVybiBzb3VyY2VMaXN0ID09IHRoaXMuaXRlbS5saXN0O1xufVxuXG5mdW5jdGlvbiBpc0NvbXBvbmVudEFsbG93ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEcm9wQWxsb3dlZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5mdW5jdGlvbiBvbkl0ZW1Ecm9wKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICBvbkRyYWdPdXQuY2FsbCh0aGlzKTtcbiAgICB2YXIgZHQgPSBuZXcgRHJhZ0Ryb3AoZXZlbnQpO1xuICAgIHZhciBtZXRhID0gZHQuZ2V0Q29tcG9uZW50TWV0YSgpO1xuICAgIHZhciBzdGF0ZSA9IGR0LmdldENvbXBvbmVudFN0YXRlKCk7XG4gICAgdmFyIGxpc3RPd25lciA9IHRoaXMuaXRlbS5saXN0Lm93bmVyO1xuICAgIHZhciBpbmRleCA9IG1ldGEucGFyYW1zICYmIG1ldGEucGFyYW1zLmluZGV4O1xuICAgIHZhciBkcm9wUG9zaXRpb24gPSBEcmFnRHJvcC5nZXREcm9wUG9zaXRpb25ZKGV2ZW50LCB0aGlzLmVsKTtcbiAgICB2YXIgaXNCZWxvdyA9IGRyb3BQb3NpdGlvbiA9PSAnYmVsb3cnO1xuICAgIHZhciBpc0Fib3ZlID0gZHJvcFBvc2l0aW9uID09ICdhYm92ZSc7XG4gICAgdmFyIHRhcmdldEluZGV4O1xuXG4gICAgaWYgKGRyYWdnaW5nRnJvbVNhbWVMaXN0LmNhbGwodGhpcykpIHtcbiAgICAgICAgaWYgKHN0YXRlLmNvbXBOYW1lID09IHRoaXMubmFtZSkgcmV0dXJuO1xuICAgICAgICB2YXIgc3RhdGVJbmRleCA9IHN0YXRlLmZhY2V0c1N0YXRlcy5pdGVtLnN0YXRlLmluZGV4O1xuICAgICAgICB2YXIgaXNNb3ZlRG93biA9IHN0YXRlSW5kZXggPCB0aGlzLml0ZW0uaW5kZXg7XG4gICAgICAgIHZhciBpc1NhbWVQb3NpdGlvbjtcbiAgICAgICAgaWYgKGlzTW92ZURvd24pIHtcbiAgICAgICAgICAgIGlzU2FtZVBvc2l0aW9uID0gaXNBYm92ZSAmJiBzdGF0ZUluZGV4ICsgMSA9PSB0aGlzLml0ZW0uaW5kZXg7XG4gICAgICAgICAgICBpZiAoaXNTYW1lUG9zaXRpb24pIHJldHVybjtcbiAgICAgICAgICAgIHRhcmdldEluZGV4ID0gdGhpcy5pdGVtLmluZGV4IC0gaXNBYm92ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vbW92ZSB1cFxuICAgICAgICAgICAgaXNTYW1lUG9zaXRpb24gPSBpc0JlbG93ICYmIHN0YXRlSW5kZXggLSAxID09IHRoaXMuaXRlbS5pbmRleDtcbiAgICAgICAgICAgIGlmIChpc1NhbWVQb3NpdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLml0ZW0uaW5kZXggKyBpc0JlbG93O1xuICAgICAgICB9XG4gICAgICAgIGxpc3RPd25lci5tb3ZlSXRlbSgraW5kZXgsIHRhcmdldEluZGV4LCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLml0ZW0uaW5kZXggKyBpc0JlbG93O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBzdGF0ZS5mYWNldHNTdGF0ZXMuZGF0YS5zdGF0ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgbGlzdE93bmVyLmRhdGEuc3BsaWNlKHRhcmdldEluZGV4LCAwLCBkYXRhKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KCkgLypldmVudFR5cGUsIGV2ZW50Ki97XG4gICAgRHJhZ0Ryb3Auc2VydmljZS5vbmNlKCdkcmFnZHJvcGNvbXBsZXRlZCcsIHsgc3Vic2NyaWJlcjogb25EcmFnRHJvcENvbXBsZXRlZCwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuZnVuY3Rpb24gb25EcmFnSG92ZXIoKSAvKmV2ZW50VHlwZSwgZXZlbnQqL3tcbiAgICB0aGlzLmRvbS5hZGRDc3NDbGFzc2VzKCdtbC1kcmFnLW92ZXInKTtcbn1cblxuZnVuY3Rpb24gb25EcmFnT3V0KCkgLypldmVudFR5cGUsIGV2ZW50Ki97XG4gICAgdGhpcy5kb20ucmVtb3ZlQ3NzQ2xhc3NlcygnbWwtZHJhZy1vdmVyJyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0Ryb3BDb21wbGV0ZWQobXNnLCBkYXRhKSB7XG4gICAgdmFyIGRyb3BUYXJnZXQgPSBkYXRhLmNvbXBvbmVudDtcbiAgICB2YXIgZHJvcHBlZEluQW5vdGhlckxpc3QgPSBkYXRhLmV2ZW50VHlwZSA9PSAnZHJvcCcgJiYgIWRyYWdnaW5nRnJvbVNhbWVMaXN0LmNhbGwodGhpcywgZHJvcFRhcmdldCk7XG4gICAgaWYgKGRyb3BwZWRJbkFub3RoZXJMaXN0KSB0aGlzLml0ZW0ucmVtb3ZlSXRlbSgpO1xufVxuXG5mdW5jdGlvbiBNTExpc3RJdGVtJGdldE1ldGFEYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGluZGV4OiB0aGlzLml0ZW0uaW5kZXhcbiAgICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIExJU1RJVEVNX0NIQU5HRV9NRVNTQUdFID0gJ21sbGlzdGl0ZW1jaGFuZ2UnO1xuXG52YXIgTUxMaXN0SXRlbVNpbXBsZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxMaXN0SXRlbVNpbXBsZScsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxMaXN0SXRlbVNpbXBsZV9nZXQsXG4gICAgICAgIHNldDogTUxMaXN0SXRlbVNpbXBsZV9zZXQsXG4gICAgICAgIGRlbDogTUxMaXN0SXRlbVNpbXBsZV9kZWwsXG4gICAgICAgIGV2ZW50OiBMSVNUSVRFTV9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHVuZGVmaW5lZCxcbiAgICBpdGVtOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MTGlzdEl0ZW1TaW1wbGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MTGlzdEl0ZW1TaW1wbGU7XG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW1TaW1wbGVfZ2V0KCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0KCk7XG4gICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyA/IF8uY2xvbmUodmFsdWUpIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW1TaW1wbGVfc2V0KHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JykgdGhpcy5kYXRhLl9zZXQodmFsdWUpO1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbiAgICBfc2VuZENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW1TaW1wbGVfZGVsKCkge1xuICAgIHRoaXMuZGF0YS5fZGVsKCk7XG4gICAgdGhpcy5tb2RlbC5kZWwoKTtcbiAgICBfc2VuZENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gX3NlbmRDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoTElTVElURU1fQ0hBTkdFX01FU1NBR0UpO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cyxcbiAgICB1bmlxdWVJZCA9IG1pbG8udXRpbC51bmlxdWVJZDtcblxudmFyIFJBRElPX0NIQU5HRV9NRVNTQUdFID0gJ21scmFkaW9ncm91cGNoYW5nZScsXG4gICAgRUxFTUVOVF9OQU1FX1BST1BFUlRZID0gJ19tbFJhZGlvR3JvdXBFbGVtZW50SUQnLFxuICAgIEVMRU1FTlRfTkFNRV9QUkVGSVggPSAnbWwtcmFkaW8tZ3JvdXAtJztcblxudmFyIE1MUmFkaW9Hcm91cCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxSYWRpb0dyb3VwJywge1xuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTFJhZGlvR3JvdXBfc2V0LFxuICAgICAgICBnZXQ6IE1MUmFkaW9Hcm91cF9nZXQsXG4gICAgICAgIGRlbDogTUxSYWRpb0dyb3VwX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBSQURJT19DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKionOiB7IHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ2NsaWNrJzogeyBzdWJzY3JpYmVyOiBvbkdyb3VwQ2xpY2ssIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktcmFkaW8tZ3JvdXAnXG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ3t7fiBpdC5yYWRpb09wdGlvbnMgOm9wdGlvbiB9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAge3sjI2RlZi5lbElEOnt7PSBpdC5lbGVtZW50TmFtZSB9fS17ez0gb3B0aW9uLnZhbHVlIH19I319IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInt7PSBpdC5fcmVuZGVyT3B0aW9ucy5vcHRpb25Dc3NDbGFzcyB8fCBcIicgKyBFTEVNRU5UX05BTUVfUFJFRklYICsgJ29wdGlvblwiIH19XCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwie3sjIGRlZi5lbElEIH19XCIgdHlwZT1cInJhZGlvXCIgdmFsdWU9XCJ7ez0gb3B0aW9uLnZhbHVlIH19XCIgbmFtZT1cInt7PSBpdC5lbGVtZW50TmFtZSB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ7eyMgZGVmLmVsSUQgfX1cIj57ez0gb3B0aW9uLmxhYmVsIH19PC9sYWJlbD4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcbiAgICAgICAgICAgICAgICAgICB7e359fSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFJhZGlvR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MUmFkaW9Hcm91cDtcblxuXy5leHRlbmRQcm90byhNTFJhZGlvR3JvdXAsIHtcbiAgICBpbml0OiBNTFJhZGlvR3JvdXAkaW5pdCxcbiAgICBkZXN0cm95OiBNTFJhZGlvR3JvdXAkZGVzdHJveSxcbiAgICBzZXRSZW5kZXJPcHRpb25zOiBNTFJhZGlvR3JvdXAkc2V0UmVuZGVyT3B0aW9uc1xufSk7XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGl6ZSByYWRpbyBncm91cCBhbmQgc2V0dXBcbiAqL1xuZnVuY3Rpb24gTUxSYWRpb0dyb3VwJGluaXQoKSB7XG4gICAgXy5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX3JhZGlvTGlzdCcsIFtdLCBfLkNPTkYpO1xuICAgIF8uZGVmaW5lUHJvcGVydHkodGhpcywgRUxFTUVOVF9OQU1FX1BST1BFUlRZLCBFTEVNRU5UX05BTUVfUFJFRklYICsgdW5pcXVlSWQoKSk7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucyA9IHt9O1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXAkc2V0UmVuZGVyT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucyA9IG9wdGlvbnM7XG59XG5cbi8qKlxuICogU2V0cyBncm91cCB2YWx1ZVxuICogUmVwbGFjZXMgdGhlIGRhdGEgc2V0IG9wZXJhdGlvbiB0byBkZWFsIHdpdGggcmFkaW8gYnV0dG9uc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBzZXRcbiAqL1xuZnVuY3Rpb24gTUxSYWRpb0dyb3VwX3NldCh2YWx1ZSkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5fcmFkaW9MaXN0LFxuICAgICAgICBzZXRSZXN1bHQ7XG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAocmFkaW8pIHtcbiAgICAgICAgICAgIHJhZGlvLmNoZWNrZWQgPSByYWRpby52YWx1ZSA9PSB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChyYWRpby5jaGVja2VkKSBzZXRSZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHNldFJlc3VsdDtcbiAgICB9XG59XG5cbi8qKlxuICogR2V0cyBncm91cCB2YWx1ZVxuICogUmV0cmlldmVzIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiB0aGUgZ3JvdXBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cF9nZXQoKSB7XG4gICAgdmFyIGNoZWNrZWQgPSBfLmZpbmQodGhpcy5fcmFkaW9MaXN0LCBmdW5jdGlvbiAocmFkaW8pIHtcbiAgICAgICAgcmV0dXJuIHJhZGlvLmNoZWNrZWQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hlY2tlZCAmJiBjaGVja2VkLnZhbHVlIHx8IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBEZWxldGVkIGdyb3VwIHZhbHVlXG4gKiBEZWxldGVzIHRoZSB2YWx1ZSBvZiB0aGUgZ3JvdXAsIHNldHRpbmcgaXQgdG8gZW1wdHlcbiAqL1xuZnVuY3Rpb24gTUxSYWRpb0dyb3VwX2RlbCgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX3JhZGlvTGlzdDtcbiAgICBpZiAob3B0aW9ucy5sZW5ndGgpIG9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAocmFkaW8pIHtcbiAgICAgICAgcmFkaW8uY2hlY2tlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBNYW5hZ2UgcmFkaW8gY2hpbGRyZW4gY2xpY2tzXG4gKi9cbmZ1bmN0aW9uIG9uR3JvdXBDbGljayhldmVudFR5cGUsIGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldC50eXBlID09ICdyYWRpbycpIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG4vLyBQb3N0IHRoZSBkYXRhIGNoYW5nZVxuZnVuY3Rpb24gZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoUkFESU9fQ0hBTkdFX01FU1NBR0UpO1xufVxuXG4vLyBTZXQgcmFkaW8gYnV0dG9uIGNoaWxkcmVuIG9uIG1vZGVsIGNoYW5nZVxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcih7XG4gICAgICAgIHJhZGlvT3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKSxcbiAgICAgICAgZWxlbWVudE5hbWU6IHRoaXNbRUxFTUVOVF9OQU1FX1BST1BFUlRZXSxcbiAgICAgICAgX3JlbmRlck9wdGlvbnM6IHRoaXMuX3JlbmRlck9wdGlvbnNcbiAgICB9KTtcblxuICAgIHZhciByYWRpb0VscyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cInJhZGlvXCJdJyksXG4gICAgICAgIG9wdGlvbnMgPSBfLnRvQXJyYXkocmFkaW9FbHMpO1xuXG4gICAgdGhpcy5fcmFkaW9MaXN0Lmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fcmFkaW9MaXN0LnNwbGljZS5hcHBseSh0aGlzLl9yYWRpb0xpc3QsIFswLCAwXS5jb25jYXQob3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXAkZGVzdHJveSgpIHtcbiAgICBkZWxldGUgdGhpcy5fcmFkaW9MaXN0O1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIFNFTEVDVF9DSEFOR0VfTUVTU0FHRSA9ICdtbHNlbGVjdGNoYW5nZSc7XG5cbnZhciBNTFNlbGVjdCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxTZWxlY3QnLCB7XG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXNlbGVjdCdcbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTFNlbGVjdF9zZXQsXG4gICAgICAgIGdldDogTUxTZWxlY3RfZ2V0LFxuICAgICAgICBkZWw6IE1MU2VsZWN0X2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBTRUxFQ1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ2NoYW5nZSc6IHsgc3Vic2NyaWJlcjogZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICd7e34gaXQuc2VsZWN0T3B0aW9ucyA6b3B0aW9uIH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwie3s9IG9wdGlvbi52YWx1ZSB9fVwiIHt7PyBvcHRpb24uc2VsZWN0ZWQgfX1zZWxlY3RlZHt7P319Pnt7PSBvcHRpb24ubGFiZWwgfX08L29wdGlvbj4gXFxcbiAgICAgICAgICAgICAgICAgICB7e359fSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFNlbGVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxTZWxlY3Q7XG5cbl8uZXh0ZW5kUHJvdG8oTUxTZWxlY3QsIHtcbiAgICBpbml0OiBNTFNlbGVjdCRpbml0LFxuICAgIHNldE9wdGlvbnM6IE1MU2VsZWN0JHNldE9wdGlvbnMsXG4gICAgZGlzYWJsZTogTUxTZWxlY3QkZGlzYWJsZVxufSk7XG5cbmZ1bmN0aW9uIE1MU2VsZWN0JGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fb3B0aW9uRWxzID0ge307XG4gICAgdGhpcy5faXNNdWx0aXBsZSA9IHRoaXMuZWwuaGFzQXR0cmlidXRlKCdtdWx0aXBsZScpO1xufVxuXG5mdW5jdGlvbiBNTFNlbGVjdCRzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAvLyBTZXQgb3B0aW9ucyB0ZW1wb3JhcmlseSBkaXNhYmxlcyBtb2RlbCBzdWJzY3JpcHRpb25zIChBcyBhIHdvcmthcm91bmQgZm9yIHBlcmZvcm1hbmNlIGlzc3VlcyByZWxhdGluZyB0byBtb2RlbCB1cGRhdGVzIC8gdGVtcGxhdGUgcmUtcmVuZGVyaW5nKVxuICAgIHZhciBtb2RlbENoYW5nZUxpc3RlbmVyID0geyBjb250ZXh0OiB0aGlzLCBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UgfTtcblxuICAgIHRoaXMubW9kZWwub2ZmKCcqKicsIG1vZGVsQ2hhbmdlTGlzdGVuZXIpO1xuICAgIHRoaXMubW9kZWwuc2V0KG9wdGlvbnMpO1xuICAgIHRoaXMubW9kZWwub24oJyoqJywgbW9kZWxDaGFuZ2VMaXN0ZW5lcik7XG5cbiAgICBvbk9wdGlvbnNDaGFuZ2UuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gTUxTZWxlY3QkZGlzYWJsZShkaXNhYmxlKSB7XG4gICAgdGhpcy5lbC5kaXNhYmxlZCA9IGRpc2FibGU7XG59XG5cbmZ1bmN0aW9uIE1MU2VsZWN0X3NldChzdHJPck9iaikge1xuICAgIGlmICghdGhpcy5faXNNdWx0aXBsZSkgdGhpcy5lbC52YWx1ZSA9IHN0ck9yT2JqO2Vsc2Uge1xuICAgICAgICB2YXIgdmFsdWVPYmogPSB7fTtcbiAgICAgICAgaWYgKHN0ck9yT2JqICYmIHR5cGVvZiBzdHJPck9iaiA9PSAnb2JqZWN0JykgdmFsdWVPYmogPSBzdHJPck9iajtlbHNlIHZhbHVlT2JqW3N0ck9yT2JqXSA9IHRydWU7XG4gICAgICAgIF8uZWFjaEtleSh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCwga2V5KSB7XG4gICAgICAgICAgICBlbC5zZWxlY3RlZCA9ICEhdmFsdWVPYmpba2V5XTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBNTFNlbGVjdF9nZXQoKSB7XG4gICAgaWYgKCF0aGlzLl9pc011bHRpcGxlKSByZXR1cm4gdGhpcy5lbC52YWx1ZTtlbHNlIHtcbiAgICAgICAgcmV0dXJuIF8ubWFwS2V5cyh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsLnNlbGVjdGVkO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIE1MU2VsZWN0X2RlbCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzTXVsdGlwbGUpIHRoaXMuZWwudmFsdWUgPSB1bmRlZmluZWQ7ZWxzZSB7XG4gICAgICAgIF8uZWFjaEtleSh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgZWwuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShTRUxFQ1RfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5mdW5jdGlvbiBvbk9wdGlvbnNDaGFuZ2UocGF0aCwgZGF0YSkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKHsgc2VsZWN0T3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKSB9KTtcbiAgICB0aGlzLl9vcHRpb25FbHMgPSB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXy5mb3JFYWNoKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnb3B0aW9uJyksIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBzZWxmLl9vcHRpb25FbHNbZWwudmFsdWVdID0gZWw7XG4gICAgfSk7XG4gICAgLy9kaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTUxTdXBlckNvbWJvXG4gKiBBIGNvbWJvIHNlbGVjdCBsaXN0IHdpdGggaW50ZWxsaWdlbnQgc2Nyb2xsaW5nIG9mIHN1cGVyIGxhcmdlIGxpc3RzLlxuICovXG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudCxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHMsXG4gICAgZG9UID0gbWlsby51dGlsLmRvVCxcbiAgICBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyO1xuXG52YXIgQ09NQk9fT1BFTiA9ICdtbC11aS1zdXBlcmNvbWJvLW9wZW4nO1xudmFyIENPTUJPX0NIQU5HRV9NRVNTQUdFID0gJ21sc3VwZXJjb21ib2NoYW5nZSc7XG5cbnZhciBPUFRJT05TX1RFTVBMQVRFID0gJ3t7fiBpdC5jb21ib09wdGlvbnMgOm9wdGlvbjppbmRleCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiB7ez8gb3B0aW9uLnNlbGVjdGVkfX1jbGFzcz1cInNlbGVjdGVkXCIge3s/fX1kYXRhLXZhbHVlPVwie3s9IGluZGV4IH19XCI+e3s9IG9wdGlvbi5sYWJlbCB9fTwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e359fSc7XG5cbnZhciBNQVhfUkVOREVSRUQgPSAxMDA7XG52YXIgQlVGRkVSID0gMjU7XG52YXIgREVGQVVMVF9FTEVNRU5UX0hFSUdIVCA9IDIwO1xuXG52YXIgTUxTdXBlckNvbWJvID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFN1cGVyQ29tYm8nLCB7XG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnbW91c2VsZWF2ZSc6IHsgc3Vic2NyaWJlcjogb25Nb3VzZUxlYXZlLCBjb250ZXh0OiAnb3duZXInIH0sXG4gICAgICAgICAgICAnbW91c2VvdmVyJzogeyBzdWJzY3JpYmVyOiBvbk1vdXNlT3ZlciwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTFN1cGVyQ29tYm9fZ2V0LFxuICAgICAgICBzZXQ6IE1MU3VwZXJDb21ib19zZXQsXG4gICAgICAgIGRlbDogTUxTdXBlckNvbWJvX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBDT01CT19DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXN1cGVyY29tYm8nXG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJzxpbnB1dCBtbC1iaW5kPVwiW2RhdGEsIGV2ZW50c106aW5wdXRcIiBjbGFzcz1cImZvcm0tY29udHJvbCBtbC11aS1pbnB1dFwiPlxcXG4gICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW2RvbV06YWRkSXRlbURpdlwiIGNsYXNzPVwibWwtdWktc3VwZXJjb21iby1hZGRcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIjphZGRQcm9tcHRcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cIltldmVudHMsIGRvbV06YWRkQnRuXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgbWwtdWktYnV0dG9uXCI+QWRkPC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIltkb20sIGV2ZW50c106bGlzdFwiIGNsYXNzPVwibWwtdWktc3VwZXJjb21iby1kcm9wZG93blwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIltkb21dOmJlZm9yZVwiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIlt0ZW1wbGF0ZSwgZG9tLCBldmVudHNdOm9wdGlvbnNcIiBjbGFzcz1cIm1sLXVpLXN1cGVyY29tYm8tb3B0aW9uc1wiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIltkb21dOmFmdGVyXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj4nXG4gICAgfSxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxTdXBlckNvbWJvKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFN1cGVyQ29tYm87XG5cbi8qKlxuICogUHVibGljIEFwaVxuICovXG5fLmV4dGVuZFByb3RvKE1MU3VwZXJDb21ibywge1xuICAgIGluaXQ6IE1MU3VwZXJDb21ibyRpbml0LFxuICAgIHNob3dPcHRpb25zOiBNTFN1cGVyQ29tYm8kc2hvd09wdGlvbnMsXG4gICAgaGlkZU9wdGlvbnM6IE1MU3VwZXJDb21ibyRoaWRlT3B0aW9ucyxcbiAgICB0b2dnbGVPcHRpb25zOiBNTFN1cGVyQ29tYm8kdG9nZ2xlT3B0aW9ucyxcbiAgICBzZXRPcHRpb25zOiBNTFN1cGVyQ29tYm8kc2V0T3B0aW9ucyxcbiAgICBpbml0T3B0aW9uc1VSTDogTUxTdXBlckNvbWJvJGluaXRPcHRpb25zVVJMLFxuICAgIHNldEZpbHRlcmVkT3B0aW9uczogTUxTdXBlckNvbWJvJHNldEZpbHRlcmVkT3B0aW9ucyxcbiAgICB1cGRhdGU6IE1MU3VwZXJDb21ibyR1cGRhdGUsXG4gICAgdG9nZ2xlQWRkQnV0dG9uOiBNTFN1cGVyQ29tYm8kdG9nZ2xlQWRkQnV0dG9uLFxuICAgIHNldEFkZEl0ZW1Qcm9tcHQ6IE1MU3VwZXJDb21ibyRzZXRBZGRJdGVtUHJvbXB0LFxuICAgIHNldFBsYWNlaG9sZGVyOiBNTFN1cGVyQ29tYm8kc2V0UGxhY2Vob2xkZXIsXG4gICAgc2V0RmlsdGVyOiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyLFxuICAgIGNsZWFyQ29tYm9JbnB1dDogTUxTdXBlckNvbWJvX2RlbFxufSk7XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGlzZSB0aGUgY29tcG9uZW50LCB3YWl0IGZvciBjaGlsZHJlbmJvdW5kLCBzZXR1cCBlbXB0eSBvcHRpb25zIGFycmF5cy5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLm9uY2UoJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX29wdGlvbnNEYXRhOiBbXSxcbiAgICAgICAgX2ZpbHRlcmVkT3B0aW9uc0RhdGE6IFtdLFxuICAgICAgICBfZmlsdGVyRnVuYzogZGVmYXVsdEZpbHRlclxuICAgIH0sIF8uV1JJVCk7XG59XG5cbi8qKlxuICogSGFuZGxlciBmb3IgaW5pdCBjaGlsZHJlbmJvdW5kIGxpc3RlbmVyLiBSZW5kZXJzIHRlbXBsYXRlLlxuICovXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoKS5iaW5kZXIoKTtcbiAgICBjb21wb25lbnRTZXR1cC5jYWxsKHRoaXMpO1xufVxuXG4vKipcbiAqIERlZmluZSBpbnN0YW5jZSBwcm9wZXJ0aWVzLCBnZXQgc3ViY29tcG9uZW50cywgY2FsbCBzZXR1cCBzdWItdGFza3NcbiAqL1xuZnVuY3Rpb24gY29tcG9uZW50U2V0dXAoKSB7XG4gICAgdmFyIHNjb3BlID0gdGhpcy5jb250YWluZXIuc2NvcGU7XG5cbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICBfY29tYm9JbnB1dDogc2NvcGUuaW5wdXQsXG4gICAgICAgIF9jb21ib0xpc3Q6IHNjb3BlLmxpc3QsXG4gICAgICAgIF9jb21ib09wdGlvbnM6IHNjb3BlLm9wdGlvbnMsXG4gICAgICAgIF9jb21ib0JlZm9yZTogc2NvcGUuYmVmb3JlLFxuICAgICAgICBfY29tYm9BZnRlcjogc2NvcGUuYWZ0ZXIsXG4gICAgICAgIF9jb21ib0FkZEl0ZW1EaXY6IHNjb3BlLmFkZEl0ZW1EaXYsXG4gICAgICAgIF9jb21ib0FkZFByb21wdDogc2NvcGUuYWRkUHJvbXB0LFxuICAgICAgICBfY29tYm9BZGRCdG46IHNjb3BlLmFkZEJ0bixcbiAgICAgICAgX29wdGlvblRlbXBsYXRlOiBkb1QuY29tcGlsZShPUFRJT05TX1RFTVBMQVRFKVxuICAgIH0pO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX3N0YXJ0SW5kZXg6IDAsXG4gICAgICAgIF9lbmRJbmRleDogTUFYX1JFTkRFUkVELFxuICAgICAgICBfaGlkZGVuOiBmYWxzZSxcbiAgICAgICAgX2VsZW1lbnRIZWlnaHQ6IERFRkFVTFRfRUxFTUVOVF9IRUlHSFQsXG4gICAgICAgIF90b3RhbDogMCxcbiAgICAgICAgX29wdGlvbnNIZWlnaHQ6IDIwMCxcbiAgICAgICAgX2xhc3RTY3JvbGxQb3M6IDAsXG4gICAgICAgIF9jdXJyZW50VmFsdWU6IG51bGwsXG4gICAgICAgIF9zZWxlY3RlZDogbnVsbCxcbiAgICAgICAgX2lzQWRkQnV0dG9uU2hvd246IGZhbHNlXG4gICAgfSwgXy5XUklUKTtcblxuICAgIC8vIENvbXBvbmVudCBTZXR1cFxuICAgIHRoaXMuZG9tLnNldFN0eWxlcyh7IHBvc2l0aW9uOiAncmVsYXRpdmUnIH0pO1xuICAgIHNldHVwQ29tYm9MaXN0KHRoaXMuX2NvbWJvTGlzdCwgdGhpcy5fY29tYm9PcHRpb25zLCB0aGlzKTtcbiAgICBzZXR1cENvbWJvSW5wdXQodGhpcy5fY29tYm9JbnB1dCwgdGhpcyk7XG4gICAgc2V0dXBDb21ib0J0bih0aGlzLl9jb21ib0FkZEJ0biwgdGhpcyk7XG5cbiAgICB0aGlzLmV2ZW50cy5vbigna2V5ZG93bicsIHsgc3Vic2NyaWJlcjogY2hhbmdlU2VsZWN0ZWQsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgLy90aGlzLmV2ZW50cy5vbignbW91c2VsZWF2ZScsIHsgc3Vic2NyaWJlcjogTUxTdXBlckNvbWJvJGhpZGVPcHRpb25zLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIFNob3dzIG9yIGhpZGVzIG9wdGlvbiBsaXN0LlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc2hvdyB0cnVlIHRvIHNob3csIGZhbHNlIHRvIGhpZGVcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHRvZ2dsZU9wdGlvbnMoc2hvdykge1xuICAgIHRoaXMuX2hpZGRlbiA9ICFzaG93O1xuICAgIHRoaXMuX2NvbWJvTGlzdC5kb20udG9nZ2xlKHNob3cpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIFNob3dzIG9wdGlvbnMgbGlzdFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2hvd09wdGlvbnMoKSB7XG4gICAgLy8gUG9zaXRpb24gdGhlIGxpc3QgdG8gbWF4aW1pc2UgdGhlIGFtb3VudCBvZiB2aXNpYmxlIGNvbnRlbnRcbiAgICB2YXIgYm91bmRzID0gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgcGFnZUhlaWdodCA9IE1hdGgubWF4KHRoaXMuZWwub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgMCk7XG4gICAgdmFyIGxpc3RUb3BTdHlsZSA9ICcnOyAvLyBQb3NpdGlvbnMgb3B0aW9ucyB1bmRlcm5lYXRoIHRoZSBjb21ib2JveCAoRGVmYXVsdCBiZWhhdmlvdXIpXG4gICAgdmFyIGJvdHRvbU92ZXJsYXAgPSBib3VuZHMuYm90dG9tICsgdGhpcy5fb3B0aW9uc0hlaWdodCAtIHBhZ2VIZWlnaHQ7XG5cbiAgICBpZiAoYm90dG9tT3ZlcmxhcCA+IDApIHtcbiAgICAgICAgdmFyIHRvcE92ZXJsYXAgPSB0aGlzLl9vcHRpb25zSGVpZ2h0IC0gYm91bmRzLnRvcDtcblxuICAgICAgICBpZiAodG9wT3ZlcmxhcCA8IGJvdHRvbU92ZXJsYXApIHtcbiAgICAgICAgICAgIGxpc3RUb3BTdHlsZSA9IC10aGlzLl9vcHRpb25zSGVpZ2h0ICsgJ3B4JzsgLy8gUG9zaXRpb24gb3B0aW9ucyBhYm92ZSB0aGUgY29tYm9ib3hcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NvbWJvTGlzdC5kb20uc2V0U3R5bGVzKHsgdG9wOiBsaXN0VG9wU3R5bGUgfSk7XG4gICAgdGhpcy5faGlkZGVuID0gZmFsc2U7XG4gICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKENPTUJPX09QRU4pO1xuICAgIHRoaXMuX2NvbWJvTGlzdC5kb20udG9nZ2xlKHRydWUpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEhpZGVzIG9wdGlvbnMgbGlzdFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kaGlkZU9wdGlvbnMoKSB7XG4gICAgdGhpcy5faGlkZGVuID0gdHJ1ZTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoQ09NQk9fT1BFTik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS50b2dnbGUoZmFsc2UpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEhpZGVzIGFkZCBidXR0b25cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHRvZ2dsZUFkZEJ1dHRvbihzaG93LCBvcHRpb25zKSB7XG4gICAgdGhpcy5fY29tYm9BZGRJdGVtRGl2LmRvbS50b2dnbGUoc2hvdyk7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wcmVzZXJ2ZVN0YXRlKSB0aGlzLl9fc2hvd0FkZE9uQ2xpY2sgPSB0aGlzLl9pc0FkZEJ1dHRvblNob3duO1xuICAgIHRoaXMuX2lzQWRkQnV0dG9uU2hvd24gPSBzaG93O1xufVxuXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0QWRkSXRlbVByb21wdChwcm9tcHQpIHtcbiAgICB0aGlzLl9hZGRJdGVtUHJvbXB0ID0gcHJvbXB0O1xuICAgIHRoaXMuX2NvbWJvQWRkUHJvbXB0LmVsLmlubmVySFRNTCA9IHByb21wdDtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRQbGFjZWhvbGRlcihwbGFjZWhvbGRlcikge1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZWwucGxhY2Vob2xkZXIgPSBwbGFjZWhvbGRlcjtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGZpbHRlciBmdW5jdGlvbiB1c2VkIGluIHRoZSB0ZXh0IGZpZWxkXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIEEgZnVuY3Rpb24gd2l0aCB0aGUgYXJndW1lbnRzIGBbdGV4dCwgb3B0aW9uXWAgd2hpY2ggd2lsbCBpbnRlcmF0ZSBcbiAqIHRocm91Z2ggYWxsIGBvcHRpb25zYCwgdGVzdGluZyBlYWNoIGFnYWluc3QgdGhlIGVudGVyZWQgYHRleHRgLiBXQVJOSU5HOiBTZXR0aW5nIGEgZnVuY3Rpb24gXG4gKiBjb3VsZCBpbnRlcmZlcmUgd2l0aCBsb2dpYyB1c2UgdG8gZGV0ZXJtaW5nIGlmIGFuIGl0ZW0gaXMgdW5pcXVlIGZvciB0aGUgYWRkIGl0ZW0gYnV0dG9uLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyKGZ1bmMpIHtcbiAgICB0aGlzLl9maWx0ZXJGdW5jID0gZnVuYztcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTZXRzIHRoZSBvcHRpb25zIG9mIHRoZSBkcm9wZG93blxuICpcbiAqIEBwYXJhbSB7QXJyYXlbT2JqZWN0XX0gYXJyIHRoZSBvcHRpb25zIHRvIHNldCB3aXRoIGxhYmVsIGFuZCB2YWx1ZSBwYWlycy4gVmFsdWUgY2FuIGJlIGFuIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHNldE9wdGlvbnMoYXJyKSB7XG4gICAgdGhpcy5fb3B0aW9uc0RhdGEgPSBhcnI7XG4gICAgdGhpcy5zZXRGaWx0ZXJlZE9wdGlvbnMoYXJyKTtcblxuICAgIHNldFNlbGVjdGVkLmNhbGwodGhpcywgYXJyWzBdKTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXNlIHRoZSByZW1vdGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB0aGUgb3B0aW9ucyB0byBpbml0aWFsaXNlLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kaW5pdE9wdGlvbnNVUkwob3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnNVUkwgPSBvcHRpb25zLnVybDtcbiAgICB0aGlzLl9mb3JtYXRPcHRpb25zVVJMID0gb3B0aW9ucy5mb3JtYXRPcHRpb25zIHx8IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH07XG59XG5cbi8qKlxuICogUHJpdmF0ZSBtZXRob2RcbiAqIFNldHMgdGhlIG9wdGlvbnMgb2YgdGhlIGRyb3Bkb3duIGJhc2VkIG9uIGEgcmVxdWVzdFxuICovXG5mdW5jdGlvbiBfZ2V0T3B0aW9uc1VSTChjYikge1xuICAgIHZhciB1cmwgPSB0aGlzLl9vcHRpb25zVVJMLFxuICAgICAgICBxdWVyeVN0cmluZyA9IHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5nZXQoKTtcblxuICAgIGNiID0gY2IgfHwgXy5ub29wO1xuICAgIG1pbG8udXRpbC5yZXF1ZXN0LnBvc3QodXJsLCB7IG5hbWU6IHF1ZXJ5U3RyaW5nIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ2FuIG5vdCBzZWFyY2ggZm9yIFwiJyArIHF1ZXJ5U3RyaW5nICsgJ1wiJyk7XG4gICAgICAgICAgICByZXR1cm4gY2IobmV3IEVycm9yKCdSZXF1ZXN0IGVycm9yJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9IF8uanNvblBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSkgY2IobnVsbCwgcmVzcG9uc2VEYXRhKTtlbHNlIGNiKG5ldyBFcnJvcignRGF0YSBlcnJvcicpKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTZXRzIHRoZSBmaWx0ZXJlZCBvcHRpb25zLCB3aGljaCBpcyBhIHN1YnNldCBvZiBub3JtYWwgb3B0aW9uc1xuICpcbiAqIEBwYXJhbSB7W3R5cGVdfSBhcnIgVGhlIG9wdGlvbnMgdG8gc2V0XG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRGaWx0ZXJlZE9wdGlvbnMoYXJyKSB7XG4gICAgaWYgKCFhcnIpIHJldHVybiBsb2dnZXIuZXJyb3IoJ3NldEZpbHRlcmVkT3B0aW9uczogcGFyYW1ldGVyIGlzIHVuZGVmaW5lZCcpO1xuICAgIHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGEgPSBhcnI7XG4gICAgdGhpcy5fdG90YWwgPSBhcnIubGVuZ3RoO1xuICAgIHRoaXMudXBkYXRlKCk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogVXBkYXRlcyB0aGUgbGlzdC4gVGhpcyBpcyB1c2VkIG9uIHNjcm9sbCwgYW5kIG1ha2VzIHVzZSBvZiB0aGUgZmlsdGVyZWRPcHRpb25zIHRvXG4gKiBpbnRlbGxpZ2VudGx5IHNob3cgYSBzdWJzZXQgb2YgdGhlIGZpbHRlcmVkIGxpc3QgYXQgYSB0aW1lLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kdXBkYXRlKCkge1xuICAgIHZhciB3YXNIaWRkZW4gPSB0aGlzLl9oaWRkZW47XG5cbiAgICB2YXIgYXJyVG9TaG93ID0gdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YS5zbGljZSh0aGlzLl9zdGFydEluZGV4LCB0aGlzLl9lbmRJbmRleCk7XG5cbiAgICB0aGlzLl9jb21ib09wdGlvbnMudGVtcGxhdGUucmVuZGVyKHtcbiAgICAgICAgY29tYm9PcHRpb25zOiBhcnJUb1Nob3dcbiAgICB9KTtcblxuICAgIHRoaXMuX2VsZW1lbnRIZWlnaHQgPSB0aGlzLl9lbGVtZW50SGVpZ2h0IHx8IERFRkFVTFRfRUxFTUVOVF9IRUlHSFQ7XG5cbiAgICBpZiAod2FzSGlkZGVuKSB0aGlzLmhpZGVPcHRpb25zKCk7XG5cbiAgICB2YXIgYmVmb3JlSGVpZ2h0ID0gdGhpcy5fc3RhcnRJbmRleCAqIHRoaXMuX2VsZW1lbnRIZWlnaHQ7XG4gICAgdmFyIGFmdGVySGVpZ2h0ID0gKHRoaXMuX3RvdGFsIC0gdGhpcy5fZW5kSW5kZXgpICogdGhpcy5fZWxlbWVudEhlaWdodDtcbiAgICB0aGlzLl9jb21ib0JlZm9yZS5lbC5zdHlsZS5oZWlnaHQgPSBiZWZvcmVIZWlnaHQgKyAncHgnO1xuICAgIHRoaXMuX2NvbWJvQWZ0ZXIuZWwuc3R5bGUuaGVpZ2h0ID0gYWZ0ZXJIZWlnaHQgPiAwID8gYWZ0ZXJIZWlnaHQgKyAncHgnIDogJzBweCc7XG59XG5cbi8qKlxuICogU2V0dXAgdGhlIGNvbWJvIGxpc3RcbiAqXG4gKiBAcGFyYW0gIHtDb21wb25lbnR9IGxpc3RcbiAqIEBwYXJhbSAge0FycmF5fSBvcHRpb25zXG4gKiBAcGFyYW0gIHtDb21wb25lbnR9IHNlbGZcbiAqL1xuZnVuY3Rpb24gc2V0dXBDb21ib0xpc3QobGlzdCwgb3B0aW9ucywgc2VsZikge1xuICAgIHNlbGYudG9nZ2xlQWRkQnV0dG9uKGZhbHNlKTtcbiAgICBvcHRpb25zLnRlbXBsYXRlLnNldChPUFRJT05TX1RFTVBMQVRFKTtcblxuICAgIGxpc3QuZG9tLnNldFN0eWxlcyh7XG4gICAgICAgIG92ZXJmbG93OiAnc2Nyb2xsJyxcbiAgICAgICAgaGVpZ2h0OiBzZWxmLl9vcHRpb25zSGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIHpJbmRleDogMTBcbiAgICAgICAgLy8gdG9wOiB5UG9zICsgJ3B4JyxcbiAgICAgICAgLy8gbGVmdDogeFBvcyArICdweCcsXG4gICAgfSk7XG5cbiAgICBzZWxmLmhpZGVPcHRpb25zKCk7XG4gICAgbGlzdC5ldmVudHMub25NZXNzYWdlcyh7XG4gICAgICAgICdjbGljayc6IHsgc3Vic2NyaWJlcjogb25MaXN0Q2xpY2ssIGNvbnRleHQ6IHNlbGYgfSxcbiAgICAgICAgJ3Njcm9sbCc6IHsgc3Vic2NyaWJlcjogb25MaXN0U2Nyb2xsLCBjb250ZXh0OiBzZWxmIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTZXR1cCB0aGUgaW5wdXQgY29tcG9uZW50XG4gKlxuICogQHBhcmFtICB7Q29tcG9uZW50fSBpbnB1dFxuICogQHBhcmFtICB7Q29tcG9uZW50fSBzZWxmXG4gKi9cbmZ1bmN0aW9uIHNldHVwQ29tYm9JbnB1dChpbnB1dCwgc2VsZikge1xuICAgIGlucHV0LmV2ZW50cy5vbmNlKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaW5wdXQuZGF0YS5vbignJywgeyBzdWJzY3JpYmVyOiBvbkRhdGFDaGFuZ2UsIGNvbnRleHQ6IHNlbGYgfSk7XG4gICAgICAgIGlucHV0LmV2ZW50cy5vbignY2xpY2snLCB7IHN1YnNjcmliZXI6IG9uSW5wdXRDbGljaywgY29udGV4dDogc2VsZiB9KTtcbiAgICAgICAgaW5wdXQuZXZlbnRzLm9uKCdrZXlkb3duJywgeyBzdWJzY3JpYmVyOiBvbkVudGVyS2V5LCBjb250ZXh0OiBzZWxmIH0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNldHVwIHRoZSBidXR0b25cbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gYnRuXG4gKiBAcGFyYW0gIHtDb21wb25lbnR9IHNlbGZcbiAqL1xuZnVuY3Rpb24gc2V0dXBDb21ib0J0bihidG4sIHNlbGYpIHtcbiAgICBidG4uZXZlbnRzLm9uKCdjbGljaycsIHsgc3Vic2NyaWJlcjogb25BZGRCdG4sIGNvbnRleHQ6IHNlbGYgfSk7XG59XG5cbi8qKlxuICogQ3VzdG9tIGRhdGEgZmFjZXQgZ2V0IG1ldGhvZFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm9fZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VmFsdWU7XG59XG5cbi8qKlxuICogQ3VzdG9tIGRhdGEgZmFjZXQgc2V0IG1ldGhvZFxuICogQHBhcmFtIHtWYXJpYWJsZX0gb2JqXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ib19zZXQob2JqKSB7XG4gICAgdGhpcy5fY3VycmVudFZhbHVlID0gb2JqO1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5zZXQob2JqICYmIG9iai5sYWJlbCk7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19DSEFOR0VfTUVTU0FHRSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBfLmRlZmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5oaWRlT3B0aW9ucygpO1xuICAgICAgICBzZWxmLnNldEZpbHRlcmVkT3B0aW9ucyhzZWxmLl9vcHRpb25zRGF0YSk7XG4gICAgICAgIHNlbGYudXBkYXRlKCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ3VzdG9tIGRhdGEgZmFjZXQgZGVsIG1ldGhvZFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm9fZGVsKCkge1xuICAgIHRoaXMuX2N1cnJlbnRWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLnNldCgnJyk7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19DSEFOR0VfTUVTU0FHRSk7XG59XG5cbi8qKlxuICogSW5wdXQgZGF0YSBjaGFuZ2UgaGFuZGxlclxuICogV2hlbiB0aGUgaW5wdXQgZGF0YSBjaGFuZ2VzLCB0aGlzIG1ldGhvZCBmaWx0ZXJzIHRoZSBvcHRpb25zRGF0YSwgYW5kIHNldHMgdGhlIGZpcnN0IGVsZW1lbnRcbiAqIHRvIGJlIHNlbGVjdGVkLlxuICogQHBhcmFtICB7U3RyaW5nfSBtc2dcbiAqIEBwYXJhbSAge09iamV4dH0gZGF0YVxuICovXG5mdW5jdGlvbiBvbkRhdGFDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdmFyIHRleHQgPSBkYXRhLm5ld1ZhbHVlICYmIGRhdGEubmV3VmFsdWUudHJpbSgpO1xuICAgIGlmICh0aGlzLl9vcHRpb25zVVJMKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgX2dldE9wdGlvbnNVUkwuY2FsbCh0aGlzLCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZURhdGEpIHtcbiAgICAgICAgICAgIGlmIChlcnIgfHwgIXJlc3BvbnNlRGF0YSkgcmV0dXJuO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHJlc3BvbnNlRGF0YS5kYXRhLm1hcChzZWxmLl9mb3JtYXRPcHRpb25zVVJMKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgX3VwZGF0ZU9wdGlvbnNBbmRBZGRCdXR0b24uY2FsbChzZWxmLCB0ZXh0LCBzZWxmLl9vcHRpb25zRGF0YSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdEYXRhIGVycm9yJywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBmaWx0ZXJlZERhdGEgPSBfZmlsdGVyRGF0YS5jYWxsKHRoaXMsIHRleHQpO1xuICAgICAgICBfdXBkYXRlT3B0aW9uc0FuZEFkZEJ1dHRvbi5jYWxsKHRoaXMsIHRleHQsIGZpbHRlcmVkRGF0YSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfZmlsdGVyRGF0YSh0ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnNEYXRhLmZpbHRlcihfLnBhcnRpYWwodGhpcy5fZmlsdGVyRnVuYywgdGV4dCkpO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyKHRleHQsIG9wdGlvbikge1xuICAgIGlmICghb3B0aW9uLmxhYmVsKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGxhYmVsID0gb3B0aW9uLmxhYmVsLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGxhYmVsLnRyaW0oKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGV4dC50b0xvd2VyQ2FzZSgpKSA9PSAwO1xufVxuXG5mdW5jdGlvbiBfdXBkYXRlT3B0aW9uc0FuZEFkZEJ1dHRvbih0ZXh0LCBmaWx0ZXJlZEFycikge1xuICAgIGlmICghdGV4dCkge1xuICAgICAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSwgeyBwcmVzZXJ2ZVN0YXRlOiB0cnVlIH0pO1xuICAgICAgICBzZXRTZWxlY3RlZC5jYWxsKHRoaXMsIGZpbHRlcmVkQXJyWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZmlsdGVyZWRBcnIubGVuZ3RoICYmIF8uZmluZChmaWx0ZXJlZEFyciwgaXNFeGFjdE1hdGNoKSkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9hZGRJdGVtUHJvbXB0KSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbih0aGlzLl9vcHRpb25zRGF0YS5sZW5ndGggPiAxIHx8IHRoaXMuX29wdGlvbnNVUkwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbHRlcmVkQXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5zaG93T3B0aW9ucygpO1xuICAgICAgICAgICAgc2V0U2VsZWN0ZWQuY2FsbCh0aGlzLCBmaWx0ZXJlZEFyclswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldEZpbHRlcmVkT3B0aW9ucyhmaWx0ZXJlZEFycik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcCA9IDA7XG5cbiAgICBmdW5jdGlvbiBpc0V4YWN0TWF0Y2goaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5sYWJlbC50b0xvd2VyQ2FzZSgpID09PSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgbWFwIG9mIGtleUNvZGVzIHRvIGRpcmVjdGlvbnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBkaXJlY3Rpb25NYXAgPSB7ICc0MCc6IDEsICczOCc6IC0xIH07XG5cbi8qKlxuICogTGlzdCBrZXlkb3duIGhhbmRsZXJcbiAqIENoYW5nZXMgdGhlIHNlbGVjdGVkIGxpc3QgaXRlbSBieSBmaW5kaW5nIHRoZSBhZGphY2VudCBpdGVtIGFuZCBzZXR0aW5nIGl0IHRvIHNlbGVjdGVkLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGNoYW5nZVNlbGVjdGVkKHR5cGUsIGV2ZW50KSB7XG4gICAgLy9UT0RPIHRlc3QgbW9jaGFcbiAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uTWFwW2V2ZW50LmtleUNvZGVdO1xuXG4gICAgaWYgKGRpcmVjdGlvbikgX2NoYW5nZVNlbGVjdGVkLmNhbGwodGhpcywgZGlyZWN0aW9uKTtcbn1cblxuZnVuY3Rpb24gX2NoYW5nZVNlbGVjdGVkKGRpcmVjdGlvbikge1xuICAgIC8vIFRPRE86IHJlZmFjdG9yIGFuZCB0aWR5IHVwLCBsb29rcyBsaWtlIHNvbWUgY29kZSBkdXBsaWNhdGlvbi5cbiAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3RlZCcpO1xuICAgIHZhciBuZXdTZWxlY3Rpb24gPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhWzBdOyAvLyBEZWZhdWx0IGlmIG5vIHNlbGVjdGVkRWxcbiAgICB2YXIgc2Nyb2xsUG9zID0gdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcDtcbiAgICB2YXIgc2VsZWN0ZWRQb3MgPSBzZWxlY3RlZCA/IHNlbGVjdGVkLm9mZnNldFRvcCA6IDA7XG4gICAgdmFyIHJlbGF0aXZlUG9zID0gc2VsZWN0ZWRQb3MgLSBzY3JvbGxQb3M7XG5cbiAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gX2dldERhdGFWYWx1ZUZyb21FbGVtZW50LmNhbGwodGhpcywgc2VsZWN0ZWQpO1xuICAgICAgICBuZXdTZWxlY3Rpb24gPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhW2luZGV4ICsgZGlyZWN0aW9uXTtcbiAgICB9XG5cbiAgICBzZXRTZWxlY3RlZC5jYWxsKHRoaXMsIG5ld1NlbGVjdGlvbik7XG4gICAgdGhpcy51cGRhdGUoKTtcblxuICAgIGlmIChyZWxhdGl2ZVBvcyA+IHRoaXMuX29wdGlvbnNIZWlnaHQgLSB0aGlzLl9lbGVtZW50SGVpZ2h0ICogMiAmJiBkaXJlY3Rpb24gPT09IDEpIHRoaXMuX2NvbWJvTGlzdC5lbC5zY3JvbGxUb3AgKz0gdGhpcy5fZWxlbWVudEhlaWdodCAqIGRpcmVjdGlvbiAqIDU7XG5cbiAgICBpZiAocmVsYXRpdmVQb3MgPCB0aGlzLl9lbGVtZW50SGVpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gLTEpIHRoaXMuX2NvbWJvTGlzdC5lbC5zY3JvbGxUb3AgKz0gdGhpcy5fZWxlbWVudEhlaWdodCAqIGRpcmVjdGlvbiAqIDU7XG59XG5cbi8qKlxuICogTW91c2Ugb3ZlciBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25Nb3VzZU92ZXIodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLl9tb3VzZUlzT3ZlciA9IHRydWU7XG59XG5cbi8qKlxuICogTW91c2UgbGVhdmUgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91c2VMZWF2ZSh0eXBlLCBldmVudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9tb3VzZUlzT3ZlciA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9tb3VzZU91dFRpbWVyKSBjbGVhckludGVydmFsKHRoaXMuX21vdXNlT3V0VGltZXIpO1xuICAgIHRoaXMuX21vdXNlT3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFzZWxmLl9tb3VzZUlzT3ZlcikgX29uTW91c2VMZWF2ZS5jYWxsKHNlbGYpO1xuICAgIH0sIDc1MCk7XG59XG5cbmZ1bmN0aW9uIF9vbk1vdXNlTGVhdmUoKSB7XG4gICAgdGhpcy5oaWRlT3B0aW9ucygpO1xuICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlLCB7IHByZXNlcnZlU3RhdGU6IHRydWUgfSk7XG59XG5cbi8qKlxuICogSW5wdXQgY2xpY2sgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uSW5wdXRDbGljayh0eXBlLCBldmVudCkge1xuICAgIHRoaXMuc2hvd09wdGlvbnMoKTtcbiAgICB0aGlzLl9jb21ib0lucHV0LmVsLnNldFNlbGVjdGlvblJhbmdlKDAsIHRoaXMuX2NvbWJvSW5wdXQuZWwudmFsdWUubGVuZ3RoKTtcbiAgICBpZiAodGhpcy5fX3Nob3dBZGRPbkNsaWNrKSB0aGlzLnRvZ2dsZUFkZEJ1dHRvbih0cnVlKTtcbn1cblxuLyoqXG4gKiBFbnRlciBrZXkgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uRW50ZXJLZXkodHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAxMykge1xuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWQpIF9zZXREYXRhLmNhbGwodGhpcyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZCBidXR0b24gaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uQWRkQnRuKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIGRhdGEgPSB7IGxhYmVsOiB0aGlzLl9jb21ib0lucHV0LmVsLnZhbHVlIH07XG4gICAgdGhpcy5wb3N0TWVzc2FnZSgnYWRkaXRlbScsIGRhdGEpO1xuICAgIHRoaXMuZXZlbnRzLnBvc3RNZXNzYWdlKCdtaWxvX3N1cGVyY29tYm9hZGRpdGVtJywgZGF0YSk7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbn1cblxuLyoqXG4gKiBMaXN0IGNsaWNrIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkxpc3RDbGljayh0eXBlLCBldmVudCkge1xuICAgIHZhciBpbmRleCA9IF9nZXREYXRhVmFsdWVGcm9tRWxlbWVudC5jYWxsKHRoaXMsIGV2ZW50LnRhcmdldCk7XG4gICAgdmFyIGRhdGEgPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhW2luZGV4XTtcblxuICAgIHNldFNlbGVjdGVkLmNhbGwodGhpcywgZGF0YSk7XG4gICAgX3NldERhdGEuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnVwZGF0ZSgpO1xufVxuXG4vKipcbiAqIExpc3Qgc2Nyb2xsIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkxpc3RTY3JvbGwodHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgc2Nyb2xsUG9zID0gZXZlbnQudGFyZ2V0LnNjcm9sbFRvcCxcbiAgICAgICAgZGlyZWN0aW9uID0gc2Nyb2xsUG9zID4gdGhpcy5fbGFzdFNjcm9sbFBvcyA/ICdkb3duJyA6ICd1cCcsXG4gICAgICAgIGZpcnN0Q2hpbGQgPSB0aGlzLl9jb21ib09wdGlvbnMuZWwubGFzdEVsZW1lbnRDaGlsZCxcbiAgICAgICAgbGFzdENoaWxkID0gdGhpcy5fY29tYm9PcHRpb25zLmVsLmZpcnN0RWxlbWVudENoaWxkLFxuICAgICAgICBsYXN0RWxQb3NpdGlvbiA9IGZpcnN0Q2hpbGQgPyBmaXJzdENoaWxkLm9mZnNldFRvcCA6IDAsXG4gICAgICAgIGZpcnN0RWxQb3NpdGlvbiA9IGxhc3RDaGlsZCA/IGxhc3RDaGlsZC5vZmZzZXRUb3AgOiAwLFxuICAgICAgICBkaXN0RnJvbUxhc3RFbCA9IGxhc3RFbFBvc2l0aW9uIC0gc2Nyb2xsUG9zIC0gdGhpcy5fb3B0aW9uc0hlaWdodCArIHRoaXMuX2VsZW1lbnRIZWlnaHQsXG4gICAgICAgIGRpc3RGcm9tRmlyc3RFbCA9IHNjcm9sbFBvcyAtIGZpcnN0RWxQb3NpdGlvbixcbiAgICAgICAgZWxzRnJvbVN0YXJ0ID0gTWF0aC5mbG9vcihkaXN0RnJvbUZpcnN0RWwgLyB0aGlzLl9lbGVtZW50SGVpZ2h0KSxcbiAgICAgICAgZWxzVG9UaGVFbmQgPSBNYXRoLmZsb29yKGRpc3RGcm9tTGFzdEVsIC8gdGhpcy5fZWxlbWVudEhlaWdodCksXG4gICAgICAgIHRvdGFsRWxlbWVudHNCZWZvcmUgPSBNYXRoLmZsb29yKHNjcm9sbFBvcyAvIHRoaXMuX2VsZW1lbnRIZWlnaHQpIC0gQlVGRkVSO1xuXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAnZG93bicgJiYgZWxzVG9UaGVFbmQgPCBCVUZGRVIgfHwgZGlyZWN0aW9uID09ICd1cCcgJiYgZWxzRnJvbVN0YXJ0IDwgQlVGRkVSKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0SW5kZXggPSB0b3RhbEVsZW1lbnRzQmVmb3JlID4gMCA/IHRvdGFsRWxlbWVudHNCZWZvcmUgOiAwO1xuICAgICAgICB0aGlzLl9lbmRJbmRleCA9IHRvdGFsRWxlbWVudHNCZWZvcmUgKyBNQVhfUkVOREVSRUQ7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRIZWlnaHQgPSBmaXJzdENoaWxkLnN0eWxlLmhlaWdodDtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgdGhpcy5fbGFzdFNjcm9sbFBvcyA9IHNjcm9sbFBvcztcbn1cblxuLyoqXG4gKiBQcml2YXRlIG1ldGhvZFxuICogUmV0cmlldmVzIHRoZSBkYXRhLXZhbHVlIGF0dHJpYnV0ZSB2YWx1ZSBmcm9tIHRoZSBlbGVtZW50IGFuZCByZXR1cm5zIGl0IGFzIGFuIGluZGV4IG9mXG4gKiB0aGUgZmlsdGVyZWRPcHRpb25zXG4gKlxuICogQHBhcmFtICB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gX2dldERhdGFWYWx1ZUZyb21FbGVtZW50KGVsKSB7XG4gICAgcmV0dXJuIE51bWJlcihlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnKSkgKyB0aGlzLl9zdGFydEluZGV4O1xufVxuXG4vKipcbiAqIFByaXZhdGUgbWV0aG9kXG4gKiBTZXRzIHRoZSBkYXRhIG9mIHRoZSBTdXBlckNvbWJvLCB0YWtpbmcgY2FyZSB0byByZXNldCBzb21lIHRoaW5ncyBhbmQgdGVtcG9yYXJpbHlcbiAqIHVuc3Vic2NyaWJlIGRhdGEgbGlzdGVuZXJzLlxuICovXG5mdW5jdGlvbiBfc2V0RGF0YSgpIHtcbiAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5vZmYoJycsIHsgc3Vic2NyaWJlcjogb25EYXRhQ2hhbmdlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vc3VwZXJjb21ibyBsaXN0ZW5lcnMgb2ZmXG4gICAgdGhpcy5kYXRhLnNldCh0aGlzLl9zZWxlY3RlZCk7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uRGF0YUNoYW5nZSwgY29udGV4dDogdGhpcyB9KTtcbiAgICAvL3N1cGVyY29tYm8gbGlzdGVuZXJzIG9uXG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkKSBkZWxldGUgdGhpcy5fc2VsZWN0ZWQuc2VsZWN0ZWQ7XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudCxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBNTFRleHQgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MVGV4dCcsIHtcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXRleHQnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxUZXh0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFRleHQ7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnQsXG4gICAgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzLFxuICAgIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXI7XG5cbnZhciBNTFRleHRhcmVhID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFRleHRhcmVhJywge1xuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktdGV4dGFyZWEnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxUZXh0YXJlYSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxUZXh0YXJlYTtcblxuXy5leHRlbmRQcm90byhNTFRleHRhcmVhLCB7XG4gICAgc3RhcnRBdXRvcmVzaXplOiBNTFRleHRhcmVhJHN0YXJ0QXV0b3Jlc2l6ZSxcbiAgICBzdG9wQXV0b3Jlc2l6ZTogTUxUZXh0YXJlYSRzdG9wQXV0b3Jlc2l6ZSxcbiAgICBpc0F1dG9yZXNpemVkOiBNTFRleHRhcmVhJGlzQXV0b3Jlc2l6ZWQsXG4gICAgZGlzYWJsZTogTUxUZXh0YXJlYSRkaXNhYmxlXG59KTtcblxuZnVuY3Rpb24gTUxUZXh0YXJlYSRzdGFydEF1dG9yZXNpemUob3B0aW9ucykge1xuICAgIGlmICh0aGlzLl9hdXRvcmVzaXplKSByZXR1cm4gbG9nZ2VyLndhcm4oJ01MVGV4dGFyZWEgc3RhcnRBdXRvcmVzaXplOiBhdXRvcmVzaXplIGlzIGFscmVhZHkgb24nKTtcbiAgICB0aGlzLl9hdXRvcmVzaXplID0gdHJ1ZTtcbiAgICB0aGlzLl9hdXRvcmVzaXplT3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICBfYWRqdXN0QXJlYUhlaWdodC5jYWxsKHRoaXMpO1xuICAgIF9tYW5hZ2VTdWJzY3JpcHRpb25zLmNhbGwodGhpcywgJ29uJyk7XG59XG5cbmZ1bmN0aW9uIF9tYW5hZ2VTdWJzY3JpcHRpb25zKG9uT2ZmKSB7XG4gICAgdGhpcy5ldmVudHNbb25PZmZdKCdjbGljaycsIHsgc3Vic2NyaWJlcjogX2FkanVzdEFyZWFIZWlnaHQsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgdGhpcy5kYXRhW29uT2ZmXSgnJywgeyBzdWJzY3JpYmVyOiBfYWRqdXN0QXJlYUhlaWdodCwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuZnVuY3Rpb24gX2FkanVzdEFyZWFIZWlnaHQoKSB7XG4gICAgdGhpcy5lbC5zdHlsZS5oZWlnaHQgPSAwO1xuXG4gICAgdmFyIG5ld0hlaWdodCA9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0LFxuICAgICAgICBtaW5IZWlnaHQgPSB0aGlzLl9hdXRvcmVzaXplT3B0aW9ucy5taW5IZWlnaHQsXG4gICAgICAgIG1heEhlaWdodCA9IHRoaXMuX2F1dG9yZXNpemVPcHRpb25zLm1heEhlaWdodDtcblxuICAgIG5ld0hlaWdodCA9IG5ld0hlaWdodCA+PSBtYXhIZWlnaHQgPyBtYXhIZWlnaHQgOiBuZXdIZWlnaHQgPD0gbWluSGVpZ2h0ID8gbWluSGVpZ2h0IDogbmV3SGVpZ2h0O1xuXG4gICAgdGhpcy5lbC5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyAncHgnO1xufVxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJHN0b3BBdXRvcmVzaXplKCkge1xuICAgIGlmICghdGhpcy5fYXV0b3Jlc2l6ZSkgcmV0dXJuIGxvZ2dlci53YXJuKCdNTFRleHRhcmVhIHN0b3BBdXRvcmVzaXplOiBhdXRvcmVzaXplIGlzIG5vdCBvbicpO1xuICAgIHRoaXMuX2F1dG9yZXNpemUgPSBmYWxzZTtcbiAgICBfbWFuYWdlU3Vic2NyaXB0aW9ucy5jYWxsKHRoaXMsICdvZmYnKTtcbn1cblxuZnVuY3Rpb24gTUxUZXh0YXJlYSRpc0F1dG9yZXNpemVkKCkge1xuICAgIHJldHVybiB0aGlzLl9hdXRvcmVzaXplO1xufVxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJGRpc2FibGUoZGlzYWJsZSkge1xuICAgIHRoaXMuZWwuZGlzYWJsZWQgPSBkaXNhYmxlO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIE1MVGltZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxUaW1lJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTFRpbWVfZ2V0LFxuICAgICAgICBzZXQ6IE1MVGltZV9zZXQsXG4gICAgICAgIGRlbDogTUxUaW1lX2RlbFxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXRpbWUnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxUaW1lKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFRpbWU7XG5cbnZhciBUSU1FX1JFR0VYID0gL14oWzAtOV17MSwyfSkoPzpcXDp8XFwuKShbMC05XXsxLDJ9KSQvLFxuICAgIFRJTUVfVEVNUExBVEUgPSAnaGg6bW0nO1xuXG5mdW5jdGlvbiBNTFRpbWVfZ2V0KCkge1xuICAgIHZhciB0aW1lU3RyID0gdGhpcy5lbC52YWx1ZTtcbiAgICB2YXIgbWF0Y2ggPSB0aW1lU3RyLm1hdGNoKFRJTUVfUkVHRVgpO1xuICAgIGlmICghbWF0Y2gpIHJldHVybjtcbiAgICB2YXIgaG91cnMgPSBtYXRjaFsxXSxcbiAgICAgICAgbWlucyA9IG1hdGNoWzJdO1xuICAgIGlmIChob3VycyA+IDIzIHx8IG1pbnMgPiA1OSkgcmV0dXJuO1xuICAgIHZhciB0aW1lID0gbmV3IERhdGUoMTk3MCwgMCwgMSwgaG91cnMsIG1pbnMpO1xuXG4gICAgcmV0dXJuIF8udG9EYXRlKHRpbWUpO1xufVxuXG5mdW5jdGlvbiBNTFRpbWVfc2V0KHZhbHVlKSB7XG4gICAgdmFyIHRpbWUgPSBfLnRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCF0aW1lKSB7XG4gICAgICAgIHRoaXMuZWwudmFsdWUgPSAnJztcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aW1lU3RyID0gVElNRV9URU1QTEFURS5yZXBsYWNlKCdoaCcsIHBhZCh0aW1lLmdldEhvdXJzKCkpKS5yZXBsYWNlKCdtbScsIHBhZCh0aW1lLmdldE1pbnV0ZXMoKSkpO1xuXG4gICAgdGhpcy5lbC52YWx1ZSA9IHRpbWVTdHI7XG4gICAgcmV0dXJuIHRpbWVTdHI7XG5cbiAgICBmdW5jdGlvbiBwYWQobikge1xuICAgICAgICByZXR1cm4gbiA8IDEwID8gJzAnICsgbiA6IG47XG4gICAgfVxufVxuXG5mdW5jdGlvbiBNTFRpbWVfZGVsKCkge1xuICAgIHRoaXMuZWwudmFsdWUgPSAnJztcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudCxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBNTFdyYXBwZXIgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MV3JhcHBlcicsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXdyYXBwZXInXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxXcmFwcGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFdyYXBwZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnQsXG4gICAgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzLFxuICAgIGNoZWNrID0gbWlsby51dGlsLmNoZWNrLFxuICAgIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cbnZhciBBTEVSVF9DU1NfQ0xBU1NFUyA9IHtcbiAgICBzdWNjZXNzOiAnYWxlcnQtc3VjY2VzcycsXG4gICAgd2FybmluZzogJ2FsZXJ0LXdhcm5pbmcnLFxuICAgIGluZm86ICdhbGVydC1pbmZvJyxcbiAgICBkYW5nZXI6ICdhbGVydC1kYW5nZXInLFxuICAgIGZpeGVkOiAnYWxlcnQtZml4ZWQnXG59O1xuXG52YXIgTUxBbGVydCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxBbGVydCcsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiBbJ21sLWJzLWFsZXJ0JywgJ2FsZXJ0JywgJ2ZhZGUnXSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgJ3JvbGUnOiAnYWxlcnQnLFxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnXFxcbiAgICAgICAgICAgIHt7PyBpdC5jbG9zZSB9fVxcXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiW2V2ZW50c106Y2xvc2VCdG5cIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvYnV0dG9uPlxcXG4gICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICB7ez0gaXQubWVzc2FnZX19J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQWxlcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQWxlcnQ7XG5cbl8uZXh0ZW5kKE1MQWxlcnQsIHtcbiAgICBjcmVhdGVBbGVydDogTUxBbGVydCQkY3JlYXRlQWxlcnQsXG4gICAgb3BlbkFsZXJ0OiBNTEFsZXJ0JCRvcGVuQWxlcnRcbn0pO1xuXG5fLmV4dGVuZFByb3RvKE1MQWxlcnQsIHtcbiAgICBvcGVuQWxlcnQ6IE1MQWxlcnQkb3BlbkFsZXJ0LFxuICAgIGNsb3NlQWxlcnQ6IE1MQWxlcnQkY2xvc2VBbGVydFxufSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIG5ldyBhbGVydCBpbnN0YW5jZS4gVG8gY3JlYXRlIGFuZCBvcGVuIGF0IHRoZSBzYW1lIHRpbWUgdXNlIFtvcGVuQWxlcnRdKCNNTEFsZXJ0JCRvcGVuQWxlcnQpXG4gKiBgb3B0aW9uc2AgaXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgICAgbWVzc2FnZTogc3RyaW5nIGFsZXJ0IG1lc3NhZ2VcbiAqICAgICAgdHlwZTogICAgb3B0aW9uYWwgc3RyaW5nIHRoZSB0eXBlIG9mIGFsZXJ0IG1lc3NhZ2UsIG9uZSBvZiBzdWNjZXNzLCB3YXJuaW5nLCBpbmZvLCBkYW5nZXIsIGZpeGVkXG4gKiAgICAgICAgICAgICAgIGRlZmF1bHQgJ2luZm8nXG4gKiAgICAgIGNsb3NlOiAgIG9wdGlvbmFsIGZhbHNlIHRvIHByZXZlbnQgdXNlciBmcm9tIGNsb3NpbmdcbiAqICAgICAgICAgICAgICAgb3IgdHJ1ZSAoZGVmYXVsdCkgdG8gZW5hYmxlIGNsb3NpbmcgYW5kIHJlbmRlciBhIGNsb3NlIGJ1dHRvblxuICogICAgICB0aW1lb3V0OiBvcHRpb25hbCB0aW1lciwgaW4gbWlsbGlzZWNvbmRzIHRvIGF1dG9tYXRpY2FsbHkgY2xvc2UgdGhlIGFsZXJ0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgYWxlcnQgY29uZmlndXJhdGlvblxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JCRjcmVhdGVBbGVydChvcHRpb25zKSB7XG4gICAgY2hlY2sob3B0aW9ucywge1xuICAgICAgICBtZXNzYWdlOiBTdHJpbmcsXG4gICAgICAgIHR5cGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIGNsb3NlOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgdGltZW91dDogTWF0Y2guT3B0aW9uYWwoTnVtYmVyKVxuICAgIH0pO1xuXG4gICAgdmFyIGFsZXJ0ID0gTUxBbGVydC5jcmVhdGVPbkVsZW1lbnQoKTtcblxuICAgIG9wdGlvbnMgPSBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICB2YXIgYWxlcnRDbHMgPSBBTEVSVF9DU1NfQ0xBU1NFU1tvcHRpb25zLnR5cGVdO1xuICAgIGFsZXJ0LmRvbS5hZGRDc3NDbGFzc2VzKGFsZXJ0Q2xzKTtcblxuICAgIGFsZXJ0Ll9hbGVydCA9IHtcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuXG4gICAgYWxlcnQudGVtcGxhdGUucmVuZGVyKG9wdGlvbnMpLmJpbmRlcigpO1xuXG4gICAgdmFyIGFsZXJ0U2NvcGUgPSBhbGVydC5jb250YWluZXIuc2NvcGU7XG5cbiAgICBpZiAob3B0aW9ucy5jbG9zZSkgYWxlcnRTY29wZS5jbG9zZUJ0bi5ldmVudHMub24oJ2NsaWNrJywgeyBzdWJzY3JpYmVyOiBfb25DbG9zZUJ0bkNsaWNrLCBjb250ZXh0OiBhbGVydCB9KTtcblxuICAgIGlmIChvcHRpb25zLnRpbWVvdXQpIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoYWxlcnQuX2FsZXJ0LnZpc2libGUpIGFsZXJ0LmNsb3NlQWxlcnQoKTtcbiAgICB9LCBvcHRpb25zLnRpbWVvdXQpO1xuXG4gICAgcmV0dXJuIGFsZXJ0O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbmQgc2hvdyBhbGVydCBwb3B1cFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIG9iamVjdCB3aXRoIG1lc3NhZ2UsIHR5cGUsIGNsb3NlIGFuZCB0aW1lb3V0XG4gKiBAcmV0dXJuIHtNTEFsZXJ0fSB0aGUgYWxlcnQgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gTUxBbGVydCQkb3BlbkFsZXJ0KG9wdGlvbnMpIHtcbiAgICB2YXIgYWxlcnQgPSBNTEFsZXJ0LmNyZWF0ZUFsZXJ0KG9wdGlvbnMpO1xuICAgIGFsZXJ0Lm9wZW5BbGVydCgpO1xuICAgIHJldHVybiBhbGVydDtcbn1cblxuZnVuY3Rpb24gX29uQ2xvc2VCdG5DbGljayh0eXBlLCBldmVudCkge1xuICAgIHRoaXMuY2xvc2VBbGVydCgpO1xufVxuXG5mdW5jdGlvbiBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBfLmNsb25lKG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuY2xvc2UgPSB0eXBlb2Ygb3B0aW9ucy5jbG9zZSA9PSAndW5kZWZpbmVkJyB8fCBvcHRpb25zLmNsb3NlID09PSB0cnVlO1xuICAgIG9wdGlvbnMudGltZW91dCA9IE1hdGguZmxvb3Iob3B0aW9ucy50aW1lb3V0KTtcbiAgICBvcHRpb25zLnR5cGUgPSBvcHRpb25zLnR5cGUgfHwgJ2luZm8nO1xuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59XG5cbi8qKlxuICogT3BlbiB0aGUgYWxlcnRcbiAqL1xuZnVuY3Rpb24gTUxBbGVydCRvcGVuQWxlcnQoKSB7XG4gICAgX3RvZ2dsZUFsZXJ0LmNhbGwodGhpcywgdHJ1ZSk7XG59XG5cbi8qKlxuICogQ2xvc2UgdGhlIGFsZXJ0XG4gKi9cbmZ1bmN0aW9uIE1MQWxlcnQkY2xvc2VBbGVydCgpIHtcbiAgICBfdG9nZ2xlQWxlcnQuY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5kZXN0cm95KCk7XG59XG5cbmZ1bmN0aW9uIF90b2dnbGVBbGVydChkb1Nob3cpIHtcbiAgICBkb1Nob3cgPSB0eXBlb2YgZG9TaG93ID09ICd1bmRlZmluZWQnID8gIXRoaXMuX2FsZXJ0LnZpc2libGUgOiAhIWRvU2hvdztcblxuICAgIHZhciBhZGRSZW1vdmUgPSBkb1Nob3cgPyAnYWRkJyA6ICdyZW1vdmUnLFxuICAgICAgICBhcHBlbmRSZW1vdmUgPSBkb1Nob3cgPyAnYXBwZW5kQ2hpbGQnIDogJ3JlbW92ZUNoaWxkJztcblxuICAgIHRoaXMuX2FsZXJ0LnZpc2libGUgPSBkb1Nob3c7XG5cbiAgICBkb2N1bWVudC5ib2R5W2FwcGVuZFJlbW92ZV0odGhpcy5lbCk7XG4gICAgdGhpcy5kb20udG9nZ2xlKGRvU2hvdyk7XG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgIWRvU2hvdyk7XG4gICAgdGhpcy5lbC5jbGFzc0xpc3RbYWRkUmVtb3ZlXSgnaW4nKTtcbiAgICB0aGlzLmVsW2RvU2hvdyA/ICdmb2N1cycgOiAnYmx1ciddKCk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnQsXG4gICAgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzLFxuICAgIGNvbXBvbmVudE5hbWUgPSBtaWxvLnV0aWwuY29tcG9uZW50TmFtZSxcbiAgICBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyLFxuICAgIGNoZWNrID0gbWlsby51dGlsLmNoZWNrLFxuICAgIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cbnZhciBERUZBVUxUX0JVVFRPTlMgPSBbeyB0eXBlOiAnZGVmYXVsdCcsIGxhYmVsOiAnT0snLCByZXN1bHQ6ICdPSycgfV07XG5cbnZhciBDTE9TRV9PUFRJT05TID0gWydiYWNrZHJvcCcsICdrZXlib2FyZCcsICdidXR0b24nXTtcblxuLyogVE9ETyAtIHVzZSBpbiB0ZW1wbGF0ZVxudmFyIEJVVFRPTl9DU1NfQ0xBU1NFUyA9IHtcbiAgICBkZWZhdWx0OiAnYnRuLWRlZmF1bHQnLFxuICAgIHByaW1hcnk6ICdidG4tcHJpbWFyeScsXG4gICAgc3VjY2VzczogJ2J0bi1zdWNjZXNzJyxcbiAgICBpbmZvOiAnYnRuLWluZm8nLFxuICAgIHdhcm5pbmc6ICdidG4td2FybmluZycsXG4gICAgZGFuZ2VyOiAnYnRuLWRhbmdlcicsXG4gICAgbGluazogJ2J0bi1saW5rJ1xufTtcbiovXG5cbi8qKlxuICogRGlhbG9nIGNsYXNzIHRvIHNob3cgY3VzdG9tIGRpYWxvZyBib3hlcyBiYXNlZCBvbiBjb25maWd1cmF0aW9uIC0gc2VlIFtjcmVhdGVEaWFsb2ddKCNNTERpYWxvZyQkY3JlYXRlRGlhbG9nKSBtZXRob2QuXG4gKiBPbmx5IG9uZSBkaWFsb2cgY2FuIGJlIG9wZW5lZCBhdCBhIHRpbWUgLSB0cnlpbmcgdG8gb3BlbiBhbm90aGVyIHdpbGwgbG9nIGVycm9yIHRvIGNvbnNvbGUuIEN1cnJlbnRseSBvcGVuZWQgZGlhbG9nIGNhbiBiZSByZXRyaWV2ZWQgdXNpbmcgW2dldEN1cnJlbnREaWFsb2ddKCNNTERpYWxvZyQkZ2V0Q3VycmVudERpYWxvZykgY2xhc3MgbWV0aG9kLlxuICovXG52YXIgTUxEaWFsb2cgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRGlhbG9nJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6IFsnbWwtYnMtZGlhbG9nJywgJ21vZGFsJywgJ2ZhZGUnXSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgJ3JvbGUnOiAnZGlhbG9nJyxcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJ1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ1xcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZGlhbG9nIHt7PSBpdC5jc3NDbGFzcyB9fVwiPlxcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez8gaXQudGl0bGUgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGl0LmNsb3NlLmJ1dHRvbiB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cIltldmVudHNdOmNsb3NlQnRuXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIj4mdGltZXM7PC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwibW9kYWwtdGl0bGVcIj57ez0gaXQudGl0bGUgfX08L2g0PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgIHt7PyBpdC5odG1sIHx8IGl0LnRleHQgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIiBtbC1iaW5kPVwiW2NvbnRhaW5lcl06ZGlhbG9nQm9keVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGl0Lmh0bWwgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez0gaXQuaHRtbCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+e3s9IGl0LnRleHQgfX08L3A+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgIHt7PyBpdC5idXR0b25zICYmIGl0LmJ1dHRvbnMubGVuZ3RoIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1mb290ZXJcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7fiBpdC5idXR0b25zIDpidG4gfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImJ0biBidG4te3s9IGJ0bi50eXBlIH19e3s/IGJ0bi5jbHMgfX0ge3s9IGJ0bi5jbHMgfX17ez99fVwiXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1sLWJpbmQ9XCJbZXZlbnRzXTp7ez0gYnRuLm5hbWUgfX1cIj57ez0gYnRuLmxhYmVsIH19PC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e359fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgIDwvZGl2PidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERpYWxvZyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEaWFsb2c7XG5cbl8uZXh0ZW5kKE1MRGlhbG9nLCB7XG4gICAgY3JlYXRlRGlhbG9nOiBNTERpYWxvZyQkY3JlYXRlRGlhbG9nLFxuICAgIG9wZW5EaWFsb2c6IE1MRGlhbG9nJCRvcGVuRGlhbG9nLFxuICAgIGdldE9wZW5lZERpYWxvZzogTUxEaWFsb2ckJGdldE9wZW5lZERpYWxvZ1xufSk7XG5cbl8uZXh0ZW5kUHJvdG8oTUxEaWFsb2csIHtcbiAgICBvcGVuRGlhbG9nOiBNTERpYWxvZyRvcGVuRGlhbG9nLFxuICAgIGNsb3NlRGlhbG9nOiBNTERpYWxvZyRjbG9zZURpYWxvZyxcbiAgICBkZXN0cm95OiBNTERpYWxvZyRkZXN0cm95XG59KTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuZCByZXR1cm5zIGRpYWxvZyBpbnN0YW5jZS4gVG8gY3JlYXRlIGFuZCBvcGVuIGF0IHRoZSBzYW1lIHRpbWUgW29wZW5EaWFsb2ddKCNNTERpYWxvZyQkb3BlbkRpYWxvZylcbiAqIGBvcHRpb25zYCBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAgIHRpdGxlOiBvcHRpb25hbCBkaWFsb2cgdGl0bGVcbiAqICAgICBodG1sOiBvcHRpb25hbCBkaWFsb2cgdGV4dCBhcyBodG1sICh3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIHRleHQgaWYgYm90aCB0ZXh0IG5kIGh0bWwgYXJlIHBhc3NlZClcbiAqICAgICAgIG9yXG4gKiAgICAgdGV4dDogb3B0aW9uYWwgZGlhbG9nIHRleHRcbiAqICAgICBjbG9zZTogb3B0aW9uYWwgZmFsc2UgdG8gcHJldmVudCBiYWNrZHJvcCBhbmQgZXNjIGtleSBmcm9tIGNsb3NpbmcgdGhlIGRpYWxvZyBhbmQgcmVtb3ZpbmcgY2xvc2UgYnV0dG9uIGluIHRvcCByaWdodCBjb3JuZXJcbiAqICAgICAgICAgICAgb3IgdHJ1ZSAoZGVmYXVsdCkgdG8gZW5hYmxlIGFsbCBjbG9zZSBvcHRpb25zXG4gKiAgICAgICAgICAgIG9yIG9iamVjdCB3aXRoIHByb3BlcnRpZXNcbiAqICAgICAgICAgYmFja2Ryb3A6IGZhbHNlIG9yIHRydWUgKGRlZmF1bHQpLCBjbG9zZSBkaWFsb2cgd2hlbiBiYWNrZHJvcCBjbGlja2VkXG4gKiAgICAgICAgIGtleWJvYXJkOiBmYWxzZSBvciB0cnVlIChkZWZhdWx0KSwgY2xvc2UgZGlhbG9nIHdoZW4gZXNjIGtleSBpcyBwcmVzc2VkXG4gKiAgICAgICAgIGJ1dHRvbjogZmFsc2Ugb3IgdHJ1ZSAoZGVmYXVsdCksIHNob3cgY2xvc2UgYnV0dG9uIGluIHRoZSBoZWFkZXIgKHdvbid0IGJlIHNob3duIGlmIHRoZXJlIGlzIG5vIGhlYWRlciB3aGVuIHRpdGxlIGlzIG5vdCBwYXNzZWQpXG4gKiAgICAgYnV0dG9uczogb3B0aW9uYWwgYXJyYXkgb2YgYnV0dG9ucyBjb25maWd1cmF0aW9ucywgd2hlcmUgZWFjaCBidXR0b24gY29uZmlnIGlzIGFuIG9iamVjdFxuICogICAgICAgICBuYW1lOiAgIG9wdGlvbmFsIG5hbWUgb2YgY29tcG9uZW50LCBzaG91bGQgYmUgdW5pcXVlIGFuZCBzaG91bGQgbm90IGJlIGBjbG9zZUJ0bmAsIGlmIG5vdCBwYXNzZWQgYSB0aW1lc3RhbXAgYmFzZWQgbmFtZSB3aWxsIGJlIHVzZWRcbiAqICAgICAgICAgdHlwZTogICBidXR0b24gdHlwZSwgd2lsbCBkZXRlcm1pbmUgYnV0dG9uIENTUyBzdHlsZS4gUG9zc2libGUgdHlwZXMgYXJlOiBkZWZ1bHQsIHByaW1hcnksIHN1Y2Nlc3MsIGluZm8sIHdhcm5pbmcsIGRhbmdlciwgbGluayAobWFwIHRvIHJlbGF0ZWQgYm9vdHN0cmFwIGJ1dHRvbiBzdHlsZXMpXG4gKiAgICAgICAgIGxhYmVsOiAgYnV0dG9uIGxhYmVsXG4gKiAgICAgICAgIGNsb3NlOiAgb3B0aW9uYWwgZmFsc2UgdG8gcHJldmVudCB0aGlzIGJ1dHRvbiBmcm9tIGNsb3NpbmcgZGlhbG9nXG4gKiAgICAgICAgIHJlc3VsdDogc3RyaW5nIHdpdGggZGlhbG9nIGNsb3NlIHJlc3VsdCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIGRpYWxvZyBzdWJzY3JpYmVyIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAqICAgICAgICAgZGF0YTogICBhbnkgdmFsdWUvb2JqZWN0IG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSBkYXRhIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gZGlhbG9nIHN1YnNjcmliZXIgYXMgdGhlIHNlY29uZCBwYXJhbWV0ZXIuXG4gKiAgICAgICAgICAgICAgICAgSWYgZnVuY3Rpb24gaXMgcGFzc2VkIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggZGlhbG9nIGFzIGNvbnRleHQgYW5kIGJ1dHRvbiBvcHRpb25zIGFzIHBhcmFtZXRlci5cbiAqXG4gKiAgICAgSWYgYHRpdGxlYCBpcyBub3QgcGFzc2VkLCBkaWFsb2cgd2lsbCBub3QgaGF2ZSB0aXRsZSBzZWN0aW9uXG4gKiAgICAgSWYgbmVpdGhlciBgdGV4dGAgbm9yIGBodG1sYCBpcyBwYXNzZWQsIGRpYWxvZyB3aWxsIG5vdCBoYXZlIGJvZHkgc2VjdGlvbi5cbiAqICAgICBJZiBgYnV0dG9uc2AgYXJlIG5vdCBwYXNzZWQsIHRoZXJlIHdpbGwgb25seSBiZSBPSyBidXR0b24uXG4gKlxuICogV2hlbiBkaWFsb2cgaXMgY2xvc2VkLCB0aGUgc3Vic2NyaWJlciBpcyBjYWxsZWQgd2l0aCByZWF1bHQgYW5kIG9wdGlvbmFsIGRhdGEgYXMgZGVmaW5lZCBpbiBidXR0b25zIGNvbmZpZ3VyYXRpb25zLlxuICogSWYgYmFja2Ryb3AgaXMgY2xpY2tlZCBvciBFU0Mga2V5IGlzIHByZXNzZWQgdGhlIHJlc3VsdCB3aWxsIGJlICdkaXNtaXNzZWQnXG4gKiBJZiBjbG9zZSBidXR0b24gaW4gdGhlIHRvcCByaWdodCBjb3JuZXIgaXMgY2xpY2tlZCwgdGhlIHJlc3VsdCB3aWxsIGJlICdjbG9zZWQnIChkZWZhdWx0IHJlc3VsdClcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBkaWFsb2cgY29uZmlndXJhdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gaW5pdGlhbGl6ZSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB0byBpbml0aWFsaXplIHRoZSBkaWFsb2dcbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckJGNyZWF0ZURpYWxvZyhvcHRpb25zLCBpbml0aWFsaXplKSB7XG4gICAgY2hlY2sob3B0aW9ucywge1xuICAgICAgICB0aXRsZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgaHRtbDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgdGV4dDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgY2xvc2U6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLk9uZU9mKEJvb2xlYW4sIHtcbiAgICAgICAgICAgIGJhY2tkcm9wOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgICAgIGtleWJvYXJkOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgICAgIGJ1dHRvbjogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbilcbiAgICAgICAgfSkpLFxuICAgICAgICBidXR0b25zOiBNYXRjaC5PcHRpb25hbChbe1xuICAgICAgICAgICAgbmFtZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgICAgIGxhYmVsOiBTdHJpbmcsXG4gICAgICAgICAgICBjbG9zZTogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgICAgICByZXN1bHQ6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgICAgICBkYXRhOiBNYXRjaC5PcHRpb25hbChNYXRjaC5BbnkpLFxuICAgICAgICAgICAgY2xzOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpXG4gICAgICAgIH1dKSxcbiAgICAgICAgY3NzQ2xhc3M6IE1hdGNoLk9wdGlvbmFsKFN0cmluZylcbiAgICB9KTtcblxuICAgIHZhciBkaWFsb2cgPSBNTERpYWxvZy5jcmVhdGVPbkVsZW1lbnQoKTtcblxuICAgIG9wdGlvbnMgPSBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgZGlhbG9nLl9kaWFsb2cgPSB7XG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcblxuICAgIGRpYWxvZy50ZW1wbGF0ZS5yZW5kZXIob3B0aW9ucykuYmluZGVyKCk7XG5cbiAgICB2YXIgZGlhbG9nU2NvcGUgPSBkaWFsb2cuY29udGFpbmVyLnNjb3BlO1xuXG4gICAgaWYgKG9wdGlvbnMuY2xvc2UuYmFja2Ryb3ApIGRpYWxvZy5ldmVudHMub24oJ2NsaWNrJywgeyBzdWJzY3JpYmVyOiBfb25CYWNrZHJvcENsaWNrLCBjb250ZXh0OiBkaWFsb2cgfSk7XG5cbiAgICBpZiAob3B0aW9ucy50aXRsZSAmJiBvcHRpb25zLmNsb3NlLmJ1dHRvbikgZGlhbG9nU2NvcGUuY2xvc2VCdG4uZXZlbnRzLm9uKCdjbGljaycsIHsgc3Vic2NyaWJlcjogX29uQ2xvc2VCdG5DbGljaywgY29udGV4dDogZGlhbG9nIH0pO1xuXG4gICAgb3B0aW9ucy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24gKGJ0bikge1xuICAgICAgICB2YXIgYnV0dG9uU3Vic2NyaWJlciA9IHtcbiAgICAgICAgICAgIHN1YnNjcmliZXI6IF8ucGFydGlhbChfZGlhbG9nQnV0dG9uQ2xpY2ssIGJ0biksXG4gICAgICAgICAgICBjb250ZXh0OiBkaWFsb2dcbiAgICAgICAgfTtcbiAgICAgICAgZGlhbG9nU2NvcGVbYnRuLm5hbWVdLmV2ZW50cy5vbignY2xpY2snLCBidXR0b25TdWJzY3JpYmVyKTtcbiAgICB9KTtcblxuICAgIGlmIChpbml0aWFsaXplKSBpbml0aWFsaXplKGRpYWxvZyk7XG4gICAgcmV0dXJuIGRpYWxvZztcbn1cblxuZnVuY3Rpb24gX2RpYWxvZ0J1dHRvbkNsaWNrKGJ1dHRvbikge1xuICAgIGlmIChidXR0b24uY2xvc2UgIT09IGZhbHNlKSBfdG9nZ2xlRGlhbG9nLmNhbGwodGhpcywgZmFsc2UpO1xuXG4gICAgdmFyIGRhdGEgPSBfLnJlc3VsdChidXR0b24uZGF0YSwgdGhpcywgYnV0dG9uKTtcbiAgICBfZGlzcGF0Y2hSZXN1bHQuY2FsbCh0aGlzLCBidXR0b24ucmVzdWx0LCBkYXRhKTtcbn1cblxuZnVuY3Rpb24gX2Rpc3BhdGNoUmVzdWx0KHJlc3VsdCwgZGF0YSkge1xuICAgIHZhciBzdWJzY3JpYmVyID0gdGhpcy5fZGlhbG9nLnN1YnNjcmliZXI7XG4gICAgaWYgKHR5cGVvZiBzdWJzY3JpYmVyID09ICdmdW5jdGlvbicpIHN1YnNjcmliZXIuY2FsbCh0aGlzLCByZXN1bHQsIGRhdGEpO2Vsc2Ugc3Vic2NyaWJlci5zdWJzY3JpYmVyLmNhbGwoc3Vic2NyaWJlci5jb250ZXh0LCByZXN1bHQsIGRhdGEpO1xufVxuXG5mdW5jdGlvbiBfb25CYWNrZHJvcENsaWNrKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuZWwpIHRoaXMuY2xvc2VEaWFsb2coJ2Rpc21pc3NlZCcpO1xufVxuXG5mdW5jdGlvbiBfb25DbG9zZUJ0bkNsaWNrKCkge1xuICAgIHRoaXMuY2xvc2VEaWFsb2coJ2Nsb3NlZCcpO1xufVxuXG5mdW5jdGlvbiBfb25LZXlEb3duKGV2ZW50KSB7XG4gICAgaWYgKG9wZW5lZERpYWxvZyAmJiBvcGVuZWREaWFsb2cuX2RpYWxvZy5vcHRpb25zLmNsb3NlLmtleWJvYXJkICYmIGV2ZW50LmtleUNvZGUgPT0gMjcpIC8vIGVzYyBrZXlcbiAgICAgICAgb3BlbmVkRGlhbG9nLmNsb3NlRGlhbG9nKCdkaXNtaXNzZWQnKTtcbn1cblxuZnVuY3Rpb24gX3ByZXBhcmVPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gXy5jbG9uZShvcHRpb25zKTtcbiAgICBvcHRpb25zLmJ1dHRvbnMgPSBfLmNsb25lKG9wdGlvbnMuYnV0dG9ucyB8fCBERUZBVUxUX0JVVFRPTlMpO1xuICAgIG9wdGlvbnMuYnV0dG9ucy5mb3JFYWNoKGZ1bmN0aW9uIChidG4pIHtcbiAgICAgICAgYnRuLm5hbWUgPSBidG4ubmFtZSB8fCBjb21wb25lbnROYW1lKCk7XG4gICAgfSk7XG5cbiAgICBvcHRpb25zLmNsb3NlID0gdHlwZW9mIG9wdGlvbnMuY2xvc2UgPT0gJ3VuZGVmaW5lZCcgfHwgb3B0aW9ucy5jbG9zZSA9PT0gdHJ1ZSA/IF8ub2JqZWN0KENMT1NFX09QVElPTlMsIHRydWUpIDogdHlwZW9mIG9wdGlvbnMuY2xvc2UgPT0gJ29iamVjdCcgPyBfLm1hcFRvT2JqZWN0KENMT1NFX09QVElPTlMsIGZ1bmN0aW9uIChvcHQpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuY2xvc2Vbb3B0XSAhPT0gZmFsc2U7XG4gICAgfSkgOiBfLm9iamVjdChDTE9TRV9PUFRJT05TLCBmYWxzZSk7XG5cbiAgICByZXR1cm4gb3B0aW9ucztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW5kIHNob3cgZGlhbG9nIHBvcHVwXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0IHdpdGggdGl0bGUsIHRleHQgYW5kIGJ1dHRvbnMuIFNlZSBbY3JlYXRlRGlhbG9nXSgjTUxEaWFsb2ckJGNyZWF0ZURpYWxvZykgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gc3Vic2NyaWJlciBvcHRpb25hbCBzdWJzY3JpYmVyIGZ1bmN0aW9uIG9yIG9iamVjdCB0aGF0IGlzIHBhc3NlZCByZXN1bHQgYW5kIG9wdGlvbmFsIGRhdGEuIFVubGVzcyBjb250ZXh0IGlzIGRlZmluZWQsIGRpYWxvZyB3aWxsIGJlIHRoZSBjb250ZXh0LlxuICovXG5mdW5jdGlvbiBNTERpYWxvZyQkb3BlbkRpYWxvZyhvcHRpb25zLCBzdWJzY3JpYmVyLCBpbml0aWFsaXplKSB7XG4gICAgdmFyIGRpYWxvZyA9IE1MRGlhbG9nLmNyZWF0ZURpYWxvZyhvcHRpb25zLCBpbml0aWFsaXplKTtcbiAgICBkaWFsb2cub3BlbkRpYWxvZyhzdWJzY3JpYmVyKTtcbiAgICByZXR1cm4gZGlhbG9nO1xufVxuXG5mdW5jdGlvbiBfdG9nZ2xlRGlhbG9nKGRvU2hvdykge1xuICAgIGRvU2hvdyA9IHR5cGVvZiBkb1Nob3cgPT0gJ3VuZGVmaW5lZCcgPyAhdGhpcy5fZGlhbG9nLnZpc2libGUgOiAhIWRvU2hvdztcblxuICAgIHZhciBhZGRSZW1vdmUgPSBkb1Nob3cgPyAnYWRkJyA6ICdyZW1vdmUnLFxuICAgICAgICBhcHBlbmRSZW1vdmUgPSBkb1Nob3cgPyAnYXBwZW5kQ2hpbGQnIDogJ3JlbW92ZUNoaWxkJztcblxuICAgIHRoaXMuX2RpYWxvZy52aXNpYmxlID0gZG9TaG93O1xuXG4gICAgaWYgKGRvU2hvdyAmJiAhZGlhbG9nc0luaXRpYWxpemVkKSBfaW5pdGlhbGl6ZURpYWxvZ3MoKTtcblxuICAgIGRvY3VtZW50LmJvZHlbYXBwZW5kUmVtb3ZlXSh0aGlzLmVsKTtcbiAgICBpZiAoYmFja2Ryb3BFbCkgZG9jdW1lbnQuYm9keVthcHBlbmRSZW1vdmVdKGJhY2tkcm9wRWwpO1xuICAgIHRoaXMuZG9tLnRvZ2dsZShkb1Nob3cpO1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFkb1Nob3cpO1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0W2FkZFJlbW92ZV0oJ21vZGFsLW9wZW4nKTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdFthZGRSZW1vdmVdKCdpbicpO1xuXG4gICAgb3BlbmVkRGlhbG9nID0gZG9TaG93ID8gdGhpcyA6IHVuZGVmaW5lZDtcbiAgICB0aGlzLmVsW2RvU2hvdyA/ICdmb2N1cycgOiAnYmx1ciddKCk7XG59XG5cbnZhciBkaWFsb2dzSW5pdGlhbGl6ZWQsIGJhY2tkcm9wRWw7XG5cbmZ1bmN0aW9uIF9pbml0aWFsaXplRGlhbG9ncygpIHtcbiAgICBiYWNrZHJvcEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYmFja2Ryb3BFbC5jbGFzc05hbWUgPSAnbW9kYWwtYmFja2Ryb3AgZmFkZSBpbic7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9vbktleURvd24pO1xuICAgIGRpYWxvZ3NJbml0aWFsaXplZCA9IHRydWU7XG59XG5cbnZhciBvcGVuZWREaWFsb2c7XG5cbi8qKlxuICogT3BlbnMgZGlhbG9nIGluc3RhbmNlLlxuICogU3Vic2NyaWJlciBvYmplY3Qgc2hvdWxkIGhhdmUgdGhlIHNhbWUgZm9ybWF0IGFzIHRoZSBzdWJzY3JpYmVyIGZvciB0aGUgTWVzc2VuZ2VyIChhbHRob3VnaCBNZXNzZW5nZXIgaXMgbm90IHVzZWQpIC0gZWl0aGVyIGZ1bmN0aW9uIG9yIG9iamVjdCB3aXRoIHN1YnNjcmliZXIgYW5kIGNvbnRleHQgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gc3Vic2NyaWJlciBzdWJzY3JpYmVyIG9iamVjdFxuICovXG5mdW5jdGlvbiBNTERpYWxvZyRvcGVuRGlhbG9nKHN1YnNjcmliZXIpIHtcbiAgICBjaGVjayhzdWJzY3JpYmVyLCBNYXRjaC5PbmVPZihGdW5jdGlvbiwgeyBzdWJzY3JpYmVyOiBGdW5jdGlvbiwgY29udGV4dDogTWF0Y2guQW55IH0pKTtcblxuICAgIGlmIChvcGVuZWREaWFsb2cpIHJldHVybiBsb2dnZXIud2FybignTUxEaWFsb2cgb3BlbkRpYWxvZzogY2FuXFwndCBvcGVuIGRpYWxvZywgYW5vdGhlciBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuJyk7XG5cbiAgICB0aGlzLl9kaWFsb2cuc3Vic2NyaWJlciA9IHN1YnNjcmliZXI7XG4gICAgX3RvZ2dsZURpYWxvZy5jYWxsKHRoaXMsIHRydWUpO1xufVxuXG4vKipcbiAqIENsb3NlcyBkaWFsb2cgaW5zdGFuY2UsIG9wdGlvbmFsbHkgcGFzc2luZyByZXN1bHQgYW5kIGRhdGEgdG8gZGlhbG9nIHN1YnNjcmliZXIuXG4gKiBJZiBubyByZXN1bHQgaXMgcGFzc2VkLCAnY2xvc2VkJyB3aWxsIGJlIHBhc3NlZCB0byBzdWJzY3JpYmVyLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByZXN1bHQgZGlhbG9nIHJlc3VsdCwgcGFzc2VkIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIgdG8gc3ViY3NyaWJlclxuICogQHBhcmFtIHtBbnl9IGRhdGEgb3B0aW9uYWwgZGlhbG9nIGRhdGEsIHBhc3NlZCBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBzdWJzY3JpYmVyXG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJGNsb3NlRGlhbG9nKHJlc3VsdCwgZGF0YSkge1xuICAgIGlmICghb3BlbmVkRGlhbG9nKSByZXR1cm4gbG9nZ2VyLndhcm4oJ01MRGlhbG9nIGNsb3NlRGlhbG9nOiBjYW5cXCd0IGNsb3NlIGRpYWxvZywgbm8gZGlhbG9nIG9wZW4nKTtcblxuICAgIHJlc3VsdCA9IHJlc3VsdCB8fCAnY2xvc2VkJztcblxuICAgIF90b2dnbGVEaWFsb2cuY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgX2Rpc3BhdGNoUmVzdWx0LmNhbGwodGhpcywgcmVzdWx0LCBkYXRhKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGN1cnJlbnRseSBvcGVuZWQgZGlhbG9nXG4gKlxuICogQHJldHVybiB7TUxEaWFsb2d9XG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJCRnZXRPcGVuZWREaWFsb2coKSB7XG4gICAgcmV0dXJuIG9wZW5lZERpYWxvZztcbn1cblxuZnVuY3Rpb24gTUxEaWFsb2ckZGVzdHJveSgpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX29uS2V5RG93bik7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnQsXG4gICAgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzLFxuICAgIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXIsXG4gICAgRE9NTGlzdGVuZXJzID0gbWlsby51dGlsLmRvbUxpc3RlbmVycztcblxudmFyIFRPR0dMRV9DU1NfQ0xBU1MgPSAnZHJvcGRvd24tdG9nZ2xlJyxcbiAgICBNRU5VX0NTU19DTEFTUyA9ICdkcm9wZG93bi1tZW51JztcblxudmFyIE1MRHJvcGRvd24gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRHJvcGRvd24nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogWydtbC1icy1kcm9wZG93bicsICdkcm9wZG93biddXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEcm9wZG93bik7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEcm9wZG93bjtcblxuXy5leHRlbmRQcm90byhNTERyb3Bkb3duLCB7XG4gICAgc3RhcnQ6IE1MRHJvcGRvd24kc3RhcnQsXG4gICAgZGVzdHJveTogTUxEcm9wZG93biRkZXN0cm95LFxuICAgIHRvZ2dsZU1lbnU6IE1MRHJvcGRvd24kdG9nZ2xlTWVudSxcbiAgICBzaG93TWVudTogTUxEcm9wZG93biRzaG93TWVudSxcbiAgICBoaWRlTWVudTogTUxEcm9wZG93biRoaWRlTWVudVxufSk7XG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kc3RhcnQoKSB7XG4gICAgdmFyIHRvZ2dsZUVsID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcuJyArIFRPR0dMRV9DU1NfQ0xBU1MpLFxuICAgICAgICBtZW51RWwgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy4nICsgTUVOVV9DU1NfQ0xBU1MpO1xuXG4gICAgaWYgKCEodG9nZ2xlRWwgJiYgbWVudUVsKSkgcmV0dXJuIGxvZ2dlci5lcnJvcignTUxEcm9wZG93bjonLCBUT0dHTEVfQ1NTX0NMQVNTLCAnb3InLCBNRU5VX0NTU19DTEFTUywgJ2lzblxcJ3QgZm91bmQnKTtcblxuICAgIHZhciBkb2MgPSB3aW5kb3cuZG9jdW1lbnQsXG4gICAgICAgIGNsaWNrSGFuZGxlciA9IHRoaXMudG9nZ2xlTWVudS5iaW5kKHRoaXMsIHVuZGVmaW5lZCk7XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gbmV3IERPTUxpc3RlbmVycygpO1xuICAgIHRoaXMuX2Ryb3Bkb3duID0ge1xuICAgICAgICBtZW51OiBtZW51RWwsXG4gICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICBsaXN0ZW5lcnM6IGxpc3RlbmVyc1xuICAgIH07XG4gICAgdGhpcy5oaWRlTWVudSgpO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGxpc3RlbmVycy5hZGQodG9nZ2xlRWwsICdjbGljaycsIGNsaWNrSGFuZGxlcik7XG4gICAgLy9tYXliZSBvbmx5IGFkZCB0aGlzIGV2ZW50cyBpZiBpcyBvcGVuP1xuICAgIGxpc3RlbmVycy5hZGQoZG9jLCAnbW91c2VvdXQnLCBvbkRvY091dCk7XG4gICAgbGlzdGVuZXJzLmFkZChkb2MsICdjbGljaycsIG9uQ2xpY2spO1xuXG4gICAgZnVuY3Rpb24gb25Eb2NPdXQoZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgIHJlbGF0ZWRUYXJnZXQgPSBldmVudC5yZWxhdGVkVGFyZ2V0LFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gc2VsZi5fZHJvcGRvd24ubGlzdGVuZXJzO1xuXG4gICAgICAgIGlmIChpc0lmcmFtZSh0YXJnZXQpKSBsaXN0ZW5lcnMucmVtb3ZlKHRhcmdldC5jb250ZW50V2luZG93LmRvY3VtZW50LCAnY2xpY2snLCBvbkNsaWNrKTtcblxuICAgICAgICBpZiAoaXNJZnJhbWUocmVsYXRlZFRhcmdldCkpIGxpc3RlbmVycy5hZGQocmVsYXRlZFRhcmdldC5jb250ZW50V2luZG93LmRvY3VtZW50LCAnY2xpY2snLCBvbkNsaWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkNsaWNrKGV2ZW50KSB7XG4gICAgICAgIGlmICghc2VsZi5lbC5jb250YWlucyhldmVudC50YXJnZXQpKSBzZWxmLmhpZGVNZW51KCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0lmcmFtZShlbCkge1xuICAgIHJldHVybiBlbCAmJiBlbC50YWdOYW1lID09ICdJRlJBTUUnO1xufVxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZHJvcGRvd24ubGlzdGVuZXJzLnJlbW92ZUFsbCgpO1xuICAgIGRlbGV0ZSB0aGlzLl9kcm9wZG93bjtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gTUxEcm9wZG93biRzaG93TWVudSgpIHtcbiAgICB0aGlzLnRvZ2dsZU1lbnUodHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kaGlkZU1lbnUoKSB7XG4gICAgdGhpcy50b2dnbGVNZW51KGZhbHNlKTtcbn1cblxuZnVuY3Rpb24gTUxEcm9wZG93biR0b2dnbGVNZW51KGRvU2hvdykge1xuICAgIGRvU2hvdyA9IHR5cGVvZiBkb1Nob3cgPT0gJ3VuZGVmaW5lZCcgPyAhdGhpcy5fZHJvcGRvd24udmlzaWJsZSA6ICEhZG9TaG93O1xuXG4gICAgdGhpcy5fZHJvcGRvd24udmlzaWJsZSA9IGRvU2hvdztcblxuICAgIHZhciBtZW51ID0gdGhpcy5fZHJvcGRvd24ubWVudTtcbiAgICBtZW51LnN0eWxlLmRpc3BsYXkgPSBkb1Nob3cgPyAnYmxvY2snIDogJ25vbmUnO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGZvcm1HZW5lcmF0b3IgPSByZXF1aXJlKCcuL2dlbmVyYXRvcicpLFxuICAgIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cyxcbiAgICBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyLFxuICAgIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKSxcbiAgICBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jJyk7XG5cbnZhciBGT1JNX1ZBTElEQVRJT05fRkFJTEVEX0NTU19DTEFTUyA9ICdoYXMtZXJyb3InO1xuXG4vKipcbiAqIEEgY29tcG9uZW50IGNsYXNzIGZvciBnZW5lcmF0aW5nIGZvcm1zIGZyb20gc2NoZW1hXG4gKiBUbyBjcmVhdGUgZm9ybSBjbGFzcyBtZXRob2QgW2NyZWF0ZUZvcm1dKCNNTEZvcm0kJGNyZWF0ZUZvcm0pIHNob3VsZCBiZSB1c2VkLlxuICogRm9ybSBzY2hlbWEgaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICogYGBgXG4gKiB2YXIgc2NoZW1hID0ge1xuICogICAgIGNzczoge1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wdGlvbmFsIENTUyBmYWNldCBjb25maWd1cmF0aW9uXG4gKiAgICAgICAgIGNsYXNzZXM6IHsgLi4uIH1cbiAqICAgICB9LFxuICogICAgIGl0ZW1zOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICAgIHR5cGU6ICc8dHlwZSBvZiB1aSBjb250cm9sPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FuIGJlIGdyb3VwLCBzZWxlY3QsIGlucHV0LCBidXR0b24sIHJhZGlvLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh5cGVybGluaywgY2hlY2tib3gsIGxpc3QsIHRpbWUsIGRhdGVcbiAqICAgICAgICAgICAgIGNvbXBOYW1lOiAnPGNvbXBvbmVudCBuYW1lPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgbmFtZSBvZiBjb21wb25lbnQsIHNob3VsZCBiZSB1bmlxdWUgd2l0aGluIHRoZSBmb3JtXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKG9yIGZvcm0gZ3JvdXApLCBvbmx5IG5lZWRzIHRvYmUgdXNlZCB3aGVuIGNvbXBvbmVudCBuZWVkcyB0byBiZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1hbmlwaWxhdGVkIGluIHNvbWUgZXZlbnQgaGFuZGxlciBhbmQgaXQgY2Fubm90IGJlIGFjY2Vzc2VkIHZpYSBtb2RlbFBhdGhcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2luZyBgbW9kZWxQYXRoQ29tcG9uZW50YCBtZXRob2RcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAod2hpY2ggaXMgYSBwcmVmZXJyZWQgd2F5IHRvIGFjY2VzcyBjb25wb25lbnRzIGluIGZvcm0pXG4gKiAgICAgICAgICAgICBsYWJlbDogJzx1aSBjb250cm9sIGxhYmVsPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgbGFiZWwsIHdpbGwgbm90IGJlIGFkZGVkIGlmIG5vdCBkZWZpbmVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3IgZW1wdHkgc3RyaW5nXG4gKiAgICAgICAgICAgICBhbHRUZXh0OiAnPGFsdCB0ZXh0IG9yIHRpdGxlPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgYWx0IHRleHQgc3RyaW5nIG9uIGJ1dHRvbnMgYW5kIGh5cGVybGlua3NcbiAqICAgICAgICAgICAgIG1vZGVsUGF0aDogJzxtb2RlbCBtYXBwaW5nPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGF0aCBpbiBtb2RlbCB3aGVyZSB0aGUgdmFsdWUgd2lsbCBiZSBzdG9yZWQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW9zdCB0eXBlcyBvZiBpdGVtcyByZXF1aXJlIHRoaXMgcHJvcGVydHksXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc29tZSBpdGVtcyBtYXkgaGF2ZSB0aGlzIHByb3BlcnR5IChidXR0b24sIGUuZy4pLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiZ3JvdXBcIiBtdXN0IE5PVCBoYXZlIHRoaXMgcHJvcGVydHkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FybmluZyB3aWxsIGJlIGxvZ2dlZCBpZiB0aGVzZSBydWxlcyBhcmUgbm90IGZvbGxvd2VkLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0ZW1zIHdpdGhvdXQgdGhpcyBwcm9wZXJ0eSB3aWxsIG5vdCBiZSBpbiBtb2RlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIChhcGFydCBmcm9tIFwiZ3JvdXAgd2hpY2ggc3ViaXRlbXMgd2lsbCBiZSBpbiBtb2RlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXkgaGF2ZSB0aGlzIHByb3BlcnR5KVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcHJvcGVydHkgYWxsb3dzIHRvIGhhdmUgZml4ZWQgZm9ybSBtb2RlbCBzdHJ1Y3R1cmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGlsZSBjaGFuZ2luZyB2aWV3IHN0cnVjdHVyZSBvZiB0aGUgZm9ybVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlZSBNb2RlbC5cbiAqICAgICAgICAgICAgIG1vZGVsUGF0dGVybjogJ21hcHBpbmcgZXh0ZW5zaW9uIHBhdHRlcm4nLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKHN0cmluZylcbiAqICAgICAgICAgICAgIG5vdEluTW9kZWw6IHRydWUsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbGxvd3MgdG8gTk9UIGluY2x1ZGUgbW9kZWxQYXRoIHdoZXJlIG90aGVyd2lzZSBpdCB3b3VsZCBiZSByZXF1aXJlZFxuICogICAgICAgICAgICAgbWVzc2FnZXM6IHsgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gc3Vic2NyaWJlIHRvIG1lc3NhZ2VzIG9uIGl0ZW0ncyBjb21wb25lbnQgZmFjZXRzXG4gKiAgICAgICAgICAgICAgICAgZXZlbnRzOiB7ICAgICAgICAgICAgICAgICAgICAvLyBmYWNldCB0byBzdWJzY3JpYmUgdG9cbiAqICAgICAgICAgICAgICAgICAgICAgJzxtZXNzYWdlMT4nOiBvbk1lc3NhZ2UxIC8vIG1lc3NhZ2UgYW5kIHN1YnNjcmliZXIgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICAgJzxtc2cyPiA8bXNnMz4nOiB7ICAgICAgIC8vIHN1YnNjcmliZSB0byAyIG1lc3NhZ2VzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyOiBvbk1lc3NhZ2UyLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCAgICAgLy8gY29udGV4dCBjYW4gYmUgYW4gb2JqZWN0IG9yIGEgc3RyaW5nOlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJmYWNldFwiOiBmYWNldCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJvd25lclwiOiBpdGVtIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJmb3JtXCI6IHRoZSBmb3JtIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJob3N0XCI6IGhvc3Qgb2JqZWN0IHBhc3NlZCB0byBjcmVhdGVGb3JtIG1ldGhvZCB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICAgICAgICAgfVxuICogICAgICAgICAgICAgfSxcbiAqICAgICAgICAgICAgIHRyYW5zbGF0ZTogeyAgICAgICAgICAvLyBvcHRpb25hbCBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9uc1xuICogICAgICAgICAgICAgICAgIGNvbnRleHQ6IE9iamVjdCAgIC8vIG9wdGlvbmFsIGNvbnRleHQgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byB0cmFuc2xhdGUgZnVuY3Rpb25zLCAnaG9zdCcgbWVhbnMgdGhlIGhvc3RPYmplY3QgcGFzc2VkIHRvIEZvcm0uY3JlYXRlRm9ybVxuICogICAgICAgICAgICAgICAgIHRvTW9kZWw6IGZ1bmMxLCAgIC8vIHRyYW5zbGF0ZXMgaXRlbSBkYXRhIGZyb20gdmlldyB0byBtb2RlbFxuICogICAgICAgICAgICAgICAgIGZyb21Nb2RlbDogZnVuYzIgIC8vIHRyYW5zbGF0ZXMgaXRlbSBkYXRhIGZyb20gbW9kZWwgdG8gdmlld1xuICogICAgICAgICAgICAgfSxcbiAqICAgICAgICAgICAgIHZhbGlkYXRlOiB7ICAgICAgICAgICAvLyBvcHRpb25hbCBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKiAgICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0ICAgLy8gb3B0aW9uYWwgY29udGV4dCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHZhbGlkYXRlIGZ1bmN0aW9ucywgJ2hvc3QnIG1lYW5zIHRoZSBob3N0T2JqZWN0IHBhc3NlZCB0byBGb3JtLmNyZWF0ZUZvcm1cbiAqICAgICAgICAgICAgICAgICB0b01vZGVsOiAgIGZ1bmMxIHwgW2Z1bmMxLCBmdW5jMiwgLi4uXSwvLyB2YWxpZGF0ZXMgaXRlbSBkYXRhIHdoZW4gaXQgaXMgY2hhbmdlZCBpbiBmb3JtXG4gKiAgICAgICAgICAgICAgICAgZnJvbU1vZGVsOiBmdW5jMiB8IFtmdW5jMywgZnVuYzQsIC4uLl0gLy8gb3Bwb3NpdGUsIGJ1dCBub3QgcmVhbGx5IHVzZWQgYW5kIGRvZXMgbm90IG1ha2UgZm9ybSBpbnZhbGlkIGlmIGl0IGZhaWxzLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbiBiZSB1c2VkIHRvIHByZXZlbnQgZGF0YSBiZWluZyBzaG93biBpbiB0aGUgZm9ybS5cbiAqICAgICAgICAgICAgIH0sICAgICAgICAgICAgICAgICAgICAvLyBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zIHNob3VsZCBhY2NlcHQgdHdvIHBhcmFtZXRlcnM6IGRhdGEgYW5kIGNhbGxiYWNrICh0aGV5IGFyZSBhc3luY2hyb25vdXMpLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdmFsaWRhdGlvbiBpcyBmaW5pc2hlZCwgY2FsbGJhY2sgc2hvdWxkIGJlIGNhbGxlZCB3aXRoIChlcnJvciwgcmVzcG9uc2UpIHBhcmFtZXRlcnMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzcG9uc2Ugc2hvdWxkIGhhdmUgcHJvcGVydGllcyB2YWxpZCAoQm9vbGVhbikgYW5kIG9wdGlvbmFsIHJlYXNvbiAoU3RyaW5nIC0gcmVhc29uIG9mIHZhbGlkYXRpb24gZmFpbHVyZSkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSE6IGF0IHRoZSBtb21lbnQsIGlmIGNhbGxiYWNrIGlzIGNhbGxlZCB3aXRoIGVycm9yIHBhcmFtZXRlciB3aGljaCBpcyBub3QgZmFsc3ksIHZhbGlkYXRpb24gd2lsbCBiZSBwYXNzZWQuXG4gKiAgICAgICAgICAgICA8aXRlbSBzcGVjaWZpYz46IHs8aXRlbSBjb25maWd1cmF0aW9uPn1cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcInNlbGVjdFwiIHN1cHBvcnRzIFwic2VsZWN0T3B0aW9uc1wiIC0gYXJyYXkgb2Ygb2JqZWN0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggcHJvcGVydGllcyBcInZhbHVlXCIgYW5kIFwibGFiZWxcIlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwicmFkaW9cIiBzdXBwb3J0cyBcInJhZGlvT3B0aW9uc1wiIHdpdGggdGhlIHNhbWUgZm9ybWF0XG4gKiAgICAgICAgICAgICBpdGVtczogW1xuICogICAgICAgICAgICAgICAgIHsgLi4uIH0gLy8sIC4uLiAtIGl0ZW1zIGluc2lkZSBcImdyb3VwXCIgb3IgXCJ3cmFwcGVyXCIgaXRlbVxuICogICAgICAgICAgICAgXVxuICogICAgICAgICB9IC8vICwgLi4uIG1vcmUgaXRlbXNcbiAqICAgICBdXG4gKiB9XG4gKi9cbnZhciBNTEZvcm0gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRm9ybScsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtZm9ybSdcbiAgICB9LFxuICAgIGNzczogdW5kZWZpbmVkLCAvLyBGYWNldCBjb25maWcgY2FuIGJlIHNldCB2aWEgZm9ybSBzY2hlbWFcbiAgICBtb2RlbDogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxGb3JtKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEZvcm07XG5cbl8uZXh0ZW5kKE1MRm9ybSwge1xuICAgIGNyZWF0ZUZvcm06IE1MRm9ybSQkY3JlYXRlRm9ybSxcbiAgICByZWdpc3RlclNjaGVtYUtleTogTUxGb3JtJCRyZWdpc3RlclNjaGVtYUtleSxcbiAgICByZWdpc3RlclZhbGlkYXRpb246IE1MRm9ybSQkcmVnaXN0ZXJWYWxpZGF0aW9uLFxuICAgIHZhbGlkYXRvclJlc3BvbnNlOiBNTEZvcm0kJHZhbGlkYXRvclJlc3BvbnNlLFxuICAgIGdlbmVyYXRvcjogZm9ybUdlbmVyYXRvcixcbiAgICByZWdpc3RyeTogZm9ybVJlZ2lzdHJ5XG59KTtcblxuXy5leHRlbmRQcm90byhNTEZvcm0sIHtcbiAgICBnZXRIb3N0T2JqZWN0OiBNTEZvcm0kZ2V0SG9zdE9iamVjdCxcbiAgICBpc1ZhbGlkOiBNTEZvcm0kaXNWYWxpZCxcbiAgICB2YWxpZGF0ZU1vZGVsOiBNTEZvcm0kdmFsaWRhdGVNb2RlbCxcbiAgICBnZXRJbnZhbGlkQ29udHJvbHM6IE1MRm9ybSRnZXRJbnZhbGlkQ29udHJvbHMsXG4gICAgZ2V0SW52YWxpZFJlYXNvbnM6IE1MRm9ybSRnZXRJbnZhbGlkUmVhc29ucyxcbiAgICBnZXRJbnZhbGlkUmVhc29uc1RleHQ6IE1MRm9ybSRnZXRJbnZhbGlkUmVhc29uc1RleHQsXG4gICAgbW9kZWxQYXRoQ29tcG9uZW50OiBNTEZvcm0kbW9kZWxQYXRoQ29tcG9uZW50LFxuICAgIG1vZGVsUGF0aFNjaGVtYTogTUxGb3JtJG1vZGVsUGF0aFNjaGVtYSxcbiAgICB2aWV3UGF0aENvbXBvbmVudDogTUxGb3JtJHZpZXdQYXRoQ29tcG9uZW50LFxuICAgIHZpZXdQYXRoU2NoZW1hOiBNTEZvcm0kdmlld1BhdGhTY2hlbWEsXG4gICAgZ2V0TW9kZWxQYXRoOiBNTEZvcm0kZ2V0TW9kZWxQYXRoLFxuICAgIGdldFZpZXdQYXRoOiBNTEZvcm0kZ2V0Vmlld1BhdGgsXG4gICAgZGVzdHJveTogTUxGb3JtJGRlc3Ryb3lcbn0pO1xuXG52YXIgU0NIRU1BX0tFWVdPUkRTID0gXy5vYmplY3QoWyd0eXBlJywgJ2NvbXBOYW1lJywgJ2xhYmVsJywgJ2FsdFRleHQnLCAnbW9kZWxQYXRoJywgJ21vZGVsUGF0dGVybicsICdub3RJbk1vZGVsJywgJ21lc3NhZ2VzJywgJ3RyYW5zbGF0ZScsICd2YWxpZGF0ZScsICdpdGVtcycsICdzZWxlY3RPcHRpb25zJywgJ3JhZGlvT3B0aW9ucycsICdjb21ib09wdGlvbnMnLCAnY29tYm9PcHRpb25zVVJMJywgJ2FkZEl0ZW1Qcm9tcHQnLCAncGxhY2VIb2xkZXInLCAndmFsdWUnLCAnZGF0YVZhbGlkYXRpb24nLCAnYXN5bmNIYW5kbGVyJywgJ2F1dG9yZXNpemUnLCAnbWF4TGVuZ3RoJ10sIHRydWUpO1xuXG4vKipcbiAqIE1MRm9ybSBjbGFzcyBtZXRob2RcbiAqIENyZWF0ZXMgZm9ybSBmcm9tIHNjaGVtYS5cbiAqIEZvcm0gZGF0YSBjYW4gYmUgb2J0YWluZWQgZnJvbSBpdHMgTW9kZWwgKGBmb3JtLm1vZGVsYCksIHJlYWN0aXZlIGNvbm5lY3Rpb24gdG8gZm9ybSdzIG1vZGVsIGNhbiBhbHNvIGJlIHVzZWQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSBmb3JtIHNjaGVtYSwgYXMgZGVzY3JpYmVkIGFib3ZlXG4gKiBAcGFyYW0ge09iamVjdH0gaG9zdE9iamVjdCBmb3JtIGhvc3Qgb2JqZWN0LCB1c2VkIHRvIGRlZmluZSBhcyBtZXNzYWdlIHN1YnNjcmliZXIgY29udGV4dCBpbiBzY2hlbWEgLSBieSBjb252ZW50aW9uIHRoZSBjb250ZXh0IHNob3VsZCBiZSBkZWZpbmVkIGFzIFwiaG9zdFwiXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybURhdGEgZGF0YSB0byBpbml0aWFsaXplIHRoZSBmb3JtIHdpdGhcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZW1wbGF0ZSBvcHRpb25hbCBmb3JtIHRlbXBsYXRlLCB3aWxsIGJlIHVzZWQgaW5zdGVhZCBvZiBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBmcm9tIHNjaGVtYS4gTm90IHJlY29tbWVuZGVkIHRvIHVzZSwgYXMgaXQgd2lsbCBoYXZlIHRvIGJlIG1haW50YWluZWQgdG8gYmUgY29uc2lzdGVudCB3aXRoIHNjaGVtYSBmb3IgYmluZGluZ3MuXG4gKiBAcmV0dXJuIHtNTEZvcm19XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSQkY3JlYXRlRm9ybShzY2hlbWEsIGhvc3RPYmplY3QsIGZvcm1EYXRhLCB0ZW1wbGF0ZSkge1xuICAgIHZhciBGb3JtQ2xhc3MgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gX2NyZWF0ZUZvcm1Db21wb25lbnQoRm9ybUNsYXNzKTtcbiAgICBfLmRlZmluZVByb3BlcnR5KGZvcm0sICdfaG9zdE9iamVjdCcsIGhvc3RPYmplY3QpO1xuICAgIHZhciBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnM7XG4gICAgX3Byb2Nlc3NGb3JtU2NoZW1hKCk7XG4gICAgX2NyZWF0ZUZvcm1Db25uZWN0b3JzKCk7XG4gICAgX21hbmFnZUZvcm1WYWxpZGF0aW9uKCk7XG5cbiAgICAvLyBzZXQgb3JpZ2luYWwgZm9ybSBkYXRhXG4gICAgaWYgKGZvcm1EYXRhKSBmb3JtLm1vZGVsLm0uc2V0KGZvcm1EYXRhKTtcblxuICAgIGlmIChzY2hlbWEuY3NzKSBmb3JtLmNzcy5jb25maWcgPSBzY2hlbWEuY3NzO1xuXG4gICAgcmV0dXJuIGZvcm07XG5cbiAgICBmdW5jdGlvbiBfY3JlYXRlRm9ybUNvbXBvbmVudChGb3JtQ2xhc3MpIHtcbiAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZSB8fCBmb3JtR2VuZXJhdG9yKHNjaGVtYSk7XG4gICAgICAgIHJldHVybiBGb3JtQ2xhc3MuY3JlYXRlT25FbGVtZW50KHVuZGVmaW5lZCwgdGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9wcm9jZXNzRm9ybVNjaGVtYSgpIHtcbiAgICAgICAgLy8gbW9kZWwgcGF0aHMgdHJhbnNsYXRpb24gcnVsZXNcbiAgICAgICAgZm9ybVZpZXdQYXRocyA9IHt9O1xuICAgICAgICBmb3JtTW9kZWxQYXRocyA9IHt9O1xuICAgICAgICBtb2RlbFBhdGhUcmFuc2xhdGlvbnMgPSB7fTtcbiAgICAgICAgZGF0YVRyYW5zbGF0aW9ucyA9IHsgZnJvbU1vZGVsOiB7fSwgdG9Nb2RlbDoge30gfTtcbiAgICAgICAgZGF0YVZhbGlkYXRpb25zID0geyBmcm9tTW9kZWw6IHt9LCB0b01vZGVsOiB7fSB9O1xuXG4gICAgICAgIC8vIHByb2Nlc3MgZm9ybSBzY2hlbWFcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb2Nlc3NTY2hlbWEuY2FsbChmb3JtLCBmb3JtLCBzY2hlbWEsICcnLCBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ2Zvcm1WaWV3UGF0aHMgYmVmb3JlIGVycm9yOiAnLCBmb3JtVmlld1BhdGhzKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZm9ybU1vZGVsUGF0aHMgYmVmb3JlIGVycm9yOiAnLCBmb3JtTW9kZWxQYXRocyk7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ21vZGVsUGF0aFRyYW5zbGF0aW9ucyBiZWZvcmUgZXJyb3I6ICcsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucyk7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ2RhdGFUcmFuc2xhdGlvbnMgYmVmb3JlIGVycm9yOiAnLCBkYXRhVHJhbnNsYXRpb25zKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZGF0YVZhbGlkYXRpb25zIGJlZm9yZSBlcnJvcjogJywgZGF0YVZhbGlkYXRpb25zKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtLl9mb3JtVmlld1BhdGhzID0gZm9ybVZpZXdQYXRocztcbiAgICAgICAgZm9ybS5fZm9ybU1vZGVsUGF0aHMgPSBmb3JtTW9kZWxQYXRocztcbiAgICAgICAgZm9ybS5fbW9kZWxQYXRoVHJhbnNsYXRpb25zID0gbW9kZWxQYXRoVHJhbnNsYXRpb25zO1xuICAgICAgICBmb3JtLl9kYXRhVHJhbnNsYXRpb25zID0gZGF0YVRyYW5zbGF0aW9ucztcbiAgICAgICAgZm9ybS5fZGF0YVZhbGlkYXRpb25zID0gZGF0YVZhbGlkYXRpb25zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVGb3JtQ29ubmVjdG9ycygpIHtcbiAgICAgICAgdmFyIGNvbm5lY3RvcnMgPSBmb3JtLl9jb25uZWN0b3JzID0gW107XG5cbiAgICAgICAgLy8gY29ubmVjdCBmb3JtIHZpZXcgdG8gZm9ybSBtb2RlbCB1c2luZyB0cmFuc2xhdGlvbiBydWxlcyBmcm9tIG1vZGVsUGF0aCBwcm9wZXJ0aWVzIG9mIGZvcm0gaXRlbXNcbiAgICAgICAgY29ubmVjdG9ycy5wdXNoKG1pbG8ubWluZGVyKGZvcm0uZGF0YSwgJzwtPicsIGZvcm0ubW9kZWwsIHsgLy8gY29ubmVjdGlvbiBkZXB0aCBpcyBkZWZpbmVkIG9uIGZpZWxkIGJ5IGZpZWxkIGJhc2lzIGJ5IHBhdGhUcmFuc2xhdGlvblxuICAgICAgICAgICAgcGF0aFRyYW5zbGF0aW9uOiBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsXG4gICAgICAgICAgICBkYXRhVHJhbnNsYXRpb246IHtcbiAgICAgICAgICAgICAgICAnPC0nOiBkYXRhVHJhbnNsYXRpb25zLmZyb21Nb2RlbCxcbiAgICAgICAgICAgICAgICAnLT4nOiBkYXRhVHJhbnNsYXRpb25zLnRvTW9kZWxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhVmFsaWRhdGlvbjoge1xuICAgICAgICAgICAgICAgICc8LSc6IGRhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwsXG4gICAgICAgICAgICAgICAgJy0+JzogZGF0YVZhbGlkYXRpb25zLnRvTW9kZWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGlmIChzY2hlbWEuY3NzKSB7XG4gICAgICAgICAgICBjb25uZWN0b3JzLnB1c2gobWlsby5taW5kZXIoZm9ybS5tb2RlbCwgJy0+Pj4nLCBmb3JtLmNzcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX21hbmFnZUZvcm1WYWxpZGF0aW9uKCkge1xuICAgICAgICBmb3JtLl9pbnZhbGlkRm9ybUNvbnRyb2xzID0ge307XG5cbiAgICAgICAgZm9ybS5tb2RlbC5vbigndmFsaWRhdGVkJywgY3JlYXRlT25WYWxpZGF0ZWQodHJ1ZSkpO1xuICAgICAgICBmb3JtLmRhdGEub24oJ3ZhbGlkYXRlZCcsIGNyZWF0ZU9uVmFsaWRhdGVkKGZhbHNlKSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlT25WYWxpZGF0ZWQoaXNGcm9tTW9kZWwpIHtcbiAgICAgICAgICAgIHZhciBwYXRoQ29tcE1ldGhvZCA9IGlzRnJvbU1vZGVsID8gJ21vZGVsUGF0aENvbXBvbmVudCcgOiAndmlld1BhdGhDb21wb25lbnQnLFxuICAgICAgICAgICAgICAgIHBhdGhTY2hlbWFNZXRob2QgPSBpc0Zyb21Nb2RlbCA/ICdtb2RlbFBhdGhTY2hlbWEnIDogJ3ZpZXdQYXRoU2NoZW1hJztcblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtc2csIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGZvcm1bcGF0aENvbXBNZXRob2RdKHJlc3BvbnNlLnBhdGgpLFxuICAgICAgICAgICAgICAgICAgICBzY2hlbWEgPSBmb3JtW3BhdGhTY2hlbWFNZXRob2RdKHJlc3BvbnNlLnBhdGgpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHNjaGVtYS5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWxQYXRoID0gc2NoZW1hLm1vZGVsUGF0aDtcblxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudEVsID0gY29tcG9uZW50LmVsLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsLmNsYXNzTGlzdC50b2dnbGUoRk9STV9WQUxJREFUSU9OX0ZBSUxFRF9DU1NfQ0xBU1MsICFyZXNwb25zZS52YWxpZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYXNvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnZhbGlkKSBkZWxldGUgZm9ybS5faW52YWxpZEZvcm1Db250cm9sc1ttb2RlbFBhdGhdO2Vsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFzb246IHJlc3BvbnNlLnJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFzb25Db2RlOiByZXNwb25zZS5yZWFzb25Db2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5faW52YWxpZEZvcm1Db250cm9sc1ttb2RlbFBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBfLmNsb25lKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRnJvbU1vZGVsKSBkYXRhLnBhdGggPSBmb3JtLmdldE1vZGVsUGF0aChkYXRhLnBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucmVhc29uID0gcmVhc29uOyAvLyBhIGJpdCBoYWNreSwgcmVwbGFjaW5nIHN0cmluZyB3aXRoIG9iamVjdCBjcmVhdGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5yZWFzb25Db2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvcm0ucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRpb24nLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgbG9nZ2VyLmVycm9yKCdGb3JtOiBjb21wb25lbnQgZm9yIHBhdGggJyArIHJlc3BvbnNlLnBhdGggKyAnIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDdXN0b20gc2NoZW1hIGtleXdvcmRzXG4gKi9cbnZhciBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5ID0ge307XG5mdW5jdGlvbiBNTEZvcm0kJHJlZ2lzdGVyU2NoZW1hS2V5KGtleXdvcmQsIHByb2Nlc3NLZXl3b3JkRnVuYywgcmVwbGFjZUtleXdvcmQpIHtcbiAgICBpZiAoU0NIRU1BX0tFWVdPUkRTW2tleXdvcmRdKSB0aHJvdyBuZXcgRXJyb3IoJ0tleXdvcmQnLCBrZXl3b3JkLCAnaXMgdXNlZCBieSBNTEZvcm0gY2xhc3Mgb3Igb25lIG9mIHByZS1yZWdpc3RlcmVkIGZvcm0gaXRlbXMgYW5kIGNhbm5vdCBiZSBvdmVycmlkZGVuJyk7XG5cbiAgICBpZiAoIXJlcGxhY2VLZXl3b3JkICYmIHNjaGVtYUtleXdvcmRzUmVnaXN0cnlba2V5d29yZF0pIHRocm93IG5ldyBFcnJvcignS2V5d29yZCcsIGtleXdvcmQsICdpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuIFBhc3MgdHJ1ZSBhcyB0aGUgdGhpcmQgcGFyYW1ldGVyIHRvIHJlcGxhY2UgaXQnKTtcblxuICAgIHNjaGVtYUtleXdvcmRzUmVnaXN0cnlba2V5d29yZF0gPSBwcm9jZXNzS2V5d29yZEZ1bmM7XG59XG5cbi8qKlxuICogUHJlZGVmaW5lZCBmb3JtIHZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKi9cbnZhciB2YWxpZGF0aW9uRnVuY3Rpb25zID0ge1xuICAgICdyZXF1aXJlZCc6IHZhbGlkYXRlUmVxdWlyZWRcbn07XG5mdW5jdGlvbiBNTEZvcm0kJHJlZ2lzdGVyVmFsaWRhdGlvbihuYW1lLCBmdW5jLCByZXBsYWNlRnVuYykge1xuICAgIGlmICghcmVwbGFjZUZ1bmMgJiYgdmFsaWRhdGlvbkZ1bmN0aW9uc1tuYW1lXSkgdGhyb3cgbmV3IEVycm9yKCdWYWxpZGF0aW5nIGZ1bmN0aW9uJywgbmFtZSwgJ2lzIGFscmVhZHkgcmVnaXN0ZXJlZC4gUGFzcyB0cnVlIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXIgdG8gcmVwbGFjZSBpdCcpO1xuXG4gICAgdmFsaWRhdGlvbkZ1bmN0aW9uc1tuYW1lXSA9IGZ1bmM7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZm9ybSBob3N0IG9iamVjdC5cbiAqIEByZXR1cm4ge0NvbXBvbmVudH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldEhvc3RPYmplY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hvc3RPYmplY3Q7XG59XG5cbi8qKlxuICogUmV0dXJucyBjdXJyZW50IHZhbGlkYXRpb24gc3RhdHVzIG9mIHRoZSBmb3JtXG4gKiBXaWxsIG5vdCB2YWxpZGF0ZSBmaWVsZHMgdGhhdCB3ZXJlIG5ldmVyIGNoYW5nZWQgaW4gdmlld1xuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRpc1ZhbGlkKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9pbnZhbGlkRm9ybUNvbnRyb2xzKS5sZW5ndGggPT0gMDtcbn1cblxuLyoqXG4gKiBSdW5zICd0b01vZGVsJyB2YWxpZGF0b3JzIGRlZmluZWQgaW4gc2NoZW1hIG9uIHRoZSBjdXJyZW50IG1vZGVsIG9mIHRoZSBmb3JtXG4gKiBjYW4gYmUgdXNlZCB0byBtYXJrIGFzIGludmFpZCBhbGwgcmVxdWlyZWQgZmllbGRzIG9yIHRvIGV4cGxpY2l0ZWx5IHZhbGlkYXRlXG4gKiBmb3JtIHdoZW4gaXQgaXMgc2F2ZWQuIFJldHVybnMgdmFsaWRhdGlvbiBzdGF0ZSBvZiB0aGUgZm9ybSB2aWEgY2FsbGJhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBNTEZvcm0kdmFsaWRhdGVNb2RlbChjYWxsYmFjaykge1xuICAgIHZhciB2YWxpZGF0aW9ucyA9IFtdLFxuICAgICAgICBzZWxmID0gdGhpcztcblxuICAgIF8uZWFjaEtleSh0aGlzLl9kYXRhVmFsaWRhdGlvbnMuZnJvbU1vZGVsLCBmdW5jdGlvbiAodmFsaWRhdG9ycywgbW9kZWxQYXRoKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5tb2RlbC5tKG1vZGVsUGF0aCkuZ2V0KCk7XG4gICAgICAgIHZhbGlkYXRvcnMgPSBBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpID8gdmFsaWRhdG9ycyA6IFt2YWxpZGF0b3JzXTtcblxuICAgICAgICBpZiAodmFsaWRhdG9ycyAmJiB2YWxpZGF0b3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsaWRhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgbW9kZWxQYXRoOiBtb2RlbFBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuXG4gICAgdmFyIGFsbFZhbGlkID0gdHJ1ZTtcbiAgICBhc3luYy5lYWNoKHZhbGlkYXRpb25zLCBmdW5jdGlvbiAodmFsaWRhdGlvbiwgbmV4dFZhbGlkYXRpb24pIHtcbiAgICAgICAgdmFyIGxhc3RSZXNwb25zZTtcbiAgICAgICAgYXN5bmMuZXZlcnkodmFsaWRhdGlvbi52YWxpZGF0b3JzLFxuICAgICAgICAvLyBjYWxsIHZhbGlkYXRvclxuICAgICAgICBmdW5jdGlvbiAodmFsaWRhdG9yLCBuZXh0KSB7XG4gICAgICAgICAgICB2YWxpZGF0b3IodmFsaWRhdGlvbi5kYXRhLCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZSA9IHJlc3BvbnNlIHx8IHt9O1xuICAgICAgICAgICAgICAgIG5leHQobGFzdFJlc3BvbnNlLnZhbGlkIHx8IGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gcG9zdCB2YWxpZGF0aW9uIHJlc3VsdCBvZiBpdGVtIHRvIGZvcm1cbiAgICAgICAgZnVuY3Rpb24gKHZhbGlkKSB7XG4gICAgICAgICAgICBsYXN0UmVzcG9uc2UucGF0aCA9IHZhbGlkYXRpb24ubW9kZWxQYXRoO1xuICAgICAgICAgICAgbGFzdFJlc3BvbnNlLnZhbGlkID0gdmFsaWQ7XG4gICAgICAgICAgICBzZWxmLm1vZGVsLnBvc3RNZXNzYWdlKCd2YWxpZGF0ZWQnLCBsYXN0UmVzcG9uc2UpO1xuICAgICAgICAgICAgaWYgKCF2YWxpZCkgYWxsVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIG5leHRWYWxpZGF0aW9uKG51bGwpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIHBvc3QgZm9ybSB2YWxpZGF0aW9uIHJlc3VsdFxuICAgIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSgndmFsaWRhdGlvbmNvbXBsZXRlZCcsIHsgdmFsaWQ6IGFsbFZhbGlkIH0pO1xuICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhhbGxWYWxpZCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBtYXAgb2YgaW52YWxpZCBjb250cm9scyBhbmQgcmVhc29ucyAodmlldyBwYXRocyBhcmUga2V5cylcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRJbnZhbGlkQ29udHJvbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludmFsaWRGb3JtQ29udHJvbHM7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3RzIHdpdGggYWxsIHJlYXNvbnMgZm9yIHRoZSBmb3JtIGJlaW5nIGludmFsaWRcbiAqXG4gKiBAcmV0dXJuIHtBcnJheVtPYmplY3RdfVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnMoKSB7XG4gICAgdmFyIGludmFsaWRDb250cm9scyA9IHRoaXMuZ2V0SW52YWxpZENvbnRyb2xzKCk7XG4gICAgdmFyIHJlYXNvbnMgPSBfLnJlZHVjZUtleXMoaW52YWxpZENvbnRyb2xzLCBmdW5jdGlvbiAobWVtbywgaW52YWxpZENvbnRyb2wsIGNvbXBOYW1lKSB7XG4gICAgICAgIG1lbW8ucHVzaChpbnZhbGlkQ29udHJvbC5yZWFzb24pO1xuICAgICAgICByZXR1cm4gbWVtbztcbiAgICB9LCBbXSwgdGhpcyk7XG4gICAgcmV0dXJuIHJlYXNvbnM7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIG11bHRpbGluZSBzdHJpbmcgd2l0aCBhbGwgcmVhc29ucyBmb3IgdGhlIGZvcm0gYmVpbmcgaW52YWxpZFxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldEludmFsaWRSZWFzb25zVGV4dCgpIHtcbiAgICB2YXIgcmVhc29ucyA9IHRoaXMuZ2V0SW52YWxpZFJlYXNvbnMoKTtcbiAgICByZXR1cm4gcmVhc29ucy5yZWR1Y2UoZnVuY3Rpb24gKG1lbW8sIHJlYXNvbikge1xuICAgICAgICByZXR1cm4gbWVtbyArIChyZWFzb24ubGFiZWwgfHwgJycpICsgJyAtICcgKyByZWFzb24ucmVhc29uICsgJ1xcbic7XG4gICAgfSwgJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgY29tcG9uZW50IGZvciBhIGdpdmVuIG1vZGVsUGF0aFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtb2RlbFBhdGhcbiAqIEByZXR1cm4ge0NvbXBvbmVudH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJG1vZGVsUGF0aENvbXBvbmVudChtb2RlbFBhdGgpIHtcbiAgICB2YXIgbW9kZWxQYXRoT2JqID0gdGhpcy5fZm9ybU1vZGVsUGF0aHNbbW9kZWxQYXRoXTtcbiAgICByZXR1cm4gbW9kZWxQYXRoT2JqICYmIG1vZGVsUGF0aE9iai5jb21wb25lbnQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBmb3JtIHNjaGVtYSBmb3IgYSBnaXZlbiBtb2RlbFBhdGhcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbW9kZWxQYXRoXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRtb2RlbFBhdGhTY2hlbWEobW9kZWxQYXRoKSB7XG4gICAgdmFyIG1vZGVsUGF0aE9iaiA9IHRoaXMuX2Zvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF07XG4gICAgcmV0dXJuIG1vZGVsUGF0aE9iaiAmJiBtb2RlbFBhdGhPYmouc2NoZW1hO1xufVxuXG4vKipcbiAqIFJldHVybnMgY29tcG9uZW50IGZvciBhIGdpdmVuIHZpZXcgcGF0aCAocGF0aCBhcyBkZWZpbmVkIGluIERhdGEgZmFjZXQpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZpZXdQYXRoXG4gKiBAcmV0dXJuIHtDb21wb25lbnR9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSR2aWV3UGF0aENvbXBvbmVudCh2aWV3UGF0aCkge1xuICAgIHZhciB2aWV3UGF0aE9iaiA9IHRoaXMuX2Zvcm1WaWV3UGF0aHNbdmlld1BhdGhdO1xuICAgIHJldHVybiB2aWV3UGF0aE9iaiAmJiB2aWV3UGF0aE9iai5jb21wb25lbnQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBmb3JtIHNjaGVtYSBmb3IgYSBnaXZlbiB2aWV3IHBhdGggaXRlbSAocGF0aCBhcyBkZWZpbmVkIGluIERhdGEgZmFjZXQpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZpZXdQYXRoXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSR2aWV3UGF0aFNjaGVtYSh2aWV3UGF0aCkge1xuICAgIHZhciB2aWV3UGF0aE9iaiA9IHRoaXMuX2Zvcm1WaWV3UGF0aHNbdmlld1BhdGhdO1xuICAgIHJldHVybiB2aWV3UGF0aE9iaiAmJiB2aWV3UGF0aE9iai5zY2hlbWE7XG59XG5cbi8qKlxuICogQ29udmVydHMgdmlldyBwYXRoIG9mIHRoZSBjb21wb25lbnQgaW4gdGhlIGZvcm0gdG8gdGhlIG1vZGVsIHBhdGggb2YgdGhlIGNvbm5lY3RlZCBkYXRhXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZpZXdQYXRoIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50XG4gKiBAcmV0dXJuIHtzdHJpbmd9IG1vZGVsIHBhdGggb2YgY29ubmVjdGVkIGRhdGFcbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldE1vZGVsUGF0aCh2aWV3UGF0aCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbFBhdGhUcmFuc2xhdGlvbnNbdmlld1BhdGhdO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIG1vZGVsIHBhdGggb2YgdGhlIGNvbm5lY3RlZCBkYXRhIHRvIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50IGluIHRoZSBmb3JtXG4gKiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbFBhdGggbW9kZWwgcGF0aCBvZiBjb25uZWN0ZWQgZGF0YVxuICogQHJldHVybiB7c3RyaW5nfSB2aWV3IHBhdGggb2YgdGhlIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0Vmlld1BhdGgobW9kZWxQYXRoKSB7XG4gICAgcmV0dXJuIF8uZmluZEtleSh0aGlzLl9tb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGZ1bmN0aW9uIChtUGF0aCwgdlBhdGgpIHtcbiAgICAgICAgcmV0dXJuIG1QYXRoID09IG1vZGVsUGF0aDtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gTUxGb3JtJGRlc3Ryb3koKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLl9jb25uZWN0b3JzICYmIHRoaXMuX2Nvbm5lY3RvcnMuZm9yRWFjaChtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3JzID0gbnVsbDtcbn1cblxuLyoqXG4gKiBTZWUgaXRlbV90eXBlcy5qcyBmb3IgaXRlbSBjbGFzc2VzIGFuZCB0ZW1wbGF0ZXNcbiAqIE1hcCBvZiBpdGVtcyB0eXBlcyB0byBpdGVtcyBjb21wb25lbnRzIGNsYXNzZXNcbiAqIFVJIGNvbXBvbmVudHMgYXJlIGRlZmluZWQgaW4gYG1pbG9gXG4gKi9cblxuLy8gdmFyIF9pdGVtc1NjaGVtYVJ1bGVzID0gXy5tYXBLZXlzKGl0ZW1UeXBlcywgZnVuY3Rpb24oY2xhc3NOYW1lLCBpdGVtVHlwZSkge1xuLy8gICAgIHJldHVybiB7XG4vLyAgICAgICAgIC8vIENvbXBDbGFzczogY29tcG9uZW50c1JlZ2lzdHJ5LmdldChjbGFzc05hbWUpLFxuLy8gICAgICAgICBmdW5jOiBpdGVtc0Z1bmN0aW9uc1tpdGVtVHlwZV0gfHwgZG9Ob3RoaW5nLFxuLy8gICAgICAgICBtb2RlbFBhdGhSdWxlOiBtb2RlbFBhdGhSdWxlc1tpdGVtVHlwZV0gfHwgJ3JlcXVpcmVkJ1xuLy8gICAgIH07XG4vLyB9KTtcbi8vIGZ1bmN0aW9uIGRvTm90aGluZygpIHt9XG5cblxuLyoqXG4gKiBQcm9jZXNzZXMgZm9ybSBzY2hlbWEgdG8gc3Vic2NyaWJlIGZvciBtZXNzYWdlcyBhcyBkZWZpbmVkIGluIHNjaGVtYS4gUGVyZm9ybXMgc3BlY2lhbCBwcm9jZXNzaW5nIGZvciBzb21lIHR5cGVzIG9mIGl0ZW1zLlxuICogUmV0dXJucyB0cmFuc2xhdGlvbiBydWxlcyBmb3IgQ29ubmVjdG9yIG9iamVjdC5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHJlY3Vyc2l2ZWx5IGZvciBncm91cHMgKGFuZCBzdWJncm91cHMpXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wIGZvcm0gb3IgZ3JvdXAgY29tcG9uZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIGZvcm0gb3IgZ3JvdXAgc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1NjaGVtYShjb21wLCBzY2hlbWEsIHZpZXdQYXRoLCBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnMpIHtcbiAgICB2aWV3UGF0aCA9IHZpZXdQYXRoIHx8ICcnO1xuICAgIGZvcm1WaWV3UGF0aHMgPSBmb3JtVmlld1BhdGhzIHx8IHt9O1xuICAgIGZvcm1Nb2RlbFBhdGhzID0gZm9ybU1vZGVsUGF0aHMgfHwge307XG4gICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zID0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMgPSBkYXRhVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMuZnJvbU1vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy5mcm9tTW9kZWwgfHwge307XG4gICAgZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsIHx8IHt9O1xuXG4gICAgZGF0YVZhbGlkYXRpb25zID0gZGF0YVZhbGlkYXRpb25zIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwgPSBkYXRhVmFsaWRhdGlvbnMuZnJvbU1vZGVsIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy50b01vZGVsID0gZGF0YVZhbGlkYXRpb25zLnRvTW9kZWwgfHwge307XG5cbiAgICBpZiAoc2NoZW1hLml0ZW1zKSBfcHJvY2Vzc1NjaGVtYUl0ZW1zLmNhbGwodGhpcywgY29tcCwgc2NoZW1hLml0ZW1zLCB2aWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKTtcblxuICAgIGlmIChzY2hlbWEubWVzc2FnZXMpIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMuY2FsbCh0aGlzLCBjb21wLCBzY2hlbWEubWVzc2FnZXMpO1xuXG4gICAgdmFyIGl0ZW1SdWxlID0gc2NoZW1hLnR5cGUgJiYgZm9ybVJlZ2lzdHJ5LmdldChzY2hlbWEudHlwZSk7XG4gICAgdmFyIGhvc3RPYmplY3QgPSB0aGlzLmdldEhvc3RPYmplY3QoKTtcblxuICAgIGlmICh2aWV3UGF0aCkge1xuICAgICAgICBmb3JtVmlld1BhdGhzW3ZpZXdQYXRoXSA9IHtcbiAgICAgICAgICAgIHNjaGVtYTogc2NoZW1hLFxuICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGl0ZW1SdWxlKSB7XG4gICAgICAgICAgICAvL2NoZWNrKGNvbXAuY29uc3RydWN0b3IsIGl0ZW1UeXBlc1tzY2hlbWEudHlwZV0uQ29tcENsYXNzKTtcbiAgICAgICAgICAgIGl0ZW1SdWxlLml0ZW1GdW5jdGlvbiAmJiBpdGVtUnVsZS5pdGVtRnVuY3Rpb24uY2FsbChob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICAgICAgX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zLmNhbGwodGhpcywgdmlld1BhdGgsIHNjaGVtYSk7XG4gICAgICAgIH0gZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gaXRlbSB0eXBlICcgKyBzY2hlbWEudHlwZSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5d29yZCBpbiBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5KSB7XG4gICAgICAgIGlmIChzY2hlbWEuaGFzT3duUHJvcGVydHkoa2V5d29yZCkpIHtcbiAgICAgICAgICAgIHZhciBwcm9jZXNzS2V5d29yZEZ1bmMgPSBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5W2tleXdvcmRdO1xuICAgICAgICAgICAgcHJvY2Vzc0tleXdvcmRGdW5jKGhvc3RPYmplY3QsIGNvbXAsIHNjaGVtYSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZWxQYXRoVHJhbnNsYXRpb25zO1xuXG4gICAgZnVuY3Rpb24gX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zKHZpZXdQYXRoLCBzY2hlbWEpIHtcbiAgICAgICAgdmFyIG1vZGVsUGF0aCA9IHNjaGVtYS5tb2RlbFBhdGgsXG4gICAgICAgICAgICBtb2RlbFBhdHRlcm4gPSBzY2hlbWEubW9kZWxQYXR0ZXJuIHx8ICcnLFxuICAgICAgICAgICAgbm90SW5Nb2RlbCA9IHNjaGVtYS5ub3RJbk1vZGVsLFxuICAgICAgICAgICAgdHJhbnNsYXRlID0gc2NoZW1hLnRyYW5zbGF0ZSxcbiAgICAgICAgICAgIHZhbGlkYXRlID0gc2NoZW1hLnZhbGlkYXRlO1xuXG4gICAgICAgIGlmICh2aWV3UGF0aCkge1xuICAgICAgICAgICAgX2FkZERhdGFUcmFuc2xhdGlvbi5jYWxsKHRoaXMsIHRyYW5zbGF0ZSwgJ3RvTW9kZWwnLCB2aWV3UGF0aCk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoaXRlbVJ1bGUubW9kZWxQYXRoUnVsZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3Byb2hpYml0ZWQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAobW9kZWxQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ21vZGVsUGF0aCBpcyBwcm9oaWJpdGVkIGZvciBpdGVtIHR5cGUgJyArIHNjaGVtYS50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmVxdWlyZWQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIShtb2RlbFBhdGggfHwgbm90SW5Nb2RlbCkpIHRocm93IG5ldyBFcnJvcignbW9kZWxQYXRoIGlzIHJlcXVpcmVkIGZvciBpdGVtIHR5cGUgJyArIHNjaGVtYS50eXBlICsgJyAuIEFkZCBcIm5vdEluTW9kZWw6IHRydWVcIiB0byBvdmVycmlkZScpO1xuICAgICAgICAgICAgICAgIC8vIGZhbGxpbmcgdGhyb3VnaCB0byAnb3B0aW9uYWwnXG4gICAgICAgICAgICAgICAgY2FzZSAnb3B0aW9uYWwnOlxuICAgICAgICAgICAgICAgICAgICBpZiAobW9kZWxQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtTW9kZWxQYXRoc1ttb2RlbFBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjaGVtYTogc2NoZW1hLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub3RJbk1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIG1vZGVsUGF0dGVybik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFUcmFuc2xhdGlvbi5jYWxsKHRoaXMsIHRyYW5zbGF0ZSwgJ2Zyb21Nb2RlbCcsIG1vZGVsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFWYWxpZGF0aW9uLmNhbGwodGhpcywgdmFsaWRhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hZGREYXRhVmFsaWRhdGlvbi5jYWxsKHRoaXMsIHZhbGlkYXRlLCAnZnJvbU1vZGVsJywgbW9kZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gbW9kZWxQYXRoIHJ1bGUgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIHBhdGhQYXR0ZXJuKSB7XG4gICAgICAgIGlmICh2aWV3UGF0aCBpbiBtb2RlbFBhdGhUcmFuc2xhdGlvbnMpIHRocm93IG5ldyBFcnJvcignZHVwbGljYXRlIHZpZXcgcGF0aCAnICsgdmlld1BhdGgpO2Vsc2UgaWYgKF8ua2V5T2YobW9kZWxQYXRoVHJhbnNsYXRpb25zLCBtb2RlbFBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBtb2RlbCBwYXRoICcgKyBtb2RlbFBhdGggKyAnIGZvciB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtlbHNlIG1vZGVsUGF0aFRyYW5zbGF0aW9uc1t2aWV3UGF0aCArIHBhdGhQYXR0ZXJuXSA9IG1vZGVsUGF0aCArIHBhdGhQYXR0ZXJuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hZGREYXRhVHJhbnNsYXRpb24odHJhbnNsYXRlLCBkaXJlY3Rpb24sIHBhdGgpIHtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZUZ1bmMgPSB0cmFuc2xhdGUgJiYgdHJhbnNsYXRlW2RpcmVjdGlvbl07XG4gICAgICAgIGlmICghdHJhbnNsYXRlRnVuYykgcmV0dXJuO1xuICAgICAgICBpZiAodHlwZW9mIHRyYW5zbGF0ZUZ1bmMgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgaWYgKHRyYW5zbGF0ZS5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBnZXRGdW5jdGlvbkNvbnRleHQuY2FsbCh0aGlzLCB0cmFuc2xhdGUuY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVGdW5jID0gdHJhbnNsYXRlRnVuYy5iaW5kKGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YVRyYW5zbGF0aW9uc1tkaXJlY3Rpb25dW3BhdGhdID0gdHJhbnNsYXRlRnVuYztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihkaXJlY3Rpb24gKyAnIHRyYW5zbGF0b3IgZm9yICcgKyBwYXRoICsgJyBzaG91bGQgYmUgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hZGREYXRhVmFsaWRhdGlvbih2YWxpZGF0ZSwgZGlyZWN0aW9uLCBwYXRoKSB7XG4gICAgICAgIHZhciB2YWxpZGF0b3JzID0gdmFsaWRhdGUgJiYgdmFsaWRhdGVbZGlyZWN0aW9uXTtcbiAgICAgICAgaWYgKCF2YWxpZGF0b3JzKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGZvcm0gPSB0aGlzO1xuICAgICAgICB2YXIgZm9ybVZhbGlkYXRvcnMgPSBkYXRhVmFsaWRhdGlvbnNbZGlyZWN0aW9uXVtwYXRoXSA9IFtdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpKSB2YWxpZGF0b3JzLmZvckVhY2goX2FkZFZhbGlkYXRvckZ1bmMpO2Vsc2UgX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9ycyk7XG5cbiAgICAgICAgZnVuY3Rpb24gX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9yKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnc3RyaW5nJykgdmFyIHZhbEZ1bmMgPSBnZXRWYWxpZGF0b3JGdW5jdGlvbih2YWxpZGF0b3IpO2Vsc2UgaWYgKHZhbGlkYXRvciBpbnN0YW5jZW9mIFJlZ0V4cCkgdmFsRnVuYyA9IG1ha2VSZWdleFZhbGlkYXRvcih2YWxpZGF0b3IpO2Vsc2UgaWYgKHR5cGVvZiB2YWxpZGF0b3IgPT0gJ2Z1bmN0aW9uJykgdmFsRnVuYyA9IHZhbGlkYXRvcjtlbHNlIHRocm93IG5ldyBFcnJvcihkaXJlY3Rpb24gKyAnIHZhbGlkYXRvciBmb3IgJyArIHBhdGggKyAnIHNob3VsZCBiZSBmdW5jdGlvbiBvciBzdHJpbmcnKTtcblxuICAgICAgICAgICAgaWYgKHZhbGlkYXRlLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IGdldEZ1bmN0aW9uQ29udGV4dC5jYWxsKGZvcm0sIHZhbGlkYXRlLmNvbnRleHQpO1xuXG4gICAgICAgICAgICAgICAgdmFsRnVuYyA9IHZhbEZ1bmMuYmluZChjb250ZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9ybVZhbGlkYXRvcnMucHVzaCh2YWxGdW5jKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0VmFsaWRhdG9yRnVuY3Rpb24odmFsaWRhdG9yTmFtZSkge1xuICAgIHZhciB2YWxGdW5jID0gdmFsaWRhdGlvbkZ1bmN0aW9uc1t2YWxpZGF0b3JOYW1lXTtcbiAgICBpZiAoIXZhbEZ1bmMpIHRocm93IG5ldyBFcnJvcignRm9ybTogdW5rbm93biB2YWxpZGF0b3IgZnVuY3Rpb24gbmFtZSAnICsgdmFsaWRhdG9yTmFtZSk7XG4gICAgcmV0dXJuIHZhbEZ1bmM7XG59XG5cbmZ1bmN0aW9uIG1ha2VSZWdleFZhbGlkYXRvcih2YWxpZGF0b3JSZWdFeHApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciB2YWxpZCA9IHZhbGlkYXRvclJlZ0V4cC50ZXN0KGRhdGEpLFxuICAgICAgICAgICAgcmVzcG9uc2UgPSBNTEZvcm0kJHZhbGlkYXRvclJlc3BvbnNlKHZhbGlkLCAnc2hvdWxkIG1hdGNoIHBhdHRlcm4nKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xuICAgIH07XG59XG5cbi8qKlxuICogUHJvY2Vzc2VzIGl0ZW1zIG9mIHRoZSBmb3JtIChvciBncm91cCkuXG4gKiBDb21wb25lbnQgdGhhdCBoYXMgaXRlbXMgc2hvdWxkIGhhdmUgQ29udGFpbmVyIGZhY2V0LlxuICogUmV0dXJucyB0cmFuc2xhdGlvbiBydWxlcyBmb3IgQ29ubmVjdG9yLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcCBmb3JtIG9yIGdyb3VwIGNvbXBvbmVudFxuICogQHBhcmFtIHtBcnJheX0gaXRlbXMgbGlzdCBvZiBpdGVtcyBpbiBzY2hlbWFcbiAqIEBwYXJhbSB7U3RyaW5nfSB2aWV3UGF0aCBjdXJyZW50IHZpZXcgcGF0aCwgdXNlZCB0byBnZW5lcmF0ZSBDb25uZWN0b3IgdHJhbnNsYXRpb24gcnVsZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBmb3JtVmlld1BhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybU1vZGVsUGF0aHMgdmlldyBwYXRocyBhY2N1bXVsYXRlZCBzbyBmYXIgKGhhdmUgY29tcG9uZW50IGFuZCBzY2hlbWEgcHJvcGVydGllcylcbiAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFBhdGhUcmFuc2xhdGlvbnMgbW9kZWwgcGF0aCB0cmFuc2xhdGlvbiBydWxlcyBhY2N1bXVsYXRlZCBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVHJhbnNsYXRpb25zIGRhdGEgdHJhbnNsYXRpb24gZnVuY3Rpb25zIHNvIGZhclxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWYWxpZGF0aW9ucyBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zIHNvIGZhclxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBfcHJvY2Vzc1NjaGVtYUl0ZW1zKGNvbXAsIGl0ZW1zLCB2aWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKSB7XG4gICAgaWYgKCFjb21wLmNvbnRhaW5lcikgcmV0dXJuIGxvZ2dlci53YXJuKCdGb3JtIFdhcm5pbmc6IHNjaGVtYSBoYXMgaXRlbXMgYnV0IGNvbXBvbmVudCBoYXMgbm8gY29udGFpbmVyIGZhY2V0Jyk7XG5cbiAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbS5jb21wTmFtZSkgcmV0dXJuOyAvLyBObyBjb21wb25lbnQsIG9ubHkgbWFya3VwXG5cbiAgICAgICAgdmFyIGl0ZW1Db21wID0gY29tcC5jb250YWluZXIuc2NvcGVbaXRlbS5jb21wTmFtZV0sXG4gICAgICAgICAgICBjb21wVmlld1BhdGggPSB2aWV3UGF0aCArICcuJyArIGl0ZW0uY29tcE5hbWU7XG4gICAgICAgIGlmICghaXRlbUNvbXApIHRocm93IG5ldyBFcnJvcignY29tcG9uZW50IFwiJyArIGl0ZW0uY29tcE5hbWUgKyAnXCIgaXMgbm90IGluIHNjb3BlIChvciBzdWJzY29wZSkgb2YgZm9ybScpO1xuICAgICAgICBwcm9jZXNzU2NoZW1hLmNhbGwodGhpcywgaXRlbUNvbXAsIGl0ZW0sIGNvbXBWaWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKTtcbiAgICB9LCB0aGlzKTtcbn1cblxuLyoqXG4gKiBTdWJzY3JpYmVzIHRvIG1lc3NhZ2VzIG9uIGZhY2V0cyBvZiBpdGVtcycgY29tcG9uZW50IGFzIGRlZmluZWQgaW4gc2NoZW1hXG4gKi9cbmZ1bmN0aW9uIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMoY29tcCwgbWVzc2FnZXMpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG4gICAgXy5lYWNoS2V5KG1lc3NhZ2VzLCBmdW5jdGlvbiAoZmFjZXRNZXNzYWdlcywgZmFjZXROYW1lKSB7XG4gICAgICAgIHZhciBmYWNldCA9IGNvbXBbZmFjZXROYW1lXTtcbiAgICAgICAgaWYgKCFmYWNldCkgdGhyb3cgbmV3IEVycm9yKCdzY2hlbWEgaGFzIHN1YnNjcmlwdGlvbnMgZm9yIGZhY2V0IFwiJyArIGZhY2V0TmFtZSArICdcIiBvZiBmb3JtIGNvbXBvbmVudCBcIicgKyBjb21wLm5hbWUgKyAnXCIsIGJ1dCBjb21wb25lbnQgaGFzIG5vIGZhY2V0Jyk7XG4gICAgICAgIGZhY2V0TWVzc2FnZXMgPSBfLmNsb25lKGZhY2V0TWVzc2FnZXMpO1xuICAgICAgICBfLmVhY2hLZXkoZmFjZXRNZXNzYWdlcywgZnVuY3Rpb24gKHN1YnNjcmliZXIsIG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHR5cGVvZiBzdWJzY3JpYmVyID09ICdvYmplY3QnID8gc3Vic2NyaWJlci5jb250ZXh0IDogbnVsbDtcblxuICAgICAgICAgICAgLy8gQXZvaWQgY2hhbmdpbmcgZXZlbnQgc3Vic2NyaXB0aW9ucyB3aG9zZSBjb250ZXh0IGlzICdmYWNldCcgb3IgJ293bmVyJy5cbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT0gJ2ZhY2V0JyAmJiBjb250ZXh0ICE9ICdvd25lcicpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBmYWNldE1lc3NhZ2VzW21lc3NhZ2VUeXBlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcjogc3Vic2NyaWJlci5zdWJzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZhY2V0Lm9uQ29uZmlnTWVzc2FnZXMoZmFjZXRNZXNzYWdlcyk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgb2JqZWN0IHRvIGJpbmQgYSBmdW5jdGlvbiB0byBhcyBkZWZpbmVkIGJ5IGEgc2VjdGlvbiBvZiB0aGUgZm9ybSBzY2hlbWEuXG4gKlxuICogQ3VycmVudGx5IHN1cHBvcnRlZCBpbnB1dHMgYXJlOlxuICogIC0ge09iamVjdH0gLSBBbnkgb2JqZWN0XG4gKiAgLSB7U3RyaW5nfSAnZm9ybScgLSBUaGUgZm9ybVxuICogIC0ge1N0cmluZ30gJ2hvc3QnIC0gVGhlIGZvcm0ncyBob3N0IG9iamVjdFxuICovXG5mdW5jdGlvbiBnZXRGdW5jdGlvbkNvbnRleHQoY29udGV4dCkge1xuICAgIGlmIChjb250ZXh0ID09ICdmb3JtJykgY29udGV4dCA9IHRoaXM7ZWxzZSBpZiAoY29udGV4dCA9PSAnaG9zdCcpIGNvbnRleHQgPSB0aGlzLmdldEhvc3RPYmplY3QoKTtcblxuICAgIGlmIChjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ICE9ICdvYmplY3QnKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29udGV4dCBzdXBwbGllZCAtIEV4cGVjdGVkIHtTdHJpbmd9IFtob3N0LGZvcm1dLCBvciB7T2JqZWN0fScpO1xuXG4gICAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbi8qKlxuICogVmFsaWRhdGlvbiBmdW5jdGlvbnNcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVSZXF1aXJlZChkYXRhLCBjYWxsYmFjaykge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiBkYXRhICE9ICd1bmRlZmluZWQnICYmICh0eXBlb2YgZGF0YSAhPSAnc3RyaW5nJyB8fCBkYXRhLnRyaW0oKSAhPSAnJyk7XG4gICAgdmFyIHJlc3BvbnNlID0gTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSh2YWxpZCwgJ3BsZWFzZSBlbnRlciBhIHZhbHVlJywgJ1JFUVVJUkVEJyk7XG4gICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xufVxuXG5mdW5jdGlvbiBNTEZvcm0kJHZhbGlkYXRvclJlc3BvbnNlKHZhbGlkLCByZWFzb24sIHJlYXNvbkNvZGUpIHtcbiAgICByZXR1cm4gdmFsaWQgPyB7IHZhbGlkOiB0cnVlIH0gOiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiByZWFzb24sIHJlYXNvbkNvZGU6IHJlYXNvbkNvZGUgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb1QgPSBtaWxvLnV0aWwuZG9ULFxuICAgIGZzID0gcmVxdWlyZSgnZnMnKSxcbiAgICBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHMsXG4gICAgbWlsb0NvdW50ID0gbWlsby51dGlsLmNvdW50LFxuICAgIGNvbXBvbmVudE5hbWUgPSBtaWxvLnV0aWwuY29tcG9uZW50TmFtZSxcbiAgICBmb3JtUmVnaXN0cnkgPSByZXF1aXJlKCcuL3JlZ2lzdHJ5Jyk7XG5cbnJlcXVpcmUoJy4vaXRlbV90eXBlcycpO1xuXG52YXIgY2FjaGVkSXRlbXMgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JtR2VuZXJhdG9yO1xuXG52YXIgcGFydGlhbHMgPSB7XG4gICAgbGFiZWw6IFwie3s/IGl0Lml0ZW0ubGFiZWwgfX1cXG4gICAgPGxhYmVsPnt7PSBpdC5pdGVtLmxhYmVsfX08L2xhYmVsPlxcbnt7P319XFxuXCIsXG4gICAgZm9ybUdyb3VwOiBcIjxkaXZcXG4gICAge3s/IGl0Lml0ZW0uYWx0VGV4dCB9fXRpdGxlPVxcXCJ7ez0gaXQuaXRlbS5hbHRUZXh0fX1cXFwiIHt7P319XFxuICAgIGNsYXNzPVxcXCJmb3JtLWdyb3Vwe3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0ge3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19e3s/fX1cXFwiXFxuPlxcblwiXG59O1xuXG52YXIgZG90RGVmID0ge1xuICAgIHBhcnRpYWxzOiBwYXJ0aWFsc1xufTtcblxuLypcbiAqIEdlbmVyYXRlcyBmb3JtIEhUTUwgYmFzZWQgb24gdGhlIHNjaGVtYS5cbiAqIEl0IGRvZXMgbm90IGNyZWF0ZSBjb21wb25lbnRzIGZvciB0aGUgZm9ybSBET00sIG1pbG8uYmluZGVyIHNob3VsZCBiZSBjYWxsZWQgc2VwYXJhdGVseSBvbiB0aGUgZm9ybSdzIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gc2NoZW1hIGFycmF5IG9mIGZvcm0gZWxlbWVudHMgZGVzY3JpcHRvcnNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybUdlbmVyYXRvcihzY2hlbWEpIHtcbiAgICAvL2dldEl0ZW1zQ2xhc3NlcygpO1xuXG4gICAgdmFyIHJlbmRlcmVkSXRlbXMgPSBzY2hlbWEuaXRlbXMubWFwKHJlbmRlckl0ZW0pO1xuICAgIHJldHVybiByZW5kZXJlZEl0ZW1zLmpvaW4oJycpO1xuXG4gICAgZnVuY3Rpb24gcmVuZGVySXRlbShpdGVtKSB7XG4gICAgICAgIHZhciBpdGVtVHlwZSA9IGNhY2hlZEl0ZW1zW2l0ZW0udHlwZV07XG5cbiAgICAgICAgaWYgKCFpdGVtVHlwZSkge1xuICAgICAgICAgICAgdmFyIG5ld0l0ZW1UeXBlID0gZm9ybVJlZ2lzdHJ5LmdldChpdGVtLnR5cGUpO1xuICAgICAgICAgICAgaXRlbVR5cGUgPSBjYWNoZWRJdGVtc1tpdGVtLnR5cGVdID0ge1xuICAgICAgICAgICAgICAgIENvbXBDbGFzczogbmV3SXRlbVR5cGUuY29tcENsYXNzICYmIGNvbXBvbmVudHNSZWdpc3RyeS5nZXQobmV3SXRlbVR5cGUuY29tcENsYXNzKSxcbiAgICAgICAgICAgICAgICBjb21wQ2xhc3M6IG5ld0l0ZW1UeXBlLmNvbXBDbGFzcyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogZG9ULmNvbXBpbGUobmV3SXRlbVR5cGUudGVtcGxhdGUsIGRvdERlZilcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtLmNvbXBOYW1lID0gaXRlbVR5cGUuQ29tcENsYXNzID8gaXRlbS5jb21wTmFtZSB8fCBjb21wb25lbnROYW1lKCkgOiBudWxsO1xuXG4gICAgICAgIHZhciBkb21GYWNldENvbmZpZyA9IGl0ZW1UeXBlLkNvbXBDbGFzcyAmJiBpdGVtVHlwZS5Db21wQ2xhc3MuZ2V0RmFjZXRDb25maWcoJ2RvbScpLFxuICAgICAgICAgICAgdGFnTmFtZSA9IGRvbUZhY2V0Q29uZmlnICYmIGRvbUZhY2V0Q29uZmlnLnRhZ05hbWUgfHwgJ2Rpdic7XG5cbiAgICAgICAgdmFyIHRlbXBsYXRlID0gaXRlbVR5cGUudGVtcGxhdGU7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgY29tcE5hbWU6IGl0ZW0uY29tcE5hbWUsXG4gICAgICAgICAgICBjb21wQ2xhc3M6IGl0ZW1UeXBlLmNvbXBDbGFzcyxcbiAgICAgICAgICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgICAgICAgICBmb3JtR2VuZXJhdG9yOiBmb3JtR2VuZXJhdG9yLFxuICAgICAgICAgICAgbWlsb0NvdW50OiBtaWxvQ291bnQsXG4gICAgICAgICAgICBkaXNhYmxlZDogaXRlbS5kaXNhYmxlZCxcbiAgICAgICAgICAgIG11bHRpcGxlOiBpdGVtLm11bHRpcGxlXG4gICAgICAgIH0pO1xuICAgIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyksXG4gICAgZm9ybVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9yZWdpc3RyeScpO1xuXG52YXIgZ3JvdXBfZG90ID0gXCI8ZGl2IG1sLWJpbmQ9XFxcIk1MR3JvdXA6e3s9IGl0LmNvbXBOYW1lIH19XFxcInt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IGNsYXNzPVxcXCJ7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX1cXFwie3s/fX0+XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAge3s9IGl0LmZvcm1HZW5lcmF0b3IoaXQuaXRlbSkgfX1cXG48L2Rpdj5cXG5cIixcbiAgICB3cmFwcGVyX2RvdCA9IFwiPHNwYW4gbWwtYmluZD1cXFwiTUxXcmFwcGVyOnt7PSBpdC5jb21wTmFtZSB9fVxcXCJ7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSBjbGFzcz1cXFwie3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19XFxcInt7P319PlxcbiAgICB7ez0gaXQuZm9ybUdlbmVyYXRvcihpdC5pdGVtKSB9fVxcbjwvc3Bhbj5cXG5cIixcbiAgICBzZWxlY3RfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJjdXN0b20tc2VsZWN0XFxcIj5cXG4gICAgICAgIDxzZWxlY3QgbWwtYmluZD1cXFwiTUxTZWxlY3Q6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAgICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgICAgICAgICB7ez8gaXQubXVsdGlwbGUgfX1tdWx0aXBsZSB7ez99fVxcbiAgICAgICAgICAgICAgICBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj5cXG4gICAgICAgIDwvc2VsZWN0PlxcbiAgICA8L3NwYW4+XFxuPC9kaXY+XFxuXCIsXG4gICAgaW5wdXRfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ7ez0gaXQuaXRlbS5pbnB1dFR5cGUgfHwgJ3RleHQnIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLmlucHV0TmFtZSB9fW5hbWU9XFxcInt7PSBpdC5pdGVtLmlucHV0TmFtZSB9fVxcXCJ7ez99fVxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MSW5wdXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLnBsYWNlaG9sZGVyIH19cGxhY2Vob2xkZXI9XFxcInt7PSBpdC5pdGVtLnBsYWNlaG9sZGVyfX1cXFwie3s/fX1cXG4gICAgICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcbjwvZGl2PlxcblwiLFxuICAgIHRleHRhcmVhX2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAge3sjIGRlZi5wYXJ0aWFscy5sYWJlbCB9fVxcbiAgICA8dGV4dGFyZWEgbWwtYmluZD1cXFwiTUxUZXh0YXJlYTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCJcXG4gICAgICAgIHt7PyBpdC5pdGVtLnBsYWNlaG9sZGVyIH19cGxhY2Vob2xkZXI9XFxcInt7PSBpdC5pdGVtLnBsYWNlaG9sZGVyfX1cXFwie3s/fX1cXG4gICAgICAgIHt7PyBpdC5pdGVtLmF1dG9yZXNpemUgfX1yb3dzPVxcXCJ7ez0gaXQuaXRlbS5hdXRvcmVzaXplLm1pbkxpbmVzIH19XFxcInt7P319PjwvdGV4dGFyZWE+XFxuPC9kaXY+XCIsXG4gICAgYnV0dG9uX2RvdCA9IFwiPGRpdiB7ez8gaXQuaXRlbS5hbHRUZXh0IH19dGl0bGU9XFxcInt7PSBpdC5pdGVtLmFsdFRleHR9fVxcXCIge3s/fX1jbGFzcz1cXFwiYnRuLXRvb2xiYXJ7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX17ez99fVxcXCI+XFxuICAgIDxidXR0b24gbWwtYmluZD1cXFwiTUxCdXR0b246e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX1cXG4gICAgICAgIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQge3s/IGl0Lml0ZW0uaXRlbUNzc0NsYXNzfX0ge3s9IGl0Lml0ZW0uaXRlbUNzc0NsYXNzIH19e3s/fX1cXFwiPlxcbiAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWwgfHwgJycgfX1cXG4gICAgPC9idXR0b24+XFxuPC9kaXY+XFxuXCIsXG4gICAgaHlwZXJsaW5rX2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAgPGEge3s/IGl0Lml0ZW0uaHJlZn19aHJlZj1cXFwie3s9IGl0Lml0ZW0uaHJlZiB9fVxcXCJ7ez99fVxcbiAgICAgICAge3s/IGl0Lml0ZW0udGFyZ2V0fX10YXJnZXQ9XFxcInt7PSBpdC5pdGVtLnRhcmdldCB9fVxcXCJ7ez99fSAgIFxcbiAgICAgICAgbWwtYmluZD1cXFwiTUxIeXBlcmxpbms6e3s9IGl0LmNvbXBOYW1lIH19XFxcIiBcXG4gICAgICAgIGNsYXNzPVxcXCJoeXBlcmxpbmsgaHlwZXJsaW5rLWRlZmF1bHRcXFwiPlxcbiAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWwgfHwgJycgfX1cXG4gICAgPC9hPlxcbjwvZGl2PlwiLFxuICAgIGNoZWNrYm94X2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gIDxpbnB1dCB0eXBlPVxcXCJjaGVja2JveFxcXCJcXG4gICAgaWQ9XFxcInt7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgbWwtYmluZD1cXFwiTUxJbnB1dDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319XFxuICAgIGNsYXNzPVxcXCJ7ez0gaXQuaXRlbS5pdGVtQ3NzQ2xhc3MgfHwgJyd9fVxcXCI+XFxuICA8bGFiZWwgZm9yPVxcXCJ7ez0gaXQuY29tcE5hbWUgfX1cXFwiPnt7PSBpdC5pdGVtLmxhYmVsfX08L2xhYmVsPlxcbjwvZGl2PlxcblwiLFxuICAgIGxpc3RfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDx1bCBtbC1iaW5kPVxcXCJNTExpc3Q6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319PlxcbiAgICAgICAgPGxpIG1sLWJpbmQ9XFxcIk1MTGlzdEl0ZW06aXRlbVNhbXBsZVxcXCIgY2xhc3M9XFxcImxpc3QtaXRlbVxcXCI+XFxuICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cXFwiW2RhdGFdOmxhYmVsXFxcIj48L3NwYW4+XFxuICAgICAgICAgICAge3s/IGl0LmVkaXRCdG4gfX08YnV0dG9uIG1sLWJpbmQ9XFxcIltldmVudHNdOmVkaXRCdG5cXFwiPmVkaXQ8L2J1dHRvbj57ez99fVxcbiAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cXFwiW2V2ZW50c106ZGVsZXRlQnRuXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlXFxcIj4gPC9idXR0b24+XFxuICAgICAgICA8L2xpPlxcbiAgICA8L3VsPlxcbjwvZGl2PlxcblwiLFxuICAgIHRpbWVfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0aW1lXFxcIlxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MVGltZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuPC9kaXY+XCIsXG4gICAgZGF0ZV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiXFxuICAgICAgICAgICAgbWwtYmluZD1cXFwiTUxEYXRlOnt7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgICAgICBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj5cXG48L2Rpdj5cIixcbiAgICBjb21ib19kb3QgPSBcIjxkaXYgbWwtYmluZD1cXFwiTUxDb21ibzp7ez0gaXQuY29tcE5hbWUgfX1cXFwiIGNsYXNzPVxcXCJmb3JtLWdyb3Vwe3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0ge3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19e3s/fX1cXFwiPlxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIHt7IHZhciBsaXN0SUQgPSAnbWwtY29tYm8tZGF0YWxpc3QtJyArIGl0Lm1pbG9Db3VudCgpOyB9fVxcbiAgICA8aW5wdXQgbWwtYmluZD1cXFwiW2RhdGEsIGV2ZW50c106aW5wdXRcXFwiXFxuICAgICAgICAgICAgbmFtZT1cXFwie3s9IGxpc3RJRCB9fVxcXCJcXG4gICAgICAgICAgICBsaXN0PVxcXCJ7ez0gbGlzdElEIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319XFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuICAgIDxkYXRhbGlzdCBpZD1cXFwie3s9IGxpc3RJRCB9fVxcXCIgbWwtYmluZD1cXFwiW3RlbXBsYXRlXTpkYXRhbGlzdFxcXCI+PC9kYXRhbGlzdD5cXG48L2Rpdj5cIixcbiAgICBpbWFnZV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPGltZyB7ez8gaXQuaXRlbS5zcmMgfX1zcmM9XFxcInt7PSBpdC5pdGVtLnNyYyB9fVxcXCJ7ez99fVxcbiAgICAgICAgbWwtYmluZD1cXFwiTUxJbWFnZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuaXRlbS53aWR0aCB9fXdpZHRoPVxcXCJ7ez0gaXQuaXRlbS53aWR0aCB9fVxcXCJ7ez99fVxcbiAgICAgICAge3s/IGl0Lml0ZW0uaGVpZ2h0IH19aGVpZ2h0PVxcXCJ7ez0gaXQuaXRlbS5oZWlnaHQgfX1cXFwie3s/fX0+XFxuPC9kaXY+XFxuXCIsXG4gICAgZHJvcHRhcmdldF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgICAgIDxpbWcge3s/IGl0Lml0ZW0uc3JjIH19c3JjPVxcXCJ7ez0gaXQuaXRlbS5zcmMgfX1cXFwie3s/fX1cXG4gICAgICAgICAgICBtbC1iaW5kPVxcXCJNTERyb3BUYXJnZXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLndpZHRoIH19d2lkdGg9XFxcInt7PSBpdC5pdGVtLndpZHRoIH19XFxcInt7P319XFxuICAgICAgICAgICAge3s/IGl0Lml0ZW0uaGVpZ2h0IH19aGVpZ2h0PVxcXCJ7ez0gaXQuaXRlbS5oZWlnaHQgfX1cXFwie3s/fX0+XFxuPC9kaXY+XFxuXCIsXG4gICAgdGV4dF9kb3QgPSBcInt7dmFyIHRhZ05hbWUgPSBpdC5pdGVtLnRhZ05hbWUgfHwgJ3NwYW4nO319XFxuPHt7PXRhZ05hbWV9fSBtbC1iaW5kPVxcXCJNTFRleHQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcInt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IGNsYXNzPVxcXCJ7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX1cXFwie3s/fX0+XFxuICAgIHt7PyBpdC5pdGVtLmxhYmVsIH19XFxuICAgICAgICB7ez0gaXQuaXRlbS5sYWJlbH19XFxuICAgIHt7P319XFxuPC97ez10YWdOYW1lfX0+XFxuXCIsXG4gICAgY2xlYXJfZG90ID0gJzxkaXYgY2xhc3M9XCJjYy1jbGVhclwiPjwvZGl2Pic7XG5cbmZvcm1SZWdpc3RyeS5hZGQoJ2dyb3VwJywgeyBjb21wQ2xhc3M6ICdNTEdyb3VwJywgdGVtcGxhdGU6IGdyb3VwX2RvdCwgbW9kZWxQYXRoUnVsZTogJ3Byb2hpYml0ZWQnIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnd3JhcHBlcicsIHsgY29tcENsYXNzOiAnTUxXcmFwcGVyJywgdGVtcGxhdGU6IHdyYXBwZXJfZG90LCBtb2RlbFBhdGhSdWxlOiAncHJvaGliaXRlZCcgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdzZWxlY3QnLCB7IGNvbXBDbGFzczogJ01MU2VsZWN0JywgdGVtcGxhdGU6IHNlbGVjdF9kb3QsIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc1NlbGVjdFNjaGVtYSB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2lucHV0JywgeyBjb21wQ2xhc3M6ICdNTElucHV0JywgdGVtcGxhdGU6IGlucHV0X2RvdCwgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzSW5wdXRTY2hlbWEgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdpbnB1dGxpc3QnLCB7IGNvbXBDbGFzczogJ01MSW5wdXRMaXN0JywgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzSW5wdXRMaXN0U2NoZW1hIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgndGV4dGFyZWEnLCB7IGNvbXBDbGFzczogJ01MVGV4dGFyZWEnLCB0ZW1wbGF0ZTogdGV4dGFyZWFfZG90LCBpdGVtRnVuY3Rpb246IHByb2Nlc3NUZXh0YXJlYVNjaGVtYSB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2J1dHRvbicsIHsgY29tcENsYXNzOiAnTUxCdXR0b24nLCB0ZW1wbGF0ZTogYnV0dG9uX2RvdCwgbW9kZWxQYXRoUnVsZTogJ29wdGlvbmFsJyB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3JhZGlvJywgeyBjb21wQ2xhc3M6ICdNTFJhZGlvR3JvdXAnLCBpdGVtRnVuY3Rpb246IHByb2Nlc3NSYWRpb1NjaGVtYSB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NoZWNrZ3JvdXAnLCB7IGNvbXBDbGFzczogJ01MQ2hlY2tHcm91cCcsIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0NoZWNrR3JvdXBTY2hlbWEgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdoeXBlcmxpbmsnLCB7IGNvbXBDbGFzczogJ01MSHlwZXJsaW5rJywgdGVtcGxhdGU6IGh5cGVybGlua19kb3QsIG1vZGVsUGF0aFJ1bGU6ICdvcHRpb25hbCcgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdjaGVja2JveCcsIHsgY29tcENsYXNzOiAnTUxJbnB1dCcsIHRlbXBsYXRlOiBjaGVja2JveF9kb3QgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdsaXN0JywgeyBjb21wQ2xhc3M6ICdNTExpc3QnLCB0ZW1wbGF0ZTogbGlzdF9kb3QgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCd0aW1lJywgeyBjb21wQ2xhc3M6ICdNTFRpbWUnLCB0ZW1wbGF0ZTogdGltZV9kb3QgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdkYXRlJywgeyBjb21wQ2xhc3M6ICdNTERhdGUnLCB0ZW1wbGF0ZTogZGF0ZV9kb3QgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdjb21ibycsIHsgY29tcENsYXNzOiAnTUxDb21ibycsIHRlbXBsYXRlOiBjb21ib19kb3QsIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0NvbWJvU2NoZW1hIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnc3VwZXJjb21ibycsIHsgY29tcENsYXNzOiAnTUxTdXBlckNvbWJvJywgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzU3VwZXJDb21ib1NjaGVtYSB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NvbWJvbGlzdCcsIHsgY29tcENsYXNzOiAnTUxDb21ib0xpc3QnLCBpdGVtRnVuY3Rpb246IHByb2Nlc3NDb21ib0xpc3RTY2hlbWEgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdpbWFnZScsIHsgY29tcENsYXNzOiAnTUxJbWFnZScsIHRlbXBsYXRlOiBpbWFnZV9kb3QgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdkcm9wdGFyZ2V0JywgeyBjb21wQ2xhc3M6ICdNTERyb3BUYXJnZXQnLCB0ZW1wbGF0ZTogZHJvcHRhcmdldF9kb3QsIG1vZGVsUGF0aFJ1bGU6ICdwcm9oaWJpdGVkJyB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3RleHQnLCB7IGNvbXBDbGFzczogJ01MVGV4dCcsIHRlbXBsYXRlOiB0ZXh0X2RvdCwgbW9kZWxQYXRoUnVsZTogJ29wdGlvbmFsJyB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NsZWFyJywgeyB0ZW1wbGF0ZTogY2xlYXJfZG90IH0pO1xuXG5mdW5jdGlvbiBwcm9jZXNzU2VsZWN0U2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIHZhciBvcHRpb25zID0gc2NoZW1hLnNlbGVjdE9wdGlvbnM7XG4gICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21ib09wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzUmFkaW9TY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEucmFkaW9PcHRpb25zO1xuICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tcG9uZW50TW9kZWwpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzQ2hlY2tHcm91cFNjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5jaGVja09wdGlvbnM7XG4gICAgY29tcC5zZXRTZWxlY3RBbGwoISFzY2hlbWEuc2VsZWN0QWxsKTtcbiAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbXBvbmVudE1vZGVsKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NvbWJvU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIHZhciBvcHRpb25zID0gc2NoZW1hLmNvbWJvT3B0aW9ucztcbiAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbXBvbmVudE1vZGVsKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1N1cGVyQ29tYm9TY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuY29tYm9PcHRpb25zLFxuICAgICAgICBvcHRpb25zVVJMID0gc2NoZW1hLmNvbWJvT3B0aW9uc1VSTCxcbiAgICAgICAgYWRkSXRlbVByb21wdCA9IHNjaGVtYS5hZGRJdGVtUHJvbXB0LFxuICAgICAgICBwbGFjZUhvbGRlciA9IHNjaGVtYS5wbGFjZUhvbGRlcjtcblxuICAgIF8uZGVmZXJUaWNrcyhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChhZGRJdGVtUHJvbXB0KSBjb21wLnNldEFkZEl0ZW1Qcm9tcHQoYWRkSXRlbVByb21wdCk7XG4gICAgICAgIGlmIChwbGFjZUhvbGRlcikgY29tcC5zZXRQbGFjZWhvbGRlcihwbGFjZUhvbGRlcik7XG4gICAgICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tYm9PcHRpb25zKTtcbiAgICAgICAgaWYgKG9wdGlvbnNVUkwpIGNvbXAuaW5pdE9wdGlvbnNVUkwob3B0aW9uc1VSTCk7XG4gICAgfSwgMik7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NDb21ib0xpc3RTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuY29tYm9PcHRpb25zLFxuICAgICAgICBhZGRJdGVtUHJvbXB0ID0gc2NoZW1hLmFkZEl0ZW1Qcm9tcHQsXG4gICAgICAgIHBsYWNlSG9sZGVyID0gc2NoZW1hLnBsYWNlSG9sZGVyO1xuXG4gICAgXy5kZWZlclRpY2tzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGFkZEl0ZW1Qcm9tcHQpIGNvbXAuc2V0QWRkSXRlbVByb21wdChhZGRJdGVtUHJvbXB0KTtcbiAgICAgICAgaWYgKHBsYWNlSG9sZGVyKSBjb21wLnNldFBsYWNlaG9sZGVyKHBsYWNlSG9sZGVyKTtcbiAgICAgICAgY29tcC5zZXREYXRhVmFsaWRhdGlvbihzY2hlbWEuZGF0YVZhbGlkYXRpb24pO1xuICAgICAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbWJvT3B0aW9ucyk7XG4gICAgfSwgMik7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NJbnB1dExpc3RTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgY29tcC5zZXRBc3luYyhzY2hlbWEuYXN5bmNIYW5kbGVyKTtcbiAgICBjb21wLnNldFBsYWNlSG9sZGVyKHNjaGVtYS5wbGFjZUhvbGRlcik7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NUZXh0YXJlYVNjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICBpZiAoc2NoZW1hLmF1dG9yZXNpemUpIF8uZGVmZXJNZXRob2QoY29tcCwgJ3N0YXJ0QXV0b3Jlc2l6ZScsIHNjaGVtYS5hdXRvcmVzaXplKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0lucHV0U2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIGlmIChfLmlzTnVtZXJpYyhzY2hlbWEubWF4TGVuZ3RoKSkgY29tcC5zZXRNYXhMZW5ndGgoc2NoZW1hLm1heExlbmd0aCk7XG59XG5cbmZ1bmN0aW9uIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0TW9kZWxGdW5jKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnRoZW4gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc2V0TW9kZWxGdW5jKGNvbXAsIFt7IHZhbHVlOiAwLCBsYWJlbDogJ2xvYWRpbmcuLi4nIH1dKTtcbiAgICAgICAgICAgIG9wdGlvbnMudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldE1vZGVsRnVuYyhjb21wLCBkYXRhKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRNb2RlbEZ1bmMoY29tcCwgW3sgdmFsdWU6IDAsIGxhYmVsOiAnbG9hZGluZyBlcnJvcicgfV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBzZXRNb2RlbEZ1bmMoY29tcCwgb3B0aW9ucyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRDb21wb25lbnRNb2RlbChjb21wLCBkYXRhKSB7XG4gICAgY29tcC5tb2RlbC5zZXQoZGF0YSk7XG4gICAgLy8gXy5kZWZlck1ldGhvZChjb21wLm1vZGVsLCAnc2V0JywgZGF0YSk7XG4gICAgLy8gZG9pbmcgaXQgd2l0aCBkZWZlciBtYWtlcyBjaGFubmVsIG5vdCBzZXQgd2hlbiB0aGUgYXJ0aWNsZSBpcyBvcGVuZWRcbn1cblxuZnVuY3Rpb24gc2V0Q29tYm9PcHRpb25zKGNvbXAsIGRhdGEpIHtcbiAgICBjb21wLnNldE9wdGlvbnMoZGF0YSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlcixcbiAgICBjaGVjayA9IG1pbG8udXRpbC5jaGVjayxcbiAgICBNYXRjaCA9IGNoZWNrLk1hdGNoO1xuXG52YXIgZm9ybVR5cGVzID0ge307XG52YXIgZGVmYXVsdHMgPSB7fTtcblxudmFyIGZvcm1SZWdpc3RyeSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldDogcmVnaXN0cnlfZ2V0LFxuICAgIGFkZDogcmVnaXN0cnlfYWRkLFxuICAgIHNldERlZmF1bHRzOiByZWdpc3RyeV9zZXREZWZhdWx0c1xufTtcblxudmFyIERFRkFVTFRfVEVNUExBVEUgPSAne3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx7ez0gaXQudGFnTmFtZX19IG1sLWJpbmQ9XCJ7ez0gaXQuY29tcENsYXNzfX06e3s9IGl0LmNvbXBOYW1lIH19XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3t7PSBpdC50YWdOYW1lfX0+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2Pic7XG5cbmZvcm1SZWdpc3RyeS5zZXREZWZhdWx0cyh7XG4gICAgdGVtcGxhdGU6IERFRkFVTFRfVEVNUExBVEUsXG4gICAgbW9kZWxQYXRoUnVsZTogJ3JlcXVpcmVkJyxcbiAgICBpdGVtRnVuY3Rpb246IG51bGxcbn0pO1xuXG5mdW5jdGlvbiByZWdpc3RyeV9nZXQobmFtZSkge1xuICAgIHZhciBmb3JtSXRlbSA9IG5hbWUgJiYgZm9ybVR5cGVzW25hbWVdO1xuXG4gICAgaWYgKCFmb3JtSXRlbSkgcmV0dXJuIGxvZ2dlci5lcnJvcignRm9ybSBpdGVtICcgKyBuYW1lICsgJyBub3QgcmVnaXN0ZXJlZCcpO1xuXG4gICAgcmV0dXJuIGZvcm1JdGVtO1xufVxuXG5mdW5jdGlvbiByZWdpc3RyeV9hZGQobmFtZSwgbmV3Rm9ybUl0ZW0pIHtcbiAgICBjaGVjayhuYW1lLCBTdHJpbmcpO1xuICAgIGNoZWNrKG5ld0Zvcm1JdGVtLCB7XG4gICAgICAgIGNvbXBDbGFzczogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgdGVtcGxhdGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIG1vZGVsUGF0aFJ1bGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIGl0ZW1GdW5jdGlvbjogTWF0Y2guT3B0aW9uYWwoRnVuY3Rpb24pXG4gICAgfSk7XG5cbiAgICB2YXIgZm9ybUl0ZW0gPSBfLmNsb25lKGRlZmF1bHRzKTtcbiAgICBfLmV4dGVuZChmb3JtSXRlbSwgbmV3Rm9ybUl0ZW0pO1xuXG4gICAgaWYgKG5hbWUgJiYgZm9ybVR5cGVzW25hbWVdKSByZXR1cm4gbG9nZ2VyLmVycm9yKCdGb3JtIGl0ZW0gJyArIG5hbWUgKyAnIGFscmVhZHkgcmVnaXN0ZXJlZCcpO1xuXG4gICAgZm9ybVR5cGVzW25hbWVdID0gZm9ybUl0ZW07XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdHJ5X3NldERlZmF1bHRzKG5ld0RlZmF1bHRzKSB7XG4gICAgY2hlY2soZGVmYXVsdHMsIE9iamVjdCk7XG4gICAgZGVmYXVsdHMgPSBuZXdEZWZhdWx0cztcbn0iLCIndXNlIHN0cmljdCc7XG5cbmlmICghKHdpbmRvdy5taWxvICYmIHdpbmRvdy5taWxvLm1pbG9fdmVyc2lvbikpIHRocm93IG5ldyBFcnJvcignbWlsbyBpcyBub3QgYXZhaWxhYmxlJyk7XG5cbi8qKlxuICogYG1pbG8tdWlgXG4gKlxuICogVGhpcyBidW5kbGUgd2lsbCByZWdpc3RlciBhZGRpdGlvbmFsIGNvbXBvbmVudCBjbGFzc2VzIGZvciBVSVxuICovXG5cbnJlcXVpcmUoJy4vdXNlX2NvbXBvbmVudHMnKTsiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Hcm91cCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1dyYXBwZXInKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9UZXh0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvU2VsZWN0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSW5wdXQnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9JbnB1dExpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9UZXh0YXJlYScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1JhZGlvR3JvdXAnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9DaGVja0dyb3VwJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvQnV0dG9uJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSHlwZXJsaW5rJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvTGlzdCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0xpc3RJdGVtU2ltcGxlJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvTGlzdEl0ZW0nKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9UaW1lJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvRGF0ZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0NvbWJvJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvU3VwZXJDb21ibycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0NvbWJvTGlzdCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0ltYWdlJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvRHJvcFRhcmdldCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0ZvbGRUcmVlJyk7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy9ib290c3RyYXAvQWxlcnQnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9ib290c3RyYXAvRGlhbG9nJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvYm9vdHN0cmFwL0Ryb3Bkb3duJyk7XG5cbnJlcXVpcmUoJy4vZm9ybXMvRm9ybScpOyIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKSxnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oy8qIVxuICogYXN5bmNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IENhb2xhbiBNY01haG9uXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBhc3luYyA9IHt9O1xuICAgIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHYpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvQm9vbCh2KSB7XG4gICAgICAgIHJldHVybiAhIXY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vdElkKHYpIHtcbiAgICAgICAgcmV0dXJuICF2O1xuICAgIH1cblxuICAgIC8vIGdsb2JhbCBvbiB0aGUgc2VydmVyLCB3aW5kb3cgaW4gdGhlIGJyb3dzZXJcbiAgICB2YXIgcHJldmlvdXNfYXN5bmM7XG5cbiAgICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCAoYHNlbGZgKSBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbiAgICAvLyBvbiB0aGUgc2VydmVyLCBvciBgdGhpc2AgaW4gc29tZSB2aXJ0dWFsIG1hY2hpbmVzLiBXZSB1c2UgYHNlbGZgXG4gICAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgICB2YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fFxuICAgICAgICAgICAgdGhpcztcblxuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBjcm9zcy1icm93c2VyIGNvbXBhdGlibGl0eSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgdmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICB2YXIgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIF90b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIC8vIFBvcnRlZCBmcm9tIHVuZGVyc2NvcmUuanMgaXNPYmplY3RcbiAgICB2YXIgX2lzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9pc0FycmF5TGlrZShhcnIpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5KGFycikgfHwgKFxuICAgICAgICAgICAgLy8gaGFzIGEgcG9zaXRpdmUgaW50ZWdlciBsZW5ndGggcHJvcGVydHlcbiAgICAgICAgICAgIHR5cGVvZiBhcnIubGVuZ3RoID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoID49IDAgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggJSAxID09PSAwXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FycmF5RWFjaChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JhbmdlKGNvdW50KSB7XG4gICAgICAgIHJldHVybiBfbWFwKEFycmF5KGNvdW50KSwgZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGk7IH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWR1Y2UoYXJyLCBpdGVyYXRvciwgbWVtbykge1xuICAgICAgICBfYXJyYXlFYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvcihtZW1vLCB4LCBpLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mb3JFYWNoT2Yob2JqZWN0LCBpdGVyYXRvcikge1xuICAgICAgICBfYXJyYXlFYWNoKF9rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5kZXhPZihhcnIsIGl0ZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICB2YXIgX2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfa2V5SXRlcmF0b3IoY29sbCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB2YXIgbGVuO1xuICAgICAgICB2YXIga2V5cztcbiAgICAgICAgaWYgKF9pc0FycmF5TGlrZShjb2xsKSkge1xuICAgICAgICAgICAgbGVuID0gY29sbC5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBpIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gX2tleXMoY29sbCk7XG4gICAgICAgICAgICBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNpbWlsYXIgdG8gRVM2J3MgcmVzdCBwYXJhbSAoaHR0cDovL2FyaXlhLm9maWxhYnMuY29tLzIwMTMvMDMvZXM2LWFuZC1yZXN0LXBhcmFtZXRlci5odG1sKVxuICAgIC8vIFRoaXMgYWNjdW11bGF0ZXMgdGhlIGFyZ3VtZW50cyBwYXNzZWQgaW50byBhbiBhcnJheSwgYWZ0ZXIgYSBnaXZlbiBpbmRleC5cbiAgICAvLyBGcm9tIHVuZGVyc2NvcmUuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzIxNDApLlxuICAgIGZ1bmN0aW9uIF9yZXN0UGFyYW0oZnVuYywgc3RhcnRJbmRleCkge1xuICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCByZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEN1cnJlbnRseSB1bnVzZWQgYnV0IGhhbmRsZSBjYXNlcyBvdXRzaWRlIG9mIHRoZSBzd2l0Y2ggc3RhdGVtZW50OlxuICAgICAgICAgICAgLy8gdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICAgICAgICAvLyBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBleHBvcnRlZCBhc3luYyBtb2R1bGUgZnVuY3Rpb25zIC8vLy9cblxuICAgIC8vLy8gbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gd2l0aCBicm93c2VyLWNvbXBhdGlibGUgZmFsbGJhY2sgLy8vL1xuXG4gICAgLy8gY2FwdHVyZSB0aGUgZ2xvYmFsIHJlZmVyZW5jZSB0byBndWFyZCBhZ2FpbnN0IGZha2VUaW1lciBtb2Nrc1xuICAgIHZhciBfc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG5cbiAgICB2YXIgX2RlbGF5ID0gX3NldEltbWVkaWF0ZSA/IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0gOiBmdW5jdGlvbihmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBfZGVsYXk7XG4gICAgfVxuICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IF9zZXRJbW1lZGlhdGUgPyBfZGVsYXkgOiBhc3luYy5uZXh0VGljaztcblxuXG4gICAgYXN5bmMuZm9yRWFjaCA9XG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9XG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPVxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPVxuICAgIGFzeW5jLmVhY2hPZiA9IGZ1bmN0aW9uIChvYmplY3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmplY3QgPSBvYmplY3QgfHwgW107XG5cbiAgICAgICAgdmFyIGl0ZXIgPSBfa2V5SXRlcmF0b3Iob2JqZWN0KTtcbiAgICAgICAgdmFyIGtleSwgY29tcGxldGVkID0gMDtcblxuICAgICAgICB3aGlsZSAoKGtleSA9IGl0ZXIoKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbXBsZXRlZCA9PT0gMCkgY2FsbGJhY2sobnVsbCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgICAgIGNvbXBsZXRlZC0tO1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBrZXkgaXMgbnVsbCBpbiBjYXNlIGl0ZXJhdG9yIGlzbid0IGV4aGF1c3RlZFxuICAgICAgICAgICAgLy8gYW5kIGRvbmUgcmVzb2x2ZWQgc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gbnVsbCAmJiBjb21wbGV0ZWQgPD0gMCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZlNlcmllcyA9XG4gICAgYXN5bmMuZWFjaE9mU2VyaWVzID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoaXRlcmF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRlKCk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5mb3JFYWNoT2ZMaW1pdCA9XG4gICAgYXN5bmMuZWFjaE9mTGltaXQgPSBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9lYWNoT2ZMaW1pdChsaW1pdCkob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZWFjaE9mTGltaXQobGltaXQpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBydW5uaW5nID0gMDtcbiAgICAgICAgICAgIHZhciBlcnJvcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiByZXBsZW5pc2ggKCkge1xuICAgICAgICAgICAgICAgIGlmIChkb25lICYmIHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHJ1bm5pbmcgPCBsaW1pdCAmJiAhZXJyb3JlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBydW5uaW5nICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxlbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWwoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZiwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsTGltaXQoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihfZWFjaE9mTGltaXQobGltaXQpLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvU2VyaWVzKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2ZTZXJpZXMsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXN5bmNNYXAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKGFycikgPyBbXSA6IHt9O1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5tYXAgPSBkb1BhcmFsbGVsKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwU2VyaWVzID0gZG9TZXJpZXMoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfYXN5bmNNYXApO1xuXG4gICAgLy8gcmVkdWNlIG9ubHkgaGFzIGEgc2VyaWVzIHZlcnNpb24sIGFzIGRvaW5nIHJlZHVjZSBpbiBwYXJhbGxlbCB3b24ndFxuICAgIC8vIHdvcmsgaW4gbWFueSBzaXR1YXRpb25zLlxuICAgIGFzeW5jLmluamVjdCA9XG4gICAgYXN5bmMuZm9sZGwgPVxuICAgIGFzeW5jLnJlZHVjZSA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBmdW5jdGlvbiAoeCwgaSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHgsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICBtZW1vID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5mb2xkciA9XG4gICAgYXN5bmMucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJldmVyc2VkID0gX21hcChhcnIsIGlkZW50aXR5KS5yZXZlcnNlKCk7XG4gICAgICAgIGFzeW5jLnJlZHVjZShyZXZlcnNlZCwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudHJhbnNmb3JtID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGl0ZXJhdG9yO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSBtZW1vO1xuICAgICAgICAgICAgbWVtbyA9IF9pc0FycmF5KGFycikgPyBbXSA6IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgYXN5bmMuZWFjaE9mKGFyciwgZnVuY3Rpb24odiwgaywgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHYsIGssIGNiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZpbHRlcihlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtpbmRleDogaW5kZXgsIHZhbHVlOiB4fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soX21hcChyZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgICAgICB9KSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuc2VsZWN0ID1cbiAgICBhc3luYy5maWx0ZXIgPSBkb1BhcmFsbGVsKF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0TGltaXQgPVxuICAgIGFzeW5jLmZpbHRlckxpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0U2VyaWVzID1cbiAgICBhc3luYy5maWx0ZXJTZXJpZXMgPSBkb1NlcmllcyhfZmlsdGVyKTtcblxuICAgIGZ1bmN0aW9uIF9yZWplY3QoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZmlsdGVyKGVhY2hmbiwgYXJyLCBmdW5jdGlvbih2YWx1ZSwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgY2IoIXYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgYXN5bmMucmVqZWN0ID0gZG9QYXJhbGxlbChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RTZXJpZXMgPSBkb1NlcmllcyhfcmVqZWN0KTtcblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVUZXN0ZXIoZWFjaGZuLCBjaGVjaywgZ2V0UmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2IpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNiKSBjYihnZXRSZXN1bHQoZmFsc2UsIHZvaWQgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZWUoeCwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNiKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2IgJiYgY2hlY2sodikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKGdldFJlc3VsdCh0cnVlLCB4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGxpbWl0LCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3I7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBsaW1pdDtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMuYW55ID1cbiAgICBhc3luYy5zb21lID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuc29tZUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5hbGwgPVxuICAgIGFzeW5jLmV2ZXJ5ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIG5vdElkLCBub3RJZCk7XG5cbiAgICBhc3luYy5ldmVyeUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgbm90SWQsIG5vdElkKTtcblxuICAgIGZ1bmN0aW9uIF9maW5kR2V0UmVzdWx0KHYsIHgpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIGFzeW5jLmRldGVjdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdFNlcmllcyA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mU2VyaWVzLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdExpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcblxuICAgIGFzeW5jLnNvcnRCeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5tYXAoYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uIChlcnIsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge3ZhbHVlOiB4LCBjcml0ZXJpYTogY3JpdGVyaWF9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgX21hcChyZXN1bHRzLnNvcnQoY29tcGFyYXRvciksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBjb21wYXJhdG9yKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWEsIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5hdXRvID0gZnVuY3Rpb24gKHRhc2tzLCBjb25jdXJyZW5jeSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGNvbmN1cnJlbmN5IGlzIG9wdGlvbmFsLCBzaGlmdCB0aGUgYXJncy5cbiAgICAgICAgICAgIGNhbGxiYWNrID0gY29uY3VycmVuY3k7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSByZW1haW5pbmdUYXNrcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG4gICAgICAgIHZhciBydW5uaW5nVGFza3MgPSAwO1xuXG4gICAgICAgIHZhciBoYXNFcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgdmFyIGlkeCA9IF9pbmRleE9mKGxpc3RlbmVycywgZm4pO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBsaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGFza0NvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLTtcbiAgICAgICAgICAgIF9hcnJheUVhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9hcnJheUVhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIGlmIChoYXNFcnJvcikgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBfaXNBcnJheSh0YXNrc1trXSkgPyB0YXNrc1trXTogW3Rhc2tzW2tdXTtcbiAgICAgICAgICAgIHZhciB0YXNrQ2FsbGJhY2sgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfZm9yRWFjaE9mKHJlc3VsdHMsIGZ1bmN0aW9uKHZhbCwgcmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNbcmtleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgdGFzay5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVhZC1sb2Nrc1xuICAgICAgICAgICAgdmFyIGxlbiA9IHJlcXVpcmVzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkZXA7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShkZXAgPSB0YXNrc1tyZXF1aXJlc1tsZW5dXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgbm9uZXhpc3RlbnQgZGVwZW5kZW5jeSBpbiAnICsgcmVxdWlyZXMuam9pbignLCAnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfaXNBcnJheShkZXApICYmIF9pbmRleE9mKGRlcCwgaykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmdUYXNrcyA8IGNvbmN1cnJlbmN5ICYmIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKSAmJiAhcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzKys7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBydW5uaW5nVGFza3MrKztcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gICAgYXN5bmMucmV0cnkgPSBmdW5jdGlvbih0aW1lcywgdGFzaywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIERFRkFVTFRfVElNRVMgPSA1O1xuICAgICAgICB2YXIgREVGQVVMVF9JTlRFUlZBTCA9IDA7XG5cbiAgICAgICAgdmFyIGF0dGVtcHRzID0gW107XG5cbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICB0aW1lczogREVGQVVMVF9USU1FUyxcbiAgICAgICAgICAgIGludGVydmFsOiBERUZBVUxUX0lOVEVSVkFMXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gcGFyc2VUaW1lcyhhY2MsIHQpe1xuICAgICAgICAgICAgaWYodHlwZW9mIHQgPT09ICdudW1iZXInKXtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgdCA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQudGltZXMsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgICAgIGFjYy5pbnRlcnZhbCA9IHBhcnNlSW50KHQuaW50ZXJ2YWwsIDEwKSB8fCBERUZBVUxUX0lOVEVSVkFMO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGFyZ3VtZW50IHR5cGUgZm9yIFxcJ3RpbWVzXFwnOiAnICsgdHlwZW9mIHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPCAxIHx8IGxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudHMgLSBtdXN0IGJlIGVpdGhlciAodGFzayksICh0YXNrLCBjYWxsYmFjayksICh0aW1lcywgdGFzaykgb3IgKHRpbWVzLCB0YXNrLCBjYWxsYmFjayknKTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPD0gMiAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdGFzaztcbiAgICAgICAgICAgIHRhc2sgPSB0aW1lcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRpbWVzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBwYXJzZVRpbWVzKG9wdHMsIHRpbWVzKTtcbiAgICAgICAgfVxuICAgICAgICBvcHRzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIG9wdHMudGFzayA9IHRhc2s7XG5cbiAgICAgICAgZnVuY3Rpb24gd3JhcHBlZFRhc2sod3JhcHBlZENhbGxiYWNrLCB3cmFwcGVkUmVzdWx0cykge1xuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlBdHRlbXB0KHRhc2ssIGZpbmFsQXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrKGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKCFlcnIgfHwgZmluYWxBdHRlbXB0LCB7ZXJyOiBlcnIsIHJlc3VsdDogcmVzdWx0fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHdyYXBwZWRSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUludGVydmFsKGludGVydmFsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spe1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlIChvcHRzLnRpbWVzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmluYWxBdHRlbXB0ID0gIShvcHRzLnRpbWVzLT0xKTtcbiAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5QXR0ZW1wdChvcHRzLnRhc2ssIGZpbmFsQXR0ZW1wdCkpO1xuICAgICAgICAgICAgICAgIGlmKCFmaW5hbEF0dGVtcHQgJiYgb3B0cy5pbnRlcnZhbCA+IDApe1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5SW50ZXJ2YWwob3B0cy5pbnRlcnZhbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMuc2VyaWVzKGF0dGVtcHRzLCBmdW5jdGlvbihkb25lLCBkYXRhKXtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICh3cmFwcGVkQ2FsbGJhY2sgfHwgb3B0cy5jYWxsYmFjaykoZGF0YS5lcnIsIGRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBpcyBwYXNzZWQsIHJ1biB0aGlzIGFzIGEgY29udHJvbGwgZmxvd1xuICAgICAgICByZXR1cm4gb3B0cy5jYWxsYmFjayA/IHdyYXBwZWRUYXNrKCkgOiB3cmFwcGVkVGFzaztcbiAgICB9O1xuXG4gICAgYXN5bmMud2F0ZXJmYWxsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHRhc2tzKSkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gd2F0ZXJmYWxsIG11c3QgYmUgYW4gYXJyYXkgb2YgZnVuY3Rpb25zJyk7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gd3JhcEl0ZXJhdG9yKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2god3JhcEl0ZXJhdG9yKG5leHQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5zdXJlQXN5bmMoaXRlcmF0b3IpLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdyYXBJdGVyYXRvcihhc3luYy5pdGVyYXRvcih0YXNrcykpKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9wYXJhbGxlbChlYWNoZm4sIHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKHRhc2tzKSA/IFtdIDoge307XG5cbiAgICAgICAgZWFjaGZuKHRhc2tzLCBmdW5jdGlvbiAodGFzaywga2V5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdGFzayhfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5wYXJhbGxlbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZiwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uKHRhc2tzLCBsaW1pdCwgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKF9lYWNoT2ZMaW1pdChsaW1pdCksIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcmllcyA9IGZ1bmN0aW9uKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mU2VyaWVzLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5pdGVyYXRvciA9IGZ1bmN0aW9uICh0YXNrcykge1xuICAgICAgICBmdW5jdGlvbiBtYWtlQ2FsbGJhY2soaW5kZXgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZuKCkge1xuICAgICAgICAgICAgICAgIGlmICh0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFza3NbaW5kZXhdLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmbi5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmbi5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaW5kZXggPCB0YXNrcy5sZW5ndGggLSAxKSA/IG1ha2VDYWxsYmFjayhpbmRleCArIDEpOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFrZUNhbGxiYWNrKDApO1xuICAgIH07XG5cbiAgICBhc3luYy5hcHBseSA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChjYWxsQXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KFxuICAgICAgICAgICAgICAgIG51bGwsIGFyZ3MuY29uY2F0KGNhbGxBcmdzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBfY29uY2F0KGVhY2hmbiwgYXJyLCBmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNiKSB7XG4gICAgICAgICAgICBmbih4LCBmdW5jdGlvbiAoZXJyLCB5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh5IHx8IFtdKTtcbiAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmNvbmNhdCA9IGRvUGFyYWxsZWwoX2NvbmNhdCk7XG4gICAgYXN5bmMuY29uY2F0U2VyaWVzID0gZG9TZXJpZXMoX2NvbmNhdCk7XG5cbiAgICBhc3luYy53aGlsc3QgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgaWYgKHRlc3QoKSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3QuYXBwbHkodGhpcywgYXJncykpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgW251bGxdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvV2hpbHN0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICsrY2FsbHMgPD0gMSB8fCB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnVudGlsID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvVW50aWwgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5kb1doaWxzdChpdGVyYXRvciwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kdXJpbmcgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcblxuICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGNoZWNrKTtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbihlcnIsIHRydXRoKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHJ1dGgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGVzdChjaGVjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvRHVyaW5nID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICBhc3luYy5kdXJpbmcoZnVuY3Rpb24obmV4dCkge1xuICAgICAgICAgICAgaWYgKGNhbGxzKysgPCAxKSB7XG4gICAgICAgICAgICAgICAgbmV4dChudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcXVldWUod29ya2VyLCBjb25jdXJyZW5jeSwgcGF5bG9hZCkge1xuICAgICAgICBpZiAoY29uY3VycmVuY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uY3VycmVuY3kgbXVzdCBub3QgYmUgemVybycpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcG9zLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwICYmIHEuaWRsZSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrIHx8IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX25leHQocSwgdGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcblxuICAgICAgICAgICAgICAgIHZhciByZW1vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgX2FycmF5RWFjaCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgX2FycmF5RWFjaCh3b3JrZXJzTGlzdCwgZnVuY3Rpb24gKHdvcmtlciwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXIgPT09IHRhc2sgJiYgIXJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0YXNrLmNhbGxiYWNrLmFwcGx5KHRhc2ssIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd29ya2VycyA9IDA7XG4gICAgICAgIHZhciB3b3JrZXJzTGlzdCA9IFtdO1xuICAgICAgICB2YXIgcSA9IHtcbiAgICAgICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5OiBjb25jdXJyZW5jeSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG5vb3AsXG4gICAgICAgICAgICBlbXB0eTogbm9vcCxcbiAgICAgICAgICAgIGRyYWluOiBub29wLFxuICAgICAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluID0gbm9vcDtcbiAgICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdoaWxlKCFxLnBhdXNlZCAmJiB3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLnRhc2tzLmxlbmd0aCl7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2tzID0gcS5wYXlsb2FkID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKDAsIHEucGF5bG9hZCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS50YXNrcy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gX21hcCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Vyc0xpc3QucHVzaCh0YXNrc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXIoZGF0YSwgY2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdvcmtlcnNMaXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnNMaXN0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkgeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bWVDb3VudCA9IE1hdGgubWluKHEuY29uY3VycmVuY3ksIHEudGFza3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIHcgPSAxOyB3IDw9IHJlc3VtZUNvdW50OyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcTtcbiAgICB9XG5cbiAgICBhc3luYy5xdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIHZhciBxID0gX3F1ZXVlKGZ1bmN0aW9uIChpdGVtcywgY2IpIHtcbiAgICAgICAgICAgIHdvcmtlcihpdGVtc1swXSwgY2IpO1xuICAgICAgICB9LCBjb25jdXJyZW5jeSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLnByaW9yaXR5UXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlVGFza3MoYSwgYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYmluYXJ5U2VhcmNoKHNlcXVlbmNlLCBpdGVtLCBjb21wYXJlKSB7XG4gICAgICAgICAgICB2YXIgYmVnID0gLTEsXG4gICAgICAgICAgICAgICAgZW5kID0gc2VxdWVuY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChiZWcgPCBlbmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWlkID0gYmVnICsgKChlbmQgLSBiZWcgKyAxKSA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZShfYmluYXJ5U2VhcmNoKHEudGFza3MsIGl0ZW0sIF9jb21wYXJlVGFza3MpICsgMSwgMCwgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBhc3luYy5xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KTtcblxuICAgICAgICAvLyBPdmVycmlkZSBwdXNoIHRvIGFjY2VwdCBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyBwcmlvcml0eVxuICAgICAgICBxLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHVuc2hpZnQgZnVuY3Rpb25cbiAgICAgICAgZGVsZXRlIHEudW5zaGlmdDtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY2FyZ28gPSBmdW5jdGlvbiAod29ya2VyLCBwYXlsb2FkKSB7XG4gICAgICAgIHJldHVybiBfcXVldWUod29ya2VyLCAxLCBwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbnNvbGVfZm4obmFtZSkge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmxvZyA9IF9jb25zb2xlX2ZuKCdsb2cnKTtcbiAgICBhc3luYy5kaXIgPSBfY29uc29sZV9mbignZGlyJyk7XG4gICAgLyphc3luYy5pbmZvID0gX2NvbnNvbGVfZm4oJ2luZm8nKTtcbiAgICBhc3luYy53YXJuID0gX2NvbnNvbGVfZm4oJ3dhcm4nKTtcbiAgICBhc3luYy5lcnJvciA9IF9jb25zb2xlX2ZuKCdlcnJvcicpOyovXG5cbiAgICBhc3luYy5tZW1vaXplID0gZnVuY3Rpb24gKGZuLCBoYXNoZXIpIHtcbiAgICAgICAgdmFyIG1lbW8gPSB7fTtcbiAgICAgICAgdmFyIHF1ZXVlcyA9IHt9O1xuICAgICAgICB2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGlkZW50aXR5O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIG1lbW9pemVkKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGhhcy5jYWxsKG1lbW8sIGtleSkpIHsgICBcbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaGFzLmNhbGwocXVldWVzLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0ucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XSA9IFtjYWxsYmFja107XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtb1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHEgPSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxW2ldLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBtZW1vaXplZC5tZW1vID0gbWVtbztcbiAgICAgICAgbWVtb2l6ZWQudW5tZW1vaXplZCA9IGZuO1xuICAgICAgICByZXR1cm4gbWVtb2l6ZWQ7XG4gICAgfTtcblxuICAgIGFzeW5jLnVubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChmbi51bm1lbW9pemVkIHx8IGZuKS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfdGltZXMobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY291bnQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgbWFwcGVyKF9yYW5nZShjb3VudCksIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMudGltZXMgPSBfdGltZXMoYXN5bmMubWFwKTtcbiAgICBhc3luYy50aW1lc1NlcmllcyA9IF90aW1lcyhhc3luYy5tYXBTZXJpZXMpO1xuICAgIGFzeW5jLnRpbWVzTGltaXQgPSBmdW5jdGlvbiAoY291bnQsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLm1hcExpbWl0KF9yYW5nZShjb3VudCksIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXEgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHZhciBmbnMgPSBhcmd1bWVudHM7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gbm9vcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMucmVkdWNlKGZucywgYXJncywgZnVuY3Rpb24gKG5ld2FyZ3MsIGZuLCBjYikge1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIG5ld2FyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIG5leHRhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNiKGVyciwgbmV4dGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGF0LCBbZXJyXS5jb25jYXQocmVzdWx0cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5jb21wb3NlID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICByZXR1cm4gYXN5bmMuc2VxLmFwcGx5KG51bGwsIEFycmF5LnByb3RvdHlwZS5yZXZlcnNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuXG4gICAgZnVuY3Rpb24gX2FwcGx5RWFjaChlYWNoZm4pIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24oZm5zLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZ28gPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWFjaGZuKGZucywgZnVuY3Rpb24gKGZuLCBfLCBjYikge1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzLmNvbmNhdChbY2JdKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnby5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBnbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuYXBwbHlFYWNoID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2YpO1xuICAgIGFzeW5jLmFwcGx5RWFjaFNlcmllcyA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mU2VyaWVzKTtcblxuXG4gICAgYXN5bmMuZm9yZXZlciA9IGZ1bmN0aW9uIChmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRvbmUgPSBvbmx5X29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciB0YXNrID0gZW5zdXJlQXN5bmMoZm4pO1xuICAgICAgICBmdW5jdGlvbiBuZXh0KGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXNrKG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIG5leHQoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZW5zdXJlQXN5bmMoZm4pIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICBhcmdzLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbm5lckFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGlubmVyQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGlubmVyQXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuZW5zdXJlQXN5bmMgPSBlbnN1cmVBc3luYztcblxuICAgIGFzeW5jLmNvbnN0YW50ID0gX3Jlc3RQYXJhbShmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbbnVsbF0uY29uY2F0KHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFzeW5jLndyYXBTeW5jID1cbiAgICBhc3luYy5hc3luY2lmeSA9IGZ1bmN0aW9uIGFzeW5jaWZ5KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHJlc3VsdCBpcyBQcm9taXNlIG9iamVjdFxuICAgICAgICAgICAgaWYgKF9pc09iamVjdChyZXN1bHQpICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyci5tZXNzYWdlID8gZXJyIDogbmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gTm9kZS5qc1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGFzeW5jO1xuICAgIH1cbiAgICAvLyBBTUQgLyBSZXF1aXJlSlNcbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlZCBkaXJlY3RseSB2aWEgPHNjcmlwdD4gdGFnXG4gICAgZWxzZSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBhc3luYztcbiAgICB9XG5cbn0oKSk7XG4iLCJcbi8vIG5vdCBpbXBsZW1lbnRlZFxuLy8gVGhlIHJlYXNvbiBmb3IgaGF2aW5nIGFuIGVtcHR5IGZpbGUgYW5kIG5vdCB0aHJvd2luZyBpcyB0byBhbGxvd1xuLy8gdW50cmFkaXRpb25hbCBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIG1vZHVsZS5cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiJdfQ==
;