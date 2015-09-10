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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9CdXR0b24uanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvQ2hlY2tHcm91cC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21iby5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21ib0xpc3QuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvRGF0ZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9Ecm9wVGFyZ2V0LmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0ZvbGRUcmVlLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0dyb3VwLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0h5cGVybGluay5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbWFnZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dExpc3QuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvTGlzdC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9SYWRpb0dyb3VwLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1NlbGVjdC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9TdXBlckNvbWJvLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1RleHQuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGV4dGFyZWEuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGltZS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9XcmFwcGVyLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9BbGVydC5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvY29tcG9uZW50cy9ib290c3RyYXAvRGlhbG9nLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bi5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvZm9ybXMvRm9ybS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvZm9ybXMvZ2VuZXJhdG9yLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9mb3Jtcy9pdGVtX3R5cGVzLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL2xpYi9mb3Jtcy9yZWdpc3RyeS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvbWlsby11aS5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9saWIvdXNlX2NvbXBvbmVudHMuanMiLCIvVXNlcnMvamFzb25pYW5ncmVlbi93b3JrL0NDL21pbG8tdWkvbm9kZV9tb2R1bGVzL2FzeW5jL2xpYi9hc3luYy5qcyIsIi9Vc2Vycy9qYXNvbmlhbmdyZWVuL3dvcmsvQ0MvbWlsby11aS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2ZzLmpzIiwiL1VzZXJzL2phc29uaWFuZ3JlZW4vd29yay9DQy9taWxvLXVpL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNob0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxCdXR0b24gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQnV0dG9uJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1idXR0b24nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxCdXR0b24pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQnV0dG9uO1xuXG5fLmV4dGVuZFByb3RvKE1MQnV0dG9uLCB7XG4gICAgZGlzYWJsZTogTUxCdXR0b24kZGlzYWJsZSxcbiAgICBpc0Rpc2FibGVkOiBNTEJ1dHRvbiRpc0Rpc2FibGVkXG59KTtcblxuXG5mdW5jdGlvbiBNTEJ1dHRvbiRkaXNhYmxlKGRpc2FibGUpIHtcbiAgICB0aGlzLmVsLmRpc2FibGVkID0gZGlzYWJsZTtcbn1cblxuZnVuY3Rpb24gTUxCdXR0b24kaXNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLmVsLmRpc2FibGVkO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCB1bmlxdWVJZCA9IG1pbG8udXRpbC51bmlxdWVJZDtcblxuXG52YXIgQ0hFQ0tFRF9DSEFOR0VfTUVTU0FHRSA9ICdtbGNoZWNrZ3JvdXBjaGFuZ2UnXG4gICAgLCBFTEVNRU5UX05BTUVfUFJPUEVSVFkgPSAnX21sQ2hlY2tHcm91cEVsZW1lbnRJRCdcbiAgICAsIEVMRU1FTlRfTkFNRV9QUkVGSVggPSAnbWwtY2hlY2stZ3JvdXAtJztcblxudmFyIE1MQ2hlY2tHcm91cCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxDaGVja0dyb3VwJywge1xuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTENoZWNrR3JvdXBfc2V0LFxuICAgICAgICBnZXQ6IE1MQ2hlY2tHcm91cF9nZXQsXG4gICAgICAgIGRlbDogTUxDaGVja0dyb3VwX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBDSEVDS0VEX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnY2xpY2snOiB7IHN1YnNjcmliZXI6IG9uR3JvdXBDbGljaywgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1yYWRpby1ncm91cCdcbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAgJ3t7fiBpdC5jaGVja09wdGlvbnMgOm9wdGlvbiB9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAge3sjI2RlZi5lbElEOnt7PSBpdC5lbGVtZW50TmFtZSB9fS17ez0gb3B0aW9uLnZhbHVlIH19I319IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInt7PSBpdC5fcmVuZGVyT3B0aW9ucy5vcHRpb25Dc3NDbGFzcyB8fCBcIicgKyBFTEVNRU5UX05BTUVfUFJFRklYICsgJ29wdGlvblwiIH19XCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwie3sjIGRlZi5lbElEIH19XCIgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCJ7ez0gb3B0aW9uLnZhbHVlIH19XCIgbmFtZT1cInt7PSBpdC5lbGVtZW50TmFtZSB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ7eyMgZGVmLmVsSUQgfX1cIj57ez0gb3B0aW9uLmxhYmVsIH19PC9sYWJlbD4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcbiAgICAgICAgICAgICAgICAgICAge3t+fX0gXFxcbiAgICAgICAgICAgICAgICAgICAge3s/aXQuX3JlbmRlck9wdGlvbnMuc2VsZWN0QWxsfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7IyNkZWYuYWxsSUQ6e3s9IGl0LmVsZW1lbnROYW1lIH19LWFsbCN9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCInICsgRUxFTUVOVF9OQU1FX1BSRUZJWCArICdhbGxcIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJ7eyMgZGVmLmFsbElEIH19XCIgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCJhbGxcIiBuYW1lPVwiYWxsXCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInt7IyBkZWYuYWxsSUQgfX1cIj5BbGw8L2xhYmVsPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiBcXFxuICAgICAgICAgICAgICAgICAgICB7ez99fSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTENoZWNrR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQ2hlY2tHcm91cDtcblxuXG5fLmV4dGVuZFByb3RvKE1MQ2hlY2tHcm91cCwge1xuICAgIGluaXQ6IE1MQ2hlY2tHcm91cCRpbml0LFxuICAgIGRlc3Ryb3k6IE1MQ2hlY2tHcm91cCRkZXN0cm95LFxuICAgIHNldFNlbGVjdEFsbDogTUxDaGVja0dyb3VwJHNldFNlbGVjdEFsbFxufSk7XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXplIHJhZGlvIGdyb3VwIGFuZCBzZXR1cFxuICovXG5mdW5jdGlvbiBNTENoZWNrR3JvdXAkaW5pdCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnR5KHRoaXMsIEVMRU1FTlRfTkFNRV9QUk9QRVJUWSwgRUxFTUVOVF9OQU1FX1BSRUZJWCArIHVuaXF1ZUlkKCkpO1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMgPSB7fTtcbiAgICB0aGlzLl9jaGVja0VscyA9IHt9O1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cCRzZXRTZWxlY3RBbGwoc2VsZWN0QWxsKSB7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucy5zZWxlY3RBbGwgPSBzZWxlY3RBbGw7XG59XG5cblxuLyoqXG4gKiBTZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXBsYWNlcyB0aGUgZGF0YSBzZXQgb3BlcmF0aW9uIHRvIGRlYWwgd2l0aCByYWRpbyBidXR0b25zXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGJlIHNldFxuICovXG5mdW5jdGlvbiBNTENoZWNrR3JvdXBfc2V0KHZhbHVlT2JqKSB7XG4gICAgXy5lYWNoS2V5KHRoaXMuX2NoZWNrRWxzLCBmdW5jdGlvbiAoZWwsIGtleSkge1xuICAgICAgICBlbC5jaGVja2VkID0gISF2YWx1ZU9ialtrZXldO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogR2V0cyBncm91cCB2YWx1ZVxuICogUmV0cmlldmVzIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiB0aGUgZ3JvdXBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cF9nZXQoKSB7XG4gICAgcmV0dXJuIF8ubWFwS2V5cyh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHJldHVybiBlbC5jaGVja2VkO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogRGVsZXRlZCBncm91cCB2YWx1ZVxuICogRGVsZXRlcyB0aGUgdmFsdWUgb2YgdGhlIGdyb3VwLCBzZXR0aW5nIGl0IHRvIGVtcHR5XG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cF9kZWwoKSB7XG4gICAgXy5lYWNoS2V5KHRoaXMuX29wdGlvbkVscywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5cbi8qKlxuICogTWFuYWdlIHJhZGlvIGNoaWxkcmVuIGNsaWNrc1xuICovXG5mdW5jdGlvbiBvbkdyb3VwQ2xpY2soZXZlbnRUeXBlLCBldmVudCkge1xuICAgIHZhciBjbGlja2VkRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICB2YXIgY2hlY2tib3hMaXN0ID0gdGhpcy5jb250YWluZXIuc2NvcGUuY2hlY2tib3hMaXN0O1xuXG4gICAgaWYgKGNsaWNrZWRFbGVtZW50LnR5cGUgIT09ICdjaGVja2JveCcpIHJldHVybjtcblxuICAgIGlmIChjbGlja2VkRWxlbWVudC5uYW1lID09PSAnYWxsJykge1xuICAgICAgICBfLmVhY2hLZXkodGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCwga2V5KSB7XG4gICAgICAgICAgICBlbC5jaGVja2VkID0gY2xpY2tlZEVsZW1lbnQuY2hlY2tlZDtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGlzQ2hlY2tlZCA9IGNsaWNrZWRFbGVtZW50LmNoZWNrZWQgJiYgaXNBbGxFbGVtZW50Q2hlY2tlZC5jYWxsKHRoaXMpO1xuICAgICAgICBzZXRBbGxDaGVja2VkLmNhbGwodGhpcywgaXNDaGVja2VkKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gc2V0QWxsQ2hlY2tlZChjaGVja2VkKSB7XG4gICAgdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiYWxsXCJdJykuY2hlY2tlZCA9IGNoZWNrZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQWxsRWxlbWVudENoZWNrZWQoZGF0YSkge1xuICAgIHJldHVybiBfLmV2ZXJ5S2V5KHRoaXMuX2NoZWNrRWxzLCBmdW5jdGlvbiAoZWwpIHsgcmV0dXJuIGVsLmNoZWNrZWQ7IH0pO1xufVxuXG4vLyBQb3N0IHRoZSBkYXRhIGNoYW5nZVxuZnVuY3Rpb24gZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoQ0hFQ0tFRF9DSEFOR0VfTUVTU0FHRSk7XG59XG5cblxuLy8gU2V0IHJhZGlvIGJ1dHRvbiBjaGlsZHJlbiBvbiBtb2RlbCBjaGFuZ2VcbmZ1bmN0aW9uIG9uT3B0aW9uc0NoYW5nZShwYXRoLCBkYXRhKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoe1xuICAgICAgICBjaGVja09wdGlvbnM6IHRoaXMubW9kZWwuZ2V0KCksXG4gICAgICAgIGVsZW1lbnROYW1lOiB0aGlzW0VMRU1FTlRfTkFNRV9QUk9QRVJUWV0sXG4gICAgICAgIF9yZW5kZXJPcHRpb25zOiB0aGlzLl9yZW5kZXJPcHRpb25zXG4gICAgfSk7XG5cbiAgICB0aGlzLl9jaGVja0VscyA9IHt9O1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBfLmZvckVhY2godGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSwgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIGlmIChlbC5uYW1lICE9ICdhbGwnKSBzZWxmLl9jaGVja0Vsc1tlbC52YWx1ZV0gPSBlbDtcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBNTENoZWNrR3JvdXAkZGVzdHJveSgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2hlY2tFbHM7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBDT01CT19DSEFOR0VfTUVTU0FHRSA9ICdtbGNvbWJvY2hhbmdlJztcblxudmFyIERBVEFMSVNUX1RFTVBMQVRFID0gJ3t7fiBpdC5jb21ib09wdGlvbnMgOm9wdGlvbiB9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJ7ez0gb3B0aW9uLmxhYmVsIH19XCI+PC9vcHRpb24+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAge3t+fX0nO1xuXG52YXIgTUxDb21ibyA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxDb21ibycsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxDb21ib19nZXQsXG4gICAgICAgIHNldDogTUxDb21ib19zZXQsXG4gICAgICAgIGRlbDogTUxDb21ib19kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogQ09NQk9fQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktZGF0YWxpc3QnXG4gICAgfSxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxDb21ibyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxDb21ibztcblxuXG5fLmV4dGVuZFByb3RvKE1MQ29tYm8sIHtcbiAgICBpbml0OiBNTENvbWJvJGluaXRcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MQ29tYm8kaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuZnVuY3Rpb24gb25DaGlsZHJlbkJvdW5kKCkge1xuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICdfY29tYm9JbnB1dCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmlucHV0LFxuICAgICAgICAnX2NvbWJvTGlzdCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmRhdGFsaXN0XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jb21ib0xpc3QudGVtcGxhdGUuc2V0KERBVEFMSVNUX1RFTVBMQVRFKTtcblxuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5vbignaW5wdXQnLFxuICAgICAgICB7IHN1YnNjcmliZXI6IGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib19nZXQoKSB7XG4gICAgaWYgKCEgdGhpcy5fY29tYm9JbnB1dCkgcmV0dXJuO1xuICAgIHJldHVybiB0aGlzLl9jb21ib0lucHV0LmRhdGEuZ2V0KCk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9fc2V0KHZhbHVlKSB7XG4gICAgcmV0dXJuIGNoYW5nZUNvbWJvRGF0YS5jYWxsKHRoaXMsICdzZXQnLCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9fZGVsKCkge1xuICAgIHJldHVybiBjaGFuZ2VDb21ib0RhdGEuY2FsbCh0aGlzLCAnZGVsJywgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VDb21ib0RhdGEobWV0aG9kLCB2YWx1ZSkge1xuICAgIGlmICghIHRoaXMuX2NvbWJvSW5wdXQpIHJldHVybjtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY29tYm9JbnB1dC5kYXRhW21ldGhvZF0odmFsdWUpO1xuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENPTUJPX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIHRoaXMuX2NvbWJvTGlzdC50ZW1wbGF0ZS5yZW5kZXIoe1xuICAgICAgICBjb21ib09wdGlvbnM6IHRoaXMubW9kZWwuZ2V0KClcbiAgICB9KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGNoZWNrID0gbWlsby51dGlsLmNoZWNrXG4gICAgLCBNYXRjaCA9IGNoZWNrLk1hdGNoO1xuXG52YXIgQ09NQk9fTElTVF9DSEFOR0VfTUVTU0FHRSA9ICdtbGNvbWJvbGlzdGNoYW5nZSc7XG5cblxudmFyIE1MQ29tYm9MaXN0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTENvbWJvTGlzdCcsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktY29tYm8tbGlzdCdcbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTENvbWJvTGlzdF9nZXQsXG4gICAgICAgIHNldDogTUxDb21ib0xpc3Rfc2V0LFxuICAgICAgICBkZWw6IE1MQ29tYm9MaXN0X2RlbCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0xJU1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgbWwtYmluZD1cIk1MU3VwZXJDb21ibzpjb21ib1wiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0Omxpc3RcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJNTExpc3RJdGVtOml0ZW1cIiBjbGFzcz1cImxpc3QtaXRlbVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiW2RhdGFdOmxhYmVsXCI+PC9zcGFuPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiW2V2ZW50c106ZGVsZXRlQnRuXCIgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDwvZGl2PidcbiAgICB9XG59KTtcblxuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQ29tYm9MaXN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTENvbWJvTGlzdDtcblxuXG5fLmV4dGVuZFByb3RvKE1MQ29tYm9MaXN0LCB7XG4gICAgaW5pdDogTUxDb21ib0xpc3QkaW5pdCxcbiAgICBzZXRPcHRpb25zOiBNTENvbWJvTGlzdCRzZXRPcHRpb25zLFxuICAgIHNldERhdGFWYWxpZGF0aW9uOiBNTENvbWJvTGlzdCRzZXREYXRhVmFsaWRhdGlvbixcbiAgICB0b2dnbGVBZGRCdXR0b246IE1MQ29tYm9MaXN0JHRvZ2dsZUFkZEJ1dHRvbixcbiAgICBkZXN0cm95OiBNTENvbWJvTGlzdCRkZXN0cm95LFxuICAgIHNldEFkZEl0ZW1Qcm9tcHQ6IE1MQ29tYm9MaXN0JHNldEFkZEl0ZW1Qcm9tcHQsXG4gICAgY2xlYXJDb21ib0lucHV0IDogTUxDb21ib0xpc3QkY2xlYXJDb21ib0lucHV0XG59KTtcblxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMubW9kZWwuc2V0KFtdKTtcbiAgICB0aGlzLm9uY2UoJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHNldERhdGFWYWxpZGF0aW9uKGRhdGFWYWxpZGF0aW9uKSB7XG4gICAgY2hlY2soZGF0YVZhbGlkYXRpb24sIE1hdGNoLk9wdGlvbmFsKEZ1bmN0aW9uKSk7XG4gICAgdGhpcy5fZGF0YVZhbGlkYXRpb24gPSBkYXRhVmFsaWRhdGlvbjtcbn1cblxuZnVuY3Rpb24gTUxDb21ib0xpc3Qkc2V0T3B0aW9ucyhhcnIpIHtcbiAgICB0aGlzLl9jb21iby5zZXRPcHRpb25zKGFycik7XG59XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3QkY2xlYXJDb21ib0lucHV0ICgpIHtcbiAgICB0aGlzLl9jb21iby5jbGVhckNvbWJvSW5wdXQoKTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBIaWRlcyBhZGQgYnV0dG9uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNob3dcbiAqL1xuZnVuY3Rpb24gTUxDb21ib0xpc3QkdG9nZ2xlQWRkQnV0dG9uKHNob3cpIHtcbiAgICB0aGlzLl9jb21iby50b2dnbGVBZGRCdXR0b24oc2hvdyk7XG59XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3Qkc2V0QWRkSXRlbVByb21wdChwcm9tcHQpIHtcbiAgIHRoaXMuX2NvbWJvLnNldEFkZEl0ZW1Qcm9tcHQocHJvbXB0KTtcbn1cblxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRkZXN0cm95KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciAmJiBtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKHRoaXMuX2Nvbm5lY3Rvcik7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbn1cblxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoKS5iaW5kZXIoKTtcbiAgICBjb21wb25lbnRTZXR1cC5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnRTZXR1cCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAnX2NvbWJvJzogdGhpcy5jb250YWluZXIuc2NvcGUuY29tYm8sXG4gICAgICAgICdfbGlzdCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmxpc3RcbiAgICB9KTtcblxuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG1pbG8ubWluZGVyKHRoaXMuX2xpc3QubW9kZWwsICc8PDwtPj4+JywgdGhpcy5tb2RlbCk7XG4gICAgdGhpcy5fY29tYm8uZGF0YS5vbignJywgeyBzdWJzY3JpYmVyOiBvbkNvbWJvQ2hhbmdlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIHRoaXMuX2NvbWJvLm9uKCdhZGRpdGVtJywgeyBzdWJzY3JpYmVyOiBvbkFkZEl0ZW0sIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cbmZ1bmN0aW9uIG9uQ29tYm9DaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgaWYgKGRhdGEubmV3VmFsdWUgJiYgcnVuRGF0YVZhbGlkYXRpb24uY2FsbCh0aGlzLCBtc2csIGRhdGEpKVxuICAgICAgICB0aGlzLl9saXN0Lm1vZGVsLnB1c2goZGF0YS5uZXdWYWx1ZSk7XG4gICAgdGhpcy5fY29tYm8uZGF0YS5kZWwoKTtcbiAgICAvLyBiZWNhdXNlIG9mIHN1cGVyY29tYm8gbGlzdGVuZXJzIG9mZiB5b3UgaGF2ZSB0byBzZXQgX3ZhbHVlIGV4cGxpY2l0bHlcbiAgICB0aGlzLl9jb21iby5kYXRhLl92YWx1ZSA9ICcnO1xufVxuXG5mdW5jdGlvbiBydW5EYXRhVmFsaWRhdGlvbihtc2csIGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVZhbGlkYXRpb24gXG4gICAgICAgID8gdGhpcy5fZGF0YVZhbGlkYXRpb24obXNnLCBkYXRhLCB0aGlzLl9saXN0Lm1vZGVsLmdldCgpKVxuICAgICAgICA6IHRydWU7XG59XG5cbmZ1bmN0aW9uIG9uSXRlbXNDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19MSVNUX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib0xpc3RfZ2V0KCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0KCk7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyA/IF8uY2xvbmUodmFsdWUpIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0X3NldCh2YWx1ZSkge1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib0xpc3RfZGVsKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGVsLnNldChbXSk7XG59XG5cblxuZnVuY3Rpb24gb25BZGRJdGVtKG1zZywgZGF0YSkge1xuICAgIHRoaXMucG9zdE1lc3NhZ2UoJ2FkZGl0ZW0nLCBkYXRhKTtcbiAgICB0aGlzLmV2ZW50cy5wb3N0TWVzc2FnZSgnbWlsb19jb21ib2xpc3RhZGRpdGVtJywgZGF0YSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG52YXIgTUxEYXRlID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTERhdGUnLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MRGF0ZV9nZXQsXG4gICAgICAgIHNldDogTUxEYXRlX3NldCxcbiAgICAgICAgZGVsOiBNTERhdGVfZGVsLFxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWRhdGUnXG4gICAgfVxufSk7XG5cbl8uZXh0ZW5kUHJvdG8oTUxEYXRlLCB7XG4gICAgZ2V0TWluOiBNTERhdGUkZ2V0TWluLFxuICAgIHNldE1pbjogTUxEYXRlJHNldE1pbixcbiAgICBnZXRNYXg6IE1MRGF0ZSRnZXRNYXgsXG4gICAgc2V0TWF4OiBNTERhdGUkc2V0TWF4XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERhdGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRGF0ZTtcblxuXG5mdW5jdGlvbiBNTERhdGUkZ2V0TWluKCkge1xuICAgIHJldHVybiBfLmRhdGUodGhpcy5lbC5taW4pO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZSRzZXRNaW4odmFsdWUpIHtcbiAgICB2YXIgZGF0ZSA9IF8udG9EYXRlKHZhbHVlKTtcblxuICAgIHRoaXMuZWwubWluID0gZGF0ZSA/IHRvSVNPODYwMUZvcm1hdChkYXRlKSA6ICcnO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZSRnZXRNYXgoKSB7XG4gICAgcmV0dXJuIF8uZGF0ZSh0aGlzLmVsLm1heCk7XG59XG5cblxuZnVuY3Rpb24gTUxEYXRlJHNldE1heCh2YWx1ZSkge1xuICAgIHZhciBkYXRlID0gXy50b0RhdGUodmFsdWUpO1xuXG4gICAgdGhpcy5lbC5tYXggPSBkYXRlID8gdG9JU084NjAxRm9ybWF0KGRhdGUpIDogJyc7XG59XG5cblxuZnVuY3Rpb24gTUxEYXRlX2dldCgpIHtcbiAgICByZXR1cm4gXy50b0RhdGUodGhpcy5lbC52YWx1ZSk7XG59XG5cblxuZnVuY3Rpb24gTUxEYXRlX3NldCh2YWx1ZSkge1xuICAgIHZhciBkYXRlID0gXy50b0RhdGUodmFsdWUpO1xuXG4gICAgdGhpcy5lbC52YWx1ZSA9IGRhdGUgPyB0b0lTTzg2MDFGb3JtYXQoZGF0ZSkgOiAnJztcblxuICAgIGRpc3BhdGNoSW5wdXRNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIE1MRGF0ZV9kZWwoKSB7XG4gICAgdGhpcy5lbC52YWx1ZSA9ICcnO1xuXG4gICAgZGlzcGF0Y2hJbnB1dE1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBkaXNwYXRjaElucHV0TWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKCdpbnB1dCcpOyAvLyBEaXNwYXRjaCB0aGUgJ2lucHV0JyAodXN1YWxseSBkaXNwYXRjaGVkIGJ5IHRoZSB1bmRlcmx5aW5nIDxpbnB1dD4gZWxlbWVudCkgZXZlbnQgc28gdGhhdCB0aGUgZGF0YSBjaGFuZ2UgY2FuIGJlIGxpc3RlbmVkIHRvXG59XG5cblxuZnVuY3Rpb24gdG9JU084NjAxRm9ybWF0KGRhdGUpIHtcbiAgICB2YXIgZGF0ZUFyciA9IFtcbiAgICAgICAgZGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSksXG4gICAgICAgIHBhZChkYXRlLmdldERhdGUoKSlcbiAgICBdO1xuXG4gICAgdmFyIGRhdGVTdHIgPSBkYXRlQXJyLmpvaW4oJy0nKTtcblxuICAgIHJldHVybiBkYXRlU3RyO1xuXG4gICAgZnVuY3Rpb24gcGFkKG4pIHsgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4gOiBuOyB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTERyb3BUYXJnZXQgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRHJvcFRhcmdldCcsIFsnZHJvcCddKTtcblxuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MRHJvcFRhcmdldCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEcm9wVGFyZ2V0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9UID0gbWlsby51dGlsLmRvVFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgdW5pcXVlSWQgPSBtaWxvLnV0aWwudW5pcXVlSWQ7XG5cbnZhciBUUkVFX1RFTVBMQVRFID0gJzx1bCBjbGFzcz1cIm1sLXVpLWZvbGR0cmVlLWxpc3RcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAge3t+IGl0LmRhdGEuaXRlbXMgOml0ZW06aW5kZXggfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IHZhciBoYXNTdWJUcmVlID0gaXRlbS5pdGVtcyAmJiBpdGVtLml0ZW1zLmxlbmd0aDsgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSB7ez8gaGFzU3ViVHJlZSB9fWNsYXNzPVwibWwtdWktZm9sZHRyZWUtLWhhcy1tdWx0aXBsZVwie3s/fX0+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1sLXVpLWZvbGR0cmVlLWl0ZW1cIiBkYXRhLWl0ZW0taWQ9XCJ7ez0gaXQuaXRlbUlEc1tpbmRleF0gfX1cIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGhhc1N1YlRyZWUgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1idXR0b25cIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s9IGl0Lml0ZW1UZW1wbGF0ZSh7IGl0ZW06IGl0ZW0gfSkgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez8gaGFzU3ViVHJlZSB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez0gaXQudHJlZVRlbXBsYXRlKGl0ZW0pIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19XFxcbiAgICAgICAgICAgICAgICAgICAgPC91bD4nO1xuXG52YXIgREVGQVVMVF9DT01QSUxFRF9JVEVNX1RFTVBMQVRFID0gZG9ULmNvbXBpbGUoJ1xcXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1sLXVpLWZvbGR0cmVlLWxhYmVsXCI+XFxcbiAgICAgICAgICAgICAgICB7ez0gaXQuaXRlbS5sYWJlbCB9fVxcXG4gICAgICAgICAgICA8L3NwYW4+JylcbiAgICAsIENPTVBJTEVEX1RSRUVfVEVNUExBVEUgPSBkb1QuY29tcGlsZShUUkVFX1RFTVBMQVRFKTtcblxuXG52YXIgTUxGb2xkVHJlZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxGb2xkVHJlZScsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjbGljayBkYmxjbGljayc6IHsgc3Vic2NyaWJlcjogb25JdGVtRXZlbnQsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktZm9sZHRyZWUtbWFpbidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEZvbGRUcmVlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEZvbGRUcmVlO1xuXG5fLmV4dGVuZFByb3RvKE1MRm9sZFRyZWUsIHtcbiAgICBzZXRJdGVtVGVtcGxhdGU6IE1MRm9sZFRyZWUkc2V0SXRlbVRlbXBsYXRlLFxuICAgIHJlbmRlclRyZWU6IE1MRm9sZFRyZWUkcmVuZGVyVHJlZSxcbiAgICBzZXRBY3RpdmVJdGVtOiBNTEZvbGRUcmVlJHNldEFjdGl2ZUl0ZW0sXG4gICAgdG9nZ2xlSXRlbTogTUxGb2xkVHJlZSR0b2dnbGVJdGVtXG59KTtcblxuZnVuY3Rpb24gZm9sZFVuZm9sZChlbCwgb3BlbmVkKSB7XG4gICAgaWYgKG9wZW5lZClcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnbWwtdWktZm9sZHRyZWUtLXVuZm9sZCcsIG9wZW5lZCk7XG4gICAgZWxzZVxuICAgICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKCdtbC11aS1mb2xkdHJlZS0tdW5mb2xkJyk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1NZXNzYWdlKG1zZywgZWwpIHtcbiAgICB2YXIgaWQgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaXRlbS1pZCcpXG4gICAgICAgICwgaXRlbSA9IHRoaXMuX2l0ZW1zTWFwW2lkXTtcblxuICAgIHRoaXMucG9zdE1lc3NhZ2UoJ21sZm9sZHRyZWVfJyArIG1zZywge1xuICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICBlbDogZWxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gb25JdGVtRXZlbnQobXNnLCBlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnbWwtdWktZm9sZHRyZWUtYnV0dG9uJykpXG4gICAgICAgIGZvbGRVbmZvbGQoZWwucGFyZW50Tm9kZS5wYXJlbnROb2RlKTtcbiAgICBlbHNlIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ21sLXVpLWZvbGR0cmVlLWxhYmVsJykpXG4gICAgICAgIGl0ZW1NZXNzYWdlLmNhbGwodGhpcywgbXNnLCBlbC5wYXJlbnROb2RlKTtcbiAgICBlbHNlIHJldHVybjtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xufVxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHNldEl0ZW1UZW1wbGF0ZSAodGVtcGxhdGVTdHIpIHtcbiAgICB0aGlzLl9pdGVtVGVtcGxhdGUgPSBkb1QuY29tcGlsZSh0ZW1wbGF0ZVN0cik7XG59XG5cbmZ1bmN0aW9uIE1MRm9sZFRyZWUkcmVuZGVyVHJlZSAoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgICBzZWxmLl9pdGVtc01hcCA9IHt9O1xuICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gX3JlbmRlclRyZWUoZGF0YSk7XG5cbiAgICBmdW5jdGlvbiBfcmVuZGVyVHJlZSAoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5pdGVtcylcbiAgICAgICAgICAgIHZhciBpdGVtc0lEcyA9IF8ubWFwKGRhdGEuaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBpdGVtLmlkIHx8IHVuaXF1ZUlkKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2l0ZW1zTWFwW2lkXSkgdGhyb3cgbmV3IEVycm9yKCdNTEZvbGRUcmVlOiBpdGVtIGhhcyBkdXBsaWNhdGUgSUQ6JyArIGlkKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pdGVtc01hcFtpZF0gPSBpdGVtO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBDT01QSUxFRF9UUkVFX1RFTVBMQVRFKHtcbiAgICAgICAgICAgIGl0ZW1JRHM6IGl0ZW1zSURzLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIGl0ZW1UZW1wbGF0ZTogc2VsZi5faXRlbVRlbXBsYXRlIHx8IERFRkFVTFRfQ09NUElMRURfSVRFTV9URU1QTEFURSxcbiAgICAgICAgICAgIHRyZWVUZW1wbGF0ZTogX3JlbmRlclRyZWVcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIE1MRm9sZFRyZWUkc2V0QWN0aXZlSXRlbShpZCwgY3NzQ2xhc3MpIHtcbiAgICBjc3NDbGFzcyA9IGNzc0NsYXNzIHx8ICdtbC11aS1mb2xkdHJlZS1hY3RpdmUnO1xuICAgIHZhciBpdGVtcyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnZGl2Lm1sLXVpLWZvbGR0cmVlLWl0ZW0nKTtcbiAgICBfLmZvckVhY2goaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKGNzc0NsYXNzKTtcbiAgICB9KTtcbiAgICBpZiAoaWQpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5tbC11aS1mb2xkdHJlZS1pdGVtW2RhdGEtaXRlbS1pZD1cIicgKyBpZCArICdcIl0nKTtcbiAgICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKGNzc0NsYXNzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIE1MRm9sZFRyZWUkdG9nZ2xlSXRlbShpZCwgb3BlbmVkKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5tbC11aS1mb2xkdHJlZS1pdGVtW2RhdGEtaXRlbS1pZD1cIicgKyBpZCArICdcIl0nKTtcbiAgICBmb2xkVW5mb2xkKGl0ZW0ucGFyZW50Tm9kZSwgb3BlbmVkKTtcbn1cblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTEdyb3VwID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEdyb3VwJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktZ3JvdXAnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxHcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxHcm91cDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MSHlwZXJsaW5rID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEh5cGVybGluaycsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWh5cGVybGluaydcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEh5cGVybGluayk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxIeXBlcmxpbms7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBJTUFHRV9DSEFOR0VfTUVTU0FHRSA9ICdtbGltYWdlY2hhbmdlJztcblxudmFyIE1MSW1hZ2UgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MSW1hZ2UnLCB7XG4gICAgZGF0YToge1xuICAgICAgICBzZXQ6IE1MSW1hZ2Vfc2V0LFxuICAgICAgICBnZXQ6IE1MSW1hZ2VfZ2V0LFxuICAgICAgICBkZWw6IE1MSW1hZ2VfZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IElNQUdFX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJy5zcmMnOiB7IHN1YnNjcmliZXI6IG9uTW9kZWxDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgdGFnTmFtZTogJ2ltZycsXG4gICAgICAgIGNsczogJ21sLXVpLWltYWdlJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MSW1hZ2UpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSW1hZ2U7XG5cblxuXy5leHRlbmRQcm90byhNTEltYWdlLCB7XG4gICAgaW5pdDogTUxJbWFnZSRpbml0XG59KTtcblxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEluaXRpYWxpemUgcmFkaW8gZ3JvdXAgYW5kIHNldHVwXG4gKi9cbmZ1bmN0aW9uIE1MSW1hZ2UkaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG4vKipcbiAqIFNldHMgaW1hZ2UgdmFsdWVcbiAqIFJlcGxhY2VzIHRoZSBkYXRhIHNldCBvcGVyYXRpb24gdG8gZGVhbCB3aXRoIHJhZGlvIGJ1dHRvbnNcbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgc2V0XG4gKi9cbmZ1bmN0aW9uIE1MSW1hZ2Vfc2V0KHZhbHVlKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQodmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuXG4vKipcbiAqIEdldHMgZ3JvdXAgdmFsdWVcbiAqIFJldHJpZXZlcyB0aGUgc2VsZWN0ZWQgdmFsdWUgb2YgdGhlIGdyb3VwXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBNTEltYWdlX2dldCgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgPyBfLmNsb25lKHZhbHVlKSA6IHZhbHVlO1xufVxuXG5cbi8qKlxuICogRGVsZXRlZCBncm91cCB2YWx1ZVxuICogRGVsZXRlcyB0aGUgdmFsdWUgb2YgdGhlIGdyb3VwLCBzZXR0aW5nIGl0IHRvIGVtcHR5XG4gKi9cbmZ1bmN0aW9uIE1MSW1hZ2VfZGVsKCkge1xuICAgIHRoaXMubW9kZWwuZGVsKCk7XG59XG5cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKElNQUdFX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuXG5mdW5jdGlvbiBvbk1vZGVsQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLmVsLnNyYyA9IGRhdGEubmV3VmFsdWU7XG4gICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTElucHV0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTElucHV0Jywge1xuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktaW5wdXQnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxJbnB1dCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxJbnB1dDtcblxuXy5leHRlbmRQcm90byhNTElucHV0LCB7XG4gICAgZGlzYWJsZTogTUxJbnB1dCRkaXNhYmxlLFxuICAgIGlzRGlzYWJsZWQ6IE1MSW5wdXQkaXNEaXNhYmxlZCxcbiAgICBzZXRNYXhMZW5ndGg6IE1MSW5wdXQkc2V0TWF4TGVuZ3RoXG59KTtcblxuZnVuY3Rpb24gTUxJbnB1dCRkaXNhYmxlKGRpc2FibGUpIHtcbiAgICB0aGlzLmVsLmRpc2FibGVkID0gZGlzYWJsZTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dCRpc0Rpc2FibGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMuZWwuZGlzYWJsZWQ7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXQkc2V0TWF4TGVuZ3RoKGxlbmd0aCkge1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdtYXhsZW5ndGgnLCBsZW5ndGgpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIElOUFVUX0xJU1RfQ0hBTkdFX01FU1NBR0UgPSAnbWxpbnB1dGxpc3RjaGFuZ2UnO1xuXG52YXIgYXN5bmNIYW5kbGVyID0gZnVuY3Rpb24gKHZhbHVlLCBjYWxsYmFjaykge2NhbGxiYWNrKHZhbHVlKTt9O1xuXG52YXIgTUxJbnB1dExpc3QgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MSW5wdXRMaXN0Jywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1pbnB1dC1saXN0J1xuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MSW5wdXRMaXN0X2dldCxcbiAgICAgICAgc2V0OiBNTElucHV0TGlzdF9zZXQsXG4gICAgICAgIGRlbDogTUxJbnB1dExpc3RfZGVsLFxuICAgICAgICBzcGxpY2U6IE1MSW5wdXRMaXN0X3NwbGljZSxcbiAgICAgICAgZXZlbnQ6IElOUFVUX0xJU1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICdcXFxuICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0Omxpc3RcIj5cXFxuICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdEl0ZW06aXRlbVwiIGNsYXNzPVwibGlzdC1pdGVtXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltkYXRhXTpsYWJlbFwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiW2V2ZW50c106ZGVsZXRlQnRuXCIgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbWwtYmluZD1cIk1MSW5wdXQ6aW5wdXRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxcXG4gICAgICAgICAgICA8YnV0dG9uIG1sLWJpbmQ9XCJNTEJ1dHRvbjpidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiPlxcXG4gICAgICAgICAgICAgICAgQWRkXFxcbiAgICAgICAgICAgIDwvYnV0dG9uPidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTElucHV0TGlzdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxJbnB1dExpc3Q7XG5cbl8uZXh0ZW5kUHJvdG8oTUxJbnB1dExpc3QsIHtcbiAgICBpbml0OiBNTElucHV0TGlzdCRpbml0LFxuICAgIHNldEFzeW5jOiBNTElucHV0TGlzdCRzZXRBc3luYyxcbiAgICBzZXRQbGFjZUhvbGRlcjogTUxJbnB1dExpc3Qkc2V0UGxhY2VIb2xkZXIsXG4gICAgZGVzdHJveTogTUxJbnB1dExpc3QkZGVzdHJveVxufSk7XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vbmNlKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbiAgICB0aGlzLm1vZGVsLnNldChbXSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICByZW5kZXIuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Qkc2V0UGxhY2VIb2xkZXIocGxhY2VIb2xkZXIpIHtcbiAgICB0aGlzLl9pbnB1dC5lbC5zZXRBdHRyaWJ1dGUoJ3BsYWNlSG9sZGVyJywgcGxhY2VIb2xkZXIpO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdCRzZXRBc3luYyhuZXdIYW5kbGVyKSB7XG4gICAgYXN5bmNIYW5kbGVyID0gbmV3SGFuZGxlciB8fCBhc3luY0hhbmRsZXI7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JGRlc3Ryb3koKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fY29ubmVjdG9yICYmIG1pbG8ubWluZGVyLmRlc3Ryb3lDb25uZWN0b3IodGhpcy5fY29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoKS5iaW5kZXIoKTtcbiAgICBjb21wb25lbnRTZXR1cC5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnRTZXR1cCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAnX2lucHV0JzogdGhpcy5jb250YWluZXIuc2NvcGUuaW5wdXQsXG4gICAgICAgICdfYnV0dG9uJzogdGhpcy5jb250YWluZXIuc2NvcGUuYnV0dG9uLFxuICAgICAgICAnX2xpc3QnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5saXN0XG4gICAgfSk7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbWlsby5taW5kZXIodGhpcy5fbGlzdC5tb2RlbCwgJzw8PC0+Pj4nLCB0aGlzLm1vZGVsKTtcbiAgICB0aGlzLl9idXR0b24uZXZlbnRzLm9uKCdjbGljaycsIHtzdWJzY3JpYmVyOiBvbkNsaWNrLCBjb250ZXh0OiB0aGlzIH0pOyAgIFxufVxuXG5mdW5jdGlvbiBvbkNsaWNrKG1zZykge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuX2lucHV0LmRhdGEuZ2V0KDApO1xuICAgIGlmICh0aGlzLl9pbnB1dC5kYXRhKVxuICAgICAgICBhc3luY0hhbmRsZXIodmFsdWUsIGZ1bmN0aW9uIChsYWJlbCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3QubW9kZWwucHVzaCh7IGxhYmVsOiBsYWJlbCwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2lucHV0LmRhdGEuZGVsKCk7XG59XG5cbmZ1bmN0aW9uIG9uSXRlbXNDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShJTlBVVF9MSVNUX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3RfZ2V0KCkge1xuICAgIHZhciBtb2RlbCA9IHRoaXMubW9kZWwuZ2V0KCk7XG4gICAgcmV0dXJuIG1vZGVsID8gXy5jbG9uZShtb2RlbCkgOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0X3NldCh2YWx1ZSkge1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3RfZGVsKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGVsLnNldChbXSk7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0X3NwbGljZSgpIHsgLy8gLi4uIGFyZ3VtZW50c1xuICAgIHRoaXMubW9kZWwuc3BsaWNlLmFwcGx5KHRoaXMubW9kZWwsIGFyZ3VtZW50cyk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIExJU1RfQ0hBTkdFX01FU1NBR0UgPSAnbWxsaXN0Y2hhbmdlJ1xuICAgICwgREVMRVRFX0JVVFRPTl9OQU1FID0gJ2RlbGV0ZUJ0bic7XG5cblxudmFyIE1MTGlzdCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxMaXN0Jywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1saXN0J1xuICAgIH0sXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIG1vZGVsOiB1bmRlZmluZWQsXG4gICAgbGlzdDogdW5kZWZpbmVkXG59KTtcblxuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MTGlzdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxMaXN0O1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxMaXN0LCB7XG4gICAgaW5pdDogTUxMaXN0JGluaXQsXG4gICAgZGVzdHJveTogTUxMaXN0JGRlc3Ryb3ksXG4gICAgcmVtb3ZlSXRlbTogTUxMaXN0JHJlbW92ZUl0ZW0sXG4gICAgbW92ZUl0ZW06IE1MTGlzdCRtb3ZlSXRlbVxufSk7XG5cblxuZnVuY3Rpb24gTUxMaXN0JGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vbignY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0JGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fY29ubmVjdG9yICYmIG1pbG8ubWluZGVyLmRlc3Ryb3lDb25uZWN0b3IodGhpcy5fY29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdCRyZW1vdmVJdGVtKGluZGV4KXtcbiAgICB0aGlzLm1vZGVsLnNwbGljZShpbmRleCwgMSk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0JG1vdmVJdGVtKGZyb20sIHRvKSB7XG4gICAgdmFyIHNwbGljZWREYXRhID0gdGhpcy5tb2RlbC5zcGxpY2UoZnJvbSwgMSk7XG4gICAgcmV0dXJuIHRoaXMubW9kZWwuc3BsaWNlKHRvLCAwLCBzcGxpY2VkRGF0YVswXSk7XG59XG5cblxuZnVuY3Rpb24gb25DaGlsZHJlbkJvdW5kKCkge1xuICAgIHRoaXMubW9kZWwuc2V0KFtdKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBtaWxvLm1pbmRlcih0aGlzLm1vZGVsLCAnPDw8LScsIHRoaXMuZGF0YSkuZGVmZXJDaGFuZ2VNb2RlKCc8PDwtPj4+Jyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgRHJhZ0Ryb3AgPSBtaWxvLnV0aWwuZHJhZ0Ryb3BcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTElTVElURU1fQ0hBTkdFX01FU1NBR0UgPSAnbWxsaXN0aXRlbWNoYW5nZSc7XG5cbnZhciBNTExpc3RJdGVtID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTExpc3RJdGVtJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRvbTogdW5kZWZpbmVkLFxuICAgIGRyYWc6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdkcmFnc3RhcnQnOiB7IHN1YnNjcmliZXI6IG9uRHJhZ1N0YXJ0LCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfSxcbiAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgcGFyYW1zOiAnZ2V0TWV0YURhdGEnXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRyb3A6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdkcmFnZW50ZXInOiB7IHN1YnNjcmliZXI6IG9uRHJhZ0hvdmVyLCBjb250ZXh0OiAnb3duZXInIH0sXG4gICAgICAgICAgICAnZHJhZ292ZXInOiB7IHN1YnNjcmliZXI6IG9uRHJhZ0hvdmVyLCBjb250ZXh0OiAnb3duZXInIH0sXG4gICAgICAgICAgICAnZHJhZ2xlYXZlJzogeyBzdWJzY3JpYmVyOiBvbkRyYWdPdXQsIGNvbnRleHQ6ICdvd25lcicgfSxcbiAgICAgICAgICAgICdkcm9wJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1Ecm9wLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfSxcbiAgICAgICAgYWxsb3c6IHtcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IGlzQ29tcG9uZW50QWxsb3dlZFxuICAgICAgICB9XG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxMaXN0SXRlbV9nZXQsXG4gICAgICAgIHNldDogTUxMaXN0SXRlbV9zZXQsXG4gICAgICAgIGRlbDogTUxMaXN0SXRlbV9kZWwsXG4gICAgICAgIGV2ZW50OiBMSVNUSVRFTV9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHVuZGVmaW5lZCxcbiAgICBpdGVtOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MTGlzdEl0ZW0pO1xuXG52YXIgTUxMaXN0SXRlbSA9IG1vZHVsZS5leHBvcnRzID0gTUxMaXN0SXRlbTtcblxuXG5fLmV4dGVuZFByb3RvKE1MTGlzdEl0ZW0sIHtcbiAgICBpbml0OiBNTExpc3RJdGVtJGluaXQsXG4gICAgbW92ZUl0ZW06IE1MTGlzdEl0ZW0kbW92ZUl0ZW0sXG4gICAgcmVtb3ZlSXRlbTogTUxMaXN0SXRlbSRyZW1vdmVJdGVtLFxuICAgIGdldE1ldGFEYXRhOiBNTExpc3RJdGVtJGdldE1ldGFEYXRhLFxuICAgIGlzRHJvcEFsbG93ZWQ6IE1MTGlzdEl0ZW0kaXNEcm9wQWxsb3dlZFxufSk7XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub24oJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICB2YXIgZGVsZXRlQnRuID0gdGhpcy5jb250YWluZXIuc2NvcGUuZGVsZXRlQnRuO1xuICAgIGRlbGV0ZUJ0biAmJiBkZWxldGVCdG4uZXZlbnRzLm9uKCdjbGljaycsIHsgc3Vic2NyaWJlcjogdGhpcy5yZW1vdmVJdGVtLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kcmVtb3ZlSXRlbSgpIHtcbiAgICB0cnkgeyB2YXIgbGlzdE93bmVyID0gdGhpcy5pdGVtLmxpc3Qub3duZXI7IH0gY2F0Y2goZSkge31cbiAgICBsaXN0T3duZXIgJiYgbGlzdE93bmVyLnJlbW92ZUl0ZW0odGhpcy5pdGVtLmluZGV4KTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtJG1vdmVJdGVtKGluZGV4KSB7XG4gICAgdmFyIGxpc3RPd25lciA9IHRoaXMuaXRlbS5saXN0Lm93bmVyO1xuICAgIGxpc3RPd25lciAmJiBsaXN0T3duZXIubW92ZUl0ZW0odGhpcy5pdGVtLmluZGV4LCBpbmRleCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRpc0Ryb3BBbGxvd2VkKG1ldGEvKiwgZHJhZ0Ryb3AqLyl7XG4gICAgdmFyIENvbXBvbmVudCA9IGNvbXBvbmVudHNSZWdpc3RyeS5nZXQobWV0YS5jb21wQ2xhc3MpO1xuXG4gICAgcmV0dXJuIG1ldGEucGFyYW1zICYmIG1ldGEucGFyYW1zLmluZGV4XG4gICAgICAgICAgICAmJiAoQ29tcG9uZW50ID09IE1MTGlzdEl0ZW0gfHwgQ29tcG9uZW50LnByb3RvdHlwZSBpbnN0YW5jZW9mIE1MTGlzdEl0ZW0pXG4gICAgICAgICAgICAmJiBkcmFnZ2luZ0Zyb21TYW1lTGlzdC5jYWxsKHRoaXMpO1xufVxuXG5cbmZ1bmN0aW9uIGRyYWdnaW5nRnJvbVNhbWVMaXN0KGNvbXApIHtcbiAgICBjb21wID0gY29tcCB8fCBEcmFnRHJvcC5zZXJ2aWNlLmdldEN1cnJlbnREcmFnU291cmNlKCk7XG4gICAgdHJ5IHsgdmFyIHNvdXJjZUxpc3QgPSBjb21wLml0ZW0ubGlzdDsgfSBjYXRjaChlKSB7fVxuICAgIHJldHVybiBzb3VyY2VMaXN0ID09IHRoaXMuaXRlbS5saXN0O1xufVxuXG5cbmZ1bmN0aW9uIGlzQ29tcG9uZW50QWxsb3dlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Ryb3BBbGxvd2VkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gb25JdGVtRHJvcChldmVudFR5cGUsIGV2ZW50KSB7XG4gICAgb25EcmFnT3V0LmNhbGwodGhpcyk7XG4gICAgdmFyIGR0ID0gbmV3IERyYWdEcm9wKGV2ZW50KTtcbiAgICB2YXIgbWV0YSA9IGR0LmdldENvbXBvbmVudE1ldGEoKTtcbiAgICB2YXIgc3RhdGUgPSBkdC5nZXRDb21wb25lbnRTdGF0ZSgpO1xuICAgIHZhciBsaXN0T3duZXIgPSB0aGlzLml0ZW0ubGlzdC5vd25lcjtcbiAgICB2YXIgaW5kZXggPSBtZXRhLnBhcmFtcyAmJiBtZXRhLnBhcmFtcy5pbmRleDtcbiAgICB2YXIgZHJvcFBvc2l0aW9uID0gRHJhZ0Ryb3AuZ2V0RHJvcFBvc2l0aW9uWShldmVudCwgdGhpcy5lbCk7XG4gICAgdmFyIGlzQmVsb3cgPSBkcm9wUG9zaXRpb24gPT0gJ2JlbG93JztcbiAgICB2YXIgaXNBYm92ZSA9IGRyb3BQb3NpdGlvbiA9PSAnYWJvdmUnO1xuICAgIHZhciB0YXJnZXRJbmRleDtcblxuICAgIGlmIChkcmFnZ2luZ0Zyb21TYW1lTGlzdC5jYWxsKHRoaXMpKXtcbiAgICAgICAgaWYoc3RhdGUuY29tcE5hbWUgPT0gdGhpcy5uYW1lKSByZXR1cm47XG4gICAgICAgIHZhciBzdGF0ZUluZGV4ID0gc3RhdGUuZmFjZXRzU3RhdGVzLml0ZW0uc3RhdGUuaW5kZXg7XG4gICAgICAgIHZhciBpc01vdmVEb3duID0gc3RhdGVJbmRleCA8IHRoaXMuaXRlbS5pbmRleDtcbiAgICAgICAgdmFyIGlzU2FtZVBvc2l0aW9uO1xuICAgICAgICBpZihpc01vdmVEb3duKSB7XG4gICAgICAgICAgICBpc1NhbWVQb3NpdGlvbiA9IGlzQWJvdmUgJiYgc3RhdGVJbmRleCArIDEgPT0gdGhpcy5pdGVtLmluZGV4O1xuICAgICAgICAgICAgaWYoaXNTYW1lUG9zaXRpb24pIHJldHVybjtcbiAgICAgICAgICAgIHRhcmdldEluZGV4ID0gdGhpcy5pdGVtLmluZGV4IC0gaXNBYm92ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsvL21vdmUgdXBcbiAgICAgICAgICAgIGlzU2FtZVBvc2l0aW9uID0gaXNCZWxvdyAmJiBzdGF0ZUluZGV4IC0gMSA9PSB0aGlzLml0ZW0uaW5kZXg7XG4gICAgICAgICAgICBpZihpc1NhbWVQb3NpdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLml0ZW0uaW5kZXggKyBpc0JlbG93O1xuICAgICAgICB9XG4gICAgICAgIGxpc3RPd25lci5tb3ZlSXRlbSgraW5kZXgsIHRhcmdldEluZGV4LCBzdGF0ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0YXJnZXRJbmRleCA9IHRoaXMuaXRlbS5pbmRleCArIGlzQmVsb3c7XG4gICAgICAgIHRyeSB7IHZhciBkYXRhID0gc3RhdGUuZmFjZXRzU3RhdGVzLmRhdGEuc3RhdGU7IH0gY2F0Y2goZSkge31cbiAgICAgICAgbGlzdE93bmVyLmRhdGEuc3BsaWNlKHRhcmdldEluZGV4LCAwLCBkYXRhKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gb25EcmFnU3RhcnQoLypldmVudFR5cGUsIGV2ZW50Ki8pIHtcbiAgICBEcmFnRHJvcC5zZXJ2aWNlLm9uY2UoJ2RyYWdkcm9wY29tcGxldGVkJywgeyBzdWJzY3JpYmVyOiBvbkRyYWdEcm9wQ29tcGxldGVkLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG5cbmZ1bmN0aW9uIG9uRHJhZ0hvdmVyKC8qZXZlbnRUeXBlLCBldmVudCovKSB7XG4gICAgdGhpcy5kb20uYWRkQ3NzQ2xhc3NlcygnbWwtZHJhZy1vdmVyJyk7XG59XG5cblxuZnVuY3Rpb24gb25EcmFnT3V0KC8qZXZlbnRUeXBlLCBldmVudCovKSB7XG4gICAgdGhpcy5kb20ucmVtb3ZlQ3NzQ2xhc3NlcygnbWwtZHJhZy1vdmVyJyk7XG59XG5cblxuZnVuY3Rpb24gb25EcmFnRHJvcENvbXBsZXRlZChtc2csIGRhdGEpIHtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGRhdGEuY29tcG9uZW50O1xuICAgIHZhciBkcm9wcGVkSW5Bbm90aGVyTGlzdCA9IGRhdGEuZXZlbnRUeXBlID09ICdkcm9wJyAmJiAhZHJhZ2dpbmdGcm9tU2FtZUxpc3QuY2FsbCh0aGlzLCBkcm9wVGFyZ2V0KTtcbiAgICBpZiAoZHJvcHBlZEluQW5vdGhlckxpc3QpIHRoaXMuaXRlbS5yZW1vdmVJdGVtKCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRnZXRNZXRhRGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpbmRleDogdGhpcy5pdGVtLmluZGV4XG4gICAgfTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtX2dldCgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgPyBfLmNsb25lKHZhbHVlKSA6IHZhbHVlO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW1fc2V0KHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JylcbiAgICAgICAgdGhpcy5kYXRhLl9zZXQodmFsdWUpO1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbiAgICBfc2VuZENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbV9kZWwoKSB7XG4gICAgdGhpcy5kYXRhLl9kZWwoKTtcbiAgICB0aGlzLm1vZGVsLmRlbCgpO1xuICAgIF9zZW5kQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5cbmZ1bmN0aW9uIF9zZW5kQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKExJU1RJVEVNX0NIQU5HRV9NRVNTQUdFKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIHVuaXF1ZUlkID0gbWlsby51dGlsLnVuaXF1ZUlkO1xuXG5cbnZhciBSQURJT19DSEFOR0VfTUVTU0FHRSA9ICdtbHJhZGlvZ3JvdXBjaGFuZ2UnXG4gICAgLCBFTEVNRU5UX05BTUVfUFJPUEVSVFkgPSAnX21sUmFkaW9Hcm91cEVsZW1lbnRJRCdcbiAgICAsIEVMRU1FTlRfTkFNRV9QUkVGSVggPSAnbWwtcmFkaW8tZ3JvdXAtJztcblxudmFyIE1MUmFkaW9Hcm91cCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxSYWRpb0dyb3VwJywge1xuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTFJhZGlvR3JvdXBfc2V0LFxuICAgICAgICBnZXQ6IE1MUmFkaW9Hcm91cF9nZXQsXG4gICAgICAgIGRlbDogTUxSYWRpb0dyb3VwX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBSQURJT19DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKionOiB7IHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ2NsaWNrJzogeyBzdWJzY3JpYmVyOiBvbkdyb3VwQ2xpY2ssIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktcmFkaW8tZ3JvdXAnXG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ3t7fiBpdC5yYWRpb09wdGlvbnMgOm9wdGlvbiB9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAge3sjI2RlZi5lbElEOnt7PSBpdC5lbGVtZW50TmFtZSB9fS17ez0gb3B0aW9uLnZhbHVlIH19I319IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInt7PSBpdC5fcmVuZGVyT3B0aW9ucy5vcHRpb25Dc3NDbGFzcyB8fCBcIicgKyBFTEVNRU5UX05BTUVfUFJFRklYICsgJ29wdGlvblwiIH19XCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwie3sjIGRlZi5lbElEIH19XCIgdHlwZT1cInJhZGlvXCIgdmFsdWU9XCJ7ez0gb3B0aW9uLnZhbHVlIH19XCIgbmFtZT1cInt7PSBpdC5lbGVtZW50TmFtZSB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ7eyMgZGVmLmVsSUQgfX1cIj57ez0gb3B0aW9uLmxhYmVsIH19PC9sYWJlbD4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcbiAgICAgICAgICAgICAgICAgICB7e359fSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFJhZGlvR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MUmFkaW9Hcm91cDtcblxuXG5fLmV4dGVuZFByb3RvKE1MUmFkaW9Hcm91cCwge1xuICAgIGluaXQ6IE1MUmFkaW9Hcm91cCRpbml0LFxuICAgIGRlc3Ryb3k6IE1MUmFkaW9Hcm91cCRkZXN0cm95LFxuICAgIHNldFJlbmRlck9wdGlvbnM6IE1MUmFkaW9Hcm91cCRzZXRSZW5kZXJPcHRpb25zXG59KTtcblxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEluaXRpYWxpemUgcmFkaW8gZ3JvdXAgYW5kIHNldHVwXG4gKi9cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cCRpbml0KCkge1xuICAgIF8uZGVmaW5lUHJvcGVydHkodGhpcywgJ19yYWRpb0xpc3QnLCBbXSwgXy5DT05GKTtcbiAgICBfLmRlZmluZVByb3BlcnR5KHRoaXMsIEVMRU1FTlRfTkFNRV9QUk9QRVJUWSwgRUxFTUVOVF9OQU1FX1BSRUZJWCArIHVuaXF1ZUlkKCkpO1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMgPSB7fTtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXAkc2V0UmVuZGVyT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucyA9IG9wdGlvbnM7XG59XG5cblxuLyoqXG4gKiBTZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXBsYWNlcyB0aGUgZGF0YSBzZXQgb3BlcmF0aW9uIHRvIGRlYWwgd2l0aCByYWRpbyBidXR0b25zXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGJlIHNldFxuICovXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXBfc2V0KHZhbHVlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9yYWRpb0xpc3RcbiAgICAgICAgLCBzZXRSZXN1bHQ7XG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbihyYWRpbykge1xuICAgICAgICAgICAgcmFkaW8uY2hlY2tlZCA9IHJhZGlvLnZhbHVlID09IHZhbHVlO1xuICAgICAgICAgICAgaWYgKHJhZGlvLmNoZWNrZWQpXG4gICAgICAgICAgICAgICAgc2V0UmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBzZXRSZXN1bHQ7XG4gICAgfVxufVxuXG5cbi8qKlxuICogR2V0cyBncm91cCB2YWx1ZVxuICogUmV0cmlldmVzIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiB0aGUgZ3JvdXBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cF9nZXQoKSB7XG4gICAgdmFyIGNoZWNrZWQgPSBfLmZpbmQodGhpcy5fcmFkaW9MaXN0LCBmdW5jdGlvbihyYWRpbykge1xuICAgICAgICByZXR1cm4gcmFkaW8uY2hlY2tlZDtcbiAgICB9KTtcblxuICAgIHJldHVybiBjaGVja2VkICYmIGNoZWNrZWQudmFsdWUgfHwgdW5kZWZpbmVkO1xufVxuXG5cbi8qKlxuICogRGVsZXRlZCBncm91cCB2YWx1ZVxuICogRGVsZXRlcyB0aGUgdmFsdWUgb2YgdGhlIGdyb3VwLCBzZXR0aW5nIGl0IHRvIGVtcHR5XG4gKi9cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cF9kZWwoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9yYWRpb0xpc3Q7XG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoKVxuICAgICAgICBvcHRpb25zLmZvckVhY2goZnVuY3Rpb24ocmFkaW8pIHtcbiAgICAgICAgICAgIHJhZGlvLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5cbi8qKlxuICogTWFuYWdlIHJhZGlvIGNoaWxkcmVuIGNsaWNrc1xuICovXG5mdW5jdGlvbiBvbkdyb3VwQ2xpY2soZXZlbnRUeXBlLCBldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQudHlwZSA9PSAncmFkaW8nKVxuICAgICAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKFJBRElPX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuXG4vLyBTZXQgcmFkaW8gYnV0dG9uIGNoaWxkcmVuIG9uIG1vZGVsIGNoYW5nZVxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcih7XG4gICAgICAgIHJhZGlvT3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKSxcbiAgICAgICAgZWxlbWVudE5hbWU6IHRoaXNbRUxFTUVOVF9OQU1FX1BST1BFUlRZXSxcbiAgICAgICAgX3JlbmRlck9wdGlvbnM6IHRoaXMuX3JlbmRlck9wdGlvbnNcbiAgICB9KTtcblxuICAgIHZhciByYWRpb0VscyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cInJhZGlvXCJdJylcbiAgICAgICAgLCBvcHRpb25zID0gXy50b0FycmF5KHJhZGlvRWxzKTtcblxuICAgIHRoaXMuX3JhZGlvTGlzdC5sZW5ndGggPSAwO1xuICAgIHRoaXMuX3JhZGlvTGlzdC5zcGxpY2UuYXBwbHkodGhpcy5fcmFkaW9MaXN0LCBbMCwgMF0uY29uY2F0KG9wdGlvbnMpKTtcbn1cblxuXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXAkZGVzdHJveSgpIHtcbiAgICBkZWxldGUgdGhpcy5fcmFkaW9MaXN0O1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIFNFTEVDVF9DSEFOR0VfTUVTU0FHRSA9ICdtbHNlbGVjdGNoYW5nZSc7XG5cbnZhciBNTFNlbGVjdCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxTZWxlY3QnLCB7XG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXNlbGVjdCdcbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTFNlbGVjdF9zZXQsXG4gICAgICAgIGdldDogTUxTZWxlY3RfZ2V0LFxuICAgICAgICBkZWw6IE1MU2VsZWN0X2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBTRUxFQ1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ2NoYW5nZSc6IHsgc3Vic2NyaWJlcjogZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICd7e34gaXQuc2VsZWN0T3B0aW9ucyA6b3B0aW9uIH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwie3s9IG9wdGlvbi52YWx1ZSB9fVwiIHt7PyBvcHRpb24uc2VsZWN0ZWQgfX1zZWxlY3RlZHt7P319Pnt7PSBvcHRpb24ubGFiZWwgfX08L29wdGlvbj4gXFxcbiAgICAgICAgICAgICAgICAgICB7e359fSdcbiAgICB9XG59KTtcblxuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MU2VsZWN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFNlbGVjdDtcblxuXG5fLmV4dGVuZFByb3RvKE1MU2VsZWN0LCB7XG4gICAgaW5pdDogTUxTZWxlY3QkaW5pdCxcbiAgICBzZXRPcHRpb25zOiBNTFNlbGVjdCRzZXRPcHRpb25zLFxuICAgIGRpc2FibGU6IE1MU2VsZWN0JGRpc2FibGVcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0JGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fb3B0aW9uRWxzID0ge307XG4gICAgdGhpcy5faXNNdWx0aXBsZSA9IHRoaXMuZWwuaGFzQXR0cmlidXRlKCdtdWx0aXBsZScpO1xufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0JHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIC8vIFNldCBvcHRpb25zIHRlbXBvcmFyaWx5IGRpc2FibGVzIG1vZGVsIHN1YnNjcmlwdGlvbnMgKEFzIGEgd29ya2Fyb3VuZCBmb3IgcGVyZm9ybWFuY2UgaXNzdWVzIHJlbGF0aW5nIHRvIG1vZGVsIHVwZGF0ZXMgLyB0ZW1wbGF0ZSByZS1yZW5kZXJpbmcpXG4gICAgdmFyIG1vZGVsQ2hhbmdlTGlzdGVuZXIgPSB7IGNvbnRleHQ6IHRoaXMsIHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSB9O1xuXG4gICAgdGhpcy5tb2RlbC5vZmYoJyoqJywgbW9kZWxDaGFuZ2VMaXN0ZW5lcik7XG4gICAgdGhpcy5tb2RlbC5zZXQob3B0aW9ucyk7XG4gICAgdGhpcy5tb2RlbC5vbignKionLCBtb2RlbENoYW5nZUxpc3RlbmVyKTtcblxuICAgIG9uT3B0aW9uc0NoYW5nZS5jYWxsKHRoaXMpO1xufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0JGRpc2FibGUoZGlzYWJsZSkge1xuICAgIHRoaXMuZWwuZGlzYWJsZWQgPSBkaXNhYmxlO1xufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0X3NldChzdHJPck9iaikge1xuICAgIGlmICghdGhpcy5faXNNdWx0aXBsZSkgdGhpcy5lbC52YWx1ZSA9IHN0ck9yT2JqO1xuICAgIGVsc2Uge1xuICAgICAgICB2YXIgdmFsdWVPYmogPSB7fTtcbiAgICAgICAgaWYgKHN0ck9yT2JqICYmIHR5cGVvZiBzdHJPck9iaiA9PSAnb2JqZWN0JykgdmFsdWVPYmogPSBzdHJPck9iajtcbiAgICAgICAgZWxzZSB2YWx1ZU9ialtzdHJPck9ial0gPSB0cnVlO1xuICAgICAgICBfLmVhY2hLZXkodGhpcy5fb3B0aW9uRWxzLCBmdW5jdGlvbiAoZWwsIGtleSkge1xuICAgICAgICAgICAgZWwuc2VsZWN0ZWQgPSAhIXZhbHVlT2JqW2tleV07XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdF9nZXQoKSB7XG4gICAgaWYgKCF0aGlzLl9pc011bHRpcGxlKSByZXR1cm4gdGhpcy5lbC52YWx1ZTtcbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF8ubWFwS2V5cyh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsLnNlbGVjdGVkO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gTUxTZWxlY3RfZGVsKCkge1xuICAgIGlmICghdGhpcy5faXNNdWx0aXBsZSkgdGhpcy5lbC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICBlbHNlIHtcbiAgICAgICAgXy5lYWNoS2V5KHRoaXMuX29wdGlvbkVscywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBlbC5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoU0VMRUNUX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuXG5mdW5jdGlvbiBvbk9wdGlvbnNDaGFuZ2UocGF0aCwgZGF0YSkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKHsgc2VsZWN0T3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKSB9KTtcbiAgICB0aGlzLl9vcHRpb25FbHMgPSB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXy5mb3JFYWNoKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnb3B0aW9uJyksIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBzZWxmLl9vcHRpb25FbHNbZWwudmFsdWVdID0gZWw7XG4gICAgfSk7XG4gICAgLy9kaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNTFN1cGVyQ29tYm9cbiAqIEEgY29tYm8gc2VsZWN0IGxpc3Qgd2l0aCBpbnRlbGxpZ2VudCBzY3JvbGxpbmcgb2Ygc3VwZXIgbGFyZ2UgbGlzdHMuXG4gKi9cblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGRvVCA9IG1pbG8udXRpbC5kb1RcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXI7XG5cbnZhciBDT01CT19PUEVOID0gJ21sLXVpLXN1cGVyY29tYm8tb3Blbic7XG52YXIgQ09NQk9fQ0hBTkdFX01FU1NBR0UgPSAnbWxzdXBlcmNvbWJvY2hhbmdlJztcblxudmFyIE9QVElPTlNfVEVNUExBVEUgPSAne3t+IGl0LmNvbWJvT3B0aW9ucyA6b3B0aW9uOmluZGV4IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHt7PyBvcHRpb24uc2VsZWN0ZWR9fWNsYXNzPVwic2VsZWN0ZWRcIiB7ez99fWRhdGEtdmFsdWU9XCJ7ez0gaW5kZXggfX1cIj57ez0gb3B0aW9uLmxhYmVsIH19PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19JztcblxudmFyIE1BWF9SRU5ERVJFRCA9IDEwMDtcbnZhciBCVUZGRVIgPSAyNTtcbnZhciBERUZBVUxUX0VMRU1FTlRfSEVJR0hUID0gMjA7XG5cbnZhciBNTFN1cGVyQ29tYm8gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MU3VwZXJDb21ibycsIHtcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdtb3VzZWxlYXZlJzoge3N1YnNjcmliZXI6IG9uTW91c2VMZWF2ZSwgY29udGV4dDogJ293bmVyJ30sXG4gICAgICAgICAgICAnbW91c2VvdmVyJzoge3N1YnNjcmliZXI6IG9uTW91c2VPdmVyLCBjb250ZXh0OiAnb3duZXInfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxTdXBlckNvbWJvX2dldCxcbiAgICAgICAgc2V0OiBNTFN1cGVyQ29tYm9fc2V0LFxuICAgICAgICBkZWw6IE1MU3VwZXJDb21ib19kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogQ09NQk9fQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1zdXBlcmNvbWJvJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICc8aW5wdXQgbWwtYmluZD1cIltkYXRhLCBldmVudHNdOmlucHV0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgbWwtdWktaW5wdXRcIj5cXFxuICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIltkb21dOmFkZEl0ZW1EaXZcIiBjbGFzcz1cIm1sLXVpLXN1cGVyY29tYm8tYWRkXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIG1sLWJpbmQ9XCI6YWRkUHJvbXB0XCI+PC9zcGFuPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG1sLWJpbmQ9XCJbZXZlbnRzLCBkb21dOmFkZEJ0blwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IG1sLXVpLWJ1dHRvblwiPkFkZDwvYnV0dG9uPlxcXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbZG9tLCBldmVudHNdOmxpc3RcIiBjbGFzcz1cIm1sLXVpLXN1cGVyY29tYm8tZHJvcGRvd25cIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbZG9tXTpiZWZvcmVcIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbdGVtcGxhdGUsIGRvbSwgZXZlbnRzXTpvcHRpb25zXCIgY2xhc3M9XCJtbC11aS1zdXBlcmNvbWJvLW9wdGlvbnNcIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbZG9tXTphZnRlclwiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+J1xuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MU3VwZXJDb21ibyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxTdXBlckNvbWJvO1xuXG4vKipcbiAqIFB1YmxpYyBBcGlcbiAqL1xuXy5leHRlbmRQcm90byhNTFN1cGVyQ29tYm8sIHtcbiAgICBpbml0OiBNTFN1cGVyQ29tYm8kaW5pdCxcbiAgICBzaG93T3B0aW9uczogTUxTdXBlckNvbWJvJHNob3dPcHRpb25zLFxuICAgIGhpZGVPcHRpb25zOiBNTFN1cGVyQ29tYm8kaGlkZU9wdGlvbnMsXG4gICAgdG9nZ2xlT3B0aW9uczogTUxTdXBlckNvbWJvJHRvZ2dsZU9wdGlvbnMsXG4gICAgc2V0T3B0aW9uczogTUxTdXBlckNvbWJvJHNldE9wdGlvbnMsXG4gICAgaW5pdE9wdGlvbnNVUkw6IE1MU3VwZXJDb21ibyRpbml0T3B0aW9uc1VSTCxcbiAgICBzZXRGaWx0ZXJlZE9wdGlvbnM6IE1MU3VwZXJDb21ibyRzZXRGaWx0ZXJlZE9wdGlvbnMsXG4gICAgdXBkYXRlOiBNTFN1cGVyQ29tYm8kdXBkYXRlLFxuICAgIHRvZ2dsZUFkZEJ1dHRvbjogTUxTdXBlckNvbWJvJHRvZ2dsZUFkZEJ1dHRvbixcbiAgICBzZXRBZGRJdGVtUHJvbXB0OiBNTFN1cGVyQ29tYm8kc2V0QWRkSXRlbVByb21wdCxcbiAgICBzZXRQbGFjZWhvbGRlcjogTUxTdXBlckNvbWJvJHNldFBsYWNlaG9sZGVyLFxuICAgIGNsZWFyQ29tYm9JbnB1dDogTUxTdXBlckNvbWJvX2RlbFxufSk7XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXNlIHRoZSBjb21wb25lbnQsIHdhaXQgZm9yIGNoaWxkcmVuYm91bmQsIHNldHVwIGVtcHR5IG9wdGlvbnMgYXJyYXlzLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMub25jZSgnY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG5cbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICBfb3B0aW9uc0RhdGE6IFtdLFxuICAgICAgICBfZmlsdGVyZWRPcHRpb25zRGF0YTogW11cbiAgICB9LCBfLldSSVQpO1xufVxuXG4vKipcbiAqIEhhbmRsZXIgZm9yIGluaXQgY2hpbGRyZW5ib3VuZCBsaXN0ZW5lci4gUmVuZGVycyB0ZW1wbGF0ZS5cbiAqL1xuZnVuY3Rpb24gb25DaGlsZHJlbkJvdW5kKCkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKCkuYmluZGVyKCk7XG4gICAgY29tcG9uZW50U2V0dXAuY2FsbCh0aGlzKTtcbn1cblxuXG4vKipcbiAqIERlZmluZSBpbnN0YW5jZSBwcm9wZXJ0aWVzLCBnZXQgc3ViY29tcG9uZW50cywgY2FsbCBzZXR1cCBzdWItdGFza3NcbiAqL1xuZnVuY3Rpb24gY29tcG9uZW50U2V0dXAoKSB7XG4gICAgdmFyIHNjb3BlID0gdGhpcy5jb250YWluZXIuc2NvcGU7XG5cbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICBfY29tYm9JbnB1dDogc2NvcGUuaW5wdXQsXG4gICAgICAgIF9jb21ib0xpc3Q6IHNjb3BlLmxpc3QsXG4gICAgICAgIF9jb21ib09wdGlvbnM6IHNjb3BlLm9wdGlvbnMsXG4gICAgICAgIF9jb21ib0JlZm9yZTogc2NvcGUuYmVmb3JlLFxuICAgICAgICBfY29tYm9BZnRlcjogc2NvcGUuYWZ0ZXIsXG4gICAgICAgIF9jb21ib0FkZEl0ZW1EaXY6IHNjb3BlLmFkZEl0ZW1EaXYsXG4gICAgICAgIF9jb21ib0FkZFByb21wdDogc2NvcGUuYWRkUHJvbXB0LFxuICAgICAgICBfY29tYm9BZGRCdG46IHNjb3BlLmFkZEJ0bixcbiAgICAgICAgX29wdGlvblRlbXBsYXRlOiBkb1QuY29tcGlsZShPUFRJT05TX1RFTVBMQVRFKVxuICAgIH0pO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX3N0YXJ0SW5kZXg6IDAsXG4gICAgICAgIF9lbmRJbmRleDogTUFYX1JFTkRFUkVELFxuICAgICAgICBfaGlkZGVuOiBmYWxzZSxcbiAgICAgICAgX2VsZW1lbnRIZWlnaHQ6IERFRkFVTFRfRUxFTUVOVF9IRUlHSFQsXG4gICAgICAgIF90b3RhbDogMCxcbiAgICAgICAgX29wdGlvbnNIZWlnaHQ6IDIwMCxcbiAgICAgICAgX2xhc3RTY3JvbGxQb3M6IDAsXG4gICAgICAgIF9jdXJyZW50VmFsdWU6IG51bGwsXG4gICAgICAgIF9zZWxlY3RlZDogbnVsbCxcbiAgICAgICAgX2lzQWRkQnV0dG9uU2hvd246IGZhbHNlXG4gICAgfSwgXy5XUklUKTtcblxuICAgIC8vIENvbXBvbmVudCBTZXR1cFxuICAgIHRoaXMuZG9tLnNldFN0eWxlcyh7IHBvc2l0aW9uOiAncmVsYXRpdmUnIH0pO1xuICAgIHNldHVwQ29tYm9MaXN0KHRoaXMuX2NvbWJvTGlzdCwgdGhpcy5fY29tYm9PcHRpb25zLCB0aGlzKTtcbiAgICBzZXR1cENvbWJvSW5wdXQodGhpcy5fY29tYm9JbnB1dCwgdGhpcyk7XG4gICAgc2V0dXBDb21ib0J0bih0aGlzLl9jb21ib0FkZEJ0biwgdGhpcyk7XG5cbiAgICB0aGlzLmV2ZW50cy5vbigna2V5ZG93bicsIHsgc3Vic2NyaWJlcjogY2hhbmdlU2VsZWN0ZWQsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgLy90aGlzLmV2ZW50cy5vbignbW91c2VsZWF2ZScsIHsgc3Vic2NyaWJlcjogTUxTdXBlckNvbWJvJGhpZGVPcHRpb25zLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIFNob3dzIG9yIGhpZGVzIG9wdGlvbiBsaXN0LlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc2hvdyB0cnVlIHRvIHNob3csIGZhbHNlIHRvIGhpZGVcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHRvZ2dsZU9wdGlvbnMoc2hvdykge1xuICAgIHRoaXMuX2hpZGRlbiA9ICFzaG93O1xuICAgIHRoaXMuX2NvbWJvTGlzdC5kb20udG9nZ2xlKHNob3cpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIFNob3dzIG9wdGlvbnMgbGlzdFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2hvd09wdGlvbnMoKSB7XG4gICAgLy8gUG9zaXRpb24gdGhlIGxpc3QgdG8gbWF4aW1pc2UgdGhlIGFtb3VudCBvZiB2aXNpYmxlIGNvbnRlbnRcbiAgICB2YXIgYm91bmRzID0gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgcGFnZUhlaWdodCA9IE1hdGgubWF4KHRoaXMuZWwub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgMCk7XG4gICAgdmFyIGxpc3RUb3BTdHlsZSA9ICcnOyAvLyBQb3NpdGlvbnMgb3B0aW9ucyB1bmRlcm5lYXRoIHRoZSBjb21ib2JveCAoRGVmYXVsdCBiZWhhdmlvdXIpXG4gICAgdmFyIGJvdHRvbU92ZXJsYXAgPSAoYm91bmRzLmJvdHRvbSArIHRoaXMuX29wdGlvbnNIZWlnaHQpIC0gcGFnZUhlaWdodDtcblxuICAgIGlmKGJvdHRvbU92ZXJsYXAgPiAwKSB7XG4gICAgICAgIHZhciB0b3BPdmVybGFwID0gdGhpcy5fb3B0aW9uc0hlaWdodCAtIGJvdW5kcy50b3A7XG5cbiAgICAgICAgaWYodG9wT3ZlcmxhcCA8IGJvdHRvbU92ZXJsYXApIHtcbiAgICAgICAgICAgIGxpc3RUb3BTdHlsZSA9IC0gdGhpcy5fb3B0aW9uc0hlaWdodCArICdweCc7IC8vIFBvc2l0aW9uIG9wdGlvbnMgYWJvdmUgdGhlIGNvbWJvYm94XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jb21ib0xpc3QuZG9tLnNldFN0eWxlcyh7IHRvcDogbGlzdFRvcFN0eWxlIH0pO1xuICAgIHRoaXMuX2hpZGRlbiA9IGZhbHNlO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZChDT01CT19PUEVOKTtcbiAgICB0aGlzLl9jb21ib0xpc3QuZG9tLnRvZ2dsZSh0cnVlKTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBIaWRlcyBvcHRpb25zIGxpc3RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJGhpZGVPcHRpb25zKCkge1xuICAgIHRoaXMuX2hpZGRlbiA9IHRydWU7XG4gICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKENPTUJPX09QRU4pO1xuICAgIHRoaXMuX2NvbWJvTGlzdC5kb20udG9nZ2xlKGZhbHNlKTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBIaWRlcyBhZGQgYnV0dG9uXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyR0b2dnbGVBZGRCdXR0b24oc2hvdywgb3B0aW9ucykge1xuICAgIHRoaXMuX2NvbWJvQWRkSXRlbURpdi5kb20udG9nZ2xlKHNob3cpO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMucHJlc2VydmVTdGF0ZSkgdGhpcy5fX3Nob3dBZGRPbkNsaWNrID0gdGhpcy5faXNBZGRCdXR0b25TaG93bjtcbiAgICB0aGlzLl9pc0FkZEJ1dHRvblNob3duID0gc2hvdztcbn1cblxuXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0QWRkSXRlbVByb21wdChwcm9tcHQpIHtcbiAgICB0aGlzLl9hZGRJdGVtUHJvbXB0ID0gcHJvbXB0O1xuICAgIHRoaXMuX2NvbWJvQWRkUHJvbXB0LmVsLmlubmVySFRNTCA9IHByb21wdDtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRQbGFjZWhvbGRlcihwbGFjZWhvbGRlcikge1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZWwucGxhY2Vob2xkZXIgPSBwbGFjZWhvbGRlcjtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTZXRzIHRoZSBvcHRpb25zIG9mIHRoZSBkcm9wZG93blxuICpcbiAqIEBwYXJhbSB7QXJyYXlbT2JqZWN0XX0gYXJyIHRoZSBvcHRpb25zIHRvIHNldCB3aXRoIGxhYmVsIGFuZCB2YWx1ZSBwYWlycy4gVmFsdWUgY2FuIGJlIGFuIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHNldE9wdGlvbnMoYXJyKSB7XG4gICAgdGhpcy5fb3B0aW9uc0RhdGEgPSBhcnI7XG4gICAgdGhpcy5zZXRGaWx0ZXJlZE9wdGlvbnMoYXJyKTtcbn1cblxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEluaXRpYWxpc2UgdGhlIHJlbW90ZSBvcHRpb25zIG9mIHRoZSBkcm9wZG93blxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIHRoZSBvcHRpb25zIHRvIGluaXRpYWxpc2UuXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRpbml0T3B0aW9uc1VSTChvcHRpb25zKSB7XG4gICAgdGhpcy5fb3B0aW9uc1VSTCA9IG9wdGlvbnMudXJsO1xuICAgIHRoaXMuX2Zvcm1hdE9wdGlvbnNVUkwgPSBvcHRpb25zLmZvcm1hdE9wdGlvbnMgfHwgZnVuY3Rpb24oZSl7cmV0dXJuIGU7fTtcbn1cblxuXG4vKipcbiAqIFByaXZhdGUgbWV0aG9kXG4gKiBTZXRzIHRoZSBvcHRpb25zIG9mIHRoZSBkcm9wZG93biBiYXNlZCBvbiBhIHJlcXVlc3RcbiAqL1xuZnVuY3Rpb24gX2dldE9wdGlvbnNVUkwoY2IpIHtcbiAgICB2YXIgdXJsID0gdGhpcy5fb3B0aW9uc1VSTCxcbiAgICAgICAgcXVlcnlTdHJpbmcgPSB0aGlzLl9jb21ib0lucHV0LmRhdGEuZ2V0KCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGNiID0gY2IgfHwgXy5ub29wO1xuICAgIG1pbG8udXRpbC5yZXF1ZXN0LnBvc3QodXJsLCB7IG5hbWU6IHF1ZXJ5U3RyaW5nIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ2FuIG5vdCBzZWFyY2ggZm9yIFwiJyArIHF1ZXJ5U3RyaW5nICsgJ1wiJyk7XG4gICAgICAgICAgICByZXR1cm4gY2IobmV3IEVycm9yKCdSZXF1ZXN0IGVycm9yJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9IF8uanNvblBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSkgY2IobnVsbCwgcmVzcG9uc2VEYXRhKTtcbiAgICAgICAgZWxzZSBjYihuZXcgRXJyb3IoJ0RhdGEgZXJyb3InKSk7XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTZXRzIHRoZSBmaWx0ZXJlZCBvcHRpb25zLCB3aGljaCBpcyBhIHN1YnNldCBvZiBub3JtYWwgb3B0aW9uc1xuICpcbiAqIEBwYXJhbSB7W3R5cGVdfSBhcnIgVGhlIG9wdGlvbnMgdG8gc2V0XG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRGaWx0ZXJlZE9wdGlvbnMoYXJyKSB7XG4gICAgaWYgKCEgYXJyKSByZXR1cm4gbG9nZ2VyLmVycm9yKCdzZXRGaWx0ZXJlZE9wdGlvbnM6IHBhcmFtZXRlciBpcyB1bmRlZmluZWQnKTtcbiAgICB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhID0gYXJyO1xuICAgIHRoaXMuX3RvdGFsID0gYXJyLmxlbmd0aDtcbiAgICB0aGlzLnVwZGF0ZSgpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIFVwZGF0ZXMgdGhlIGxpc3QuIFRoaXMgaXMgdXNlZCBvbiBzY3JvbGwsIGFuZCBtYWtlcyB1c2Ugb2YgdGhlIGZpbHRlcmVkT3B0aW9ucyB0b1xuICogaW50ZWxsaWdlbnRseSBzaG93IGEgc3Vic2V0IG9mIHRoZSBmaWx0ZXJlZCBsaXN0IGF0IGEgdGltZS5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHVwZGF0ZSgpIHtcbiAgICB2YXIgd2FzSGlkZGVuID0gdGhpcy5faGlkZGVuO1xuXG4gICAgdmFyIGFyclRvU2hvdyA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGEuc2xpY2UodGhpcy5fc3RhcnRJbmRleCwgdGhpcy5fZW5kSW5kZXgpO1xuXG4gICAgdGhpcy5fY29tYm9PcHRpb25zLnRlbXBsYXRlLnJlbmRlcih7XG4gICAgICAgIGNvbWJvT3B0aW9uczogYXJyVG9TaG93XG4gICAgfSk7XG5cbiAgICB0aGlzLl9lbGVtZW50SGVpZ2h0ID0gdGhpcy5fZWxlbWVudEhlaWdodCB8fCBERUZBVUxUX0VMRU1FTlRfSEVJR0hUO1xuXG4gICAgaWYgKHdhc0hpZGRlbilcbiAgICAgICAgdGhpcy5oaWRlT3B0aW9ucygpO1xuXG4gICAgdmFyIGJlZm9yZUhlaWdodCA9IHRoaXMuX3N0YXJ0SW5kZXggKiB0aGlzLl9lbGVtZW50SGVpZ2h0O1xuICAgIHZhciBhZnRlckhlaWdodCA9ICh0aGlzLl90b3RhbCAtIHRoaXMuX2VuZEluZGV4KSAqIHRoaXMuX2VsZW1lbnRIZWlnaHQ7XG4gICAgdGhpcy5fY29tYm9CZWZvcmUuZWwuc3R5bGUuaGVpZ2h0ID0gYmVmb3JlSGVpZ2h0ICsgJ3B4JztcbiAgICB0aGlzLl9jb21ib0FmdGVyLmVsLnN0eWxlLmhlaWdodCA9IGFmdGVySGVpZ2h0ID4gMCA/IGFmdGVySGVpZ2h0ICsgJ3B4JyA6ICcwcHgnO1xufVxuXG4vKipcbiAqIFNldHVwIHRoZSBjb21ibyBsaXN0XG4gKlxuICogQHBhcmFtICB7Q29tcG9uZW50fSBsaXN0XG4gKiBAcGFyYW0gIHtBcnJheX0gb3B0aW9uc1xuICogQHBhcmFtICB7Q29tcG9uZW50fSBzZWxmXG4gKi9cbmZ1bmN0aW9uIHNldHVwQ29tYm9MaXN0KGxpc3QsIG9wdGlvbnMsIHNlbGYpIHtcbiAgICBzZWxmLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSk7XG4gICAgb3B0aW9ucy50ZW1wbGF0ZS5zZXQoT1BUSU9OU19URU1QTEFURSk7XG5cbiAgICBsaXN0LmRvbS5zZXRTdHlsZXMoe1xuICAgICAgICBvdmVyZmxvdzogJ3Njcm9sbCcsXG4gICAgICAgIGhlaWdodDogc2VsZi5fb3B0aW9uc0hlaWdodCArICdweCcsXG4gICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICB6SW5kZXg6IDEwXG4gICAgICAgIC8vIHRvcDogeVBvcyArICdweCcsXG4gICAgICAgIC8vIGxlZnQ6IHhQb3MgKyAncHgnLFxuICAgIH0pO1xuXG4gICAgc2VsZi5oaWRlT3B0aW9ucygpO1xuICAgIGxpc3QuZXZlbnRzLm9uTWVzc2FnZXMoe1xuICAgICAgICAnY2xpY2snOiB7c3Vic2NyaWJlcjogb25MaXN0Q2xpY2ssIGNvbnRleHQ6IHNlbGZ9LFxuICAgICAgICAnc2Nyb2xsJzoge3N1YnNjcmliZXI6IG9uTGlzdFNjcm9sbCwgY29udGV4dDogc2VsZn1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTZXR1cCB0aGUgaW5wdXQgY29tcG9uZW50XG4gKlxuICogQHBhcmFtICB7Q29tcG9uZW50fSBpbnB1dFxuICogQHBhcmFtICB7Q29tcG9uZW50fSBzZWxmXG4gKi9cbmZ1bmN0aW9uIHNldHVwQ29tYm9JbnB1dChpbnB1dCwgc2VsZikge1xuICAgIGlucHV0LmV2ZW50cy5vbmNlKCdmb2N1cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGlucHV0LmRhdGEub24oJycsIHsgc3Vic2NyaWJlcjogb25EYXRhQ2hhbmdlLCBjb250ZXh0OiBzZWxmIH0pO1xuICAgICAgICBpbnB1dC5ldmVudHMub24oJ2NsaWNrJywge3N1YnNjcmliZXI6IG9uSW5wdXRDbGljaywgY29udGV4dDogc2VsZiB9KTtcbiAgICAgICAgaW5wdXQuZXZlbnRzLm9uKCdrZXlkb3duJywge3N1YnNjcmliZXI6IG9uRW50ZXJLZXksIGNvbnRleHQ6IHNlbGYgfSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2V0dXAgdGhlIGJ1dHRvblxuICogQHBhcmFtICB7Q29tcG9uZW50fSBidG5cbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gc2VsZlxuICovXG5mdW5jdGlvbiBzZXR1cENvbWJvQnRuKGJ0biwgc2VsZikge1xuICAgIGJ0bi5ldmVudHMub24oJ2NsaWNrJywgeyBzdWJzY3JpYmVyOiBvbkFkZEJ0biwgY29udGV4dDogc2VsZiB9KTtcbn1cblxuXG4vKipcbiAqIEN1c3RvbSBkYXRhIGZhY2V0IGdldCBtZXRob2RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvX2dldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFZhbHVlO1xufVxuXG4vKipcbiAqIEN1c3RvbSBkYXRhIGZhY2V0IHNldCBtZXRob2RcbiAqIEBwYXJhbSB7VmFyaWFibGV9IG9ialxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm9fc2V0KG9iaikge1xuICAgIHRoaXMuX2N1cnJlbnRWYWx1ZSA9IG9iajtcbiAgICB0aGlzLl9jb21ib0lucHV0LmRhdGEuc2V0KG9iaiAmJiBvYmoubGFiZWwpO1xuICAgIF8uZGVmZXJNZXRob2QodGhpcywgJ2hpZGVPcHRpb25zJyk7XG59XG5cbi8qKlxuICogQ3VzdG9tIGRhdGEgZmFjZXQgZGVsIG1ldGhvZFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm9fZGVsKCkge1xuICAgIHRoaXMuX2N1cnJlbnRWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLnNldCgnJyk7XG59XG5cblxuLyoqXG4gKiBJbnB1dCBkYXRhIGNoYW5nZSBoYW5kbGVyXG4gKiBXaGVuIHRoZSBpbnB1dCBkYXRhIGNoYW5nZXMsIHRoaXMgbWV0aG9kIGZpbHRlcnMgdGhlIG9wdGlvbnNEYXRhLCBhbmQgc2V0cyB0aGUgZmlyc3QgZWxlbWVudFxuICogdG8gYmUgc2VsZWN0ZWQuXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1zZ1xuICogQHBhcmFtICB7T2JqZXh0fSBkYXRhXG4gKi9cbmZ1bmN0aW9uIG9uRGF0YUNoYW5nZShtc2csIGRhdGEpIHtcbiAgICB2YXIgdGV4dCA9IGRhdGEubmV3VmFsdWUgJiYgZGF0YS5uZXdWYWx1ZS50cmltKCk7XG4gICAgaWYgKHRoaXMuX29wdGlvbnNVUkwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBfZ2V0T3B0aW9uc1VSTC5jYWxsKHRoaXMsIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2VEYXRhKXtcbiAgICAgICAgICAgIGlmIChlcnIgfHwgIXJlc3BvbnNlRGF0YSkgcmV0dXJuO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHJlc3BvbnNlRGF0YS5kYXRhLm1hcChzZWxmLl9mb3JtYXRPcHRpb25zVVJMKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgX3VwZGF0ZU9wdGlvbnNBbmRBZGRCdXR0b24uY2FsbChzZWxmLCB0ZXh0LCBzZWxmLl9vcHRpb25zRGF0YSk7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0RhdGEgZXJyb3InLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGZpbHRlcmVkRGF0YSA9IF9maWx0ZXJEYXRhLmNhbGwodGhpcywgdGV4dCk7XG4gICAgICAgIF91cGRhdGVPcHRpb25zQW5kQWRkQnV0dG9uLmNhbGwodGhpcywgdGV4dCwgZmlsdGVyZWREYXRhKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gX2ZpbHRlckRhdGEodGV4dCkge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zRGF0YS5maWx0ZXIoZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIGRlbGV0ZSBvcHRpb24uc2VsZWN0ZWQ7XG4gICAgICAgIGlmIChvcHRpb24ubGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IG9wdGlvbi5sYWJlbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGxhYmVsLnRyaW0oKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGV4dC50b0xvd2VyQ2FzZSgpKSA9PSAwO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gX3VwZGF0ZU9wdGlvbnNBbmRBZGRCdXR0b24odGV4dCwgZmlsdGVyZWRBcnIpIHtcbiAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZmlsdGVyZWRBcnIubGVuZ3RoICYmIF8uZmluZChmaWx0ZXJlZEFyciwgaXNFeGFjdE1hdGNoKSkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9hZGRJdGVtUHJvbXB0KSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbih0aGlzLl9vcHRpb25zRGF0YS5sZW5ndGggPiAxIHx8IHRoaXMuX29wdGlvbnNVUkwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbHRlcmVkQXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5zaG93T3B0aW9ucygpO1xuICAgICAgICAgICAgZmlsdGVyZWRBcnJbMF0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSBmaWx0ZXJlZEFyclswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZU9wdGlvbnMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0RmlsdGVyZWRPcHRpb25zKGZpbHRlcmVkQXJyKTtcbiAgICB0aGlzLl9jb21ib0xpc3QuZWwuc2Nyb2xsVG9wID0gMDtcblxuICAgIGZ1bmN0aW9uIGlzRXhhY3RNYXRjaChpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLmxhYmVsLnRvTG93ZXJDYXNlKCkgPT09IHRleHQudG9Mb3dlckNhc2UoKTtcbiAgICB9XG59XG5cbi8qKlxuICogQSBtYXAgb2Yga2V5Q29kZXMgdG8gZGlyZWN0aW9uc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIGRpcmVjdGlvbk1hcCA9IHsgJzQwJzogMSwgJzM4JzogLTEgfTtcblxuLyoqXG4gKiBMaXN0IGtleWRvd24gaGFuZGxlclxuICogQ2hhbmdlcyB0aGUgc2VsZWN0ZWQgbGlzdCBpdGVtIGJ5IGZpbmRpbmcgdGhlIGFkamFjZW50IGl0ZW0gYW5kIHNldHRpbmcgaXQgdG8gc2VsZWN0ZWQuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gY2hhbmdlU2VsZWN0ZWQodHlwZSwgZXZlbnQpIHtcbiAgICAvL1RPRE8gdGVzdCBtb2NoYVxuICAgIHZhciBkaXJlY3Rpb24gPSBkaXJlY3Rpb25NYXBbZXZlbnQua2V5Q29kZV07XG5cbiAgICBpZihkaXJlY3Rpb24pXG4gICAgICAgIF9jaGFuZ2VTZWxlY3RlZC5jYWxsKHRoaXMsIGRpcmVjdGlvbik7XG59XG5cbmZ1bmN0aW9uIF9jaGFuZ2VTZWxlY3RlZChkaXJlY3Rpb24pIHtcbiAgICAvLyBUT0RPOiByZWZhY3RvciBhbmQgdGlkeSB1cCwgbG9va3MgbGlrZSBzb21lIGNvZGUgZHVwbGljYXRpb24uXG4gICAgdmFyIHNlbGVjdGVkID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCcuc2VsZWN0ZWQnKVswXVxuICAgICAgICAsIHNjcm9sbFBvcyA9IHRoaXMuX2NvbWJvTGlzdC5lbC5zY3JvbGxUb3BcbiAgICAgICAgLCBzZWxlY3RlZFBvcyA9IHNlbGVjdGVkID8gc2VsZWN0ZWQub2Zmc2V0VG9wIDogMFxuICAgICAgICAsIHJlbGF0aXZlUG9zID0gc2VsZWN0ZWRQb3MgLSBzY3JvbGxQb3M7XG5cbiAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gX2dldERhdGFWYWx1ZUZyb21FbGVtZW50LmNhbGwodGhpcywgc2VsZWN0ZWQpXG4gICAgICAgICAgICAsIHRoaXNJdGVtID0gdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YVtpbmRleF1cbiAgICAgICAgICAgICwgYWRqSXRlbSA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbaW5kZXggKyBkaXJlY3Rpb25dO1xuXG4gICAgICAgIGlmIChhZGpJdGVtKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpc0l0ZW0uc2VsZWN0ZWQ7XG4gICAgICAgICAgICBhZGpJdGVtLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkID0gYWRqSXRlbTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YVswXSkge1xuICAgICAgICAgICAgdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YVswXS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUG9zID4gdGhpcy5fb3B0aW9uc0hlaWdodCAtIHRoaXMuX2VsZW1lbnRIZWlnaHQqMiAmJiBkaXJlY3Rpb24gPT09IDEpXG4gICAgICAgIHRoaXMuX2NvbWJvTGlzdC5lbC5zY3JvbGxUb3AgKz0gdGhpcy5fZWxlbWVudEhlaWdodCpkaXJlY3Rpb24qNTtcblxuICAgIGlmIChyZWxhdGl2ZVBvcyA8IHRoaXMuX2VsZW1lbnRIZWlnaHQgJiYgZGlyZWN0aW9uID09PSAtMSlcbiAgICAgICAgdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcCArPSB0aGlzLl9lbGVtZW50SGVpZ2h0KmRpcmVjdGlvbio1O1xufVxuXG5cbi8qKlxuICogTW91c2Ugb3ZlciBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25Nb3VzZU92ZXIodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLl9tb3VzZUlzT3ZlciA9IHRydWU7XG59XG5cblxuLyoqXG4gKiBNb3VzZSBsZWF2ZSBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25Nb3VzZUxlYXZlKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX21vdXNlSXNPdmVyID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX21vdXNlT3V0VGltZXIpIGNsZWFySW50ZXJ2YWwodGhpcy5fbW91c2VPdXRUaW1lcik7XG4gICAgdGhpcy5fbW91c2VPdXRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCFzZWxmLl9tb3VzZUlzT3ZlcilcbiAgICAgICAgICAgIF9vbk1vdXNlTGVhdmUuY2FsbChzZWxmKTtcbiAgICB9LCA3NTApO1xufVxuXG5mdW5jdGlvbiBfb25Nb3VzZUxlYXZlKCkge1xuICAgIHRoaXMuaGlkZU9wdGlvbnMoKTtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSwgeyBwcmVzZXJ2ZVN0YXRlOiB0cnVlIH0pO1xufVxuXG5cbi8qKlxuICogSW5wdXQgY2xpY2sgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uSW5wdXRDbGljayh0eXBlLCBldmVudCkge1xuICAgIHRoaXMuc2hvd09wdGlvbnMoKTtcbiAgICBpZiAodGhpcy5fX3Nob3dBZGRPbkNsaWNrKSB0aGlzLnRvZ2dsZUFkZEJ1dHRvbih0cnVlKTtcbn1cblxuXG4vKipcbiAqIEVudGVyIGtleSBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25FbnRlcktleSh0eXBlLCBldmVudCkge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09IDEzKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RlZClcbiAgICAgICAgICAgIF9zZXREYXRhLmNhbGwodGhpcyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZCBidXR0b24gaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uQWRkQnRuICh0eXBlLCBldmVudCkge1xuICAgIHZhciBkYXRhID0geyBsYWJlbDogdGhpcy5fY29tYm9JbnB1dC5lbC52YWx1ZSB9O1xuICAgIHRoaXMucG9zdE1lc3NhZ2UoJ2FkZGl0ZW0nLCBkYXRhKTtcbiAgICB0aGlzLmV2ZW50cy5wb3N0TWVzc2FnZSgnbWlsb19zdXBlcmNvbWJvYWRkaXRlbScsIGRhdGEpO1xuICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlLCB7IHByZXNlcnZlU3RhdGU6IHRydWUgfSk7XG5cbn1cblxuLyoqXG4gKiBMaXN0IGNsaWNrIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkxpc3RDbGljayAodHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgaW5kZXggPSBfZ2V0RGF0YVZhbHVlRnJvbUVsZW1lbnQuY2FsbCh0aGlzLCBldmVudC50YXJnZXQpO1xuICAgIHZhciBkYXRhID0gdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YVtpbmRleF07XG5cbiAgICB0aGlzLl9zZWxlY3RlZCA9IGRhdGE7XG4gICAgX3NldERhdGEuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnVwZGF0ZSgpO1xufVxuXG5cbi8qKlxuICogTGlzdCBzY3JvbGwgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uTGlzdFNjcm9sbCAodHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgc2Nyb2xsUG9zID0gZXZlbnQudGFyZ2V0LnNjcm9sbFRvcFxuICAgICAgICAsIGRpcmVjdGlvbiA9IHNjcm9sbFBvcyA+IHRoaXMuX2xhc3RTY3JvbGxQb3MgPyAnZG93bicgOiAndXAnXG4gICAgICAgICwgZmlyc3RDaGlsZCA9IHRoaXMuX2NvbWJvT3B0aW9ucy5lbC5sYXN0RWxlbWVudENoaWxkXG4gICAgICAgICwgbGFzdENoaWxkID0gdGhpcy5fY29tYm9PcHRpb25zLmVsLmZpcnN0RWxlbWVudENoaWxkXG4gICAgICAgICwgbGFzdEVsUG9zaXRpb24gPSBmaXJzdENoaWxkID8gZmlyc3RDaGlsZC5vZmZzZXRUb3AgOiAwXG4gICAgICAgICwgZmlyc3RFbFBvc2l0aW9uID0gbGFzdENoaWxkID8gbGFzdENoaWxkLm9mZnNldFRvcCA6IDBcbiAgICAgICAgLCBkaXN0RnJvbUxhc3RFbCA9IGxhc3RFbFBvc2l0aW9uIC0gc2Nyb2xsUG9zIC0gdGhpcy5fb3B0aW9uc0hlaWdodCArIHRoaXMuX2VsZW1lbnRIZWlnaHRcbiAgICAgICAgLCBkaXN0RnJvbUZpcnN0RWwgPSBzY3JvbGxQb3MgLSBmaXJzdEVsUG9zaXRpb25cbiAgICAgICAgLCBlbHNGcm9tU3RhcnQgPSBNYXRoLmZsb29yKGRpc3RGcm9tRmlyc3RFbCAvIHRoaXMuX2VsZW1lbnRIZWlnaHQpXG4gICAgICAgICwgZWxzVG9UaGVFbmQgPSBNYXRoLmZsb29yKGRpc3RGcm9tTGFzdEVsIC8gdGhpcy5fZWxlbWVudEhlaWdodClcbiAgICAgICAgLCB0b3RhbEVsZW1lbnRzQmVmb3JlID0gTWF0aC5mbG9vcihzY3JvbGxQb3MgLyB0aGlzLl9lbGVtZW50SGVpZ2h0KSAtIEJVRkZFUjtcblxuICAgIGlmICgoZGlyZWN0aW9uID09ICdkb3duJyAmJiBlbHNUb1RoZUVuZCA8IEJVRkZFUilcbiAgICAgICAgfHwgKGRpcmVjdGlvbiA9PSAndXAnICYmIGVsc0Zyb21TdGFydCA8IEJVRkZFUikpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRJbmRleCA9IHRvdGFsRWxlbWVudHNCZWZvcmUgPiAwID8gdG90YWxFbGVtZW50c0JlZm9yZSA6IDA7XG4gICAgICAgIHRoaXMuX2VuZEluZGV4ID0gdG90YWxFbGVtZW50c0JlZm9yZSArIE1BWF9SRU5ERVJFRDtcbiAgICAgICAgdGhpcy5fZWxlbWVudEhlaWdodCA9IGZpcnN0Q2hpbGQuc3R5bGUuaGVpZ2h0O1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgICB0aGlzLl9sYXN0U2Nyb2xsUG9zID0gc2Nyb2xsUG9zO1xufVxuXG5cbi8qKlxuICogUHJpdmF0ZSBtZXRob2RcbiAqIFJldHJpZXZlcyB0aGUgZGF0YS12YWx1ZSBhdHRyaWJ1dGUgdmFsdWUgZnJvbSB0aGUgZWxlbWVudCBhbmQgcmV0dXJucyBpdCBhcyBhbiBpbmRleCBvZlxuICogdGhlIGZpbHRlcmVkT3B0aW9uc1xuICpcbiAqIEBwYXJhbSAge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIF9nZXREYXRhVmFsdWVGcm9tRWxlbWVudChlbCkge1xuICAgIHJldHVybiBOdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXZhbHVlJykpICsgdGhpcy5fc3RhcnRJbmRleDtcbn1cblxuLyoqXG4gKiBQcml2YXRlIG1ldGhvZFxuICogU2V0cyB0aGUgZGF0YSBvZiB0aGUgU3VwZXJDb21ibywgdGFraW5nIGNhcmUgdG8gcmVzZXQgc29tZSB0aGluZ3MgYW5kIHRlbXBvcmFyaWx5XG4gKiB1bnN1YnNjcmliZSBkYXRhIGxpc3RlbmVycy5cbiAqL1xuZnVuY3Rpb24gX3NldERhdGEoKSB7XG4gICAgZGVsZXRlIHRoaXMuX3NlbGVjdGVkLnNlbGVjdGVkO1xuICAgIHRoaXMuaGlkZU9wdGlvbnMoKTtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSk7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLm9mZignJywgeyBzdWJzY3JpYmVyOiBvbkRhdGFDaGFuZ2UsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgLy9zdXBlcmNvbWJvIGxpc3RlbmVycyBvZmZcbiAgICB0aGlzLmRhdGEuc2V0KHRoaXMuX3NlbGVjdGVkKTtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENPTUJPX0NIQU5HRV9NRVNTQUdFKTtcbiAgICB0aGlzLl9jb21ib0lucHV0LmRhdGEub24oJycsIHsgc3Vic2NyaWJlcjogb25EYXRhQ2hhbmdlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vc3VwZXJjb21ibyBsaXN0ZW5lcnMgb25cbiAgICB0aGlzLl9zZWxlY3RlZCA9IG51bGw7XG4gICAgdGhpcy5zZXRGaWx0ZXJlZE9wdGlvbnModGhpcy5fb3B0aW9uc0RhdGEpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxUZXh0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFRleHQnLCB7XG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS10ZXh0J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MVGV4dCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxUZXh0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlcjtcblxuXG52YXIgTUxUZXh0YXJlYSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxUZXh0YXJlYScsIHtcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXRleHRhcmVhJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MVGV4dGFyZWEpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MVGV4dGFyZWE7XG5cblxudmFyIFNBTVBMRV9BVVRPUkVTSVpFX1RFWFQgPSAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVlciBhZGlwaXNjaW5nIGVsaXQsJztcblxuXG5fLmV4dGVuZFByb3RvKE1MVGV4dGFyZWEsIHtcbiAgICBzdGFydEF1dG9yZXNpemU6IE1MVGV4dGFyZWEkc3RhcnRBdXRvcmVzaXplLFxuICAgIHN0b3BBdXRvcmVzaXplOiBNTFRleHRhcmVhJHN0b3BBdXRvcmVzaXplLFxuICAgIGlzQXV0b3Jlc2l6ZWQ6IE1MVGV4dGFyZWEkaXNBdXRvcmVzaXplZCxcbiAgICBkaXNhYmxlOiBNTFRleHRhcmVhJGRpc2FibGVcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkc3RhcnRBdXRvcmVzaXplKG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5fYXV0b3Jlc2l6ZSlcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTFRleHRhcmVhIHN0YXJ0QXV0b3Jlc2l6ZTogYXV0b3Jlc2l6ZSBpcyBhbHJlYWR5IG9uJyk7XG4gICAgdGhpcy5fYXV0b3Jlc2l6ZSA9IHRydWU7XG4gICAgdGhpcy5fYXV0b3Jlc2l6ZU9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgX2FkanVzdEFyZWFIZWlnaHQuY2FsbCh0aGlzKTtcbiAgICBfbWFuYWdlU3Vic2NyaXB0aW9ucy5jYWxsKHRoaXMsICdvbicpO1xufVxuXG5cbmZ1bmN0aW9uIF9tYW5hZ2VTdWJzY3JpcHRpb25zKG9uT2ZmKSB7XG4gICAgdGhpcy5ldmVudHNbb25PZmZdKCdjbGljaycsIHsgc3Vic2NyaWJlcjogX2FkanVzdEFyZWFIZWlnaHQsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgdGhpcy5kYXRhW29uT2ZmXSgnJywgeyBzdWJzY3JpYmVyOiBfYWRqdXN0QXJlYUhlaWdodCwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuXG5mdW5jdGlvbiBfYWRqdXN0QXJlYUhlaWdodCgpIHtcbiAgICB0aGlzLmVsLnN0eWxlLmhlaWdodCA9IDA7XG5cbiAgICB2YXIgbmV3SGVpZ2h0ID0gdGhpcy5lbC5zY3JvbGxIZWlnaHRcbiAgICAgICAgLCBtaW5IZWlnaHQgPSB0aGlzLl9hdXRvcmVzaXplT3B0aW9ucy5taW5IZWlnaHRcbiAgICAgICAgLCBtYXhIZWlnaHQgPSB0aGlzLl9hdXRvcmVzaXplT3B0aW9ucy5tYXhIZWlnaHQ7XG5cbiAgICBuZXdIZWlnaHQgPSBuZXdIZWlnaHQgPj0gbWF4SGVpZ2h0XG4gICAgICAgICAgICAgICAgPyBtYXhIZWlnaHRcbiAgICAgICAgICAgICAgICA6IG5ld0hlaWdodCA8PSBtaW5IZWlnaHRcbiAgICAgICAgICAgICAgICA/IG1pbkhlaWdodFxuICAgICAgICAgICAgICAgIDogbmV3SGVpZ2h0O1xuXG4gICAgdGhpcy5lbC5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyAncHgnO1xufVxuXG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkc3RvcEF1dG9yZXNpemUoKSB7XG4gICAgaWYgKCEgdGhpcy5fYXV0b3Jlc2l6ZSlcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTFRleHRhcmVhIHN0b3BBdXRvcmVzaXplOiBhdXRvcmVzaXplIGlzIG5vdCBvbicpO1xuICAgIHRoaXMuX2F1dG9yZXNpemUgPSBmYWxzZTtcbiAgICBfbWFuYWdlU3Vic2NyaXB0aW9ucy5jYWxsKHRoaXMsICdvZmYnKTtcbn1cblxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJGlzQXV0b3Jlc2l6ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9yZXNpemU7XG59XG5cblxuZnVuY3Rpb24gTUxUZXh0YXJlYSRkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9hdXRvcmVzaXplKVxuICAgICAgICB0aGlzLnN0b3BBdXRvcmVzaXplKCk7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkZGlzYWJsZShkaXNhYmxlKSB7XG4gICAgdGhpcy5lbC5kaXNhYmxlZCA9IGRpc2FibGU7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxUaW1lID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFRpbWUnLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MVGltZV9nZXQsXG4gICAgICAgIHNldDogTUxUaW1lX3NldCxcbiAgICAgICAgZGVsOiBNTFRpbWVfZGVsLFxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXRpbWUnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxUaW1lKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFRpbWU7XG5cblxudmFyIFRJTUVfUkVHRVggPSAvXihbMC05XXsxLDJ9KSg/OlxcOnxcXC4pKFswLTldezEsMn0pJC9cbiAgICAsIFRJTUVfVEVNUExBVEUgPSAnaGg6bW0nO1xuXG5mdW5jdGlvbiBNTFRpbWVfZ2V0KCkge1xuICAgIHZhciB0aW1lU3RyID0gdGhpcy5lbC52YWx1ZTtcbiAgICB2YXIgbWF0Y2ggPSB0aW1lU3RyLm1hdGNoKFRJTUVfUkVHRVgpO1xuICAgIGlmICghIG1hdGNoKSByZXR1cm47XG4gICAgdmFyIGhvdXJzID0gbWF0Y2hbMV1cbiAgICAgICAgLCBtaW5zID0gbWF0Y2hbMl07XG4gICAgaWYgKGhvdXJzID4gMjMgfHwgbWlucyA+IDU5KSByZXR1cm47XG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgxOTcwLCAwLCAxLCBob3VycywgbWlucyk7XG5cbiAgICByZXR1cm4gXy50b0RhdGUodGltZSk7XG59XG5cblxuZnVuY3Rpb24gTUxUaW1lX3NldCh2YWx1ZSkge1xuICAgIHZhciB0aW1lID0gXy50b0RhdGUodmFsdWUpO1xuICAgIGlmICghIHRpbWUpIHtcbiAgICAgICAgdGhpcy5lbC52YWx1ZSA9ICcnO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbWVTdHIgPSBUSU1FX1RFTVBMQVRFXG4gICAgICAgICAgICAucmVwbGFjZSgnaGgnLCBwYWQodGltZS5nZXRIb3VycygpKSlcbiAgICAgICAgICAgIC5yZXBsYWNlKCdtbScsIHBhZCh0aW1lLmdldE1pbnV0ZXMoKSkpO1xuXG4gICAgdGhpcy5lbC52YWx1ZSA9IHRpbWVTdHI7XG4gICAgcmV0dXJuIHRpbWVTdHI7XG5cbiAgICBmdW5jdGlvbiBwYWQobikge3JldHVybiBuIDwgMTAgPyAnMCcgKyBuIDogbjsgfVxufVxuXG5cbmZ1bmN0aW9uIE1MVGltZV9kZWwoKSB7XG4gICAgdGhpcy5lbC52YWx1ZSA9ICcnO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxXcmFwcGVyID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFdyYXBwZXInLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS13cmFwcGVyJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MV3JhcHBlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxXcmFwcGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgY29tcG9uZW50TmFtZSA9IG1pbG8udXRpbC5jb21wb25lbnROYW1lXG4gICAgLCBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxuXG52YXIgQUxFUlRfQ1NTX0NMQVNTRVMgPSB7XG4gICAgc3VjY2VzczogJ2FsZXJ0LXN1Y2Nlc3MnLFxuICAgIHdhcm5pbmc6ICdhbGVydC13YXJuaW5nJyxcbiAgICBpbmZvOiAnYWxlcnQtaW5mbycsXG4gICAgZGFuZ2VyOiAnYWxlcnQtZGFuZ2VyJyxcbiAgICBmaXhlZDogJ2FsZXJ0LWZpeGVkJ1xufTtcblxuXG52YXIgTUxBbGVydCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxBbGVydCcsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiBbJ21sLWJzLWFsZXJ0JywgJ2FsZXJ0JywgJ2ZhZGUnXSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgJ3JvbGUnOiAnYWxlcnQnLFxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnXFxcbiAgICAgICAgICAgIHt7PyBpdC5jbG9zZSB9fVxcXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiW2V2ZW50c106Y2xvc2VCdG5cIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvYnV0dG9uPlxcXG4gICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICB7ez0gaXQubWVzc2FnZX19J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQWxlcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQWxlcnQ7XG5cblxuXy5leHRlbmQoTUxBbGVydCwge1xuICAgIGNyZWF0ZUFsZXJ0OiBNTEFsZXJ0JCRjcmVhdGVBbGVydCxcbiAgICBvcGVuQWxlcnQ6IE1MQWxlcnQkJG9wZW5BbGVydCxcbn0pO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxBbGVydCwge1xuICAgIG9wZW5BbGVydDogTUxBbGVydCRvcGVuQWxlcnQsXG4gICAgY2xvc2VBbGVydDogTUxBbGVydCRjbG9zZUFsZXJ0XG59KTtcblxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBuZXcgYWxlcnQgaW5zdGFuY2UuIFRvIGNyZWF0ZSBhbmQgb3BlbiBhdCB0aGUgc2FtZSB0aW1lIHVzZSBbb3BlbkFsZXJ0XSgjTUxBbGVydCQkb3BlbkFsZXJ0KVxuICogYG9wdGlvbnNgIGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgICAgIG1lc3NhZ2U6IHN0cmluZyBhbGVydCBtZXNzYWdlXG4gKiAgICAgIHR5cGU6ICAgIG9wdGlvbmFsIHN0cmluZyB0aGUgdHlwZSBvZiBhbGVydCBtZXNzYWdlLCBvbmUgb2Ygc3VjY2Vzcywgd2FybmluZywgaW5mbywgZGFuZ2VyLCBmaXhlZFxuICogICAgICAgICAgICAgICBkZWZhdWx0ICdpbmZvJ1xuICogICAgICBjbG9zZTogICBvcHRpb25hbCBmYWxzZSB0byBwcmV2ZW50IHVzZXIgZnJvbSBjbG9zaW5nXG4gKiAgICAgICAgICAgICAgIG9yIHRydWUgKGRlZmF1bHQpIHRvIGVuYWJsZSBjbG9zaW5nIGFuZCByZW5kZXIgYSBjbG9zZSBidXR0b25cbiAqICAgICAgdGltZW91dDogb3B0aW9uYWwgdGltZXIsIGluIG1pbGxpc2Vjb25kcyB0byBhdXRvbWF0aWNhbGx5IGNsb3NlIHRoZSBhbGVydFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIGFsZXJ0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZnVuY3Rpb24gTUxBbGVydCQkY3JlYXRlQWxlcnQob3B0aW9ucykge1xuICAgIGNoZWNrKG9wdGlvbnMsIHtcbiAgICAgICAgbWVzc2FnZTogU3RyaW5nLFxuICAgICAgICB0eXBlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBjbG9zZTogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgIHRpbWVvdXQ6IE1hdGNoLk9wdGlvbmFsKE51bWJlcilcbiAgICB9KTtcblxuICAgIHZhciBhbGVydCA9IE1MQWxlcnQuY3JlYXRlT25FbGVtZW50KCk7XG5cbiAgICBvcHRpb25zID0gX3ByZXBhcmVPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgdmFyIGFsZXJ0Q2xzID0gQUxFUlRfQ1NTX0NMQVNTRVNbb3B0aW9ucy50eXBlXTtcbiAgICBhbGVydC5kb20uYWRkQ3NzQ2xhc3NlcyhhbGVydENscyk7XG5cbiAgICBhbGVydC5fYWxlcnQgPSB7XG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcblxuICAgIGFsZXJ0LnRlbXBsYXRlLnJlbmRlcihvcHRpb25zKS5iaW5kZXIoKTtcblxuICAgIHZhciBhbGVydFNjb3BlID0gYWxlcnQuY29udGFpbmVyLnNjb3BlO1xuXG4gICAgaWYgKG9wdGlvbnMuY2xvc2UpXG4gICAgICAgIGFsZXJ0U2NvcGUuY2xvc2VCdG4uZXZlbnRzLm9uKCdjbGljaycsXG4gICAgICAgICAgICB7IHN1YnNjcmliZXI6IF9vbkNsb3NlQnRuQ2xpY2ssIGNvbnRleHQ6IGFsZXJ0IH0pO1xuXG4gICAgaWYgKG9wdGlvbnMudGltZW91dClcbiAgICAgICAgdmFyIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoYWxlcnQuX2FsZXJ0LnZpc2libGUpXG4gICAgICAgICAgICAgICAgYWxlcnQuY2xvc2VBbGVydCgpO1xuICAgICAgICB9LCBvcHRpb25zLnRpbWVvdXQpO1xuXG4gICAgcmV0dXJuIGFsZXJ0O1xufVxuXG5cbi8qKlxuICogQ3JlYXRlIGFuZCBzaG93IGFsZXJ0IHBvcHVwXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0IHdpdGggbWVzc2FnZSwgdHlwZSwgY2xvc2UgYW5kIHRpbWVvdXRcbiAqIEByZXR1cm4ge01MQWxlcnR9IHRoZSBhbGVydCBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JCRvcGVuQWxlcnQob3B0aW9ucykge1xuICAgIHZhciBhbGVydCA9IE1MQWxlcnQuY3JlYXRlQWxlcnQob3B0aW9ucyk7XG4gICAgYWxlcnQub3BlbkFsZXJ0KCk7XG4gICAgcmV0dXJuIGFsZXJ0O1xufVxuXG5cbmZ1bmN0aW9uIF9vbkNsb3NlQnRuQ2xpY2sodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLmNsb3NlQWxlcnQoKTtcbn1cblxuXG5mdW5jdGlvbiBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBfLmNsb25lKG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuY2xvc2UgPSB0eXBlb2Ygb3B0aW9ucy5jbG9zZSA9PSAndW5kZWZpbmVkJyB8fCBvcHRpb25zLmNsb3NlID09PSB0cnVlO1xuICAgIG9wdGlvbnMudGltZW91dCA9IE1hdGguZmxvb3Iob3B0aW9ucy50aW1lb3V0KTtcbiAgICBvcHRpb25zLnR5cGUgPSBvcHRpb25zLnR5cGUgfHwgJ2luZm8nO1xuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59XG5cblxuLyoqXG4gKiBPcGVuIHRoZSBhbGVydFxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JG9wZW5BbGVydCgpIHtcbiAgICBfdG9nZ2xlQWxlcnQuY2FsbCh0aGlzLCB0cnVlKTtcbn1cblxuXG4vKipcbiAqIENsb3NlIHRoZSBhbGVydFxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JGNsb3NlQWxlcnQoKSB7XG4gICAgX3RvZ2dsZUFsZXJ0LmNhbGwodGhpcywgZmFsc2UpO1xuICAgIHRoaXMuZGVzdHJveSgpO1xufVxuXG5cbmZ1bmN0aW9uIF90b2dnbGVBbGVydChkb1Nob3cpIHtcbiAgICBkb1Nob3cgPSB0eXBlb2YgZG9TaG93ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgPyAhIHRoaXMuX2FsZXJ0LnZpc2libGVcbiAgICAgICAgICAgICAgICA6ICEhIGRvU2hvdztcblxuICAgIHZhciBhZGRSZW1vdmUgPSBkb1Nob3cgPyAnYWRkJyA6ICdyZW1vdmUnXG4gICAgICAgICwgYXBwZW5kUmVtb3ZlID0gZG9TaG93ID8gJ2FwcGVuZENoaWxkJyA6ICdyZW1vdmVDaGlsZCc7XG5cbiAgICB0aGlzLl9hbGVydC52aXNpYmxlID0gZG9TaG93O1xuXG4gICAgZG9jdW1lbnQuYm9keVthcHBlbmRSZW1vdmVdKHRoaXMuZWwpO1xuICAgIHRoaXMuZG9tLnRvZ2dsZShkb1Nob3cpO1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFkb1Nob3cpO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0W2FkZFJlbW92ZV0oJ2luJyk7XG4gICAgdGhpcy5lbFtkb1Nob3cgPyAnZm9jdXMnIDogJ2JsdXInXSgpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgY29tcG9uZW50TmFtZSA9IG1pbG8udXRpbC5jb21wb25lbnROYW1lXG4gICAgLCBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxuXG52YXIgREVGQVVMVF9CVVRUT05TID0gWyB7IHR5cGU6ICdkZWZhdWx0JywgbGFiZWw6ICdPSycsIHJlc3VsdDogJ09LJyB9IF07XG5cbnZhciBDTE9TRV9PUFRJT05TID0gWydiYWNrZHJvcCcsICdrZXlib2FyZCcsICdidXR0b24nXTtcblxudmFyIEJVVFRPTl9DU1NfQ0xBU1NFUyA9IHsgLy8gVE9ETyAtIHVzZSBpbiB0ZW1wbGF0ZVxuICAgIGRlZmF1bHQ6ICdidG4tZGVmYXVsdCcsXG4gICAgcHJpbWFyeTogJ2J0bi1wcmltYXJ5JyxcbiAgICBzdWNjZXNzOiAnYnRuLXN1Y2Nlc3MnLFxuICAgIGluZm86ICdidG4taW5mbycsXG4gICAgd2FybmluZzogJ2J0bi13YXJuaW5nJyxcbiAgICBkYW5nZXI6ICdidG4tZGFuZ2VyJyxcbiAgICBsaW5rOiAnYnRuLWxpbmsnXG59O1xuXG5cbi8qKlxuICogRGlhbG9nIGNsYXNzIHRvIHNob3cgY3VzdG9tIGRpYWxvZyBib3hlcyBiYXNlZCBvbiBjb25maWd1cmF0aW9uIC0gc2VlIFtjcmVhdGVEaWFsb2ddKCNNTERpYWxvZyQkY3JlYXRlRGlhbG9nKSBtZXRob2QuXG4gKiBPbmx5IG9uZSBkaWFsb2cgY2FuIGJlIG9wZW5lZCBhdCBhIHRpbWUgLSB0cnlpbmcgdG8gb3BlbiBhbm90aGVyIHdpbGwgbG9nIGVycm9yIHRvIGNvbnNvbGUuIEN1cnJlbnRseSBvcGVuZWQgZGlhbG9nIGNhbiBiZSByZXRyaWV2ZWQgdXNpbmcgW2dldEN1cnJlbnREaWFsb2ddKCNNTERpYWxvZyQkZ2V0Q3VycmVudERpYWxvZykgY2xhc3MgbWV0aG9kLlxuICovXG52YXIgTUxEaWFsb2cgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRGlhbG9nJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6IFsnbWwtYnMtZGlhbG9nJywgJ21vZGFsJywgJ2ZhZGUnXSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgJ3JvbGUnOiAnZGlhbG9nJyxcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJ1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ1xcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZGlhbG9nIHt7PSBpdC5jc3NDbGFzcyB9fVwiPlxcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez8gaXQudGl0bGUgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGl0LmNsb3NlLmJ1dHRvbiB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cIltldmVudHNdOmNsb3NlQnRuXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIj4mdGltZXM7PC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwibW9kYWwtdGl0bGVcIj57ez0gaXQudGl0bGUgfX08L2g0PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgIHt7PyBpdC5odG1sIHx8IGl0LnRleHQgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIiBtbC1iaW5kPVwiW2NvbnRhaW5lcl06ZGlhbG9nQm9keVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGl0Lmh0bWwgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez0gaXQuaHRtbCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+e3s9IGl0LnRleHQgfX08L3A+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgIHt7PyBpdC5idXR0b25zICYmIGl0LmJ1dHRvbnMubGVuZ3RoIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1mb290ZXJcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7fiBpdC5idXR0b25zIDpidG4gfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImJ0biBidG4te3s9IGJ0bi50eXBlIH19e3s/IGJ0bi5jbHMgfX0ge3s9IGJ0bi5jbHMgfX17ez99fVwiXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1sLWJpbmQ9XCJbZXZlbnRzXTp7ez0gYnRuLm5hbWUgfX1cIj57ez0gYnRuLmxhYmVsIH19PC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e359fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgIDwvZGl2PidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERpYWxvZyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEaWFsb2c7XG5cblxuXy5leHRlbmQoTUxEaWFsb2csIHtcbiAgICBjcmVhdGVEaWFsb2c6IE1MRGlhbG9nJCRjcmVhdGVEaWFsb2csXG4gICAgb3BlbkRpYWxvZzogTUxEaWFsb2ckJG9wZW5EaWFsb2csXG4gICAgZ2V0T3BlbmVkRGlhbG9nOiBNTERpYWxvZyQkZ2V0T3BlbmVkRGlhbG9nXG59KTtcblxuXG5fLmV4dGVuZFByb3RvKE1MRGlhbG9nLCB7XG4gICAgb3BlbkRpYWxvZzogTUxEaWFsb2ckb3BlbkRpYWxvZyxcbiAgICBjbG9zZURpYWxvZzogTUxEaWFsb2ckY2xvc2VEaWFsb2csXG4gICAgZGVzdHJveTogTUxEaWFsb2ckZGVzdHJveVxufSk7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGFuZCByZXR1cm5zIGRpYWxvZyBpbnN0YW5jZS4gVG8gY3JlYXRlIGFuZCBvcGVuIGF0IHRoZSBzYW1lIHRpbWUgW29wZW5EaWFsb2ddKCNNTERpYWxvZyQkb3BlbkRpYWxvZylcbiAqIGBvcHRpb25zYCBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAgIHRpdGxlOiBvcHRpb25hbCBkaWFsb2cgdGl0bGVcbiAqICAgICBodG1sOiBvcHRpb25hbCBkaWFsb2cgdGV4dCBhcyBodG1sICh3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIHRleHQgaWYgYm90aCB0ZXh0IG5kIGh0bWwgYXJlIHBhc3NlZClcbiAqICAgICAgIG9yXG4gKiAgICAgdGV4dDogb3B0aW9uYWwgZGlhbG9nIHRleHRcbiAqICAgICBjbG9zZTogb3B0aW9uYWwgZmFsc2UgdG8gcHJldmVudCBiYWNrZHJvcCBhbmQgZXNjIGtleSBmcm9tIGNsb3NpbmcgdGhlIGRpYWxvZyBhbmQgcmVtb3ZpbmcgY2xvc2UgYnV0dG9uIGluIHRvcCByaWdodCBjb3JuZXJcbiAqICAgICAgICAgICAgb3IgdHJ1ZSAoZGVmYXVsdCkgdG8gZW5hYmxlIGFsbCBjbG9zZSBvcHRpb25zXG4gKiAgICAgICAgICAgIG9yIG9iamVjdCB3aXRoIHByb3BlcnRpZXNcbiAqICAgICAgICAgYmFja2Ryb3A6IGZhbHNlIG9yIHRydWUgKGRlZmF1bHQpLCBjbG9zZSBkaWFsb2cgd2hlbiBiYWNrZHJvcCBjbGlja2VkXG4gKiAgICAgICAgIGtleWJvYXJkOiBmYWxzZSBvciB0cnVlIChkZWZhdWx0KSwgY2xvc2UgZGlhbG9nIHdoZW4gZXNjIGtleSBpcyBwcmVzc2VkXG4gKiAgICAgICAgIGJ1dHRvbjogZmFsc2Ugb3IgdHJ1ZSAoZGVmYXVsdCksIHNob3cgY2xvc2UgYnV0dG9uIGluIHRoZSBoZWFkZXIgKHdvbid0IGJlIHNob3duIGlmIHRoZXJlIGlzIG5vIGhlYWRlciB3aGVuIHRpdGxlIGlzIG5vdCBwYXNzZWQpXG4gKiAgICAgYnV0dG9uczogb3B0aW9uYWwgYXJyYXkgb2YgYnV0dG9ucyBjb25maWd1cmF0aW9ucywgd2hlcmUgZWFjaCBidXR0b24gY29uZmlnIGlzIGFuIG9iamVjdFxuICogICAgICAgICBuYW1lOiAgIG9wdGlvbmFsIG5hbWUgb2YgY29tcG9uZW50LCBzaG91bGQgYmUgdW5pcXVlIGFuZCBzaG91bGQgbm90IGJlIGBjbG9zZUJ0bmAsIGlmIG5vdCBwYXNzZWQgYSB0aW1lc3RhbXAgYmFzZWQgbmFtZSB3aWxsIGJlIHVzZWRcbiAqICAgICAgICAgdHlwZTogICBidXR0b24gdHlwZSwgd2lsbCBkZXRlcm1pbmUgYnV0dG9uIENTUyBzdHlsZS4gUG9zc2libGUgdHlwZXMgYXJlOiBkZWZ1bHQsIHByaW1hcnksIHN1Y2Nlc3MsIGluZm8sIHdhcm5pbmcsIGRhbmdlciwgbGluayAobWFwIHRvIHJlbGF0ZWQgYm9vdHN0cmFwIGJ1dHRvbiBzdHlsZXMpXG4gKiAgICAgICAgIGxhYmVsOiAgYnV0dG9uIGxhYmVsXG4gKiAgICAgICAgIGNsb3NlOiAgb3B0aW9uYWwgZmFsc2UgdG8gcHJldmVudCB0aGlzIGJ1dHRvbiBmcm9tIGNsb3NpbmcgZGlhbG9nXG4gKiAgICAgICAgIHJlc3VsdDogc3RyaW5nIHdpdGggZGlhbG9nIGNsb3NlIHJlc3VsdCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIGRpYWxvZyBzdWJzY3JpYmVyIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAqICAgICAgICAgZGF0YTogICBhbnkgdmFsdWUvb2JqZWN0IG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSBkYXRhIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gZGlhbG9nIHN1YnNjcmliZXIgYXMgdGhlIHNlY29uZCBwYXJhbWV0ZXIuXG4gKiAgICAgICAgICAgICAgICAgSWYgZnVuY3Rpb24gaXMgcGFzc2VkIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggZGlhbG9nIGFzIGNvbnRleHQgYW5kIGJ1dHRvbiBvcHRpb25zIGFzIHBhcmFtZXRlci5cbiAqXG4gKiAgICAgSWYgYHRpdGxlYCBpcyBub3QgcGFzc2VkLCBkaWFsb2cgd2lsbCBub3QgaGF2ZSB0aXRsZSBzZWN0aW9uXG4gKiAgICAgSWYgbmVpdGhlciBgdGV4dGAgbm9yIGBodG1sYCBpcyBwYXNzZWQsIGRpYWxvZyB3aWxsIG5vdCBoYXZlIGJvZHkgc2VjdGlvbi5cbiAqICAgICBJZiBgYnV0dG9uc2AgYXJlIG5vdCBwYXNzZWQsIHRoZXJlIHdpbGwgb25seSBiZSBPSyBidXR0b24uXG4gKlxuICogV2hlbiBkaWFsb2cgaXMgY2xvc2VkLCB0aGUgc3Vic2NyaWJlciBpcyBjYWxsZWQgd2l0aCByZWF1bHQgYW5kIG9wdGlvbmFsIGRhdGEgYXMgZGVmaW5lZCBpbiBidXR0b25zIGNvbmZpZ3VyYXRpb25zLlxuICogSWYgYmFja2Ryb3AgaXMgY2xpY2tlZCBvciBFU0Mga2V5IGlzIHByZXNzZWQgdGhlIHJlc3VsdCB3aWxsIGJlICdkaXNtaXNzZWQnXG4gKiBJZiBjbG9zZSBidXR0b24gaW4gdGhlIHRvcCByaWdodCBjb3JuZXIgaXMgY2xpY2tlZCwgdGhlIHJlc3VsdCB3aWxsIGJlICdjbG9zZWQnIChkZWZhdWx0IHJlc3VsdClcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBkaWFsb2cgY29uZmlndXJhdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gaW5pdGlhbGl6ZSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB0byBpbml0aWFsaXplIHRoZSBkaWFsb2dcbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckJGNyZWF0ZURpYWxvZyhvcHRpb25zLCBpbml0aWFsaXplKSB7XG4gICAgY2hlY2sob3B0aW9ucywge1xuICAgICAgICB0aXRsZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgaHRtbDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgdGV4dDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgY2xvc2U6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLk9uZU9mKEJvb2xlYW4sIHtcbiAgICAgICAgICAgIGJhY2tkcm9wOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgICAgIGtleWJvYXJkOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgICAgIGJ1dHRvbjogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbilcbiAgICAgICAgfSkpLFxuICAgICAgICBidXR0b25zOiBNYXRjaC5PcHRpb25hbChbIHtcbiAgICAgICAgICAgIG5hbWU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgICAgICBsYWJlbDogU3RyaW5nLFxuICAgICAgICAgICAgY2xvc2U6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgICAgICAgcmVzdWx0OiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICAgICAgZGF0YTogTWF0Y2guT3B0aW9uYWwoTWF0Y2guQW55KSxcbiAgICAgICAgICAgIGNsczogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKVxuICAgICAgICB9IF0pLFxuICAgICAgICBjc3NDbGFzczogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKVxuICAgIH0pO1xuXG4gICAgdmFyIGRpYWxvZyA9IE1MRGlhbG9nLmNyZWF0ZU9uRWxlbWVudCgpO1xuXG4gICAgb3B0aW9ucyA9IF9wcmVwYXJlT3B0aW9ucyhvcHRpb25zKTtcbiAgICBkaWFsb2cuX2RpYWxvZyA9IHtcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuXG4gICAgZGlhbG9nLnRlbXBsYXRlXG4gICAgICAgIC5yZW5kZXIob3B0aW9ucylcbiAgICAgICAgLmJpbmRlcigpO1xuXG4gICAgdmFyIGRpYWxvZ1Njb3BlID0gZGlhbG9nLmNvbnRhaW5lci5zY29wZTtcblxuICAgIGlmIChvcHRpb25zLmNsb3NlLmJhY2tkcm9wKVxuICAgICAgICBkaWFsb2cuZXZlbnRzLm9uKCdjbGljaycsXG4gICAgICAgICAgICB7IHN1YnNjcmliZXI6IF9vbkJhY2tkcm9wQ2xpY2ssIGNvbnRleHQ6IGRpYWxvZyB9KTtcblxuICAgIGlmIChvcHRpb25zLnRpdGxlICYmIG9wdGlvbnMuY2xvc2UuYnV0dG9uKVxuICAgICAgICBkaWFsb2dTY29wZS5jbG9zZUJ0bi5ldmVudHMub24oJ2NsaWNrJyxcbiAgICAgICAgICAgIHsgc3Vic2NyaWJlcjogX29uQ2xvc2VCdG5DbGljaywgY29udGV4dDogZGlhbG9nIH0pO1xuXG4gICAgb3B0aW9ucy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24oYnRuKSB7XG4gICAgICAgIHZhciBidXR0b25TdWJzY3JpYmVyID0ge1xuICAgICAgICAgICAgc3Vic2NyaWJlcjogXy5wYXJ0aWFsKF9kaWFsb2dCdXR0b25DbGljaywgYnRuKSxcbiAgICAgICAgICAgIGNvbnRleHQ6IGRpYWxvZ1xuICAgICAgICB9O1xuICAgICAgICBkaWFsb2dTY29wZVtidG4ubmFtZV0uZXZlbnRzLm9uKCdjbGljaycsIGJ1dHRvblN1YnNjcmliZXIpO1xuICAgIH0pO1xuXG4gICAgaWYgKGluaXRpYWxpemUpIGluaXRpYWxpemUoZGlhbG9nKTtcbiAgICByZXR1cm4gZGlhbG9nO1xufVxuXG5cbmZ1bmN0aW9uIF9kaWFsb2dCdXR0b25DbGljayhidXR0b24pIHtcbiAgICBpZiAoYnV0dG9uLmNsb3NlICE9PSBmYWxzZSlcbiAgICAgICAgX3RvZ2dsZURpYWxvZy5jYWxsKHRoaXMsIGZhbHNlKTtcblxuICAgIHZhciBkYXRhID0gXy5yZXN1bHQoYnV0dG9uLmRhdGEsIHRoaXMsIGJ1dHRvbik7XG4gICAgX2Rpc3BhdGNoUmVzdWx0LmNhbGwodGhpcywgYnV0dG9uLnJlc3VsdCwgZGF0YSk7XG59XG5cblxuZnVuY3Rpb24gX2Rpc3BhdGNoUmVzdWx0KHJlc3VsdCwgZGF0YSkge1xuICAgIHZhciBzdWJzY3JpYmVyID0gdGhpcy5fZGlhbG9nLnN1YnNjcmliZXI7XG4gICAgaWYgKHR5cGVvZiBzdWJzY3JpYmVyID09ICdmdW5jdGlvbicpXG4gICAgICAgIHN1YnNjcmliZXIuY2FsbCh0aGlzLCByZXN1bHQsIGRhdGEpO1xuICAgIGVsc2VcbiAgICAgICAgc3Vic2NyaWJlci5zdWJzY3JpYmVyLmNhbGwoc3Vic2NyaWJlci5jb250ZXh0LCByZXN1bHQsIGRhdGEpO1xufVxuXG5cbmZ1bmN0aW9uIF9vbkJhY2tkcm9wQ2xpY2soZXZlbnRUeXBlLCBldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQgPT0gdGhpcy5lbClcbiAgICAgICAgdGhpcy5jbG9zZURpYWxvZygnZGlzbWlzc2VkJyk7XG59XG5cblxuZnVuY3Rpb24gX29uQ2xvc2VCdG5DbGljaygpIHtcbiAgICB0aGlzLmNsb3NlRGlhbG9nKCdjbG9zZWQnKTtcbn1cblxuXG5mdW5jdGlvbiBfb25LZXlEb3duKGV2ZW50KSB7XG4gICAgaWYgKG9wZW5lZERpYWxvZ1xuICAgICAgICAgICAgJiYgb3BlbmVkRGlhbG9nLl9kaWFsb2cub3B0aW9ucy5jbG9zZS5rZXlib2FyZFxuICAgICAgICAgICAgJiYgZXZlbnQua2V5Q29kZSA9PSAyNykgLy8gZXNjIGtleVxuICAgICAgICBvcGVuZWREaWFsb2cuY2xvc2VEaWFsb2coJ2Rpc21pc3NlZCcpO1xufVxuXG5cbmZ1bmN0aW9uIF9wcmVwYXJlT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IF8uY2xvbmUob3B0aW9ucyk7XG4gICAgb3B0aW9ucy5idXR0b25zID0gXy5jbG9uZShvcHRpb25zLmJ1dHRvbnMgfHwgREVGQVVMVF9CVVRUT05TKTtcbiAgICBvcHRpb25zLmJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbihidG4pIHtcbiAgICAgICAgYnRuLm5hbWUgPSBidG4ubmFtZSB8fCBjb21wb25lbnROYW1lKCk7XG4gICAgfSk7XG5cbiAgICBvcHRpb25zLmNsb3NlID0gdHlwZW9mIG9wdGlvbnMuY2xvc2UgPT0gJ3VuZGVmaW5lZCcgfHwgb3B0aW9ucy5jbG9zZSA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfLm9iamVjdChDTE9TRV9PUFRJT05TLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0eXBlb2Ygb3B0aW9ucy5jbG9zZSA9PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXy5tYXBUb09iamVjdChDTE9TRV9PUFRJT05TLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihvcHQpIHsgcmV0dXJuIG9wdGlvbnMuY2xvc2Vbb3B0XSAhPT0gZmFsc2U7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfLm9iamVjdChDTE9TRV9PUFRJT05TLCBmYWxzZSk7XG5cbiAgICByZXR1cm4gb3B0aW9ucztcbn1cblxuXG4vKipcbiAqIENyZWF0ZSBhbmQgc2hvdyBkaWFsb2cgcG9wdXBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBvYmplY3Qgd2l0aCB0aXRsZSwgdGV4dCBhbmQgYnV0dG9ucy4gU2VlIFtjcmVhdGVEaWFsb2ddKCNNTERpYWxvZyQkY3JlYXRlRGlhbG9nKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBzdWJzY3JpYmVyIG9wdGlvbmFsIHN1YnNjcmliZXIgZnVuY3Rpb24gb3Igb2JqZWN0IHRoYXQgaXMgcGFzc2VkIHJlc3VsdCBhbmQgb3B0aW9uYWwgZGF0YS4gVW5sZXNzIGNvbnRleHQgaXMgZGVmaW5lZCwgZGlhbG9nIHdpbGwgYmUgdGhlIGNvbnRleHQuXG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJCRvcGVuRGlhbG9nKG9wdGlvbnMsIHN1YnNjcmliZXIsIGluaXRpYWxpemUpIHtcbiAgICB2YXIgZGlhbG9nID0gTUxEaWFsb2cuY3JlYXRlRGlhbG9nKG9wdGlvbnMsIGluaXRpYWxpemUpO1xuICAgIGRpYWxvZy5vcGVuRGlhbG9nKHN1YnNjcmliZXIpO1xuICAgIHJldHVybiBkaWFsb2c7XG59XG5cblxuXG5mdW5jdGlvbiBfdG9nZ2xlRGlhbG9nKGRvU2hvdykge1xuICAgIGRvU2hvdyA9IHR5cGVvZiBkb1Nob3cgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgICAgICA/ICEgdGhpcy5fZGlhbG9nLnZpc2libGVcbiAgICAgICAgICAgICAgICA6ICEhIGRvU2hvdztcblxuICAgIHZhciBhZGRSZW1vdmUgPSBkb1Nob3cgPyAnYWRkJyA6ICdyZW1vdmUnXG4gICAgICAgICwgYXBwZW5kUmVtb3ZlID0gZG9TaG93ID8gJ2FwcGVuZENoaWxkJyA6ICdyZW1vdmVDaGlsZCc7XG5cbiAgICB0aGlzLl9kaWFsb2cudmlzaWJsZSA9IGRvU2hvdztcblxuICAgIGlmIChkb1Nob3cgJiYgISBkaWFsb2dzSW5pdGlhbGl6ZWQpXG4gICAgICAgIF9pbml0aWFsaXplRGlhbG9ncygpO1xuXG4gICAgZG9jdW1lbnQuYm9keVthcHBlbmRSZW1vdmVdKHRoaXMuZWwpO1xuICAgIGlmIChiYWNrZHJvcEVsKVxuICAgICAgICBkb2N1bWVudC5ib2R5W2FwcGVuZFJlbW92ZV0oYmFja2Ryb3BFbCk7XG4gICAgdGhpcy5kb20udG9nZ2xlKGRvU2hvdyk7XG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgIWRvU2hvdyk7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3RbYWRkUmVtb3ZlXSgnbW9kYWwtb3BlbicpO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0W2FkZFJlbW92ZV0oJ2luJyk7XG5cbiAgICBvcGVuZWREaWFsb2cgPSBkb1Nob3cgPyB0aGlzIDogdW5kZWZpbmVkO1xuICAgIHRoaXMuZWxbZG9TaG93ID8gJ2ZvY3VzJyA6ICdibHVyJ10oKTtcbn1cblxuXG52YXIgZGlhbG9nc0luaXRpYWxpemVkLCBiYWNrZHJvcEVsO1xuXG5mdW5jdGlvbiBfaW5pdGlhbGl6ZURpYWxvZ3MoKSB7XG4gICAgYmFja2Ryb3BFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGJhY2tkcm9wRWwuY2xhc3NOYW1lID0gJ21vZGFsLWJhY2tkcm9wIGZhZGUgaW4nO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfb25LZXlEb3duKTtcbiAgICBkaWFsb2dzSW5pdGlhbGl6ZWQgPSB0cnVlO1xufVxuXG5cbnZhciBvcGVuZWREaWFsb2c7XG5cbi8qKlxuICogT3BlbnMgZGlhbG9nIGluc3RhbmNlLlxuICogU3Vic2NyaWJlciBvYmplY3Qgc2hvdWxkIGhhdmUgdGhlIHNhbWUgZm9ybWF0IGFzIHRoZSBzdWJzY3JpYmVyIGZvciB0aGUgTWVzc2VuZ2VyIChhbHRob3VnaCBNZXNzZW5nZXIgaXMgbm90IHVzZWQpIC0gZWl0aGVyIGZ1bmN0aW9uIG9yIG9iamVjdCB3aXRoIHN1YnNjcmliZXIgYW5kIGNvbnRleHQgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gc3Vic2NyaWJlciBzdWJzY3JpYmVyIG9iamVjdFxuICovXG5mdW5jdGlvbiBNTERpYWxvZyRvcGVuRGlhbG9nKHN1YnNjcmliZXIpIHtcbiAgICBjaGVjayhzdWJzY3JpYmVyLCBNYXRjaC5PbmVPZihGdW5jdGlvbiwgeyBzdWJzY3JpYmVyOiBGdW5jdGlvbiwgY29udGV4dDogTWF0Y2guQW55IH0pKTtcblxuICAgIGlmIChvcGVuZWREaWFsb2cpXG4gICAgICAgIHJldHVybiBsb2dnZXIud2FybignTUxEaWFsb2cgb3BlbkRpYWxvZzogY2FuXFwndCBvcGVuIGRpYWxvZywgYW5vdGhlciBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuJyk7XG5cbiAgICB0aGlzLl9kaWFsb2cuc3Vic2NyaWJlciA9IHN1YnNjcmliZXI7XG4gICAgX3RvZ2dsZURpYWxvZy5jYWxsKHRoaXMsIHRydWUpO1xufVxuXG5cbi8qKlxuICogQ2xvc2VzIGRpYWxvZyBpbnN0YW5jZSwgb3B0aW9uYWxseSBwYXNzaW5nIHJlc3VsdCBhbmQgZGF0YSB0byBkaWFsb2cgc3Vic2NyaWJlci5cbiAqIElmIG5vIHJlc3VsdCBpcyBwYXNzZWQsICdjbG9zZWQnIHdpbGwgYmUgcGFzc2VkIHRvIHN1YnNjcmliZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHJlc3VsdCBkaWFsb2cgcmVzdWx0LCBwYXNzZWQgYXMgdGhlIGZpcnN0IHBhcmFtZXRlciB0byBzdWJjc3JpYmVyXG4gKiBAcGFyYW0ge0FueX0gZGF0YSBvcHRpb25hbCBkaWFsb2cgZGF0YSwgcGFzc2VkIGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIHN1YnNjcmliZXJcbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckY2xvc2VEaWFsb2cocmVzdWx0LCBkYXRhKSB7XG4gICAgaWYgKCEgb3BlbmVkRGlhbG9nKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLndhcm4oJ01MRGlhbG9nIGNsb3NlRGlhbG9nOiBjYW5cXCd0IGNsb3NlIGRpYWxvZywgbm8gZGlhbG9nIG9wZW4nKTtcblxuICAgIHJlc3VsdCA9IHJlc3VsdCB8fCAnY2xvc2VkJztcblxuICAgIF90b2dnbGVEaWFsb2cuY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgX2Rpc3BhdGNoUmVzdWx0LmNhbGwodGhpcywgcmVzdWx0LCBkYXRhKTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgY3VycmVudGx5IG9wZW5lZCBkaWFsb2dcbiAqXG4gKiBAcmV0dXJuIHtNTERpYWxvZ31cbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckJGdldE9wZW5lZERpYWxvZygpIHtcbiAgICByZXR1cm4gb3BlbmVkRGlhbG9nO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGlhbG9nJGRlc3Ryb3koKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9vbktleURvd24pO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgRE9NTGlzdGVuZXJzID0gbWlsby51dGlsLmRvbUxpc3RlbmVycztcblxuXG52YXIgVE9HR0xFX0NTU19DTEFTUyA9ICdkcm9wZG93bi10b2dnbGUnXG4gICAgLCBNRU5VX0NTU19DTEFTUyA9ICdkcm9wZG93bi1tZW51JztcblxuXG52YXIgTUxEcm9wZG93biA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxEcm9wZG93bicsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiBbJ21sLWJzLWRyb3Bkb3duJywgJ2Ryb3Bkb3duJ11cbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERyb3Bkb3duKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTERyb3Bkb3duO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxEcm9wZG93biwge1xuICAgIHN0YXJ0OiBNTERyb3Bkb3duJHN0YXJ0LFxuICAgIGRlc3Ryb3k6IE1MRHJvcGRvd24kZGVzdHJveSxcbiAgICB0b2dnbGVNZW51OiBNTERyb3Bkb3duJHRvZ2dsZU1lbnUsXG4gICAgc2hvd01lbnU6IE1MRHJvcGRvd24kc2hvd01lbnUsXG4gICAgaGlkZU1lbnU6IE1MRHJvcGRvd24kaGlkZU1lbnVcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kc3RhcnQoKSB7XG4gICAgdmFyIHRvZ2dsZUVsID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcuJyArIFRPR0dMRV9DU1NfQ0xBU1MpXG4gICAgICAgICwgbWVudUVsID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcuJyArIE1FTlVfQ1NTX0NMQVNTKTtcblxuICAgIGlmICghICh0b2dnbGVFbCAmJiBtZW51RWwpKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLmVycm9yKCdNTERyb3Bkb3duOicsIFRPR0dMRV9DU1NfQ0xBU1MsICdvcicsIE1FTlVfQ1NTX0NMQVNTLCAnaXNuXFwndCBmb3VuZCcpO1xuXG4gICAgdmFyIGRvYyA9IHdpbmRvdy5kb2N1bWVudFxuICAgICAgICAsIGNsaWNrSGFuZGxlciA9IHRoaXMudG9nZ2xlTWVudS5iaW5kKHRoaXMsIHVuZGVmaW5lZCk7XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gbmV3IERPTUxpc3RlbmVycztcbiAgICB0aGlzLl9kcm9wZG93biA9IHtcbiAgICAgICAgbWVudTogbWVudUVsLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgbGlzdGVuZXJzOiBsaXN0ZW5lcnNcbiAgICB9O1xuICAgIHRoaXMuaGlkZU1lbnUoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBsaXN0ZW5lcnMuYWRkKHRvZ2dsZUVsLCAnY2xpY2snLCBjbGlja0hhbmRsZXIpO1xuICAgIC8vbWF5YmUgb25seSBhZGQgdGhpcyBldmVudHMgaWYgaXMgb3Blbj9cbiAgICBsaXN0ZW5lcnMuYWRkKGRvYywgJ21vdXNlb3V0Jywgb25Eb2NPdXQpO1xuICAgIGxpc3RlbmVycy5hZGQoZG9jLCAnY2xpY2snLCBvbkNsaWNrKTtcblxuXG4gICAgZnVuY3Rpb24gb25Eb2NPdXQoZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldFxuICAgICAgICAgICAgLCByZWxhdGVkVGFyZ2V0ID0gZXZlbnQucmVsYXRlZFRhcmdldFxuICAgICAgICAgICAgLCBsaXN0ZW5lcnMgPSBzZWxmLl9kcm9wZG93bi5saXN0ZW5lcnM7XG5cbiAgICAgICAgaWYgKGlzSWZyYW1lKHRhcmdldCkpXG4gICAgICAgICAgICBsaXN0ZW5lcnMucmVtb3ZlKHRhcmdldC5jb250ZW50V2luZG93LmRvY3VtZW50LCAnY2xpY2snLCBvbkNsaWNrKTtcblxuICAgICAgICBpZiAoaXNJZnJhbWUocmVsYXRlZFRhcmdldCkpXG4gICAgICAgICAgICBsaXN0ZW5lcnMuYWRkKHJlbGF0ZWRUYXJnZXQuY29udGVudFdpbmRvdy5kb2N1bWVudCwgJ2NsaWNrJywgb25DbGljayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25DbGljayhldmVudCkge1xuICAgICAgICBpZiAoIXNlbGYuZWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSlcbiAgICAgICAgICAgIHNlbGYuaGlkZU1lbnUoKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gaXNJZnJhbWUoZWwpIHtcbiAgICByZXR1cm4gZWwgJiYgZWwudGFnTmFtZSA9PSAnSUZSQU1FJztcbn1cblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZHJvcGRvd24ubGlzdGVuZXJzLnJlbW92ZUFsbCgpO1xuICAgIGRlbGV0ZSB0aGlzLl9kcm9wZG93bjtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJHNob3dNZW51KCkge1xuICAgIHRoaXMudG9nZ2xlTWVudSh0cnVlKTtcbn1cblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJGhpZGVNZW51KCkge1xuICAgIHRoaXMudG9nZ2xlTWVudShmYWxzZSk7XG59XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biR0b2dnbGVNZW51KGRvU2hvdykge1xuICAgIGRvU2hvdyA9IHR5cGVvZiBkb1Nob3cgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgICAgICA/ICEgdGhpcy5fZHJvcGRvd24udmlzaWJsZVxuICAgICAgICAgICAgICAgIDogISEgZG9TaG93O1xuXG4gICAgdGhpcy5fZHJvcGRvd24udmlzaWJsZSA9IGRvU2hvdztcblxuICAgIHZhciBtZW51ID0gdGhpcy5fZHJvcGRvd24ubWVudTtcbiAgICBtZW51LnN0eWxlLmRpc3BsYXkgPSBkb1Nob3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdibG9jaydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdub25lJztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGZvcm1HZW5lcmF0b3IgPSByZXF1aXJlKCcuL2dlbmVyYXRvcicpXG4gICAgLCBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgZm9ybVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9yZWdpc3RyeScpXG4gICAgLCBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jJyk7XG5cblxudmFyIEZPUk1fVkFMSURBVElPTl9GQUlMRURfQ1NTX0NMQVNTID0gJ2hhcy1lcnJvcic7XG5cbi8qKlxuICogQSBjb21wb25lbnQgY2xhc3MgZm9yIGdlbmVyYXRpbmcgZm9ybXMgZnJvbSBzY2hlbWFcbiAqIFRvIGNyZWF0ZSBmb3JtIGNsYXNzIG1ldGhvZCBbY3JlYXRlRm9ybV0oI01MRm9ybSQkY3JlYXRlRm9ybSkgc2hvdWxkIGJlIHVzZWQuXG4gKiBGb3JtIHNjaGVtYSBoYXMgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKiBgYGBcbiAqIHZhciBzY2hlbWEgPSB7XG4gKiAgICAgaXRlbXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgICAgdHlwZTogJzx0eXBlIG9mIHVpIGNvbnRyb2w+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYW4gYmUgZ3JvdXAsIHNlbGVjdCwgaW5wdXQsIGJ1dHRvbiwgcmFkaW8sXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaHlwZXJsaW5rLCBjaGVja2JveCwgbGlzdCwgdGltZSwgZGF0ZVxuICogICAgICAgICAgICAgY29tcE5hbWU6ICc8Y29tcG9uZW50IG5hbWU+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbCBuYW1lIG9mIGNvbXBvbmVudCwgc2hvdWxkIGJlIHVuaXF1ZSB3aXRoaW4gdGhlIGZvcm1cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAob3IgZm9ybSBncm91cCksIG9ubHkgbmVlZHMgdG9iZSB1c2VkIHdoZW4gY29tcG9uZW50IG5lZWRzIHRvIGJlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFuaXBpbGF0ZWQgaW4gc29tZSBldmVudCBoYW5kbGVyIGFuZCBpdCBjYW5ub3QgYmUgYWNjZXNzZWQgdmlhIG1vZGVsUGF0aFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVzaW5nIGBtb2RlbFBhdGhDb21wb25lbnRgIG1ldGhvZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICh3aGljaCBpcyBhIHByZWZlcnJlZCB3YXkgdG8gYWNjZXNzIGNvbnBvbmVudHMgaW4gZm9ybSlcbiAqICAgICAgICAgICAgIGxhYmVsOiAnPHVpIGNvbnRyb2wgbGFiZWw+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbCBsYWJlbCwgd2lsbCBub3QgYmUgYWRkZWQgaWYgbm90IGRlZmluZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvciBlbXB0eSBzdHJpbmdcbiAqICAgICAgICAgICAgIGFsdFRleHQ6ICc8YWx0IHRleHQgb3IgdGl0bGU+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbCBhbHQgdGV4dCBzdHJpbmcgb24gYnV0dG9ucyBhbmQgaHlwZXJsaW5rc1xuICogICAgICAgICAgICAgbW9kZWxQYXRoOiAnPG1vZGVsIG1hcHBpbmc+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwYXRoIGluIG1vZGVsIHdoZXJlIHRoZSB2YWx1ZSB3aWxsIGJlIHN0b3JlZC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNb3N0IHR5cGVzIG9mIGl0ZW1zIHJlcXVpcmUgdGhpcyBwcm9wZXJ0eSxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzb21lIGl0ZW1zIG1heSBoYXZlIHRoaXMgcHJvcGVydHkgKGJ1dHRvbiwgZS5nLiksXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJncm91cFwiIG11c3QgTk9UIGhhdmUgdGhpcyBwcm9wZXJ0eS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXYXJuaW5nIHdpbGwgYmUgbG9nZ2VkIGlmIHRoZXNlIHJ1bGVzIGFyZSBub3QgZm9sbG93ZWQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSXRlbXMgd2l0aG91dCB0aGlzIHByb3BlcnR5IHdpbGwgbm90IGJlIGluIG1vZGVsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKGFwYXJ0IGZyb20gXCJncm91cCB3aGljaCBzdWJpdGVtcyB3aWxsIGJlIGluIG1vZGVsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhleSBoYXZlIHRoaXMgcHJvcGVydHkpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG8gaGF2ZSBmaXhlZCBmb3JtIG1vZGVsIHN0cnVjdHVyZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoaWxlIGNoYW5naW5nIHZpZXcgc3RydWN0dXJlIG9mIHRoZSBmb3JtXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VlIE1vZGVsLlxuICogICAgICAgICAgICAgbW9kZWxQYXR0ZXJuOiAnbWFwcGluZyBleHRlbnNpb24gcGF0dGVybicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoc3RyaW5nKVxuICogICAgICAgICAgICAgbm90SW5Nb2RlbDogdHJ1ZSxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FsbG93cyB0byBOT1QgaW5jbHVkZSBtb2RlbFBhdGggd2hlcmUgb3RoZXJ3aXNlIGl0IHdvdWxkIGJlIHJlcXVpcmVkXG4gKiAgICAgICAgICAgICBtZXNzYWdlczogeyAgICAgICAgICAgICAgICAgICAgICAvLyB0byBzdWJzY3JpYmUgdG8gbWVzc2FnZXMgb24gaXRlbSdzIGNvbXBvbmVudCBmYWNldHNcbiAqICAgICAgICAgICAgICAgICBldmVudHM6IHsgICAgICAgICAgICAgICAgICAgIC8vIGZhY2V0IHRvIHN1YnNjcmliZSB0b1xuICogICAgICAgICAgICAgICAgICAgICAnPG1lc3NhZ2UxPic6IG9uTWVzc2FnZTEgLy8gbWVzc2FnZSBhbmQgc3Vic2NyaWJlciBmdW5jdGlvblxuICogICAgICAgICAgICAgICAgICAgICAnPG1zZzI+IDxtc2czPic6IHsgICAgICAgLy8gc3Vic2NyaWJlIHRvIDIgbWVzc2FnZXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXI6IG9uTWVzc2FnZTIsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0ICAgICAvLyBjb250ZXh0IGNhbiBiZSBhbiBvYmplY3Qgb3IgYSBzdHJpbmc6XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcImZhY2V0XCI6IGZhY2V0IGluc3RhbmNlIHdpbGwgYmUgdXNlZCBhcyBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcIm93bmVyXCI6IGl0ZW0gY29tcG9uZW50IGluc3RhbmNlIHdpbGwgYmUgdXNlZCBhcyBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcImZvcm1cIjogdGhlIGZvcm0gY29tcG9uZW50IGluc3RhbmNlIHdpbGwgYmUgdXNlZCBhcyBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcImhvc3RcIjogaG9zdCBvYmplY3QgcGFzc2VkIHRvIGNyZWF0ZUZvcm0gbWV0aG9kIHdpbGwgYmUgdXNlZCBhcyBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgIH1cbiAqICAgICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICAgICB9LFxuICogICAgICAgICAgICAgdHJhbnNsYXRlOiB7ICAgICAgICAgIC8vIG9wdGlvbmFsIGRhdGEgdHJhbnNsYXRpb24gZnVuY3Rpb25zXG4gKiAgICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0ICAgLy8gb3B0aW9uYWwgY29udGV4dCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRyYW5zbGF0ZSBmdW5jdGlvbnMsICdob3N0JyBtZWFucyB0aGUgaG9zdE9iamVjdCBwYXNzZWQgdG8gRm9ybS5jcmVhdGVGb3JtXG4gKiAgICAgICAgICAgICAgICAgdG9Nb2RlbDogZnVuYzEsICAgLy8gdHJhbnNsYXRlcyBpdGVtIGRhdGEgZnJvbSB2aWV3IHRvIG1vZGVsXG4gKiAgICAgICAgICAgICAgICAgZnJvbU1vZGVsOiBmdW5jMiAgLy8gdHJhbnNsYXRlcyBpdGVtIGRhdGEgZnJvbSBtb2RlbCB0byB2aWV3XG4gKiAgICAgICAgICAgICB9LFxuICogICAgICAgICAgICAgdmFsaWRhdGU6IHsgICAgICAgICAgIC8vIG9wdGlvbmFsIGRhdGEgdmFsaWRhdGlvbiBmdW5jdGlvbnNcbiAqICAgICAgICAgICAgICAgICBjb250ZXh0OiBPYmplY3QgICAvLyBvcHRpb25hbCBjb250ZXh0IHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gdmFsaWRhdGUgZnVuY3Rpb25zLCAnaG9zdCcgbWVhbnMgdGhlIGhvc3RPYmplY3QgcGFzc2VkIHRvIEZvcm0uY3JlYXRlRm9ybVxuICogICAgICAgICAgICAgICAgIHRvTW9kZWw6ICAgZnVuYzEgfCBbZnVuYzEsIGZ1bmMyLCAuLi5dLC8vIHZhbGlkYXRlcyBpdGVtIGRhdGEgd2hlbiBpdCBpcyBjaGFuZ2VkIGluIGZvcm1cbiAqICAgICAgICAgICAgICAgICBmcm9tTW9kZWw6IGZ1bmMyIHwgW2Z1bmMzLCBmdW5jNCwgLi4uXSAvLyBvcHBvc2l0ZSwgYnV0IG5vdCByZWFsbHkgdXNlZCBhbmQgZG9lcyBub3QgbWFrZSBmb3JtIGludmFsaWQgaWYgaXQgZmFpbHMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FuIGJlIHVzZWQgdG8gcHJldmVudCBkYXRhIGJlaW5nIHNob3duIGluIHRoZSBmb3JtLlxuICogICAgICAgICAgICAgfSwgICAgICAgICAgICAgICAgICAgIC8vIGRhdGEgdmFsaWRhdGlvbiBmdW5jdGlvbnMgc2hvdWxkIGFjY2VwdCB0d28gcGFyYW1ldGVyczogZGF0YSBhbmQgY2FsbGJhY2sgKHRoZXkgYXJlIGFzeW5jaHJvbm91cykuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiB2YWxpZGF0aW9uIGlzIGZpbmlzaGVkLCBjYWxsYmFjayBzaG91bGQgYmUgY2FsbGVkIHdpdGggKGVycm9yLCByZXNwb25zZSkgcGFyYW1ldGVycy5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNwb25zZSBzaG91bGQgaGF2ZSBwcm9wZXJ0aWVzIHZhbGlkIChCb29sZWFuKSBhbmQgb3B0aW9uYWwgcmVhc29uIChTdHJpbmcgLSByZWFzb24gb2YgdmFsaWRhdGlvbiBmYWlsdXJlKS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlITogYXQgdGhlIG1vbWVudCwgaWYgY2FsbGJhY2sgaXMgY2FsbGVkIHdpdGggZXJyb3IgcGFyYW1ldGVyIHdoaWNoIGlzIG5vdCBmYWxzeSwgdmFsaWRhdGlvbiB3aWxsIGJlIHBhc3NlZC5cbiAqICAgICAgICAgICAgIDxpdGVtIHNwZWNpZmljPjogezxpdGVtIGNvbmZpZ3VyYXRpb24+fVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwic2VsZWN0XCIgc3VwcG9ydHMgXCJzZWxlY3RPcHRpb25zXCIgLSBhcnJheSBvZiBvYmplY3RzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2l0aCBwcm9wZXJ0aWVzIFwidmFsdWVcIiBhbmQgXCJsYWJlbFwiXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJyYWRpb1wiIHN1cHBvcnRzIFwicmFkaW9PcHRpb25zXCIgd2l0aCB0aGUgc2FtZSBmb3JtYXRcbiAqICAgICAgICAgICAgIGl0ZW1zOiBbXG4gKiAgICAgICAgICAgICAgICAgeyAuLi4gfSAvLywgLi4uIC0gaXRlbXMgaW5zaWRlIFwiZ3JvdXBcIiBvciBcIndyYXBwZXJcIiBpdGVtXG4gKiAgICAgICAgICAgICBdXG4gKiAgICAgICAgIH0gLy8gLCAuLi4gbW9yZSBpdGVtc1xuICogICAgIF1cbiAqIH1cbiAqL1xudmFyIE1MRm9ybSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxGb3JtJywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdjYy1tb2R1bGUtaW5zcGVjdG9yJ1xuICAgIH0sXG4gICAgbW9kZWw6IHVuZGVmaW5lZCxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MRm9ybSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxGb3JtO1xuXG5cbl8uZXh0ZW5kKE1MRm9ybSwge1xuICAgIGNyZWF0ZUZvcm06IE1MRm9ybSQkY3JlYXRlRm9ybSxcbiAgICByZWdpc3RlclNjaGVtYUtleTogTUxGb3JtJCRyZWdpc3RlclNjaGVtYUtleSxcbiAgICByZWdpc3RlclZhbGlkYXRpb246IE1MRm9ybSQkcmVnaXN0ZXJWYWxpZGF0aW9uLFxuICAgIHZhbGlkYXRvclJlc3BvbnNlOiBNTEZvcm0kJHZhbGlkYXRvclJlc3BvbnNlLFxuICAgIGdlbmVyYXRvcjogZm9ybUdlbmVyYXRvcixcbiAgICByZWdpc3RyeTogZm9ybVJlZ2lzdHJ5XG59KTtcblxuXy5leHRlbmRQcm90byhNTEZvcm0sIHtcbiAgICBnZXRIb3N0T2JqZWN0OiBNTEZvcm0kZ2V0SG9zdE9iamVjdCxcbiAgICBpc1ZhbGlkOiBNTEZvcm0kaXNWYWxpZCxcbiAgICB2YWxpZGF0ZU1vZGVsOiBNTEZvcm0kdmFsaWRhdGVNb2RlbCxcbiAgICBnZXRJbnZhbGlkQ29udHJvbHM6IE1MRm9ybSRnZXRJbnZhbGlkQ29udHJvbHMsXG4gICAgZ2V0SW52YWxpZFJlYXNvbnM6IE1MRm9ybSRnZXRJbnZhbGlkUmVhc29ucyxcbiAgICBnZXRJbnZhbGlkUmVhc29uc1RleHQ6IE1MRm9ybSRnZXRJbnZhbGlkUmVhc29uc1RleHQsXG4gICAgbW9kZWxQYXRoQ29tcG9uZW50OiBNTEZvcm0kbW9kZWxQYXRoQ29tcG9uZW50LFxuICAgIG1vZGVsUGF0aFNjaGVtYTogTUxGb3JtJG1vZGVsUGF0aFNjaGVtYSxcbiAgICB2aWV3UGF0aENvbXBvbmVudDogTUxGb3JtJHZpZXdQYXRoQ29tcG9uZW50LFxuICAgIHZpZXdQYXRoU2NoZW1hOiBNTEZvcm0kdmlld1BhdGhTY2hlbWEsXG4gICAgZ2V0TW9kZWxQYXRoOiBNTEZvcm0kZ2V0TW9kZWxQYXRoLFxuICAgIGdldFZpZXdQYXRoOiBNTEZvcm0kZ2V0Vmlld1BhdGgsXG4gICAgZGVzdHJveTogTUxGb3JtJGRlc3Ryb3ksXG59KTtcblxuXG52YXIgU0NIRU1BX0tFWVdPUkRTID0gXy5vYmplY3QoW1xuICAgICd0eXBlJywgJ2NvbXBOYW1lJywgJ2xhYmVsJywgJ2FsdFRleHQnLFxuICAgICdtb2RlbFBhdGgnLCAnbW9kZWxQYXR0ZXJuJywgJ25vdEluTW9kZWwnLFxuICAgICdtZXNzYWdlcycsICd0cmFuc2xhdGUnLCAndmFsaWRhdGUnLCAnaXRlbXMnLFxuICAgICdzZWxlY3RPcHRpb25zJywgJ3JhZGlvT3B0aW9ucycsICdjb21ib09wdGlvbnMnLFxuICAgICdjb21ib09wdGlvbnNVUkwnLCAnYWRkSXRlbVByb21wdCcsICdwbGFjZUhvbGRlcicsXG4gICAgJ3ZhbHVlJywgJ2RhdGFWYWxpZGF0aW9uJywgJ2FzeW5jSGFuZGxlcicsICdhdXRvcmVzaXplJyxcbiAgICAnbWF4TGVuZ3RoJ1xuXSwgdHJ1ZSk7XG5cbi8qKlxuICogTUxGb3JtIGNsYXNzIG1ldGhvZFxuICogQ3JlYXRlcyBmb3JtIGZyb20gc2NoZW1hLlxuICogRm9ybSBkYXRhIGNhbiBiZSBvYnRhaW5lZCBmcm9tIGl0cyBNb2RlbCAoYGZvcm0ubW9kZWxgKSwgcmVhY3RpdmUgY29ubmVjdGlvbiB0byBmb3JtJ3MgbW9kZWwgY2FuIGFsc28gYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIGZvcm0gc2NoZW1hLCBhcyBkZXNjcmliZWQgYWJvdmVcbiAqIEBwYXJhbSB7T2JqZWN0fSBob3N0T2JqZWN0IGZvcm0gaG9zdCBvYmplY3QsIHVzZWQgdG8gZGVmaW5lIGFzIG1lc3NhZ2Ugc3Vic2NyaWJlciBjb250ZXh0IGluIHNjaGVtYSAtIGJ5IGNvbnZlbnRpb24gdGhlIGNvbnRleHQgc2hvdWxkIGJlIGRlZmluZWQgYXMgXCJob3N0XCJcbiAqIEBwYXJhbSB7T2JqZWN0fSBmb3JtRGF0YSBkYXRhIHRvIGluaXRpYWxpemUgdGhlIGZvcm0gd2l0aFxuICogQHBhcmFtIHtTdHJpbmd9IHRlbXBsYXRlIG9wdGlvbmFsIGZvcm0gdGVtcGxhdGUsIHdpbGwgYmUgdXNlZCBpbnN0ZWFkIG9mIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGZyb20gc2NoZW1hLiBOb3QgcmVjb21tZW5kZWQgdG8gdXNlLCBhcyBpdCB3aWxsIGhhdmUgdG8gYmUgbWFpbnRhaW5lZCB0byBiZSBjb25zaXN0ZW50IHdpdGggc2NoZW1hIGZvciBiaW5kaW5ncy5cbiAqIEByZXR1cm4ge01MRm9ybX1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJCRjcmVhdGVGb3JtKHNjaGVtYSwgaG9zdE9iamVjdCwgZm9ybURhdGEsIHRlbXBsYXRlKSB7XG4gICAgdmFyIGZvcm0gPSBfY3JlYXRlRm9ybUNvbXBvbmVudCgpO1xuICAgIF8uZGVmaW5lUHJvcGVydHkoZm9ybSwgJ19ob3N0T2JqZWN0JywgaG9zdE9iamVjdCk7XG4gICAgdmFyIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucztcbiAgICBfcHJvY2Vzc0Zvcm1TY2hlbWEoKTtcbiAgICBfY29ubmVjdEZvcm1EYXRhVG9Nb2RlbCgpO1xuICAgIF9tYW5hZ2VGb3JtVmFsaWRhdGlvbigpO1xuXG4gICAgLy8gc2V0IG9yaWdpbmFsIGZvcm0gZGF0YVxuICAgIGlmIChmb3JtRGF0YSlcbiAgICAgICAgZm9ybS5tb2RlbC5tLnNldChmb3JtRGF0YSk7XG5cbiAgICByZXR1cm4gZm9ybTtcblxuXG4gICAgZnVuY3Rpb24gX2NyZWF0ZUZvcm1Db21wb25lbnQoKSB7XG4gICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUgfHwgZm9ybUdlbmVyYXRvcihzY2hlbWEpO1xuICAgICAgICByZXR1cm4gTUxGb3JtLmNyZWF0ZU9uRWxlbWVudCh1bmRlZmluZWQsIHRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcHJvY2Vzc0Zvcm1TY2hlbWEoKSB7XG4gICAgICAgIC8vIG1vZGVsIHBhdGhzIHRyYW5zbGF0aW9uIHJ1bGVzXG4gICAgICAgIGZvcm1WaWV3UGF0aHMgPSB7fTtcbiAgICAgICAgZm9ybU1vZGVsUGF0aHMgPSB7fTtcbiAgICAgICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zID0ge307XG4gICAgICAgIGRhdGFUcmFuc2xhdGlvbnMgPSB7IGZyb21Nb2RlbDoge30sIHRvTW9kZWw6IHt9IH07XG4gICAgICAgIGRhdGFWYWxpZGF0aW9ucyA9IHsgZnJvbU1vZGVsOiB7fSwgdG9Nb2RlbDoge30gfTtcblxuICAgICAgICAvLyBwcm9jZXNzIGZvcm0gc2NoZW1hXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9jZXNzU2NoZW1hLmNhbGwoZm9ybSwgZm9ybSwgc2NoZW1hLCAnJywgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdmb3JtVmlld1BhdGhzIGJlZm9yZSBlcnJvcjogJywgZm9ybVZpZXdQYXRocyk7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ2Zvcm1Nb2RlbFBhdGhzIGJlZm9yZSBlcnJvcjogJywgZm9ybU1vZGVsUGF0aHMpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdtb2RlbFBhdGhUcmFuc2xhdGlvbnMgYmVmb3JlIGVycm9yOiAnLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdkYXRhVHJhbnNsYXRpb25zIGJlZm9yZSBlcnJvcjogJywgZGF0YVRyYW5zbGF0aW9ucyk7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ2RhdGFWYWxpZGF0aW9ucyBiZWZvcmUgZXJyb3I6ICcsIGRhdGFWYWxpZGF0aW9ucyk7XG4gICAgICAgICAgICB0aHJvdyAoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtLl9mb3JtVmlld1BhdGhzID0gZm9ybVZpZXdQYXRocztcbiAgICAgICAgZm9ybS5fZm9ybU1vZGVsUGF0aHMgPSBmb3JtTW9kZWxQYXRocztcbiAgICAgICAgZm9ybS5fbW9kZWxQYXRoVHJhbnNsYXRpb25zID0gbW9kZWxQYXRoVHJhbnNsYXRpb25zO1xuICAgICAgICBmb3JtLl9kYXRhVHJhbnNsYXRpb25zID0gZGF0YVRyYW5zbGF0aW9ucztcbiAgICAgICAgZm9ybS5fZGF0YVZhbGlkYXRpb25zID0gZGF0YVZhbGlkYXRpb25zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jb25uZWN0Rm9ybURhdGFUb01vZGVsKCkge1xuICAgICAgICAvLyBjb25uZWN0IGZvcm0gdmlldyB0byBmb3JtIG1vZGVsIHVzaW5nIHRyYW5zbGF0aW9uIHJ1bGVzIGZyb20gbW9kZWxQYXRoIHByb3BlcnRpZXMgb2YgZm9ybSBpdGVtc1xuICAgICAgICBmb3JtLl9jb25uZWN0b3IgPSBtaWxvLm1pbmRlcihmb3JtLmRhdGEsICc8LT4nLCBmb3JtLm1vZGVsLCB7IC8vIGNvbm5lY3Rpb24gZGVwdGggaXMgZGVmaW5lZCBvbiBmaWVsZCBieSBmaWVsZCBiYXNpcyBieSBwYXRoVHJhbnNsYXRpb25cbiAgICAgICAgICAgIHBhdGhUcmFuc2xhdGlvbjogbW9kZWxQYXRoVHJhbnNsYXRpb25zLFxuICAgICAgICAgICAgZGF0YVRyYW5zbGF0aW9uOiB7XG4gICAgICAgICAgICAgICAgJzwtJzogZGF0YVRyYW5zbGF0aW9ucy5mcm9tTW9kZWwsXG4gICAgICAgICAgICAgICAgJy0+JzogZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YVZhbGlkYXRpb246IHtcbiAgICAgICAgICAgICAgICAnPC0nOiBkYXRhVmFsaWRhdGlvbnMuZnJvbU1vZGVsLFxuICAgICAgICAgICAgICAgICctPic6IGRhdGFWYWxpZGF0aW9ucy50b01vZGVsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tYW5hZ2VGb3JtVmFsaWRhdGlvbigpIHtcbiAgICAgICAgZm9ybS5faW52YWxpZEZvcm1Db250cm9scyA9IHt9O1xuXG4gICAgICAgIGZvcm0ubW9kZWwub24oJ3ZhbGlkYXRlZCcsIGNyZWF0ZU9uVmFsaWRhdGVkKHRydWUpKTtcbiAgICAgICAgZm9ybS5kYXRhLm9uKCd2YWxpZGF0ZWQnLCBjcmVhdGVPblZhbGlkYXRlZChmYWxzZSkpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU9uVmFsaWRhdGVkKGlzRnJvbU1vZGVsKSB7XG4gICAgICAgICAgICB2YXIgcGF0aENvbXBNZXRob2QgPSBpc0Zyb21Nb2RlbCA/ICdtb2RlbFBhdGhDb21wb25lbnQnOiAndmlld1BhdGhDb21wb25lbnQnXG4gICAgICAgICAgICAgICAgLCBwYXRoU2NoZW1hTWV0aG9kID0gaXNGcm9tTW9kZWwgPyAnbW9kZWxQYXRoU2NoZW1hJzogJ3ZpZXdQYXRoU2NoZW1hJztcblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1zZywgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gZm9ybVtwYXRoQ29tcE1ldGhvZF0ocmVzcG9uc2UucGF0aClcbiAgICAgICAgICAgICAgICAgICAgLCBzY2hlbWEgPSBmb3JtW3BhdGhTY2hlbWFNZXRob2RdKHJlc3BvbnNlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICwgbGFiZWwgPSBzY2hlbWEubGFiZWxcbiAgICAgICAgICAgICAgICAgICAgLCBtb2RlbFBhdGggPSBzY2hlbWEubW9kZWxQYXRoO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50RWwgPSBjb21wb25lbnQuZWwucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWwuY2xhc3NMaXN0LnRvZ2dsZShGT1JNX1ZBTElEQVRJT05fRkFJTEVEX0NTU19DTEFTUywgISByZXNwb25zZS52YWxpZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYXNvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnZhbGlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGZvcm0uX2ludmFsaWRGb3JtQ29udHJvbHNbbW9kZWxQYXRoXTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcmVzcG9uc2UucmVhc29uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbkNvZGU6IHJlc3BvbnNlLnJlYXNvbkNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtLl9pbnZhbGlkRm9ybUNvbnRyb2xzW21vZGVsUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiByZWFzb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF8uY2xvbmUocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNGcm9tTW9kZWwpIGRhdGEucGF0aCA9IGZvcm0uZ2V0TW9kZWxQYXRoKGRhdGEucGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5yZWFzb24gPSByZWFzb247IC8vIGEgYml0IGhhY2t5LCByZXBsYWNpbmcgc3RyaW5nIHdpdGggb2JqZWN0IGNyZWF0ZWQgYWJvdmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnJlYXNvbkNvZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9ybS5wb3N0TWVzc2FnZSgndmFsaWRhdGlvbicsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Zvcm06IGNvbXBvbmVudCBmb3IgcGF0aCAnICsgcmVzcG9uc2UucGF0aCArICcgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8qKlxuICogQ3VzdG9tIHNjaGVtYSBrZXl3b3Jkc1xuICovXG52YXIgc2NoZW1hS2V5d29yZHNSZWdpc3RyeSA9IHt9O1xuZnVuY3Rpb24gTUxGb3JtJCRyZWdpc3RlclNjaGVtYUtleShrZXl3b3JkLCBwcm9jZXNzS2V5d29yZEZ1bmMsIHJlcGxhY2VLZXl3b3JkKSB7XG4gICAgaWYgKFNDSEVNQV9LRVlXT1JEU1trZXl3b3JkXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXl3b3JkJywga2V5d29yZCwgJ2lzIHVzZWQgYnkgTUxGb3JtIGNsYXNzIG9yIG9uZSBvZiBwcmUtcmVnaXN0ZXJlZCBmb3JtIGl0ZW1zIGFuZCBjYW5ub3QgYmUgb3ZlcnJpZGRlbicpO1xuXG4gICAgaWYgKCFyZXBsYWNlS2V5d29yZCAmJiBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5W2tleXdvcmRdKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0tleXdvcmQnLCBrZXl3b3JkLCAnaXMgYWxyZWFkeSByZWdpc3RlcmVkLiBQYXNzIHRydWUgYXMgdGhlIHRoaXJkIHBhcmFtZXRlciB0byByZXBsYWNlIGl0Jyk7XG5cbiAgICBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5W2tleXdvcmRdID0gcHJvY2Vzc0tleXdvcmRGdW5jO1xufVxuXG5cbi8qKlxuICogUHJlZGVmaW5lZCBmb3JtIHZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKi9cbnZhciB2YWxpZGF0aW9uRnVuY3Rpb25zID0ge1xuICAgICdyZXF1aXJlZCc6IHZhbGlkYXRlUmVxdWlyZWRcbn07XG5mdW5jdGlvbiBNTEZvcm0kJHJlZ2lzdGVyVmFsaWRhdGlvbihuYW1lLCBmdW5jLCByZXBsYWNlRnVuYykge1xuICAgIGlmICghcmVwbGFjZUZ1bmMgJiYgdmFsaWRhdGlvbkZ1bmN0aW9uc1tuYW1lXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWxpZGF0aW5nIGZ1bmN0aW9uJywgbmFtZSwgJ2lzIGFscmVhZHkgcmVnaXN0ZXJlZC4gUGFzcyB0cnVlIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXIgdG8gcmVwbGFjZSBpdCcpO1xuXG4gICAgdmFsaWRhdGlvbkZ1bmN0aW9uc1tuYW1lXSA9IGZ1bmM7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmb3JtIGhvc3Qgb2JqZWN0LlxuICogQHJldHVybiB7Q29tcG9uZW50fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SG9zdE9iamVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5faG9zdE9iamVjdDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgY3VycmVudCB2YWxpZGF0aW9uIHN0YXR1cyBvZiB0aGUgZm9ybVxuICogV2lsbCBub3QgdmFsaWRhdGUgZmllbGRzIHRoYXQgd2VyZSBuZXZlciBjaGFuZ2VkIGluIHZpZXdcbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5mdW5jdGlvbiBNTEZvcm0kaXNWYWxpZCgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5faW52YWxpZEZvcm1Db250cm9scykubGVuZ3RoID09IDA7XG59XG5cblxuLyoqXG4gKiBSdW5zICd0b01vZGVsJyB2YWxpZGF0b3JzIGRlZmluZWQgaW4gc2NoZW1hIG9uIHRoZSBjdXJyZW50IG1vZGVsIG9mIHRoZSBmb3JtXG4gKiBjYW4gYmUgdXNlZCB0byBtYXJrIGFzIGludmFpZCBhbGwgcmVxdWlyZWQgZmllbGRzIG9yIHRvIGV4cGxpY2l0ZWx5IHZhbGlkYXRlXG4gKiBmb3JtIHdoZW4gaXQgaXMgc2F2ZWQuIFJldHVybnMgdmFsaWRhdGlvbiBzdGF0ZSBvZiB0aGUgZm9ybSB2aWEgY2FsbGJhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBNTEZvcm0kdmFsaWRhdGVNb2RlbChjYWxsYmFjaykge1xuICAgIHZhciB2YWxpZGF0aW9ucyA9IFtdXG4gICAgICAgICwgc2VsZiA9IHRoaXM7XG5cbiAgICBfLmVhY2hLZXkodGhpcy5fZGF0YVZhbGlkYXRpb25zLmZyb21Nb2RlbCwgZnVuY3Rpb24odmFsaWRhdG9ycywgbW9kZWxQYXRoKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5tb2RlbC5tKG1vZGVsUGF0aCkuZ2V0KCk7XG4gICAgICAgIHZhbGlkYXRvcnMgPSBBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpID8gdmFsaWRhdG9ycyA6IFt2YWxpZGF0b3JzXTtcblxuICAgICAgICBpZiAodmFsaWRhdG9ycyAmJiB2YWxpZGF0b3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsaWRhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgbW9kZWxQYXRoOiBtb2RlbFBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuXG5cbiAgICB2YXIgYWxsVmFsaWQgPSB0cnVlO1xuICAgIGFzeW5jLmVhY2godmFsaWRhdGlvbnMsXG4gICAgICAgIGZ1bmN0aW9uKHZhbGlkYXRpb24sIG5leHRWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgbGFzdFJlc3BvbnNlO1xuICAgICAgICAgICAgYXN5bmMuZXZlcnkodmFsaWRhdGlvbi52YWxpZGF0b3JzLFxuICAgICAgICAgICAgICAgIC8vIGNhbGwgdmFsaWRhdG9yXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24odmFsaWRhdG9yLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkYXRvcih2YWxpZGF0aW9uLmRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZSA9IHJlc3BvbnNlIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dChsYXN0UmVzcG9uc2UudmFsaWQgfHwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHBvc3QgdmFsaWRhdGlvbiByZXN1bHQgb2YgaXRlbSB0byBmb3JtXG4gICAgICAgICAgICBmdW5jdGlvbih2YWxpZCkge1xuICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZS5wYXRoID0gdmFsaWRhdGlvbi5tb2RlbFBhdGg7XG4gICAgICAgICAgICAgICAgbGFzdFJlc3BvbnNlLnZhbGlkID0gdmFsaWQ7XG4gICAgICAgICAgICAgICAgc2VsZi5tb2RlbC5wb3N0TWVzc2FnZSgndmFsaWRhdGVkJywgbGFzdFJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkKSBhbGxWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG5leHRWYWxpZGF0aW9uKG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgLy8gcG9zdCBmb3JtIHZhbGlkYXRpb24gcmVzdWx0XG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIHNlbGYucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRpb25jb21wbGV0ZWQnLCB7IHZhbGlkOiBhbGxWYWxpZCB9KTtcbiAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soYWxsVmFsaWQpO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBtYXAgb2YgaW52YWxpZCBjb250cm9scyBhbmQgcmVhc29ucyAodmlldyBwYXRocyBhcmUga2V5cylcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRJbnZhbGlkQ29udHJvbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludmFsaWRGb3JtQ29udHJvbHM7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCBhbGwgcmVhc29ucyBmb3IgdGhlIGZvcm0gYmVpbmcgaW52YWxpZFxuICpcbiAqIEByZXR1cm4ge0FycmF5W09iamVjdF19XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRJbnZhbGlkUmVhc29ucygpIHtcbiAgICB2YXIgaW52YWxpZENvbnRyb2xzID0gdGhpcy5nZXRJbnZhbGlkQ29udHJvbHMoKTtcbiAgICB2YXIgcmVhc29ucyA9IF8ucmVkdWNlS2V5cyhpbnZhbGlkQ29udHJvbHMsXG4gICAgICAgIGZ1bmN0aW9uKG1lbW8sIGludmFsaWRDb250cm9sLCBjb21wTmFtZSkge1xuICAgICAgICAgICAgbWVtby5wdXNoKGludmFsaWRDb250cm9sLnJlYXNvbik7XG4gICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgfSwgW10sIHRoaXMpO1xuICAgIHJldHVybiByZWFzb25zO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBhIG11bHRpbGluZSBzdHJpbmcgd2l0aCBhbGwgcmVhc29ucyBmb3IgdGhlIGZvcm0gYmVpbmcgaW52YWxpZFxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldEludmFsaWRSZWFzb25zVGV4dCgpIHtcbiAgICB2YXIgcmVhc29ucyA9IHRoaXMuZ2V0SW52YWxpZFJlYXNvbnMoKTtcbiAgICByZXR1cm4gcmVhc29ucy5yZWR1Y2UoZnVuY3Rpb24obWVtbywgcmVhc29uKSB7XG4gICAgICAgIHJldHVybiBtZW1vICsgKHJlYXNvbi5sYWJlbCB8fCAnJykgKyAnIC0gJyArIHJlYXNvbi5yZWFzb24gKyAnXFxuJztcbiAgICB9LCAnJyk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGNvbXBvbmVudCBmb3IgYSBnaXZlbiBtb2RlbFBhdGhcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbW9kZWxQYXRoXG4gKiBAcmV0dXJuIHtDb21wb25lbnR9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRtb2RlbFBhdGhDb21wb25lbnQobW9kZWxQYXRoKSB7XG4gICAgdmFyIG1vZGVsUGF0aE9iaiA9IHRoaXMuX2Zvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF07XG4gICAgcmV0dXJuIG1vZGVsUGF0aE9iaiAmJiBtb2RlbFBhdGhPYmouY29tcG9uZW50O1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBmb3JtIHNjaGVtYSBmb3IgYSBnaXZlbiBtb2RlbFBhdGhcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbW9kZWxQYXRoXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRtb2RlbFBhdGhTY2hlbWEobW9kZWxQYXRoKSB7XG4gICAgdmFyIG1vZGVsUGF0aE9iaiA9IHRoaXMuX2Zvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF07XG4gICAgcmV0dXJuIG1vZGVsUGF0aE9iaiAmJiBtb2RlbFBhdGhPYmouc2NoZW1hO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBjb21wb25lbnQgZm9yIGEgZ2l2ZW4gdmlldyBwYXRoIChwYXRoIGFzIGRlZmluZWQgaW4gRGF0YSBmYWNldClcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGhcbiAqIEByZXR1cm4ge0NvbXBvbmVudH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJHZpZXdQYXRoQ29tcG9uZW50KHZpZXdQYXRoKSB7XG4gICAgdmFyIHZpZXdQYXRoT2JqID0gdGhpcy5fZm9ybVZpZXdQYXRoc1t2aWV3UGF0aF07XG4gICAgcmV0dXJuIHZpZXdQYXRoT2JqICYmIHZpZXdQYXRoT2JqLmNvbXBvbmVudDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgZm9ybSBzY2hlbWEgZm9yIGEgZ2l2ZW4gdmlldyBwYXRoIGl0ZW0gKHBhdGggYXMgZGVmaW5lZCBpbiBEYXRhIGZhY2V0KVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2aWV3UGF0aFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kdmlld1BhdGhTY2hlbWEodmlld1BhdGgpIHtcbiAgICB2YXIgdmlld1BhdGhPYmogPSB0aGlzLl9mb3JtVmlld1BhdGhzW3ZpZXdQYXRoXTtcbiAgICByZXR1cm4gdmlld1BhdGhPYmogJiYgdmlld1BhdGhPYmouc2NoZW1hO1xufVxuXG5cbi8qKlxuICogQ29udmVydHMgdmlldyBwYXRoIG9mIHRoZSBjb21wb25lbnQgaW4gdGhlIGZvcm0gdG8gdGhlIG1vZGVsIHBhdGggb2YgdGhlIGNvbm5lY3RlZCBkYXRhXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZpZXdQYXRoIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50XG4gKiBAcmV0dXJuIHtzdHJpbmd9IG1vZGVsIHBhdGggb2YgY29ubmVjdGVkIGRhdGFcbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldE1vZGVsUGF0aCh2aWV3UGF0aCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbFBhdGhUcmFuc2xhdGlvbnNbdmlld1BhdGhdO1xufVxuXG5cbi8qKlxuICogQ29udmVydHMgbW9kZWwgcGF0aCBvZiB0aGUgY29ubmVjdGVkIGRhdGEgdG8gdmlldyBwYXRoIG9mIHRoZSBjb21wb25lbnQgaW4gdGhlIGZvcm1cbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsUGF0aCBtb2RlbCBwYXRoIG9mIGNvbm5lY3RlZCBkYXRhXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRWaWV3UGF0aChtb2RlbFBhdGgpIHtcbiAgICByZXR1cm4gXy5maW5kS2V5KHRoaXMuX21vZGVsUGF0aFRyYW5zbGF0aW9ucywgZnVuY3Rpb24obVBhdGgsIHZQYXRoKSB7XG4gICAgICAgIHJldHVybiBtUGF0aCA9PSBtb2RlbFBhdGg7XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gTUxGb3JtJGRlc3Ryb3koKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fY29ubmVjdG9yICYmIG1pbG8ubWluZGVyLmRlc3Ryb3lDb25uZWN0b3IodGhpcy5fY29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xufVxuXG5cbi8qKlxuICogU2VlIGl0ZW1fdHlwZXMuanMgZm9yIGl0ZW0gY2xhc3NlcyBhbmQgdGVtcGxhdGVzXG4gKiBNYXAgb2YgaXRlbXMgdHlwZXMgdG8gaXRlbXMgY29tcG9uZW50cyBjbGFzc2VzXG4gKiBVSSBjb21wb25lbnRzIGFyZSBkZWZpbmVkIGluIGBtaWxvYFxuICovXG5cblxuLy8gdmFyIF9pdGVtc1NjaGVtYVJ1bGVzID0gXy5tYXBLZXlzKGl0ZW1UeXBlcywgZnVuY3Rpb24oY2xhc3NOYW1lLCBpdGVtVHlwZSkge1xuLy8gICAgIHJldHVybiB7XG4vLyAgICAgICAgIC8vIENvbXBDbGFzczogY29tcG9uZW50c1JlZ2lzdHJ5LmdldChjbGFzc05hbWUpLFxuLy8gICAgICAgICBmdW5jOiBpdGVtc0Z1bmN0aW9uc1tpdGVtVHlwZV0gfHwgZG9Ob3RoaW5nLFxuLy8gICAgICAgICBtb2RlbFBhdGhSdWxlOiBtb2RlbFBhdGhSdWxlc1tpdGVtVHlwZV0gfHwgJ3JlcXVpcmVkJ1xuLy8gICAgIH07XG4vLyB9KTtcblxuZnVuY3Rpb24gZG9Ob3RoaW5nKCkge31cblxuXG4vKipcbiAqIFByb2Nlc3NlcyBmb3JtIHNjaGVtYSB0byBzdWJzY3JpYmUgZm9yIG1lc3NhZ2VzIGFzIGRlZmluZWQgaW4gc2NoZW1hLiBQZXJmb3JtcyBzcGVjaWFsIHByb2Nlc3NpbmcgZm9yIHNvbWUgdHlwZXMgb2YgaXRlbXMuXG4gKiBSZXR1cm5zIHRyYW5zbGF0aW9uIHJ1bGVzIGZvciBDb25uZWN0b3Igb2JqZWN0LlxuICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgcmVjdXJzaXZlbHkgZm9yIGdyb3VwcyAoYW5kIHN1Ymdyb3VwcylcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXAgZm9ybSBvciBncm91cCBjb21wb25lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgZm9ybSBvciBncm91cCBzY2hlbWFcbiAqIEBwYXJhbSB7U3RyaW5nfSB2aWV3UGF0aCBjdXJyZW50IHZpZXcgcGF0aCwgdXNlZCB0byBnZW5lcmF0ZSBDb25uZWN0b3IgdHJhbnNsYXRpb24gcnVsZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBmb3JtVmlld1BhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybU1vZGVsUGF0aHMgdmlldyBwYXRocyBhY2N1bXVsYXRlZCBzbyBmYXIgKGhhdmUgY29tcG9uZW50IGFuZCBzY2hlbWEgcHJvcGVydGllcylcbiAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFBhdGhUcmFuc2xhdGlvbnMgbW9kZWwgcGF0aCB0cmFuc2xhdGlvbiBydWxlcyBhY2N1bXVsYXRlZCBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVHJhbnNsYXRpb25zIGRhdGEgdHJhbnNsYXRpb24gZnVuY3Rpb25zIHNvIGZhclxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWYWxpZGF0aW9ucyBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zIHNvIGZhclxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBwcm9jZXNzU2NoZW1hKGNvbXAsIHNjaGVtYSwgdmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucykge1xuICAgIHZpZXdQYXRoID0gdmlld1BhdGggfHwgJyc7XG4gICAgZm9ybVZpZXdQYXRocyA9IGZvcm1WaWV3UGF0aHMgfHwge307XG4gICAgZm9ybU1vZGVsUGF0aHMgPSBmb3JtTW9kZWxQYXRocyB8fCB7fTtcbiAgICBtb2RlbFBhdGhUcmFuc2xhdGlvbnMgPSBtb2RlbFBhdGhUcmFuc2xhdGlvbnMgfHwge307XG4gICAgZGF0YVRyYW5zbGF0aW9ucyA9IGRhdGFUcmFuc2xhdGlvbnMgfHwge307XG4gICAgZGF0YVRyYW5zbGF0aW9ucy5mcm9tTW9kZWwgPSBkYXRhVHJhbnNsYXRpb25zLmZyb21Nb2RlbCB8fCB7fTtcbiAgICBkYXRhVHJhbnNsYXRpb25zLnRvTW9kZWwgPSBkYXRhVHJhbnNsYXRpb25zLnRvTW9kZWwgfHwge307XG5cbiAgICBkYXRhVmFsaWRhdGlvbnMgPSBkYXRhVmFsaWRhdGlvbnMgfHwge307XG4gICAgZGF0YVZhbGlkYXRpb25zLmZyb21Nb2RlbCA9IGRhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwgfHwge307XG4gICAgZGF0YVZhbGlkYXRpb25zLnRvTW9kZWwgPSBkYXRhVmFsaWRhdGlvbnMudG9Nb2RlbCB8fCB7fTtcblxuICAgIGlmIChzY2hlbWEuaXRlbXMpXG4gICAgICAgIF9wcm9jZXNzU2NoZW1hSXRlbXMuY2FsbCh0aGlzLCBjb21wLCBzY2hlbWEuaXRlbXMsIHZpZXdQYXRoLCBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnMpO1xuXG4gICAgaWYgKHNjaGVtYS5tZXNzYWdlcylcbiAgICAgICAgX3Byb2Nlc3NTY2hlbWFNZXNzYWdlcy5jYWxsKHRoaXMsIGNvbXAsIHNjaGVtYS5tZXNzYWdlcyk7XG5cbiAgICB2YXIgaXRlbVJ1bGUgPSBzY2hlbWEudHlwZSAmJiBmb3JtUmVnaXN0cnkuZ2V0KHNjaGVtYS50eXBlKTtcbiAgICB2YXIgaG9zdE9iamVjdCA9IHRoaXMuZ2V0SG9zdE9iamVjdCgpO1xuXG4gICAgaWYgKHZpZXdQYXRoKSB7XG4gICAgICAgIGZvcm1WaWV3UGF0aHNbdmlld1BhdGhdID0ge1xuICAgICAgICAgICAgc2NoZW1hOiBzY2hlbWEsXG4gICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXRlbVJ1bGUpIHtcbiAgICAgICAgICAgIC8vY2hlY2soY29tcC5jb25zdHJ1Y3RvciwgaXRlbVR5cGVzW3NjaGVtYS50eXBlXS5Db21wQ2xhc3MpO1xuICAgICAgICAgICAgaXRlbVJ1bGUuaXRlbUZ1bmN0aW9uICYmIGl0ZW1SdWxlLml0ZW1GdW5jdGlvbi5jYWxsKGhvc3RPYmplY3QsIGNvbXAsIHNjaGVtYSk7XG4gICAgICAgICAgICBfcHJvY2Vzc0l0ZW1UcmFuc2xhdGlvbnMuY2FsbCh0aGlzLCB2aWV3UGF0aCwgc2NoZW1hKTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gaXRlbSB0eXBlICcgKyBzY2hlbWEudHlwZSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5d29yZCBpbiBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5KSB7XG4gICAgICAgIGlmIChzY2hlbWEuaGFzT3duUHJvcGVydHkoa2V5d29yZCkpIHtcbiAgICAgICAgICAgIHZhciBwcm9jZXNzS2V5d29yZEZ1bmMgPSBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5W2tleXdvcmRdO1xuICAgICAgICAgICAgcHJvY2Vzc0tleXdvcmRGdW5jKGhvc3RPYmplY3QsIGNvbXAsIHNjaGVtYSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZWxQYXRoVHJhbnNsYXRpb25zO1xuXG5cbiAgICBmdW5jdGlvbiBfcHJvY2Vzc0l0ZW1UcmFuc2xhdGlvbnModmlld1BhdGgsIHNjaGVtYSkge1xuICAgICAgICB2YXIgbW9kZWxQYXRoID0gc2NoZW1hLm1vZGVsUGF0aFxuICAgICAgICAgICAgLCBtb2RlbFBhdHRlcm4gPSBzY2hlbWEubW9kZWxQYXR0ZXJuIHx8ICcnXG4gICAgICAgICAgICAsIG5vdEluTW9kZWwgPSBzY2hlbWEubm90SW5Nb2RlbFxuICAgICAgICAgICAgLCB0cmFuc2xhdGUgPSBzY2hlbWEudHJhbnNsYXRlXG4gICAgICAgICAgICAsIHZhbGlkYXRlID0gc2NoZW1hLnZhbGlkYXRlO1xuXG4gICAgICAgIGlmICh2aWV3UGF0aCkge1xuICAgICAgICAgICAgX2FkZERhdGFUcmFuc2xhdGlvbi5jYWxsKHRoaXMsIHRyYW5zbGF0ZSwgJ3RvTW9kZWwnLCB2aWV3UGF0aCk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoaXRlbVJ1bGUubW9kZWxQYXRoUnVsZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3Byb2hpYml0ZWQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAobW9kZWxQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtb2RlbFBhdGggaXMgcHJvaGliaXRlZCBmb3IgaXRlbSB0eXBlICcgKyBzY2hlbWEudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JlcXVpcmVkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEgKG1vZGVsUGF0aCB8fCBub3RJbk1vZGVsKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbW9kZWxQYXRoIGlzIHJlcXVpcmVkIGZvciBpdGVtIHR5cGUgJyArIHNjaGVtYS50eXBlICsgJyAuIEFkZCBcIm5vdEluTW9kZWw6IHRydWVcIiB0byBvdmVycmlkZScpO1xuICAgICAgICAgICAgICAgICAgICAvLyBmYWxsaW5nIHRocm91Z2ggdG8gJ29wdGlvbmFsJ1xuICAgICAgICAgICAgICAgIGNhc2UgJ29wdGlvbmFsJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybU1vZGVsUGF0aHNbbW9kZWxQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWE6IHNjaGVtYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghIG5vdEluTW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWRkTW9kZWxQYXRoVHJhbnNsYXRpb24odmlld1BhdGgsIG1vZGVsUGF0aCwgbW9kZWxQYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWRkRGF0YVRyYW5zbGF0aW9uLmNhbGwodGhpcywgdHJhbnNsYXRlLCAnZnJvbU1vZGVsJywgbW9kZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWRkRGF0YVZhbGlkYXRpb24uY2FsbCh0aGlzLCB2YWxpZGF0ZSwgJ3RvTW9kZWwnLCB2aWV3UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFWYWxpZGF0aW9uLmNhbGwodGhpcywgdmFsaWRhdGUsICdmcm9tTW9kZWwnLCBtb2RlbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBtb2RlbFBhdGggcnVsZSBmb3IgaXRlbSB0eXBlICcgKyBzY2hlbWEudHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYWRkTW9kZWxQYXRoVHJhbnNsYXRpb24odmlld1BhdGgsIG1vZGVsUGF0aCwgcGF0aFBhdHRlcm4pIHtcbiAgICAgICAgaWYgKHZpZXdQYXRoIGluIG1vZGVsUGF0aFRyYW5zbGF0aW9ucylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZHVwbGljYXRlIHZpZXcgcGF0aCAnICsgdmlld1BhdGgpO1xuICAgICAgICBlbHNlIGlmIChfLmtleU9mKG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgbW9kZWxQYXRoKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZHVwbGljYXRlIG1vZGVsIHBhdGggJyArIG1vZGVsUGF0aCArICcgZm9yIHZpZXcgcGF0aCAnICsgdmlld1BhdGgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtb2RlbFBhdGhUcmFuc2xhdGlvbnNbdmlld1BhdGggKyBwYXRoUGF0dGVybl0gPSBtb2RlbFBhdGggKyBwYXRoUGF0dGVybjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYWRkRGF0YVRyYW5zbGF0aW9uKHRyYW5zbGF0ZSwgZGlyZWN0aW9uLCBwYXRoKSB7XG4gICAgICAgIHZhciB0cmFuc2xhdGVGdW5jID0gdHJhbnNsYXRlICYmIHRyYW5zbGF0ZVtkaXJlY3Rpb25dO1xuICAgICAgICBpZiAoIXRyYW5zbGF0ZUZ1bmMpIHJldHVybjtcbiAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2xhdGVGdW5jID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2xhdGUuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwodGhpcywgdHJhbnNsYXRlLmNvbnRleHQpO1xuXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlRnVuYyA9IHRyYW5zbGF0ZUZ1bmMuYmluZChjb250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFUcmFuc2xhdGlvbnNbZGlyZWN0aW9uXVtwYXRoXSA9IHRyYW5zbGF0ZUZ1bmM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGlyZWN0aW9uICsgJyB0cmFuc2xhdG9yIGZvciAnICsgcGF0aCArICcgc2hvdWxkIGJlIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYWRkRGF0YVZhbGlkYXRpb24odmFsaWRhdGUsIGRpcmVjdGlvbiwgcGF0aCkge1xuICAgICAgICB2YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRlICYmIHZhbGlkYXRlW2RpcmVjdGlvbl07XG4gICAgICAgIGlmICghIHZhbGlkYXRvcnMpIHJldHVybjtcblxuICAgICAgICB2YXIgZm9ybSA9IHRoaXM7XG4gICAgICAgIHZhciBmb3JtVmFsaWRhdG9ycyA9IGRhdGFWYWxpZGF0aW9uc1tkaXJlY3Rpb25dW3BhdGhdID0gW107XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsaWRhdG9ycykpXG4gICAgICAgICAgICB2YWxpZGF0b3JzLmZvckVhY2goX2FkZFZhbGlkYXRvckZ1bmMpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBfYWRkVmFsaWRhdG9yRnVuYyh2YWxpZGF0b3JzKTtcblxuICAgICAgICBmdW5jdGlvbiBfYWRkVmFsaWRhdG9yRnVuYyh2YWxpZGF0b3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yID09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgIHZhciB2YWxGdW5jID0gZ2V0VmFsaWRhdG9yRnVuY3Rpb24odmFsaWRhdG9yKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbGlkYXRvciBpbnN0YW5jZW9mIFJlZ0V4cClcbiAgICAgICAgICAgICAgICB2YWxGdW5jID0gbWFrZVJlZ2V4VmFsaWRhdG9yKHZhbGlkYXRvcik7XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsaWRhdG9yID09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgdmFsRnVuYyA9IHZhbGlkYXRvcjtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGlyZWN0aW9uICsgJyB2YWxpZGF0b3IgZm9yICcgKyBwYXRoICsgJyBzaG91bGQgYmUgZnVuY3Rpb24gb3Igc3RyaW5nJyk7XG5cbiAgICAgICAgICAgIGlmICh2YWxpZGF0ZS5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBnZXRGdW5jdGlvbkNvbnRleHQuY2FsbChmb3JtLCB2YWxpZGF0ZS5jb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIHZhbEZ1bmMgPSB2YWxGdW5jLmJpbmQoY29udGV4dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvcm1WYWxpZGF0b3JzLnB1c2godmFsRnVuYyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZnVuY3Rpb24gZ2V0VmFsaWRhdG9yRnVuY3Rpb24odmFsaWRhdG9yTmFtZSkge1xuICAgIHZhciB2YWxGdW5jID0gdmFsaWRhdGlvbkZ1bmN0aW9uc1t2YWxpZGF0b3JOYW1lXTtcbiAgICBpZiAoISB2YWxGdW5jKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Zvcm06IHVua25vd24gdmFsaWRhdG9yIGZ1bmN0aW9uIG5hbWUgJyArIHZhbGlkYXRvck5hbWUpO1xuICAgIHJldHVybiB2YWxGdW5jO1xufVxuXG5cbmZ1bmN0aW9uIG1ha2VSZWdleFZhbGlkYXRvcih2YWxpZGF0b3JSZWdFeHApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciB2YWxpZCA9IHZhbGlkYXRvclJlZ0V4cC50ZXN0KGRhdGEpXG4gICAgICAgICAgICAsIHJlc3BvbnNlID0gTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSh2YWxpZCwgJ3Nob3VsZCBtYXRjaCBwYXR0ZXJuJyk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9O1xufVxuXG5cbi8qKlxuICogUHJvY2Vzc2VzIGl0ZW1zIG9mIHRoZSBmb3JtIChvciBncm91cCkuXG4gKiBDb21wb25lbnQgdGhhdCBoYXMgaXRlbXMgc2hvdWxkIGhhdmUgQ29udGFpbmVyIGZhY2V0LlxuICogUmV0dXJucyB0cmFuc2xhdGlvbiBydWxlcyBmb3IgQ29ubmVjdG9yLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcCBmb3JtIG9yIGdyb3VwIGNvbXBvbmVudFxuICogQHBhcmFtIHtBcnJheX0gaXRlbXMgbGlzdCBvZiBpdGVtcyBpbiBzY2hlbWFcbiAqIEBwYXJhbSB7U3RyaW5nfSB2aWV3UGF0aCBjdXJyZW50IHZpZXcgcGF0aCwgdXNlZCB0byBnZW5lcmF0ZSBDb25uZWN0b3IgdHJhbnNsYXRpb24gcnVsZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBmb3JtVmlld1BhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybU1vZGVsUGF0aHMgdmlldyBwYXRocyBhY2N1bXVsYXRlZCBzbyBmYXIgKGhhdmUgY29tcG9uZW50IGFuZCBzY2hlbWEgcHJvcGVydGllcylcbiAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFBhdGhUcmFuc2xhdGlvbnMgbW9kZWwgcGF0aCB0cmFuc2xhdGlvbiBydWxlcyBhY2N1bXVsYXRlZCBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVHJhbnNsYXRpb25zIGRhdGEgdHJhbnNsYXRpb24gZnVuY3Rpb25zIHNvIGZhclxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWYWxpZGF0aW9ucyBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zIHNvIGZhclxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBfcHJvY2Vzc1NjaGVtYUl0ZW1zKGNvbXAsIGl0ZW1zLCB2aWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKSB7XG4gICAgaWYgKCEgY29tcC5jb250YWluZXIpXG4gICAgICAgIHJldHVybiBsb2dnZXIud2FybignRm9ybSBXYXJuaW5nOiBzY2hlbWEgaGFzIGl0ZW1zIGJ1dCBjb21wb25lbnQgaGFzIG5vIGNvbnRhaW5lciBmYWNldCcpO1xuXG4gICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbS5jb21wTmFtZSkgcmV0dXJuOyAvLyBObyBjb21wb25lbnQsIG9ubHkgbWFya3VwXG5cbiAgICAgICAgdmFyIGl0ZW1Db21wID0gY29tcC5jb250YWluZXIuc2NvcGVbaXRlbS5jb21wTmFtZV1cbiAgICAgICAgICAgICwgY29tcFZpZXdQYXRoID0gdmlld1BhdGggKyAnLicgKyBpdGVtLmNvbXBOYW1lO1xuICAgICAgICBpZiAoISBpdGVtQ29tcClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29tcG9uZW50IFwiJyArIGl0ZW0uY29tcE5hbWUgKyAnXCIgaXMgbm90IGluIHNjb3BlIChvciBzdWJzY29wZSkgb2YgZm9ybScpO1xuICAgICAgICBwcm9jZXNzU2NoZW1hLmNhbGwodGhpcywgaXRlbUNvbXAsIGl0ZW0sIGNvbXBWaWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKTtcbiAgICB9LCB0aGlzKTtcbn1cblxuXG4vKipcbiAqIFN1YnNjcmliZXMgdG8gbWVzc2FnZXMgb24gZmFjZXRzIG9mIGl0ZW1zJyBjb21wb25lbnQgYXMgZGVmaW5lZCBpbiBzY2hlbWFcbiAqL1xuZnVuY3Rpb24gX3Byb2Nlc3NTY2hlbWFNZXNzYWdlcyhjb21wLCBtZXNzYWdlcykge1xuICAgIHZhciBmb3JtID0gdGhpcztcbiAgICBfLmVhY2hLZXkobWVzc2FnZXMsIGZ1bmN0aW9uKGZhY2V0TWVzc2FnZXMsIGZhY2V0TmFtZSkge1xuICAgICAgICB2YXIgZmFjZXQgPSBjb21wW2ZhY2V0TmFtZV07XG4gICAgICAgIGlmICghIGZhY2V0KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzY2hlbWEgaGFzIHN1YnNjcmlwdGlvbnMgZm9yIGZhY2V0IFwiJyArIGZhY2V0TmFtZSArICdcIiBvZiBmb3JtIGNvbXBvbmVudCBcIicgKyBjb21wLm5hbWUgKyAnXCIsIGJ1dCBjb21wb25lbnQgaGFzIG5vIGZhY2V0Jyk7XG4gICAgICAgIGZhY2V0TWVzc2FnZXMgPSBfLmNsb25lKGZhY2V0TWVzc2FnZXMpO1xuICAgICAgICBfLmVhY2hLZXkoZmFjZXRNZXNzYWdlcywgZnVuY3Rpb24oc3Vic2NyaWJlciwgbWVzc2FnZVR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gdHlwZW9mIHN1YnNjcmliZXIgPT0gJ29iamVjdCcgPyBzdWJzY3JpYmVyLmNvbnRleHQgOiBudWxsO1xuXG4gICAgICAgICAgICAvLyBBdm9pZCBjaGFuZ2luZyBldmVudCBzdWJzY3JpcHRpb25zIHdob3NlIGNvbnRleHQgaXMgJ2ZhY2V0JyBvciAnb3duZXInLlxuICAgICAgICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dCAhPSAnZmFjZXQnICYmIGNvbnRleHQgIT0gJ293bmVyJykge1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBnZXRGdW5jdGlvbkNvbnRleHQuY2FsbChmb3JtLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIGZhY2V0TWVzc2FnZXNbbWVzc2FnZVR5cGVdID0ge1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyOiBzdWJzY3JpYmVyLnN1YnNjcmliZXIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZmFjZXQub25Db25maWdNZXNzYWdlcyhmYWNldE1lc3NhZ2VzKTtcbiAgICB9KTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgdGhlIG9iamVjdCB0byBiaW5kIGEgZnVuY3Rpb24gdG8gYXMgZGVmaW5lZCBieSBhIHNlY3Rpb24gb2YgdGhlIGZvcm0gc2NoZW1hLlxuICpcbiAqIEN1cnJlbnRseSBzdXBwb3J0ZWQgaW5wdXRzIGFyZTpcbiAqICAtIHtPYmplY3R9IC0gQW55IG9iamVjdFxuICogIC0ge1N0cmluZ30gJ2Zvcm0nIC0gVGhlIGZvcm1cbiAqICAtIHtTdHJpbmd9ICdob3N0JyAtIFRoZSBmb3JtJ3MgaG9zdCBvYmplY3RcbiAqL1xuZnVuY3Rpb24gZ2V0RnVuY3Rpb25Db250ZXh0KGNvbnRleHQpIHtcbiAgICBpZiAoY29udGV4dCA9PSAnZm9ybScpXG4gICAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgIGVsc2UgaWYgKGNvbnRleHQgPT0gJ2hvc3QnKVxuICAgICAgICBjb250ZXh0ID0gdGhpcy5nZXRIb3N0T2JqZWN0KCk7XG5cbiAgICBpZiAoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCAhPSAnb2JqZWN0JylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvbnRleHQgc3VwcGxpZWQgLSBFeHBlY3RlZCB7U3RyaW5nfSBbaG9zdCxmb3JtXSwgb3Ige09iamVjdH0nKTtcblxuICAgIHJldHVybiBjb250ZXh0O1xufVxuXG5cbi8qKlxuICogVmFsaWRhdGlvbiBmdW5jdGlvbnNcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVSZXF1aXJlZChkYXRhLCBjYWxsYmFjaykge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiBkYXRhICE9ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgJiYgKHR5cGVvZiBkYXRhICE9ICdzdHJpbmcnIHx8IGRhdGEudHJpbSgpICE9ICcnKTtcbiAgICB2YXIgcmVzcG9uc2UgPSBNTEZvcm0kJHZhbGlkYXRvclJlc3BvbnNlKHZhbGlkLCAncGxlYXNlIGVudGVyIGEgdmFsdWUnLCAnUkVRVUlSRUQnKTtcbiAgICBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG59XG5cblxuZnVuY3Rpb24gTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSh2YWxpZCwgcmVhc29uLCByZWFzb25Db2RlKSB7XG4gICAgcmV0dXJuIHZhbGlkXG4gICAgICAgICAgICA/IHsgdmFsaWQ6IHRydWUgfVxuICAgICAgICAgICAgOiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiByZWFzb24sIHJlYXNvbkNvZGU6IHJlYXNvbkNvZGUgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRvVCA9IG1pbG8udXRpbC5kb1RcbiAgICAsIGZzID0gcmVxdWlyZSgnZnMnKVxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBtaWxvQ291bnQgPSBtaWxvLnV0aWwuY291bnRcbiAgICAsIGNvbXBvbmVudE5hbWUgPSBtaWxvLnV0aWwuY29tcG9uZW50TmFtZVxuICAgICwgZm9ybVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9yZWdpc3RyeScpXG4gICAgLCBpdGVtVHlwZXMgPSByZXF1aXJlKCcuL2l0ZW1fdHlwZXMnKTtcblxudmFyIGNhY2hlZEl0ZW1zID0ge307XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JtR2VuZXJhdG9yO1xuXG5cbnZhciBwYXJ0aWFscyA9IHtcbiAgICBsYWJlbDogXCJ7ez8gaXQuaXRlbS5sYWJlbCB9fVxcbiAgICA8bGFiZWw+e3s9IGl0Lml0ZW0ubGFiZWx9fTwvbGFiZWw+XFxue3s/fX1cXG5cIixcbiAgICBmb3JtR3JvdXA6IFwiPGRpdlxcbiAgICB7ez8gaXQuaXRlbS5hbHRUZXh0IH19dGl0bGU9XFxcInt7PSBpdC5pdGVtLmFsdFRleHR9fVxcXCIge3s/fX1cXG4gICAgY2xhc3M9XFxcImZvcm0tZ3JvdXB7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX17ez99fVxcXCJcXG4+XFxuXCJcbn07XG5cbnZhciBkb3REZWYgPSB7XG4gICAgcGFydGlhbHM6IHBhcnRpYWxzXG59O1xuXG5cbi8qXG4gKiBHZW5lcmF0ZXMgZm9ybSBIVE1MIGJhc2VkIG9uIHRoZSBzY2hlbWEuXG4gKiBJdCBkb2VzIG5vdCBjcmVhdGUgY29tcG9uZW50cyBmb3IgdGhlIGZvcm0gRE9NLCBtaWxvLmJpbmRlciBzaG91bGQgYmUgY2FsbGVkIHNlcGFyYXRlbHkgb24gdGhlIGZvcm0ncyBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHNjaGVtYSBhcnJheSBvZiBmb3JtIGVsZW1lbnRzIGRlc2NyaXB0b3JzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1HZW5lcmF0b3Ioc2NoZW1hKSB7XG4gICAgLy9nZXRJdGVtc0NsYXNzZXMoKTtcblxuICAgIHZhciByZW5kZXJlZEl0ZW1zID0gc2NoZW1hLml0ZW1zLm1hcChyZW5kZXJJdGVtKTtcbiAgICByZXR1cm4gcmVuZGVyZWRJdGVtcy5qb2luKCcnKTtcblxuICAgIGZ1bmN0aW9uIHJlbmRlckl0ZW0oaXRlbSkge1xuICAgICAgICB2YXIgaXRlbVR5cGUgPSBjYWNoZWRJdGVtc1tpdGVtLnR5cGVdO1xuXG4gICAgICAgIGlmICghaXRlbVR5cGUpIHtcbiAgICAgICAgICAgIHZhciBuZXdJdGVtVHlwZSA9IGZvcm1SZWdpc3RyeS5nZXQoaXRlbS50eXBlKTtcbiAgICAgICAgICAgIGl0ZW1UeXBlID0gY2FjaGVkSXRlbXNbaXRlbS50eXBlXSA9IHtcbiAgICAgICAgICAgICAgICBDb21wQ2xhc3M6IG5ld0l0ZW1UeXBlLmNvbXBDbGFzcyAmJiBjb21wb25lbnRzUmVnaXN0cnkuZ2V0KG5ld0l0ZW1UeXBlLmNvbXBDbGFzcyksXG4gICAgICAgICAgICAgICAgY29tcENsYXNzOiBuZXdJdGVtVHlwZS5jb21wQ2xhc3MsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IGRvVC5jb21waWxlKG5ld0l0ZW1UeXBlLnRlbXBsYXRlLCBkb3REZWYpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtLmNvbXBOYW1lID0gaXRlbVR5cGUuQ29tcENsYXNzID8gaXRlbS5jb21wTmFtZSB8fCBjb21wb25lbnROYW1lKCkgOiBudWxsO1xuXG4gICAgICAgIHZhciBkb21GYWNldENvbmZpZyA9IGl0ZW1UeXBlLkNvbXBDbGFzcyAmJiBpdGVtVHlwZS5Db21wQ2xhc3MuZ2V0RmFjZXRDb25maWcoJ2RvbScpXG4gICAgICAgICAgICAsIHRhZ05hbWUgPSBkb21GYWNldENvbmZpZyAmJiBkb21GYWNldENvbmZpZy50YWdOYW1lIHx8ICdkaXYnO1xuXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGl0ZW1UeXBlLnRlbXBsYXRlO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGUoe1xuICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgIGNvbXBOYW1lOiBpdGVtLmNvbXBOYW1lLFxuICAgICAgICAgICAgY29tcENsYXNzOiBpdGVtVHlwZS5jb21wQ2xhc3MsXG4gICAgICAgICAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgICAgICAgICAgZm9ybUdlbmVyYXRvcjogZm9ybUdlbmVyYXRvcixcbiAgICAgICAgICAgIG1pbG9Db3VudDogbWlsb0NvdW50LFxuICAgICAgICAgICAgZGlzYWJsZWQ6IGl0ZW0uZGlzYWJsZWQsXG4gICAgICAgICAgICBtdWx0aXBsZTogaXRlbS5tdWx0aXBsZVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxuICAgICwgZm9ybVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9yZWdpc3RyeScpO1xuXG5cbnZhciBncm91cF9kb3QgPSBcIjxkaXYgbWwtYmluZD1cXFwiTUxHcm91cDp7ez0gaXQuY29tcE5hbWUgfX1cXFwie3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0gY2xhc3M9XFxcInt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fVxcXCJ7ez99fT5cXG4gICAge3sjIGRlZi5wYXJ0aWFscy5sYWJlbCB9fVxcbiAgICB7ez0gaXQuZm9ybUdlbmVyYXRvcihpdC5pdGVtKSB9fVxcbjwvZGl2PlxcblwiXG4gICAgLCB3cmFwcGVyX2RvdCA9IFwiPHNwYW4gbWwtYmluZD1cXFwiTUxXcmFwcGVyOnt7PSBpdC5jb21wTmFtZSB9fVxcXCJ7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSBjbGFzcz1cXFwie3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19XFxcInt7P319PlxcbiAgICB7ez0gaXQuZm9ybUdlbmVyYXRvcihpdC5pdGVtKSB9fVxcbjwvc3Bhbj5cXG5cIlxuICAgICwgc2VsZWN0X2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAge3sjIGRlZi5wYXJ0aWFscy5sYWJlbCB9fVxcbiAgICA8c3BhbiBjbGFzcz1cXFwiY3VzdG9tLXNlbGVjdFxcXCI+XFxuICAgICAgICA8c2VsZWN0IG1sLWJpbmQ9XFxcIk1MU2VsZWN0Ont7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgICAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX1cXG4gICAgICAgICAgICAgICAge3s/IGl0Lm11bHRpcGxlIH19bXVsdGlwbGUge3s/fX1cXG4gICAgICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuICAgICAgICA8L3NlbGVjdD5cXG4gICAgPC9zcGFuPlxcbjwvZGl2PlxcblwiXG4gICAgLCBpbnB1dF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPGlucHV0IHR5cGU9XFxcInt7PSBpdC5pdGVtLmlucHV0VHlwZSB8fCAndGV4dCcgfX1cXFwiXFxuICAgICAgICAgICAge3s/IGl0Lml0ZW0uaW5wdXROYW1lIH19bmFtZT1cXFwie3s9IGl0Lml0ZW0uaW5wdXROYW1lIH19XFxcInt7P319XFxuICAgICAgICAgICAgbWwtYmluZD1cXFwiTUxJbnB1dDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAge3s/IGl0Lml0ZW0ucGxhY2Vob2xkZXIgfX1wbGFjZWhvbGRlcj1cXFwie3s9IGl0Lml0ZW0ucGxhY2Vob2xkZXJ9fVxcXCJ7ez99fVxcbiAgICAgICAgICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319XFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuPC9kaXY+XFxuXCJcbiAgICAsIHRleHRhcmVhX2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAge3sjIGRlZi5wYXJ0aWFscy5sYWJlbCB9fVxcbiAgICA8dGV4dGFyZWEgbWwtYmluZD1cXFwiTUxUZXh0YXJlYTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCJcXG4gICAgICAgIHt7PyBpdC5pdGVtLnBsYWNlaG9sZGVyIH19cGxhY2Vob2xkZXI9XFxcInt7PSBpdC5pdGVtLnBsYWNlaG9sZGVyfX1cXFwie3s/fX1cXG4gICAgICAgIHt7PyBpdC5pdGVtLmF1dG9yZXNpemUgfX1yb3dzPVxcXCJ7ez0gaXQuaXRlbS5hdXRvcmVzaXplLm1pbkxpbmVzIH19XFxcInt7P319PjwvdGV4dGFyZWE+XFxuPC9kaXY+XCJcbiAgICAsIGJ1dHRvbl9kb3QgPSBcIjxkaXYge3s/IGl0Lml0ZW0uYWx0VGV4dCB9fXRpdGxlPVxcXCJ7ez0gaXQuaXRlbS5hbHRUZXh0fX1cXFwiIHt7P319Y2xhc3M9XFxcImJ0bi10b29sYmFye3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0ge3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19e3s/fX1cXFwiPlxcbiAgICA8YnV0dG9uIG1sLWJpbmQ9XFxcIk1MQnV0dG9uOnt7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319XFxuICAgICAgICBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IHt7PyBpdC5pdGVtLml0ZW1Dc3NDbGFzc319IHt7PSBpdC5pdGVtLml0ZW1Dc3NDbGFzcyB9fXt7P319XFxcIj5cXG4gICAgICAgIHt7PSBpdC5pdGVtLmxhYmVsIHx8ICcnIH19XFxuICAgIDwvYnV0dG9uPlxcbjwvZGl2PlxcblwiXG4gICAgLCBoeXBlcmxpbmtfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICA8YSB7ez8gaXQuaXRlbS5ocmVmfX1ocmVmPVxcXCJ7ez0gaXQuaXRlbS5ocmVmIH19XFxcInt7P319XFxuICAgICAgICB7ez8gaXQuaXRlbS50YXJnZXR9fXRhcmdldD1cXFwie3s9IGl0Lml0ZW0udGFyZ2V0IH19XFxcInt7P319ICAgXFxuICAgICAgICBtbC1iaW5kPVxcXCJNTEh5cGVybGluazp7ez0gaXQuY29tcE5hbWUgfX1cXFwiIFxcbiAgICAgICAgY2xhc3M9XFxcImh5cGVybGluayBoeXBlcmxpbmstZGVmYXVsdFxcXCI+XFxuICAgICAgICB7ez0gaXQuaXRlbS5sYWJlbCB8fCAnJyB9fVxcbiAgICA8L2E+XFxuPC9kaXY+XCJcbiAgICAsIGNoZWNrYm94X2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gIDxpbnB1dCB0eXBlPVxcXCJjaGVja2JveFxcXCJcXG4gICAgaWQ9XFxcInt7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgbWwtYmluZD1cXFwiTUxJbnB1dDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319XFxuICAgIGNsYXNzPVxcXCJ7ez0gaXQuaXRlbS5pdGVtQ3NzQ2xhc3MgfHwgJyd9fVxcXCI+XFxuICA8bGFiZWwgZm9yPVxcXCJ7ez0gaXQuY29tcE5hbWUgfX1cXFwiPnt7PSBpdC5pdGVtLmxhYmVsfX08L2xhYmVsPlxcbjwvZGl2PlxcblwiXG4gICAgLCBsaXN0X2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAge3sjIGRlZi5wYXJ0aWFscy5sYWJlbCB9fVxcbiAgICA8dWwgbWwtYmluZD1cXFwiTUxMaXN0Ont7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fT5cXG4gICAgICAgIDxsaSBtbC1iaW5kPVxcXCJNTExpc3RJdGVtOml0ZW1TYW1wbGVcXFwiIGNsYXNzPVxcXCJsaXN0LWl0ZW1cXFwiPlxcbiAgICAgICAgICAgIDxzcGFuIG1sLWJpbmQ9XFxcIltkYXRhXTpsYWJlbFxcXCI+PC9zcGFuPlxcbiAgICAgICAgICAgIHt7PyBpdC5lZGl0QnRuIH19PGJ1dHRvbiBtbC1iaW5kPVxcXCJbZXZlbnRzXTplZGl0QnRuXFxcIj5lZGl0PC9idXR0b24+e3s/fX1cXG4gICAgICAgICAgICA8YnV0dG9uIG1sLWJpbmQ9XFxcIltldmVudHNdOmRlbGV0ZUJ0blxcXCIgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCBnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVxcXCI+IDwvYnV0dG9uPlxcbiAgICAgICAgPC9saT5cXG4gICAgPC91bD5cXG48L2Rpdj5cXG5cIlxuICAgICwgdGltZV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPGlucHV0IHR5cGU9XFxcInRpbWVcXFwiXFxuICAgICAgICAgICAgbWwtYmluZD1cXFwiTUxUaW1lOnt7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgICAgICBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj5cXG48L2Rpdj5cIlxuICAgICwgZGF0ZV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiXFxuICAgICAgICAgICAgbWwtYmluZD1cXFwiTUxEYXRlOnt7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgICAgICBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj5cXG48L2Rpdj5cIlxuICAgICwgY29tYm9fZG90ID0gXCI8ZGl2IG1sLWJpbmQ9XFxcIk1MQ29tYm86e3s9IGl0LmNvbXBOYW1lIH19XFxcIiBjbGFzcz1cXFwiZm9ybS1ncm91cHt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IHt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fXt7P319XFxcIj5cXG4gICAge3sjIGRlZi5wYXJ0aWFscy5sYWJlbCB9fVxcbiAgICB7eyB2YXIgbGlzdElEID0gJ21sLWNvbWJvLWRhdGFsaXN0LScgKyBpdC5taWxvQ291bnQoKTsgfX1cXG4gICAgPGlucHV0IG1sLWJpbmQ9XFxcIltkYXRhLCBldmVudHNdOmlucHV0XFxcIlxcbiAgICAgICAgICAgIG5hbWU9XFxcInt7PSBsaXN0SUQgfX1cXFwiXFxuICAgICAgICAgICAgbGlzdD1cXFwie3s9IGxpc3RJRCB9fVxcXCJcXG4gICAgICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcbiAgICA8ZGF0YWxpc3QgaWQ9XFxcInt7PSBsaXN0SUQgfX1cXFwiIG1sLWJpbmQ9XFxcIlt0ZW1wbGF0ZV06ZGF0YWxpc3RcXFwiPjwvZGF0YWxpc3Q+XFxuPC9kaXY+XCJcbiAgICAsIGltYWdlX2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAge3sjIGRlZi5wYXJ0aWFscy5sYWJlbCB9fVxcbiAgICA8aW1nIHt7PyBpdC5pdGVtLnNyYyB9fXNyYz1cXFwie3s9IGl0Lml0ZW0uc3JjIH19XFxcInt7P319XFxuICAgICAgICBtbC1iaW5kPVxcXCJNTEltYWdlOnt7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgIHt7PyBpdC5pdGVtLndpZHRoIH19d2lkdGg9XFxcInt7PSBpdC5pdGVtLndpZHRoIH19XFxcInt7P319XFxuICAgICAgICB7ez8gaXQuaXRlbS5oZWlnaHQgfX1oZWlnaHQ9XFxcInt7PSBpdC5pdGVtLmhlaWdodCB9fVxcXCJ7ez99fT5cXG48L2Rpdj5cXG5cIlxuICAgICwgZHJvcHRhcmdldF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgICAgIDxpbWcge3s/IGl0Lml0ZW0uc3JjIH19c3JjPVxcXCJ7ez0gaXQuaXRlbS5zcmMgfX1cXFwie3s/fX1cXG4gICAgICAgICAgICBtbC1iaW5kPVxcXCJNTERyb3BUYXJnZXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLndpZHRoIH19d2lkdGg9XFxcInt7PSBpdC5pdGVtLndpZHRoIH19XFxcInt7P319XFxuICAgICAgICAgICAge3s/IGl0Lml0ZW0uaGVpZ2h0IH19aGVpZ2h0PVxcXCJ7ez0gaXQuaXRlbS5oZWlnaHQgfX1cXFwie3s/fX0+XFxuPC9kaXY+XFxuXCJcbiAgICAsIHRleHRfZG90ID0gXCJ7e3ZhciB0YWdOYW1lID0gaXQuaXRlbS50YWdOYW1lIHx8ICdzcGFuJzt9fVxcbjx7ez10YWdOYW1lfX0gbWwtYmluZD1cXFwiTUxUZXh0Ont7PSBpdC5jb21wTmFtZSB9fVxcXCJ7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSBjbGFzcz1cXFwie3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19XFxcInt7P319PlxcbiAgICB7ez8gaXQuaXRlbS5sYWJlbCB9fVxcbiAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWx9fVxcbiAgICB7ez99fVxcbjwve3s9dGFnTmFtZX19PlxcblwiXG4gICAgLCBjbGVhcl9kb3QgPSAnPGRpdiBjbGFzcz1cImNjLWNsZWFyXCI+PC9kaXY+JztcblxuXG5mb3JtUmVnaXN0cnkuYWRkKCdncm91cCcsICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MR3JvdXAnLCAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGdyb3VwX2RvdCwgICAgICAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdwcm9oaWJpdGVkJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3dyYXBwZXInLCAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxXcmFwcGVyJywgICAgICAgICAgICAgICB0ZW1wbGF0ZTogd3JhcHBlcl9kb3QsICAgICAgICAgICAgICAgbW9kZWxQYXRoUnVsZTogJ3Byb2hpYml0ZWQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnc2VsZWN0JywgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTFNlbGVjdCcsICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBzZWxlY3RfZG90LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc1NlbGVjdFNjaGVtYSAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdpbnB1dCcsICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MSW5wdXQnLCAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGlucHV0X2RvdCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzSW5wdXRTY2hlbWEgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2lucHV0bGlzdCcsICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxJbnB1dExpc3QnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NJbnB1dExpc3RTY2hlbWEgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgndGV4dGFyZWEnLCAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTFRleHRhcmVhJywgICAgICAgICAgICAgIHRlbXBsYXRlOiB0ZXh0YXJlYV9kb3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc1RleHRhcmVhU2NoZW1hICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdidXR0b24nLCAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MQnV0dG9uJywgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGJ1dHRvbl9kb3QsICAgICAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdvcHRpb25hbCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3JhZGlvJywgICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxSYWRpb0dyb3VwJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NSYWRpb1NjaGVtYSAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY2hlY2tncm91cCcsICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTENoZWNrR3JvdXAnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0NoZWNrR3JvdXBTY2hlbWEgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2h5cGVybGluaycsICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxIeXBlcmxpbmsnLCAgICAgICAgICAgICB0ZW1wbGF0ZTogaHlwZXJsaW5rX2RvdCwgICAgICAgICAgICAgbW9kZWxQYXRoUnVsZTogJ29wdGlvbmFsJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY2hlY2tib3gnLCAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTElucHV0JywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjaGVja2JveF9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdsaXN0JywgICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MTGlzdCcsICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGxpc3RfZG90ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3RpbWUnLCAgICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxUaW1lJywgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGltZV9kb3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHNldFZhbHVlICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnZGF0ZScsICAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTERhdGUnLCAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBkYXRlX2RvdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdjb21ibycsICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MQ29tYm8nLCAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGNvbWJvX2RvdCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzQ29tYm9TY2hlbWEgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3N1cGVyY29tYm8nLCAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxTdXBlckNvbWJvJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NTdXBlckNvbWJvU2NoZW1hICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY29tYm9saXN0JywgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTENvbWJvTGlzdCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0NvbWJvTGlzdFNjaGVtYSAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdpbWFnZScsICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MSW1hZ2UnLCAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGltYWdlX2RvdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2Ryb3B0YXJnZXQnLCAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxEcm9wVGFyZ2V0JywgICAgICAgICAgICB0ZW1wbGF0ZTogZHJvcHRhcmdldF9kb3QsICAgICAgICAgICAgbW9kZWxQYXRoUnVsZTogJ3Byb2hpYml0ZWQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgndGV4dCcsICAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTFRleHQnLCAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB0ZXh0X2RvdCwgICAgICAgICAgICAgICAgICBtb2RlbFBhdGhSdWxlOiAnb3B0aW9uYWwnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdjbGVhcicsICAgICAgICAgICAgICAgICB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGNsZWFyX2RvdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG5mdW5jdGlvbiBzZXRWYWx1ZShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5zZWxlY3RPcHRpb25zO1xuICAgIGlmIChzY2hlbWEuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJykpIHtcbiAgICAgICAgY29tcC5kYXRhLnNldChzY2hlbWEudmFsdWUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1NlbGVjdFNjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5zZWxlY3RPcHRpb25zO1xuICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tcG9uZW50TW9kZWwpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NSYWRpb1NjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5yYWRpb09wdGlvbnM7XG4gICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21wb25lbnRNb2RlbCk7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc0NoZWNrR3JvdXBTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuY2hlY2tPcHRpb25zO1xuICAgIGNvbXAuc2V0U2VsZWN0QWxsKCEhc2NoZW1hLnNlbGVjdEFsbCk7XG4gICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21wb25lbnRNb2RlbCk7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc0NvbWJvU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIHZhciBvcHRpb25zID0gc2NoZW1hLmNvbWJvT3B0aW9ucztcbiAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbXBvbmVudE1vZGVsKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzU3VwZXJDb21ib1NjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5jb21ib09wdGlvbnNcbiAgICAgICAgLCBvcHRpb25zVVJMID0gc2NoZW1hLmNvbWJvT3B0aW9uc1VSTFxuICAgICAgICAsIGFkZEl0ZW1Qcm9tcHQgPSBzY2hlbWEuYWRkSXRlbVByb21wdFxuICAgICAgICAsIHBsYWNlSG9sZGVyID0gc2NoZW1hLnBsYWNlSG9sZGVyO1xuXG4gICAgXy5kZWZlclRpY2tzKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoYWRkSXRlbVByb21wdCkgY29tcC5zZXRBZGRJdGVtUHJvbXB0KGFkZEl0ZW1Qcm9tcHQpO1xuICAgICAgICBpZiAocGxhY2VIb2xkZXIpIGNvbXAuc2V0UGxhY2Vob2xkZXIocGxhY2VIb2xkZXIpO1xuICAgICAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbWJvT3B0aW9ucyk7XG4gICAgICAgIGlmKG9wdGlvbnNVUkwpXG4gICAgICAgICAgICBjb21wLmluaXRPcHRpb25zVVJMKG9wdGlvbnNVUkwpO1xuICAgIH0sIDIpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NDb21ib0xpc3RTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuY29tYm9PcHRpb25zXG4gICAgICAgICwgYWRkSXRlbVByb21wdCA9IHNjaGVtYS5hZGRJdGVtUHJvbXB0XG4gICAgICAgICwgcGxhY2VIb2xkZXIgPSBzY2hlbWEucGxhY2VIb2xkZXI7XG5cbiAgICBfLmRlZmVyVGlja3MoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChhZGRJdGVtUHJvbXB0KSBjb21wLnNldEFkZEl0ZW1Qcm9tcHQoYWRkSXRlbVByb21wdCk7XG4gICAgICAgIGlmIChwbGFjZUhvbGRlcikgY29tcC5zZXRQbGFjZWhvbGRlcihwbGFjZUhvbGRlcik7XG4gICAgICAgIGNvbXAuc2V0RGF0YVZhbGlkYXRpb24oc2NoZW1hLmRhdGFWYWxpZGF0aW9uKTtcbiAgICAgICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21ib09wdGlvbnMpO1xuICAgIH0sIDIpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NJbnB1dExpc3RTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgY29tcC5zZXRBc3luYyhzY2hlbWEuYXN5bmNIYW5kbGVyKTtcbiAgICBjb21wLnNldFBsYWNlSG9sZGVyKHNjaGVtYS5wbGFjZUhvbGRlcik7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc1RleHRhcmVhU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIGlmIChzY2hlbWEuYXV0b3Jlc2l6ZSlcbiAgICAgICAgXy5kZWZlck1ldGhvZChjb21wLCAnc3RhcnRBdXRvcmVzaXplJywgc2NoZW1hLmF1dG9yZXNpemUpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NJbnB1dFNjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICBpZiAoXy5pc051bWVyaWMoc2NoZW1hLm1heExlbmd0aCkpIGNvbXAuc2V0TWF4TGVuZ3RoKHNjaGVtYS5tYXhMZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldE1vZGVsRnVuYykge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50aGVuID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHNldE1vZGVsRnVuYyhjb21wLCBbeyB2YWx1ZTogMCwgbGFiZWw6ICdsb2FkaW5nLi4uJyB9XSk7XG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpIHsgc2V0TW9kZWxGdW5jKGNvbXAsIGRhdGEpOyB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHsgc2V0TW9kZWxGdW5jKGNvbXAsIFt7IHZhbHVlOiAwLCBsYWJlbDogJ2xvYWRpbmcgZXJyb3InIH1dKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgc2V0TW9kZWxGdW5jKGNvbXAsIG9wdGlvbnMpO1xuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBzZXRDb21wb25lbnRNb2RlbChjb21wLCBkYXRhKSB7XG4gICAgY29tcC5tb2RlbC5zZXQoZGF0YSk7XG4gICAgLy8gXy5kZWZlck1ldGhvZChjb21wLm1vZGVsLCAnc2V0JywgZGF0YSk7XG4gICAgLy8gZG9pbmcgaXQgd2l0aCBkZWZlciBtYWtlcyBjaGFubmVsIG5vdCBzZXQgd2hlbiB0aGUgYXJ0aWNsZSBpcyBvcGVuZWRcbn1cblxuXG5mdW5jdGlvbiBzZXRDb21ib09wdGlvbnMoY29tcCwgZGF0YSkge1xuICAgIGNvbXAuc2V0T3B0aW9ucyhkYXRhKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIGNvbXAucHJvY2Vzc0Zvcm1TY2hlbWEoc2NoZW1hKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXJcbiAgICAsIGNoZWNrID0gbWlsby51dGlsLmNoZWNrXG4gICAgLCBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxudmFyIGZvcm1UeXBlcyA9IHt9O1xudmFyIGRlZmF1bHRzID0ge307XG5cbnZhciBmb3JtUmVnaXN0cnkgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXQ6IHJlZ2lzdHJ5X2dldCxcbiAgICBhZGQ6IHJlZ2lzdHJ5X2FkZCxcbiAgICBzZXREZWZhdWx0czogcmVnaXN0cnlfc2V0RGVmYXVsdHNcbn07XG5cblxudmFyIERFRkFVTFRfVEVNUExBVEUgPSAne3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx7ez0gaXQudGFnTmFtZX19IG1sLWJpbmQ9XCJ7ez0gaXQuY29tcENsYXNzfX06e3s9IGl0LmNvbXBOYW1lIH19XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3t7PSBpdC50YWdOYW1lfX0+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2Pic7XG5cbmZvcm1SZWdpc3RyeS5zZXREZWZhdWx0cyh7XG4gICAgdGVtcGxhdGU6IERFRkFVTFRfVEVNUExBVEUsXG4gICAgbW9kZWxQYXRoUnVsZTogJ3JlcXVpcmVkJyxcbiAgICBpdGVtRnVuY3Rpb246IG51bGxcbn0pO1xuXG5cbmZ1bmN0aW9uIHJlZ2lzdHJ5X2dldChuYW1lKSB7XG4gICAgdmFyIGZvcm1JdGVtID0gbmFtZSAmJiBmb3JtVHlwZXNbbmFtZV07XG5cbiAgICBpZiAoIWZvcm1JdGVtKSBcbiAgICAgICAgcmV0dXJuIGxvZ2dlci5lcnJvcignRm9ybSBpdGVtICcgKyBuYW1lICsgJyBub3QgcmVnaXN0ZXJlZCcpO1xuXG4gICAgcmV0dXJuIGZvcm1JdGVtO1xufVxuXG5mdW5jdGlvbiByZWdpc3RyeV9hZGQobmFtZSwgbmV3Rm9ybUl0ZW0pIHtcbiAgICBjaGVjayhuYW1lLCBTdHJpbmcpO1xuICAgIGNoZWNrKG5ld0Zvcm1JdGVtLCB7XG4gICAgICAgIGNvbXBDbGFzczogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgdGVtcGxhdGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIG1vZGVsUGF0aFJ1bGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIGl0ZW1GdW5jdGlvbjogTWF0Y2guT3B0aW9uYWwoRnVuY3Rpb24pXG4gICAgfSk7XG5cbiAgICB2YXIgZm9ybUl0ZW0gPSBfLmNsb25lKGRlZmF1bHRzKTtcbiAgICBfLmV4dGVuZChmb3JtSXRlbSwgbmV3Rm9ybUl0ZW0pO1xuXG4gICAgaWYgKG5hbWUgJiYgZm9ybVR5cGVzW25hbWVdKSBcbiAgICAgICAgcmV0dXJuIGxvZ2dlci5lcnJvcignRm9ybSBpdGVtICcgKyBuYW1lICsgJyBhbHJlYWR5IHJlZ2lzdGVyZWQnKTtcblxuICAgIGZvcm1UeXBlc1tuYW1lXSA9IGZvcm1JdGVtO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiByZWdpc3RyeV9zZXREZWZhdWx0cyhuZXdEZWZhdWx0cykge1xuICAgIGNoZWNrKGRlZmF1bHRzLCBPYmplY3QpO1xuICAgIGRlZmF1bHRzID0gbmV3RGVmYXVsdHM7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKCEod2luZG93Lm1pbG8gJiYgd2luZG93Lm1pbG8ubWlsb192ZXJzaW9uKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pbG8gaXMgbm90IGF2YWlsYWJsZScpO1xuXG4vKipcbiAqIGBtaWxvLXVpYFxuICpcbiAqIFRoaXMgYnVuZGxlIHdpbGwgcmVnaXN0ZXIgYWRkaXRpb25hbCBjb21wb25lbnQgY2xhc3NlcyBmb3IgVUlcbiAqL1xuXG5yZXF1aXJlKCcuL3VzZV9jb21wb25lbnRzJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Hcm91cCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1dyYXBwZXInKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9UZXh0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvU2VsZWN0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSW5wdXQnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9JbnB1dExpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9UZXh0YXJlYScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1JhZGlvR3JvdXAnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9DaGVja0dyb3VwJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvQnV0dG9uJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSHlwZXJsaW5rJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvTGlzdCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0xpc3RJdGVtJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGltZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0RhdGUnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Db21ibycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1N1cGVyQ29tYm8nKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Db21ib0xpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9JbWFnZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0Ryb3BUYXJnZXQnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Gb2xkVHJlZScpO1xuXG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvYm9vdHN0cmFwL0FsZXJ0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvYm9vdHN0cmFwL0RpYWxvZycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bicpO1xuXG5yZXF1aXJlKCcuL2Zvcm1zL0Zvcm0nKTtcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKSxnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oy8qIVxuICogYXN5bmNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IENhb2xhbiBNY01haG9uXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBhc3luYyA9IHt9O1xuICAgIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHYpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvQm9vbCh2KSB7XG4gICAgICAgIHJldHVybiAhIXY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vdElkKHYpIHtcbiAgICAgICAgcmV0dXJuICF2O1xuICAgIH1cblxuICAgIC8vIGdsb2JhbCBvbiB0aGUgc2VydmVyLCB3aW5kb3cgaW4gdGhlIGJyb3dzZXJcbiAgICB2YXIgcHJldmlvdXNfYXN5bmM7XG5cbiAgICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCAoYHNlbGZgKSBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbiAgICAvLyBvbiB0aGUgc2VydmVyLCBvciBgdGhpc2AgaW4gc29tZSB2aXJ0dWFsIG1hY2hpbmVzLiBXZSB1c2UgYHNlbGZgXG4gICAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgICB2YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fFxuICAgICAgICAgICAgdGhpcztcblxuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBjcm9zcy1icm93c2VyIGNvbXBhdGlibGl0eSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgdmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICB2YXIgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIF90b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIC8vIFBvcnRlZCBmcm9tIHVuZGVyc2NvcmUuanMgaXNPYmplY3RcbiAgICB2YXIgX2lzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9pc0FycmF5TGlrZShhcnIpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5KGFycikgfHwgKFxuICAgICAgICAgICAgLy8gaGFzIGEgcG9zaXRpdmUgaW50ZWdlciBsZW5ndGggcHJvcGVydHlcbiAgICAgICAgICAgIHR5cGVvZiBhcnIubGVuZ3RoID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoID49IDAgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggJSAxID09PSAwXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2VhY2goY29sbCwgaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5TGlrZShjb2xsKSA/XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGNvbGwsIGl0ZXJhdG9yKSA6XG4gICAgICAgICAgICBfZm9yRWFjaE9mKGNvbGwsIGl0ZXJhdG9yKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXJyYXlFYWNoKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tYXAoYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmFuZ2UoY291bnQpIHtcbiAgICAgICAgcmV0dXJuIF9tYXAoQXJyYXkoY291bnQpLCBmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gaTsgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlZHVjZShhcnIsIGl0ZXJhdG9yLCBtZW1vKSB7XG4gICAgICAgIF9hcnJheUVhY2goYXJyLCBmdW5jdGlvbiAoeCwgaSwgYSkge1xuICAgICAgICAgICAgbWVtbyA9IGl0ZXJhdG9yKG1lbW8sIHgsIGksIGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZvckVhY2hPZihvYmplY3QsIGl0ZXJhdG9yKSB7XG4gICAgICAgIF9hcnJheUVhY2goX2tleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmRleE9mKGFyciwgaXRlbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHZhciBfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9rZXlJdGVyYXRvcihjb2xsKSB7XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHZhciBsZW47XG4gICAgICAgIHZhciBrZXlzO1xuICAgICAgICBpZiAoX2lzQXJyYXlMaWtlKGNvbGwpKSB7XG4gICAgICAgICAgICBsZW4gPSBjb2xsLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGkgOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBfa2V5cyhjb2xsKTtcbiAgICAgICAgICAgIGxlbiA9IGtleXMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8ga2V5c1tpXSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2ltaWxhciB0byBFUzYncyByZXN0IHBhcmFtIChodHRwOi8vYXJpeWEub2ZpbGFicy5jb20vMjAxMy8wMy9lczYtYW5kLXJlc3QtcGFyYW1ldGVyLmh0bWwpXG4gICAgLy8gVGhpcyBhY2N1bXVsYXRlcyB0aGUgYXJndW1lbnRzIHBhc3NlZCBpbnRvIGFuIGFycmF5LCBhZnRlciBhIGdpdmVuIGluZGV4LlxuICAgIC8vIEZyb20gdW5kZXJzY29yZS5qcyAoaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlL3B1bGwvMjE0MCkuXG4gICAgZnVuY3Rpb24gX3Jlc3RQYXJhbShmdW5jLCBzdGFydEluZGV4KSB7XG4gICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ID09IG51bGwgPyBmdW5jLmxlbmd0aCAtIDEgOiArc3RhcnRJbmRleDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKTtcbiAgICAgICAgICAgIHZhciByZXN0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICByZXN0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCArIHN0YXJ0SW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoIChzdGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIHJlc3QpO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ3VycmVudGx5IHVudXNlZCBidXQgaGFuZGxlIGNhc2VzIG91dHNpZGUgb2YgdGhlIHN3aXRjaCBzdGF0ZW1lbnQ6XG4gICAgICAgICAgICAvLyB2YXIgYXJncyA9IEFycmF5KHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgICAgIC8vIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHN0YXJ0SW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIC8vICAgICBhcmdzW2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBhcmdzW3N0YXJ0SW5kZXhdID0gcmVzdDtcbiAgICAgICAgICAgIC8vIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IodmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGV4cG9ydGVkIGFzeW5jIG1vZHVsZSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgLy8vLyBuZXh0VGljayBpbXBsZW1lbnRhdGlvbiB3aXRoIGJyb3dzZXItY29tcGF0aWJsZSBmYWxsYmFjayAvLy8vXG5cbiAgICAvLyBjYXB0dXJlIHRoZSBnbG9iYWwgcmVmZXJlbmNlIHRvIGd1YXJkIGFnYWluc3QgZmFrZVRpbWVyIG1vY2tzXG4gICAgdmFyIF9zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmIHNldEltbWVkaWF0ZTtcblxuICAgIHZhciBfZGVsYXkgPSBfc2V0SW1tZWRpYXRlID8gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgLy8gbm90IGEgZGlyZWN0IGFsaWFzIGZvciBJRTEwIGNvbXBhdGliaWxpdHlcbiAgICAgICAgX3NldEltbWVkaWF0ZShmbik7XG4gICAgfSA6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICB9IGVsc2Uge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IF9kZWxheTtcbiAgICB9XG4gICAgYXN5bmMuc2V0SW1tZWRpYXRlID0gX3NldEltbWVkaWF0ZSA/IF9kZWxheSA6IGFzeW5jLm5leHRUaWNrO1xuXG5cbiAgICBhc3luYy5mb3JFYWNoID1cbiAgICBhc3luYy5lYWNoID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2YoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoU2VyaWVzID1cbiAgICBhc3luYy5lYWNoU2VyaWVzID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cblxuICAgIGFzeW5jLmZvckVhY2hMaW1pdCA9XG4gICAgYXN5bmMuZWFjaExpbWl0ID0gZnVuY3Rpb24gKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gX2VhY2hPZkxpbWl0KGxpbWl0KShhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZiA9XG4gICAgYXN5bmMuZWFjaE9mID0gZnVuY3Rpb24gKG9iamVjdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdCB8fCBbXTtcbiAgICAgICAgdmFyIHNpemUgPSBfaXNBcnJheUxpa2Uob2JqZWN0KSA/IG9iamVjdC5sZW5ndGggOiBfa2V5cyhvYmplY3QpLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbXBsZXRlZCA9IDA7XG4gICAgICAgIGlmICghc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIF9lYWNoKG9iamVjdCwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXksIG9ubHlfb25jZShkb25lKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkID49IHNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZlNlcmllcyA9XG4gICAgYXN5bmMuZWFjaE9mU2VyaWVzID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYy5uZXh0VGljayhpdGVyYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGl0ZXJhdGUoKTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLmZvckVhY2hPZkxpbWl0ID1cbiAgICBhc3luYy5lYWNoT2ZMaW1pdCA9IGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2VhY2hPZkxpbWl0KGxpbWl0KShvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9lYWNoT2ZMaW1pdChsaW1pdCkge1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHJ1bm5pbmcgPSAwO1xuICAgICAgICAgICAgdmFyIGVycm9yZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uIHJlcGxlbmlzaCAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbmUgJiYgcnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmICFlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGVuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKF9lYWNoT2ZMaW1pdChsaW1pdCksIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9TZXJpZXMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZlNlcmllcywgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hc3luY01hcChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLm1hcCA9IGRvUGFyYWxsZWwoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBTZXJpZXMgPSBkb1NlcmllcyhfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9hc3luY01hcCk7XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMuaW5qZWN0ID1cbiAgICBhc3luYy5mb2xkbCA9XG4gICAgYXN5bmMucmVkdWNlID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIGZ1bmN0aW9uICh4LCBpLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgeCwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIG1lbW8gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyIHx8IG51bGwsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9sZHIgPVxuICAgIGFzeW5jLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXZlcnNlZCA9IF9tYXAoYXJyLCBpZGVudGl0eSkucmV2ZXJzZSgpO1xuICAgICAgICBhc3luYy5yZWR1Y2UocmV2ZXJzZWQsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7aW5kZXg6IGluZGV4LCB2YWx1ZTogeH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKF9tYXAocmVzdWx0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgICAgICAgICAgfSksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnNlbGVjdCA9XG4gICAgYXN5bmMuZmlsdGVyID0gZG9QYXJhbGxlbChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdExpbWl0ID1cbiAgICBhc3luYy5maWx0ZXJMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdFNlcmllcyA9XG4gICAgYXN5bmMuZmlsdGVyU2VyaWVzID0gZG9TZXJpZXMoX2ZpbHRlcik7XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0KGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2ZpbHRlcihlYWNoZm4sIGFyciwgZnVuY3Rpb24odmFsdWUsIGNiKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIGNiKCF2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGFzeW5jLnJlamVjdCA9IGRvUGFyYWxsZWwoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0TGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0U2VyaWVzID0gZG9TZXJpZXMoX3JlamVjdCk7XG5cbiAgICBmdW5jdGlvbiBfY3JlYXRlVGVzdGVyKGVhY2hmbiwgY2hlY2ssIGdldFJlc3VsdCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJyLCBsaW1pdCwgaXRlcmF0b3IsIGNiKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgICAgICAgICAgIGlmIChjYikgY2IoZ2V0UmVzdWx0KGZhbHNlLCB2b2lkIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGVlKHgsIF8sIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjYikgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNiICYmIGNoZWNrKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYihnZXRSZXN1bHQodHJ1ZSwgeCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBsaW1pdCwgaXRlcmF0ZWUsIGRvbmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yID0gbGltaXQ7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgaXRlcmF0ZWUsIGRvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLmFueSA9XG4gICAgYXN5bmMuc29tZSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLnNvbWVMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuYWxsID1cbiAgICBhc3luYy5ldmVyeSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBub3RJZCwgbm90SWQpO1xuXG4gICAgYXN5bmMuZXZlcnlMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIG5vdElkLCBub3RJZCk7XG5cbiAgICBmdW5jdGlvbiBfZmluZEdldFJlc3VsdCh2LCB4KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICBhc3luYy5kZXRlY3QgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RTZXJpZXMgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZlNlcmllcywgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG5cbiAgICBhc3luYy5zb3J0QnkgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMubWFwKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAoZXJyLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHt2YWx1ZTogeCwgY3JpdGVyaWE6IGNyaXRlcmlhfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIF9tYXAocmVzdWx0cy5zb3J0KGNvbXBhcmF0b3IpLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY29tcGFyYXRvcihsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhLCBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICAgICAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuYXV0byA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgdmFyIGlkeCA9IF9pbmRleE9mKGxpc3RlbmVycywgZm4pO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBsaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGFza0NvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLTtcbiAgICAgICAgICAgIF9hcnJheUVhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9hcnJheUVhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciB0YXNrID0gX2lzQXJyYXkodGFza3Nba10pID8gdGFza3Nba106IFt0YXNrc1trXV07XG4gICAgICAgICAgICB2YXIgdGFza0NhbGxiYWNrID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2FmZVJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgX2ZvckVhY2hPZihyZXN1bHRzLCBmdW5jdGlvbih2YWwsIHJrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW3JrZXldID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgdGFzay5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVhZC1sb2Nrc1xuICAgICAgICAgICAgdmFyIGxlbiA9IHJlcXVpcmVzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkZXA7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShkZXAgPSB0YXNrc1tyZXF1aXJlc1tsZW5dXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgaW5leGlzdGFudCBkZXBlbmRlbmN5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfaXNBcnJheShkZXApICYmIF9pbmRleE9mKGRlcCwgaykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKSAmJiAhcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uKHRpbWVzLCB0YXNrLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBERUZBVUxUX0lOVEVSVkFMID0gMDtcblxuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcblxuICAgICAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgICAgIHRpbWVzOiBERUZBVUxUX1RJTUVTLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IERFRkFVTFRfSU5URVJWQUxcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBwYXJzZVRpbWVzKGFjYywgdCl7XG4gICAgICAgICAgICBpZih0eXBlb2YgdCA9PT0gJ251bWJlcicpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiB0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodC50aW1lcywgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICAgICAgYWNjLmludGVydmFsID0gcGFyc2VJbnQodC5pbnRlcnZhbCwgMTApIHx8IERFRkFVTFRfSU5URVJWQUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYXJndW1lbnQgdHlwZSBmb3IgXFwndGltZXNcXCc6ICcgKyB0eXBlb2YgdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEgfHwgbGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50cyAtIG11c3QgYmUgZWl0aGVyICh0YXNrKSwgKHRhc2ssIGNhbGxiYWNrKSwgKHRpbWVzLCB0YXNrKSBvciAodGltZXMsIHRhc2ssIGNhbGxiYWNrKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAyICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrO1xuICAgICAgICAgICAgdGFzayA9IHRpbWVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGltZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHBhcnNlVGltZXMob3B0cywgdGltZXMpO1xuICAgICAgICB9XG4gICAgICAgIG9wdHMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgb3B0cy50YXNrID0gdGFzaztcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVkVGFzayh3cmFwcGVkQ2FsbGJhY2ssIHdyYXBwZWRSZXN1bHRzKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUF0dGVtcHQodGFzaywgZmluYWxBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2soIWVyciB8fCBmaW5hbEF0dGVtcHQsIHtlcnI6IGVyciwgcmVzdWx0OiByZXN1bHR9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgd3JhcHBlZFJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5SW50ZXJ2YWwoaW50ZXJ2YWwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUgKG9wdHMudGltZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBmaW5hbEF0dGVtcHQgPSAhKG9wdHMudGltZXMtPTEpO1xuICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlBdHRlbXB0KG9wdHMudGFzaywgZmluYWxBdHRlbXB0KSk7XG4gICAgICAgICAgICAgICAgaWYoIWZpbmFsQXR0ZW1wdCAmJiBvcHRzLmludGVydmFsID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlJbnRlcnZhbChvcHRzLmludGVydmFsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5zZXJpZXMoYXR0ZW1wdHMsIGZ1bmN0aW9uKGRvbmUsIGRhdGEpe1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBvcHRzLmNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHBhc3NlZCwgcnVuIHRoaXMgYXMgYSBjb250cm9sbCBmbG93XG4gICAgICAgIHJldHVybiBvcHRzLmNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrO1xuICAgIH07XG5cbiAgICBhc3luYy53YXRlcmZhbGwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGlmICghX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3cmFwSXRlcmF0b3IoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh3cmFwSXRlcmF0b3IobmV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbnN1cmVBc3luYyhpdGVyYXRvcikuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgd3JhcEl0ZXJhdG9yKGFzeW5jLml0ZXJhdG9yKHRhc2tzKSkoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3BhcmFsbGVsKGVhY2hmbiwgdGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UodGFza3MpID8gW10gOiB7fTtcblxuICAgICAgICBlYWNoZm4odGFza3MsIGZ1bmN0aW9uICh0YXNrLCBrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0YXNrKF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnBhcmFsbGVsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5wYXJhbGxlbExpbWl0ID0gZnVuY3Rpb24odGFza3MsIGxpbWl0LCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoX2VhY2hPZkxpbWl0KGxpbWl0KSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VyaWVzID0gZnVuY3Rpb24odGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2ZTZXJpZXMsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VDYWxsYmFjayhpbmRleCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEpID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSk6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWtlQ2FsbGJhY2soMCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmFwcGx5ID0gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGNhbGxBcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkoXG4gICAgICAgICAgICAgICAgbnVsbCwgYXJncy5jb25jYXQoY2FsbEFyZ3MpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIF9jb25jYXQoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGVzdC5hcHBseSh0aGlzLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZG9XaGlsc3QgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKytjYWxscyA8PSAxIHx8IHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudW50aWwgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9VbnRpbCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmRvV2hpbHN0KGl0ZXJhdG9yLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmR1cmluZyA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuXG4gICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2hlY2spO1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uKGVyciwgdHJ1dGgpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0cnV0aCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0KGNoZWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9EdXJpbmcgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIGFzeW5jLmR1cmluZyhmdW5jdGlvbihuZXh0KSB7XG4gICAgICAgICAgICBpZiAoY2FsbHMrKyA8IDEpIHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjb25jdXJyZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwb3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2sgfHwgbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfbmV4dChxLCB0YXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd29ya2VycyAtPSAxO1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIF9hcnJheUVhY2godGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHEgPSB7XG4gICAgICAgICAgICB0YXNrczogW10sXG4gICAgICAgICAgICBjb25jdXJyZW5jeTogY29uY3VycmVuY3ksXG4gICAgICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICAgICAgc2F0dXJhdGVkOiBub29wLFxuICAgICAgICAgICAgZW1wdHk6IG5vb3AsXG4gICAgICAgICAgICBkcmFpbjogbm9vcCxcbiAgICAgICAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGF1c2VkOiBmYWxzZSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBraWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5kcmFpbiA9IG5vb3A7XG4gICAgICAgICAgICAgICAgcS50YXNrcyA9IFtdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVuc2hpZnQ6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgdHJ1ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXEucGF1c2VkICYmIHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXNrcyA9IHEucGF5bG9hZCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS5wYXlsb2FkKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS50YXNrcy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF9tYXAodGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2IgPSBvbmx5X29uY2UoX25leHQocSwgdGFza3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcihkYXRhLCBjYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VycztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpZGxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChxLnBhdXNlZCA9PT0gZmFsc2UpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdW1lQ291bnQgPSBNYXRoLm1pbihxLmNvbmN1cnJlbmN5LCBxLnRhc2tzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gTmVlZCB0byBjYWxsIHEucHJvY2VzcyBvbmNlIHBlciBjb25jdXJyZW50XG4gICAgICAgICAgICAgICAgLy8gd29ya2VyIHRvIHByZXNlcnZlIGZ1bGwgY29uY3VycmVuY3kgYWZ0ZXIgcGF1c2VcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB3ID0gMTsgdyA8PSByZXN1bWVDb3VudDsgdysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfVxuXG4gICAgYXN5bmMucXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuICAgICAgICB2YXIgcSA9IF9xdWV1ZShmdW5jdGlvbiAoaXRlbXMsIGNiKSB7XG4gICAgICAgICAgICB3b3JrZXIoaXRlbXNbMF0sIGNiKTtcbiAgICAgICAgfSwgY29uY3VycmVuY3ksIDEpO1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5wcmlvcml0eVF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcblxuICAgICAgICBmdW5jdGlvbiBfY29tcGFyZVRhc2tzKGEsIGIpe1xuICAgICAgICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2JpbmFyeVNlYXJjaChzZXF1ZW5jZSwgaXRlbSwgY29tcGFyZSkge1xuICAgICAgICAgICAgdmFyIGJlZyA9IC0xLFxuICAgICAgICAgICAgICAgIGVuZCA9IHNlcXVlbmNlLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB3aGlsZSAoYmVnIDwgZW5kKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IGJlZyArICgoZW5kIC0gYmVnICsgMSkgPj4+IDEpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlKGl0ZW0sIHNlcXVlbmNlW21pZF0pID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYmVnID0gbWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IG1pZCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJlZztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoX2JpbmFyeVNlYXJjaChxLnRhc2tzLCBpdGVtLCBfY29tcGFyZVRhc2tzKSArIDEsIDAsIGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCB3aXRoIGEgbm9ybWFsIHF1ZXVlXG4gICAgICAgIHZhciBxID0gYXN5bmMucXVldWUod29ya2VyLCBjb25jdXJyZW5jeSk7XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgcHVzaCB0byBhY2NlcHQgc2Vjb25kIHBhcmFtZXRlciByZXByZXNlbnRpbmcgcHJpb3JpdHlcbiAgICAgICAgcS5wdXNoID0gZnVuY3Rpb24gKGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlbW92ZSB1bnNoaWZ0IGZ1bmN0aW9uXG4gICAgICAgIGRlbGV0ZSBxLnVuc2hpZnQ7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLmNhcmdvID0gZnVuY3Rpb24gKHdvcmtlciwgcGF5bG9hZCkge1xuICAgICAgICByZXR1cm4gX3F1ZXVlKHdvcmtlciwgMSwgcGF5bG9hZCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9jb25zb2xlX2ZuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb25zb2xlW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKGFyZ3MsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZVtuYW1lXSh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSldKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5sb2cgPSBfY29uc29sZV9mbignbG9nJyk7XG4gICAgYXN5bmMuZGlyID0gX2NvbnNvbGVfZm4oJ2RpcicpO1xuICAgIC8qYXN5bmMuaW5mbyA9IF9jb25zb2xlX2ZuKCdpbmZvJyk7XG4gICAgYXN5bmMud2FybiA9IF9jb25zb2xlX2ZuKCd3YXJuJyk7XG4gICAgYXN5bmMuZXJyb3IgPSBfY29uc29sZV9mbignZXJyb3InKTsqL1xuXG4gICAgYXN5bmMubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbiwgaGFzaGVyKSB7XG4gICAgICAgIHZhciBtZW1vID0ge307XG4gICAgICAgIHZhciBxdWV1ZXMgPSB7fTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGlkZW50aXR5O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIG1lbW9pemVkKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGtleSBpbiBtZW1vKSB7XG4gICAgICAgICAgICAgICAgYXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5IGluIHF1ZXVlcykge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxID0gcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVtb2l6ZWQubWVtbyA9IG1lbW87XG4gICAgICAgIG1lbW9pemVkLnVubWVtb2l6ZWQgPSBmbjtcbiAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH07XG5cbiAgICBhc3luYy51bm1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoZm4udW5tZW1vaXplZCB8fCBmbikuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3RpbWVzKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvdW50LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIG1hcHBlcihfcmFuZ2UoY291bnQpLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLnRpbWVzID0gX3RpbWVzKGFzeW5jLm1hcCk7XG4gICAgYXN5bmMudGltZXNTZXJpZXMgPSBfdGltZXMoYXN5bmMubWFwU2VyaWVzKTtcbiAgICBhc3luYy50aW1lc0xpbWl0ID0gZnVuY3Rpb24gKGNvdW50LCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5tYXBMaW1pdChfcmFuZ2UoY291bnQpLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VxID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IG5vb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBuZXh0YXJncykge1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIsIG5leHRhcmdzKTtcbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhhdCwgW2Vycl0uY29uY2F0KHJlc3VsdHMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY29tcG9zZSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLnNlcS5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIF9hcHBseUVhY2goZWFjaGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uKGZucywgYXJncykge1xuICAgICAgICAgICAgdmFyIGdvID0gX3Jlc3RQYXJhbShmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVhY2hmbihmbnMsIGZ1bmN0aW9uIChmbiwgXywgY2IpIHtcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncy5jb25jYXQoW2NiXSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ28uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ287XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmFwcGx5RWFjaCA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mKTtcbiAgICBhc3luYy5hcHBseUVhY2hTZXJpZXMgPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZlNlcmllcyk7XG5cblxuICAgIGFzeW5jLmZvcmV2ZXIgPSBmdW5jdGlvbiAoZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkb25lID0gb25seV9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIgdGFzayA9IGVuc3VyZUFzeW5jKGZuKTtcbiAgICAgICAgZnVuY3Rpb24gbmV4dChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFzayhuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGVuc3VyZUFzeW5jKGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5uZXJBcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmVuc3VyZUFzeW5jID0gZW5zdXJlQXN5bmM7XG5cbiAgICBhc3luYy5jb25zdGFudCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBhcmdzID0gW251bGxdLmNvbmNhdCh2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhc3luYy53cmFwU3luYyA9XG4gICAgYXN5bmMuYXN5bmNpZnkgPSBmdW5jdGlvbiBhc3luY2lmeShmdW5jKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiByZXN1bHQgaXMgUHJvbWlzZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChfaXNPYmplY3QocmVzdWx0KSAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIubWVzc2FnZSA/IGVyciA6IG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIE5vZGUuanNcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBhc3luYztcbiAgICB9XG4gICAgLy8gQU1EIC8gUmVxdWlyZUpTXG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZWQgZGlyZWN0bHkgdmlhIDxzY3JpcHQ+IHRhZ1xuICAgIGVsc2Uge1xuICAgICAgICByb290LmFzeW5jID0gYXN5bmM7XG4gICAgfVxuXG59KCkpO1xuIiwiXG4vLyBub3QgaW1wbGVtZW50ZWRcbi8vIFRoZSByZWFzb24gZm9yIGhhdmluZyBhbiBlbXB0eSBmaWxlIGFuZCBub3QgdGhyb3dpbmcgaXMgdG8gYWxsb3dcbi8vIHVudHJhZGl0aW9uYWwgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBtb2R1bGUuXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iXX0=
;