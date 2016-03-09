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
    try { var listOwner = this.item.list.owner; } catch(e) {}
    listOwner && listOwner.removeItem(this.item.index);
}


function MLListItem$moveItem(index) {
    var listOwner = this.item.list.owner;
    listOwner && listOwner.moveItem(this.item.index, index);
}


function MLListItem$isDropAllowed(meta/*, dragDrop*/){
    var Component = milo.registry.components.get(meta.compClass);

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
    dispatchChangeMessage.call(this);
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
    this.data.dispatchSourceMessage(COMBO_CHANGE_MESSAGE);

    var self = this;

    _.defer(function() {
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
    return this._optionsData.filter(_.partial(this._filterFunc, text));
}


function defaultFilter(text, option) {
    if (! option.label) return false;
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

    if(direction)
        _changeSelected.call(this, direction);
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
        var thisItem = this._filteredOptionsData[index];
        newSelection = this._filteredOptionsData[index + direction];
    }

    setSelected.call(this, newSelection);
    this.update();

    if (relativePos > this._optionsHeight - this._elementHeight * 2 && direction === 1)
        this._comboList.el.scrollTop += this._elementHeight * direction * 5;

    if (relativePos < this._elementHeight && direction === -1)
        this._comboList.el.scrollTop += this._elementHeight * direction * 5;
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
    var FormClass = this;
    var form = _createFormComponent(FormClass);
    _.defineProperty(form, '_hostObject', hostObject);
    var formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations;
    _processFormSchema();
    _createFormConnectors();
    _manageFormValidation();

    // set original form data
    if (formData)
        form.model.m.set(formData);

    if (schema.css)
        form.css.config = schema.css;

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
            throw (e);
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
formRegistry.add('time',                  { compClass: 'MLTime',                  template: time_dot,                                                                                        });
formRegistry.add('date',                  { compClass: 'MLDate',                  template: date_dot                                                                                         });
formRegistry.add('combo',                 { compClass: 'MLCombo',                 template: combo_dot,                                              itemFunction: processComboSchema         });
formRegistry.add('supercombo',            { compClass: 'MLSuperCombo',                                                                              itemFunction: processSuperComboSchema    });
formRegistry.add('combolist',             { compClass: 'MLComboList',                                                                               itemFunction: processComboListSchema     });
formRegistry.add('image',                 { compClass: 'MLImage',                 template: image_dot                                                                                        });
formRegistry.add('droptarget',            { compClass: 'MLDropTarget',            template: droptarget_dot,            modelPathRule: 'prohibited'                                           });
formRegistry.add('text',                  { compClass: 'MLText',                  template: text_dot,                  modelPathRule: 'optional'                                             });
formRegistry.add('clear',                 {                                       template: clear_dot                                                                                        });


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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9CdXR0b24uanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvQ2hlY2tHcm91cC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21iby5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21ib0xpc3QuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvRGF0ZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Ecm9wVGFyZ2V0LmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0ZvbGRUcmVlLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0dyb3VwLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0h5cGVybGluay5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbWFnZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dExpc3QuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvTGlzdC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbVNpbXBsZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9SYWRpb0dyb3VwLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1NlbGVjdC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9TdXBlckNvbWJvLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1RleHQuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGV4dGFyZWEuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGltZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9XcmFwcGVyLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9BbGVydC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9ib290c3RyYXAvRGlhbG9nLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bi5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvZm9ybXMvRm9ybS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvZm9ybXMvZ2VuZXJhdG9yLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9mb3Jtcy9pdGVtX3R5cGVzLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9mb3Jtcy9yZWdpc3RyeS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvbWlsb191aS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvdXNlX2NvbXBvbmVudHMuanMiLCIvY2Mtc3JjL21pbG8tdWkvbm9kZV9tb2R1bGVzL2FzeW5jL2xpYi9hc3luYy5qcyIsIi9jYy1zcmMvbWlsby11aS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2ZzLmpzIiwiL2NjLXNyYy9taWxvLXVpL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDenBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTEJ1dHRvbiA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxCdXR0b24nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWJ1dHRvbidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEJ1dHRvbik7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxCdXR0b247XG5cbl8uZXh0ZW5kUHJvdG8oTUxCdXR0b24sIHtcbiAgICBkaXNhYmxlOiBNTEJ1dHRvbiRkaXNhYmxlLFxuICAgIGlzRGlzYWJsZWQ6IE1MQnV0dG9uJGlzRGlzYWJsZWRcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MQnV0dG9uJGRpc2FibGUoZGlzYWJsZSkge1xuICAgIHRoaXMuZWwuZGlzYWJsZWQgPSBkaXNhYmxlO1xufVxuXG5mdW5jdGlvbiBNTEJ1dHRvbiRpc0Rpc2FibGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMuZWwuZGlzYWJsZWQ7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIHVuaXF1ZUlkID0gbWlsby51dGlsLnVuaXF1ZUlkO1xuXG5cbnZhciBDSEVDS0VEX0NIQU5HRV9NRVNTQUdFID0gJ21sY2hlY2tncm91cGNoYW5nZSdcbiAgICAsIEVMRU1FTlRfTkFNRV9QUk9QRVJUWSA9ICdfbWxDaGVja0dyb3VwRWxlbWVudElEJ1xuICAgICwgRUxFTUVOVF9OQU1FX1BSRUZJWCA9ICdtbC1jaGVjay1ncm91cC0nO1xuXG52YXIgTUxDaGVja0dyb3VwID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTENoZWNrR3JvdXAnLCB7XG4gICAgZGF0YToge1xuICAgICAgICBzZXQ6IE1MQ2hlY2tHcm91cF9zZXQsXG4gICAgICAgIGdldDogTUxDaGVja0dyb3VwX2dldCxcbiAgICAgICAgZGVsOiBNTENoZWNrR3JvdXBfZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENIRUNLRURfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjbGljayc6IHsgc3Vic2NyaWJlcjogb25Hcm91cENsaWNrLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWNoZWNrLWdyb3VwJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICAne3t+IGl0LmNoZWNrT3B0aW9ucyA6b3B0aW9uIH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7eyMjZGVmLmVsSUQ6e3s9IGl0LmVsZW1lbnROYW1lIH19LXt7PSBvcHRpb24udmFsdWUgfX0jfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwie3s9IGl0Ll9yZW5kZXJPcHRpb25zLm9wdGlvbkNzc0NsYXNzIHx8IFwiJyArIEVMRU1FTlRfTkFNRV9QUkVGSVggKyAnb3B0aW9uXCIgfX1cIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJ7eyMgZGVmLmVsSUQgfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cInt7PSBvcHRpb24udmFsdWUgfX1cIiBuYW1lPVwie3s9IGl0LmVsZW1lbnROYW1lIH19XCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInt7IyBkZWYuZWxJRCB9fVwiPnt7PSBvcHRpb24ubGFiZWwgfX08L2xhYmVsPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiBcXFxuICAgICAgICAgICAgICAgICAgICB7e359fSBcXFxuICAgICAgICAgICAgICAgICAgICB7ez9pdC5fcmVuZGVyT3B0aW9ucy5zZWxlY3RBbGx9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAge3sjI2RlZi5hbGxJRDp7ez0gaXQuZWxlbWVudE5hbWUgfX0tYWxsI319IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIicgKyBFTEVNRU5UX05BTUVfUFJFRklYICsgJ2FsbFwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cInt7IyBkZWYuYWxsSUQgfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cImFsbFwiIG5hbWU9XCJhbGxcIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwie3sjIGRlZi5hbGxJRCB9fVwiPkFsbDwvbGFiZWw+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXG4gICAgICAgICAgICAgICAgICAgIHt7P319J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQ2hlY2tHcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxDaGVja0dyb3VwO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxDaGVja0dyb3VwLCB7XG4gICAgaW5pdDogTUxDaGVja0dyb3VwJGluaXQsXG4gICAgZGVzdHJveTogTUxDaGVja0dyb3VwJGRlc3Ryb3ksXG4gICAgc2V0U2VsZWN0QWxsOiBNTENoZWNrR3JvdXAkc2V0U2VsZWN0QWxsXG59KTtcblxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEluaXRpYWxpemUgcmFkaW8gZ3JvdXAgYW5kIHNldHVwXG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cCRpbml0KCkge1xuICAgIF8uZGVmaW5lUHJvcGVydHkodGhpcywgRUxFTUVOVF9OQU1FX1BST1BFUlRZLCBFTEVNRU5UX05BTUVfUFJFRklYICsgdW5pcXVlSWQoKSk7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucyA9IHt9O1xuICAgIHRoaXMuX2NoZWNrRWxzID0ge307XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gTUxDaGVja0dyb3VwJHNldFNlbGVjdEFsbChzZWxlY3RBbGwpIHtcbiAgICB0aGlzLl9yZW5kZXJPcHRpb25zLnNlbGVjdEFsbCA9IHNlbGVjdEFsbDtcbn1cblxuXG4vKipcbiAqIFNldHMgZ3JvdXAgdmFsdWVcbiAqIFJlcGxhY2VzIHRoZSBkYXRhIHNldCBvcGVyYXRpb24gdG8gZGVhbCB3aXRoIHJhZGlvIGJ1dHRvbnNcbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgc2V0XG4gKi9cbmZ1bmN0aW9uIE1MQ2hlY2tHcm91cF9zZXQodmFsdWVPYmopIHtcbiAgICBfLmVhY2hLZXkodGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCwga2V5KSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSAhIXZhbHVlT2JqW2tleV07XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBHZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXRyaWV2ZXMgdGhlIHNlbGVjdGVkIHZhbHVlIG9mIHRoZSBncm91cFxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gTUxDaGVja0dyb3VwX2dldCgpIHtcbiAgICByZXR1cm4gXy5tYXBLZXlzKHRoaXMuX2NoZWNrRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgcmV0dXJuIGVsLmNoZWNrZWQ7XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBEZWxldGVkIGdyb3VwIHZhbHVlXG4gKiBEZWxldGVzIHRoZSB2YWx1ZSBvZiB0aGUgZ3JvdXAsIHNldHRpbmcgaXQgdG8gZW1wdHlcbiAqL1xuZnVuY3Rpb24gTUxDaGVja0dyb3VwX2RlbCgpIHtcbiAgICBfLmVhY2hLZXkodGhpcy5fb3B0aW9uRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cblxuLyoqXG4gKiBNYW5hZ2UgcmFkaW8gY2hpbGRyZW4gY2xpY2tzXG4gKi9cbmZ1bmN0aW9uIG9uR3JvdXBDbGljayhldmVudFR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIGNsaWNrZWRFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIHZhciBjaGVja2JveExpc3QgPSB0aGlzLmNvbnRhaW5lci5zY29wZS5jaGVja2JveExpc3Q7XG5cbiAgICBpZiAoY2xpY2tlZEVsZW1lbnQudHlwZSAhPT0gJ2NoZWNrYm94JykgcmV0dXJuO1xuXG4gICAgaWYgKGNsaWNrZWRFbGVtZW50Lm5hbWUgPT09ICdhbGwnKSB7XG4gICAgICAgIF8uZWFjaEtleSh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsLCBrZXkpIHtcbiAgICAgICAgICAgIGVsLmNoZWNrZWQgPSBjbGlja2VkRWxlbWVudC5jaGVja2VkO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaXNDaGVja2VkID0gY2xpY2tlZEVsZW1lbnQuY2hlY2tlZCAmJiBpc0FsbEVsZW1lbnRDaGVja2VkLmNhbGwodGhpcyk7XG4gICAgICAgIHNldEFsbENoZWNrZWQuY2FsbCh0aGlzLCBpc0NoZWNrZWQpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBzZXRBbGxDaGVja2VkKGNoZWNrZWQpIHtcbiAgICBpZiAodGhpcy5fcmVuZGVyT3B0aW9ucy5zZWxlY3RBbGwpXG4gICAgICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImFsbFwiXScpLmNoZWNrZWQgPSBjaGVja2VkO1xufVxuXG5mdW5jdGlvbiBpc0FsbEVsZW1lbnRDaGVja2VkKGRhdGEpIHtcbiAgICByZXR1cm4gXy5ldmVyeUtleSh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsKSB7IHJldHVybiBlbC5jaGVja2VkOyB9KTtcbn1cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENIRUNLRURfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5cbi8vIFNldCByYWRpbyBidXR0b24gY2hpbGRyZW4gb24gbW9kZWwgY2hhbmdlXG5mdW5jdGlvbiBvbk9wdGlvbnNDaGFuZ2UocGF0aCwgZGF0YSkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKHtcbiAgICAgICAgY2hlY2tPcHRpb25zOiB0aGlzLm1vZGVsLmdldCgpLFxuICAgICAgICBlbGVtZW50TmFtZTogdGhpc1tFTEVNRU5UX05BTUVfUFJPUEVSVFldLFxuICAgICAgICBfcmVuZGVyT3B0aW9uczogdGhpcy5fcmVuZGVyT3B0aW9uc1xuICAgIH0pO1xuXG4gICAgdGhpcy5fY2hlY2tFbHMgPSB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXy5mb3JFYWNoKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyksIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBpZiAoZWwubmFtZSAhPSAnYWxsJykgc2VsZi5fY2hlY2tFbHNbZWwudmFsdWVdID0gZWw7XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gTUxDaGVja0dyb3VwJGRlc3Ryb3koKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NoZWNrRWxzO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgQ09NQk9fQ0hBTkdFX01FU1NBR0UgPSAnbWxjb21ib2NoYW5nZSc7XG5cbnZhciBEQVRBTElTVF9URU1QTEFURSA9ICd7e34gaXQuY29tYm9PcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwie3s9IG9wdGlvbi5sYWJlbCB9fVwiPjwvb3B0aW9uPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19JztcblxudmFyIE1MQ29tYm8gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQ29tYm8nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MQ29tYm9fZ2V0LFxuICAgICAgICBzZXQ6IE1MQ29tYm9fc2V0LFxuICAgICAgICBkZWw6IE1MQ29tYm9fZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWRhdGFsaXN0J1xuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQ29tYm8pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQ29tYm87XG5cblxuXy5leHRlbmRQcm90byhNTENvbWJvLCB7XG4gICAgaW5pdDogTUxDb21ibyRpbml0XG59KTtcblxuXG5mdW5jdGlvbiBNTENvbWJvJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vbignY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAnX2NvbWJvSW5wdXQnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5pbnB1dCxcbiAgICAgICAgJ19jb21ib0xpc3QnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5kYXRhbGlzdFxuICAgIH0pO1xuXG4gICAgdGhpcy5fY29tYm9MaXN0LnRlbXBsYXRlLnNldChEQVRBTElTVF9URU1QTEFURSk7XG5cbiAgICB0aGlzLl9jb21ib0lucHV0LmRhdGEub24oJ2lucHV0JyxcbiAgICAgICAgeyBzdWJzY3JpYmVyOiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UsIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9fZ2V0KCkge1xuICAgIGlmICghIHRoaXMuX2NvbWJvSW5wdXQpIHJldHVybjtcbiAgICByZXR1cm4gdGhpcy5fY29tYm9JbnB1dC5kYXRhLmdldCgpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvX3NldCh2YWx1ZSkge1xuICAgIHJldHVybiBjaGFuZ2VDb21ib0RhdGEuY2FsbCh0aGlzLCAnc2V0JywgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvX2RlbCgpIHtcbiAgICByZXR1cm4gY2hhbmdlQ29tYm9EYXRhLmNhbGwodGhpcywgJ2RlbCcsIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlQ29tYm9EYXRhKG1ldGhvZCwgdmFsdWUpIHtcbiAgICBpZiAoISB0aGlzLl9jb21ib0lucHV0KSByZXR1cm47XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NvbWJvSW5wdXQuZGF0YVttZXRob2RdKHZhbHVlKTtcbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbi8vIFBvc3QgdGhlIGRhdGEgY2hhbmdlXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19DSEFOR0VfTUVTU0FHRSk7XG59XG5cbmZ1bmN0aW9uIG9uT3B0aW9uc0NoYW5nZShtc2csIGRhdGEpIHtcbiAgICB0aGlzLl9jb21ib0xpc3QudGVtcGxhdGUucmVuZGVyKHtcbiAgICAgICAgY29tYm9PcHRpb25zOiB0aGlzLm1vZGVsLmdldCgpXG4gICAgfSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxudmFyIENPTUJPX0xJU1RfQ0hBTkdFX01FU1NBR0UgPSAnbWxjb21ib2xpc3RjaGFuZ2UnO1xuXG5cbnZhciBNTENvbWJvTGlzdCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxDb21ib0xpc3QnLCB7XG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWNvbWJvLWxpc3QnXG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxDb21ib0xpc3RfZ2V0LFxuICAgICAgICBzZXQ6IE1MQ29tYm9MaXN0X3NldCxcbiAgICAgICAgZGVsOiBNTENvbWJvTGlzdF9kZWwsXG4gICAgICAgIGV2ZW50OiBDT01CT19MSVNUX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25JdGVtc0NoYW5nZSwgY29udGV4dDogJ293bmVyJ31cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IG1sLWJpbmQ9XCJNTFN1cGVyQ29tYm86Y29tYm9cIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdDpsaXN0XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0SXRlbTppdGVtXCIgY2xhc3M9XCJsaXN0LWl0ZW1cIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltkYXRhXTpsYWJlbFwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltldmVudHNdOmRlbGV0ZUJ0blwiIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj4nXG4gICAgfVxufSk7XG5cblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTENvbWJvTGlzdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxDb21ib0xpc3Q7XG5cblxuXy5leHRlbmRQcm90byhNTENvbWJvTGlzdCwge1xuICAgIGluaXQ6IE1MQ29tYm9MaXN0JGluaXQsXG4gICAgc2V0T3B0aW9uczogTUxDb21ib0xpc3Qkc2V0T3B0aW9ucyxcbiAgICBzZXREYXRhVmFsaWRhdGlvbjogTUxDb21ib0xpc3Qkc2V0RGF0YVZhbGlkYXRpb24sXG4gICAgdG9nZ2xlQWRkQnV0dG9uOiBNTENvbWJvTGlzdCR0b2dnbGVBZGRCdXR0b24sXG4gICAgZGVzdHJveTogTUxDb21ib0xpc3QkZGVzdHJveSxcbiAgICBzZXRBZGRJdGVtUHJvbXB0OiBNTENvbWJvTGlzdCRzZXRBZGRJdGVtUHJvbXB0LFxuICAgIGNsZWFyQ29tYm9JbnB1dCA6IE1MQ29tYm9MaXN0JGNsZWFyQ29tYm9JbnB1dFxufSk7XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3QkaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm1vZGVsLnNldChbXSk7XG4gICAgdGhpcy5vbmNlKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRzZXREYXRhVmFsaWRhdGlvbihkYXRhVmFsaWRhdGlvbikge1xuICAgIGNoZWNrKGRhdGFWYWxpZGF0aW9uLCBNYXRjaC5PcHRpb25hbChGdW5jdGlvbikpO1xuICAgIHRoaXMuX2RhdGFWYWxpZGF0aW9uID0gZGF0YVZhbGlkYXRpb247XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHNldE9wdGlvbnMoYXJyKSB7XG4gICAgdGhpcy5fY29tYm8uc2V0T3B0aW9ucyhhcnIpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JGNsZWFyQ29tYm9JbnB1dCAoKSB7XG4gICAgdGhpcy5fY29tYm8uY2xlYXJDb21ib0lucHV0KCk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgYWRkIGJ1dHRvblxuICogQHBhcmFtIHtCb29sZWFufSBzaG93XG4gKi9cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHRvZ2dsZUFkZEJ1dHRvbihzaG93KSB7XG4gICAgdGhpcy5fY29tYm8udG9nZ2xlQWRkQnV0dG9uKHNob3cpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHNldEFkZEl0ZW1Qcm9tcHQocHJvbXB0KSB7XG4gICB0aGlzLl9jb21iby5zZXRBZGRJdGVtUHJvbXB0KHByb21wdCk7XG59XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3QkZGVzdHJveSgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgJiYgbWlsby5taW5kZXIuZGVzdHJveUNvbm5lY3Rvcih0aGlzLl9jb25uZWN0b3IpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG59XG5cblxuZnVuY3Rpb24gb25DaGlsZHJlbkJvdW5kKCkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKCkuYmluZGVyKCk7XG4gICAgY29tcG9uZW50U2V0dXAuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50U2V0dXAoKSB7XG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgJ19jb21ibyc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmNvbWJvLFxuICAgICAgICAnX2xpc3QnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5saXN0XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jb25uZWN0b3IgPSBtaWxvLm1pbmRlcih0aGlzLl9saXN0Lm1vZGVsLCAnPDw8LT4+PicsIHRoaXMubW9kZWwpO1xuICAgIHRoaXMuX2NvbWJvLmRhdGEub24oJycsIHsgc3Vic2NyaWJlcjogb25Db21ib0NoYW5nZSwgY29udGV4dDogdGhpcyB9KTtcbiAgICB0aGlzLl9jb21iby5vbignYWRkaXRlbScsIHsgc3Vic2NyaWJlcjogb25BZGRJdGVtLCBjb250ZXh0OiB0aGlzIH0pO1xufVxuXG5mdW5jdGlvbiBvbkNvbWJvQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIGlmIChkYXRhLm5ld1ZhbHVlICYmIHJ1bkRhdGFWYWxpZGF0aW9uLmNhbGwodGhpcywgbXNnLCBkYXRhKSlcbiAgICAgICAgdGhpcy5fbGlzdC5tb2RlbC5wdXNoKGRhdGEubmV3VmFsdWUpO1xuICAgIHRoaXMuX2NvbWJvLmRhdGEuZGVsKCk7XG4gICAgLy8gYmVjYXVzZSBvZiBzdXBlcmNvbWJvIGxpc3RlbmVycyBvZmYgeW91IGhhdmUgdG8gc2V0IF92YWx1ZSBleHBsaWNpdGx5XG4gICAgdGhpcy5fY29tYm8uZGF0YS5fdmFsdWUgPSAnJztcbn1cblxuZnVuY3Rpb24gcnVuRGF0YVZhbGlkYXRpb24obXNnLCBkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWYWxpZGF0aW9uIFxuICAgICAgICA/IHRoaXMuX2RhdGFWYWxpZGF0aW9uKG1zZywgZGF0YSwgdGhpcy5fbGlzdC5tb2RlbC5nZXQoKSlcbiAgICAgICAgOiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvbkl0ZW1zQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoQ09NQk9fTElTVF9DSEFOR0VfTUVTU0FHRSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0X2dldCgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgPyBfLmNsb25lKHZhbHVlKSA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdF9zZXQodmFsdWUpIHtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0X2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5zZXQoW10pO1xufVxuXG5cbmZ1bmN0aW9uIG9uQWRkSXRlbShtc2csIGRhdGEpIHtcbiAgICB0aGlzLnBvc3RNZXNzYWdlKCdhZGRpdGVtJywgZGF0YSk7XG4gICAgdGhpcy5ldmVudHMucG9zdE1lc3NhZ2UoJ21pbG9fY29tYm9saXN0YWRkaXRlbScsIGRhdGEpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIE1MRGF0ZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxEYXRlJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTERhdGVfZ2V0LFxuICAgICAgICBzZXQ6IE1MRGF0ZV9zZXQsXG4gICAgICAgIGRlbDogTUxEYXRlX2RlbCxcbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1kYXRlJ1xuICAgIH1cbn0pO1xuXG5fLmV4dGVuZFByb3RvKE1MRGF0ZSwge1xuICAgIGdldE1pbjogTUxEYXRlJGdldE1pbixcbiAgICBzZXRNaW46IE1MRGF0ZSRzZXRNaW4sXG4gICAgZ2V0TWF4OiBNTERhdGUkZ2V0TWF4LFxuICAgIHNldE1heDogTUxEYXRlJHNldE1heFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxEYXRlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTERhdGU7XG5cblxuZnVuY3Rpb24gTUxEYXRlJGdldE1pbigpIHtcbiAgICByZXR1cm4gXy5kYXRlKHRoaXMuZWwubWluKTtcbn1cblxuXG5mdW5jdGlvbiBNTERhdGUkc2V0TWluKHZhbHVlKSB7XG4gICAgdmFyIGRhdGUgPSBfLnRvRGF0ZSh2YWx1ZSk7XG5cbiAgICB0aGlzLmVsLm1pbiA9IGRhdGUgPyB0b0lTTzg2MDFGb3JtYXQoZGF0ZSkgOiAnJztcbn1cblxuXG5mdW5jdGlvbiBNTERhdGUkZ2V0TWF4KCkge1xuICAgIHJldHVybiBfLmRhdGUodGhpcy5lbC5tYXgpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZSRzZXRNYXgodmFsdWUpIHtcbiAgICB2YXIgZGF0ZSA9IF8udG9EYXRlKHZhbHVlKTtcblxuICAgIHRoaXMuZWwubWF4ID0gZGF0ZSA/IHRvSVNPODYwMUZvcm1hdChkYXRlKSA6ICcnO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZV9nZXQoKSB7XG4gICAgcmV0dXJuIF8udG9EYXRlKHRoaXMuZWwudmFsdWUpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZV9zZXQodmFsdWUpIHtcbiAgICB2YXIgZGF0ZSA9IF8udG9EYXRlKHZhbHVlKTtcblxuICAgIHRoaXMuZWwudmFsdWUgPSBkYXRlID8gdG9JU084NjAxRm9ybWF0KGRhdGUpIDogJyc7XG5cbiAgICBkaXNwYXRjaElucHV0TWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBNTERhdGVfZGVsKCkge1xuICAgIHRoaXMuZWwudmFsdWUgPSAnJztcblxuICAgIGRpc3BhdGNoSW5wdXRNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cblxuZnVuY3Rpb24gZGlzcGF0Y2hJbnB1dE1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZSgnaW5wdXQnKTsgLy8gRGlzcGF0Y2ggdGhlICdpbnB1dCcgKHVzdWFsbHkgZGlzcGF0Y2hlZCBieSB0aGUgdW5kZXJseWluZyA8aW5wdXQ+IGVsZW1lbnQpIGV2ZW50IHNvIHRoYXQgdGhlIGRhdGEgY2hhbmdlIGNhbiBiZSBsaXN0ZW5lZCB0b1xufVxuXG5cbmZ1bmN0aW9uIHRvSVNPODYwMUZvcm1hdChkYXRlKSB7XG4gICAgdmFyIGRhdGVBcnIgPSBbXG4gICAgICAgIGRhdGUuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgcGFkKGRhdGUuZ2V0TW9udGgoKSArIDEpLFxuICAgICAgICBwYWQoZGF0ZS5nZXREYXRlKCkpXG4gICAgXTtcblxuICAgIHZhciBkYXRlU3RyID0gZGF0ZUFyci5qb2luKCctJyk7XG5cbiAgICByZXR1cm4gZGF0ZVN0cjtcblxuICAgIGZ1bmN0aW9uIHBhZChuKSB7IHJldHVybiBuIDwgMTAgPyAnMCcgKyBuIDogbjsgfVxufSIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxEcm9wVGFyZ2V0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTERyb3BUYXJnZXQnLCBbJ2Ryb3AnXSk7XG5cblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERyb3BUYXJnZXQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRHJvcFRhcmdldDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRvVCA9IG1pbG8udXRpbC5kb1RcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIHVuaXF1ZUlkID0gbWlsby51dGlsLnVuaXF1ZUlkO1xuXG52YXIgVFJFRV9URU1QTEFURSA9ICc8dWwgY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1saXN0XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7fiBpdC5kYXRhLml0ZW1zIDppdGVtOmluZGV4IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyB2YXIgaGFzU3ViVHJlZSA9IGl0ZW0uaXRlbXMgJiYgaXRlbS5pdGVtcy5sZW5ndGg7IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkge3s/IGhhc1N1YlRyZWUgfX1jbGFzcz1cIm1sLXVpLWZvbGR0cmVlLS1oYXMtbXVsdGlwbGVcInt7P319PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1pdGVtXCIgZGF0YS1pdGVtLWlkPVwie3s9IGl0Lml0ZW1JRHNbaW5kZXhdIH19XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PyBoYXNTdWJUcmVlIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWwtdWktZm9sZHRyZWUtYnV0dG9uXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PSBpdC5pdGVtVGVtcGxhdGUoeyBpdGVtOiBpdGVtIH0pIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGhhc1N1YlRyZWUgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s9IGl0LnRyZWVUZW1wbGF0ZShpdGVtKSB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e359fVxcXG4gICAgICAgICAgICAgICAgICAgIDwvdWw+JztcblxudmFyIERFRkFVTFRfQ09NUElMRURfSVRFTV9URU1QTEFURSA9IGRvVC5jb21waWxlKCdcXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1sYWJlbFwiPlxcXG4gICAgICAgICAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWwgfX1cXFxuICAgICAgICAgICAgPC9zcGFuPicpXG4gICAgLCBDT01QSUxFRF9UUkVFX1RFTVBMQVRFID0gZG9ULmNvbXBpbGUoVFJFRV9URU1QTEFURSk7XG5cblxudmFyIE1MRm9sZFRyZWUgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRm9sZFRyZWUnLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnY2xpY2sgZGJsY2xpY2snOiB7IHN1YnNjcmliZXI6IG9uSXRlbUV2ZW50LCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWZvbGR0cmVlLW1haW4nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxGb2xkVHJlZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxGb2xkVHJlZTtcblxuXy5leHRlbmRQcm90byhNTEZvbGRUcmVlLCB7XG4gICAgc2V0SXRlbVRlbXBsYXRlOiBNTEZvbGRUcmVlJHNldEl0ZW1UZW1wbGF0ZSxcbiAgICByZW5kZXJUcmVlOiBNTEZvbGRUcmVlJHJlbmRlclRyZWUsXG4gICAgc2V0QWN0aXZlSXRlbTogTUxGb2xkVHJlZSRzZXRBY3RpdmVJdGVtLFxuICAgIHRvZ2dsZUl0ZW06IE1MRm9sZFRyZWUkdG9nZ2xlSXRlbVxufSk7XG5cbmZ1bmN0aW9uIGZvbGRVbmZvbGQoZWwsIG9wZW5lZCkge1xuICAgIGlmIChvcGVuZWQpXG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ21sLXVpLWZvbGR0cmVlLS11bmZvbGQnLCBvcGVuZWQpO1xuICAgIGVsc2VcbiAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnbWwtdWktZm9sZHRyZWUtLXVuZm9sZCcpO1xufVxuXG5mdW5jdGlvbiBpdGVtTWVzc2FnZShtc2csIGVsKSB7XG4gICAgdmFyIGlkID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWl0ZW0taWQnKVxuICAgICAgICAsIGl0ZW0gPSB0aGlzLl9pdGVtc01hcFtpZF07XG5cbiAgICB0aGlzLnBvc3RNZXNzYWdlKCdtbGZvbGR0cmVlXycgKyBtc2csIHtcbiAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgZWw6IGVsXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uSXRlbUV2ZW50KG1zZywgZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ21sLXVpLWZvbGR0cmVlLWJ1dHRvbicpKVxuICAgICAgICBmb2xkVW5mb2xkKGVsLnBhcmVudE5vZGUucGFyZW50Tm9kZSk7XG4gICAgZWxzZSBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdtbC11aS1mb2xkdHJlZS1sYWJlbCcpKVxuICAgICAgICBpdGVtTWVzc2FnZS5jYWxsKHRoaXMsIG1zZywgZWwucGFyZW50Tm9kZSk7XG4gICAgZWxzZSByZXR1cm47XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbn1cblxuZnVuY3Rpb24gTUxGb2xkVHJlZSRzZXRJdGVtVGVtcGxhdGUgKHRlbXBsYXRlU3RyKSB7XG4gICAgdGhpcy5faXRlbVRlbXBsYXRlID0gZG9ULmNvbXBpbGUodGVtcGxhdGVTdHIpO1xufVxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHJlbmRlclRyZWUgKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gICAgc2VsZi5faXRlbXNNYXAgPSB7fTtcbiAgICB0aGlzLmVsLmlubmVySFRNTCA9IF9yZW5kZXJUcmVlKGRhdGEpO1xuXG4gICAgZnVuY3Rpb24gX3JlbmRlclRyZWUgKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEuaXRlbXMpXG4gICAgICAgICAgICB2YXIgaXRlbXNJRHMgPSBfLm1hcChkYXRhLml0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gaXRlbS5pZCB8fCB1bmlxdWVJZCgpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9pdGVtc01hcFtpZF0pIHRocm93IG5ldyBFcnJvcignTUxGb2xkVHJlZTogaXRlbSBoYXMgZHVwbGljYXRlIElEOicgKyBpZCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXRlbXNNYXBbaWRdID0gaXRlbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gQ09NUElMRURfVFJFRV9URU1QTEFURSh7XG4gICAgICAgICAgICBpdGVtSURzOiBpdGVtc0lEcyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBpdGVtVGVtcGxhdGU6IHNlbGYuX2l0ZW1UZW1wbGF0ZSB8fCBERUZBVUxUX0NPTVBJTEVEX0lURU1fVEVNUExBVEUsXG4gICAgICAgICAgICB0cmVlVGVtcGxhdGU6IF9yZW5kZXJUcmVlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHNldEFjdGl2ZUl0ZW0oaWQsIGNzc0NsYXNzKSB7XG4gICAgY3NzQ2xhc3MgPSBjc3NDbGFzcyB8fCAnbWwtdWktZm9sZHRyZWUtYWN0aXZlJztcbiAgICB2YXIgaXRlbXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5tbC11aS1mb2xkdHJlZS1pdGVtJyk7XG4gICAgXy5mb3JFYWNoKGl0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShjc3NDbGFzcyk7XG4gICAgfSk7XG4gICAgaWYgKGlkKSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdkaXYubWwtdWktZm9sZHRyZWUtaXRlbVtkYXRhLWl0ZW0taWQ9XCInICsgaWQgKyAnXCJdJyk7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZChjc3NDbGFzcyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHRvZ2dsZUl0ZW0oaWQsIG9wZW5lZCkge1xuICAgIHZhciBpdGVtID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdkaXYubWwtdWktZm9sZHRyZWUtaXRlbVtkYXRhLWl0ZW0taWQ9XCInICsgaWQgKyAnXCJdJyk7XG4gICAgZm9sZFVuZm9sZChpdGVtLnBhcmVudE5vZGUsIG9wZW5lZCk7XG59XG5cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxHcm91cCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxHcm91cCcsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWdyb3VwJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MR3JvdXA7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTEh5cGVybGluayA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxIeXBlcmxpbmsnLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1oeXBlcmxpbmsnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxIeXBlcmxpbmspO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSHlwZXJsaW5rO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgSU1BR0VfQ0hBTkdFX01FU1NBR0UgPSAnbWxpbWFnZWNoYW5nZSc7XG5cbnZhciBNTEltYWdlID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEltYWdlJywge1xuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTEltYWdlX3NldCxcbiAgICAgICAgZ2V0OiBNTEltYWdlX2dldCxcbiAgICAgICAgZGVsOiBNTEltYWdlX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBJTUFHRV9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcuc3JjJzogeyBzdWJzY3JpYmVyOiBvbk1vZGVsQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIHRhZ05hbWU6ICdpbWcnLFxuICAgICAgICBjbHM6ICdtbC11aS1pbWFnZSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEltYWdlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEltYWdlO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxJbWFnZSwge1xuICAgIGluaXQ6IE1MSW1hZ2UkaW5pdFxufSk7XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXplIHJhZGlvIGdyb3VwIGFuZCBzZXR1cFxuICovXG5mdW5jdGlvbiBNTEltYWdlJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuLyoqXG4gKiBTZXRzIGltYWdlIHZhbHVlXG4gKiBSZXBsYWNlcyB0aGUgZGF0YSBzZXQgb3BlcmF0aW9uIHRvIGRlYWwgd2l0aCByYWRpbyBidXR0b25zXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGJlIHNldFxuICovXG5mdW5jdGlvbiBNTEltYWdlX3NldCh2YWx1ZSkge1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cblxuLyoqXG4gKiBHZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXRyaWV2ZXMgdGhlIHNlbGVjdGVkIHZhbHVlIG9mIHRoZSBncm91cFxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gTUxJbWFnZV9nZXQoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5tb2RlbC5nZXQoKTtcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnID8gXy5jbG9uZSh2YWx1ZSkgOiB2YWx1ZTtcbn1cblxuXG4vKipcbiAqIERlbGV0ZWQgZ3JvdXAgdmFsdWVcbiAqIERlbGV0ZXMgdGhlIHZhbHVlIG9mIHRoZSBncm91cCwgc2V0dGluZyBpdCB0byBlbXB0eVxuICovXG5mdW5jdGlvbiBNTEltYWdlX2RlbCgpIHtcbiAgICB0aGlzLm1vZGVsLmRlbCgpO1xufVxuXG5cbi8vIFBvc3QgdGhlIGRhdGEgY2hhbmdlXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShJTUFHRV9DSEFOR0VfTUVTU0FHRSk7XG59XG5cblxuZnVuY3Rpb24gb25Nb2RlbENoYW5nZShwYXRoLCBkYXRhKSB7XG4gICAgdGhpcy5lbC5zcmMgPSBkYXRhLm5ld1ZhbHVlO1xuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxJbnB1dCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxJbnB1dCcsIHtcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWlucHV0J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MSW5wdXQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSW5wdXQ7XG5cbl8uZXh0ZW5kUHJvdG8oTUxJbnB1dCwge1xuICAgIGRpc2FibGU6IE1MSW5wdXQkZGlzYWJsZSxcbiAgICBpc0Rpc2FibGVkOiBNTElucHV0JGlzRGlzYWJsZWQsXG4gICAgc2V0TWF4TGVuZ3RoOiBNTElucHV0JHNldE1heExlbmd0aFxufSk7XG5cbmZ1bmN0aW9uIE1MSW5wdXQkZGlzYWJsZShkaXNhYmxlKSB7XG4gICAgdGhpcy5lbC5kaXNhYmxlZCA9IGRpc2FibGU7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXQkaXNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLmVsLmRpc2FibGVkO1xufVxuXG5mdW5jdGlvbiBNTElucHV0JHNldE1heExlbmd0aChsZW5ndGgpIHtcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnbWF4bGVuZ3RoJywgbGVuZ3RoKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cbnZhciBJTlBVVF9MSVNUX0NIQU5HRV9NRVNTQUdFID0gJ21saW5wdXRsaXN0Y2hhbmdlJztcblxudmFyIGFzeW5jSGFuZGxlciA9IGZ1bmN0aW9uICh2YWx1ZSwgY2FsbGJhY2spIHtjYWxsYmFjayh2YWx1ZSk7fTtcblxudmFyIE1MSW5wdXRMaXN0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTElucHV0TGlzdCcsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktaW5wdXQtbGlzdCdcbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTElucHV0TGlzdF9nZXQsXG4gICAgICAgIHNldDogTUxJbnB1dExpc3Rfc2V0LFxuICAgICAgICBkZWw6IE1MSW5wdXRMaXN0X2RlbCxcbiAgICAgICAgc3BsaWNlOiBNTElucHV0TGlzdF9zcGxpY2UsXG4gICAgICAgIGV2ZW50OiBJTlBVVF9MSVNUX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25JdGVtc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnXFxcbiAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdDpsaXN0XCI+XFxcbiAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJNTExpc3RJdGVtOml0ZW1cIiBjbGFzcz1cImxpc3QtaXRlbVwiPlxcXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIG1sLWJpbmQ9XCJbZGF0YV06bGFiZWxcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltldmVudHNdOmRlbGV0ZUJ0blwiIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG1sLWJpbmQ9XCJNTElucHV0OmlucHV0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cXFxuICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiTUxCdXR0b246YnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIj5cXFxuICAgICAgICAgICAgICAgIEFkZFxcXG4gICAgICAgICAgICA8L2J1dHRvbj4nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxJbnB1dExpc3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSW5wdXRMaXN0O1xuXG5fLmV4dGVuZFByb3RvKE1MSW5wdXRMaXN0LCB7XG4gICAgaW5pdDogTUxJbnB1dExpc3QkaW5pdCxcbiAgICBzZXRBc3luYzogTUxJbnB1dExpc3Qkc2V0QXN5bmMsXG4gICAgc2V0UGxhY2VIb2xkZXI6IE1MSW5wdXRMaXN0JHNldFBsYWNlSG9sZGVyLFxuICAgIGRlc3Ryb3k6IE1MSW5wdXRMaXN0JGRlc3Ryb3lcbn0pO1xuXG5mdW5jdGlvbiBNTElucHV0TGlzdCRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub25jZSgnY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG4gICAgdGhpcy5tb2RlbC5zZXQoW10pO1xufVxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgcmVuZGVyLmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JHNldFBsYWNlSG9sZGVyKHBsYWNlSG9sZGVyKSB7XG4gICAgdGhpcy5faW5wdXQuZWwuc2V0QXR0cmlidXRlKCdwbGFjZUhvbGRlcicsIHBsYWNlSG9sZGVyKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Qkc2V0QXN5bmMobmV3SGFuZGxlcikge1xuICAgIGFzeW5jSGFuZGxlciA9IG5ld0hhbmRsZXIgfHwgYXN5bmNIYW5kbGVyO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdCRkZXN0cm95KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciAmJiBtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKHRoaXMuX2Nvbm5lY3Rvcik7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKCkuYmluZGVyKCk7XG4gICAgY29tcG9uZW50U2V0dXAuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50U2V0dXAoKSB7XG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgJ19pbnB1dCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmlucHV0LFxuICAgICAgICAnX2J1dHRvbic6IHRoaXMuY29udGFpbmVyLnNjb3BlLmJ1dHRvbixcbiAgICAgICAgJ19saXN0JzogdGhpcy5jb250YWluZXIuc2NvcGUubGlzdFxuICAgIH0pO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG1pbG8ubWluZGVyKHRoaXMuX2xpc3QubW9kZWwsICc8PDwtPj4+JywgdGhpcy5tb2RlbCk7XG4gICAgdGhpcy5fYnV0dG9uLmV2ZW50cy5vbignY2xpY2snLCB7c3Vic2NyaWJlcjogb25DbGljaywgY29udGV4dDogdGhpcyB9KTsgICBcbn1cblxuZnVuY3Rpb24gb25DbGljayhtc2cpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLl9pbnB1dC5kYXRhLmdldCgwKTtcbiAgICBpZiAodGhpcy5faW5wdXQuZGF0YSlcbiAgICAgICAgYXN5bmNIYW5kbGVyKHZhbHVlLCBmdW5jdGlvbiAobGFiZWwsIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0Lm1vZGVsLnB1c2goeyBsYWJlbDogbGFiZWwsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9pbnB1dC5kYXRhLmRlbCgpO1xufVxuXG5mdW5jdGlvbiBvbkl0ZW1zQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoSU5QVVRfTElTVF9DSEFOR0VfTUVTU0FHRSk7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0X2dldCgpIHtcbiAgICB2YXIgbW9kZWwgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiBtb2RlbCA/IF8uY2xvbmUobW9kZWwpIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdF9zZXQodmFsdWUpIHtcbiAgICB0aGlzLm1vZGVsLnNldCh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0X2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5zZXQoW10pO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdF9zcGxpY2UoKSB7IC8vIC4uLiBhcmd1bWVudHNcbiAgICB0aGlzLm1vZGVsLnNwbGljZS5hcHBseSh0aGlzLm1vZGVsLCBhcmd1bWVudHMpO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1MTGlzdCA9IG1vZHVsZS5leHBvcnRzID0gbWlsby5jcmVhdGVDb21wb25lbnRDbGFzcyh7XG4gICAgY2xhc3NOYW1lOiAnTUxMaXN0JyxcbiAgICBmYWNldHM6IHtcbiAgICAgICAgZG9tOiB7XG4gICAgICAgICAgICBjbHM6ICdtbC11aS1saXN0J1xuICAgICAgICB9LFxuICAgICAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgICAgICBtb2RlbDogdW5kZWZpbmVkLFxuICAgICAgICBsaXN0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIG1ldGhvZHM6IHtcbiAgICAgICAgaW5pdDogTUxMaXN0JGluaXQsXG4gICAgICAgIGRlc3Ryb3k6IE1MTGlzdCRkZXN0cm95LFxuICAgICAgICByZW1vdmVJdGVtOiBNTExpc3QkcmVtb3ZlSXRlbSxcbiAgICAgICAgbW92ZUl0ZW06IE1MTGlzdCRtb3ZlSXRlbVxuICAgIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIE1MTGlzdCRpbml0KCkge1xuICAgIE1MTGlzdC5zdXBlci5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vbignY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0JGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fY29ubmVjdG9yICYmIG1pbG8ubWluZGVyLmRlc3Ryb3lDb25uZWN0b3IodGhpcy5fY29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xuICAgIE1MTGlzdC5zdXBlci5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0JHJlbW92ZUl0ZW0oaW5kZXgpe1xuICAgIHRoaXMubW9kZWwuc3BsaWNlKGluZGV4LCAxKTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3QkbW92ZUl0ZW0oZnJvbSwgdG8pIHtcbiAgICB2YXIgc3BsaWNlZERhdGEgPSB0aGlzLm1vZGVsLnNwbGljZShmcm9tLCAxKTtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5zcGxpY2UodG8sIDAsIHNwbGljZWREYXRhWzBdKTtcbn1cblxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQoW10pO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG1pbG8ubWluZGVyKHRoaXMubW9kZWwsICc8PDwtJywgdGhpcy5kYXRhKS5kZWZlckNoYW5nZU1vZGUoJzw8PC0+Pj4nKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERyYWdEcm9wID0gbWlsby51dGlsLmRyYWdEcm9wO1xuXG52YXIgTUxMaXN0SXRlbSA9IG1vZHVsZS5leHBvcnRzID0gbWlsby5jcmVhdGVDb21wb25lbnRDbGFzcyh7XG4gICAgY2xhc3NOYW1lOiAnTUxMaXN0SXRlbScsXG4gICAgc3VwZXJDbGFzc05hbWU6ICdNTExpc3RJdGVtU2ltcGxlJyxcbiAgICBmYWNldHM6IHtcbiAgICAgICAgZHJhZzoge1xuICAgICAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICAgICAnZHJhZ3N0YXJ0JzogeyBzdWJzY3JpYmVyOiBvbkRyYWdTdGFydCwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgICAgIHBhcmFtczogJ2dldE1ldGFEYXRhJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcm9wOiB7XG4gICAgICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgICAgICdkcmFnZW50ZXInOiB7IHN1YnNjcmliZXI6IG9uRHJhZ0hvdmVyLCBjb250ZXh0OiAnb3duZXInIH0sXG4gICAgICAgICAgICAgICAgJ2RyYWdvdmVyJzogeyBzdWJzY3JpYmVyOiBvbkRyYWdIb3ZlciwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgICAgICdkcmFnbGVhdmUnOiB7IHN1YnNjcmliZXI6IG9uRHJhZ091dCwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgICAgICdkcm9wJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1Ecm9wLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbGxvdzoge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGlzQ29tcG9uZW50QWxsb3dlZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICAgIGluaXQ6IE1MTGlzdEl0ZW0kaW5pdCxcbiAgICAgICAgbW92ZUl0ZW06IE1MTGlzdEl0ZW0kbW92ZUl0ZW0sXG4gICAgICAgIHJlbW92ZUl0ZW06IE1MTGlzdEl0ZW0kcmVtb3ZlSXRlbSxcbiAgICAgICAgZ2V0TWV0YURhdGE6IE1MTGlzdEl0ZW0kZ2V0TWV0YURhdGEsXG4gICAgICAgIGlzRHJvcEFsbG93ZWQ6IE1MTGlzdEl0ZW0kaXNEcm9wQWxsb3dlZFxuICAgIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kaW5pdCgpIHtcbiAgICBNTExpc3RJdGVtLnN1cGVyLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdmFyIGRlbGV0ZUJ0biA9IHRoaXMuY29udGFpbmVyLnNjb3BlLmRlbGV0ZUJ0bjtcbiAgICBkZWxldGVCdG4gJiYgZGVsZXRlQnRuLmV2ZW50cy5vbignY2xpY2snLCB7IHN1YnNjcmliZXI6IHRoaXMucmVtb3ZlSXRlbSwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtJHJlbW92ZUl0ZW0oKSB7XG4gICAgdHJ5IHsgdmFyIGxpc3RPd25lciA9IHRoaXMuaXRlbS5saXN0Lm93bmVyOyB9IGNhdGNoKGUpIHt9XG4gICAgbGlzdE93bmVyICYmIGxpc3RPd25lci5yZW1vdmVJdGVtKHRoaXMuaXRlbS5pbmRleCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRtb3ZlSXRlbShpbmRleCkge1xuICAgIHZhciBsaXN0T3duZXIgPSB0aGlzLml0ZW0ubGlzdC5vd25lcjtcbiAgICBsaXN0T3duZXIgJiYgbGlzdE93bmVyLm1vdmVJdGVtKHRoaXMuaXRlbS5pbmRleCwgaW5kZXgpO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kaXNEcm9wQWxsb3dlZChtZXRhLyosIGRyYWdEcm9wKi8pe1xuICAgIHZhciBDb21wb25lbnQgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHMuZ2V0KG1ldGEuY29tcENsYXNzKTtcblxuICAgIHJldHVybiBtZXRhLnBhcmFtcyAmJiBtZXRhLnBhcmFtcy5pbmRleFxuICAgICAgICAgICAgJiYgKENvbXBvbmVudCA9PSBNTExpc3RJdGVtIHx8IENvbXBvbmVudC5wcm90b3R5cGUgaW5zdGFuY2VvZiBNTExpc3RJdGVtKVxuICAgICAgICAgICAgJiYgZHJhZ2dpbmdGcm9tU2FtZUxpc3QuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBkcmFnZ2luZ0Zyb21TYW1lTGlzdChjb21wKSB7XG4gICAgY29tcCA9IGNvbXAgfHwgRHJhZ0Ryb3Auc2VydmljZS5nZXRDdXJyZW50RHJhZ1NvdXJjZSgpO1xuICAgIHRyeSB7IHZhciBzb3VyY2VMaXN0ID0gY29tcC5pdGVtLmxpc3Q7IH0gY2F0Y2goZSkge31cbiAgICByZXR1cm4gc291cmNlTGlzdCA9PSB0aGlzLml0ZW0ubGlzdDtcbn1cblxuXG5mdW5jdGlvbiBpc0NvbXBvbmVudEFsbG93ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEcm9wQWxsb3dlZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5cbmZ1bmN0aW9uIG9uSXRlbURyb3AoZXZlbnRUeXBlLCBldmVudCkge1xuICAgIG9uRHJhZ091dC5jYWxsKHRoaXMpO1xuICAgIHZhciBkdCA9IG5ldyBEcmFnRHJvcChldmVudCk7XG4gICAgdmFyIG1ldGEgPSBkdC5nZXRDb21wb25lbnRNZXRhKCk7XG4gICAgdmFyIHN0YXRlID0gZHQuZ2V0Q29tcG9uZW50U3RhdGUoKTtcbiAgICB2YXIgbGlzdE93bmVyID0gdGhpcy5pdGVtLmxpc3Qub3duZXI7XG4gICAgdmFyIGluZGV4ID0gbWV0YS5wYXJhbXMgJiYgbWV0YS5wYXJhbXMuaW5kZXg7XG4gICAgdmFyIGRyb3BQb3NpdGlvbiA9IERyYWdEcm9wLmdldERyb3BQb3NpdGlvblkoZXZlbnQsIHRoaXMuZWwpO1xuICAgIHZhciBpc0JlbG93ID0gZHJvcFBvc2l0aW9uID09ICdiZWxvdyc7XG4gICAgdmFyIGlzQWJvdmUgPSBkcm9wUG9zaXRpb24gPT0gJ2Fib3ZlJztcbiAgICB2YXIgdGFyZ2V0SW5kZXg7XG5cbiAgICBpZiAoZHJhZ2dpbmdGcm9tU2FtZUxpc3QuY2FsbCh0aGlzKSl7XG4gICAgICAgIGlmKHN0YXRlLmNvbXBOYW1lID09IHRoaXMubmFtZSkgcmV0dXJuO1xuICAgICAgICB2YXIgc3RhdGVJbmRleCA9IHN0YXRlLmZhY2V0c1N0YXRlcy5pdGVtLnN0YXRlLmluZGV4O1xuICAgICAgICB2YXIgaXNNb3ZlRG93biA9IHN0YXRlSW5kZXggPCB0aGlzLml0ZW0uaW5kZXg7XG4gICAgICAgIHZhciBpc1NhbWVQb3NpdGlvbjtcbiAgICAgICAgaWYoaXNNb3ZlRG93bikge1xuICAgICAgICAgICAgaXNTYW1lUG9zaXRpb24gPSBpc0Fib3ZlICYmIHN0YXRlSW5kZXggKyAxID09IHRoaXMuaXRlbS5pbmRleDtcbiAgICAgICAgICAgIGlmKGlzU2FtZVBvc2l0aW9uKSByZXR1cm47XG4gICAgICAgICAgICB0YXJnZXRJbmRleCA9IHRoaXMuaXRlbS5pbmRleCAtIGlzQWJvdmU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7Ly9tb3ZlIHVwXG4gICAgICAgICAgICBpc1NhbWVQb3NpdGlvbiA9IGlzQmVsb3cgJiYgc3RhdGVJbmRleCAtIDEgPT0gdGhpcy5pdGVtLmluZGV4O1xuICAgICAgICAgICAgaWYoaXNTYW1lUG9zaXRpb24pIHJldHVybjtcbiAgICAgICAgICAgIHRhcmdldEluZGV4ID0gdGhpcy5pdGVtLmluZGV4ICsgaXNCZWxvdztcbiAgICAgICAgfVxuICAgICAgICBsaXN0T3duZXIubW92ZUl0ZW0oK2luZGV4LCB0YXJnZXRJbmRleCwgc3RhdGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLml0ZW0uaW5kZXggKyBpc0JlbG93O1xuICAgICAgICB0cnkgeyB2YXIgZGF0YSA9IHN0YXRlLmZhY2V0c1N0YXRlcy5kYXRhLnN0YXRlOyB9IGNhdGNoKGUpIHt9XG4gICAgICAgIGxpc3RPd25lci5kYXRhLnNwbGljZSh0YXJnZXRJbmRleCwgMCwgZGF0YSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KC8qZXZlbnRUeXBlLCBldmVudCovKSB7XG4gICAgRHJhZ0Ryb3Auc2VydmljZS5vbmNlKCdkcmFnZHJvcGNvbXBsZXRlZCcsIHsgc3Vic2NyaWJlcjogb25EcmFnRHJvcENvbXBsZXRlZCwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuXG5mdW5jdGlvbiBvbkRyYWdIb3ZlcigvKmV2ZW50VHlwZSwgZXZlbnQqLykge1xuICAgIHRoaXMuZG9tLmFkZENzc0NsYXNzZXMoJ21sLWRyYWctb3ZlcicpO1xufVxuXG5cbmZ1bmN0aW9uIG9uRHJhZ091dCgvKmV2ZW50VHlwZSwgZXZlbnQqLykge1xuICAgIHRoaXMuZG9tLnJlbW92ZUNzc0NsYXNzZXMoJ21sLWRyYWctb3ZlcicpO1xufVxuXG5cbmZ1bmN0aW9uIG9uRHJhZ0Ryb3BDb21wbGV0ZWQobXNnLCBkYXRhKSB7XG4gICAgdmFyIGRyb3BUYXJnZXQgPSBkYXRhLmNvbXBvbmVudDtcbiAgICB2YXIgZHJvcHBlZEluQW5vdGhlckxpc3QgPSBkYXRhLmV2ZW50VHlwZSA9PSAnZHJvcCcgJiYgIWRyYWdnaW5nRnJvbVNhbWVMaXN0LmNhbGwodGhpcywgZHJvcFRhcmdldCk7XG4gICAgaWYgKGRyb3BwZWRJbkFub3RoZXJMaXN0KSB0aGlzLml0ZW0ucmVtb3ZlSXRlbSgpO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kZ2V0TWV0YURhdGEoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5kZXg6IHRoaXMuaXRlbS5pbmRleFxuICAgIH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBMSVNUSVRFTV9DSEFOR0VfTUVTU0FHRSA9ICdtbGxpc3RpdGVtY2hhbmdlJztcblxudmFyIE1MTGlzdEl0ZW1TaW1wbGUgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MTGlzdEl0ZW1TaW1wbGUnLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZG9tOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MTGlzdEl0ZW1TaW1wbGVfZ2V0LFxuICAgICAgICBzZXQ6IE1MTGlzdEl0ZW1TaW1wbGVfc2V0LFxuICAgICAgICBkZWw6IE1MTGlzdEl0ZW1TaW1wbGVfZGVsLFxuICAgICAgICBldmVudDogTElTVElURU1fQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIG1vZGVsOiB1bmRlZmluZWQsXG4gICAgaXRlbTogdW5kZWZpbmVkXG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTExpc3RJdGVtU2ltcGxlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTExpc3RJdGVtU2ltcGxlO1xuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW1TaW1wbGVfZ2V0KCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0KCk7XG4gICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyA/IF8uY2xvbmUodmFsdWUpIDogdmFsdWU7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbVNpbXBsZV9zZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09ICdvYmplY3QnKVxuICAgICAgICB0aGlzLmRhdGEuX3NldCh2YWx1ZSk7XG4gICAgdGhpcy5tb2RlbC5zZXQodmFsdWUpO1xuICAgIF9zZW5kQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtU2ltcGxlX2RlbCgpIHtcbiAgICB0aGlzLmRhdGEuX2RlbCgpO1xuICAgIHRoaXMubW9kZWwuZGVsKCk7XG4gICAgX3NlbmRDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cblxuZnVuY3Rpb24gX3NlbmRDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoTElTVElURU1fQ0hBTkdFX01FU1NBR0UpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgdW5pcXVlSWQgPSBtaWxvLnV0aWwudW5pcXVlSWQ7XG5cblxudmFyIFJBRElPX0NIQU5HRV9NRVNTQUdFID0gJ21scmFkaW9ncm91cGNoYW5nZSdcbiAgICAsIEVMRU1FTlRfTkFNRV9QUk9QRVJUWSA9ICdfbWxSYWRpb0dyb3VwRWxlbWVudElEJ1xuICAgICwgRUxFTUVOVF9OQU1FX1BSRUZJWCA9ICdtbC1yYWRpby1ncm91cC0nO1xuXG52YXIgTUxSYWRpb0dyb3VwID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFJhZGlvR3JvdXAnLCB7XG4gICAgZGF0YToge1xuICAgICAgICBzZXQ6IE1MUmFkaW9Hcm91cF9zZXQsXG4gICAgICAgIGdldDogTUxSYWRpb0dyb3VwX2dldCxcbiAgICAgICAgZGVsOiBNTFJhZGlvR3JvdXBfZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IFJBRElPX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnY2xpY2snOiB7IHN1YnNjcmliZXI6IG9uR3JvdXBDbGljaywgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1yYWRpby1ncm91cCdcbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAne3t+IGl0LnJhZGlvT3B0aW9ucyA6b3B0aW9uIH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7eyMjZGVmLmVsSUQ6e3s9IGl0LmVsZW1lbnROYW1lIH19LXt7PSBvcHRpb24udmFsdWUgfX0jfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwie3s9IGl0Ll9yZW5kZXJPcHRpb25zLm9wdGlvbkNzc0NsYXNzIHx8IFwiJyArIEVMRU1FTlRfTkFNRV9QUkVGSVggKyAnb3B0aW9uXCIgfX1cIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJ7eyMgZGVmLmVsSUQgfX1cIiB0eXBlPVwicmFkaW9cIiB2YWx1ZT1cInt7PSBvcHRpb24udmFsdWUgfX1cIiBuYW1lPVwie3s9IGl0LmVsZW1lbnROYW1lIH19XCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInt7IyBkZWYuZWxJRCB9fVwiPnt7PSBvcHRpb24ubGFiZWwgfX08L2xhYmVsPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiBcXFxuICAgICAgICAgICAgICAgICAgIHt7fn19J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MUmFkaW9Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxSYWRpb0dyb3VwO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxSYWRpb0dyb3VwLCB7XG4gICAgaW5pdDogTUxSYWRpb0dyb3VwJGluaXQsXG4gICAgZGVzdHJveTogTUxSYWRpb0dyb3VwJGRlc3Ryb3ksXG4gICAgc2V0UmVuZGVyT3B0aW9uczogTUxSYWRpb0dyb3VwJHNldFJlbmRlck9wdGlvbnNcbn0pO1xuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGl6ZSByYWRpbyBncm91cCBhbmQgc2V0dXBcbiAqL1xuZnVuY3Rpb24gTUxSYWRpb0dyb3VwJGluaXQoKSB7XG4gICAgXy5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX3JhZGlvTGlzdCcsIFtdLCBfLkNPTkYpO1xuICAgIF8uZGVmaW5lUHJvcGVydHkodGhpcywgRUxFTUVOVF9OQU1FX1BST1BFUlRZLCBFTEVNRU5UX05BTUVfUFJFRklYICsgdW5pcXVlSWQoKSk7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucyA9IHt9O1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cCRzZXRSZW5kZXJPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9yZW5kZXJPcHRpb25zID0gb3B0aW9ucztcbn1cblxuXG4vKipcbiAqIFNldHMgZ3JvdXAgdmFsdWVcbiAqIFJlcGxhY2VzIHRoZSBkYXRhIHNldCBvcGVyYXRpb24gdG8gZGVhbCB3aXRoIHJhZGlvIGJ1dHRvbnNcbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgc2V0XG4gKi9cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cF9zZXQodmFsdWUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX3JhZGlvTGlzdFxuICAgICAgICAsIHNldFJlc3VsdDtcbiAgICBpZiAob3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgb3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHJhZGlvKSB7XG4gICAgICAgICAgICByYWRpby5jaGVja2VkID0gcmFkaW8udmFsdWUgPT0gdmFsdWU7XG4gICAgICAgICAgICBpZiAocmFkaW8uY2hlY2tlZClcbiAgICAgICAgICAgICAgICBzZXRSZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHNldFJlc3VsdDtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBHZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXRyaWV2ZXMgdGhlIHNlbGVjdGVkIHZhbHVlIG9mIHRoZSBncm91cFxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gTUxSYWRpb0dyb3VwX2dldCgpIHtcbiAgICB2YXIgY2hlY2tlZCA9IF8uZmluZCh0aGlzLl9yYWRpb0xpc3QsIGZ1bmN0aW9uKHJhZGlvKSB7XG4gICAgICAgIHJldHVybiByYWRpby5jaGVja2VkO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNoZWNrZWQgJiYgY2hlY2tlZC52YWx1ZSB8fCB1bmRlZmluZWQ7XG59XG5cblxuLyoqXG4gKiBEZWxldGVkIGdyb3VwIHZhbHVlXG4gKiBEZWxldGVzIHRoZSB2YWx1ZSBvZiB0aGUgZ3JvdXAsIHNldHRpbmcgaXQgdG8gZW1wdHlcbiAqL1xuZnVuY3Rpb24gTUxSYWRpb0dyb3VwX2RlbCgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX3JhZGlvTGlzdDtcbiAgICBpZiAob3B0aW9ucy5sZW5ndGgpXG4gICAgICAgIG9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbihyYWRpbykge1xuICAgICAgICAgICAgcmFkaW8uY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cblxuLyoqXG4gKiBNYW5hZ2UgcmFkaW8gY2hpbGRyZW4gY2xpY2tzXG4gKi9cbmZ1bmN0aW9uIG9uR3JvdXBDbGljayhldmVudFR5cGUsIGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldC50eXBlID09ICdyYWRpbycpXG4gICAgICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG4vLyBQb3N0IHRoZSBkYXRhIGNoYW5nZVxuZnVuY3Rpb24gZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoUkFESU9fQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5cbi8vIFNldCByYWRpbyBidXR0b24gY2hpbGRyZW4gb24gbW9kZWwgY2hhbmdlXG5mdW5jdGlvbiBvbk9wdGlvbnNDaGFuZ2UocGF0aCwgZGF0YSkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKHtcbiAgICAgICAgcmFkaW9PcHRpb25zOiB0aGlzLm1vZGVsLmdldCgpLFxuICAgICAgICBlbGVtZW50TmFtZTogdGhpc1tFTEVNRU5UX05BTUVfUFJPUEVSVFldLFxuICAgICAgICBfcmVuZGVyT3B0aW9uczogdGhpcy5fcmVuZGVyT3B0aW9uc1xuICAgIH0pO1xuXG4gICAgdmFyIHJhZGlvRWxzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0nKVxuICAgICAgICAsIG9wdGlvbnMgPSBfLnRvQXJyYXkocmFkaW9FbHMpO1xuXG4gICAgdGhpcy5fcmFkaW9MaXN0Lmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fcmFkaW9MaXN0LnNwbGljZS5hcHBseSh0aGlzLl9yYWRpb0xpc3QsIFswLCAwXS5jb25jYXQob3B0aW9ucykpO1xufVxuXG5cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cCRkZXN0cm95KCkge1xuICAgIGRlbGV0ZSB0aGlzLl9yYWRpb0xpc3Q7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG52YXIgU0VMRUNUX0NIQU5HRV9NRVNTQUdFID0gJ21sc2VsZWN0Y2hhbmdlJztcblxudmFyIE1MU2VsZWN0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFNlbGVjdCcsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktc2VsZWN0J1xuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgICBzZXQ6IE1MU2VsZWN0X3NldCxcbiAgICAgICAgZ2V0OiBNTFNlbGVjdF9nZXQsXG4gICAgICAgIGRlbDogTUxTZWxlY3RfZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IFNFTEVDVF9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnY2hhbmdlJzogeyBzdWJzY3JpYmVyOiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqJzogeyBzdWJzY3JpYmVyOiBvbk9wdGlvbnNDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ3t7fiBpdC5zZWxlY3RPcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJ7ez0gb3B0aW9uLnZhbHVlIH19XCIge3s/IG9wdGlvbi5zZWxlY3RlZCB9fXNlbGVjdGVke3s/fX0+e3s9IG9wdGlvbi5sYWJlbCB9fTwvb3B0aW9uPiBcXFxuICAgICAgICAgICAgICAgICAgIHt7fn19J1xuICAgIH1cbn0pO1xuXG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxTZWxlY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MU2VsZWN0O1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxTZWxlY3QsIHtcbiAgICBpbml0OiBNTFNlbGVjdCRpbml0LFxuICAgIHNldE9wdGlvbnM6IE1MU2VsZWN0JHNldE9wdGlvbnMsXG4gICAgZGlzYWJsZTogTUxTZWxlY3QkZGlzYWJsZVxufSk7XG5cblxuZnVuY3Rpb24gTUxTZWxlY3QkaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLl9vcHRpb25FbHMgPSB7fTtcbiAgICB0aGlzLl9pc011bHRpcGxlID0gdGhpcy5lbC5oYXNBdHRyaWJ1dGUoJ211bHRpcGxlJyk7XG59XG5cblxuZnVuY3Rpb24gTUxTZWxlY3Qkc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgLy8gU2V0IG9wdGlvbnMgdGVtcG9yYXJpbHkgZGlzYWJsZXMgbW9kZWwgc3Vic2NyaXB0aW9ucyAoQXMgYSB3b3JrYXJvdW5kIGZvciBwZXJmb3JtYW5jZSBpc3N1ZXMgcmVsYXRpbmcgdG8gbW9kZWwgdXBkYXRlcyAvIHRlbXBsYXRlIHJlLXJlbmRlcmluZylcbiAgICB2YXIgbW9kZWxDaGFuZ2VMaXN0ZW5lciA9IHsgY29udGV4dDogdGhpcywgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlIH07XG5cbiAgICB0aGlzLm1vZGVsLm9mZignKionLCBtb2RlbENoYW5nZUxpc3RlbmVyKTtcbiAgICB0aGlzLm1vZGVsLnNldChvcHRpb25zKTtcbiAgICB0aGlzLm1vZGVsLm9uKCcqKicsIG1vZGVsQ2hhbmdlTGlzdGVuZXIpO1xuXG4gICAgb25PcHRpb25zQ2hhbmdlLmNhbGwodGhpcyk7XG59XG5cblxuZnVuY3Rpb24gTUxTZWxlY3QkZGlzYWJsZShkaXNhYmxlKSB7XG4gICAgdGhpcy5lbC5kaXNhYmxlZCA9IGRpc2FibGU7XG59XG5cblxuZnVuY3Rpb24gTUxTZWxlY3Rfc2V0KHN0ck9yT2JqKSB7XG4gICAgaWYgKCF0aGlzLl9pc011bHRpcGxlKSB0aGlzLmVsLnZhbHVlID0gc3RyT3JPYmo7XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciB2YWx1ZU9iaiA9IHt9O1xuICAgICAgICBpZiAoc3RyT3JPYmogJiYgdHlwZW9mIHN0ck9yT2JqID09ICdvYmplY3QnKSB2YWx1ZU9iaiA9IHN0ck9yT2JqO1xuICAgICAgICBlbHNlIHZhbHVlT2JqW3N0ck9yT2JqXSA9IHRydWU7XG4gICAgICAgIF8uZWFjaEtleSh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCwga2V5KSB7XG4gICAgICAgICAgICBlbC5zZWxlY3RlZCA9ICEhdmFsdWVPYmpba2V5XTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0X2dldCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzTXVsdGlwbGUpIHJldHVybiB0aGlzLmVsLnZhbHVlO1xuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gXy5tYXBLZXlzKHRoaXMuX29wdGlvbkVscywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwuc2VsZWN0ZWQ7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdF9kZWwoKSB7XG4gICAgaWYgKCF0aGlzLl9pc011bHRpcGxlKSB0aGlzLmVsLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgIGVsc2Uge1xuICAgICAgICBfLmVhY2hLZXkodGhpcy5fb3B0aW9uRWxzLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGVsLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UoKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShTRUxFQ1RfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5cbmZ1bmN0aW9uIG9uT3B0aW9uc0NoYW5nZShwYXRoLCBkYXRhKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoeyBzZWxlY3RPcHRpb25zOiB0aGlzLm1vZGVsLmdldCgpIH0pO1xuICAgIHRoaXMuX29wdGlvbkVscyA9IHt9O1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBfLmZvckVhY2godGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb24nKSwgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHNlbGYuX29wdGlvbkVsc1tlbC52YWx1ZV0gPSBlbDtcbiAgICB9KTtcbiAgICAvL2Rpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1MU3VwZXJDb21ib1xuICogQSBjb21ibyBzZWxlY3QgbGlzdCB3aXRoIGludGVsbGlnZW50IHNjcm9sbGluZyBvZiBzdXBlciBsYXJnZSBsaXN0cy5cbiAqL1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgZG9UID0gbWlsby51dGlsLmRvVFxuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlcjtcblxudmFyIENPTUJPX09QRU4gPSAnbWwtdWktc3VwZXJjb21iby1vcGVuJztcbnZhciBDT01CT19DSEFOR0VfTUVTU0FHRSA9ICdtbHN1cGVyY29tYm9jaGFuZ2UnO1xuXG52YXIgT1BUSU9OU19URU1QTEFURSA9ICd7e34gaXQuY29tYm9PcHRpb25zIDpvcHRpb246aW5kZXggfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYge3s/IG9wdGlvbi5zZWxlY3RlZH19Y2xhc3M9XCJzZWxlY3RlZFwiIHt7P319ZGF0YS12YWx1ZT1cInt7PSBpbmRleCB9fVwiPnt7PSBvcHRpb24ubGFiZWwgfX08L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAge3t+fX0nO1xuXG52YXIgTUFYX1JFTkRFUkVEID0gMTAwO1xudmFyIEJVRkZFUiA9IDI1O1xudmFyIERFRkFVTFRfRUxFTUVOVF9IRUlHSFQgPSAyMDtcblxudmFyIE1MU3VwZXJDb21ibyA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxTdXBlckNvbWJvJywge1xuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ21vdXNlbGVhdmUnOiB7c3Vic2NyaWJlcjogb25Nb3VzZUxlYXZlLCBjb250ZXh0OiAnb3duZXInfSxcbiAgICAgICAgICAgICdtb3VzZW92ZXInOiB7c3Vic2NyaWJlcjogb25Nb3VzZU92ZXIsIGNvbnRleHQ6ICdvd25lcid9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTFN1cGVyQ29tYm9fZ2V0LFxuICAgICAgICBzZXQ6IE1MU3VwZXJDb21ib19zZXQsXG4gICAgICAgIGRlbDogTUxTdXBlckNvbWJvX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBDT01CT19DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXN1cGVyY29tYm8nXG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJzxpbnB1dCBtbC1iaW5kPVwiW2RhdGEsIGV2ZW50c106aW5wdXRcIiBjbGFzcz1cImZvcm0tY29udHJvbCBtbC11aS1pbnB1dFwiPlxcXG4gICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiW2RvbV06YWRkSXRlbURpdlwiIGNsYXNzPVwibWwtdWktc3VwZXJjb21iby1hZGRcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIjphZGRQcm9tcHRcIj48L3NwYW4+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cIltldmVudHMsIGRvbV06YWRkQnRuXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgbWwtdWktYnV0dG9uXCI+QWRkPC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIltkb20sIGV2ZW50c106bGlzdFwiIGNsYXNzPVwibWwtdWktc3VwZXJjb21iby1kcm9wZG93blwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIltkb21dOmJlZm9yZVwiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIlt0ZW1wbGF0ZSwgZG9tLCBldmVudHNdOm9wdGlvbnNcIiBjbGFzcz1cIm1sLXVpLXN1cGVyY29tYm8tb3B0aW9uc1wiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIltkb21dOmFmdGVyXCI+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj4nXG4gICAgfSxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxTdXBlckNvbWJvKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFN1cGVyQ29tYm87XG5cbi8qKlxuICogUHVibGljIEFwaVxuICovXG5fLmV4dGVuZFByb3RvKE1MU3VwZXJDb21ibywge1xuICAgIGluaXQ6IE1MU3VwZXJDb21ibyRpbml0LFxuICAgIHNob3dPcHRpb25zOiBNTFN1cGVyQ29tYm8kc2hvd09wdGlvbnMsXG4gICAgaGlkZU9wdGlvbnM6IE1MU3VwZXJDb21ibyRoaWRlT3B0aW9ucyxcbiAgICB0b2dnbGVPcHRpb25zOiBNTFN1cGVyQ29tYm8kdG9nZ2xlT3B0aW9ucyxcbiAgICBzZXRPcHRpb25zOiBNTFN1cGVyQ29tYm8kc2V0T3B0aW9ucyxcbiAgICBpbml0T3B0aW9uc1VSTDogTUxTdXBlckNvbWJvJGluaXRPcHRpb25zVVJMLFxuICAgIHNldEZpbHRlcmVkT3B0aW9uczogTUxTdXBlckNvbWJvJHNldEZpbHRlcmVkT3B0aW9ucyxcbiAgICB1cGRhdGU6IE1MU3VwZXJDb21ibyR1cGRhdGUsXG4gICAgdG9nZ2xlQWRkQnV0dG9uOiBNTFN1cGVyQ29tYm8kdG9nZ2xlQWRkQnV0dG9uLFxuICAgIHNldEFkZEl0ZW1Qcm9tcHQ6IE1MU3VwZXJDb21ibyRzZXRBZGRJdGVtUHJvbXB0LFxuICAgIHNldFBsYWNlaG9sZGVyOiBNTFN1cGVyQ29tYm8kc2V0UGxhY2Vob2xkZXIsXG4gICAgc2V0RmlsdGVyOiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyLFxuICAgIGNsZWFyQ29tYm9JbnB1dDogTUxTdXBlckNvbWJvX2RlbFxufSk7XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXNlIHRoZSBjb21wb25lbnQsIHdhaXQgZm9yIGNoaWxkcmVuYm91bmQsIHNldHVwIGVtcHR5IG9wdGlvbnMgYXJyYXlzLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMub25jZSgnY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG5cbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICBfb3B0aW9uc0RhdGE6IFtdLFxuICAgICAgICBfZmlsdGVyZWRPcHRpb25zRGF0YTogW10sXG4gICAgICAgIF9maWx0ZXJGdW5jOiBkZWZhdWx0RmlsdGVyXG4gICAgfSwgXy5XUklUKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVyIGZvciBpbml0IGNoaWxkcmVuYm91bmQgbGlzdGVuZXIuIFJlbmRlcnMgdGVtcGxhdGUuXG4gKi9cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcigpLmJpbmRlcigpO1xuICAgIGNvbXBvbmVudFNldHVwLmNhbGwodGhpcyk7XG59XG5cblxuLyoqXG4gKiBEZWZpbmUgaW5zdGFuY2UgcHJvcGVydGllcywgZ2V0IHN1YmNvbXBvbmVudHMsIGNhbGwgc2V0dXAgc3ViLXRhc2tzXG4gKi9cbmZ1bmN0aW9uIGNvbXBvbmVudFNldHVwKCkge1xuICAgIHZhciBzY29wZSA9IHRoaXMuY29udGFpbmVyLnNjb3BlO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX2NvbWJvSW5wdXQ6IHNjb3BlLmlucHV0LFxuICAgICAgICBfY29tYm9MaXN0OiBzY29wZS5saXN0LFxuICAgICAgICBfY29tYm9PcHRpb25zOiBzY29wZS5vcHRpb25zLFxuICAgICAgICBfY29tYm9CZWZvcmU6IHNjb3BlLmJlZm9yZSxcbiAgICAgICAgX2NvbWJvQWZ0ZXI6IHNjb3BlLmFmdGVyLFxuICAgICAgICBfY29tYm9BZGRJdGVtRGl2OiBzY29wZS5hZGRJdGVtRGl2LFxuICAgICAgICBfY29tYm9BZGRQcm9tcHQ6IHNjb3BlLmFkZFByb21wdCxcbiAgICAgICAgX2NvbWJvQWRkQnRuOiBzY29wZS5hZGRCdG4sXG4gICAgICAgIF9vcHRpb25UZW1wbGF0ZTogZG9ULmNvbXBpbGUoT1BUSU9OU19URU1QTEFURSlcbiAgICB9KTtcblxuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgIF9zdGFydEluZGV4OiAwLFxuICAgICAgICBfZW5kSW5kZXg6IE1BWF9SRU5ERVJFRCxcbiAgICAgICAgX2hpZGRlbjogZmFsc2UsXG4gICAgICAgIF9lbGVtZW50SGVpZ2h0OiBERUZBVUxUX0VMRU1FTlRfSEVJR0hULFxuICAgICAgICBfdG90YWw6IDAsXG4gICAgICAgIF9vcHRpb25zSGVpZ2h0OiAyMDAsXG4gICAgICAgIF9sYXN0U2Nyb2xsUG9zOiAwLFxuICAgICAgICBfY3VycmVudFZhbHVlOiBudWxsLFxuICAgICAgICBfc2VsZWN0ZWQ6IG51bGwsXG4gICAgICAgIF9pc0FkZEJ1dHRvblNob3duOiBmYWxzZVxuICAgIH0sIF8uV1JJVCk7XG5cbiAgICAvLyBDb21wb25lbnQgU2V0dXBcbiAgICB0aGlzLmRvbS5zZXRTdHlsZXMoeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9KTtcbiAgICBzZXR1cENvbWJvTGlzdCh0aGlzLl9jb21ib0xpc3QsIHRoaXMuX2NvbWJvT3B0aW9ucywgdGhpcyk7XG4gICAgc2V0dXBDb21ib0lucHV0KHRoaXMuX2NvbWJvSW5wdXQsIHRoaXMpO1xuICAgIHNldHVwQ29tYm9CdG4odGhpcy5fY29tYm9BZGRCdG4sIHRoaXMpO1xuXG4gICAgdGhpcy5ldmVudHMub24oJ2tleWRvd24nLCB7IHN1YnNjcmliZXI6IGNoYW5nZVNlbGVjdGVkLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vdGhpcy5ldmVudHMub24oJ21vdXNlbGVhdmUnLCB7IHN1YnNjcmliZXI6IE1MU3VwZXJDb21ibyRoaWRlT3B0aW9ucywgY29udGV4dDogdGhpcyB9KTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTaG93cyBvciBoaWRlcyBvcHRpb24gbGlzdC5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNob3cgdHJ1ZSB0byBzaG93LCBmYWxzZSB0byBoaWRlXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyR0b2dnbGVPcHRpb25zKHNob3cpIHtcbiAgICB0aGlzLl9oaWRkZW4gPSAhc2hvdztcbiAgICB0aGlzLl9jb21ib0xpc3QuZG9tLnRvZ2dsZShzaG93KTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTaG93cyBvcHRpb25zIGxpc3RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHNob3dPcHRpb25zKCkge1xuICAgIC8vIFBvc2l0aW9uIHRoZSBsaXN0IHRvIG1heGltaXNlIHRoZSBhbW91bnQgb2YgdmlzaWJsZSBjb250ZW50XG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdmFyIHBhZ2VIZWlnaHQgPSBNYXRoLm1heCh0aGlzLmVsLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApO1xuICAgIHZhciBsaXN0VG9wU3R5bGUgPSAnJzsgLy8gUG9zaXRpb25zIG9wdGlvbnMgdW5kZXJuZWF0aCB0aGUgY29tYm9ib3ggKERlZmF1bHQgYmVoYXZpb3VyKVxuICAgIHZhciBib3R0b21PdmVybGFwID0gKGJvdW5kcy5ib3R0b20gKyB0aGlzLl9vcHRpb25zSGVpZ2h0KSAtIHBhZ2VIZWlnaHQ7XG5cbiAgICBpZihib3R0b21PdmVybGFwID4gMCkge1xuICAgICAgICB2YXIgdG9wT3ZlcmxhcCA9IHRoaXMuX29wdGlvbnNIZWlnaHQgLSBib3VuZHMudG9wO1xuXG4gICAgICAgIGlmKHRvcE92ZXJsYXAgPCBib3R0b21PdmVybGFwKSB7XG4gICAgICAgICAgICBsaXN0VG9wU3R5bGUgPSAtIHRoaXMuX29wdGlvbnNIZWlnaHQgKyAncHgnOyAvLyBQb3NpdGlvbiBvcHRpb25zIGFib3ZlIHRoZSBjb21ib2JveFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS5zZXRTdHlsZXMoeyB0b3A6IGxpc3RUb3BTdHlsZSB9KTtcbiAgICB0aGlzLl9oaWRkZW4gPSBmYWxzZTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoQ09NQk9fT1BFTik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS50b2dnbGUodHJ1ZSk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgb3B0aW9ucyBsaXN0XG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRoaWRlT3B0aW9ucygpIHtcbiAgICB0aGlzLl9oaWRkZW4gPSB0cnVlO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZShDT01CT19PUEVOKTtcbiAgICB0aGlzLl9jb21ib0xpc3QuZG9tLnRvZ2dsZShmYWxzZSk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSGlkZXMgYWRkIGJ1dHRvblxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kdG9nZ2xlQWRkQnV0dG9uKHNob3csIG9wdGlvbnMpIHtcbiAgICB0aGlzLl9jb21ib0FkZEl0ZW1EaXYuZG9tLnRvZ2dsZShzaG93KTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnByZXNlcnZlU3RhdGUpIHRoaXMuX19zaG93QWRkT25DbGljayA9IHRoaXMuX2lzQWRkQnV0dG9uU2hvd247XG4gICAgdGhpcy5faXNBZGRCdXR0b25TaG93biA9IHNob3c7XG59XG5cblxuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHNldEFkZEl0ZW1Qcm9tcHQocHJvbXB0KSB7XG4gICAgdGhpcy5fYWRkSXRlbVByb21wdCA9IHByb21wdDtcbiAgICB0aGlzLl9jb21ib0FkZFByb21wdC5lbC5pbm5lckhUTUwgPSBwcm9tcHQ7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xufVxuXG5cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRQbGFjZWhvbGRlcihwbGFjZWhvbGRlcikge1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZWwucGxhY2Vob2xkZXIgPSBwbGFjZWhvbGRlcjtcbn1cblxuXG4vKipcbiAqIFNldCB0aGUgZmlsdGVyIGZ1bmN0aW9uIHVzZWQgaW4gdGhlIHRleHQgZmllbGRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgQSBmdW5jdGlvbiB3aXRoIHRoZSBhcmd1bWVudHMgYFt0ZXh0LCBvcHRpb25dYCB3aGljaCB3aWxsIGludGVyYXRlIFxuICogdGhyb3VnaCBhbGwgYG9wdGlvbnNgLCB0ZXN0aW5nIGVhY2ggYWdhaW5zdCB0aGUgZW50ZXJlZCBgdGV4dGAuIFdBUk5JTkc6IFNldHRpbmcgYSBmdW5jdGlvbiBcbiAqIGNvdWxkIGludGVyZmVyZSB3aXRoIGxvZ2ljIHVzZSB0byBkZXRlcm1pbmcgaWYgYW4gaXRlbSBpcyB1bmlxdWUgZm9yIHRoZSBhZGQgaXRlbSBidXR0b24uXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRGaWx0ZXIoZnVuYykge1xuICAgIHRoaXMuX2ZpbHRlckZ1bmMgPSBmdW5jO1xufVxuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogU2V0cyB0aGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd25cbiAqXG4gKiBAcGFyYW0ge0FycmF5W09iamVjdF19IGFyciB0aGUgb3B0aW9ucyB0byBzZXQgd2l0aCBsYWJlbCBhbmQgdmFsdWUgcGFpcnMuIFZhbHVlIGNhbiBiZSBhbiBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRPcHRpb25zKGFycikge1xuICAgIHRoaXMuX29wdGlvbnNEYXRhID0gYXJyO1xuICAgIHRoaXMuc2V0RmlsdGVyZWRPcHRpb25zKGFycik7XG5cbiAgICBzZXRTZWxlY3RlZC5jYWxsKHRoaXMsIGFyclswXSk7XG59XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBJbml0aWFsaXNlIHRoZSByZW1vdGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB0aGUgb3B0aW9ucyB0byBpbml0aWFsaXNlLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kaW5pdE9wdGlvbnNVUkwob3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnNVUkwgPSBvcHRpb25zLnVybDtcbiAgICB0aGlzLl9mb3JtYXRPcHRpb25zVVJMID0gb3B0aW9ucy5mb3JtYXRPcHRpb25zIHx8IGZ1bmN0aW9uKGUpe3JldHVybiBlO307XG59XG5cblxuLyoqXG4gKiBQcml2YXRlIG1ldGhvZFxuICogU2V0cyB0aGUgb3B0aW9ucyBvZiB0aGUgZHJvcGRvd24gYmFzZWQgb24gYSByZXF1ZXN0XG4gKi9cbmZ1bmN0aW9uIF9nZXRPcHRpb25zVVJMKGNiKSB7XG4gICAgdmFyIHVybCA9IHRoaXMuX29wdGlvbnNVUkwsXG4gICAgICAgIHF1ZXJ5U3RyaW5nID0gdGhpcy5fY29tYm9JbnB1dC5kYXRhLmdldCgpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjYiA9IGNiIHx8IF8ubm9vcDtcbiAgICBtaWxvLnV0aWwucmVxdWVzdC5wb3N0KHVybCwgeyBuYW1lOiBxdWVyeVN0cmluZyB9LCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0NhbiBub3Qgc2VhcmNoIGZvciBcIicgKyBxdWVyeVN0cmluZyArICdcIicpO1xuICAgICAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignUmVxdWVzdCBlcnJvcicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXNwb25zZURhdGEgPSBfLmpzb25QYXJzZShyZXNwb25zZSk7XG4gICAgICAgIGlmIChyZXNwb25zZURhdGEpIGNiKG51bGwsIHJlc3BvbnNlRGF0YSk7XG4gICAgICAgIGVsc2UgY2IobmV3IEVycm9yKCdEYXRhIGVycm9yJykpO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogU2V0cyB0aGUgZmlsdGVyZWQgb3B0aW9ucywgd2hpY2ggaXMgYSBzdWJzZXQgb2Ygbm9ybWFsIG9wdGlvbnNcbiAqXG4gKiBAcGFyYW0ge1t0eXBlXX0gYXJyIFRoZSBvcHRpb25zIHRvIHNldFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyZWRPcHRpb25zKGFycikge1xuICAgIGlmICghIGFycikgcmV0dXJuIGxvZ2dlci5lcnJvcignc2V0RmlsdGVyZWRPcHRpb25zOiBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkJyk7XG4gICAgdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YSA9IGFycjtcbiAgICB0aGlzLl90b3RhbCA9IGFyci5sZW5ndGg7XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBVcGRhdGVzIHRoZSBsaXN0LiBUaGlzIGlzIHVzZWQgb24gc2Nyb2xsLCBhbmQgbWFrZXMgdXNlIG9mIHRoZSBmaWx0ZXJlZE9wdGlvbnMgdG9cbiAqIGludGVsbGlnZW50bHkgc2hvdyBhIHN1YnNldCBvZiB0aGUgZmlsdGVyZWQgbGlzdCBhdCBhIHRpbWUuXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyR1cGRhdGUoKSB7XG4gICAgdmFyIHdhc0hpZGRlbiA9IHRoaXMuX2hpZGRlbjtcblxuICAgIHZhciBhcnJUb1Nob3cgPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhLnNsaWNlKHRoaXMuX3N0YXJ0SW5kZXgsIHRoaXMuX2VuZEluZGV4KTtcblxuICAgIHRoaXMuX2NvbWJvT3B0aW9ucy50ZW1wbGF0ZS5yZW5kZXIoe1xuICAgICAgICBjb21ib09wdGlvbnM6IGFyclRvU2hvd1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZWxlbWVudEhlaWdodCA9IHRoaXMuX2VsZW1lbnRIZWlnaHQgfHwgREVGQVVMVF9FTEVNRU5UX0hFSUdIVDtcblxuICAgIGlmICh3YXNIaWRkZW4pXG4gICAgICAgIHRoaXMuaGlkZU9wdGlvbnMoKTtcblxuICAgIHZhciBiZWZvcmVIZWlnaHQgPSB0aGlzLl9zdGFydEluZGV4ICogdGhpcy5fZWxlbWVudEhlaWdodDtcbiAgICB2YXIgYWZ0ZXJIZWlnaHQgPSAodGhpcy5fdG90YWwgLSB0aGlzLl9lbmRJbmRleCkgKiB0aGlzLl9lbGVtZW50SGVpZ2h0O1xuICAgIHRoaXMuX2NvbWJvQmVmb3JlLmVsLnN0eWxlLmhlaWdodCA9IGJlZm9yZUhlaWdodCArICdweCc7XG4gICAgdGhpcy5fY29tYm9BZnRlci5lbC5zdHlsZS5oZWlnaHQgPSBhZnRlckhlaWdodCA+IDAgPyBhZnRlckhlaWdodCArICdweCcgOiAnMHB4Jztcbn1cblxuLyoqXG4gKiBTZXR1cCB0aGUgY29tYm8gbGlzdFxuICpcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gbGlzdFxuICogQHBhcmFtICB7QXJyYXl9IG9wdGlvbnNcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gc2VsZlxuICovXG5mdW5jdGlvbiBzZXR1cENvbWJvTGlzdChsaXN0LCBvcHRpb25zLCBzZWxmKSB7XG4gICAgc2VsZi50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xuICAgIG9wdGlvbnMudGVtcGxhdGUuc2V0KE9QVElPTlNfVEVNUExBVEUpO1xuXG4gICAgbGlzdC5kb20uc2V0U3R5bGVzKHtcbiAgICAgICAgb3ZlcmZsb3c6ICdzY3JvbGwnLFxuICAgICAgICBoZWlnaHQ6IHNlbGYuX29wdGlvbnNIZWlnaHQgKyAncHgnLFxuICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgekluZGV4OiAxMFxuICAgICAgICAvLyB0b3A6IHlQb3MgKyAncHgnLFxuICAgICAgICAvLyBsZWZ0OiB4UG9zICsgJ3B4JyxcbiAgICB9KTtcblxuICAgIHNlbGYuaGlkZU9wdGlvbnMoKTtcbiAgICBsaXN0LmV2ZW50cy5vbk1lc3NhZ2VzKHtcbiAgICAgICAgJ2NsaWNrJzoge3N1YnNjcmliZXI6IG9uTGlzdENsaWNrLCBjb250ZXh0OiBzZWxmfSxcbiAgICAgICAgJ3Njcm9sbCc6IHtzdWJzY3JpYmVyOiBvbkxpc3RTY3JvbGwsIGNvbnRleHQ6IHNlbGZ9XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2V0dXAgdGhlIGlucHV0IGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gaW5wdXRcbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gc2VsZlxuICovXG5mdW5jdGlvbiBzZXR1cENvbWJvSW5wdXQoaW5wdXQsIHNlbGYpIHtcbiAgICBpbnB1dC5ldmVudHMub25jZSgnZm9jdXMnLCBmdW5jdGlvbigpe1xuICAgICAgICBpbnB1dC5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uRGF0YUNoYW5nZSwgY29udGV4dDogc2VsZiB9KTtcbiAgICAgICAgaW5wdXQuZXZlbnRzLm9uKCdjbGljaycsIHtzdWJzY3JpYmVyOiBvbklucHV0Q2xpY2ssIGNvbnRleHQ6IHNlbGYgfSk7XG4gICAgICAgIGlucHV0LmV2ZW50cy5vbigna2V5ZG93bicsIHtzdWJzY3JpYmVyOiBvbkVudGVyS2V5LCBjb250ZXh0OiBzZWxmIH0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNldHVwIHRoZSBidXR0b25cbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gYnRuXG4gKiBAcGFyYW0gIHtDb21wb25lbnR9IHNlbGZcbiAqL1xuZnVuY3Rpb24gc2V0dXBDb21ib0J0bihidG4sIHNlbGYpIHtcbiAgICBidG4uZXZlbnRzLm9uKCdjbGljaycsIHsgc3Vic2NyaWJlcjogb25BZGRCdG4sIGNvbnRleHQ6IHNlbGYgfSk7XG59XG5cblxuLyoqXG4gKiBDdXN0b20gZGF0YSBmYWNldCBnZXQgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ib19nZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRWYWx1ZTtcbn1cblxuLyoqXG4gKiBDdXN0b20gZGF0YSBmYWNldCBzZXQgbWV0aG9kXG4gKiBAcGFyYW0ge1ZhcmlhYmxlfSBvYmpcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvX3NldChvYmopIHtcbiAgICB0aGlzLl9jdXJyZW50VmFsdWUgPSBvYmo7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLnNldChvYmogJiYgb2JqLmxhYmVsKTtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENPTUJPX0NIQU5HRV9NRVNTQUdFKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIF8uZGVmZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuaGlkZU9wdGlvbnMoKTtcbiAgICAgICAgc2VsZi5zZXRGaWx0ZXJlZE9wdGlvbnMoc2VsZi5fb3B0aW9uc0RhdGEpO1xuICAgICAgICBzZWxmLnVwZGF0ZSgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEN1c3RvbSBkYXRhIGZhY2V0IGRlbCBtZXRob2RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvX2RlbCgpIHtcbiAgICB0aGlzLl9jdXJyZW50VmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5zZXQoJycpO1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoQ09NQk9fQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5cbi8qKlxuICogSW5wdXQgZGF0YSBjaGFuZ2UgaGFuZGxlclxuICogV2hlbiB0aGUgaW5wdXQgZGF0YSBjaGFuZ2VzLCB0aGlzIG1ldGhvZCBmaWx0ZXJzIHRoZSBvcHRpb25zRGF0YSwgYW5kIHNldHMgdGhlIGZpcnN0IGVsZW1lbnRcbiAqIHRvIGJlIHNlbGVjdGVkLlxuICogQHBhcmFtICB7U3RyaW5nfSBtc2dcbiAqIEBwYXJhbSAge09iamV4dH0gZGF0YVxuICovXG5mdW5jdGlvbiBvbkRhdGFDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdmFyIHRleHQgPSBkYXRhLm5ld1ZhbHVlICYmIGRhdGEubmV3VmFsdWUudHJpbSgpO1xuICAgIGlmICh0aGlzLl9vcHRpb25zVVJMKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgX2dldE9wdGlvbnNVUkwuY2FsbCh0aGlzLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlRGF0YSl7XG4gICAgICAgICAgICBpZiAoZXJyIHx8ICFyZXNwb25zZURhdGEpIHJldHVybjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSByZXNwb25zZURhdGEuZGF0YS5tYXAoc2VsZi5fZm9ybWF0T3B0aW9uc1VSTCk7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIF91cGRhdGVPcHRpb25zQW5kQWRkQnV0dG9uLmNhbGwoc2VsZiwgdGV4dCwgc2VsZi5fb3B0aW9uc0RhdGEpO1xuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdEYXRhIGVycm9yJywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBmaWx0ZXJlZERhdGEgPSBfZmlsdGVyRGF0YS5jYWxsKHRoaXMsIHRleHQpO1xuICAgICAgICBfdXBkYXRlT3B0aW9uc0FuZEFkZEJ1dHRvbi5jYWxsKHRoaXMsIHRleHQsIGZpbHRlcmVkRGF0YSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIF9maWx0ZXJEYXRhKHRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9uc0RhdGEuZmlsdGVyKF8ucGFydGlhbCh0aGlzLl9maWx0ZXJGdW5jLCB0ZXh0KSk7XG59XG5cblxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlcih0ZXh0LCBvcHRpb24pIHtcbiAgICBpZiAoISBvcHRpb24ubGFiZWwpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgbGFiZWwgPSBvcHRpb24ubGFiZWwudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gbGFiZWwudHJpbSgpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0ZXh0LnRvTG93ZXJDYXNlKCkpID09IDA7XG59XG5cblxuZnVuY3Rpb24gX3VwZGF0ZU9wdGlvbnNBbmRBZGRCdXR0b24odGV4dCwgZmlsdGVyZWRBcnIpIHtcbiAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbiAgICAgICAgc2V0U2VsZWN0ZWQuY2FsbCh0aGlzLCBmaWx0ZXJlZEFyclswXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZpbHRlcmVkQXJyLmxlbmd0aCAmJiBfLmZpbmQoZmlsdGVyZWRBcnIsIGlzRXhhY3RNYXRjaCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlLCB7IHByZXNlcnZlU3RhdGU6IHRydWUgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYWRkSXRlbVByb21wdCkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVBZGRCdXR0b24odGhpcy5fb3B0aW9uc0RhdGEubGVuZ3RoID4gMSB8fCB0aGlzLl9vcHRpb25zVVJMKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWx0ZXJlZEFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd09wdGlvbnMoKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGVkLmNhbGwodGhpcywgZmlsdGVyZWRBcnJbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5oaWRlT3B0aW9ucygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRGaWx0ZXJlZE9wdGlvbnMoZmlsdGVyZWRBcnIpO1xuICAgIHRoaXMuX2NvbWJvTGlzdC5lbC5zY3JvbGxUb3AgPSAwO1xuXG4gICAgZnVuY3Rpb24gaXNFeGFjdE1hdGNoKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ubGFiZWwudG9Mb3dlckNhc2UoKSA9PT0gdGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIG1hcCBvZiBrZXlDb2RlcyB0byBkaXJlY3Rpb25zXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgZGlyZWN0aW9uTWFwID0geyAnNDAnOiAxLCAnMzgnOiAtMSB9O1xuXG4vKipcbiAqIExpc3Qga2V5ZG93biBoYW5kbGVyXG4gKiBDaGFuZ2VzIHRoZSBzZWxlY3RlZCBsaXN0IGl0ZW0gYnkgZmluZGluZyB0aGUgYWRqYWNlbnQgaXRlbSBhbmQgc2V0dGluZyBpdCB0byBzZWxlY3RlZC5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBjaGFuZ2VTZWxlY3RlZCh0eXBlLCBldmVudCkge1xuICAgIC8vVE9ETyB0ZXN0IG1vY2hhXG4gICAgdmFyIGRpcmVjdGlvbiA9IGRpcmVjdGlvbk1hcFtldmVudC5rZXlDb2RlXTtcblxuICAgIGlmKGRpcmVjdGlvbilcbiAgICAgICAgX2NoYW5nZVNlbGVjdGVkLmNhbGwodGhpcywgZGlyZWN0aW9uKTtcbn1cblxuZnVuY3Rpb24gX2NoYW5nZVNlbGVjdGVkKGRpcmVjdGlvbikge1xuICAgIC8vIFRPRE86IHJlZmFjdG9yIGFuZCB0aWR5IHVwLCBsb29rcyBsaWtlIHNvbWUgY29kZSBkdXBsaWNhdGlvbi5cbiAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3RlZCcpO1xuICAgIHZhciBuZXdTZWxlY3Rpb24gPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhWzBdOyAvLyBEZWZhdWx0IGlmIG5vIHNlbGVjdGVkRWxcbiAgICB2YXIgc2Nyb2xsUG9zID0gdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcDtcbiAgICB2YXIgc2VsZWN0ZWRQb3MgPSBzZWxlY3RlZCA/IHNlbGVjdGVkLm9mZnNldFRvcCA6IDA7XG4gICAgdmFyIHJlbGF0aXZlUG9zID0gc2VsZWN0ZWRQb3MgLSBzY3JvbGxQb3M7XG5cbiAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gX2dldERhdGFWYWx1ZUZyb21FbGVtZW50LmNhbGwodGhpcywgc2VsZWN0ZWQpO1xuICAgICAgICB2YXIgdGhpc0l0ZW0gPSB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhW2luZGV4XTtcbiAgICAgICAgbmV3U2VsZWN0aW9uID0gdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YVtpbmRleCArIGRpcmVjdGlvbl07XG4gICAgfVxuXG4gICAgc2V0U2VsZWN0ZWQuY2FsbCh0aGlzLCBuZXdTZWxlY3Rpb24pO1xuICAgIHRoaXMudXBkYXRlKCk7XG5cbiAgICBpZiAocmVsYXRpdmVQb3MgPiB0aGlzLl9vcHRpb25zSGVpZ2h0IC0gdGhpcy5fZWxlbWVudEhlaWdodCAqIDIgJiYgZGlyZWN0aW9uID09PSAxKVxuICAgICAgICB0aGlzLl9jb21ib0xpc3QuZWwuc2Nyb2xsVG9wICs9IHRoaXMuX2VsZW1lbnRIZWlnaHQgKiBkaXJlY3Rpb24gKiA1O1xuXG4gICAgaWYgKHJlbGF0aXZlUG9zIDwgdGhpcy5fZWxlbWVudEhlaWdodCAmJiBkaXJlY3Rpb24gPT09IC0xKVxuICAgICAgICB0aGlzLl9jb21ib0xpc3QuZWwuc2Nyb2xsVG9wICs9IHRoaXMuX2VsZW1lbnRIZWlnaHQgKiBkaXJlY3Rpb24gKiA1O1xufVxuXG5cbi8qKlxuICogTW91c2Ugb3ZlciBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25Nb3VzZU92ZXIodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLl9tb3VzZUlzT3ZlciA9IHRydWU7XG59XG5cblxuLyoqXG4gKiBNb3VzZSBsZWF2ZSBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25Nb3VzZUxlYXZlKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX21vdXNlSXNPdmVyID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX21vdXNlT3V0VGltZXIpIGNsZWFySW50ZXJ2YWwodGhpcy5fbW91c2VPdXRUaW1lcik7XG4gICAgdGhpcy5fbW91c2VPdXRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCFzZWxmLl9tb3VzZUlzT3ZlcilcbiAgICAgICAgICAgIF9vbk1vdXNlTGVhdmUuY2FsbChzZWxmKTtcbiAgICB9LCA3NTApO1xufVxuXG5mdW5jdGlvbiBfb25Nb3VzZUxlYXZlKCkge1xuICAgIHRoaXMuaGlkZU9wdGlvbnMoKTtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSwgeyBwcmVzZXJ2ZVN0YXRlOiB0cnVlIH0pO1xufVxuXG5cbi8qKlxuICogSW5wdXQgY2xpY2sgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uSW5wdXRDbGljayh0eXBlLCBldmVudCkge1xuICAgIHRoaXMuc2hvd09wdGlvbnMoKTtcbiAgICB0aGlzLl9jb21ib0lucHV0LmVsLnNldFNlbGVjdGlvblJhbmdlKDAsIHRoaXMuX2NvbWJvSW5wdXQuZWwudmFsdWUubGVuZ3RoKTtcbiAgICBpZiAodGhpcy5fX3Nob3dBZGRPbkNsaWNrKSB0aGlzLnRvZ2dsZUFkZEJ1dHRvbih0cnVlKTtcbn1cblxuXG4vKipcbiAqIEVudGVyIGtleSBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25FbnRlcktleSh0eXBlLCBldmVudCkge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09IDEzKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RlZClcbiAgICAgICAgICAgIF9zZXREYXRhLmNhbGwodGhpcyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZCBidXR0b24gaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uQWRkQnRuICh0eXBlLCBldmVudCkge1xuICAgIHZhciBkYXRhID0geyBsYWJlbDogdGhpcy5fY29tYm9JbnB1dC5lbC52YWx1ZSB9O1xuICAgIHRoaXMucG9zdE1lc3NhZ2UoJ2FkZGl0ZW0nLCBkYXRhKTtcbiAgICB0aGlzLmV2ZW50cy5wb3N0TWVzc2FnZSgnbWlsb19zdXBlcmNvbWJvYWRkaXRlbScsIGRhdGEpO1xuICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlLCB7IHByZXNlcnZlU3RhdGU6IHRydWUgfSk7XG5cbn1cblxuLyoqXG4gKiBMaXN0IGNsaWNrIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkxpc3RDbGljayAodHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgaW5kZXggPSBfZ2V0RGF0YVZhbHVlRnJvbUVsZW1lbnQuY2FsbCh0aGlzLCBldmVudC50YXJnZXQpO1xuICAgIHZhciBkYXRhID0gdGhpcy5fZmlsdGVyZWRPcHRpb25zRGF0YVtpbmRleF07XG5cbiAgICBzZXRTZWxlY3RlZC5jYWxsKHRoaXMsIGRhdGEpO1xuICAgIF9zZXREYXRhLmNhbGwodGhpcyk7XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cblxuXG4vKipcbiAqIExpc3Qgc2Nyb2xsIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkxpc3RTY3JvbGwgKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIHNjcm9sbFBvcyA9IGV2ZW50LnRhcmdldC5zY3JvbGxUb3BcbiAgICAgICAgLCBkaXJlY3Rpb24gPSBzY3JvbGxQb3MgPiB0aGlzLl9sYXN0U2Nyb2xsUG9zID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAsIGZpcnN0Q2hpbGQgPSB0aGlzLl9jb21ib09wdGlvbnMuZWwubGFzdEVsZW1lbnRDaGlsZFxuICAgICAgICAsIGxhc3RDaGlsZCA9IHRoaXMuX2NvbWJvT3B0aW9ucy5lbC5maXJzdEVsZW1lbnRDaGlsZFxuICAgICAgICAsIGxhc3RFbFBvc2l0aW9uID0gZmlyc3RDaGlsZCA/IGZpcnN0Q2hpbGQub2Zmc2V0VG9wIDogMFxuICAgICAgICAsIGZpcnN0RWxQb3NpdGlvbiA9IGxhc3RDaGlsZCA/IGxhc3RDaGlsZC5vZmZzZXRUb3AgOiAwXG4gICAgICAgICwgZGlzdEZyb21MYXN0RWwgPSBsYXN0RWxQb3NpdGlvbiAtIHNjcm9sbFBvcyAtIHRoaXMuX29wdGlvbnNIZWlnaHQgKyB0aGlzLl9lbGVtZW50SGVpZ2h0XG4gICAgICAgICwgZGlzdEZyb21GaXJzdEVsID0gc2Nyb2xsUG9zIC0gZmlyc3RFbFBvc2l0aW9uXG4gICAgICAgICwgZWxzRnJvbVN0YXJ0ID0gTWF0aC5mbG9vcihkaXN0RnJvbUZpcnN0RWwgLyB0aGlzLl9lbGVtZW50SGVpZ2h0KVxuICAgICAgICAsIGVsc1RvVGhlRW5kID0gTWF0aC5mbG9vcihkaXN0RnJvbUxhc3RFbCAvIHRoaXMuX2VsZW1lbnRIZWlnaHQpXG4gICAgICAgICwgdG90YWxFbGVtZW50c0JlZm9yZSA9IE1hdGguZmxvb3Ioc2Nyb2xsUG9zIC8gdGhpcy5fZWxlbWVudEhlaWdodCkgLSBCVUZGRVI7XG5cbiAgICBpZiAoKGRpcmVjdGlvbiA9PSAnZG93bicgJiYgZWxzVG9UaGVFbmQgPCBCVUZGRVIpXG4gICAgICAgIHx8IChkaXJlY3Rpb24gPT0gJ3VwJyAmJiBlbHNGcm9tU3RhcnQgPCBCVUZGRVIpKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0SW5kZXggPSB0b3RhbEVsZW1lbnRzQmVmb3JlID4gMCA/IHRvdGFsRWxlbWVudHNCZWZvcmUgOiAwO1xuICAgICAgICB0aGlzLl9lbmRJbmRleCA9IHRvdGFsRWxlbWVudHNCZWZvcmUgKyBNQVhfUkVOREVSRUQ7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRIZWlnaHQgPSBmaXJzdENoaWxkLnN0eWxlLmhlaWdodDtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgdGhpcy5fbGFzdFNjcm9sbFBvcyA9IHNjcm9sbFBvcztcbn1cblxuXG4vKipcbiAqIFByaXZhdGUgbWV0aG9kXG4gKiBSZXRyaWV2ZXMgdGhlIGRhdGEtdmFsdWUgYXR0cmlidXRlIHZhbHVlIGZyb20gdGhlIGVsZW1lbnQgYW5kIHJldHVybnMgaXQgYXMgYW4gaW5kZXggb2ZcbiAqIHRoZSBmaWx0ZXJlZE9wdGlvbnNcbiAqXG4gKiBAcGFyYW0gIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBfZ2V0RGF0YVZhbHVlRnJvbUVsZW1lbnQoZWwpIHtcbiAgICByZXR1cm4gTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScpKSArIHRoaXMuX3N0YXJ0SW5kZXg7XG59XG5cbi8qKlxuICogUHJpdmF0ZSBtZXRob2RcbiAqIFNldHMgdGhlIGRhdGEgb2YgdGhlIFN1cGVyQ29tYm8sIHRha2luZyBjYXJlIHRvIHJlc2V0IHNvbWUgdGhpbmdzIGFuZCB0ZW1wb3JhcmlseVxuICogdW5zdWJzY3JpYmUgZGF0YSBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIF9zZXREYXRhKCkge1xuICAgIHRoaXMuaGlkZU9wdGlvbnMoKTtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSk7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLm9mZignJywgeyBzdWJzY3JpYmVyOiBvbkRhdGFDaGFuZ2UsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgLy9zdXBlcmNvbWJvIGxpc3RlbmVycyBvZmZcbiAgICB0aGlzLmRhdGEuc2V0KHRoaXMuX3NlbGVjdGVkKTtcbiAgICB0aGlzLl9jb21ib0lucHV0LmRhdGEub24oJycsIHsgc3Vic2NyaWJlcjogb25EYXRhQ2hhbmdlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vc3VwZXJjb21ibyBsaXN0ZW5lcnMgb25cbn1cblxuZnVuY3Rpb24gc2V0U2VsZWN0ZWQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fc2VsZWN0ZWQpIGRlbGV0ZSB0aGlzLl9zZWxlY3RlZC5zZWxlY3RlZDtcblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZCA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9zZWxlY3RlZC5zZWxlY3RlZCA9IHRydWU7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxUZXh0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFRleHQnLCB7XG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS10ZXh0J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MVGV4dCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxUZXh0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlcjtcblxuXG52YXIgTUxUZXh0YXJlYSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxUZXh0YXJlYScsIHtcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXRleHRhcmVhJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MVGV4dGFyZWEpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MVGV4dGFyZWE7XG5cblxudmFyIFNBTVBMRV9BVVRPUkVTSVpFX1RFWFQgPSAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVlciBhZGlwaXNjaW5nIGVsaXQsJztcblxuXG5fLmV4dGVuZFByb3RvKE1MVGV4dGFyZWEsIHtcbiAgICBzdGFydEF1dG9yZXNpemU6IE1MVGV4dGFyZWEkc3RhcnRBdXRvcmVzaXplLFxuICAgIHN0b3BBdXRvcmVzaXplOiBNTFRleHRhcmVhJHN0b3BBdXRvcmVzaXplLFxuICAgIGlzQXV0b3Jlc2l6ZWQ6IE1MVGV4dGFyZWEkaXNBdXRvcmVzaXplZCxcbiAgICBkaXNhYmxlOiBNTFRleHRhcmVhJGRpc2FibGVcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkc3RhcnRBdXRvcmVzaXplKG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5fYXV0b3Jlc2l6ZSlcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTFRleHRhcmVhIHN0YXJ0QXV0b3Jlc2l6ZTogYXV0b3Jlc2l6ZSBpcyBhbHJlYWR5IG9uJyk7XG4gICAgdGhpcy5fYXV0b3Jlc2l6ZSA9IHRydWU7XG4gICAgdGhpcy5fYXV0b3Jlc2l6ZU9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgX2FkanVzdEFyZWFIZWlnaHQuY2FsbCh0aGlzKTtcbiAgICBfbWFuYWdlU3Vic2NyaXB0aW9ucy5jYWxsKHRoaXMsICdvbicpO1xufVxuXG5cbmZ1bmN0aW9uIF9tYW5hZ2VTdWJzY3JpcHRpb25zKG9uT2ZmKSB7XG4gICAgdGhpcy5ldmVudHNbb25PZmZdKCdjbGljaycsIHsgc3Vic2NyaWJlcjogX2FkanVzdEFyZWFIZWlnaHQsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgdGhpcy5kYXRhW29uT2ZmXSgnJywgeyBzdWJzY3JpYmVyOiBfYWRqdXN0QXJlYUhlaWdodCwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuXG5mdW5jdGlvbiBfYWRqdXN0QXJlYUhlaWdodCgpIHtcbiAgICB0aGlzLmVsLnN0eWxlLmhlaWdodCA9IDA7XG5cbiAgICB2YXIgbmV3SGVpZ2h0ID0gdGhpcy5lbC5zY3JvbGxIZWlnaHRcbiAgICAgICAgLCBtaW5IZWlnaHQgPSB0aGlzLl9hdXRvcmVzaXplT3B0aW9ucy5taW5IZWlnaHRcbiAgICAgICAgLCBtYXhIZWlnaHQgPSB0aGlzLl9hdXRvcmVzaXplT3B0aW9ucy5tYXhIZWlnaHQ7XG5cbiAgICBuZXdIZWlnaHQgPSBuZXdIZWlnaHQgPj0gbWF4SGVpZ2h0XG4gICAgICAgICAgICAgICAgPyBtYXhIZWlnaHRcbiAgICAgICAgICAgICAgICA6IG5ld0hlaWdodCA8PSBtaW5IZWlnaHRcbiAgICAgICAgICAgICAgICA/IG1pbkhlaWdodFxuICAgICAgICAgICAgICAgIDogbmV3SGVpZ2h0O1xuXG4gICAgdGhpcy5lbC5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyAncHgnO1xufVxuXG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkc3RvcEF1dG9yZXNpemUoKSB7XG4gICAgaWYgKCEgdGhpcy5fYXV0b3Jlc2l6ZSlcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTFRleHRhcmVhIHN0b3BBdXRvcmVzaXplOiBhdXRvcmVzaXplIGlzIG5vdCBvbicpO1xuICAgIHRoaXMuX2F1dG9yZXNpemUgPSBmYWxzZTtcbiAgICBfbWFuYWdlU3Vic2NyaXB0aW9ucy5jYWxsKHRoaXMsICdvZmYnKTtcbn1cblxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJGlzQXV0b3Jlc2l6ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9yZXNpemU7XG59XG5cblxuZnVuY3Rpb24gTUxUZXh0YXJlYSRkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9hdXRvcmVzaXplKVxuICAgICAgICB0aGlzLnN0b3BBdXRvcmVzaXplKCk7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkZGlzYWJsZShkaXNhYmxlKSB7XG4gICAgdGhpcy5lbC5kaXNhYmxlZCA9IGRpc2FibGU7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxUaW1lID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFRpbWUnLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MVGltZV9nZXQsXG4gICAgICAgIHNldDogTUxUaW1lX3NldCxcbiAgICAgICAgZGVsOiBNTFRpbWVfZGVsLFxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXRpbWUnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxUaW1lKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFRpbWU7XG5cblxudmFyIFRJTUVfUkVHRVggPSAvXihbMC05XXsxLDJ9KSg/OlxcOnxcXC4pKFswLTldezEsMn0pJC9cbiAgICAsIFRJTUVfVEVNUExBVEUgPSAnaGg6bW0nO1xuXG5mdW5jdGlvbiBNTFRpbWVfZ2V0KCkge1xuICAgIHZhciB0aW1lU3RyID0gdGhpcy5lbC52YWx1ZTtcbiAgICB2YXIgbWF0Y2ggPSB0aW1lU3RyLm1hdGNoKFRJTUVfUkVHRVgpO1xuICAgIGlmICghIG1hdGNoKSByZXR1cm47XG4gICAgdmFyIGhvdXJzID0gbWF0Y2hbMV1cbiAgICAgICAgLCBtaW5zID0gbWF0Y2hbMl07XG4gICAgaWYgKGhvdXJzID4gMjMgfHwgbWlucyA+IDU5KSByZXR1cm47XG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgxOTcwLCAwLCAxLCBob3VycywgbWlucyk7XG5cbiAgICByZXR1cm4gXy50b0RhdGUodGltZSk7XG59XG5cblxuZnVuY3Rpb24gTUxUaW1lX3NldCh2YWx1ZSkge1xuICAgIHZhciB0aW1lID0gXy50b0RhdGUodmFsdWUpO1xuICAgIGlmICghIHRpbWUpIHtcbiAgICAgICAgdGhpcy5lbC52YWx1ZSA9ICcnO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbWVTdHIgPSBUSU1FX1RFTVBMQVRFXG4gICAgICAgICAgICAucmVwbGFjZSgnaGgnLCBwYWQodGltZS5nZXRIb3VycygpKSlcbiAgICAgICAgICAgIC5yZXBsYWNlKCdtbScsIHBhZCh0aW1lLmdldE1pbnV0ZXMoKSkpO1xuXG4gICAgdGhpcy5lbC52YWx1ZSA9IHRpbWVTdHI7XG4gICAgcmV0dXJuIHRpbWVTdHI7XG5cbiAgICBmdW5jdGlvbiBwYWQobikge3JldHVybiBuIDwgMTAgPyAnMCcgKyBuIDogbjsgfVxufVxuXG5cbmZ1bmN0aW9uIE1MVGltZV9kZWwoKSB7XG4gICAgdGhpcy5lbC52YWx1ZSA9ICcnO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTUxXcmFwcGVyID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTFdyYXBwZXInLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS13cmFwcGVyJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MV3JhcHBlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxXcmFwcGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgY29tcG9uZW50TmFtZSA9IG1pbG8udXRpbC5jb21wb25lbnROYW1lXG4gICAgLCBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxuXG52YXIgQUxFUlRfQ1NTX0NMQVNTRVMgPSB7XG4gICAgc3VjY2VzczogJ2FsZXJ0LXN1Y2Nlc3MnLFxuICAgIHdhcm5pbmc6ICdhbGVydC13YXJuaW5nJyxcbiAgICBpbmZvOiAnYWxlcnQtaW5mbycsXG4gICAgZGFuZ2VyOiAnYWxlcnQtZGFuZ2VyJyxcbiAgICBmaXhlZDogJ2FsZXJ0LWZpeGVkJ1xufTtcblxuXG52YXIgTUxBbGVydCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxBbGVydCcsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiBbJ21sLWJzLWFsZXJ0JywgJ2FsZXJ0JywgJ2ZhZGUnXSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgJ3JvbGUnOiAnYWxlcnQnLFxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnXFxcbiAgICAgICAgICAgIHt7PyBpdC5jbG9zZSB9fVxcXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiW2V2ZW50c106Y2xvc2VCdG5cIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvYnV0dG9uPlxcXG4gICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICB7ez0gaXQubWVzc2FnZX19J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQWxlcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQWxlcnQ7XG5cblxuXy5leHRlbmQoTUxBbGVydCwge1xuICAgIGNyZWF0ZUFsZXJ0OiBNTEFsZXJ0JCRjcmVhdGVBbGVydCxcbiAgICBvcGVuQWxlcnQ6IE1MQWxlcnQkJG9wZW5BbGVydCxcbn0pO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxBbGVydCwge1xuICAgIG9wZW5BbGVydDogTUxBbGVydCRvcGVuQWxlcnQsXG4gICAgY2xvc2VBbGVydDogTUxBbGVydCRjbG9zZUFsZXJ0XG59KTtcblxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBuZXcgYWxlcnQgaW5zdGFuY2UuIFRvIGNyZWF0ZSBhbmQgb3BlbiBhdCB0aGUgc2FtZSB0aW1lIHVzZSBbb3BlbkFsZXJ0XSgjTUxBbGVydCQkb3BlbkFsZXJ0KVxuICogYG9wdGlvbnNgIGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgICAgIG1lc3NhZ2U6IHN0cmluZyBhbGVydCBtZXNzYWdlXG4gKiAgICAgIHR5cGU6ICAgIG9wdGlvbmFsIHN0cmluZyB0aGUgdHlwZSBvZiBhbGVydCBtZXNzYWdlLCBvbmUgb2Ygc3VjY2Vzcywgd2FybmluZywgaW5mbywgZGFuZ2VyLCBmaXhlZFxuICogICAgICAgICAgICAgICBkZWZhdWx0ICdpbmZvJ1xuICogICAgICBjbG9zZTogICBvcHRpb25hbCBmYWxzZSB0byBwcmV2ZW50IHVzZXIgZnJvbSBjbG9zaW5nXG4gKiAgICAgICAgICAgICAgIG9yIHRydWUgKGRlZmF1bHQpIHRvIGVuYWJsZSBjbG9zaW5nIGFuZCByZW5kZXIgYSBjbG9zZSBidXR0b25cbiAqICAgICAgdGltZW91dDogb3B0aW9uYWwgdGltZXIsIGluIG1pbGxpc2Vjb25kcyB0byBhdXRvbWF0aWNhbGx5IGNsb3NlIHRoZSBhbGVydFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIGFsZXJ0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZnVuY3Rpb24gTUxBbGVydCQkY3JlYXRlQWxlcnQob3B0aW9ucykge1xuICAgIGNoZWNrKG9wdGlvbnMsIHtcbiAgICAgICAgbWVzc2FnZTogU3RyaW5nLFxuICAgICAgICB0eXBlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBjbG9zZTogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgIHRpbWVvdXQ6IE1hdGNoLk9wdGlvbmFsKE51bWJlcilcbiAgICB9KTtcblxuICAgIHZhciBhbGVydCA9IE1MQWxlcnQuY3JlYXRlT25FbGVtZW50KCk7XG5cbiAgICBvcHRpb25zID0gX3ByZXBhcmVPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgdmFyIGFsZXJ0Q2xzID0gQUxFUlRfQ1NTX0NMQVNTRVNbb3B0aW9ucy50eXBlXTtcbiAgICBhbGVydC5kb20uYWRkQ3NzQ2xhc3NlcyhhbGVydENscyk7XG5cbiAgICBhbGVydC5fYWxlcnQgPSB7XG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcblxuICAgIGFsZXJ0LnRlbXBsYXRlLnJlbmRlcihvcHRpb25zKS5iaW5kZXIoKTtcblxuICAgIHZhciBhbGVydFNjb3BlID0gYWxlcnQuY29udGFpbmVyLnNjb3BlO1xuXG4gICAgaWYgKG9wdGlvbnMuY2xvc2UpXG4gICAgICAgIGFsZXJ0U2NvcGUuY2xvc2VCdG4uZXZlbnRzLm9uKCdjbGljaycsXG4gICAgICAgICAgICB7IHN1YnNjcmliZXI6IF9vbkNsb3NlQnRuQ2xpY2ssIGNvbnRleHQ6IGFsZXJ0IH0pO1xuXG4gICAgaWYgKG9wdGlvbnMudGltZW91dClcbiAgICAgICAgdmFyIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoYWxlcnQuX2FsZXJ0LnZpc2libGUpXG4gICAgICAgICAgICAgICAgYWxlcnQuY2xvc2VBbGVydCgpO1xuICAgICAgICB9LCBvcHRpb25zLnRpbWVvdXQpO1xuXG4gICAgcmV0dXJuIGFsZXJ0O1xufVxuXG5cbi8qKlxuICogQ3JlYXRlIGFuZCBzaG93IGFsZXJ0IHBvcHVwXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0IHdpdGggbWVzc2FnZSwgdHlwZSwgY2xvc2UgYW5kIHRpbWVvdXRcbiAqIEByZXR1cm4ge01MQWxlcnR9IHRoZSBhbGVydCBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JCRvcGVuQWxlcnQob3B0aW9ucykge1xuICAgIHZhciBhbGVydCA9IE1MQWxlcnQuY3JlYXRlQWxlcnQob3B0aW9ucyk7XG4gICAgYWxlcnQub3BlbkFsZXJ0KCk7XG4gICAgcmV0dXJuIGFsZXJ0O1xufVxuXG5cbmZ1bmN0aW9uIF9vbkNsb3NlQnRuQ2xpY2sodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLmNsb3NlQWxlcnQoKTtcbn1cblxuXG5mdW5jdGlvbiBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBfLmNsb25lKG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuY2xvc2UgPSB0eXBlb2Ygb3B0aW9ucy5jbG9zZSA9PSAndW5kZWZpbmVkJyB8fCBvcHRpb25zLmNsb3NlID09PSB0cnVlO1xuICAgIG9wdGlvbnMudGltZW91dCA9IE1hdGguZmxvb3Iob3B0aW9ucy50aW1lb3V0KTtcbiAgICBvcHRpb25zLnR5cGUgPSBvcHRpb25zLnR5cGUgfHwgJ2luZm8nO1xuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59XG5cblxuLyoqXG4gKiBPcGVuIHRoZSBhbGVydFxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JG9wZW5BbGVydCgpIHtcbiAgICBfdG9nZ2xlQWxlcnQuY2FsbCh0aGlzLCB0cnVlKTtcbn1cblxuXG4vKipcbiAqIENsb3NlIHRoZSBhbGVydFxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JGNsb3NlQWxlcnQoKSB7XG4gICAgX3RvZ2dsZUFsZXJ0LmNhbGwodGhpcywgZmFsc2UpO1xuICAgIHRoaXMuZGVzdHJveSgpO1xufVxuXG5cbmZ1bmN0aW9uIF90b2dnbGVBbGVydChkb1Nob3cpIHtcbiAgICBkb1Nob3cgPSB0eXBlb2YgZG9TaG93ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgPyAhIHRoaXMuX2FsZXJ0LnZpc2libGVcbiAgICAgICAgICAgICAgICA6ICEhIGRvU2hvdztcblxuICAgIHZhciBhZGRSZW1vdmUgPSBkb1Nob3cgPyAnYWRkJyA6ICdyZW1vdmUnXG4gICAgICAgICwgYXBwZW5kUmVtb3ZlID0gZG9TaG93ID8gJ2FwcGVuZENoaWxkJyA6ICdyZW1vdmVDaGlsZCc7XG5cbiAgICB0aGlzLl9hbGVydC52aXNpYmxlID0gZG9TaG93O1xuXG4gICAgZG9jdW1lbnQuYm9keVthcHBlbmRSZW1vdmVdKHRoaXMuZWwpO1xuICAgIHRoaXMuZG9tLnRvZ2dsZShkb1Nob3cpO1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFkb1Nob3cpO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0W2FkZFJlbW92ZV0oJ2luJyk7XG4gICAgdGhpcy5lbFtkb1Nob3cgPyAnZm9jdXMnIDogJ2JsdXInXSgpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgY29tcG9uZW50TmFtZSA9IG1pbG8udXRpbC5jb21wb25lbnROYW1lXG4gICAgLCBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxuXG52YXIgREVGQVVMVF9CVVRUT05TID0gWyB7IHR5cGU6ICdkZWZhdWx0JywgbGFiZWw6ICdPSycsIHJlc3VsdDogJ09LJyB9IF07XG5cbnZhciBDTE9TRV9PUFRJT05TID0gWydiYWNrZHJvcCcsICdrZXlib2FyZCcsICdidXR0b24nXTtcblxudmFyIEJVVFRPTl9DU1NfQ0xBU1NFUyA9IHsgLy8gVE9ETyAtIHVzZSBpbiB0ZW1wbGF0ZVxuICAgIGRlZmF1bHQ6ICdidG4tZGVmYXVsdCcsXG4gICAgcHJpbWFyeTogJ2J0bi1wcmltYXJ5JyxcbiAgICBzdWNjZXNzOiAnYnRuLXN1Y2Nlc3MnLFxuICAgIGluZm86ICdidG4taW5mbycsXG4gICAgd2FybmluZzogJ2J0bi13YXJuaW5nJyxcbiAgICBkYW5nZXI6ICdidG4tZGFuZ2VyJyxcbiAgICBsaW5rOiAnYnRuLWxpbmsnXG59O1xuXG5cbi8qKlxuICogRGlhbG9nIGNsYXNzIHRvIHNob3cgY3VzdG9tIGRpYWxvZyBib3hlcyBiYXNlZCBvbiBjb25maWd1cmF0aW9uIC0gc2VlIFtjcmVhdGVEaWFsb2ddKCNNTERpYWxvZyQkY3JlYXRlRGlhbG9nKSBtZXRob2QuXG4gKiBPbmx5IG9uZSBkaWFsb2cgY2FuIGJlIG9wZW5lZCBhdCBhIHRpbWUgLSB0cnlpbmcgdG8gb3BlbiBhbm90aGVyIHdpbGwgbG9nIGVycm9yIHRvIGNvbnNvbGUuIEN1cnJlbnRseSBvcGVuZWQgZGlhbG9nIGNhbiBiZSByZXRyaWV2ZWQgdXNpbmcgW2dldEN1cnJlbnREaWFsb2ddKCNNTERpYWxvZyQkZ2V0Q3VycmVudERpYWxvZykgY2xhc3MgbWV0aG9kLlxuICovXG52YXIgTUxEaWFsb2cgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRGlhbG9nJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6IFsnbWwtYnMtZGlhbG9nJywgJ21vZGFsJywgJ2ZhZGUnXSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgJ3JvbGUnOiAnZGlhbG9nJyxcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJ1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ1xcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZGlhbG9nIHt7PSBpdC5jc3NDbGFzcyB9fVwiPlxcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez8gaXQudGl0bGUgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGl0LmNsb3NlLmJ1dHRvbiB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbWwtYmluZD1cIltldmVudHNdOmNsb3NlQnRuXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIj4mdGltZXM7PC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwibW9kYWwtdGl0bGVcIj57ez0gaXQudGl0bGUgfX08L2g0PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgIHt7PyBpdC5odG1sIHx8IGl0LnRleHQgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIiBtbC1iaW5kPVwiW2NvbnRhaW5lcl06ZGlhbG9nQm9keVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGl0Lmh0bWwgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez0gaXQuaHRtbCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+e3s9IGl0LnRleHQgfX08L3A+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgICAgIHt7PyBpdC5idXR0b25zICYmIGl0LmJ1dHRvbnMubGVuZ3RoIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1mb290ZXJcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7fiBpdC5idXR0b25zIDpidG4gfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImJ0biBidG4te3s9IGJ0bi50eXBlIH19e3s/IGJ0bi5jbHMgfX0ge3s9IGJ0bi5jbHMgfX17ez99fVwiXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1sLWJpbmQ9XCJbZXZlbnRzXTp7ez0gYnRuLm5hbWUgfX1cIj57ez0gYnRuLmxhYmVsIH19PC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e359fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgIDwvZGl2PidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERpYWxvZyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEaWFsb2c7XG5cblxuXy5leHRlbmQoTUxEaWFsb2csIHtcbiAgICBjcmVhdGVEaWFsb2c6IE1MRGlhbG9nJCRjcmVhdGVEaWFsb2csXG4gICAgb3BlbkRpYWxvZzogTUxEaWFsb2ckJG9wZW5EaWFsb2csXG4gICAgZ2V0T3BlbmVkRGlhbG9nOiBNTERpYWxvZyQkZ2V0T3BlbmVkRGlhbG9nXG59KTtcblxuXG5fLmV4dGVuZFByb3RvKE1MRGlhbG9nLCB7XG4gICAgb3BlbkRpYWxvZzogTUxEaWFsb2ckb3BlbkRpYWxvZyxcbiAgICBjbG9zZURpYWxvZzogTUxEaWFsb2ckY2xvc2VEaWFsb2csXG4gICAgZGVzdHJveTogTUxEaWFsb2ckZGVzdHJveVxufSk7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGFuZCByZXR1cm5zIGRpYWxvZyBpbnN0YW5jZS4gVG8gY3JlYXRlIGFuZCBvcGVuIGF0IHRoZSBzYW1lIHRpbWUgW29wZW5EaWFsb2ddKCNNTERpYWxvZyQkb3BlbkRpYWxvZylcbiAqIGBvcHRpb25zYCBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAgIHRpdGxlOiBvcHRpb25hbCBkaWFsb2cgdGl0bGVcbiAqICAgICBodG1sOiBvcHRpb25hbCBkaWFsb2cgdGV4dCBhcyBodG1sICh3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIHRleHQgaWYgYm90aCB0ZXh0IG5kIGh0bWwgYXJlIHBhc3NlZClcbiAqICAgICAgIG9yXG4gKiAgICAgdGV4dDogb3B0aW9uYWwgZGlhbG9nIHRleHRcbiAqICAgICBjbG9zZTogb3B0aW9uYWwgZmFsc2UgdG8gcHJldmVudCBiYWNrZHJvcCBhbmQgZXNjIGtleSBmcm9tIGNsb3NpbmcgdGhlIGRpYWxvZyBhbmQgcmVtb3ZpbmcgY2xvc2UgYnV0dG9uIGluIHRvcCByaWdodCBjb3JuZXJcbiAqICAgICAgICAgICAgb3IgdHJ1ZSAoZGVmYXVsdCkgdG8gZW5hYmxlIGFsbCBjbG9zZSBvcHRpb25zXG4gKiAgICAgICAgICAgIG9yIG9iamVjdCB3aXRoIHByb3BlcnRpZXNcbiAqICAgICAgICAgYmFja2Ryb3A6IGZhbHNlIG9yIHRydWUgKGRlZmF1bHQpLCBjbG9zZSBkaWFsb2cgd2hlbiBiYWNrZHJvcCBjbGlja2VkXG4gKiAgICAgICAgIGtleWJvYXJkOiBmYWxzZSBvciB0cnVlIChkZWZhdWx0KSwgY2xvc2UgZGlhbG9nIHdoZW4gZXNjIGtleSBpcyBwcmVzc2VkXG4gKiAgICAgICAgIGJ1dHRvbjogZmFsc2Ugb3IgdHJ1ZSAoZGVmYXVsdCksIHNob3cgY2xvc2UgYnV0dG9uIGluIHRoZSBoZWFkZXIgKHdvbid0IGJlIHNob3duIGlmIHRoZXJlIGlzIG5vIGhlYWRlciB3aGVuIHRpdGxlIGlzIG5vdCBwYXNzZWQpXG4gKiAgICAgYnV0dG9uczogb3B0aW9uYWwgYXJyYXkgb2YgYnV0dG9ucyBjb25maWd1cmF0aW9ucywgd2hlcmUgZWFjaCBidXR0b24gY29uZmlnIGlzIGFuIG9iamVjdFxuICogICAgICAgICBuYW1lOiAgIG9wdGlvbmFsIG5hbWUgb2YgY29tcG9uZW50LCBzaG91bGQgYmUgdW5pcXVlIGFuZCBzaG91bGQgbm90IGJlIGBjbG9zZUJ0bmAsIGlmIG5vdCBwYXNzZWQgYSB0aW1lc3RhbXAgYmFzZWQgbmFtZSB3aWxsIGJlIHVzZWRcbiAqICAgICAgICAgdHlwZTogICBidXR0b24gdHlwZSwgd2lsbCBkZXRlcm1pbmUgYnV0dG9uIENTUyBzdHlsZS4gUG9zc2libGUgdHlwZXMgYXJlOiBkZWZ1bHQsIHByaW1hcnksIHN1Y2Nlc3MsIGluZm8sIHdhcm5pbmcsIGRhbmdlciwgbGluayAobWFwIHRvIHJlbGF0ZWQgYm9vdHN0cmFwIGJ1dHRvbiBzdHlsZXMpXG4gKiAgICAgICAgIGxhYmVsOiAgYnV0dG9uIGxhYmVsXG4gKiAgICAgICAgIGNsb3NlOiAgb3B0aW9uYWwgZmFsc2UgdG8gcHJldmVudCB0aGlzIGJ1dHRvbiBmcm9tIGNsb3NpbmcgZGlhbG9nXG4gKiAgICAgICAgIHJlc3VsdDogc3RyaW5nIHdpdGggZGlhbG9nIGNsb3NlIHJlc3VsdCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIGRpYWxvZyBzdWJzY3JpYmVyIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAqICAgICAgICAgZGF0YTogICBhbnkgdmFsdWUvb2JqZWN0IG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSBkYXRhIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gZGlhbG9nIHN1YnNjcmliZXIgYXMgdGhlIHNlY29uZCBwYXJhbWV0ZXIuXG4gKiAgICAgICAgICAgICAgICAgSWYgZnVuY3Rpb24gaXMgcGFzc2VkIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggZGlhbG9nIGFzIGNvbnRleHQgYW5kIGJ1dHRvbiBvcHRpb25zIGFzIHBhcmFtZXRlci5cbiAqXG4gKiAgICAgSWYgYHRpdGxlYCBpcyBub3QgcGFzc2VkLCBkaWFsb2cgd2lsbCBub3QgaGF2ZSB0aXRsZSBzZWN0aW9uXG4gKiAgICAgSWYgbmVpdGhlciBgdGV4dGAgbm9yIGBodG1sYCBpcyBwYXNzZWQsIGRpYWxvZyB3aWxsIG5vdCBoYXZlIGJvZHkgc2VjdGlvbi5cbiAqICAgICBJZiBgYnV0dG9uc2AgYXJlIG5vdCBwYXNzZWQsIHRoZXJlIHdpbGwgb25seSBiZSBPSyBidXR0b24uXG4gKlxuICogV2hlbiBkaWFsb2cgaXMgY2xvc2VkLCB0aGUgc3Vic2NyaWJlciBpcyBjYWxsZWQgd2l0aCByZWF1bHQgYW5kIG9wdGlvbmFsIGRhdGEgYXMgZGVmaW5lZCBpbiBidXR0b25zIGNvbmZpZ3VyYXRpb25zLlxuICogSWYgYmFja2Ryb3AgaXMgY2xpY2tlZCBvciBFU0Mga2V5IGlzIHByZXNzZWQgdGhlIHJlc3VsdCB3aWxsIGJlICdkaXNtaXNzZWQnXG4gKiBJZiBjbG9zZSBidXR0b24gaW4gdGhlIHRvcCByaWdodCBjb3JuZXIgaXMgY2xpY2tlZCwgdGhlIHJlc3VsdCB3aWxsIGJlICdjbG9zZWQnIChkZWZhdWx0IHJlc3VsdClcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBkaWFsb2cgY29uZmlndXJhdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gaW5pdGlhbGl6ZSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB0byBpbml0aWFsaXplIHRoZSBkaWFsb2dcbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckJGNyZWF0ZURpYWxvZyhvcHRpb25zLCBpbml0aWFsaXplKSB7XG4gICAgY2hlY2sob3B0aW9ucywge1xuICAgICAgICB0aXRsZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgaHRtbDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgdGV4dDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgY2xvc2U6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLk9uZU9mKEJvb2xlYW4sIHtcbiAgICAgICAgICAgIGJhY2tkcm9wOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgICAgIGtleWJvYXJkOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgICAgICAgIGJ1dHRvbjogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbilcbiAgICAgICAgfSkpLFxuICAgICAgICBidXR0b25zOiBNYXRjaC5PcHRpb25hbChbIHtcbiAgICAgICAgICAgIG5hbWU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgICAgICBsYWJlbDogU3RyaW5nLFxuICAgICAgICAgICAgY2xvc2U6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgICAgICAgcmVzdWx0OiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICAgICAgZGF0YTogTWF0Y2guT3B0aW9uYWwoTWF0Y2guQW55KSxcbiAgICAgICAgICAgIGNsczogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKVxuICAgICAgICB9IF0pLFxuICAgICAgICBjc3NDbGFzczogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKVxuICAgIH0pO1xuXG4gICAgdmFyIGRpYWxvZyA9IE1MRGlhbG9nLmNyZWF0ZU9uRWxlbWVudCgpO1xuXG4gICAgb3B0aW9ucyA9IF9wcmVwYXJlT3B0aW9ucyhvcHRpb25zKTtcbiAgICBkaWFsb2cuX2RpYWxvZyA9IHtcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuXG4gICAgZGlhbG9nLnRlbXBsYXRlXG4gICAgICAgIC5yZW5kZXIob3B0aW9ucylcbiAgICAgICAgLmJpbmRlcigpO1xuXG4gICAgdmFyIGRpYWxvZ1Njb3BlID0gZGlhbG9nLmNvbnRhaW5lci5zY29wZTtcblxuICAgIGlmIChvcHRpb25zLmNsb3NlLmJhY2tkcm9wKVxuICAgICAgICBkaWFsb2cuZXZlbnRzLm9uKCdjbGljaycsXG4gICAgICAgICAgICB7IHN1YnNjcmliZXI6IF9vbkJhY2tkcm9wQ2xpY2ssIGNvbnRleHQ6IGRpYWxvZyB9KTtcblxuICAgIGlmIChvcHRpb25zLnRpdGxlICYmIG9wdGlvbnMuY2xvc2UuYnV0dG9uKVxuICAgICAgICBkaWFsb2dTY29wZS5jbG9zZUJ0bi5ldmVudHMub24oJ2NsaWNrJyxcbiAgICAgICAgICAgIHsgc3Vic2NyaWJlcjogX29uQ2xvc2VCdG5DbGljaywgY29udGV4dDogZGlhbG9nIH0pO1xuXG4gICAgb3B0aW9ucy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24oYnRuKSB7XG4gICAgICAgIHZhciBidXR0b25TdWJzY3JpYmVyID0ge1xuICAgICAgICAgICAgc3Vic2NyaWJlcjogXy5wYXJ0aWFsKF9kaWFsb2dCdXR0b25DbGljaywgYnRuKSxcbiAgICAgICAgICAgIGNvbnRleHQ6IGRpYWxvZ1xuICAgICAgICB9O1xuICAgICAgICBkaWFsb2dTY29wZVtidG4ubmFtZV0uZXZlbnRzLm9uKCdjbGljaycsIGJ1dHRvblN1YnNjcmliZXIpO1xuICAgIH0pO1xuXG4gICAgaWYgKGluaXRpYWxpemUpIGluaXRpYWxpemUoZGlhbG9nKTtcbiAgICByZXR1cm4gZGlhbG9nO1xufVxuXG5cbmZ1bmN0aW9uIF9kaWFsb2dCdXR0b25DbGljayhidXR0b24pIHtcbiAgICBpZiAoYnV0dG9uLmNsb3NlICE9PSBmYWxzZSlcbiAgICAgICAgX3RvZ2dsZURpYWxvZy5jYWxsKHRoaXMsIGZhbHNlKTtcblxuICAgIHZhciBkYXRhID0gXy5yZXN1bHQoYnV0dG9uLmRhdGEsIHRoaXMsIGJ1dHRvbik7XG4gICAgX2Rpc3BhdGNoUmVzdWx0LmNhbGwodGhpcywgYnV0dG9uLnJlc3VsdCwgZGF0YSk7XG59XG5cblxuZnVuY3Rpb24gX2Rpc3BhdGNoUmVzdWx0KHJlc3VsdCwgZGF0YSkge1xuICAgIHZhciBzdWJzY3JpYmVyID0gdGhpcy5fZGlhbG9nLnN1YnNjcmliZXI7XG4gICAgaWYgKHR5cGVvZiBzdWJzY3JpYmVyID09ICdmdW5jdGlvbicpXG4gICAgICAgIHN1YnNjcmliZXIuY2FsbCh0aGlzLCByZXN1bHQsIGRhdGEpO1xuICAgIGVsc2VcbiAgICAgICAgc3Vic2NyaWJlci5zdWJzY3JpYmVyLmNhbGwoc3Vic2NyaWJlci5jb250ZXh0LCByZXN1bHQsIGRhdGEpO1xufVxuXG5cbmZ1bmN0aW9uIF9vbkJhY2tkcm9wQ2xpY2soZXZlbnRUeXBlLCBldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQgPT0gdGhpcy5lbClcbiAgICAgICAgdGhpcy5jbG9zZURpYWxvZygnZGlzbWlzc2VkJyk7XG59XG5cblxuZnVuY3Rpb24gX29uQ2xvc2VCdG5DbGljaygpIHtcbiAgICB0aGlzLmNsb3NlRGlhbG9nKCdjbG9zZWQnKTtcbn1cblxuXG5mdW5jdGlvbiBfb25LZXlEb3duKGV2ZW50KSB7XG4gICAgaWYgKG9wZW5lZERpYWxvZ1xuICAgICAgICAgICAgJiYgb3BlbmVkRGlhbG9nLl9kaWFsb2cub3B0aW9ucy5jbG9zZS5rZXlib2FyZFxuICAgICAgICAgICAgJiYgZXZlbnQua2V5Q29kZSA9PSAyNykgLy8gZXNjIGtleVxuICAgICAgICBvcGVuZWREaWFsb2cuY2xvc2VEaWFsb2coJ2Rpc21pc3NlZCcpO1xufVxuXG5cbmZ1bmN0aW9uIF9wcmVwYXJlT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IF8uY2xvbmUob3B0aW9ucyk7XG4gICAgb3B0aW9ucy5idXR0b25zID0gXy5jbG9uZShvcHRpb25zLmJ1dHRvbnMgfHwgREVGQVVMVF9CVVRUT05TKTtcbiAgICBvcHRpb25zLmJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbihidG4pIHtcbiAgICAgICAgYnRuLm5hbWUgPSBidG4ubmFtZSB8fCBjb21wb25lbnROYW1lKCk7XG4gICAgfSk7XG5cbiAgICBvcHRpb25zLmNsb3NlID0gdHlwZW9mIG9wdGlvbnMuY2xvc2UgPT0gJ3VuZGVmaW5lZCcgfHwgb3B0aW9ucy5jbG9zZSA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfLm9iamVjdChDTE9TRV9PUFRJT05TLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0eXBlb2Ygb3B0aW9ucy5jbG9zZSA9PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXy5tYXBUb09iamVjdChDTE9TRV9PUFRJT05TLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihvcHQpIHsgcmV0dXJuIG9wdGlvbnMuY2xvc2Vbb3B0XSAhPT0gZmFsc2U7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfLm9iamVjdChDTE9TRV9PUFRJT05TLCBmYWxzZSk7XG5cbiAgICByZXR1cm4gb3B0aW9ucztcbn1cblxuXG4vKipcbiAqIENyZWF0ZSBhbmQgc2hvdyBkaWFsb2cgcG9wdXBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBvYmplY3Qgd2l0aCB0aXRsZSwgdGV4dCBhbmQgYnV0dG9ucy4gU2VlIFtjcmVhdGVEaWFsb2ddKCNNTERpYWxvZyQkY3JlYXRlRGlhbG9nKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBzdWJzY3JpYmVyIG9wdGlvbmFsIHN1YnNjcmliZXIgZnVuY3Rpb24gb3Igb2JqZWN0IHRoYXQgaXMgcGFzc2VkIHJlc3VsdCBhbmQgb3B0aW9uYWwgZGF0YS4gVW5sZXNzIGNvbnRleHQgaXMgZGVmaW5lZCwgZGlhbG9nIHdpbGwgYmUgdGhlIGNvbnRleHQuXG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJCRvcGVuRGlhbG9nKG9wdGlvbnMsIHN1YnNjcmliZXIsIGluaXRpYWxpemUpIHtcbiAgICB2YXIgZGlhbG9nID0gTUxEaWFsb2cuY3JlYXRlRGlhbG9nKG9wdGlvbnMsIGluaXRpYWxpemUpO1xuICAgIGRpYWxvZy5vcGVuRGlhbG9nKHN1YnNjcmliZXIpO1xuICAgIHJldHVybiBkaWFsb2c7XG59XG5cblxuXG5mdW5jdGlvbiBfdG9nZ2xlRGlhbG9nKGRvU2hvdykge1xuICAgIGRvU2hvdyA9IHR5cGVvZiBkb1Nob3cgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgICAgICA/ICEgdGhpcy5fZGlhbG9nLnZpc2libGVcbiAgICAgICAgICAgICAgICA6ICEhIGRvU2hvdztcblxuICAgIHZhciBhZGRSZW1vdmUgPSBkb1Nob3cgPyAnYWRkJyA6ICdyZW1vdmUnXG4gICAgICAgICwgYXBwZW5kUmVtb3ZlID0gZG9TaG93ID8gJ2FwcGVuZENoaWxkJyA6ICdyZW1vdmVDaGlsZCc7XG5cbiAgICB0aGlzLl9kaWFsb2cudmlzaWJsZSA9IGRvU2hvdztcblxuICAgIGlmIChkb1Nob3cgJiYgISBkaWFsb2dzSW5pdGlhbGl6ZWQpXG4gICAgICAgIF9pbml0aWFsaXplRGlhbG9ncygpO1xuXG4gICAgZG9jdW1lbnQuYm9keVthcHBlbmRSZW1vdmVdKHRoaXMuZWwpO1xuICAgIGlmIChiYWNrZHJvcEVsKVxuICAgICAgICBkb2N1bWVudC5ib2R5W2FwcGVuZFJlbW92ZV0oYmFja2Ryb3BFbCk7XG4gICAgdGhpcy5kb20udG9nZ2xlKGRvU2hvdyk7XG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgIWRvU2hvdyk7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3RbYWRkUmVtb3ZlXSgnbW9kYWwtb3BlbicpO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0W2FkZFJlbW92ZV0oJ2luJyk7XG5cbiAgICBvcGVuZWREaWFsb2cgPSBkb1Nob3cgPyB0aGlzIDogdW5kZWZpbmVkO1xuICAgIHRoaXMuZWxbZG9TaG93ID8gJ2ZvY3VzJyA6ICdibHVyJ10oKTtcbn1cblxuXG52YXIgZGlhbG9nc0luaXRpYWxpemVkLCBiYWNrZHJvcEVsO1xuXG5mdW5jdGlvbiBfaW5pdGlhbGl6ZURpYWxvZ3MoKSB7XG4gICAgYmFja2Ryb3BFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGJhY2tkcm9wRWwuY2xhc3NOYW1lID0gJ21vZGFsLWJhY2tkcm9wIGZhZGUgaW4nO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfb25LZXlEb3duKTtcbiAgICBkaWFsb2dzSW5pdGlhbGl6ZWQgPSB0cnVlO1xufVxuXG5cbnZhciBvcGVuZWREaWFsb2c7XG5cbi8qKlxuICogT3BlbnMgZGlhbG9nIGluc3RhbmNlLlxuICogU3Vic2NyaWJlciBvYmplY3Qgc2hvdWxkIGhhdmUgdGhlIHNhbWUgZm9ybWF0IGFzIHRoZSBzdWJzY3JpYmVyIGZvciB0aGUgTWVzc2VuZ2VyIChhbHRob3VnaCBNZXNzZW5nZXIgaXMgbm90IHVzZWQpIC0gZWl0aGVyIGZ1bmN0aW9uIG9yIG9iamVjdCB3aXRoIHN1YnNjcmliZXIgYW5kIGNvbnRleHQgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gc3Vic2NyaWJlciBzdWJzY3JpYmVyIG9iamVjdFxuICovXG5mdW5jdGlvbiBNTERpYWxvZyRvcGVuRGlhbG9nKHN1YnNjcmliZXIpIHtcbiAgICBjaGVjayhzdWJzY3JpYmVyLCBNYXRjaC5PbmVPZihGdW5jdGlvbiwgeyBzdWJzY3JpYmVyOiBGdW5jdGlvbiwgY29udGV4dDogTWF0Y2guQW55IH0pKTtcblxuICAgIGlmIChvcGVuZWREaWFsb2cpXG4gICAgICAgIHJldHVybiBsb2dnZXIud2FybignTUxEaWFsb2cgb3BlbkRpYWxvZzogY2FuXFwndCBvcGVuIGRpYWxvZywgYW5vdGhlciBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuJyk7XG5cbiAgICB0aGlzLl9kaWFsb2cuc3Vic2NyaWJlciA9IHN1YnNjcmliZXI7XG4gICAgX3RvZ2dsZURpYWxvZy5jYWxsKHRoaXMsIHRydWUpO1xufVxuXG5cbi8qKlxuICogQ2xvc2VzIGRpYWxvZyBpbnN0YW5jZSwgb3B0aW9uYWxseSBwYXNzaW5nIHJlc3VsdCBhbmQgZGF0YSB0byBkaWFsb2cgc3Vic2NyaWJlci5cbiAqIElmIG5vIHJlc3VsdCBpcyBwYXNzZWQsICdjbG9zZWQnIHdpbGwgYmUgcGFzc2VkIHRvIHN1YnNjcmliZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHJlc3VsdCBkaWFsb2cgcmVzdWx0LCBwYXNzZWQgYXMgdGhlIGZpcnN0IHBhcmFtZXRlciB0byBzdWJjc3JpYmVyXG4gKiBAcGFyYW0ge0FueX0gZGF0YSBvcHRpb25hbCBkaWFsb2cgZGF0YSwgcGFzc2VkIGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIHN1YnNjcmliZXJcbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckY2xvc2VEaWFsb2cocmVzdWx0LCBkYXRhKSB7XG4gICAgaWYgKCEgb3BlbmVkRGlhbG9nKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLndhcm4oJ01MRGlhbG9nIGNsb3NlRGlhbG9nOiBjYW5cXCd0IGNsb3NlIGRpYWxvZywgbm8gZGlhbG9nIG9wZW4nKTtcblxuICAgIHJlc3VsdCA9IHJlc3VsdCB8fCAnY2xvc2VkJztcblxuICAgIF90b2dnbGVEaWFsb2cuY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgX2Rpc3BhdGNoUmVzdWx0LmNhbGwodGhpcywgcmVzdWx0LCBkYXRhKTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgY3VycmVudGx5IG9wZW5lZCBkaWFsb2dcbiAqXG4gKiBAcmV0dXJuIHtNTERpYWxvZ31cbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckJGdldE9wZW5lZERpYWxvZygpIHtcbiAgICByZXR1cm4gb3BlbmVkRGlhbG9nO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGlhbG9nJGRlc3Ryb3koKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9vbktleURvd24pO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgRE9NTGlzdGVuZXJzID0gbWlsby51dGlsLmRvbUxpc3RlbmVycztcblxuXG52YXIgVE9HR0xFX0NTU19DTEFTUyA9ICdkcm9wZG93bi10b2dnbGUnXG4gICAgLCBNRU5VX0NTU19DTEFTUyA9ICdkcm9wZG93bi1tZW51JztcblxuXG52YXIgTUxEcm9wZG93biA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxEcm9wZG93bicsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiBbJ21sLWJzLWRyb3Bkb3duJywgJ2Ryb3Bkb3duJ11cbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERyb3Bkb3duKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTERyb3Bkb3duO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxEcm9wZG93biwge1xuICAgIHN0YXJ0OiBNTERyb3Bkb3duJHN0YXJ0LFxuICAgIGRlc3Ryb3k6IE1MRHJvcGRvd24kZGVzdHJveSxcbiAgICB0b2dnbGVNZW51OiBNTERyb3Bkb3duJHRvZ2dsZU1lbnUsXG4gICAgc2hvd01lbnU6IE1MRHJvcGRvd24kc2hvd01lbnUsXG4gICAgaGlkZU1lbnU6IE1MRHJvcGRvd24kaGlkZU1lbnVcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kc3RhcnQoKSB7XG4gICAgdmFyIHRvZ2dsZUVsID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcuJyArIFRPR0dMRV9DU1NfQ0xBU1MpXG4gICAgICAgICwgbWVudUVsID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcuJyArIE1FTlVfQ1NTX0NMQVNTKTtcblxuICAgIGlmICghICh0b2dnbGVFbCAmJiBtZW51RWwpKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLmVycm9yKCdNTERyb3Bkb3duOicsIFRPR0dMRV9DU1NfQ0xBU1MsICdvcicsIE1FTlVfQ1NTX0NMQVNTLCAnaXNuXFwndCBmb3VuZCcpO1xuXG4gICAgdmFyIGRvYyA9IHdpbmRvdy5kb2N1bWVudFxuICAgICAgICAsIGNsaWNrSGFuZGxlciA9IHRoaXMudG9nZ2xlTWVudS5iaW5kKHRoaXMsIHVuZGVmaW5lZCk7XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gbmV3IERPTUxpc3RlbmVycztcbiAgICB0aGlzLl9kcm9wZG93biA9IHtcbiAgICAgICAgbWVudTogbWVudUVsLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgbGlzdGVuZXJzOiBsaXN0ZW5lcnNcbiAgICB9O1xuICAgIHRoaXMuaGlkZU1lbnUoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBsaXN0ZW5lcnMuYWRkKHRvZ2dsZUVsLCAnY2xpY2snLCBjbGlja0hhbmRsZXIpO1xuICAgIC8vbWF5YmUgb25seSBhZGQgdGhpcyBldmVudHMgaWYgaXMgb3Blbj9cbiAgICBsaXN0ZW5lcnMuYWRkKGRvYywgJ21vdXNlb3V0Jywgb25Eb2NPdXQpO1xuICAgIGxpc3RlbmVycy5hZGQoZG9jLCAnY2xpY2snLCBvbkNsaWNrKTtcblxuXG4gICAgZnVuY3Rpb24gb25Eb2NPdXQoZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldFxuICAgICAgICAgICAgLCByZWxhdGVkVGFyZ2V0ID0gZXZlbnQucmVsYXRlZFRhcmdldFxuICAgICAgICAgICAgLCBsaXN0ZW5lcnMgPSBzZWxmLl9kcm9wZG93bi5saXN0ZW5lcnM7XG5cbiAgICAgICAgaWYgKGlzSWZyYW1lKHRhcmdldCkpXG4gICAgICAgICAgICBsaXN0ZW5lcnMucmVtb3ZlKHRhcmdldC5jb250ZW50V2luZG93LmRvY3VtZW50LCAnY2xpY2snLCBvbkNsaWNrKTtcblxuICAgICAgICBpZiAoaXNJZnJhbWUocmVsYXRlZFRhcmdldCkpXG4gICAgICAgICAgICBsaXN0ZW5lcnMuYWRkKHJlbGF0ZWRUYXJnZXQuY29udGVudFdpbmRvdy5kb2N1bWVudCwgJ2NsaWNrJywgb25DbGljayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25DbGljayhldmVudCkge1xuICAgICAgICBpZiAoIXNlbGYuZWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSlcbiAgICAgICAgICAgIHNlbGYuaGlkZU1lbnUoKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gaXNJZnJhbWUoZWwpIHtcbiAgICByZXR1cm4gZWwgJiYgZWwudGFnTmFtZSA9PSAnSUZSQU1FJztcbn1cblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZHJvcGRvd24ubGlzdGVuZXJzLnJlbW92ZUFsbCgpO1xuICAgIGRlbGV0ZSB0aGlzLl9kcm9wZG93bjtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJHNob3dNZW51KCkge1xuICAgIHRoaXMudG9nZ2xlTWVudSh0cnVlKTtcbn1cblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJGhpZGVNZW51KCkge1xuICAgIHRoaXMudG9nZ2xlTWVudShmYWxzZSk7XG59XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biR0b2dnbGVNZW51KGRvU2hvdykge1xuICAgIGRvU2hvdyA9IHR5cGVvZiBkb1Nob3cgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgICAgICA/ICEgdGhpcy5fZHJvcGRvd24udmlzaWJsZVxuICAgICAgICAgICAgICAgIDogISEgZG9TaG93O1xuXG4gICAgdGhpcy5fZHJvcGRvd24udmlzaWJsZSA9IGRvU2hvdztcblxuICAgIHZhciBtZW51ID0gdGhpcy5fZHJvcGRvd24ubWVudTtcbiAgICBtZW51LnN0eWxlLmRpc3BsYXkgPSBkb1Nob3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdibG9jaydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdub25lJztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGZvcm1HZW5lcmF0b3IgPSByZXF1aXJlKCcuL2dlbmVyYXRvcicpXG4gICAgLCBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgZm9ybVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9yZWdpc3RyeScpXG4gICAgLCBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jJyk7XG5cblxudmFyIEZPUk1fVkFMSURBVElPTl9GQUlMRURfQ1NTX0NMQVNTID0gJ2hhcy1lcnJvcic7XG5cbi8qKlxuICogQSBjb21wb25lbnQgY2xhc3MgZm9yIGdlbmVyYXRpbmcgZm9ybXMgZnJvbSBzY2hlbWFcbiAqIFRvIGNyZWF0ZSBmb3JtIGNsYXNzIG1ldGhvZCBbY3JlYXRlRm9ybV0oI01MRm9ybSQkY3JlYXRlRm9ybSkgc2hvdWxkIGJlIHVzZWQuXG4gKiBGb3JtIHNjaGVtYSBoYXMgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKiBgYGBcbiAqIHZhciBzY2hlbWEgPSB7XG4gKiAgICAgY3NzOiB7XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3B0aW9uYWwgQ1NTIGZhY2V0IGNvbmZpZ3VyYXRpb25cbiAqICAgICAgICAgY2xhc3NlczogeyAuLi4gfVxuICogICAgIH0sXG4gKiAgICAgaXRlbXM6IFtcbiAqICAgICAgICAge1xuICogICAgICAgICAgICAgdHlwZTogJzx0eXBlIG9mIHVpIGNvbnRyb2w+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYW4gYmUgZ3JvdXAsIHNlbGVjdCwgaW5wdXQsIGJ1dHRvbiwgcmFkaW8sXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaHlwZXJsaW5rLCBjaGVja2JveCwgbGlzdCwgdGltZSwgZGF0ZVxuICogICAgICAgICAgICAgY29tcE5hbWU6ICc8Y29tcG9uZW50IG5hbWU+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbCBuYW1lIG9mIGNvbXBvbmVudCwgc2hvdWxkIGJlIHVuaXF1ZSB3aXRoaW4gdGhlIGZvcm1cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAob3IgZm9ybSBncm91cCksIG9ubHkgbmVlZHMgdG9iZSB1c2VkIHdoZW4gY29tcG9uZW50IG5lZWRzIHRvIGJlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFuaXBpbGF0ZWQgaW4gc29tZSBldmVudCBoYW5kbGVyIGFuZCBpdCBjYW5ub3QgYmUgYWNjZXNzZWQgdmlhIG1vZGVsUGF0aFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVzaW5nIGBtb2RlbFBhdGhDb21wb25lbnRgIG1ldGhvZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICh3aGljaCBpcyBhIHByZWZlcnJlZCB3YXkgdG8gYWNjZXNzIGNvbnBvbmVudHMgaW4gZm9ybSlcbiAqICAgICAgICAgICAgIGxhYmVsOiAnPHVpIGNvbnRyb2wgbGFiZWw+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbCBsYWJlbCwgd2lsbCBub3QgYmUgYWRkZWQgaWYgbm90IGRlZmluZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvciBlbXB0eSBzdHJpbmdcbiAqICAgICAgICAgICAgIGFsdFRleHQ6ICc8YWx0IHRleHQgb3IgdGl0bGU+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbCBhbHQgdGV4dCBzdHJpbmcgb24gYnV0dG9ucyBhbmQgaHlwZXJsaW5rc1xuICogICAgICAgICAgICAgbW9kZWxQYXRoOiAnPG1vZGVsIG1hcHBpbmc+JyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwYXRoIGluIG1vZGVsIHdoZXJlIHRoZSB2YWx1ZSB3aWxsIGJlIHN0b3JlZC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNb3N0IHR5cGVzIG9mIGl0ZW1zIHJlcXVpcmUgdGhpcyBwcm9wZXJ0eSxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzb21lIGl0ZW1zIG1heSBoYXZlIHRoaXMgcHJvcGVydHkgKGJ1dHRvbiwgZS5nLiksXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJncm91cFwiIG11c3QgTk9UIGhhdmUgdGhpcyBwcm9wZXJ0eS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXYXJuaW5nIHdpbGwgYmUgbG9nZ2VkIGlmIHRoZXNlIHJ1bGVzIGFyZSBub3QgZm9sbG93ZWQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSXRlbXMgd2l0aG91dCB0aGlzIHByb3BlcnR5IHdpbGwgbm90IGJlIGluIG1vZGVsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKGFwYXJ0IGZyb20gXCJncm91cCB3aGljaCBzdWJpdGVtcyB3aWxsIGJlIGluIG1vZGVsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhleSBoYXZlIHRoaXMgcHJvcGVydHkpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG8gaGF2ZSBmaXhlZCBmb3JtIG1vZGVsIHN0cnVjdHVyZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoaWxlIGNoYW5naW5nIHZpZXcgc3RydWN0dXJlIG9mIHRoZSBmb3JtXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VlIE1vZGVsLlxuICogICAgICAgICAgICAgbW9kZWxQYXR0ZXJuOiAnbWFwcGluZyBleHRlbnNpb24gcGF0dGVybicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoc3RyaW5nKVxuICogICAgICAgICAgICAgbm90SW5Nb2RlbDogdHJ1ZSxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FsbG93cyB0byBOT1QgaW5jbHVkZSBtb2RlbFBhdGggd2hlcmUgb3RoZXJ3aXNlIGl0IHdvdWxkIGJlIHJlcXVpcmVkXG4gKiAgICAgICAgICAgICBtZXNzYWdlczogeyAgICAgICAgICAgICAgICAgICAgICAvLyB0byBzdWJzY3JpYmUgdG8gbWVzc2FnZXMgb24gaXRlbSdzIGNvbXBvbmVudCBmYWNldHNcbiAqICAgICAgICAgICAgICAgICBldmVudHM6IHsgICAgICAgICAgICAgICAgICAgIC8vIGZhY2V0IHRvIHN1YnNjcmliZSB0b1xuICogICAgICAgICAgICAgICAgICAgICAnPG1lc3NhZ2UxPic6IG9uTWVzc2FnZTEgLy8gbWVzc2FnZSBhbmQgc3Vic2NyaWJlciBmdW5jdGlvblxuICogICAgICAgICAgICAgICAgICAgICAnPG1zZzI+IDxtc2czPic6IHsgICAgICAgLy8gc3Vic2NyaWJlIHRvIDIgbWVzc2FnZXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXI6IG9uTWVzc2FnZTIsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0ICAgICAvLyBjb250ZXh0IGNhbiBiZSBhbiBvYmplY3Qgb3IgYSBzdHJpbmc6XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcImZhY2V0XCI6IGZhY2V0IGluc3RhbmNlIHdpbGwgYmUgdXNlZCBhcyBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcIm93bmVyXCI6IGl0ZW0gY29tcG9uZW50IGluc3RhbmNlIHdpbGwgYmUgdXNlZCBhcyBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcImZvcm1cIjogdGhlIGZvcm0gY29tcG9uZW50IGluc3RhbmNlIHdpbGwgYmUgdXNlZCBhcyBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcImhvc3RcIjogaG9zdCBvYmplY3QgcGFzc2VkIHRvIGNyZWF0ZUZvcm0gbWV0aG9kIHdpbGwgYmUgdXNlZCBhcyBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgIH1cbiAqICAgICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICAgICB9LFxuICogICAgICAgICAgICAgdHJhbnNsYXRlOiB7ICAgICAgICAgIC8vIG9wdGlvbmFsIGRhdGEgdHJhbnNsYXRpb24gZnVuY3Rpb25zXG4gKiAgICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0ICAgLy8gb3B0aW9uYWwgY29udGV4dCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRyYW5zbGF0ZSBmdW5jdGlvbnMsICdob3N0JyBtZWFucyB0aGUgaG9zdE9iamVjdCBwYXNzZWQgdG8gRm9ybS5jcmVhdGVGb3JtXG4gKiAgICAgICAgICAgICAgICAgdG9Nb2RlbDogZnVuYzEsICAgLy8gdHJhbnNsYXRlcyBpdGVtIGRhdGEgZnJvbSB2aWV3IHRvIG1vZGVsXG4gKiAgICAgICAgICAgICAgICAgZnJvbU1vZGVsOiBmdW5jMiAgLy8gdHJhbnNsYXRlcyBpdGVtIGRhdGEgZnJvbSBtb2RlbCB0byB2aWV3XG4gKiAgICAgICAgICAgICB9LFxuICogICAgICAgICAgICAgdmFsaWRhdGU6IHsgICAgICAgICAgIC8vIG9wdGlvbmFsIGRhdGEgdmFsaWRhdGlvbiBmdW5jdGlvbnNcbiAqICAgICAgICAgICAgICAgICBjb250ZXh0OiBPYmplY3QgICAvLyBvcHRpb25hbCBjb250ZXh0IHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gdmFsaWRhdGUgZnVuY3Rpb25zLCAnaG9zdCcgbWVhbnMgdGhlIGhvc3RPYmplY3QgcGFzc2VkIHRvIEZvcm0uY3JlYXRlRm9ybVxuICogICAgICAgICAgICAgICAgIHRvTW9kZWw6ICAgZnVuYzEgfCBbZnVuYzEsIGZ1bmMyLCAuLi5dLC8vIHZhbGlkYXRlcyBpdGVtIGRhdGEgd2hlbiBpdCBpcyBjaGFuZ2VkIGluIGZvcm1cbiAqICAgICAgICAgICAgICAgICBmcm9tTW9kZWw6IGZ1bmMyIHwgW2Z1bmMzLCBmdW5jNCwgLi4uXSAvLyBvcHBvc2l0ZSwgYnV0IG5vdCByZWFsbHkgdXNlZCBhbmQgZG9lcyBub3QgbWFrZSBmb3JtIGludmFsaWQgaWYgaXQgZmFpbHMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FuIGJlIHVzZWQgdG8gcHJldmVudCBkYXRhIGJlaW5nIHNob3duIGluIHRoZSBmb3JtLlxuICogICAgICAgICAgICAgfSwgICAgICAgICAgICAgICAgICAgIC8vIGRhdGEgdmFsaWRhdGlvbiBmdW5jdGlvbnMgc2hvdWxkIGFjY2VwdCB0d28gcGFyYW1ldGVyczogZGF0YSBhbmQgY2FsbGJhY2sgKHRoZXkgYXJlIGFzeW5jaHJvbm91cykuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiB2YWxpZGF0aW9uIGlzIGZpbmlzaGVkLCBjYWxsYmFjayBzaG91bGQgYmUgY2FsbGVkIHdpdGggKGVycm9yLCByZXNwb25zZSkgcGFyYW1ldGVycy5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNwb25zZSBzaG91bGQgaGF2ZSBwcm9wZXJ0aWVzIHZhbGlkIChCb29sZWFuKSBhbmQgb3B0aW9uYWwgcmVhc29uIChTdHJpbmcgLSByZWFzb24gb2YgdmFsaWRhdGlvbiBmYWlsdXJlKS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlITogYXQgdGhlIG1vbWVudCwgaWYgY2FsbGJhY2sgaXMgY2FsbGVkIHdpdGggZXJyb3IgcGFyYW1ldGVyIHdoaWNoIGlzIG5vdCBmYWxzeSwgdmFsaWRhdGlvbiB3aWxsIGJlIHBhc3NlZC5cbiAqICAgICAgICAgICAgIDxpdGVtIHNwZWNpZmljPjogezxpdGVtIGNvbmZpZ3VyYXRpb24+fVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwic2VsZWN0XCIgc3VwcG9ydHMgXCJzZWxlY3RPcHRpb25zXCIgLSBhcnJheSBvZiBvYmplY3RzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2l0aCBwcm9wZXJ0aWVzIFwidmFsdWVcIiBhbmQgXCJsYWJlbFwiXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJyYWRpb1wiIHN1cHBvcnRzIFwicmFkaW9PcHRpb25zXCIgd2l0aCB0aGUgc2FtZSBmb3JtYXRcbiAqICAgICAgICAgICAgIGl0ZW1zOiBbXG4gKiAgICAgICAgICAgICAgICAgeyAuLi4gfSAvLywgLi4uIC0gaXRlbXMgaW5zaWRlIFwiZ3JvdXBcIiBvciBcIndyYXBwZXJcIiBpdGVtXG4gKiAgICAgICAgICAgICBdXG4gKiAgICAgICAgIH0gLy8gLCAuLi4gbW9yZSBpdGVtc1xuICogICAgIF1cbiAqIH1cbiAqL1xudmFyIE1MRm9ybSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxGb3JtJywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC1mb3JtJ1xuICAgIH0sXG4gICAgY3NzOiB1bmRlZmluZWQsIC8vIEZhY2V0IGNvbmZpZyBjYW4gYmUgc2V0IHZpYSBmb3JtIHNjaGVtYVxuICAgIG1vZGVsOiB1bmRlZmluZWQsXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkXG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEZvcm0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRm9ybTtcblxuXG5fLmV4dGVuZChNTEZvcm0sIHtcbiAgICBjcmVhdGVGb3JtOiBNTEZvcm0kJGNyZWF0ZUZvcm0sXG4gICAgcmVnaXN0ZXJTY2hlbWFLZXk6IE1MRm9ybSQkcmVnaXN0ZXJTY2hlbWFLZXksXG4gICAgcmVnaXN0ZXJWYWxpZGF0aW9uOiBNTEZvcm0kJHJlZ2lzdGVyVmFsaWRhdGlvbixcbiAgICB2YWxpZGF0b3JSZXNwb25zZTogTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSxcbiAgICBnZW5lcmF0b3I6IGZvcm1HZW5lcmF0b3IsXG4gICAgcmVnaXN0cnk6IGZvcm1SZWdpc3RyeVxufSk7XG5cbl8uZXh0ZW5kUHJvdG8oTUxGb3JtLCB7XG4gICAgZ2V0SG9zdE9iamVjdDogTUxGb3JtJGdldEhvc3RPYmplY3QsXG4gICAgaXNWYWxpZDogTUxGb3JtJGlzVmFsaWQsXG4gICAgdmFsaWRhdGVNb2RlbDogTUxGb3JtJHZhbGlkYXRlTW9kZWwsXG4gICAgZ2V0SW52YWxpZENvbnRyb2xzOiBNTEZvcm0kZ2V0SW52YWxpZENvbnRyb2xzLFxuICAgIGdldEludmFsaWRSZWFzb25zOiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnMsXG4gICAgZ2V0SW52YWxpZFJlYXNvbnNUZXh0OiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnNUZXh0LFxuICAgIG1vZGVsUGF0aENvbXBvbmVudDogTUxGb3JtJG1vZGVsUGF0aENvbXBvbmVudCxcbiAgICBtb2RlbFBhdGhTY2hlbWE6IE1MRm9ybSRtb2RlbFBhdGhTY2hlbWEsXG4gICAgdmlld1BhdGhDb21wb25lbnQ6IE1MRm9ybSR2aWV3UGF0aENvbXBvbmVudCxcbiAgICB2aWV3UGF0aFNjaGVtYTogTUxGb3JtJHZpZXdQYXRoU2NoZW1hLFxuICAgIGdldE1vZGVsUGF0aDogTUxGb3JtJGdldE1vZGVsUGF0aCxcbiAgICBnZXRWaWV3UGF0aDogTUxGb3JtJGdldFZpZXdQYXRoLFxuICAgIGRlc3Ryb3k6IE1MRm9ybSRkZXN0cm95LFxufSk7XG5cblxudmFyIFNDSEVNQV9LRVlXT1JEUyA9IF8ub2JqZWN0KFtcbiAgICAndHlwZScsICdjb21wTmFtZScsICdsYWJlbCcsICdhbHRUZXh0JyxcbiAgICAnbW9kZWxQYXRoJywgJ21vZGVsUGF0dGVybicsICdub3RJbk1vZGVsJyxcbiAgICAnbWVzc2FnZXMnLCAndHJhbnNsYXRlJywgJ3ZhbGlkYXRlJywgJ2l0ZW1zJyxcbiAgICAnc2VsZWN0T3B0aW9ucycsICdyYWRpb09wdGlvbnMnLCAnY29tYm9PcHRpb25zJyxcbiAgICAnY29tYm9PcHRpb25zVVJMJywgJ2FkZEl0ZW1Qcm9tcHQnLCAncGxhY2VIb2xkZXInLFxuICAgICd2YWx1ZScsICdkYXRhVmFsaWRhdGlvbicsICdhc3luY0hhbmRsZXInLCAnYXV0b3Jlc2l6ZScsXG4gICAgJ21heExlbmd0aCdcbl0sIHRydWUpO1xuXG4vKipcbiAqIE1MRm9ybSBjbGFzcyBtZXRob2RcbiAqIENyZWF0ZXMgZm9ybSBmcm9tIHNjaGVtYS5cbiAqIEZvcm0gZGF0YSBjYW4gYmUgb2J0YWluZWQgZnJvbSBpdHMgTW9kZWwgKGBmb3JtLm1vZGVsYCksIHJlYWN0aXZlIGNvbm5lY3Rpb24gdG8gZm9ybSdzIG1vZGVsIGNhbiBhbHNvIGJlIHVzZWQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSBmb3JtIHNjaGVtYSwgYXMgZGVzY3JpYmVkIGFib3ZlXG4gKiBAcGFyYW0ge09iamVjdH0gaG9zdE9iamVjdCBmb3JtIGhvc3Qgb2JqZWN0LCB1c2VkIHRvIGRlZmluZSBhcyBtZXNzYWdlIHN1YnNjcmliZXIgY29udGV4dCBpbiBzY2hlbWEgLSBieSBjb252ZW50aW9uIHRoZSBjb250ZXh0IHNob3VsZCBiZSBkZWZpbmVkIGFzIFwiaG9zdFwiXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybURhdGEgZGF0YSB0byBpbml0aWFsaXplIHRoZSBmb3JtIHdpdGhcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZW1wbGF0ZSBvcHRpb25hbCBmb3JtIHRlbXBsYXRlLCB3aWxsIGJlIHVzZWQgaW5zdGVhZCBvZiBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBmcm9tIHNjaGVtYS4gTm90IHJlY29tbWVuZGVkIHRvIHVzZSwgYXMgaXQgd2lsbCBoYXZlIHRvIGJlIG1haW50YWluZWQgdG8gYmUgY29uc2lzdGVudCB3aXRoIHNjaGVtYSBmb3IgYmluZGluZ3MuXG4gKiBAcmV0dXJuIHtNTEZvcm19XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSQkY3JlYXRlRm9ybShzY2hlbWEsIGhvc3RPYmplY3QsIGZvcm1EYXRhLCB0ZW1wbGF0ZSkge1xuICAgIHZhciBGb3JtQ2xhc3MgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gX2NyZWF0ZUZvcm1Db21wb25lbnQoRm9ybUNsYXNzKTtcbiAgICBfLmRlZmluZVByb3BlcnR5KGZvcm0sICdfaG9zdE9iamVjdCcsIGhvc3RPYmplY3QpO1xuICAgIHZhciBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnM7XG4gICAgX3Byb2Nlc3NGb3JtU2NoZW1hKCk7XG4gICAgX2NyZWF0ZUZvcm1Db25uZWN0b3JzKCk7XG4gICAgX21hbmFnZUZvcm1WYWxpZGF0aW9uKCk7XG5cbiAgICAvLyBzZXQgb3JpZ2luYWwgZm9ybSBkYXRhXG4gICAgaWYgKGZvcm1EYXRhKVxuICAgICAgICBmb3JtLm1vZGVsLm0uc2V0KGZvcm1EYXRhKTtcblxuICAgIGlmIChzY2hlbWEuY3NzKVxuICAgICAgICBmb3JtLmNzcy5jb25maWcgPSBzY2hlbWEuY3NzO1xuXG4gICAgcmV0dXJuIGZvcm07XG5cblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVGb3JtQ29tcG9uZW50KEZvcm1DbGFzcykge1xuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlIHx8IGZvcm1HZW5lcmF0b3Ioc2NoZW1hKTtcbiAgICAgICAgcmV0dXJuIEZvcm1DbGFzcy5jcmVhdGVPbkVsZW1lbnQodW5kZWZpbmVkLCB0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Byb2Nlc3NGb3JtU2NoZW1hKCkge1xuICAgICAgICAvLyBtb2RlbCBwYXRocyB0cmFuc2xhdGlvbiBydWxlc1xuICAgICAgICBmb3JtVmlld1BhdGhzID0ge307XG4gICAgICAgIGZvcm1Nb2RlbFBhdGhzID0ge307XG4gICAgICAgIG1vZGVsUGF0aFRyYW5zbGF0aW9ucyA9IHt9O1xuICAgICAgICBkYXRhVHJhbnNsYXRpb25zID0geyBmcm9tTW9kZWw6IHt9LCB0b01vZGVsOiB7fSB9O1xuICAgICAgICBkYXRhVmFsaWRhdGlvbnMgPSB7IGZyb21Nb2RlbDoge30sIHRvTW9kZWw6IHt9IH07XG5cbiAgICAgICAgLy8gcHJvY2VzcyBmb3JtIHNjaGVtYVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvY2Vzc1NjaGVtYS5jYWxsKGZvcm0sIGZvcm0sIHNjaGVtYSwgJycsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZm9ybVZpZXdQYXRocyBiZWZvcmUgZXJyb3I6ICcsIGZvcm1WaWV3UGF0aHMpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdmb3JtTW9kZWxQYXRocyBiZWZvcmUgZXJyb3I6ICcsIGZvcm1Nb2RlbFBhdGhzKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnbW9kZWxQYXRoVHJhbnNsYXRpb25zIGJlZm9yZSBlcnJvcjogJywgbW9kZWxQYXRoVHJhbnNsYXRpb25zKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZGF0YVRyYW5zbGF0aW9ucyBiZWZvcmUgZXJyb3I6ICcsIGRhdGFUcmFuc2xhdGlvbnMpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdkYXRhVmFsaWRhdGlvbnMgYmVmb3JlIGVycm9yOiAnLCBkYXRhVmFsaWRhdGlvbnMpO1xuICAgICAgICAgICAgdGhyb3cgKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9ybS5fZm9ybVZpZXdQYXRocyA9IGZvcm1WaWV3UGF0aHM7XG4gICAgICAgIGZvcm0uX2Zvcm1Nb2RlbFBhdGhzID0gZm9ybU1vZGVsUGF0aHM7XG4gICAgICAgIGZvcm0uX21vZGVsUGF0aFRyYW5zbGF0aW9ucyA9IG1vZGVsUGF0aFRyYW5zbGF0aW9ucztcbiAgICAgICAgZm9ybS5fZGF0YVRyYW5zbGF0aW9ucyA9IGRhdGFUcmFuc2xhdGlvbnM7XG4gICAgICAgIGZvcm0uX2RhdGFWYWxpZGF0aW9ucyA9IGRhdGFWYWxpZGF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY3JlYXRlRm9ybUNvbm5lY3RvcnMoKSB7XG4gICAgICAgIHZhciBjb25uZWN0b3JzID0gZm9ybS5fY29ubmVjdG9ycyA9IFtdO1xuXG4gICAgICAgIC8vIGNvbm5lY3QgZm9ybSB2aWV3IHRvIGZvcm0gbW9kZWwgdXNpbmcgdHJhbnNsYXRpb24gcnVsZXMgZnJvbSBtb2RlbFBhdGggcHJvcGVydGllcyBvZiBmb3JtIGl0ZW1zXG4gICAgICAgIGNvbm5lY3RvcnMucHVzaChtaWxvLm1pbmRlcihmb3JtLmRhdGEsICc8LT4nLCBmb3JtLm1vZGVsLCB7IC8vIGNvbm5lY3Rpb24gZGVwdGggaXMgZGVmaW5lZCBvbiBmaWVsZCBieSBmaWVsZCBiYXNpcyBieSBwYXRoVHJhbnNsYXRpb25cbiAgICAgICAgICAgIHBhdGhUcmFuc2xhdGlvbjogbW9kZWxQYXRoVHJhbnNsYXRpb25zLFxuICAgICAgICAgICAgZGF0YVRyYW5zbGF0aW9uOiB7XG4gICAgICAgICAgICAgICAgJzwtJzogZGF0YVRyYW5zbGF0aW9ucy5mcm9tTW9kZWwsXG4gICAgICAgICAgICAgICAgJy0+JzogZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YVZhbGlkYXRpb246IHtcbiAgICAgICAgICAgICAgICAnPC0nOiBkYXRhVmFsaWRhdGlvbnMuZnJvbU1vZGVsLFxuICAgICAgICAgICAgICAgICctPic6IGRhdGFWYWxpZGF0aW9ucy50b01vZGVsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICBpZiAoc2NoZW1hLmNzcykge1xuICAgICAgICAgICAgY29ubmVjdG9ycy5wdXNoKG1pbG8ubWluZGVyKGZvcm0ubW9kZWwsICctPj4+JywgZm9ybS5jc3MpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tYW5hZ2VGb3JtVmFsaWRhdGlvbigpIHtcbiAgICAgICAgZm9ybS5faW52YWxpZEZvcm1Db250cm9scyA9IHt9O1xuXG4gICAgICAgIGZvcm0ubW9kZWwub24oJ3ZhbGlkYXRlZCcsIGNyZWF0ZU9uVmFsaWRhdGVkKHRydWUpKTtcbiAgICAgICAgZm9ybS5kYXRhLm9uKCd2YWxpZGF0ZWQnLCBjcmVhdGVPblZhbGlkYXRlZChmYWxzZSkpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU9uVmFsaWRhdGVkKGlzRnJvbU1vZGVsKSB7XG4gICAgICAgICAgICB2YXIgcGF0aENvbXBNZXRob2QgPSBpc0Zyb21Nb2RlbCA/ICdtb2RlbFBhdGhDb21wb25lbnQnOiAndmlld1BhdGhDb21wb25lbnQnXG4gICAgICAgICAgICAgICAgLCBwYXRoU2NoZW1hTWV0aG9kID0gaXNGcm9tTW9kZWwgPyAnbW9kZWxQYXRoU2NoZW1hJzogJ3ZpZXdQYXRoU2NoZW1hJztcblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1zZywgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gZm9ybVtwYXRoQ29tcE1ldGhvZF0ocmVzcG9uc2UucGF0aClcbiAgICAgICAgICAgICAgICAgICAgLCBzY2hlbWEgPSBmb3JtW3BhdGhTY2hlbWFNZXRob2RdKHJlc3BvbnNlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICwgbGFiZWwgPSBzY2hlbWEubGFiZWxcbiAgICAgICAgICAgICAgICAgICAgLCBtb2RlbFBhdGggPSBzY2hlbWEubW9kZWxQYXRoO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50RWwgPSBjb21wb25lbnQuZWwucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWwuY2xhc3NMaXN0LnRvZ2dsZShGT1JNX1ZBTElEQVRJT05fRkFJTEVEX0NTU19DTEFTUywgISByZXNwb25zZS52YWxpZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYXNvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnZhbGlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGZvcm0uX2ludmFsaWRGb3JtQ29udHJvbHNbbW9kZWxQYXRoXTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcmVzcG9uc2UucmVhc29uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbkNvZGU6IHJlc3BvbnNlLnJlYXNvbkNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtLl9pbnZhbGlkRm9ybUNvbnRyb2xzW21vZGVsUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiByZWFzb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF8uY2xvbmUocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNGcm9tTW9kZWwpIGRhdGEucGF0aCA9IGZvcm0uZ2V0TW9kZWxQYXRoKGRhdGEucGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5yZWFzb24gPSByZWFzb247IC8vIGEgYml0IGhhY2t5LCByZXBsYWNpbmcgc3RyaW5nIHdpdGggb2JqZWN0IGNyZWF0ZWQgYWJvdmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnJlYXNvbkNvZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9ybS5wb3N0TWVzc2FnZSgndmFsaWRhdGlvbicsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Zvcm06IGNvbXBvbmVudCBmb3IgcGF0aCAnICsgcmVzcG9uc2UucGF0aCArICcgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8qKlxuICogQ3VzdG9tIHNjaGVtYSBrZXl3b3Jkc1xuICovXG52YXIgc2NoZW1hS2V5d29yZHNSZWdpc3RyeSA9IHt9O1xuZnVuY3Rpb24gTUxGb3JtJCRyZWdpc3RlclNjaGVtYUtleShrZXl3b3JkLCBwcm9jZXNzS2V5d29yZEZ1bmMsIHJlcGxhY2VLZXl3b3JkKSB7XG4gICAgaWYgKFNDSEVNQV9LRVlXT1JEU1trZXl3b3JkXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXl3b3JkJywga2V5d29yZCwgJ2lzIHVzZWQgYnkgTUxGb3JtIGNsYXNzIG9yIG9uZSBvZiBwcmUtcmVnaXN0ZXJlZCBmb3JtIGl0ZW1zIGFuZCBjYW5ub3QgYmUgb3ZlcnJpZGRlbicpO1xuXG4gICAgaWYgKCFyZXBsYWNlS2V5d29yZCAmJiBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5W2tleXdvcmRdKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0tleXdvcmQnLCBrZXl3b3JkLCAnaXMgYWxyZWFkeSByZWdpc3RlcmVkLiBQYXNzIHRydWUgYXMgdGhlIHRoaXJkIHBhcmFtZXRlciB0byByZXBsYWNlIGl0Jyk7XG5cbiAgICBzY2hlbWFLZXl3b3Jkc1JlZ2lzdHJ5W2tleXdvcmRdID0gcHJvY2Vzc0tleXdvcmRGdW5jO1xufVxuXG5cbi8qKlxuICogUHJlZGVmaW5lZCBmb3JtIHZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKi9cbnZhciB2YWxpZGF0aW9uRnVuY3Rpb25zID0ge1xuICAgICdyZXF1aXJlZCc6IHZhbGlkYXRlUmVxdWlyZWRcbn07XG5mdW5jdGlvbiBNTEZvcm0kJHJlZ2lzdGVyVmFsaWRhdGlvbihuYW1lLCBmdW5jLCByZXBsYWNlRnVuYykge1xuICAgIGlmICghcmVwbGFjZUZ1bmMgJiYgdmFsaWRhdGlvbkZ1bmN0aW9uc1tuYW1lXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWxpZGF0aW5nIGZ1bmN0aW9uJywgbmFtZSwgJ2lzIGFscmVhZHkgcmVnaXN0ZXJlZC4gUGFzcyB0cnVlIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXIgdG8gcmVwbGFjZSBpdCcpO1xuXG4gICAgdmFsaWRhdGlvbkZ1bmN0aW9uc1tuYW1lXSA9IGZ1bmM7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmb3JtIGhvc3Qgb2JqZWN0LlxuICogQHJldHVybiB7Q29tcG9uZW50fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SG9zdE9iamVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5faG9zdE9iamVjdDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgY3VycmVudCB2YWxpZGF0aW9uIHN0YXR1cyBvZiB0aGUgZm9ybVxuICogV2lsbCBub3QgdmFsaWRhdGUgZmllbGRzIHRoYXQgd2VyZSBuZXZlciBjaGFuZ2VkIGluIHZpZXdcbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5mdW5jdGlvbiBNTEZvcm0kaXNWYWxpZCgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5faW52YWxpZEZvcm1Db250cm9scykubGVuZ3RoID09IDA7XG59XG5cblxuLyoqXG4gKiBSdW5zICd0b01vZGVsJyB2YWxpZGF0b3JzIGRlZmluZWQgaW4gc2NoZW1hIG9uIHRoZSBjdXJyZW50IG1vZGVsIG9mIHRoZSBmb3JtXG4gKiBjYW4gYmUgdXNlZCB0byBtYXJrIGFzIGludmFpZCBhbGwgcmVxdWlyZWQgZmllbGRzIG9yIHRvIGV4cGxpY2l0ZWx5IHZhbGlkYXRlXG4gKiBmb3JtIHdoZW4gaXQgaXMgc2F2ZWQuIFJldHVybnMgdmFsaWRhdGlvbiBzdGF0ZSBvZiB0aGUgZm9ybSB2aWEgY2FsbGJhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBNTEZvcm0kdmFsaWRhdGVNb2RlbChjYWxsYmFjaykge1xuICAgIHZhciB2YWxpZGF0aW9ucyA9IFtdXG4gICAgICAgICwgc2VsZiA9IHRoaXM7XG5cbiAgICBfLmVhY2hLZXkodGhpcy5fZGF0YVZhbGlkYXRpb25zLmZyb21Nb2RlbCwgZnVuY3Rpb24odmFsaWRhdG9ycywgbW9kZWxQYXRoKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5tb2RlbC5tKG1vZGVsUGF0aCkuZ2V0KCk7XG4gICAgICAgIHZhbGlkYXRvcnMgPSBBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpID8gdmFsaWRhdG9ycyA6IFt2YWxpZGF0b3JzXTtcblxuICAgICAgICBpZiAodmFsaWRhdG9ycyAmJiB2YWxpZGF0b3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsaWRhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgbW9kZWxQYXRoOiBtb2RlbFBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuXG5cbiAgICB2YXIgYWxsVmFsaWQgPSB0cnVlO1xuICAgIGFzeW5jLmVhY2godmFsaWRhdGlvbnMsXG4gICAgICAgIGZ1bmN0aW9uKHZhbGlkYXRpb24sIG5leHRWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgbGFzdFJlc3BvbnNlO1xuICAgICAgICAgICAgYXN5bmMuZXZlcnkodmFsaWRhdGlvbi52YWxpZGF0b3JzLFxuICAgICAgICAgICAgICAgIC8vIGNhbGwgdmFsaWRhdG9yXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24odmFsaWRhdG9yLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkYXRvcih2YWxpZGF0aW9uLmRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZSA9IHJlc3BvbnNlIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dChsYXN0UmVzcG9uc2UudmFsaWQgfHwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHBvc3QgdmFsaWRhdGlvbiByZXN1bHQgb2YgaXRlbSB0byBmb3JtXG4gICAgICAgICAgICBmdW5jdGlvbih2YWxpZCkge1xuICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZS5wYXRoID0gdmFsaWRhdGlvbi5tb2RlbFBhdGg7XG4gICAgICAgICAgICAgICAgbGFzdFJlc3BvbnNlLnZhbGlkID0gdmFsaWQ7XG4gICAgICAgICAgICAgICAgc2VsZi5tb2RlbC5wb3N0TWVzc2FnZSgndmFsaWRhdGVkJywgbGFzdFJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkKSBhbGxWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG5leHRWYWxpZGF0aW9uKG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgLy8gcG9zdCBmb3JtIHZhbGlkYXRpb24gcmVzdWx0XG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIHNlbGYucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRpb25jb21wbGV0ZWQnLCB7IHZhbGlkOiBhbGxWYWxpZCB9KTtcbiAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soYWxsVmFsaWQpO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBtYXAgb2YgaW52YWxpZCBjb250cm9scyBhbmQgcmVhc29ucyAodmlldyBwYXRocyBhcmUga2V5cylcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRJbnZhbGlkQ29udHJvbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludmFsaWRGb3JtQ29udHJvbHM7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCBhbGwgcmVhc29ucyBmb3IgdGhlIGZvcm0gYmVpbmcgaW52YWxpZFxuICpcbiAqIEByZXR1cm4ge0FycmF5W09iamVjdF19XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRJbnZhbGlkUmVhc29ucygpIHtcbiAgICB2YXIgaW52YWxpZENvbnRyb2xzID0gdGhpcy5nZXRJbnZhbGlkQ29udHJvbHMoKTtcbiAgICB2YXIgcmVhc29ucyA9IF8ucmVkdWNlS2V5cyhpbnZhbGlkQ29udHJvbHMsXG4gICAgICAgIGZ1bmN0aW9uKG1lbW8sIGludmFsaWRDb250cm9sLCBjb21wTmFtZSkge1xuICAgICAgICAgICAgbWVtby5wdXNoKGludmFsaWRDb250cm9sLnJlYXNvbik7XG4gICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgfSwgW10sIHRoaXMpO1xuICAgIHJldHVybiByZWFzb25zO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBhIG11bHRpbGluZSBzdHJpbmcgd2l0aCBhbGwgcmVhc29ucyBmb3IgdGhlIGZvcm0gYmVpbmcgaW52YWxpZFxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldEludmFsaWRSZWFzb25zVGV4dCgpIHtcbiAgICB2YXIgcmVhc29ucyA9IHRoaXMuZ2V0SW52YWxpZFJlYXNvbnMoKTtcbiAgICByZXR1cm4gcmVhc29ucy5yZWR1Y2UoZnVuY3Rpb24obWVtbywgcmVhc29uKSB7XG4gICAgICAgIHJldHVybiBtZW1vICsgKHJlYXNvbi5sYWJlbCB8fCAnJykgKyAnIC0gJyArIHJlYXNvbi5yZWFzb24gKyAnXFxuJztcbiAgICB9LCAnJyk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGNvbXBvbmVudCBmb3IgYSBnaXZlbiBtb2RlbFBhdGhcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbW9kZWxQYXRoXG4gKiBAcmV0dXJuIHtDb21wb25lbnR9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRtb2RlbFBhdGhDb21wb25lbnQobW9kZWxQYXRoKSB7XG4gICAgdmFyIG1vZGVsUGF0aE9iaiA9IHRoaXMuX2Zvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF07XG4gICAgcmV0dXJuIG1vZGVsUGF0aE9iaiAmJiBtb2RlbFBhdGhPYmouY29tcG9uZW50O1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBmb3JtIHNjaGVtYSBmb3IgYSBnaXZlbiBtb2RlbFBhdGhcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbW9kZWxQYXRoXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRtb2RlbFBhdGhTY2hlbWEobW9kZWxQYXRoKSB7XG4gICAgdmFyIG1vZGVsUGF0aE9iaiA9IHRoaXMuX2Zvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF07XG4gICAgcmV0dXJuIG1vZGVsUGF0aE9iaiAmJiBtb2RlbFBhdGhPYmouc2NoZW1hO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBjb21wb25lbnQgZm9yIGEgZ2l2ZW4gdmlldyBwYXRoIChwYXRoIGFzIGRlZmluZWQgaW4gRGF0YSBmYWNldClcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGhcbiAqIEByZXR1cm4ge0NvbXBvbmVudH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJHZpZXdQYXRoQ29tcG9uZW50KHZpZXdQYXRoKSB7XG4gICAgdmFyIHZpZXdQYXRoT2JqID0gdGhpcy5fZm9ybVZpZXdQYXRoc1t2aWV3UGF0aF07XG4gICAgcmV0dXJuIHZpZXdQYXRoT2JqICYmIHZpZXdQYXRoT2JqLmNvbXBvbmVudDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgZm9ybSBzY2hlbWEgZm9yIGEgZ2l2ZW4gdmlldyBwYXRoIGl0ZW0gKHBhdGggYXMgZGVmaW5lZCBpbiBEYXRhIGZhY2V0KVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2aWV3UGF0aFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kdmlld1BhdGhTY2hlbWEodmlld1BhdGgpIHtcbiAgICB2YXIgdmlld1BhdGhPYmogPSB0aGlzLl9mb3JtVmlld1BhdGhzW3ZpZXdQYXRoXTtcbiAgICByZXR1cm4gdmlld1BhdGhPYmogJiYgdmlld1BhdGhPYmouc2NoZW1hO1xufVxuXG5cbi8qKlxuICogQ29udmVydHMgdmlldyBwYXRoIG9mIHRoZSBjb21wb25lbnQgaW4gdGhlIGZvcm0gdG8gdGhlIG1vZGVsIHBhdGggb2YgdGhlIGNvbm5lY3RlZCBkYXRhXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZpZXdQYXRoIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50XG4gKiBAcmV0dXJuIHtzdHJpbmd9IG1vZGVsIHBhdGggb2YgY29ubmVjdGVkIGRhdGFcbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldE1vZGVsUGF0aCh2aWV3UGF0aCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbFBhdGhUcmFuc2xhdGlvbnNbdmlld1BhdGhdO1xufVxuXG5cbi8qKlxuICogQ29udmVydHMgbW9kZWwgcGF0aCBvZiB0aGUgY29ubmVjdGVkIGRhdGEgdG8gdmlldyBwYXRoIG9mIHRoZSBjb21wb25lbnQgaW4gdGhlIGZvcm1cbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsUGF0aCBtb2RlbCBwYXRoIG9mIGNvbm5lY3RlZCBkYXRhXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRWaWV3UGF0aChtb2RlbFBhdGgpIHtcbiAgICByZXR1cm4gXy5maW5kS2V5KHRoaXMuX21vZGVsUGF0aFRyYW5zbGF0aW9ucywgZnVuY3Rpb24obVBhdGgsIHZQYXRoKSB7XG4gICAgICAgIHJldHVybiBtUGF0aCA9PSBtb2RlbFBhdGg7XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gTUxGb3JtJGRlc3Ryb3koKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLl9jb25uZWN0b3JzICYmIHRoaXMuX2Nvbm5lY3RvcnMuZm9yRWFjaChtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3JzID0gbnVsbDtcbn1cblxuXG4vKipcbiAqIFNlZSBpdGVtX3R5cGVzLmpzIGZvciBpdGVtIGNsYXNzZXMgYW5kIHRlbXBsYXRlc1xuICogTWFwIG9mIGl0ZW1zIHR5cGVzIHRvIGl0ZW1zIGNvbXBvbmVudHMgY2xhc3Nlc1xuICogVUkgY29tcG9uZW50cyBhcmUgZGVmaW5lZCBpbiBgbWlsb2BcbiAqL1xuXG5cbi8vIHZhciBfaXRlbXNTY2hlbWFSdWxlcyA9IF8ubWFwS2V5cyhpdGVtVHlwZXMsIGZ1bmN0aW9uKGNsYXNzTmFtZSwgaXRlbVR5cGUpIHtcbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICAvLyBDb21wQ2xhc3M6IGNvbXBvbmVudHNSZWdpc3RyeS5nZXQoY2xhc3NOYW1lKSxcbi8vICAgICAgICAgZnVuYzogaXRlbXNGdW5jdGlvbnNbaXRlbVR5cGVdIHx8IGRvTm90aGluZyxcbi8vICAgICAgICAgbW9kZWxQYXRoUnVsZTogbW9kZWxQYXRoUnVsZXNbaXRlbVR5cGVdIHx8ICdyZXF1aXJlZCdcbi8vICAgICB9O1xuLy8gfSk7XG5cbmZ1bmN0aW9uIGRvTm90aGluZygpIHt9XG5cblxuLyoqXG4gKiBQcm9jZXNzZXMgZm9ybSBzY2hlbWEgdG8gc3Vic2NyaWJlIGZvciBtZXNzYWdlcyBhcyBkZWZpbmVkIGluIHNjaGVtYS4gUGVyZm9ybXMgc3BlY2lhbCBwcm9jZXNzaW5nIGZvciBzb21lIHR5cGVzIG9mIGl0ZW1zLlxuICogUmV0dXJucyB0cmFuc2xhdGlvbiBydWxlcyBmb3IgQ29ubmVjdG9yIG9iamVjdC5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHJlY3Vyc2l2ZWx5IGZvciBncm91cHMgKGFuZCBzdWJncm91cHMpXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wIGZvcm0gb3IgZ3JvdXAgY29tcG9uZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIGZvcm0gb3IgZ3JvdXAgc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1NjaGVtYShjb21wLCBzY2hlbWEsIHZpZXdQYXRoLCBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnMpIHtcbiAgICB2aWV3UGF0aCA9IHZpZXdQYXRoIHx8ICcnO1xuICAgIGZvcm1WaWV3UGF0aHMgPSBmb3JtVmlld1BhdGhzIHx8IHt9O1xuICAgIGZvcm1Nb2RlbFBhdGhzID0gZm9ybU1vZGVsUGF0aHMgfHwge307XG4gICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zID0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMgPSBkYXRhVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMuZnJvbU1vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy5mcm9tTW9kZWwgfHwge307XG4gICAgZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsIHx8IHt9O1xuXG4gICAgZGF0YVZhbGlkYXRpb25zID0gZGF0YVZhbGlkYXRpb25zIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwgPSBkYXRhVmFsaWRhdGlvbnMuZnJvbU1vZGVsIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy50b01vZGVsID0gZGF0YVZhbGlkYXRpb25zLnRvTW9kZWwgfHwge307XG5cbiAgICBpZiAoc2NoZW1hLml0ZW1zKVxuICAgICAgICBfcHJvY2Vzc1NjaGVtYUl0ZW1zLmNhbGwodGhpcywgY29tcCwgc2NoZW1hLml0ZW1zLCB2aWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKTtcblxuICAgIGlmIChzY2hlbWEubWVzc2FnZXMpXG4gICAgICAgIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMuY2FsbCh0aGlzLCBjb21wLCBzY2hlbWEubWVzc2FnZXMpO1xuXG4gICAgdmFyIGl0ZW1SdWxlID0gc2NoZW1hLnR5cGUgJiYgZm9ybVJlZ2lzdHJ5LmdldChzY2hlbWEudHlwZSk7XG4gICAgdmFyIGhvc3RPYmplY3QgPSB0aGlzLmdldEhvc3RPYmplY3QoKTtcblxuICAgIGlmICh2aWV3UGF0aCkge1xuICAgICAgICBmb3JtVmlld1BhdGhzW3ZpZXdQYXRoXSA9IHtcbiAgICAgICAgICAgIHNjaGVtYTogc2NoZW1hLFxuICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGl0ZW1SdWxlKSB7XG4gICAgICAgICAgICAvL2NoZWNrKGNvbXAuY29uc3RydWN0b3IsIGl0ZW1UeXBlc1tzY2hlbWEudHlwZV0uQ29tcENsYXNzKTtcbiAgICAgICAgICAgIGl0ZW1SdWxlLml0ZW1GdW5jdGlvbiAmJiBpdGVtUnVsZS5pdGVtRnVuY3Rpb24uY2FsbChob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICAgICAgX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zLmNhbGwodGhpcywgdmlld1BhdGgsIHNjaGVtYSk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleXdvcmQgaW4gc2NoZW1hS2V5d29yZHNSZWdpc3RyeSkge1xuICAgICAgICBpZiAoc2NoZW1hLmhhc093blByb3BlcnR5KGtleXdvcmQpKSB7XG4gICAgICAgICAgICB2YXIgcHJvY2Vzc0tleXdvcmRGdW5jID0gc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXTtcbiAgICAgICAgICAgIHByb2Nlc3NLZXl3b3JkRnVuYyhob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVsUGF0aFRyYW5zbGF0aW9ucztcblxuXG4gICAgZnVuY3Rpb24gX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zKHZpZXdQYXRoLCBzY2hlbWEpIHtcbiAgICAgICAgdmFyIG1vZGVsUGF0aCA9IHNjaGVtYS5tb2RlbFBhdGhcbiAgICAgICAgICAgICwgbW9kZWxQYXR0ZXJuID0gc2NoZW1hLm1vZGVsUGF0dGVybiB8fCAnJ1xuICAgICAgICAgICAgLCBub3RJbk1vZGVsID0gc2NoZW1hLm5vdEluTW9kZWxcbiAgICAgICAgICAgICwgdHJhbnNsYXRlID0gc2NoZW1hLnRyYW5zbGF0ZVxuICAgICAgICAgICAgLCB2YWxpZGF0ZSA9IHNjaGVtYS52YWxpZGF0ZTtcblxuICAgICAgICBpZiAodmlld1BhdGgpIHtcbiAgICAgICAgICAgIF9hZGREYXRhVHJhbnNsYXRpb24uY2FsbCh0aGlzLCB0cmFuc2xhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGl0ZW1SdWxlLm1vZGVsUGF0aFJ1bGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdwcm9oaWJpdGVkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbW9kZWxQYXRoIGlzIHByb2hpYml0ZWQgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZXF1aXJlZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghIChtb2RlbFBhdGggfHwgbm90SW5Nb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21vZGVsUGF0aCBpcyByZXF1aXJlZCBmb3IgaXRlbSB0eXBlICcgKyBzY2hlbWEudHlwZSArICcgLiBBZGQgXCJub3RJbk1vZGVsOiB0cnVlXCIgdG8gb3ZlcnJpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmFsbGluZyB0aHJvdWdoIHRvICdvcHRpb25hbCdcbiAgICAgICAgICAgICAgICBjYXNlICdvcHRpb25hbCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hOiBzY2hlbWEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISBub3RJbk1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIG1vZGVsUGF0dGVybik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFUcmFuc2xhdGlvbi5jYWxsKHRoaXMsIHRyYW5zbGF0ZSwgJ2Zyb21Nb2RlbCcsIG1vZGVsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFWYWxpZGF0aW9uLmNhbGwodGhpcywgdmFsaWRhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hZGREYXRhVmFsaWRhdGlvbi5jYWxsKHRoaXMsIHZhbGlkYXRlLCAnZnJvbU1vZGVsJywgbW9kZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gbW9kZWxQYXRoIHJ1bGUgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIHBhdGhQYXR0ZXJuKSB7XG4gICAgICAgIGlmICh2aWV3UGF0aCBpbiBtb2RlbFBhdGhUcmFuc2xhdGlvbnMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtcbiAgICAgICAgZWxzZSBpZiAoXy5rZXlPZihtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIG1vZGVsUGF0aCkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBtb2RlbCBwYXRoICcgKyBtb2RlbFBhdGggKyAnIGZvciB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zW3ZpZXdQYXRoICsgcGF0aFBhdHRlcm5dID0gbW9kZWxQYXRoICsgcGF0aFBhdHRlcm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZERhdGFUcmFuc2xhdGlvbih0cmFuc2xhdGUsIGRpcmVjdGlvbiwgcGF0aCkge1xuICAgICAgICB2YXIgdHJhbnNsYXRlRnVuYyA9IHRyYW5zbGF0ZSAmJiB0cmFuc2xhdGVbZGlyZWN0aW9uXTtcbiAgICAgICAgaWYgKCF0cmFuc2xhdGVGdW5jKSByZXR1cm47XG4gICAgICAgIGlmICh0eXBlb2YgdHJhbnNsYXRlRnVuYyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNsYXRlLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IGdldEZ1bmN0aW9uQ29udGV4dC5jYWxsKHRoaXMsIHRyYW5zbGF0ZS5jb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZUZ1bmMgPSB0cmFuc2xhdGVGdW5jLmJpbmQoY29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhVHJhbnNsYXRpb25zW2RpcmVjdGlvbl1bcGF0aF0gPSB0cmFuc2xhdGVGdW5jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpcmVjdGlvbiArICcgdHJhbnNsYXRvciBmb3IgJyArIHBhdGggKyAnIHNob3VsZCBiZSBmdW5jdGlvbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZERhdGFWYWxpZGF0aW9uKHZhbGlkYXRlLCBkaXJlY3Rpb24sIHBhdGgpIHtcbiAgICAgICAgdmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0ZSAmJiB2YWxpZGF0ZVtkaXJlY3Rpb25dO1xuICAgICAgICBpZiAoISB2YWxpZGF0b3JzKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGZvcm0gPSB0aGlzO1xuICAgICAgICB2YXIgZm9ybVZhbGlkYXRvcnMgPSBkYXRhVmFsaWRhdGlvbnNbZGlyZWN0aW9uXVtwYXRoXSA9IFtdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpKVxuICAgICAgICAgICAgdmFsaWRhdG9ycy5mb3JFYWNoKF9hZGRWYWxpZGF0b3JGdW5jKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9ycyk7XG5cbiAgICAgICAgZnVuY3Rpb24gX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9yKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICB2YXIgdmFsRnVuYyA9IGdldFZhbGlkYXRvckZ1bmN0aW9uKHZhbGlkYXRvcik7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWxpZGF0b3IgaW5zdGFuY2VvZiBSZWdFeHApXG4gICAgICAgICAgICAgICAgdmFsRnVuYyA9IG1ha2VSZWdleFZhbGlkYXRvcih2YWxpZGF0b3IpO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIHZhbEZ1bmMgPSB2YWxpZGF0b3I7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpcmVjdGlvbiArICcgdmFsaWRhdG9yIGZvciAnICsgcGF0aCArICcgc2hvdWxkIGJlIGZ1bmN0aW9uIG9yIHN0cmluZycpO1xuXG4gICAgICAgICAgICBpZiAodmFsaWRhdGUuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgdmFsaWRhdGUuY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICB2YWxGdW5jID0gdmFsRnVuYy5iaW5kKGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3JtVmFsaWRhdG9ycy5wdXNoKHZhbEZ1bmMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGdldFZhbGlkYXRvckZ1bmN0aW9uKHZhbGlkYXRvck5hbWUpIHtcbiAgICB2YXIgdmFsRnVuYyA9IHZhbGlkYXRpb25GdW5jdGlvbnNbdmFsaWRhdG9yTmFtZV07XG4gICAgaWYgKCEgdmFsRnVuYylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3JtOiB1bmtub3duIHZhbGlkYXRvciBmdW5jdGlvbiBuYW1lICcgKyB2YWxpZGF0b3JOYW1lKTtcbiAgICByZXR1cm4gdmFsRnVuYztcbn1cblxuXG5mdW5jdGlvbiBtYWtlUmVnZXhWYWxpZGF0b3IodmFsaWRhdG9yUmVnRXhwKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdmFsaWQgPSB2YWxpZGF0b3JSZWdFeHAudGVzdChkYXRhKVxuICAgICAgICAgICAgLCByZXNwb25zZSA9IE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UodmFsaWQsICdzaG91bGQgbWF0Y2ggcGF0dGVybicpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG4gICAgfTtcbn1cblxuXG4vKipcbiAqIFByb2Nlc3NlcyBpdGVtcyBvZiB0aGUgZm9ybSAob3IgZ3JvdXApLlxuICogQ29tcG9uZW50IHRoYXQgaGFzIGl0ZW1zIHNob3VsZCBoYXZlIENvbnRhaW5lciBmYWNldC5cbiAqIFJldHVybnMgdHJhbnNsYXRpb24gcnVsZXMgZm9yIENvbm5lY3Rvci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXAgZm9ybSBvciBncm91cCBjb21wb25lbnRcbiAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zIGxpc3Qgb2YgaXRlbXMgaW4gc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gX3Byb2Nlc3NTY2hlbWFJdGVtcyhjb21wLCBpdGVtcywgdmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucykge1xuICAgIGlmICghIGNvbXAuY29udGFpbmVyKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLndhcm4oJ0Zvcm0gV2FybmluZzogc2NoZW1hIGhhcyBpdGVtcyBidXQgY29tcG9uZW50IGhhcyBubyBjb250YWluZXIgZmFjZXQnKTtcblxuICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoIWl0ZW0uY29tcE5hbWUpIHJldHVybjsgLy8gTm8gY29tcG9uZW50LCBvbmx5IG1hcmt1cFxuXG4gICAgICAgIHZhciBpdGVtQ29tcCA9IGNvbXAuY29udGFpbmVyLnNjb3BlW2l0ZW0uY29tcE5hbWVdXG4gICAgICAgICAgICAsIGNvbXBWaWV3UGF0aCA9IHZpZXdQYXRoICsgJy4nICsgaXRlbS5jb21wTmFtZTtcbiAgICAgICAgaWYgKCEgaXRlbUNvbXApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbXBvbmVudCBcIicgKyBpdGVtLmNvbXBOYW1lICsgJ1wiIGlzIG5vdCBpbiBzY29wZSAob3Igc3Vic2NvcGUpIG9mIGZvcm0nKTtcbiAgICAgICAgcHJvY2Vzc1NjaGVtYS5jYWxsKHRoaXMsIGl0ZW1Db21wLCBpdGVtLCBjb21wVmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucyk7XG4gICAgfSwgdGhpcyk7XG59XG5cblxuLyoqXG4gKiBTdWJzY3JpYmVzIHRvIG1lc3NhZ2VzIG9uIGZhY2V0cyBvZiBpdGVtcycgY29tcG9uZW50IGFzIGRlZmluZWQgaW4gc2NoZW1hXG4gKi9cbmZ1bmN0aW9uIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMoY29tcCwgbWVzc2FnZXMpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG4gICAgXy5lYWNoS2V5KG1lc3NhZ2VzLCBmdW5jdGlvbihmYWNldE1lc3NhZ2VzLCBmYWNldE5hbWUpIHtcbiAgICAgICAgdmFyIGZhY2V0ID0gY29tcFtmYWNldE5hbWVdO1xuICAgICAgICBpZiAoISBmYWNldClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2NoZW1hIGhhcyBzdWJzY3JpcHRpb25zIGZvciBmYWNldCBcIicgKyBmYWNldE5hbWUgKyAnXCIgb2YgZm9ybSBjb21wb25lbnQgXCInICsgY29tcC5uYW1lICsgJ1wiLCBidXQgY29tcG9uZW50IGhhcyBubyBmYWNldCcpO1xuICAgICAgICBmYWNldE1lc3NhZ2VzID0gXy5jbG9uZShmYWNldE1lc3NhZ2VzKTtcbiAgICAgICAgXy5lYWNoS2V5KGZhY2V0TWVzc2FnZXMsIGZ1bmN0aW9uKHN1YnNjcmliZXIsIG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHR5cGVvZiBzdWJzY3JpYmVyID09ICdvYmplY3QnID8gc3Vic2NyaWJlci5jb250ZXh0IDogbnVsbDtcblxuICAgICAgICAgICAgLy8gQXZvaWQgY2hhbmdpbmcgZXZlbnQgc3Vic2NyaXB0aW9ucyB3aG9zZSBjb250ZXh0IGlzICdmYWNldCcgb3IgJ293bmVyJy5cbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT0gJ2ZhY2V0JyAmJiBjb250ZXh0ICE9ICdvd25lcicpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBmYWNldE1lc3NhZ2VzW21lc3NhZ2VUeXBlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcjogc3Vic2NyaWJlci5zdWJzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZhY2V0Lm9uQ29uZmlnTWVzc2FnZXMoZmFjZXRNZXNzYWdlcyk7XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvYmplY3QgdG8gYmluZCBhIGZ1bmN0aW9uIHRvIGFzIGRlZmluZWQgYnkgYSBzZWN0aW9uIG9mIHRoZSBmb3JtIHNjaGVtYS5cbiAqXG4gKiBDdXJyZW50bHkgc3VwcG9ydGVkIGlucHV0cyBhcmU6XG4gKiAgLSB7T2JqZWN0fSAtIEFueSBvYmplY3RcbiAqICAtIHtTdHJpbmd9ICdmb3JtJyAtIFRoZSBmb3JtXG4gKiAgLSB7U3RyaW5nfSAnaG9zdCcgLSBUaGUgZm9ybSdzIGhvc3Qgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uQ29udGV4dChjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQgPT0gJ2Zvcm0nKVxuICAgICAgICBjb250ZXh0ID0gdGhpcztcbiAgICBlbHNlIGlmIChjb250ZXh0ID09ICdob3N0JylcbiAgICAgICAgY29udGV4dCA9IHRoaXMuZ2V0SG9zdE9iamVjdCgpO1xuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgIT0gJ29iamVjdCcpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb250ZXh0IHN1cHBsaWVkIC0gRXhwZWN0ZWQge1N0cmluZ30gW2hvc3QsZm9ybV0sIG9yIHtPYmplY3R9Jyk7XG5cbiAgICByZXR1cm4gY29udGV4dDtcbn1cblxuXG4vKipcbiAqIFZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlUmVxdWlyZWQoZGF0YSwgY2FsbGJhY2spIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgZGF0YSAhPSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICYmICh0eXBlb2YgZGF0YSAhPSAnc3RyaW5nJyB8fCBkYXRhLnRyaW0oKSAhPSAnJyk7XG4gICAgdmFyIHJlc3BvbnNlID0gTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSh2YWxpZCwgJ3BsZWFzZSBlbnRlciBhIHZhbHVlJywgJ1JFUVVJUkVEJyk7XG4gICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UodmFsaWQsIHJlYXNvbiwgcmVhc29uQ29kZSkge1xuICAgIHJldHVybiB2YWxpZFxuICAgICAgICAgICAgPyB7IHZhbGlkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyB2YWxpZDogZmFsc2UsIHJlYXNvbjogcmVhc29uLCByZWFzb25Db2RlOiByZWFzb25Db2RlIH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb1QgPSBtaWxvLnV0aWwuZG9UXG4gICAgLCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgbWlsb0NvdW50ID0gbWlsby51dGlsLmNvdW50XG4gICAgLCBjb21wb25lbnROYW1lID0gbWlsby51dGlsLmNvbXBvbmVudE5hbWVcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKVxuICAgICwgaXRlbVR5cGVzID0gcmVxdWlyZSgnLi9pdGVtX3R5cGVzJyk7XG5cbnZhciBjYWNoZWRJdGVtcyA9IHt9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZm9ybUdlbmVyYXRvcjtcblxuXG52YXIgcGFydGlhbHMgPSB7XG4gICAgbGFiZWw6IFwie3s/IGl0Lml0ZW0ubGFiZWwgfX1cXG4gICAgPGxhYmVsPnt7PSBpdC5pdGVtLmxhYmVsfX08L2xhYmVsPlxcbnt7P319XFxuXCIsXG4gICAgZm9ybUdyb3VwOiBcIjxkaXZcXG4gICAge3s/IGl0Lml0ZW0uYWx0VGV4dCB9fXRpdGxlPVxcXCJ7ez0gaXQuaXRlbS5hbHRUZXh0fX1cXFwiIHt7P319XFxuICAgIGNsYXNzPVxcXCJmb3JtLWdyb3Vwe3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0ge3s9IGl0Lml0ZW0ud3JhcENzc0NsYXNzIH19e3s/fX1cXFwiXFxuPlxcblwiXG59O1xuXG52YXIgZG90RGVmID0ge1xuICAgIHBhcnRpYWxzOiBwYXJ0aWFsc1xufTtcblxuXG4vKlxuICogR2VuZXJhdGVzIGZvcm0gSFRNTCBiYXNlZCBvbiB0aGUgc2NoZW1hLlxuICogSXQgZG9lcyBub3QgY3JlYXRlIGNvbXBvbmVudHMgZm9yIHRoZSBmb3JtIERPTSwgbWlsby5iaW5kZXIgc2hvdWxkIGJlIGNhbGxlZCBzZXBhcmF0ZWx5IG9uIHRoZSBmb3JtJ3MgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzY2hlbWEgYXJyYXkgb2YgZm9ybSBlbGVtZW50cyBkZXNjcmlwdG9yc1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtR2VuZXJhdG9yKHNjaGVtYSkge1xuICAgIC8vZ2V0SXRlbXNDbGFzc2VzKCk7XG5cbiAgICB2YXIgcmVuZGVyZWRJdGVtcyA9IHNjaGVtYS5pdGVtcy5tYXAocmVuZGVySXRlbSk7XG4gICAgcmV0dXJuIHJlbmRlcmVkSXRlbXMuam9pbignJyk7XG5cbiAgICBmdW5jdGlvbiByZW5kZXJJdGVtKGl0ZW0pIHtcbiAgICAgICAgdmFyIGl0ZW1UeXBlID0gY2FjaGVkSXRlbXNbaXRlbS50eXBlXTtcblxuICAgICAgICBpZiAoIWl0ZW1UeXBlKSB7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbVR5cGUgPSBmb3JtUmVnaXN0cnkuZ2V0KGl0ZW0udHlwZSk7XG4gICAgICAgICAgICBpdGVtVHlwZSA9IGNhY2hlZEl0ZW1zW2l0ZW0udHlwZV0gPSB7XG4gICAgICAgICAgICAgICAgQ29tcENsYXNzOiBuZXdJdGVtVHlwZS5jb21wQ2xhc3MgJiYgY29tcG9uZW50c1JlZ2lzdHJ5LmdldChuZXdJdGVtVHlwZS5jb21wQ2xhc3MpLFxuICAgICAgICAgICAgICAgIGNvbXBDbGFzczogbmV3SXRlbVR5cGUuY29tcENsYXNzLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBkb1QuY29tcGlsZShuZXdJdGVtVHlwZS50ZW1wbGF0ZSwgZG90RGVmKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaXRlbS5jb21wTmFtZSA9IGl0ZW1UeXBlLkNvbXBDbGFzcyA/IGl0ZW0uY29tcE5hbWUgfHwgY29tcG9uZW50TmFtZSgpIDogbnVsbDtcblxuICAgICAgICB2YXIgZG9tRmFjZXRDb25maWcgPSBpdGVtVHlwZS5Db21wQ2xhc3MgJiYgaXRlbVR5cGUuQ29tcENsYXNzLmdldEZhY2V0Q29uZmlnKCdkb20nKVxuICAgICAgICAgICAgLCB0YWdOYW1lID0gZG9tRmFjZXRDb25maWcgJiYgZG9tRmFjZXRDb25maWcudGFnTmFtZSB8fCAnZGl2JztcblxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBpdGVtVHlwZS50ZW1wbGF0ZTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICBjb21wTmFtZTogaXRlbS5jb21wTmFtZSxcbiAgICAgICAgICAgIGNvbXBDbGFzczogaXRlbVR5cGUuY29tcENsYXNzLFxuICAgICAgICAgICAgdGFnTmFtZTogdGFnTmFtZSxcbiAgICAgICAgICAgIGZvcm1HZW5lcmF0b3I6IGZvcm1HZW5lcmF0b3IsXG4gICAgICAgICAgICBtaWxvQ291bnQ6IG1pbG9Db3VudCxcbiAgICAgICAgICAgIGRpc2FibGVkOiBpdGVtLmRpc2FibGVkLFxuICAgICAgICAgICAgbXVsdGlwbGU6IGl0ZW0ubXVsdGlwbGVcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKTtcblxuXG52YXIgZ3JvdXBfZG90ID0gXCI8ZGl2IG1sLWJpbmQ9XFxcIk1MR3JvdXA6e3s9IGl0LmNvbXBOYW1lIH19XFxcInt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IGNsYXNzPVxcXCJ7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX1cXFwie3s/fX0+XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAge3s9IGl0LmZvcm1HZW5lcmF0b3IoaXQuaXRlbSkgfX1cXG48L2Rpdj5cXG5cIlxuICAgICwgd3JhcHBlcl9kb3QgPSBcIjxzcGFuIG1sLWJpbmQ9XFxcIk1MV3JhcHBlcjp7ez0gaXQuY29tcE5hbWUgfX1cXFwie3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0gY2xhc3M9XFxcInt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fVxcXCJ7ez99fT5cXG4gICAge3s9IGl0LmZvcm1HZW5lcmF0b3IoaXQuaXRlbSkgfX1cXG48L3NwYW4+XFxuXCJcbiAgICAsIHNlbGVjdF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHNwYW4gY2xhc3M9XFxcImN1c3RvbS1zZWxlY3RcXFwiPlxcbiAgICAgICAgPHNlbGVjdCBtbC1iaW5kPVxcXCJNTFNlbGVjdDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgICAgIHt7PyBpdC5kaXNhYmxlZCB9fWRpc2FibGVkIHt7P319XFxuICAgICAgICAgICAgICAgIHt7PyBpdC5tdWx0aXBsZSB9fW11bHRpcGxlIHt7P319XFxuICAgICAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcbiAgICAgICAgPC9zZWxlY3Q+XFxuICAgIDwvc3Bhbj5cXG48L2Rpdj5cXG5cIlxuICAgICwgaW5wdXRfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ7ez0gaXQuaXRlbS5pbnB1dFR5cGUgfHwgJ3RleHQnIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLmlucHV0TmFtZSB9fW5hbWU9XFxcInt7PSBpdC5pdGVtLmlucHV0TmFtZSB9fVxcXCJ7ez99fVxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MSW5wdXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLnBsYWNlaG9sZGVyIH19cGxhY2Vob2xkZXI9XFxcInt7PSBpdC5pdGVtLnBsYWNlaG9sZGVyfX1cXFwie3s/fX1cXG4gICAgICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcbjwvZGl2PlxcblwiXG4gICAgLCB0ZXh0YXJlYV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHRleHRhcmVhIG1sLWJpbmQ9XFxcIk1MVGV4dGFyZWE6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX1cXG4gICAgICAgIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiXFxuICAgICAgICB7ez8gaXQuaXRlbS5wbGFjZWhvbGRlciB9fXBsYWNlaG9sZGVyPVxcXCJ7ez0gaXQuaXRlbS5wbGFjZWhvbGRlcn19XFxcInt7P319XFxuICAgICAgICB7ez8gaXQuaXRlbS5hdXRvcmVzaXplIH19cm93cz1cXFwie3s9IGl0Lml0ZW0uYXV0b3Jlc2l6ZS5taW5MaW5lcyB9fVxcXCJ7ez99fT48L3RleHRhcmVhPlxcbjwvZGl2PlwiXG4gICAgLCBidXR0b25fZG90ID0gXCI8ZGl2IHt7PyBpdC5pdGVtLmFsdFRleHQgfX10aXRsZT1cXFwie3s9IGl0Lml0ZW0uYWx0VGV4dH19XFxcIiB7ez99fWNsYXNzPVxcXCJidG4tdG9vbGJhcnt7PyBpdC5pdGVtLndyYXBDc3NDbGFzc319IHt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fXt7P319XFxcIj5cXG4gICAgPGJ1dHRvbiBtbC1iaW5kPVxcXCJNTEJ1dHRvbjp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICAgICAgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCB7ez8gaXQuaXRlbS5pdGVtQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS5pdGVtQ3NzQ2xhc3MgfX17ez99fVxcXCI+XFxuICAgICAgICB7ez0gaXQuaXRlbS5sYWJlbCB8fCAnJyB9fVxcbiAgICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cIlxuICAgICwgaHlwZXJsaW5rX2RvdCA9IFwie3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXG4gICAgPGEge3s/IGl0Lml0ZW0uaHJlZn19aHJlZj1cXFwie3s9IGl0Lml0ZW0uaHJlZiB9fVxcXCJ7ez99fVxcbiAgICAgICAge3s/IGl0Lml0ZW0udGFyZ2V0fX10YXJnZXQ9XFxcInt7PSBpdC5pdGVtLnRhcmdldCB9fVxcXCJ7ez99fSAgIFxcbiAgICAgICAgbWwtYmluZD1cXFwiTUxIeXBlcmxpbms6e3s9IGl0LmNvbXBOYW1lIH19XFxcIiBcXG4gICAgICAgIGNsYXNzPVxcXCJoeXBlcmxpbmsgaHlwZXJsaW5rLWRlZmF1bHRcXFwiPlxcbiAgICAgICAge3s9IGl0Lml0ZW0ubGFiZWwgfHwgJycgfX1cXG4gICAgPC9hPlxcbjwvZGl2PlwiXG4gICAgLCBjaGVja2JveF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICA8aW5wdXQgdHlwZT1cXFwiY2hlY2tib3hcXFwiXFxuICAgIGlkPVxcXCJ7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgIG1sLWJpbmQ9XFxcIk1MSW5wdXQ6e3s9IGl0LmNvbXBOYW1lIH19XFxcIlxcbiAgICB7ez8gaXQuZGlzYWJsZWQgfX1kaXNhYmxlZCB7ez99fVxcbiAgICBjbGFzcz1cXFwie3s9IGl0Lml0ZW0uaXRlbUNzc0NsYXNzIHx8ICcnfX1cXFwiPlxcbiAgPGxhYmVsIGZvcj1cXFwie3s9IGl0LmNvbXBOYW1lIH19XFxcIj57ez0gaXQuaXRlbS5sYWJlbH19PC9sYWJlbD5cXG48L2Rpdj5cXG5cIlxuICAgICwgbGlzdF9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPHVsIG1sLWJpbmQ9XFxcIk1MTGlzdDp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX0+XFxuICAgICAgICA8bGkgbWwtYmluZD1cXFwiTUxMaXN0SXRlbTppdGVtU2FtcGxlXFxcIiBjbGFzcz1cXFwibGlzdC1pdGVtXFxcIj5cXG4gICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVxcXCJbZGF0YV06bGFiZWxcXFwiPjwvc3Bhbj5cXG4gICAgICAgICAgICB7ez8gaXQuZWRpdEJ0biB9fTxidXR0b24gbWwtYmluZD1cXFwiW2V2ZW50c106ZWRpdEJ0blxcXCI+ZWRpdDwvYnV0dG9uPnt7P319XFxuICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVxcXCJbZXZlbnRzXTpkZWxldGVCdG5cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcXFwiPiA8L2J1dHRvbj5cXG4gICAgICAgIDwvbGk+XFxuICAgIDwvdWw+XFxuPC9kaXY+XFxuXCJcbiAgICAsIHRpbWVfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0aW1lXFxcIlxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MVGltZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuPC9kaXY+XCJcbiAgICAsIGRhdGVfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJkYXRlXFxcIlxcbiAgICAgICAgICAgIG1sLWJpbmQ9XFxcIk1MRGF0ZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+XFxuPC9kaXY+XCJcbiAgICAsIGNvbWJvX2RvdCA9IFwiPGRpdiBtbC1iaW5kPVxcXCJNTENvbWJvOnt7PSBpdC5jb21wTmFtZSB9fVxcXCIgY2xhc3M9XFxcImZvcm0tZ3JvdXB7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX17ez99fVxcXCI+XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAge3sgdmFyIGxpc3RJRCA9ICdtbC1jb21iby1kYXRhbGlzdC0nICsgaXQubWlsb0NvdW50KCk7IH19XFxuICAgIDxpbnB1dCBtbC1iaW5kPVxcXCJbZGF0YSwgZXZlbnRzXTppbnB1dFxcXCJcXG4gICAgICAgICAgICBuYW1lPVxcXCJ7ez0gbGlzdElEIH19XFxcIlxcbiAgICAgICAgICAgIGxpc3Q9XFxcInt7PSBsaXN0SUQgfX1cXFwiXFxuICAgICAgICAgICAge3s/IGl0LmRpc2FibGVkIH19ZGlzYWJsZWQge3s/fX1cXG4gICAgICAgICAgICBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj5cXG4gICAgPGRhdGFsaXN0IGlkPVxcXCJ7ez0gbGlzdElEIH19XFxcIiBtbC1iaW5kPVxcXCJbdGVtcGxhdGVdOmRhdGFsaXN0XFxcIj48L2RhdGFsaXN0PlxcbjwvZGl2PlwiXG4gICAgLCBpbWFnZV9kb3QgPSBcInt7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxuICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXG4gICAgPGltZyB7ez8gaXQuaXRlbS5zcmMgfX1zcmM9XFxcInt7PSBpdC5pdGVtLnNyYyB9fVxcXCJ7ez99fVxcbiAgICAgICAgbWwtYmluZD1cXFwiTUxJbWFnZTp7ez0gaXQuY29tcE5hbWUgfX1cXFwiXFxuICAgICAgICB7ez8gaXQuaXRlbS53aWR0aCB9fXdpZHRoPVxcXCJ7ez0gaXQuaXRlbS53aWR0aCB9fVxcXCJ7ez99fVxcbiAgICAgICAge3s/IGl0Lml0ZW0uaGVpZ2h0IH19aGVpZ2h0PVxcXCJ7ez0gaXQuaXRlbS5oZWlnaHQgfX1cXFwie3s/fX0+XFxuPC9kaXY+XFxuXCJcbiAgICAsIGRyb3B0YXJnZXRfZG90ID0gXCJ7eyMgZGVmLnBhcnRpYWxzLmZvcm1Hcm91cCB9fVxcbiAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxuICAgICAgICA8aW1nIHt7PyBpdC5pdGVtLnNyYyB9fXNyYz1cXFwie3s9IGl0Lml0ZW0uc3JjIH19XFxcInt7P319XFxuICAgICAgICAgICAgbWwtYmluZD1cXFwiTUxEcm9wVGFyZ2V0Ont7PSBpdC5jb21wTmFtZSB9fVxcXCJcXG4gICAgICAgICAgICB7ez8gaXQuaXRlbS53aWR0aCB9fXdpZHRoPVxcXCJ7ez0gaXQuaXRlbS53aWR0aCB9fVxcXCJ7ez99fVxcbiAgICAgICAgICAgIHt7PyBpdC5pdGVtLmhlaWdodCB9fWhlaWdodD1cXFwie3s9IGl0Lml0ZW0uaGVpZ2h0IH19XFxcInt7P319PlxcbjwvZGl2PlxcblwiXG4gICAgLCB0ZXh0X2RvdCA9IFwie3t2YXIgdGFnTmFtZSA9IGl0Lml0ZW0udGFnTmFtZSB8fCAnc3Bhbic7fX1cXG48e3s9dGFnTmFtZX19IG1sLWJpbmQ9XFxcIk1MVGV4dDp7ez0gaXQuY29tcE5hbWUgfX1cXFwie3s/IGl0Lml0ZW0ud3JhcENzc0NsYXNzfX0gY2xhc3M9XFxcInt7PSBpdC5pdGVtLndyYXBDc3NDbGFzcyB9fVxcXCJ7ez99fT5cXG4gICAge3s/IGl0Lml0ZW0ubGFiZWwgfX1cXG4gICAgICAgIHt7PSBpdC5pdGVtLmxhYmVsfX1cXG4gICAge3s/fX1cXG48L3t7PXRhZ05hbWV9fT5cXG5cIlxuICAgICwgY2xlYXJfZG90ID0gJzxkaXYgY2xhc3M9XCJjYy1jbGVhclwiPjwvZGl2Pic7XG5cblxuZm9ybVJlZ2lzdHJ5LmFkZCgnZ3JvdXAnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEdyb3VwJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBncm91cF9kb3QsICAgICAgICAgICAgICAgICBtb2RlbFBhdGhSdWxlOiAncHJvaGliaXRlZCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCd3cmFwcGVyJywgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MV3JhcHBlcicsICAgICAgICAgICAgICAgdGVtcGxhdGU6IHdyYXBwZXJfZG90LCAgICAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdwcm9oaWJpdGVkJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3NlbGVjdCcsICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxTZWxlY3QnLCAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogc2VsZWN0X2RvdCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NTZWxlY3RTY2hlbWEgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnaW5wdXQnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTElucHV0JywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBpbnB1dF9kb3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0lucHV0U2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdpbnB1dGxpc3QnLCAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MSW5wdXRMaXN0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzSW5wdXRMaXN0U2NoZW1hICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3RleHRhcmVhJywgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxUZXh0YXJlYScsICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGV4dGFyZWFfZG90LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NUZXh0YXJlYVNjaGVtYSAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnYnV0dG9uJywgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEJ1dHRvbicsICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBidXR0b25fZG90LCAgICAgICAgICAgICAgICBtb2RlbFBhdGhSdWxlOiAnb3B0aW9uYWwnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdyYWRpbycsICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MUmFkaW9Hcm91cCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzUmFkaW9TY2hlbWEgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NoZWNrZ3JvdXAnLCAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxDaGVja0dyb3VwJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NDaGVja0dyb3VwU2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdoeXBlcmxpbmsnLCAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MSHlwZXJsaW5rJywgICAgICAgICAgICAgdGVtcGxhdGU6IGh5cGVybGlua19kb3QsICAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdvcHRpb25hbCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NoZWNrYm94JywgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxJbnB1dCcsICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogY2hlY2tib3hfZG90ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnbGlzdCcsICAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTExpc3QnLCAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBsaXN0X2RvdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCd0aW1lJywgICAgICAgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MVGltZScsICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRpbWVfZG90LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2RhdGUnLCAgICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxEYXRlJywgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogZGF0ZV9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY29tYm8nLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTENvbWJvJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjb21ib19kb3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GdW5jdGlvbjogcHJvY2Vzc0NvbWJvU2NoZW1hICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdzdXBlcmNvbWJvJywgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MU3VwZXJDb21ibycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZ1bmN0aW9uOiBwcm9jZXNzU3VwZXJDb21ib1NjaGVtYSAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ2NvbWJvbGlzdCcsICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxDb21ib0xpc3QnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRnVuY3Rpb246IHByb2Nlc3NDb21ib0xpc3RTY2hlbWEgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnaW1hZ2UnLCAgICAgICAgICAgICAgICAgeyBjb21wQ2xhc3M6ICdNTEltYWdlJywgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBpbWFnZV9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5mb3JtUmVnaXN0cnkuYWRkKCdkcm9wdGFyZ2V0JywgICAgICAgICAgICB7IGNvbXBDbGFzczogJ01MRHJvcFRhcmdldCcsICAgICAgICAgICAgdGVtcGxhdGU6IGRyb3B0YXJnZXRfZG90LCAgICAgICAgICAgIG1vZGVsUGF0aFJ1bGU6ICdwcm9oaWJpdGVkJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbmZvcm1SZWdpc3RyeS5hZGQoJ3RleHQnLCAgICAgICAgICAgICAgICAgIHsgY29tcENsYXNzOiAnTUxUZXh0JywgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGV4dF9kb3QsICAgICAgICAgICAgICAgICAgbW9kZWxQYXRoUnVsZTogJ29wdGlvbmFsJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuZm9ybVJlZ2lzdHJ5LmFkZCgnY2xlYXInLCAgICAgICAgICAgICAgICAgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjbGVhcl9kb3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuZnVuY3Rpb24gcHJvY2Vzc1NlbGVjdFNjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5zZWxlY3RPcHRpb25zO1xuICAgIHNldENvbXBvbmVudE9wdGlvbnMoY29tcCwgb3B0aW9ucywgc2V0Q29tcG9uZW50TW9kZWwpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NSYWRpb1NjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5yYWRpb09wdGlvbnM7XG4gICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21wb25lbnRNb2RlbCk7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc0NoZWNrR3JvdXBTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuY2hlY2tPcHRpb25zO1xuICAgIGNvbXAuc2V0U2VsZWN0QWxsKCEhc2NoZW1hLnNlbGVjdEFsbCk7XG4gICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21wb25lbnRNb2RlbCk7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc0NvbWJvU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIHZhciBvcHRpb25zID0gc2NoZW1hLmNvbWJvT3B0aW9ucztcbiAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbXBvbmVudE1vZGVsKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzU3VwZXJDb21ib1NjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHNjaGVtYS5jb21ib09wdGlvbnNcbiAgICAgICAgLCBvcHRpb25zVVJMID0gc2NoZW1hLmNvbWJvT3B0aW9uc1VSTFxuICAgICAgICAsIGFkZEl0ZW1Qcm9tcHQgPSBzY2hlbWEuYWRkSXRlbVByb21wdFxuICAgICAgICAsIHBsYWNlSG9sZGVyID0gc2NoZW1hLnBsYWNlSG9sZGVyO1xuXG4gICAgXy5kZWZlclRpY2tzKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoYWRkSXRlbVByb21wdCkgY29tcC5zZXRBZGRJdGVtUHJvbXB0KGFkZEl0ZW1Qcm9tcHQpO1xuICAgICAgICBpZiAocGxhY2VIb2xkZXIpIGNvbXAuc2V0UGxhY2Vob2xkZXIocGxhY2VIb2xkZXIpO1xuICAgICAgICBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldENvbWJvT3B0aW9ucyk7XG4gICAgICAgIGlmKG9wdGlvbnNVUkwpXG4gICAgICAgICAgICBjb21wLmluaXRPcHRpb25zVVJMKG9wdGlvbnNVUkwpO1xuICAgIH0sIDIpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NDb21ib0xpc3RTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBzY2hlbWEuY29tYm9PcHRpb25zXG4gICAgICAgICwgYWRkSXRlbVByb21wdCA9IHNjaGVtYS5hZGRJdGVtUHJvbXB0XG4gICAgICAgICwgcGxhY2VIb2xkZXIgPSBzY2hlbWEucGxhY2VIb2xkZXI7XG5cbiAgICBfLmRlZmVyVGlja3MoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChhZGRJdGVtUHJvbXB0KSBjb21wLnNldEFkZEl0ZW1Qcm9tcHQoYWRkSXRlbVByb21wdCk7XG4gICAgICAgIGlmIChwbGFjZUhvbGRlcikgY29tcC5zZXRQbGFjZWhvbGRlcihwbGFjZUhvbGRlcik7XG4gICAgICAgIGNvbXAuc2V0RGF0YVZhbGlkYXRpb24oc2NoZW1hLmRhdGFWYWxpZGF0aW9uKTtcbiAgICAgICAgc2V0Q29tcG9uZW50T3B0aW9ucyhjb21wLCBvcHRpb25zLCBzZXRDb21ib09wdGlvbnMpO1xuICAgIH0sIDIpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NJbnB1dExpc3RTY2hlbWEoY29tcCwgc2NoZW1hKSB7XG4gICAgY29tcC5zZXRBc3luYyhzY2hlbWEuYXN5bmNIYW5kbGVyKTtcbiAgICBjb21wLnNldFBsYWNlSG9sZGVyKHNjaGVtYS5wbGFjZUhvbGRlcik7XG59XG5cblxuZnVuY3Rpb24gcHJvY2Vzc1RleHRhcmVhU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIGlmIChzY2hlbWEuYXV0b3Jlc2l6ZSlcbiAgICAgICAgXy5kZWZlck1ldGhvZChjb21wLCAnc3RhcnRBdXRvcmVzaXplJywgc2NoZW1hLmF1dG9yZXNpemUpO1xufVxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NJbnB1dFNjaGVtYShjb21wLCBzY2hlbWEpIHtcbiAgICBpZiAoXy5pc051bWVyaWMoc2NoZW1hLm1heExlbmd0aCkpIGNvbXAuc2V0TWF4TGVuZ3RoKHNjaGVtYS5tYXhMZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBzZXRDb21wb25lbnRPcHRpb25zKGNvbXAsIG9wdGlvbnMsIHNldE1vZGVsRnVuYykge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50aGVuID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHNldE1vZGVsRnVuYyhjb21wLCBbeyB2YWx1ZTogMCwgbGFiZWw6ICdsb2FkaW5nLi4uJyB9XSk7XG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpIHsgc2V0TW9kZWxGdW5jKGNvbXAsIGRhdGEpOyB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHsgc2V0TW9kZWxGdW5jKGNvbXAsIFt7IHZhbHVlOiAwLCBsYWJlbDogJ2xvYWRpbmcgZXJyb3InIH1dKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgc2V0TW9kZWxGdW5jKGNvbXAsIG9wdGlvbnMpO1xuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBzZXRDb21wb25lbnRNb2RlbChjb21wLCBkYXRhKSB7XG4gICAgY29tcC5tb2RlbC5zZXQoZGF0YSk7XG4gICAgLy8gXy5kZWZlck1ldGhvZChjb21wLm1vZGVsLCAnc2V0JywgZGF0YSk7XG4gICAgLy8gZG9pbmcgaXQgd2l0aCBkZWZlciBtYWtlcyBjaGFubmVsIG5vdCBzZXQgd2hlbiB0aGUgYXJ0aWNsZSBpcyBvcGVuZWRcbn1cblxuXG5mdW5jdGlvbiBzZXRDb21ib09wdGlvbnMoY29tcCwgZGF0YSkge1xuICAgIGNvbXAuc2V0T3B0aW9ucyhkYXRhKTtcbn1cblxuXG5mdW5jdGlvbiBwcm9jZXNzU2NoZW1hKGNvbXAsIHNjaGVtYSkge1xuICAgIGNvbXAucHJvY2Vzc0Zvcm1TY2hlbWEoc2NoZW1hKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXJcbiAgICAsIGNoZWNrID0gbWlsby51dGlsLmNoZWNrXG4gICAgLCBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxudmFyIGZvcm1UeXBlcyA9IHt9O1xudmFyIGRlZmF1bHRzID0ge307XG5cbnZhciBmb3JtUmVnaXN0cnkgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXQ6IHJlZ2lzdHJ5X2dldCxcbiAgICBhZGQ6IHJlZ2lzdHJ5X2FkZCxcbiAgICBzZXREZWZhdWx0czogcmVnaXN0cnlfc2V0RGVmYXVsdHNcbn07XG5cblxudmFyIERFRkFVTFRfVEVNUExBVEUgPSAne3sjIGRlZi5wYXJ0aWFscy5mb3JtR3JvdXAgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IyBkZWYucGFydGlhbHMubGFiZWwgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx7ez0gaXQudGFnTmFtZX19IG1sLWJpbmQ9XCJ7ez0gaXQuY29tcENsYXNzfX06e3s9IGl0LmNvbXBOYW1lIH19XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3t7PSBpdC50YWdOYW1lfX0+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2Pic7XG5cbmZvcm1SZWdpc3RyeS5zZXREZWZhdWx0cyh7XG4gICAgdGVtcGxhdGU6IERFRkFVTFRfVEVNUExBVEUsXG4gICAgbW9kZWxQYXRoUnVsZTogJ3JlcXVpcmVkJyxcbiAgICBpdGVtRnVuY3Rpb246IG51bGxcbn0pO1xuXG5cbmZ1bmN0aW9uIHJlZ2lzdHJ5X2dldChuYW1lKSB7XG4gICAgdmFyIGZvcm1JdGVtID0gbmFtZSAmJiBmb3JtVHlwZXNbbmFtZV07XG5cbiAgICBpZiAoIWZvcm1JdGVtKSBcbiAgICAgICAgcmV0dXJuIGxvZ2dlci5lcnJvcignRm9ybSBpdGVtICcgKyBuYW1lICsgJyBub3QgcmVnaXN0ZXJlZCcpO1xuXG4gICAgcmV0dXJuIGZvcm1JdGVtO1xufVxuXG5mdW5jdGlvbiByZWdpc3RyeV9hZGQobmFtZSwgbmV3Rm9ybUl0ZW0pIHtcbiAgICBjaGVjayhuYW1lLCBTdHJpbmcpO1xuICAgIGNoZWNrKG5ld0Zvcm1JdGVtLCB7XG4gICAgICAgIGNvbXBDbGFzczogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgdGVtcGxhdGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIG1vZGVsUGF0aFJ1bGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIGl0ZW1GdW5jdGlvbjogTWF0Y2guT3B0aW9uYWwoRnVuY3Rpb24pXG4gICAgfSk7XG5cbiAgICB2YXIgZm9ybUl0ZW0gPSBfLmNsb25lKGRlZmF1bHRzKTtcbiAgICBfLmV4dGVuZChmb3JtSXRlbSwgbmV3Rm9ybUl0ZW0pO1xuXG4gICAgaWYgKG5hbWUgJiYgZm9ybVR5cGVzW25hbWVdKSBcbiAgICAgICAgcmV0dXJuIGxvZ2dlci5lcnJvcignRm9ybSBpdGVtICcgKyBuYW1lICsgJyBhbHJlYWR5IHJlZ2lzdGVyZWQnKTtcblxuICAgIGZvcm1UeXBlc1tuYW1lXSA9IGZvcm1JdGVtO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiByZWdpc3RyeV9zZXREZWZhdWx0cyhuZXdEZWZhdWx0cykge1xuICAgIGNoZWNrKGRlZmF1bHRzLCBPYmplY3QpO1xuICAgIGRlZmF1bHRzID0gbmV3RGVmYXVsdHM7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKCEod2luZG93Lm1pbG8gJiYgd2luZG93Lm1pbG8ubWlsb192ZXJzaW9uKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pbG8gaXMgbm90IGF2YWlsYWJsZScpO1xuXG4vKipcbiAqIGBtaWxvLXVpYFxuICpcbiAqIFRoaXMgYnVuZGxlIHdpbGwgcmVnaXN0ZXIgYWRkaXRpb25hbCBjb21wb25lbnQgY2xhc3NlcyBmb3IgVUlcbiAqL1xuXG5yZXF1aXJlKCcuL3VzZV9jb21wb25lbnRzJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Hcm91cCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1dyYXBwZXInKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9UZXh0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvU2VsZWN0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSW5wdXQnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9JbnB1dExpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9UZXh0YXJlYScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1JhZGlvR3JvdXAnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9DaGVja0dyb3VwJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvQnV0dG9uJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSHlwZXJsaW5rJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvTGlzdCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0xpc3RJdGVtU2ltcGxlJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvTGlzdEl0ZW0nKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9UaW1lJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvRGF0ZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0NvbWJvJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvU3VwZXJDb21ibycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0NvbWJvTGlzdCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0ltYWdlJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvRHJvcFRhcmdldCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0ZvbGRUcmVlJyk7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy9ib290c3RyYXAvQWxlcnQnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9ib290c3RyYXAvRGlhbG9nJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvYm9vdHN0cmFwL0Ryb3Bkb3duJyk7XG5cbnJlcXVpcmUoJy4vZm9ybXMvRm9ybScpO1xuIiwidmFyIHByb2Nlc3M9cmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpLGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307LyohXG4gKiBhc3luY1xuICogaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luY1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQgQ2FvbGFuIE1jTWFob25cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGFzeW5jID0ge307XG4gICAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gICAgZnVuY3Rpb24gaWRlbnRpdHkodikge1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9Cb29sKHYpIHtcbiAgICAgICAgcmV0dXJuICEhdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gbm90SWQodikge1xuICAgICAgICByZXR1cm4gIXY7XG4gICAgfVxuXG4gICAgLy8gZ2xvYmFsIG9uIHRoZSBzZXJ2ZXIsIHdpbmRvdyBpbiB0aGUgYnJvd3NlclxuICAgIHZhciBwcmV2aW91c19hc3luYztcblxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIChgc2VsZmApIGluIHRoZSBicm93c2VyLCBgZ2xvYmFsYFxuICAgIC8vIG9uIHRoZSBzZXJ2ZXIsIG9yIGB0aGlzYCBpbiBzb21lIHZpcnR1YWwgbWFjaGluZXMuIFdlIHVzZSBgc2VsZmBcbiAgICAvLyBpbnN0ZWFkIG9mIGB3aW5kb3dgIGZvciBgV2ViV29ya2VyYCBzdXBwb3J0LlxuICAgIHZhciByb290ID0gdHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYuc2VsZiA9PT0gc2VsZiAmJiBzZWxmIHx8XG4gICAgICAgICAgICB0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsIHx8XG4gICAgICAgICAgICB0aGlzO1xuXG4gICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgICBwcmV2aW91c19hc3luYyA9IHJvb3QuYXN5bmM7XG4gICAgfVxuXG4gICAgYXN5bmMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IHByZXZpb3VzX2FzeW5jO1xuICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG9ubHlfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHRocm93IG5ldyBFcnJvcihcIkNhbGxiYWNrIHdhcyBhbHJlYWR5IGNhbGxlZC5cIik7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9vbmNlKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJsaXR5IGZ1bmN0aW9ucyAvLy8vXG5cbiAgICB2YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIHZhciBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgLy8gUG9ydGVkIGZyb20gdW5kZXJzY29yZS5qcyBpc09iamVjdFxuICAgIHZhciBfaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgICAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2lzQXJyYXlMaWtlKGFycikge1xuICAgICAgICByZXR1cm4gX2lzQXJyYXkoYXJyKSB8fCAoXG4gICAgICAgICAgICAvLyBoYXMgYSBwb3NpdGl2ZSBpbnRlZ2VyIGxlbmd0aCBwcm9wZXJ0eVxuICAgICAgICAgICAgdHlwZW9mIGFyci5sZW5ndGggPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggPj0gMCAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCAlIDEgPT09IDBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXJyYXlFYWNoKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tYXAoYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmFuZ2UoY291bnQpIHtcbiAgICAgICAgcmV0dXJuIF9tYXAoQXJyYXkoY291bnQpLCBmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gaTsgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlZHVjZShhcnIsIGl0ZXJhdG9yLCBtZW1vKSB7XG4gICAgICAgIF9hcnJheUVhY2goYXJyLCBmdW5jdGlvbiAoeCwgaSwgYSkge1xuICAgICAgICAgICAgbWVtbyA9IGl0ZXJhdG9yKG1lbW8sIHgsIGksIGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZvckVhY2hPZihvYmplY3QsIGl0ZXJhdG9yKSB7XG4gICAgICAgIF9hcnJheUVhY2goX2tleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmRleE9mKGFyciwgaXRlbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHZhciBfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9rZXlJdGVyYXRvcihjb2xsKSB7XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHZhciBsZW47XG4gICAgICAgIHZhciBrZXlzO1xuICAgICAgICBpZiAoX2lzQXJyYXlMaWtlKGNvbGwpKSB7XG4gICAgICAgICAgICBsZW4gPSBjb2xsLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGkgOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBfa2V5cyhjb2xsKTtcbiAgICAgICAgICAgIGxlbiA9IGtleXMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8ga2V5c1tpXSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2ltaWxhciB0byBFUzYncyByZXN0IHBhcmFtIChodHRwOi8vYXJpeWEub2ZpbGFicy5jb20vMjAxMy8wMy9lczYtYW5kLXJlc3QtcGFyYW1ldGVyLmh0bWwpXG4gICAgLy8gVGhpcyBhY2N1bXVsYXRlcyB0aGUgYXJndW1lbnRzIHBhc3NlZCBpbnRvIGFuIGFycmF5LCBhZnRlciBhIGdpdmVuIGluZGV4LlxuICAgIC8vIEZyb20gdW5kZXJzY29yZS5qcyAoaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlL3B1bGwvMjE0MCkuXG4gICAgZnVuY3Rpb24gX3Jlc3RQYXJhbShmdW5jLCBzdGFydEluZGV4KSB7XG4gICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ID09IG51bGwgPyBmdW5jLmxlbmd0aCAtIDEgOiArc3RhcnRJbmRleDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKTtcbiAgICAgICAgICAgIHZhciByZXN0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICByZXN0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCArIHN0YXJ0SW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoIChzdGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIHJlc3QpO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ3VycmVudGx5IHVudXNlZCBidXQgaGFuZGxlIGNhc2VzIG91dHNpZGUgb2YgdGhlIHN3aXRjaCBzdGF0ZW1lbnQ6XG4gICAgICAgICAgICAvLyB2YXIgYXJncyA9IEFycmF5KHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgICAgIC8vIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHN0YXJ0SW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIC8vICAgICBhcmdzW2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBhcmdzW3N0YXJ0SW5kZXhdID0gcmVzdDtcbiAgICAgICAgICAgIC8vIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IodmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGV4cG9ydGVkIGFzeW5jIG1vZHVsZSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgLy8vLyBuZXh0VGljayBpbXBsZW1lbnRhdGlvbiB3aXRoIGJyb3dzZXItY29tcGF0aWJsZSBmYWxsYmFjayAvLy8vXG5cbiAgICAvLyBjYXB0dXJlIHRoZSBnbG9iYWwgcmVmZXJlbmNlIHRvIGd1YXJkIGFnYWluc3QgZmFrZVRpbWVyIG1vY2tzXG4gICAgdmFyIF9zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmIHNldEltbWVkaWF0ZTtcblxuICAgIHZhciBfZGVsYXkgPSBfc2V0SW1tZWRpYXRlID8gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgLy8gbm90IGEgZGlyZWN0IGFsaWFzIGZvciBJRTEwIGNvbXBhdGliaWxpdHlcbiAgICAgICAgX3NldEltbWVkaWF0ZShmbik7XG4gICAgfSA6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICB9IGVsc2Uge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IF9kZWxheTtcbiAgICB9XG4gICAgYXN5bmMuc2V0SW1tZWRpYXRlID0gX3NldEltbWVkaWF0ZSA/IF9kZWxheSA6IGFzeW5jLm5leHRUaWNrO1xuXG5cbiAgICBhc3luYy5mb3JFYWNoID1cbiAgICBhc3luYy5lYWNoID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2YoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoU2VyaWVzID1cbiAgICBhc3luYy5lYWNoU2VyaWVzID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cblxuICAgIGFzeW5jLmZvckVhY2hMaW1pdCA9XG4gICAgYXN5bmMuZWFjaExpbWl0ID0gZnVuY3Rpb24gKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gX2VhY2hPZkxpbWl0KGxpbWl0KShhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZiA9XG4gICAgYXN5bmMuZWFjaE9mID0gZnVuY3Rpb24gKG9iamVjdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdCB8fCBbXTtcblxuICAgICAgICB2YXIgaXRlciA9IF9rZXlJdGVyYXRvcihvYmplY3QpO1xuICAgICAgICB2YXIga2V5LCBjb21wbGV0ZWQgPSAwO1xuXG4gICAgICAgIHdoaWxlICgoa2V5ID0gaXRlcigpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb21wbGV0ZWQgKz0gMTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXksIG9ubHlfb25jZShkb25lKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29tcGxldGVkID09PSAwKSBjYWxsYmFjayhudWxsKTtcblxuICAgICAgICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgICAgICAgICAgY29tcGxldGVkLS07XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGtleSBpcyBudWxsIGluIGNhc2UgaXRlcmF0b3IgaXNuJ3QgZXhoYXVzdGVkXG4gICAgICAgICAgICAvLyBhbmQgZG9uZSByZXNvbHZlZCBzeW5jaHJvbm91c2x5LlxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBudWxsICYmIGNvbXBsZXRlZCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mU2VyaWVzID1cbiAgICBhc3luYy5lYWNoT2ZTZXJpZXMgPSBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICBmdW5jdGlvbiBpdGVyYXRlKCkge1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShpdGVyYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGl0ZXJhdGUoKTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLmZvckVhY2hPZkxpbWl0ID1cbiAgICBhc3luYy5lYWNoT2ZMaW1pdCA9IGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2VhY2hPZkxpbWl0KGxpbWl0KShvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9lYWNoT2ZMaW1pdChsaW1pdCkge1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHJ1bm5pbmcgPSAwO1xuICAgICAgICAgICAgdmFyIGVycm9yZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uIHJlcGxlbmlzaCAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbmUgJiYgcnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmICFlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGVuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKF9lYWNoT2ZMaW1pdChsaW1pdCksIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9TZXJpZXMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZlNlcmllcywgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hc3luY01hcChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGFyciA9IGFyciB8fCBbXTtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UoYXJyKSA/IFtdIDoge307XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLm1hcCA9IGRvUGFyYWxsZWwoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBTZXJpZXMgPSBkb1NlcmllcyhfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9hc3luY01hcCk7XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMuaW5qZWN0ID1cbiAgICBhc3luYy5mb2xkbCA9XG4gICAgYXN5bmMucmVkdWNlID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIGZ1bmN0aW9uICh4LCBpLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgeCwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIG1lbW8gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBtZW1vKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvbGRyID1cbiAgICBhc3luYy5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmV2ZXJzZWQgPSBfbWFwKGFyciwgaWRlbnRpdHkpLnJldmVyc2UoKTtcbiAgICAgICAgYXN5bmMucmVkdWNlKHJldmVyc2VkLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy50cmFuc2Zvcm0gPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gaXRlcmF0b3I7XG4gICAgICAgICAgICBpdGVyYXRvciA9IG1lbW87XG4gICAgICAgICAgICBtZW1vID0gX2lzQXJyYXkoYXJyKSA/IFtdIDoge307XG4gICAgICAgIH1cblxuICAgICAgICBhc3luYy5lYWNoT2YoYXJyLCBmdW5jdGlvbih2LCBrLCBjYikge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgdiwgaywgY2IpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe2luZGV4OiBpbmRleCwgdmFsdWU6IHh9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhfbWFwKHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICAgICAgICAgIH0pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5zZWxlY3QgPVxuICAgIGFzeW5jLmZpbHRlciA9IGRvUGFyYWxsZWwoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RMaW1pdCA9XG4gICAgYXN5bmMuZmlsdGVyTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RTZXJpZXMgPVxuICAgIGFzeW5jLmZpbHRlclNlcmllcyA9IGRvU2VyaWVzKF9maWx0ZXIpO1xuXG4gICAgZnVuY3Rpb24gX3JlamVjdChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGZ1bmN0aW9uKHZhbHVlLCBjYikge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICBjYighdik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBhc3luYy5yZWplY3QgPSBkb1BhcmFsbGVsKF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdFNlcmllcyA9IGRvU2VyaWVzKF9yZWplY3QpO1xuXG4gICAgZnVuY3Rpb24gX2NyZWF0ZVRlc3RlcihlYWNoZm4sIGNoZWNrLCBnZXRSZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYikge1xuICAgICAgICAgICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2IpIGNiKGdldFJlc3VsdChmYWxzZSwgdm9pZCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBpdGVyYXRlZSh4LCBfLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmICghY2IpIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYiAmJiBjaGVjayh2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoZ2V0UmVzdWx0KHRydWUsIHgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgbGltaXQsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvcjtcbiAgICAgICAgICAgICAgICBpdGVyYXRvciA9IGxpbWl0O1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy5hbnkgPVxuICAgIGFzeW5jLnNvbWUgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5zb21lTGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLmFsbCA9XG4gICAgYXN5bmMuZXZlcnkgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgbm90SWQsIG5vdElkKTtcblxuICAgIGFzeW5jLmV2ZXJ5TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBub3RJZCwgbm90SWQpO1xuXG4gICAgZnVuY3Rpb24gX2ZpbmRHZXRSZXN1bHQodiwgeCkge1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgYXN5bmMuZGV0ZWN0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0U2VyaWVzID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZTZXJpZXMsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuXG4gICAgYXN5bmMuc29ydEJ5ID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLm1hcChhcnIsIGZ1bmN0aW9uICh4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKGVyciwgY3JpdGVyaWEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB7dmFsdWU6IHgsIGNyaXRlcmlhOiBjcml0ZXJpYX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBfbWFwKHJlc3VsdHMuc29ydChjb21wYXJhdG9yKSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNvbXBhcmF0b3IobGVmdCwgcmlnaHQpIHtcbiAgICAgICAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYSwgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgICAgICAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmF1dG8gPSBmdW5jdGlvbiAodGFza3MsIGNvbmN1cnJlbmN5LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gY29uY3VycmVuY3kgaXMgb3B0aW9uYWwsIHNoaWZ0IHRoZSBhcmdzLlxuICAgICAgICAgICAgY2FsbGJhY2sgPSBjb25jdXJyZW5jeTtcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIga2V5cyA9IF9rZXlzKHRhc2tzKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZ1Rhc2tzID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IHJlbWFpbmluZ1Rhc2tzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgdmFyIHJ1bm5pbmdUYXNrcyA9IDA7XG5cbiAgICAgICAgdmFyIGhhc0Vycm9yID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnVuc2hpZnQoZm4pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGZuKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gX2luZGV4T2YobGlzdGVuZXJzLCBmbik7XG4gICAgICAgICAgICBpZiAoaWR4ID49IDApIGxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB0YXNrQ29tcGxldGUoKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgX2FycmF5RWFjaChsaXN0ZW5lcnMuc2xpY2UoMCksIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX2FycmF5RWFjaChrZXlzLCBmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgaWYgKGhhc0Vycm9yKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgdGFzayA9IF9pc0FycmF5KHRhc2tzW2tdKSA/IHRhc2tzW2tdOiBbdGFza3Nba11dO1xuICAgICAgICAgICAgdmFyIHRhc2tDYWxsYmFjayA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzLS07XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNhZmVSZXN1bHRzID0ge307XG4gICAgICAgICAgICAgICAgICAgIF9mb3JFYWNoT2YocmVzdWx0cywgZnVuY3Rpb24odmFsLCBya2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1tya2V5XSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3IgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2FmZVJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSh0YXNrQ29tcGxldGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVpcmVzID0gdGFzay5zbGljZSgwLCB0YXNrLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgLy8gcHJldmVudCBkZWFkLWxvY2tzXG4gICAgICAgICAgICB2YXIgbGVuID0gcmVxdWlyZXMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRlcDtcbiAgICAgICAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICAgICAgICAgIGlmICghKGRlcCA9IHRhc2tzW3JlcXVpcmVzW2xlbl1dKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBub25leGlzdGVudCBkZXBlbmRlbmN5IGluICcgKyByZXF1aXJlcy5qb2luKCcsICcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9pc0FycmF5KGRlcCkgJiYgX2luZGV4T2YoZGVwLCBrKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIGN5Y2xpYyBkZXBlbmRlbmNpZXMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiByZWFkeSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVubmluZ1Rhc2tzIDwgY29uY3VycmVuY3kgJiYgX3JlZHVjZShyZXF1aXJlcywgZnVuY3Rpb24gKGEsIHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhICYmIHJlc3VsdHMuaGFzT3duUHJvcGVydHkoeCkpO1xuICAgICAgICAgICAgICAgIH0sIHRydWUpICYmICFyZXN1bHRzLmhhc093blByb3BlcnR5KGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICBydW5uaW5nVGFza3MrKztcbiAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcysrO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uKHRpbWVzLCB0YXNrLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBERUZBVUxUX0lOVEVSVkFMID0gMDtcblxuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcblxuICAgICAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgICAgIHRpbWVzOiBERUZBVUxUX1RJTUVTLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IERFRkFVTFRfSU5URVJWQUxcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBwYXJzZVRpbWVzKGFjYywgdCl7XG4gICAgICAgICAgICBpZih0eXBlb2YgdCA9PT0gJ251bWJlcicpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiB0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodC50aW1lcywgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICAgICAgYWNjLmludGVydmFsID0gcGFyc2VJbnQodC5pbnRlcnZhbCwgMTApIHx8IERFRkFVTFRfSU5URVJWQUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYXJndW1lbnQgdHlwZSBmb3IgXFwndGltZXNcXCc6ICcgKyB0eXBlb2YgdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEgfHwgbGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50cyAtIG11c3QgYmUgZWl0aGVyICh0YXNrKSwgKHRhc2ssIGNhbGxiYWNrKSwgKHRpbWVzLCB0YXNrKSBvciAodGltZXMsIHRhc2ssIGNhbGxiYWNrKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAyICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrO1xuICAgICAgICAgICAgdGFzayA9IHRpbWVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGltZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHBhcnNlVGltZXMob3B0cywgdGltZXMpO1xuICAgICAgICB9XG4gICAgICAgIG9wdHMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgb3B0cy50YXNrID0gdGFzaztcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVkVGFzayh3cmFwcGVkQ2FsbGJhY2ssIHdyYXBwZWRSZXN1bHRzKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUF0dGVtcHQodGFzaywgZmluYWxBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2soIWVyciB8fCBmaW5hbEF0dGVtcHQsIHtlcnI6IGVyciwgcmVzdWx0OiByZXN1bHR9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgd3JhcHBlZFJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5SW50ZXJ2YWwoaW50ZXJ2YWwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUgKG9wdHMudGltZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBmaW5hbEF0dGVtcHQgPSAhKG9wdHMudGltZXMtPTEpO1xuICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlBdHRlbXB0KG9wdHMudGFzaywgZmluYWxBdHRlbXB0KSk7XG4gICAgICAgICAgICAgICAgaWYoIWZpbmFsQXR0ZW1wdCAmJiBvcHRzLmludGVydmFsID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlJbnRlcnZhbChvcHRzLmludGVydmFsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5zZXJpZXMoYXR0ZW1wdHMsIGZ1bmN0aW9uKGRvbmUsIGRhdGEpe1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBvcHRzLmNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHBhc3NlZCwgcnVuIHRoaXMgYXMgYSBjb250cm9sbCBmbG93XG4gICAgICAgIHJldHVybiBvcHRzLmNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrO1xuICAgIH07XG5cbiAgICBhc3luYy53YXRlcmZhbGwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGlmICghX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3cmFwSXRlcmF0b3IoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh3cmFwSXRlcmF0b3IobmV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbnN1cmVBc3luYyhpdGVyYXRvcikuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgd3JhcEl0ZXJhdG9yKGFzeW5jLml0ZXJhdG9yKHRhc2tzKSkoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3BhcmFsbGVsKGVhY2hmbiwgdGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UodGFza3MpID8gW10gOiB7fTtcblxuICAgICAgICBlYWNoZm4odGFza3MsIGZ1bmN0aW9uICh0YXNrLCBrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0YXNrKF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnBhcmFsbGVsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5wYXJhbGxlbExpbWl0ID0gZnVuY3Rpb24odGFza3MsIGxpbWl0LCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoX2VhY2hPZkxpbWl0KGxpbWl0KSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VyaWVzID0gZnVuY3Rpb24odGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2ZTZXJpZXMsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VDYWxsYmFjayhpbmRleCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEpID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSk6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWtlQ2FsbGJhY2soMCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmFwcGx5ID0gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGNhbGxBcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkoXG4gICAgICAgICAgICAgICAgbnVsbCwgYXJncy5jb25jYXQoY2FsbEFyZ3MpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIF9jb25jYXQoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGVzdC5hcHBseSh0aGlzLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbbnVsbF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZG9XaGlsc3QgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKytjYWxscyA8PSAxIHx8IHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudW50aWwgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9VbnRpbCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmRvV2hpbHN0KGl0ZXJhdG9yLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmR1cmluZyA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuXG4gICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2hlY2spO1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uKGVyciwgdHJ1dGgpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0cnV0aCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0KGNoZWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9EdXJpbmcgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIGFzeW5jLmR1cmluZyhmdW5jdGlvbihuZXh0KSB7XG4gICAgICAgICAgICBpZiAoY2FsbHMrKyA8IDEpIHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjb25jdXJyZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwb3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2sgfHwgbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfbmV4dChxLCB0YXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd29ya2VycyAtPSAxO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKHdvcmtlcnNMaXN0LCBmdW5jdGlvbiAod29ya2VyLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtlciA9PT0gdGFzayAmJiAhcmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcnNMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHdvcmtlcnNMaXN0ID0gW107XG4gICAgICAgIHZhciBxID0ge1xuICAgICAgICAgICAgdGFza3M6IFtdLFxuICAgICAgICAgICAgY29uY3VycmVuY3k6IGNvbmN1cnJlbmN5LFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogbm9vcCxcbiAgICAgICAgICAgIGVtcHR5OiBub29wLFxuICAgICAgICAgICAgZHJhaW46IG5vb3AsXG4gICAgICAgICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBhdXNlZDogZmFsc2UsXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2lsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEuZHJhaW4gPSBub29wO1xuICAgICAgICAgICAgICAgIHEudGFza3MgPSBbXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bnNoaWZ0OiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUoIXEucGF1c2VkICYmIHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKXtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGFza3MgPSBxLnBheWxvYWQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS5wYXlsb2FkKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBfbWFwKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd29ya2VycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXJzTGlzdC5wdXNoKHRhc2tzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNiID0gb25seV9vbmNlKF9uZXh0KHEsIHRhc2tzKSk7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcihkYXRhLCBjYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5uaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd29ya2Vyc0xpc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2Vyc0xpc3Q7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaWRsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAocS5wYXVzZWQgPT09IGZhbHNlKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VtZUNvdW50ID0gTWF0aC5taW4ocS5jb25jdXJyZW5jeSwgcS50YXNrcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gY2FsbCBxLnByb2Nlc3Mgb25jZSBwZXIgY29uY3VycmVudFxuICAgICAgICAgICAgICAgIC8vIHdvcmtlciB0byBwcmVzZXJ2ZSBmdWxsIGNvbmN1cnJlbmN5IGFmdGVyIHBhdXNlXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdyA9IDE7IHcgPD0gcmVzdW1lQ291bnQ7IHcrKykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBxO1xuICAgIH1cblxuICAgIGFzeW5jLnF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcbiAgICAgICAgdmFyIHEgPSBfcXVldWUoZnVuY3Rpb24gKGl0ZW1zLCBjYikge1xuICAgICAgICAgICAgd29ya2VyKGl0ZW1zWzBdLCBjYik7XG4gICAgICAgIH0sIGNvbmN1cnJlbmN5LCAxKTtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMucHJpb3JpdHlRdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG5cbiAgICAgICAgZnVuY3Rpb24gX2NvbXBhcmVUYXNrcyhhLCBiKXtcbiAgICAgICAgICAgIHJldHVybiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9iaW5hcnlTZWFyY2goc2VxdWVuY2UsIGl0ZW0sIGNvbXBhcmUpIHtcbiAgICAgICAgICAgIHZhciBiZWcgPSAtMSxcbiAgICAgICAgICAgICAgICBlbmQgPSBzZXF1ZW5jZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgd2hpbGUgKGJlZyA8IGVuZCkge1xuICAgICAgICAgICAgICAgIHZhciBtaWQgPSBiZWcgKyAoKGVuZCAtIGJlZyArIDEpID4+PiAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZShpdGVtLCBzZXF1ZW5jZVttaWRdKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlZyA9IG1pZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBtaWQgLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBiZWc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKF9iaW5hcnlTZWFyY2gocS50YXNrcywgaXRlbSwgX2NvbXBhcmVUYXNrcykgKyAxLCAwLCBpdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG5vcm1hbCBxdWV1ZVxuICAgICAgICB2YXIgcSA9IGFzeW5jLnF1ZXVlKHdvcmtlciwgY29uY3VycmVuY3kpO1xuXG4gICAgICAgIC8vIE92ZXJyaWRlIHB1c2ggdG8gYWNjZXB0IHNlY29uZCBwYXJhbWV0ZXIgcmVwcmVzZW50aW5nIHByaW9yaXR5XG4gICAgICAgIHEucHVzaCA9IGZ1bmN0aW9uIChkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZW1vdmUgdW5zaGlmdCBmdW5jdGlvblxuICAgICAgICBkZWxldGUgcS51bnNoaWZ0O1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5jYXJnbyA9IGZ1bmN0aW9uICh3b3JrZXIsIHBheWxvYWQpIHtcbiAgICAgICAgcmV0dXJuIF9xdWV1ZSh3b3JrZXIsIDEsIHBheWxvYWQpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfY29uc29sZV9mbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY29uc29sZVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FycmF5RWFjaChhcmdzLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGVbbmFtZV0oeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMubG9nID0gX2NvbnNvbGVfZm4oJ2xvZycpO1xuICAgIGFzeW5jLmRpciA9IF9jb25zb2xlX2ZuKCdkaXInKTtcbiAgICAvKmFzeW5jLmluZm8gPSBfY29uc29sZV9mbignaW5mbycpO1xuICAgIGFzeW5jLndhcm4gPSBfY29uc29sZV9mbignd2FybicpO1xuICAgIGFzeW5jLmVycm9yID0gX2NvbnNvbGVfZm4oJ2Vycm9yJyk7Ki9cblxuICAgIGFzeW5jLm1lbW9pemUgPSBmdW5jdGlvbiAoZm4sIGhhc2hlcikge1xuICAgICAgICB2YXIgbWVtbyA9IHt9O1xuICAgICAgICB2YXIgcXVldWVzID0ge307XG4gICAgICAgIHZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICAgICAgICBoYXNoZXIgPSBoYXNoZXIgfHwgaWRlbnRpdHk7XG4gICAgICAgIHZhciBtZW1vaXplZCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gbWVtb2l6ZWQoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoaGFzLmNhbGwobWVtbywga2V5KSkgeyAgIFxuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIG1lbW9ba2V5XSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChoYXMuY2FsbChxdWV1ZXMsIGtleSkpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldID0gW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcSA9IHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gcS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHFbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG1lbW9pemVkLm1lbW8gPSBtZW1vO1xuICAgICAgICBtZW1vaXplZC51bm1lbW9pemVkID0gZm47XG4gICAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9O1xuXG4gICAgYXN5bmMudW5tZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZuLnVubWVtb2l6ZWQgfHwgZm4pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF90aW1lcyhtYXBwZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb3VudCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBtYXBwZXIoX3JhbmdlKGNvdW50KSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy50aW1lcyA9IF90aW1lcyhhc3luYy5tYXApO1xuICAgIGFzeW5jLnRpbWVzU2VyaWVzID0gX3RpbWVzKGFzeW5jLm1hcFNlcmllcyk7XG4gICAgYXN5bmMudGltZXNMaW1pdCA9IGZ1bmN0aW9uIChjb3VudCwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMubWFwTGltaXQoX3JhbmdlKGNvdW50KSwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgdmFyIGZucyA9IGFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYXJncy5wb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBub29wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5yZWR1Y2UoZm5zLCBhcmdzLCBmdW5jdGlvbiAobmV3YXJncywgZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgbmV3YXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgbmV4dGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoZXJyLCBuZXh0YXJncyk7XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoYXQsIFtlcnJdLmNvbmNhdChyZXN1bHRzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmNvbXBvc2UgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5zZXEuYXBwbHkobnVsbCwgQXJyYXkucHJvdG90eXBlLnJldmVyc2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBfYXBwbHlFYWNoKGVhY2hmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbihmbnMsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBnbyA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlYWNoZm4oZm5zLCBmdW5jdGlvbiAoZm4sIF8sIGNiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MuY29uY2F0KFtjYl0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5hcHBseUVhY2ggPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZik7XG4gICAgYXN5bmMuYXBwbHlFYWNoU2VyaWVzID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2ZTZXJpZXMpO1xuXG5cbiAgICBhc3luYy5mb3JldmVyID0gZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZG9uZSA9IG9ubHlfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHRhc2sgPSBlbnN1cmVBc3luYyhmbik7XG4gICAgICAgIGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhc2sobmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBlbnN1cmVBc3luYyhmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5lbnN1cmVBc3luYyA9IGVuc3VyZUFzeW5jO1xuXG4gICAgYXN5bmMuY29uc3RhbnQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgYXJncyA9IFtudWxsXS5jb25jYXQodmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXN5bmMud3JhcFN5bmMgPVxuICAgIGFzeW5jLmFzeW5jaWZ5ID0gZnVuY3Rpb24gYXN5bmNpZnkoZnVuYykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgcmVzdWx0IGlzIFByb21pc2Ugb2JqZWN0XG4gICAgICAgICAgICBpZiAoX2lzT2JqZWN0KHJlc3VsdCkgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLm1lc3NhZ2UgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBOb2RlLmpzXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmM7XG4gICAgfVxuICAgIC8vIEFNRCAvIFJlcXVpcmVKU1xuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhc3luYztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGluY2x1ZGVkIGRpcmVjdGx5IHZpYSA8c2NyaXB0PiB0YWdcbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IGFzeW5jO1xuICAgIH1cblxufSgpKTtcbiIsIlxuLy8gbm90IGltcGxlbWVudGVkXG4vLyBUaGUgcmVhc29uIGZvciBoYXZpbmcgYW4gZW1wdHkgZmlsZSBhbmQgbm90IHRocm93aW5nIGlzIHRvIGFsbG93XG4vLyB1bnRyYWRpdGlvbmFsIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbW9kdWxlLlxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIl19
;