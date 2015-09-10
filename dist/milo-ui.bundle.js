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
        cls: 'ml-ui-radio-group'
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


var LISTITEM_CHANGE_MESSAGE = 'mllistitemchange';

var MLListItem = Component.createComponentClass('MLListItem', {
    container: undefined,
    dom: undefined,
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
    },
    data: {
        get: MLListItem_get,
        set: MLListItem_set,
        del: MLListItem_del,
        event: LISTITEM_CHANGE_MESSAGE
    },
    model: undefined,
    item: undefined
});

componentsRegistry.add(MLListItem);

var MLListItem = module.exports = MLListItem;


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


function MLListItem_get() {
    var value = this.model.get();
    return value !== null && typeof value == 'object' ? _.clone(value) : value;
}


function MLListItem_set(value) {
    if (typeof value == 'object')
        this.data._set(value);
    this.model.set(value);
    _sendChangeMessage.call(this);
    return value;
}


function MLListItem_del() {
    this.data._del();
    this.model.del();
    _sendChangeMessage.call(this);
}


function _sendChangeMessage() {
    this.data.dispatchSourceMessage(LISTITEM_CHANGE_MESSAGE);
}

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{"./generator":26,"./registry":28,"async":31}],26:[function(require,module,exports){
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

},{"./item_types":27,"./registry":28,"fs":32}],27:[function(require,module,exports){
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

},{"./registry":28,"fs":32}],28:[function(require,module,exports){
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


},{}],29:[function(require,module,exports){
'use strict';

if (!(window.milo && window.milo.milo_version))
    throw new Error('milo is not available');

/**
 * `milo-ui`
 *
 * This bundle will register additional component classes for UI
 */

require('./use_components');

},{"./use_components":30}],30:[function(require,module,exports){
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

},{"./components/Button":1,"./components/CheckGroup":2,"./components/Combo":3,"./components/ComboList":4,"./components/Date":5,"./components/DropTarget":6,"./components/FoldTree":7,"./components/Group":8,"./components/Hyperlink":9,"./components/Image":10,"./components/Input":11,"./components/InputList":12,"./components/List":13,"./components/ListItem":14,"./components/RadioGroup":15,"./components/Select":16,"./components/SuperCombo":17,"./components/Text":18,"./components/Textarea":19,"./components/Time":20,"./components/Wrapper":21,"./components/bootstrap/Alert":22,"./components/bootstrap/Dialog":23,"./components/bootstrap/Dropdown":24,"./forms/Form":25}],31:[function(require,module,exports){
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

},{"__browserify_process":33}],32:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],33:[function(require,module,exports){
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

},{}]},{},[29])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9CdXR0b24uanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvQ2hlY2tHcm91cC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21iby5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21ib0xpc3QuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvRGF0ZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Ecm9wVGFyZ2V0LmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0ZvbGRUcmVlLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0dyb3VwLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0h5cGVybGluay5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbWFnZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dExpc3QuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvTGlzdC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9SYWRpb0dyb3VwLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1NlbGVjdC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9TdXBlckNvbWJvLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1RleHQuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGV4dGFyZWEuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGltZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9XcmFwcGVyLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9BbGVydC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9ib290c3RyYXAvRGlhbG9nLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bi5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvZm9ybXMvRm9ybS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvZm9ybXMvZ2VuZXJhdG9yLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9mb3Jtcy9pdGVtX3R5cGVzLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9mb3Jtcy9yZWdpc3RyeS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvbWlsby11aS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvdXNlX2NvbXBvbmVudHMuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbm9kZV9tb2R1bGVzL2FzeW5jL2xpYi9hc3luYy5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2ZzLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxd0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0c0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTEJ1dHRvbiA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxCdXR0b24nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWJ1dHRvbidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEJ1dHRvbik7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxCdXR0b247XG5cbl8uZXh0ZW5kUHJvdG8oTUxCdXR0b24sIHtcbiAgICBkaXNhYmxlOiBNTEJ1dHRvbiRkaXNhYmxlLFxuICAgIGlzRGlzYWJsZWQ6IE1MQnV0dG9uJGlzRGlzYWJsZWRcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MQnV0dG9uJGRpc2FibGUoZGlzYWJsZSkge1xuICAgIHRoaXMuZWwuZGlzYWJsZWQgPSBkaXNhYmxlO1xufVxuXG5mdW5jdGlvbiBNTEJ1dHRvbiRpc0Rpc2FibGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMuZWwuZGlzYWJsZWQ7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIHVuaXF1ZUlkID0gbWlsby51dGlsLnVuaXF1ZUlkO1xuXG5cbnZhciBDSEVDS0VEX0NIQU5HRV9NRVNTQUdFID0gJ21sY2hlY2tncm91cGNoYW5nZSdcbiAgICAsIEVMRU1FTlRfTkFNRV9QUk9QRVJUWSA9ICdfbWxDaGVja0dyb3VwRWxlbWVudElEJ1xuICAgICwgRUxFTUVOVF9OQU1FX1BSRUZJWCA9ICdtbC1jaGVjay1ncm91cC0nO1xuXG52YXIgTUxDaGVja0dyb3VwID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTENoZWNrR3JvdXAnLCB7XG4gICAgZGF0YToge1xuICAgICAgICBzZXQ6IE1MQ2hlY2tHcm91cF9zZXQsXG4gICAgICAgIGdldDogTUxDaGVja0dyb3VwX2dldCxcbiAgICAgICAgZGVsOiBNTENoZWNrR3JvdXBfZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENIRUNLRURfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjbGljayc6IHsgc3Vic2NyaWJlcjogb25Hcm91cENsaWNrLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXJhZGlvLWdyb3VwJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICAne3t+IGl0LmNoZWNrT3B0aW9ucyA6b3B0aW9uIH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7eyMjZGVmLmVsSUQ6e3s9IGl0LmVsZW1lbnROYW1lIH19LXt7PSBvcHRpb24udmFsdWUgfX0jfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwie3s9IGl0Ll9yZW5kZXJPcHRpb25zLm9wdGlvbkNzc0NsYXNzIHx8IFwiJyArIEVMRU1FTlRfTkFNRV9QUkVGSVggKyAnb3B0aW9uXCIgfX1cIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJ7eyMgZGVmLmVsSUQgfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cInt7PSBvcHRpb24udmFsdWUgfX1cIiBuYW1lPVwie3s9IGl0LmVsZW1lbnROYW1lIH19XCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInt7IyBkZWYuZWxJRCB9fVwiPnt7PSBvcHRpb24ubGFiZWwgfX08L2xhYmVsPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiBcXFxuICAgICAgICAgICAgICAgICAgICB7e359fSBcXFxuICAgICAgICAgICAgICAgICAgICB7ez9pdC5fcmVuZGVyT3B0aW9ucy5zZWxlY3RBbGx9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAge3sjI2RlZi5hbGxJRDp7ez0gaXQuZWxlbWVudE5hbWUgfX0tYWxsI319IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIicgKyBFTEVNRU5UX05BTUVfUFJFRklYICsgJ2FsbFwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cInt7IyBkZWYuYWxsSUQgfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cImFsbFwiIG5hbWU9XCJhbGxcIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwie3sjIGRlZi5hbGxJRCB9fVwiPkFsbDwvbGFiZWw+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXG4gICAgICAgICAgICAgICAgICAgIHt7P319J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQ2hlY2tHcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxDaGVja0dyb3VwO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxDaGVja0dyb3VwLCB7XG4gICAgaW5pdDogTUxDaGVja0dyb3VwJGluaXQsXG4gICAgZGVzdHJveTogTUxDaGVja0dyb3VwJGRlc3Ryb3ksXG4gICAgc2V0U2VsZWN0QWxsOiBNTENoZWNrR3JvdXAkc2V0U2VsZWN0QWxsXG59KTtcblxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEluaXRpYWxpemUgcmFkaW8gZ3JvdXAgYW5kIHNldHVwXG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cCRpbml0KCkge1xuICAgIF8uZGVmaW5lUHJvcGVydHkodGhpcywgRUxFTUVOVF9OQU1FX1BST1BFUlRZLCBFTEVNRU5UX05BTUVfUFJFRklYICsgdW5pcXVlSWQoKSk7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucyA9IHt9O1xuICAgIHRoaXMuX2NoZWNrRWxzID0ge307XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gTUxDaGVja0dyb3VwJHNldFNlbGVjdEFsbChzZWxlY3RBbGwpIHtcbiAgICB0aGlzLl9yZW5kZXJPcHRpb25zLnNlbGVjdEFsbCA9IHNlbGVjdEFsbDtcbn1cblxuXG4vKipcbiAqIFNldHMgZ3JvdXAgdmFsdWVcbiAqIFJlcGxhY2VzIHRoZSBkYXRhIHNldCBvcGVyYXRpb24gdG8gZGVhbCB3aXRoIHJhZGlvIGJ1dHRvbnNcbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgc2V0XG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cF9zZXQodmFsdWVPYmopIHtcbiAgICBfLmVhY2hLZXkodGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCwga2V5KSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSAhIXZhbHVlT2JqW2tleV07XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBHZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXRyaWV2ZXMgdGhlIHNlbGVjdGVkIHZhbHVlIG9mIHRoZSBncm91cFxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gTUxDaGVja0dyb3VwX2dldCgpIHtcbiAgICByZXR1cm4gXy5tYXBLZXlzKHRoaXMuX2NoZWNrRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgcmV0dXJuIGVsLmNoZWNrZWQ7XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBEZWxldGVkIGdyb3VwIHZhbHVlXG4gKiBEZWxldGVzIHRoZSB2YWx1ZSBvZiB0aGUgZ3JvdXAsIHNldHRpbmcgaXQgdG8gZW1wdHlcbiAqL1xuZnVuY3Rpb24gTUxDaGVja0dyb3VwX2RlbCgpIHtcbiAgICBfLmVhY2hLZXkodGhpcy5fb3B0aW9uRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cblxuLyoqXG4gKiBNYW5hZ2UgcmFkaW8gY2hpbGRyZW4gY2xpY2tzXG4gKi9cbmZ1bmN0aW9uIG9uR3JvdXBDbGljayhldmVudFR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIGNsaWNrZWRFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIHZhciBjaGVja2JveExpc3QgPSB0aGlzLmNvbnRhaW5lci5zY29wZS5jaGVja2JveExpc3Q7XG5cbiAgICBpZiAoY2xpY2tlZEVsZW1lbnQudHlwZSAhPT0gJ2NoZWNrYm94JykgcmV0dXJuO1xuXG4gICAgaWYgKGNsaWNrZWRFbGVtZW50Lm5hbWUgPT09ICdhbGwnKSB7XG4gICAgICAgIF8uZWFjaEtleSh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsLCBrZXkpIHtcbiAgICAgICAgICAgIGVsLmNoZWNrZWQgPSBjbGlja2VkRWxlbWVudC5jaGVja2VkO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaXNDaGVja2VkID0gY2xpY2tlZEVsZW1lbnQuY2hlY2tlZCAmJiBpc0FsbEVsZW1lbnRDaGVja2VkLmNhbGwodGhpcyk7XG4gICAgICAgIHNldEFsbENoZWNrZWQuY2FsbCh0aGlzLCBpc0NoZWNrZWQpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBzZXRBbGxDaGVja2VkKGNoZWNrZWQpIHtcbiAgICBpZiAodGhpcy5fcmVuZGVyT3B0aW9ucy5zZWxlY3RBbGwpXG4gICAgICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImFsbFwiXScpLmNoZWNrZWQgPSBjaGVja2VkO1xufVxuXG5mdW5jdGlvbiBpc0FsbEVsZW1lbnRDaGVja2VkKGRhdGEpIHtcbiAgICByZXR1cm4gXy5ldmVyeUtleSh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsKSB7IHJldHVybiBlbC5jaGVja2VkOyB9KTtcbn1cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENIRUNLRURfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5cbi8vIFNldCByYWRpbyBidXR0b24gY2hpbGRyZW4gb24gbW9kZWwgY2hhbmdlXG5mdW5jdGlvbiBvbk9wdGlvbnNDaGFuZ2UocGF0aCwgZGF0YSkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKHtcbiAgICAgICAgY2hlY2tPcHRpb25zOiB0aGlzLm1vZGVsLmdldCgpLFxuICAgICAgICBlbGVtZW50TmFtZTogdGhpc1tFTEVNRU5UX05BTUVfUFJPUEVSVFldLFxuICAgICAgICBfcmVuZGVyT3B0aW9uczogdGhpcy5fcmVuZGVyT3B0aW9uc1xuICAgIH0pO1xuXG4gICAgdGhpcy5fY2hlY2tFbHMgPSB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXy5mb3JFYWNoKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyksIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBpZiAoZWwubmFtZSAhPSAnYWxsJykgc2VsZi5fY2hlY2tFbHNbZWwudmFsdWVdID0gZWw7XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gTUxDaGVja0dyb3VwJGRlc3Ryb3koKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NoZWNrRWxzO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgQ09NQk9fQ0hBTkdFX01FU1NBR0UgPSAnbWxjb21ib2NoYW5nZSc7XG5cbnZhciBEQVRBTElTVF9URU1QTEFURSA9ICd7e34gaXQuY29tYm9PcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwie3s9IG9wdGlvbi5sYWJlbCB9fVwiPjwvb3B0aW9uPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19JztcblxudmFyIE1MQ29tYm8gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQ29tYm8nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MQ29tYm9fZ2V0LFxuICAgICAgICBzZXQ6IE1MQ29tYm9fc2V0LFxuICAgICAgICBkZWw6IE1MQ29tYm9fZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWRhdGFsaXN0J1xuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQ29tYm8pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQ29tYm87XG5cblxuXy5leHRlbmRQcm90byhNTENvbWJvLCB7XG4gICAgaW5pdDogTUxDb21ibyRpbml0XG59KTtcblxuXG5mdW5jdGlvbiBNTENvbWJvJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vbignY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAnX2NvbWJvSW5wdXQnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5pbnB1dCxcbiAgICAgICAgJ19jb21ib0xpc3QnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5kYXRhbGlzdFxuICAgIH0pO1xuXG4gICAgdGhpcy5fY29tYm9MaXN0LnRlbXBsYXRlLnNldChEQVRBTElTVF9URU1QTEFURSk7XG5cbiAgICB0aGlzLl9jb21ib0lucHV0LmRhdGEub24oJ2lucHV0JyxcbiAgICAgICAgeyBzdWJzY3JpYmVyOiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UsIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9fZ2V0KCkge1xuICAgIGlmICghIHRoaXMuX2NvbWJvSW5wdXQpIHJldHVybjtcbiAgICByZXR1cm4gdGhpcy5fY29tYm9JbnB1dC5kYXRhLmdldCgpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvX3NldCh2YWx1ZSkge1xuICAgIHJldHVybiBjaGFuZ2VDb21ib0RhdGEuY2FsbCh0aGlzLCAnc2V0JywgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvX2RlbCgpIHtcbiAgICByZXR1cm4gY2hhbmdlQ29tYm9EYXRhLmNhbGwodGhpcywgJ2RlbCcsIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlQ29tYm9EYXRhKG1ldGhvZCwgdmFsdWUpIHtcbiAgICBpZiAoISB0aGlzLl9jb21ib0lucHV0KSByZXR1cm47XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NvbWJvSW5wdXQuZGF0YVttZXRob2RdKHZhbHVlKTtcbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbi8vIFBvc3QgdGhlIGRhdGEgY2hhbmdlXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19DSEFOR0VfTUVTU0FHRSk7XG59XG5cbmZ1bmN0aW9uIG9uT3B0aW9uc0NoYW5nZShtc2csIGRhdGEpIHtcbiAgICB0aGlzLl9jb21ib0xpc3QudGVtcGxhdGUucmVuZGVyKHtcbiAgICAgICAgY29tYm9PcHRpb25zOiB0aGlzLm1vZGVsLmdldCgpXG4gICAgfSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxudmFyIENPTUJPX0xJU1RfQ0hBTkdFX01FU1NBR0UgPSAnbWxjb21ib2xpc3RjaGFuZ2UnO1xuXG5cbnZhciBNTENvbWJvTGlzdCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxDb21ib0xpc3QnLCB7XG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWNvbWJvLWxpc3QnXG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxDb21ib0xpc3RfZ2V0LFxuICAgICAgICBzZXQ6IE1MQ29tYm9MaXN0X3NldCxcbiAgICAgICAgZGVsOiBNTENvbWJvTGlzdF9kZWwsXG4gICAgICAgIGV2ZW50OiBDT01CT19MSVNUX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25JdGVtc0NoYW5nZSwgY29udGV4dDogJ293bmVyJ31cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IG1sLWJpbmQ9XCJNTFN1cGVyQ29tYm86Y29tYm9cIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdDpsaXN0XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0SXRlbTppdGVtXCIgY2xhc3M9XCJsaXN0LWl0ZW1cIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltkYXRhXTpsYWJlbFwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltldmVudHNdOmRlbGV0ZUJ0blwiIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj4nXG4gICAgfVxufSk7XG5cblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTENvbWJvTGlzdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxDb21ib0xpc3Q7XG5cblxuXy5leHRlbmRQcm90byhNTENvbWJvTGlzdCwge1xuICAgIGluaXQ6IE1MQ29tYm9MaXN0JGluaXQsXG4gICAgc2V0T3B0aW9uczogTUxDb21ib0xpc3Qkc2V0T3B0aW9ucyxcbiAgICBzZXREYXRhVmFsaWRhdGlvbjogTUxDb21ib0xpc3Qkc2V0RGF0YVZhbGlkYXRpb24sXG4gICAgdG9nZ2xlQWRkQnV0dG9uOiBNTENvbWJvTGlzdCR0b2dnbGVBZGRCdXR0b24sXG4gICAgZGVzdHJveTogTUxDb21ib0xpc3QkZGVzdHJveSxcbiAgICBzZXRBZGRJdGVtUHJvbXB0OiBNTENvbWJvTGlzdCRzZXRBZGRJdGVtUHJvbXB0LFxuICAgIGNsZWFyQ29tYm9JbnB1dCA6IE1MQ29tYm9MaXN0JGNsZWFyQ29tYm9JbnB1dFxufSk7XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3QkaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm1vZGVsLnNldChbXSk7XG4gICAgdGhpcy5vbmNlKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRzZXREYXRhVmFsaWRhdGlvbihkYXRhVmFsaWRhdGlvbikge1xuICAgIGNoZWNrKGRhdGFWYWxpZGF0aW9uLCBNYXRjaC5PcHRpb25hbChGdW5jdGlvbikpO1xuICAgIHRoaXMuX2RhdGFWYWxpZGF0aW9uID0gZGF0YVZhbGlkYXRpb247XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHNldE9wdGlvbnMoYXJyKSB7XG4gICAgdGhpcy5fY29tYm8uc2V0T3B0aW9ucyhhcnIpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JGNsZWFyQ29tYm9JbnB1dCAoKSB7XG4gICAgdGhpcy5fY29tYm8uY2xlYXJDb21ib0lucHV0KCk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgYWRkIGJ1dHRvblxuICogQHBhcmFtIHtCb29sZWFufSBzaG93XG4gKi9cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHRvZ2dsZUFkZEJ1dHRvbihzaG93KSB7XG4gICAgdGhpcy5fY29tYm8udG9nZ2xlQWRkQnV0dG9uKHNob3cpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHNldEFkZEl0ZW1Qcm9tcHQocHJvbXB0KSB7XG4gICB0aGlzLl9jb21iby5zZXRBZGRJdGVtUHJvbXB0KHByb21wdCk7XG59XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3QkZGVzdHJveSgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgJiYgbWlsby5taW5kZXIuZGVzdHJveUNvbm5lY3Rvcih0aGlzLl9jb25uZWN0b3IpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG59XG5cblxuZnVuY3Rpb24gb25DaGlsZHJlbkJvdW5kKCkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKCkuYmluZGVyKCk7XG4gICAgY29tcG9uZW50U2V0dXAuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50U2V0dXAoKSB7XG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgJ19jb21ibyc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmNvbWJvLFxuICAgICAgICAnX2xpc3QnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5saXN0XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jb25uZWN0b3IgPSBtaWxvLm1pbmRlcih0aGlzLl9saXN0Lm1vZGVsLCAnPDw8LT4+PicsIHRoaXMubW9kZWwpO1xuICAgIHRoaXMuX2NvbWJvLmRhdGEub24oJycsIHsgc3Vic2NyaWJlcjogb25Db21ib0NoYW5nZSwgY29udGV4dDogdGhpcyB9KTtcbiAgICB0aGlzLl9jb21iby5vbignYWRkaXRlbScsIHsgc3Vic2NyaWJlcjogb25BZGRJdGVtLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG5mdW5jdGlvbiBvbkNvbWJvQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIGlmIChkYXRhLm5ld1ZhbHVlICYmIHJ1bkRhdGFWYWxpZGF0aW9uLmNhbGwodGhpcywgbXNnLCBkYXRhKSlcbiAgICAgICAgdGhpcy5fbGlzdC5tb2RlbC5wdXNoKGRhdGEubmV3VmFsdWUpO1xuICAgIHRoaXMuX2NvbWJvLmRhdGEuZGVsKCk7XG4gICAgLy8gYmVjYXVzZSBvZiBzdXBlcmNvbWJvIGxpc3RlbmVycyBvZmYgeW91IGhhdmUgdG8gc2V0IF92YWx1ZSBleHBsaWNpdGx5XG4gICAgdGhpcy5fY29tYm8uZGF0YS5fdmFsdWUgPSAnJztcbn1cblxuZnVuY3Rpb24gcnVuRGF0YVZhbGlkYXRpb24obXNnLCBkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWYWxpZGF0aW9uIFxuICAgICAgICA/IHRoaXMuX2RhdGFWYWxpZGF0aW9uKG1zZywgZGF0YSwgdGhpcy5fbGlzdC5tb2RlbC5nZXQoKSlcbiAgICAgICAgOiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvbkl0ZW1zQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoQ09NQk9fTElTVF9DSEFOR0VfTUVTU0FHRSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0X2dldCgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgPyBfLmNsb25lKHZhbHVlKSA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdF9zZXQodmFsdWUpIHtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0X2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5zZXQoW10pO1xufVxuXG5cbmZ1bmN0aW9uIG9uQWRkSXRlbShtc2csIGRhdGEpIHtcbiAgICB0aGlzLnBvc3RNZXNzYWdlKCdhZGRpdGVtJywgZGF0YSk7XG4gICAgdGhpcy5ldmVudHMucG9zdE1lc3NhZ2UoJ21pbG9fY29tYm9saXN0YWRkaXRlbScsIGRhdGEpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIE1MRGF0ZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxEYXRlJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTERhdGVfZ2V0LFxuICAgICAgICBzZXQ6IE1MRGF0ZV9zZXQsXG4gICAgICAgIGRlbDogTUxEYXRlX2RlbCxcbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1kYXRlJ1xuICAgIH1cbn0pO1xuXG5fLmV4dGVuZFByb3RvKE1MRGF0ZSwge1xuICAgIGdldE1pbjogTUxEYXRlJGdldE1pbixcbiAgICBzZXRNaW46IE1MRGF0ZSRzZXRNaW4sXG4gICAgZ2V0TWF4OiBNTERhdGUkZ2V0TWF4LFxuICAgIHNldE1heDogTUxEYXRlJHNldE1heFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEYXRlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTERhdGU7XG5cblxuZnVuY3Rpb24gTUxEYXRlJGdldE1pbigpIHtcbiAgICByZXR1cm4gXy5kYXRlKHRoaXMuZWwubWluKTtcbn1cblxuXG5mdW5jdGlvbiBNTERhdGUkc2V0TWluKHZhbHVlKSB7XG4gICAgdmFyIGRhdGUgPSBfLnRvRGF0ZSh2YWx1ZSk7XG5cbiAgICB0aGlzLmVsLm1pbiA9IGRhdGUgPyB0b0lTTzg2MDFGb3JtYXQoZGF0ZSkgOiAnJztcbn1cblxuXG5mdW5jdGlvbiBNTERhdGUkZ2V0TWF4KCkge1xuICAgIHJldHVybiBfLmRhdGUodGhpcy5lbC5tYXgpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZSRzZXRNYXgodmFsdWUpIHtcbiAgICB2YXIgZGF0ZSA9IF8udG9EYXRlKHZhbHVlKTtcblxuICAgIHRoaXMuZWwubWF4ID0gZGF0ZSA/IHRvSVNPODYwMUZvcm1hdChkYXRlKSA6ICcnO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZV9nZXQoKSB7XG4gICAgcmV0dXJuIF8udG9EYXRlKHRoaXMuZWwudmFsdWUpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZV9zZXQodmFsdWUpIHtcbiAgICB2YXIgZGF0ZSA9IF8udG9EYXRlKHZhbHVlKTtcblxuICAgIHRoaXMuZWwudmFsdWUgPSBkYXRlID8gdG9JU084NjAxRm9ybWF0KGRhdGUpIDogJyc7XG5cbiAgICBkaXNwYXRjaElucHV0TWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBNTERhdGVfZGVsKCkge1xuICAgIHRoaXMuZWwudmFsdWUgPSAnJztcblxuICAgIGRpc3BhdGNoSW5wdXRNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cblxuZnVuY3Rpb24gZGlzcGF0Y2hJbnB1dE1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZSgnaW5wdXQnKTsgLy8gRGlzcGF0Y2ggdGhlICdpbnB1dCcgKHVzdWFsbHkgZGlzcGF0Y2hlZCBieSB0aGUgdW5kZXJseWluZyA8aW5wdXQ+IGVsZW1lbnQpIGV2ZW50IHNvIHRoYXQgdGhlIGRhdGEgY2hhbmdlIGNhbiBiZSBsaXN0ZW5lZCB0b1xufVxuXG5cbmZ1bmN0aW9uIHRvSVNPODYwMUZvcm1hdChkYXRlKSB7XG4gICAgdmFyIGRhdGVBcnIgPSBbXG4gICAgICAgIGRhdGUuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgcGFkKGRhdGUuZ2V0TW9udGgoKSArIDEpLFxuICAgICAgICBwYWQoZGF0ZS5nZXREYXRlKCkpXG4gICAgXTtcblxuICAgIHZhciBkYXRlU3RyID0gZGF0ZUFyci5qb2luKCctJyk7XG5cbiAgICByZXR1cm4gZGF0ZVN0cjtcblxuICAgIGZ1bmN0aW9uIHBhZChuKSB7IHJldHVybiBuIDwgMTAgPyAnMCcgKyBuIDogbjsgfVxufSIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxEcm9wVGFyZ2V0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTERyb3BUYXJnZXQnLCBbJ2Ryb3AnXSk7XG5cblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERyb3BUYXJnZXQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRHJvcFRhcmdldDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRvVCA9IG1pbG8udXRpbC5kb1RcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIHVuaXF1ZUlkID0gbWlsby51dGlsLnVuaXF1ZUlkO1xuXG52YXIgVFJFRV9URU1QTEFURSA9ICc8dWwgY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1saXN0XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7fiBpdC5kYXRhLml0ZW1zIDppdGVtOmluZGV4IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyB2YXIgaGFzU3ViVHJlZSA9IGl0ZW0uaXRlbXMgJiYgaXRlbS5pdGVtcy5sZW5ndGg7IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkge3s/IGhhc1N1YlRyZWUgfX1jbGFzcz1cIm1sLXVpLWZvbGR0cmVlLS1oYXMtbXVsdGlwbGVcInt7P319PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1pdGVtXCIgZGF0YS1pdGVtLWlkPVwie3s9IGl0Lml0ZW1JRHNbaW5kZXhdIH19XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PyBoYXNTdWJUcmVlIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWwtdWktZm9sZHRyZWUtYnV0dG9uXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PSBpdC5pdGVtVGVtcGxhdGUoeyBpdGVtOiBpdGVtIH0pIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGhhc1N1YlRyZWUgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s9IGl0LnRyZWVUZW1wbGF0ZShpdGVtKSB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e359fVxcXG4gICAgICAgICAgICAgICAgICAgIDwvdWw+JztcblxudmFyIERFRkFVTFRfQ09NUElMRURfSVRFTV9URU1QTEFURSA9IGRvVC5jb21waWxlKCdcXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1sYWJlbFwiPlxcXG4gICAgICAgICAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWwgfX1cXFxuICAgICAgICAgICAgPC9zcGFuPicpXG4gICAgLCBDT01QSUxFRF9UUkVFX1RFTVBMQVRFID0gZG9ULmNvbXBpbGUoVFJFRV9URU1QTEFURSk7XG5cblxudmFyIE1MRm9sZFRyZWUgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRm9sZFRyZWUnLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnY2xpY2sgZGJsY2xpY2snOiB7IHN1YnNjcmliZXI6IG9uSXRlbUV2ZW50LCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWZvbGR0cmVlLW1haW4nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxGb2xkVHJlZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxGb2xkVHJlZTtcblxuXy5leHRlbmRQcm90byhNTEZvbGRUcmVlLCB7XG4gICAgc2V0SXRlbVRlbXBsYXRlOiBNTEZvbGRUcmVlJHNldEl0ZW1UZW1wbGF0ZSxcbiAgICByZW5kZXJUcmVlOiBNTEZvbGRUcmVlJHJlbmRlclRyZWUsXG4gICAgc2V0QWN0aXZlSXRlbTogTUxGb2xkVHJlZSRzZXRBY3RpdmVJdGVtLFxuICAgIHRvZ2dsZUl0ZW06IE1MRm9sZFRyZWUkdG9nZ2xlSXRlbVxufSk7XG5cbmZ1bmN0aW9uIGZvbGRVbmZvbGQoZWwsIG9wZW5lZCkge1xuICAgIGlmIChvcGVuZWQpXG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ21sLXVpLWZvbGR0cmVlLS11bmZvbGQnLCBvcGVuZWQpO1xuICAgIGVsc2VcbiAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnbWwtdWktZm9sZHRyZWUtLXVuZm9sZCcpO1xufVxuXG5mdW5jdGlvbiBpdGVtTWVzc2FnZShtc2csIGVsKSB7XG4gICAgdmFyIGlkID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWl0ZW0taWQnKVxuICAgICAgICAsIGl0ZW0gPSB0aGlzLl9pdGVtc01hcFtpZF07XG5cbiAgICB0aGlzLnBvc3RNZXNzYWdlKCdtbGZvbGR0cmVlXycgKyBtc2csIHtcbiAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgZWw6IGVsXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uSXRlbUV2ZW50KG1zZywgZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ21sLXVpLWZvbGR0cmVlLWJ1dHRvbicpKVxuICAgICAgICBmb2xkVW5mb2xkKGVsLnBhcmVudE5vZGUucGFyZW50Tm9kZSk7XG4gICAgZWxzZSBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdtbC11aS1mb2xkdHJlZS1sYWJlbCcpKVxuICAgICAgICBpdGVtTWVzc2FnZS5jYWxsKHRoaXMsIG1zZywgZWwucGFyZW50Tm9kZSk7XG4gICAgZWxzZSByZXR1cm47XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbn1cblxuZnVuY3Rpb24gTUxGb2xkVHJlZSRzZXRJdGVtVGVtcGxhdGUgKHRlbXBsYXRlU3RyKSB7XG4gICAgdGhpcy5faXRlbVRlbXBsYXRlID0gZG9ULmNvbXBpbGUodGVtcGxhdGVTdHIpO1xufVxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHJlbmRlclRyZWUgKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gICAgc2VsZi5faXRlbXNNYXAgPSB7fTtcbiAgICB0aGlzLmVsLmlubmVySFRNTCA9IF9yZW5kZXJUcmVlKGRhdGEpO1xuXG4gICAgZnVuY3Rpb24gX3JlbmRlclRyZWUgKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEuaXRlbXMpXG4gICAgICAgICAgICB2YXIgaXRlbXNJRHMgPSBfLm1hcChkYXRhLml0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gaXRlbS5pZCB8fCB1bmlxdWVJZCgpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9pdGVtc01hcFtpZF0pIHRocm93IG5ldyBFcnJvcignTUxGb2xkVHJlZTogaXRlbSBoYXMgZHVwbGljYXRlIElEOicgKyBpZCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXRlbXNNYXBbaWRdID0gaXRlbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gQ09NUElMRURfVFJFRV9URU1QTEFURSh7XG4gICAgICAgICAgICBpdGVtSURzOiBpdGVtc0lEcyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBpdGVtVGVtcGxhdGU6IHNlbGYuX2l0ZW1UZW1wbGF0ZSB8fCBERUZBVUxUX0NPTVBJTEVEX0lURU1fVEVNUExBVEUsXG4gICAgICAgICAgICB0cmVlVGVtcGxhdGU6IF9yZW5kZXJUcmVlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHNldEFjdGl2ZUl0ZW0oaWQsIGNzc0NsYXNzKSB7XG4gICAgY3NzQ2xhc3MgPSBjc3NDbGFzcyB8fCAnbWwtdWktZm9sZHRyZWUtYWN0aXZlJztcbiAgICB2YXIgaXRlbXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5tbC11aS1mb2xkdHJlZS1pdGVtJyk7XG4gICAgXy5mb3JFYWNoKGl0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShjc3NDbGFzcyk7XG4gICAgfSk7XG4gICAgaWYgKGlkKSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdkaXYubWwtdWktZm9sZHRyZWUtaXRlbVtkYXRhLWl0ZW0taWQ9XCInICsgaWQgKyAnXCJdJyk7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZChjc3NDbGFzcyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHRvZ2dsZUl0ZW0oaWQsIG9wZW5lZCkge1xuICAgIHZhciBpdGVtID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdkaXYubWwtdWktZm9sZHRyZWUtaXRlbVtkYXRhLWl0ZW0taWQ9XCInICsgaWQgKyAnXCJdJyk7XG4gICAgZm9sZFVuZm9sZChpdGVtLnBhcmVudE5vZGUsIG9wZW5lZCk7XG59XG5cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxHcm91cCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxHcm91cCcsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWdyb3VwJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MR3JvdXA7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTEh5cGVybGluayA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxIeXBlcmxpbmsnLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1oeXBlcmxpbmsnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxIeXBlcmxpbmspO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSHlwZXJsaW5rO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgSU1BR0VfQ0hBTkdFX01FU1NBR0UgPSAnbWxpbWFnZWNoYW5nZSc7XG5cbnZhciBNTEltYWdlID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEltYWdlJywge1xuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTEltYWdlX3NldCxcbiAgICAgICAgZ2V0OiBNTEltYWdlX2dldCxcbiAgICAgICAgZGVsOiBNTEltYWdlX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBJTUFHRV9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcuc3JjJzogeyBzdWJzY3JpYmVyOiBvbk1vZGVsQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIHRhZ05hbWU6ICdpbWcnLFxuICAgICAgICBjbHM6ICdtbC11aS1pbWFnZSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEltYWdlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEltYWdlO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxJbWFnZSwge1xuICAgIGluaXQ6IE1MSW1hZ2UkaW5pdFxufSk7XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXplIHJhZGlvIGdyb3VwIGFuZCBzZXR1cFxuICovXG5mdW5jdGlvbiBNTEltYWdlJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuLyoqXG4gKiBTZXRzIGltYWdlIHZhbHVlXG4gKiBSZXBsYWNlcyB0aGUgZGF0YSBzZXQgb3BlcmF0aW9uIHRvIGRlYWwgd2l0aCByYWRpbyBidXR0b25zXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGJlIHNldFxuICovXG5mdW5jdGlvbiBNTEltYWdlX3NldCh2YWx1ZSkge1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cblxuLyoqXG4gKiBHZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXRyaWV2ZXMgdGhlIHNlbGVjdGVkIHZhbHVlIG9mIHRoZSBncm91cFxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gTUxJbWFnZV9nZXQoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5tb2RlbC5nZXQoKTtcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnID8gXy5jbG9uZSh2YWx1ZSkgOiB2YWx1ZTtcbn1cblxuXG4vKipcbiAqIERlbGV0ZWQgZ3JvdXAgdmFsdWVcbiAqIERlbGV0ZXMgdGhlIHZhbHVlIG9mIHRoZSBncm91cCwgc2V0dGluZyBpdCB0byBlbXB0eVxuICovXG5mdW5jdGlvbiBNTEltYWdlX2RlbCgpIHtcbiAgICB0aGlzLm1vZGVsLmRlbCgpO1xufVxuXG5cbi8vIFBvc3QgdGhlIGRhdGEgY2hhbmdlXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShJTUFHRV9DSEFOR0VfTUVTU0FHRSk7XG59XG5cblxuZnVuY3Rpb24gb25Nb2RlbENoYW5nZShwYXRoLCBkYXRhKSB7XG4gICAgdGhpcy5lbC5zcmMgPSBkYXRhLm5ld1ZhbHVlO1xuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxJbnB1dCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxJbnB1dCcsIHtcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWlucHV0J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MSW5wdXQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSW5wdXQ7XG5cbl8uZXh0ZW5kUHJvdG8oTUxJbnB1dCwge1xuICAgIGRpc2FibGU6IE1MSW5wdXQkZGlzYWJsZSxcbiAgICBpc0Rpc2FibGVkOiBNTElucHV0JGlzRGlzYWJsZWQsXG4gICAgc2V0TWF4TGVuZ3RoOiBNTElucHV0JHNldE1heExlbmd0aFxufSk7XG5cbmZ1bmN0aW9uIE1MSW5wdXQkZGlzYWJsZShkaXNhYmxlKSB7XG4gICAgdGhpcy5lbC5kaXNhYmxlZCA9IGRpc2FibGU7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXQkaXNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLmVsLmRpc2FibGVkO1xufVxuXG5mdW5jdGlvbiBNTElucHV0JHNldE1heExlbmd0aChsZW5ndGgpIHtcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnbWF4bGVuZ3RoJywgbGVuZ3RoKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBJTlBVVF9MSVNUX0NIQU5HRV9NRVNTQUdFID0gJ21saW5wdXRsaXN0Y2hhbmdlJztcblxudmFyIGFzeW5jSGFuZGxlciA9IGZ1bmN0aW9uICh2YWx1ZSwgY2FsbGJhY2spIHtjYWxsYmFjayh2YWx1ZSk7fTtcblxudmFyIE1MSW5wdXRMaXN0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTElucHV0TGlzdCcsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktaW5wdXQtbGlzdCdcbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTElucHV0TGlzdF9nZXQsXG4gICAgICAgIHNldDogTUxJbnB1dExpc3Rfc2V0LFxuICAgICAgICBkZWw6IE1MSW5wdXRMaXN0X2RlbCxcbiAgICAgICAgc3BsaWNlOiBNTElucHV0TGlzdF9zcGxpY2UsXG4gICAgICAgIGV2ZW50OiBJTlBVVF9MSVNUX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25JdGVtc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnXFxcbiAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdDpsaXN0XCI+XFxcbiAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJNTExpc3RJdGVtOml0ZW1cIiBjbGFzcz1cImxpc3QtaXRlbVwiPlxcXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIG1sLWJpbmQ9XCJbZGF0YV06bGFiZWxcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltldmVudHNdOmRlbGV0ZUJ0blwiIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG1sLWJpbmQ9XCJNTElucHV0OmlucHV0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cXFxuICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiTUxCdXR0b246YnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIj5cXFxuICAgICAgICAgICAgICAgIEFkZFxcXG4gICAgICAgICAgICA8L2J1dHRvbj4nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxJbnB1dExpc3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSW5wdXRMaXN0O1xuXG5fLmV4dGVuZFByb3RvKE1MSW5wdXRMaXN0LCB7XG4gICAgaW5pdDogTUxJbnB1dExpc3QkaW5pdCxcbiAgICBzZXRBc3luYzogTUxJbnB1dExpc3Qkc2V0QXN5bmMsXG4gICAgc2V0UGxhY2VIb2xkZXI6IE1MSW5wdXRMaXN0JHNldFBsYWNlSG9sZGVyLFxuICAgIGRlc3Ryb3k6IE1MSW5wdXRMaXN0JGRlc3Ryb3lcbn0pO1xuXG5mdW5jdGlvbiBNTElucHV0TGlzdCRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub25jZSgnY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG4gICAgdGhpcy5tb2RlbC5zZXQoW10pO1xufVxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgcmVuZGVyLmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JHNldFBsYWNlSG9sZGVyKHBsYWNlSG9sZGVyKSB7XG4gICAgdGhpcy5faW5wdXQuZWwuc2V0QXR0cmlidXRlKCdwbGFjZUhvbGRlcicsIHBsYWNlSG9sZGVyKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Qkc2V0QXN5bmMobmV3SGFuZGxlcikge1xuICAgIGFzeW5jSGFuZGxlciA9IG5ld0hhbmRsZXIgfHwgYXN5bmNIYW5kbGVyO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdCRkZXN0cm95KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciAmJiBtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKHRoaXMuX2Nvbm5lY3Rvcik7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKCkuYmluZGVyKCk7XG4gICAgY29tcG9uZW50U2V0dXAuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50U2V0dXAoKSB7XG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgJ19pbnB1dCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmlucHV0LFxuICAgICAgICAnX2J1dHRvbic6IHRoaXMuY29udGFpbmVyLnNjb3BlLmJ1dHRvbixcbiAgICAgICAgJ19saXN0JzogdGhpcy5jb250YWluZXIuc2NvcGUubGlzdFxuICAgIH0pO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG1pbG8ubWluZGVyKHRoaXMuX2xpc3QubW9kZWwsICc8PDwtPj4+JywgdGhpcy5tb2RlbCk7XG4gICAgdGhpcy5fYnV0dG9uLmV2ZW50cy5vbignY2xpY2snLCB7c3Vic2NyaWJlcjogb25DbGljaywgY29udGV4dDogdGhpcyB9KTsgICBcbn1cblxuZnVuY3Rpb24gb25DbGljayhtc2cpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLl9pbnB1dC5kYXRhLmdldCgwKTtcbiAgICBpZiAodGhpcy5faW5wdXQuZGF0YSlcbiAgICAgICAgYXN5bmNIYW5kbGVyKHZhbHVlLCBmdW5jdGlvbiAobGFiZWwsIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0Lm1vZGVsLnB1c2goeyBsYWJlbDogbGFiZWwsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9pbnB1dC5kYXRhLmRlbCgpO1xufVxuXG5mdW5jdGlvbiBvbkl0ZW1zQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoSU5QVVRfTElTVF9DSEFOR0VfTUVTU0FHRSk7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0X2dldCgpIHtcbiAgICB2YXIgbW9kZWwgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiBtb2RlbCA/IF8uY2xvbmUobW9kZWwpIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdF9zZXQodmFsdWUpIHtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0X2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5zZXQoW10pO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdF9zcGxpY2UoKSB7IC8vIC4uLiBhcmd1bWVudHNcbiAgICB0aGlzLm1vZGVsLnNwbGljZS5hcHBseSh0aGlzLm1vZGVsLCBhcmd1bWVudHMpO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBMSVNUX0NIQU5HRV9NRVNTQUdFID0gJ21sbGlzdGNoYW5nZSdcbiAgICAsIERFTEVURV9CVVRUT05fTkFNRSA9ICdkZWxldGVCdG4nO1xuXG5cbnZhciBNTExpc3QgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MTGlzdCcsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktbGlzdCdcbiAgICB9LFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBtb2RlbDogdW5kZWZpbmVkLFxuICAgIGxpc3Q6IHVuZGVmaW5lZFxufSk7XG5cblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTExpc3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MTGlzdDtcblxuXG5fLmV4dGVuZFByb3RvKE1MTGlzdCwge1xuICAgIGluaXQ6IE1MTGlzdCRpbml0LFxuICAgIGRlc3Ryb3k6IE1MTGlzdCRkZXN0cm95LFxuICAgIHJlbW92ZUl0ZW06IE1MTGlzdCRyZW1vdmVJdGVtLFxuICAgIG1vdmVJdGVtOiBNTExpc3QkbW92ZUl0ZW1cbn0pO1xuXG5cbmZ1bmN0aW9uIE1MTGlzdCRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub24oJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdCRkZXN0cm95KCkge1xuICAgIHRoaXMuX2Nvbm5lY3RvciAmJiBtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKHRoaXMuX2Nvbm5lY3Rvcik7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3QkcmVtb3ZlSXRlbShpbmRleCl7XG4gICAgdGhpcy5tb2RlbC5zcGxpY2UoaW5kZXgsIDEpO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdCRtb3ZlSXRlbShmcm9tLCB0bykge1xuICAgIHZhciBzcGxpY2VkRGF0YSA9IHRoaXMubW9kZWwuc3BsaWNlKGZyb20sIDEpO1xuICAgIHJldHVybiB0aGlzLm1vZGVsLnNwbGljZSh0bywgMCwgc3BsaWNlZERhdGFbMF0pO1xufVxuXG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICB0aGlzLm1vZGVsLnNldChbXSk7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbWlsby5taW5kZXIodGhpcy5tb2RlbCwgJzw8PC0nLCB0aGlzLmRhdGEpLmRlZmVyQ2hhbmdlTW9kZSgnPDw8LT4+PicpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIERyYWdEcm9wID0gbWlsby51dGlsLmRyYWdEcm9wXG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIExJU1RJVEVNX0NIQU5HRV9NRVNTQUdFID0gJ21sbGlzdGl0ZW1jaGFuZ2UnO1xuXG52YXIgTUxMaXN0SXRlbSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxMaXN0SXRlbScsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHVuZGVmaW5lZCxcbiAgICBkcmFnOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnZHJhZ3N0YXJ0JzogeyBzdWJzY3JpYmVyOiBvbkRyYWdTdGFydCwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGE6IHtcbiAgICAgICAgICAgIHBhcmFtczogJ2dldE1ldGFEYXRhJ1xuICAgICAgICB9XG4gICAgfSxcbiAgICBkcm9wOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnZHJhZ2VudGVyJzogeyBzdWJzY3JpYmVyOiBvbkRyYWdIb3ZlciwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgJ2RyYWdvdmVyJzogeyBzdWJzY3JpYmVyOiBvbkRyYWdIb3ZlciwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgJ2RyYWdsZWF2ZSc6IHsgc3Vic2NyaWJlcjogb25EcmFnT3V0LCBjb250ZXh0OiAnb3duZXInIH0sXG4gICAgICAgICAgICAnZHJvcCc6IHsgc3Vic2NyaWJlcjogb25JdGVtRHJvcCwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH0sXG4gICAgICAgIGFsbG93OiB7XG4gICAgICAgICAgICBjb21wb25lbnRzOiBpc0NvbXBvbmVudEFsbG93ZWRcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MTGlzdEl0ZW1fZ2V0LFxuICAgICAgICBzZXQ6IE1MTGlzdEl0ZW1fc2V0LFxuICAgICAgICBkZWw6IE1MTGlzdEl0ZW1fZGVsLFxuICAgICAgICBldmVudDogTElTVElURU1fQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB1bmRlZmluZWQsXG4gICAgaXRlbTogdW5kZWZpbmVkXG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTExpc3RJdGVtKTtcblxudmFyIE1MTGlzdEl0ZW0gPSBtb2R1bGUuZXhwb3J0cyA9IE1MTGlzdEl0ZW07XG5cblxuXy5leHRlbmRQcm90byhNTExpc3RJdGVtLCB7XG4gICAgaW5pdDogTUxMaXN0SXRlbSRpbml0LFxuICAgIG1vdmVJdGVtOiBNTExpc3RJdGVtJG1vdmVJdGVtLFxuICAgIHJlbW92ZUl0ZW06IE1MTGlzdEl0ZW0kcmVtb3ZlSXRlbSxcbiAgICBnZXRNZXRhRGF0YTogTUxMaXN0SXRlbSRnZXRNZXRhRGF0YSxcbiAgICBpc0Ryb3BBbGxvd2VkOiBNTExpc3RJdGVtJGlzRHJvcEFsbG93ZWRcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdmFyIGRlbGV0ZUJ0biA9IHRoaXMuY29udGFpbmVyLnNjb3BlLmRlbGV0ZUJ0bjtcbiAgICBkZWxldGVCdG4gJiYgZGVsZXRlQnRuLmV2ZW50cy5vbignY2xpY2snLCB7IHN1YnNjcmliZXI6IHRoaXMucmVtb3ZlSXRlbSwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtJHJlbW92ZUl0ZW0oKSB7XG4gICAgdHJ5IHsgdmFyIGxpc3RPd25lciA9IHRoaXMuaXRlbS5saXN0Lm93bmVyOyB9IGNhdGNoKGUpIHt9XG4gICAgbGlzdE93bmVyICYmIGxpc3RPd25lci5yZW1vdmVJdGVtKHRoaXMuaXRlbS5pbmRleCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRtb3ZlSXRlbShpbmRleCkge1xuICAgIHZhciBsaXN0T3duZXIgPSB0aGlzLml0ZW0ubGlzdC5vd25lcjtcbiAgICBsaXN0T3duZXIgJiYgbGlzdE93bmVyLm1vdmVJdGVtKHRoaXMuaXRlbS5pbmRleCwgaW5kZXgpO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kaXNEcm9wQWxsb3dlZChtZXRhLyosIGRyYWdEcm9wKi8pe1xuICAgIHZhciBDb21wb25lbnQgPSBjb21wb25lbnRzUmVnaXN0cnkuZ2V0KG1ldGEuY29tcENsYXNzKTtcblxuICAgIHJldHVybiBtZXRhLnBhcmFtcyAmJiBtZXRhLnBhcmFtcy5pbmRleFxuICAgICAgICAgICAgJiYgKENvbXBvbmVudCA9PSBNTExpc3RJdGVtIHx8IENvbXBvbmVudC5wcm90b3R5cGUgaW5zdGFuY2VvZiBNTExpc3RJdGVtKVxuICAgICAgICAgICAgJiYgZHJhZ2dpbmdGcm9tU2FtZUxpc3QuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBkcmFnZ2luZ0Zyb21TYW1lTGlzdChjb21wKSB7XG4gICAgY29tcCA9IGNvbXAgfHwgRHJhZ0Ryb3Auc2VydmljZS5nZXRDdXJyZW50RHJhZ1NvdXJjZSgpO1xuICAgIHRyeSB7IHZhciBzb3VyY2VMaXN0ID0gY29tcC5pdGVtLmxpc3Q7IH0gY2F0Y2goZSkge31cbiAgICByZXR1cm4gc291cmNlTGlzdCA9PSB0aGlzLml0ZW0ubGlzdDtcbn1cblxuXG5mdW5jdGlvbiBpc0NvbXBvbmVudEFsbG93ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEcm9wQWxsb3dlZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5cbmZ1bmN0aW9uIG9uSXRlbURyb3AoZXZlbnRUeXBlLCBldmVudCkge1xuICAgIG9uRHJhZ091dC5jYWxsKHRoaXMpO1xuICAgIHZhciBkdCA9IG5ldyBEcmFnRHJvcChldmVudCk7XG4gICAgdmFyIG1ldGEgPSBkdC5nZXRDb21wb25lbnRNZXRhKCk7XG4gICAgdmFyIHN0YXRlID0gZHQuZ2V0Q29tcG9uZW50U3RhdGUoKTtcbiAgICB2YXIgbGlzdE93bmVyID0gdGhpcy5pdGVtLmxpc3Qub3duZXI7XG4gICAgdmFyIGluZGV4ID0gbWV0YS5wYXJhbXMgJiYgbWV0YS5wYXJhbXMuaW5kZXg7XG4gICAgdmFyIGRyb3BQb3NpdGlvbiA9IERyYWdEcm9wLmdldERyb3BQb3NpdGlvblkoZXZlbnQsIHRoaXMuZWwpO1xuICAgIHZhciBpc0JlbG93ID0gZHJvcFBvc2l0aW9uID09ICdiZWxvdyc7XG4gICAgdmFyIGlzQWJvdmUgPSBkcm9wUG9zaXRpb24gPT0gJ2Fib3ZlJztcbiAgICB2YXIgdGFyZ2V0SW5kZXg7XG5cbiAgICBpZiAoZHJhZ2dpbmdGcm9tU2FtZUxpc3QuY2FsbCh0aGlzKSl7XG4gICAgICAgIGlmKHN0YXRlLmNvbXBOYW1lID09IHRoaXMubmFtZSkgcmV0dXJuO1xuICAgICAgICB2YXIgc3RhdGVJbmRleCA9IHN0YXRlLmZhY2V0c1N0YXRlcy5pdGVtLnN0YXRlLmluZGV4O1xuICAgICAgICB2YXIgaXNNb3ZlRG93biA9IHN0YXRlSW5kZXggPCB0aGlzLml0ZW0uaW5kZXg7XG4gICAgICAgIHZhciBpc1NhbWVQb3NpdGlvbjtcbiAgICAgICAgaWYoaXNNb3ZlRG93bikge1xuICAgICAgICAgICAgaXNTYW1lUG9zaXRpb24gPSBpc0Fib3ZlICYmIHN0YXRlSW5kZXggKyAxID09IHRoaXMuaXRlbS5pbmRleDtcbiAgICAgICAgICAgIGlmKGlzU2FtZVBvc2l0aW9uKSByZXR1cm47XG4gICAgICAgICAgICB0YXJnZXRJbmRleCA9IHRoaXMuaXRlbS5pbmRleCAtIGlzQWJvdmU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7Ly9tb3ZlIHVwXG4gICAgICAgICAgICBpc1NhbWVQb3NpdGlvbiA9IGlzQmVsb3cgJiYgc3RhdGVJbmRleCAtIDEgPT0gdGhpcy5pdGVtLmluZGV4O1xuICAgICAgICAgICAgaWYoaXNTYW1lUG9zaXRpb24pIHJldHVybjtcbiAgICAgICAgICAgIHRhcmdldEluZGV4ID0gdGhpcy5pdGVtLmluZGV4ICsgaXNCZWxvdztcbiAgICAgICAgfVxuICAgICAgICBsaXN0T3duZXIubW92ZUl0ZW0oK2luZGV4LCB0YXJnZXRJbmRleCwgc3RhdGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLml0ZW0uaW5kZXggKyBpc0JlbG93O1xuICAgICAgICB0cnkgeyB2YXIgZGF0YSA9IHN0YXRlLmZhY2V0c1N0YXRlcy5kYXRhLnN0YXRlOyB9IGNhdGNoKGUpIHt9XG4gICAgICAgIGxpc3RPd25lci5kYXRhLnNwbGljZSh0YXJnZXRJbmRleCwgMCwgZGF0YSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KC8qZXZlbnRUeXBlLCBldmVudCovKSB7XG4gICAgRHJhZ0Ryb3Auc2VydmljZS5vbmNlKCdkcmFnZHJvcGNvbXBsZXRlZCcsIHsgc3Vic2NyaWJlcjogb25EcmFnRHJvcENvbXBsZXRlZCwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuXG5mdW5jdGlvbiBvbkRyYWdIb3ZlcigvKmV2ZW50VHlwZSwgZXZlbnQqLykge1xuICAgIHRoaXMuZG9tLmFkZENzc0NsYXNzZXMoJ21sLWRyYWctb3ZlcicpO1xufVxuXG5cbmZ1bmN0aW9uIG9uRHJhZ091dCgvKmV2ZW50VHlwZSwgZXZlbnQqLykge1xuICAgIHRoaXMuZG9tLnJlbW92ZUNzc0NsYXNzZXMoJ21sLWRyYWctb3ZlcicpO1xufVxuXG5cbmZ1bmN0aW9uIG9uRHJhZ0Ryb3BDb21wbGV0ZWQobXNnLCBkYXRhKSB7XG4gICAgdmFyIGRyb3BUYXJnZXQgPSBkYXRhLmNvbXBvbmVudDtcbiAgICB2YXIgZHJvcHBlZEluQW5vdGhlckxpc3QgPSBkYXRhLmV2ZW50VHlwZSA9PSAnZHJvcCcgJiYgIWRyYWdnaW5nRnJvbVNhbWVMaXN0LmNhbGwodGhpcywgZHJvcFRhcmdldCk7XG4gICAgaWYgKGRyb3BwZWRJbkFub3RoZXJMaXN0KSB0aGlzLml0ZW0ucmVtb3ZlSXRlbSgpO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kZ2V0TWV0YURhdGEoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5kZXg6IHRoaXMuaXRlbS5pbmRleFxuICAgIH07XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbV9nZXQoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5tb2RlbC5nZXQoKTtcbiAgICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnID8gXy5jbG9uZSh2YWx1ZSkgOiB2YWx1ZTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtX3NldCh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpXG4gICAgICAgIHRoaXMuZGF0YS5fc2V0KHZhbHVlKTtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG4gICAgX3NlbmRDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW1fZGVsKCkge1xuICAgIHRoaXMuZGF0YS5fZGVsKCk7XG4gICAgdGhpcy5tb2RlbC5kZWwoKTtcbiAgICBfc2VuZENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBfc2VuZENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShMSVNUSVRFTV9DSEFOR0VfTUVTU0FHRSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCB1bmlxdWVJZCA9IG1pbG8udXRpbC51bmlxdWVJZDtcblxuXG52YXIgUkFESU9fQ0hBTkdFX01FU1NBR0UgPSAnbWxyYWRpb2dyb3VwY2hhbmdlJ1xuICAgICwgRUxFTUVOVF9OQU1FX1BST1BFUlRZID0gJ19tbFJhZGlvR3JvdXBFbGVtZW50SUQnXG4gICAgLCBFTEVNRU5UX05BTUVfUFJFRklYID0gJ21sLXJhZGlvLWdyb3VwLSc7XG5cbnZhciBNTFJhZGlvR3JvdXAgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MUmFkaW9Hcm91cCcsIHtcbiAgICBkYXRhOiB7XG4gICAgICAgIHNldDogTUxSYWRpb0dyb3VwX3NldCxcbiAgICAgICAgZ2V0OiBNTFJhZGlvR3JvdXBfZ2V0LFxuICAgICAgICBkZWw6IE1MUmFkaW9Hcm91cF9kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogUkFESU9fQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjbGljayc6IHsgc3Vic2NyaWJlcjogb25Hcm91cENsaWNrLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXJhZGlvLWdyb3VwJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICd7e34gaXQucmFkaW9PcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7IyNkZWYuZWxJRDp7ez0gaXQuZWxlbWVudE5hbWUgfX0te3s9IG9wdGlvbi52YWx1ZSB9fSN9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ7ez0gaXQuX3JlbmRlck9wdGlvbnMub3B0aW9uQ3NzQ2xhc3MgfHwgXCInICsgRUxFTUVOVF9OQU1FX1BSRUZJWCArICdvcHRpb25cIiB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cInt7IyBkZWYuZWxJRCB9fVwiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwie3s9IG9wdGlvbi52YWx1ZSB9fVwiIG5hbWU9XCJ7ez0gaXQuZWxlbWVudE5hbWUgfX1cIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwie3sjIGRlZi5lbElEIH19XCI+e3s9IG9wdGlvbi5sYWJlbCB9fTwvbGFiZWw+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXG4gICAgICAgICAgICAgICAgICAge3t+fX0nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxSYWRpb0dyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFJhZGlvR3JvdXA7XG5cblxuXy5leHRlbmRQcm90byhNTFJhZGlvR3JvdXAsIHtcbiAgICBpbml0OiBNTFJhZGlvR3JvdXAkaW5pdCxcbiAgICBkZXN0cm95OiBNTFJhZGlvR3JvdXAkZGVzdHJveSxcbiAgICBzZXRSZW5kZXJPcHRpb25zOiBNTFJhZGlvR3JvdXAkc2V0UmVuZGVyT3B0aW9uc1xufSk7XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXplIHJhZGlvIGdyb3VwIGFuZCBzZXR1cFxuICovXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXAkaW5pdCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnR5KHRoaXMsICdfcmFkaW9MaXN0JywgW10sIF8uQ09ORik7XG4gICAgXy5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBFTEVNRU5UX05BTUVfUFJPUEVSVFksIEVMRU1FTlRfTkFNRV9QUkVGSVggKyB1bmlxdWVJZCgpKTtcbiAgICB0aGlzLl9yZW5kZXJPcHRpb25zID0ge307XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gTUxSYWRpb0dyb3VwJHNldFJlbmRlck9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMgPSBvcHRpb25zO1xufVxuXG5cbi8qKlxuICogU2V0cyBncm91cCB2YWx1ZVxuICogUmVwbGFjZXMgdGhlIGRhdGEgc2V0IG9wZXJhdGlvbiB0byBkZWFsIHdpdGggcmFkaW8gYnV0dG9uc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBzZXRcbiAqL1xuZnVuY3Rpb24gTUxSYWRpb0dyb3VwX3NldCh2YWx1ZSkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5fcmFkaW9MaXN0XG4gICAgICAgICwgc2V0UmVzdWx0O1xuICAgIGlmIChvcHRpb25zLmxlbmd0aCkge1xuICAgICAgICBvcHRpb25zLmZvckVhY2goZnVuY3Rpb24ocmFkaW8pIHtcbiAgICAgICAgICAgIHJhZGlvLmNoZWNrZWQgPSByYWRpby52YWx1ZSA9PSB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChyYWRpby5jaGVja2VkKVxuICAgICAgICAgICAgICAgIHNldFJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcblxuICAgICAgICByZXR1cm4gc2V0UmVzdWx0O1xuICAgIH1cbn1cblxuXG4vKipcbiAqIEdldHMgZ3JvdXAgdmFsdWVcbiAqIFJldHJpZXZlcyB0aGUgc2VsZWN0ZWQgdmFsdWUgb2YgdGhlIGdyb3VwXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXBfZ2V0KCkge1xuICAgIHZhciBjaGVja2VkID0gXy5maW5kKHRoaXMuX3JhZGlvTGlzdCwgZnVuY3Rpb24ocmFkaW8pIHtcbiAgICAgICAgcmV0dXJuIHJhZGlvLmNoZWNrZWQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hlY2tlZCAmJiBjaGVja2VkLnZhbHVlIHx8IHVuZGVmaW5lZDtcbn1cblxuXG4vKipcbiAqIERlbGV0ZWQgZ3JvdXAgdmFsdWVcbiAqIERlbGV0ZXMgdGhlIHZhbHVlIG9mIHRoZSBncm91cCwgc2V0dGluZyBpdCB0byBlbXB0eVxuICovXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXBfZGVsKCkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5fcmFkaW9MaXN0O1xuICAgIGlmIChvcHRpb25zLmxlbmd0aClcbiAgICAgICAgb3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHJhZGlvKSB7XG4gICAgICAgICAgICByYWRpby5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuXG4vKipcbiAqIE1hbmFnZSByYWRpbyBjaGlsZHJlbiBjbGlja3NcbiAqL1xuZnVuY3Rpb24gb25Hcm91cENsaWNrKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnR5cGUgPT0gJ3JhZGlvJylcbiAgICAgICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cbi8vIFBvc3QgdGhlIGRhdGEgY2hhbmdlXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShSQURJT19DSEFOR0VfTUVTU0FHRSk7XG59XG5cblxuLy8gU2V0IHJhZGlvIGJ1dHRvbiBjaGlsZHJlbiBvbiBtb2RlbCBjaGFuZ2VcbmZ1bmN0aW9uIG9uT3B0aW9uc0NoYW5nZShwYXRoLCBkYXRhKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoe1xuICAgICAgICByYWRpb09wdGlvbnM6IHRoaXMubW9kZWwuZ2V0KCksXG4gICAgICAgIGVsZW1lbnROYW1lOiB0aGlzW0VMRU1FTlRfTkFNRV9QUk9QRVJUWV0sXG4gICAgICAgIF9yZW5kZXJPcHRpb25zOiB0aGlzLl9yZW5kZXJPcHRpb25zXG4gICAgfSk7XG5cbiAgICB2YXIgcmFkaW9FbHMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXScpXG4gICAgICAgICwgb3B0aW9ucyA9IF8udG9BcnJheShyYWRpb0Vscyk7XG5cbiAgICB0aGlzLl9yYWRpb0xpc3QubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9yYWRpb0xpc3Quc3BsaWNlLmFwcGx5KHRoaXMuX3JhZGlvTGlzdCwgWzAsIDBdLmNvbmNhdChvcHRpb25zKSk7XG59XG5cblxuZnVuY3Rpb24gTUxSYWRpb0dyb3VwJGRlc3Ryb3koKSB7XG4gICAgZGVsZXRlIHRoaXMuX3JhZGlvTGlzdDtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBTRUxFQ1RfQ0hBTkdFX01FU1NBR0UgPSAnbWxzZWxlY3RjaGFuZ2UnO1xuXG52YXIgTUxTZWxlY3QgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MU2VsZWN0Jywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1zZWxlY3QnXG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICAgIHNldDogTUxTZWxlY3Rfc2V0LFxuICAgICAgICBnZXQ6IE1MU2VsZWN0X2dldCxcbiAgICAgICAgZGVsOiBNTFNlbGVjdF9kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogU0VMRUNUX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjaGFuZ2UnOiB7IHN1YnNjcmliZXI6IGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKionOiB7IHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAne3t+IGl0LnNlbGVjdE9wdGlvbnMgOm9wdGlvbiB9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInt7PSBvcHRpb24udmFsdWUgfX1cIiB7ez8gb3B0aW9uLnNlbGVjdGVkIH19c2VsZWN0ZWR7ez99fT57ez0gb3B0aW9uLmxhYmVsIH19PC9vcHRpb24+IFxcXG4gICAgICAgICAgICAgICAgICAge3t+fX0nXG4gICAgfVxufSk7XG5cblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFNlbGVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxTZWxlY3Q7XG5cblxuXy5leHRlbmRQcm90byhNTFNlbGVjdCwge1xuICAgIGluaXQ6IE1MU2VsZWN0JGluaXQsXG4gICAgc2V0T3B0aW9uczogTUxTZWxlY3Qkc2V0T3B0aW9ucyxcbiAgICBkaXNhYmxlOiBNTFNlbGVjdCRkaXNhYmxlXG59KTtcblxuXG5mdW5jdGlvbiBNTFNlbGVjdCRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX29wdGlvbkVscyA9IHt9O1xuICAgIHRoaXMuX2lzTXVsdGlwbGUgPSB0aGlzLmVsLmhhc0F0dHJpYnV0ZSgnbXVsdGlwbGUnKTtcbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdCRzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAvLyBTZXQgb3B0aW9ucyB0ZW1wb3JhcmlseSBkaXNhYmxlcyBtb2RlbCBzdWJzY3JpcHRpb25zIChBcyBhIHdvcmthcm91bmQgZm9yIHBlcmZvcm1hbmNlIGlzc3VlcyByZWxhdGluZyB0byBtb2RlbCB1cGRhdGVzIC8gdGVtcGxhdGUgcmUtcmVuZGVyaW5nKVxuICAgIHZhciBtb2RlbENoYW5nZUxpc3RlbmVyID0geyBjb250ZXh0OiB0aGlzLCBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UgfTtcblxuICAgIHRoaXMubW9kZWwub2ZmKCcqKicsIG1vZGVsQ2hhbmdlTGlzdGVuZXIpO1xuICAgIHRoaXMubW9kZWwuc2V0KG9wdGlvbnMpO1xuICAgIHRoaXMubW9kZWwub24oJyoqJywgbW9kZWxDaGFuZ2VMaXN0ZW5lcik7XG5cbiAgICBvbk9wdGlvbnNDaGFuZ2UuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdCRkaXNhYmxlKGRpc2FibGUpIHtcbiAgICB0aGlzLmVsLmRpc2FibGVkID0gZGlzYWJsZTtcbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdF9zZXQoc3RyT3JPYmopIHtcbiAgICBpZiAoIXRoaXMuX2lzTXVsdGlwbGUpIHRoaXMuZWwudmFsdWUgPSBzdHJPck9iajtcbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHZhbHVlT2JqID0ge307XG4gICAgICAgIGlmIChzdHJPck9iaiAmJiB0eXBlb2Ygc3RyT3JPYmogPT0gJ29iamVjdCcpIHZhbHVlT2JqID0gc3RyT3JPYmo7XG4gICAgICAgIGVsc2UgdmFsdWVPYmpbc3RyT3JPYmpdID0gdHJ1ZTtcbiAgICAgICAgXy5lYWNoS2V5KHRoaXMuX29wdGlvbkVscywgZnVuY3Rpb24gKGVsLCBrZXkpIHtcbiAgICAgICAgICAgIGVsLnNlbGVjdGVkID0gISF2YWx1ZU9ialtrZXldO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gTUxTZWxlY3RfZ2V0KCkge1xuICAgIGlmICghdGhpcy5faXNNdWx0aXBsZSkgcmV0dXJuIHRoaXMuZWwudmFsdWU7XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBfLm1hcEtleXModGhpcy5fb3B0aW9uRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBlbC5zZWxlY3RlZDtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0X2RlbCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzTXVsdGlwbGUpIHRoaXMuZWwudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgZWxzZSB7XG4gICAgICAgIF8uZWFjaEtleSh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgZWwuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKFNFTEVDVF9DSEFOR0VfTUVTU0FHRSk7XG59XG5cblxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcih7IHNlbGVjdE9wdGlvbnM6IHRoaXMubW9kZWwuZ2V0KCkgfSk7XG4gICAgdGhpcy5fb3B0aW9uRWxzID0ge307XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIF8uZm9yRWFjaCh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbicpLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgc2VsZi5fb3B0aW9uRWxzW2VsLnZhbHVlXSA9IGVsO1xuICAgIH0pO1xuICAgIC8vZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTUxTdXBlckNvbWJvXG4gKiBBIGNvbWJvIHNlbGVjdCBsaXN0IHdpdGggaW50ZWxsaWdlbnQgc2Nyb2xsaW5nIG9mIHN1cGVyIGxhcmdlIGxpc3RzLlxuICovXG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBkb1QgPSBtaWxvLnV0aWwuZG9UXG4gICAgLCBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyO1xuXG52YXIgQ09NQk9fT1BFTiA9ICdtbC11aS1zdXBlcmNvbWJvLW9wZW4nO1xudmFyIENPTUJPX0NIQU5HRV9NRVNTQUdFID0gJ21sc3VwZXJjb21ib2NoYW5nZSc7XG5cbnZhciBPUFRJT05TX1RFTVBMQVRFID0gJ3t7fiBpdC5jb21ib09wdGlvbnMgOm9wdGlvbjppbmRleCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiB7ez8gb3B0aW9uLnNlbGVjdGVkfX1jbGFzcz1cInNlbGVjdGVkXCIge3s/fX1kYXRhLXZhbHVlPVwie3s9IGluZGV4IH19XCI+e3s9IG9wdGlvbi5sYWJlbCB9fTwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e359fSc7XG5cbnZhciBNQVhfUkVOREVSRUQgPSAxMDA7XG52YXIgQlVGRkVSID0gMjU7XG52YXIgREVGQVVMVF9FTEVNRU5UX0hFSUdIVCA9IDIwO1xuXG52YXIgTUxTdXBlckNvbWJvID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFN1cGVyQ29tYm8nLCB7XG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnbW91c2VsZWF2ZSc6IHtzdWJzY3JpYmVyOiBvbk1vdXNlTGVhdmUsIGNvbnRleHQ6ICdvd25lcid9LFxuICAgICAgICAgICAgJ21vdXNlb3Zlcic6IHtzdWJzY3JpYmVyOiBvbk1vdXNlT3ZlciwgY29udGV4dDogJ293bmVyJ31cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MU3VwZXJDb21ib19nZXQsXG4gICAgICAgIHNldDogTUxTdXBlckNvbWJvX3NldCxcbiAgICAgICAgZGVsOiBNTFN1cGVyQ29tYm9fZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktc3VwZXJjb21ibydcbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnPGlucHV0IG1sLWJpbmQ9XCJbZGF0YSwgZXZlbnRzXTppbnB1dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIG1sLXVpLWlucHV0XCI+XFxcbiAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbZG9tXTphZGRJdGVtRGl2XCIgY2xhc3M9XCJtbC11aS1zdXBlcmNvbWJvLWFkZFwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiOmFkZFByb21wdFwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiW2V2ZW50cywgZG9tXTphZGRCdG5cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBtbC11aS1idXR0b25cIj5BZGQ8L2J1dHRvbj5cXFxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW2RvbSwgZXZlbnRzXTpsaXN0XCIgY2xhc3M9XCJtbC11aS1zdXBlcmNvbWJvLWRyb3Bkb3duXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW2RvbV06YmVmb3JlXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW3RlbXBsYXRlLCBkb20sIGV2ZW50c106b3B0aW9uc1wiIGNsYXNzPVwibWwtdWktc3VwZXJjb21iby1vcHRpb25zXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW2RvbV06YWZ0ZXJcIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDwvZGl2PidcbiAgICB9LFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkXG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFN1cGVyQ29tYm8pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MU3VwZXJDb21ibztcblxuLyoqXG4gKiBQdWJsaWMgQXBpXG4gKi9cbl8uZXh0ZW5kUHJvdG8oTUxTdXBlckNvbWJvLCB7XG4gICAgaW5pdDogTUxTdXBlckNvbWJvJGluaXQsXG4gICAgc2hvd09wdGlvbnM6IE1MU3VwZXJDb21ibyRzaG93T3B0aW9ucyxcbiAgICBoaWRlT3B0aW9uczogTUxTdXBlckNvbWJvJGhpZGVPcHRpb25zLFxuICAgIHRvZ2dsZU9wdGlvbnM6IE1MU3VwZXJDb21ibyR0b2dnbGVPcHRpb25zLFxuICAgIHNldE9wdGlvbnM6IE1MU3VwZXJDb21ibyRzZXRPcHRpb25zLFxuICAgIGluaXRPcHRpb25zVVJMOiBNTFN1cGVyQ29tYm8kaW5pdE9wdGlvbnNVUkwsXG4gICAgc2V0RmlsdGVyZWRPcHRpb25zOiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyZWRPcHRpb25zLFxuICAgIHVwZGF0ZTogTUxTdXBlckNvbWJvJHVwZGF0ZSxcbiAgICB0b2dnbGVBZGRCdXR0b246IE1MU3VwZXJDb21ibyR0b2dnbGVBZGRCdXR0b24sXG4gICAgc2V0QWRkSXRlbVByb21wdDogTUxTdXBlckNvbWJvJHNldEFkZEl0ZW1Qcm9tcHQsXG4gICAgc2V0UGxhY2Vob2xkZXI6IE1MU3VwZXJDb21ibyRzZXRQbGFjZWhvbGRlcixcbiAgICBjbGVhckNvbWJvSW5wdXQ6IE1MU3VwZXJDb21ib19kZWxcbn0pO1xuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGlzZSB0aGUgY29tcG9uZW50LCB3YWl0IGZvciBjaGlsZHJlbmJvdW5kLCBzZXR1cCBlbXB0eSBvcHRpb25zIGFycmF5cy5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLm9uY2UoJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX29wdGlvbnNEYXRhOiBbXSxcbiAgICAgICAgX2ZpbHRlcmVkT3B0aW9uc0RhdGE6IFtdXG4gICAgfSwgXy5XUklUKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVyIGZvciBpbml0IGNoaWxkcmVuYm91bmQgbGlzdGVuZXIuIFJlbmRlcnMgdGVtcGxhdGUuXG4gKi9cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcigpLmJpbmRlcigpO1xuICAgIGNvbXBvbmVudFNldHVwLmNhbGwodGhpcyk7XG59XG5cblxuLyoqXG4gKiBEZWZpbmUgaW5zdGFuY2UgcHJvcGVydGllcywgZ2V0IHN1YmNvbXBvbmVudHMsIGNhbGwgc2V0dXAgc3ViLXRhc2tzXG4gKi9cbmZ1bmN0aW9uIGNvbXBvbmVudFNldHVwKCkge1xuICAgIHZhciBzY29wZSA9IHRoaXMuY29udGFpbmVyLnNjb3BlO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX2NvbWJvSW5wdXQ6IHNjb3BlLmlucHV0LFxuICAgICAgICBfY29tYm9MaXN0OiBzY29wZS5saXN0LFxuICAgICAgICBfY29tYm9PcHRpb25zOiBzY29wZS5vcHRpb25zLFxuICAgICAgICBfY29tYm9CZWZvcmU6IHNjb3BlLmJlZm9yZSxcbiAgICAgICAgX2NvbWJvQWZ0ZXI6IHNjb3BlLmFmdGVyLFxuICAgICAgICBfY29tYm9BZGRJdGVtRGl2OiBzY29wZS5hZGRJdGVtRGl2LFxuICAgICAgICBfY29tYm9BZGRQcm9tcHQ6IHNjb3BlLmFkZFByb21wdCxcbiAgICAgICAgX2NvbWJvQWRkQnRuOiBzY29wZS5hZGRCdG4sXG4gICAgICAgIF9vcHRpb25UZW1wbGF0ZTogZG9ULmNvbXBpbGUoT1BUSU9OU19URU1QTEFURSlcbiAgICB9KTtcblxuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgIF9zdGFydEluZGV4OiAwLFxuICAgICAgICBfZW5kSW5kZXg6IE1BWF9SRU5ERVJFRCxcbiAgICAgICAgX2hpZGRlbjogZmFsc2UsXG4gICAgICAgIF9lbGVtZW50SGVpZ2h0OiBERUZBVUxUX0VMRU1FTlRfSEVJR0hULFxuICAgICAgICBfdG90YWw6IDAsXG4gICAgICAgIF9vcHRpb25zSGVpZ2h0OiAyMDAsXG4gICAgICAgIF9sYXN0U2Nyb2xsUG9zOiAwLFxuICAgICAgICBfY3VycmVudFZhbHVlOiBudWxsLFxuICAgICAgICBfc2VsZWN0ZWQ6IG51bGwsXG4gICAgICAgIF9pc0FkZEJ1dHRvblNob3duOiBmYWxzZVxuICAgIH0sIF8uV1JJVCk7XG5cbiAgICAvLyBDb21wb25lbnQgU2V0dXBcbiAgICB0aGlzLmRvbS5zZXRTdHlsZXMoeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9KTtcbiAgICBzZXR1cENvbWJvTGlzdCh0aGlzLl9jb21ib0xpc3QsIHRoaXMuX2NvbWJvT3B0aW9ucywgdGhpcyk7XG4gICAgc2V0dXBDb21ib0lucHV0KHRoaXMuX2NvbWJvSW5wdXQsIHRoaXMpO1xuICAgIHNldHVwQ29tYm9CdG4odGhpcy5fY29tYm9BZGRCdG4sIHRoaXMpO1xuXG4gICAgdGhpcy5ldmVudHMub24oJ2tleWRvd24nLCB7IHN1YnNjcmliZXI6IGNoYW5nZVNlbGVjdGVkLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vdGhpcy5ldmVudHMub24oJ21vdXNlbGVhdmUnLCB7IHN1YnNjcmliZXI6IE1MU3VwZXJDb21ibyRoaWRlT3B0aW9ucywgY29udGV4dDogdGhpcyB9KTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTaG93cyBvciBoaWRlcyBvcHRpb24gbGlzdC5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNob3cgdHJ1ZSB0byBzaG93LCBmYWxzZSB0byBoaWRlXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyR0b2dnbGVPcHRpb25zKHNob3cpIHtcbiAgICB0aGlzLl9oaWRkZW4gPSAhc2hvdztcbiAgICB0aGlzLl9jb21ib0xpc3QuZG9tLnRvZ2dsZShzaG93KTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTaG93cyBvcHRpb25zIGxpc3RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHNob3dPcHRpb25zKCkge1xuICAgIC8vIFBvc2l0aW9uIHRoZSBsaXN0IHRvIG1heGltaXNlIHRoZSBhbW91bnQgb2YgdmlzaWJsZSBjb250ZW50XG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdmFyIHBhZ2VIZWlnaHQgPSBNYXRoLm1heCh0aGlzLmVsLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApO1xuICAgIHZhciBsaXN0VG9wU3R5bGUgPSAnJzsgLy8gUG9zaXRpb25zIG9wdGlvbnMgdW5kZXJuZWF0aCB0aGUgY29tYm9ib3ggKERlZmF1bHQgYmVoYXZpb3VyKVxuICAgIHZhciBib3R0b21PdmVybGFwID0gKGJvdW5kcy5ib3R0b20gKyB0aGlzLl9vcHRpb25zSGVpZ2h0KSAtIHBhZ2VIZWlnaHQ7XG5cbiAgICBpZihib3R0b21PdmVybGFwID4gMCkge1xuICAgICAgICB2YXIgdG9wT3ZlcmxhcCA9IHRoaXMuX29wdGlvbnNIZWlnaHQgLSBib3VuZHMudG9wO1xuXG4gICAgICAgIGlmKHRvcE92ZXJsYXAgPCBib3R0b21PdmVybGFwKSB7XG4gICAgICAgICAgICBsaXN0VG9wU3R5bGUgPSAtIHRoaXMuX29wdGlvbnNIZWlnaHQgKyAncHgnOyAvLyBQb3NpdGlvbiBvcHRpb25zIGFib3ZlIHRoZSBjb21ib2JveFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS5zZXRTdHlsZXMoeyB0b3A6IGxpc3RUb3BTdHlsZSB9KTtcbiAgICB0aGlzLl9oaWRkZW4gPSBmYWxzZTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoQ09NQk9fT1BFTik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS50b2dnbGUodHJ1ZSk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgb3B0aW9ucyBsaXN0XG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRoaWRlT3B0aW9ucygpIHtcbiAgICB0aGlzLl9oaWRkZW4gPSB0cnVlO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZShDT01CT19PUEVOKTtcbiAgICB0aGlzLl9jb21ib0xpc3QuZG9tLnRvZ2dsZShmYWxzZSk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgYWRkIGJ1dHRvblxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kdG9nZ2xlQWRkQnV0dG9uKHNob3csIG9wdGlvbnMpIHtcbiAgICB0aGlzLl9jb21ib0FkZEl0ZW1EaXYuZG9tLnRvZ2dsZShzaG93KTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnByZXNlcnZlU3RhdGUpIHRoaXMuX19zaG93QWRkT25DbGljayA9IHRoaXMuX2lzQWRkQnV0dG9uU2hvd247XG4gICAgdGhpcy5faXNBZGRCdXR0b25TaG93biA9IHNob3c7XG59XG5cblxuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHNldEFkZEl0ZW1Qcm9tcHQocHJvbXB0KSB7XG4gICAgdGhpcy5fYWRkSXRlbVByb21wdCA9IHByb21wdDtcbiAgICB0aGlzLl9jb21ib0FkZFByb21wdC5lbC5pbm5lckhUTUwgPSBwcm9tcHQ7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0UGxhY2Vob2xkZXIocGxhY2Vob2xkZXIpIHtcbiAgICB0aGlzLl9jb21ib0lucHV0LmVsLnBsYWNlaG9sZGVyID0gcGxhY2Vob2xkZXI7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogU2V0cyB0aGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd25cbiAqXG4gKiBAcGFyYW0ge0FycmF5W09iamVjdF19IGFyciB0aGUgb3B0aW9ucyB0byBzZXQgd2l0aCBsYWJlbCBhbmQgdmFsdWUgcGFpcnMuIFZhbHVlIGNhbiBiZSBhbiBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRPcHRpb25zKGFycikge1xuICAgIHRoaXMuX29wdGlvbnNEYXRhID0gYXJyO1xuICAgIHRoaXMuc2V0RmlsdGVyZWRPcHRpb25zKGFycik7XG59XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXNlIHRoZSByZW1vdGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB0aGUgb3B0aW9ucyB0byBpbml0aWFsaXNlLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kaW5pdE9wdGlvbnNVUkwob3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnNVUkwgPSBvcHRpb25zLnVybDtcbiAgICB0aGlzLl9mb3JtYXRPcHRpb25zVVJMID0gb3B0aW9ucy5mb3JtYXRPcHRpb25zIHx8IGZ1bmN0aW9uKGUpe3JldHVybiBlO307XG59XG5cblxuLyoqXG4gKiBQcml2YXRlIG1ldGhvZFxuICogU2V0cyB0aGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd24gYmFzZWQgb24gYSByZXF1ZXN0XG4gKi9cbmZ1bmN0aW9uIF9nZXRPcHRpb25zVVJMKGNiKSB7XG4gICAgdmFyIHVybCA9IHRoaXMuX29wdGlvbnNVUkwsXG4gICAgICAgIHF1ZXJ5U3RyaW5nID0gdGhpcy5fY29tYm9JbnB1dC5kYXRhLmdldCgpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjYiA9IGNiIHx8IF8ubm9vcDtcbiAgICBtaWxvLnV0aWwucmVxdWVzdC5wb3N0KHVybCwgeyBuYW1lOiBxdWVyeVN0cmluZyB9LCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0NhbiBub3Qgc2VhcmNoIGZvciBcIicgKyBxdWVyeVN0cmluZyArICdcIicpO1xuICAgICAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignUmVxdWVzdCBlcnJvcicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXNwb25zZURhdGEgPSBfLmpzb25QYXJzZShyZXNwb25zZSk7XG4gICAgICAgIGlmIChyZXNwb25zZURhdGEpIGNiKG51bGwsIHJlc3BvbnNlRGF0YSk7XG4gICAgICAgIGVsc2UgY2IobmV3IEVycm9yKCdEYXRhIGVycm9yJykpO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogU2V0cyB0aGUgZmlsdGVyZWQgb3B0aW9ucywgd2hpY2ggaXMgYSBzdWJzZXQgb2Ygbm9ybWFsIG9wdGlvbnNcbiAqXG4gKiBAcGFyYW0ge1t0eXBlXX0gYXJyIFRoZSBvcHRpb25zIHRvIHNldFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyZWRPcHRpb25zKGFycikge1xuICAgIGlmICghIGFycikgcmV0dXJuIGxvZ2dlci5lcnJvcignc2V0RmlsdGVyZWRPcHRpb25zOiBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkJyk7XG4gICAgdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YSA9IGFycjtcbiAgICB0aGlzLl90b3RhbCA9IGFyci5sZW5ndGg7XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBVcGRhdGVzIHRoZSBsaXN0LiBUaGlzIGlzIHVzZWQgb24gc2Nyb2xsLCBhbmQgbWFrZXMgdXNlIG9mIHRoZSBmaWx0ZXJlZE9wdGlvbnMgdG9cbiAqIGludGVsbGlnZW50bHkgc2hvdyBhIHN1YnNldCBvZiB0aGUgZmlsdGVyZWQgbGlzdCBhdCBhIHRpbWUuXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyR1cGRhdGUoKSB7XG4gICAgdmFyIHdhc0hpZGRlbiA9IHRoaXMuX2hpZGRlbjtcblxuICAgIHZhciBhcnJUb1Nob3cgPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhLnNsaWNlKHRoaXMuX3N0YXJ0SW5kZXgsIHRoaXMuX2VuZEluZGV4KTtcblxuICAgIHRoaXMuX2NvbWJvT3B0aW9ucy50ZW1wbGF0ZS5yZW5kZXIoe1xuICAgICAgICBjb21ib09wdGlvbnM6IGFyclRvU2hvd1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZWxlbWVudEhlaWdodCA9IHRoaXMuX2VsZW1lbnRIZWlnaHQgfHwgREVGQVVMVF9FTEVNRU5UX0hFSUdIVDtcblxuICAgIGlmICh3YXNIaWRkZW4pXG4gICAgICAgIHRoaXMuaGlkZU9wdGlvbnMoKTtcblxuICAgIHZhciBiZWZvcmVIZWlnaHQgPSB0aGlzLl9zdGFydEluZGV4ICogdGhpcy5fZWxlbWVudEhlaWdodDtcbiAgICB2YXIgYWZ0ZXJIZWlnaHQgPSAodGhpcy5fdG90YWwgLSB0aGlzLl9lbmRJbmRleCkgKiB0aGlzLl9lbGVtZW50SGVpZ2h0O1xuICAgIHRoaXMuX2NvbWJvQmVmb3JlLmVsLnN0eWxlLmhlaWdodCA9IGJlZm9yZUhlaWdodCArICdweCc7XG4gICAgdGhpcy5fY29tYm9BZnRlci5lbC5zdHlsZS5oZWlnaHQgPSBhZnRlckhlaWdodCA+IDAgPyBhZnRlckhlaWdodCArICdweCcgOiAnMHB4Jztcbn1cblxuLyoqXG4gKiBTZXR1cCB0aGUgY29tYm8gbGlzdFxuICpcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gbGlzdFxuICogQHBhcmFtICB7QXJyYXl9IG9wdGlvbnNcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gc2VsZlxuICovXG5mdW5jdGlvbiBzZXR1cENvbWJvTGlzdChsaXN0LCBvcHRpb25zLCBzZWxmKSB7XG4gICAgc2VsZi50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xuICAgIG9wdGlvbnMudGVtcGxhdGUuc2V0KE9QVElPTlNfVEVNUExBVEUpO1xuXG4gICAgbGlzdC5kb20uc2V0U3R5bGVzKHtcbiAgICAgICAgb3ZlcmZsb3c6ICdzY3JvbGwnLFxuICAgICAgICBoZWlnaHQ6IHNlbGYuX29wdGlvbnNIZWlnaHQgKyAncHgnLFxuICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgekluZGV4OiAxMFxuICAgICAgICAvLyB0b3A6IHlQb3MgKyAncHgnLFxuICAgICAgICAvLyBsZWZ0OiB4UG9zICsgJ3B4JyxcbiAgICB9KTtcblxuICAgIHNlbGYuaGlkZU9wdGlvbnMoKTtcbiAgICBsaXN0LmV2ZW50cy5vbk1lc3NhZ2VzKHtcbiAgICAgICAgJ2NsaWNrJzoge3N1YnNjcmliZXI6IG9uTGlzdENsaWNrLCBjb250ZXh0OiBzZWxmfSxcbiAgICAgICAgJ3Njcm9sbCc6IHtzdWJzY3JpYmVyOiBvbkxpc3RTY3JvbGwsIGNvbnRleHQ6IHNlbGZ9XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2V0dXAgdGhlIGlucHV0IGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gaW5wdXRcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gc2VsZlxuICovXG5mdW5jdGlvbiBzZXR1cENvbWJvSW5wdXQoaW5wdXQsIHNlbGYpIHtcbiAgICBpbnB1dC5ldmVudHMub25jZSgnZm9jdXMnLCBmdW5jdGlvbigpe1xuICAgICAgICBpbnB1dC5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uRGF0YUNoYW5nZSwgY29udGV4dDogc2VsZiB9KTtcbiAgICAgICAgaW5wdXQuZXZlbnRzLm9uKCdjbGljaycsIHtzdWJzY3JpYmVyOiBvbklucHV0Q2xpY2ssIGNvbnRleHQ6IHNlbGYgfSk7XG4gICAgICAgIGlucHV0LmV2ZW50cy5vbigna2V5ZG93bicsIHtzdWJzY3JpYmVyOiBvbkVudGVyS2V5LCBjb250ZXh0OiBzZWxmIH0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNldHVwIHRoZSBidXR0b25cbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gYnRuXG4gKiBAcGFyYW0gIHtDb21wb25lbnR9IHNlbGZcbiAqL1xuZnVuY3Rpb24gc2V0dXBDb21ib0J0bihidG4sIHNlbGYpIHtcbiAgICBidG4uZXZlbnRzLm9uKCdjbGljaycsIHsgc3Vic2NyaWJlcjogb25BZGRCdG4sIGNvbnRleHQ6IHNlbGYgfSk7XG59XG5cblxuLyoqXG4gKiBDdXN0b20gZGF0YSBmYWNldCBnZXQgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ib19nZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRWYWx1ZTtcbn1cblxuLyoqXG4gKiBDdXN0b20gZGF0YSBmYWNldCBzZXQgbWV0aG9kXG4gKiBAcGFyYW0ge1ZhcmlhYmxlfSBvYmpcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvX3NldChvYmopIHtcbiAgICB0aGlzLl9jdXJyZW50VmFsdWUgPSBvYmo7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLnNldChvYmogJiYgb2JqLmxhYmVsKTtcbiAgICBfLmRlZmVyTWV0aG9kKHRoaXMsICdoaWRlT3B0aW9ucycpO1xufVxuXG4vKipcbiAqIEN1c3RvbSBkYXRhIGZhY2V0IGRlbCBtZXRob2RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvX2RlbCgpIHtcbiAgICB0aGlzLl9jdXJyZW50VmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5zZXQoJycpO1xufVxuXG5cbi8qKlxuICogSW5wdXQgZGF0YSBjaGFuZ2UgaGFuZGxlclxuICogV2hlbiB0aGUgaW5wdXQgZGF0YSBjaGFuZ2VzLCB0aGlzIG1ldGhvZCBmaWx0ZXJzIHRoZSBvcHRpb25zRGF0YSwgYW5kIHNldHMgdGhlIGZpcnN0IGVsZW1lbnRcbiAqIHRvIGJlIHNlbGVjdGVkLlxuICogQHBhcmFtICB7U3RyaW5nfSBtc2dcbiAqIEBwYXJhbSAge09iamV4dH0gZGF0YVxuICovXG5mdW5jdGlvbiBvbkRhdGFDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdmFyIHRleHQgPSBkYXRhLm5ld1ZhbHVlICYmIGRhdGEubmV3VmFsdWUudHJpbSgpO1xuICAgIGlmICh0aGlzLl9vcHRpb25zVVJMKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgX2dldE9wdGlvbnNVUkwuY2FsbCh0aGlzLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlRGF0YSl7XG4gICAgICAgICAgICBpZiAoZXJyIHx8ICFyZXNwb25zZURhdGEpIHJldHVybjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSByZXNwb25zZURhdGEuZGF0YS5tYXAoc2VsZi5fZm9ybWF0T3B0aW9uc1VSTCk7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIF91cGRhdGVPcHRpb25zQW5kQWRkQnV0dG9uLmNhbGwoc2VsZiwgdGV4dCwgc2VsZi5fb3B0aW9uc0RhdGEpO1xuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdEYXRhIGVycm9yJywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBmaWx0ZXJlZERhdGEgPSBfZmlsdGVyRGF0YS5jYWxsKHRoaXMsIHRleHQpO1xuICAgICAgICBfdXBkYXRlT3B0aW9uc0FuZEFkZEJ1dHRvbi5jYWxsKHRoaXMsIHRleHQsIGZpbHRlcmVkRGF0YSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIF9maWx0ZXJEYXRhKHRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9uc0RhdGEuZmlsdGVyKGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBkZWxldGUgb3B0aW9uLnNlbGVjdGVkO1xuICAgICAgICBpZiAob3B0aW9uLmxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBvcHRpb24ubGFiZWwudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbC50cmltKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRleHQudG9Mb3dlckNhc2UoKSkgPT0gMDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIF91cGRhdGVPcHRpb25zQW5kQWRkQnV0dG9uKHRleHQsIGZpbHRlcmVkQXJyKSB7XG4gICAgaWYgKCF0ZXh0KSB7XG4gICAgICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlLCB7IHByZXNlcnZlU3RhdGU6IHRydWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZpbHRlcmVkQXJyLmxlbmd0aCAmJiBfLmZpbmQoZmlsdGVyZWRBcnIsIGlzRXhhY3RNYXRjaCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlLCB7IHByZXNlcnZlU3RhdGU6IHRydWUgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYWRkSXRlbVByb21wdCkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVBZGRCdXR0b24odGhpcy5fb3B0aW9uc0RhdGEubGVuZ3RoID4gMSB8fCB0aGlzLl9vcHRpb25zVVJMKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWx0ZXJlZEFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd09wdGlvbnMoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkQXJyWzBdLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkID0gZmlsdGVyZWRBcnJbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldEZpbHRlcmVkT3B0aW9ucyhmaWx0ZXJlZEFycik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcCA9IDA7XG5cbiAgICBmdW5jdGlvbiBpc0V4YWN0TWF0Y2goaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5sYWJlbC50b0xvd2VyQ2FzZSgpID09PSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgbWFwIG9mIGtleUNvZGVzIHRvIGRpcmVjdGlvbnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBkaXJlY3Rpb25NYXAgPSB7ICc0MCc6IDEsICczOCc6IC0xIH07XG5cbi8qKlxuICogTGlzdCBrZXlkb3duIGhhbmRsZXJcbiAqIENoYW5nZXMgdGhlIHNlbGVjdGVkIGxpc3QgaXRlbSBieSBmaW5kaW5nIHRoZSBhZGphY2VudCBpdGVtIGFuZCBzZXR0aW5nIGl0IHRvIHNlbGVjdGVkLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGNoYW5nZVNlbGVjdGVkKHR5cGUsIGV2ZW50KSB7XG4gICAgLy9UT0RPIHRlc3QgbW9jaGFcbiAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uTWFwW2V2ZW50LmtleUNvZGVdO1xuXG4gICAgaWYoZGlyZWN0aW9uKVxuICAgICAgICBfY2hhbmdlU2VsZWN0ZWQuY2FsbCh0aGlzLCBkaXJlY3Rpb24pO1xufVxuXG5mdW5jdGlvbiBfY2hhbmdlU2VsZWN0ZWQoZGlyZWN0aW9uKSB7XG4gICAgLy8gVE9ETzogcmVmYWN0b3IgYW5kIHRpZHkgdXAsIGxvb2tzIGxpa2Ugc29tZSBjb2RlIGR1cGxpY2F0aW9uLlxuICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnLnNlbGVjdGVkJylbMF1cbiAgICAgICAgLCBzY3JvbGxQb3MgPSB0aGlzLl9jb21ib0xpc3QuZWwuc2Nyb2xsVG9wXG4gICAgICAgICwgc2VsZWN0ZWRQb3MgPSBzZWxlY3RlZCA/IHNlbGVjdGVkLm9mZnNldFRvcCA6IDBcbiAgICAgICAgLCByZWxhdGl2ZVBvcyA9IHNlbGVjdGVkUG9zIC0gc2Nyb2xsUG9zO1xuXG4gICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgIHZhciBpbmRleCA9IF9nZXREYXRhVmFsdWVGcm9tRWxlbWVudC5jYWxsKHRoaXMsIHNlbGVjdGVkKVxuICAgICAgICAgICAgLCB0aGlzSXRlbSA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbaW5kZXhdXG4gICAgICAgICAgICAsIGFkakl0ZW0gPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhW2luZGV4ICsgZGlyZWN0aW9uXTtcblxuICAgICAgICBpZiAoYWRqSXRlbSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXNJdGVtLnNlbGVjdGVkO1xuICAgICAgICAgICAgYWRqSXRlbS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZCA9IGFkakl0ZW07XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbMF0pIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbMF0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBvcyA+IHRoaXMuX29wdGlvbnNIZWlnaHQgLSB0aGlzLl9lbGVtZW50SGVpZ2h0KjIgJiYgZGlyZWN0aW9uID09PSAxKVxuICAgICAgICB0aGlzLl9jb21ib0xpc3QuZWwuc2Nyb2xsVG9wICs9IHRoaXMuX2VsZW1lbnRIZWlnaHQqZGlyZWN0aW9uKjU7XG5cbiAgICBpZiAocmVsYXRpdmVQb3MgPCB0aGlzLl9lbGVtZW50SGVpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gLTEpXG4gICAgICAgIHRoaXMuX2NvbWJvTGlzdC5lbC5zY3JvbGxUb3AgKz0gdGhpcy5fZWxlbWVudEhlaWdodCpkaXJlY3Rpb24qNTtcbn1cblxuXG4vKipcbiAqIE1vdXNlIG92ZXIgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91c2VPdmVyKHR5cGUsIGV2ZW50KSB7XG4gICAgdGhpcy5fbW91c2VJc092ZXIgPSB0cnVlO1xufVxuXG5cbi8qKlxuICogTW91c2UgbGVhdmUgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91c2VMZWF2ZSh0eXBlLCBldmVudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9tb3VzZUlzT3ZlciA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9tb3VzZU91dFRpbWVyKSBjbGVhckludGVydmFsKHRoaXMuX21vdXNlT3V0VGltZXIpO1xuICAgIHRoaXMuX21vdXNlT3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICghc2VsZi5fbW91c2VJc092ZXIpXG4gICAgICAgICAgICBfb25Nb3VzZUxlYXZlLmNhbGwoc2VsZik7XG4gICAgfSwgNzUwKTtcbn1cblxuZnVuY3Rpb24gX29uTW91c2VMZWF2ZSgpIHtcbiAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbn1cblxuXG4vKipcbiAqIElucHV0IGNsaWNrIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbklucHV0Q2xpY2sodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLnNob3dPcHRpb25zKCk7XG4gICAgaWYgKHRoaXMuX19zaG93QWRkT25DbGljaykgdGhpcy50b2dnbGVBZGRCdXR0b24odHJ1ZSk7XG59XG5cblxuLyoqXG4gKiBFbnRlciBrZXkgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uRW50ZXJLZXkodHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAxMykge1xuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWQpXG4gICAgICAgICAgICBfc2V0RGF0YS5jYWxsKHRoaXMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYnV0dG9uIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkFkZEJ0biAodHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgZGF0YSA9IHsgbGFiZWw6IHRoaXMuX2NvbWJvSW5wdXQuZWwudmFsdWUgfTtcbiAgICB0aGlzLnBvc3RNZXNzYWdlKCdhZGRpdGVtJywgZGF0YSk7XG4gICAgdGhpcy5ldmVudHMucG9zdE1lc3NhZ2UoJ21pbG9fc3VwZXJjb21ib2FkZGl0ZW0nLCBkYXRhKTtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSwgeyBwcmVzZXJ2ZVN0YXRlOiB0cnVlIH0pO1xuXG59XG5cbi8qKlxuICogTGlzdCBjbGljayBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25MaXN0Q2xpY2sgKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIGluZGV4ID0gX2dldERhdGFWYWx1ZUZyb21FbGVtZW50LmNhbGwodGhpcywgZXZlbnQudGFyZ2V0KTtcbiAgICB2YXIgZGF0YSA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbaW5kZXhdO1xuXG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBkYXRhO1xuICAgIF9zZXREYXRhLmNhbGwodGhpcyk7XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cblxuXG4vKipcbiAqIExpc3Qgc2Nyb2xsIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkxpc3RTY3JvbGwgKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIHNjcm9sbFBvcyA9IGV2ZW50LnRhcmdldC5zY3JvbGxUb3BcbiAgICAgICAgLCBkaXJlY3Rpb24gPSBzY3JvbGxQb3MgPiB0aGlzLl9sYXN0U2Nyb2xsUG9zID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAsIGZpcnN0Q2hpbGQgPSB0aGlzLl9jb21ib09wdGlvbnMuZWwubGFzdEVsZW1lbnRDaGlsZFxuICAgICAgICAsIGxhc3RDaGlsZCA9IHRoaXMuX2NvbWJvT3B0aW9ucy5lbC5maXJzdEVsZW1lbnRDaGlsZFxuICAgICAgICAsIGxhc3RFbFBvc2l0aW9uID0gZmlyc3RDaGlsZCA/IGZpcnN0Q2hpbGQub2Zmc2V0VG9wIDogMFxuICAgICAgICAsIGZpcnN0RWxQb3NpdGlvbiA9IGxhc3RDaGlsZCA/IGxhc3RDaGlsZC5vZmZzZXRUb3AgOiAwXG4gICAgICAgICwgZGlzdEZyb21MYXN0RWwgPSBsYXN0RWxQb3NpdGlvbiAtIHNjcm9sbFBvcyAtIHRoaXMuX29wdGlvbnNIZWlnaHQgKyB0aGlzLl9lbGVtZW50SGVpZ2h0XG4gICAgICAgICwgZGlzdEZyb21GaXJzdEVsID0gc2Nyb2xsUG9zIC0gZmlyc3RFbFBvc2l0aW9uXG4gICAgICAgICwgZWxzRnJvbVN0YXJ0ID0gTWF0aC5mbG9vcihkaXN0RnJvbUZpcnN0RWwgLyB0aGlzLl9lbGVtZW50SGVpZ2h0KVxuICAgICAgICAsIGVsc1RvVGhlRW5kID0gTWF0aC5mbG9vcihkaXN0RnJvbUxhc3RFbCAvIHRoaXMuX2VsZW1lbnRIZWlnaHQpXG4gICAgICAgICwgdG90YWxFbGVtZW50c0JlZm9yZSA9IE1hdGguZmxvb3Ioc2Nyb2xsUG9zIC8gdGhpcy5fZWxlbWVudEhlaWdodCkgLSBCVUZGRVI7XG5cbiAgICBpZiAoKGRpcmVjdGlvbiA9PSAnZG93bicgJiYgZWxzVG9UaGVFbmQgPCBCVUZGRVIpXG4gICAgICAgIHx8IChkaXJlY3Rpb24gPT0gJ3VwJyAmJiBlbHNGcm9tU3RhcnQgPCBCVUZGRVIpKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0SW5kZXggPSB0b3RhbEVsZW1lbnRzQmVmb3JlID4gMCA/IHRvdGFsRWxlbWVudHNCZWZvcmUgOiAwO1xuICAgICAgICB0aGlzLl9lbmRJbmRleCA9IHRvdGFsRWxlbWVudHNCZWZvcmUgKyBNQVhfUkVOREVSRUQ7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRIZWlnaHQgPSBmaXJzdENoaWxkLnN0eWxlLmhlaWdodDtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgdGhpcy5fbGFzdFNjcm9sbFBvcyA9IHNjcm9sbFBvcztcbn1cblxuXG4vKipcbiAqIFByaXZhdGUgbWV0aG9kXG4gKiBSZXRyaWV2ZXMgdGhlIGRhdGEtdmFsdWUgYXR0cmlidXRlIHZhbHVlIGZyb20gdGhlIGVsZW1lbnQgYW5kIHJldHVybnMgaXQgYXMgYW4gaW5kZXggb2ZcbiAqIHRoZSBmaWx0ZXJlZE9wdGlvbnNcbiAqXG4gKiBAcGFyYW0gIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBfZ2V0RGF0YVZhbHVlRnJvbUVsZW1lbnQoZWwpIHtcbiAgICByZXR1cm4gTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScpKSArIHRoaXMuX3N0YXJ0SW5kZXg7XG59XG5cbi8qKlxuICogUHJpdmF0ZSBtZXRob2RcbiAqIFNldHMgdGhlIGRhdGEgb2YgdGhlIFN1cGVyQ29tYm8sIHRha2luZyBjYXJlIHRvIHJlc2V0IHNvbWUgdGhpbmdzIGFuZCB0ZW1wb3JhcmlseVxuICogdW5zdWJzY3JpYmUgZGF0YSBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIF9zZXREYXRhKCkge1xuICAgIGRlbGV0ZSB0aGlzLl9zZWxlY3RlZC5zZWxlY3RlZDtcbiAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5vZmYoJycsIHsgc3Vic2NyaWJlcjogb25EYXRhQ2hhbmdlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vc3VwZXJjb21ibyBsaXN0ZW5lcnMgb2ZmXG4gICAgdGhpcy5kYXRhLnNldCh0aGlzLl9zZWxlY3RlZCk7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19DSEFOR0VfTUVTU0FHRSk7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uRGF0YUNoYW5nZSwgY29udGV4dDogdGhpcyB9KTtcbiAgICAvL3N1cGVyY29tYm8gbGlzdGVuZXJzIG9uXG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBudWxsO1xuICAgIHRoaXMuc2V0RmlsdGVyZWRPcHRpb25zKHRoaXMuX29wdGlvbnNEYXRhKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MVGV4dCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxUZXh0Jywge1xuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktdGV4dCdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFRleHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MVGV4dDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXI7XG5cblxudmFyIE1MVGV4dGFyZWEgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MVGV4dGFyZWEnLCB7XG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS10ZXh0YXJlYSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFRleHRhcmVhKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFRleHRhcmVhO1xuXG5cbnZhciBTQU1QTEVfQVVUT1JFU0laRV9URVhUID0gJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ZXIgYWRpcGlzY2luZyBlbGl0LCc7XG5cblxuXy5leHRlbmRQcm90byhNTFRleHRhcmVhLCB7XG4gICAgc3RhcnRBdXRvcmVzaXplOiBNTFRleHRhcmVhJHN0YXJ0QXV0b3Jlc2l6ZSxcbiAgICBzdG9wQXV0b3Jlc2l6ZTogTUxUZXh0YXJlYSRzdG9wQXV0b3Jlc2l6ZSxcbiAgICBpc0F1dG9yZXNpemVkOiBNTFRleHRhcmVhJGlzQXV0b3Jlc2l6ZWQsXG4gICAgZGlzYWJsZTogTUxUZXh0YXJlYSRkaXNhYmxlXG59KTtcblxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJHN0YXJ0QXV0b3Jlc2l6ZShvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMuX2F1dG9yZXNpemUpXG4gICAgICAgIHJldHVybiBsb2dnZXIud2FybignTUxUZXh0YXJlYSBzdGFydEF1dG9yZXNpemU6IGF1dG9yZXNpemUgaXMgYWxyZWFkeSBvbicpO1xuICAgIHRoaXMuX2F1dG9yZXNpemUgPSB0cnVlO1xuICAgIHRoaXMuX2F1dG9yZXNpemVPcHRpb25zID0gb3B0aW9ucztcblxuICAgIF9hZGp1c3RBcmVhSGVpZ2h0LmNhbGwodGhpcyk7XG4gICAgX21hbmFnZVN1YnNjcmlwdGlvbnMuY2FsbCh0aGlzLCAnb24nKTtcbn1cblxuXG5mdW5jdGlvbiBfbWFuYWdlU3Vic2NyaXB0aW9ucyhvbk9mZikge1xuICAgIHRoaXMuZXZlbnRzW29uT2ZmXSgnY2xpY2snLCB7IHN1YnNjcmliZXI6IF9hZGp1c3RBcmVhSGVpZ2h0LCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIHRoaXMuZGF0YVtvbk9mZl0oJycsIHsgc3Vic2NyaWJlcjogX2FkanVzdEFyZWFIZWlnaHQsIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cblxuZnVuY3Rpb24gX2FkanVzdEFyZWFIZWlnaHQoKSB7XG4gICAgdGhpcy5lbC5zdHlsZS5oZWlnaHQgPSAwO1xuXG4gICAgdmFyIG5ld0hlaWdodCA9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0XG4gICAgICAgICwgbWluSGVpZ2h0ID0gdGhpcy5fYXV0b3Jlc2l6ZU9wdGlvbnMubWluSGVpZ2h0XG4gICAgICAgICwgbWF4SGVpZ2h0ID0gdGhpcy5fYXV0b3Jlc2l6ZU9wdGlvbnMubWF4SGVpZ2h0O1xuXG4gICAgbmV3SGVpZ2h0ID0gbmV3SGVpZ2h0ID49IG1heEhlaWdodFxuICAgICAgICAgICAgICAgID8gbWF4SGVpZ2h0XG4gICAgICAgICAgICAgICAgOiBuZXdIZWlnaHQgPD0gbWluSGVpZ2h0XG4gICAgICAgICAgICAgICAgPyBtaW5IZWlnaHRcbiAgICAgICAgICAgICAgICA6IG5ld0hlaWdodDtcblxuICAgIHRoaXMuZWwuc3R5bGUuaGVpZ2h0ID0gbmV3SGVpZ2h0ICsgJ3B4Jztcbn1cblxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJHN0b3BBdXRvcmVzaXplKCkge1xuICAgIGlmICghIHRoaXMuX2F1dG9yZXNpemUpXG4gICAgICAgIHJldHVybiBsb2dnZXIud2FybignTUxUZXh0YXJlYSBzdG9wQXV0b3Jlc2l6ZTogYXV0b3Jlc2l6ZSBpcyBub3Qgb24nKTtcbiAgICB0aGlzLl9hdXRvcmVzaXplID0gZmFsc2U7XG4gICAgX21hbmFnZVN1YnNjcmlwdGlvbnMuY2FsbCh0aGlzLCAnb2ZmJyk7XG59XG5cblxuZnVuY3Rpb24gTUxUZXh0YXJlYSRpc0F1dG9yZXNpemVkKCkge1xuICAgIHJldHVybiB0aGlzLl9hdXRvcmVzaXplO1xufVxuXG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fYXV0b3Jlc2l6ZSlcbiAgICAgICAgdGhpcy5zdG9wQXV0b3Jlc2l6ZSgpO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJGRpc2FibGUoZGlzYWJsZSkge1xuICAgIHRoaXMuZWwuZGlzYWJsZWQgPSBkaXNhYmxlO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MVGltZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxUaW1lJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTFRpbWVfZ2V0LFxuICAgICAgICBzZXQ6IE1MVGltZV9zZXQsXG4gICAgICAgIGRlbDogTUxUaW1lX2RlbCxcbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS10aW1lJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MVGltZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxUaW1lO1xuXG5cbnZhciBUSU1FX1JFR0VYID0gL14oWzAtOV17MSwyfSkoPzpcXDp8XFwuKShbMC05XXsxLDJ9KSQvXG4gICAgLCBUSU1FX1RFTVBMQVRFID0gJ2hoOm1tJztcblxuZnVuY3Rpb24gTUxUaW1lX2dldCgpIHtcbiAgICB2YXIgdGltZVN0ciA9IHRoaXMuZWwudmFsdWU7XG4gICAgdmFyIG1hdGNoID0gdGltZVN0ci5tYXRjaChUSU1FX1JFR0VYKTtcbiAgICBpZiAoISBtYXRjaCkgcmV0dXJuO1xuICAgIHZhciBob3VycyA9IG1hdGNoWzFdXG4gICAgICAgICwgbWlucyA9IG1hdGNoWzJdO1xuICAgIGlmIChob3VycyA+IDIzIHx8IG1pbnMgPiA1OSkgcmV0dXJuO1xuICAgIHZhciB0aW1lID0gbmV3IERhdGUoMTk3MCwgMCwgMSwgaG91cnMsIG1pbnMpO1xuXG4gICAgcmV0dXJuIF8udG9EYXRlKHRpbWUpO1xufVxuXG5cbmZ1bmN0aW9uIE1MVGltZV9zZXQodmFsdWUpIHtcbiAgICB2YXIgdGltZSA9IF8udG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoISB0aW1lKSB7XG4gICAgICAgIHRoaXMuZWwudmFsdWUgPSAnJztcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aW1lU3RyID0gVElNRV9URU1QTEFURVxuICAgICAgICAgICAgLnJlcGxhY2UoJ2hoJywgcGFkKHRpbWUuZ2V0SG91cnMoKSkpXG4gICAgICAgICAgICAucmVwbGFjZSgnbW0nLCBwYWQodGltZS5nZXRNaW51dGVzKCkpKTtcblxuICAgIHRoaXMuZWwudmFsdWUgPSB0aW1lU3RyO1xuICAgIHJldHVybiB0aW1lU3RyO1xuXG4gICAgZnVuY3Rpb24gcGFkKG4pIHtyZXR1cm4gbiA8IDEwID8gJzAnICsgbiA6IG47IH1cbn1cblxuXG5mdW5jdGlvbiBNTFRpbWVfZGVsKCkge1xuICAgIHRoaXMuZWwudmFsdWUgPSAnJztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MV3JhcHBlciA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxXcmFwcGVyJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktd3JhcHBlcidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFdyYXBwZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MV3JhcHBlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGNvbXBvbmVudE5hbWUgPSBtaWxvLnV0aWwuY29tcG9uZW50TmFtZVxuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgY2hlY2sgPSBtaWxvLnV0aWwuY2hlY2tcbiAgICAsIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cblxudmFyIEFMRVJUX0NTU19DTEFTU0VTID0ge1xuICAgIHN1Y2Nlc3M6ICdhbGVydC1zdWNjZXNzJyxcbiAgICB3YXJuaW5nOiAnYWxlcnQtd2FybmluZycsXG4gICAgaW5mbzogJ2FsZXJ0LWluZm8nLFxuICAgIGRhbmdlcjogJ2FsZXJ0LWRhbmdlcicsXG4gICAgZml4ZWQ6ICdhbGVydC1maXhlZCdcbn07XG5cblxudmFyIE1MQWxlcnQgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQWxlcnQnLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogWydtbC1icy1hbGVydCcsICdhbGVydCcsICdmYWRlJ10sXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICdyb2xlJzogJ2FsZXJ0JyxcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJ1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ1xcXG4gICAgICAgICAgICB7ez8gaXQuY2xvc2UgfX1cXFxuICAgICAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cIltldmVudHNdOmNsb3NlQnRuXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L2J1dHRvbj5cXFxuICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAge3s9IGl0Lm1lc3NhZ2V9fSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEFsZXJ0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEFsZXJ0O1xuXG5cbl8uZXh0ZW5kKE1MQWxlcnQsIHtcbiAgICBjcmVhdGVBbGVydDogTUxBbGVydCQkY3JlYXRlQWxlcnQsXG4gICAgb3BlbkFsZXJ0OiBNTEFsZXJ0JCRvcGVuQWxlcnQsXG59KTtcblxuXG5fLmV4dGVuZFByb3RvKE1MQWxlcnQsIHtcbiAgICBvcGVuQWxlcnQ6IE1MQWxlcnQkb3BlbkFsZXJ0LFxuICAgIGNsb3NlQWxlcnQ6IE1MQWxlcnQkY2xvc2VBbGVydFxufSk7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgbmV3IGFsZXJ0IGluc3RhbmNlLiBUbyBjcmVhdGUgYW5kIG9wZW4gYXQgdGhlIHNhbWUgdGltZSB1c2UgW29wZW5BbGVydF0oI01MQWxlcnQkJG9wZW5BbGVydClcbiAqIGBvcHRpb25zYCBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAgICBtZXNzYWdlOiBzdHJpbmcgYWxlcnQgbWVzc2FnZVxuICogICAgICB0eXBlOiAgICBvcHRpb25hbCBzdHJpbmcgdGhlIHR5cGUgb2YgYWxlcnQgbWVzc2FnZSwgb25lIG9mIHN1Y2Nlc3MsIHdhcm5pbmcsIGluZm8sIGRhbmdlciwgZml4ZWRcbiAqICAgICAgICAgICAgICAgZGVmYXVsdCAnaW5mbydcbiAqICAgICAgY2xvc2U6ICAgb3B0aW9uYWwgZmFsc2UgdG8gcHJldmVudCB1c2VyIGZyb20gY2xvc2luZ1xuICogICAgICAgICAgICAgICBvciB0cnVlIChkZWZhdWx0KSB0byBlbmFibGUgY2xvc2luZyBhbmQgcmVuZGVyIGEgY2xvc2UgYnV0dG9uXG4gKiAgICAgIHRpbWVvdXQ6IG9wdGlvbmFsIHRpbWVyLCBpbiBtaWxsaXNlY29uZHMgdG8gYXV0b21hdGljYWxseSBjbG9zZSB0aGUgYWxlcnRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBhbGVydCBjb25maWd1cmF0aW9uXG4gKi9cbmZ1bmN0aW9uIE1MQWxlcnQkJGNyZWF0ZUFsZXJ0KG9wdGlvbnMpIHtcbiAgICBjaGVjayhvcHRpb25zLCB7XG4gICAgICAgIG1lc3NhZ2U6IFN0cmluZyxcbiAgICAgICAgdHlwZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgY2xvc2U6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgICB0aW1lb3V0OiBNYXRjaC5PcHRpb25hbChOdW1iZXIpXG4gICAgfSk7XG5cbiAgICB2YXIgYWxlcnQgPSBNTEFsZXJ0LmNyZWF0ZU9uRWxlbWVudCgpO1xuXG4gICAgb3B0aW9ucyA9IF9wcmVwYXJlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIHZhciBhbGVydENscyA9IEFMRVJUX0NTU19DTEFTU0VTW29wdGlvbnMudHlwZV07XG4gICAgYWxlcnQuZG9tLmFkZENzc0NsYXNzZXMoYWxlcnRDbHMpO1xuXG4gICAgYWxlcnQuX2FsZXJ0ID0ge1xuICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG5cbiAgICBhbGVydC50ZW1wbGF0ZS5yZW5kZXIob3B0aW9ucykuYmluZGVyKCk7XG5cbiAgICB2YXIgYWxlcnRTY29wZSA9IGFsZXJ0LmNvbnRhaW5lci5zY29wZTtcblxuICAgIGlmIChvcHRpb25zLmNsb3NlKVxuICAgICAgICBhbGVydFNjb3BlLmNsb3NlQnRuLmV2ZW50cy5vbignY2xpY2snLFxuICAgICAgICAgICAgeyBzdWJzY3JpYmVyOiBfb25DbG9zZUJ0bkNsaWNrLCBjb250ZXh0OiBhbGVydCB9KTtcblxuICAgIGlmIChvcHRpb25zLnRpbWVvdXQpXG4gICAgICAgIHZhciB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKGFsZXJ0Ll9hbGVydC52aXNpYmxlKVxuICAgICAgICAgICAgICAgIGFsZXJ0LmNsb3NlQWxlcnQoKTtcbiAgICAgICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcblxuICAgIHJldHVybiBhbGVydDtcbn1cblxuXG4vKipcbiAqIENyZWF0ZSBhbmQgc2hvdyBhbGVydCBwb3B1cFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIG9iamVjdCB3aXRoIG1lc3NhZ2UsIHR5cGUsIGNsb3NlIGFuZCB0aW1lb3V0XG4gKiBAcmV0dXJuIHtNTEFsZXJ0fSB0aGUgYWxlcnQgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gTUxBbGVydCQkb3BlbkFsZXJ0KG9wdGlvbnMpIHtcbiAgICB2YXIgYWxlcnQgPSBNTEFsZXJ0LmNyZWF0ZUFsZXJ0KG9wdGlvbnMpO1xuICAgIGFsZXJ0Lm9wZW5BbGVydCgpO1xuICAgIHJldHVybiBhbGVydDtcbn1cblxuXG5mdW5jdGlvbiBfb25DbG9zZUJ0bkNsaWNrKHR5cGUsIGV2ZW50KSB7XG4gICAgdGhpcy5jbG9zZUFsZXJ0KCk7XG59XG5cblxuZnVuY3Rpb24gX3ByZXBhcmVPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gXy5jbG9uZShvcHRpb25zKTtcbiAgICBvcHRpb25zLmNsb3NlID0gdHlwZW9mIG9wdGlvbnMuY2xvc2UgPT0gJ3VuZGVmaW5lZCcgfHwgb3B0aW9ucy5jbG9zZSA9PT0gdHJ1ZTtcbiAgICBvcHRpb25zLnRpbWVvdXQgPSBNYXRoLmZsb29yKG9wdGlvbnMudGltZW91dCk7XG4gICAgb3B0aW9ucy50eXBlID0gb3B0aW9ucy50eXBlIHx8ICdpbmZvJztcblxuICAgIHJldHVybiBvcHRpb25zO1xufVxuXG5cbi8qKlxuICogT3BlbiB0aGUgYWxlcnRcbiAqL1xuZnVuY3Rpb24gTUxBbGVydCRvcGVuQWxlcnQoKSB7XG4gICAgX3RvZ2dsZUFsZXJ0LmNhbGwodGhpcywgdHJ1ZSk7XG59XG5cblxuLyoqXG4gKiBDbG9zZSB0aGUgYWxlcnRcbiAqL1xuZnVuY3Rpb24gTUxBbGVydCRjbG9zZUFsZXJ0KCkge1xuICAgIF90b2dnbGVBbGVydC5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbn1cblxuXG5mdW5jdGlvbiBfdG9nZ2xlQWxlcnQoZG9TaG93KSB7XG4gICAgZG9TaG93ID0gdHlwZW9mIGRvU2hvdyA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgID8gISB0aGlzLl9hbGVydC52aXNpYmxlXG4gICAgICAgICAgICAgICAgOiAhISBkb1Nob3c7XG5cbiAgICB2YXIgYWRkUmVtb3ZlID0gZG9TaG93ID8gJ2FkZCcgOiAncmVtb3ZlJ1xuICAgICAgICAsIGFwcGVuZFJlbW92ZSA9IGRvU2hvdyA/ICdhcHBlbmRDaGlsZCcgOiAncmVtb3ZlQ2hpbGQnO1xuXG4gICAgdGhpcy5fYWxlcnQudmlzaWJsZSA9IGRvU2hvdztcblxuICAgIGRvY3VtZW50LmJvZHlbYXBwZW5kUmVtb3ZlXSh0aGlzLmVsKTtcbiAgICB0aGlzLmRvbS50b2dnbGUoZG9TaG93KTtcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAhZG9TaG93KTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdFthZGRSZW1vdmVdKCdpbicpO1xuICAgIHRoaXMuZWxbZG9TaG93ID8gJ2ZvY3VzJyA6ICdibHVyJ10oKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGNvbXBvbmVudE5hbWUgPSBtaWxvLnV0aWwuY29tcG9uZW50TmFtZVxuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgY2hlY2sgPSBtaWxvLnV0aWwuY2hlY2tcbiAgICAsIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cblxudmFyIERFRkFVTFRfQlVUVE9OUyA9IFsgeyB0eXBlOiAnZGVmYXVsdCcsIGxhYmVsOiAnT0snLCByZXN1bHQ6ICdPSycgfSBdO1xuXG52YXIgQ0xPU0VfT1BUSU9OUyA9IFsnYmFja2Ryb3AnLCAna2V5Ym9hcmQnLCAnYnV0dG9uJ107XG5cbnZhciBCVVRUT05fQ1NTX0NMQVNTRVMgPSB7IC8vIFRPRE8gLSB1c2UgaW4gdGVtcGxhdGVcbiAgICBkZWZhdWx0OiAnYnRuLWRlZmF1bHQnLFxuICAgIHByaW1hcnk6ICdidG4tcHJpbWFyeScsXG4gICAgc3VjY2VzczogJ2J0bi1zdWNjZXNzJyxcbiAgICBpbmZvOiAnYnRuLWluZm8nLFxuICAgIHdhcm5pbmc6ICdidG4td2FybmluZycsXG4gICAgZGFuZ2VyOiAnYnRuLWRhbmdlcicsXG4gICAgbGluazogJ2J0bi1saW5rJ1xufTtcblxuXG4vKipcbiAqIERpYWxvZyBjbGFzcyB0byBzaG93IGN1c3RvbSBkaWFsb2cgYm94ZXMgYmFzZWQgb24gY29uZmlndXJhdGlvbiAtIHNlZSBbY3JlYXRlRGlhbG9nXSgjTUxEaWFsb2ckJGNyZWF0ZURpYWxvZykgbWV0aG9kLlxuICogT25seSBvbmUgZGlhbG9nIGNhbiBiZSBvcGVuZWQgYXQgYSB0aW1lIC0gdHJ5aW5nIHRvIG9wZW4gYW5vdGhlciB3aWxsIGxvZyBlcnJvciB0byBjb25zb2xlLiBDdXJyZW50bHkgb3BlbmVkIGRpYWxvZyBjYW4gYmUgcmV0cmlldmVkIHVzaW5nIFtnZXRDdXJyZW50RGlhbG9nXSgjTUxEaWFsb2ckJGdldEN1cnJlbnREaWFsb2cpIGNsYXNzIG1ldGhvZC5cbiAqL1xudmFyIE1MRGlhbG9nID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTERpYWxvZycsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiBbJ21sLWJzLWRpYWxvZycsICdtb2RhbCcsICdmYWRlJ10sXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICdyb2xlJzogJ2RpYWxvZycsXG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAndHJ1ZSdcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICdcXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZyB7ez0gaXQuY3NzQ2xhc3MgfX1cIj5cXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+XFxcbiAgICAgICAgICAgICAgICAgICAge3s/IGl0LnRpdGxlIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PyBpdC5jbG9zZS5idXR0b24gfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG1sLWJpbmQ9XCJbZXZlbnRzXTpjbG9zZUJ0blwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCI+JnRpbWVzOzwvYnV0dG9uPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+e3s9IGl0LnRpdGxlIH19PC9oND5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICB7ez8gaXQuaHRtbCB8fCBpdC50ZXh0IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCIgbWwtYmluZD1cIltjb250YWluZXJdOmRpYWxvZ0JvZHlcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PyBpdC5odG1sIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s9IGl0Lmh0bWwgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7Pz99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPnt7PSBpdC50ZXh0IH19PC9wPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICB7ez8gaXQuYnV0dG9ucyAmJiBpdC5idXR0b25zLmxlbmd0aCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZm9vdGVyXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e34gaXQuYnV0dG9ucyA6YnRuIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCJcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidG4gYnRuLXt7PSBidG4udHlwZSB9fXt7PyBidG4uY2xzIH19IHt7PSBidG4uY2xzIH19e3s/fX1cIlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtbC1iaW5kPVwiW2V2ZW50c106e3s9IGJ0bi5uYW1lIH19XCI+e3s9IGJ0bi5sYWJlbCB9fTwvYnV0dG9uPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3t+fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICA8L2Rpdj4nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEaWFsb2cpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRGlhbG9nO1xuXG5cbl8uZXh0ZW5kKE1MRGlhbG9nLCB7XG4gICAgY3JlYXRlRGlhbG9nOiBNTERpYWxvZyQkY3JlYXRlRGlhbG9nLFxuICAgIG9wZW5EaWFsb2c6IE1MRGlhbG9nJCRvcGVuRGlhbG9nLFxuICAgIGdldE9wZW5lZERpYWxvZzogTUxEaWFsb2ckJGdldE9wZW5lZERpYWxvZ1xufSk7XG5cblxuXy5leHRlbmRQcm90byhNTERpYWxvZywge1xuICAgIG9wZW5EaWFsb2c6IE1MRGlhbG9nJG9wZW5EaWFsb2csXG4gICAgY2xvc2VEaWFsb2c6IE1MRGlhbG9nJGNsb3NlRGlhbG9nLFxuICAgIGRlc3Ryb3k6IE1MRGlhbG9nJGRlc3Ryb3lcbn0pO1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgcmV0dXJucyBkaWFsb2cgaW5zdGFuY2UuIFRvIGNyZWF0ZSBhbmQgb3BlbiBhdCB0aGUgc2FtZSB0aW1lIFtvcGVuRGlhbG9nXSgjTUxEaWFsb2ckJG9wZW5EaWFsb2cpXG4gKiBgb3B0aW9uc2AgaXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgICB0aXRsZTogb3B0aW9uYWwgZGlhbG9nIHRpdGxlXG4gKiAgICAgaHRtbDogb3B0aW9uYWwgZGlhbG9nIHRleHQgYXMgaHRtbCAod2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0ZXh0IGlmIGJvdGggdGV4dCBuZCBodG1sIGFyZSBwYXNzZWQpXG4gKiAgICAgICBvclxuICogICAgIHRleHQ6IG9wdGlvbmFsIGRpYWxvZyB0ZXh0XG4gKiAgICAgY2xvc2U6IG9wdGlvbmFsIGZhbHNlIHRvIHByZXZlbnQgYmFja2Ryb3AgYW5kIGVzYyBrZXkgZnJvbSBjbG9zaW5nIHRoZSBkaWFsb2cgYW5kIHJlbW92aW5nIGNsb3NlIGJ1dHRvbiBpbiB0b3AgcmlnaHQgY29ybmVyXG4gKiAgICAgICAgICAgIG9yIHRydWUgKGRlZmF1bHQpIHRvIGVuYWJsZSBhbGwgY2xvc2Ugb3B0aW9uc1xuICogICAgICAgICAgICBvciBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzXG4gKiAgICAgICAgIGJhY2tkcm9wOiBmYWxzZSBvciB0cnVlIChkZWZhdWx0KSwgY2xvc2UgZGlhbG9nIHdoZW4gYmFja2Ryb3AgY2xpY2tlZFxuICogICAgICAgICBrZXlib2FyZDogZmFsc2Ugb3IgdHJ1ZSAoZGVmYXVsdCksIGNsb3NlIGRpYWxvZyB3aGVuIGVzYyBrZXkgaXMgcHJlc3NlZFxuICogICAgICAgICBidXR0b246IGZhbHNlIG9yIHRydWUgKGRlZmF1bHQpLCBzaG93IGNsb3NlIGJ1dHRvbiBpbiB0aGUgaGVhZGVyICh3b24ndCBiZSBzaG93biBpZiB0aGVyZSBpcyBubyBoZWFkZXIgd2hlbiB0aXRsZSBpcyBub3QgcGFzc2VkKVxuICogICAgIGJ1dHRvbnM6IG9wdGlvbmFsIGFycmF5IG9mIGJ1dHRvbnMgY29uZmlndXJhdGlvbnMsIHdoZXJlIGVhY2ggYnV0dG9uIGNvbmZpZyBpcyBhbiBvYmplY3RcbiAqICAgICAgICAgbmFtZTogICBvcHRpb25hbCBuYW1lIG9mIGNvbXBvbmVudCwgc2hvdWxkIGJlIHVuaXF1ZSBhbmQgc2hvdWxkIG5vdCBiZSBgY2xvc2VCdG5gLCBpZiBub3QgcGFzc2VkIGEgdGltZXN0YW1wIGJhc2VkIG5hbWUgd2lsbCBiZSB1c2VkXG4gKiAgICAgICAgIHR5cGU6ICAgYnV0dG9uIHR5cGUsIHdpbGwgZGV0ZXJtaW5lIGJ1dHRvbiBDU1Mgc3R5bGUuIFBvc3NpYmxlIHR5cGVzIGFyZTogZGVmdWx0LCBwcmltYXJ5LCBzdWNjZXNzLCBpbmZvLCB3YXJuaW5nLCBkYW5nZXIsIGxpbmsgKG1hcCB0byByZWxhdGVkIGJvb3RzdHJhcCBidXR0b24gc3R5bGVzKVxuICogICAgICAgICBsYWJlbDogIGJ1dHRvbiBsYWJlbFxuICogICAgICAgICBjbG9zZTogIG9wdGlvbmFsIGZhbHNlIHRvIHByZXZlbnQgdGhpcyBidXR0b24gZnJvbSBjbG9zaW5nIGRpYWxvZ1xuICogICAgICAgICByZXN1bHQ6IHN0cmluZyB3aXRoIGRpYWxvZyBjbG9zZSByZXN1bHQgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byBkaWFsb2cgc3Vic2NyaWJlciBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gKiAgICAgICAgIGRhdGE6ICAgYW55IHZhbHVlL29iamVjdCBvciBmdW5jdGlvbiB0byBjcmVhdGUgZGF0YSB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIGRpYWxvZyBzdWJzY3JpYmVyIGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyLlxuICogICAgICAgICAgICAgICAgIElmIGZ1bmN0aW9uIGlzIHBhc3NlZCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGRpYWxvZyBhcyBjb250ZXh0IGFuZCBidXR0b24gb3B0aW9ucyBhcyBwYXJhbWV0ZXIuXG4gKlxuICogICAgIElmIGB0aXRsZWAgaXMgbm90IHBhc3NlZCwgZGlhbG9nIHdpbGwgbm90IGhhdmUgdGl0bGUgc2VjdGlvblxuICogICAgIElmIG5laXRoZXIgYHRleHRgIG5vciBgaHRtbGAgaXMgcGFzc2VkLCBkaWFsb2cgd2lsbCBub3QgaGF2ZSBib2R5IHNlY3Rpb24uXG4gKiAgICAgSWYgYGJ1dHRvbnNgIGFyZSBub3QgcGFzc2VkLCB0aGVyZSB3aWxsIG9ubHkgYmUgT0sgYnV0dG9uLlxuICpcbiAqIFdoZW4gZGlhbG9nIGlzIGNsb3NlZCwgdGhlIHN1YnNjcmliZXIgaXMgY2FsbGVkIHdpdGggcmVhdWx0IGFuZCBvcHRpb25hbCBkYXRhIGFzIGRlZmluZWQgaW4gYnV0dG9ucyBjb25maWd1cmF0aW9ucy5cbiAqIElmIGJhY2tkcm9wIGlzIGNsaWNrZWQgb3IgRVNDIGtleSBpcyBwcmVzc2VkIHRoZSByZXN1bHQgd2lsbCBiZSAnZGlzbWlzc2VkJ1xuICogSWYgY2xvc2UgYnV0dG9uIGluIHRoZSB0b3AgcmlnaHQgY29ybmVyIGlzIGNsaWNrZWQsIHRoZSByZXN1bHQgd2lsbCBiZSAnY2xvc2VkJyAoZGVmYXVsdCByZXN1bHQpXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgZGlhbG9nIGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGluaXRpYWxpemUgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgdG8gaW5pdGlhbGl6ZSB0aGUgZGlhbG9nXG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJCRjcmVhdGVEaWFsb2cob3B0aW9ucywgaW5pdGlhbGl6ZSkge1xuICAgIGNoZWNrKG9wdGlvbnMsIHtcbiAgICAgICAgdGl0bGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIGh0bWw6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIHRleHQ6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIGNsb3NlOiBNYXRjaC5PcHRpb25hbChNYXRjaC5PbmVPZihCb29sZWFuLCB7XG4gICAgICAgICAgICBiYWNrZHJvcDogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgICAgICBrZXlib2FyZDogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgICAgICBidXR0b246IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pXG4gICAgICAgIH0pKSxcbiAgICAgICAgYnV0dG9uczogTWF0Y2guT3B0aW9uYWwoWyB7XG4gICAgICAgICAgICBuYW1lOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICAgICAgbGFiZWw6IFN0cmluZyxcbiAgICAgICAgICAgIGNsb3NlOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgICAgIHJlc3VsdDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgICAgIGRhdGE6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLkFueSksXG4gICAgICAgICAgICBjbHM6IE1hdGNoLk9wdGlvbmFsKFN0cmluZylcbiAgICAgICAgfSBdKSxcbiAgICAgICAgY3NzQ2xhc3M6IE1hdGNoLk9wdGlvbmFsKFN0cmluZylcbiAgICB9KTtcblxuICAgIHZhciBkaWFsb2cgPSBNTERpYWxvZy5jcmVhdGVPbkVsZW1lbnQoKTtcblxuICAgIG9wdGlvbnMgPSBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgZGlhbG9nLl9kaWFsb2cgPSB7XG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcblxuICAgIGRpYWxvZy50ZW1wbGF0ZVxuICAgICAgICAucmVuZGVyKG9wdGlvbnMpXG4gICAgICAgIC5iaW5kZXIoKTtcblxuICAgIHZhciBkaWFsb2dTY29wZSA9IGRpYWxvZy5jb250YWluZXIuc2NvcGU7XG5cbiAgICBpZiAob3B0aW9ucy5jbG9zZS5iYWNrZHJvcClcbiAgICAgICAgZGlhbG9nLmV2ZW50cy5vbignY2xpY2snLFxuICAgICAgICAgICAgeyBzdWJzY3JpYmVyOiBfb25CYWNrZHJvcENsaWNrLCBjb250ZXh0OiBkaWFsb2cgfSk7XG5cbiAgICBpZiAob3B0aW9ucy50aXRsZSAmJiBvcHRpb25zLmNsb3NlLmJ1dHRvbilcbiAgICAgICAgZGlhbG9nU2NvcGUuY2xvc2VCdG4uZXZlbnRzLm9uKCdjbGljaycsXG4gICAgICAgICAgICB7IHN1YnNjcmliZXI6IF9vbkNsb3NlQnRuQ2xpY2ssIGNvbnRleHQ6IGRpYWxvZyB9KTtcblxuICAgIG9wdGlvbnMuYnV0dG9ucy5mb3JFYWNoKGZ1bmN0aW9uKGJ0bikge1xuICAgICAgICB2YXIgYnV0dG9uU3Vic2NyaWJlciA9IHtcbiAgICAgICAgICAgIHN1YnNjcmliZXI6IF8ucGFydGlhbChfZGlhbG9nQnV0dG9uQ2xpY2ssIGJ0biksXG4gICAgICAgICAgICBjb250ZXh0OiBkaWFsb2dcbiAgICAgICAgfTtcbiAgICAgICAgZGlhbG9nU2NvcGVbYnRuLm5hbWVdLmV2ZW50cy5vbignY2xpY2snLCBidXR0b25TdWJzY3JpYmVyKTtcbiAgICB9KTtcblxuICAgIGlmIChpbml0aWFsaXplKSBpbml0aWFsaXplKGRpYWxvZyk7XG4gICAgcmV0dXJuIGRpYWxvZztcbn1cblxuXG5mdW5jdGlvbiBfZGlhbG9nQnV0dG9uQ2xpY2soYnV0dG9uKSB7XG4gICAgaWYgKGJ1dHRvbi5jbG9zZSAhPT0gZmFsc2UpXG4gICAgICAgIF90b2dnbGVEaWFsb2cuY2FsbCh0aGlzLCBmYWxzZSk7XG5cbiAgICB2YXIgZGF0YSA9IF8ucmVzdWx0KGJ1dHRvbi5kYXRhLCB0aGlzLCBidXR0b24pO1xuICAgIF9kaXNwYXRjaFJlc3VsdC5jYWxsKHRoaXMsIGJ1dHRvbi5yZXN1bHQsIGRhdGEpO1xufVxuXG5cbmZ1bmN0aW9uIF9kaXNwYXRjaFJlc3VsdChyZXN1bHQsIGRhdGEpIHtcbiAgICB2YXIgc3Vic2NyaWJlciA9IHRoaXMuX2RpYWxvZy5zdWJzY3JpYmVyO1xuICAgIGlmICh0eXBlb2Ygc3Vic2NyaWJlciA9PSAnZnVuY3Rpb24nKVxuICAgICAgICBzdWJzY3JpYmVyLmNhbGwodGhpcywgcmVzdWx0LCBkYXRhKTtcbiAgICBlbHNlXG4gICAgICAgIHN1YnNjcmliZXIuc3Vic2NyaWJlci5jYWxsKHN1YnNjcmliZXIuY29udGV4dCwgcmVzdWx0LCBkYXRhKTtcbn1cblxuXG5mdW5jdGlvbiBfb25CYWNrZHJvcENsaWNrKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuZWwpXG4gICAgICAgIHRoaXMuY2xvc2VEaWFsb2coJ2Rpc21pc3NlZCcpO1xufVxuXG5cbmZ1bmN0aW9uIF9vbkNsb3NlQnRuQ2xpY2soKSB7XG4gICAgdGhpcy5jbG9zZURpYWxvZygnY2xvc2VkJyk7XG59XG5cblxuZnVuY3Rpb24gX29uS2V5RG93bihldmVudCkge1xuICAgIGlmIChvcGVuZWREaWFsb2dcbiAgICAgICAgICAgICYmIG9wZW5lZERpYWxvZy5fZGlhbG9nLm9wdGlvbnMuY2xvc2Uua2V5Ym9hcmRcbiAgICAgICAgICAgICYmIGV2ZW50LmtleUNvZGUgPT0gMjcpIC8vIGVzYyBrZXlcbiAgICAgICAgb3BlbmVkRGlhbG9nLmNsb3NlRGlhbG9nKCdkaXNtaXNzZWQnKTtcbn1cblxuXG5mdW5jdGlvbiBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBfLmNsb25lKG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuYnV0dG9ucyA9IF8uY2xvbmUob3B0aW9ucy5idXR0b25zIHx8IERFRkFVTFRfQlVUVE9OUyk7XG4gICAgb3B0aW9ucy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24oYnRuKSB7XG4gICAgICAgIGJ0bi5uYW1lID0gYnRuLm5hbWUgfHwgY29tcG9uZW50TmFtZSgpO1xuICAgIH0pO1xuXG4gICAgb3B0aW9ucy5jbG9zZSA9IHR5cGVvZiBvcHRpb25zLmNsb3NlID09ICd1bmRlZmluZWQnIHx8IG9wdGlvbnMuY2xvc2UgPT09IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXy5vYmplY3QoQ0xPU0VfT1BUSU9OUywgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdHlwZW9mIG9wdGlvbnMuY2xvc2UgPT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF8ubWFwVG9PYmplY3QoQ0xPU0VfT1BUSU9OUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ob3B0KSB7IHJldHVybiBvcHRpb25zLmNsb3NlW29wdF0gIT09IGZhbHNlOyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXy5vYmplY3QoQ0xPU0VfT1BUSU9OUywgZmFsc2UpO1xuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59XG5cblxuLyoqXG4gKiBDcmVhdGUgYW5kIHNob3cgZGlhbG9nIHBvcHVwXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0IHdpdGggdGl0bGUsIHRleHQgYW5kIGJ1dHRvbnMuIFNlZSBbY3JlYXRlRGlhbG9nXSgjTUxEaWFsb2ckJGNyZWF0ZURpYWxvZykgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gc3Vic2NyaWJlciBvcHRpb25hbCBzdWJzY3JpYmVyIGZ1bmN0aW9uIG9yIG9iamVjdCB0aGF0IGlzIHBhc3NlZCByZXN1bHQgYW5kIG9wdGlvbmFsIGRhdGEuIFVubGVzcyBjb250ZXh0IGlzIGRlZmluZWQsIGRpYWxvZyB3aWxsIGJlIHRoZSBjb250ZXh0LlxuICovXG5mdW5jdGlvbiBNTERpYWxvZyQkb3BlbkRpYWxvZyhvcHRpb25zLCBzdWJzY3JpYmVyLCBpbml0aWFsaXplKSB7XG4gICAgdmFyIGRpYWxvZyA9IE1MRGlhbG9nLmNyZWF0ZURpYWxvZyhvcHRpb25zLCBpbml0aWFsaXplKTtcbiAgICBkaWFsb2cub3BlbkRpYWxvZyhzdWJzY3JpYmVyKTtcbiAgICByZXR1cm4gZGlhbG9nO1xufVxuXG5cblxuZnVuY3Rpb24gX3RvZ2dsZURpYWxvZyhkb1Nob3cpIHtcbiAgICBkb1Nob3cgPSB0eXBlb2YgZG9TaG93ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgPyAhIHRoaXMuX2RpYWxvZy52aXNpYmxlXG4gICAgICAgICAgICAgICAgOiAhISBkb1Nob3c7XG5cbiAgICB2YXIgYWRkUmVtb3ZlID0gZG9TaG93ID8gJ2FkZCcgOiAncmVtb3ZlJ1xuICAgICAgICAsIGFwcGVuZFJlbW92ZSA9IGRvU2hvdyA/ICdhcHBlbmRDaGlsZCcgOiAncmVtb3ZlQ2hpbGQnO1xuXG4gICAgdGhpcy5fZGlhbG9nLnZpc2libGUgPSBkb1Nob3c7XG5cbiAgICBpZiAoZG9TaG93ICYmICEgZGlhbG9nc0luaXRpYWxpemVkKVxuICAgICAgICBfaW5pdGlhbGl6ZURpYWxvZ3MoKTtcblxuICAgIGRvY3VtZW50LmJvZHlbYXBwZW5kUmVtb3ZlXSh0aGlzLmVsKTtcbiAgICBpZiAoYmFja2Ryb3BFbClcbiAgICAgICAgZG9jdW1lbnQuYm9keVthcHBlbmRSZW1vdmVdKGJhY2tkcm9wRWwpO1xuICAgIHRoaXMuZG9tLnRvZ2dsZShkb1Nob3cpO1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFkb1Nob3cpO1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0W2FkZFJlbW92ZV0oJ21vZGFsLW9wZW4nKTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdFthZGRSZW1vdmVdKCdpbicpO1xuXG4gICAgb3BlbmVkRGlhbG9nID0gZG9TaG93ID8gdGhpcyA6IHVuZGVmaW5lZDtcbiAgICB0aGlzLmVsW2RvU2hvdyA/ICdmb2N1cycgOiAnYmx1ciddKCk7XG59XG5cblxudmFyIGRpYWxvZ3NJbml0aWFsaXplZCwgYmFja2Ryb3BFbDtcblxuZnVuY3Rpb24gX2luaXRpYWxpemVEaWFsb2dzKCkge1xuICAgIGJhY2tkcm9wRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBiYWNrZHJvcEVsLmNsYXNzTmFtZSA9ICdtb2RhbC1iYWNrZHJvcCBmYWRlIGluJztcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX29uS2V5RG93bik7XG4gICAgZGlhbG9nc0luaXRpYWxpemVkID0gdHJ1ZTtcbn1cblxuXG52YXIgb3BlbmVkRGlhbG9nO1xuXG4vKipcbiAqIE9wZW5zIGRpYWxvZyBpbnN0YW5jZS5cbiAqIFN1YnNjcmliZXIgb2JqZWN0IHNob3VsZCBoYXZlIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgc3Vic2NyaWJlciBmb3IgdGhlIE1lc3NlbmdlciAoYWx0aG91Z2ggTWVzc2VuZ2VyIGlzIG5vdCB1c2VkKSAtIGVpdGhlciBmdW5jdGlvbiBvciBvYmplY3Qgd2l0aCBzdWJzY3JpYmVyIGFuZCBjb250ZXh0IHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IHN1YnNjcmliZXIgc3Vic2NyaWJlciBvYmplY3RcbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckb3BlbkRpYWxvZyhzdWJzY3JpYmVyKSB7XG4gICAgY2hlY2soc3Vic2NyaWJlciwgTWF0Y2guT25lT2YoRnVuY3Rpb24sIHsgc3Vic2NyaWJlcjogRnVuY3Rpb24sIGNvbnRleHQ6IE1hdGNoLkFueSB9KSk7XG5cbiAgICBpZiAob3BlbmVkRGlhbG9nKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLndhcm4oJ01MRGlhbG9nIG9wZW5EaWFsb2c6IGNhblxcJ3Qgb3BlbiBkaWFsb2csIGFub3RoZXIgZGlhbG9nIGlzIGFscmVhZHkgb3BlbicpO1xuXG4gICAgdGhpcy5fZGlhbG9nLnN1YnNjcmliZXIgPSBzdWJzY3JpYmVyO1xuICAgIF90b2dnbGVEaWFsb2cuY2FsbCh0aGlzLCB0cnVlKTtcbn1cblxuXG4vKipcbiAqIENsb3NlcyBkaWFsb2cgaW5zdGFuY2UsIG9wdGlvbmFsbHkgcGFzc2luZyByZXN1bHQgYW5kIGRhdGEgdG8gZGlhbG9nIHN1YnNjcmliZXIuXG4gKiBJZiBubyByZXN1bHQgaXMgcGFzc2VkLCAnY2xvc2VkJyB3aWxsIGJlIHBhc3NlZCB0byBzdWJzY3JpYmVyLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByZXN1bHQgZGlhbG9nIHJlc3VsdCwgcGFzc2VkIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIgdG8gc3ViY3NyaWJlclxuICogQHBhcmFtIHtBbnl9IGRhdGEgb3B0aW9uYWwgZGlhbG9nIGRhdGEsIHBhc3NlZCBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBzdWJzY3JpYmVyXG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJGNsb3NlRGlhbG9nKHJlc3VsdCwgZGF0YSkge1xuICAgIGlmICghIG9wZW5lZERpYWxvZylcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTERpYWxvZyBjbG9zZURpYWxvZzogY2FuXFwndCBjbG9zZSBkaWFsb2csIG5vIGRpYWxvZyBvcGVuJyk7XG5cbiAgICByZXN1bHQgPSByZXN1bHQgfHwgJ2Nsb3NlZCc7XG5cbiAgICBfdG9nZ2xlRGlhbG9nLmNhbGwodGhpcywgZmFsc2UpO1xuICAgIF9kaXNwYXRjaFJlc3VsdC5jYWxsKHRoaXMsIHJlc3VsdCwgZGF0YSk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGN1cnJlbnRseSBvcGVuZWQgZGlhbG9nXG4gKlxuICogQHJldHVybiB7TUxEaWFsb2d9XG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJCRnZXRPcGVuZWREaWFsb2coKSB7XG4gICAgcmV0dXJuIG9wZW5lZERpYWxvZztcbn1cblxuXG5mdW5jdGlvbiBNTERpYWxvZyRkZXN0cm95KCkge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfb25LZXlEb3duKTtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXJcbiAgICAsIERPTUxpc3RlbmVycyA9IG1pbG8udXRpbC5kb21MaXN0ZW5lcnM7XG5cblxudmFyIFRPR0dMRV9DU1NfQ0xBU1MgPSAnZHJvcGRvd24tdG9nZ2xlJ1xuICAgICwgTUVOVV9DU1NfQ0xBU1MgPSAnZHJvcGRvd24tbWVudSc7XG5cblxudmFyIE1MRHJvcGRvd24gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRHJvcGRvd24nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogWydtbC1icy1kcm9wZG93bicsICdkcm9wZG93biddXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEcm9wZG93bik7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEcm9wZG93bjtcblxuXG5fLmV4dGVuZFByb3RvKE1MRHJvcGRvd24sIHtcbiAgICBzdGFydDogTUxEcm9wZG93biRzdGFydCxcbiAgICBkZXN0cm95OiBNTERyb3Bkb3duJGRlc3Ryb3ksXG4gICAgdG9nZ2xlTWVudTogTUxEcm9wZG93biR0b2dnbGVNZW51LFxuICAgIHNob3dNZW51OiBNTERyb3Bkb3duJHNob3dNZW51LFxuICAgIGhpZGVNZW51OiBNTERyb3Bkb3duJGhpZGVNZW51XG59KTtcblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJHN0YXJ0KCkge1xuICAgIHZhciB0b2dnbGVFbCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLicgKyBUT0dHTEVfQ1NTX0NMQVNTKVxuICAgICAgICAsIG1lbnVFbCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLicgKyBNRU5VX0NTU19DTEFTUyk7XG5cbiAgICBpZiAoISAodG9nZ2xlRWwgJiYgbWVudUVsKSlcbiAgICAgICAgcmV0dXJuIGxvZ2dlci5lcnJvcignTUxEcm9wZG93bjonLCBUT0dHTEVfQ1NTX0NMQVNTLCAnb3InLCBNRU5VX0NTU19DTEFTUywgJ2lzblxcJ3QgZm91bmQnKTtcblxuICAgIHZhciBkb2MgPSB3aW5kb3cuZG9jdW1lbnRcbiAgICAgICAgLCBjbGlja0hhbmRsZXIgPSB0aGlzLnRvZ2dsZU1lbnUuYmluZCh0aGlzLCB1bmRlZmluZWQpO1xuXG4gICAgdmFyIGxpc3RlbmVycyA9IG5ldyBET01MaXN0ZW5lcnM7XG4gICAgdGhpcy5fZHJvcGRvd24gPSB7XG4gICAgICAgIG1lbnU6IG1lbnVFbCxcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgIGxpc3RlbmVyczogbGlzdGVuZXJzXG4gICAgfTtcbiAgICB0aGlzLmhpZGVNZW51KCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgbGlzdGVuZXJzLmFkZCh0b2dnbGVFbCwgJ2NsaWNrJywgY2xpY2tIYW5kbGVyKTtcbiAgICAvL21heWJlIG9ubHkgYWRkIHRoaXMgZXZlbnRzIGlmIGlzIG9wZW4/XG4gICAgbGlzdGVuZXJzLmFkZChkb2MsICdtb3VzZW91dCcsIG9uRG9jT3V0KTtcbiAgICBsaXN0ZW5lcnMuYWRkKGRvYywgJ2NsaWNrJywgb25DbGljayk7XG5cblxuICAgIGZ1bmN0aW9uIG9uRG9jT3V0KGV2ZW50KSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXRcbiAgICAgICAgICAgICwgcmVsYXRlZFRhcmdldCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXRcbiAgICAgICAgICAgICwgbGlzdGVuZXJzID0gc2VsZi5fZHJvcGRvd24ubGlzdGVuZXJzO1xuXG4gICAgICAgIGlmIChpc0lmcmFtZSh0YXJnZXQpKVxuICAgICAgICAgICAgbGlzdGVuZXJzLnJlbW92ZSh0YXJnZXQuY29udGVudFdpbmRvdy5kb2N1bWVudCwgJ2NsaWNrJywgb25DbGljayk7XG5cbiAgICAgICAgaWYgKGlzSWZyYW1lKHJlbGF0ZWRUYXJnZXQpKVxuICAgICAgICAgICAgbGlzdGVuZXJzLmFkZChyZWxhdGVkVGFyZ2V0LmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQsICdjbGljaycsIG9uQ2xpY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uQ2xpY2soZXZlbnQpIHtcbiAgICAgICAgaWYgKCFzZWxmLmVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpXG4gICAgICAgICAgICBzZWxmLmhpZGVNZW51KCk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGlzSWZyYW1lKGVsKSB7XG4gICAgcmV0dXJuIGVsICYmIGVsLnRhZ05hbWUgPT0gJ0lGUkFNRSc7XG59XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biRkZXN0cm95KCkge1xuICAgIHRoaXMuX2Ryb3Bkb3duLmxpc3RlbmVycy5yZW1vdmVBbGwoKTtcbiAgICBkZWxldGUgdGhpcy5fZHJvcGRvd247XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biRzaG93TWVudSgpIHtcbiAgICB0aGlzLnRvZ2dsZU1lbnUodHJ1ZSk7XG59XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biRoaWRlTWVudSgpIHtcbiAgICB0aGlzLnRvZ2dsZU1lbnUoZmFsc2UpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kdG9nZ2xlTWVudShkb1Nob3cpIHtcbiAgICBkb1Nob3cgPSB0eXBlb2YgZG9TaG93ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgPyAhIHRoaXMuX2Ryb3Bkb3duLnZpc2libGVcbiAgICAgICAgICAgICAgICA6ICEhIGRvU2hvdztcblxuICAgIHRoaXMuX2Ryb3Bkb3duLnZpc2libGUgPSBkb1Nob3c7XG5cbiAgICB2YXIgbWVudSA9IHRoaXMuX2Ryb3Bkb3duLm1lbnU7XG4gICAgbWVudS5zdHlsZS5kaXNwbGF5ID0gZG9TaG93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmxvY2snXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnbm9uZSc7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb3JtR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9nZW5lcmF0b3InKVxuICAgICwgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgY2hlY2sgPSBtaWxvLnV0aWwuY2hlY2tcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXJcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKVxuICAgICwgYXN5bmMgPSByZXF1aXJlKCdhc3luYycpO1xuXG5cbnZhciBGT1JNX1ZBTElEQVRJT05fRkFJTEVEX0NTU19DTEFTUyA9ICdoYXMtZXJyb3InO1xuXG4vKipcbiAqIEEgY29tcG9uZW50IGNsYXNzIGZvciBnZW5lcmF0aW5nIGZvcm1zIGZyb20gc2NoZW1hXG4gKiBUbyBjcmVhdGUgZm9ybSBjbGFzcyBtZXRob2QgW2NyZWF0ZUZvcm1dKCNNTEZvcm0kJGNyZWF0ZUZvcm0pIHNob3VsZCBiZSB1c2VkLlxuICogRm9ybSBzY2hlbWEgaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICogYGBgXG4gKiB2YXIgc2NoZW1hID0ge1xuICogICAgIGl0ZW1zOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICAgIHR5cGU6ICc8dHlwZSBvZiB1aSBjb250cm9sPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FuIGJlIGdyb3VwLCBzZWxlY3QsIGlucHV0LCBidXR0b24sIHJhZGlvLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh5cGVybGluaywgY2hlY2tib3gsIGxpc3QsIHRpbWUsIGRhdGVcbiAqICAgICAgICAgICAgIGNvbXBOYW1lOiAnPGNvbXBvbmVudCBuYW1lPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgbmFtZSBvZiBjb21wb25lbnQsIHNob3VsZCBiZSB1bmlxdWUgd2l0aGluIHRoZSBmb3JtXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKG9yIGZvcm0gZ3JvdXApLCBvbmx5IG5lZWRzIHRvYmUgdXNlZCB3aGVuIGNvbXBvbmVudCBuZWVkcyB0byBiZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1hbmlwaWxhdGVkIGluIHNvbWUgZXZlbnQgaGFuZGxlciBhbmQgaXQgY2Fubm90IGJlIGFjY2Vzc2VkIHZpYSBtb2RlbFBhdGhcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2luZyBgbW9kZWxQYXRoQ29tcG9uZW50YCBtZXRob2RcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAod2hpY2ggaXMgYSBwcmVmZXJyZWQgd2F5IHRvIGFjY2VzcyBjb25wb25lbnRzIGluIGZvcm0pXG4gKiAgICAgICAgICAgICBsYWJlbDogJzx1aSBjb250cm9sIGxhYmVsPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgbGFiZWwsIHdpbGwgbm90IGJlIGFkZGVkIGlmIG5vdCBkZWZpbmVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3IgZW1wdHkgc3RyaW5nXG4gKiAgICAgICAgICAgICBhbHRUZXh0OiAnPGFsdCB0ZXh0IG9yIHRpdGxlPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgYWx0IHRleHQgc3RyaW5nIG9uIGJ1dHRvbnMgYW5kIGh5cGVybGlua3NcbiAqICAgICAgICAgICAgIG1vZGVsUGF0aDogJzxtb2RlbCBtYXBwaW5nPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGF0aCBpbiBtb2RlbCB3aGVyZSB0aGUgdmFsdWUgd2lsbCBiZSBzdG9yZWQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW9zdCB0eXBlcyBvZiBpdGVtcyByZXF1aXJlIHRoaXMgcHJvcGVydHksXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc29tZSBpdGVtcyBtYXkgaGF2ZSB0aGlzIHByb3BlcnR5IChidXR0b24sIGUuZy4pLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiZ3JvdXBcIiBtdXN0IE5PVCBoYXZlIHRoaXMgcHJvcGVydHkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FybmluZyB3aWxsIGJlIGxvZ2dlZCBpZiB0aGVzZSBydWxlcyBhcmUgbm90IGZvbGxvd2VkLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0ZW1zIHdpdGhvdXQgdGhpcyBwcm9wZXJ0eSB3aWxsIG5vdCBiZSBpbiBtb2RlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIChhcGFydCBmcm9tIFwiZ3JvdXAgd2hpY2ggc3ViaXRlbXMgd2lsbCBiZSBpbiBtb2RlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXkgaGF2ZSB0aGlzIHByb3BlcnR5KVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcHJvcGVydHkgYWxsb3dzIHRvIGhhdmUgZml4ZWQgZm9ybSBtb2RlbCBzdHJ1Y3R1cmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGlsZSBjaGFuZ2luZyB2aWV3IHN0cnVjdHVyZSBvZiB0aGUgZm9ybVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlZSBNb2RlbC5cbiAqICAgICAgICAgICAgIG1vZGVsUGF0dGVybjogJ21hcHBpbmcgZXh0ZW5zaW9uIHBhdHRlcm4nLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKHN0cmluZylcbiAqICAgICAgICAgICAgIG5vdEluTW9kZWw6IHRydWUsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbGxvd3MgdG8gTk9UIGluY2x1ZGUgbW9kZWxQYXRoIHdoZXJlIG90aGVyd2lzZSBpdCB3b3VsZCBiZSByZXF1aXJlZFxuICogICAgICAgICAgICAgbWVzc2FnZXM6IHsgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gc3Vic2NyaWJlIHRvIG1lc3NhZ2VzIG9uIGl0ZW0ncyBjb21wb25lbnQgZmFjZXRzXG4gKiAgICAgICAgICAgICAgICAgZXZlbnRzOiB7ICAgICAgICAgICAgICAgICAgICAvLyBmYWNldCB0byBzdWJzY3JpYmUgdG9cbiAqICAgICAgICAgICAgICAgICAgICAgJzxtZXNzYWdlMT4nOiBvbk1lc3NhZ2UxIC8vIG1lc3NhZ2UgYW5kIHN1YnNjcmliZXIgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICAgJzxtc2cyPiA8bXNnMz4nOiB7ICAgICAgIC8vIHN1YnNjcmliZSB0byAyIG1lc3NhZ2VzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyOiBvbk1lc3NhZ2UyLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCAgICAgLy8gY29udGV4dCBjYW4gYmUgYW4gb2JqZWN0IG9yIGEgc3RyaW5nOlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJmYWNldFwiOiBmYWNldCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJvd25lclwiOiBpdGVtIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJmb3JtXCI6IHRoZSBmb3JtIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJob3N0XCI6IGhvc3Qgb2JqZWN0IHBhc3NlZCB0byBjcmVhdGVGb3JtIG1ldGhvZCB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICAgICAgICAgfVxuICogICAgICAgICAgICAgfSxcbiAqICAgICAgICAgICAgIHRyYW5zbGF0ZTogeyAgICAgICAgICAvLyBvcHRpb25hbCBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9uc1xuICogICAgICAgICAgICAgICAgIGNvbnRleHQ6IE9iamVjdCAgIC8vIG9wdGlvbmFsIGNvbnRleHQgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byB0cmFuc2xhdGUgZnVuY3Rpb25zLCAnaG9zdCcgbWVhbnMgdGhlIGhvc3RPYmplY3QgcGFzc2VkIHRvIEZvcm0uY3JlYXRlRm9ybVxuICogICAgICAgICAgICAgICAgIHRvTW9kZWw6IGZ1bmMxLCAgIC8vIHRyYW5zbGF0ZXMgaXRlbSBkYXRhIGZyb20gdmlldyB0byBtb2RlbFxuICogICAgICAgICAgICAgICAgIGZyb21Nb2RlbDogZnVuYzIgIC8vIHRyYW5zbGF0ZXMgaXRlbSBkYXRhIGZyb20gbW9kZWwgdG8gdmlld1xuICogICAgICAgICAgICAgfSxcbiAqICAgICAgICAgICAgIHZhbGlkYXRlOiB7ICAgICAgICAgICAvLyBvcHRpb25hbCBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKiAgICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0ICAgLy8gb3B0aW9uYWwgY29udGV4dCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHZhbGlkYXRlIGZ1bmN0aW9ucywgJ2hvc3QnIG1lYW5zIHRoZSBob3N0T2JqZWN0IHBhc3NlZCB0byBGb3JtLmNyZWF0ZUZvcm1cbiAqICAgICAgICAgICAgICAgICB0b01vZGVsOiAgIGZ1bmMxIHwgW2Z1bmMxLCBmdW5jMiwgLi4uXSwvLyB2YWxpZGF0ZXMgaXRlbSBkYXRhIHdoZW4gaXQgaXMgY2hhbmdlZCBpbiBmb3JtXG4gKiAgICAgICAgICAgICAgICAgZnJvbU1vZGVsOiBmdW5jMiB8IFtmdW5jMywgZnVuYzQsIC4uLl0gLy8gb3Bwb3NpdGUsIGJ1dCBub3QgcmVhbGx5IHVzZWQgYW5kIGRvZXMgbm90IG1ha2UgZm9ybSBpbnZhbGlkIGlmIGl0IGZhaWxzLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbiBiZSB1c2VkIHRvIHByZXZlbnQgZGF0YSBiZWluZyBzaG93biBpbiB0aGUgZm9ybS5cbiAqICAgICAgICAgICAgIH0sICAgICAgICAgICAgICAgICAgICAvLyBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zIHNob3VsZCBhY2NlcHQgdHdvIHBhcmFtZXRlcnM6IGRhdGEgYW5kIGNhbGxiYWNrICh0aGV5IGFyZSBhc3luY2hyb25vdXMpLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdmFsaWRhdGlvbiBpcyBmaW5pc2hlZCwgY2FsbGJhY2sgc2hvdWxkIGJlIGNhbGxlZCB3aXRoIChlcnJvciwgcmVzcG9uc2UpIHBhcmFtZXRlcnMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzcG9uc2Ugc2hvdWxkIGhhdmUgcHJvcGVydGllcyB2YWxpZCAoQm9vbGVhbikgYW5kIG9wdGlvbmFsIHJlYXNvbiAoU3RyaW5nIC0gcmVhc29uIG9mIHZhbGlkYXRpb24gZmFpbHVyZSkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSE6IGF0IHRoZSBtb21lbnQsIGlmIGNhbGxiYWNrIGlzIGNhbGxlZCB3aXRoIGVycm9yIHBhcmFtZXRlciB3aGljaCBpcyBub3QgZmFsc3ksIHZhbGlkYXRpb24gd2lsbCBiZSBwYXNzZWQuXG4gKiAgICAgICAgICAgICA8aXRlbSBzcGVjaWZpYz46IHs8aXRlbSBjb25maWd1cmF0aW9uPn1cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcInNlbGVjdFwiIHN1cHBvcnRzIFwic2VsZWN0T3B0aW9uc1wiIC0gYXJyYXkgb2Ygb2JqZWN0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggcHJvcGVydGllcyBcInZhbHVlXCIgYW5kIFwibGFiZWxcIlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwicmFkaW9cIiBzdXBwb3J0cyBcInJhZGlvT3B0aW9uc1wiIHdpdGggdGhlIHNhbWUgZm9ybWF0XG4gKiAgICAgICAgICAgICBpdGVtczogW1xuICogICAgICAgICAgICAgICAgIHsgLi4uIH0gLy8sIC4uLiAtIGl0ZW1zIGluc2lkZSBcImdyb3VwXCIgb3IgXCJ3cmFwcGVyXCIgaXRlbVxuICogICAgICAgICAgICAgXVxuICogICAgICAgICB9IC8vICwgLi4uIG1vcmUgaXRlbXNcbiAqICAgICBdXG4gKiB9XG4gKi9cbnZhciBNTEZvcm0gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRm9ybScsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnY2MtbW9kdWxlLWluc3BlY3RvcidcbiAgICB9LFxuICAgIG1vZGVsOiB1bmRlZmluZWQsXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkXG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEZvcm0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRm9ybTtcblxuXG5fLmV4dGVuZChNTEZvcm0sIHtcbiAgICBjcmVhdGVGb3JtOiBNTEZvcm0kJGNyZWF0ZUZvcm0sXG4gICAgcmVnaXN0ZXJTY2hlbWFLZXk6IE1MRm9ybSQkcmVnaXN0ZXJTY2hlbWFLZXksXG4gICAgcmVnaXN0ZXJWYWxpZGF0aW9uOiBNTEZvcm0kJHJlZ2lzdGVyVmFsaWRhdGlvbixcbiAgICB2YWxpZGF0b3JSZXNwb25zZTogTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSxcbiAgICBnZW5lcmF0b3I6IGZvcm1HZW5lcmF0b3IsXG4gICAgcmVnaXN0cnk6IGZvcm1SZWdpc3RyeVxufSk7XG5cbl8uZXh0ZW5kUHJvdG8oTUxGb3JtLCB7XG4gICAgZ2V0SG9zdE9iamVjdDogTUxGb3JtJGdldEhvc3RPYmplY3QsXG4gICAgaXNWYWxpZDogTUxGb3JtJGlzVmFsaWQsXG4gICAgdmFsaWRhdGVNb2RlbDogTUxGb3JtJHZhbGlkYXRlTW9kZWwsXG4gICAgZ2V0SW52YWxpZENvbnRyb2xzOiBNTEZvcm0kZ2V0SW52YWxpZENvbnRyb2xzLFxuICAgIGdldEludmFsaWRSZWFzb25zOiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnMsXG4gICAgZ2V0SW52YWxpZFJlYXNvbnNUZXh0OiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnNUZXh0LFxuICAgIG1vZGVsUGF0aENvbXBvbmVudDogTUxGb3JtJG1vZGVsUGF0aENvbXBvbmVudCxcbiAgICBtb2RlbFBhdGhTY2hlbWE6IE1MRm9ybSRtb2RlbFBhdGhTY2hlbWEsXG4gICAgdmlld1BhdGhDb21wb25lbnQ6IE1MRm9ybSR2aWV3UGF0aENvbXBvbmVudCxcbiAgICB2aWV3UGF0aFNjaGVtYTogTUxGb3JtJHZpZXdQYXRoU2NoZW1hLFxuICAgIGdldE1vZGVsUGF0aDogTUxGb3JtJGdldE1vZGVsUGF0aCxcbiAgICBnZXRWaWV3UGF0aDogTUxGb3JtJGdldFZpZXdQYXRoLFxuICAgIGRlc3Ryb3k6IE1MRm9ybSRkZXN0cm95LFxufSk7XG5cblxudmFyIFNDSEVNQV9LRVlXT1JEUyA9IF8ub2JqZWN0KFtcbiAgICAndHlwZScsICdjb21wTmFtZScsICdsYWJlbCcsICdhbHRUZXh0JyxcbiAgICAnbW9kZWxQYXRoJywgJ21vZGVsUGF0dGVybicsICdub3RJbk1vZGVsJyxcbiAgICAnbWVzc2FnZXMnLCAndHJhbnNsYXRlJywgJ3ZhbGlkYXRlJywgJ2l0ZW1zJyxcbiAgICAnc2VsZWN0T3B0aW9ucycsICdyYWRpb09wdGlvbnMnLCAnY29tYm9PcHRpb25zJyxcbiAgICAnY29tYm9PcHRpb25zVVJMJywgJ2FkZEl0ZW1Qcm9tcHQnLCAncGxhY2VIb2xkZXInLFxuICAgICd2YWx1ZScsICdkYXRhVmFsaWRhdGlvbicsICdhc3luY0hhbmRsZXInLCAnYXV0b3Jlc2l6ZScsXG4gICAgJ21heExlbmd0aCdcbl0sIHRydWUpO1xuXG4vKipcbiAqIE1MRm9ybSBjbGFzcyBtZXRob2RcbiAqIENyZWF0ZXMgZm9ybSBmcm9tIHNjaGVtYS5cbiAqIEZvcm0gZGF0YSBjYW4gYmUgb2J0YWluZWQgZnJvbSBpdHMgTW9kZWwgKGBmb3JtLm1vZGVsYCksIHJlYWN0aXZlIGNvbm5lY3Rpb24gdG8gZm9ybSdzIG1vZGVsIGNhbiBhbHNvIGJlIHVzZWQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSBmb3JtIHNjaGVtYSwgYXMgZGVzY3JpYmVkIGFib3ZlXG4gKiBAcGFyYW0ge09iamVjdH0gaG9zdE9iamVjdCBmb3JtIGhvc3Qgb2JqZWN0LCB1c2VkIHRvIGRlZmluZSBhcyBtZXNzYWdlIHN1YnNjcmliZXIgY29udGV4dCBpbiBzY2hlbWEgLSBieSBjb252ZW50aW9uIHRoZSBjb250ZXh0IHNob3VsZCBiZSBkZWZpbmVkIGFzIFwiaG9zdFwiXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybURhdGEgZGF0YSB0byBpbml0aWFsaXplIHRoZSBmb3JtIHdpdGhcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZW1wbGF0ZSBvcHRpb25hbCBmb3JtIHRlbXBsYXRlLCB3aWxsIGJlIHVzZWQgaW5zdGVhZCBvZiBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBmcm9tIHNjaGVtYS4gTm90IHJlY29tbWVuZGVkIHRvIHVzZSwgYXMgaXQgd2lsbCBoYXZlIHRvIGJlIG1haW50YWluZWQgdG8gYmUgY29uc2lzdGVudCB3aXRoIHNjaGVtYSBmb3IgYmluZGluZ3MuXG4gKiBAcmV0dXJuIHtNTEZvcm19XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSQkY3JlYXRlRm9ybShzY2hlbWEsIGhvc3RPYmplY3QsIGZvcm1EYXRhLCB0ZW1wbGF0ZSkge1xuICAgIHZhciBmb3JtID0gX2NyZWF0ZUZvcm1Db21wb25lbnQoKTtcbiAgICBfLmRlZmluZVByb3BlcnR5KGZvcm0sICdfaG9zdE9iamVjdCcsIGhvc3RPYmplY3QpO1xuICAgIHZhciBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnM7XG4gICAgX3Byb2Nlc3NGb3JtU2NoZW1hKCk7XG4gICAgX2Nvbm5lY3RGb3JtRGF0YVRvTW9kZWwoKTtcbiAgICBfbWFuYWdlRm9ybVZhbGlkYXRpb24oKTtcblxuICAgIC8vIHNldCBvcmlnaW5hbCBmb3JtIGRhdGFcbiAgICBpZiAoZm9ybURhdGEpXG4gICAgICAgIGZvcm0ubW9kZWwubS5zZXQoZm9ybURhdGEpO1xuXG4gICAgcmV0dXJuIGZvcm07XG5cblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVGb3JtQ29tcG9uZW50KCkge1xuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlIHx8IGZvcm1HZW5lcmF0b3Ioc2NoZW1hKTtcbiAgICAgICAgcmV0dXJuIE1MRm9ybS5jcmVhdGVPbkVsZW1lbnQodW5kZWZpbmVkLCB0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Byb2Nlc3NGb3JtU2NoZW1hKCkge1xuICAgICAgICAvLyBtb2RlbCBwYXRocyB0cmFuc2xhdGlvbiBydWxlc1xuICAgICAgICBmb3JtVmlld1BhdGhzID0ge307XG4gICAgICAgIGZvcm1Nb2RlbFBhdGhzID0ge307XG4gICAgICAgIG1vZGVsUGF0aFRyYW5zbGF0aW9ucyA9IHt9O1xuICAgICAgICBkYXRhVHJhbnNsYXRpb25zID0geyBmcm9tTW9kZWw6IHt9LCB0b01vZGVsOiB7fSB9O1xuICAgICAgICBkYXRhVmFsaWRhdGlvbnMgPSB7IGZyb21Nb2RlbDoge30sIHRvTW9kZWw6IHt9IH07XG5cbiAgICAgICAgLy8gcHJvY2VzcyBmb3JtIHNjaGVtYVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvY2Vzc1NjaGVtYS5jYWxsKGZvcm0sIGZvcm0sIHNjaGVtYSwgJycsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZm9ybVZpZXdQYXRocyBiZWZvcmUgZXJyb3I6ICcsIGZvcm1WaWV3UGF0aHMpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdmb3JtTW9kZWxQYXRocyBiZWZvcmUgZXJyb3I6ICcsIGZvcm1Nb2RlbFBhdGhzKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnbW9kZWxQYXRoVHJhbnNsYXRpb25zIGJlZm9yZSBlcnJvcjogJywgbW9kZWxQYXRoVHJhbnNsYXRpb25zKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZGF0YVRyYW5zbGF0aW9ucyBiZWZvcmUgZXJyb3I6ICcsIGRhdGFUcmFuc2xhdGlvbnMpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdkYXRhVmFsaWRhdGlvbnMgYmVmb3JlIGVycm9yOiAnLCBkYXRhVmFsaWRhdGlvbnMpO1xuICAgICAgICAgICAgdGhyb3cgKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9ybS5fZm9ybVZpZXdQYXRocyA9IGZvcm1WaWV3UGF0aHM7XG4gICAgICAgIGZvcm0uX2Zvcm1Nb2RlbFBhdGhzID0gZm9ybU1vZGVsUGF0aHM7XG4gICAgICAgIGZvcm0uX21vZGVsUGF0aFRyYW5zbGF0aW9ucyA9IG1vZGVsUGF0aFRyYW5zbGF0aW9ucztcbiAgICAgICAgZm9ybS5fZGF0YVRyYW5zbGF0aW9ucyA9IGRhdGFUcmFuc2xhdGlvbnM7XG4gICAgICAgIGZvcm0uX2RhdGFWYWxpZGF0aW9ucyA9IGRhdGFWYWxpZGF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY29ubmVjdEZvcm1EYXRhVG9Nb2RlbCgpIHtcbiAgICAgICAgLy8gY29ubmVjdCBmb3JtIHZpZXcgdG8gZm9ybSBtb2RlbCB1c2luZyB0cmFuc2xhdGlvbiBydWxlcyBmcm9tIG1vZGVsUGF0aCBwcm9wZXJ0aWVzIG9mIGZvcm0gaXRlbXNcbiAgICAgICAgZm9ybS5fY29ubmVjdG9yID0gbWlsby5taW5kZXIoZm9ybS5kYXRhLCAnPC0+JywgZm9ybS5tb2RlbCwgeyAvLyBjb25uZWN0aW9uIGRlcHRoIGlzIGRlZmluZWQgb24gZmllbGQgYnkgZmllbGQgYmFzaXMgYnkgcGF0aFRyYW5zbGF0aW9uXG4gICAgICAgICAgICBwYXRoVHJhbnNsYXRpb246IG1vZGVsUGF0aFRyYW5zbGF0aW9ucyxcbiAgICAgICAgICAgIGRhdGFUcmFuc2xhdGlvbjoge1xuICAgICAgICAgICAgICAgICc8LSc6IGRhdGFUcmFuc2xhdGlvbnMuZnJvbU1vZGVsLFxuICAgICAgICAgICAgICAgICctPic6IGRhdGFUcmFuc2xhdGlvbnMudG9Nb2RlbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGFWYWxpZGF0aW9uOiB7XG4gICAgICAgICAgICAgICAgJzwtJzogZGF0YVZhbGlkYXRpb25zLmZyb21Nb2RlbCxcbiAgICAgICAgICAgICAgICAnLT4nOiBkYXRhVmFsaWRhdGlvbnMudG9Nb2RlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFuYWdlRm9ybVZhbGlkYXRpb24oKSB7XG4gICAgICAgIGZvcm0uX2ludmFsaWRGb3JtQ29udHJvbHMgPSB7fTtcblxuICAgICAgICBmb3JtLm1vZGVsLm9uKCd2YWxpZGF0ZWQnLCBjcmVhdGVPblZhbGlkYXRlZCh0cnVlKSk7XG4gICAgICAgIGZvcm0uZGF0YS5vbigndmFsaWRhdGVkJywgY3JlYXRlT25WYWxpZGF0ZWQoZmFsc2UpKTtcblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVPblZhbGlkYXRlZChpc0Zyb21Nb2RlbCkge1xuICAgICAgICAgICAgdmFyIHBhdGhDb21wTWV0aG9kID0gaXNGcm9tTW9kZWwgPyAnbW9kZWxQYXRoQ29tcG9uZW50JzogJ3ZpZXdQYXRoQ29tcG9uZW50J1xuICAgICAgICAgICAgICAgICwgcGF0aFNjaGVtYU1ldGhvZCA9IGlzRnJvbU1vZGVsID8gJ21vZGVsUGF0aFNjaGVtYSc6ICd2aWV3UGF0aFNjaGVtYSc7XG5cbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihtc2csIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGZvcm1bcGF0aENvbXBNZXRob2RdKHJlc3BvbnNlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICwgc2NoZW1hID0gZm9ybVtwYXRoU2NoZW1hTWV0aG9kXShyZXNwb25zZS5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAsIGxhYmVsID0gc2NoZW1hLmxhYmVsXG4gICAgICAgICAgICAgICAgICAgICwgbW9kZWxQYXRoID0gc2NoZW1hLm1vZGVsUGF0aDtcblxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudEVsID0gY29tcG9uZW50LmVsLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsLmNsYXNzTGlzdC50b2dnbGUoRk9STV9WQUxJREFUSU9OX0ZBSUxFRF9DU1NfQ0xBU1MsICEgcmVzcG9uc2UudmFsaWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWFzb247XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS52YWxpZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBmb3JtLl9pbnZhbGlkRm9ybUNvbnRyb2xzW21vZGVsUGF0aF07XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFzb246IHJlc3BvbnNlLnJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFzb25Db2RlOiByZXNwb25zZS5yZWFzb25Db2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5faW52YWxpZEZvcm1Db250cm9sc1ttb2RlbFBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBfLmNsb25lKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRnJvbU1vZGVsKSBkYXRhLnBhdGggPSBmb3JtLmdldE1vZGVsUGF0aChkYXRhLnBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucmVhc29uID0gcmVhc29uOyAvLyBhIGJpdCBoYWNreSwgcmVwbGFjaW5nIHN0cmluZyB3aXRoIG9iamVjdCBjcmVhdGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5yZWFzb25Db2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvcm0ucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRpb24nLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdGb3JtOiBjb21wb25lbnQgZm9yIHBhdGggJyArIHJlc3BvbnNlLnBhdGggKyAnIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vKipcbiAqIEN1c3RvbSBzY2hlbWEga2V5d29yZHNcbiAqL1xudmFyIHNjaGVtYUtleXdvcmRzUmVnaXN0cnkgPSB7fTtcbmZ1bmN0aW9uIE1MRm9ybSQkcmVnaXN0ZXJTY2hlbWFLZXkoa2V5d29yZCwgcHJvY2Vzc0tleXdvcmRGdW5jLCByZXBsYWNlS2V5d29yZCkge1xuICAgIGlmIChTQ0hFTUFfS0VZV09SRFNba2V5d29yZF0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5d29yZCcsIGtleXdvcmQsICdpcyB1c2VkIGJ5IE1MRm9ybSBjbGFzcyBvciBvbmUgb2YgcHJlLXJlZ2lzdGVyZWQgZm9ybSBpdGVtcyBhbmQgY2Fubm90IGJlIG92ZXJyaWRkZW4nKTtcblxuICAgIGlmICghcmVwbGFjZUtleXdvcmQgJiYgc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXl3b3JkJywga2V5d29yZCwgJ2lzIGFscmVhZHkgcmVnaXN0ZXJlZC4gUGFzcyB0cnVlIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXIgdG8gcmVwbGFjZSBpdCcpO1xuXG4gICAgc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXSA9IHByb2Nlc3NLZXl3b3JkRnVuYztcbn1cblxuXG4vKipcbiAqIFByZWRlZmluZWQgZm9ybSB2YWxpZGF0aW9uIGZ1bmN0aW9uc1xuICovXG52YXIgdmFsaWRhdGlvbkZ1bmN0aW9ucyA9IHtcbiAgICAncmVxdWlyZWQnOiB2YWxpZGF0ZVJlcXVpcmVkXG59O1xuZnVuY3Rpb24gTUxGb3JtJCRyZWdpc3RlclZhbGlkYXRpb24obmFtZSwgZnVuYywgcmVwbGFjZUZ1bmMpIHtcbiAgICBpZiAoIXJlcGxhY2VGdW5jICYmIHZhbGlkYXRpb25GdW5jdGlvbnNbbmFtZV0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsaWRhdGluZyBmdW5jdGlvbicsIG5hbWUsICdpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuIFBhc3MgdHJ1ZSBhcyB0aGUgdGhpcmQgcGFyYW1ldGVyIHRvIHJlcGxhY2UgaXQnKTtcblxuICAgIHZhbGlkYXRpb25GdW5jdGlvbnNbbmFtZV0gPSBmdW5jO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZm9ybSBob3N0IG9iamVjdC5cbiAqIEByZXR1cm4ge0NvbXBvbmVudH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldEhvc3RPYmplY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hvc3RPYmplY3Q7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGN1cnJlbnQgdmFsaWRhdGlvbiBzdGF0dXMgb2YgdGhlIGZvcm1cbiAqIFdpbGwgbm90IHZhbGlkYXRlIGZpZWxkcyB0aGF0IHdlcmUgbmV2ZXIgY2hhbmdlZCBpbiB2aWV3XG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGlzVmFsaWQoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2ludmFsaWRGb3JtQ29udHJvbHMpLmxlbmd0aCA9PSAwO1xufVxuXG5cbi8qKlxuICogUnVucyAndG9Nb2RlbCcgdmFsaWRhdG9ycyBkZWZpbmVkIGluIHNjaGVtYSBvbiB0aGUgY3VycmVudCBtb2RlbCBvZiB0aGUgZm9ybVxuICogY2FuIGJlIHVzZWQgdG8gbWFyayBhcyBpbnZhaWQgYWxsIHJlcXVpcmVkIGZpZWxkcyBvciB0byBleHBsaWNpdGVseSB2YWxpZGF0ZVxuICogZm9ybSB3aGVuIGl0IGlzIHNhdmVkLiBSZXR1cm5zIHZhbGlkYXRpb24gc3RhdGUgb2YgdGhlIGZvcm0gdmlhIGNhbGxiYWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gTUxGb3JtJHZhbGlkYXRlTW9kZWwoY2FsbGJhY2spIHtcbiAgICB2YXIgdmFsaWRhdGlvbnMgPSBbXVxuICAgICAgICAsIHNlbGYgPSB0aGlzO1xuXG4gICAgXy5lYWNoS2V5KHRoaXMuX2RhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwsIGZ1bmN0aW9uKHZhbGlkYXRvcnMsIG1vZGVsUGF0aCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMubW9kZWwubShtb2RlbFBhdGgpLmdldCgpO1xuICAgICAgICB2YWxpZGF0b3JzID0gQXJyYXkuaXNBcnJheSh2YWxpZGF0b3JzKSA/IHZhbGlkYXRvcnMgOiBbdmFsaWRhdG9yc107XG5cbiAgICAgICAgaWYgKHZhbGlkYXRvcnMgJiYgdmFsaWRhdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIG1vZGVsUGF0aDogbW9kZWxQYXRoLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuXG4gICAgdmFyIGFsbFZhbGlkID0gdHJ1ZTtcbiAgICBhc3luYy5lYWNoKHZhbGlkYXRpb25zLFxuICAgICAgICBmdW5jdGlvbih2YWxpZGF0aW9uLCBuZXh0VmFsaWRhdGlvbikge1xuICAgICAgICAgICAgdmFyIGxhc3RSZXNwb25zZTtcbiAgICAgICAgICAgIGFzeW5jLmV2ZXJ5KHZhbGlkYXRpb24udmFsaWRhdG9ycyxcbiAgICAgICAgICAgICAgICAvLyBjYWxsIHZhbGlkYXRvclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHZhbGlkYXRvciwgbmV4dCkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3IodmFsaWRhdGlvbi5kYXRhLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0UmVzcG9uc2UgPSByZXNwb25zZSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQobGFzdFJlc3BvbnNlLnZhbGlkIHx8IGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBwb3N0IHZhbGlkYXRpb24gcmVzdWx0IG9mIGl0ZW0gdG8gZm9ybVxuICAgICAgICAgICAgZnVuY3Rpb24odmFsaWQpIHtcbiAgICAgICAgICAgICAgICBsYXN0UmVzcG9uc2UucGF0aCA9IHZhbGlkYXRpb24ubW9kZWxQYXRoO1xuICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZS52YWxpZCA9IHZhbGlkO1xuICAgICAgICAgICAgICAgIHNlbGYubW9kZWwucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRlZCcsIGxhc3RSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZCkgYWxsVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBuZXh0VmFsaWRhdGlvbihudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgIC8vIHBvc3QgZm9ybSB2YWxpZGF0aW9uIHJlc3VsdFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKCd2YWxpZGF0aW9uY29tcGxldGVkJywgeyB2YWxpZDogYWxsVmFsaWQgfSk7XG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGFsbFZhbGlkKTtcbiAgICB9KTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgbWFwIG9mIGludmFsaWQgY29udHJvbHMgYW5kIHJlYXNvbnMgKHZpZXcgcGF0aHMgYXJlIGtleXMpXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SW52YWxpZENvbnRyb2xzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbnZhbGlkRm9ybUNvbnRyb2xzO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3RzIHdpdGggYWxsIHJlYXNvbnMgZm9yIHRoZSBmb3JtIGJlaW5nIGludmFsaWRcbiAqXG4gKiBAcmV0dXJuIHtBcnJheVtPYmplY3RdfVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnMoKSB7XG4gICAgdmFyIGludmFsaWRDb250cm9scyA9IHRoaXMuZ2V0SW52YWxpZENvbnRyb2xzKCk7XG4gICAgdmFyIHJlYXNvbnMgPSBfLnJlZHVjZUtleXMoaW52YWxpZENvbnRyb2xzLFxuICAgICAgICBmdW5jdGlvbihtZW1vLCBpbnZhbGlkQ29udHJvbCwgY29tcE5hbWUpIHtcbiAgICAgICAgICAgIG1lbW8ucHVzaChpbnZhbGlkQ29udHJvbC5yZWFzb24pO1xuICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgIH0sIFtdLCB0aGlzKTtcbiAgICByZXR1cm4gcmVhc29ucztcbn1cblxuXG4vKipcbiAqIFJldHVybnMgYSBtdWx0aWxpbmUgc3RyaW5nIHdpdGggYWxsIHJlYXNvbnMgZm9yIHRoZSBmb3JtIGJlaW5nIGludmFsaWRcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRJbnZhbGlkUmVhc29uc1RleHQoKSB7XG4gICAgdmFyIHJlYXNvbnMgPSB0aGlzLmdldEludmFsaWRSZWFzb25zKCk7XG4gICAgcmV0dXJuIHJlYXNvbnMucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIHJlYXNvbikge1xuICAgICAgICByZXR1cm4gbWVtbyArIChyZWFzb24ubGFiZWwgfHwgJycpICsgJyAtICcgKyByZWFzb24ucmVhc29uICsgJ1xcbic7XG4gICAgfSwgJycpO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBjb21wb25lbnQgZm9yIGEgZ2l2ZW4gbW9kZWxQYXRoXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1vZGVsUGF0aFxuICogQHJldHVybiB7Q29tcG9uZW50fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kbW9kZWxQYXRoQ29tcG9uZW50KG1vZGVsUGF0aCkge1xuICAgIHZhciBtb2RlbFBhdGhPYmogPSB0aGlzLl9mb3JtTW9kZWxQYXRoc1ttb2RlbFBhdGhdO1xuICAgIHJldHVybiBtb2RlbFBhdGhPYmogJiYgbW9kZWxQYXRoT2JqLmNvbXBvbmVudDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgZm9ybSBzY2hlbWEgZm9yIGEgZ2l2ZW4gbW9kZWxQYXRoXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1vZGVsUGF0aFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kbW9kZWxQYXRoU2NoZW1hKG1vZGVsUGF0aCkge1xuICAgIHZhciBtb2RlbFBhdGhPYmogPSB0aGlzLl9mb3JtTW9kZWxQYXRoc1ttb2RlbFBhdGhdO1xuICAgIHJldHVybiBtb2RlbFBhdGhPYmogJiYgbW9kZWxQYXRoT2JqLnNjaGVtYTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgY29tcG9uZW50IGZvciBhIGdpdmVuIHZpZXcgcGF0aCAocGF0aCBhcyBkZWZpbmVkIGluIERhdGEgZmFjZXQpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZpZXdQYXRoXG4gKiBAcmV0dXJuIHtDb21wb25lbnR9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSR2aWV3UGF0aENvbXBvbmVudCh2aWV3UGF0aCkge1xuICAgIHZhciB2aWV3UGF0aE9iaiA9IHRoaXMuX2Zvcm1WaWV3UGF0aHNbdmlld1BhdGhdO1xuICAgIHJldHVybiB2aWV3UGF0aE9iaiAmJiB2aWV3UGF0aE9iai5jb21wb25lbnQ7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGZvcm0gc2NoZW1hIGZvciBhIGdpdmVuIHZpZXcgcGF0aCBpdGVtIChwYXRoIGFzIGRlZmluZWQgaW4gRGF0YSBmYWNldClcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGhcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJHZpZXdQYXRoU2NoZW1hKHZpZXdQYXRoKSB7XG4gICAgdmFyIHZpZXdQYXRoT2JqID0gdGhpcy5fZm9ybVZpZXdQYXRoc1t2aWV3UGF0aF07XG4gICAgcmV0dXJuIHZpZXdQYXRoT2JqICYmIHZpZXdQYXRoT2JqLnNjaGVtYTtcbn1cblxuXG4vKipcbiAqIENvbnZlcnRzIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50IGluIHRoZSBmb3JtIHRvIHRoZSBtb2RlbCBwYXRoIG9mIHRoZSBjb25uZWN0ZWQgZGF0YVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2aWV3UGF0aCB2aWV3IHBhdGggb2YgdGhlIGNvbXBvbmVudFxuICogQHJldHVybiB7c3RyaW5nfSBtb2RlbCBwYXRoIG9mIGNvbm5lY3RlZCBkYXRhXG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRNb2RlbFBhdGgodmlld1BhdGgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWxQYXRoVHJhbnNsYXRpb25zW3ZpZXdQYXRoXTtcbn1cblxuXG4vKipcbiAqIENvbnZlcnRzIG1vZGVsIHBhdGggb2YgdGhlIGNvbm5lY3RlZCBkYXRhIHRvIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50IGluIHRoZSBmb3JtXG4gKiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbFBhdGggbW9kZWwgcGF0aCBvZiBjb25uZWN0ZWQgZGF0YVxuICogQHJldHVybiB7c3RyaW5nfSB2aWV3IHBhdGggb2YgdGhlIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0Vmlld1BhdGgobW9kZWxQYXRoKSB7XG4gICAgcmV0dXJuIF8uZmluZEtleSh0aGlzLl9tb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGZ1bmN0aW9uKG1QYXRoLCB2UGF0aCkge1xuICAgICAgICByZXR1cm4gbVBhdGggPT0gbW9kZWxQYXRoO1xuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIE1MRm9ybSRkZXN0cm95KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciAmJiBtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKHRoaXMuX2Nvbm5lY3Rvcik7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbn1cblxuXG4vKipcbiAqIFNlZSBpdGVtX3R5cGVzLmpzIGZvciBpdGVtIGNsYXNzZXMgYW5kIHRlbXBsYXRlc1xuICogTWFwIG9mIGl0ZW1zIHR5cGVzIHRvIGl0ZW1zIGNvbXBvbmVudHMgY2xhc3Nlc1xuICogVUkgY29tcG9uZW50cyBhcmUgZGVmaW5lZCBpbiBgbWlsb2BcbiAqL1xuXG5cbi8vIHZhciBfaXRlbXNTY2hlbWFSdWxlcyA9IF8ubWFwS2V5cyhpdGVtVHlwZXMsIGZ1bmN0aW9uKGNsYXNzTmFtZSwgaXRlbVR5cGUpIHtcbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICAvLyBDb21wQ2xhc3M6IGNvbXBvbmVudHNSZWdpc3RyeS5nZXQoY2xhc3NOYW1lKSxcbi8vICAgICAgICAgZnVuYzogaXRlbXNGdW5jdGlvbnNbaXRlbVR5cGVdIHx8IGRvTm90aGluZyxcbi8vICAgICAgICAgbW9kZWxQYXRoUnVsZTogbW9kZWxQYXRoUnVsZXNbaXRlbVR5cGVdIHx8ICdyZXF1aXJlZCdcbi8vICAgICB9O1xuLy8gfSk7XG5cbmZ1bmN0aW9uIGRvTm90aGluZygpIHt9XG5cblxuLyoqXG4gKiBQcm9jZXNzZXMgZm9ybSBzY2hlbWEgdG8gc3Vic2NyaWJlIGZvciBtZXNzYWdlcyBhcyBkZWZpbmVkIGluIHNjaGVtYS4gUGVyZm9ybXMgc3BlY2lhbCBwcm9jZXNzaW5nIGZvciBzb21lIHR5cGVzIG9mIGl0ZW1zLlxuICogUmV0dXJucyB0cmFuc2xhdGlvbiBydWxlcyBmb3IgQ29ubmVjdG9yIG9iamVjdC5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHJlY3Vyc2l2ZWx5IGZvciBncm91cHMgKGFuZCBzdWJncm91cHMpXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wIGZvcm0gb3IgZ3JvdXAgY29tcG9uZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIGZvcm0gb3IgZ3JvdXAgc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1NjaGVtYShjb21wLCBzY2hlbWEsIHZpZXdQYXRoLCBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnMpIHtcbiAgICB2aWV3UGF0aCA9IHZpZXdQYXRoIHx8ICcnO1xuICAgIGZvcm1WaWV3UGF0aHMgPSBmb3JtVmlld1BhdGhzIHx8IHt9O1xuICAgIGZvcm1Nb2RlbFBhdGhzID0gZm9ybU1vZGVsUGF0aHMgfHwge307XG4gICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zID0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMgPSBkYXRhVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMuZnJvbU1vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy5mcm9tTW9kZWwgfHwge307XG4gICAgZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsIHx8IHt9O1xuXG4gICAgZGF0YVZhbGlkYXRpb25zID0gZGF0YVZhbGlkYXRpb25zIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwgPSBkYXRhVmFsaWRhdGlvbnMuZnJvbU1vZGVsIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy50b01vZGVsID0gZGF0YVZhbGlkYXRpb25zLnRvTW9kZWwgfHwge307XG5cbiAgICBpZiAoc2NoZW1hLml0ZW1zKVxuICAgICAgICBfcHJvY2Vzc1NjaGVtYUl0ZW1zLmNhbGwodGhpcywgY29tcCwgc2NoZW1hLml0ZW1zLCB2aWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKTtcblxuICAgIGlmIChzY2hlbWEubWVzc2FnZXMpXG4gICAgICAgIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMuY2FsbCh0aGlzLCBjb21wLCBzY2hlbWEubWVzc2FnZXMpO1xuXG4gICAgdmFyIGl0ZW1SdWxlID0gc2NoZW1hLnR5cGUgJiYgZm9ybVJlZ2lzdHJ5LmdldChzY2hlbWEudHlwZSk7XG4gICAgdmFyIGhvc3RPYmplY3QgPSB0aGlzLmdldEhvc3RPYmplY3QoKTtcblxuICAgIGlmICh2aWV3UGF0aCkge1xuICAgICAgICBmb3JtVmlld1BhdGhzW3ZpZXdQYXRoXSA9IHtcbiAgICAgICAgICAgIHNjaGVtYTogc2NoZW1hLFxuICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGl0ZW1SdWxlKSB7XG4gICAgICAgICAgICAvL2NoZWNrKGNvbXAuY29uc3RydWN0b3IsIGl0ZW1UeXBlc1tzY2hlbWEudHlwZV0uQ29tcENsYXNzKTtcbiAgICAgICAgICAgIGl0ZW1SdWxlLml0ZW1GdW5jdGlvbiAmJiBpdGVtUnVsZS5pdGVtRnVuY3Rpb24uY2FsbChob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICAgICAgX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zLmNhbGwodGhpcywgdmlld1BhdGgsIHNjaGVtYSk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleXdvcmQgaW4gc2NoZW1hS2V5d29yZHNSZWdpc3RyeSkge1xuICAgICAgICBpZiAoc2NoZW1hLmhhc093blByb3BlcnR5KGtleXdvcmQpKSB7XG4gICAgICAgICAgICB2YXIgcHJvY2Vzc0tleXdvcmRGdW5jID0gc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXTtcbiAgICAgICAgICAgIHByb2Nlc3NLZXl3b3JkRnVuYyhob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVsUGF0aFRyYW5zbGF0aW9ucztcblxuXG4gICAgZnVuY3Rpb24gX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zKHZpZXdQYXRoLCBzY2hlbWEpIHtcbiAgICAgICAgdmFyIG1vZGVsUGF0aCA9IHNjaGVtYS5tb2RlbFBhdGhcbiAgICAgICAgICAgICwgbW9kZWxQYXR0ZXJuID0gc2NoZW1hLm1vZGVsUGF0dGVybiB8fCAnJ1xuICAgICAgICAgICAgLCBub3RJbk1vZGVsID0gc2NoZW1hLm5vdEluTW9kZWxcbiAgICAgICAgICAgICwgdHJhbnNsYXRlID0gc2NoZW1hLnRyYW5zbGF0ZVxuICAgICAgICAgICAgLCB2YWxpZGF0ZSA9IHNjaGVtYS52YWxpZGF0ZTtcblxuICAgICAgICBpZiAodmlld1BhdGgpIHtcbiAgICAgICAgICAgIF9hZGREYXRhVHJhbnNsYXRpb24uY2FsbCh0aGlzLCB0cmFuc2xhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGl0ZW1SdWxlLm1vZGVsUGF0aFJ1bGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdwcm9oaWJpdGVkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbW9kZWxQYXRoIGlzIHByb2hpYml0ZWQgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZXF1aXJlZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghIChtb2RlbFBhdGggfHwgbm90SW5Nb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21vZGVsUGF0aCBpcyByZXF1aXJlZCBmb3IgaXRlbSB0eXBlICcgKyBzY2hlbWEudHlwZSArICcgLiBBZGQgXCJub3RJbk1vZGVsOiB0cnVlXCIgdG8gb3ZlcnJpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmFsbGluZyB0aHJvdWdoIHRvICdvcHRpb25hbCdcbiAgICAgICAgICAgICAgICBjYXNlICdvcHRpb25hbCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hOiBzY2hlbWEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISBub3RJbk1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIG1vZGVsUGF0dGVybik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFUcmFuc2xhdGlvbi5jYWxsKHRoaXMsIHRyYW5zbGF0ZSwgJ2Zyb21Nb2RlbCcsIG1vZGVsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFWYWxpZGF0aW9uLmNhbGwodGhpcywgdmFsaWRhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hZGREYXRhVmFsaWRhdGlvbi5jYWxsKHRoaXMsIHZhbGlkYXRlLCAnZnJvbU1vZGVsJywgbW9kZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gbW9kZWxQYXRoIHJ1bGUgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIHBhdGhQYXR0ZXJuKSB7XG4gICAgICAgIGlmICh2aWV3UGF0aCBpbiBtb2RlbFBhdGhUcmFuc2xhdGlvbnMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtcbiAgICAgICAgZWxzZSBpZiAoXy5rZXlPZihtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIG1vZGVsUGF0aCkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBtb2RlbCBwYXRoICcgKyBtb2RlbFBhdGggKyAnIGZvciB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zW3ZpZXdQYXRoICsgcGF0aFBhdHRlcm5dID0gbW9kZWxQYXRoICsgcGF0aFBhdHRlcm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZERhdGFUcmFuc2xhdGlvbih0cmFuc2xhdGUsIGRpcmVjdGlvbiwgcGF0aCkge1xuICAgICAgICB2YXIgdHJhbnNsYXRlRnVuYyA9IHRyYW5zbGF0ZSAmJiB0cmFuc2xhdGVbZGlyZWN0aW9uXTtcbiAgICAgICAgaWYgKCF0cmFuc2xhdGVGdW5jKSByZXR1cm47XG4gICAgICAgIGlmICh0eXBlb2YgdHJhbnNsYXRlRnVuYyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNsYXRlLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IGdldEZ1bmN0aW9uQ29udGV4dC5jYWxsKHRoaXMsIHRyYW5zbGF0ZS5jb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZUZ1bmMgPSB0cmFuc2xhdGVGdW5jLmJpbmQoY29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhVHJhbnNsYXRpb25zW2RpcmVjdGlvbl1bcGF0aF0gPSB0cmFuc2xhdGVGdW5jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpcmVjdGlvbiArICcgdHJhbnNsYXRvciBmb3IgJyArIHBhdGggKyAnIHNob3VsZCBiZSBmdW5jdGlvbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZERhdGFWYWxpZGF0aW9uKHZhbGlkYXRlLCBkaXJlY3Rpb24sIHBhdGgpIHtcbiAgICAgICAgdmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0ZSAmJiB2YWxpZGF0ZVtkaXJlY3Rpb25dO1xuICAgICAgICBpZiAoISB2YWxpZGF0b3JzKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGZvcm0gPSB0aGlzO1xuICAgICAgICB2YXIgZm9ybVZhbGlkYXRvcnMgPSBkYXRhVmFsaWRhdGlvbnNbZGlyZWN0aW9uXVtwYXRoXSA9IFtdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpKVxuICAgICAgICAgICAgdmFsaWRhdG9ycy5mb3JFYWNoKF9hZGRWYWxpZGF0b3JGdW5jKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9ycyk7XG5cbiAgICAgICAgZnVuY3Rpb24gX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9yKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICB2YXIgdmFsRnVuYyA9IGdldFZhbGlkYXRvckZ1bmN0aW9uKHZhbGlkYXRvcik7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWxpZGF0b3IgaW5zdGFuY2VvZiBSZWdFeHApXG4gICAgICAgICAgICAgICAgdmFsRnVuYyA9IG1ha2VSZWdleFZhbGlkYXRvcih2YWxpZGF0b3IpO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIHZhbEZ1bmMgPSB2YWxpZGF0b3I7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpcmVjdGlvbiArICcgdmFsaWRhdG9yIGZvciAnICsgcGF0aCArICcgc2hvdWxkIGJlIGZ1bmN0aW9uIG9yIHN0cmluZycpO1xuXG4gICAgICAgICAgICBpZiAodmFsaWRhdGUuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgdmFsaWRhdGUuY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICB2YWxGdW5jID0gdmFsRnVuYy5iaW5kKGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3JtVmFsaWRhdG9ycy5wdXNoKHZhbEZ1bmMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGdldFZhbGlkYXRvckZ1bmN0aW9uKHZhbGlkYXRvck5hbWUpIHtcbiAgICB2YXIgdmFsRnVuYyA9IHZhbGlkYXRpb25GdW5jdGlvbnNbdmFsaWRhdG9yTmFtZV07XG4gICAgaWYgKCEgdmFsRnVuYylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3JtOiB1bmtub3duIHZhbGlkYXRvciBmdW5jdGlvbiBuYW1lICcgKyB2YWxpZGF0b3JOYW1lKTtcbiAgICByZXR1cm4gdmFsRnVuYztcbn1cblxuXG5mdW5jdGlvbiBtYWtlUmVnZXhWYWxpZGF0b3IodmFsaWRhdG9yUmVnRXhwKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdmFsaWQgPSB2YWxpZGF0b3JSZWdFeHAudGVzdChkYXRhKVxuICAgICAgICAgICAgLCByZXNwb25zZSA9IE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UodmFsaWQsICdzaG91bGQgbWF0Y2ggcGF0dGVybicpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG4gICAgfTtcbn1cblxuXG4vKipcbiAqIFByb2Nlc3NlcyBpdGVtcyBvZiB0aGUgZm9ybSAob3IgZ3JvdXApLlxuICogQ29tcG9uZW50IHRoYXQgaGFzIGl0ZW1zIHNob3VsZCBoYXZlIENvbnRhaW5lciBmYWNldC5cbiAqIFJldHVybnMgdHJhbnNsYXRpb24gcnVsZXMgZm9yIENvbm5lY3Rvci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXAgZm9ybSBvciBncm91cCBjb21wb25lbnRcbiAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zIGxpc3Qgb2YgaXRlbXMgaW4gc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gX3Byb2Nlc3NTY2hlbWFJdGVtcyhjb21wLCBpdGVtcywgdmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucykge1xuICAgIGlmICghIGNvbXAuY29udGFpbmVyKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLndhcm4oJ0Zvcm0gV2FybmluZzogc2NoZW1hIGhhcyBpdGVtcyBidXQgY29tcG9uZW50IGhhcyBubyBjb250YWluZXIgZmFjZXQnKTtcblxuICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoIWl0ZW0uY29tcE5hbWUpIHJldHVybjsgLy8gTm8gY29tcG9uZW50LCBvbmx5IG1hcmt1cFxuXG4gICAgICAgIHZhciBpdGVtQ29tcCA9IGNvbXAuY29udGFpbmVyLnNjb3BlW2l0ZW0uY29tcE5hbWVdXG4gICAgICAgICAgICAsIGNvbXBWaWV3UGF0aCA9IHZpZXdQYXRoICsgJy4nICsgaXRlbS5jb21wTmFtZTtcbiAgICAgICAgaWYgKCEgaXRlbUNvbXApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbXBvbmVudCBcIicgKyBpdGVtLmNvbXBOYW1lICsgJ1wiIGlzIG5vdCBpbiBzY29wZSAob3Igc3Vic2NvcGUpIG9mIGZvcm0nKTtcbiAgICAgICAgcHJvY2Vzc1NjaGVtYS5jYWxsKHRoaXMsIGl0ZW1Db21wLCBpdGVtLCBjb21wVmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucyk7XG4gICAgfSwgdGhpcyk7XG59XG5cblxuLyoqXG4gKiBTdWJzY3JpYmVzIHRvIG1lc3NhZ2VzIG9uIGZhY2V0cyBvZiBpdGVtcycgY29tcG9uZW50IGFzIGRlZmluZWQgaW4gc2NoZW1hXG4gKi9cbmZ1bmN0aW9uIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMoY29tcCwgbWVzc2FnZXMpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG4gICAgXy5lYWNoS2V5KG1lc3NhZ2VzLCBmdW5jdGlvbihmYWNldE1lc3NhZ2VzLCBmYWNldE5hbWUpIHtcbiAgICAgICAgdmFyIGZhY2V0ID0gY29tcFtmYWNldE5hbWVdO1xuICAgICAgICBpZiAoISBmYWNldClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2NoZW1hIGhhcyBzdWJzY3JpcHRpb25zIGZvciBmYWNldCBcIicgKyBmYWNldE5hbWUgKyAnXCIgb2YgZm9ybSBjb21wb25lbnQgXCInICsgY29tcC5uYW1lICsgJ1wiLCBidXQgY29tcG9uZW50IGhhcyBubyBmYWNldCcpO1xuICAgICAgICBmYWNldE1lc3NhZ2VzID0gXy5jbG9uZShmYWNldE1lc3NhZ2VzKTtcbiAgICAgICAgXy5lYWNoS2V5KGZhY2V0TWVzc2FnZXMsIGZ1bmN0aW9uKHN1YnNjcmliZXIsIG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHR5cGVvZiBzdWJzY3JpYmVyID09ICdvYmplY3QnID8gc3Vic2NyaWJlci5jb250ZXh0IDogbnVsbDtcblxuICAgICAgICAgICAgLy8gQXZvaWQgY2hhbmdpbmcgZXZlbnQgc3Vic2NyaXB0aW9ucyB3aG9zZSBjb250ZXh0IGlzICdmYWNldCcgb3IgJ293bmVyJy5cbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT0gJ2ZhY2V0JyAmJiBjb250ZXh0ICE9ICdvd25lcicpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBmYWNldE1lc3NhZ2VzW21lc3NhZ2VUeXBlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcjogc3Vic2NyaWJlci5zdWJzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZhY2V0Lm9uQ29uZmlnTWVzc2FnZXMoZmFjZXRNZXNzYWdlcyk7XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvYmplY3QgdG8gYmluZCBhIGZ1bmN0aW9uIHRvIGFzIGRlZmluZWQgYnkgYSBzZWN0aW9uIG9mIHRoZSBmb3JtIHNjaGVtYS5cbiAqXG4gKiBDdXJyZW50bHkgc3VwcG9ydGVkIGlucHV0cyBhcmU6XG4gKiAgLSB7T2JqZWN0fSAtIEFueSBvYmplY3RcbiAqICAtIHtTdHJpbmd9ICdmb3JtJyAtIFRoZSBmb3JtXG4gKiAgLSB7U3RyaW5nfSAnaG9zdCcgLSBUaGUgZm9ybSdzIGhvc3Qgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uQ29udGV4dChjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQgPT0gJ2Zvcm0nKVxuICAgICAgICBjb250ZXh0ID0gdGhpcztcbiAgICBlbHNlIGlmIChjb250ZXh0ID09ICdob3N0JylcbiAgICAgICAgY29udGV4dCA9IHRoaXMuZ2V0SG9zdE9iamVjdCgpO1xuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgIT0gJ29iamVjdCcpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb250ZXh0IHN1cHBsaWVkIC0gRXhwZWN0ZWQge1N0cmluZ30gW2hvc3QsZm9ybV0sIG9yIHtPYmplY3R9Jyk7XG5cbiAgICByZXR1cm4gY29udGV4dDtcbn1cblxuXG4vKipcbiAqIFZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlUmVxdWlyZWQoZGF0YSwgY2FsbGJhY2spIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgZGF0YSAhPSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICYmICh0eXBlb2YgZGF0YSAhPSAnc3RyaW5nJyB8fCBkYXRhLnRyaW0oKSAhPSAnJyk7XG4gICAgdmFyIHJlc3BvbnNlID0gTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSh2YWxpZCwgJ3BsZWFzZSBlbnRlciBhIHZhbHVlJywgJ1JFUVVJUkVEJyk7XG4gICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UodmFsaWQsIHJlYXNvbiwgcmVhc29uQ29kZSkge1xuICAgIHJldHVybiB2YWxpZFxuICAgICAgICAgICAgPyB7IHZhbGlkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyB2YWxpZDogZmFsc2UsIHJlYXNvbjogcmVhc29uLCByZWFzb25Db2RlOiByZWFzb25Db2RlIH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb1QgPSBtaWxvLnV0aWwuZG9UXG4gICAgLCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgbWlsb0NvdW50ID0gbWlsby51dGlsLmNvdW50XG4gICAgLCBjb21wb25lbnROYW1lID0gbWlsby51dGlsLmNvbXBvbmVudE5hbWVcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKVxuICAgICwgaXRlbVR5cGVzID0gcmVxdWlyZSgnLi9pdGVtX3R5cGVzJyk7XG5cbnZhciBjYWNoZWRJdGVtcyA9IHt9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZm9ybUdlbmVyYXRvcjtcblxuXG52YXIgcGFydGlhbHMgPSB7XG4gICAgbGFiZWw6IFwie3s/IGl0Lml0ZW0ubGFiZWwgfX1cXG4gICAgPGxhYmVsPnt7PSBpdC5pdGVtLmxhYmVsfX08L2xhYmVsPlxcbnt7P319XFxuXCIsXG4gICAgZm9ybUdyb3VwOiBcIjxkaXZcXG4gICAge3s/IGl0Lml0ZW0uYWx0VGV4dCB9fXRpdGxlPVxcXCJ7ez0gaXQuaXRlbS5hbHRUZXh0fX1cXFwiIHt7P319XFxuICAgIGNsYXNzPVxcXCJmb3JtLWdyb3Vwe3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0ge3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19e3s/fX1cXFwiXFxuPlxcblwiXG59O1xuXG52YXIgZG90RGVmID0ge1xuICAgIHBhcnRpYWxzOiBwYXJ0aWFsc1xufTtcblxuXG4vKlxuICogR2VuZXJhdGVzIGZvcm0gSFRNTCBiYXNlZCBvbiB0aGUgc2NoZW1hLlxuICogSXQgZG9lcyBub3QgY3JlYXRlIGNvbXBvbmVudHMgZm9yIHRoZSBmb3JtIERPTSwgbWlsby5iaW5kZXIgc2hvdWxkIGJlIGNhbGxlZCBzZXBhcmF0ZWx5IG9uIHRoZSBmb3JtJ3MgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzY2hlbWEgYXJyYXkgb2YgZm9ybSBlbGVtZW50cyBkZXNjcmlwdG9yc1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtR2VuZXJhdG9yKHNjaGVtYSkge1xuICAgIC8vZ2V0SXRlbXNDbGFzc2VzKCk7XG5cbiAgICB2YXIgcmVuZGVyZWRJdGVtcyA9IHNjaGVtYS5pdGVtcy5tYXAocmVuZGVySXRlbSk7XG4gICAgcmV0dXJuIHJlbmRlcmVkSXRlbXMuam9pbignJyk7XG5cbiAgICBmdW5jdGlvbiByZW5kZXJJdGVtKGl0ZW0pIHtcbiAgICAgICAgdmFyIGl0ZW1UeXBlID0gY2FjaGVkSXRlbXNbaXRlbS50eXBlXTtcblxuICAgICAgICBpZiAoIWl0ZW1UeXBlKSB7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbVR5cGUgPSBmb3JtUmVnaXN0cnkuZ2V0KGl0ZW0udHlwZSk7XG4gICAgICAgICAgICBpdGVtVHlwZSA9IGNhY2hlZEl0ZW1zW2l0ZW0udHlwZV0gPSB7XG4gICAgICAgICAgICAgICAgQ29tcENsYXNzOiBuZXdJdGVtVHlwZS5jb21wQ2xhc3MgJiYgY29tcG9uZW50c1JlZ2lzdHJ5LmdldChuZXdJdGVtVHlwZS5jb21wQ2xhc3MpLFxuICAgICAgICAgICAgICAgIGNvbXBDbGFzczogbmV3SXRlbVR5cGUuY29tcENsYXNzLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBkb1QuY29tcGlsZShuZXdJdGVtVHlwZS50ZW1wbGF0ZSwgZG90RGVmKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaXRlbS5jb21wTmFtZSA9IGl0ZW1UeXBlLkNvbXBDbGFzcyA/IGl0ZW0uY29tcE5hbWUgfHwgY29tcG9uZW50TmFtZSgpIDogbnVsbDtcblxuICAgICAgICB2YXIgZG9tRmFjZXRDb25maWcgPSBpdGVtVHlwZS5Db21wQ2xhc3MgJiYgaXRlbVR5cGUuQ29tcENsYXNzLmdldEZhY2V0Q29uZmlnKCdkb20nKVxuICAgICAgICAgICAgLCB0YWdOYW1lID0gZG9tRmFjZXRDb25maWcgJiYgZG9tRmFjZXRDb25maWcudGFnTmFtZSB8fCAnZGl2JztcblxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBpdGVtVHlwZS50ZW1wbGF0ZTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICBjb21wTmFtZTogaXRlbS5jb21wTmFtZSxcbiAgICAgICAgICAgIGNvbXBDbGFzczogaXRlbVR5cGUuY29tcENsYXNzLFxuICAgICAgICAgICAgdGFnTmFtZTogdGFnTmFtZSxcbiAgICAgICAgICAgIGZvcm1HZW5lcmF0b3I6IGZvcm1HZW5lcmF0b3IsXG4gICAgICAgICAgICBtaWxvQ291bnQ6IG1pbG9Db3VudCxcbiAgICAgICAgICAgIGRpc2FibGVkOiBpdGVtLmRpc2FibGVkLFxuICAgICAgICAgICAgbXVsdGlwbGU6IGl0ZW0ubXVsdGlwbGVcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKTtcblxuXG52YXIgZ3JvdXBfZG90ID0gXCI8ZGl2IG1sLWJpbmQ9XFxcIk1MR3JvdXA6e3s9IGl0LmNvbXBOYW1lIH19XFxcInt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IGNsYXNzPVxcXCJ7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX1cXFwie3s/fX0+XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAge3s9IGl0LmZvcm1HZW5lcmF0b3IoaXQuaXRlbSkgfX1cXG48L2Rpdj5cXG5cIlxuICAgICwgd3JhcHBlcl9kb3QgPSBcIjxzcGFuIG1sLWJpbmQ9XFxcIk1MV3JhcHBlcjp7ez0gaXQuY29tcE5hbWUgfX1cXFwie3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0gY2xhc3M9XFxcInt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fVxcXCJ7ez99fT5cXG4gICAge3s9IGl0LmZvcm1HZW5lcmF0b3IoaXQuaXRlbSkgfX1cXG48L3NwYW4+XFxuXCJcbiAgICAsIHNlbGVjdF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHNwYW4gY2xhc3M9XFxcImN1c3RvbS1zZWxlY3RcXFwiPlxcbiAgICAgICAgPHNlbGVjdCBtbC1iaW5kPVxcXCJNTFNlbGVjdDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319XFxuICAgICAgICAgICAgICAgIHt7PyBpdC5tdWx0aXBsZSB9fW11bHRpcGxlIHt7P319XFxuICAgICAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcbiAgICAgICAgPC9zZWxlY3Q+XFxuICAgIDwvc3Bhbj5cXG48L2Rpdj5cXG5cIlxuICAgICwgaW5wdXRfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ7ez0gaXQuaXRlbS5pbnB1dFR5cGUgfHwgJ3RleHQnIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLmlucHV0TmFtZSB9fW5hbWU9XFxcInt7PSBpdC5pdGVtLmlucHV0TmFtZSB9fVxcXCJ7ez99fVxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MSW5wdXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLnBsYWNlaG9sZGVyIH19cGxhY2Vob2xkZXI9XFxcInt7PSBpdC5pdGVtLnBsYWNlaG9sZGVyfX1cXFwie3s/fX1cXG4gICAgICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcbjwvZGl2PlxcblwiXG4gICAgLCB0ZXh0YXJlYV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHRleHRhcmVhIG1sLWJpbmQ9XFxcIk1MVGV4dGFyZWE6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX1cXG4gICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiXFxuICAgICAgICB7ez8gaXQuaXRlbS5wbGFjZWhvbGRlciB9fXBsYWNlaG9sZGVyPVxcXCJ7ez0gaXQuaXRlbS5wbGFjZWhvbGRlcn19XFxcInt7P319XFxuICAgICAgICB7ez8gaXQuaXRlbS5hdXRvcmVzaXplIH19cm93cz1cXFwie3s9IGl0Lml0ZW0uYXV0b3Jlc2l6ZS5taW5MaW5lcyB9fVxcXCJ7ez99fT48L3RleHRhcmVhPlxcbjwvZGl2PlwiXG4gICAgLCBidXR0b25fZG90ID0gXCI8ZGl2IHt7PyBpdC5pdGVtLmFsdFRleHQgfX10aXRsZT1cXFwie3s9IGl0Lml0ZW0uYWx0VGV4dH19XFxcIiB7ez99fWNsYXNzPVxcXCJidG4tdG9vbGJhcnt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IHt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fXt7P319XFxcIj5cXG4gICAgPGJ1dHRvbiBtbC1iaW5kPVxcXCJNTEJ1dHRvbjp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCB7ez8gaXQuaXRlbS5pdGVtQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS5pdGVtQ3NzQ2xhc3MgfX17ez99fVxcXCI+XFxuICAgICAgICB7ez0gaXQuaXRlbS5sYWJlbCB8fCAnJyB9fVxcbiAgICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cIlxuICAgICwgaHlwZXJsaW5rX2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAgPGEge3s/IGl0Lml0ZW0uaHJlZn19aHJlZj1cXFwie3s9IGl0Lml0ZW0uaHJlZiB9fVxcXCJ7ez99fVxcbiAgICAgICAge3s/IGl0Lml0ZW0udGFyZ2V0fX10YXJnZXQ9XFxcInt7PSBpdC5pdGVtLnRhcmdldCB9fVxcXCJ7ez99fSAgIFxcbiAgICAgICAgbWwtYmluZD1cXFwiTUxIeXBlcmxpbms6e3s9IGl0LmNvbXBOYW1lIH19XFxcIiBcXG4gICAgICAgIGNsYXNzPVxcXCJoeXBlcmxpbmsgaHlwZXJsaW5rLWRlZmF1bHRcXFwiPlxcbiAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWwgfHwgJycgfX1cXG4gICAgPC9hPlxcbjwvZGl2PlwiXG4gICAgLCBjaGVja2JveF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICA8aW5wdXQgdHlwZT1cXFwiY2hlY2tib3hcXFwiXFxuICAgIGlkPVxcXCJ7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgIG1sLWJpbmQ9XFxcIk1MSW5wdXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICBjbGFzcz1cXFwie3s9IGl0Lml0ZW0uaXRlbUNzc0NsYXNzIHx8ICcnfX1cXFwiPlxcbiAgPGxhYmVsIGZvcj1cXFwie3s9IGl0LmNvbXBOYW1lIH19XFxcIj57ez0gaXQuaXRlbS5sYWJlbH19PC9sYWJlbD5cXG48L2Rpdj5cXG5cIlxuICAgICwgbGlzdF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHVsIG1sLWJpbmQ9XFxcIk1MTGlzdDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX0+XFxuICAgICAgICA8bGkgbWwtYmluZD1cXFwiTUxMaXN0SXRlbTppdGVtU2FtcGxlXFxcIiBjbGFzcz1cXFwibGlzdC1pdGVtXFxcIj5cXG4gICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVxcXCJbZGF0YV06bGFiZWxcXFwiPjwvc3Bhbj5cXG4gICAgICAgICAgICB7ez8gaXQuZWRpdEJ0biB9fTxidXR0b24gbWwtYmluZD1cXFwiW2V2ZW50c106ZWRpdEJ0blxcXCI+ZWRpdDwvYnV0dG9uPnt7P319XFxuICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVxcXCJbZXZlbnRzXTpkZWxldGVCdG5cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcXFwiPiA8L2J1dHRvbj5cXG4gICAgICAgIDwvbGk+XFxuICAgIDwvdWw+XFxuPC9kaXY+XFxuXCJcbiAgICAsIHRpbWVfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0aW1lXFxcIlxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MVGltZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuPC9kaXY+XCJcbiAgICAsIGRhdGVfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJkYXRlXFxcIlxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MRGF0ZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuPC9kaXY+XCJcbiAgICAsIGNvbWJvX2RvdCA9IFwiPGRpdiBtbC1iaW5kPVxcXCJNTENvbWJvOnt7PSBpdC5jb21wTmFtZSB9fVxcXCIgY2xhc3M9XFxcImZvcm0tZ3JvdXB7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX17ez99fVxcXCI+XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAge3sgdmFyIGxpc3RJRCA9ICdtbC1jb21iby1kYXRhbGlzdC0nICsgaXQubWlsb0NvdW50KCk7IH19XFxuICAgIDxpbnB1dCBtbC1iaW5kPVxcXCJbZGF0YSwgZXZlbnRzXTppbnB1dFxcXCJcXG4gICAgICAgICAgICBuYW1lPVxcXCJ7ez0gbGlzdElEIH19XFxcIlxcbiAgICAgICAgICAgIGxpc3Q9XFxcInt7PSBsaXN0SUQgfX1cXFwiXFxuICAgICAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX1cXG4gICAgICAgICAgICBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj5cXG4gICAgPGRhdGFsaXN0IGlkPVxcXCJ7ez0gbGlzdElEIH19XFxcIiBtbC1iaW5kPVxcXCJbdGVtcGxhdGVdOmRhdGFsaXN0XFxcIj48L2RhdGFsaXN0PlxcbjwvZGl2PlwiXG4gICAgLCBpbWFnZV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPGltZyB7ez8gaXQuaXRlbS5zcmMgfX1zcmM9XFxcInt7PSBpdC5pdGVtLnNyYyB9fVxcXCJ7ez99fVxcbiAgICAgICAgbWwtYmluZD1cXFwiTUxJbWFnZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuaXRlbS53aWR0aCB9fXdpZHRoPVxcXCJ7ez0gaXQuaXRlbS53aWR0aCB9fVxcXCJ7ez99fVxcbiAgICAgICAge3s/IGl0Lml0ZW0uaGVpZ2h0IH19aGVpZ2h0PVxcXCJ7ez0gaXQuaXRlbS5oZWlnaHQgfX1cXFwie3s/fX0+XFxuPC9kaXY+XFxuXCJcbiAgICAsIGRyb3B0YXJnZXRfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgICAgICA8aW1nIHt7PyBpdC5pdGVtLnNyYyB9fXNyYz1cXFwie3s9IGl0Lml0ZW0uc3JjIH19XFxcInt7P319XFxuICAgICAgICAgICAgbWwtYmluZD1cXFwiTUxEcm9wVGFyZ2V0Ont7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgICAgICB7ez8gaXQuaXRlbS53aWR0aCB9fXdpZHRoPVxcXCJ7ez0gaXQuaXRlbS53aWR0aCB9fVxcXCJ7ez99fVxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLmhlaWdodCB9fWhlaWdodD1cXFwie3s9IGl0Lml0ZW0uaGVpZ2h0IH19XFxcInt7P319PlxcbjwvZGl2PlxcblwiXG4gICAgLCB0ZXh0X2RvdCA9IFwie3t2YXIgdGFnTmFtZSA9IGl0Lml0ZW0udGFnTmFtZSB8fCAnc3Bhbic7fX1cXG48e3s9dGFnTmFtZX19IG1sLWJpbmQ9XFxcIk1MVGV4dDp7ez0gaXQuY29tcE5hbWUgfX1cXFwie3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0gY2xhc3M9XFxcInt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fVxcXCJ7ez99fT5cXG4gICAge3s/IGl0Lml0ZW0ubGFiZWwgfX1cXG4gICAgICAgIHt7PSBpdC5pdGVtLmxhYmVsfX1cXG4gICAge3s/fX1cXG48L3t7PXRhZ05hbWV9fT5cXG5cIlxuICAgICwgY2xlYXJfZG90ID0gJzxkaXYgY2xhc3M9XCJjYy1jbGVhclwiPjwvZGl2Pic7XG5cblxuZm9ybVJlZ2lzdHJ5LmFkZCgnZ3JvdXAnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEdyb3VwJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBncm91cF9kb3QsICAgICAgICAgICAgICAgICBtb2RlbFBhdGhSdWxlOiAncHJvaGliaXRlZCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCd3cmFwcGVyJywgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MV3JhcHBlcicsICAgICAgICAgICAgICAgdGVtcGxhdGU6IHdyYXBwZXJfZG90LCAgICAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdwcm9oaWJpdGVkJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3NlbGVjdCcsICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxTZWxlY3QnLCAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogc2VsZWN0X2RvdCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NTZWxlY3RTY2hlbWEgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnaW5wdXQnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTElucHV0JywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBpbnB1dF9kb3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0lucHV0U2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdpbnB1dGxpc3QnLCAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MSW5wdXRMaXN0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzSW5wdXRMaXN0U2NoZW1hICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3RleHRhcmVhJywgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxUZXh0YXJlYScsICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGV4dGFyZWFfZG90LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NUZXh0YXJlYVNjaGVtYSAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnYnV0dG9uJywgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEJ1dHRvbicsICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBidXR0b25fZG90LCAgICAgICAgICAgICAgICBtb2RlbFBhdGhSdWxlOiAnb3B0aW9uYWwnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdyYWRpbycsICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MUmFkaW9Hcm91cCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzUmFkaW9TY2hlbWEgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NoZWNrZ3JvdXAnLCAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxDaGVja0dyb3VwJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NDaGVja0dyb3VwU2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdoeXBlcmxpbmsnLCAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MSHlwZXJsaW5rJywgICAgICAgICAgICAgdGVtcGxhdGU6IGh5cGVybGlua19kb3QsICAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdvcHRpb25hbCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NoZWNrYm94JywgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxJbnB1dCcsICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogY2hlY2tib3hfZG90ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnbGlzdCcsICAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTExpc3QnLCAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBsaXN0X2RvdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCd0aW1lJywgICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MVGltZScsICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRpbWVfZG90LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBzZXRWYWx1ZSAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2RhdGUnLCAgICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxEYXRlJywgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogZGF0ZV9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY29tYm8nLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTENvbWJvJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjb21ib19kb3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0NvbWJvU2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdzdXBlcmNvbWJvJywgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MU3VwZXJDb21ibycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzU3VwZXJDb21ib1NjaGVtYSAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NvbWJvbGlzdCcsICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxDb21ib0xpc3QnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NDb21ib0xpc3RTY2hlbWEgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnaW1hZ2UnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEltYWdlJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBpbWFnZV9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdkcm9wdGFyZ2V0JywgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MRHJvcFRhcmdldCcsICAgICAgICAgICAgdGVtcGxhdGU6IGRyb3B0YXJnZXRfZG90LCAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdwcm9oaWJpdGVkJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3RleHQnLCAgICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxUZXh0JywgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGV4dF9kb3QsICAgICAgICAgICAgICAgICAgbW9kZWxQYXRoUnVsZTogJ29wdGlvbmFsJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY2xlYXInLCAgICAgICAgICAgICAgICAgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjbGVhcl9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuZnVuY3Rpb24gc2V0VmFsdWUoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuc2VsZWN0T3B0aW9ucztcbiAgICBpZiAoc2NoZW1hLmhhc093blByb3BlcnR5KCd2YWx1ZScpKSB7XG4gICAgICAgIGNvbXAuZGF0YS5zZXQoc2NoZW1hLnZhbHVlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTZWxlY3RTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuc2VsZWN0T3B0aW9ucztcbiAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbXBvbmVudE1vZGVsKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzUmFkaW9TY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEucmFkaW9PcHRpb25zO1xuICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tcG9uZW50TW9kZWwpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NDaGVja0dyb3VwU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIHZhciBvcHRpb25zID0gc2NoZW1hLmNoZWNrT3B0aW9ucztcbiAgICBjb21wLnNldFNlbGVjdEFsbCghIXNjaGVtYS5zZWxlY3RBbGwpO1xuICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tcG9uZW50TW9kZWwpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NDb21ib1NjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5jb21ib09wdGlvbnM7XG4gICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21wb25lbnRNb2RlbCk7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc1N1cGVyQ29tYm9TY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuY29tYm9PcHRpb25zXG4gICAgICAgICwgb3B0aW9uc1VSTCA9IHNjaGVtYS5jb21ib09wdGlvbnNVUkxcbiAgICAgICAgLCBhZGRJdGVtUHJvbXB0ID0gc2NoZW1hLmFkZEl0ZW1Qcm9tcHRcbiAgICAgICAgLCBwbGFjZUhvbGRlciA9IHNjaGVtYS5wbGFjZUhvbGRlcjtcblxuICAgIF8uZGVmZXJUaWNrcyhmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGFkZEl0ZW1Qcm9tcHQpIGNvbXAuc2V0QWRkSXRlbVByb21wdChhZGRJdGVtUHJvbXB0KTtcbiAgICAgICAgaWYgKHBsYWNlSG9sZGVyKSBjb21wLnNldFBsYWNlaG9sZGVyKHBsYWNlSG9sZGVyKTtcbiAgICAgICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21ib09wdGlvbnMpO1xuICAgICAgICBpZihvcHRpb25zVVJMKVxuICAgICAgICAgICAgY29tcC5pbml0T3B0aW9uc1VSTChvcHRpb25zVVJMKTtcbiAgICB9LCAyKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzQ29tYm9MaXN0U2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIHZhciBvcHRpb25zID0gc2NoZW1hLmNvbWJvT3B0aW9uc1xuICAgICAgICAsIGFkZEl0ZW1Qcm9tcHQgPSBzY2hlbWEuYWRkSXRlbVByb21wdFxuICAgICAgICAsIHBsYWNlSG9sZGVyID0gc2NoZW1hLnBsYWNlSG9sZGVyO1xuXG4gICAgXy5kZWZlclRpY2tzKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoYWRkSXRlbVByb21wdCkgY29tcC5zZXRBZGRJdGVtUHJvbXB0KGFkZEl0ZW1Qcm9tcHQpO1xuICAgICAgICBpZiAocGxhY2VIb2xkZXIpIGNvbXAuc2V0UGxhY2Vob2xkZXIocGxhY2VIb2xkZXIpO1xuICAgICAgICBjb21wLnNldERhdGFWYWxpZGF0aW9uKHNjaGVtYS5kYXRhVmFsaWRhdGlvbik7XG4gICAgICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tYm9PcHRpb25zKTtcbiAgICB9LCAyKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzSW5wdXRMaXN0U2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIGNvbXAuc2V0QXN5bmMoc2NoZW1hLmFzeW5jSGFuZGxlcik7XG4gICAgY29tcC5zZXRQbGFjZUhvbGRlcihzY2hlbWEucGxhY2VIb2xkZXIpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NUZXh0YXJlYVNjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICBpZiAoc2NoZW1hLmF1dG9yZXNpemUpXG4gICAgICAgIF8uZGVmZXJNZXRob2QoY29tcCwgJ3N0YXJ0QXV0b3Jlc2l6ZScsIHNjaGVtYS5hdXRvcmVzaXplKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzSW5wdXRTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgaWYgKF8uaXNOdW1lcmljKHNjaGVtYS5tYXhMZW5ndGgpKSBjb21wLnNldE1heExlbmd0aChzY2hlbWEubWF4TGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRNb2RlbEZ1bmMpIHtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMudGhlbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzZXRNb2RlbEZ1bmMoY29tcCwgW3sgdmFsdWU6IDAsIGxhYmVsOiAnbG9hZGluZy4uLicgfV0pO1xuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7IHNldE1vZGVsRnVuYyhjb21wLCBkYXRhKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHNldE1vZGVsRnVuYyhjb21wLCBbeyB2YWx1ZTogMCwgbGFiZWw6ICdsb2FkaW5nIGVycm9yJyB9XSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgIHNldE1vZGVsRnVuYyhjb21wLCBvcHRpb25zKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gc2V0Q29tcG9uZW50TW9kZWwoY29tcCwgZGF0YSkge1xuICAgIGNvbXAubW9kZWwuc2V0KGRhdGEpO1xuICAgIC8vIF8uZGVmZXJNZXRob2QoY29tcC5tb2RlbCwgJ3NldCcsIGRhdGEpO1xuICAgIC8vIGRvaW5nIGl0IHdpdGggZGVmZXIgbWFrZXMgY2hhbm5lbCBub3Qgc2V0IHdoZW4gdGhlIGFydGljbGUgaXMgb3BlbmVkXG59XG5cblxuZnVuY3Rpb24gc2V0Q29tYm9PcHRpb25zKGNvbXAsIGRhdGEpIHtcbiAgICBjb21wLnNldE9wdGlvbnMoZGF0YSk7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc1NjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICBjb21wLnByb2Nlc3NGb3JtU2NoZW1hKHNjaGVtYSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cbnZhciBmb3JtVHlwZXMgPSB7fTtcbnZhciBkZWZhdWx0cyA9IHt9O1xuXG52YXIgZm9ybVJlZ2lzdHJ5ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0OiByZWdpc3RyeV9nZXQsXG4gICAgYWRkOiByZWdpc3RyeV9hZGQsXG4gICAgc2V0RGVmYXVsdHM6IHJlZ2lzdHJ5X3NldERlZmF1bHRzXG59O1xuXG5cbnZhciBERUZBVUxUX1RFTVBMQVRFID0gJ3t7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8e3s9IGl0LnRhZ05hbWV9fSBtbC1iaW5kPVwie3s9IGl0LmNvbXBDbGFzc319Ont7PSBpdC5jb21wTmFtZSB9fVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC97ez0gaXQudGFnTmFtZX19PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xuXG5mb3JtUmVnaXN0cnkuc2V0RGVmYXVsdHMoe1xuICAgIHRlbXBsYXRlOiBERUZBVUxUX1RFTVBMQVRFLFxuICAgIG1vZGVsUGF0aFJ1bGU6ICdyZXF1aXJlZCcsXG4gICAgaXRlbUZ1bmN0aW9uOiBudWxsXG59KTtcblxuXG5mdW5jdGlvbiByZWdpc3RyeV9nZXQobmFtZSkge1xuICAgIHZhciBmb3JtSXRlbSA9IG5hbWUgJiYgZm9ybVR5cGVzW25hbWVdO1xuXG4gICAgaWYgKCFmb3JtSXRlbSkgXG4gICAgICAgIHJldHVybiBsb2dnZXIuZXJyb3IoJ0Zvcm0gaXRlbSAnICsgbmFtZSArICcgbm90IHJlZ2lzdGVyZWQnKTtcblxuICAgIHJldHVybiBmb3JtSXRlbTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0cnlfYWRkKG5hbWUsIG5ld0Zvcm1JdGVtKSB7XG4gICAgY2hlY2sobmFtZSwgU3RyaW5nKTtcbiAgICBjaGVjayhuZXdGb3JtSXRlbSwge1xuICAgICAgICBjb21wQ2xhc3M6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIHRlbXBsYXRlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBtb2RlbFBhdGhSdWxlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBpdGVtRnVuY3Rpb246IE1hdGNoLk9wdGlvbmFsKEZ1bmN0aW9uKVxuICAgIH0pO1xuXG4gICAgdmFyIGZvcm1JdGVtID0gXy5jbG9uZShkZWZhdWx0cyk7XG4gICAgXy5leHRlbmQoZm9ybUl0ZW0sIG5ld0Zvcm1JdGVtKTtcblxuICAgIGlmIChuYW1lICYmIGZvcm1UeXBlc1tuYW1lXSkgXG4gICAgICAgIHJldHVybiBsb2dnZXIuZXJyb3IoJ0Zvcm0gaXRlbSAnICsgbmFtZSArICcgYWxyZWFkeSByZWdpc3RlcmVkJyk7XG5cbiAgICBmb3JtVHlwZXNbbmFtZV0gPSBmb3JtSXRlbTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0cnlfc2V0RGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBjaGVjayhkZWZhdWx0cywgT2JqZWN0KTtcbiAgICBkZWZhdWx0cyA9IG5ld0RlZmF1bHRzO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbmlmICghKHdpbmRvdy5taWxvICYmIHdpbmRvdy5taWxvLm1pbG9fdmVyc2lvbikpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaWxvIGlzIG5vdCBhdmFpbGFibGUnKTtcblxuLyoqXG4gKiBgbWlsby11aWBcbiAqXG4gKiBUaGlzIGJ1bmRsZSB3aWxsIHJlZ2lzdGVyIGFkZGl0aW9uYWwgY29tcG9uZW50IGNsYXNzZXMgZm9yIFVJXG4gKi9cblxucmVxdWlyZSgnLi91c2VfY29tcG9uZW50cycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvR3JvdXAnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9XcmFwcGVyJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGV4dCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1NlbGVjdCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0lucHV0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSW5wdXRMaXN0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGV4dGFyZWEnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9SYWRpb0dyb3VwJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvQ2hlY2tHcm91cCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0J1dHRvbicpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0h5cGVybGluaycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0xpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9MaXN0SXRlbScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1RpbWUnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9EYXRlJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvQ29tYm8nKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9TdXBlckNvbWJvJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvQ29tYm9MaXN0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSW1hZ2UnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Ecm9wVGFyZ2V0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvRm9sZFRyZWUnKTtcblxucmVxdWlyZSgnLi9jb21wb25lbnRzL2Jvb3RzdHJhcC9BbGVydCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL2Jvb3RzdHJhcC9EaWFsb2cnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9ib290c3RyYXAvRHJvcGRvd24nKTtcblxucmVxdWlyZSgnLi9mb3Jtcy9Gb3JtJyk7XG4iLCJ2YXIgcHJvY2Vzcz1yZXF1aXJlKFwiX19icm93c2VyaWZ5X3Byb2Nlc3NcIiksZ2xvYmFsPXR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fTsvKiFcbiAqIGFzeW5jXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2FvbGFuL2FzeW5jXG4gKlxuICogQ29weXJpZ2h0IDIwMTAtMjAxNCBDYW9sYW4gTWNNYWhvblxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgYXN5bmMgPSB7fTtcbiAgICBmdW5jdGlvbiBub29wKCkge31cbiAgICBmdW5jdGlvbiBpZGVudGl0eSh2KSB7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b0Jvb2wodikge1xuICAgICAgICByZXR1cm4gISF2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBub3RJZCh2KSB7XG4gICAgICAgIHJldHVybiAhdjtcbiAgICB9XG5cbiAgICAvLyBnbG9iYWwgb24gdGhlIHNlcnZlciwgd2luZG93IGluIHRoZSBicm93c2VyXG4gICAgdmFyIHByZXZpb3VzX2FzeW5jO1xuXG4gICAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4gICAgLy8gb24gdGhlIHNlcnZlciwgb3IgYHRoaXNgIGluIHNvbWUgdmlydHVhbCBtYWNoaW5lcy4gV2UgdXNlIGBzZWxmYFxuICAgIC8vIGluc3RlYWQgb2YgYHdpbmRvd2AgZm9yIGBXZWJXb3JrZXJgIHN1cHBvcnQuXG4gICAgdmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PT0gJ29iamVjdCcgJiYgc2VsZi5zZWxmID09PSBzZWxmICYmIHNlbGYgfHxcbiAgICAgICAgICAgIHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnICYmIGdsb2JhbC5nbG9iYWwgPT09IGdsb2JhbCAmJiBnbG9iYWwgfHxcbiAgICAgICAgICAgIHRoaXM7XG5cbiAgICBpZiAocm9vdCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZpb3VzX2FzeW5jID0gcm9vdC5hc3luYztcbiAgICB9XG5cbiAgICBhc3luYy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByb290LmFzeW5jID0gcHJldmlvdXNfYXN5bmM7XG4gICAgICAgIHJldHVybiBhc3luYztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25seV9vbmNlKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gY3Jvc3MtYnJvd3NlciBjb21wYXRpYmxpdHkgZnVuY3Rpb25zIC8vLy9cblxuICAgIHZhciBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4gICAgdmFyIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBfdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICAvLyBQb3J0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzIGlzT2JqZWN0XG4gICAgdmFyIF9pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaXNBcnJheUxpa2UoYXJyKSB7XG4gICAgICAgIHJldHVybiBfaXNBcnJheShhcnIpIHx8IChcbiAgICAgICAgICAgIC8vIGhhcyBhIHBvc2l0aXZlIGludGVnZXIgbGVuZ3RoIHByb3BlcnR5XG4gICAgICAgICAgICB0eXBlb2YgYXJyLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCA+PSAwICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoICUgMSA9PT0gMFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9lYWNoKGNvbGwsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBfaXNBcnJheUxpa2UoY29sbCkgP1xuICAgICAgICAgICAgX2FycmF5RWFjaChjb2xsLCBpdGVyYXRvcikgOlxuICAgICAgICAgICAgX2ZvckVhY2hPZihjb2xsLCBpdGVyYXRvcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FycmF5RWFjaChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JhbmdlKGNvdW50KSB7XG4gICAgICAgIHJldHVybiBfbWFwKEFycmF5KGNvdW50KSwgZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGk7IH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWR1Y2UoYXJyLCBpdGVyYXRvciwgbWVtbykge1xuICAgICAgICBfYXJyYXlFYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvcihtZW1vLCB4LCBpLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mb3JFYWNoT2Yob2JqZWN0LCBpdGVyYXRvcikge1xuICAgICAgICBfYXJyYXlFYWNoKF9rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5kZXhPZihhcnIsIGl0ZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICB2YXIgX2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfa2V5SXRlcmF0b3IoY29sbCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB2YXIgbGVuO1xuICAgICAgICB2YXIga2V5cztcbiAgICAgICAgaWYgKF9pc0FycmF5TGlrZShjb2xsKSkge1xuICAgICAgICAgICAgbGVuID0gY29sbC5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBpIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gX2tleXMoY29sbCk7XG4gICAgICAgICAgICBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNpbWlsYXIgdG8gRVM2J3MgcmVzdCBwYXJhbSAoaHR0cDovL2FyaXlhLm9maWxhYnMuY29tLzIwMTMvMDMvZXM2LWFuZC1yZXN0LXBhcmFtZXRlci5odG1sKVxuICAgIC8vIFRoaXMgYWNjdW11bGF0ZXMgdGhlIGFyZ3VtZW50cyBwYXNzZWQgaW50byBhbiBhcnJheSwgYWZ0ZXIgYSBnaXZlbiBpbmRleC5cbiAgICAvLyBGcm9tIHVuZGVyc2NvcmUuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzIxNDApLlxuICAgIGZ1bmN0aW9uIF9yZXN0UGFyYW0oZnVuYywgc3RhcnRJbmRleCkge1xuICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCByZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEN1cnJlbnRseSB1bnVzZWQgYnV0IGhhbmRsZSBjYXNlcyBvdXRzaWRlIG9mIHRoZSBzd2l0Y2ggc3RhdGVtZW50OlxuICAgICAgICAgICAgLy8gdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICAgICAgICAvLyBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBleHBvcnRlZCBhc3luYyBtb2R1bGUgZnVuY3Rpb25zIC8vLy9cblxuICAgIC8vLy8gbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gd2l0aCBicm93c2VyLWNvbXBhdGlibGUgZmFsbGJhY2sgLy8vL1xuXG4gICAgLy8gY2FwdHVyZSB0aGUgZ2xvYmFsIHJlZmVyZW5jZSB0byBndWFyZCBhZ2FpbnN0IGZha2VUaW1lciBtb2Nrc1xuICAgIHZhciBfc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG5cbiAgICB2YXIgX2RlbGF5ID0gX3NldEltbWVkaWF0ZSA/IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0gOiBmdW5jdGlvbihmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBfZGVsYXk7XG4gICAgfVxuICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IF9zZXRJbW1lZGlhdGUgPyBfZGVsYXkgOiBhc3luYy5uZXh0VGljaztcblxuXG4gICAgYXN5bmMuZm9yRWFjaCA9XG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9XG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPVxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPVxuICAgIGFzeW5jLmVhY2hPZiA9IGZ1bmN0aW9uIChvYmplY3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmplY3QgPSBvYmplY3QgfHwgW107XG4gICAgICAgIHZhciBzaXplID0gX2lzQXJyYXlMaWtlKG9iamVjdCkgPyBvYmplY3QubGVuZ3RoIDogX2tleXMob2JqZWN0KS5sZW5ndGg7XG4gICAgICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgICAgICBpZiAoIXNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBfZWFjaChvYmplY3QsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZCA+PSBzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMgPVxuICAgIGFzeW5jLmVhY2hPZlNlcmllcyA9IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgIHZhciBuZXh0S2V5ID0gX2tleUl0ZXJhdG9yKG9iaik7XG4gICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGUoKSB7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMubmV4dFRpY2soaXRlcmF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRlKCk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5mb3JFYWNoT2ZMaW1pdCA9XG4gICAgYXN5bmMuZWFjaE9mTGltaXQgPSBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9lYWNoT2ZMaW1pdChsaW1pdCkob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZWFjaE9mTGltaXQobGltaXQpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBydW5uaW5nID0gMDtcbiAgICAgICAgICAgIHZhciBlcnJvcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiByZXBsZW5pc2ggKCkge1xuICAgICAgICAgICAgICAgIGlmIChkb25lICYmIHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHJ1bm5pbmcgPCBsaW1pdCAmJiAhZXJyb3JlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBydW5uaW5nICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxlbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWwoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZiwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsTGltaXQoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihfZWFjaE9mTGltaXQobGltaXQpLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvU2VyaWVzKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2ZTZXJpZXMsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXN5bmNNYXAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5tYXAgPSBkb1BhcmFsbGVsKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwU2VyaWVzID0gZG9TZXJpZXMoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfYXN5bmNNYXApO1xuXG4gICAgLy8gcmVkdWNlIG9ubHkgaGFzIGEgc2VyaWVzIHZlcnNpb24sIGFzIGRvaW5nIHJlZHVjZSBpbiBwYXJhbGxlbCB3b24ndFxuICAgIC8vIHdvcmsgaW4gbWFueSBzaXR1YXRpb25zLlxuICAgIGFzeW5jLmluamVjdCA9XG4gICAgYXN5bmMuZm9sZGwgPVxuICAgIGFzeW5jLnJlZHVjZSA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBmdW5jdGlvbiAoeCwgaSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHgsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICBtZW1vID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciB8fCBudWxsLCBtZW1vKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvbGRyID1cbiAgICBhc3luYy5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmV2ZXJzZWQgPSBfbWFwKGFyciwgaWRlbnRpdHkpLnJldmVyc2UoKTtcbiAgICAgICAgYXN5bmMucmVkdWNlKHJldmVyc2VkLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe2luZGV4OiBpbmRleCwgdmFsdWU6IHh9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhfbWFwKHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICAgICAgICAgIH0pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5zZWxlY3QgPVxuICAgIGFzeW5jLmZpbHRlciA9IGRvUGFyYWxsZWwoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RMaW1pdCA9XG4gICAgYXN5bmMuZmlsdGVyTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RTZXJpZXMgPVxuICAgIGFzeW5jLmZpbHRlclNlcmllcyA9IGRvU2VyaWVzKF9maWx0ZXIpO1xuXG4gICAgZnVuY3Rpb24gX3JlamVjdChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGZ1bmN0aW9uKHZhbHVlLCBjYikge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICBjYighdik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBhc3luYy5yZWplY3QgPSBkb1BhcmFsbGVsKF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdFNlcmllcyA9IGRvU2VyaWVzKF9yZWplY3QpO1xuXG4gICAgZnVuY3Rpb24gX2NyZWF0ZVRlc3RlcihlYWNoZm4sIGNoZWNrLCBnZXRSZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYikge1xuICAgICAgICAgICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2IpIGNiKGdldFJlc3VsdChmYWxzZSwgdm9pZCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBpdGVyYXRlZSh4LCBfLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmICghY2IpIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYiAmJiBjaGVjayh2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoZ2V0UmVzdWx0KHRydWUsIHgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgbGltaXQsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvcjtcbiAgICAgICAgICAgICAgICBpdGVyYXRvciA9IGxpbWl0O1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy5hbnkgPVxuICAgIGFzeW5jLnNvbWUgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5zb21lTGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLmFsbCA9XG4gICAgYXN5bmMuZXZlcnkgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgbm90SWQsIG5vdElkKTtcblxuICAgIGFzeW5jLmV2ZXJ5TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBub3RJZCwgbm90SWQpO1xuXG4gICAgZnVuY3Rpb24gX2ZpbmRHZXRSZXN1bHQodiwgeCkge1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgYXN5bmMuZGV0ZWN0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0U2VyaWVzID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZTZXJpZXMsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuXG4gICAgYXN5bmMuc29ydEJ5ID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLm1hcChhcnIsIGZ1bmN0aW9uICh4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKGVyciwgY3JpdGVyaWEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB7dmFsdWU6IHgsIGNyaXRlcmlhOiBjcml0ZXJpYX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBfbWFwKHJlc3VsdHMuc29ydChjb21wYXJhdG9yKSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNvbXBhcmF0b3IobGVmdCwgcmlnaHQpIHtcbiAgICAgICAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYSwgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgICAgICAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmF1dG8gPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciBrZXlzID0gX2tleXModGFza3MpO1xuICAgICAgICB2YXIgcmVtYWluaW5nVGFza3MgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgaWYgKCFyZW1haW5pbmdUYXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcblxuICAgICAgICB2YXIgbGlzdGVuZXJzID0gW107XG4gICAgICAgIGZ1bmN0aW9uIGFkZExpc3RlbmVyKGZuKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMudW5zaGlmdChmbik7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIHZhciBpZHggPSBfaW5kZXhPZihsaXN0ZW5lcnMsIGZuKTtcbiAgICAgICAgICAgIGlmIChpZHggPj0gMCkgbGlzdGVuZXJzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHRhc2tDb21wbGV0ZSgpIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ1Rhc2tzLS07XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGxpc3RlbmVycy5zbGljZSgwKSwgZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFyZW1haW5pbmdUYXNrcykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBfYXJyYXlFYWNoKGtleXMsIGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICB2YXIgdGFzayA9IF9pc0FycmF5KHRhc2tzW2tdKSA/IHRhc2tzW2tdOiBbdGFza3Nba11dO1xuICAgICAgICAgICAgdmFyIHRhc2tDYWxsYmFjayA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNhZmVSZXN1bHRzID0ge307XG4gICAgICAgICAgICAgICAgICAgIF9mb3JFYWNoT2YocmVzdWx0cywgZnVuY3Rpb24odmFsLCBya2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1tya2V5XSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBzYWZlUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHRhc2tDb21wbGV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcmVxdWlyZXMgPSB0YXNrLnNsaWNlKDAsIHRhc2subGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGRlYWQtbG9ja3NcbiAgICAgICAgICAgIHZhciBsZW4gPSByZXF1aXJlcy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZGVwO1xuICAgICAgICAgICAgd2hpbGUgKGxlbi0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoZGVwID0gdGFza3NbcmVxdWlyZXNbbGVuXV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIGluZXhpc3RhbnQgZGVwZW5kZW5jeScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX2lzQXJyYXkoZGVwKSAmJiBfaW5kZXhPZihkZXAsIGspID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgY3ljbGljIGRlcGVuZGVuY2llcycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlYWR5KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVkdWNlKHJlcXVpcmVzLCBmdW5jdGlvbiAoYSwgeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGEgJiYgcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eSh4KSk7XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSkgJiYgIXJlc3VsdHMuaGFzT3duUHJvcGVydHkoayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gbGlzdGVuZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gICAgYXN5bmMucmV0cnkgPSBmdW5jdGlvbih0aW1lcywgdGFzaywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIERFRkFVTFRfVElNRVMgPSA1O1xuICAgICAgICB2YXIgREVGQVVMVF9JTlRFUlZBTCA9IDA7XG5cbiAgICAgICAgdmFyIGF0dGVtcHRzID0gW107XG5cbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICB0aW1lczogREVGQVVMVF9USU1FUyxcbiAgICAgICAgICAgIGludGVydmFsOiBERUZBVUxUX0lOVEVSVkFMXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gcGFyc2VUaW1lcyhhY2MsIHQpe1xuICAgICAgICAgICAgaWYodHlwZW9mIHQgPT09ICdudW1iZXInKXtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgdCA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQudGltZXMsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgICAgIGFjYy5pbnRlcnZhbCA9IHBhcnNlSW50KHQuaW50ZXJ2YWwsIDEwKSB8fCBERUZBVUxUX0lOVEVSVkFMO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGFyZ3VtZW50IHR5cGUgZm9yIFxcJ3RpbWVzXFwnOiAnICsgdHlwZW9mIHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPCAxIHx8IGxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudHMgLSBtdXN0IGJlIGVpdGhlciAodGFzayksICh0YXNrLCBjYWxsYmFjayksICh0aW1lcywgdGFzaykgb3IgKHRpbWVzLCB0YXNrLCBjYWxsYmFjayknKTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPD0gMiAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdGFzaztcbiAgICAgICAgICAgIHRhc2sgPSB0aW1lcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRpbWVzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBwYXJzZVRpbWVzKG9wdHMsIHRpbWVzKTtcbiAgICAgICAgfVxuICAgICAgICBvcHRzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIG9wdHMudGFzayA9IHRhc2s7XG5cbiAgICAgICAgZnVuY3Rpb24gd3JhcHBlZFRhc2sod3JhcHBlZENhbGxiYWNrLCB3cmFwcGVkUmVzdWx0cykge1xuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlBdHRlbXB0KHRhc2ssIGZpbmFsQXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrKGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKCFlcnIgfHwgZmluYWxBdHRlbXB0LCB7ZXJyOiBlcnIsIHJlc3VsdDogcmVzdWx0fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHdyYXBwZWRSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUludGVydmFsKGludGVydmFsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spe1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlIChvcHRzLnRpbWVzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmluYWxBdHRlbXB0ID0gIShvcHRzLnRpbWVzLT0xKTtcbiAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5QXR0ZW1wdChvcHRzLnRhc2ssIGZpbmFsQXR0ZW1wdCkpO1xuICAgICAgICAgICAgICAgIGlmKCFmaW5hbEF0dGVtcHQgJiYgb3B0cy5pbnRlcnZhbCA+IDApe1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5SW50ZXJ2YWwob3B0cy5pbnRlcnZhbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMuc2VyaWVzKGF0dGVtcHRzLCBmdW5jdGlvbihkb25lLCBkYXRhKXtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICh3cmFwcGVkQ2FsbGJhY2sgfHwgb3B0cy5jYWxsYmFjaykoZGF0YS5lcnIsIGRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBpcyBwYXNzZWQsIHJ1biB0aGlzIGFzIGEgY29udHJvbGwgZmxvd1xuICAgICAgICByZXR1cm4gb3B0cy5jYWxsYmFjayA/IHdyYXBwZWRUYXNrKCkgOiB3cmFwcGVkVGFzaztcbiAgICB9O1xuXG4gICAgYXN5bmMud2F0ZXJmYWxsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHRhc2tzKSkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gd2F0ZXJmYWxsIG11c3QgYmUgYW4gYXJyYXkgb2YgZnVuY3Rpb25zJyk7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gd3JhcEl0ZXJhdG9yKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2god3JhcEl0ZXJhdG9yKG5leHQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5zdXJlQXN5bmMoaXRlcmF0b3IpLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdyYXBJdGVyYXRvcihhc3luYy5pdGVyYXRvcih0YXNrcykpKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9wYXJhbGxlbChlYWNoZm4sIHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKHRhc2tzKSA/IFtdIDoge307XG5cbiAgICAgICAgZWFjaGZuKHRhc2tzLCBmdW5jdGlvbiAodGFzaywga2V5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdGFzayhfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5wYXJhbGxlbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZiwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uKHRhc2tzLCBsaW1pdCwgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKF9lYWNoT2ZMaW1pdChsaW1pdCksIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcmllcyA9IGZ1bmN0aW9uKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mU2VyaWVzLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5pdGVyYXRvciA9IGZ1bmN0aW9uICh0YXNrcykge1xuICAgICAgICBmdW5jdGlvbiBtYWtlQ2FsbGJhY2soaW5kZXgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZuKCkge1xuICAgICAgICAgICAgICAgIGlmICh0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFza3NbaW5kZXhdLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmbi5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmbi5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaW5kZXggPCB0YXNrcy5sZW5ndGggLSAxKSA/IG1ha2VDYWxsYmFjayhpbmRleCArIDEpOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFrZUNhbGxiYWNrKDApO1xuICAgIH07XG5cbiAgICBhc3luYy5hcHBseSA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChjYWxsQXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KFxuICAgICAgICAgICAgICAgIG51bGwsIGFyZ3MuY29uY2F0KGNhbGxBcmdzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBfY29uY2F0KGVhY2hmbiwgYXJyLCBmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNiKSB7XG4gICAgICAgICAgICBmbih4LCBmdW5jdGlvbiAoZXJyLCB5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh5IHx8IFtdKTtcbiAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmNvbmNhdCA9IGRvUGFyYWxsZWwoX2NvbmNhdCk7XG4gICAgYXN5bmMuY29uY2F0U2VyaWVzID0gZG9TZXJpZXMoX2NvbmNhdCk7XG5cbiAgICBhc3luYy53aGlsc3QgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgaWYgKHRlc3QoKSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3QuYXBwbHkodGhpcywgYXJncykpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvV2hpbHN0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICsrY2FsbHMgPD0gMSB8fCB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnVudGlsID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvVW50aWwgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5kb1doaWxzdChpdGVyYXRvciwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kdXJpbmcgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcblxuICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGNoZWNrKTtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbihlcnIsIHRydXRoKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHJ1dGgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGVzdChjaGVjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvRHVyaW5nID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICBhc3luYy5kdXJpbmcoZnVuY3Rpb24obmV4dCkge1xuICAgICAgICAgICAgaWYgKGNhbGxzKysgPCAxKSB7XG4gICAgICAgICAgICAgICAgbmV4dChudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcXVldWUod29ya2VyLCBjb25jdXJyZW5jeSwgcGF5bG9hZCkge1xuICAgICAgICBpZiAoY29uY3VycmVuY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uY3VycmVuY3kgbXVzdCBub3QgYmUgemVybycpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcG9zLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwICYmIHEuaWRsZSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrIHx8IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX25leHQocSwgdGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrLmNhbGxiYWNrLmFwcGx5KHRhc2ssIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd29ya2VycyA9IDA7XG4gICAgICAgIHZhciBxID0ge1xuICAgICAgICAgICAgdGFza3M6IFtdLFxuICAgICAgICAgICAgY29uY3VycmVuY3k6IGNvbmN1cnJlbmN5LFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogbm9vcCxcbiAgICAgICAgICAgIGVtcHR5OiBub29wLFxuICAgICAgICAgICAgZHJhaW46IG5vb3AsXG4gICAgICAgICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBhdXNlZDogZmFsc2UsXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2lsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEuZHJhaW4gPSBub29wO1xuICAgICAgICAgICAgICAgIHEudGFza3MgPSBbXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bnNoaWZ0OiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFxLnBhdXNlZCAmJiB3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLnRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSh3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLnRhc2tzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFza3MgPSBxLnBheWxvYWQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKDAsIHEucGF5bG9hZCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKDAsIHEudGFza3MubGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBfbWFwKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNiID0gb25seV9vbmNlKF9uZXh0KHEsIHRhc2tzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXIoZGF0YSwgY2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5uaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaWRsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAocS5wYXVzZWQgPT09IGZhbHNlKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VtZUNvdW50ID0gTWF0aC5taW4ocS5jb25jdXJyZW5jeSwgcS50YXNrcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gY2FsbCBxLnByb2Nlc3Mgb25jZSBwZXIgY29uY3VycmVudFxuICAgICAgICAgICAgICAgIC8vIHdvcmtlciB0byBwcmVzZXJ2ZSBmdWxsIGNvbmN1cnJlbmN5IGFmdGVyIHBhdXNlXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdyA9IDE7IHcgPD0gcmVzdW1lQ291bnQ7IHcrKykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBxO1xuICAgIH1cblxuICAgIGFzeW5jLnF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcbiAgICAgICAgdmFyIHEgPSBfcXVldWUoZnVuY3Rpb24gKGl0ZW1zLCBjYikge1xuICAgICAgICAgICAgd29ya2VyKGl0ZW1zWzBdLCBjYik7XG4gICAgICAgIH0sIGNvbmN1cnJlbmN5LCAxKTtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMucHJpb3JpdHlRdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG5cbiAgICAgICAgZnVuY3Rpb24gX2NvbXBhcmVUYXNrcyhhLCBiKXtcbiAgICAgICAgICAgIHJldHVybiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9iaW5hcnlTZWFyY2goc2VxdWVuY2UsIGl0ZW0sIGNvbXBhcmUpIHtcbiAgICAgICAgICAgIHZhciBiZWcgPSAtMSxcbiAgICAgICAgICAgICAgICBlbmQgPSBzZXF1ZW5jZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgd2hpbGUgKGJlZyA8IGVuZCkge1xuICAgICAgICAgICAgICAgIHZhciBtaWQgPSBiZWcgKyAoKGVuZCAtIGJlZyArIDEpID4+PiAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZShpdGVtLCBzZXF1ZW5jZVttaWRdKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlZyA9IG1pZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBtaWQgLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBiZWc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKF9iaW5hcnlTZWFyY2gocS50YXNrcywgaXRlbSwgX2NvbXBhcmVUYXNrcykgKyAxLCAwLCBpdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG5vcm1hbCBxdWV1ZVxuICAgICAgICB2YXIgcSA9IGFzeW5jLnF1ZXVlKHdvcmtlciwgY29uY3VycmVuY3kpO1xuXG4gICAgICAgIC8vIE92ZXJyaWRlIHB1c2ggdG8gYWNjZXB0IHNlY29uZCBwYXJhbWV0ZXIgcmVwcmVzZW50aW5nIHByaW9yaXR5XG4gICAgICAgIHEucHVzaCA9IGZ1bmN0aW9uIChkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZW1vdmUgdW5zaGlmdCBmdW5jdGlvblxuICAgICAgICBkZWxldGUgcS51bnNoaWZ0O1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5jYXJnbyA9IGZ1bmN0aW9uICh3b3JrZXIsIHBheWxvYWQpIHtcbiAgICAgICAgcmV0dXJuIF9xdWV1ZSh3b3JrZXIsIDEsIHBheWxvYWQpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfY29uc29sZV9mbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY29uc29sZVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FycmF5RWFjaChhcmdzLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGVbbmFtZV0oeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMubG9nID0gX2NvbnNvbGVfZm4oJ2xvZycpO1xuICAgIGFzeW5jLmRpciA9IF9jb25zb2xlX2ZuKCdkaXInKTtcbiAgICAvKmFzeW5jLmluZm8gPSBfY29uc29sZV9mbignaW5mbycpO1xuICAgIGFzeW5jLndhcm4gPSBfY29uc29sZV9mbignd2FybicpO1xuICAgIGFzeW5jLmVycm9yID0gX2NvbnNvbGVfZm4oJ2Vycm9yJyk7Ki9cblxuICAgIGFzeW5jLm1lbW9pemUgPSBmdW5jdGlvbiAoZm4sIGhhc2hlcikge1xuICAgICAgICB2YXIgbWVtbyA9IHt9O1xuICAgICAgICB2YXIgcXVldWVzID0ge307XG4gICAgICAgIGhhc2hlciA9IGhhc2hlciB8fCBpZGVudGl0eTtcbiAgICAgICAgdmFyIG1lbW9pemVkID0gX3Jlc3RQYXJhbShmdW5jdGlvbiBtZW1vaXplZChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIGtleSA9IGhhc2hlci5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChrZXkgaW4gbWVtbykge1xuICAgICAgICAgICAgICAgIGFzeW5jLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgbWVtb1trZXldKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSBpbiBxdWV1ZXMpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldID0gW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcSA9IHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gcS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHFbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG1lbW9pemVkLm1lbW8gPSBtZW1vO1xuICAgICAgICBtZW1vaXplZC51bm1lbW9pemVkID0gZm47XG4gICAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9O1xuXG4gICAgYXN5bmMudW5tZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZuLnVubWVtb2l6ZWQgfHwgZm4pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF90aW1lcyhtYXBwZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb3VudCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBtYXBwZXIoX3JhbmdlKGNvdW50KSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy50aW1lcyA9IF90aW1lcyhhc3luYy5tYXApO1xuICAgIGFzeW5jLnRpbWVzU2VyaWVzID0gX3RpbWVzKGFzeW5jLm1hcFNlcmllcyk7XG4gICAgYXN5bmMudGltZXNMaW1pdCA9IGZ1bmN0aW9uIChjb3VudCwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMubWFwTGltaXQoX3JhbmdlKGNvdW50KSwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgdmFyIGZucyA9IGFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYXJncy5wb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBub29wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5yZWR1Y2UoZm5zLCBhcmdzLCBmdW5jdGlvbiAobmV3YXJncywgZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgbmV3YXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgbmV4dGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoZXJyLCBuZXh0YXJncyk7XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoYXQsIFtlcnJdLmNvbmNhdChyZXN1bHRzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmNvbXBvc2UgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5zZXEuYXBwbHkobnVsbCwgQXJyYXkucHJvdG90eXBlLnJldmVyc2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBfYXBwbHlFYWNoKGVhY2hmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbihmbnMsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBnbyA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlYWNoZm4oZm5zLCBmdW5jdGlvbiAoZm4sIF8sIGNiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MuY29uY2F0KFtjYl0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5hcHBseUVhY2ggPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZik7XG4gICAgYXN5bmMuYXBwbHlFYWNoU2VyaWVzID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2ZTZXJpZXMpO1xuXG5cbiAgICBhc3luYy5mb3JldmVyID0gZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZG9uZSA9IG9ubHlfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHRhc2sgPSBlbnN1cmVBc3luYyhmbik7XG4gICAgICAgIGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhc2sobmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBlbnN1cmVBc3luYyhmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5lbnN1cmVBc3luYyA9IGVuc3VyZUFzeW5jO1xuXG4gICAgYXN5bmMuY29uc3RhbnQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgYXJncyA9IFtudWxsXS5jb25jYXQodmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXN5bmMud3JhcFN5bmMgPVxuICAgIGFzeW5jLmFzeW5jaWZ5ID0gZnVuY3Rpb24gYXN5bmNpZnkoZnVuYykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgcmVzdWx0IGlzIFByb21pc2Ugb2JqZWN0XG4gICAgICAgICAgICBpZiAoX2lzT2JqZWN0KHJlc3VsdCkgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLm1lc3NhZ2UgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBOb2RlLmpzXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmM7XG4gICAgfVxuICAgIC8vIEFNRCAvIFJlcXVpcmVKU1xuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhc3luYztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGluY2x1ZGVkIGRpcmVjdGx5IHZpYSA8c2NyaXB0PiB0YWdcbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IGFzeW5jO1xuICAgIH1cblxufSgpKTtcbiIsIlxuLy8gbm90IGltcGxlbWVudGVkXG4vLyBUaGUgcmVhc29uIGZvciBoYXZpbmcgYW4gZW1wdHkgZmlsZSBhbmQgbm90IHRocm93aW5nIGlzIHRvIGFsbG93XG4vLyB1bnRyYWRpdGlvbmFsIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbW9kdWxlLlxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIl19
;