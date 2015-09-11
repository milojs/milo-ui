;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , uniqueId = milo.util.uniqueId;


var CHECKED_CHANGE_MESSAGE = 'mlcheckgroupchange'
    , ELEMENT_NAME_PROPERTY = '_mlCheckGroupElementID'
    , ELEMENT_NAME_PREFIX = 'ml-check-group-';

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
        template:  '{{~ it.checkOptions :option }} \
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
    var checkboxList = this.container.scope.checkboxList;

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
    if (this._renderOptions.selectAll)
        this.el.querySelector('input[name="all"]').checked = checked;
}

function isAllElementChecked(data) {
    return _.everyKey(this._checkEls, function (el) { return el.checked; });
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

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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

    this._comboInput.data.on('input',
        { subscriber: dispatchChangeMessage, context: this });
}

function MLCombo_get() {
    if (! this._comboInput) return;
    return this._comboInput.data.get();
}

function MLCombo_set(value) {
    return changeComboData.call(this, 'set', value);
}

function MLCombo_del() {
    return changeComboData.call(this, 'del', value);
}

function changeComboData(method, value) {
    if (! this._comboInput) return;
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

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , check = milo.util.check
    , Match = check.Match;

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
            '***': { subscriber: onItemsChange, context: 'owner'}
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
    clearComboInput : MLComboList$clearComboInput
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


function MLComboList$clearComboInput () {
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
    if (data.newValue && runDataValidation.call(this, msg, data))
        this._list.model.push(data.newValue);
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

var Component = milo.Component
    , componentsRegistry = milo.registry.components;

var MLDate = Component.createComponentClass('MLDate', {
    events: undefined,
    data: {
        get: MLDate_get,
        set: MLDate_set,
        del: MLDate_del,
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
    var dateArr = [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ];

    var dateStr = dateArr.join('-');

    return dateStr;

    function pad(n) { return n < 10 ? '0' + n : n; }
}
},{}],6:[function(require,module,exports){
'use strict';


var Component = milo.Component
    , componentsRegistry = milo.registry.components;


var MLDropTarget = Component.createComponentClass('MLDropTarget', ['drop']);


componentsRegistry.add(MLDropTarget);

module.exports = MLDropTarget;

},{}],7:[function(require,module,exports){
'use strict';

var doT = milo.util.doT
    , componentsRegistry = milo.registry.components
    , Component = milo.Component
    , uniqueId = milo.util.uniqueId;

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
            </span>')
    , COMPILED_TREE_TEMPLATE = doT.compile(TREE_TEMPLATE);


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
    if (opened)
        el.classList.add('ml-ui-foldtree--unfold', opened);
    else
        el.classList.toggle('ml-ui-foldtree--unfold');
}

function itemMessage(msg, el) {
    var id = el.getAttribute('data-item-id')
        , item = this._itemsMap[id];

    this.postMessage('mlfoldtree_' + msg, {
        item: item,
        el: el
    });
}

function onItemEvent(msg, e) {
    var el = e.target;
    if (el.classList.contains('ml-ui-foldtree-button'))
        foldUnfold(el.parentNode.parentNode);
    else if (el.classList.contains('ml-ui-foldtree-label'))
        itemMessage.call(this, msg, el.parentNode);
    else return;
    e.stopPropagation();
}

function MLFoldTree$setItemTemplate (templateStr) {
    this._itemTemplate = doT.compile(templateStr);
}

function MLFoldTree$renderTree (data) {
    var self = this;
    this._data = data;
    self._itemsMap = {};
    this.el.innerHTML = _renderTree(data);

    function _renderTree (data) {
        if (data.items)
            var itemsIDs = _.map(data.items, function(item) {
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
    _.forEach(items, function(item) {
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

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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

var Component = milo.Component
    , componentsRegistry = milo.registry.components;

var INPUT_LIST_CHANGE_MESSAGE = 'mlinputlistchange';

var asyncHandler = function (value, callback) {callback(value);};

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
    this._button.events.on('click', {subscriber: onClick, context: this });   
}

function onClick(msg) {
    var value = this._input.data.get(0);
    if (this._input.data)
        asyncHandler(value, function (label, value) {
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

function MLInputList_splice() { // ... arguments
    this.model.splice.apply(this.model, arguments);
}
},{}],13:[function(require,module,exports){
'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components;

var LIST_CHANGE_MESSAGE = 'mllistchange'
    , DELETE_BUTTON_NAME = 'deleteBtn';


var MLList = Component.createComponentClass('MLList', {
    dom: {
        cls: 'ml-ui-list'
    },
    data: undefined,
    events: undefined,
    model: undefined,
    list: undefined
});


componentsRegistry.add(MLList);

module.exports = MLList;


_.extendProto(MLList, {
    init: MLList$init,
    destroy: MLList$destroy,
    removeItem: MLList$removeItem,
    moveItem: MLList$moveItem
});


function MLList$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}


function MLList$destroy() {
    this._connector && milo.minder.destroyConnector(this._connector);
    this._connector = null;
    Component.prototype.destroy.apply(this, arguments);
}


function MLList$removeItem(index){
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

var Component = milo.Component
    , DragDrop = milo.util.dragDrop
    , componentsRegistry = milo.registry.components;


var MLListItem = milo.createComponentClass({
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
    }
});

module.exports = MLListItem;


_.extendProto(MLListItem, {
    init: MLListItem$init,
    moveItem: MLListItem$moveItem,
    removeItem: MLListItem$removeItem,
    getMetaData: MLListItem$getMetaData,
    isDropAllowed: MLListItem$isDropAllowed
});


function MLListItem$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}


function onChildrenBound() {
    var deleteBtn = this.container.scope.deleteBtn;
    deleteBtn && deleteBtn.events.on('click', { subscriber: this.removeItem, context: this });
}


function MLListItem$removeItem() {
    try { var listOwner = this.item.list.owner; } catch(e) {}
    listOwner && listOwner.removeItem(this.item.index);
}


function MLListItem$moveItem(index) {
    var listOwner = this.item.list.owner;
    listOwner && listOwner.moveItem(this.item.index, index);
}


function MLListItem$isDropAllowed(meta/*, dragDrop*/){
    var Component = componentsRegistry.get(meta.compClass);

    return meta.params && meta.params.index
            && (Component == MLListItem || Component.prototype instanceof MLListItem)
            && draggingFromSameList.call(this);
}


function draggingFromSameList(comp) {
    comp = comp || DragDrop.service.getCurrentDragSource();
    try { var sourceList = comp.item.list; } catch(e) {}
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

    if (draggingFromSameList.call(this)){
        if(state.compName == this.name) return;
        var stateIndex = state.facetsStates.item.state.index;
        var isMoveDown = stateIndex < this.item.index;
        var isSamePosition;
        if(isMoveDown) {
            isSamePosition = isAbove && stateIndex + 1 == this.item.index;
            if(isSamePosition) return;
            targetIndex = this.item.index - isAbove;
        }
        else {//move up
            isSamePosition = isBelow && stateIndex - 1 == this.item.index;
            if(isSamePosition) return;
            targetIndex = this.item.index + isBelow;
        }
        listOwner.moveItem(+index, targetIndex, state);
    }
    else {
        targetIndex = this.item.index + isBelow;
        try { var data = state.facetsStates.data.state; } catch(e) {}
        listOwner.data.splice(targetIndex, 0, data);
    }
}


function onDragStart(/*eventType, event*/) {
    DragDrop.service.once('dragdropcompleted', { subscriber: onDragDropCompleted, context: this });
}


function onDragHover(/*eventType, event*/) {
    this.dom.addCssClasses('ml-drag-over');
}


function onDragOut(/*eventType, event*/) {
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

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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
    if (typeof value == 'object')
        this.data._set(value);
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

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , uniqueId = milo.util.uniqueId;


var RADIO_CHANGE_MESSAGE = 'mlradiogroupchange'
    , ELEMENT_NAME_PROPERTY = '_mlRadioGroupElementID'
    , ELEMENT_NAME_PREFIX = 'ml-radio-group-';

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
    var options = this._radioList
        , setResult;
    if (options.length) {
        options.forEach(function(radio) {
            radio.checked = radio.value == value;
            if (radio.checked)
                setResult = value;
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
    var checked = _.find(this._radioList, function(radio) {
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
    if (options.length)
        options.forEach(function(radio) {
            radio.checked = false;
        });

    dispatchChangeMessage.call(this);
    return undefined;
}


/**
 * Manage radio children clicks
 */
function onGroupClick(eventType, event) {
    if (event.target.type == 'radio')
        dispatchChangeMessage.call(this);
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

    var radioEls = this.el.querySelectorAll('input[type="radio"]')
        , options = _.toArray(radioEls);

    this._radioList.length = 0;
    this._radioList.splice.apply(this._radioList, [0, 0].concat(options));
}


function MLRadioGroup$destroy() {
    delete this._radioList;
    Component.prototype.destroy.apply(this, arguments);
}

},{}],17:[function(require,module,exports){
'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components;

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
    if (!this._isMultiple) this.el.value = strOrObj;
    else {
        var valueObj = {};
        if (strOrObj && typeof strOrObj == 'object') valueObj = strOrObj;
        else valueObj[strOrObj] = true;
        _.eachKey(this._optionEls, function (el, key) {
            el.selected = !!valueObj[key];
        });
    }
}


function MLSelect_get() {
    if (!this._isMultiple) return this.el.value;
    else {
        return _.mapKeys(this._optionEls, function (el) {
            return el.selected;
        });
    }
}


function MLSelect_del() {
    if (!this._isMultiple) this.el.value = undefined;
    else {
        _.eachKey(this._optionEls, function (el) {
            el.selected = false;
        });
    }
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

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , doT = milo.util.doT
    , logger = milo.util.logger;

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
            'mouseleave': {subscriber: onMouseLeave, context: 'owner'},
            'mouseover': {subscriber: onMouseOver, context: 'owner'}
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
        _filteredOptionsData: []
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
    var bottomOverlap = (bounds.bottom + this._optionsHeight) - pageHeight;

    if(bottomOverlap > 0) {
        var topOverlap = this._optionsHeight - bounds.top;

        if(topOverlap < bottomOverlap) {
            listTopStyle = - this._optionsHeight + 'px'; // Position options above the combobox
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
 * Component instance method
 * Sets the options of the dropdown
 *
 * @param {Array[Object]} arr the options to set with label and value pairs. Value can be an object.
 */
function MLSuperCombo$setOptions(arr) {
    this._optionsData = arr;
    this.setFilteredOptions(arr);
}


/**
 * Component instance method
 * Initialise the remote options of the dropdown
 *
 * @param {Object} options the options to initialise.
 */
function MLSuperCombo$initOptionsURL(options) {
    this._optionsURL = options.url;
    this._formatOptionsURL = options.formatOptions || function(e){return e;};
}


/**
 * Private method
 * Sets the options of the dropdown based on a request
 */
function _getOptionsURL(cb) {
    var url = this._optionsURL,
        queryString = this._comboInput.data.get();
    var self = this;
    cb = cb || _.noop;
    milo.util.request.post(url, { name: queryString }, function (err, response) {
        if (err) {
            logger.error('Can not search for "' + queryString + '"');
            return cb(new Error('Request error'));
        }

        var responseData = _.jsonParse(response);
        if (responseData) cb(null, responseData);
        else cb(new Error('Data error'));
    });
}


/**
 * Component instance method
 * Sets the filtered options, which is a subset of normal options
 *
 * @param {[type]} arr The options to set
 */
function MLSuperCombo$setFilteredOptions(arr) {
    if (! arr) return logger.error('setFilteredOptions: parameter is undefined');
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

    if (wasHidden)
        this.hideOptions();

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
        'click': {subscriber: onListClick, context: self},
        'scroll': {subscriber: onListScroll, context: self}
    });
}

/**
 * Setup the input component
 *
 * @param  {Component} input
 * @param  {Component} self
 */
function setupComboInput(input, self) {
    input.events.once('focus', function(){
        input.data.on('', { subscriber: onDataChange, context: self });
        input.events.on('click', {subscriber: onInputClick, context: self });
        input.events.on('keydown', {subscriber: onEnterKey, context: self });
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
    _.deferMethod(this, 'hideOptions');
}

/**
 * Custom data facet del method
 */
function MLSuperCombo_del() {
    this._currentValue = null;
    this._comboInput.data.set('');
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
        _getOptionsURL.call(this, function(err, responseData){
            if (err || !responseData) return;
            try {
                var options = responseData.data.map(self._formatOptionsURL);
                self.setOptions(options);
                _updateOptionsAndAddButton.call(self, text, self._optionsData);
            } catch(e) {
                logger.error('Data error', e);
            }
        });
    } else {
        var filteredData = _filterData.call(this, text);
        _updateOptionsAndAddButton.call(this, text, filteredData);
    }
}


function _filterData(text) {
    return this._optionsData.filter(function(option) {
        delete option.selected;
        if (option.label) {
            var label = option.label.toLowerCase();
            return label.trim().toLowerCase().indexOf(text.toLowerCase()) == 0;
        }
    });
}


function _updateOptionsAndAddButton(text, filteredArr) {
    if (!text) {
        this.toggleAddButton(false, { preserveState: true });
    } else {
        if (filteredArr.length && _.find(filteredArr, isExactMatch)) {
            this.toggleAddButton(false, { preserveState: true });
        } else if (this._addItemPrompt) {
            this.toggleAddButton(this._optionsData.length > 1 || this._optionsURL);
        }

        if (filteredArr.length) {
            this.showOptions();
            filteredArr[0].selected = true;
            this._selected = filteredArr[0];
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

    if(direction)
        _changeSelected.call(this, direction);
}

function _changeSelected(direction) {
    // TODO: refactor and tidy up, looks like some code duplication.
    var selected = this.el.querySelectorAll('.selected')[0]
        , scrollPos = this._comboList.el.scrollTop
        , selectedPos = selected ? selected.offsetTop : 0
        , relativePos = selectedPos - scrollPos;

    if (selected) {
        var index = _getDataValueFromElement.call(this, selected)
            , thisItem = this._filteredOptionsData[index]
            , adjItem = this._filteredOptionsData[index + direction];

        if (adjItem) {
            delete thisItem.selected;
            adjItem.selected = true;
            this._selected = adjItem;
            this.update();
        }
    } else {
        if (this._filteredOptionsData[0]) {
            this._filteredOptionsData[0].selected = true;
            this.update();
        }
    }

    if (relativePos > this._optionsHeight - this._elementHeight*2 && direction === 1)
        this._comboList.el.scrollTop += this._elementHeight*direction*5;

    if (relativePos < this._elementHeight && direction === -1)
        this._comboList.el.scrollTop += this._elementHeight*direction*5;
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
    this._mouseOutTimer = setTimeout(function(){
        if (!self._mouseIsOver)
            _onMouseLeave.call(self);
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
        if (this._selected)
            _setData.call(this);
    }
}

/**
 * Add button handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onAddBtn (type, event) {
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
function onListClick (type, event) {
    var index = _getDataValueFromElement.call(this, event.target);
    var data = this._filteredOptionsData[index];

    this._selected = data;
    _setData.call(this);
    this.update();
}


/**
 * List scroll handler
 *
 * @param  {String} type
 * @param  {Event} event
 */
function onListScroll (type, event) {
    var scrollPos = event.target.scrollTop
        , direction = scrollPos > this._lastScrollPos ? 'down' : 'up'
        , firstChild = this._comboOptions.el.lastElementChild
        , lastChild = this._comboOptions.el.firstElementChild
        , lastElPosition = firstChild ? firstChild.offsetTop : 0
        , firstElPosition = lastChild ? lastChild.offsetTop : 0
        , distFromLastEl = lastElPosition - scrollPos - this._optionsHeight + this._elementHeight
        , distFromFirstEl = scrollPos - firstElPosition
        , elsFromStart = Math.floor(distFromFirstEl / this._elementHeight)
        , elsToTheEnd = Math.floor(distFromLastEl / this._elementHeight)
        , totalElementsBefore = Math.floor(scrollPos / this._elementHeight) - BUFFER;

    if ((direction == 'down' && elsToTheEnd < BUFFER)
        || (direction == 'up' && elsFromStart < BUFFER)) {
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
    delete this._selected.selected;
    this.hideOptions();
    this.toggleAddButton(false);
    this._comboInput.data.off('', { subscriber: onDataChange, context: this });
    //supercombo listeners off
    this.data.set(this._selected);
    this.data.dispatchSourceMessage(COMBO_CHANGE_MESSAGE);
    this._comboInput.data.on('', { subscriber: onDataChange, context: this });
    //supercombo listeners on
    this._selected = null;
    this.setFilteredOptions(this._optionsData);
}

},{}],19:[function(require,module,exports){
'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , logger = milo.util.logger;


var MLTextarea = Component.createComponentClass('MLTextarea', {
    data: undefined,
    events: undefined,
    dom: {
        cls: 'ml-ui-textarea'
    }
});

componentsRegistry.add(MLTextarea);

module.exports = MLTextarea;


var SAMPLE_AUTORESIZE_TEXT = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit,';


_.extendProto(MLTextarea, {
    startAutoresize: MLTextarea$startAutoresize,
    stopAutoresize: MLTextarea$stopAutoresize,
    isAutoresized: MLTextarea$isAutoresized,
    disable: MLTextarea$disable
});


function MLTextarea$startAutoresize(options) {
    if (this._autoresize)
        return logger.warn('MLTextarea startAutoresize: autoresize is already on');
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

    var newHeight = this.el.scrollHeight
        , minHeight = this._autoresizeOptions.minHeight
        , maxHeight = this._autoresizeOptions.maxHeight;

    newHeight = newHeight >= maxHeight
                ? maxHeight
                : newHeight <= minHeight
                ? minHeight
                : newHeight;

    this.el.style.height = newHeight + 'px';
}


function MLTextarea$stopAutoresize() {
    if (! this._autoresize)
        return logger.warn('MLTextarea stopAutoresize: autoresize is not on');
    this._autoresize = false;
    _manageSubscriptions.call(this, 'off');
}


function MLTextarea$isAutoresized() {
    return this._autoresize;
}


function MLTextarea$destroy() {
    if (this._autoresize)
        this.stopAutoresize();
    Component.prototype.destroy.apply(this, arguments);
}

function MLTextarea$disable(disable) {
    this.el.disabled = disable;
}
},{}],21:[function(require,module,exports){
'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


var MLTime = Component.createComponentClass('MLTime', {
    events: undefined,
    data: {
        get: MLTime_get,
        set: MLTime_set,
        del: MLTime_del,
    },
    dom: {
        cls: 'ml-ui-time'
    }
});

componentsRegistry.add(MLTime);

module.exports = MLTime;


var TIME_REGEX = /^([0-9]{1,2})(?:\:|\.)([0-9]{1,2})$/
    , TIME_TEMPLATE = 'hh:mm';

function MLTime_get() {
    var timeStr = this.el.value;
    var match = timeStr.match(TIME_REGEX);
    if (! match) return;
    var hours = match[1]
        , mins = match[2];
    if (hours > 23 || mins > 59) return;
    var time = new Date(1970, 0, 1, hours, mins);

    return _.toDate(time);
}


function MLTime_set(value) {
    var time = _.toDate(value);
    if (! time) {
        this.el.value = '';
        return;
    }

    var timeStr = TIME_TEMPLATE
            .replace('hh', pad(time.getHours()))
            .replace('mm', pad(time.getMinutes()));

    this.el.value = timeStr;
    return timeStr;

    function pad(n) {return n < 10 ? '0' + n : n; }
}


function MLTime_del() {
    this.el.value = '';
}

},{}],22:[function(require,module,exports){
'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components;


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

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , componentName = milo.util.componentName
    , logger = milo.util.logger
    , check = milo.util.check
    , Match = check.Match;


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
    openAlert: MLAlert$$openAlert,
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

    if (options.close)
        alertScope.closeBtn.events.on('click',
            { subscriber: _onCloseBtnClick, context: alert });

    if (options.timeout)
        var timer = setTimeout(function(){
            if(alert._alert.visible)
                alert.closeAlert();
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
    doShow = typeof doShow == 'undefined'
                ? ! this._alert.visible
                : !! doShow;

    var addRemove = doShow ? 'add' : 'remove'
        , appendRemove = doShow ? 'appendChild' : 'removeChild';

    this._alert.visible = doShow;

    document.body[appendRemove](this.el);
    this.dom.toggle(doShow);
    this.el.setAttribute('aria-hidden', !doShow);
    this.el.classList[addRemove]('in');
    this.el[doShow ? 'focus' : 'blur']();
}

},{}],24:[function(require,module,exports){
'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , componentName = milo.util.componentName
    , logger = milo.util.logger
    , check = milo.util.check
    , Match = check.Match;


var DEFAULT_BUTTONS = [ { type: 'default', label: 'OK', result: 'OK' } ];

var CLOSE_OPTIONS = ['backdrop', 'keyboard', 'button'];

var BUTTON_CSS_CLASSES = { // TODO - use in template
    default: 'btn-default',
    primary: 'btn-primary',
    success: 'btn-success',
    info: 'btn-info',
    warning: 'btn-warning',
    danger: 'btn-danger',
    link: 'btn-link'
};


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
        buttons: Match.Optional([ {
            name: Match.Optional(String),
            type: String,
            label: String,
            close: Match.Optional(Boolean),
            result: Match.Optional(String),
            data: Match.Optional(Match.Any),
            cls: Match.Optional(String)
        } ]),
        cssClass: Match.Optional(String)
    });

    var dialog = MLDialog.createOnElement();

    options = _prepareOptions(options);
    dialog._dialog = {
        options: options,
        visible: false
    };

    dialog.template
        .render(options)
        .binder();

    var dialogScope = dialog.container.scope;

    if (options.close.backdrop)
        dialog.events.on('click',
            { subscriber: _onBackdropClick, context: dialog });

    if (options.title && options.close.button)
        dialogScope.closeBtn.events.on('click',
            { subscriber: _onCloseBtnClick, context: dialog });

    options.buttons.forEach(function(btn) {
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
    if (button.close !== false)
        _toggleDialog.call(this, false);

    var data = _.result(button.data, this, button);
    _dispatchResult.call(this, button.result, data);
}


function _dispatchResult(result, data) {
    var subscriber = this._dialog.subscriber;
    if (typeof subscriber == 'function')
        subscriber.call(this, result, data);
    else
        subscriber.subscriber.call(subscriber.context, result, data);
}


function _onBackdropClick(eventType, event) {
    if (event.target == this.el)
        this.closeDialog('dismissed');
}


function _onCloseBtnClick() {
    this.closeDialog('closed');
}


function _onKeyDown(event) {
    if (openedDialog
            && openedDialog._dialog.options.close.keyboard
            && event.keyCode == 27) // esc key
        openedDialog.closeDialog('dismissed');
}


function _prepareOptions(options) {
    options = _.clone(options);
    options.buttons = _.clone(options.buttons || DEFAULT_BUTTONS);
    options.buttons.forEach(function(btn) {
        btn.name = btn.name || componentName();
    });

    options.close = typeof options.close == 'undefined' || options.close === true
                        ? _.object(CLOSE_OPTIONS, true)
                        : typeof options.close == 'object'
                            ? _.mapToObject(CLOSE_OPTIONS,
                                function(opt) { return options.close[opt] !== false; })
                            : _.object(CLOSE_OPTIONS, false);

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
    doShow = typeof doShow == 'undefined'
                ? ! this._dialog.visible
                : !! doShow;

    var addRemove = doShow ? 'add' : 'remove'
        , appendRemove = doShow ? 'appendChild' : 'removeChild';

    this._dialog.visible = doShow;

    if (doShow && ! dialogsInitialized)
        _initializeDialogs();

    document.body[appendRemove](this.el);
    if (backdropEl)
        document.body[appendRemove](backdropEl);
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

    if (openedDialog)
        return logger.warn('MLDialog openDialog: can\'t open dialog, another dialog is already open');

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
    if (! openedDialog)
        return logger.warn('MLDialog closeDialog: can\'t close dialog, no dialog open');

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

var Component = milo.Component
    , componentsRegistry = milo.registry.components
    , logger = milo.util.logger
    , DOMListeners = milo.util.domListeners;


var TOGGLE_CSS_CLASS = 'dropdown-toggle'
    , MENU_CSS_CLASS = 'dropdown-menu';


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
    var toggleEl = this.el.querySelector('.' + TOGGLE_CSS_CLASS)
        , menuEl = this.el.querySelector('.' + MENU_CSS_CLASS);

    if (! (toggleEl && menuEl))
        return logger.error('MLDropdown:', TOGGLE_CSS_CLASS, 'or', MENU_CSS_CLASS, 'isn\'t found');

    var doc = window.document
        , clickHandler = this.toggleMenu.bind(this, undefined);

    var listeners = new DOMListeners;
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
        var target = event.target
            , relatedTarget = event.relatedTarget
            , listeners = self._dropdown.listeners;

        if (isIframe(target))
            listeners.remove(target.contentWindow.document, 'click', onClick);

        if (isIframe(relatedTarget))
            listeners.add(relatedTarget.contentWindow.document, 'click', onClick);
    }

    function onClick(event) {
        if (!self.el.contains(event.target))
            self.hideMenu();
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
    doShow = typeof doShow == 'undefined'
                ? ! this._dropdown.visible
                : !! doShow;

    this._dropdown.visible = doShow;

    var menu = this._dropdown.menu;
    menu.style.display = doShow
                            ? 'block'
                            : 'none';
}

},{}],26:[function(require,module,exports){
'use strict';

var formGenerator = require('./generator')
    , Component = milo.Component
    , componentsRegistry = milo.registry.components
    , check = milo.util.check
    , logger = milo.util.logger
    , formRegistry = require('./registry')
    , async = require('async');


var FORM_VALIDATION_FAILED_CSS_CLASS = 'has-error';

/**
 * A component class for generating forms from schema
 * To create form class method [createForm](#MLForm$$createForm) should be used.
 * Form schema has the following format:
 * ```
 * var schema = {
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
        cls: 'cc-module-inspector'
    },
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
    destroy: MLForm$destroy,
});


var SCHEMA_KEYWORDS = _.object([
    'type', 'compName', 'label', 'altText',
    'modelPath', 'modelPattern', 'notInModel',
    'messages', 'translate', 'validate', 'items',
    'selectOptions', 'radioOptions', 'comboOptions',
    'comboOptionsURL', 'addItemPrompt', 'placeHolder',
    'value', 'dataValidation', 'asyncHandler', 'autoresize',
    'maxLength'
], true);

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
    var form = _createFormComponent();
    _.defineProperty(form, '_hostObject', hostObject);
    var formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations;
    _processFormSchema();
    _connectFormDataToModel();
    _manageFormValidation();

    // set original form data
    if (formData)
        form.model.m.set(formData);

    return form;


    function _createFormComponent() {
        template = template || formGenerator(schema);
        return MLForm.createOnElement(undefined, template);
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
            throw (e);
        }

        form._formViewPaths = formViewPaths;
        form._formModelPaths = formModelPaths;
        form._modelPathTranslations = modelPathTranslations;
        form._dataTranslations = dataTranslations;
        form._dataValidations = dataValidations;
    }

    function _connectFormDataToModel() {
        // connect form view to form model using translation rules from modelPath properties of form items
        form._connector = milo.minder(form.data, '<->', form.model, { // connection depth is defined on field by field basis by pathTranslation
            pathTranslation: modelPathTranslations,
            dataTranslation: {
                '<-': dataTranslations.fromModel,
                '->': dataTranslations.toModel
            },
            dataValidation: {
                '<-': dataValidations.fromModel,
                '->': dataValidations.toModel
            }
        });
    }

    function _manageFormValidation() {
        form._invalidFormControls = {};

        form.model.on('validated', createOnValidated(true));
        form.data.on('validated', createOnValidated(false));

        function createOnValidated(isFromModel) {
            var pathCompMethod = isFromModel ? 'modelPathComponent': 'viewPathComponent'
                , pathSchemaMethod = isFromModel ? 'modelPathSchema': 'viewPathSchema';

            return function(msg, response) {
                var component = form[pathCompMethod](response.path)
                    , schema = form[pathSchemaMethod](response.path)
                    , label = schema.label
                    , modelPath = schema.modelPath;

                if (component) {
                    var parentEl = component.el.parentNode;
                    parentEl.classList.toggle(FORM_VALIDATION_FAILED_CSS_CLASS, ! response.valid);

                    var reason;
                    if (response.valid)
                        delete form._invalidFormControls[modelPath];
                    else {
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
                } else
                    logger.error('Form: component for path ' + response.path + ' not found');
            };
        }
    }
}


/**
 * Custom schema keywords
 */
var schemaKeywordsRegistry = {};
function MLForm$$registerSchemaKey(keyword, processKeywordFunc, replaceKeyword) {
    if (SCHEMA_KEYWORDS[keyword])
        throw new Error('Keyword', keyword, 'is used by MLForm class or one of pre-registered form items and cannot be overridden');

    if (!replaceKeyword && schemaKeywordsRegistry[keyword])
        throw new Error('Keyword', keyword, 'is already registered. Pass true as the third parameter to replace it');

    schemaKeywordsRegistry[keyword] = processKeywordFunc;
}


/**
 * Predefined form validation functions
 */
var validationFunctions = {
    'required': validateRequired
};
function MLForm$$registerValidation(name, func, replaceFunc) {
    if (!replaceFunc && validationFunctions[name])
        throw new Error('Validating function', name, 'is already registered. Pass true as the third parameter to replace it');

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
    var validations = []
        , self = this;

    _.eachKey(this._dataValidations.fromModel, function(validators, modelPath) {
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
    async.each(validations,
        function(validation, nextValidation) {
            var lastResponse;
            async.every(validation.validators,
                // call validator
                function(validator, next) {
                    validator(validation.data, function(err, response) {
                        lastResponse = response || {};
                        next(lastResponse.valid || err);
                    });
                },
            // post validation result of item to form
            function(valid) {
                lastResponse.path = validation.modelPath;
                lastResponse.valid = valid;
                self.model.postMessage('validated', lastResponse);
                if (!valid) allValid = false;
                nextValidation(null);
            });
        },
    // post form validation result
    function(err) {
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
    var reasons = _.reduceKeys(invalidControls,
        function(memo, invalidControl, compName) {
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
    return reasons.reduce(function(memo, reason) {
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
    return _.findKey(this._modelPathTranslations, function(mPath, vPath) {
        return mPath == modelPath;
    });
}


function MLForm$destroy() {
    Component.prototype.destroy.apply(this, arguments);
    this._connector && milo.minder.destroyConnector(this._connector);
    this._connector = null;
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

function doNothing() {}


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

    if (schema.items)
        _processSchemaItems.call(this, comp, schema.items, viewPath, formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations);

    if (schema.messages)
        _processSchemaMessages.call(this, comp, schema.messages);

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
        } else
            throw new Error('unknown item type ' + schema.type);
    }

    for (var keyword in schemaKeywordsRegistry) {
        if (schema.hasOwnProperty(keyword)) {
            var processKeywordFunc = schemaKeywordsRegistry[keyword];
            processKeywordFunc(hostObject, comp, schema);
        }
    }

    return modelPathTranslations;


    function _processItemTranslations(viewPath, schema) {
        var modelPath = schema.modelPath
            , modelPattern = schema.modelPattern || ''
            , notInModel = schema.notInModel
            , translate = schema.translate
            , validate = schema.validate;

        if (viewPath) {
            _addDataTranslation.call(this, translate, 'toModel', viewPath);

            switch (itemRule.modelPathRule) {
                case 'prohibited':
                    if (modelPath)
                        throw new Error('modelPath is prohibited for item type ' + schema.type);
                    break;
                case 'required':
                    if (! (modelPath || notInModel))
                        throw new Error('modelPath is required for item type ' + schema.type + ' . Add "notInModel: true" to override');
                    // falling through to 'optional'
                case 'optional':
                    if (modelPath) {
                        formModelPaths[modelPath] = {
                            schema: schema,
                            component: comp
                        };

                        if (! notInModel) {
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
        if (viewPath in modelPathTranslations)
            throw new Error('duplicate view path ' + viewPath);
        else if (_.keyOf(modelPathTranslations, modelPath))
            throw new Error('duplicate model path ' + modelPath + ' for view path ' + viewPath);
        else
            modelPathTranslations[viewPath + pathPattern] = modelPath + pathPattern;
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
        if (! validators) return;

        var form = this;
        var formValidators = dataValidations[direction][path] = [];

        if (Array.isArray(validators))
            validators.forEach(_addValidatorFunc);
        else
            _addValidatorFunc(validators);

        function _addValidatorFunc(validator) {
            if (typeof validator == 'string')
                var valFunc = getValidatorFunction(validator);
            else if (validator instanceof RegExp)
                valFunc = makeRegexValidator(validator);
            else if (typeof validator == 'function')
                valFunc = validator;
            else
                throw new Error(direction + ' validator for ' + path + ' should be function or string');

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
    if (! valFunc)
        throw new Error('Form: unknown validator function name ' + validatorName);
    return valFunc;
}


function makeRegexValidator(validatorRegExp) {
    return function (data, callback) {
        var valid = validatorRegExp.test(data)
            , response = MLForm$$validatorResponse(valid, 'should match pattern');
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
    if (! comp.container)
        return logger.warn('Form Warning: schema has items but component has no container facet');

    items.forEach(function(item) {
        if (!item.compName) return; // No component, only markup

        var itemComp = comp.container.scope[item.compName]
            , compViewPath = viewPath + '.' + item.compName;
        if (! itemComp)
            throw new Error('component "' + item.compName + '" is not in scope (or subscope) of form');
        processSchema.call(this, itemComp, item, compViewPath, formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations);
    }, this);
}


/**
 * Subscribes to messages on facets of items' component as defined in schema
 */
function _processSchemaMessages(comp, messages) {
    var form = this;
    _.eachKey(messages, function(facetMessages, facetName) {
        var facet = comp[facetName];
        if (! facet)
            throw new Error('schema has subscriptions for facet "' + facetName + '" of form component "' + comp.name + '", but component has no facet');
        facetMessages = _.clone(facetMessages);
        _.eachKey(facetMessages, function(subscriber, messageType) {
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
    if (context == 'form')
        context = this;
    else if (context == 'host')
        context = this.getHostObject();

    if (context && typeof context != 'object')
        throw new Error('Invalid context supplied - Expected {String} [host,form], or {Object}');

    return context;
}


/**
 * Validation functions
 */
function validateRequired(data, callback) {
    var valid = typeof data != 'undefined'
                && (typeof data != 'string' || data.trim() != '');
    var response = MLForm$$validatorResponse(valid, 'please enter a value', 'REQUIRED');
    callback(null, response);
}


function MLForm$$validatorResponse(valid, reason, reasonCode) {
    return valid
            ? { valid: true }
            : { valid: false, reason: reason, reasonCode: reasonCode };
}

},{"./generator":27,"./registry":29,"async":32}],27:[function(require,module,exports){
'use strict';

var doT = milo.util.doT
    , fs = require('fs')
    , componentsRegistry = milo.registry.components
    , miloCount = milo.util.count
    , componentName = milo.util.componentName
    , formRegistry = require('./registry')
    , itemTypes = require('./item_types');

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
            }
        }

        item.compName = itemType.CompClass ? item.compName || componentName() : null;

        var domFacetConfig = itemType.CompClass && itemType.CompClass.getFacetConfig('dom')
            , tagName = domFacetConfig && domFacetConfig.tagName || 'div';

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


var fs = require('fs')
    , formRegistry = require('./registry');


var group_dot = "<div ml-bind=\"MLGroup:{{= it.compName }}\"{{? it.item.wrapCssClass}} class=\"{{= it.item.wrapCssClass }}\"{{?}}>\n    {{# def.partials.label }}\n    {{= it.formGenerator(it.item) }}\n</div>\n"
    , wrapper_dot = "<span ml-bind=\"MLWrapper:{{= it.compName }}\"{{? it.item.wrapCssClass}} class=\"{{= it.item.wrapCssClass }}\"{{?}}>\n    {{= it.formGenerator(it.item) }}\n</span>\n"
    , select_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <span class=\"custom-select\">\n        <select ml-bind=\"MLSelect:{{= it.compName }}\"\n                {{? it.disabled }}disabled {{?}}\n                {{? it.multiple }}multiple {{?}}\n                class=\"form-control\">\n        </select>\n    </span>\n</div>\n"
    , input_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <input type=\"{{= it.item.inputType || 'text' }}\"\n            {{? it.item.inputName }}name=\"{{= it.item.inputName }}\"{{?}}\n            ml-bind=\"MLInput:{{= it.compName }}\"\n            {{? it.item.placeholder }}placeholder=\"{{= it.item.placeholder}}\"{{?}}\n            {{? it.disabled }}disabled {{?}}\n            class=\"form-control\">\n</div>\n"
    , textarea_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <textarea ml-bind=\"MLTextarea:{{= it.compName }}\"\n        {{? it.disabled }}disabled {{?}}\n        class=\"form-control\"\n        {{? it.item.placeholder }}placeholder=\"{{= it.item.placeholder}}\"{{?}}\n        {{? it.item.autoresize }}rows=\"{{= it.item.autoresize.minLines }}\"{{?}}></textarea>\n</div>"
    , button_dot = "<div {{? it.item.altText }}title=\"{{= it.item.altText}}\" {{?}}class=\"btn-toolbar{{? it.item.wrapCssClass}} {{= it.item.wrapCssClass }}{{?}}\">\n    <button ml-bind=\"MLButton:{{= it.compName }}\"\n        {{? it.disabled }}disabled {{?}}\n        class=\"btn btn-default {{? it.item.itemCssClass}} {{= it.item.itemCssClass }}{{?}}\">\n        {{= it.item.label || '' }}\n    </button>\n</div>\n"
    , hyperlink_dot = "{{# def.partials.formGroup }}\n    <a {{? it.item.href}}href=\"{{= it.item.href }}\"{{?}}\n        {{? it.item.target}}target=\"{{= it.item.target }}\"{{?}}   \n        ml-bind=\"MLHyperlink:{{= it.compName }}\" \n        class=\"hyperlink hyperlink-default\">\n        {{= it.item.label || '' }}\n    </a>\n</div>"
    , checkbox_dot = "{{# def.partials.formGroup }}\n  <input type=\"checkbox\"\n    id=\"{{= it.compName }}\"\n    ml-bind=\"MLInput:{{= it.compName }}\"\n    {{? it.disabled }}disabled {{?}}\n    class=\"{{= it.item.itemCssClass || ''}}\">\n  <label for=\"{{= it.compName }}\">{{= it.item.label}}</label>\n</div>\n"
    , list_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <ul ml-bind=\"MLList:{{= it.compName }}\"\n            {{? it.disabled }}disabled {{?}}>\n        <li ml-bind=\"MLListItem:itemSample\" class=\"list-item\">\n            <span ml-bind=\"[data]:label\"></span>\n            {{? it.editBtn }}<button ml-bind=\"[events]:editBtn\">edit</button>{{?}}\n            <button ml-bind=\"[events]:deleteBtn\" class=\"btn btn-default glyphicon glyphicon-remove\"> </button>\n        </li>\n    </ul>\n</div>\n"
    , time_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <input type=\"time\"\n            ml-bind=\"MLTime:{{= it.compName }}\"\n            class=\"form-control\">\n</div>"
    , date_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <input type=\"date\"\n            ml-bind=\"MLDate:{{= it.compName }}\"\n            class=\"form-control\">\n</div>"
    , combo_dot = "<div ml-bind=\"MLCombo:{{= it.compName }}\" class=\"form-group{{? it.item.wrapCssClass}} {{= it.item.wrapCssClass }}{{?}}\">\n    {{# def.partials.label }}\n    {{ var listID = 'ml-combo-datalist-' + it.miloCount(); }}\n    <input ml-bind=\"[data, events]:input\"\n            name=\"{{= listID }}\"\n            list=\"{{= listID }}\"\n            {{? it.disabled }}disabled {{?}}\n            class=\"form-control\">\n    <datalist id=\"{{= listID }}\" ml-bind=\"[template]:datalist\"></datalist>\n</div>"
    , image_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n    <img {{? it.item.src }}src=\"{{= it.item.src }}\"{{?}}\n        ml-bind=\"MLImage:{{= it.compName }}\"\n        {{? it.item.width }}width=\"{{= it.item.width }}\"{{?}}\n        {{? it.item.height }}height=\"{{= it.item.height }}\"{{?}}>\n</div>\n"
    , droptarget_dot = "{{# def.partials.formGroup }}\n    {{# def.partials.label }}\n        <img {{? it.item.src }}src=\"{{= it.item.src }}\"{{?}}\n            ml-bind=\"MLDropTarget:{{= it.compName }}\"\n            {{? it.item.width }}width=\"{{= it.item.width }}\"{{?}}\n            {{? it.item.height }}height=\"{{= it.item.height }}\"{{?}}>\n</div>\n"
    , text_dot = "{{var tagName = it.item.tagName || 'span';}}\n<{{=tagName}} ml-bind=\"MLText:{{= it.compName }}\"{{? it.item.wrapCssClass}} class=\"{{= it.item.wrapCssClass }}\"{{?}}>\n    {{? it.item.label }}\n        {{= it.item.label}}\n    {{?}}\n</{{=tagName}}>\n"
    , clear_dot = '<div class="cc-clear"></div>';


formRegistry.add('group',                 { compClass: 'MLGroup',                 template: group_dot,                 modelPathRule: 'prohibited'                                           });
formRegistry.add('wrapper',               { compClass: 'MLWrapper',               template: wrapper_dot,               modelPathRule: 'prohibited'                                           });
formRegistry.add('select',                { compClass: 'MLSelect',                template: select_dot,                                             itemFunction: processSelectSchema        });
formRegistry.add('input',                 { compClass: 'MLInput',                 template: input_dot,                                              itemFunction: processInputSchema         });
formRegistry.add('inputlist',             { compClass: 'MLInputList',                                                                               itemFunction: processInputListSchema     });
formRegistry.add('textarea',              { compClass: 'MLTextarea',              template: textarea_dot,                                           itemFunction: processTextareaSchema      });
formRegistry.add('button',                { compClass: 'MLButton',                template: button_dot,                modelPathRule: 'optional'                                             });
formRegistry.add('radio',                 { compClass: 'MLRadioGroup',                                                                              itemFunction: processRadioSchema         });
formRegistry.add('checkgroup',            { compClass: 'MLCheckGroup',                                                                              itemFunction: processCheckGroupSchema         });
formRegistry.add('hyperlink',             { compClass: 'MLHyperlink',             template: hyperlink_dot,             modelPathRule: 'optional'                                             });
formRegistry.add('checkbox',              { compClass: 'MLInput',                 template: checkbox_dot                                                                                     });
formRegistry.add('list',                  { compClass: 'MLList',                  template: list_dot                                                                                         });
formRegistry.add('time',                  { compClass: 'MLTime',                  template: time_dot,                                               itemFunction: setValue                   });
formRegistry.add('date',                  { compClass: 'MLDate',                  template: date_dot                                                                                         });
formRegistry.add('combo',                 { compClass: 'MLCombo',                 template: combo_dot,                                              itemFunction: processComboSchema         });
formRegistry.add('supercombo',            { compClass: 'MLSuperCombo',                                                                              itemFunction: processSuperComboSchema    });
formRegistry.add('combolist',             { compClass: 'MLComboList',                                                                               itemFunction: processComboListSchema     });
formRegistry.add('image',                 { compClass: 'MLImage',                 template: image_dot                                                                                        });
formRegistry.add('droptarget',            { compClass: 'MLDropTarget',            template: droptarget_dot,            modelPathRule: 'prohibited'                                           });
formRegistry.add('text',                  { compClass: 'MLText',                  template: text_dot,                  modelPathRule: 'optional'                                             });
formRegistry.add('clear',                 {                                       template: clear_dot                                                                                        });


function setValue(comp, schema) {
    var options = schema.selectOptions;
    if (schema.hasOwnProperty('value')) {
        comp.data.set(schema.value);
    }
}

function processSelectSchema(comp, schema) {
    var options = schema.selectOptions;
    setComponentOptions(comp, options, setComponentModel);
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
    var options = schema.comboOptions
        , optionsURL = schema.comboOptionsURL
        , addItemPrompt = schema.addItemPrompt
        , placeHolder = schema.placeHolder;

    _.deferTicks(function() {
        if (addItemPrompt) comp.setAddItemPrompt(addItemPrompt);
        if (placeHolder) comp.setPlaceholder(placeHolder);
        setComponentOptions(comp, options, setComboOptions);
        if(optionsURL)
            comp.initOptionsURL(optionsURL);
    }, 2);
}


function processComboListSchema(comp, schema) {
    var options = schema.comboOptions
        , addItemPrompt = schema.addItemPrompt
        , placeHolder = schema.placeHolder;

    _.deferTicks(function() {
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
    if (schema.autoresize)
        _.deferMethod(comp, 'startAutoresize', schema.autoresize);
}


function processInputSchema(comp, schema) {
    if (_.isNumeric(schema.maxLength)) comp.setMaxLength(schema.maxLength);
}

function setComponentOptions(comp, options, setModelFunc) {
    if (options) {
        if (typeof options.then == 'function') {
            setModelFunc(comp, [{ value: 0, label: 'loading...' }]);
            options
                .then(
                    function(data) { setModelFunc(comp, data); },
                    function() { setModelFunc(comp, [{ value: 0, label: 'loading error' }]); }
                );
        } else
            setModelFunc(comp, options);
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


function processSchema(comp, schema) {
    comp.processFormSchema(schema);
}

},{"./registry":29,"fs":33}],29:[function(require,module,exports){
'use strict';

var logger = milo.util.logger
    , check = milo.util.check
    , Component = milo.Component
    , Match = check.Match;

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

    if (!formItem) 
        return logger.error('Form item ' + name + ' not registered');

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

    if (name && formTypes[name]) 
        return logger.error('Form item ' + name + ' already registered');

    formTypes[name] = formItem;
    return true;
}

function registry_setDefaults(newDefaults) {
    check(defaults, Object);
    defaults = newDefaults;
}


},{}],30:[function(require,module,exports){
'use strict';

if (!(window.milo && window.milo.milo_version))
    throw new Error('milo is not available');

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

    function _each(coll, iterator) {
        return _isArrayLike(coll) ?
            _arrayEach(coll, iterator) :
            _forEachOf(coll, iterator);
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
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
            if (err) {
                callback(err);
            }
            else {
                completed += 1;
                if (completed >= size) {
                    callback(null);
                }
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
                            async.nextTick(iterate);
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
        var results = [];
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
            callback(err || null, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
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

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

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
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
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
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
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
                    callback(null);
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
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
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
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
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
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
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
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9CdXR0b24uanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvQ2hlY2tHcm91cC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21iby5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21ib0xpc3QuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvRGF0ZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Ecm9wVGFyZ2V0LmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0ZvbGRUcmVlLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0dyb3VwLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0h5cGVybGluay5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbWFnZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dExpc3QuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvTGlzdC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbVNpbXBsZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9SYWRpb0dyb3VwLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1NlbGVjdC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9TdXBlckNvbWJvLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1RleHQuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGV4dGFyZWEuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGltZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9XcmFwcGVyLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9BbGVydC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9ib290c3RyYXAvRGlhbG9nLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bi5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvZm9ybXMvRm9ybS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvZm9ybXMvZ2VuZXJhdG9yLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9mb3Jtcy9pdGVtX3R5cGVzLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9mb3Jtcy9yZWdpc3RyeS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvbWlsby11aS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvdXNlX2NvbXBvbmVudHMuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbm9kZV9tb2R1bGVzL2FzeW5jL2xpYi9hc3luYy5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2ZzLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaG9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzF3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxCdXR0b24gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQnV0dG9uJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1idXR0b24nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxCdXR0b24pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQnV0dG9uO1xuXG5fLmV4dGVuZFByb3RvKE1MQnV0dG9uLCB7XG4gICAgZGlzYWJsZTogTUxCdXR0b24kZGlzYWJsZSxcbiAgICBpc0Rpc2FibGVkOiBNTEJ1dHRvbiRpc0Rpc2FibGVkXG59KTtcblxuXG5mdW5jdGlvbiBNTEJ1dHRvbiRkaXNhYmxlKGRpc2FibGUpIHtcbiAgICB0aGlzLmVsLmRpc2FibGVkID0gZGlzYWJsZTtcbn1cblxuZnVuY3Rpb24gTUxCdXR0b24kaXNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLmVsLmRpc2FibGVkO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCB1bmlxdWVJZCA9IG1pbG8udXRpbC51bmlxdWVJZDtcblxuXG52YXIgQ0hFQ0tFRF9DSEFOR0VfTUVTU0FHRSA9ICdtbGNoZWNrZ3JvdXBjaGFuZ2UnXG4gICAgLCBFTEVNRU5UX05BTUVfUFJPUEVSVFkgPSAnX21sQ2hlY2tHcm91cEVsZW1lbnRJRCdcbiAgICAsIEVMRU1FTlRfTkFNRV9QUkVGSVggPSAnbWwtY2hlY2stZ3JvdXAtJztcblxudmFyIE1MQ2hlY2tHcm91cCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxDaGVja0dyb3VwJywge1xuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTENoZWNrR3JvdXBfc2V0LFxuICAgICAgICBnZXQ6IE1MQ2hlY2tHcm91cF9nZXQsXG4gICAgICAgIGRlbDogTUxDaGVja0dyb3VwX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBDSEVDS0VEX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnY2xpY2snOiB7IHN1YnNjcmliZXI6IG9uR3JvdXBDbGljaywgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1jaGVjay1ncm91cCdcbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAgJ3t7fiBpdC5jaGVja09wdGlvbnMgOm9wdGlvbiB9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAge3sjI2RlZi5lbElEOnt7PSBpdC5lbGVtZW50TmFtZSB9fS17ez0gb3B0aW9uLnZhbHVlIH19I319IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInt7PSBpdC5fcmVuZGVyT3B0aW9ucy5vcHRpb25Dc3NDbGFzcyB8fCBcIicgKyBFTEVNRU5UX05BTUVfUFJFRklYICsgJ29wdGlvblwiIH19XCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwie3sjIGRlZi5lbElEIH19XCIgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCJ7ez0gb3B0aW9uLnZhbHVlIH19XCIgbmFtZT1cInt7PSBpdC5lbGVtZW50TmFtZSB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ7eyMgZGVmLmVsSUQgfX1cIj57ez0gb3B0aW9uLmxhYmVsIH19PC9sYWJlbD4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcbiAgICAgICAgICAgICAgICAgICAge3t+fX0gXFxcbiAgICAgICAgICAgICAgICAgICAge3s/aXQuX3JlbmRlck9wdGlvbnMuc2VsZWN0QWxsfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7IyNkZWYuYWxsSUQ6e3s9IGl0LmVsZW1lbnROYW1lIH19LWFsbCN9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCInICsgRUxFTUVOVF9OQU1FX1BSRUZJWCArICdhbGxcIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJ7eyMgZGVmLmFsbElEIH19XCIgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCJhbGxcIiBuYW1lPVwiYWxsXCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInt7IyBkZWYuYWxsSUQgfX1cIj5BbGw8L2xhYmVsPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiBcXFxuICAgICAgICAgICAgICAgICAgICB7ez99fSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTENoZWNrR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQ2hlY2tHcm91cDtcblxuXG5fLmV4dGVuZFByb3RvKE1MQ2hlY2tHcm91cCwge1xuICAgIGluaXQ6IE1MQ2hlY2tHcm91cCRpbml0LFxuICAgIGRlc3Ryb3k6IE1MQ2hlY2tHcm91cCRkZXN0cm95LFxuICAgIHNldFNlbGVjdEFsbDogTUxDaGVja0dyb3VwJHNldFNlbGVjdEFsbFxufSk7XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXplIHJhZGlvIGdyb3VwIGFuZCBzZXR1cFxuICovXG5mdW5jdGlvbiBNTENoZWNrR3JvdXAkaW5pdCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnR5KHRoaXMsIEVMRU1FTlRfTkFNRV9QUk9QRVJUWSwgRUxFTUVOVF9OQU1FX1BSRUZJWCArIHVuaXF1ZUlkKCkpO1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMgPSB7fTtcbiAgICB0aGlzLl9jaGVja0VscyA9IHt9O1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cCRzZXRTZWxlY3RBbGwoc2VsZWN0QWxsKSB7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucy5zZWxlY3RBbGwgPSBzZWxlY3RBbGw7XG59XG5cblxuLyoqXG4gKiBTZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXBsYWNlcyB0aGUgZGF0YSBzZXQgb3BlcmF0aW9uIHRvIGRlYWwgd2l0aCByYWRpbyBidXR0b25zXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGJlIHNldFxuICovXG5mdW5jdGlvbiBNTENoZWNrR3JvdXBfc2V0KHZhbHVlT2JqKSB7XG4gICAgXy5lYWNoS2V5KHRoaXMuX2NoZWNrRWxzLCBmdW5jdGlvbiAoZWwsIGtleSkge1xuICAgICAgICBlbC5jaGVja2VkID0gISF2YWx1ZU9ialtrZXldO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogR2V0cyBncm91cCB2YWx1ZVxuICogUmV0cmlldmVzIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiB0aGUgZ3JvdXBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cF9nZXQoKSB7XG4gICAgcmV0dXJuIF8ubWFwS2V5cyh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHJldHVybiBlbC5jaGVja2VkO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogRGVsZXRlZCBncm91cCB2YWx1ZVxuICogRGVsZXRlcyB0aGUgdmFsdWUgb2YgdGhlIGdyb3VwLCBzZXR0aW5nIGl0IHRvIGVtcHR5XG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cF9kZWwoKSB7XG4gICAgXy5lYWNoS2V5KHRoaXMuX29wdGlvbkVscywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5cbi8qKlxuICogTWFuYWdlIHJhZGlvIGNoaWxkcmVuIGNsaWNrc1xuICovXG5mdW5jdGlvbiBvbkdyb3VwQ2xpY2soZXZlbnRUeXBlLCBldmVudCkge1xuICAgIHZhciBjbGlja2VkRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICB2YXIgY2hlY2tib3hMaXN0ID0gdGhpcy5jb250YWluZXIuc2NvcGUuY2hlY2tib3hMaXN0O1xuXG4gICAgaWYgKGNsaWNrZWRFbGVtZW50LnR5cGUgIT09ICdjaGVja2JveCcpIHJldHVybjtcblxuICAgIGlmIChjbGlja2VkRWxlbWVudC5uYW1lID09PSAnYWxsJykge1xuICAgICAgICBfLmVhY2hLZXkodGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCwga2V5KSB7XG4gICAgICAgICAgICBlbC5jaGVja2VkID0gY2xpY2tlZEVsZW1lbnQuY2hlY2tlZDtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGlzQ2hlY2tlZCA9IGNsaWNrZWRFbGVtZW50LmNoZWNrZWQgJiYgaXNBbGxFbGVtZW50Q2hlY2tlZC5jYWxsKHRoaXMpO1xuICAgICAgICBzZXRBbGxDaGVja2VkLmNhbGwodGhpcywgaXNDaGVja2VkKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gc2V0QWxsQ2hlY2tlZChjaGVja2VkKSB7XG4gICAgaWYgKHRoaXMuX3JlbmRlck9wdGlvbnMuc2VsZWN0QWxsKVxuICAgICAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJhbGxcIl0nKS5jaGVja2VkID0gY2hlY2tlZDtcbn1cblxuZnVuY3Rpb24gaXNBbGxFbGVtZW50Q2hlY2tlZChkYXRhKSB7XG4gICAgcmV0dXJuIF8uZXZlcnlLZXkodGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCkgeyByZXR1cm4gZWwuY2hlY2tlZDsgfSk7XG59XG5cbi8vIFBvc3QgdGhlIGRhdGEgY2hhbmdlXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDSEVDS0VEX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuXG4vLyBTZXQgcmFkaW8gYnV0dG9uIGNoaWxkcmVuIG9uIG1vZGVsIGNoYW5nZVxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcih7XG4gICAgICAgIGNoZWNrT3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKSxcbiAgICAgICAgZWxlbWVudE5hbWU6IHRoaXNbRUxFTUVOVF9OQU1FX1BST1BFUlRZXSxcbiAgICAgICAgX3JlbmRlck9wdGlvbnM6IHRoaXMuX3JlbmRlck9wdGlvbnNcbiAgICB9KTtcblxuICAgIHRoaXMuX2NoZWNrRWxzID0ge307XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIF8uZm9yRWFjaCh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgaWYgKGVsLm5hbWUgIT0gJ2FsbCcpIHNlbGYuX2NoZWNrRWxzW2VsLnZhbHVlXSA9IGVsO1xuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cCRkZXN0cm95KCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jaGVja0VscztcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIENPTUJPX0NIQU5HRV9NRVNTQUdFID0gJ21sY29tYm9jaGFuZ2UnO1xuXG52YXIgREFUQUxJU1RfVEVNUExBVEUgPSAne3t+IGl0LmNvbWJvT3B0aW9ucyA6b3B0aW9uIH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInt7PSBvcHRpb24ubGFiZWwgfX1cIj48L29wdGlvbj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICB7e359fSc7XG5cbnZhciBNTENvbWJvID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTENvbWJvJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTENvbWJvX2dldCxcbiAgICAgICAgc2V0OiBNTENvbWJvX3NldCxcbiAgICAgICAgZGVsOiBNTENvbWJvX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBDT01CT19DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKionOiB7IHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1kYXRhbGlzdCdcbiAgICB9LFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkXG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTENvbWJvKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTENvbWJvO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxDb21ibywge1xuICAgIGluaXQ6IE1MQ29tYm8kaW5pdFxufSk7XG5cblxuZnVuY3Rpb24gTUxDb21ibyRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub24oJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgJ19jb21ib0lucHV0JzogdGhpcy5jb250YWluZXIuc2NvcGUuaW5wdXQsXG4gICAgICAgICdfY29tYm9MaXN0JzogdGhpcy5jb250YWluZXIuc2NvcGUuZGF0YWxpc3RcbiAgICB9KTtcblxuICAgIHRoaXMuX2NvbWJvTGlzdC50ZW1wbGF0ZS5zZXQoREFUQUxJU1RfVEVNUExBVEUpO1xuXG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLm9uKCdpbnB1dCcsXG4gICAgICAgIHsgc3Vic2NyaWJlcjogZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvX2dldCgpIHtcbiAgICBpZiAoISB0aGlzLl9jb21ib0lucHV0KSByZXR1cm47XG4gICAgcmV0dXJuIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5nZXQoKTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib19zZXQodmFsdWUpIHtcbiAgICByZXR1cm4gY2hhbmdlQ29tYm9EYXRhLmNhbGwodGhpcywgJ3NldCcsIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib19kZWwoKSB7XG4gICAgcmV0dXJuIGNoYW5nZUNvbWJvRGF0YS5jYWxsKHRoaXMsICdkZWwnLCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUNvbWJvRGF0YShtZXRob2QsIHZhbHVlKSB7XG4gICAgaWYgKCEgdGhpcy5fY29tYm9JbnB1dCkgcmV0dXJuO1xuICAgIHZhciByZXN1bHQgPSB0aGlzLl9jb21ib0lucHV0LmRhdGFbbWV0aG9kXSh2YWx1ZSk7XG4gICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG4vLyBQb3N0IHRoZSBkYXRhIGNoYW5nZVxuZnVuY3Rpb24gZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoQ09NQk9fQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5mdW5jdGlvbiBvbk9wdGlvbnNDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdGhpcy5fY29tYm9MaXN0LnRlbXBsYXRlLnJlbmRlcih7XG4gICAgICAgIGNvbWJvT3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKVxuICAgIH0pO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgY2hlY2sgPSBtaWxvLnV0aWwuY2hlY2tcbiAgICAsIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cbnZhciBDT01CT19MSVNUX0NIQU5HRV9NRVNTQUdFID0gJ21sY29tYm9saXN0Y2hhbmdlJztcblxuXG52YXIgTUxDb21ib0xpc3QgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQ29tYm9MaXN0Jywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1jb21iby1saXN0J1xuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MQ29tYm9MaXN0X2dldCxcbiAgICAgICAgc2V0OiBNTENvbWJvTGlzdF9zZXQsXG4gICAgICAgIGRlbDogTUxDb21ib0xpc3RfZGVsLFxuICAgICAgICBldmVudDogQ09NQk9fTElTVF9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKionOiB7IHN1YnNjcmliZXI6IG9uSXRlbXNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcid9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBtbC1iaW5kPVwiTUxTdXBlckNvbWJvOmNvbWJvXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJNTExpc3Q6bGlzdFwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdEl0ZW06aXRlbVwiIGNsYXNzPVwibGlzdC1pdGVtXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIG1sLWJpbmQ9XCJbZGF0YV06bGFiZWxcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIG1sLWJpbmQ9XCJbZXZlbnRzXTpkZWxldGVCdG5cIiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlXCI+PC9zcGFuPlxcXG4gICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+J1xuICAgIH1cbn0pO1xuXG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxDb21ib0xpc3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQ29tYm9MaXN0O1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxDb21ib0xpc3QsIHtcbiAgICBpbml0OiBNTENvbWJvTGlzdCRpbml0LFxuICAgIHNldE9wdGlvbnM6IE1MQ29tYm9MaXN0JHNldE9wdGlvbnMsXG4gICAgc2V0RGF0YVZhbGlkYXRpb246IE1MQ29tYm9MaXN0JHNldERhdGFWYWxpZGF0aW9uLFxuICAgIHRvZ2dsZUFkZEJ1dHRvbjogTUxDb21ib0xpc3QkdG9nZ2xlQWRkQnV0dG9uLFxuICAgIGRlc3Ryb3k6IE1MQ29tYm9MaXN0JGRlc3Ryb3ksXG4gICAgc2V0QWRkSXRlbVByb21wdDogTUxDb21ib0xpc3Qkc2V0QWRkSXRlbVByb21wdCxcbiAgICBjbGVhckNvbWJvSW5wdXQgOiBNTENvbWJvTGlzdCRjbGVhckNvbWJvSW5wdXRcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5tb2RlbC5zZXQoW10pO1xuICAgIHRoaXMub25jZSgnY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG59XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3Qkc2V0RGF0YVZhbGlkYXRpb24oZGF0YVZhbGlkYXRpb24pIHtcbiAgICBjaGVjayhkYXRhVmFsaWRhdGlvbiwgTWF0Y2guT3B0aW9uYWwoRnVuY3Rpb24pKTtcbiAgICB0aGlzLl9kYXRhVmFsaWRhdGlvbiA9IGRhdGFWYWxpZGF0aW9uO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRzZXRPcHRpb25zKGFycikge1xuICAgIHRoaXMuX2NvbWJvLnNldE9wdGlvbnMoYXJyKTtcbn1cblxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRjbGVhckNvbWJvSW5wdXQgKCkge1xuICAgIHRoaXMuX2NvbWJvLmNsZWFyQ29tYm9JbnB1dCgpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEhpZGVzIGFkZCBidXR0b25cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc2hvd1xuICovXG5mdW5jdGlvbiBNTENvbWJvTGlzdCR0b2dnbGVBZGRCdXR0b24oc2hvdykge1xuICAgIHRoaXMuX2NvbWJvLnRvZ2dsZUFkZEJ1dHRvbihzaG93KTtcbn1cblxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRzZXRBZGRJdGVtUHJvbXB0KHByb21wdCkge1xuICAgdGhpcy5fY29tYm8uc2V0QWRkSXRlbVByb21wdChwcm9tcHQpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JGRlc3Ryb3koKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fY29ubmVjdG9yICYmIG1pbG8ubWluZGVyLmRlc3Ryb3lDb25uZWN0b3IodGhpcy5fY29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xufVxuXG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcigpLmJpbmRlcigpO1xuICAgIGNvbXBvbmVudFNldHVwLmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudFNldHVwKCkge1xuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICdfY29tYm8nOiB0aGlzLmNvbnRhaW5lci5zY29wZS5jb21ibyxcbiAgICAgICAgJ19saXN0JzogdGhpcy5jb250YWluZXIuc2NvcGUubGlzdFxuICAgIH0pO1xuXG4gICAgdGhpcy5fY29ubmVjdG9yID0gbWlsby5taW5kZXIodGhpcy5fbGlzdC5tb2RlbCwgJzw8PC0+Pj4nLCB0aGlzLm1vZGVsKTtcbiAgICB0aGlzLl9jb21iby5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uQ29tYm9DaGFuZ2UsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgdGhpcy5fY29tYm8ub24oJ2FkZGl0ZW0nLCB7IHN1YnNjcmliZXI6IG9uQWRkSXRlbSwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuZnVuY3Rpb24gb25Db21ib0NoYW5nZShtc2csIGRhdGEpIHtcbiAgICBpZiAoZGF0YS5uZXdWYWx1ZSAmJiBydW5EYXRhVmFsaWRhdGlvbi5jYWxsKHRoaXMsIG1zZywgZGF0YSkpXG4gICAgICAgIHRoaXMuX2xpc3QubW9kZWwucHVzaChkYXRhLm5ld1ZhbHVlKTtcbiAgICB0aGlzLl9jb21iby5kYXRhLmRlbCgpO1xuICAgIC8vIGJlY2F1c2Ugb2Ygc3VwZXJjb21ibyBsaXN0ZW5lcnMgb2ZmIHlvdSBoYXZlIHRvIHNldCBfdmFsdWUgZXhwbGljaXRseVxuICAgIHRoaXMuX2NvbWJvLmRhdGEuX3ZhbHVlID0gJyc7XG59XG5cbmZ1bmN0aW9uIHJ1bkRhdGFWYWxpZGF0aW9uKG1zZywgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmFsaWRhdGlvbiBcbiAgICAgICAgPyB0aGlzLl9kYXRhVmFsaWRhdGlvbihtc2csIGRhdGEsIHRoaXMuX2xpc3QubW9kZWwuZ2V0KCkpXG4gICAgICAgIDogdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb25JdGVtc0NoYW5nZShtc2csIGRhdGEpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENPTUJPX0xJU1RfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdF9nZXQoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5tb2RlbC5nZXQoKTtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdvYmplY3QnID8gXy5jbG9uZSh2YWx1ZSkgOiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib0xpc3Rfc2V0KHZhbHVlKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdF9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWwuc2V0KFtdKTtcbn1cblxuXG5mdW5jdGlvbiBvbkFkZEl0ZW0obXNnLCBkYXRhKSB7XG4gICAgdGhpcy5wb3N0TWVzc2FnZSgnYWRkaXRlbScsIGRhdGEpO1xuICAgIHRoaXMuZXZlbnRzLnBvc3RNZXNzYWdlKCdtaWxvX2NvbWJvbGlzdGFkZGl0ZW0nLCBkYXRhKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBNTERhdGUgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRGF0ZScsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxEYXRlX2dldCxcbiAgICAgICAgc2V0OiBNTERhdGVfc2V0LFxuICAgICAgICBkZWw6IE1MRGF0ZV9kZWwsXG4gICAgfSxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktZGF0ZSdcbiAgICB9XG59KTtcblxuXy5leHRlbmRQcm90byhNTERhdGUsIHtcbiAgICBnZXRNaW46IE1MRGF0ZSRnZXRNaW4sXG4gICAgc2V0TWluOiBNTERhdGUkc2V0TWluLFxuICAgIGdldE1heDogTUxEYXRlJGdldE1heCxcbiAgICBzZXRNYXg6IE1MRGF0ZSRzZXRNYXhcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MRGF0ZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEYXRlO1xuXG5cbmZ1bmN0aW9uIE1MRGF0ZSRnZXRNaW4oKSB7XG4gICAgcmV0dXJuIF8uZGF0ZSh0aGlzLmVsLm1pbik7XG59XG5cblxuZnVuY3Rpb24gTUxEYXRlJHNldE1pbih2YWx1ZSkge1xuICAgIHZhciBkYXRlID0gXy50b0RhdGUodmFsdWUpO1xuXG4gICAgdGhpcy5lbC5taW4gPSBkYXRlID8gdG9JU084NjAxRm9ybWF0KGRhdGUpIDogJyc7XG59XG5cblxuZnVuY3Rpb24gTUxEYXRlJGdldE1heCgpIHtcbiAgICByZXR1cm4gXy5kYXRlKHRoaXMuZWwubWF4KTtcbn1cblxuXG5mdW5jdGlvbiBNTERhdGUkc2V0TWF4KHZhbHVlKSB7XG4gICAgdmFyIGRhdGUgPSBfLnRvRGF0ZSh2YWx1ZSk7XG5cbiAgICB0aGlzLmVsLm1heCA9IGRhdGUgPyB0b0lTTzg2MDFGb3JtYXQoZGF0ZSkgOiAnJztcbn1cblxuXG5mdW5jdGlvbiBNTERhdGVfZ2V0KCkge1xuICAgIHJldHVybiBfLnRvRGF0ZSh0aGlzLmVsLnZhbHVlKTtcbn1cblxuXG5mdW5jdGlvbiBNTERhdGVfc2V0KHZhbHVlKSB7XG4gICAgdmFyIGRhdGUgPSBfLnRvRGF0ZSh2YWx1ZSk7XG5cbiAgICB0aGlzLmVsLnZhbHVlID0gZGF0ZSA/IHRvSVNPODYwMUZvcm1hdChkYXRlKSA6ICcnO1xuXG4gICAgZGlzcGF0Y2hJbnB1dE1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gTUxEYXRlX2RlbCgpIHtcbiAgICB0aGlzLmVsLnZhbHVlID0gJyc7XG5cbiAgICBkaXNwYXRjaElucHV0TWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5cbmZ1bmN0aW9uIGRpc3BhdGNoSW5wdXRNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoJ2lucHV0Jyk7IC8vIERpc3BhdGNoIHRoZSAnaW5wdXQnICh1c3VhbGx5IGRpc3BhdGNoZWQgYnkgdGhlIHVuZGVybHlpbmcgPGlucHV0PiBlbGVtZW50KSBldmVudCBzbyB0aGF0IHRoZSBkYXRhIGNoYW5nZSBjYW4gYmUgbGlzdGVuZWQgdG9cbn1cblxuXG5mdW5jdGlvbiB0b0lTTzg2MDFGb3JtYXQoZGF0ZSkge1xuICAgIHZhciBkYXRlQXJyID0gW1xuICAgICAgICBkYXRlLmdldEZ1bGxZZWFyKCksXG4gICAgICAgIHBhZChkYXRlLmdldE1vbnRoKCkgKyAxKSxcbiAgICAgICAgcGFkKGRhdGUuZ2V0RGF0ZSgpKVxuICAgIF07XG5cbiAgICB2YXIgZGF0ZVN0ciA9IGRhdGVBcnIuam9pbignLScpO1xuXG4gICAgcmV0dXJuIGRhdGVTdHI7XG5cbiAgICBmdW5jdGlvbiBwYWQobikgeyByZXR1cm4gbiA8IDEwID8gJzAnICsgbiA6IG47IH1cbn0iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MRHJvcFRhcmdldCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxEcm9wVGFyZ2V0JywgWydkcm9wJ10pO1xuXG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEcm9wVGFyZ2V0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTERyb3BUYXJnZXQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb1QgPSBtaWxvLnV0aWwuZG9UXG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCB1bmlxdWVJZCA9IG1pbG8udXRpbC51bmlxdWVJZDtcblxudmFyIFRSRUVfVEVNUExBVEUgPSAnPHVsIGNsYXNzPVwibWwtdWktZm9sZHRyZWUtbGlzdFwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e34gaXQuZGF0YS5pdGVtcyA6aXRlbTppbmRleCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3sgdmFyIGhhc1N1YlRyZWUgPSBpdGVtLml0ZW1zICYmIGl0ZW0uaXRlbXMubGVuZ3RoOyB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIHt7PyBoYXNTdWJUcmVlIH19Y2xhc3M9XCJtbC11aS1mb2xkdHJlZS0taGFzLW11bHRpcGxlXCJ7ez99fT5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWwtdWktZm9sZHRyZWUtaXRlbVwiIGRhdGEtaXRlbS1pZD1cInt7PSBpdC5pdGVtSURzW2luZGV4XSB9fVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez8gaGFzU3ViVHJlZSB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1sLXVpLWZvbGR0cmVlLWJ1dHRvblwiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez0gaXQuaXRlbVRlbXBsYXRlKHsgaXRlbTogaXRlbSB9KSB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PyBoYXNTdWJUcmVlIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PSBpdC50cmVlVGVtcGxhdGUoaXRlbSkgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXFxuICAgICAgICAgICAgICAgICAgICAgICAge3t+fX1cXFxuICAgICAgICAgICAgICAgICAgICA8L3VsPic7XG5cbnZhciBERUZBVUxUX0NPTVBJTEVEX0lURU1fVEVNUExBVEUgPSBkb1QuY29tcGlsZSgnXFxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtdWktZm9sZHRyZWUtbGFiZWxcIj5cXFxuICAgICAgICAgICAgICAgIHt7PSBpdC5pdGVtLmxhYmVsIH19XFxcbiAgICAgICAgICAgIDwvc3Bhbj4nKVxuICAgICwgQ09NUElMRURfVFJFRV9URU1QTEFURSA9IGRvVC5jb21waWxlKFRSRUVfVEVNUExBVEUpO1xuXG5cbnZhciBNTEZvbGRUcmVlID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEZvbGRUcmVlJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ2NsaWNrIGRibGNsaWNrJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1FdmVudCwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1mb2xkdHJlZS1tYWluJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MRm9sZFRyZWUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRm9sZFRyZWU7XG5cbl8uZXh0ZW5kUHJvdG8oTUxGb2xkVHJlZSwge1xuICAgIHNldEl0ZW1UZW1wbGF0ZTogTUxGb2xkVHJlZSRzZXRJdGVtVGVtcGxhdGUsXG4gICAgcmVuZGVyVHJlZTogTUxGb2xkVHJlZSRyZW5kZXJUcmVlLFxuICAgIHNldEFjdGl2ZUl0ZW06IE1MRm9sZFRyZWUkc2V0QWN0aXZlSXRlbSxcbiAgICB0b2dnbGVJdGVtOiBNTEZvbGRUcmVlJHRvZ2dsZUl0ZW1cbn0pO1xuXG5mdW5jdGlvbiBmb2xkVW5mb2xkKGVsLCBvcGVuZWQpIHtcbiAgICBpZiAob3BlbmVkKVxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdtbC11aS1mb2xkdHJlZS0tdW5mb2xkJywgb3BlbmVkKTtcbiAgICBlbHNlXG4gICAgICAgIGVsLmNsYXNzTGlzdC50b2dnbGUoJ21sLXVpLWZvbGR0cmVlLS11bmZvbGQnKTtcbn1cblxuZnVuY3Rpb24gaXRlbU1lc3NhZ2UobXNnLCBlbCkge1xuICAgIHZhciBpZCA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pdGVtLWlkJylcbiAgICAgICAgLCBpdGVtID0gdGhpcy5faXRlbXNNYXBbaWRdO1xuXG4gICAgdGhpcy5wb3N0TWVzc2FnZSgnbWxmb2xkdHJlZV8nICsgbXNnLCB7XG4gICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgIGVsOiBlbFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBvbkl0ZW1FdmVudChtc2csIGUpIHtcbiAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdtbC11aS1mb2xkdHJlZS1idXR0b24nKSlcbiAgICAgICAgZm9sZFVuZm9sZChlbC5wYXJlbnROb2RlLnBhcmVudE5vZGUpO1xuICAgIGVsc2UgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnbWwtdWktZm9sZHRyZWUtbGFiZWwnKSlcbiAgICAgICAgaXRlbU1lc3NhZ2UuY2FsbCh0aGlzLCBtc2csIGVsLnBhcmVudE5vZGUpO1xuICAgIGVsc2UgcmV0dXJuO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG59XG5cbmZ1bmN0aW9uIE1MRm9sZFRyZWUkc2V0SXRlbVRlbXBsYXRlICh0ZW1wbGF0ZVN0cikge1xuICAgIHRoaXMuX2l0ZW1UZW1wbGF0ZSA9IGRvVC5jb21waWxlKHRlbXBsYXRlU3RyKTtcbn1cblxuZnVuY3Rpb24gTUxGb2xkVHJlZSRyZW5kZXJUcmVlIChkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICAgIHNlbGYuX2l0ZW1zTWFwID0ge307XG4gICAgdGhpcy5lbC5pbm5lckhUTUwgPSBfcmVuZGVyVHJlZShkYXRhKTtcblxuICAgIGZ1bmN0aW9uIF9yZW5kZXJUcmVlIChkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLml0ZW1zKVxuICAgICAgICAgICAgdmFyIGl0ZW1zSURzID0gXy5tYXAoZGF0YS5pdGVtcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IGl0ZW0uaWQgfHwgdW5pcXVlSWQoKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5faXRlbXNNYXBbaWRdKSB0aHJvdyBuZXcgRXJyb3IoJ01MRm9sZFRyZWU6IGl0ZW0gaGFzIGR1cGxpY2F0ZSBJRDonICsgaWQpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2l0ZW1zTWFwW2lkXSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIENPTVBJTEVEX1RSRUVfVEVNUExBVEUoe1xuICAgICAgICAgICAgaXRlbUlEczogaXRlbXNJRHMsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgaXRlbVRlbXBsYXRlOiBzZWxmLl9pdGVtVGVtcGxhdGUgfHwgREVGQVVMVF9DT01QSUxFRF9JVEVNX1RFTVBMQVRFLFxuICAgICAgICAgICAgdHJlZVRlbXBsYXRlOiBfcmVuZGVyVHJlZVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gTUxGb2xkVHJlZSRzZXRBY3RpdmVJdGVtKGlkLCBjc3NDbGFzcykge1xuICAgIGNzc0NsYXNzID0gY3NzQ2xhc3MgfHwgJ21sLXVpLWZvbGR0cmVlLWFjdGl2ZSc7XG4gICAgdmFyIGl0ZW1zID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYubWwtdWktZm9sZHRyZWUtaXRlbScpO1xuICAgIF8uZm9yRWFjaChpdGVtcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoY3NzQ2xhc3MpO1xuICAgIH0pO1xuICAgIGlmIChpZCkge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignZGl2Lm1sLXVpLWZvbGR0cmVlLWl0ZW1bZGF0YS1pdGVtLWlkPVwiJyArIGlkICsgJ1wiXScpO1xuICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoY3NzQ2xhc3MpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gTUxGb2xkVHJlZSR0b2dnbGVJdGVtKGlkLCBvcGVuZWQpIHtcbiAgICB2YXIgaXRlbSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignZGl2Lm1sLXVpLWZvbGR0cmVlLWl0ZW1bZGF0YS1pdGVtLWlkPVwiJyArIGlkICsgJ1wiXScpO1xuICAgIGZvbGRVbmZvbGQoaXRlbS5wYXJlbnROb2RlLCBvcGVuZWQpO1xufVxuXG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MR3JvdXAgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MR3JvdXAnLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1ncm91cCdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEdyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEdyb3VwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxIeXBlcmxpbmsgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MSHlwZXJsaW5rJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktaHlwZXJsaW5rJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MSHlwZXJsaW5rKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEh5cGVybGluaztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIElNQUdFX0NIQU5HRV9NRVNTQUdFID0gJ21saW1hZ2VjaGFuZ2UnO1xuXG52YXIgTUxJbWFnZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxJbWFnZScsIHtcbiAgICBkYXRhOiB7XG4gICAgICAgIHNldDogTUxJbWFnZV9zZXQsXG4gICAgICAgIGdldDogTUxJbWFnZV9nZXQsXG4gICAgICAgIGRlbDogTUxJbWFnZV9kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogSU1BR0VfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnLnNyYyc6IHsgc3Vic2NyaWJlcjogb25Nb2RlbENoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICB0YWdOYW1lOiAnaW1nJyxcbiAgICAgICAgY2xzOiAnbWwtdWktaW1hZ2UnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxJbWFnZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxJbWFnZTtcblxuXG5fLmV4dGVuZFByb3RvKE1MSW1hZ2UsIHtcbiAgICBpbml0OiBNTEltYWdlJGluaXRcbn0pO1xuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGl6ZSByYWRpbyBncm91cCBhbmQgc2V0dXBcbiAqL1xuZnVuY3Rpb24gTUxJbWFnZSRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5cbi8qKlxuICogU2V0cyBpbWFnZSB2YWx1ZVxuICogUmVwbGFjZXMgdGhlIGRhdGEgc2V0IG9wZXJhdGlvbiB0byBkZWFsIHdpdGggcmFkaW8gYnV0dG9uc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBzZXRcbiAqL1xuZnVuY3Rpb24gTUxJbWFnZV9zZXQodmFsdWUpIHtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbi8qKlxuICogR2V0cyBncm91cCB2YWx1ZVxuICogUmV0cmlldmVzIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiB0aGUgZ3JvdXBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MSW1hZ2VfZ2V0KCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0KCk7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyA/IF8uY2xvbmUodmFsdWUpIDogdmFsdWU7XG59XG5cblxuLyoqXG4gKiBEZWxldGVkIGdyb3VwIHZhbHVlXG4gKiBEZWxldGVzIHRoZSB2YWx1ZSBvZiB0aGUgZ3JvdXAsIHNldHRpbmcgaXQgdG8gZW1wdHlcbiAqL1xuZnVuY3Rpb24gTUxJbWFnZV9kZWwoKSB7XG4gICAgdGhpcy5tb2RlbC5kZWwoKTtcbn1cblxuXG4vLyBQb3N0IHRoZSBkYXRhIGNoYW5nZVxuZnVuY3Rpb24gZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoSU1BR0VfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5cbmZ1bmN0aW9uIG9uTW9kZWxDaGFuZ2UocGF0aCwgZGF0YSkge1xuICAgIHRoaXMuZWwuc3JjID0gZGF0YS5uZXdWYWx1ZTtcbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MSW5wdXQgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MSW5wdXQnLCB7XG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1pbnB1dCdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTElucHV0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTElucHV0O1xuXG5fLmV4dGVuZFByb3RvKE1MSW5wdXQsIHtcbiAgICBkaXNhYmxlOiBNTElucHV0JGRpc2FibGUsXG4gICAgaXNEaXNhYmxlZDogTUxJbnB1dCRpc0Rpc2FibGVkLFxuICAgIHNldE1heExlbmd0aDogTUxJbnB1dCRzZXRNYXhMZW5ndGhcbn0pO1xuXG5mdW5jdGlvbiBNTElucHV0JGRpc2FibGUoZGlzYWJsZSkge1xuICAgIHRoaXMuZWwuZGlzYWJsZWQgPSBkaXNhYmxlO1xufVxuXG5mdW5jdGlvbiBNTElucHV0JGlzRGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5lbC5kaXNhYmxlZDtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dCRzZXRNYXhMZW5ndGgobGVuZ3RoKSB7XG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ21heGxlbmd0aCcsIGxlbmd0aCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG52YXIgSU5QVVRfTElTVF9DSEFOR0VfTUVTU0FHRSA9ICdtbGlucHV0bGlzdGNoYW5nZSc7XG5cbnZhciBhc3luY0hhbmRsZXIgPSBmdW5jdGlvbiAodmFsdWUsIGNhbGxiYWNrKSB7Y2FsbGJhY2sodmFsdWUpO307XG5cbnZhciBNTElucHV0TGlzdCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxJbnB1dExpc3QnLCB7XG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWlucHV0LWxpc3QnXG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxJbnB1dExpc3RfZ2V0LFxuICAgICAgICBzZXQ6IE1MSW5wdXRMaXN0X3NldCxcbiAgICAgICAgZGVsOiBNTElucHV0TGlzdF9kZWwsXG4gICAgICAgIHNwbGljZTogTUxJbnB1dExpc3Rfc3BsaWNlLFxuICAgICAgICBldmVudDogSU5QVVRfTElTVF9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKionOiB7IHN1YnNjcmliZXI6IG9uSXRlbXNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ1xcXG4gICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJNTExpc3Q6bGlzdFwiPlxcXG4gICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0SXRlbTppdGVtXCIgY2xhc3M9XCJsaXN0LWl0ZW1cIj5cXFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiW2RhdGFdOmxhYmVsXCI+PC9zcGFuPlxcXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIG1sLWJpbmQ9XCJbZXZlbnRzXTpkZWxldGVCdG5cIiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlXCI+PC9zcGFuPlxcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBtbC1iaW5kPVwiTUxJbnB1dDppbnB1dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XFxcbiAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cIk1MQnV0dG9uOmJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCI+XFxcbiAgICAgICAgICAgICAgICBBZGRcXFxuICAgICAgICAgICAgPC9idXR0b24+J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MSW5wdXRMaXN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTElucHV0TGlzdDtcblxuXy5leHRlbmRQcm90byhNTElucHV0TGlzdCwge1xuICAgIGluaXQ6IE1MSW5wdXRMaXN0JGluaXQsXG4gICAgc2V0QXN5bmM6IE1MSW5wdXRMaXN0JHNldEFzeW5jLFxuICAgIHNldFBsYWNlSG9sZGVyOiBNTElucHV0TGlzdCRzZXRQbGFjZUhvbGRlcixcbiAgICBkZXN0cm95OiBNTElucHV0TGlzdCRkZXN0cm95XG59KTtcblxuZnVuY3Rpb24gTUxJbnB1dExpc3QkaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uY2UoJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xuICAgIHRoaXMubW9kZWwuc2V0KFtdKTtcbn1cblxuZnVuY3Rpb24gb25DaGlsZHJlbkJvdW5kKCkge1xuICAgIHJlbmRlci5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdCRzZXRQbGFjZUhvbGRlcihwbGFjZUhvbGRlcikge1xuICAgIHRoaXMuX2lucHV0LmVsLnNldEF0dHJpYnV0ZSgncGxhY2VIb2xkZXInLCBwbGFjZUhvbGRlcik7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JHNldEFzeW5jKG5ld0hhbmRsZXIpIHtcbiAgICBhc3luY0hhbmRsZXIgPSBuZXdIYW5kbGVyIHx8IGFzeW5jSGFuZGxlcjtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3QkZGVzdHJveSgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgJiYgbWlsby5taW5kZXIuZGVzdHJveUNvbm5lY3Rvcih0aGlzLl9jb25uZWN0b3IpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcigpLmJpbmRlcigpO1xuICAgIGNvbXBvbmVudFNldHVwLmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudFNldHVwKCkge1xuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICdfaW5wdXQnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5pbnB1dCxcbiAgICAgICAgJ19idXR0b24nOiB0aGlzLmNvbnRhaW5lci5zY29wZS5idXR0b24sXG4gICAgICAgICdfbGlzdCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmxpc3RcbiAgICB9KTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBtaWxvLm1pbmRlcih0aGlzLl9saXN0Lm1vZGVsLCAnPDw8LT4+PicsIHRoaXMubW9kZWwpO1xuICAgIHRoaXMuX2J1dHRvbi5ldmVudHMub24oJ2NsaWNrJywge3N1YnNjcmliZXI6IG9uQ2xpY2ssIGNvbnRleHQ6IHRoaXMgfSk7ICAgXG59XG5cbmZ1bmN0aW9uIG9uQ2xpY2sobXNnKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5faW5wdXQuZGF0YS5nZXQoMCk7XG4gICAgaWYgKHRoaXMuX2lucHV0LmRhdGEpXG4gICAgICAgIGFzeW5jSGFuZGxlcih2YWx1ZSwgZnVuY3Rpb24gKGxhYmVsLCB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbGlzdC5tb2RlbC5wdXNoKHsgbGFiZWw6IGxhYmVsLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5faW5wdXQuZGF0YS5kZWwoKTtcbn1cblxuZnVuY3Rpb24gb25JdGVtc0NoYW5nZShtc2csIGRhdGEpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKElOUFVUX0xJU1RfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdF9nZXQoKSB7XG4gICAgdmFyIG1vZGVsID0gdGhpcy5tb2RlbC5nZXQoKTtcbiAgICByZXR1cm4gbW9kZWwgPyBfLmNsb25lKG1vZGVsKSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Rfc2V0KHZhbHVlKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdF9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWwuc2V0KFtdKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Rfc3BsaWNlKCkgeyAvLyAuLi4gYXJndW1lbnRzXG4gICAgdGhpcy5tb2RlbC5zcGxpY2UuYXBwbHkodGhpcy5tb2RlbCwgYXJndW1lbnRzKTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG52YXIgTElTVF9DSEFOR0VfTUVTU0FHRSA9ICdtbGxpc3RjaGFuZ2UnXG4gICAgLCBERUxFVEVfQlVUVE9OX05BTUUgPSAnZGVsZXRlQnRuJztcblxuXG52YXIgTUxMaXN0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTExpc3QnLCB7XG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWxpc3QnXG4gICAgfSxcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgbW9kZWw6IHVuZGVmaW5lZCxcbiAgICBsaXN0OiB1bmRlZmluZWRcbn0pO1xuXG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxMaXN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTExpc3Q7XG5cblxuXy5leHRlbmRQcm90byhNTExpc3QsIHtcbiAgICBpbml0OiBNTExpc3QkaW5pdCxcbiAgICBkZXN0cm95OiBNTExpc3QkZGVzdHJveSxcbiAgICByZW1vdmVJdGVtOiBNTExpc3QkcmVtb3ZlSXRlbSxcbiAgICBtb3ZlSXRlbTogTUxMaXN0JG1vdmVJdGVtXG59KTtcblxuXG5mdW5jdGlvbiBNTExpc3QkaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3QkZGVzdHJveSgpIHtcbiAgICB0aGlzLl9jb25uZWN0b3IgJiYgbWlsby5taW5kZXIuZGVzdHJveUNvbm5lY3Rvcih0aGlzLl9jb25uZWN0b3IpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0JHJlbW92ZUl0ZW0oaW5kZXgpe1xuICAgIHRoaXMubW9kZWwuc3BsaWNlKGluZGV4LCAxKTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3QkbW92ZUl0ZW0oZnJvbSwgdG8pIHtcbiAgICB2YXIgc3BsaWNlZERhdGEgPSB0aGlzLm1vZGVsLnNwbGljZShmcm9tLCAxKTtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5zcGxpY2UodG8sIDAsIHNwbGljZWREYXRhWzBdKTtcbn1cblxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQoW10pO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG1pbG8ubWluZGVyKHRoaXMubW9kZWwsICc8PDwtJywgdGhpcy5kYXRhKS5kZWZlckNoYW5nZU1vZGUoJzw8PC0+Pj4nKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBEcmFnRHJvcCA9IG1pbG8udXRpbC5kcmFnRHJvcFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTExpc3RJdGVtID0gbWlsby5jcmVhdGVDb21wb25lbnRDbGFzcyh7XG4gICAgY2xhc3NOYW1lOiAnTUxMaXN0SXRlbScsXG4gICAgc3VwZXJDbGFzc05hbWU6ICdNTExpc3RJdGVtU2ltcGxlJyxcbiAgICBmYWNldHM6IHtcbiAgICAgICAgZHJhZzoge1xuICAgICAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICAgICAnZHJhZ3N0YXJ0JzogeyBzdWJzY3JpYmVyOiBvbkRyYWdTdGFydCwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgICAgIHBhcmFtczogJ2dldE1ldGFEYXRhJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcm9wOiB7XG4gICAgICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgICAgICdkcmFnZW50ZXInOiB7IHN1YnNjcmliZXI6IG9uRHJhZ0hvdmVyLCBjb250ZXh0OiAnb3duZXInIH0sXG4gICAgICAgICAgICAgICAgJ2RyYWdvdmVyJzogeyBzdWJzY3JpYmVyOiBvbkRyYWdIb3ZlciwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgICAgICdkcmFnbGVhdmUnOiB7IHN1YnNjcmliZXI6IG9uRHJhZ091dCwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgICAgICdkcm9wJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1Ecm9wLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbGxvdzoge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGlzQ29tcG9uZW50QWxsb3dlZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxMaXN0SXRlbTtcblxuXG5fLmV4dGVuZFByb3RvKE1MTGlzdEl0ZW0sIHtcbiAgICBpbml0OiBNTExpc3RJdGVtJGluaXQsXG4gICAgbW92ZUl0ZW06IE1MTGlzdEl0ZW0kbW92ZUl0ZW0sXG4gICAgcmVtb3ZlSXRlbTogTUxMaXN0SXRlbSRyZW1vdmVJdGVtLFxuICAgIGdldE1ldGFEYXRhOiBNTExpc3RJdGVtJGdldE1ldGFEYXRhLFxuICAgIGlzRHJvcEFsbG93ZWQ6IE1MTGlzdEl0ZW0kaXNEcm9wQWxsb3dlZFxufSk7XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub24oJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICB2YXIgZGVsZXRlQnRuID0gdGhpcy5jb250YWluZXIuc2NvcGUuZGVsZXRlQnRuO1xuICAgIGRlbGV0ZUJ0biAmJiBkZWxldGVCdG4uZXZlbnRzLm9uKCdjbGljaycsIHsgc3Vic2NyaWJlcjogdGhpcy5yZW1vdmVJdGVtLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kcmVtb3ZlSXRlbSgpIHtcbiAgICB0cnkgeyB2YXIgbGlzdE93bmVyID0gdGhpcy5pdGVtLmxpc3Qub3duZXI7IH0gY2F0Y2goZSkge31cbiAgICBsaXN0T3duZXIgJiYgbGlzdE93bmVyLnJlbW92ZUl0ZW0odGhpcy5pdGVtLmluZGV4KTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtJG1vdmVJdGVtKGluZGV4KSB7XG4gICAgdmFyIGxpc3RPd25lciA9IHRoaXMuaXRlbS5saXN0Lm93bmVyO1xuICAgIGxpc3RPd25lciAmJiBsaXN0T3duZXIubW92ZUl0ZW0odGhpcy5pdGVtLmluZGV4LCBpbmRleCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRpc0Ryb3BBbGxvd2VkKG1ldGEvKiwgZHJhZ0Ryb3AqLyl7XG4gICAgdmFyIENvbXBvbmVudCA9IGNvbXBvbmVudHNSZWdpc3RyeS5nZXQobWV0YS5jb21wQ2xhc3MpO1xuXG4gICAgcmV0dXJuIG1ldGEucGFyYW1zICYmIG1ldGEucGFyYW1zLmluZGV4XG4gICAgICAgICAgICAmJiAoQ29tcG9uZW50ID09IE1MTGlzdEl0ZW0gfHwgQ29tcG9uZW50LnByb3RvdHlwZSBpbnN0YW5jZW9mIE1MTGlzdEl0ZW0pXG4gICAgICAgICAgICAmJiBkcmFnZ2luZ0Zyb21TYW1lTGlzdC5jYWxsKHRoaXMpO1xufVxuXG5cbmZ1bmN0aW9uIGRyYWdnaW5nRnJvbVNhbWVMaXN0KGNvbXApIHtcbiAgICBjb21wID0gY29tcCB8fCBEcmFnRHJvcC5zZXJ2aWNlLmdldEN1cnJlbnREcmFnU291cmNlKCk7XG4gICAgdHJ5IHsgdmFyIHNvdXJjZUxpc3QgPSBjb21wLml0ZW0ubGlzdDsgfSBjYXRjaChlKSB7fVxuICAgIHJldHVybiBzb3VyY2VMaXN0ID09IHRoaXMuaXRlbS5saXN0O1xufVxuXG5cbmZ1bmN0aW9uIGlzQ29tcG9uZW50QWxsb3dlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Ryb3BBbGxvd2VkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gb25JdGVtRHJvcChldmVudFR5cGUsIGV2ZW50KSB7XG4gICAgb25EcmFnT3V0LmNhbGwodGhpcyk7XG4gICAgdmFyIGR0ID0gbmV3IERyYWdEcm9wKGV2ZW50KTtcbiAgICB2YXIgbWV0YSA9IGR0LmdldENvbXBvbmVudE1ldGEoKTtcbiAgICB2YXIgc3RhdGUgPSBkdC5nZXRDb21wb25lbnRTdGF0ZSgpO1xuICAgIHZhciBsaXN0T3duZXIgPSB0aGlzLml0ZW0ubGlzdC5vd25lcjtcbiAgICB2YXIgaW5kZXggPSBtZXRhLnBhcmFtcyAmJiBtZXRhLnBhcmFtcy5pbmRleDtcbiAgICB2YXIgZHJvcFBvc2l0aW9uID0gRHJhZ0Ryb3AuZ2V0RHJvcFBvc2l0aW9uWShldmVudCwgdGhpcy5lbCk7XG4gICAgdmFyIGlzQmVsb3cgPSBkcm9wUG9zaXRpb24gPT0gJ2JlbG93JztcbiAgICB2YXIgaXNBYm92ZSA9IGRyb3BQb3NpdGlvbiA9PSAnYWJvdmUnO1xuICAgIHZhciB0YXJnZXRJbmRleDtcblxuICAgIGlmIChkcmFnZ2luZ0Zyb21TYW1lTGlzdC5jYWxsKHRoaXMpKXtcbiAgICAgICAgaWYoc3RhdGUuY29tcE5hbWUgPT0gdGhpcy5uYW1lKSByZXR1cm47XG4gICAgICAgIHZhciBzdGF0ZUluZGV4ID0gc3RhdGUuZmFjZXRzU3RhdGVzLml0ZW0uc3RhdGUuaW5kZXg7XG4gICAgICAgIHZhciBpc01vdmVEb3duID0gc3RhdGVJbmRleCA8IHRoaXMuaXRlbS5pbmRleDtcbiAgICAgICAgdmFyIGlzU2FtZVBvc2l0aW9uO1xuICAgICAgICBpZihpc01vdmVEb3duKSB7XG4gICAgICAgICAgICBpc1NhbWVQb3NpdGlvbiA9IGlzQWJvdmUgJiYgc3RhdGVJbmRleCArIDEgPT0gdGhpcy5pdGVtLmluZGV4O1xuICAgICAgICAgICAgaWYoaXNTYW1lUG9zaXRpb24pIHJldHVybjtcbiAgICAgICAgICAgIHRhcmdldEluZGV4ID0gdGhpcy5pdGVtLmluZGV4IC0gaXNBYm92ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsvL21vdmUgdXBcbiAgICAgICAgICAgIGlzU2FtZVBvc2l0aW9uID0gaXNCZWxvdyAmJiBzdGF0ZUluZGV4IC0gMSA9PSB0aGlzLml0ZW0uaW5kZXg7XG4gICAgICAgICAgICBpZihpc1NhbWVQb3NpdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLml0ZW0uaW5kZXggKyBpc0JlbG93O1xuICAgICAgICB9XG4gICAgICAgIGxpc3RPd25lci5tb3ZlSXRlbSgraW5kZXgsIHRhcmdldEluZGV4LCBzdGF0ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0YXJnZXRJbmRleCA9IHRoaXMuaXRlbS5pbmRleCArIGlzQmVsb3c7XG4gICAgICAgIHRyeSB7IHZhciBkYXRhID0gc3RhdGUuZmFjZXRzU3RhdGVzLmRhdGEuc3RhdGU7IH0gY2F0Y2goZSkge31cbiAgICAgICAgbGlzdE93bmVyLmRhdGEuc3BsaWNlKHRhcmdldEluZGV4LCAwLCBkYXRhKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gb25EcmFnU3RhcnQoLypldmVudFR5cGUsIGV2ZW50Ki8pIHtcbiAgICBEcmFnRHJvcC5zZXJ2aWNlLm9uY2UoJ2RyYWdkcm9wY29tcGxldGVkJywgeyBzdWJzY3JpYmVyOiBvbkRyYWdEcm9wQ29tcGxldGVkLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG5cbmZ1bmN0aW9uIG9uRHJhZ0hvdmVyKC8qZXZlbnRUeXBlLCBldmVudCovKSB7XG4gICAgdGhpcy5kb20uYWRkQ3NzQ2xhc3NlcygnbWwtZHJhZy1vdmVyJyk7XG59XG5cblxuZnVuY3Rpb24gb25EcmFnT3V0KC8qZXZlbnRUeXBlLCBldmVudCovKSB7XG4gICAgdGhpcy5kb20ucmVtb3ZlQ3NzQ2xhc3NlcygnbWwtZHJhZy1vdmVyJyk7XG59XG5cblxuZnVuY3Rpb24gb25EcmFnRHJvcENvbXBsZXRlZChtc2csIGRhdGEpIHtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGRhdGEuY29tcG9uZW50O1xuICAgIHZhciBkcm9wcGVkSW5Bbm90aGVyTGlzdCA9IGRhdGEuZXZlbnRUeXBlID09ICdkcm9wJyAmJiAhZHJhZ2dpbmdGcm9tU2FtZUxpc3QuY2FsbCh0aGlzLCBkcm9wVGFyZ2V0KTtcbiAgICBpZiAoZHJvcHBlZEluQW5vdGhlckxpc3QpIHRoaXMuaXRlbS5yZW1vdmVJdGVtKCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRnZXRNZXRhRGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpbmRleDogdGhpcy5pdGVtLmluZGV4XG4gICAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIExJU1RJVEVNX0NIQU5HRV9NRVNTQUdFID0gJ21sbGlzdGl0ZW1jaGFuZ2UnO1xuXG52YXIgTUxMaXN0SXRlbVNpbXBsZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxMaXN0SXRlbVNpbXBsZScsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxMaXN0SXRlbVNpbXBsZV9nZXQsXG4gICAgICAgIHNldDogTUxMaXN0SXRlbVNpbXBsZV9zZXQsXG4gICAgICAgIGRlbDogTUxMaXN0SXRlbVNpbXBsZV9kZWwsXG4gICAgICAgIGV2ZW50OiBMSVNUSVRFTV9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHVuZGVmaW5lZCxcbiAgICBpdGVtOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MTGlzdEl0ZW1TaW1wbGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MTGlzdEl0ZW1TaW1wbGU7XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbVNpbXBsZV9nZXQoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5tb2RlbC5nZXQoKTtcbiAgICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnID8gXy5jbG9uZSh2YWx1ZSkgOiB2YWx1ZTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtU2ltcGxlX3NldCh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpXG4gICAgICAgIHRoaXMuZGF0YS5fc2V0KHZhbHVlKTtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG4gICAgX3NlbmRDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW1TaW1wbGVfZGVsKCkge1xuICAgIHRoaXMuZGF0YS5fZGVsKCk7XG4gICAgdGhpcy5tb2RlbC5kZWwoKTtcbiAgICBfc2VuZENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBfc2VuZENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShMSVNUSVRFTV9DSEFOR0VfTUVTU0FHRSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCB1bmlxdWVJZCA9IG1pbG8udXRpbC51bmlxdWVJZDtcblxuXG52YXIgUkFESU9fQ0hBTkdFX01FU1NBR0UgPSAnbWxyYWRpb2dyb3VwY2hhbmdlJ1xuICAgICwgRUxFTUVOVF9OQU1FX1BST1BFUlRZID0gJ19tbFJhZGlvR3JvdXBFbGVtZW50SUQnXG4gICAgLCBFTEVNRU5UX05BTUVfUFJFRklYID0gJ21sLXJhZGlvLWdyb3VwLSc7XG5cbnZhciBNTFJhZGlvR3JvdXAgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MUmFkaW9Hcm91cCcsIHtcbiAgICBkYXRhOiB7XG4gICAgICAgIHNldDogTUxSYWRpb0dyb3VwX3NldCxcbiAgICAgICAgZ2V0OiBNTFJhZGlvR3JvdXBfZ2V0LFxuICAgICAgICBkZWw6IE1MUmFkaW9Hcm91cF9kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogUkFESU9fQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjbGljayc6IHsgc3Vic2NyaWJlcjogb25Hcm91cENsaWNrLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXJhZGlvLWdyb3VwJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICd7e34gaXQucmFkaW9PcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7IyNkZWYuZWxJRDp7ez0gaXQuZWxlbWVudE5hbWUgfX0te3s9IG9wdGlvbi52YWx1ZSB9fSN9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ7ez0gaXQuX3JlbmRlck9wdGlvbnMub3B0aW9uQ3NzQ2xhc3MgfHwgXCInICsgRUxFTUVOVF9OQU1FX1BSRUZJWCArICdvcHRpb25cIiB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cInt7IyBkZWYuZWxJRCB9fVwiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwie3s9IG9wdGlvbi52YWx1ZSB9fVwiIG5hbWU9XCJ7ez0gaXQuZWxlbWVudE5hbWUgfX1cIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwie3sjIGRlZi5lbElEIH19XCI+e3s9IG9wdGlvbi5sYWJlbCB9fTwvbGFiZWw+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXG4gICAgICAgICAgICAgICAgICAge3t+fX0nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxSYWRpb0dyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFJhZGlvR3JvdXA7XG5cblxuXy5leHRlbmRQcm90byhNTFJhZGlvR3JvdXAsIHtcbiAgICBpbml0OiBNTFJhZGlvR3JvdXAkaW5pdCxcbiAgICBkZXN0cm95OiBNTFJhZGlvR3JvdXAkZGVzdHJveSxcbiAgICBzZXRSZW5kZXJPcHRpb25zOiBNTFJhZGlvR3JvdXAkc2V0UmVuZGVyT3B0aW9uc1xufSk7XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXplIHJhZGlvIGdyb3VwIGFuZCBzZXR1cFxuICovXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXAkaW5pdCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnR5KHRoaXMsICdfcmFkaW9MaXN0JywgW10sIF8uQ09ORik7XG4gICAgXy5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBFTEVNRU5UX05BTUVfUFJPUEVSVFksIEVMRU1FTlRfTkFNRV9QUkVGSVggKyB1bmlxdWVJZCgpKTtcbiAgICB0aGlzLl9yZW5kZXJPcHRpb25zID0ge307XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gTUxSYWRpb0dyb3VwJHNldFJlbmRlck9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMgPSBvcHRpb25zO1xufVxuXG5cbi8qKlxuICogU2V0cyBncm91cCB2YWx1ZVxuICogUmVwbGFjZXMgdGhlIGRhdGEgc2V0IG9wZXJhdGlvbiB0byBkZWFsIHdpdGggcmFkaW8gYnV0dG9uc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBzZXRcbiAqL1xuZnVuY3Rpb24gTUxSYWRpb0dyb3VwX3NldCh2YWx1ZSkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5fcmFkaW9MaXN0XG4gICAgICAgICwgc2V0UmVzdWx0O1xuICAgIGlmIChvcHRpb25zLmxlbmd0aCkge1xuICAgICAgICBvcHRpb25zLmZvckVhY2goZnVuY3Rpb24ocmFkaW8pIHtcbiAgICAgICAgICAgIHJhZGlvLmNoZWNrZWQgPSByYWRpby52YWx1ZSA9PSB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChyYWRpby5jaGVja2VkKVxuICAgICAgICAgICAgICAgIHNldFJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcblxuICAgICAgICByZXR1cm4gc2V0UmVzdWx0O1xuICAgIH1cbn1cblxuXG4vKipcbiAqIEdldHMgZ3JvdXAgdmFsdWVcbiAqIFJldHJpZXZlcyB0aGUgc2VsZWN0ZWQgdmFsdWUgb2YgdGhlIGdyb3VwXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXBfZ2V0KCkge1xuICAgIHZhciBjaGVja2VkID0gXy5maW5kKHRoaXMuX3JhZGlvTGlzdCwgZnVuY3Rpb24ocmFkaW8pIHtcbiAgICAgICAgcmV0dXJuIHJhZGlvLmNoZWNrZWQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hlY2tlZCAmJiBjaGVja2VkLnZhbHVlIHx8IHVuZGVmaW5lZDtcbn1cblxuXG4vKipcbiAqIERlbGV0ZWQgZ3JvdXAgdmFsdWVcbiAqIERlbGV0ZXMgdGhlIHZhbHVlIG9mIHRoZSBncm91cCwgc2V0dGluZyBpdCB0byBlbXB0eVxuICovXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXBfZGVsKCkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5fcmFkaW9MaXN0O1xuICAgIGlmIChvcHRpb25zLmxlbmd0aClcbiAgICAgICAgb3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHJhZGlvKSB7XG4gICAgICAgICAgICByYWRpby5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuXG4vKipcbiAqIE1hbmFnZSByYWRpbyBjaGlsZHJlbiBjbGlja3NcbiAqL1xuZnVuY3Rpb24gb25Hcm91cENsaWNrKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnR5cGUgPT0gJ3JhZGlvJylcbiAgICAgICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cbi8vIFBvc3QgdGhlIGRhdGEgY2hhbmdlXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShSQURJT19DSEFOR0VfTUVTU0FHRSk7XG59XG5cblxuLy8gU2V0IHJhZGlvIGJ1dHRvbiBjaGlsZHJlbiBvbiBtb2RlbCBjaGFuZ2VcbmZ1bmN0aW9uIG9uT3B0aW9uc0NoYW5nZShwYXRoLCBkYXRhKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoe1xuICAgICAgICByYWRpb09wdGlvbnM6IHRoaXMubW9kZWwuZ2V0KCksXG4gICAgICAgIGVsZW1lbnROYW1lOiB0aGlzW0VMRU1FTlRfTkFNRV9QUk9QRVJUWV0sXG4gICAgICAgIF9yZW5kZXJPcHRpb25zOiB0aGlzLl9yZW5kZXJPcHRpb25zXG4gICAgfSk7XG5cbiAgICB2YXIgcmFkaW9FbHMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXScpXG4gICAgICAgICwgb3B0aW9ucyA9IF8udG9BcnJheShyYWRpb0Vscyk7XG5cbiAgICB0aGlzLl9yYWRpb0xpc3QubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9yYWRpb0xpc3Quc3BsaWNlLmFwcGx5KHRoaXMuX3JhZGlvTGlzdCwgWzAsIDBdLmNvbmNhdChvcHRpb25zKSk7XG59XG5cblxuZnVuY3Rpb24gTUxSYWRpb0dyb3VwJGRlc3Ryb3koKSB7XG4gICAgZGVsZXRlIHRoaXMuX3JhZGlvTGlzdDtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBTRUxFQ1RfQ0hBTkdFX01FU1NBR0UgPSAnbWxzZWxlY3RjaGFuZ2UnO1xuXG52YXIgTUxTZWxlY3QgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MU2VsZWN0Jywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1zZWxlY3QnXG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICAgIHNldDogTUxTZWxlY3Rfc2V0LFxuICAgICAgICBnZXQ6IE1MU2VsZWN0X2dldCxcbiAgICAgICAgZGVsOiBNTFNlbGVjdF9kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogU0VMRUNUX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjaGFuZ2UnOiB7IHN1YnNjcmliZXI6IGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKionOiB7IHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAne3t+IGl0LnNlbGVjdE9wdGlvbnMgOm9wdGlvbiB9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInt7PSBvcHRpb24udmFsdWUgfX1cIiB7ez8gb3B0aW9uLnNlbGVjdGVkIH19c2VsZWN0ZWR7ez99fT57ez0gb3B0aW9uLmxhYmVsIH19PC9vcHRpb24+IFxcXG4gICAgICAgICAgICAgICAgICAge3t+fX0nXG4gICAgfVxufSk7XG5cblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFNlbGVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxTZWxlY3Q7XG5cblxuXy5leHRlbmRQcm90byhNTFNlbGVjdCwge1xuICAgIGluaXQ6IE1MU2VsZWN0JGluaXQsXG4gICAgc2V0T3B0aW9uczogTUxTZWxlY3Qkc2V0T3B0aW9ucyxcbiAgICBkaXNhYmxlOiBNTFNlbGVjdCRkaXNhYmxlXG59KTtcblxuXG5mdW5jdGlvbiBNTFNlbGVjdCRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX29wdGlvbkVscyA9IHt9O1xuICAgIHRoaXMuX2lzTXVsdGlwbGUgPSB0aGlzLmVsLmhhc0F0dHJpYnV0ZSgnbXVsdGlwbGUnKTtcbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdCRzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAvLyBTZXQgb3B0aW9ucyB0ZW1wb3JhcmlseSBkaXNhYmxlcyBtb2RlbCBzdWJzY3JpcHRpb25zIChBcyBhIHdvcmthcm91bmQgZm9yIHBlcmZvcm1hbmNlIGlzc3VlcyByZWxhdGluZyB0byBtb2RlbCB1cGRhdGVzIC8gdGVtcGxhdGUgcmUtcmVuZGVyaW5nKVxuICAgIHZhciBtb2RlbENoYW5nZUxpc3RlbmVyID0geyBjb250ZXh0OiB0aGlzLCBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UgfTtcblxuICAgIHRoaXMubW9kZWwub2ZmKCcqKicsIG1vZGVsQ2hhbmdlTGlzdGVuZXIpO1xuICAgIHRoaXMubW9kZWwuc2V0KG9wdGlvbnMpO1xuICAgIHRoaXMubW9kZWwub24oJyoqJywgbW9kZWxDaGFuZ2VMaXN0ZW5lcik7XG5cbiAgICBvbk9wdGlvbnNDaGFuZ2UuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdCRkaXNhYmxlKGRpc2FibGUpIHtcbiAgICB0aGlzLmVsLmRpc2FibGVkID0gZGlzYWJsZTtcbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdF9zZXQoc3RyT3JPYmopIHtcbiAgICBpZiAoIXRoaXMuX2lzTXVsdGlwbGUpIHRoaXMuZWwudmFsdWUgPSBzdHJPck9iajtcbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHZhbHVlT2JqID0ge307XG4gICAgICAgIGlmIChzdHJPck9iaiAmJiB0eXBlb2Ygc3RyT3JPYmogPT0gJ29iamVjdCcpIHZhbHVlT2JqID0gc3RyT3JPYmo7XG4gICAgICAgIGVsc2UgdmFsdWVPYmpbc3RyT3JPYmpdID0gdHJ1ZTtcbiAgICAgICAgXy5lYWNoS2V5KHRoaXMuX29wdGlvbkVscywgZnVuY3Rpb24gKGVsLCBrZXkpIHtcbiAgICAgICAgICAgIGVsLnNlbGVjdGVkID0gISF2YWx1ZU9ialtrZXldO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gTUxTZWxlY3RfZ2V0KCkge1xuICAgIGlmICghdGhpcy5faXNNdWx0aXBsZSkgcmV0dXJuIHRoaXMuZWwudmFsdWU7XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBfLm1hcEtleXModGhpcy5fb3B0aW9uRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBlbC5zZWxlY3RlZDtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0X2RlbCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzTXVsdGlwbGUpIHRoaXMuZWwudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgZWxzZSB7XG4gICAgICAgIF8uZWFjaEtleSh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgZWwuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKFNFTEVDVF9DSEFOR0VfTUVTU0FHRSk7XG59XG5cblxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcih7IHNlbGVjdE9wdGlvbnM6IHRoaXMubW9kZWwuZ2V0KCkgfSk7XG4gICAgdGhpcy5fb3B0aW9uRWxzID0ge307XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIF8uZm9yRWFjaCh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbicpLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgc2VsZi5fb3B0aW9uRWxzW2VsLnZhbHVlXSA9IGVsO1xuICAgIH0pO1xuICAgIC8vZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTUxTdXBlckNvbWJvXG4gKiBBIGNvbWJvIHNlbGVjdCBsaXN0IHdpdGggaW50ZWxsaWdlbnQgc2Nyb2xsaW5nIG9mIHN1cGVyIGxhcmdlIGxpc3RzLlxuICovXG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBkb1QgPSBtaWxvLnV0aWwuZG9UXG4gICAgLCBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyO1xuXG52YXIgQ09NQk9fT1BFTiA9ICdtbC11aS1zdXBlcmNvbWJvLW9wZW4nO1xudmFyIENPTUJPX0NIQU5HRV9NRVNTQUdFID0gJ21sc3VwZXJjb21ib2NoYW5nZSc7XG5cbnZhciBPUFRJT05TX1RFTVBMQVRFID0gJ3t7fiBpdC5jb21ib09wdGlvbnMgOm9wdGlvbjppbmRleCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiB7ez8gb3B0aW9uLnNlbGVjdGVkfX1jbGFzcz1cInNlbGVjdGVkXCIge3s/fX1kYXRhLXZhbHVlPVwie3s9IGluZGV4IH19XCI+e3s9IG9wdGlvbi5sYWJlbCB9fTwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e359fSc7XG5cbnZhciBNQVhfUkVOREVSRUQgPSAxMDA7XG52YXIgQlVGRkVSID0gMjU7XG52YXIgREVGQVVMVF9FTEVNRU5UX0hFSUdIVCA9IDIwO1xuXG52YXIgTUxTdXBlckNvbWJvID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFN1cGVyQ29tYm8nLCB7XG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnbW91c2VsZWF2ZSc6IHtzdWJzY3JpYmVyOiBvbk1vdXNlTGVhdmUsIGNvbnRleHQ6ICdvd25lcid9LFxuICAgICAgICAgICAgJ21vdXNlb3Zlcic6IHtzdWJzY3JpYmVyOiBvbk1vdXNlT3ZlciwgY29udGV4dDogJ293bmVyJ31cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MU3VwZXJDb21ib19nZXQsXG4gICAgICAgIHNldDogTUxTdXBlckNvbWJvX3NldCxcbiAgICAgICAgZGVsOiBNTFN1cGVyQ29tYm9fZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktc3VwZXJjb21ibydcbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnPGlucHV0IG1sLWJpbmQ9XCJbZGF0YSwgZXZlbnRzXTppbnB1dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIG1sLXVpLWlucHV0XCI+XFxcbiAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbZG9tXTphZGRJdGVtRGl2XCIgY2xhc3M9XCJtbC11aS1zdXBlcmNvbWJvLWFkZFwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiOmFkZFByb21wdFwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiW2V2ZW50cywgZG9tXTphZGRCdG5cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBtbC11aS1idXR0b25cIj5BZGQ8L2J1dHRvbj5cXFxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW2RvbSwgZXZlbnRzXTpsaXN0XCIgY2xhc3M9XCJtbC11aS1zdXBlcmNvbWJvLWRyb3Bkb3duXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW2RvbV06YmVmb3JlXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW3RlbXBsYXRlLCBkb20sIGV2ZW50c106b3B0aW9uc1wiIGNsYXNzPVwibWwtdWktc3VwZXJjb21iby1vcHRpb25zXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW2RvbV06YWZ0ZXJcIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDwvZGl2PidcbiAgICB9LFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkXG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFN1cGVyQ29tYm8pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MU3VwZXJDb21ibztcblxuLyoqXG4gKiBQdWJsaWMgQXBpXG4gKi9cbl8uZXh0ZW5kUHJvdG8oTUxTdXBlckNvbWJvLCB7XG4gICAgaW5pdDogTUxTdXBlckNvbWJvJGluaXQsXG4gICAgc2hvd09wdGlvbnM6IE1MU3VwZXJDb21ibyRzaG93T3B0aW9ucyxcbiAgICBoaWRlT3B0aW9uczogTUxTdXBlckNvbWJvJGhpZGVPcHRpb25zLFxuICAgIHRvZ2dsZU9wdGlvbnM6IE1MU3VwZXJDb21ibyR0b2dnbGVPcHRpb25zLFxuICAgIHNldE9wdGlvbnM6IE1MU3VwZXJDb21ibyRzZXRPcHRpb25zLFxuICAgIGluaXRPcHRpb25zVVJMOiBNTFN1cGVyQ29tYm8kaW5pdE9wdGlvbnNVUkwsXG4gICAgc2V0RmlsdGVyZWRPcHRpb25zOiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyZWRPcHRpb25zLFxuICAgIHVwZGF0ZTogTUxTdXBlckNvbWJvJHVwZGF0ZSxcbiAgICB0b2dnbGVBZGRCdXR0b246IE1MU3VwZXJDb21ibyR0b2dnbGVBZGRCdXR0b24sXG4gICAgc2V0QWRkSXRlbVByb21wdDogTUxTdXBlckNvbWJvJHNldEFkZEl0ZW1Qcm9tcHQsXG4gICAgc2V0UGxhY2Vob2xkZXI6IE1MU3VwZXJDb21ibyRzZXRQbGFjZWhvbGRlcixcbiAgICBjbGVhckNvbWJvSW5wdXQ6IE1MU3VwZXJDb21ib19kZWxcbn0pO1xuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGlzZSB0aGUgY29tcG9uZW50LCB3YWl0IGZvciBjaGlsZHJlbmJvdW5kLCBzZXR1cCBlbXB0eSBvcHRpb25zIGFycmF5cy5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLm9uY2UoJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX29wdGlvbnNEYXRhOiBbXSxcbiAgICAgICAgX2ZpbHRlcmVkT3B0aW9uc0RhdGE6IFtdXG4gICAgfSwgXy5XUklUKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVyIGZvciBpbml0IGNoaWxkcmVuYm91bmQgbGlzdGVuZXIuIFJlbmRlcnMgdGVtcGxhdGUuXG4gKi9cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcigpLmJpbmRlcigpO1xuICAgIGNvbXBvbmVudFNldHVwLmNhbGwodGhpcyk7XG59XG5cblxuLyoqXG4gKiBEZWZpbmUgaW5zdGFuY2UgcHJvcGVydGllcywgZ2V0IHN1YmNvbXBvbmVudHMsIGNhbGwgc2V0dXAgc3ViLXRhc2tzXG4gKi9cbmZ1bmN0aW9uIGNvbXBvbmVudFNldHVwKCkge1xuICAgIHZhciBzY29wZSA9IHRoaXMuY29udGFpbmVyLnNjb3BlO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX2NvbWJvSW5wdXQ6IHNjb3BlLmlucHV0LFxuICAgICAgICBfY29tYm9MaXN0OiBzY29wZS5saXN0LFxuICAgICAgICBfY29tYm9PcHRpb25zOiBzY29wZS5vcHRpb25zLFxuICAgICAgICBfY29tYm9CZWZvcmU6IHNjb3BlLmJlZm9yZSxcbiAgICAgICAgX2NvbWJvQWZ0ZXI6IHNjb3BlLmFmdGVyLFxuICAgICAgICBfY29tYm9BZGRJdGVtRGl2OiBzY29wZS5hZGRJdGVtRGl2LFxuICAgICAgICBfY29tYm9BZGRQcm9tcHQ6IHNjb3BlLmFkZFByb21wdCxcbiAgICAgICAgX2NvbWJvQWRkQnRuOiBzY29wZS5hZGRCdG4sXG4gICAgICAgIF9vcHRpb25UZW1wbGF0ZTogZG9ULmNvbXBpbGUoT1BUSU9OU19URU1QTEFURSlcbiAgICB9KTtcblxuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgIF9zdGFydEluZGV4OiAwLFxuICAgICAgICBfZW5kSW5kZXg6IE1BWF9SRU5ERVJFRCxcbiAgICAgICAgX2hpZGRlbjogZmFsc2UsXG4gICAgICAgIF9lbGVtZW50SGVpZ2h0OiBERUZBVUxUX0VMRU1FTlRfSEVJR0hULFxuICAgICAgICBfdG90YWw6IDAsXG4gICAgICAgIF9vcHRpb25zSGVpZ2h0OiAyMDAsXG4gICAgICAgIF9sYXN0U2Nyb2xsUG9zOiAwLFxuICAgICAgICBfY3VycmVudFZhbHVlOiBudWxsLFxuICAgICAgICBfc2VsZWN0ZWQ6IG51bGwsXG4gICAgICAgIF9pc0FkZEJ1dHRvblNob3duOiBmYWxzZVxuICAgIH0sIF8uV1JJVCk7XG5cbiAgICAvLyBDb21wb25lbnQgU2V0dXBcbiAgICB0aGlzLmRvbS5zZXRTdHlsZXMoeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9KTtcbiAgICBzZXR1cENvbWJvTGlzdCh0aGlzLl9jb21ib0xpc3QsIHRoaXMuX2NvbWJvT3B0aW9ucywgdGhpcyk7XG4gICAgc2V0dXBDb21ib0lucHV0KHRoaXMuX2NvbWJvSW5wdXQsIHRoaXMpO1xuICAgIHNldHVwQ29tYm9CdG4odGhpcy5fY29tYm9BZGRCdG4sIHRoaXMpO1xuXG4gICAgdGhpcy5ldmVudHMub24oJ2tleWRvd24nLCB7IHN1YnNjcmliZXI6IGNoYW5nZVNlbGVjdGVkLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vdGhpcy5ldmVudHMub24oJ21vdXNlbGVhdmUnLCB7IHN1YnNjcmliZXI6IE1MU3VwZXJDb21ibyRoaWRlT3B0aW9ucywgY29udGV4dDogdGhpcyB9KTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTaG93cyBvciBoaWRlcyBvcHRpb24gbGlzdC5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNob3cgdHJ1ZSB0byBzaG93LCBmYWxzZSB0byBoaWRlXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyR0b2dnbGVPcHRpb25zKHNob3cpIHtcbiAgICB0aGlzLl9oaWRkZW4gPSAhc2hvdztcbiAgICB0aGlzLl9jb21ib0xpc3QuZG9tLnRvZ2dsZShzaG93KTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTaG93cyBvcHRpb25zIGxpc3RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHNob3dPcHRpb25zKCkge1xuICAgIC8vIFBvc2l0aW9uIHRoZSBsaXN0IHRvIG1heGltaXNlIHRoZSBhbW91bnQgb2YgdmlzaWJsZSBjb250ZW50XG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdmFyIHBhZ2VIZWlnaHQgPSBNYXRoLm1heCh0aGlzLmVsLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApO1xuICAgIHZhciBsaXN0VG9wU3R5bGUgPSAnJzsgLy8gUG9zaXRpb25zIG9wdGlvbnMgdW5kZXJuZWF0aCB0aGUgY29tYm9ib3ggKERlZmF1bHQgYmVoYXZpb3VyKVxuICAgIHZhciBib3R0b21PdmVybGFwID0gKGJvdW5kcy5ib3R0b20gKyB0aGlzLl9vcHRpb25zSGVpZ2h0KSAtIHBhZ2VIZWlnaHQ7XG5cbiAgICBpZihib3R0b21PdmVybGFwID4gMCkge1xuICAgICAgICB2YXIgdG9wT3ZlcmxhcCA9IHRoaXMuX29wdGlvbnNIZWlnaHQgLSBib3VuZHMudG9wO1xuXG4gICAgICAgIGlmKHRvcE92ZXJsYXAgPCBib3R0b21PdmVybGFwKSB7XG4gICAgICAgICAgICBsaXN0VG9wU3R5bGUgPSAtIHRoaXMuX29wdGlvbnNIZWlnaHQgKyAncHgnOyAvLyBQb3NpdGlvbiBvcHRpb25zIGFib3ZlIHRoZSBjb21ib2JveFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS5zZXRTdHlsZXMoeyB0b3A6IGxpc3RUb3BTdHlsZSB9KTtcbiAgICB0aGlzLl9oaWRkZW4gPSBmYWxzZTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoQ09NQk9fT1BFTik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS50b2dnbGUodHJ1ZSk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgb3B0aW9ucyBsaXN0XG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRoaWRlT3B0aW9ucygpIHtcbiAgICB0aGlzLl9oaWRkZW4gPSB0cnVlO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZShDT01CT19PUEVOKTtcbiAgICB0aGlzLl9jb21ib0xpc3QuZG9tLnRvZ2dsZShmYWxzZSk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgYWRkIGJ1dHRvblxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kdG9nZ2xlQWRkQnV0dG9uKHNob3csIG9wdGlvbnMpIHtcbiAgICB0aGlzLl9jb21ib0FkZEl0ZW1EaXYuZG9tLnRvZ2dsZShzaG93KTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnByZXNlcnZlU3RhdGUpIHRoaXMuX19zaG93QWRkT25DbGljayA9IHRoaXMuX2lzQWRkQnV0dG9uU2hvd247XG4gICAgdGhpcy5faXNBZGRCdXR0b25TaG93biA9IHNob3c7XG59XG5cblxuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHNldEFkZEl0ZW1Qcm9tcHQocHJvbXB0KSB7XG4gICAgdGhpcy5fYWRkSXRlbVByb21wdCA9IHByb21wdDtcbiAgICB0aGlzLl9jb21ib0FkZFByb21wdC5lbC5pbm5lckhUTUwgPSBwcm9tcHQ7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0UGxhY2Vob2xkZXIocGxhY2Vob2xkZXIpIHtcbiAgICB0aGlzLl9jb21ib0lucHV0LmVsLnBsYWNlaG9sZGVyID0gcGxhY2Vob2xkZXI7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogU2V0cyB0aGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd25cbiAqXG4gKiBAcGFyYW0ge0FycmF5W09iamVjdF19IGFyciB0aGUgb3B0aW9ucyB0byBzZXQgd2l0aCBsYWJlbCBhbmQgdmFsdWUgcGFpcnMuIFZhbHVlIGNhbiBiZSBhbiBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRPcHRpb25zKGFycikge1xuICAgIHRoaXMuX29wdGlvbnNEYXRhID0gYXJyO1xuICAgIHRoaXMuc2V0RmlsdGVyZWRPcHRpb25zKGFycik7XG59XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXNlIHRoZSByZW1vdGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB0aGUgb3B0aW9ucyB0byBpbml0aWFsaXNlLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kaW5pdE9wdGlvbnNVUkwob3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnNVUkwgPSBvcHRpb25zLnVybDtcbiAgICB0aGlzLl9mb3JtYXRPcHRpb25zVVJMID0gb3B0aW9ucy5mb3JtYXRPcHRpb25zIHx8IGZ1bmN0aW9uKGUpe3JldHVybiBlO307XG59XG5cblxuLyoqXG4gKiBQcml2YXRlIG1ldGhvZFxuICogU2V0cyB0aGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd24gYmFzZWQgb24gYSByZXF1ZXN0XG4gKi9cbmZ1bmN0aW9uIF9nZXRPcHRpb25zVVJMKGNiKSB7XG4gICAgdmFyIHVybCA9IHRoaXMuX29wdGlvbnNVUkwsXG4gICAgICAgIHF1ZXJ5U3RyaW5nID0gdGhpcy5fY29tYm9JbnB1dC5kYXRhLmdldCgpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjYiA9IGNiIHx8IF8ubm9vcDtcbiAgICBtaWxvLnV0aWwucmVxdWVzdC5wb3N0KHVybCwgeyBuYW1lOiBxdWVyeVN0cmluZyB9LCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0NhbiBub3Qgc2VhcmNoIGZvciBcIicgKyBxdWVyeVN0cmluZyArICdcIicpO1xuICAgICAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignUmVxdWVzdCBlcnJvcicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXNwb25zZURhdGEgPSBfLmpzb25QYXJzZShyZXNwb25zZSk7XG4gICAgICAgIGlmIChyZXNwb25zZURhdGEpIGNiKG51bGwsIHJlc3BvbnNlRGF0YSk7XG4gICAgICAgIGVsc2UgY2IobmV3IEVycm9yKCdEYXRhIGVycm9yJykpO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogU2V0cyB0aGUgZmlsdGVyZWQgb3B0aW9ucywgd2hpY2ggaXMgYSBzdWJzZXQgb2Ygbm9ybWFsIG9wdGlvbnNcbiAqXG4gKiBAcGFyYW0ge1t0eXBlXX0gYXJyIFRoZSBvcHRpb25zIHRvIHNldFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyZWRPcHRpb25zKGFycikge1xuICAgIGlmICghIGFycikgcmV0dXJuIGxvZ2dlci5lcnJvcignc2V0RmlsdGVyZWRPcHRpb25zOiBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkJyk7XG4gICAgdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YSA9IGFycjtcbiAgICB0aGlzLl90b3RhbCA9IGFyci5sZW5ndGg7XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBVcGRhdGVzIHRoZSBsaXN0LiBUaGlzIGlzIHVzZWQgb24gc2Nyb2xsLCBhbmQgbWFrZXMgdXNlIG9mIHRoZSBmaWx0ZXJlZE9wdGlvbnMgdG9cbiAqIGludGVsbGlnZW50bHkgc2hvdyBhIHN1YnNldCBvZiB0aGUgZmlsdGVyZWQgbGlzdCBhdCBhIHRpbWUuXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyR1cGRhdGUoKSB7XG4gICAgdmFyIHdhc0hpZGRlbiA9IHRoaXMuX2hpZGRlbjtcblxuICAgIHZhciBhcnJUb1Nob3cgPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhLnNsaWNlKHRoaXMuX3N0YXJ0SW5kZXgsIHRoaXMuX2VuZEluZGV4KTtcblxuICAgIHRoaXMuX2NvbWJvT3B0aW9ucy50ZW1wbGF0ZS5yZW5kZXIoe1xuICAgICAgICBjb21ib09wdGlvbnM6IGFyclRvU2hvd1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZWxlbWVudEhlaWdodCA9IHRoaXMuX2VsZW1lbnRIZWlnaHQgfHwgREVGQVVMVF9FTEVNRU5UX0hFSUdIVDtcblxuICAgIGlmICh3YXNIaWRkZW4pXG4gICAgICAgIHRoaXMuaGlkZU9wdGlvbnMoKTtcblxuICAgIHZhciBiZWZvcmVIZWlnaHQgPSB0aGlzLl9zdGFydEluZGV4ICogdGhpcy5fZWxlbWVudEhlaWdodDtcbiAgICB2YXIgYWZ0ZXJIZWlnaHQgPSAodGhpcy5fdG90YWwgLSB0aGlzLl9lbmRJbmRleCkgKiB0aGlzLl9lbGVtZW50SGVpZ2h0O1xuICAgIHRoaXMuX2NvbWJvQmVmb3JlLmVsLnN0eWxlLmhlaWdodCA9IGJlZm9yZUhlaWdodCArICdweCc7XG4gICAgdGhpcy5fY29tYm9BZnRlci5lbC5zdHlsZS5oZWlnaHQgPSBhZnRlckhlaWdodCA+IDAgPyBhZnRlckhlaWdodCArICdweCcgOiAnMHB4Jztcbn1cblxuLyoqXG4gKiBTZXR1cCB0aGUgY29tYm8gbGlzdFxuICpcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gbGlzdFxuICogQHBhcmFtICB7QXJyYXl9IG9wdGlvbnNcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gc2VsZlxuICovXG5mdW5jdGlvbiBzZXR1cENvbWJvTGlzdChsaXN0LCBvcHRpb25zLCBzZWxmKSB7XG4gICAgc2VsZi50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xuICAgIG9wdGlvbnMudGVtcGxhdGUuc2V0KE9QVElPTlNfVEVNUExBVEUpO1xuXG4gICAgbGlzdC5kb20uc2V0U3R5bGVzKHtcbiAgICAgICAgb3ZlcmZsb3c6ICdzY3JvbGwnLFxuICAgICAgICBoZWlnaHQ6IHNlbGYuX29wdGlvbnNIZWlnaHQgKyAncHgnLFxuICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgekluZGV4OiAxMFxuICAgICAgICAvLyB0b3A6IHlQb3MgKyAncHgnLFxuICAgICAgICAvLyBsZWZ0OiB4UG9zICsgJ3B4JyxcbiAgICB9KTtcblxuICAgIHNlbGYuaGlkZU9wdGlvbnMoKTtcbiAgICBsaXN0LmV2ZW50cy5vbk1lc3NhZ2VzKHtcbiAgICAgICAgJ2NsaWNrJzoge3N1YnNjcmliZXI6IG9uTGlzdENsaWNrLCBjb250ZXh0OiBzZWxmfSxcbiAgICAgICAgJ3Njcm9sbCc6IHtzdWJzY3JpYmVyOiBvbkxpc3RTY3JvbGwsIGNvbnRleHQ6IHNlbGZ9XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2V0dXAgdGhlIGlucHV0IGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gaW5wdXRcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gc2VsZlxuICovXG5mdW5jdGlvbiBzZXR1cENvbWJvSW5wdXQoaW5wdXQsIHNlbGYpIHtcbiAgICBpbnB1dC5ldmVudHMub25jZSgnZm9jdXMnLCBmdW5jdGlvbigpe1xuICAgICAgICBpbnB1dC5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uRGF0YUNoYW5nZSwgY29udGV4dDogc2VsZiB9KTtcbiAgICAgICAgaW5wdXQuZXZlbnRzLm9uKCdjbGljaycsIHtzdWJzY3JpYmVyOiBvbklucHV0Q2xpY2ssIGNvbnRleHQ6IHNlbGYgfSk7XG4gICAgICAgIGlucHV0LmV2ZW50cy5vbigna2V5ZG93bicsIHtzdWJzY3JpYmVyOiBvbkVudGVyS2V5LCBjb250ZXh0OiBzZWxmIH0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNldHVwIHRoZSBidXR0b25cbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gYnRuXG4gKiBAcGFyYW0gIHtDb21wb25lbnR9IHNlbGZcbiAqL1xuZnVuY3Rpb24gc2V0dXBDb21ib0J0bihidG4sIHNlbGYpIHtcbiAgICBidG4uZXZlbnRzLm9uKCdjbGljaycsIHsgc3Vic2NyaWJlcjogb25BZGRCdG4sIGNvbnRleHQ6IHNlbGYgfSk7XG59XG5cblxuLyoqXG4gKiBDdXN0b20gZGF0YSBmYWNldCBnZXQgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ib19nZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRWYWx1ZTtcbn1cblxuLyoqXG4gKiBDdXN0b20gZGF0YSBmYWNldCBzZXQgbWV0aG9kXG4gKiBAcGFyYW0ge1ZhcmlhYmxlfSBvYmpcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvX3NldChvYmopIHtcbiAgICB0aGlzLl9jdXJyZW50VmFsdWUgPSBvYmo7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLnNldChvYmogJiYgb2JqLmxhYmVsKTtcbiAgICBfLmRlZmVyTWV0aG9kKHRoaXMsICdoaWRlT3B0aW9ucycpO1xufVxuXG4vKipcbiAqIEN1c3RvbSBkYXRhIGZhY2V0IGRlbCBtZXRob2RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvX2RlbCgpIHtcbiAgICB0aGlzLl9jdXJyZW50VmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5zZXQoJycpO1xufVxuXG5cbi8qKlxuICogSW5wdXQgZGF0YSBjaGFuZ2UgaGFuZGxlclxuICogV2hlbiB0aGUgaW5wdXQgZGF0YSBjaGFuZ2VzLCB0aGlzIG1ldGhvZCBmaWx0ZXJzIHRoZSBvcHRpb25zRGF0YSwgYW5kIHNldHMgdGhlIGZpcnN0IGVsZW1lbnRcbiAqIHRvIGJlIHNlbGVjdGVkLlxuICogQHBhcmFtICB7U3RyaW5nfSBtc2dcbiAqIEBwYXJhbSAge09iamV4dH0gZGF0YVxuICovXG5mdW5jdGlvbiBvbkRhdGFDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdmFyIHRleHQgPSBkYXRhLm5ld1ZhbHVlICYmIGRhdGEubmV3VmFsdWUudHJpbSgpO1xuICAgIGlmICh0aGlzLl9vcHRpb25zVVJMKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgX2dldE9wdGlvbnNVUkwuY2FsbCh0aGlzLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlRGF0YSl7XG4gICAgICAgICAgICBpZiAoZXJyIHx8ICFyZXNwb25zZURhdGEpIHJldHVybjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSByZXNwb25zZURhdGEuZGF0YS5tYXAoc2VsZi5fZm9ybWF0T3B0aW9uc1VSTCk7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIF91cGRhdGVPcHRpb25zQW5kQWRkQnV0dG9uLmNhbGwoc2VsZiwgdGV4dCwgc2VsZi5fb3B0aW9uc0RhdGEpO1xuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdEYXRhIGVycm9yJywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBmaWx0ZXJlZERhdGEgPSBfZmlsdGVyRGF0YS5jYWxsKHRoaXMsIHRleHQpO1xuICAgICAgICBfdXBkYXRlT3B0aW9uc0FuZEFkZEJ1dHRvbi5jYWxsKHRoaXMsIHRleHQsIGZpbHRlcmVkRGF0YSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIF9maWx0ZXJEYXRhKHRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9uc0RhdGEuZmlsdGVyKGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBkZWxldGUgb3B0aW9uLnNlbGVjdGVkO1xuICAgICAgICBpZiAob3B0aW9uLmxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBvcHRpb24ubGFiZWwudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbC50cmltKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRleHQudG9Mb3dlckNhc2UoKSkgPT0gMDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIF91cGRhdGVPcHRpb25zQW5kQWRkQnV0dG9uKHRleHQsIGZpbHRlcmVkQXJyKSB7XG4gICAgaWYgKCF0ZXh0KSB7XG4gICAgICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlLCB7IHByZXNlcnZlU3RhdGU6IHRydWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZpbHRlcmVkQXJyLmxlbmd0aCAmJiBfLmZpbmQoZmlsdGVyZWRBcnIsIGlzRXhhY3RNYXRjaCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlLCB7IHByZXNlcnZlU3RhdGU6IHRydWUgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYWRkSXRlbVByb21wdCkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVBZGRCdXR0b24odGhpcy5fb3B0aW9uc0RhdGEubGVuZ3RoID4gMSB8fCB0aGlzLl9vcHRpb25zVVJMKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWx0ZXJlZEFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd09wdGlvbnMoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkQXJyWzBdLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkID0gZmlsdGVyZWRBcnJbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldEZpbHRlcmVkT3B0aW9ucyhmaWx0ZXJlZEFycik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcCA9IDA7XG5cbiAgICBmdW5jdGlvbiBpc0V4YWN0TWF0Y2goaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5sYWJlbC50b0xvd2VyQ2FzZSgpID09PSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgbWFwIG9mIGtleUNvZGVzIHRvIGRpcmVjdGlvbnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBkaXJlY3Rpb25NYXAgPSB7ICc0MCc6IDEsICczOCc6IC0xIH07XG5cbi8qKlxuICogTGlzdCBrZXlkb3duIGhhbmRsZXJcbiAqIENoYW5nZXMgdGhlIHNlbGVjdGVkIGxpc3QgaXRlbSBieSBmaW5kaW5nIHRoZSBhZGphY2VudCBpdGVtIGFuZCBzZXR0aW5nIGl0IHRvIHNlbGVjdGVkLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGNoYW5nZVNlbGVjdGVkKHR5cGUsIGV2ZW50KSB7XG4gICAgLy9UT0RPIHRlc3QgbW9jaGFcbiAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uTWFwW2V2ZW50LmtleUNvZGVdO1xuXG4gICAgaWYoZGlyZWN0aW9uKVxuICAgICAgICBfY2hhbmdlU2VsZWN0ZWQuY2FsbCh0aGlzLCBkaXJlY3Rpb24pO1xufVxuXG5mdW5jdGlvbiBfY2hhbmdlU2VsZWN0ZWQoZGlyZWN0aW9uKSB7XG4gICAgLy8gVE9ETzogcmVmYWN0b3IgYW5kIHRpZHkgdXAsIGxvb2tzIGxpa2Ugc29tZSBjb2RlIGR1cGxpY2F0aW9uLlxuICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnLnNlbGVjdGVkJylbMF1cbiAgICAgICAgLCBzY3JvbGxQb3MgPSB0aGlzLl9jb21ib0xpc3QuZWwuc2Nyb2xsVG9wXG4gICAgICAgICwgc2VsZWN0ZWRQb3MgPSBzZWxlY3RlZCA/IHNlbGVjdGVkLm9mZnNldFRvcCA6IDBcbiAgICAgICAgLCByZWxhdGl2ZVBvcyA9IHNlbGVjdGVkUG9zIC0gc2Nyb2xsUG9zO1xuXG4gICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgIHZhciBpbmRleCA9IF9nZXREYXRhVmFsdWVGcm9tRWxlbWVudC5jYWxsKHRoaXMsIHNlbGVjdGVkKVxuICAgICAgICAgICAgLCB0aGlzSXRlbSA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbaW5kZXhdXG4gICAgICAgICAgICAsIGFkakl0ZW0gPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhW2luZGV4ICsgZGlyZWN0aW9uXTtcblxuICAgICAgICBpZiAoYWRqSXRlbSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXNJdGVtLnNlbGVjdGVkO1xuICAgICAgICAgICAgYWRqSXRlbS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZCA9IGFkakl0ZW07XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbMF0pIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbMF0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBvcyA+IHRoaXMuX29wdGlvbnNIZWlnaHQgLSB0aGlzLl9lbGVtZW50SGVpZ2h0KjIgJiYgZGlyZWN0aW9uID09PSAxKVxuICAgICAgICB0aGlzLl9jb21ib0xpc3QuZWwuc2Nyb2xsVG9wICs9IHRoaXMuX2VsZW1lbnRIZWlnaHQqZGlyZWN0aW9uKjU7XG5cbiAgICBpZiAocmVsYXRpdmVQb3MgPCB0aGlzLl9lbGVtZW50SGVpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gLTEpXG4gICAgICAgIHRoaXMuX2NvbWJvTGlzdC5lbC5zY3JvbGxUb3AgKz0gdGhpcy5fZWxlbWVudEhlaWdodCpkaXJlY3Rpb24qNTtcbn1cblxuXG4vKipcbiAqIE1vdXNlIG92ZXIgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91c2VPdmVyKHR5cGUsIGV2ZW50KSB7XG4gICAgdGhpcy5fbW91c2VJc092ZXIgPSB0cnVlO1xufVxuXG5cbi8qKlxuICogTW91c2UgbGVhdmUgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91c2VMZWF2ZSh0eXBlLCBldmVudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9tb3VzZUlzT3ZlciA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9tb3VzZU91dFRpbWVyKSBjbGVhckludGVydmFsKHRoaXMuX21vdXNlT3V0VGltZXIpO1xuICAgIHRoaXMuX21vdXNlT3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICghc2VsZi5fbW91c2VJc092ZXIpXG4gICAgICAgICAgICBfb25Nb3VzZUxlYXZlLmNhbGwoc2VsZik7XG4gICAgfSwgNzUwKTtcbn1cblxuZnVuY3Rpb24gX29uTW91c2VMZWF2ZSgpIHtcbiAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbn1cblxuXG4vKipcbiAqIElucHV0IGNsaWNrIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbklucHV0Q2xpY2sodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLnNob3dPcHRpb25zKCk7XG4gICAgaWYgKHRoaXMuX19zaG93QWRkT25DbGljaykgdGhpcy50b2dnbGVBZGRCdXR0b24odHJ1ZSk7XG59XG5cblxuLyoqXG4gKiBFbnRlciBrZXkgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uRW50ZXJLZXkodHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAxMykge1xuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWQpXG4gICAgICAgICAgICBfc2V0RGF0YS5jYWxsKHRoaXMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYnV0dG9uIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkFkZEJ0biAodHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgZGF0YSA9IHsgbGFiZWw6IHRoaXMuX2NvbWJvSW5wdXQuZWwudmFsdWUgfTtcbiAgICB0aGlzLnBvc3RNZXNzYWdlKCdhZGRpdGVtJywgZGF0YSk7XG4gICAgdGhpcy5ldmVudHMucG9zdE1lc3NhZ2UoJ21pbG9fc3VwZXJjb21ib2FkZGl0ZW0nLCBkYXRhKTtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSwgeyBwcmVzZXJ2ZVN0YXRlOiB0cnVlIH0pO1xuXG59XG5cbi8qKlxuICogTGlzdCBjbGljayBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25MaXN0Q2xpY2sgKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIGluZGV4ID0gX2dldERhdGFWYWx1ZUZyb21FbGVtZW50LmNhbGwodGhpcywgZXZlbnQudGFyZ2V0KTtcbiAgICB2YXIgZGF0YSA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbaW5kZXhdO1xuXG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBkYXRhO1xuICAgIF9zZXREYXRhLmNhbGwodGhpcyk7XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cblxuXG4vKipcbiAqIExpc3Qgc2Nyb2xsIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkxpc3RTY3JvbGwgKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIHNjcm9sbFBvcyA9IGV2ZW50LnRhcmdldC5zY3JvbGxUb3BcbiAgICAgICAgLCBkaXJlY3Rpb24gPSBzY3JvbGxQb3MgPiB0aGlzLl9sYXN0U2Nyb2xsUG9zID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAsIGZpcnN0Q2hpbGQgPSB0aGlzLl9jb21ib09wdGlvbnMuZWwubGFzdEVsZW1lbnRDaGlsZFxuICAgICAgICAsIGxhc3RDaGlsZCA9IHRoaXMuX2NvbWJvT3B0aW9ucy5lbC5maXJzdEVsZW1lbnRDaGlsZFxuICAgICAgICAsIGxhc3RFbFBvc2l0aW9uID0gZmlyc3RDaGlsZCA/IGZpcnN0Q2hpbGQub2Zmc2V0VG9wIDogMFxuICAgICAgICAsIGZpcnN0RWxQb3NpdGlvbiA9IGxhc3RDaGlsZCA/IGxhc3RDaGlsZC5vZmZzZXRUb3AgOiAwXG4gICAgICAgICwgZGlzdEZyb21MYXN0RWwgPSBsYXN0RWxQb3NpdGlvbiAtIHNjcm9sbFBvcyAtIHRoaXMuX29wdGlvbnNIZWlnaHQgKyB0aGlzLl9lbGVtZW50SGVpZ2h0XG4gICAgICAgICwgZGlzdEZyb21GaXJzdEVsID0gc2Nyb2xsUG9zIC0gZmlyc3RFbFBvc2l0aW9uXG4gICAgICAgICwgZWxzRnJvbVN0YXJ0ID0gTWF0aC5mbG9vcihkaXN0RnJvbUZpcnN0RWwgLyB0aGlzLl9lbGVtZW50SGVpZ2h0KVxuICAgICAgICAsIGVsc1RvVGhlRW5kID0gTWF0aC5mbG9vcihkaXN0RnJvbUxhc3RFbCAvIHRoaXMuX2VsZW1lbnRIZWlnaHQpXG4gICAgICAgICwgdG90YWxFbGVtZW50c0JlZm9yZSA9IE1hdGguZmxvb3Ioc2Nyb2xsUG9zIC8gdGhpcy5fZWxlbWVudEhlaWdodCkgLSBCVUZGRVI7XG5cbiAgICBpZiAoKGRpcmVjdGlvbiA9PSAnZG93bicgJiYgZWxzVG9UaGVFbmQgPCBCVUZGRVIpXG4gICAgICAgIHx8IChkaXJlY3Rpb24gPT0gJ3VwJyAmJiBlbHNGcm9tU3RhcnQgPCBCVUZGRVIpKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0SW5kZXggPSB0b3RhbEVsZW1lbnRzQmVmb3JlID4gMCA/IHRvdGFsRWxlbWVudHNCZWZvcmUgOiAwO1xuICAgICAgICB0aGlzLl9lbmRJbmRleCA9IHRvdGFsRWxlbWVudHNCZWZvcmUgKyBNQVhfUkVOREVSRUQ7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRIZWlnaHQgPSBmaXJzdENoaWxkLnN0eWxlLmhlaWdodDtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgdGhpcy5fbGFzdFNjcm9sbFBvcyA9IHNjcm9sbFBvcztcbn1cblxuXG4vKipcbiAqIFByaXZhdGUgbWV0aG9kXG4gKiBSZXRyaWV2ZXMgdGhlIGRhdGEtdmFsdWUgYXR0cmlidXRlIHZhbHVlIGZyb20gdGhlIGVsZW1lbnQgYW5kIHJldHVybnMgaXQgYXMgYW4gaW5kZXggb2ZcbiAqIHRoZSBmaWx0ZXJlZE9wdGlvbnNcbiAqXG4gKiBAcGFyYW0gIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBfZ2V0RGF0YVZhbHVlRnJvbUVsZW1lbnQoZWwpIHtcbiAgICByZXR1cm4gTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScpKSArIHRoaXMuX3N0YXJ0SW5kZXg7XG59XG5cbi8qKlxuICogUHJpdmF0ZSBtZXRob2RcbiAqIFNldHMgdGhlIGRhdGEgb2YgdGhlIFN1cGVyQ29tYm8sIHRha2luZyBjYXJlIHRvIHJlc2V0IHNvbWUgdGhpbmdzIGFuZCB0ZW1wb3JhcmlseVxuICogdW5zdWJzY3JpYmUgZGF0YSBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIF9zZXREYXRhKCkge1xuICAgIGRlbGV0ZSB0aGlzLl9zZWxlY3RlZC5zZWxlY3RlZDtcbiAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5vZmYoJycsIHsgc3Vic2NyaWJlcjogb25EYXRhQ2hhbmdlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vc3VwZXJjb21ibyBsaXN0ZW5lcnMgb2ZmXG4gICAgdGhpcy5kYXRhLnNldCh0aGlzLl9zZWxlY3RlZCk7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19DSEFOR0VfTUVTU0FHRSk7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uRGF0YUNoYW5nZSwgY29udGV4dDogdGhpcyB9KTtcbiAgICAvL3N1cGVyY29tYm8gbGlzdGVuZXJzIG9uXG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBudWxsO1xuICAgIHRoaXMuc2V0RmlsdGVyZWRPcHRpb25zKHRoaXMuX29wdGlvbnNEYXRhKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MVGV4dCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxUZXh0Jywge1xuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktdGV4dCdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFRleHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MVGV4dDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXI7XG5cblxudmFyIE1MVGV4dGFyZWEgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MVGV4dGFyZWEnLCB7XG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS10ZXh0YXJlYSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFRleHRhcmVhKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFRleHRhcmVhO1xuXG5cbnZhciBTQU1QTEVfQVVUT1JFU0laRV9URVhUID0gJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ZXIgYWRpcGlzY2luZyBlbGl0LCc7XG5cblxuXy5leHRlbmRQcm90byhNTFRleHRhcmVhLCB7XG4gICAgc3RhcnRBdXRvcmVzaXplOiBNTFRleHRhcmVhJHN0YXJ0QXV0b3Jlc2l6ZSxcbiAgICBzdG9wQXV0b3Jlc2l6ZTogTUxUZXh0YXJlYSRzdG9wQXV0b3Jlc2l6ZSxcbiAgICBpc0F1dG9yZXNpemVkOiBNTFRleHRhcmVhJGlzQXV0b3Jlc2l6ZWQsXG4gICAgZGlzYWJsZTogTUxUZXh0YXJlYSRkaXNhYmxlXG59KTtcblxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJHN0YXJ0QXV0b3Jlc2l6ZShvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMuX2F1dG9yZXNpemUpXG4gICAgICAgIHJldHVybiBsb2dnZXIud2FybignTUxUZXh0YXJlYSBzdGFydEF1dG9yZXNpemU6IGF1dG9yZXNpemUgaXMgYWxyZWFkeSBvbicpO1xuICAgIHRoaXMuX2F1dG9yZXNpemUgPSB0cnVlO1xuICAgIHRoaXMuX2F1dG9yZXNpemVPcHRpb25zID0gb3B0aW9ucztcblxuICAgIF9hZGp1c3RBcmVhSGVpZ2h0LmNhbGwodGhpcyk7XG4gICAgX21hbmFnZVN1YnNjcmlwdGlvbnMuY2FsbCh0aGlzLCAnb24nKTtcbn1cblxuXG5mdW5jdGlvbiBfbWFuYWdlU3Vic2NyaXB0aW9ucyhvbk9mZikge1xuICAgIHRoaXMuZXZlbnRzW29uT2ZmXSgnY2xpY2snLCB7IHN1YnNjcmliZXI6IF9hZGp1c3RBcmVhSGVpZ2h0LCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIHRoaXMuZGF0YVtvbk9mZl0oJycsIHsgc3Vic2NyaWJlcjogX2FkanVzdEFyZWFIZWlnaHQsIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cblxuZnVuY3Rpb24gX2FkanVzdEFyZWFIZWlnaHQoKSB7XG4gICAgdGhpcy5lbC5zdHlsZS5oZWlnaHQgPSAwO1xuXG4gICAgdmFyIG5ld0hlaWdodCA9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0XG4gICAgICAgICwgbWluSGVpZ2h0ID0gdGhpcy5fYXV0b3Jlc2l6ZU9wdGlvbnMubWluSGVpZ2h0XG4gICAgICAgICwgbWF4SGVpZ2h0ID0gdGhpcy5fYXV0b3Jlc2l6ZU9wdGlvbnMubWF4SGVpZ2h0O1xuXG4gICAgbmV3SGVpZ2h0ID0gbmV3SGVpZ2h0ID49IG1heEhlaWdodFxuICAgICAgICAgICAgICAgID8gbWF4SGVpZ2h0XG4gICAgICAgICAgICAgICAgOiBuZXdIZWlnaHQgPD0gbWluSGVpZ2h0XG4gICAgICAgICAgICAgICAgPyBtaW5IZWlnaHRcbiAgICAgICAgICAgICAgICA6IG5ld0hlaWdodDtcblxuICAgIHRoaXMuZWwuc3R5bGUuaGVpZ2h0ID0gbmV3SGVpZ2h0ICsgJ3B4Jztcbn1cblxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJHN0b3BBdXRvcmVzaXplKCkge1xuICAgIGlmICghIHRoaXMuX2F1dG9yZXNpemUpXG4gICAgICAgIHJldHVybiBsb2dnZXIud2FybignTUxUZXh0YXJlYSBzdG9wQXV0b3Jlc2l6ZTogYXV0b3Jlc2l6ZSBpcyBub3Qgb24nKTtcbiAgICB0aGlzLl9hdXRvcmVzaXplID0gZmFsc2U7XG4gICAgX21hbmFnZVN1YnNjcmlwdGlvbnMuY2FsbCh0aGlzLCAnb2ZmJyk7XG59XG5cblxuZnVuY3Rpb24gTUxUZXh0YXJlYSRpc0F1dG9yZXNpemVkKCkge1xuICAgIHJldHVybiB0aGlzLl9hdXRvcmVzaXplO1xufVxuXG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fYXV0b3Jlc2l6ZSlcbiAgICAgICAgdGhpcy5zdG9wQXV0b3Jlc2l6ZSgpO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJGRpc2FibGUoZGlzYWJsZSkge1xuICAgIHRoaXMuZWwuZGlzYWJsZWQgPSBkaXNhYmxlO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MVGltZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxUaW1lJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTFRpbWVfZ2V0LFxuICAgICAgICBzZXQ6IE1MVGltZV9zZXQsXG4gICAgICAgIGRlbDogTUxUaW1lX2RlbCxcbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS10aW1lJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MVGltZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxUaW1lO1xuXG5cbnZhciBUSU1FX1JFR0VYID0gL14oWzAtOV17MSwyfSkoPzpcXDp8XFwuKShbMC05XXsxLDJ9KSQvXG4gICAgLCBUSU1FX1RFTVBMQVRFID0gJ2hoOm1tJztcblxuZnVuY3Rpb24gTUxUaW1lX2dldCgpIHtcbiAgICB2YXIgdGltZVN0ciA9IHRoaXMuZWwudmFsdWU7XG4gICAgdmFyIG1hdGNoID0gdGltZVN0ci5tYXRjaChUSU1FX1JFR0VYKTtcbiAgICBpZiAoISBtYXRjaCkgcmV0dXJuO1xuICAgIHZhciBob3VycyA9IG1hdGNoWzFdXG4gICAgICAgICwgbWlucyA9IG1hdGNoWzJdO1xuICAgIGlmIChob3VycyA+IDIzIHx8IG1pbnMgPiA1OSkgcmV0dXJuO1xuICAgIHZhciB0aW1lID0gbmV3IERhdGUoMTk3MCwgMCwgMSwgaG91cnMsIG1pbnMpO1xuXG4gICAgcmV0dXJuIF8udG9EYXRlKHRpbWUpO1xufVxuXG5cbmZ1bmN0aW9uIE1MVGltZV9zZXQodmFsdWUpIHtcbiAgICB2YXIgdGltZSA9IF8udG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoISB0aW1lKSB7XG4gICAgICAgIHRoaXMuZWwudmFsdWUgPSAnJztcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aW1lU3RyID0gVElNRV9URU1QTEFURVxuICAgICAgICAgICAgLnJlcGxhY2UoJ2hoJywgcGFkKHRpbWUuZ2V0SG91cnMoKSkpXG4gICAgICAgICAgICAucmVwbGFjZSgnbW0nLCBwYWQodGltZS5nZXRNaW51dGVzKCkpKTtcblxuICAgIHRoaXMuZWwudmFsdWUgPSB0aW1lU3RyO1xuICAgIHJldHVybiB0aW1lU3RyO1xuXG4gICAgZnVuY3Rpb24gcGFkKG4pIHtyZXR1cm4gbiA8IDEwID8gJzAnICsgbiA6IG47IH1cbn1cblxuXG5mdW5jdGlvbiBNTFRpbWVfZGVsKCkge1xuICAgIHRoaXMuZWwudmFsdWUgPSAnJztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MV3JhcHBlciA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxXcmFwcGVyJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktd3JhcHBlcidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFdyYXBwZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MV3JhcHBlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGNvbXBvbmVudE5hbWUgPSBtaWxvLnV0aWwuY29tcG9uZW50TmFtZVxuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgY2hlY2sgPSBtaWxvLnV0aWwuY2hlY2tcbiAgICAsIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cblxudmFyIEFMRVJUX0NTU19DTEFTU0VTID0ge1xuICAgIHN1Y2Nlc3M6ICdhbGVydC1zdWNjZXNzJyxcbiAgICB3YXJuaW5nOiAnYWxlcnQtd2FybmluZycsXG4gICAgaW5mbzogJ2FsZXJ0LWluZm8nLFxuICAgIGRhbmdlcjogJ2FsZXJ0LWRhbmdlcicsXG4gICAgZml4ZWQ6ICdhbGVydC1maXhlZCdcbn07XG5cblxudmFyIE1MQWxlcnQgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQWxlcnQnLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogWydtbC1icy1hbGVydCcsICdhbGVydCcsICdmYWRlJ10sXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICdyb2xlJzogJ2FsZXJ0JyxcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJ1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ1xcXG4gICAgICAgICAgICB7ez8gaXQuY2xvc2UgfX1cXFxuICAgICAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cIltldmVudHNdOmNsb3NlQnRuXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L2J1dHRvbj5cXFxuICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAge3s9IGl0Lm1lc3NhZ2V9fSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEFsZXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEFsZXJ0O1xuXG5cbl8uZXh0ZW5kKE1MQWxlcnQsIHtcbiAgICBjcmVhdGVBbGVydDogTUxBbGVydCQkY3JlYXRlQWxlcnQsXG4gICAgb3BlbkFsZXJ0OiBNTEFsZXJ0JCRvcGVuQWxlcnQsXG59KTtcblxuXG5fLmV4dGVuZFByb3RvKE1MQWxlcnQsIHtcbiAgICBvcGVuQWxlcnQ6IE1MQWxlcnQkb3BlbkFsZXJ0LFxuICAgIGNsb3NlQWxlcnQ6IE1MQWxlcnQkY2xvc2VBbGVydFxufSk7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgbmV3IGFsZXJ0IGluc3RhbmNlLiBUbyBjcmVhdGUgYW5kIG9wZW4gYXQgdGhlIHNhbWUgdGltZSB1c2UgW29wZW5BbGVydF0oI01MQWxlcnQkJG9wZW5BbGVydClcbiAqIGBvcHRpb25zYCBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAgICBtZXNzYWdlOiBzdHJpbmcgYWxlcnQgbWVzc2FnZVxuICogICAgICB0eXBlOiAgICBvcHRpb25hbCBzdHJpbmcgdGhlIHR5cGUgb2YgYWxlcnQgbWVzc2FnZSwgb25lIG9mIHN1Y2Nlc3MsIHdhcm5pbmcsIGluZm8sIGRhbmdlciwgZml4ZWRcbiAqICAgICAgICAgICAgICAgZGVmYXVsdCAnaW5mbydcbiAqICAgICAgY2xvc2U6ICAgb3B0aW9uYWwgZmFsc2UgdG8gcHJldmVudCB1c2VyIGZyb20gY2xvc2luZ1xuICogICAgICAgICAgICAgICBvciB0cnVlIChkZWZhdWx0KSB0byBlbmFibGUgY2xvc2luZyBhbmQgcmVuZGVyIGEgY2xvc2UgYnV0dG9uXG4gKiAgICAgIHRpbWVvdXQ6IG9wdGlvbmFsIHRpbWVyLCBpbiBtaWxsaXNlY29uZHMgdG8gYXV0b21hdGljYWxseSBjbG9zZSB0aGUgYWxlcnRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBhbGVydCBjb25maWd1cmF0aW9uXG4gKi9cbmZ1bmN0aW9uIE1MQWxlcnQkJGNyZWF0ZUFsZXJ0KG9wdGlvbnMpIHtcbiAgICBjaGVjayhvcHRpb25zLCB7XG4gICAgICAgIG1lc3NhZ2U6IFN0cmluZyxcbiAgICAgICAgdHlwZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgY2xvc2U6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgICB0aW1lb3V0OiBNYXRjaC5PcHRpb25hbChOdW1iZXIpXG4gICAgfSk7XG5cbiAgICB2YXIgYWxlcnQgPSBNTEFsZXJ0LmNyZWF0ZU9uRWxlbWVudCgpO1xuXG4gICAgb3B0aW9ucyA9IF9wcmVwYXJlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIHZhciBhbGVydENscyA9IEFMRVJUX0NTU19DTEFTU0VTW29wdGlvbnMudHlwZV07XG4gICAgYWxlcnQuZG9tLmFkZENzc0NsYXNzZXMoYWxlcnRDbHMpO1xuXG4gICAgYWxlcnQuX2FsZXJ0ID0ge1xuICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG5cbiAgICBhbGVydC50ZW1wbGF0ZS5yZW5kZXIob3B0aW9ucykuYmluZGVyKCk7XG5cbiAgICB2YXIgYWxlcnRTY29wZSA9IGFsZXJ0LmNvbnRhaW5lci5zY29wZTtcblxuICAgIGlmIChvcHRpb25zLmNsb3NlKVxuICAgICAgICBhbGVydFNjb3BlLmNsb3NlQnRuLmV2ZW50cy5vbignY2xpY2snLFxuICAgICAgICAgICAgeyBzdWJzY3JpYmVyOiBfb25DbG9zZUJ0bkNsaWNrLCBjb250ZXh0OiBhbGVydCB9KTtcblxuICAgIGlmIChvcHRpb25zLnRpbWVvdXQpXG4gICAgICAgIHZhciB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKGFsZXJ0Ll9hbGVydC52aXNpYmxlKVxuICAgICAgICAgICAgICAgIGFsZXJ0LmNsb3NlQWxlcnQoKTtcbiAgICAgICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcblxuICAgIHJldHVybiBhbGVydDtcbn1cblxuXG4vKipcbiAqIENyZWF0ZSBhbmQgc2hvdyBhbGVydCBwb3B1cFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIG9iamVjdCB3aXRoIG1lc3NhZ2UsIHR5cGUsIGNsb3NlIGFuZCB0aW1lb3V0XG4gKiBAcmV0dXJuIHtNTEFsZXJ0fSB0aGUgYWxlcnQgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gTUxBbGVydCQkb3BlbkFsZXJ0KG9wdGlvbnMpIHtcbiAgICB2YXIgYWxlcnQgPSBNTEFsZXJ0LmNyZWF0ZUFsZXJ0KG9wdGlvbnMpO1xuICAgIGFsZXJ0Lm9wZW5BbGVydCgpO1xuICAgIHJldHVybiBhbGVydDtcbn1cblxuXG5mdW5jdGlvbiBfb25DbG9zZUJ0bkNsaWNrKHR5cGUsIGV2ZW50KSB7XG4gICAgdGhpcy5jbG9zZUFsZXJ0KCk7XG59XG5cblxuZnVuY3Rpb24gX3ByZXBhcmVPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gXy5jbG9uZShvcHRpb25zKTtcbiAgICBvcHRpb25zLmNsb3NlID0gdHlwZW9mIG9wdGlvbnMuY2xvc2UgPT0gJ3VuZGVmaW5lZCcgfHwgb3B0aW9ucy5jbG9zZSA9PT0gdHJ1ZTtcbiAgICBvcHRpb25zLnRpbWVvdXQgPSBNYXRoLmZsb29yKG9wdGlvbnMudGltZW91dCk7XG4gICAgb3B0aW9ucy50eXBlID0gb3B0aW9ucy50eXBlIHx8ICdpbmZvJztcblxuICAgIHJldHVybiBvcHRpb25zO1xufVxuXG5cbi8qKlxuICogT3BlbiB0aGUgYWxlcnRcbiAqL1xuZnVuY3Rpb24gTUxBbGVydCRvcGVuQWxlcnQoKSB7XG4gICAgX3RvZ2dsZUFsZXJ0LmNhbGwodGhpcywgdHJ1ZSk7XG59XG5cblxuLyoqXG4gKiBDbG9zZSB0aGUgYWxlcnRcbiAqL1xuZnVuY3Rpb24gTUxBbGVydCRjbG9zZUFsZXJ0KCkge1xuICAgIF90b2dnbGVBbGVydC5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbn1cblxuXG5mdW5jdGlvbiBfdG9nZ2xlQWxlcnQoZG9TaG93KSB7XG4gICAgZG9TaG93ID0gdHlwZW9mIGRvU2hvdyA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgID8gISB0aGlzLl9hbGVydC52aXNpYmxlXG4gICAgICAgICAgICAgICAgOiAhISBkb1Nob3c7XG5cbiAgICB2YXIgYWRkUmVtb3ZlID0gZG9TaG93ID8gJ2FkZCcgOiAncmVtb3ZlJ1xuICAgICAgICAsIGFwcGVuZFJlbW92ZSA9IGRvU2hvdyA/ICdhcHBlbmRDaGlsZCcgOiAncmVtb3ZlQ2hpbGQnO1xuXG4gICAgdGhpcy5fYWxlcnQudmlzaWJsZSA9IGRvU2hvdztcblxuICAgIGRvY3VtZW50LmJvZHlbYXBwZW5kUmVtb3ZlXSh0aGlzLmVsKTtcbiAgICB0aGlzLmRvbS50b2dnbGUoZG9TaG93KTtcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAhZG9TaG93KTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdFthZGRSZW1vdmVdKCdpbicpO1xuICAgIHRoaXMuZWxbZG9TaG93ID8gJ2ZvY3VzJyA6ICdibHVyJ10oKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGNvbXBvbmVudE5hbWUgPSBtaWxvLnV0aWwuY29tcG9uZW50TmFtZVxuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgY2hlY2sgPSBtaWxvLnV0aWwuY2hlY2tcbiAgICAsIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cblxudmFyIERFRkFVTFRfQlVUVE9OUyA9IFsgeyB0eXBlOiAnZGVmYXVsdCcsIGxhYmVsOiAnT0snLCByZXN1bHQ6ICdPSycgfSBdO1xuXG52YXIgQ0xPU0VfT1BUSU9OUyA9IFsnYmFja2Ryb3AnLCAna2V5Ym9hcmQnLCAnYnV0dG9uJ107XG5cbnZhciBCVVRUT05fQ1NTX0NMQVNTRVMgPSB7IC8vIFRPRE8gLSB1c2UgaW4gdGVtcGxhdGVcbiAgICBkZWZhdWx0OiAnYnRuLWRlZmF1bHQnLFxuICAgIHByaW1hcnk6ICdidG4tcHJpbWFyeScsXG4gICAgc3VjY2VzczogJ2J0bi1zdWNjZXNzJyxcbiAgICBpbmZvOiAnYnRuLWluZm8nLFxuICAgIHdhcm5pbmc6ICdidG4td2FybmluZycsXG4gICAgZGFuZ2VyOiAnYnRuLWRhbmdlcicsXG4gICAgbGluazogJ2J0bi1saW5rJ1xufTtcblxuXG4vKipcbiAqIERpYWxvZyBjbGFzcyB0byBzaG93IGN1c3RvbSBkaWFsb2cgYm94ZXMgYmFzZWQgb24gY29uZmlndXJhdGlvbiAtIHNlZSBbY3JlYXRlRGlhbG9nXSgjTUxEaWFsb2ckJGNyZWF0ZURpYWxvZykgbWV0aG9kLlxuICogT25seSBvbmUgZGlhbG9nIGNhbiBiZSBvcGVuZWQgYXQgYSB0aW1lIC0gdHJ5aW5nIHRvIG9wZW4gYW5vdGhlciB3aWxsIGxvZyBlcnJvciB0byBjb25zb2xlLiBDdXJyZW50bHkgb3BlbmVkIGRpYWxvZyBjYW4gYmUgcmV0cmlldmVkIHVzaW5nIFtnZXRDdXJyZW50RGlhbG9nXSgjTUxEaWFsb2ckJGdldEN1cnJlbnREaWFsb2cpIGNsYXNzIG1ldGhvZC5cbiAqL1xudmFyIE1MRGlhbG9nID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTERpYWxvZycsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiBbJ21sLWJzLWRpYWxvZycsICdtb2RhbCcsICdmYWRlJ10sXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICdyb2xlJzogJ2RpYWxvZycsXG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAndHJ1ZSdcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICdcXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZyB7ez0gaXQuY3NzQ2xhc3MgfX1cIj5cXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+XFxcbiAgICAgICAgICAgICAgICAgICAge3s/IGl0LnRpdGxlIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PyBpdC5jbG9zZS5idXR0b24gfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG1sLWJpbmQ9XCJbZXZlbnRzXTpjbG9zZUJ0blwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCI+JnRpbWVzOzwvYnV0dG9uPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+e3s9IGl0LnRpdGxlIH19PC9oND5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICB7ez8gaXQuaHRtbCB8fCBpdC50ZXh0IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCIgbWwtYmluZD1cIltjb250YWluZXJdOmRpYWxvZ0JvZHlcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PyBpdC5odG1sIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s9IGl0Lmh0bWwgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7Pz99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPnt7PSBpdC50ZXh0IH19PC9wPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICB7ez8gaXQuYnV0dG9ucyAmJiBpdC5idXR0b25zLmxlbmd0aCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZm9vdGVyXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e34gaXQuYnV0dG9ucyA6YnRuIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCJcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidG4gYnRuLXt7PSBidG4udHlwZSB9fXt7PyBidG4uY2xzIH19IHt7PSBidG4uY2xzIH19e3s/fX1cIlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtbC1iaW5kPVwiW2V2ZW50c106e3s9IGJ0bi5uYW1lIH19XCI+e3s9IGJ0bi5sYWJlbCB9fTwvYnV0dG9uPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3t+fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICA8L2Rpdj4nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEaWFsb2cpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRGlhbG9nO1xuXG5cbl8uZXh0ZW5kKE1MRGlhbG9nLCB7XG4gICAgY3JlYXRlRGlhbG9nOiBNTERpYWxvZyQkY3JlYXRlRGlhbG9nLFxuICAgIG9wZW5EaWFsb2c6IE1MRGlhbG9nJCRvcGVuRGlhbG9nLFxuICAgIGdldE9wZW5lZERpYWxvZzogTUxEaWFsb2ckJGdldE9wZW5lZERpYWxvZ1xufSk7XG5cblxuXy5leHRlbmRQcm90byhNTERpYWxvZywge1xuICAgIG9wZW5EaWFsb2c6IE1MRGlhbG9nJG9wZW5EaWFsb2csXG4gICAgY2xvc2VEaWFsb2c6IE1MRGlhbG9nJGNsb3NlRGlhbG9nLFxuICAgIGRlc3Ryb3k6IE1MRGlhbG9nJGRlc3Ryb3lcbn0pO1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgcmV0dXJucyBkaWFsb2cgaW5zdGFuY2UuIFRvIGNyZWF0ZSBhbmQgb3BlbiBhdCB0aGUgc2FtZSB0aW1lIFtvcGVuRGlhbG9nXSgjTUxEaWFsb2ckJG9wZW5EaWFsb2cpXG4gKiBgb3B0aW9uc2AgaXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgICB0aXRsZTogb3B0aW9uYWwgZGlhbG9nIHRpdGxlXG4gKiAgICAgaHRtbDogb3B0aW9uYWwgZGlhbG9nIHRleHQgYXMgaHRtbCAod2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0ZXh0IGlmIGJvdGggdGV4dCBuZCBodG1sIGFyZSBwYXNzZWQpXG4gKiAgICAgICBvclxuICogICAgIHRleHQ6IG9wdGlvbmFsIGRpYWxvZyB0ZXh0XG4gKiAgICAgY2xvc2U6IG9wdGlvbmFsIGZhbHNlIHRvIHByZXZlbnQgYmFja2Ryb3AgYW5kIGVzYyBrZXkgZnJvbSBjbG9zaW5nIHRoZSBkaWFsb2cgYW5kIHJlbW92aW5nIGNsb3NlIGJ1dHRvbiBpbiB0b3AgcmlnaHQgY29ybmVyXG4gKiAgICAgICAgICAgIG9yIHRydWUgKGRlZmF1bHQpIHRvIGVuYWJsZSBhbGwgY2xvc2Ugb3B0aW9uc1xuICogICAgICAgICAgICBvciBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzXG4gKiAgICAgICAgIGJhY2tkcm9wOiBmYWxzZSBvciB0cnVlIChkZWZhdWx0KSwgY2xvc2UgZGlhbG9nIHdoZW4gYmFja2Ryb3AgY2xpY2tlZFxuICogICAgICAgICBrZXlib2FyZDogZmFsc2Ugb3IgdHJ1ZSAoZGVmYXVsdCksIGNsb3NlIGRpYWxvZyB3aGVuIGVzYyBrZXkgaXMgcHJlc3NlZFxuICogICAgICAgICBidXR0b246IGZhbHNlIG9yIHRydWUgKGRlZmF1bHQpLCBzaG93IGNsb3NlIGJ1dHRvbiBpbiB0aGUgaGVhZGVyICh3b24ndCBiZSBzaG93biBpZiB0aGVyZSBpcyBubyBoZWFkZXIgd2hlbiB0aXRsZSBpcyBub3QgcGFzc2VkKVxuICogICAgIGJ1dHRvbnM6IG9wdGlvbmFsIGFycmF5IG9mIGJ1dHRvbnMgY29uZmlndXJhdGlvbnMsIHdoZXJlIGVhY2ggYnV0dG9uIGNvbmZpZyBpcyBhbiBvYmplY3RcbiAqICAgICAgICAgbmFtZTogICBvcHRpb25hbCBuYW1lIG9mIGNvbXBvbmVudCwgc2hvdWxkIGJlIHVuaXF1ZSBhbmQgc2hvdWxkIG5vdCBiZSBgY2xvc2VCdG5gLCBpZiBub3QgcGFzc2VkIGEgdGltZXN0YW1wIGJhc2VkIG5hbWUgd2lsbCBiZSB1c2VkXG4gKiAgICAgICAgIHR5cGU6ICAgYnV0dG9uIHR5cGUsIHdpbGwgZGV0ZXJtaW5lIGJ1dHRvbiBDU1Mgc3R5bGUuIFBvc3NpYmxlIHR5cGVzIGFyZTogZGVmdWx0LCBwcmltYXJ5LCBzdWNjZXNzLCBpbmZvLCB3YXJuaW5nLCBkYW5nZXIsIGxpbmsgKG1hcCB0byByZWxhdGVkIGJvb3RzdHJhcCBidXR0b24gc3R5bGVzKVxuICogICAgICAgICBsYWJlbDogIGJ1dHRvbiBsYWJlbFxuICogICAgICAgICBjbG9zZTogIG9wdGlvbmFsIGZhbHNlIHRvIHByZXZlbnQgdGhpcyBidXR0b24gZnJvbSBjbG9zaW5nIGRpYWxvZ1xuICogICAgICAgICByZXN1bHQ6IHN0cmluZyB3aXRoIGRpYWxvZyBjbG9zZSByZXN1bHQgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byBkaWFsb2cgc3Vic2NyaWJlciBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gKiAgICAgICAgIGRhdGE6ICAgYW55IHZhbHVlL29iamVjdCBvciBmdW5jdGlvbiB0byBjcmVhdGUgZGF0YSB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIGRpYWxvZyBzdWJzY3JpYmVyIGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyLlxuICogICAgICAgICAgICAgICAgIElmIGZ1bmN0aW9uIGlzIHBhc3NlZCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGRpYWxvZyBhcyBjb250ZXh0IGFuZCBidXR0b24gb3B0aW9ucyBhcyBwYXJhbWV0ZXIuXG4gKlxuICogICAgIElmIGB0aXRsZWAgaXMgbm90IHBhc3NlZCwgZGlhbG9nIHdpbGwgbm90IGhhdmUgdGl0bGUgc2VjdGlvblxuICogICAgIElmIG5laXRoZXIgYHRleHRgIG5vciBgaHRtbGAgaXMgcGFzc2VkLCBkaWFsb2cgd2lsbCBub3QgaGF2ZSBib2R5IHNlY3Rpb24uXG4gKiAgICAgSWYgYGJ1dHRvbnNgIGFyZSBub3QgcGFzc2VkLCB0aGVyZSB3aWxsIG9ubHkgYmUgT0sgYnV0dG9uLlxuICpcbiAqIFdoZW4gZGlhbG9nIGlzIGNsb3NlZCwgdGhlIHN1YnNjcmliZXIgaXMgY2FsbGVkIHdpdGggcmVhdWx0IGFuZCBvcHRpb25hbCBkYXRhIGFzIGRlZmluZWQgaW4gYnV0dG9ucyBjb25maWd1cmF0aW9ucy5cbiAqIElmIGJhY2tkcm9wIGlzIGNsaWNrZWQgb3IgRVNDIGtleSBpcyBwcmVzc2VkIHRoZSByZXN1bHQgd2lsbCBiZSAnZGlzbWlzc2VkJ1xuICogSWYgY2xvc2UgYnV0dG9uIGluIHRoZSB0b3AgcmlnaHQgY29ybmVyIGlzIGNsaWNrZWQsIHRoZSByZXN1bHQgd2lsbCBiZSAnY2xvc2VkJyAoZGVmYXVsdCByZXN1bHQpXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgZGlhbG9nIGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGluaXRpYWxpemUgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgdG8gaW5pdGlhbGl6ZSB0aGUgZGlhbG9nXG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJCRjcmVhdGVEaWFsb2cob3B0aW9ucywgaW5pdGlhbGl6ZSkge1xuICAgIGNoZWNrKG9wdGlvbnMsIHtcbiAgICAgICAgdGl0bGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIGh0bWw6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIHRleHQ6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIGNsb3NlOiBNYXRjaC5PcHRpb25hbChNYXRjaC5PbmVPZihCb29sZWFuLCB7XG4gICAgICAgICAgICBiYWNrZHJvcDogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgICAgICBrZXlib2FyZDogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgICAgICBidXR0b246IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pXG4gICAgICAgIH0pKSxcbiAgICAgICAgYnV0dG9uczogTWF0Y2guT3B0aW9uYWwoWyB7XG4gICAgICAgICAgICBuYW1lOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICAgICAgbGFiZWw6IFN0cmluZyxcbiAgICAgICAgICAgIGNsb3NlOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgICAgIHJlc3VsdDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgICAgIGRhdGE6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLkFueSksXG4gICAgICAgICAgICBjbHM6IE1hdGNoLk9wdGlvbmFsKFN0cmluZylcbiAgICAgICAgfSBdKSxcbiAgICAgICAgY3NzQ2xhc3M6IE1hdGNoLk9wdGlvbmFsKFN0cmluZylcbiAgICB9KTtcblxuICAgIHZhciBkaWFsb2cgPSBNTERpYWxvZy5jcmVhdGVPbkVsZW1lbnQoKTtcblxuICAgIG9wdGlvbnMgPSBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgZGlhbG9nLl9kaWFsb2cgPSB7XG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcblxuICAgIGRpYWxvZy50ZW1wbGF0ZVxuICAgICAgICAucmVuZGVyKG9wdGlvbnMpXG4gICAgICAgIC5iaW5kZXIoKTtcblxuICAgIHZhciBkaWFsb2dTY29wZSA9IGRpYWxvZy5jb250YWluZXIuc2NvcGU7XG5cbiAgICBpZiAob3B0aW9ucy5jbG9zZS5iYWNrZHJvcClcbiAgICAgICAgZGlhbG9nLmV2ZW50cy5vbignY2xpY2snLFxuICAgICAgICAgICAgeyBzdWJzY3JpYmVyOiBfb25CYWNrZHJvcENsaWNrLCBjb250ZXh0OiBkaWFsb2cgfSk7XG5cbiAgICBpZiAob3B0aW9ucy50aXRsZSAmJiBvcHRpb25zLmNsb3NlLmJ1dHRvbilcbiAgICAgICAgZGlhbG9nU2NvcGUuY2xvc2VCdG4uZXZlbnRzLm9uKCdjbGljaycsXG4gICAgICAgICAgICB7IHN1YnNjcmliZXI6IF9vbkNsb3NlQnRuQ2xpY2ssIGNvbnRleHQ6IGRpYWxvZyB9KTtcblxuICAgIG9wdGlvbnMuYnV0dG9ucy5mb3JFYWNoKGZ1bmN0aW9uKGJ0bikge1xuICAgICAgICB2YXIgYnV0dG9uU3Vic2NyaWJlciA9IHtcbiAgICAgICAgICAgIHN1YnNjcmliZXI6IF8ucGFydGlhbChfZGlhbG9nQnV0dG9uQ2xpY2ssIGJ0biksXG4gICAgICAgICAgICBjb250ZXh0OiBkaWFsb2dcbiAgICAgICAgfTtcbiAgICAgICAgZGlhbG9nU2NvcGVbYnRuLm5hbWVdLmV2ZW50cy5vbignY2xpY2snLCBidXR0b25TdWJzY3JpYmVyKTtcbiAgICB9KTtcblxuICAgIGlmIChpbml0aWFsaXplKSBpbml0aWFsaXplKGRpYWxvZyk7XG4gICAgcmV0dXJuIGRpYWxvZztcbn1cblxuXG5mdW5jdGlvbiBfZGlhbG9nQnV0dG9uQ2xpY2soYnV0dG9uKSB7XG4gICAgaWYgKGJ1dHRvbi5jbG9zZSAhPT0gZmFsc2UpXG4gICAgICAgIF90b2dnbGVEaWFsb2cuY2FsbCh0aGlzLCBmYWxzZSk7XG5cbiAgICB2YXIgZGF0YSA9IF8ucmVzdWx0KGJ1dHRvbi5kYXRhLCB0aGlzLCBidXR0b24pO1xuICAgIF9kaXNwYXRjaFJlc3VsdC5jYWxsKHRoaXMsIGJ1dHRvbi5yZXN1bHQsIGRhdGEpO1xufVxuXG5cbmZ1bmN0aW9uIF9kaXNwYXRjaFJlc3VsdChyZXN1bHQsIGRhdGEpIHtcbiAgICB2YXIgc3Vic2NyaWJlciA9IHRoaXMuX2RpYWxvZy5zdWJzY3JpYmVyO1xuICAgIGlmICh0eXBlb2Ygc3Vic2NyaWJlciA9PSAnZnVuY3Rpb24nKVxuICAgICAgICBzdWJzY3JpYmVyLmNhbGwodGhpcywgcmVzdWx0LCBkYXRhKTtcbiAgICBlbHNlXG4gICAgICAgIHN1YnNjcmliZXIuc3Vic2NyaWJlci5jYWxsKHN1YnNjcmliZXIuY29udGV4dCwgcmVzdWx0LCBkYXRhKTtcbn1cblxuXG5mdW5jdGlvbiBfb25CYWNrZHJvcENsaWNrKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuZWwpXG4gICAgICAgIHRoaXMuY2xvc2VEaWFsb2coJ2Rpc21pc3NlZCcpO1xufVxuXG5cbmZ1bmN0aW9uIF9vbkNsb3NlQnRuQ2xpY2soKSB7XG4gICAgdGhpcy5jbG9zZURpYWxvZygnY2xvc2VkJyk7XG59XG5cblxuZnVuY3Rpb24gX29uS2V5RG93bihldmVudCkge1xuICAgIGlmIChvcGVuZWREaWFsb2dcbiAgICAgICAgICAgICYmIG9wZW5lZERpYWxvZy5fZGlhbG9nLm9wdGlvbnMuY2xvc2Uua2V5Ym9hcmRcbiAgICAgICAgICAgICYmIGV2ZW50LmtleUNvZGUgPT0gMjcpIC8vIGVzYyBrZXlcbiAgICAgICAgb3BlbmVkRGlhbG9nLmNsb3NlRGlhbG9nKCdkaXNtaXNzZWQnKTtcbn1cblxuXG5mdW5jdGlvbiBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBfLmNsb25lKG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuYnV0dG9ucyA9IF8uY2xvbmUob3B0aW9ucy5idXR0b25zIHx8IERFRkFVTFRfQlVUVE9OUyk7XG4gICAgb3B0aW9ucy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24oYnRuKSB7XG4gICAgICAgIGJ0bi5uYW1lID0gYnRuLm5hbWUgfHwgY29tcG9uZW50TmFtZSgpO1xuICAgIH0pO1xuXG4gICAgb3B0aW9ucy5jbG9zZSA9IHR5cGVvZiBvcHRpb25zLmNsb3NlID09ICd1bmRlZmluZWQnIHx8IG9wdGlvbnMuY2xvc2UgPT09IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXy5vYmplY3QoQ0xPU0VfT1BUSU9OUywgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdHlwZW9mIG9wdGlvbnMuY2xvc2UgPT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF8ubWFwVG9PYmplY3QoQ0xPU0VfT1BUSU9OUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ob3B0KSB7IHJldHVybiBvcHRpb25zLmNsb3NlW29wdF0gIT09IGZhbHNlOyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXy5vYmplY3QoQ0xPU0VfT1BUSU9OUywgZmFsc2UpO1xuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59XG5cblxuLyoqXG4gKiBDcmVhdGUgYW5kIHNob3cgZGlhbG9nIHBvcHVwXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0IHdpdGggdGl0bGUsIHRleHQgYW5kIGJ1dHRvbnMuIFNlZSBbY3JlYXRlRGlhbG9nXSgjTUxEaWFsb2ckJGNyZWF0ZURpYWxvZykgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gc3Vic2NyaWJlciBvcHRpb25hbCBzdWJzY3JpYmVyIGZ1bmN0aW9uIG9yIG9iamVjdCB0aGF0IGlzIHBhc3NlZCByZXN1bHQgYW5kIG9wdGlvbmFsIGRhdGEuIFVubGVzcyBjb250ZXh0IGlzIGRlZmluZWQsIGRpYWxvZyB3aWxsIGJlIHRoZSBjb250ZXh0LlxuICovXG5mdW5jdGlvbiBNTERpYWxvZyQkb3BlbkRpYWxvZyhvcHRpb25zLCBzdWJzY3JpYmVyLCBpbml0aWFsaXplKSB7XG4gICAgdmFyIGRpYWxvZyA9IE1MRGlhbG9nLmNyZWF0ZURpYWxvZyhvcHRpb25zLCBpbml0aWFsaXplKTtcbiAgICBkaWFsb2cub3BlbkRpYWxvZyhzdWJzY3JpYmVyKTtcbiAgICByZXR1cm4gZGlhbG9nO1xufVxuXG5cblxuZnVuY3Rpb24gX3RvZ2dsZURpYWxvZyhkb1Nob3cpIHtcbiAgICBkb1Nob3cgPSB0eXBlb2YgZG9TaG93ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgPyAhIHRoaXMuX2RpYWxvZy52aXNpYmxlXG4gICAgICAgICAgICAgICAgOiAhISBkb1Nob3c7XG5cbiAgICB2YXIgYWRkUmVtb3ZlID0gZG9TaG93ID8gJ2FkZCcgOiAncmVtb3ZlJ1xuICAgICAgICAsIGFwcGVuZFJlbW92ZSA9IGRvU2hvdyA/ICdhcHBlbmRDaGlsZCcgOiAncmVtb3ZlQ2hpbGQnO1xuXG4gICAgdGhpcy5fZGlhbG9nLnZpc2libGUgPSBkb1Nob3c7XG5cbiAgICBpZiAoZG9TaG93ICYmICEgZGlhbG9nc0luaXRpYWxpemVkKVxuICAgICAgICBfaW5pdGlhbGl6ZURpYWxvZ3MoKTtcblxuICAgIGRvY3VtZW50LmJvZHlbYXBwZW5kUmVtb3ZlXSh0aGlzLmVsKTtcbiAgICBpZiAoYmFja2Ryb3BFbClcbiAgICAgICAgZG9jdW1lbnQuYm9keVthcHBlbmRSZW1vdmVdKGJhY2tkcm9wRWwpO1xuICAgIHRoaXMuZG9tLnRvZ2dsZShkb1Nob3cpO1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFkb1Nob3cpO1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0W2FkZFJlbW92ZV0oJ21vZGFsLW9wZW4nKTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdFthZGRSZW1vdmVdKCdpbicpO1xuXG4gICAgb3BlbmVkRGlhbG9nID0gZG9TaG93ID8gdGhpcyA6IHVuZGVmaW5lZDtcbiAgICB0aGlzLmVsW2RvU2hvdyA/ICdmb2N1cycgOiAnYmx1ciddKCk7XG59XG5cblxudmFyIGRpYWxvZ3NJbml0aWFsaXplZCwgYmFja2Ryb3BFbDtcblxuZnVuY3Rpb24gX2luaXRpYWxpemVEaWFsb2dzKCkge1xuICAgIGJhY2tkcm9wRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBiYWNrZHJvcEVsLmNsYXNzTmFtZSA9ICdtb2RhbC1iYWNrZHJvcCBmYWRlIGluJztcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX29uS2V5RG93bik7XG4gICAgZGlhbG9nc0luaXRpYWxpemVkID0gdHJ1ZTtcbn1cblxuXG52YXIgb3BlbmVkRGlhbG9nO1xuXG4vKipcbiAqIE9wZW5zIGRpYWxvZyBpbnN0YW5jZS5cbiAqIFN1YnNjcmliZXIgb2JqZWN0IHNob3VsZCBoYXZlIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgc3Vic2NyaWJlciBmb3IgdGhlIE1lc3NlbmdlciAoYWx0aG91Z2ggTWVzc2VuZ2VyIGlzIG5vdCB1c2VkKSAtIGVpdGhlciBmdW5jdGlvbiBvciBvYmplY3Qgd2l0aCBzdWJzY3JpYmVyIGFuZCBjb250ZXh0IHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IHN1YnNjcmliZXIgc3Vic2NyaWJlciBvYmplY3RcbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckb3BlbkRpYWxvZyhzdWJzY3JpYmVyKSB7XG4gICAgY2hlY2soc3Vic2NyaWJlciwgTWF0Y2guT25lT2YoRnVuY3Rpb24sIHsgc3Vic2NyaWJlcjogRnVuY3Rpb24sIGNvbnRleHQ6IE1hdGNoLkFueSB9KSk7XG5cbiAgICBpZiAob3BlbmVkRGlhbG9nKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLndhcm4oJ01MRGlhbG9nIG9wZW5EaWFsb2c6IGNhblxcJ3Qgb3BlbiBkaWFsb2csIGFub3RoZXIgZGlhbG9nIGlzIGFscmVhZHkgb3BlbicpO1xuXG4gICAgdGhpcy5fZGlhbG9nLnN1YnNjcmliZXIgPSBzdWJzY3JpYmVyO1xuICAgIF90b2dnbGVEaWFsb2cuY2FsbCh0aGlzLCB0cnVlKTtcbn1cblxuXG4vKipcbiAqIENsb3NlcyBkaWFsb2cgaW5zdGFuY2UsIG9wdGlvbmFsbHkgcGFzc2luZyByZXN1bHQgYW5kIGRhdGEgdG8gZGlhbG9nIHN1YnNjcmliZXIuXG4gKiBJZiBubyByZXN1bHQgaXMgcGFzc2VkLCAnY2xvc2VkJyB3aWxsIGJlIHBhc3NlZCB0byBzdWJzY3JpYmVyLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByZXN1bHQgZGlhbG9nIHJlc3VsdCwgcGFzc2VkIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIgdG8gc3ViY3NyaWJlclxuICogQHBhcmFtIHtBbnl9IGRhdGEgb3B0aW9uYWwgZGlhbG9nIGRhdGEsIHBhc3NlZCBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBzdWJzY3JpYmVyXG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJGNsb3NlRGlhbG9nKHJlc3VsdCwgZGF0YSkge1xuICAgIGlmICghIG9wZW5lZERpYWxvZylcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTERpYWxvZyBjbG9zZURpYWxvZzogY2FuXFwndCBjbG9zZSBkaWFsb2csIG5vIGRpYWxvZyBvcGVuJyk7XG5cbiAgICByZXN1bHQgPSByZXN1bHQgfHwgJ2Nsb3NlZCc7XG5cbiAgICBfdG9nZ2xlRGlhbG9nLmNhbGwodGhpcywgZmFsc2UpO1xuICAgIF9kaXNwYXRjaFJlc3VsdC5jYWxsKHRoaXMsIHJlc3VsdCwgZGF0YSk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGN1cnJlbnRseSBvcGVuZWQgZGlhbG9nXG4gKlxuICogQHJldHVybiB7TUxEaWFsb2d9XG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJCRnZXRPcGVuZWREaWFsb2coKSB7XG4gICAgcmV0dXJuIG9wZW5lZERpYWxvZztcbn1cblxuXG5mdW5jdGlvbiBNTERpYWxvZyRkZXN0cm95KCkge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfb25LZXlEb3duKTtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXJcbiAgICAsIERPTUxpc3RlbmVycyA9IG1pbG8udXRpbC5kb21MaXN0ZW5lcnM7XG5cblxudmFyIFRPR0dMRV9DU1NfQ0xBU1MgPSAnZHJvcGRvd24tdG9nZ2xlJ1xuICAgICwgTUVOVV9DU1NfQ0xBU1MgPSAnZHJvcGRvd24tbWVudSc7XG5cblxudmFyIE1MRHJvcGRvd24gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRHJvcGRvd24nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogWydtbC1icy1kcm9wZG93bicsICdkcm9wZG93biddXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEcm9wZG93bik7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEcm9wZG93bjtcblxuXG5fLmV4dGVuZFByb3RvKE1MRHJvcGRvd24sIHtcbiAgICBzdGFydDogTUxEcm9wZG93biRzdGFydCxcbiAgICBkZXN0cm95OiBNTERyb3Bkb3duJGRlc3Ryb3ksXG4gICAgdG9nZ2xlTWVudTogTUxEcm9wZG93biR0b2dnbGVNZW51LFxuICAgIHNob3dNZW51OiBNTERyb3Bkb3duJHNob3dNZW51LFxuICAgIGhpZGVNZW51OiBNTERyb3Bkb3duJGhpZGVNZW51XG59KTtcblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJHN0YXJ0KCkge1xuICAgIHZhciB0b2dnbGVFbCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLicgKyBUT0dHTEVfQ1NTX0NMQVNTKVxuICAgICAgICAsIG1lbnVFbCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLicgKyBNRU5VX0NTU19DTEFTUyk7XG5cbiAgICBpZiAoISAodG9nZ2xlRWwgJiYgbWVudUVsKSlcbiAgICAgICAgcmV0dXJuIGxvZ2dlci5lcnJvcignTUxEcm9wZG93bjonLCBUT0dHTEVfQ1NTX0NMQVNTLCAnb3InLCBNRU5VX0NTU19DTEFTUywgJ2lzblxcJ3QgZm91bmQnKTtcblxuICAgIHZhciBkb2MgPSB3aW5kb3cuZG9jdW1lbnRcbiAgICAgICAgLCBjbGlja0hhbmRsZXIgPSB0aGlzLnRvZ2dsZU1lbnUuYmluZCh0aGlzLCB1bmRlZmluZWQpO1xuXG4gICAgdmFyIGxpc3RlbmVycyA9IG5ldyBET01MaXN0ZW5lcnM7XG4gICAgdGhpcy5fZHJvcGRvd24gPSB7XG4gICAgICAgIG1lbnU6IG1lbnVFbCxcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgIGxpc3RlbmVyczogbGlzdGVuZXJzXG4gICAgfTtcbiAgICB0aGlzLmhpZGVNZW51KCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgbGlzdGVuZXJzLmFkZCh0b2dnbGVFbCwgJ2NsaWNrJywgY2xpY2tIYW5kbGVyKTtcbiAgICAvL21heWJlIG9ubHkgYWRkIHRoaXMgZXZlbnRzIGlmIGlzIG9wZW4/XG4gICAgbGlzdGVuZXJzLmFkZChkb2MsICdtb3VzZW91dCcsIG9uRG9jT3V0KTtcbiAgICBsaXN0ZW5lcnMuYWRkKGRvYywgJ2NsaWNrJywgb25DbGljayk7XG5cblxuICAgIGZ1bmN0aW9uIG9uRG9jT3V0KGV2ZW50KSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXRcbiAgICAgICAgICAgICwgcmVsYXRlZFRhcmdldCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXRcbiAgICAgICAgICAgICwgbGlzdGVuZXJzID0gc2VsZi5fZHJvcGRvd24ubGlzdGVuZXJzO1xuXG4gICAgICAgIGlmIChpc0lmcmFtZSh0YXJnZXQpKVxuICAgICAgICAgICAgbGlzdGVuZXJzLnJlbW92ZSh0YXJnZXQuY29udGVudFdpbmRvdy5kb2N1bWVudCwgJ2NsaWNrJywgb25DbGljayk7XG5cbiAgICAgICAgaWYgKGlzSWZyYW1lKHJlbGF0ZWRUYXJnZXQpKVxuICAgICAgICAgICAgbGlzdGVuZXJzLmFkZChyZWxhdGVkVGFyZ2V0LmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQsICdjbGljaycsIG9uQ2xpY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uQ2xpY2soZXZlbnQpIHtcbiAgICAgICAgaWYgKCFzZWxmLmVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpXG4gICAgICAgICAgICBzZWxmLmhpZGVNZW51KCk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGlzSWZyYW1lKGVsKSB7XG4gICAgcmV0dXJuIGVsICYmIGVsLnRhZ05hbWUgPT0gJ0lGUkFNRSc7XG59XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biRkZXN0cm95KCkge1xuICAgIHRoaXMuX2Ryb3Bkb3duLmxpc3RlbmVycy5yZW1vdmVBbGwoKTtcbiAgICBkZWxldGUgdGhpcy5fZHJvcGRvd247XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biRzaG93TWVudSgpIHtcbiAgICB0aGlzLnRvZ2dsZU1lbnUodHJ1ZSk7XG59XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biRoaWRlTWVudSgpIHtcbiAgICB0aGlzLnRvZ2dsZU1lbnUoZmFsc2UpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kdG9nZ2xlTWVudShkb1Nob3cpIHtcbiAgICBkb1Nob3cgPSB0eXBlb2YgZG9TaG93ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgPyAhIHRoaXMuX2Ryb3Bkb3duLnZpc2libGVcbiAgICAgICAgICAgICAgICA6ICEhIGRvU2hvdztcblxuICAgIHRoaXMuX2Ryb3Bkb3duLnZpc2libGUgPSBkb1Nob3c7XG5cbiAgICB2YXIgbWVudSA9IHRoaXMuX2Ryb3Bkb3duLm1lbnU7XG4gICAgbWVudS5zdHlsZS5kaXNwbGF5ID0gZG9TaG93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmxvY2snXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnbm9uZSc7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb3JtR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9nZW5lcmF0b3InKVxuICAgICwgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgY2hlY2sgPSBtaWxvLnV0aWwuY2hlY2tcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXJcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKVxuICAgICwgYXN5bmMgPSByZXF1aXJlKCdhc3luYycpO1xuXG5cbnZhciBGT1JNX1ZBTElEQVRJT05fRkFJTEVEX0NTU19DTEFTUyA9ICdoYXMtZXJyb3InO1xuXG4vKipcbiAqIEEgY29tcG9uZW50IGNsYXNzIGZvciBnZW5lcmF0aW5nIGZvcm1zIGZyb20gc2NoZW1hXG4gKiBUbyBjcmVhdGUgZm9ybSBjbGFzcyBtZXRob2QgW2NyZWF0ZUZvcm1dKCNNTEZvcm0kJGNyZWF0ZUZvcm0pIHNob3VsZCBiZSB1c2VkLlxuICogRm9ybSBzY2hlbWEgaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICogYGBgXG4gKiB2YXIgc2NoZW1hID0ge1xuICogICAgIGl0ZW1zOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICAgIHR5cGU6ICc8dHlwZSBvZiB1aSBjb250cm9sPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FuIGJlIGdyb3VwLCBzZWxlY3QsIGlucHV0LCBidXR0b24sIHJhZGlvLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh5cGVybGluaywgY2hlY2tib3gsIGxpc3QsIHRpbWUsIGRhdGVcbiAqICAgICAgICAgICAgIGNvbXBOYW1lOiAnPGNvbXBvbmVudCBuYW1lPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgbmFtZSBvZiBjb21wb25lbnQsIHNob3VsZCBiZSB1bmlxdWUgd2l0aGluIHRoZSBmb3JtXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKG9yIGZvcm0gZ3JvdXApLCBvbmx5IG5lZWRzIHRvYmUgdXNlZCB3aGVuIGNvbXBvbmVudCBuZWVkcyB0byBiZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1hbmlwaWxhdGVkIGluIHNvbWUgZXZlbnQgaGFuZGxlciBhbmQgaXQgY2Fubm90IGJlIGFjY2Vzc2VkIHZpYSBtb2RlbFBhdGhcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2luZyBgbW9kZWxQYXRoQ29tcG9uZW50YCBtZXRob2RcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAod2hpY2ggaXMgYSBwcmVmZXJyZWQgd2F5IHRvIGFjY2VzcyBjb25wb25lbnRzIGluIGZvcm0pXG4gKiAgICAgICAgICAgICBsYWJlbDogJzx1aSBjb250cm9sIGxhYmVsPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgbGFiZWwsIHdpbGwgbm90IGJlIGFkZGVkIGlmIG5vdCBkZWZpbmVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3IgZW1wdHkgc3RyaW5nXG4gKiAgICAgICAgICAgICBhbHRUZXh0OiAnPGFsdCB0ZXh0IG9yIHRpdGxlPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgYWx0IHRleHQgc3RyaW5nIG9uIGJ1dHRvbnMgYW5kIGh5cGVybGlua3NcbiAqICAgICAgICAgICAgIG1vZGVsUGF0aDogJzxtb2RlbCBtYXBwaW5nPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGF0aCBpbiBtb2RlbCB3aGVyZSB0aGUgdmFsdWUgd2lsbCBiZSBzdG9yZWQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW9zdCB0eXBlcyBvZiBpdGVtcyByZXF1aXJlIHRoaXMgcHJvcGVydHksXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc29tZSBpdGVtcyBtYXkgaGF2ZSB0aGlzIHByb3BlcnR5IChidXR0b24sIGUuZy4pLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiZ3JvdXBcIiBtdXN0IE5PVCBoYXZlIHRoaXMgcHJvcGVydHkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FybmluZyB3aWxsIGJlIGxvZ2dlZCBpZiB0aGVzZSBydWxlcyBhcmUgbm90IGZvbGxvd2VkLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0ZW1zIHdpdGhvdXQgdGhpcyBwcm9wZXJ0eSB3aWxsIG5vdCBiZSBpbiBtb2RlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIChhcGFydCBmcm9tIFwiZ3JvdXAgd2hpY2ggc3ViaXRlbXMgd2lsbCBiZSBpbiBtb2RlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXkgaGF2ZSB0aGlzIHByb3BlcnR5KVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcHJvcGVydHkgYWxsb3dzIHRvIGhhdmUgZml4ZWQgZm9ybSBtb2RlbCBzdHJ1Y3R1cmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGlsZSBjaGFuZ2luZyB2aWV3IHN0cnVjdHVyZSBvZiB0aGUgZm9ybVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlZSBNb2RlbC5cbiAqICAgICAgICAgICAgIG1vZGVsUGF0dGVybjogJ21hcHBpbmcgZXh0ZW5zaW9uIHBhdHRlcm4nLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKHN0cmluZylcbiAqICAgICAgICAgICAgIG5vdEluTW9kZWw6IHRydWUsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbGxvd3MgdG8gTk9UIGluY2x1ZGUgbW9kZWxQYXRoIHdoZXJlIG90aGVyd2lzZSBpdCB3b3VsZCBiZSByZXF1aXJlZFxuICogICAgICAgICAgICAgbWVzc2FnZXM6IHsgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gc3Vic2NyaWJlIHRvIG1lc3NhZ2VzIG9uIGl0ZW0ncyBjb21wb25lbnQgZmFjZXRzXG4gKiAgICAgICAgICAgICAgICAgZXZlbnRzOiB7ICAgICAgICAgICAgICAgICAgICAvLyBmYWNldCB0byBzdWJzY3JpYmUgdG9cbiAqICAgICAgICAgICAgICAgICAgICAgJzxtZXNzYWdlMT4nOiBvbk1lc3NhZ2UxIC8vIG1lc3NhZ2UgYW5kIHN1YnNjcmliZXIgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICAgJzxtc2cyPiA8bXNnMz4nOiB7ICAgICAgIC8vIHN1YnNjcmliZSB0byAyIG1lc3NhZ2VzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyOiBvbk1lc3NhZ2UyLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCAgICAgLy8gY29udGV4dCBjYW4gYmUgYW4gb2JqZWN0IG9yIGEgc3RyaW5nOlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJmYWNldFwiOiBmYWNldCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJvd25lclwiOiBpdGVtIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJmb3JtXCI6IHRoZSBmb3JtIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJob3N0XCI6IGhvc3Qgb2JqZWN0IHBhc3NlZCB0byBjcmVhdGVGb3JtIG1ldGhvZCB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICAgICAgICAgfVxuICogICAgICAgICAgICAgfSxcbiAqICAgICAgICAgICAgIHRyYW5zbGF0ZTogeyAgICAgICAgICAvLyBvcHRpb25hbCBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9uc1xuICogICAgICAgICAgICAgICAgIGNvbnRleHQ6IE9iamVjdCAgIC8vIG9wdGlvbmFsIGNvbnRleHQgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byB0cmFuc2xhdGUgZnVuY3Rpb25zLCAnaG9zdCcgbWVhbnMgdGhlIGhvc3RPYmplY3QgcGFzc2VkIHRvIEZvcm0uY3JlYXRlRm9ybVxuICogICAgICAgICAgICAgICAgIHRvTW9kZWw6IGZ1bmMxLCAgIC8vIHRyYW5zbGF0ZXMgaXRlbSBkYXRhIGZyb20gdmlldyB0byBtb2RlbFxuICogICAgICAgICAgICAgICAgIGZyb21Nb2RlbDogZnVuYzIgIC8vIHRyYW5zbGF0ZXMgaXRlbSBkYXRhIGZyb20gbW9kZWwgdG8gdmlld1xuICogICAgICAgICAgICAgfSxcbiAqICAgICAgICAgICAgIHZhbGlkYXRlOiB7ICAgICAgICAgICAvLyBvcHRpb25hbCBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKiAgICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0ICAgLy8gb3B0aW9uYWwgY29udGV4dCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHZhbGlkYXRlIGZ1bmN0aW9ucywgJ2hvc3QnIG1lYW5zIHRoZSBob3N0T2JqZWN0IHBhc3NlZCB0byBGb3JtLmNyZWF0ZUZvcm1cbiAqICAgICAgICAgICAgICAgICB0b01vZGVsOiAgIGZ1bmMxIHwgW2Z1bmMxLCBmdW5jMiwgLi4uXSwvLyB2YWxpZGF0ZXMgaXRlbSBkYXRhIHdoZW4gaXQgaXMgY2hhbmdlZCBpbiBmb3JtXG4gKiAgICAgICAgICAgICAgICAgZnJvbU1vZGVsOiBmdW5jMiB8IFtmdW5jMywgZnVuYzQsIC4uLl0gLy8gb3Bwb3NpdGUsIGJ1dCBub3QgcmVhbGx5IHVzZWQgYW5kIGRvZXMgbm90IG1ha2UgZm9ybSBpbnZhbGlkIGlmIGl0IGZhaWxzLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbiBiZSB1c2VkIHRvIHByZXZlbnQgZGF0YSBiZWluZyBzaG93biBpbiB0aGUgZm9ybS5cbiAqICAgICAgICAgICAgIH0sICAgICAgICAgICAgICAgICAgICAvLyBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zIHNob3VsZCBhY2NlcHQgdHdvIHBhcmFtZXRlcnM6IGRhdGEgYW5kIGNhbGxiYWNrICh0aGV5IGFyZSBhc3luY2hyb25vdXMpLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdmFsaWRhdGlvbiBpcyBmaW5pc2hlZCwgY2FsbGJhY2sgc2hvdWxkIGJlIGNhbGxlZCB3aXRoIChlcnJvciwgcmVzcG9uc2UpIHBhcmFtZXRlcnMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzcG9uc2Ugc2hvdWxkIGhhdmUgcHJvcGVydGllcyB2YWxpZCAoQm9vbGVhbikgYW5kIG9wdGlvbmFsIHJlYXNvbiAoU3RyaW5nIC0gcmVhc29uIG9mIHZhbGlkYXRpb24gZmFpbHVyZSkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSE6IGF0IHRoZSBtb21lbnQsIGlmIGNhbGxiYWNrIGlzIGNhbGxlZCB3aXRoIGVycm9yIHBhcmFtZXRlciB3aGljaCBpcyBub3QgZmFsc3ksIHZhbGlkYXRpb24gd2lsbCBiZSBwYXNzZWQuXG4gKiAgICAgICAgICAgICA8aXRlbSBzcGVjaWZpYz46IHs8aXRlbSBjb25maWd1cmF0aW9uPn1cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcInNlbGVjdFwiIHN1cHBvcnRzIFwic2VsZWN0T3B0aW9uc1wiIC0gYXJyYXkgb2Ygb2JqZWN0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggcHJvcGVydGllcyBcInZhbHVlXCIgYW5kIFwibGFiZWxcIlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwicmFkaW9cIiBzdXBwb3J0cyBcInJhZGlvT3B0aW9uc1wiIHdpdGggdGhlIHNhbWUgZm9ybWF0XG4gKiAgICAgICAgICAgICBpdGVtczogW1xuICogICAgICAgICAgICAgICAgIHsgLi4uIH0gLy8sIC4uLiAtIGl0ZW1zIGluc2lkZSBcImdyb3VwXCIgb3IgXCJ3cmFwcGVyXCIgaXRlbVxuICogICAgICAgICAgICAgXVxuICogICAgICAgICB9IC8vICwgLi4uIG1vcmUgaXRlbXNcbiAqICAgICBdXG4gKiB9XG4gKi9cbnZhciBNTEZvcm0gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRm9ybScsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnY2MtbW9kdWxlLWluc3BlY3RvcidcbiAgICB9LFxuICAgIG1vZGVsOiB1bmRlZmluZWQsXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkXG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEZvcm0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRm9ybTtcblxuXG5fLmV4dGVuZChNTEZvcm0sIHtcbiAgICBjcmVhdGVGb3JtOiBNTEZvcm0kJGNyZWF0ZUZvcm0sXG4gICAgcmVnaXN0ZXJTY2hlbWFLZXk6IE1MRm9ybSQkcmVnaXN0ZXJTY2hlbWFLZXksXG4gICAgcmVnaXN0ZXJWYWxpZGF0aW9uOiBNTEZvcm0kJHJlZ2lzdGVyVmFsaWRhdGlvbixcbiAgICB2YWxpZGF0b3JSZXNwb25zZTogTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSxcbiAgICBnZW5lcmF0b3I6IGZvcm1HZW5lcmF0b3IsXG4gICAgcmVnaXN0cnk6IGZvcm1SZWdpc3RyeVxufSk7XG5cbl8uZXh0ZW5kUHJvdG8oTUxGb3JtLCB7XG4gICAgZ2V0SG9zdE9iamVjdDogTUxGb3JtJGdldEhvc3RPYmplY3QsXG4gICAgaXNWYWxpZDogTUxGb3JtJGlzVmFsaWQsXG4gICAgdmFsaWRhdGVNb2RlbDogTUxGb3JtJHZhbGlkYXRlTW9kZWwsXG4gICAgZ2V0SW52YWxpZENvbnRyb2xzOiBNTEZvcm0kZ2V0SW52YWxpZENvbnRyb2xzLFxuICAgIGdldEludmFsaWRSZWFzb25zOiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnMsXG4gICAgZ2V0SW52YWxpZFJlYXNvbnNUZXh0OiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnNUZXh0LFxuICAgIG1vZGVsUGF0aENvbXBvbmVudDogTUxGb3JtJG1vZGVsUGF0aENvbXBvbmVudCxcbiAgICBtb2RlbFBhdGhTY2hlbWE6IE1MRm9ybSRtb2RlbFBhdGhTY2hlbWEsXG4gICAgdmlld1BhdGhDb21wb25lbnQ6IE1MRm9ybSR2aWV3UGF0aENvbXBvbmVudCxcbiAgICB2aWV3UGF0aFNjaGVtYTogTUxGb3JtJHZpZXdQYXRoU2NoZW1hLFxuICAgIGdldE1vZGVsUGF0aDogTUxGb3JtJGdldE1vZGVsUGF0aCxcbiAgICBnZXRWaWV3UGF0aDogTUxGb3JtJGdldFZpZXdQYXRoLFxuICAgIGRlc3Ryb3k6IE1MRm9ybSRkZXN0cm95LFxufSk7XG5cblxudmFyIFNDSEVNQV9LRVlXT1JEUyA9IF8ub2JqZWN0KFtcbiAgICAndHlwZScsICdjb21wTmFtZScsICdsYWJlbCcsICdhbHRUZXh0JyxcbiAgICAnbW9kZWxQYXRoJywgJ21vZGVsUGF0dGVybicsICdub3RJbk1vZGVsJyxcbiAgICAnbWVzc2FnZXMnLCAndHJhbnNsYXRlJywgJ3ZhbGlkYXRlJywgJ2l0ZW1zJyxcbiAgICAnc2VsZWN0T3B0aW9ucycsICdyYWRpb09wdGlvbnMnLCAnY29tYm9PcHRpb25zJyxcbiAgICAnY29tYm9PcHRpb25zVVJMJywgJ2FkZEl0ZW1Qcm9tcHQnLCAncGxhY2VIb2xkZXInLFxuICAgICd2YWx1ZScsICdkYXRhVmFsaWRhdGlvbicsICdhc3luY0hhbmRsZXInLCAnYXV0b3Jlc2l6ZScsXG4gICAgJ21heExlbmd0aCdcbl0sIHRydWUpO1xuXG4vKipcbiAqIE1MRm9ybSBjbGFzcyBtZXRob2RcbiAqIENyZWF0ZXMgZm9ybSBmcm9tIHNjaGVtYS5cbiAqIEZvcm0gZGF0YSBjYW4gYmUgb2J0YWluZWQgZnJvbSBpdHMgTW9kZWwgKGBmb3JtLm1vZGVsYCksIHJlYWN0aXZlIGNvbm5lY3Rpb24gdG8gZm9ybSdzIG1vZGVsIGNhbiBhbHNvIGJlIHVzZWQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSBmb3JtIHNjaGVtYSwgYXMgZGVzY3JpYmVkIGFib3ZlXG4gKiBAcGFyYW0ge09iamVjdH0gaG9zdE9iamVjdCBmb3JtIGhvc3Qgb2JqZWN0LCB1c2VkIHRvIGRlZmluZSBhcyBtZXNzYWdlIHN1YnNjcmliZXIgY29udGV4dCBpbiBzY2hlbWEgLSBieSBjb252ZW50aW9uIHRoZSBjb250ZXh0IHNob3VsZCBiZSBkZWZpbmVkIGFzIFwiaG9zdFwiXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybURhdGEgZGF0YSB0byBpbml0aWFsaXplIHRoZSBmb3JtIHdpdGhcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZW1wbGF0ZSBvcHRpb25hbCBmb3JtIHRlbXBsYXRlLCB3aWxsIGJlIHVzZWQgaW5zdGVhZCBvZiBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBmcm9tIHNjaGVtYS4gTm90IHJlY29tbWVuZGVkIHRvIHVzZSwgYXMgaXQgd2lsbCBoYXZlIHRvIGJlIG1haW50YWluZWQgdG8gYmUgY29uc2lzdGVudCB3aXRoIHNjaGVtYSBmb3IgYmluZGluZ3MuXG4gKiBAcmV0dXJuIHtNTEZvcm19XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSQkY3JlYXRlRm9ybShzY2hlbWEsIGhvc3RPYmplY3QsIGZvcm1EYXRhLCB0ZW1wbGF0ZSkge1xuICAgIHZhciBmb3JtID0gX2NyZWF0ZUZvcm1Db21wb25lbnQoKTtcbiAgICBfLmRlZmluZVByb3BlcnR5KGZvcm0sICdfaG9zdE9iamVjdCcsIGhvc3RPYmplY3QpO1xuICAgIHZhciBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnM7XG4gICAgX3Byb2Nlc3NGb3JtU2NoZW1hKCk7XG4gICAgX2Nvbm5lY3RGb3JtRGF0YVRvTW9kZWwoKTtcbiAgICBfbWFuYWdlRm9ybVZhbGlkYXRpb24oKTtcblxuICAgIC8vIHNldCBvcmlnaW5hbCBmb3JtIGRhdGFcbiAgICBpZiAoZm9ybURhdGEpXG4gICAgICAgIGZvcm0ubW9kZWwubS5zZXQoZm9ybURhdGEpO1xuXG4gICAgcmV0dXJuIGZvcm07XG5cblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVGb3JtQ29tcG9uZW50KCkge1xuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlIHx8IGZvcm1HZW5lcmF0b3Ioc2NoZW1hKTtcbiAgICAgICAgcmV0dXJuIE1MRm9ybS5jcmVhdGVPbkVsZW1lbnQodW5kZWZpbmVkLCB0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Byb2Nlc3NGb3JtU2NoZW1hKCkge1xuICAgICAgICAvLyBtb2RlbCBwYXRocyB0cmFuc2xhdGlvbiBydWxlc1xuICAgICAgICBmb3JtVmlld1BhdGhzID0ge307XG4gICAgICAgIGZvcm1Nb2RlbFBhdGhzID0ge307XG4gICAgICAgIG1vZGVsUGF0aFRyYW5zbGF0aW9ucyA9IHt9O1xuICAgICAgICBkYXRhVHJhbnNsYXRpb25zID0geyBmcm9tTW9kZWw6IHt9LCB0b01vZGVsOiB7fSB9O1xuICAgICAgICBkYXRhVmFsaWRhdGlvbnMgPSB7IGZyb21Nb2RlbDoge30sIHRvTW9kZWw6IHt9IH07XG5cbiAgICAgICAgLy8gcHJvY2VzcyBmb3JtIHNjaGVtYVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvY2Vzc1NjaGVtYS5jYWxsKGZvcm0sIGZvcm0sIHNjaGVtYSwgJycsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZm9ybVZpZXdQYXRocyBiZWZvcmUgZXJyb3I6ICcsIGZvcm1WaWV3UGF0aHMpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdmb3JtTW9kZWxQYXRocyBiZWZvcmUgZXJyb3I6ICcsIGZvcm1Nb2RlbFBhdGhzKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnbW9kZWxQYXRoVHJhbnNsYXRpb25zIGJlZm9yZSBlcnJvcjogJywgbW9kZWxQYXRoVHJhbnNsYXRpb25zKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZGF0YVRyYW5zbGF0aW9ucyBiZWZvcmUgZXJyb3I6ICcsIGRhdGFUcmFuc2xhdGlvbnMpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdkYXRhVmFsaWRhdGlvbnMgYmVmb3JlIGVycm9yOiAnLCBkYXRhVmFsaWRhdGlvbnMpO1xuICAgICAgICAgICAgdGhyb3cgKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9ybS5fZm9ybVZpZXdQYXRocyA9IGZvcm1WaWV3UGF0aHM7XG4gICAgICAgIGZvcm0uX2Zvcm1Nb2RlbFBhdGhzID0gZm9ybU1vZGVsUGF0aHM7XG4gICAgICAgIGZvcm0uX21vZGVsUGF0aFRyYW5zbGF0aW9ucyA9IG1vZGVsUGF0aFRyYW5zbGF0aW9ucztcbiAgICAgICAgZm9ybS5fZGF0YVRyYW5zbGF0aW9ucyA9IGRhdGFUcmFuc2xhdGlvbnM7XG4gICAgICAgIGZvcm0uX2RhdGFWYWxpZGF0aW9ucyA9IGRhdGFWYWxpZGF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY29ubmVjdEZvcm1EYXRhVG9Nb2RlbCgpIHtcbiAgICAgICAgLy8gY29ubmVjdCBmb3JtIHZpZXcgdG8gZm9ybSBtb2RlbCB1c2luZyB0cmFuc2xhdGlvbiBydWxlcyBmcm9tIG1vZGVsUGF0aCBwcm9wZXJ0aWVzIG9mIGZvcm0gaXRlbXNcbiAgICAgICAgZm9ybS5fY29ubmVjdG9yID0gbWlsby5taW5kZXIoZm9ybS5kYXRhLCAnPC0+JywgZm9ybS5tb2RlbCwgeyAvLyBjb25uZWN0aW9uIGRlcHRoIGlzIGRlZmluZWQgb24gZmllbGQgYnkgZmllbGQgYmFzaXMgYnkgcGF0aFRyYW5zbGF0aW9uXG4gICAgICAgICAgICBwYXRoVHJhbnNsYXRpb246IG1vZGVsUGF0aFRyYW5zbGF0aW9ucyxcbiAgICAgICAgICAgIGRhdGFUcmFuc2xhdGlvbjoge1xuICAgICAgICAgICAgICAgICc8LSc6IGRhdGFUcmFuc2xhdGlvbnMuZnJvbU1vZGVsLFxuICAgICAgICAgICAgICAgICctPic6IGRhdGFUcmFuc2xhdGlvbnMudG9Nb2RlbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGFWYWxpZGF0aW9uOiB7XG4gICAgICAgICAgICAgICAgJzwtJzogZGF0YVZhbGlkYXRpb25zLmZyb21Nb2RlbCxcbiAgICAgICAgICAgICAgICAnLT4nOiBkYXRhVmFsaWRhdGlvbnMudG9Nb2RlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFuYWdlRm9ybVZhbGlkYXRpb24oKSB7XG4gICAgICAgIGZvcm0uX2ludmFsaWRGb3JtQ29udHJvbHMgPSB7fTtcblxuICAgICAgICBmb3JtLm1vZGVsLm9uKCd2YWxpZGF0ZWQnLCBjcmVhdGVPblZhbGlkYXRlZCh0cnVlKSk7XG4gICAgICAgIGZvcm0uZGF0YS5vbigndmFsaWRhdGVkJywgY3JlYXRlT25WYWxpZGF0ZWQoZmFsc2UpKTtcblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVPblZhbGlkYXRlZChpc0Zyb21Nb2RlbCkge1xuICAgICAgICAgICAgdmFyIHBhdGhDb21wTWV0aG9kID0gaXNGcm9tTW9kZWwgPyAnbW9kZWxQYXRoQ29tcG9uZW50JzogJ3ZpZXdQYXRoQ29tcG9uZW50J1xuICAgICAgICAgICAgICAgICwgcGF0aFNjaGVtYU1ldGhvZCA9IGlzRnJvbU1vZGVsID8gJ21vZGVsUGF0aFNjaGVtYSc6ICd2aWV3UGF0aFNjaGVtYSc7XG5cbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihtc2csIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGZvcm1bcGF0aENvbXBNZXRob2RdKHJlc3BvbnNlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICwgc2NoZW1hID0gZm9ybVtwYXRoU2NoZW1hTWV0aG9kXShyZXNwb25zZS5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAsIGxhYmVsID0gc2NoZW1hLmxhYmVsXG4gICAgICAgICAgICAgICAgICAgICwgbW9kZWxQYXRoID0gc2NoZW1hLm1vZGVsUGF0aDtcblxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudEVsID0gY29tcG9uZW50LmVsLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsLmNsYXNzTGlzdC50b2dnbGUoRk9STV9WQUxJREFUSU9OX0ZBSUxFRF9DU1NfQ0xBU1MsICEgcmVzcG9uc2UudmFsaWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWFzb247XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS52YWxpZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBmb3JtLl9pbnZhbGlkRm9ybUNvbnRyb2xzW21vZGVsUGF0aF07XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFzb246IHJlc3BvbnNlLnJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFzb25Db2RlOiByZXNwb25zZS5yZWFzb25Db2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5faW52YWxpZEZvcm1Db250cm9sc1ttb2RlbFBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBfLmNsb25lKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRnJvbU1vZGVsKSBkYXRhLnBhdGggPSBmb3JtLmdldE1vZGVsUGF0aChkYXRhLnBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucmVhc29uID0gcmVhc29uOyAvLyBhIGJpdCBoYWNreSwgcmVwbGFjaW5nIHN0cmluZyB3aXRoIG9iamVjdCBjcmVhdGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5yZWFzb25Db2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvcm0ucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRpb24nLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdGb3JtOiBjb21wb25lbnQgZm9yIHBhdGggJyArIHJlc3BvbnNlLnBhdGggKyAnIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vKipcbiAqIEN1c3RvbSBzY2hlbWEga2V5d29yZHNcbiAqL1xudmFyIHNjaGVtYUtleXdvcmRzUmVnaXN0cnkgPSB7fTtcbmZ1bmN0aW9uIE1MRm9ybSQkcmVnaXN0ZXJTY2hlbWFLZXkoa2V5d29yZCwgcHJvY2Vzc0tleXdvcmRGdW5jLCByZXBsYWNlS2V5d29yZCkge1xuICAgIGlmIChTQ0hFTUFfS0VZV09SRFNba2V5d29yZF0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5d29yZCcsIGtleXdvcmQsICdpcyB1c2VkIGJ5IE1MRm9ybSBjbGFzcyBvciBvbmUgb2YgcHJlLXJlZ2lzdGVyZWQgZm9ybSBpdGVtcyBhbmQgY2Fubm90IGJlIG92ZXJyaWRkZW4nKTtcblxuICAgIGlmICghcmVwbGFjZUtleXdvcmQgJiYgc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXl3b3JkJywga2V5d29yZCwgJ2lzIGFscmVhZHkgcmVnaXN0ZXJlZC4gUGFzcyB0cnVlIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXIgdG8gcmVwbGFjZSBpdCcpO1xuXG4gICAgc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXSA9IHByb2Nlc3NLZXl3b3JkRnVuYztcbn1cblxuXG4vKipcbiAqIFByZWRlZmluZWQgZm9ybSB2YWxpZGF0aW9uIGZ1bmN0aW9uc1xuICovXG52YXIgdmFsaWRhdGlvbkZ1bmN0aW9ucyA9IHtcbiAgICAncmVxdWlyZWQnOiB2YWxpZGF0ZVJlcXVpcmVkXG59O1xuZnVuY3Rpb24gTUxGb3JtJCRyZWdpc3RlclZhbGlkYXRpb24obmFtZSwgZnVuYywgcmVwbGFjZUZ1bmMpIHtcbiAgICBpZiAoIXJlcGxhY2VGdW5jICYmIHZhbGlkYXRpb25GdW5jdGlvbnNbbmFtZV0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsaWRhdGluZyBmdW5jdGlvbicsIG5hbWUsICdpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuIFBhc3MgdHJ1ZSBhcyB0aGUgdGhpcmQgcGFyYW1ldGVyIHRvIHJlcGxhY2UgaXQnKTtcblxuICAgIHZhbGlkYXRpb25GdW5jdGlvbnNbbmFtZV0gPSBmdW5jO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZm9ybSBob3N0IG9iamVjdC5cbiAqIEByZXR1cm4ge0NvbXBvbmVudH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldEhvc3RPYmplY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hvc3RPYmplY3Q7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGN1cnJlbnQgdmFsaWRhdGlvbiBzdGF0dXMgb2YgdGhlIGZvcm1cbiAqIFdpbGwgbm90IHZhbGlkYXRlIGZpZWxkcyB0aGF0IHdlcmUgbmV2ZXIgY2hhbmdlZCBpbiB2aWV3XG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGlzVmFsaWQoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2ludmFsaWRGb3JtQ29udHJvbHMpLmxlbmd0aCA9PSAwO1xufVxuXG5cbi8qKlxuICogUnVucyAndG9Nb2RlbCcgdmFsaWRhdG9ycyBkZWZpbmVkIGluIHNjaGVtYSBvbiB0aGUgY3VycmVudCBtb2RlbCBvZiB0aGUgZm9ybVxuICogY2FuIGJlIHVzZWQgdG8gbWFyayBhcyBpbnZhaWQgYWxsIHJlcXVpcmVkIGZpZWxkcyBvciB0byBleHBsaWNpdGVseSB2YWxpZGF0ZVxuICogZm9ybSB3aGVuIGl0IGlzIHNhdmVkLiBSZXR1cm5zIHZhbGlkYXRpb24gc3RhdGUgb2YgdGhlIGZvcm0gdmlhIGNhbGxiYWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gTUxGb3JtJHZhbGlkYXRlTW9kZWwoY2FsbGJhY2spIHtcbiAgICB2YXIgdmFsaWRhdGlvbnMgPSBbXVxuICAgICAgICAsIHNlbGYgPSB0aGlzO1xuXG4gICAgXy5lYWNoS2V5KHRoaXMuX2RhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwsIGZ1bmN0aW9uKHZhbGlkYXRvcnMsIG1vZGVsUGF0aCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMubW9kZWwubShtb2RlbFBhdGgpLmdldCgpO1xuICAgICAgICB2YWxpZGF0b3JzID0gQXJyYXkuaXNBcnJheSh2YWxpZGF0b3JzKSA/IHZhbGlkYXRvcnMgOiBbdmFsaWRhdG9yc107XG5cbiAgICAgICAgaWYgKHZhbGlkYXRvcnMgJiYgdmFsaWRhdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIG1vZGVsUGF0aDogbW9kZWxQYXRoLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuXG4gICAgdmFyIGFsbFZhbGlkID0gdHJ1ZTtcbiAgICBhc3luYy5lYWNoKHZhbGlkYXRpb25zLFxuICAgICAgICBmdW5jdGlvbih2YWxpZGF0aW9uLCBuZXh0VmFsaWRhdGlvbikge1xuICAgICAgICAgICAgdmFyIGxhc3RSZXNwb25zZTtcbiAgICAgICAgICAgIGFzeW5jLmV2ZXJ5KHZhbGlkYXRpb24udmFsaWRhdG9ycyxcbiAgICAgICAgICAgICAgICAvLyBjYWxsIHZhbGlkYXRvclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHZhbGlkYXRvciwgbmV4dCkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3IodmFsaWRhdGlvbi5kYXRhLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0UmVzcG9uc2UgPSByZXNwb25zZSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQobGFzdFJlc3BvbnNlLnZhbGlkIHx8IGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBwb3N0IHZhbGlkYXRpb24gcmVzdWx0IG9mIGl0ZW0gdG8gZm9ybVxuICAgICAgICAgICAgZnVuY3Rpb24odmFsaWQpIHtcbiAgICAgICAgICAgICAgICBsYXN0UmVzcG9uc2UucGF0aCA9IHZhbGlkYXRpb24ubW9kZWxQYXRoO1xuICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZS52YWxpZCA9IHZhbGlkO1xuICAgICAgICAgICAgICAgIHNlbGYubW9kZWwucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRlZCcsIGxhc3RSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZCkgYWxsVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBuZXh0VmFsaWRhdGlvbihudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgIC8vIHBvc3QgZm9ybSB2YWxpZGF0aW9uIHJlc3VsdFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKCd2YWxpZGF0aW9uY29tcGxldGVkJywgeyB2YWxpZDogYWxsVmFsaWQgfSk7XG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGFsbFZhbGlkKTtcbiAgICB9KTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgbWFwIG9mIGludmFsaWQgY29udHJvbHMgYW5kIHJlYXNvbnMgKHZpZXcgcGF0aHMgYXJlIGtleXMpXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SW52YWxpZENvbnRyb2xzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbnZhbGlkRm9ybUNvbnRyb2xzO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3RzIHdpdGggYWxsIHJlYXNvbnMgZm9yIHRoZSBmb3JtIGJlaW5nIGludmFsaWRcbiAqXG4gKiBAcmV0dXJuIHtBcnJheVtPYmplY3RdfVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnMoKSB7XG4gICAgdmFyIGludmFsaWRDb250cm9scyA9IHRoaXMuZ2V0SW52YWxpZENvbnRyb2xzKCk7XG4gICAgdmFyIHJlYXNvbnMgPSBfLnJlZHVjZUtleXMoaW52YWxpZENvbnRyb2xzLFxuICAgICAgICBmdW5jdGlvbihtZW1vLCBpbnZhbGlkQ29udHJvbCwgY29tcE5hbWUpIHtcbiAgICAgICAgICAgIG1lbW8ucHVzaChpbnZhbGlkQ29udHJvbC5yZWFzb24pO1xuICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgIH0sIFtdLCB0aGlzKTtcbiAgICByZXR1cm4gcmVhc29ucztcbn1cblxuXG4vKipcbiAqIFJldHVybnMgYSBtdWx0aWxpbmUgc3RyaW5nIHdpdGggYWxsIHJlYXNvbnMgZm9yIHRoZSBmb3JtIGJlaW5nIGludmFsaWRcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRJbnZhbGlkUmVhc29uc1RleHQoKSB7XG4gICAgdmFyIHJlYXNvbnMgPSB0aGlzLmdldEludmFsaWRSZWFzb25zKCk7XG4gICAgcmV0dXJuIHJlYXNvbnMucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIHJlYXNvbikge1xuICAgICAgICByZXR1cm4gbWVtbyArIChyZWFzb24ubGFiZWwgfHwgJycpICsgJyAtICcgKyByZWFzb24ucmVhc29uICsgJ1xcbic7XG4gICAgfSwgJycpO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBjb21wb25lbnQgZm9yIGEgZ2l2ZW4gbW9kZWxQYXRoXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1vZGVsUGF0aFxuICogQHJldHVybiB7Q29tcG9uZW50fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kbW9kZWxQYXRoQ29tcG9uZW50KG1vZGVsUGF0aCkge1xuICAgIHZhciBtb2RlbFBhdGhPYmogPSB0aGlzLl9mb3JtTW9kZWxQYXRoc1ttb2RlbFBhdGhdO1xuICAgIHJldHVybiBtb2RlbFBhdGhPYmogJiYgbW9kZWxQYXRoT2JqLmNvbXBvbmVudDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgZm9ybSBzY2hlbWEgZm9yIGEgZ2l2ZW4gbW9kZWxQYXRoXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1vZGVsUGF0aFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kbW9kZWxQYXRoU2NoZW1hKG1vZGVsUGF0aCkge1xuICAgIHZhciBtb2RlbFBhdGhPYmogPSB0aGlzLl9mb3JtTW9kZWxQYXRoc1ttb2RlbFBhdGhdO1xuICAgIHJldHVybiBtb2RlbFBhdGhPYmogJiYgbW9kZWxQYXRoT2JqLnNjaGVtYTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgY29tcG9uZW50IGZvciBhIGdpdmVuIHZpZXcgcGF0aCAocGF0aCBhcyBkZWZpbmVkIGluIERhdGEgZmFjZXQpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZpZXdQYXRoXG4gKiBAcmV0dXJuIHtDb21wb25lbnR9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSR2aWV3UGF0aENvbXBvbmVudCh2aWV3UGF0aCkge1xuICAgIHZhciB2aWV3UGF0aE9iaiA9IHRoaXMuX2Zvcm1WaWV3UGF0aHNbdmlld1BhdGhdO1xuICAgIHJldHVybiB2aWV3UGF0aE9iaiAmJiB2aWV3UGF0aE9iai5jb21wb25lbnQ7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGZvcm0gc2NoZW1hIGZvciBhIGdpdmVuIHZpZXcgcGF0aCBpdGVtIChwYXRoIGFzIGRlZmluZWQgaW4gRGF0YSBmYWNldClcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGhcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJHZpZXdQYXRoU2NoZW1hKHZpZXdQYXRoKSB7XG4gICAgdmFyIHZpZXdQYXRoT2JqID0gdGhpcy5fZm9ybVZpZXdQYXRoc1t2aWV3UGF0aF07XG4gICAgcmV0dXJuIHZpZXdQYXRoT2JqICYmIHZpZXdQYXRoT2JqLnNjaGVtYTtcbn1cblxuXG4vKipcbiAqIENvbnZlcnRzIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50IGluIHRoZSBmb3JtIHRvIHRoZSBtb2RlbCBwYXRoIG9mIHRoZSBjb25uZWN0ZWQgZGF0YVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2aWV3UGF0aCB2aWV3IHBhdGggb2YgdGhlIGNvbXBvbmVudFxuICogQHJldHVybiB7c3RyaW5nfSBtb2RlbCBwYXRoIG9mIGNvbm5lY3RlZCBkYXRhXG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRNb2RlbFBhdGgodmlld1BhdGgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWxQYXRoVHJhbnNsYXRpb25zW3ZpZXdQYXRoXTtcbn1cblxuXG4vKipcbiAqIENvbnZlcnRzIG1vZGVsIHBhdGggb2YgdGhlIGNvbm5lY3RlZCBkYXRhIHRvIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50IGluIHRoZSBmb3JtXG4gKiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbFBhdGggbW9kZWwgcGF0aCBvZiBjb25uZWN0ZWQgZGF0YVxuICogQHJldHVybiB7c3RyaW5nfSB2aWV3IHBhdGggb2YgdGhlIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0Vmlld1BhdGgobW9kZWxQYXRoKSB7XG4gICAgcmV0dXJuIF8uZmluZEtleSh0aGlzLl9tb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGZ1bmN0aW9uKG1QYXRoLCB2UGF0aCkge1xuICAgICAgICByZXR1cm4gbVBhdGggPT0gbW9kZWxQYXRoO1xuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIE1MRm9ybSRkZXN0cm95KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciAmJiBtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKHRoaXMuX2Nvbm5lY3Rvcik7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbn1cblxuXG4vKipcbiAqIFNlZSBpdGVtX3R5cGVzLmpzIGZvciBpdGVtIGNsYXNzZXMgYW5kIHRlbXBsYXRlc1xuICogTWFwIG9mIGl0ZW1zIHR5cGVzIHRvIGl0ZW1zIGNvbXBvbmVudHMgY2xhc3Nlc1xuICogVUkgY29tcG9uZW50cyBhcmUgZGVmaW5lZCBpbiBgbWlsb2BcbiAqL1xuXG5cbi8vIHZhciBfaXRlbXNTY2hlbWFSdWxlcyA9IF8ubWFwS2V5cyhpdGVtVHlwZXMsIGZ1bmN0aW9uKGNsYXNzTmFtZSwgaXRlbVR5cGUpIHtcbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICAvLyBDb21wQ2xhc3M6IGNvbXBvbmVudHNSZWdpc3RyeS5nZXQoY2xhc3NOYW1lKSxcbi8vICAgICAgICAgZnVuYzogaXRlbXNGdW5jdGlvbnNbaXRlbVR5cGVdIHx8IGRvTm90aGluZyxcbi8vICAgICAgICAgbW9kZWxQYXRoUnVsZTogbW9kZWxQYXRoUnVsZXNbaXRlbVR5cGVdIHx8ICdyZXF1aXJlZCdcbi8vICAgICB9O1xuLy8gfSk7XG5cbmZ1bmN0aW9uIGRvTm90aGluZygpIHt9XG5cblxuLyoqXG4gKiBQcm9jZXNzZXMgZm9ybSBzY2hlbWEgdG8gc3Vic2NyaWJlIGZvciBtZXNzYWdlcyBhcyBkZWZpbmVkIGluIHNjaGVtYS4gUGVyZm9ybXMgc3BlY2lhbCBwcm9jZXNzaW5nIGZvciBzb21lIHR5cGVzIG9mIGl0ZW1zLlxuICogUmV0dXJucyB0cmFuc2xhdGlvbiBydWxlcyBmb3IgQ29ubmVjdG9yIG9iamVjdC5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHJlY3Vyc2l2ZWx5IGZvciBncm91cHMgKGFuZCBzdWJncm91cHMpXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wIGZvcm0gb3IgZ3JvdXAgY29tcG9uZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIGZvcm0gb3IgZ3JvdXAgc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1NjaGVtYShjb21wLCBzY2hlbWEsIHZpZXdQYXRoLCBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnMpIHtcbiAgICB2aWV3UGF0aCA9IHZpZXdQYXRoIHx8ICcnO1xuICAgIGZvcm1WaWV3UGF0aHMgPSBmb3JtVmlld1BhdGhzIHx8IHt9O1xuICAgIGZvcm1Nb2RlbFBhdGhzID0gZm9ybU1vZGVsUGF0aHMgfHwge307XG4gICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zID0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMgPSBkYXRhVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMuZnJvbU1vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy5mcm9tTW9kZWwgfHwge307XG4gICAgZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsIHx8IHt9O1xuXG4gICAgZGF0YVZhbGlkYXRpb25zID0gZGF0YVZhbGlkYXRpb25zIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwgPSBkYXRhVmFsaWRhdGlvbnMuZnJvbU1vZGVsIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy50b01vZGVsID0gZGF0YVZhbGlkYXRpb25zLnRvTW9kZWwgfHwge307XG5cbiAgICBpZiAoc2NoZW1hLml0ZW1zKVxuICAgICAgICBfcHJvY2Vzc1NjaGVtYUl0ZW1zLmNhbGwodGhpcywgY29tcCwgc2NoZW1hLml0ZW1zLCB2aWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKTtcblxuICAgIGlmIChzY2hlbWEubWVzc2FnZXMpXG4gICAgICAgIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMuY2FsbCh0aGlzLCBjb21wLCBzY2hlbWEubWVzc2FnZXMpO1xuXG4gICAgdmFyIGl0ZW1SdWxlID0gc2NoZW1hLnR5cGUgJiYgZm9ybVJlZ2lzdHJ5LmdldChzY2hlbWEudHlwZSk7XG4gICAgdmFyIGhvc3RPYmplY3QgPSB0aGlzLmdldEhvc3RPYmplY3QoKTtcblxuICAgIGlmICh2aWV3UGF0aCkge1xuICAgICAgICBmb3JtVmlld1BhdGhzW3ZpZXdQYXRoXSA9IHtcbiAgICAgICAgICAgIHNjaGVtYTogc2NoZW1hLFxuICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGl0ZW1SdWxlKSB7XG4gICAgICAgICAgICAvL2NoZWNrKGNvbXAuY29uc3RydWN0b3IsIGl0ZW1UeXBlc1tzY2hlbWEudHlwZV0uQ29tcENsYXNzKTtcbiAgICAgICAgICAgIGl0ZW1SdWxlLml0ZW1GdW5jdGlvbiAmJiBpdGVtUnVsZS5pdGVtRnVuY3Rpb24uY2FsbChob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICAgICAgX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zLmNhbGwodGhpcywgdmlld1BhdGgsIHNjaGVtYSk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleXdvcmQgaW4gc2NoZW1hS2V5d29yZHNSZWdpc3RyeSkge1xuICAgICAgICBpZiAoc2NoZW1hLmhhc093blByb3BlcnR5KGtleXdvcmQpKSB7XG4gICAgICAgICAgICB2YXIgcHJvY2Vzc0tleXdvcmRGdW5jID0gc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXTtcbiAgICAgICAgICAgIHByb2Nlc3NLZXl3b3JkRnVuYyhob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVsUGF0aFRyYW5zbGF0aW9ucztcblxuXG4gICAgZnVuY3Rpb24gX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zKHZpZXdQYXRoLCBzY2hlbWEpIHtcbiAgICAgICAgdmFyIG1vZGVsUGF0aCA9IHNjaGVtYS5tb2RlbFBhdGhcbiAgICAgICAgICAgICwgbW9kZWxQYXR0ZXJuID0gc2NoZW1hLm1vZGVsUGF0dGVybiB8fCAnJ1xuICAgICAgICAgICAgLCBub3RJbk1vZGVsID0gc2NoZW1hLm5vdEluTW9kZWxcbiAgICAgICAgICAgICwgdHJhbnNsYXRlID0gc2NoZW1hLnRyYW5zbGF0ZVxuICAgICAgICAgICAgLCB2YWxpZGF0ZSA9IHNjaGVtYS52YWxpZGF0ZTtcblxuICAgICAgICBpZiAodmlld1BhdGgpIHtcbiAgICAgICAgICAgIF9hZGREYXRhVHJhbnNsYXRpb24uY2FsbCh0aGlzLCB0cmFuc2xhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGl0ZW1SdWxlLm1vZGVsUGF0aFJ1bGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdwcm9oaWJpdGVkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbW9kZWxQYXRoIGlzIHByb2hpYml0ZWQgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZXF1aXJlZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghIChtb2RlbFBhdGggfHwgbm90SW5Nb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21vZGVsUGF0aCBpcyByZXF1aXJlZCBmb3IgaXRlbSB0eXBlICcgKyBzY2hlbWEudHlwZSArICcgLiBBZGQgXCJub3RJbk1vZGVsOiB0cnVlXCIgdG8gb3ZlcnJpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmFsbGluZyB0aHJvdWdoIHRvICdvcHRpb25hbCdcbiAgICAgICAgICAgICAgICBjYXNlICdvcHRpb25hbCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hOiBzY2hlbWEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISBub3RJbk1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIG1vZGVsUGF0dGVybik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFUcmFuc2xhdGlvbi5jYWxsKHRoaXMsIHRyYW5zbGF0ZSwgJ2Zyb21Nb2RlbCcsIG1vZGVsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFWYWxpZGF0aW9uLmNhbGwodGhpcywgdmFsaWRhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hZGREYXRhVmFsaWRhdGlvbi5jYWxsKHRoaXMsIHZhbGlkYXRlLCAnZnJvbU1vZGVsJywgbW9kZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gbW9kZWxQYXRoIHJ1bGUgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIHBhdGhQYXR0ZXJuKSB7XG4gICAgICAgIGlmICh2aWV3UGF0aCBpbiBtb2RlbFBhdGhUcmFuc2xhdGlvbnMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtcbiAgICAgICAgZWxzZSBpZiAoXy5rZXlPZihtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIG1vZGVsUGF0aCkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBtb2RlbCBwYXRoICcgKyBtb2RlbFBhdGggKyAnIGZvciB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zW3ZpZXdQYXRoICsgcGF0aFBhdHRlcm5dID0gbW9kZWxQYXRoICsgcGF0aFBhdHRlcm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZERhdGFUcmFuc2xhdGlvbih0cmFuc2xhdGUsIGRpcmVjdGlvbiwgcGF0aCkge1xuICAgICAgICB2YXIgdHJhbnNsYXRlRnVuYyA9IHRyYW5zbGF0ZSAmJiB0cmFuc2xhdGVbZGlyZWN0aW9uXTtcbiAgICAgICAgaWYgKCF0cmFuc2xhdGVGdW5jKSByZXR1cm47XG4gICAgICAgIGlmICh0eXBlb2YgdHJhbnNsYXRlRnVuYyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNsYXRlLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IGdldEZ1bmN0aW9uQ29udGV4dC5jYWxsKHRoaXMsIHRyYW5zbGF0ZS5jb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZUZ1bmMgPSB0cmFuc2xhdGVGdW5jLmJpbmQoY29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhVHJhbnNsYXRpb25zW2RpcmVjdGlvbl1bcGF0aF0gPSB0cmFuc2xhdGVGdW5jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpcmVjdGlvbiArICcgdHJhbnNsYXRvciBmb3IgJyArIHBhdGggKyAnIHNob3VsZCBiZSBmdW5jdGlvbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZERhdGFWYWxpZGF0aW9uKHZhbGlkYXRlLCBkaXJlY3Rpb24sIHBhdGgpIHtcbiAgICAgICAgdmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0ZSAmJiB2YWxpZGF0ZVtkaXJlY3Rpb25dO1xuICAgICAgICBpZiAoISB2YWxpZGF0b3JzKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGZvcm0gPSB0aGlzO1xuICAgICAgICB2YXIgZm9ybVZhbGlkYXRvcnMgPSBkYXRhVmFsaWRhdGlvbnNbZGlyZWN0aW9uXVtwYXRoXSA9IFtdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpKVxuICAgICAgICAgICAgdmFsaWRhdG9ycy5mb3JFYWNoKF9hZGRWYWxpZGF0b3JGdW5jKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9ycyk7XG5cbiAgICAgICAgZnVuY3Rpb24gX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9yKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICB2YXIgdmFsRnVuYyA9IGdldFZhbGlkYXRvckZ1bmN0aW9uKHZhbGlkYXRvcik7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWxpZGF0b3IgaW5zdGFuY2VvZiBSZWdFeHApXG4gICAgICAgICAgICAgICAgdmFsRnVuYyA9IG1ha2VSZWdleFZhbGlkYXRvcih2YWxpZGF0b3IpO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIHZhbEZ1bmMgPSB2YWxpZGF0b3I7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpcmVjdGlvbiArICcgdmFsaWRhdG9yIGZvciAnICsgcGF0aCArICcgc2hvdWxkIGJlIGZ1bmN0aW9uIG9yIHN0cmluZycpO1xuXG4gICAgICAgICAgICBpZiAodmFsaWRhdGUuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgdmFsaWRhdGUuY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICB2YWxGdW5jID0gdmFsRnVuYy5iaW5kKGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3JtVmFsaWRhdG9ycy5wdXNoKHZhbEZ1bmMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGdldFZhbGlkYXRvckZ1bmN0aW9uKHZhbGlkYXRvck5hbWUpIHtcbiAgICB2YXIgdmFsRnVuYyA9IHZhbGlkYXRpb25GdW5jdGlvbnNbdmFsaWRhdG9yTmFtZV07XG4gICAgaWYgKCEgdmFsRnVuYylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3JtOiB1bmtub3duIHZhbGlkYXRvciBmdW5jdGlvbiBuYW1lICcgKyB2YWxpZGF0b3JOYW1lKTtcbiAgICByZXR1cm4gdmFsRnVuYztcbn1cblxuXG5mdW5jdGlvbiBtYWtlUmVnZXhWYWxpZGF0b3IodmFsaWRhdG9yUmVnRXhwKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdmFsaWQgPSB2YWxpZGF0b3JSZWdFeHAudGVzdChkYXRhKVxuICAgICAgICAgICAgLCByZXNwb25zZSA9IE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UodmFsaWQsICdzaG91bGQgbWF0Y2ggcGF0dGVybicpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG4gICAgfTtcbn1cblxuXG4vKipcbiAqIFByb2Nlc3NlcyBpdGVtcyBvZiB0aGUgZm9ybSAob3IgZ3JvdXApLlxuICogQ29tcG9uZW50IHRoYXQgaGFzIGl0ZW1zIHNob3VsZCBoYXZlIENvbnRhaW5lciBmYWNldC5cbiAqIFJldHVybnMgdHJhbnNsYXRpb24gcnVsZXMgZm9yIENvbm5lY3Rvci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXAgZm9ybSBvciBncm91cCBjb21wb25lbnRcbiAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zIGxpc3Qgb2YgaXRlbXMgaW4gc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gX3Byb2Nlc3NTY2hlbWFJdGVtcyhjb21wLCBpdGVtcywgdmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucykge1xuICAgIGlmICghIGNvbXAuY29udGFpbmVyKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLndhcm4oJ0Zvcm0gV2FybmluZzogc2NoZW1hIGhhcyBpdGVtcyBidXQgY29tcG9uZW50IGhhcyBubyBjb250YWluZXIgZmFjZXQnKTtcblxuICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoIWl0ZW0uY29tcE5hbWUpIHJldHVybjsgLy8gTm8gY29tcG9uZW50LCBvbmx5IG1hcmt1cFxuXG4gICAgICAgIHZhciBpdGVtQ29tcCA9IGNvbXAuY29udGFpbmVyLnNjb3BlW2l0ZW0uY29tcE5hbWVdXG4gICAgICAgICAgICAsIGNvbXBWaWV3UGF0aCA9IHZpZXdQYXRoICsgJy4nICsgaXRlbS5jb21wTmFtZTtcbiAgICAgICAgaWYgKCEgaXRlbUNvbXApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbXBvbmVudCBcIicgKyBpdGVtLmNvbXBOYW1lICsgJ1wiIGlzIG5vdCBpbiBzY29wZSAob3Igc3Vic2NvcGUpIG9mIGZvcm0nKTtcbiAgICAgICAgcHJvY2Vzc1NjaGVtYS5jYWxsKHRoaXMsIGl0ZW1Db21wLCBpdGVtLCBjb21wVmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucyk7XG4gICAgfSwgdGhpcyk7XG59XG5cblxuLyoqXG4gKiBTdWJzY3JpYmVzIHRvIG1lc3NhZ2VzIG9uIGZhY2V0cyBvZiBpdGVtcycgY29tcG9uZW50IGFzIGRlZmluZWQgaW4gc2NoZW1hXG4gKi9cbmZ1bmN0aW9uIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMoY29tcCwgbWVzc2FnZXMpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG4gICAgXy5lYWNoS2V5KG1lc3NhZ2VzLCBmdW5jdGlvbihmYWNldE1lc3NhZ2VzLCBmYWNldE5hbWUpIHtcbiAgICAgICAgdmFyIGZhY2V0ID0gY29tcFtmYWNldE5hbWVdO1xuICAgICAgICBpZiAoISBmYWNldClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2NoZW1hIGhhcyBzdWJzY3JpcHRpb25zIGZvciBmYWNldCBcIicgKyBmYWNldE5hbWUgKyAnXCIgb2YgZm9ybSBjb21wb25lbnQgXCInICsgY29tcC5uYW1lICsgJ1wiLCBidXQgY29tcG9uZW50IGhhcyBubyBmYWNldCcpO1xuICAgICAgICBmYWNldE1lc3NhZ2VzID0gXy5jbG9uZShmYWNldE1lc3NhZ2VzKTtcbiAgICAgICAgXy5lYWNoS2V5KGZhY2V0TWVzc2FnZXMsIGZ1bmN0aW9uKHN1YnNjcmliZXIsIG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHR5cGVvZiBzdWJzY3JpYmVyID09ICdvYmplY3QnID8gc3Vic2NyaWJlci5jb250ZXh0IDogbnVsbDtcblxuICAgICAgICAgICAgLy8gQXZvaWQgY2hhbmdpbmcgZXZlbnQgc3Vic2NyaXB0aW9ucyB3aG9zZSBjb250ZXh0IGlzICdmYWNldCcgb3IgJ293bmVyJy5cbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT0gJ2ZhY2V0JyAmJiBjb250ZXh0ICE9ICdvd25lcicpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBmYWNldE1lc3NhZ2VzW21lc3NhZ2VUeXBlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcjogc3Vic2NyaWJlci5zdWJzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZhY2V0Lm9uQ29uZmlnTWVzc2FnZXMoZmFjZXRNZXNzYWdlcyk7XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvYmplY3QgdG8gYmluZCBhIGZ1bmN0aW9uIHRvIGFzIGRlZmluZWQgYnkgYSBzZWN0aW9uIG9mIHRoZSBmb3JtIHNjaGVtYS5cbiAqXG4gKiBDdXJyZW50bHkgc3VwcG9ydGVkIGlucHV0cyBhcmU6XG4gKiAgLSB7T2JqZWN0fSAtIEFueSBvYmplY3RcbiAqICAtIHtTdHJpbmd9ICdmb3JtJyAtIFRoZSBmb3JtXG4gKiAgLSB7U3RyaW5nfSAnaG9zdCcgLSBUaGUgZm9ybSdzIGhvc3Qgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uQ29udGV4dChjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQgPT0gJ2Zvcm0nKVxuICAgICAgICBjb250ZXh0ID0gdGhpcztcbiAgICBlbHNlIGlmIChjb250ZXh0ID09ICdob3N0JylcbiAgICAgICAgY29udGV4dCA9IHRoaXMuZ2V0SG9zdE9iamVjdCgpO1xuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgIT0gJ29iamVjdCcpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb250ZXh0IHN1cHBsaWVkIC0gRXhwZWN0ZWQge1N0cmluZ30gW2hvc3QsZm9ybV0sIG9yIHtPYmplY3R9Jyk7XG5cbiAgICByZXR1cm4gY29udGV4dDtcbn1cblxuXG4vKipcbiAqIFZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlUmVxdWlyZWQoZGF0YSwgY2FsbGJhY2spIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgZGF0YSAhPSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICYmICh0eXBlb2YgZGF0YSAhPSAnc3RyaW5nJyB8fCBkYXRhLnRyaW0oKSAhPSAnJyk7XG4gICAgdmFyIHJlc3BvbnNlID0gTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSh2YWxpZCwgJ3BsZWFzZSBlbnRlciBhIHZhbHVlJywgJ1JFUVVJUkVEJyk7XG4gICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UodmFsaWQsIHJlYXNvbiwgcmVhc29uQ29kZSkge1xuICAgIHJldHVybiB2YWxpZFxuICAgICAgICAgICAgPyB7IHZhbGlkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyB2YWxpZDogZmFsc2UsIHJlYXNvbjogcmVhc29uLCByZWFzb25Db2RlOiByZWFzb25Db2RlIH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb1QgPSBtaWxvLnV0aWwuZG9UXG4gICAgLCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgbWlsb0NvdW50ID0gbWlsby51dGlsLmNvdW50XG4gICAgLCBjb21wb25lbnROYW1lID0gbWlsby51dGlsLmNvbXBvbmVudE5hbWVcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKVxuICAgICwgaXRlbVR5cGVzID0gcmVxdWlyZSgnLi9pdGVtX3R5cGVzJyk7XG5cbnZhciBjYWNoZWRJdGVtcyA9IHt9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZm9ybUdlbmVyYXRvcjtcblxuXG52YXIgcGFydGlhbHMgPSB7XG4gICAgbGFiZWw6IFwie3s/IGl0Lml0ZW0ubGFiZWwgfX1cXG4gICAgPGxhYmVsPnt7PSBpdC5pdGVtLmxhYmVsfX08L2xhYmVsPlxcbnt7P319XFxuXCIsXG4gICAgZm9ybUdyb3VwOiBcIjxkaXZcXG4gICAge3s/IGl0Lml0ZW0uYWx0VGV4dCB9fXRpdGxlPVxcXCJ7ez0gaXQuaXRlbS5hbHRUZXh0fX1cXFwiIHt7P319XFxuICAgIGNsYXNzPVxcXCJmb3JtLWdyb3Vwe3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0ge3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19e3s/fX1cXFwiXFxuPlxcblwiXG59O1xuXG52YXIgZG90RGVmID0ge1xuICAgIHBhcnRpYWxzOiBwYXJ0aWFsc1xufTtcblxuXG4vKlxuICogR2VuZXJhdGVzIGZvcm0gSFRNTCBiYXNlZCBvbiB0aGUgc2NoZW1hLlxuICogSXQgZG9lcyBub3QgY3JlYXRlIGNvbXBvbmVudHMgZm9yIHRoZSBmb3JtIERPTSwgbWlsby5iaW5kZXIgc2hvdWxkIGJlIGNhbGxlZCBzZXBhcmF0ZWx5IG9uIHRoZSBmb3JtJ3MgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzY2hlbWEgYXJyYXkgb2YgZm9ybSBlbGVtZW50cyBkZXNjcmlwdG9yc1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtR2VuZXJhdG9yKHNjaGVtYSkge1xuICAgIC8vZ2V0SXRlbXNDbGFzc2VzKCk7XG5cbiAgICB2YXIgcmVuZGVyZWRJdGVtcyA9IHNjaGVtYS5pdGVtcy5tYXAocmVuZGVySXRlbSk7XG4gICAgcmV0dXJuIHJlbmRlcmVkSXRlbXMuam9pbignJyk7XG5cbiAgICBmdW5jdGlvbiByZW5kZXJJdGVtKGl0ZW0pIHtcbiAgICAgICAgdmFyIGl0ZW1UeXBlID0gY2FjaGVkSXRlbXNbaXRlbS50eXBlXTtcblxuICAgICAgICBpZiAoIWl0ZW1UeXBlKSB7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbVR5cGUgPSBmb3JtUmVnaXN0cnkuZ2V0KGl0ZW0udHlwZSk7XG4gICAgICAgICAgICBpdGVtVHlwZSA9IGNhY2hlZEl0ZW1zW2l0ZW0udHlwZV0gPSB7XG4gICAgICAgICAgICAgICAgQ29tcENsYXNzOiBuZXdJdGVtVHlwZS5jb21wQ2xhc3MgJiYgY29tcG9uZW50c1JlZ2lzdHJ5LmdldChuZXdJdGVtVHlwZS5jb21wQ2xhc3MpLFxuICAgICAgICAgICAgICAgIGNvbXBDbGFzczogbmV3SXRlbVR5cGUuY29tcENsYXNzLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBkb1QuY29tcGlsZShuZXdJdGVtVHlwZS50ZW1wbGF0ZSwgZG90RGVmKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaXRlbS5jb21wTmFtZSA9IGl0ZW1UeXBlLkNvbXBDbGFzcyA/IGl0ZW0uY29tcE5hbWUgfHwgY29tcG9uZW50TmFtZSgpIDogbnVsbDtcblxuICAgICAgICB2YXIgZG9tRmFjZXRDb25maWcgPSBpdGVtVHlwZS5Db21wQ2xhc3MgJiYgaXRlbVR5cGUuQ29tcENsYXNzLmdldEZhY2V0Q29uZmlnKCdkb20nKVxuICAgICAgICAgICAgLCB0YWdOYW1lID0gZG9tRmFjZXRDb25maWcgJiYgZG9tRmFjZXRDb25maWcudGFnTmFtZSB8fCAnZGl2JztcblxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBpdGVtVHlwZS50ZW1wbGF0ZTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICBjb21wTmFtZTogaXRlbS5jb21wTmFtZSxcbiAgICAgICAgICAgIGNvbXBDbGFzczogaXRlbVR5cGUuY29tcENsYXNzLFxuICAgICAgICAgICAgdGFnTmFtZTogdGFnTmFtZSxcbiAgICAgICAgICAgIGZvcm1HZW5lcmF0b3I6IGZvcm1HZW5lcmF0b3IsXG4gICAgICAgICAgICBtaWxvQ291bnQ6IG1pbG9Db3VudCxcbiAgICAgICAgICAgIGRpc2FibGVkOiBpdGVtLmRpc2FibGVkLFxuICAgICAgICAgICAgbXVsdGlwbGU6IGl0ZW0ubXVsdGlwbGVcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKTtcblxuXG52YXIgZ3JvdXBfZG90ID0gXCI8ZGl2IG1sLWJpbmQ9XFxcIk1MR3JvdXA6e3s9IGl0LmNvbXBOYW1lIH19XFxcInt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IGNsYXNzPVxcXCJ7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX1cXFwie3s/fX0+XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAge3s9IGl0LmZvcm1HZW5lcmF0b3IoaXQuaXRlbSkgfX1cXG48L2Rpdj5cXG5cIlxuICAgICwgd3JhcHBlcl9kb3QgPSBcIjxzcGFuIG1sLWJpbmQ9XFxcIk1MV3JhcHBlcjp7ez0gaXQuY29tcE5hbWUgfX1cXFwie3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0gY2xhc3M9XFxcInt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fVxcXCJ7ez99fT5cXG4gICAge3s9IGl0LmZvcm1HZW5lcmF0b3IoaXQuaXRlbSkgfX1cXG48L3NwYW4+XFxuXCJcbiAgICAsIHNlbGVjdF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHNwYW4gY2xhc3M9XFxcImN1c3RvbS1zZWxlY3RcXFwiPlxcbiAgICAgICAgPHNlbGVjdCBtbC1iaW5kPVxcXCJNTFNlbGVjdDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319XFxuICAgICAgICAgICAgICAgIHt7PyBpdC5tdWx0aXBsZSB9fW11bHRpcGxlIHt7P319XFxuICAgICAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcbiAgICAgICAgPC9zZWxlY3Q+XFxuICAgIDwvc3Bhbj5cXG48L2Rpdj5cXG5cIlxuICAgICwgaW5wdXRfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ7ez0gaXQuaXRlbS5pbnB1dFR5cGUgfHwgJ3RleHQnIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLmlucHV0TmFtZSB9fW5hbWU9XFxcInt7PSBpdC5pdGVtLmlucHV0TmFtZSB9fVxcXCJ7ez99fVxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MSW5wdXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLnBsYWNlaG9sZGVyIH19cGxhY2Vob2xkZXI9XFxcInt7PSBpdC5pdGVtLnBsYWNlaG9sZGVyfX1cXFwie3s/fX1cXG4gICAgICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcbjwvZGl2PlxcblwiXG4gICAgLCB0ZXh0YXJlYV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHRleHRhcmVhIG1sLWJpbmQ9XFxcIk1MVGV4dGFyZWE6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX1cXG4gICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiXFxuICAgICAgICB7ez8gaXQuaXRlbS5wbGFjZWhvbGRlciB9fXBsYWNlaG9sZGVyPVxcXCJ7ez0gaXQuaXRlbS5wbGFjZWhvbGRlcn19XFxcInt7P319XFxuICAgICAgICB7ez8gaXQuaXRlbS5hdXRvcmVzaXplIH19cm93cz1cXFwie3s9IGl0Lml0ZW0uYXV0b3Jlc2l6ZS5taW5MaW5lcyB9fVxcXCJ7ez99fT48L3RleHRhcmVhPlxcbjwvZGl2PlwiXG4gICAgLCBidXR0b25fZG90ID0gXCI8ZGl2IHt7PyBpdC5pdGVtLmFsdFRleHQgfX10aXRsZT1cXFwie3s9IGl0Lml0ZW0uYWx0VGV4dH19XFxcIiB7ez99fWNsYXNzPVxcXCJidG4tdG9vbGJhcnt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IHt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fXt7P319XFxcIj5cXG4gICAgPGJ1dHRvbiBtbC1iaW5kPVxcXCJNTEJ1dHRvbjp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCB7ez8gaXQuaXRlbS5pdGVtQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS5pdGVtQ3NzQ2xhc3MgfX17ez99fVxcXCI+XFxuICAgICAgICB7ez0gaXQuaXRlbS5sYWJlbCB8fCAnJyB9fVxcbiAgICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cIlxuICAgICwgaHlwZXJsaW5rX2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAgPGEge3s/IGl0Lml0ZW0uaHJlZn19aHJlZj1cXFwie3s9IGl0Lml0ZW0uaHJlZiB9fVxcXCJ7ez99fVxcbiAgICAgICAge3s/IGl0Lml0ZW0udGFyZ2V0fX10YXJnZXQ9XFxcInt7PSBpdC5pdGVtLnRhcmdldCB9fVxcXCJ7ez99fSAgIFxcbiAgICAgICAgbWwtYmluZD1cXFwiTUxIeXBlcmxpbms6e3s9IGl0LmNvbXBOYW1lIH19XFxcIiBcXG4gICAgICAgIGNsYXNzPVxcXCJoeXBlcmxpbmsgaHlwZXJsaW5rLWRlZmF1bHRcXFwiPlxcbiAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWwgfHwgJycgfX1cXG4gICAgPC9hPlxcbjwvZGl2PlwiXG4gICAgLCBjaGVja2JveF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICA8aW5wdXQgdHlwZT1cXFwiY2hlY2tib3hcXFwiXFxuICAgIGlkPVxcXCJ7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgIG1sLWJpbmQ9XFxcIk1MSW5wdXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICBjbGFzcz1cXFwie3s9IGl0Lml0ZW0uaXRlbUNzc0NsYXNzIHx8ICcnfX1cXFwiPlxcbiAgPGxhYmVsIGZvcj1cXFwie3s9IGl0LmNvbXBOYW1lIH19XFxcIj57ez0gaXQuaXRlbS5sYWJlbH19PC9sYWJlbD5cXG48L2Rpdj5cXG5cIlxuICAgICwgbGlzdF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHVsIG1sLWJpbmQ9XFxcIk1MTGlzdDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX0+XFxuICAgICAgICA8bGkgbWwtYmluZD1cXFwiTUxMaXN0SXRlbTppdGVtU2FtcGxlXFxcIiBjbGFzcz1cXFwibGlzdC1pdGVtXFxcIj5cXG4gICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVxcXCJbZGF0YV06bGFiZWxcXFwiPjwvc3Bhbj5cXG4gICAgICAgICAgICB7ez8gaXQuZWRpdEJ0biB9fTxidXR0b24gbWwtYmluZD1cXFwiW2V2ZW50c106ZWRpdEJ0blxcXCI+ZWRpdDwvYnV0dG9uPnt7P319XFxuICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVxcXCJbZXZlbnRzXTpkZWxldGVCdG5cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcXFwiPiA8L2J1dHRvbj5cXG4gICAgICAgIDwvbGk+XFxuICAgIDwvdWw+XFxuPC9kaXY+XFxuXCJcbiAgICAsIHRpbWVfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0aW1lXFxcIlxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MVGltZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuPC9kaXY+XCJcbiAgICAsIGRhdGVfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJkYXRlXFxcIlxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MRGF0ZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuPC9kaXY+XCJcbiAgICAsIGNvbWJvX2RvdCA9IFwiPGRpdiBtbC1iaW5kPVxcXCJNTENvbWJvOnt7PSBpdC5jb21wTmFtZSB9fVxcXCIgY2xhc3M9XFxcImZvcm0tZ3JvdXB7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX17ez99fVxcXCI+XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAge3sgdmFyIGxpc3RJRCA9ICdtbC1jb21iby1kYXRhbGlzdC0nICsgaXQubWlsb0NvdW50KCk7IH19XFxuICAgIDxpbnB1dCBtbC1iaW5kPVxcXCJbZGF0YSwgZXZlbnRzXTppbnB1dFxcXCJcXG4gICAgICAgICAgICBuYW1lPVxcXCJ7ez0gbGlzdElEIH19XFxcIlxcbiAgICAgICAgICAgIGxpc3Q9XFxcInt7PSBsaXN0SUQgfX1cXFwiXFxuICAgICAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX1cXG4gICAgICAgICAgICBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj5cXG4gICAgPGRhdGFsaXN0IGlkPVxcXCJ7ez0gbGlzdElEIH19XFxcIiBtbC1iaW5kPVxcXCJbdGVtcGxhdGVdOmRhdGFsaXN0XFxcIj48L2RhdGFsaXN0PlxcbjwvZGl2PlwiXG4gICAgLCBpbWFnZV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPGltZyB7ez8gaXQuaXRlbS5zcmMgfX1zcmM9XFxcInt7PSBpdC5pdGVtLnNyYyB9fVxcXCJ7ez99fVxcbiAgICAgICAgbWwtYmluZD1cXFwiTUxJbWFnZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuaXRlbS53aWR0aCB9fXdpZHRoPVxcXCJ7ez0gaXQuaXRlbS53aWR0aCB9fVxcXCJ7ez99fVxcbiAgICAgICAge3s/IGl0Lml0ZW0uaGVpZ2h0IH19aGVpZ2h0PVxcXCJ7ez0gaXQuaXRlbS5oZWlnaHQgfX1cXFwie3s/fX0+XFxuPC9kaXY+XFxuXCJcbiAgICAsIGRyb3B0YXJnZXRfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgICAgICA8aW1nIHt7PyBpdC5pdGVtLnNyYyB9fXNyYz1cXFwie3s9IGl0Lml0ZW0uc3JjIH19XFxcInt7P319XFxuICAgICAgICAgICAgbWwtYmluZD1cXFwiTUxEcm9wVGFyZ2V0Ont7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgICAgICB7ez8gaXQuaXRlbS53aWR0aCB9fXdpZHRoPVxcXCJ7ez0gaXQuaXRlbS53aWR0aCB9fVxcXCJ7ez99fVxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLmhlaWdodCB9fWhlaWdodD1cXFwie3s9IGl0Lml0ZW0uaGVpZ2h0IH19XFxcInt7P319PlxcbjwvZGl2PlxcblwiXG4gICAgLCB0ZXh0X2RvdCA9IFwie3t2YXIgdGFnTmFtZSA9IGl0Lml0ZW0udGFnTmFtZSB8fCAnc3Bhbic7fX1cXG48e3s9dGFnTmFtZX19IG1sLWJpbmQ9XFxcIk1MVGV4dDp7ez0gaXQuY29tcE5hbWUgfX1cXFwie3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0gY2xhc3M9XFxcInt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fVxcXCJ7ez99fT5cXG4gICAge3s/IGl0Lml0ZW0ubGFiZWwgfX1cXG4gICAgICAgIHt7PSBpdC5pdGVtLmxhYmVsfX1cXG4gICAge3s/fX1cXG48L3t7PXRhZ05hbWV9fT5cXG5cIlxuICAgICwgY2xlYXJfZG90ID0gJzxkaXYgY2xhc3M9XCJjYy1jbGVhclwiPjwvZGl2Pic7XG5cblxuZm9ybVJlZ2lzdHJ5LmFkZCgnZ3JvdXAnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEdyb3VwJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBncm91cF9kb3QsICAgICAgICAgICAgICAgICBtb2RlbFBhdGhSdWxlOiAncHJvaGliaXRlZCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCd3cmFwcGVyJywgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MV3JhcHBlcicsICAgICAgICAgICAgICAgdGVtcGxhdGU6IHdyYXBwZXJfZG90LCAgICAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdwcm9oaWJpdGVkJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3NlbGVjdCcsICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxTZWxlY3QnLCAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogc2VsZWN0X2RvdCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NTZWxlY3RTY2hlbWEgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnaW5wdXQnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTElucHV0JywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBpbnB1dF9kb3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0lucHV0U2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdpbnB1dGxpc3QnLCAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MSW5wdXRMaXN0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzSW5wdXRMaXN0U2NoZW1hICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3RleHRhcmVhJywgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxUZXh0YXJlYScsICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGV4dGFyZWFfZG90LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NUZXh0YXJlYVNjaGVtYSAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnYnV0dG9uJywgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEJ1dHRvbicsICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBidXR0b25fZG90LCAgICAgICAgICAgICAgICBtb2RlbFBhdGhSdWxlOiAnb3B0aW9uYWwnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdyYWRpbycsICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MUmFkaW9Hcm91cCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzUmFkaW9TY2hlbWEgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NoZWNrZ3JvdXAnLCAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxDaGVja0dyb3VwJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NDaGVja0dyb3VwU2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdoeXBlcmxpbmsnLCAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MSHlwZXJsaW5rJywgICAgICAgICAgICAgdGVtcGxhdGU6IGh5cGVybGlua19kb3QsICAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdvcHRpb25hbCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NoZWNrYm94JywgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxJbnB1dCcsICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogY2hlY2tib3hfZG90ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnbGlzdCcsICAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTExpc3QnLCAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBsaXN0X2RvdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCd0aW1lJywgICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MVGltZScsICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRpbWVfZG90LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBzZXRWYWx1ZSAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2RhdGUnLCAgICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxEYXRlJywgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogZGF0ZV9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY29tYm8nLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTENvbWJvJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjb21ib19kb3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0NvbWJvU2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdzdXBlcmNvbWJvJywgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MU3VwZXJDb21ibycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzU3VwZXJDb21ib1NjaGVtYSAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NvbWJvbGlzdCcsICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxDb21ib0xpc3QnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NDb21ib0xpc3RTY2hlbWEgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnaW1hZ2UnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEltYWdlJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBpbWFnZV9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdkcm9wdGFyZ2V0JywgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MRHJvcFRhcmdldCcsICAgICAgICAgICAgdGVtcGxhdGU6IGRyb3B0YXJnZXRfZG90LCAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdwcm9oaWJpdGVkJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3RleHQnLCAgICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxUZXh0JywgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGV4dF9kb3QsICAgICAgICAgICAgICAgICAgbW9kZWxQYXRoUnVsZTogJ29wdGlvbmFsJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY2xlYXInLCAgICAgICAgICAgICAgICAgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjbGVhcl9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuZnVuY3Rpb24gc2V0VmFsdWUoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuc2VsZWN0T3B0aW9ucztcbiAgICBpZiAoc2NoZW1hLmhhc093blByb3BlcnR5KCd2YWx1ZScpKSB7XG4gICAgICAgIGNvbXAuZGF0YS5zZXQoc2NoZW1hLnZhbHVlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTZWxlY3RTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuc2VsZWN0T3B0aW9ucztcbiAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbXBvbmVudE1vZGVsKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzUmFkaW9TY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEucmFkaW9PcHRpb25zO1xuICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tcG9uZW50TW9kZWwpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NDaGVja0dyb3VwU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIHZhciBvcHRpb25zID0gc2NoZW1hLmNoZWNrT3B0aW9ucztcbiAgICBjb21wLnNldFNlbGVjdEFsbCghIXNjaGVtYS5zZWxlY3RBbGwpO1xuICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tcG9uZW50TW9kZWwpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NDb21ib1NjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5jb21ib09wdGlvbnM7XG4gICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21wb25lbnRNb2RlbCk7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc1N1cGVyQ29tYm9TY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuY29tYm9PcHRpb25zXG4gICAgICAgICwgb3B0aW9uc1VSTCA9IHNjaGVtYS5jb21ib09wdGlvbnNVUkxcbiAgICAgICAgLCBhZGRJdGVtUHJvbXB0ID0gc2NoZW1hLmFkZEl0ZW1Qcm9tcHRcbiAgICAgICAgLCBwbGFjZUhvbGRlciA9IHNjaGVtYS5wbGFjZUhvbGRlcjtcblxuICAgIF8uZGVmZXJUaWNrcyhmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGFkZEl0ZW1Qcm9tcHQpIGNvbXAuc2V0QWRkSXRlbVByb21wdChhZGRJdGVtUHJvbXB0KTtcbiAgICAgICAgaWYgKHBsYWNlSG9sZGVyKSBjb21wLnNldFBsYWNlaG9sZGVyKHBsYWNlSG9sZGVyKTtcbiAgICAgICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21ib09wdGlvbnMpO1xuICAgICAgICBpZihvcHRpb25zVVJMKVxuICAgICAgICAgICAgY29tcC5pbml0T3B0aW9uc1VSTChvcHRpb25zVVJMKTtcbiAgICB9LCAyKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzQ29tYm9MaXN0U2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIHZhciBvcHRpb25zID0gc2NoZW1hLmNvbWJvT3B0aW9uc1xuICAgICAgICAsIGFkZEl0ZW1Qcm9tcHQgPSBzY2hlbWEuYWRkSXRlbVByb21wdFxuICAgICAgICAsIHBsYWNlSG9sZGVyID0gc2NoZW1hLnBsYWNlSG9sZGVyO1xuXG4gICAgXy5kZWZlclRpY2tzKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoYWRkSXRlbVByb21wdCkgY29tcC5zZXRBZGRJdGVtUHJvbXB0KGFkZEl0ZW1Qcm9tcHQpO1xuICAgICAgICBpZiAocGxhY2VIb2xkZXIpIGNvbXAuc2V0UGxhY2Vob2xkZXIocGxhY2VIb2xkZXIpO1xuICAgICAgICBjb21wLnNldERhdGFWYWxpZGF0aW9uKHNjaGVtYS5kYXRhVmFsaWRhdGlvbik7XG4gICAgICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tYm9PcHRpb25zKTtcbiAgICB9LCAyKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzSW5wdXRMaXN0U2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIGNvbXAuc2V0QXN5bmMoc2NoZW1hLmFzeW5jSGFuZGxlcik7XG4gICAgY29tcC5zZXRQbGFjZUhvbGRlcihzY2hlbWEucGxhY2VIb2xkZXIpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NUZXh0YXJlYVNjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICBpZiAoc2NoZW1hLmF1dG9yZXNpemUpXG4gICAgICAgIF8uZGVmZXJNZXRob2QoY29tcCwgJ3N0YXJ0QXV0b3Jlc2l6ZScsIHNjaGVtYS5hdXRvcmVzaXplKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzSW5wdXRTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgaWYgKF8uaXNOdW1lcmljKHNjaGVtYS5tYXhMZW5ndGgpKSBjb21wLnNldE1heExlbmd0aChzY2hlbWEubWF4TGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRNb2RlbEZ1bmMpIHtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMudGhlbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzZXRNb2RlbEZ1bmMoY29tcCwgW3sgdmFsdWU6IDAsIGxhYmVsOiAnbG9hZGluZy4uLicgfV0pO1xuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7IHNldE1vZGVsRnVuYyhjb21wLCBkYXRhKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHNldE1vZGVsRnVuYyhjb21wLCBbeyB2YWx1ZTogMCwgbGFiZWw6ICdsb2FkaW5nIGVycm9yJyB9XSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgIHNldE1vZGVsRnVuYyhjb21wLCBvcHRpb25zKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gc2V0Q29tcG9uZW50TW9kZWwoY29tcCwgZGF0YSkge1xuICAgIGNvbXAubW9kZWwuc2V0KGRhdGEpO1xuICAgIC8vIF8uZGVmZXJNZXRob2QoY29tcC5tb2RlbCwgJ3NldCcsIGRhdGEpO1xuICAgIC8vIGRvaW5nIGl0IHdpdGggZGVmZXIgbWFrZXMgY2hhbm5lbCBub3Qgc2V0IHdoZW4gdGhlIGFydGljbGUgaXMgb3BlbmVkXG59XG5cblxuZnVuY3Rpb24gc2V0Q29tYm9PcHRpb25zKGNvbXAsIGRhdGEpIHtcbiAgICBjb21wLnNldE9wdGlvbnMoZGF0YSk7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc1NjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICBjb21wLnByb2Nlc3NGb3JtU2NoZW1hKHNjaGVtYSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cbnZhciBmb3JtVHlwZXMgPSB7fTtcbnZhciBkZWZhdWx0cyA9IHt9O1xuXG52YXIgZm9ybVJlZ2lzdHJ5ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0OiByZWdpc3RyeV9nZXQsXG4gICAgYWRkOiByZWdpc3RyeV9hZGQsXG4gICAgc2V0RGVmYXVsdHM6IHJlZ2lzdHJ5X3NldERlZmF1bHRzXG59O1xuXG5cbnZhciBERUZBVUxUX1RFTVBMQVRFID0gJ3t7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8e3s9IGl0LnRhZ05hbWV9fSBtbC1iaW5kPVwie3s9IGl0LmNvbXBDbGFzc319Ont7PSBpdC5jb21wTmFtZSB9fVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC97ez0gaXQudGFnTmFtZX19PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xuXG5mb3JtUmVnaXN0cnkuc2V0RGVmYXVsdHMoe1xuICAgIHRlbXBsYXRlOiBERUZBVUxUX1RFTVBMQVRFLFxuICAgIG1vZGVsUGF0aFJ1bGU6ICdyZXF1aXJlZCcsXG4gICAgaXRlbUZ1bmN0aW9uOiBudWxsXG59KTtcblxuXG5mdW5jdGlvbiByZWdpc3RyeV9nZXQobmFtZSkge1xuICAgIHZhciBmb3JtSXRlbSA9IG5hbWUgJiYgZm9ybVR5cGVzW25hbWVdO1xuXG4gICAgaWYgKCFmb3JtSXRlbSkgXG4gICAgICAgIHJldHVybiBsb2dnZXIuZXJyb3IoJ0Zvcm0gaXRlbSAnICsgbmFtZSArICcgbm90IHJlZ2lzdGVyZWQnKTtcblxuICAgIHJldHVybiBmb3JtSXRlbTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0cnlfYWRkKG5hbWUsIG5ld0Zvcm1JdGVtKSB7XG4gICAgY2hlY2sobmFtZSwgU3RyaW5nKTtcbiAgICBjaGVjayhuZXdGb3JtSXRlbSwge1xuICAgICAgICBjb21wQ2xhc3M6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIHRlbXBsYXRlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBtb2RlbFBhdGhSdWxlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBpdGVtRnVuY3Rpb246IE1hdGNoLk9wdGlvbmFsKEZ1bmN0aW9uKVxuICAgIH0pO1xuXG4gICAgdmFyIGZvcm1JdGVtID0gXy5jbG9uZShkZWZhdWx0cyk7XG4gICAgXy5leHRlbmQoZm9ybUl0ZW0sIG5ld0Zvcm1JdGVtKTtcblxuICAgIGlmIChuYW1lICYmIGZvcm1UeXBlc1tuYW1lXSkgXG4gICAgICAgIHJldHVybiBsb2dnZXIuZXJyb3IoJ0Zvcm0gaXRlbSAnICsgbmFtZSArICcgYWxyZWFkeSByZWdpc3RlcmVkJyk7XG5cbiAgICBmb3JtVHlwZXNbbmFtZV0gPSBmb3JtSXRlbTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0cnlfc2V0RGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBjaGVjayhkZWZhdWx0cywgT2JqZWN0KTtcbiAgICBkZWZhdWx0cyA9IG5ld0RlZmF1bHRzO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbmlmICghKHdpbmRvdy5taWxvICYmIHdpbmRvdy5taWxvLm1pbG9fdmVyc2lvbikpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaWxvIGlzIG5vdCBhdmFpbGFibGUnKTtcblxuLyoqXG4gKiBgbWlsby11aWBcbiAqXG4gKiBUaGlzIGJ1bmRsZSB3aWxsIHJlZ2lzdGVyIGFkZGl0aW9uYWwgY29tcG9uZW50IGNsYXNzZXMgZm9yIFVJXG4gKi9cblxucmVxdWlyZSgnLi91c2VfY29tcG9uZW50cycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvR3JvdXAnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9XcmFwcGVyJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGV4dCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1NlbGVjdCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0lucHV0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSW5wdXRMaXN0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGV4dGFyZWEnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9SYWRpb0dyb3VwJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvQ2hlY2tHcm91cCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0J1dHRvbicpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0h5cGVybGluaycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0xpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9MaXN0SXRlbVNpbXBsZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0xpc3RJdGVtJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGltZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0RhdGUnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Db21ibycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1N1cGVyQ29tYm8nKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Db21ib0xpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9JbWFnZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0Ryb3BUYXJnZXQnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Gb2xkVHJlZScpO1xuXG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvYm9vdHN0cmFwL0FsZXJ0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvYm9vdHN0cmFwL0RpYWxvZycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bicpO1xuXG5yZXF1aXJlKCcuL2Zvcm1zL0Zvcm0nKTtcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKSxnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oy8qIVxuICogYXN5bmNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IENhb2xhbiBNY01haG9uXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBhc3luYyA9IHt9O1xuICAgIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHYpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvQm9vbCh2KSB7XG4gICAgICAgIHJldHVybiAhIXY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vdElkKHYpIHtcbiAgICAgICAgcmV0dXJuICF2O1xuICAgIH1cblxuICAgIC8vIGdsb2JhbCBvbiB0aGUgc2VydmVyLCB3aW5kb3cgaW4gdGhlIGJyb3dzZXJcbiAgICB2YXIgcHJldmlvdXNfYXN5bmM7XG5cbiAgICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCAoYHNlbGZgKSBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbiAgICAvLyBvbiB0aGUgc2VydmVyLCBvciBgdGhpc2AgaW4gc29tZSB2aXJ0dWFsIG1hY2hpbmVzLiBXZSB1c2UgYHNlbGZgXG4gICAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgICB2YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fFxuICAgICAgICAgICAgdGhpcztcblxuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBjcm9zcy1icm93c2VyIGNvbXBhdGlibGl0eSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgdmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICB2YXIgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIF90b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIC8vIFBvcnRlZCBmcm9tIHVuZGVyc2NvcmUuanMgaXNPYmplY3RcbiAgICB2YXIgX2lzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9pc0FycmF5TGlrZShhcnIpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5KGFycikgfHwgKFxuICAgICAgICAgICAgLy8gaGFzIGEgcG9zaXRpdmUgaW50ZWdlciBsZW5ndGggcHJvcGVydHlcbiAgICAgICAgICAgIHR5cGVvZiBhcnIubGVuZ3RoID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoID49IDAgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggJSAxID09PSAwXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2VhY2goY29sbCwgaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5TGlrZShjb2xsKSA/XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGNvbGwsIGl0ZXJhdG9yKSA6XG4gICAgICAgICAgICBfZm9yRWFjaE9mKGNvbGwsIGl0ZXJhdG9yKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXJyYXlFYWNoKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tYXAoYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmFuZ2UoY291bnQpIHtcbiAgICAgICAgcmV0dXJuIF9tYXAoQXJyYXkoY291bnQpLCBmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gaTsgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlZHVjZShhcnIsIGl0ZXJhdG9yLCBtZW1vKSB7XG4gICAgICAgIF9hcnJheUVhY2goYXJyLCBmdW5jdGlvbiAoeCwgaSwgYSkge1xuICAgICAgICAgICAgbWVtbyA9IGl0ZXJhdG9yKG1lbW8sIHgsIGksIGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZvckVhY2hPZihvYmplY3QsIGl0ZXJhdG9yKSB7XG4gICAgICAgIF9hcnJheUVhY2goX2tleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmRleE9mKGFyciwgaXRlbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHZhciBfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9rZXlJdGVyYXRvcihjb2xsKSB7XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHZhciBsZW47XG4gICAgICAgIHZhciBrZXlzO1xuICAgICAgICBpZiAoX2lzQXJyYXlMaWtlKGNvbGwpKSB7XG4gICAgICAgICAgICBsZW4gPSBjb2xsLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGkgOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBfa2V5cyhjb2xsKTtcbiAgICAgICAgICAgIGxlbiA9IGtleXMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8ga2V5c1tpXSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2ltaWxhciB0byBFUzYncyByZXN0IHBhcmFtIChodHRwOi8vYXJpeWEub2ZpbGFicy5jb20vMjAxMy8wMy9lczYtYW5kLXJlc3QtcGFyYW1ldGVyLmh0bWwpXG4gICAgLy8gVGhpcyBhY2N1bXVsYXRlcyB0aGUgYXJndW1lbnRzIHBhc3NlZCBpbnRvIGFuIGFycmF5LCBhZnRlciBhIGdpdmVuIGluZGV4LlxuICAgIC8vIEZyb20gdW5kZXJzY29yZS5qcyAoaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlL3B1bGwvMjE0MCkuXG4gICAgZnVuY3Rpb24gX3Jlc3RQYXJhbShmdW5jLCBzdGFydEluZGV4KSB7XG4gICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ID09IG51bGwgPyBmdW5jLmxlbmd0aCAtIDEgOiArc3RhcnRJbmRleDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKTtcbiAgICAgICAgICAgIHZhciByZXN0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICByZXN0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCArIHN0YXJ0SW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoIChzdGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIHJlc3QpO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ3VycmVudGx5IHVudXNlZCBidXQgaGFuZGxlIGNhc2VzIG91dHNpZGUgb2YgdGhlIHN3aXRjaCBzdGF0ZW1lbnQ6XG4gICAgICAgICAgICAvLyB2YXIgYXJncyA9IEFycmF5KHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgICAgIC8vIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHN0YXJ0SW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIC8vICAgICBhcmdzW2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBhcmdzW3N0YXJ0SW5kZXhdID0gcmVzdDtcbiAgICAgICAgICAgIC8vIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IodmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGV4cG9ydGVkIGFzeW5jIG1vZHVsZSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgLy8vLyBuZXh0VGljayBpbXBsZW1lbnRhdGlvbiB3aXRoIGJyb3dzZXItY29tcGF0aWJsZSBmYWxsYmFjayAvLy8vXG5cbiAgICAvLyBjYXB0dXJlIHRoZSBnbG9iYWwgcmVmZXJlbmNlIHRvIGd1YXJkIGFnYWluc3QgZmFrZVRpbWVyIG1vY2tzXG4gICAgdmFyIF9zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmIHNldEltbWVkaWF0ZTtcblxuICAgIHZhciBfZGVsYXkgPSBfc2V0SW1tZWRpYXRlID8gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgLy8gbm90IGEgZGlyZWN0IGFsaWFzIGZvciBJRTEwIGNvbXBhdGliaWxpdHlcbiAgICAgICAgX3NldEltbWVkaWF0ZShmbik7XG4gICAgfSA6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICB9IGVsc2Uge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IF9kZWxheTtcbiAgICB9XG4gICAgYXN5bmMuc2V0SW1tZWRpYXRlID0gX3NldEltbWVkaWF0ZSA/IF9kZWxheSA6IGFzeW5jLm5leHRUaWNrO1xuXG5cbiAgICBhc3luYy5mb3JFYWNoID1cbiAgICBhc3luYy5lYWNoID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2YoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoU2VyaWVzID1cbiAgICBhc3luYy5lYWNoU2VyaWVzID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cblxuICAgIGFzeW5jLmZvckVhY2hMaW1pdCA9XG4gICAgYXN5bmMuZWFjaExpbWl0ID0gZnVuY3Rpb24gKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gX2VhY2hPZkxpbWl0KGxpbWl0KShhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZiA9XG4gICAgYXN5bmMuZWFjaE9mID0gZnVuY3Rpb24gKG9iamVjdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdCB8fCBbXTtcbiAgICAgICAgdmFyIHNpemUgPSBfaXNBcnJheUxpa2Uob2JqZWN0KSA/IG9iamVjdC5sZW5ndGggOiBfa2V5cyhvYmplY3QpLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbXBsZXRlZCA9IDA7XG4gICAgICAgIGlmICghc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIF9lYWNoKG9iamVjdCwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXksIG9ubHlfb25jZShkb25lKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkID49IHNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZlNlcmllcyA9XG4gICAgYXN5bmMuZWFjaE9mU2VyaWVzID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYy5uZXh0VGljayhpdGVyYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGl0ZXJhdGUoKTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLmZvckVhY2hPZkxpbWl0ID1cbiAgICBhc3luYy5lYWNoT2ZMaW1pdCA9IGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2VhY2hPZkxpbWl0KGxpbWl0KShvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9lYWNoT2ZMaW1pdChsaW1pdCkge1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHJ1bm5pbmcgPSAwO1xuICAgICAgICAgICAgdmFyIGVycm9yZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uIHJlcGxlbmlzaCAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbmUgJiYgcnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmICFlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGVuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKF9lYWNoT2ZMaW1pdChsaW1pdCksIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9TZXJpZXMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZlNlcmllcywgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hc3luY01hcChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLm1hcCA9IGRvUGFyYWxsZWwoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBTZXJpZXMgPSBkb1NlcmllcyhfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9hc3luY01hcCk7XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMuaW5qZWN0ID1cbiAgICBhc3luYy5mb2xkbCA9XG4gICAgYXN5bmMucmVkdWNlID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIGZ1bmN0aW9uICh4LCBpLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgeCwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIG1lbW8gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyIHx8IG51bGwsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9sZHIgPVxuICAgIGFzeW5jLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXZlcnNlZCA9IF9tYXAoYXJyLCBpZGVudGl0eSkucmV2ZXJzZSgpO1xuICAgICAgICBhc3luYy5yZWR1Y2UocmV2ZXJzZWQsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7aW5kZXg6IGluZGV4LCB2YWx1ZTogeH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKF9tYXAocmVzdWx0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgICAgICAgICAgfSksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnNlbGVjdCA9XG4gICAgYXN5bmMuZmlsdGVyID0gZG9QYXJhbGxlbChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdExpbWl0ID1cbiAgICBhc3luYy5maWx0ZXJMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdFNlcmllcyA9XG4gICAgYXN5bmMuZmlsdGVyU2VyaWVzID0gZG9TZXJpZXMoX2ZpbHRlcik7XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0KGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2ZpbHRlcihlYWNoZm4sIGFyciwgZnVuY3Rpb24odmFsdWUsIGNiKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIGNiKCF2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGFzeW5jLnJlamVjdCA9IGRvUGFyYWxsZWwoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0TGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0U2VyaWVzID0gZG9TZXJpZXMoX3JlamVjdCk7XG5cbiAgICBmdW5jdGlvbiBfY3JlYXRlVGVzdGVyKGVhY2hmbiwgY2hlY2ssIGdldFJlc3VsdCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJyLCBsaW1pdCwgaXRlcmF0b3IsIGNiKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgICAgICAgICAgIGlmIChjYikgY2IoZ2V0UmVzdWx0KGZhbHNlLCB2b2lkIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGVlKHgsIF8sIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjYikgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNiICYmIGNoZWNrKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYihnZXRSZXN1bHQodHJ1ZSwgeCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBsaW1pdCwgaXRlcmF0ZWUsIGRvbmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yID0gbGltaXQ7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgaXRlcmF0ZWUsIGRvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLmFueSA9XG4gICAgYXN5bmMuc29tZSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLnNvbWVMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuYWxsID1cbiAgICBhc3luYy5ldmVyeSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBub3RJZCwgbm90SWQpO1xuXG4gICAgYXN5bmMuZXZlcnlMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIG5vdElkLCBub3RJZCk7XG5cbiAgICBmdW5jdGlvbiBfZmluZEdldFJlc3VsdCh2LCB4KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICBhc3luYy5kZXRlY3QgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RTZXJpZXMgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZlNlcmllcywgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG5cbiAgICBhc3luYy5zb3J0QnkgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMubWFwKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAoZXJyLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHt2YWx1ZTogeCwgY3JpdGVyaWE6IGNyaXRlcmlhfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIF9tYXAocmVzdWx0cy5zb3J0KGNvbXBhcmF0b3IpLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY29tcGFyYXRvcihsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhLCBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICAgICAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuYXV0byA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgdmFyIGlkeCA9IF9pbmRleE9mKGxpc3RlbmVycywgZm4pO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBsaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGFza0NvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLTtcbiAgICAgICAgICAgIF9hcnJheUVhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9hcnJheUVhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciB0YXNrID0gX2lzQXJyYXkodGFza3Nba10pID8gdGFza3Nba106IFt0YXNrc1trXV07XG4gICAgICAgICAgICB2YXIgdGFza0NhbGxiYWNrID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2FmZVJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgX2ZvckVhY2hPZihyZXN1bHRzLCBmdW5jdGlvbih2YWwsIHJrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW3JrZXldID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgdGFzay5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVhZC1sb2Nrc1xuICAgICAgICAgICAgdmFyIGxlbiA9IHJlcXVpcmVzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkZXA7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShkZXAgPSB0YXNrc1tyZXF1aXJlc1tsZW5dXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgaW5leGlzdGFudCBkZXBlbmRlbmN5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfaXNBcnJheShkZXApICYmIF9pbmRleE9mKGRlcCwgaykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKSAmJiAhcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uKHRpbWVzLCB0YXNrLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBERUZBVUxUX0lOVEVSVkFMID0gMDtcblxuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcblxuICAgICAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgICAgIHRpbWVzOiBERUZBVUxUX1RJTUVTLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IERFRkFVTFRfSU5URVJWQUxcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBwYXJzZVRpbWVzKGFjYywgdCl7XG4gICAgICAgICAgICBpZih0eXBlb2YgdCA9PT0gJ251bWJlcicpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiB0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodC50aW1lcywgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICAgICAgYWNjLmludGVydmFsID0gcGFyc2VJbnQodC5pbnRlcnZhbCwgMTApIHx8IERFRkFVTFRfSU5URVJWQUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYXJndW1lbnQgdHlwZSBmb3IgXFwndGltZXNcXCc6ICcgKyB0eXBlb2YgdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEgfHwgbGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50cyAtIG11c3QgYmUgZWl0aGVyICh0YXNrKSwgKHRhc2ssIGNhbGxiYWNrKSwgKHRpbWVzLCB0YXNrKSBvciAodGltZXMsIHRhc2ssIGNhbGxiYWNrKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAyICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrO1xuICAgICAgICAgICAgdGFzayA9IHRpbWVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGltZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHBhcnNlVGltZXMob3B0cywgdGltZXMpO1xuICAgICAgICB9XG4gICAgICAgIG9wdHMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgb3B0cy50YXNrID0gdGFzaztcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVkVGFzayh3cmFwcGVkQ2FsbGJhY2ssIHdyYXBwZWRSZXN1bHRzKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUF0dGVtcHQodGFzaywgZmluYWxBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2soIWVyciB8fCBmaW5hbEF0dGVtcHQsIHtlcnI6IGVyciwgcmVzdWx0OiByZXN1bHR9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgd3JhcHBlZFJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5SW50ZXJ2YWwoaW50ZXJ2YWwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUgKG9wdHMudGltZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBmaW5hbEF0dGVtcHQgPSAhKG9wdHMudGltZXMtPTEpO1xuICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlBdHRlbXB0KG9wdHMudGFzaywgZmluYWxBdHRlbXB0KSk7XG4gICAgICAgICAgICAgICAgaWYoIWZpbmFsQXR0ZW1wdCAmJiBvcHRzLmludGVydmFsID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlJbnRlcnZhbChvcHRzLmludGVydmFsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5zZXJpZXMoYXR0ZW1wdHMsIGZ1bmN0aW9uKGRvbmUsIGRhdGEpe1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBvcHRzLmNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHBhc3NlZCwgcnVuIHRoaXMgYXMgYSBjb250cm9sbCBmbG93XG4gICAgICAgIHJldHVybiBvcHRzLmNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrO1xuICAgIH07XG5cbiAgICBhc3luYy53YXRlcmZhbGwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGlmICghX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3cmFwSXRlcmF0b3IoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh3cmFwSXRlcmF0b3IobmV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbnN1cmVBc3luYyhpdGVyYXRvcikuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgd3JhcEl0ZXJhdG9yKGFzeW5jLml0ZXJhdG9yKHRhc2tzKSkoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3BhcmFsbGVsKGVhY2hmbiwgdGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UodGFza3MpID8gW10gOiB7fTtcblxuICAgICAgICBlYWNoZm4odGFza3MsIGZ1bmN0aW9uICh0YXNrLCBrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0YXNrKF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnBhcmFsbGVsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5wYXJhbGxlbExpbWl0ID0gZnVuY3Rpb24odGFza3MsIGxpbWl0LCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoX2VhY2hPZkxpbWl0KGxpbWl0KSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VyaWVzID0gZnVuY3Rpb24odGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2ZTZXJpZXMsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VDYWxsYmFjayhpbmRleCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEpID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSk6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWtlQ2FsbGJhY2soMCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmFwcGx5ID0gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGNhbGxBcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkoXG4gICAgICAgICAgICAgICAgbnVsbCwgYXJncy5jb25jYXQoY2FsbEFyZ3MpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIF9jb25jYXQoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGVzdC5hcHBseSh0aGlzLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZG9XaGlsc3QgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKytjYWxscyA8PSAxIHx8IHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudW50aWwgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9VbnRpbCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmRvV2hpbHN0KGl0ZXJhdG9yLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmR1cmluZyA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuXG4gICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2hlY2spO1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uKGVyciwgdHJ1dGgpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0cnV0aCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0KGNoZWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9EdXJpbmcgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIGFzeW5jLmR1cmluZyhmdW5jdGlvbihuZXh0KSB7XG4gICAgICAgICAgICBpZiAoY2FsbHMrKyA8IDEpIHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjb25jdXJyZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwb3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2sgfHwgbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfbmV4dChxLCB0YXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd29ya2VycyAtPSAxO1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIF9hcnJheUVhY2godGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHEgPSB7XG4gICAgICAgICAgICB0YXNrczogW10sXG4gICAgICAgICAgICBjb25jdXJyZW5jeTogY29uY3VycmVuY3ksXG4gICAgICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICAgICAgc2F0dXJhdGVkOiBub29wLFxuICAgICAgICAgICAgZW1wdHk6IG5vb3AsXG4gICAgICAgICAgICBkcmFpbjogbm9vcCxcbiAgICAgICAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGF1c2VkOiBmYWxzZSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBraWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5kcmFpbiA9IG5vb3A7XG4gICAgICAgICAgICAgICAgcS50YXNrcyA9IFtdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVuc2hpZnQ6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgdHJ1ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXEucGF1c2VkICYmIHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXNrcyA9IHEucGF5bG9hZCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS5wYXlsb2FkKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS50YXNrcy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF9tYXAodGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2IgPSBvbmx5X29uY2UoX25leHQocSwgdGFza3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcihkYXRhLCBjYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VycztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpZGxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChxLnBhdXNlZCA9PT0gZmFsc2UpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdW1lQ291bnQgPSBNYXRoLm1pbihxLmNvbmN1cnJlbmN5LCBxLnRhc2tzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gTmVlZCB0byBjYWxsIHEucHJvY2VzcyBvbmNlIHBlciBjb25jdXJyZW50XG4gICAgICAgICAgICAgICAgLy8gd29ya2VyIHRvIHByZXNlcnZlIGZ1bGwgY29uY3VycmVuY3kgYWZ0ZXIgcGF1c2VcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB3ID0gMTsgdyA8PSByZXN1bWVDb3VudDsgdysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfVxuXG4gICAgYXN5bmMucXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuICAgICAgICB2YXIgcSA9IF9xdWV1ZShmdW5jdGlvbiAoaXRlbXMsIGNiKSB7XG4gICAgICAgICAgICB3b3JrZXIoaXRlbXNbMF0sIGNiKTtcbiAgICAgICAgfSwgY29uY3VycmVuY3ksIDEpO1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5wcmlvcml0eVF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcblxuICAgICAgICBmdW5jdGlvbiBfY29tcGFyZVRhc2tzKGEsIGIpe1xuICAgICAgICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2JpbmFyeVNlYXJjaChzZXF1ZW5jZSwgaXRlbSwgY29tcGFyZSkge1xuICAgICAgICAgICAgdmFyIGJlZyA9IC0xLFxuICAgICAgICAgICAgICAgIGVuZCA9IHNlcXVlbmNlLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB3aGlsZSAoYmVnIDwgZW5kKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IGJlZyArICgoZW5kIC0gYmVnICsgMSkgPj4+IDEpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlKGl0ZW0sIHNlcXVlbmNlW21pZF0pID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYmVnID0gbWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IG1pZCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJlZztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoX2JpbmFyeVNlYXJjaChxLnRhc2tzLCBpdGVtLCBfY29tcGFyZVRhc2tzKSArIDEsIDAsIGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCB3aXRoIGEgbm9ybWFsIHF1ZXVlXG4gICAgICAgIHZhciBxID0gYXN5bmMucXVldWUod29ya2VyLCBjb25jdXJyZW5jeSk7XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgcHVzaCB0byBhY2NlcHQgc2Vjb25kIHBhcmFtZXRlciByZXByZXNlbnRpbmcgcHJpb3JpdHlcbiAgICAgICAgcS5wdXNoID0gZnVuY3Rpb24gKGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlbW92ZSB1bnNoaWZ0IGZ1bmN0aW9uXG4gICAgICAgIGRlbGV0ZSBxLnVuc2hpZnQ7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLmNhcmdvID0gZnVuY3Rpb24gKHdvcmtlciwgcGF5bG9hZCkge1xuICAgICAgICByZXR1cm4gX3F1ZXVlKHdvcmtlciwgMSwgcGF5bG9hZCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9jb25zb2xlX2ZuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb25zb2xlW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKGFyZ3MsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZVtuYW1lXSh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSldKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5sb2cgPSBfY29uc29sZV9mbignbG9nJyk7XG4gICAgYXN5bmMuZGlyID0gX2NvbnNvbGVfZm4oJ2RpcicpO1xuICAgIC8qYXN5bmMuaW5mbyA9IF9jb25zb2xlX2ZuKCdpbmZvJyk7XG4gICAgYXN5bmMud2FybiA9IF9jb25zb2xlX2ZuKCd3YXJuJyk7XG4gICAgYXN5bmMuZXJyb3IgPSBfY29uc29sZV9mbignZXJyb3InKTsqL1xuXG4gICAgYXN5bmMubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbiwgaGFzaGVyKSB7XG4gICAgICAgIHZhciBtZW1vID0ge307XG4gICAgICAgIHZhciBxdWV1ZXMgPSB7fTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGlkZW50aXR5O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIG1lbW9pemVkKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGtleSBpbiBtZW1vKSB7XG4gICAgICAgICAgICAgICAgYXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5IGluIHF1ZXVlcykge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxID0gcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVtb2l6ZWQubWVtbyA9IG1lbW87XG4gICAgICAgIG1lbW9pemVkLnVubWVtb2l6ZWQgPSBmbjtcbiAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH07XG5cbiAgICBhc3luYy51bm1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoZm4udW5tZW1vaXplZCB8fCBmbikuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3RpbWVzKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvdW50LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIG1hcHBlcihfcmFuZ2UoY291bnQpLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLnRpbWVzID0gX3RpbWVzKGFzeW5jLm1hcCk7XG4gICAgYXN5bmMudGltZXNTZXJpZXMgPSBfdGltZXMoYXN5bmMubWFwU2VyaWVzKTtcbiAgICBhc3luYy50aW1lc0xpbWl0ID0gZnVuY3Rpb24gKGNvdW50LCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5tYXBMaW1pdChfcmFuZ2UoY291bnQpLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VxID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IG5vb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBuZXh0YXJncykge1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIsIG5leHRhcmdzKTtcbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhhdCwgW2Vycl0uY29uY2F0KHJlc3VsdHMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY29tcG9zZSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLnNlcS5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIF9hcHBseUVhY2goZWFjaGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uKGZucywgYXJncykge1xuICAgICAgICAgICAgdmFyIGdvID0gX3Jlc3RQYXJhbShmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVhY2hmbihmbnMsIGZ1bmN0aW9uIChmbiwgXywgY2IpIHtcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncy5jb25jYXQoW2NiXSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ28uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ287XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmFwcGx5RWFjaCA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mKTtcbiAgICBhc3luYy5hcHBseUVhY2hTZXJpZXMgPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZlNlcmllcyk7XG5cblxuICAgIGFzeW5jLmZvcmV2ZXIgPSBmdW5jdGlvbiAoZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkb25lID0gb25seV9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIgdGFzayA9IGVuc3VyZUFzeW5jKGZuKTtcbiAgICAgICAgZnVuY3Rpb24gbmV4dChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFzayhuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGVuc3VyZUFzeW5jKGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5uZXJBcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmVuc3VyZUFzeW5jID0gZW5zdXJlQXN5bmM7XG5cbiAgICBhc3luYy5jb25zdGFudCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBhcmdzID0gW251bGxdLmNvbmNhdCh2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhc3luYy53cmFwU3luYyA9XG4gICAgYXN5bmMuYXN5bmNpZnkgPSBmdW5jdGlvbiBhc3luY2lmeShmdW5jKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiByZXN1bHQgaXMgUHJvbWlzZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChfaXNPYmplY3QocmVzdWx0KSAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIubWVzc2FnZSA/IGVyciA6IG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIE5vZGUuanNcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBhc3luYztcbiAgICB9XG4gICAgLy8gQU1EIC8gUmVxdWlyZUpTXG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZWQgZGlyZWN0bHkgdmlhIDxzY3JpcHQ+IHRhZ1xuICAgIGVsc2Uge1xuICAgICAgICByb290LmFzeW5jID0gYXN5bmM7XG4gICAgfVxuXG59KCkpO1xuIiwiXG4vLyBub3QgaW1wbGVtZW50ZWRcbi8vIFRoZSByZWFzb24gZm9yIGhhdmluZyBhbiBlbXB0eSBmaWxlIGFuZCBub3QgdGhyb3dpbmcgaXMgdG8gYWxsb3dcbi8vIHVudHJhZGl0aW9uYWwgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBtb2R1bGUuXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iXX0=
;