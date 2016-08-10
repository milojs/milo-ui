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

function MLCombo_del(value) {
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
    try { var listOwner = this.item.list.owner; } catch(e) {}
    listOwner && listOwner.removeItem(this.item.index);
}


function MLListItem$moveItem(index) {
    var listOwner = this.item.list.owner;
    listOwner && listOwner.moveItem(this.item.index, index);
}


function MLListItem$isDropAllowed(meta/*, dragDrop*/){
    var Component = milo.registry.components.get(meta.compClass);

    return meta.params && _.isNumeric(meta.params.index)
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
        setTimeout(function(){
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
//*/

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

},{"./generator":27,"./registry":28,"async":31}],27:[function(require,module,exports){
'use strict';

var doT = milo.util.doT
    , fs = require('fs')
    , componentsRegistry = milo.registry.components
    , miloCount = milo.util.count
    , componentName = milo.util.componentName
    , formRegistry = require('./registry');

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

},{"./registry":28,"fs":32}],28:[function(require,module,exports){
'use strict';

var logger = milo.util.logger
    , check = milo.util.check
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

},{"./components/Button":1,"./components/CheckGroup":2,"./components/Combo":3,"./components/ComboList":4,"./components/Date":5,"./components/DropTarget":6,"./components/FoldTree":7,"./components/Group":8,"./components/Hyperlink":9,"./components/Image":10,"./components/Input":11,"./components/InputList":12,"./components/List":13,"./components/ListItem":14,"./components/ListItemSimple":15,"./components/RadioGroup":16,"./components/Select":17,"./components/SuperCombo":18,"./components/Text":19,"./components/Textarea":20,"./components/Time":21,"./components/Wrapper":22,"./components/bootstrap/Alert":23,"./components/bootstrap/Dialog":24,"./components/bootstrap/Dropdown":25,"./forms/Form":26}],31:[function(require,module,exports){
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9CdXR0b24uanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvQ2hlY2tHcm91cC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21iby5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Db21ib0xpc3QuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvRGF0ZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9Ecm9wVGFyZ2V0LmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0ZvbGRUcmVlLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0dyb3VwLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL0h5cGVybGluay5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbWFnZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9JbnB1dExpc3QuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvTGlzdC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9MaXN0SXRlbVNpbXBsZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9SYWRpb0dyb3VwLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1NlbGVjdC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9TdXBlckNvbWJvLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL1RleHQuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGV4dGFyZWEuanMiLCIvY2Mtc3JjL21pbG8tdWkvbGliL2NvbXBvbmVudHMvVGltZS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9XcmFwcGVyLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9BbGVydC5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvY29tcG9uZW50cy9ib290c3RyYXAvRGlhbG9nLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bi5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvZm9ybXMvRm9ybS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvZm9ybXMvZ2VuZXJhdG9yLmpzIiwiL2NjLXNyYy9taWxvLXVpL2xpYi9mb3Jtcy9yZWdpc3RyeS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvbWlsb191aS5qcyIsIi9jYy1zcmMvbWlsby11aS9saWIvdXNlX2NvbXBvbmVudHMuanMiLCIvY2Mtc3JjL21pbG8tdWkvbm9kZV9tb2R1bGVzL2FzeW5jL2xpYi9hc3luYy5qcyIsIi9jYy1zcmMvbWlsby11aS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2ZzLmpzIiwiL2NjLXNyYy9taWxvLXVpL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2d0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MQnV0dG9uID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEJ1dHRvbicsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktYnV0dG9uJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQnV0dG9uKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEJ1dHRvbjtcblxuXy5leHRlbmRQcm90byhNTEJ1dHRvbiwge1xuICAgIGRpc2FibGU6IE1MQnV0dG9uJGRpc2FibGUsXG4gICAgaXNEaXNhYmxlZDogTUxCdXR0b24kaXNEaXNhYmxlZFxufSk7XG5cblxuZnVuY3Rpb24gTUxCdXR0b24kZGlzYWJsZShkaXNhYmxlKSB7XG4gICAgdGhpcy5lbC5kaXNhYmxlZCA9IGRpc2FibGU7XG59XG5cbmZ1bmN0aW9uIE1MQnV0dG9uJGlzRGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5lbC5kaXNhYmxlZDtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgdW5pcXVlSWQgPSBtaWxvLnV0aWwudW5pcXVlSWQ7XG5cblxudmFyIENIRUNLRURfQ0hBTkdFX01FU1NBR0UgPSAnbWxjaGVja2dyb3VwY2hhbmdlJ1xuICAgICwgRUxFTUVOVF9OQU1FX1BST1BFUlRZID0gJ19tbENoZWNrR3JvdXBFbGVtZW50SUQnXG4gICAgLCBFTEVNRU5UX05BTUVfUFJFRklYID0gJ21sLWNoZWNrLWdyb3VwLSc7XG5cbnZhciBNTENoZWNrR3JvdXAgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQ2hlY2tHcm91cCcsIHtcbiAgICBkYXRhOiB7XG4gICAgICAgIHNldDogTUxDaGVja0dyb3VwX3NldCxcbiAgICAgICAgZ2V0OiBNTENoZWNrR3JvdXBfZ2V0LFxuICAgICAgICBkZWw6IE1MQ2hlY2tHcm91cF9kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogQ0hFQ0tFRF9DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKionOiB7IHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ2NsaWNrJzogeyBzdWJzY3JpYmVyOiBvbkdyb3VwQ2xpY2ssIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktY2hlY2stZ3JvdXAnXG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogICd7e34gaXQuY2hlY2tPcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7IyNkZWYuZWxJRDp7ez0gaXQuZWxlbWVudE5hbWUgfX0te3s9IG9wdGlvbi52YWx1ZSB9fSN9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ7ez0gaXQuX3JlbmRlck9wdGlvbnMub3B0aW9uQ3NzQ2xhc3MgfHwgXCInICsgRUxFTUVOVF9OQU1FX1BSRUZJWCArICdvcHRpb25cIiB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cInt7IyBkZWYuZWxJRCB9fVwiIHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwie3s9IG9wdGlvbi52YWx1ZSB9fVwiIG5hbWU9XCJ7ez0gaXQuZWxlbWVudE5hbWUgfX1cIj4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwie3sjIGRlZi5lbElEIH19XCI+e3s9IG9wdGlvbi5sYWJlbCB9fTwvbGFiZWw+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXG4gICAgICAgICAgICAgICAgICAgIHt7fn19IFxcXG4gICAgICAgICAgICAgICAgICAgIHt7P2l0Ll9yZW5kZXJPcHRpb25zLnNlbGVjdEFsbH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICB7eyMjZGVmLmFsbElEOnt7PSBpdC5lbGVtZW50TmFtZSB9fS1hbGwjfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiJyArIEVMRU1FTlRfTkFNRV9QUkVGSVggKyAnYWxsXCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwie3sjIGRlZi5hbGxJRCB9fVwiIHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwiYWxsXCIgbmFtZT1cImFsbFwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ7eyMgZGVmLmFsbElEIH19XCI+QWxsPC9sYWJlbD4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcbiAgICAgICAgICAgICAgICAgICAge3s/fX0nXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxDaGVja0dyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTENoZWNrR3JvdXA7XG5cblxuXy5leHRlbmRQcm90byhNTENoZWNrR3JvdXAsIHtcbiAgICBpbml0OiBNTENoZWNrR3JvdXAkaW5pdCxcbiAgICBkZXN0cm95OiBNTENoZWNrR3JvdXAkZGVzdHJveSxcbiAgICBzZXRTZWxlY3RBbGw6IE1MQ2hlY2tHcm91cCRzZXRTZWxlY3RBbGxcbn0pO1xuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGl6ZSByYWRpbyBncm91cCBhbmQgc2V0dXBcbiAqL1xuZnVuY3Rpb24gTUxDaGVja0dyb3VwJGluaXQoKSB7XG4gICAgXy5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBFTEVNRU5UX05BTUVfUFJPUEVSVFksIEVMRU1FTlRfTkFNRV9QUkVGSVggKyB1bmlxdWVJZCgpKTtcbiAgICB0aGlzLl9yZW5kZXJPcHRpb25zID0ge307XG4gICAgdGhpcy5fY2hlY2tFbHMgPSB7fTtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG5mdW5jdGlvbiBNTENoZWNrR3JvdXAkc2V0U2VsZWN0QWxsKHNlbGVjdEFsbCkge1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMuc2VsZWN0QWxsID0gc2VsZWN0QWxsO1xufVxuXG5cbi8qKlxuICogU2V0cyBncm91cCB2YWx1ZVxuICogUmVwbGFjZXMgdGhlIGRhdGEgc2V0IG9wZXJhdGlvbiB0byBkZWFsIHdpdGggcmFkaW8gYnV0dG9uc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBzZXRcbiAqL1xuZnVuY3Rpb24gTUxDaGVja0dyb3VwX3NldCh2YWx1ZU9iaikge1xuICAgIF8uZWFjaEtleSh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsLCBrZXkpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9ICEhdmFsdWVPYmpba2V5XTtcbiAgICB9KTtcbn1cblxuXG4vKipcbiAqIEdldHMgZ3JvdXAgdmFsdWVcbiAqIFJldHJpZXZlcyB0aGUgc2VsZWN0ZWQgdmFsdWUgb2YgdGhlIGdyb3VwXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBNTENoZWNrR3JvdXBfZ2V0KCkge1xuICAgIHJldHVybiBfLm1hcEtleXModGhpcy5fY2hlY2tFbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gZWwuY2hlY2tlZDtcbiAgICB9KTtcbn1cblxuXG4vKipcbiAqIERlbGV0ZWQgZ3JvdXAgdmFsdWVcbiAqIERlbGV0ZXMgdGhlIHZhbHVlIG9mIHRoZSBncm91cCwgc2V0dGluZyBpdCB0byBlbXB0eVxuICovXG5mdW5jdGlvbiBNTENoZWNrR3JvdXBfZGVsKCkge1xuICAgIF8uZWFjaEtleSh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBlbC5jaGVja2VkID0gZmFsc2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuXG4vKipcbiAqIE1hbmFnZSByYWRpbyBjaGlsZHJlbiBjbGlja3NcbiAqL1xuZnVuY3Rpb24gb25Hcm91cENsaWNrKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgY2xpY2tlZEVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAoY2xpY2tlZEVsZW1lbnQudHlwZSAhPT0gJ2NoZWNrYm94JykgcmV0dXJuO1xuXG4gICAgaWYgKGNsaWNrZWRFbGVtZW50Lm5hbWUgPT09ICdhbGwnKSB7XG4gICAgICAgIF8uZWFjaEtleSh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsLCBrZXkpIHtcbiAgICAgICAgICAgIGVsLmNoZWNrZWQgPSBjbGlja2VkRWxlbWVudC5jaGVja2VkO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaXNDaGVja2VkID0gY2xpY2tlZEVsZW1lbnQuY2hlY2tlZCAmJiBpc0FsbEVsZW1lbnRDaGVja2VkLmNhbGwodGhpcyk7XG4gICAgICAgIHNldEFsbENoZWNrZWQuY2FsbCh0aGlzLCBpc0NoZWNrZWQpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBzZXRBbGxDaGVja2VkKGNoZWNrZWQpIHtcbiAgICBpZiAodGhpcy5fcmVuZGVyT3B0aW9ucy5zZWxlY3RBbGwpXG4gICAgICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImFsbFwiXScpLmNoZWNrZWQgPSBjaGVja2VkO1xufVxuXG5mdW5jdGlvbiBpc0FsbEVsZW1lbnRDaGVja2VkKGRhdGEpIHtcbiAgICByZXR1cm4gXy5ldmVyeUtleSh0aGlzLl9jaGVja0VscywgZnVuY3Rpb24gKGVsKSB7IHJldHVybiBlbC5jaGVja2VkOyB9KTtcbn1cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENIRUNLRURfQ0hBTkdFX01FU1NBR0UpO1xufVxuXG5cbi8vIFNldCByYWRpbyBidXR0b24gY2hpbGRyZW4gb24gbW9kZWwgY2hhbmdlXG5mdW5jdGlvbiBvbk9wdGlvbnNDaGFuZ2UocGF0aCwgZGF0YSkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKHtcbiAgICAgICAgY2hlY2tPcHRpb25zOiB0aGlzLm1vZGVsLmdldCgpLFxuICAgICAgICBlbGVtZW50TmFtZTogdGhpc1tFTEVNRU5UX05BTUVfUFJPUEVSVFldLFxuICAgICAgICBfcmVuZGVyT3B0aW9uczogdGhpcy5fcmVuZGVyT3B0aW9uc1xuICAgIH0pO1xuXG4gICAgdGhpcy5fY2hlY2tFbHMgPSB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXy5mb3JFYWNoKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyksIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBpZiAoZWwubmFtZSAhPSAnYWxsJykgc2VsZi5fY2hlY2tFbHNbZWwudmFsdWVdID0gZWw7XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gTUxDaGVja0dyb3VwJGRlc3Ryb3koKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NoZWNrRWxzO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgQ09NQk9fQ0hBTkdFX01FU1NBR0UgPSAnbWxjb21ib2NoYW5nZSc7XG5cbnZhciBEQVRBTElTVF9URU1QTEFURSA9ICd7e34gaXQuY29tYm9PcHRpb25zIDpvcHRpb24gfX0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwie3s9IG9wdGlvbi5sYWJlbCB9fVwiPjwvb3B0aW9uPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19JztcblxudmFyIE1MQ29tYm8gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MQ29tYm8nLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MQ29tYm9fZ2V0LFxuICAgICAgICBzZXQ6IE1MQ29tYm9fc2V0LFxuICAgICAgICBkZWw6IE1MQ29tYm9fZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJyoqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWRhdGFsaXN0J1xuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQ29tYm8pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQ29tYm87XG5cblxuXy5leHRlbmRQcm90byhNTENvbWJvLCB7XG4gICAgaW5pdDogTUxDb21ibyRpbml0XG59KTtcblxuXG5mdW5jdGlvbiBNTENvbWJvJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vbignY2hpbGRyZW5ib3VuZCcsIG9uQ2hpbGRyZW5Cb3VuZCk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAnX2NvbWJvSW5wdXQnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5pbnB1dCxcbiAgICAgICAgJ19jb21ib0xpc3QnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5kYXRhbGlzdFxuICAgIH0pO1xuXG4gICAgdGhpcy5fY29tYm9MaXN0LnRlbXBsYXRlLnNldChEQVRBTElTVF9URU1QTEFURSk7XG5cbiAgICB0aGlzLl9jb21ib0lucHV0LmRhdGEub24oJ2lucHV0JyxcbiAgICAgICAgeyBzdWJzY3JpYmVyOiBkaXNwYXRjaENoYW5nZU1lc3NhZ2UsIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9fZ2V0KCkge1xuICAgIGlmICghIHRoaXMuX2NvbWJvSW5wdXQpIHJldHVybjtcbiAgICByZXR1cm4gdGhpcy5fY29tYm9JbnB1dC5kYXRhLmdldCgpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvX3NldCh2YWx1ZSkge1xuICAgIHJldHVybiBjaGFuZ2VDb21ib0RhdGEuY2FsbCh0aGlzLCAnc2V0JywgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBNTENvbWJvX2RlbCh2YWx1ZSkge1xuICAgIHJldHVybiBjaGFuZ2VDb21ib0RhdGEuY2FsbCh0aGlzLCAnZGVsJywgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VDb21ib0RhdGEobWV0aG9kLCB2YWx1ZSkge1xuICAgIGlmICghIHRoaXMuX2NvbWJvSW5wdXQpIHJldHVybjtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY29tYm9JbnB1dC5kYXRhW21ldGhvZF0odmFsdWUpO1xuICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKENPTUJPX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKG1zZywgZGF0YSkge1xuICAgIHRoaXMuX2NvbWJvTGlzdC50ZW1wbGF0ZS5yZW5kZXIoe1xuICAgICAgICBjb21ib09wdGlvbnM6IHRoaXMubW9kZWwuZ2V0KClcbiAgICB9KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGNoZWNrID0gbWlsby51dGlsLmNoZWNrXG4gICAgLCBNYXRjaCA9IGNoZWNrLk1hdGNoO1xuXG52YXIgQ09NQk9fTElTVF9DSEFOR0VfTUVTU0FHRSA9ICdtbGNvbWJvbGlzdGNoYW5nZSc7XG5cblxudmFyIE1MQ29tYm9MaXN0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTENvbWJvTGlzdCcsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktY29tYm8tbGlzdCdcbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTENvbWJvTGlzdF9nZXQsXG4gICAgICAgIHNldDogTUxDb21ib0xpc3Rfc2V0LFxuICAgICAgICBkZWw6IE1MQ29tYm9MaXN0X2RlbCxcbiAgICAgICAgZXZlbnQ6IENPTUJPX0xJU1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgbWwtYmluZD1cIk1MU3VwZXJDb21ibzpjb21ib1wiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0Omxpc3RcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJNTExpc3RJdGVtOml0ZW1cIiBjbGFzcz1cImxpc3QtaXRlbVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiW2RhdGFdOmxhYmVsXCI+PC9zcGFuPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiW2V2ZW50c106ZGVsZXRlQnRuXCIgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgIDwvZGl2PidcbiAgICB9XG59KTtcblxuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQ29tYm9MaXN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTENvbWJvTGlzdDtcblxuXG5fLmV4dGVuZFByb3RvKE1MQ29tYm9MaXN0LCB7XG4gICAgaW5pdDogTUxDb21ib0xpc3QkaW5pdCxcbiAgICBzZXRPcHRpb25zOiBNTENvbWJvTGlzdCRzZXRPcHRpb25zLFxuICAgIHNldERhdGFWYWxpZGF0aW9uOiBNTENvbWJvTGlzdCRzZXREYXRhVmFsaWRhdGlvbixcbiAgICB0b2dnbGVBZGRCdXR0b246IE1MQ29tYm9MaXN0JHRvZ2dsZUFkZEJ1dHRvbixcbiAgICBkZXN0cm95OiBNTENvbWJvTGlzdCRkZXN0cm95LFxuICAgIHNldEFkZEl0ZW1Qcm9tcHQ6IE1MQ29tYm9MaXN0JHNldEFkZEl0ZW1Qcm9tcHQsXG4gICAgY2xlYXJDb21ib0lucHV0IDogTUxDb21ib0xpc3QkY2xlYXJDb21ib0lucHV0XG59KTtcblxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRpbml0KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMubW9kZWwuc2V0KFtdKTtcbiAgICB0aGlzLm9uY2UoJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xufVxuXG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0JHNldERhdGFWYWxpZGF0aW9uKGRhdGFWYWxpZGF0aW9uKSB7XG4gICAgY2hlY2soZGF0YVZhbGlkYXRpb24sIE1hdGNoLk9wdGlvbmFsKEZ1bmN0aW9uKSk7XG4gICAgdGhpcy5fZGF0YVZhbGlkYXRpb24gPSBkYXRhVmFsaWRhdGlvbjtcbn1cblxuZnVuY3Rpb24gTUxDb21ib0xpc3Qkc2V0T3B0aW9ucyhhcnIpIHtcbiAgICB0aGlzLl9jb21iby5zZXRPcHRpb25zKGFycik7XG59XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3QkY2xlYXJDb21ib0lucHV0ICgpIHtcbiAgICB0aGlzLl9jb21iby5jbGVhckNvbWJvSW5wdXQoKTtcbn1cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBIaWRlcyBhZGQgYnV0dG9uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNob3dcbiAqL1xuZnVuY3Rpb24gTUxDb21ib0xpc3QkdG9nZ2xlQWRkQnV0dG9uKHNob3cpIHtcbiAgICB0aGlzLl9jb21iby50b2dnbGVBZGRCdXR0b24oc2hvdyk7XG59XG5cblxuZnVuY3Rpb24gTUxDb21ib0xpc3Qkc2V0QWRkSXRlbVByb21wdChwcm9tcHQpIHtcbiAgIHRoaXMuX2NvbWJvLnNldEFkZEl0ZW1Qcm9tcHQocHJvbXB0KTtcbn1cblxuXG5mdW5jdGlvbiBNTENvbWJvTGlzdCRkZXN0cm95KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciAmJiBtaWxvLm1pbmRlci5kZXN0cm95Q29ubmVjdG9yKHRoaXMuX2Nvbm5lY3Rvcik7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbn1cblxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoKS5iaW5kZXIoKTtcbiAgICBjb21wb25lbnRTZXR1cC5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnRTZXR1cCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAnX2NvbWJvJzogdGhpcy5jb250YWluZXIuc2NvcGUuY29tYm8sXG4gICAgICAgICdfbGlzdCc6IHRoaXMuY29udGFpbmVyLnNjb3BlLmxpc3RcbiAgICB9KTtcblxuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG1pbG8ubWluZGVyKHRoaXMuX2xpc3QubW9kZWwsICc8PDwtPj4+JywgdGhpcy5tb2RlbCk7XG4gICAgdGhpcy5fY29tYm8uZGF0YS5vbignJywgeyBzdWJzY3JpYmVyOiBvbkNvbWJvQ2hhbmdlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIHRoaXMuX2NvbWJvLm9uKCdhZGRpdGVtJywgeyBzdWJzY3JpYmVyOiBvbkFkZEl0ZW0sIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cbmZ1bmN0aW9uIG9uQ29tYm9DaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgaWYgKGRhdGEubmV3VmFsdWUgJiYgcnVuRGF0YVZhbGlkYXRpb24uY2FsbCh0aGlzLCBtc2csIGRhdGEpKVxuICAgICAgICB0aGlzLl9saXN0Lm1vZGVsLnB1c2goZGF0YS5uZXdWYWx1ZSk7XG4gICAgdGhpcy5fY29tYm8uZGF0YS5kZWwoKTtcbiAgICAvLyBiZWNhdXNlIG9mIHN1cGVyY29tYm8gbGlzdGVuZXJzIG9mZiB5b3UgaGF2ZSB0byBzZXQgX3ZhbHVlIGV4cGxpY2l0bHlcbiAgICB0aGlzLl9jb21iby5kYXRhLl92YWx1ZSA9ICcnO1xufVxuXG5mdW5jdGlvbiBydW5EYXRhVmFsaWRhdGlvbihtc2csIGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVZhbGlkYXRpb24gXG4gICAgICAgID8gdGhpcy5fZGF0YVZhbGlkYXRpb24obXNnLCBkYXRhLCB0aGlzLl9saXN0Lm1vZGVsLmdldCgpKVxuICAgICAgICA6IHRydWU7XG59XG5cbmZ1bmN0aW9uIG9uSXRlbXNDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19MSVNUX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib0xpc3RfZ2V0KCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0KCk7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyA/IF8uY2xvbmUodmFsdWUpIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIE1MQ29tYm9MaXN0X3NldCh2YWx1ZSkge1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gTUxDb21ib0xpc3RfZGVsKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGVsLnNldChbXSk7XG59XG5cblxuZnVuY3Rpb24gb25BZGRJdGVtKG1zZywgZGF0YSkge1xuICAgIHRoaXMucG9zdE1lc3NhZ2UoJ2FkZGl0ZW0nLCBkYXRhKTtcbiAgICB0aGlzLmV2ZW50cy5wb3N0TWVzc2FnZSgnbWlsb19jb21ib2xpc3RhZGRpdGVtJywgZGF0YSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG52YXIgTUxEYXRlID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTERhdGUnLCB7XG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MRGF0ZV9nZXQsXG4gICAgICAgIHNldDogTUxEYXRlX3NldCxcbiAgICAgICAgZGVsOiBNTERhdGVfZGVsLFxuICAgIH0sXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWRhdGUnXG4gICAgfVxufSk7XG5cbl8uZXh0ZW5kUHJvdG8oTUxEYXRlLCB7XG4gICAgZ2V0TWluOiBNTERhdGUkZ2V0TWluLFxuICAgIHNldE1pbjogTUxEYXRlJHNldE1pbixcbiAgICBnZXRNYXg6IE1MRGF0ZSRnZXRNYXgsXG4gICAgc2V0TWF4OiBNTERhdGUkc2V0TWF4XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTERhdGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRGF0ZTtcblxuXG5mdW5jdGlvbiBNTERhdGUkZ2V0TWluKCkge1xuICAgIHJldHVybiBfLmRhdGUodGhpcy5lbC5taW4pO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZSRzZXRNaW4odmFsdWUpIHtcbiAgICB2YXIgZGF0ZSA9IF8udG9EYXRlKHZhbHVlKTtcblxuICAgIHRoaXMuZWwubWluID0gZGF0ZSA/IHRvSVNPODYwMUZvcm1hdChkYXRlKSA6ICcnO1xufVxuXG5cbmZ1bmN0aW9uIE1MRGF0ZSRnZXRNYXgoKSB7XG4gICAgcmV0dXJuIF8uZGF0ZSh0aGlzLmVsLm1heCk7XG59XG5cblxuZnVuY3Rpb24gTUxEYXRlJHNldE1heCh2YWx1ZSkge1xuICAgIHZhciBkYXRlID0gXy50b0RhdGUodmFsdWUpO1xuXG4gICAgdGhpcy5lbC5tYXggPSBkYXRlID8gdG9JU084NjAxRm9ybWF0KGRhdGUpIDogJyc7XG59XG5cblxuZnVuY3Rpb24gTUxEYXRlX2dldCgpIHtcbiAgICByZXR1cm4gXy50b0RhdGUodGhpcy5lbC52YWx1ZSk7XG59XG5cblxuZnVuY3Rpb24gTUxEYXRlX3NldCh2YWx1ZSkge1xuICAgIHZhciBkYXRlID0gXy50b0RhdGUodmFsdWUpO1xuXG4gICAgdGhpcy5lbC52YWx1ZSA9IGRhdGUgPyB0b0lTTzg2MDFGb3JtYXQoZGF0ZSkgOiAnJztcblxuICAgIGRpc3BhdGNoSW5wdXRNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cbmZ1bmN0aW9uIE1MRGF0ZV9kZWwoKSB7XG4gICAgdGhpcy5lbC52YWx1ZSA9ICcnO1xuXG4gICAgZGlzcGF0Y2hJbnB1dE1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBkaXNwYXRjaElucHV0TWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKCdpbnB1dCcpOyAvLyBEaXNwYXRjaCB0aGUgJ2lucHV0JyAodXN1YWxseSBkaXNwYXRjaGVkIGJ5IHRoZSB1bmRlcmx5aW5nIDxpbnB1dD4gZWxlbWVudCkgZXZlbnQgc28gdGhhdCB0aGUgZGF0YSBjaGFuZ2UgY2FuIGJlIGxpc3RlbmVkIHRvXG59XG5cblxuZnVuY3Rpb24gdG9JU084NjAxRm9ybWF0KGRhdGUpIHtcbiAgICB2YXIgZGF0ZUFyciA9IFtcbiAgICAgICAgZGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSksXG4gICAgICAgIHBhZChkYXRlLmdldERhdGUoKSlcbiAgICBdO1xuXG4gICAgdmFyIGRhdGVTdHIgPSBkYXRlQXJyLmpvaW4oJy0nKTtcblxuICAgIHJldHVybiBkYXRlU3RyO1xuXG4gICAgZnVuY3Rpb24gcGFkKG4pIHsgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4gOiBuOyB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTERyb3BUYXJnZXQgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRHJvcFRhcmdldCcsIFsnZHJvcCddKTtcblxuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MRHJvcFRhcmdldCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxEcm9wVGFyZ2V0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9UID0gbWlsby51dGlsLmRvVFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgdW5pcXVlSWQgPSBtaWxvLnV0aWwudW5pcXVlSWQ7XG5cbnZhciBUUkVFX1RFTVBMQVRFID0gJzx1bCBjbGFzcz1cIm1sLXVpLWZvbGR0cmVlLWxpc3RcIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAge3t+IGl0LmRhdGEuaXRlbXMgOml0ZW06aW5kZXggfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IHZhciBoYXNTdWJUcmVlID0gaXRlbS5pdGVtcyAmJiBpdGVtLml0ZW1zLmxlbmd0aDsgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSB7ez8gaGFzU3ViVHJlZSB9fWNsYXNzPVwibWwtdWktZm9sZHRyZWUtLWhhcy1tdWx0aXBsZVwie3s/fX0+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1sLXVpLWZvbGR0cmVlLWl0ZW1cIiBkYXRhLWl0ZW0taWQ9XCJ7ez0gaXQuaXRlbUlEc1tpbmRleF0gfX1cIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/IGhhc1N1YlRyZWUgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtbC11aS1mb2xkdHJlZS1idXR0b25cIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s9IGl0Lml0ZW1UZW1wbGF0ZSh7IGl0ZW06IGl0ZW0gfSkgfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez8gaGFzU3ViVHJlZSB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez0gaXQudHJlZVRlbXBsYXRlKGl0ZW0pIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3s/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19XFxcbiAgICAgICAgICAgICAgICAgICAgPC91bD4nO1xuXG52YXIgREVGQVVMVF9DT01QSUxFRF9JVEVNX1RFTVBMQVRFID0gZG9ULmNvbXBpbGUoJ1xcXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1sLXVpLWZvbGR0cmVlLWxhYmVsXCI+XFxcbiAgICAgICAgICAgICAgICB7ez0gaXQuaXRlbS5sYWJlbCB9fVxcXG4gICAgICAgICAgICA8L3NwYW4+JylcbiAgICAsIENPTVBJTEVEX1RSRUVfVEVNUExBVEUgPSBkb1QuY29tcGlsZShUUkVFX1RFTVBMQVRFKTtcblxuXG52YXIgTUxGb2xkVHJlZSA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxGb2xkVHJlZScsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdjbGljayBkYmxjbGljayc6IHsgc3Vic2NyaWJlcjogb25JdGVtRXZlbnQsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktZm9sZHRyZWUtbWFpbidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEZvbGRUcmVlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEZvbGRUcmVlO1xuXG5fLmV4dGVuZFByb3RvKE1MRm9sZFRyZWUsIHtcbiAgICBzZXRJdGVtVGVtcGxhdGU6IE1MRm9sZFRyZWUkc2V0SXRlbVRlbXBsYXRlLFxuICAgIHJlbmRlclRyZWU6IE1MRm9sZFRyZWUkcmVuZGVyVHJlZSxcbiAgICBzZXRBY3RpdmVJdGVtOiBNTEZvbGRUcmVlJHNldEFjdGl2ZUl0ZW0sXG4gICAgdG9nZ2xlSXRlbTogTUxGb2xkVHJlZSR0b2dnbGVJdGVtXG59KTtcblxuZnVuY3Rpb24gZm9sZFVuZm9sZChlbCwgb3BlbmVkKSB7XG4gICAgaWYgKG9wZW5lZClcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnbWwtdWktZm9sZHRyZWUtLXVuZm9sZCcsIG9wZW5lZCk7XG4gICAgZWxzZVxuICAgICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKCdtbC11aS1mb2xkdHJlZS0tdW5mb2xkJyk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1NZXNzYWdlKG1zZywgZWwpIHtcbiAgICB2YXIgaWQgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaXRlbS1pZCcpXG4gICAgICAgICwgaXRlbSA9IHRoaXMuX2l0ZW1zTWFwW2lkXTtcblxuICAgIHRoaXMucG9zdE1lc3NhZ2UoJ21sZm9sZHRyZWVfJyArIG1zZywge1xuICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICBlbDogZWxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gb25JdGVtRXZlbnQobXNnLCBlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucygnbWwtdWktZm9sZHRyZWUtYnV0dG9uJykpXG4gICAgICAgIGZvbGRVbmZvbGQoZWwucGFyZW50Tm9kZS5wYXJlbnROb2RlKTtcbiAgICBlbHNlIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ21sLXVpLWZvbGR0cmVlLWxhYmVsJykpXG4gICAgICAgIGl0ZW1NZXNzYWdlLmNhbGwodGhpcywgbXNnLCBlbC5wYXJlbnROb2RlKTtcbiAgICBlbHNlIHJldHVybjtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xufVxuXG5mdW5jdGlvbiBNTEZvbGRUcmVlJHNldEl0ZW1UZW1wbGF0ZSAodGVtcGxhdGVTdHIpIHtcbiAgICB0aGlzLl9pdGVtVGVtcGxhdGUgPSBkb1QuY29tcGlsZSh0ZW1wbGF0ZVN0cik7XG59XG5cbmZ1bmN0aW9uIE1MRm9sZFRyZWUkcmVuZGVyVHJlZSAoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgICBzZWxmLl9pdGVtc01hcCA9IHt9O1xuICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gX3JlbmRlclRyZWUoZGF0YSk7XG5cbiAgICBmdW5jdGlvbiBfcmVuZGVyVHJlZSAoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5pdGVtcylcbiAgICAgICAgICAgIHZhciBpdGVtc0lEcyA9IF8ubWFwKGRhdGEuaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBpdGVtLmlkIHx8IHVuaXF1ZUlkKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2l0ZW1zTWFwW2lkXSkgdGhyb3cgbmV3IEVycm9yKCdNTEZvbGRUcmVlOiBpdGVtIGhhcyBkdXBsaWNhdGUgSUQ6JyArIGlkKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pdGVtc01hcFtpZF0gPSBpdGVtO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBDT01QSUxFRF9UUkVFX1RFTVBMQVRFKHtcbiAgICAgICAgICAgIGl0ZW1JRHM6IGl0ZW1zSURzLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIGl0ZW1UZW1wbGF0ZTogc2VsZi5faXRlbVRlbXBsYXRlIHx8IERFRkFVTFRfQ09NUElMRURfSVRFTV9URU1QTEFURSxcbiAgICAgICAgICAgIHRyZWVUZW1wbGF0ZTogX3JlbmRlclRyZWVcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIE1MRm9sZFRyZWUkc2V0QWN0aXZlSXRlbShpZCwgY3NzQ2xhc3MpIHtcbiAgICBjc3NDbGFzcyA9IGNzc0NsYXNzIHx8ICdtbC11aS1mb2xkdHJlZS1hY3RpdmUnO1xuICAgIHZhciBpdGVtcyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnZGl2Lm1sLXVpLWZvbGR0cmVlLWl0ZW0nKTtcbiAgICBfLmZvckVhY2goaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKGNzc0NsYXNzKTtcbiAgICB9KTtcbiAgICBpZiAoaWQpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5tbC11aS1mb2xkdHJlZS1pdGVtW2RhdGEtaXRlbS1pZD1cIicgKyBpZCArICdcIl0nKTtcbiAgICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKGNzc0NsYXNzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIE1MRm9sZFRyZWUkdG9nZ2xlSXRlbShpZCwgb3BlbmVkKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5tbC11aS1mb2xkdHJlZS1pdGVtW2RhdGEtaXRlbS1pZD1cIicgKyBpZCArICdcIl0nKTtcbiAgICBmb2xkVW5mb2xkKGl0ZW0ucGFyZW50Tm9kZSwgb3BlbmVkKTtcbn1cblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTEdyb3VwID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEdyb3VwJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktZ3JvdXAnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxHcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxHcm91cDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MSHlwZXJsaW5rID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTEh5cGVybGluaycsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLWh5cGVybGluaydcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTEh5cGVybGluayk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxIeXBlcmxpbms7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBJTUFHRV9DSEFOR0VfTUVTU0FHRSA9ICdtbGltYWdlY2hhbmdlJztcblxudmFyIE1MSW1hZ2UgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MSW1hZ2UnLCB7XG4gICAgZGF0YToge1xuICAgICAgICBzZXQ6IE1MSW1hZ2Vfc2V0LFxuICAgICAgICBnZXQ6IE1MSW1hZ2VfZ2V0LFxuICAgICAgICBkZWw6IE1MSW1hZ2VfZGVsLFxuICAgICAgICBzcGxpY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnQ6IElNQUdFX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJy5zcmMnOiB7IHN1YnNjcmliZXI6IG9uTW9kZWxDaGFuZ2UsIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgdGFnTmFtZTogJ2ltZycsXG4gICAgICAgIGNsczogJ21sLXVpLWltYWdlJ1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MSW1hZ2UpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MSW1hZ2U7XG5cblxuXy5leHRlbmRQcm90byhNTEltYWdlLCB7XG4gICAgaW5pdDogTUxJbWFnZSRpbml0XG59KTtcblxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEluaXRpYWxpemUgcmFkaW8gZ3JvdXAgYW5kIHNldHVwXG4gKi9cbmZ1bmN0aW9uIE1MSW1hZ2UkaW5pdCgpIHtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG4vKipcbiAqIFNldHMgaW1hZ2UgdmFsdWVcbiAqIFJlcGxhY2VzIHRoZSBkYXRhIHNldCBvcGVyYXRpb24gdG8gZGVhbCB3aXRoIHJhZGlvIGJ1dHRvbnNcbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgc2V0XG4gKi9cbmZ1bmN0aW9uIE1MSW1hZ2Vfc2V0KHZhbHVlKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQodmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuXG4vKipcbiAqIEdldHMgZ3JvdXAgdmFsdWVcbiAqIFJldHJpZXZlcyB0aGUgc2VsZWN0ZWQgdmFsdWUgb2YgdGhlIGdyb3VwXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBNTEltYWdlX2dldCgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgPyBfLmNsb25lKHZhbHVlKSA6IHZhbHVlO1xufVxuXG5cbi8qKlxuICogRGVsZXRlZCBncm91cCB2YWx1ZVxuICogRGVsZXRlcyB0aGUgdmFsdWUgb2YgdGhlIGdyb3VwLCBzZXR0aW5nIGl0IHRvIGVtcHR5XG4gKi9cbmZ1bmN0aW9uIE1MSW1hZ2VfZGVsKCkge1xuICAgIHRoaXMubW9kZWwuZGVsKCk7XG59XG5cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKElNQUdFX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuXG5mdW5jdGlvbiBvbk1vZGVsQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLmVsLnNyYyA9IGRhdGEubmV3VmFsdWU7XG4gICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTElucHV0ID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTElucHV0Jywge1xuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktaW5wdXQnXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxJbnB1dCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxJbnB1dDtcblxuXy5leHRlbmRQcm90byhNTElucHV0LCB7XG4gICAgZGlzYWJsZTogTUxJbnB1dCRkaXNhYmxlLFxuICAgIGlzRGlzYWJsZWQ6IE1MSW5wdXQkaXNEaXNhYmxlZCxcbiAgICBzZXRNYXhMZW5ndGg6IE1MSW5wdXQkc2V0TWF4TGVuZ3RoXG59KTtcblxuZnVuY3Rpb24gTUxJbnB1dCRkaXNhYmxlKGRpc2FibGUpIHtcbiAgICB0aGlzLmVsLmRpc2FibGVkID0gZGlzYWJsZTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dCRpc0Rpc2FibGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMuZWwuZGlzYWJsZWQ7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXQkc2V0TWF4TGVuZ3RoKGxlbmd0aCkge1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdtYXhsZW5ndGgnLCBsZW5ndGgpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIElOUFVUX0xJU1RfQ0hBTkdFX01FU1NBR0UgPSAnbWxpbnB1dGxpc3RjaGFuZ2UnO1xuXG52YXIgYXN5bmNIYW5kbGVyID0gZnVuY3Rpb24gKHZhbHVlLCBjYWxsYmFjaykge2NhbGxiYWNrKHZhbHVlKTt9O1xuXG52YXIgTUxJbnB1dExpc3QgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MSW5wdXRMaXN0Jywge1xuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1pbnB1dC1saXN0J1xuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgICBnZXQ6IE1MSW5wdXRMaXN0X2dldCxcbiAgICAgICAgc2V0OiBNTElucHV0TGlzdF9zZXQsXG4gICAgICAgIGRlbDogTUxJbnB1dExpc3RfZGVsLFxuICAgICAgICBzcGxpY2U6IE1MSW5wdXRMaXN0X3NwbGljZSxcbiAgICAgICAgZXZlbnQ6IElOUFVUX0xJU1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIG1vZGVsOiB7XG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICAnKioqJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICdcXFxuICAgICAgICAgICAgPGRpdiBtbC1iaW5kPVwiTUxMaXN0Omxpc3RcIj5cXFxuICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIk1MTGlzdEl0ZW06aXRlbVwiIGNsYXNzPVwibGlzdC1pdGVtXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gbWwtYmluZD1cIltkYXRhXTpsYWJlbFwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBtbC1iaW5kPVwiW2V2ZW50c106ZGVsZXRlQnRuXCIgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj5cXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbWwtYmluZD1cIk1MSW5wdXQ6aW5wdXRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxcXG4gICAgICAgICAgICA8YnV0dG9uIG1sLWJpbmQ9XCJNTEJ1dHRvbjpidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiPlxcXG4gICAgICAgICAgICAgICAgQWRkXFxcbiAgICAgICAgICAgIDwvYnV0dG9uPidcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTElucHV0TGlzdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxJbnB1dExpc3Q7XG5cbl8uZXh0ZW5kUHJvdG8oTUxJbnB1dExpc3QsIHtcbiAgICBpbml0OiBNTElucHV0TGlzdCRpbml0LFxuICAgIHNldEFzeW5jOiBNTElucHV0TGlzdCRzZXRBc3luYyxcbiAgICBzZXRQbGFjZUhvbGRlcjogTUxJbnB1dExpc3Qkc2V0UGxhY2VIb2xkZXIsXG4gICAgZGVzdHJveTogTUxJbnB1dExpc3QkZGVzdHJveVxufSk7XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vbmNlKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbiAgICB0aGlzLm1vZGVsLnNldChbXSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hpbGRyZW5Cb3VuZCgpIHtcbiAgICByZW5kZXIuY2FsbCh0aGlzKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3Qkc2V0UGxhY2VIb2xkZXIocGxhY2VIb2xkZXIpIHtcbiAgICB0aGlzLl9pbnB1dC5lbC5zZXRBdHRyaWJ1dGUoJ3BsYWNlSG9sZGVyJywgcGxhY2VIb2xkZXIpO1xufVxuXG5mdW5jdGlvbiBNTElucHV0TGlzdCRzZXRBc3luYyhuZXdIYW5kbGVyKSB7XG4gICAgYXN5bmNIYW5kbGVyID0gbmV3SGFuZGxlciB8fCBhc3luY0hhbmRsZXI7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0JGRlc3Ryb3koKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fY29ubmVjdG9yICYmIG1pbG8ubWluZGVyLmRlc3Ryb3lDb25uZWN0b3IodGhpcy5fY29ubmVjdG9yKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoKS5iaW5kZXIoKTtcbiAgICBjb21wb25lbnRTZXR1cC5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnRTZXR1cCgpIHtcbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAnX2lucHV0JzogdGhpcy5jb250YWluZXIuc2NvcGUuaW5wdXQsXG4gICAgICAgICdfYnV0dG9uJzogdGhpcy5jb250YWluZXIuc2NvcGUuYnV0dG9uLFxuICAgICAgICAnX2xpc3QnOiB0aGlzLmNvbnRhaW5lci5zY29wZS5saXN0XG4gICAgfSk7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbWlsby5taW5kZXIodGhpcy5fbGlzdC5tb2RlbCwgJzw8PC0+Pj4nLCB0aGlzLm1vZGVsKTtcbiAgICB0aGlzLl9idXR0b24uZXZlbnRzLm9uKCdjbGljaycsIHtzdWJzY3JpYmVyOiBvbkNsaWNrLCBjb250ZXh0OiB0aGlzIH0pOyAgIFxufVxuXG5mdW5jdGlvbiBvbkNsaWNrKG1zZykge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuX2lucHV0LmRhdGEuZ2V0KDApO1xuICAgIGlmICh0aGlzLl9pbnB1dC5kYXRhKVxuICAgICAgICBhc3luY0hhbmRsZXIodmFsdWUsIGZ1bmN0aW9uIChsYWJlbCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3QubW9kZWwucHVzaCh7IGxhYmVsOiBsYWJlbCwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2lucHV0LmRhdGEuZGVsKCk7XG59XG5cbmZ1bmN0aW9uIG9uSXRlbXNDaGFuZ2UobXNnLCBkYXRhKSB7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShJTlBVVF9MSVNUX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3RfZ2V0KCkge1xuICAgIHZhciBtb2RlbCA9IHRoaXMubW9kZWwuZ2V0KCk7XG4gICAgcmV0dXJuIG1vZGVsID8gXy5jbG9uZShtb2RlbCkgOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0X3NldCh2YWx1ZSkge1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gTUxJbnB1dExpc3RfZGVsKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGVsLnNldChbXSk7XG59XG5cbmZ1bmN0aW9uIE1MSW5wdXRMaXN0X3NwbGljZSgpIHsgLy8gLi4uIGFyZ3VtZW50c1xuICAgIHRoaXMubW9kZWwuc3BsaWNlLmFwcGx5KHRoaXMubW9kZWwsIGFyZ3VtZW50cyk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTUxMaXN0ID0gbW9kdWxlLmV4cG9ydHMgPSBtaWxvLmNyZWF0ZUNvbXBvbmVudENsYXNzKHtcbiAgICBjbGFzc05hbWU6ICdNTExpc3QnLFxuICAgIGZhY2V0czoge1xuICAgICAgICBkb206IHtcbiAgICAgICAgICAgIGNsczogJ21sLXVpLWxpc3QnXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICAgICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgICAgIG1vZGVsOiB1bmRlZmluZWQsXG4gICAgICAgIGxpc3Q6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgICBpbml0OiBNTExpc3QkaW5pdCxcbiAgICAgICAgZGVzdHJveTogTUxMaXN0JGRlc3Ryb3ksXG4gICAgICAgIHJlbW92ZUl0ZW06IE1MTGlzdCRyZW1vdmVJdGVtLFxuICAgICAgICBtb3ZlSXRlbTogTUxMaXN0JG1vdmVJdGVtXG4gICAgfVxufSk7XG5cblxuZnVuY3Rpb24gTUxMaXN0JGluaXQoKSB7XG4gICAgTUxMaXN0LnN1cGVyLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3QkZGVzdHJveSgpIHtcbiAgICB0aGlzLl9jb25uZWN0b3IgJiYgbWlsby5taW5kZXIuZGVzdHJveUNvbm5lY3Rvcih0aGlzLl9jb25uZWN0b3IpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG4gICAgTUxMaXN0LnN1cGVyLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3QkcmVtb3ZlSXRlbShpbmRleCkge1xuICAgIHRoaXMubW9kZWwuc3BsaWNlKGluZGV4LCAxKTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3QkbW92ZUl0ZW0oZnJvbSwgdG8pIHtcbiAgICB2YXIgc3BsaWNlZERhdGEgPSB0aGlzLm1vZGVsLnNwbGljZShmcm9tLCAxKTtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5zcGxpY2UodG8sIDAsIHNwbGljZWREYXRhWzBdKTtcbn1cblxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdGhpcy5tb2RlbC5zZXQoW10pO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG1pbG8ubWluZGVyKHRoaXMubW9kZWwsICc8PDwtJywgdGhpcy5kYXRhKS5kZWZlckNoYW5nZU1vZGUoJzw8PC0+Pj4nKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERyYWdEcm9wID0gbWlsby51dGlsLmRyYWdEcm9wO1xuXG52YXIgTUxMaXN0SXRlbSA9IG1vZHVsZS5leHBvcnRzID0gbWlsby5jcmVhdGVDb21wb25lbnRDbGFzcyh7XG4gICAgY2xhc3NOYW1lOiAnTUxMaXN0SXRlbScsXG4gICAgc3VwZXJDbGFzc05hbWU6ICdNTExpc3RJdGVtU2ltcGxlJyxcbiAgICBmYWNldHM6IHtcbiAgICAgICAgZHJhZzoge1xuICAgICAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICAgICAnZHJhZ3N0YXJ0JzogeyBzdWJzY3JpYmVyOiBvbkRyYWdTdGFydCwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgICAgIHBhcmFtczogJ2dldE1ldGFEYXRhJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcm9wOiB7XG4gICAgICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgICAgICdkcmFnZW50ZXInOiB7IHN1YnNjcmliZXI6IG9uRHJhZ0hvdmVyLCBjb250ZXh0OiAnb3duZXInIH0sXG4gICAgICAgICAgICAgICAgJ2RyYWdvdmVyJzogeyBzdWJzY3JpYmVyOiBvbkRyYWdIb3ZlciwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgICAgICdkcmFnbGVhdmUnOiB7IHN1YnNjcmliZXI6IG9uRHJhZ091dCwgY29udGV4dDogJ293bmVyJyB9LFxuICAgICAgICAgICAgICAgICdkcm9wJzogeyBzdWJzY3JpYmVyOiBvbkl0ZW1Ecm9wLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbGxvdzoge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGlzQ29tcG9uZW50QWxsb3dlZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICAgIGluaXQ6IE1MTGlzdEl0ZW0kaW5pdCxcbiAgICAgICAgbW92ZUl0ZW06IE1MTGlzdEl0ZW0kbW92ZUl0ZW0sXG4gICAgICAgIHJlbW92ZUl0ZW06IE1MTGlzdEl0ZW0kcmVtb3ZlSXRlbSxcbiAgICAgICAgZ2V0TWV0YURhdGE6IE1MTGlzdEl0ZW0kZ2V0TWV0YURhdGEsXG4gICAgICAgIGlzRHJvcEFsbG93ZWQ6IE1MTGlzdEl0ZW0kaXNEcm9wQWxsb3dlZFxuICAgIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kaW5pdCgpIHtcbiAgICBNTExpc3RJdGVtLnN1cGVyLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uKCdjaGlsZHJlbmJvdW5kJywgb25DaGlsZHJlbkJvdW5kKTtcbn1cblxuXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdmFyIGRlbGV0ZUJ0biA9IHRoaXMuY29udGFpbmVyLnNjb3BlLmRlbGV0ZUJ0bjtcbiAgICBkZWxldGVCdG4gJiYgZGVsZXRlQnRuLmV2ZW50cy5vbignY2xpY2snLCB7IHN1YnNjcmliZXI6IHRoaXMucmVtb3ZlSXRlbSwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtJHJlbW92ZUl0ZW0oKSB7XG4gICAgdHJ5IHsgdmFyIGxpc3RPd25lciA9IHRoaXMuaXRlbS5saXN0Lm93bmVyOyB9IGNhdGNoKGUpIHt9XG4gICAgbGlzdE93bmVyICYmIGxpc3RPd25lci5yZW1vdmVJdGVtKHRoaXMuaXRlbS5pbmRleCk7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbSRtb3ZlSXRlbShpbmRleCkge1xuICAgIHZhciBsaXN0T3duZXIgPSB0aGlzLml0ZW0ubGlzdC5vd25lcjtcbiAgICBsaXN0T3duZXIgJiYgbGlzdE93bmVyLm1vdmVJdGVtKHRoaXMuaXRlbS5pbmRleCwgaW5kZXgpO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW0kaXNEcm9wQWxsb3dlZChtZXRhLyosIGRyYWdEcm9wKi8pe1xuICAgIHZhciBDb21wb25lbnQgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHMuZ2V0KG1ldGEuY29tcENsYXNzKTtcblxuICAgIHJldHVybiBtZXRhLnBhcmFtcyAmJiBfLmlzTnVtZXJpYyhtZXRhLnBhcmFtcy5pbmRleClcbiAgICAgICAgICAgICYmIChDb21wb25lbnQgPT0gTUxMaXN0SXRlbSB8fCBDb21wb25lbnQucHJvdG90eXBlIGluc3RhbmNlb2YgTUxMaXN0SXRlbSlcbiAgICAgICAgICAgICYmIGRyYWdnaW5nRnJvbVNhbWVMaXN0LmNhbGwodGhpcyk7XG59XG5cblxuZnVuY3Rpb24gZHJhZ2dpbmdGcm9tU2FtZUxpc3QoY29tcCkge1xuICAgIGNvbXAgPSBjb21wIHx8IERyYWdEcm9wLnNlcnZpY2UuZ2V0Q3VycmVudERyYWdTb3VyY2UoKTtcbiAgICB0cnkgeyB2YXIgc291cmNlTGlzdCA9IGNvbXAuaXRlbS5saXN0OyB9IGNhdGNoKGUpIHt9XG4gICAgcmV0dXJuIHNvdXJjZUxpc3QgPT0gdGhpcy5pdGVtLmxpc3Q7XG59XG5cblxuZnVuY3Rpb24gaXNDb21wb25lbnRBbGxvd2VkKCkge1xuICAgIHJldHVybiB0aGlzLmlzRHJvcEFsbG93ZWQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG5mdW5jdGlvbiBvbkl0ZW1Ecm9wKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICBvbkRyYWdPdXQuY2FsbCh0aGlzKTtcbiAgICB2YXIgZHQgPSBuZXcgRHJhZ0Ryb3AoZXZlbnQpO1xuICAgIHZhciBtZXRhID0gZHQuZ2V0Q29tcG9uZW50TWV0YSgpO1xuICAgIHZhciBzdGF0ZSA9IGR0LmdldENvbXBvbmVudFN0YXRlKCk7XG4gICAgdmFyIGxpc3RPd25lciA9IHRoaXMuaXRlbS5saXN0Lm93bmVyO1xuICAgIHZhciBpbmRleCA9IG1ldGEucGFyYW1zICYmIG1ldGEucGFyYW1zLmluZGV4O1xuICAgIHZhciBkcm9wUG9zaXRpb24gPSBEcmFnRHJvcC5nZXREcm9wUG9zaXRpb25ZKGV2ZW50LCB0aGlzLmVsKTtcbiAgICB2YXIgaXNCZWxvdyA9IGRyb3BQb3NpdGlvbiA9PSAnYmVsb3cnO1xuICAgIHZhciBpc0Fib3ZlID0gZHJvcFBvc2l0aW9uID09ICdhYm92ZSc7XG4gICAgdmFyIHRhcmdldEluZGV4O1xuXG4gICAgaWYgKGRyYWdnaW5nRnJvbVNhbWVMaXN0LmNhbGwodGhpcykpe1xuICAgICAgICBpZihzdGF0ZS5jb21wTmFtZSA9PSB0aGlzLm5hbWUpIHJldHVybjtcbiAgICAgICAgdmFyIHN0YXRlSW5kZXggPSBzdGF0ZS5mYWNldHNTdGF0ZXMuaXRlbS5zdGF0ZS5pbmRleDtcbiAgICAgICAgdmFyIGlzTW92ZURvd24gPSBzdGF0ZUluZGV4IDwgdGhpcy5pdGVtLmluZGV4O1xuICAgICAgICB2YXIgaXNTYW1lUG9zaXRpb247XG4gICAgICAgIGlmKGlzTW92ZURvd24pIHtcbiAgICAgICAgICAgIGlzU2FtZVBvc2l0aW9uID0gaXNBYm92ZSAmJiBzdGF0ZUluZGV4ICsgMSA9PSB0aGlzLml0ZW0uaW5kZXg7XG4gICAgICAgICAgICBpZihpc1NhbWVQb3NpdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLml0ZW0uaW5kZXggLSBpc0Fib3ZlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Ugey8vbW92ZSB1cFxuICAgICAgICAgICAgaXNTYW1lUG9zaXRpb24gPSBpc0JlbG93ICYmIHN0YXRlSW5kZXggLSAxID09IHRoaXMuaXRlbS5pbmRleDtcbiAgICAgICAgICAgIGlmKGlzU2FtZVBvc2l0aW9uKSByZXR1cm47XG4gICAgICAgICAgICB0YXJnZXRJbmRleCA9IHRoaXMuaXRlbS5pbmRleCArIGlzQmVsb3c7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdE93bmVyLm1vdmVJdGVtKCtpbmRleCwgdGFyZ2V0SW5kZXgsIHN0YXRlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRhcmdldEluZGV4ID0gdGhpcy5pdGVtLmluZGV4ICsgaXNCZWxvdztcbiAgICAgICAgdHJ5IHsgdmFyIGRhdGEgPSBzdGF0ZS5mYWNldHNTdGF0ZXMuZGF0YS5zdGF0ZTsgfSBjYXRjaChlKSB7fVxuICAgICAgICBsaXN0T3duZXIuZGF0YS5zcGxpY2UodGFyZ2V0SW5kZXgsIDAsIGRhdGEpO1xuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBvbkRyYWdTdGFydCgvKmV2ZW50VHlwZSwgZXZlbnQqLykge1xuICAgIERyYWdEcm9wLnNlcnZpY2Uub25jZSgnZHJhZ2Ryb3Bjb21wbGV0ZWQnLCB7IHN1YnNjcmliZXI6IG9uRHJhZ0Ryb3BDb21wbGV0ZWQsIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cblxuZnVuY3Rpb24gb25EcmFnSG92ZXIoLypldmVudFR5cGUsIGV2ZW50Ki8pIHtcbiAgICB0aGlzLmRvbS5hZGRDc3NDbGFzc2VzKCdtbC1kcmFnLW92ZXInKTtcbn1cblxuXG5mdW5jdGlvbiBvbkRyYWdPdXQoLypldmVudFR5cGUsIGV2ZW50Ki8pIHtcbiAgICB0aGlzLmRvbS5yZW1vdmVDc3NDbGFzc2VzKCdtbC1kcmFnLW92ZXInKTtcbn1cblxuXG5mdW5jdGlvbiBvbkRyYWdEcm9wQ29tcGxldGVkKG1zZywgZGF0YSkge1xuICAgIHZhciBkcm9wVGFyZ2V0ID0gZGF0YS5jb21wb25lbnQ7XG4gICAgdmFyIGRyb3BwZWRJbkFub3RoZXJMaXN0ID0gZGF0YS5ldmVudFR5cGUgPT0gJ2Ryb3AnICYmICFkcmFnZ2luZ0Zyb21TYW1lTGlzdC5jYWxsKHRoaXMsIGRyb3BUYXJnZXQpO1xuICAgIGlmIChkcm9wcGVkSW5Bbm90aGVyTGlzdCkgdGhpcy5pdGVtLnJlbW92ZUl0ZW0oKTtcbn1cblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtJGdldE1ldGFEYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGluZGV4OiB0aGlzLml0ZW0uaW5kZXhcbiAgICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxuXG52YXIgTElTVElURU1fQ0hBTkdFX01FU1NBR0UgPSAnbWxsaXN0aXRlbWNoYW5nZSc7XG5cbnZhciBNTExpc3RJdGVtU2ltcGxlID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTExpc3RJdGVtU2ltcGxlJywge1xuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRvbTogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHtcbiAgICAgICAgZ2V0OiBNTExpc3RJdGVtU2ltcGxlX2dldCxcbiAgICAgICAgc2V0OiBNTExpc3RJdGVtU2ltcGxlX3NldCxcbiAgICAgICAgZGVsOiBNTExpc3RJdGVtU2ltcGxlX2RlbCxcbiAgICAgICAgZXZlbnQ6IExJU1RJVEVNX0NIQU5HRV9NRVNTQUdFXG4gICAgfSxcbiAgICBtb2RlbDogdW5kZWZpbmVkLFxuICAgIGl0ZW06IHVuZGVmaW5lZFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxMaXN0SXRlbVNpbXBsZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxMaXN0SXRlbVNpbXBsZTtcblxuXG5mdW5jdGlvbiBNTExpc3RJdGVtU2ltcGxlX2dldCgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldCgpO1xuICAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgPyBfLmNsb25lKHZhbHVlKSA6IHZhbHVlO1xufVxuXG5cbmZ1bmN0aW9uIE1MTGlzdEl0ZW1TaW1wbGVfc2V0KHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JylcbiAgICAgICAgdGhpcy5kYXRhLl9zZXQodmFsdWUpO1xuICAgIHRoaXMubW9kZWwuc2V0KHZhbHVlKTtcbiAgICBfc2VuZENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cblxuZnVuY3Rpb24gTUxMaXN0SXRlbVNpbXBsZV9kZWwoKSB7XG4gICAgdGhpcy5kYXRhLl9kZWwoKTtcbiAgICB0aGlzLm1vZGVsLmRlbCgpO1xuICAgIF9zZW5kQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xufVxuXG5cbmZ1bmN0aW9uIF9zZW5kQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKExJU1RJVEVNX0NIQU5HRV9NRVNTQUdFKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIHVuaXF1ZUlkID0gbWlsby51dGlsLnVuaXF1ZUlkO1xuXG5cbnZhciBSQURJT19DSEFOR0VfTUVTU0FHRSA9ICdtbHJhZGlvZ3JvdXBjaGFuZ2UnXG4gICAgLCBFTEVNRU5UX05BTUVfUFJPUEVSVFkgPSAnX21sUmFkaW9Hcm91cEVsZW1lbnRJRCdcbiAgICAsIEVMRU1FTlRfTkFNRV9QUkVGSVggPSAnbWwtcmFkaW8tZ3JvdXAtJztcblxudmFyIE1MUmFkaW9Hcm91cCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxSYWRpb0dyb3VwJywge1xuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTFJhZGlvR3JvdXBfc2V0LFxuICAgICAgICBnZXQ6IE1MUmFkaW9Hcm91cF9nZXQsXG4gICAgICAgIGRlbDogTUxSYWRpb0dyb3VwX2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBSQURJT19DSEFOR0VfTUVTU0FHRVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKionOiB7IHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSwgY29udGV4dDogJ293bmVyJyB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ2NsaWNrJzogeyBzdWJzY3JpYmVyOiBvbkdyb3VwQ2xpY2ssIGNvbnRleHQ6ICdvd25lcicgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktcmFkaW8tZ3JvdXAnXG4gICAgfSxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgICB0ZW1wbGF0ZTogJ3t7fiBpdC5yYWRpb09wdGlvbnMgOm9wdGlvbiB9fSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAge3sjI2RlZi5lbElEOnt7PSBpdC5lbGVtZW50TmFtZSB9fS17ez0gb3B0aW9uLnZhbHVlIH19I319IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInt7PSBpdC5fcmVuZGVyT3B0aW9ucy5vcHRpb25Dc3NDbGFzcyB8fCBcIicgKyBFTEVNRU5UX05BTUVfUFJFRklYICsgJ29wdGlvblwiIH19XCI+IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwie3sjIGRlZi5lbElEIH19XCIgdHlwZT1cInJhZGlvXCIgdmFsdWU9XCJ7ez0gb3B0aW9uLnZhbHVlIH19XCIgbmFtZT1cInt7PSBpdC5lbGVtZW50TmFtZSB9fVwiPiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ7eyMgZGVmLmVsSUQgfX1cIj57ez0gb3B0aW9uLmxhYmVsIH19PC9sYWJlbD4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcbiAgICAgICAgICAgICAgICAgICB7e359fSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFJhZGlvR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MUmFkaW9Hcm91cDtcblxuXG5fLmV4dGVuZFByb3RvKE1MUmFkaW9Hcm91cCwge1xuICAgIGluaXQ6IE1MUmFkaW9Hcm91cCRpbml0LFxuICAgIGRlc3Ryb3k6IE1MUmFkaW9Hcm91cCRkZXN0cm95LFxuICAgIHNldFJlbmRlck9wdGlvbnM6IE1MUmFkaW9Hcm91cCRzZXRSZW5kZXJPcHRpb25zXG59KTtcblxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEluaXRpYWxpemUgcmFkaW8gZ3JvdXAgYW5kIHNldHVwXG4gKi9cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cCRpbml0KCkge1xuICAgIF8uZGVmaW5lUHJvcGVydHkodGhpcywgJ19yYWRpb0xpc3QnLCBbXSwgXy5DT05GKTtcbiAgICBfLmRlZmluZVByb3BlcnR5KHRoaXMsIEVMRU1FTlRfTkFNRV9QUk9QRVJUWSwgRUxFTUVOVF9OQU1FX1BSRUZJWCArIHVuaXF1ZUlkKCkpO1xuICAgIHRoaXMuX3JlbmRlck9wdGlvbnMgPSB7fTtcbiAgICBDb21wb25lbnQucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXAkc2V0UmVuZGVyT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5fcmVuZGVyT3B0aW9ucyA9IG9wdGlvbnM7XG59XG5cblxuLyoqXG4gKiBTZXRzIGdyb3VwIHZhbHVlXG4gKiBSZXBsYWNlcyB0aGUgZGF0YSBzZXQgb3BlcmF0aW9uIHRvIGRlYWwgd2l0aCByYWRpbyBidXR0b25zXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGJlIHNldFxuICovXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXBfc2V0KHZhbHVlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9yYWRpb0xpc3RcbiAgICAgICAgLCBzZXRSZXN1bHQ7XG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbihyYWRpbykge1xuICAgICAgICAgICAgcmFkaW8uY2hlY2tlZCA9IHJhZGlvLnZhbHVlID09IHZhbHVlO1xuICAgICAgICAgICAgaWYgKHJhZGlvLmNoZWNrZWQpXG4gICAgICAgICAgICAgICAgc2V0UmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZS5jYWxsKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBzZXRSZXN1bHQ7XG4gICAgfVxufVxuXG5cbi8qKlxuICogR2V0cyBncm91cCB2YWx1ZVxuICogUmV0cmlldmVzIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiB0aGUgZ3JvdXBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cF9nZXQoKSB7XG4gICAgdmFyIGNoZWNrZWQgPSBfLmZpbmQodGhpcy5fcmFkaW9MaXN0LCBmdW5jdGlvbihyYWRpbykge1xuICAgICAgICByZXR1cm4gcmFkaW8uY2hlY2tlZDtcbiAgICB9KTtcblxuICAgIHJldHVybiBjaGVja2VkICYmIGNoZWNrZWQudmFsdWUgfHwgdW5kZWZpbmVkO1xufVxuXG5cbi8qKlxuICogRGVsZXRlZCBncm91cCB2YWx1ZVxuICogRGVsZXRlcyB0aGUgdmFsdWUgb2YgdGhlIGdyb3VwLCBzZXR0aW5nIGl0IHRvIGVtcHR5XG4gKi9cbmZ1bmN0aW9uIE1MUmFkaW9Hcm91cF9kZWwoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9yYWRpb0xpc3Q7XG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoKVxuICAgICAgICBvcHRpb25zLmZvckVhY2goZnVuY3Rpb24ocmFkaW8pIHtcbiAgICAgICAgICAgIHJhZGlvLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5cbi8qKlxuICogTWFuYWdlIHJhZGlvIGNoaWxkcmVuIGNsaWNrc1xuICovXG5mdW5jdGlvbiBvbkdyb3VwQ2xpY2soZXZlbnRUeXBlLCBldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQudHlwZSA9PSAncmFkaW8nKVxuICAgICAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuLy8gUG9zdCB0aGUgZGF0YSBjaGFuZ2VcbmZ1bmN0aW9uIGRpc3BhdGNoQ2hhbmdlTWVzc2FnZSgpIHtcbiAgICB0aGlzLmRhdGEuZGlzcGF0Y2hTb3VyY2VNZXNzYWdlKFJBRElPX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuXG4vLyBTZXQgcmFkaW8gYnV0dG9uIGNoaWxkcmVuIG9uIG1vZGVsIGNoYW5nZVxuZnVuY3Rpb24gb25PcHRpb25zQ2hhbmdlKHBhdGgsIGRhdGEpIHtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcih7XG4gICAgICAgIHJhZGlvT3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKSxcbiAgICAgICAgZWxlbWVudE5hbWU6IHRoaXNbRUxFTUVOVF9OQU1FX1BST1BFUlRZXSxcbiAgICAgICAgX3JlbmRlck9wdGlvbnM6IHRoaXMuX3JlbmRlck9wdGlvbnNcbiAgICB9KTtcblxuICAgIHZhciByYWRpb0VscyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cInJhZGlvXCJdJylcbiAgICAgICAgLCBvcHRpb25zID0gXy50b0FycmF5KHJhZGlvRWxzKTtcblxuICAgIHRoaXMuX3JhZGlvTGlzdC5sZW5ndGggPSAwO1xuICAgIHRoaXMuX3JhZGlvTGlzdC5zcGxpY2UuYXBwbHkodGhpcy5fcmFkaW9MaXN0LCBbMCwgMF0uY29uY2F0KG9wdGlvbnMpKTtcbn1cblxuXG5mdW5jdGlvbiBNTFJhZGlvR3JvdXAkZGVzdHJveSgpIHtcbiAgICBkZWxldGUgdGhpcy5fcmFkaW9MaXN0O1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50cztcblxudmFyIFNFTEVDVF9DSEFOR0VfTUVTU0FHRSA9ICdtbHNlbGVjdGNoYW5nZSc7XG5cbnZhciBNTFNlbGVjdCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxTZWxlY3QnLCB7XG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXNlbGVjdCdcbiAgICB9LFxuICAgIGRhdGE6IHtcbiAgICAgICAgc2V0OiBNTFNlbGVjdF9zZXQsXG4gICAgICAgIGdldDogTUxTZWxlY3RfZ2V0LFxuICAgICAgICBkZWw6IE1MU2VsZWN0X2RlbCxcbiAgICAgICAgc3BsaWNlOiB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50OiBTRUxFQ1RfQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgJ2NoYW5nZSc6IHsgc3Vic2NyaWJlcjogZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICcqKic6IHsgc3Vic2NyaWJlcjogb25PcHRpb25zQ2hhbmdlLCBjb250ZXh0OiAnb3duZXInIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICd7e34gaXQuc2VsZWN0T3B0aW9ucyA6b3B0aW9uIH19IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwie3s9IG9wdGlvbi52YWx1ZSB9fVwiIHt7PyBvcHRpb24uc2VsZWN0ZWQgfX1zZWxlY3RlZHt7P319Pnt7PSBvcHRpb24ubGFiZWwgfX08L29wdGlvbj4gXFxcbiAgICAgICAgICAgICAgICAgICB7e359fSdcbiAgICB9XG59KTtcblxuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MU2VsZWN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFNlbGVjdDtcblxuXG5fLmV4dGVuZFByb3RvKE1MU2VsZWN0LCB7XG4gICAgaW5pdDogTUxTZWxlY3QkaW5pdCxcbiAgICBzZXRPcHRpb25zOiBNTFNlbGVjdCRzZXRPcHRpb25zLFxuICAgIGRpc2FibGU6IE1MU2VsZWN0JGRpc2FibGVcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0JGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fb3B0aW9uRWxzID0ge307XG4gICAgdGhpcy5faXNNdWx0aXBsZSA9IHRoaXMuZWwuaGFzQXR0cmlidXRlKCdtdWx0aXBsZScpO1xufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0JHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIC8vIFNldCBvcHRpb25zIHRlbXBvcmFyaWx5IGRpc2FibGVzIG1vZGVsIHN1YnNjcmlwdGlvbnMgKEFzIGEgd29ya2Fyb3VuZCBmb3IgcGVyZm9ybWFuY2UgaXNzdWVzIHJlbGF0aW5nIHRvIG1vZGVsIHVwZGF0ZXMgLyB0ZW1wbGF0ZSByZS1yZW5kZXJpbmcpXG4gICAgdmFyIG1vZGVsQ2hhbmdlTGlzdGVuZXIgPSB7IGNvbnRleHQ6IHRoaXMsIHN1YnNjcmliZXI6IG9uT3B0aW9uc0NoYW5nZSB9O1xuXG4gICAgdGhpcy5tb2RlbC5vZmYoJyoqJywgbW9kZWxDaGFuZ2VMaXN0ZW5lcik7XG4gICAgdGhpcy5tb2RlbC5zZXQob3B0aW9ucyk7XG4gICAgdGhpcy5tb2RlbC5vbignKionLCBtb2RlbENoYW5nZUxpc3RlbmVyKTtcblxuICAgIG9uT3B0aW9uc0NoYW5nZS5jYWxsKHRoaXMpO1xufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0JGRpc2FibGUoZGlzYWJsZSkge1xuICAgIHRoaXMuZWwuZGlzYWJsZWQgPSBkaXNhYmxlO1xufVxuXG5cbmZ1bmN0aW9uIE1MU2VsZWN0X3NldChzdHJPck9iaikge1xuICAgIGlmICghdGhpcy5faXNNdWx0aXBsZSkgdGhpcy5lbC52YWx1ZSA9IHN0ck9yT2JqO1xuICAgIGVsc2Uge1xuICAgICAgICB2YXIgdmFsdWVPYmogPSB7fTtcbiAgICAgICAgaWYgKHN0ck9yT2JqICYmIHR5cGVvZiBzdHJPck9iaiA9PSAnb2JqZWN0JykgdmFsdWVPYmogPSBzdHJPck9iajtcbiAgICAgICAgZWxzZSB2YWx1ZU9ialtzdHJPck9ial0gPSB0cnVlO1xuICAgICAgICBfLmVhY2hLZXkodGhpcy5fb3B0aW9uRWxzLCBmdW5jdGlvbiAoZWwsIGtleSkge1xuICAgICAgICAgICAgZWwuc2VsZWN0ZWQgPSAhIXZhbHVlT2JqW2tleV07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cblxuXG5mdW5jdGlvbiBNTFNlbGVjdF9nZXQoKSB7XG4gICAgaWYgKCF0aGlzLl9pc011bHRpcGxlKSByZXR1cm4gdGhpcy5lbC52YWx1ZTtcbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF8ubWFwS2V5cyh0aGlzLl9vcHRpb25FbHMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsLnNlbGVjdGVkO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gTUxTZWxlY3RfZGVsKCkge1xuICAgIGlmICghdGhpcy5faXNNdWx0aXBsZSkgdGhpcy5lbC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICBlbHNlIHtcbiAgICAgICAgXy5lYWNoS2V5KHRoaXMuX29wdGlvbkVscywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBlbC5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlLmNhbGwodGhpcyk7XG59XG5cblxuZnVuY3Rpb24gZGlzcGF0Y2hDaGFuZ2VNZXNzYWdlKCkge1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoU0VMRUNUX0NIQU5HRV9NRVNTQUdFKTtcbn1cblxuXG5mdW5jdGlvbiBvbk9wdGlvbnNDaGFuZ2UocGF0aCwgZGF0YSkge1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKHsgc2VsZWN0T3B0aW9uczogdGhpcy5tb2RlbC5nZXQoKSB9KTtcbiAgICB0aGlzLl9vcHRpb25FbHMgPSB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXy5mb3JFYWNoKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnb3B0aW9uJyksIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBzZWxmLl9vcHRpb25FbHNbZWwudmFsdWVdID0gZWw7XG4gICAgfSk7XG4gICAgLy9kaXNwYXRjaENoYW5nZU1lc3NhZ2UuY2FsbCh0aGlzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNTFN1cGVyQ29tYm9cbiAqIEEgY29tYm8gc2VsZWN0IGxpc3Qgd2l0aCBpbnRlbGxpZ2VudCBzY3JvbGxpbmcgb2Ygc3VwZXIgbGFyZ2UgbGlzdHMuXG4gKi9cblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGRvVCA9IG1pbG8udXRpbC5kb1RcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXI7XG5cbnZhciBDT01CT19PUEVOID0gJ21sLXVpLXN1cGVyY29tYm8tb3Blbic7XG52YXIgQ09NQk9fQ0hBTkdFX01FU1NBR0UgPSAnbWxzdXBlcmNvbWJvY2hhbmdlJztcblxudmFyIE9QVElPTlNfVEVNUExBVEUgPSAne3t+IGl0LmNvbWJvT3B0aW9ucyA6b3B0aW9uOmluZGV4IH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHt7PyBvcHRpb24uc2VsZWN0ZWR9fWNsYXNzPVwic2VsZWN0ZWRcIiB7ez99fWRhdGEtdmFsdWU9XCJ7ez0gaW5kZXggfX1cIj57ez0gb3B0aW9uLmxhYmVsIH19PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19JztcblxudmFyIE1BWF9SRU5ERVJFRCA9IDEwMDtcbnZhciBCVUZGRVIgPSAyNTtcbnZhciBERUZBVUxUX0VMRU1FTlRfSEVJR0hUID0gMjA7XG5cbnZhciBNTFN1cGVyQ29tYm8gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MU3VwZXJDb21ibycsIHtcbiAgICBldmVudHM6IHtcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgICdtb3VzZWxlYXZlJzoge3N1YnNjcmliZXI6IG9uTW91c2VMZWF2ZSwgY29udGV4dDogJ293bmVyJ30sXG4gICAgICAgICAgICAnbW91c2VvdmVyJzoge3N1YnNjcmliZXI6IG9uTW91c2VPdmVyLCBjb250ZXh0OiAnb3duZXInfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxTdXBlckNvbWJvX2dldCxcbiAgICAgICAgc2V0OiBNTFN1cGVyQ29tYm9fc2V0LFxuICAgICAgICBkZWw6IE1MU3VwZXJDb21ib19kZWwsXG4gICAgICAgIHNwbGljZTogdW5kZWZpbmVkLFxuICAgICAgICBldmVudDogQ09NQk9fQ0hBTkdFX01FU1NBR0VcbiAgICB9LFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS1zdXBlcmNvbWJvJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgICAgdGVtcGxhdGU6ICc8aW5wdXQgbWwtYmluZD1cIltkYXRhLCBldmVudHNdOmlucHV0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgbWwtdWktaW5wdXRcIj5cXFxuICAgICAgICAgICAgICAgICAgIDxkaXYgbWwtYmluZD1cIltkb21dOmFkZEl0ZW1EaXZcIiBjbGFzcz1cIm1sLXVpLXN1cGVyY29tYm8tYWRkXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIG1sLWJpbmQ9XCI6YWRkUHJvbXB0XCI+PC9zcGFuPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG1sLWJpbmQ9XCJbZXZlbnRzLCBkb21dOmFkZEJ0blwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IG1sLXVpLWJ1dHRvblwiPkFkZDwvYnV0dG9uPlxcXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbZG9tLCBldmVudHNdOmxpc3RcIiBjbGFzcz1cIm1sLXVpLXN1cGVyY29tYm8tZHJvcGRvd25cIj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbZG9tXTpiZWZvcmVcIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbdGVtcGxhdGUsIGRvbSwgZXZlbnRzXTpvcHRpb25zXCIgY2xhc3M9XCJtbC11aS1zdXBlcmNvbWJvLW9wdGlvbnNcIj48L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG1sLWJpbmQ9XCJbZG9tXTphZnRlclwiPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+J1xuICAgIH0sXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWRcbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MU3VwZXJDb21ibyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTUxTdXBlckNvbWJvO1xuXG4vKipcbiAqIFB1YmxpYyBBcGlcbiAqL1xuXy5leHRlbmRQcm90byhNTFN1cGVyQ29tYm8sIHtcbiAgICBpbml0OiBNTFN1cGVyQ29tYm8kaW5pdCxcbiAgICBzaG93T3B0aW9uczogTUxTdXBlckNvbWJvJHNob3dPcHRpb25zLFxuICAgIGhpZGVPcHRpb25zOiBNTFN1cGVyQ29tYm8kaGlkZU9wdGlvbnMsXG4gICAgdG9nZ2xlT3B0aW9uczogTUxTdXBlckNvbWJvJHRvZ2dsZU9wdGlvbnMsXG4gICAgc2V0T3B0aW9uczogTUxTdXBlckNvbWJvJHNldE9wdGlvbnMsXG4gICAgaW5pdE9wdGlvbnNVUkw6IE1MU3VwZXJDb21ibyRpbml0T3B0aW9uc1VSTCxcbiAgICBzZXRGaWx0ZXJlZE9wdGlvbnM6IE1MU3VwZXJDb21ibyRzZXRGaWx0ZXJlZE9wdGlvbnMsXG4gICAgdXBkYXRlOiBNTFN1cGVyQ29tYm8kdXBkYXRlLFxuICAgIHRvZ2dsZUFkZEJ1dHRvbjogTUxTdXBlckNvbWJvJHRvZ2dsZUFkZEJ1dHRvbixcbiAgICBzZXRBZGRJdGVtUHJvbXB0OiBNTFN1cGVyQ29tYm8kc2V0QWRkSXRlbVByb21wdCxcbiAgICBzZXRQbGFjZWhvbGRlcjogTUxTdXBlckNvbWJvJHNldFBsYWNlaG9sZGVyLFxuICAgIHNldEZpbHRlcjogTUxTdXBlckNvbWJvJHNldEZpbHRlcixcbiAgICBjbGVhckNvbWJvSW5wdXQ6IE1MU3VwZXJDb21ib19kZWxcbn0pO1xuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGlzZSB0aGUgY29tcG9uZW50LCB3YWl0IGZvciBjaGlsZHJlbmJvdW5kLCBzZXR1cCBlbXB0eSBvcHRpb25zIGFycmF5cy5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJGluaXQoKSB7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLm9uY2UoJ2NoaWxkcmVuYm91bmQnLCBvbkNoaWxkcmVuQm91bmQpO1xuXG4gICAgXy5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgX29wdGlvbnNEYXRhOiBbXSxcbiAgICAgICAgX2ZpbHRlcmVkT3B0aW9uc0RhdGE6IFtdLFxuICAgICAgICBfZmlsdGVyRnVuYzogZGVmYXVsdEZpbHRlclxuICAgIH0sIF8uV1JJVCk7XG59XG5cbi8qKlxuICogSGFuZGxlciBmb3IgaW5pdCBjaGlsZHJlbmJvdW5kIGxpc3RlbmVyLiBSZW5kZXJzIHRlbXBsYXRlLlxuICovXG5mdW5jdGlvbiBvbkNoaWxkcmVuQm91bmQoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoKS5iaW5kZXIoKTtcbiAgICBjb21wb25lbnRTZXR1cC5jYWxsKHRoaXMpO1xufVxuXG5cbi8qKlxuICogRGVmaW5lIGluc3RhbmNlIHByb3BlcnRpZXMsIGdldCBzdWJjb21wb25lbnRzLCBjYWxsIHNldHVwIHN1Yi10YXNrc1xuICovXG5mdW5jdGlvbiBjb21wb25lbnRTZXR1cCgpIHtcbiAgICB2YXIgc2NvcGUgPSB0aGlzLmNvbnRhaW5lci5zY29wZTtcblxuICAgIF8uZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgIF9jb21ib0lucHV0OiBzY29wZS5pbnB1dCxcbiAgICAgICAgX2NvbWJvTGlzdDogc2NvcGUubGlzdCxcbiAgICAgICAgX2NvbWJvT3B0aW9uczogc2NvcGUub3B0aW9ucyxcbiAgICAgICAgX2NvbWJvQmVmb3JlOiBzY29wZS5iZWZvcmUsXG4gICAgICAgIF9jb21ib0FmdGVyOiBzY29wZS5hZnRlcixcbiAgICAgICAgX2NvbWJvQWRkSXRlbURpdjogc2NvcGUuYWRkSXRlbURpdixcbiAgICAgICAgX2NvbWJvQWRkUHJvbXB0OiBzY29wZS5hZGRQcm9tcHQsXG4gICAgICAgIF9jb21ib0FkZEJ0bjogc2NvcGUuYWRkQnRuLFxuICAgICAgICBfb3B0aW9uVGVtcGxhdGU6IGRvVC5jb21waWxlKE9QVElPTlNfVEVNUExBVEUpXG4gICAgfSk7XG5cbiAgICBfLmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICBfc3RhcnRJbmRleDogMCxcbiAgICAgICAgX2VuZEluZGV4OiBNQVhfUkVOREVSRUQsXG4gICAgICAgIF9oaWRkZW46IGZhbHNlLFxuICAgICAgICBfZWxlbWVudEhlaWdodDogREVGQVVMVF9FTEVNRU5UX0hFSUdIVCxcbiAgICAgICAgX3RvdGFsOiAwLFxuICAgICAgICBfb3B0aW9uc0hlaWdodDogMjAwLFxuICAgICAgICBfbGFzdFNjcm9sbFBvczogMCxcbiAgICAgICAgX2N1cnJlbnRWYWx1ZTogbnVsbCxcbiAgICAgICAgX3NlbGVjdGVkOiBudWxsLFxuICAgICAgICBfaXNBZGRCdXR0b25TaG93bjogZmFsc2VcbiAgICB9LCBfLldSSVQpO1xuXG4gICAgLy8gQ29tcG9uZW50IFNldHVwXG4gICAgdGhpcy5kb20uc2V0U3R5bGVzKHsgcG9zaXRpb246ICdyZWxhdGl2ZScgfSk7XG4gICAgc2V0dXBDb21ib0xpc3QodGhpcy5fY29tYm9MaXN0LCB0aGlzLl9jb21ib09wdGlvbnMsIHRoaXMpO1xuICAgIHNldHVwQ29tYm9JbnB1dCh0aGlzLl9jb21ib0lucHV0LCB0aGlzKTtcbiAgICBzZXR1cENvbWJvQnRuKHRoaXMuX2NvbWJvQWRkQnRuLCB0aGlzKTtcblxuICAgIHRoaXMuZXZlbnRzLm9uKCdrZXlkb3duJywgeyBzdWJzY3JpYmVyOiBjaGFuZ2VTZWxlY3RlZCwgY29udGV4dDogdGhpcyB9KTtcbiAgICAvL3RoaXMuZXZlbnRzLm9uKCdtb3VzZWxlYXZlJywgeyBzdWJzY3JpYmVyOiBNTFN1cGVyQ29tYm8kaGlkZU9wdGlvbnMsIGNvbnRleHQ6IHRoaXMgfSk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogU2hvd3Mgb3IgaGlkZXMgb3B0aW9uIGxpc3QuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBzaG93IHRydWUgdG8gc2hvdywgZmFsc2UgdG8gaGlkZVxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kdG9nZ2xlT3B0aW9ucyhzaG93KSB7XG4gICAgdGhpcy5faGlkZGVuID0gIXNob3c7XG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS50b2dnbGUoc2hvdyk7XG59XG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogU2hvd3Mgb3B0aW9ucyBsaXN0XG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzaG93T3B0aW9ucygpIHtcbiAgICAvLyBQb3NpdGlvbiB0aGUgbGlzdCB0byBtYXhpbWlzZSB0aGUgYW1vdW50IG9mIHZpc2libGUgY29udGVudFxuICAgIHZhciBib3VuZHMgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHZhciBwYWdlSGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5lbC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKTtcbiAgICB2YXIgbGlzdFRvcFN0eWxlID0gJyc7IC8vIFBvc2l0aW9ucyBvcHRpb25zIHVuZGVybmVhdGggdGhlIGNvbWJvYm94IChEZWZhdWx0IGJlaGF2aW91cilcbiAgICB2YXIgYm90dG9tT3ZlcmxhcCA9IChib3VuZHMuYm90dG9tICsgdGhpcy5fb3B0aW9uc0hlaWdodCkgLSBwYWdlSGVpZ2h0O1xuXG4gICAgaWYoYm90dG9tT3ZlcmxhcCA+IDApIHtcbiAgICAgICAgdmFyIHRvcE92ZXJsYXAgPSB0aGlzLl9vcHRpb25zSGVpZ2h0IC0gYm91bmRzLnRvcDtcblxuICAgICAgICBpZih0b3BPdmVybGFwIDwgYm90dG9tT3ZlcmxhcCkge1xuICAgICAgICAgICAgbGlzdFRvcFN0eWxlID0gLSB0aGlzLl9vcHRpb25zSGVpZ2h0ICsgJ3B4JzsgLy8gUG9zaXRpb24gb3B0aW9ucyBhYm92ZSB0aGUgY29tYm9ib3hcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NvbWJvTGlzdC5kb20uc2V0U3R5bGVzKHsgdG9wOiBsaXN0VG9wU3R5bGUgfSk7XG4gICAgdGhpcy5faGlkZGVuID0gZmFsc2U7XG4gICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKENPTUJPX09QRU4pO1xuICAgIHRoaXMuX2NvbWJvTGlzdC5kb20udG9nZ2xlKHRydWUpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEhpZGVzIG9wdGlvbnMgbGlzdFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kaGlkZU9wdGlvbnMoKSB7XG4gICAgdGhpcy5faGlkZGVuID0gdHJ1ZTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoQ09NQk9fT1BFTik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmRvbS50b2dnbGUoZmFsc2UpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIEhpZGVzIGFkZCBidXR0b25cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHRvZ2dsZUFkZEJ1dHRvbihzaG93LCBvcHRpb25zKSB7XG4gICAgdGhpcy5fY29tYm9BZGRJdGVtRGl2LmRvbS50b2dnbGUoc2hvdyk7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wcmVzZXJ2ZVN0YXRlKSB0aGlzLl9fc2hvd0FkZE9uQ2xpY2sgPSB0aGlzLl9pc0FkZEJ1dHRvblNob3duO1xuICAgIHRoaXMuX2lzQWRkQnV0dG9uU2hvd24gPSBzaG93O1xufVxuXG5cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRBZGRJdGVtUHJvbXB0KHByb21wdCkge1xuICAgIHRoaXMuX2FkZEl0ZW1Qcm9tcHQgPSBwcm9tcHQ7XG4gICAgdGhpcy5fY29tYm9BZGRQcm9tcHQuZWwuaW5uZXJIVE1MID0gcHJvbXB0O1xuICAgIHRoaXMudG9nZ2xlQWRkQnV0dG9uKGZhbHNlKTtcbn1cblxuXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0UGxhY2Vob2xkZXIocGxhY2Vob2xkZXIpIHtcbiAgICB0aGlzLl9jb21ib0lucHV0LmVsLnBsYWNlaG9sZGVyID0gcGxhY2Vob2xkZXI7XG59XG5cblxuLyoqXG4gKiBTZXQgdGhlIGZpbHRlciBmdW5jdGlvbiB1c2VkIGluIHRoZSB0ZXh0IGZpZWxkXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIEEgZnVuY3Rpb24gd2l0aCB0aGUgYXJndW1lbnRzIGBbdGV4dCwgb3B0aW9uXWAgd2hpY2ggd2lsbCBpbnRlcmF0ZSBcbiAqIHRocm91Z2ggYWxsIGBvcHRpb25zYCwgdGVzdGluZyBlYWNoIGFnYWluc3QgdGhlIGVudGVyZWQgYHRleHRgLiBXQVJOSU5HOiBTZXR0aW5nIGEgZnVuY3Rpb24gXG4gKiBjb3VsZCBpbnRlcmZlcmUgd2l0aCBsb2dpYyB1c2UgdG8gZGV0ZXJtaW5nIGlmIGFuIGl0ZW0gaXMgdW5pcXVlIGZvciB0aGUgYWRkIGl0ZW0gYnV0dG9uLlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0RmlsdGVyKGZ1bmMpIHtcbiAgICB0aGlzLl9maWx0ZXJGdW5jID0gZnVuYztcbn1cblxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIFNldHMgdGhlIG9wdGlvbnMgb2YgdGhlIGRyb3Bkb3duXG4gKlxuICogQHBhcmFtIHtBcnJheVtPYmplY3RdfSBhcnIgdGhlIG9wdGlvbnMgdG8gc2V0IHdpdGggbGFiZWwgYW5kIHZhbHVlIHBhaXJzLiBWYWx1ZSBjYW4gYmUgYW4gb2JqZWN0LlxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm8kc2V0T3B0aW9ucyhhcnIpIHtcbiAgICB0aGlzLl9vcHRpb25zRGF0YSA9IGFycjtcbiAgICB0aGlzLnNldEZpbHRlcmVkT3B0aW9ucyhhcnIpO1xuXG4gICAgc2V0U2VsZWN0ZWQuY2FsbCh0aGlzLCBhcnJbMF0pO1xufVxuXG5cbi8qKlxuICogQ29tcG9uZW50IGluc3RhbmNlIG1ldGhvZFxuICogSW5pdGlhbGlzZSB0aGUgcmVtb3RlIG9wdGlvbnMgb2YgdGhlIGRyb3Bkb3duXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgdGhlIG9wdGlvbnMgdG8gaW5pdGlhbGlzZS5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJGluaXRPcHRpb25zVVJMKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9vcHRpb25zVVJMID0gb3B0aW9ucy51cmw7XG4gICAgdGhpcy5fZm9ybWF0T3B0aW9uc1VSTCA9IG9wdGlvbnMuZm9ybWF0T3B0aW9ucyB8fCBmdW5jdGlvbihlKXtyZXR1cm4gZTt9O1xufVxuXG5cbi8qKlxuICogUHJpdmF0ZSBtZXRob2RcbiAqIFNldHMgdGhlIG9wdGlvbnMgb2YgdGhlIGRyb3Bkb3duIGJhc2VkIG9uIGEgcmVxdWVzdFxuICovXG5mdW5jdGlvbiBfZ2V0T3B0aW9uc1VSTChjYikge1xuICAgIHZhciB1cmwgPSB0aGlzLl9vcHRpb25zVVJMLFxuICAgICAgICBxdWVyeVN0cmluZyA9IHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5nZXQoKTtcblxuICAgIGNiID0gY2IgfHwgXy5ub29wO1xuICAgIG1pbG8udXRpbC5yZXF1ZXN0LnBvc3QodXJsLCB7IG5hbWU6IHF1ZXJ5U3RyaW5nIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ2FuIG5vdCBzZWFyY2ggZm9yIFwiJyArIHF1ZXJ5U3RyaW5nICsgJ1wiJyk7XG4gICAgICAgICAgICByZXR1cm4gY2IobmV3IEVycm9yKCdSZXF1ZXN0IGVycm9yJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9IF8uanNvblBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSkgY2IobnVsbCwgcmVzcG9uc2VEYXRhKTtcbiAgICAgICAgZWxzZSBjYihuZXcgRXJyb3IoJ0RhdGEgZXJyb3InKSk7XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBDb21wb25lbnQgaW5zdGFuY2UgbWV0aG9kXG4gKiBTZXRzIHRoZSBmaWx0ZXJlZCBvcHRpb25zLCB3aGljaCBpcyBhIHN1YnNldCBvZiBub3JtYWwgb3B0aW9uc1xuICpcbiAqIEBwYXJhbSB7W3R5cGVdfSBhcnIgVGhlIG9wdGlvbnMgdG8gc2V0XG4gKi9cbmZ1bmN0aW9uIE1MU3VwZXJDb21ibyRzZXRGaWx0ZXJlZE9wdGlvbnMoYXJyKSB7XG4gICAgaWYgKCEgYXJyKSByZXR1cm4gbG9nZ2VyLmVycm9yKCdzZXRGaWx0ZXJlZE9wdGlvbnM6IHBhcmFtZXRlciBpcyB1bmRlZmluZWQnKTtcbiAgICB0aGlzLl9maWx0ZXJlZE9wdGlvbnNEYXRhID0gYXJyO1xuICAgIHRoaXMuX3RvdGFsID0gYXJyLmxlbmd0aDtcbiAgICB0aGlzLnVwZGF0ZSgpO1xufVxuXG4vKipcbiAqIENvbXBvbmVudCBpbnN0YW5jZSBtZXRob2RcbiAqIFVwZGF0ZXMgdGhlIGxpc3QuIFRoaXMgaXMgdXNlZCBvbiBzY3JvbGwsIGFuZCBtYWtlcyB1c2Ugb2YgdGhlIGZpbHRlcmVkT3B0aW9ucyB0b1xuICogaW50ZWxsaWdlbnRseSBzaG93IGEgc3Vic2V0IG9mIHRoZSBmaWx0ZXJlZCBsaXN0IGF0IGEgdGltZS5cbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvJHVwZGF0ZSgpIHtcbiAgICB2YXIgd2FzSGlkZGVuID0gdGhpcy5faGlkZGVuO1xuXG4gICAgdmFyIGFyclRvU2hvdyA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGEuc2xpY2UodGhpcy5fc3RhcnRJbmRleCwgdGhpcy5fZW5kSW5kZXgpO1xuXG4gICAgdGhpcy5fY29tYm9PcHRpb25zLnRlbXBsYXRlLnJlbmRlcih7XG4gICAgICAgIGNvbWJvT3B0aW9uczogYXJyVG9TaG93XG4gICAgfSk7XG5cbiAgICB0aGlzLl9lbGVtZW50SGVpZ2h0ID0gdGhpcy5fZWxlbWVudEhlaWdodCB8fCBERUZBVUxUX0VMRU1FTlRfSEVJR0hUO1xuXG4gICAgaWYgKHdhc0hpZGRlbilcbiAgICAgICAgdGhpcy5oaWRlT3B0aW9ucygpO1xuXG4gICAgdmFyIGJlZm9yZUhlaWdodCA9IHRoaXMuX3N0YXJ0SW5kZXggKiB0aGlzLl9lbGVtZW50SGVpZ2h0O1xuICAgIHZhciBhZnRlckhlaWdodCA9ICh0aGlzLl90b3RhbCAtIHRoaXMuX2VuZEluZGV4KSAqIHRoaXMuX2VsZW1lbnRIZWlnaHQ7XG4gICAgdGhpcy5fY29tYm9CZWZvcmUuZWwuc3R5bGUuaGVpZ2h0ID0gYmVmb3JlSGVpZ2h0ICsgJ3B4JztcbiAgICB0aGlzLl9jb21ib0FmdGVyLmVsLnN0eWxlLmhlaWdodCA9IGFmdGVySGVpZ2h0ID4gMCA/IGFmdGVySGVpZ2h0ICsgJ3B4JyA6ICcwcHgnO1xufVxuXG4vKipcbiAqIFNldHVwIHRoZSBjb21ibyBsaXN0XG4gKlxuICogQHBhcmFtICB7Q29tcG9uZW50fSBsaXN0XG4gKiBAcGFyYW0gIHtBcnJheX0gb3B0aW9uc1xuICogQHBhcmFtICB7Q29tcG9uZW50fSBzZWxmXG4gKi9cbmZ1bmN0aW9uIHNldHVwQ29tYm9MaXN0KGxpc3QsIG9wdGlvbnMsIHNlbGYpIHtcbiAgICBzZWxmLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSk7XG4gICAgb3B0aW9ucy50ZW1wbGF0ZS5zZXQoT1BUSU9OU19URU1QTEFURSk7XG5cbiAgICBsaXN0LmRvbS5zZXRTdHlsZXMoe1xuICAgICAgICBvdmVyZmxvdzogJ3Njcm9sbCcsXG4gICAgICAgIGhlaWdodDogc2VsZi5fb3B0aW9uc0hlaWdodCArICdweCcsXG4gICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICB6SW5kZXg6IDEwXG4gICAgICAgIC8vIHRvcDogeVBvcyArICdweCcsXG4gICAgICAgIC8vIGxlZnQ6IHhQb3MgKyAncHgnLFxuICAgIH0pO1xuXG4gICAgc2VsZi5oaWRlT3B0aW9ucygpO1xuICAgIGxpc3QuZXZlbnRzLm9uTWVzc2FnZXMoe1xuICAgICAgICAnY2xpY2snOiB7c3Vic2NyaWJlcjogb25MaXN0Q2xpY2ssIGNvbnRleHQ6IHNlbGZ9LFxuICAgICAgICAnc2Nyb2xsJzoge3N1YnNjcmliZXI6IG9uTGlzdFNjcm9sbCwgY29udGV4dDogc2VsZn1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTZXR1cCB0aGUgaW5wdXQgY29tcG9uZW50XG4gKlxuICogQHBhcmFtICB7Q29tcG9uZW50fSBpbnB1dFxuICogQHBhcmFtICB7Q29tcG9uZW50fSBzZWxmXG4gKi9cbmZ1bmN0aW9uIHNldHVwQ29tYm9JbnB1dChpbnB1dCwgc2VsZikge1xuICAgIGlucHV0LmV2ZW50cy5vbmNlKCdmb2N1cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGlucHV0LmRhdGEub24oJycsIHsgc3Vic2NyaWJlcjogb25EYXRhQ2hhbmdlLCBjb250ZXh0OiBzZWxmIH0pO1xuICAgICAgICBpbnB1dC5ldmVudHMub24oJ2NsaWNrJywge3N1YnNjcmliZXI6IG9uSW5wdXRDbGljaywgY29udGV4dDogc2VsZiB9KTtcbiAgICAgICAgaW5wdXQuZXZlbnRzLm9uKCdrZXlkb3duJywge3N1YnNjcmliZXI6IG9uRW50ZXJLZXksIGNvbnRleHQ6IHNlbGYgfSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2V0dXAgdGhlIGJ1dHRvblxuICogQHBhcmFtICB7Q29tcG9uZW50fSBidG5cbiAqIEBwYXJhbSAge0NvbXBvbmVudH0gc2VsZlxuICovXG5mdW5jdGlvbiBzZXR1cENvbWJvQnRuKGJ0biwgc2VsZikge1xuICAgIGJ0bi5ldmVudHMub24oJ2NsaWNrJywgeyBzdWJzY3JpYmVyOiBvbkFkZEJ0biwgY29udGV4dDogc2VsZiB9KTtcbn1cblxuXG4vKipcbiAqIEN1c3RvbSBkYXRhIGZhY2V0IGdldCBtZXRob2RcbiAqL1xuZnVuY3Rpb24gTUxTdXBlckNvbWJvX2dldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFZhbHVlO1xufVxuXG4vKipcbiAqIEN1c3RvbSBkYXRhIGZhY2V0IHNldCBtZXRob2RcbiAqIEBwYXJhbSB7VmFyaWFibGV9IG9ialxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm9fc2V0KG9iaikge1xuICAgIHRoaXMuX2N1cnJlbnRWYWx1ZSA9IG9iajtcbiAgICB0aGlzLl9jb21ib0lucHV0LmRhdGEuc2V0KG9iaiAmJiBvYmoubGFiZWwpO1xuICAgIHRoaXMuZGF0YS5kaXNwYXRjaFNvdXJjZU1lc3NhZ2UoQ09NQk9fQ0hBTkdFX01FU1NBR0UpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgXy5kZWZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5oaWRlT3B0aW9ucygpO1xuICAgICAgICBzZWxmLnNldEZpbHRlcmVkT3B0aW9ucyhzZWxmLl9vcHRpb25zRGF0YSk7XG4gICAgICAgIHNlbGYudXBkYXRlKCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ3VzdG9tIGRhdGEgZmFjZXQgZGVsIG1ldGhvZFxuICovXG5mdW5jdGlvbiBNTFN1cGVyQ29tYm9fZGVsKCkge1xuICAgIHRoaXMuX2N1cnJlbnRWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLnNldCgnJyk7XG4gICAgdGhpcy5kYXRhLmRpc3BhdGNoU291cmNlTWVzc2FnZShDT01CT19DSEFOR0VfTUVTU0FHRSk7XG59XG5cblxuLyoqXG4gKiBJbnB1dCBkYXRhIGNoYW5nZSBoYW5kbGVyXG4gKiBXaGVuIHRoZSBpbnB1dCBkYXRhIGNoYW5nZXMsIHRoaXMgbWV0aG9kIGZpbHRlcnMgdGhlIG9wdGlvbnNEYXRhLCBhbmQgc2V0cyB0aGUgZmlyc3QgZWxlbWVudFxuICogdG8gYmUgc2VsZWN0ZWQuXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1zZ1xuICogQHBhcmFtICB7T2JqZXh0fSBkYXRhXG4gKi9cbmZ1bmN0aW9uIG9uRGF0YUNoYW5nZShtc2csIGRhdGEpIHtcbiAgICB2YXIgdGV4dCA9IGRhdGEubmV3VmFsdWUgJiYgZGF0YS5uZXdWYWx1ZS50cmltKCk7XG4gICAgaWYgKHRoaXMuX29wdGlvbnNVUkwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBfZ2V0T3B0aW9uc1VSTC5jYWxsKHRoaXMsIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2VEYXRhKXtcbiAgICAgICAgICAgIGlmIChlcnIgfHwgIXJlc3BvbnNlRGF0YSkgcmV0dXJuO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHJlc3BvbnNlRGF0YS5kYXRhLm1hcChzZWxmLl9mb3JtYXRPcHRpb25zVVJMKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgX3VwZGF0ZU9wdGlvbnNBbmRBZGRCdXR0b24uY2FsbChzZWxmLCB0ZXh0LCBzZWxmLl9vcHRpb25zRGF0YSk7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0RhdGEgZXJyb3InLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGZpbHRlcmVkRGF0YSA9IF9maWx0ZXJEYXRhLmNhbGwodGhpcywgdGV4dCk7XG4gICAgICAgIF91cGRhdGVPcHRpb25zQW5kQWRkQnV0dG9uLmNhbGwodGhpcywgdGV4dCwgZmlsdGVyZWREYXRhKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gX2ZpbHRlckRhdGEodGV4dCkge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zRGF0YS5maWx0ZXIoXy5wYXJ0aWFsKHRoaXMuX2ZpbHRlckZ1bmMsIHRleHQpKTtcbn1cblxuXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyKHRleHQsIG9wdGlvbikge1xuICAgIGlmICghIG9wdGlvbi5sYWJlbCkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBsYWJlbCA9IG9wdGlvbi5sYWJlbC50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBsYWJlbC50cmltKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRleHQudG9Mb3dlckNhc2UoKSkgPT0gMDtcbn1cblxuXG5mdW5jdGlvbiBfdXBkYXRlT3B0aW9uc0FuZEFkZEJ1dHRvbih0ZXh0LCBmaWx0ZXJlZEFycikge1xuICAgIGlmICghdGV4dCkge1xuICAgICAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSwgeyBwcmVzZXJ2ZVN0YXRlOiB0cnVlIH0pO1xuICAgICAgICBzZXRTZWxlY3RlZC5jYWxsKHRoaXMsIGZpbHRlcmVkQXJyWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZmlsdGVyZWRBcnIubGVuZ3RoICYmIF8uZmluZChmaWx0ZXJlZEFyciwgaXNFeGFjdE1hdGNoKSkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9hZGRJdGVtUHJvbXB0KSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbih0aGlzLl9vcHRpb25zRGF0YS5sZW5ndGggPiAxIHx8IHRoaXMuX29wdGlvbnNVUkwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbHRlcmVkQXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5zaG93T3B0aW9ucygpO1xuICAgICAgICAgICAgc2V0U2VsZWN0ZWQuY2FsbCh0aGlzLCBmaWx0ZXJlZEFyclswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldEZpbHRlcmVkT3B0aW9ucyhmaWx0ZXJlZEFycik7XG4gICAgdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcCA9IDA7XG5cbiAgICBmdW5jdGlvbiBpc0V4YWN0TWF0Y2goaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5sYWJlbC50b0xvd2VyQ2FzZSgpID09PSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgbWFwIG9mIGtleUNvZGVzIHRvIGRpcmVjdGlvbnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBkaXJlY3Rpb25NYXAgPSB7ICc0MCc6IDEsICczOCc6IC0xIH07XG5cbi8qKlxuICogTGlzdCBrZXlkb3duIGhhbmRsZXJcbiAqIENoYW5nZXMgdGhlIHNlbGVjdGVkIGxpc3QgaXRlbSBieSBmaW5kaW5nIHRoZSBhZGphY2VudCBpdGVtIGFuZCBzZXR0aW5nIGl0IHRvIHNlbGVjdGVkLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGNoYW5nZVNlbGVjdGVkKHR5cGUsIGV2ZW50KSB7XG4gICAgLy9UT0RPIHRlc3QgbW9jaGFcbiAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uTWFwW2V2ZW50LmtleUNvZGVdO1xuXG4gICAgaWYoZGlyZWN0aW9uKVxuICAgICAgICBfY2hhbmdlU2VsZWN0ZWQuY2FsbCh0aGlzLCBkaXJlY3Rpb24pO1xufVxuXG5mdW5jdGlvbiBfY2hhbmdlU2VsZWN0ZWQoZGlyZWN0aW9uKSB7XG4gICAgLy8gVE9ETzogcmVmYWN0b3IgYW5kIHRpZHkgdXAsIGxvb2tzIGxpa2Ugc29tZSBjb2RlIGR1cGxpY2F0aW9uLlxuICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLnNlbGVjdGVkJyk7XG4gICAgdmFyIG5ld1NlbGVjdGlvbiA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbMF07IC8vIERlZmF1bHQgaWYgbm8gc2VsZWN0ZWRFbFxuICAgIHZhciBzY3JvbGxQb3MgPSB0aGlzLl9jb21ib0xpc3QuZWwuc2Nyb2xsVG9wO1xuICAgIHZhciBzZWxlY3RlZFBvcyA9IHNlbGVjdGVkID8gc2VsZWN0ZWQub2Zmc2V0VG9wIDogMDtcbiAgICB2YXIgcmVsYXRpdmVQb3MgPSBzZWxlY3RlZFBvcyAtIHNjcm9sbFBvcztcblxuICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICB2YXIgaW5kZXggPSBfZ2V0RGF0YVZhbHVlRnJvbUVsZW1lbnQuY2FsbCh0aGlzLCBzZWxlY3RlZCk7XG4gICAgICAgIG5ld1NlbGVjdGlvbiA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbaW5kZXggKyBkaXJlY3Rpb25dO1xuICAgIH1cblxuICAgIHNldFNlbGVjdGVkLmNhbGwodGhpcywgbmV3U2VsZWN0aW9uKTtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgaWYgKHJlbGF0aXZlUG9zID4gdGhpcy5fb3B0aW9uc0hlaWdodCAtIHRoaXMuX2VsZW1lbnRIZWlnaHQgKiAyICYmIGRpcmVjdGlvbiA9PT0gMSlcbiAgICAgICAgdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcCArPSB0aGlzLl9lbGVtZW50SGVpZ2h0ICogZGlyZWN0aW9uICogNTtcblxuICAgIGlmIChyZWxhdGl2ZVBvcyA8IHRoaXMuX2VsZW1lbnRIZWlnaHQgJiYgZGlyZWN0aW9uID09PSAtMSlcbiAgICAgICAgdGhpcy5fY29tYm9MaXN0LmVsLnNjcm9sbFRvcCArPSB0aGlzLl9lbGVtZW50SGVpZ2h0ICogZGlyZWN0aW9uICogNTtcbn1cblxuXG4vKipcbiAqIE1vdXNlIG92ZXIgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91c2VPdmVyKHR5cGUsIGV2ZW50KSB7XG4gICAgdGhpcy5fbW91c2VJc092ZXIgPSB0cnVlO1xufVxuXG5cbi8qKlxuICogTW91c2UgbGVhdmUgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91c2VMZWF2ZSh0eXBlLCBldmVudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9tb3VzZUlzT3ZlciA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9tb3VzZU91dFRpbWVyKSBjbGVhckludGVydmFsKHRoaXMuX21vdXNlT3V0VGltZXIpO1xuICAgIHRoaXMuX21vdXNlT3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICghc2VsZi5fbW91c2VJc092ZXIpXG4gICAgICAgICAgICBfb25Nb3VzZUxlYXZlLmNhbGwoc2VsZik7XG4gICAgfSwgNzUwKTtcbn1cblxuZnVuY3Rpb24gX29uTW91c2VMZWF2ZSgpIHtcbiAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UsIHsgcHJlc2VydmVTdGF0ZTogdHJ1ZSB9KTtcbn1cblxuXG4vKipcbiAqIElucHV0IGNsaWNrIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbklucHV0Q2xpY2sodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLnNob3dPcHRpb25zKCk7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5lbC5zZXRTZWxlY3Rpb25SYW5nZSgwLCB0aGlzLl9jb21ib0lucHV0LmVsLnZhbHVlLmxlbmd0aCk7XG4gICAgaWYgKHRoaXMuX19zaG93QWRkT25DbGljaykgdGhpcy50b2dnbGVBZGRCdXR0b24odHJ1ZSk7XG59XG5cblxuLyoqXG4gKiBFbnRlciBrZXkgaGFuZGxlclxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZVxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uRW50ZXJLZXkodHlwZSwgZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAxMykge1xuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWQpXG4gICAgICAgICAgICBfc2V0RGF0YS5jYWxsKHRoaXMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYnV0dG9uIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge0V2ZW50fSBldmVudFxuICovXG5mdW5jdGlvbiBvbkFkZEJ0biAodHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgZGF0YSA9IHsgbGFiZWw6IHRoaXMuX2NvbWJvSW5wdXQuZWwudmFsdWUgfTtcbiAgICB0aGlzLnBvc3RNZXNzYWdlKCdhZGRpdGVtJywgZGF0YSk7XG4gICAgdGhpcy5ldmVudHMucG9zdE1lc3NhZ2UoJ21pbG9fc3VwZXJjb21ib2FkZGl0ZW0nLCBkYXRhKTtcbiAgICB0aGlzLnRvZ2dsZUFkZEJ1dHRvbihmYWxzZSwgeyBwcmVzZXJ2ZVN0YXRlOiB0cnVlIH0pO1xuXG59XG5cbi8qKlxuICogTGlzdCBjbGljayBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25MaXN0Q2xpY2sgKHR5cGUsIGV2ZW50KSB7XG4gICAgdmFyIGluZGV4ID0gX2dldERhdGFWYWx1ZUZyb21FbGVtZW50LmNhbGwodGhpcywgZXZlbnQudGFyZ2V0KTtcbiAgICB2YXIgZGF0YSA9IHRoaXMuX2ZpbHRlcmVkT3B0aW9uc0RhdGFbaW5kZXhdO1xuXG4gICAgc2V0U2VsZWN0ZWQuY2FsbCh0aGlzLCBkYXRhKTtcbiAgICBfc2V0RGF0YS5jYWxsKHRoaXMpO1xuICAgIHRoaXMudXBkYXRlKCk7XG59XG5cblxuLyoqXG4gKiBMaXN0IHNjcm9sbCBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gb25MaXN0U2Nyb2xsICh0eXBlLCBldmVudCkge1xuICAgIHZhciBzY3JvbGxQb3MgPSBldmVudC50YXJnZXQuc2Nyb2xsVG9wXG4gICAgICAgICwgZGlyZWN0aW9uID0gc2Nyb2xsUG9zID4gdGhpcy5fbGFzdFNjcm9sbFBvcyA/ICdkb3duJyA6ICd1cCdcbiAgICAgICAgLCBmaXJzdENoaWxkID0gdGhpcy5fY29tYm9PcHRpb25zLmVsLmxhc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgLCBsYXN0Q2hpbGQgPSB0aGlzLl9jb21ib09wdGlvbnMuZWwuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgLCBsYXN0RWxQb3NpdGlvbiA9IGZpcnN0Q2hpbGQgPyBmaXJzdENoaWxkLm9mZnNldFRvcCA6IDBcbiAgICAgICAgLCBmaXJzdEVsUG9zaXRpb24gPSBsYXN0Q2hpbGQgPyBsYXN0Q2hpbGQub2Zmc2V0VG9wIDogMFxuICAgICAgICAsIGRpc3RGcm9tTGFzdEVsID0gbGFzdEVsUG9zaXRpb24gLSBzY3JvbGxQb3MgLSB0aGlzLl9vcHRpb25zSGVpZ2h0ICsgdGhpcy5fZWxlbWVudEhlaWdodFxuICAgICAgICAsIGRpc3RGcm9tRmlyc3RFbCA9IHNjcm9sbFBvcyAtIGZpcnN0RWxQb3NpdGlvblxuICAgICAgICAsIGVsc0Zyb21TdGFydCA9IE1hdGguZmxvb3IoZGlzdEZyb21GaXJzdEVsIC8gdGhpcy5fZWxlbWVudEhlaWdodClcbiAgICAgICAgLCBlbHNUb1RoZUVuZCA9IE1hdGguZmxvb3IoZGlzdEZyb21MYXN0RWwgLyB0aGlzLl9lbGVtZW50SGVpZ2h0KVxuICAgICAgICAsIHRvdGFsRWxlbWVudHNCZWZvcmUgPSBNYXRoLmZsb29yKHNjcm9sbFBvcyAvIHRoaXMuX2VsZW1lbnRIZWlnaHQpIC0gQlVGRkVSO1xuXG4gICAgaWYgKChkaXJlY3Rpb24gPT0gJ2Rvd24nICYmIGVsc1RvVGhlRW5kIDwgQlVGRkVSKVxuICAgICAgICB8fCAoZGlyZWN0aW9uID09ICd1cCcgJiYgZWxzRnJvbVN0YXJ0IDwgQlVGRkVSKSkge1xuICAgICAgICB0aGlzLl9zdGFydEluZGV4ID0gdG90YWxFbGVtZW50c0JlZm9yZSA+IDAgPyB0b3RhbEVsZW1lbnRzQmVmb3JlIDogMDtcbiAgICAgICAgdGhpcy5fZW5kSW5kZXggPSB0b3RhbEVsZW1lbnRzQmVmb3JlICsgTUFYX1JFTkRFUkVEO1xuICAgICAgICB0aGlzLl9lbGVtZW50SGVpZ2h0ID0gZmlyc3RDaGlsZC5zdHlsZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICAgIHRoaXMuX2xhc3RTY3JvbGxQb3MgPSBzY3JvbGxQb3M7XG59XG5cblxuLyoqXG4gKiBQcml2YXRlIG1ldGhvZFxuICogUmV0cmlldmVzIHRoZSBkYXRhLXZhbHVlIGF0dHJpYnV0ZSB2YWx1ZSBmcm9tIHRoZSBlbGVtZW50IGFuZCByZXR1cm5zIGl0IGFzIGFuIGluZGV4IG9mXG4gKiB0aGUgZmlsdGVyZWRPcHRpb25zXG4gKlxuICogQHBhcmFtICB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gX2dldERhdGFWYWx1ZUZyb21FbGVtZW50KGVsKSB7XG4gICAgcmV0dXJuIE51bWJlcihlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnKSkgKyB0aGlzLl9zdGFydEluZGV4O1xufVxuXG4vKipcbiAqIFByaXZhdGUgbWV0aG9kXG4gKiBTZXRzIHRoZSBkYXRhIG9mIHRoZSBTdXBlckNvbWJvLCB0YWtpbmcgY2FyZSB0byByZXNldCBzb21lIHRoaW5ncyBhbmQgdGVtcG9yYXJpbHlcbiAqIHVuc3Vic2NyaWJlIGRhdGEgbGlzdGVuZXJzLlxuICovXG5mdW5jdGlvbiBfc2V0RGF0YSgpIHtcbiAgICB0aGlzLmhpZGVPcHRpb25zKCk7XG4gICAgdGhpcy50b2dnbGVBZGRCdXR0b24oZmFsc2UpO1xuICAgIHRoaXMuX2NvbWJvSW5wdXQuZGF0YS5vZmYoJycsIHsgc3Vic2NyaWJlcjogb25EYXRhQ2hhbmdlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgIC8vc3VwZXJjb21ibyBsaXN0ZW5lcnMgb2ZmXG4gICAgdGhpcy5kYXRhLnNldCh0aGlzLl9zZWxlY3RlZCk7XG4gICAgdGhpcy5fY29tYm9JbnB1dC5kYXRhLm9uKCcnLCB7IHN1YnNjcmliZXI6IG9uRGF0YUNoYW5nZSwgY29udGV4dDogdGhpcyB9KTtcbiAgICAvL3N1cGVyY29tYm8gbGlzdGVuZXJzIG9uXG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkKSBkZWxldGUgdGhpcy5fc2VsZWN0ZWQuc2VsZWN0ZWQ7XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHM7XG5cblxudmFyIE1MVGV4dCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxUZXh0Jywge1xuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktdGV4dCdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFRleHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MVGV4dDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXI7XG5cblxudmFyIE1MVGV4dGFyZWEgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MVGV4dGFyZWEnLCB7XG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6ICdtbC11aS10ZXh0YXJlYSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFRleHRhcmVhKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFRleHRhcmVhO1xuXG5fLmV4dGVuZFByb3RvKE1MVGV4dGFyZWEsIHtcbiAgICBzdGFydEF1dG9yZXNpemU6IE1MVGV4dGFyZWEkc3RhcnRBdXRvcmVzaXplLFxuICAgIHN0b3BBdXRvcmVzaXplOiBNTFRleHRhcmVhJHN0b3BBdXRvcmVzaXplLFxuICAgIGlzQXV0b3Jlc2l6ZWQ6IE1MVGV4dGFyZWEkaXNBdXRvcmVzaXplZCxcbiAgICBkaXNhYmxlOiBNTFRleHRhcmVhJGRpc2FibGVcbn0pO1xuXG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkc3RhcnRBdXRvcmVzaXplKG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5fYXV0b3Jlc2l6ZSlcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTFRleHRhcmVhIHN0YXJ0QXV0b3Jlc2l6ZTogYXV0b3Jlc2l6ZSBpcyBhbHJlYWR5IG9uJyk7XG4gICAgdGhpcy5fYXV0b3Jlc2l6ZSA9IHRydWU7XG4gICAgdGhpcy5fYXV0b3Jlc2l6ZU9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgX2FkanVzdEFyZWFIZWlnaHQuY2FsbCh0aGlzKTtcbiAgICBfbWFuYWdlU3Vic2NyaXB0aW9ucy5jYWxsKHRoaXMsICdvbicpO1xufVxuXG5cbmZ1bmN0aW9uIF9tYW5hZ2VTdWJzY3JpcHRpb25zKG9uT2ZmKSB7XG4gICAgdGhpcy5ldmVudHNbb25PZmZdKCdjbGljaycsIHsgc3Vic2NyaWJlcjogX2FkanVzdEFyZWFIZWlnaHQsIGNvbnRleHQ6IHRoaXMgfSk7XG4gICAgdGhpcy5kYXRhW29uT2ZmXSgnJywgeyBzdWJzY3JpYmVyOiBfYWRqdXN0QXJlYUhlaWdodCwgY29udGV4dDogdGhpcyB9KTtcbn1cblxuXG5mdW5jdGlvbiBfYWRqdXN0QXJlYUhlaWdodCgpIHtcbiAgICB0aGlzLmVsLnN0eWxlLmhlaWdodCA9IDA7XG5cbiAgICB2YXIgbmV3SGVpZ2h0ID0gdGhpcy5lbC5zY3JvbGxIZWlnaHRcbiAgICAgICAgLCBtaW5IZWlnaHQgPSB0aGlzLl9hdXRvcmVzaXplT3B0aW9ucy5taW5IZWlnaHRcbiAgICAgICAgLCBtYXhIZWlnaHQgPSB0aGlzLl9hdXRvcmVzaXplT3B0aW9ucy5tYXhIZWlnaHQ7XG5cbiAgICBuZXdIZWlnaHQgPSBuZXdIZWlnaHQgPj0gbWF4SGVpZ2h0XG4gICAgICAgICAgICAgICAgPyBtYXhIZWlnaHRcbiAgICAgICAgICAgICAgICA6IG5ld0hlaWdodCA8PSBtaW5IZWlnaHRcbiAgICAgICAgICAgICAgICA/IG1pbkhlaWdodFxuICAgICAgICAgICAgICAgIDogbmV3SGVpZ2h0O1xuXG4gICAgdGhpcy5lbC5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyAncHgnO1xufVxuXG5cbmZ1bmN0aW9uIE1MVGV4dGFyZWEkc3RvcEF1dG9yZXNpemUoKSB7XG4gICAgaWYgKCEgdGhpcy5fYXV0b3Jlc2l6ZSlcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTFRleHRhcmVhIHN0b3BBdXRvcmVzaXplOiBhdXRvcmVzaXplIGlzIG5vdCBvbicpO1xuICAgIHRoaXMuX2F1dG9yZXNpemUgPSBmYWxzZTtcbiAgICBfbWFuYWdlU3Vic2NyaXB0aW9ucy5jYWxsKHRoaXMsICdvZmYnKTtcbn1cblxuXG5mdW5jdGlvbiBNTFRleHRhcmVhJGlzQXV0b3Jlc2l6ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9yZXNpemU7XG59XG5cblxuZnVuY3Rpb24gTUxUZXh0YXJlYSRkaXNhYmxlKGRpc2FibGUpIHtcbiAgICB0aGlzLmVsLmRpc2FibGVkID0gZGlzYWJsZTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTFRpbWUgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MVGltZScsIHtcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB7XG4gICAgICAgIGdldDogTUxUaW1lX2dldCxcbiAgICAgICAgc2V0OiBNTFRpbWVfc2V0LFxuICAgICAgICBkZWw6IE1MVGltZV9kZWwsXG4gICAgfSxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtdWktdGltZSdcbiAgICB9XG59KTtcblxuY29tcG9uZW50c1JlZ2lzdHJ5LmFkZChNTFRpbWUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MVGltZTtcblxuXG52YXIgVElNRV9SRUdFWCA9IC9eKFswLTldezEsMn0pKD86XFw6fFxcLikoWzAtOV17MSwyfSkkL1xuICAgICwgVElNRV9URU1QTEFURSA9ICdoaDptbSc7XG5cbmZ1bmN0aW9uIE1MVGltZV9nZXQoKSB7XG4gICAgdmFyIHRpbWVTdHIgPSB0aGlzLmVsLnZhbHVlO1xuICAgIHZhciBtYXRjaCA9IHRpbWVTdHIubWF0Y2goVElNRV9SRUdFWCk7XG4gICAgaWYgKCEgbWF0Y2gpIHJldHVybjtcbiAgICB2YXIgaG91cnMgPSBtYXRjaFsxXVxuICAgICAgICAsIG1pbnMgPSBtYXRjaFsyXTtcbiAgICBpZiAoaG91cnMgPiAyMyB8fCBtaW5zID4gNTkpIHJldHVybjtcbiAgICB2YXIgdGltZSA9IG5ldyBEYXRlKDE5NzAsIDAsIDEsIGhvdXJzLCBtaW5zKTtcblxuICAgIHJldHVybiBfLnRvRGF0ZSh0aW1lKTtcbn1cblxuXG5mdW5jdGlvbiBNTFRpbWVfc2V0KHZhbHVlKSB7XG4gICAgdmFyIHRpbWUgPSBfLnRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCEgdGltZSkge1xuICAgICAgICB0aGlzLmVsLnZhbHVlID0gJyc7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGltZVN0ciA9IFRJTUVfVEVNUExBVEVcbiAgICAgICAgICAgIC5yZXBsYWNlKCdoaCcsIHBhZCh0aW1lLmdldEhvdXJzKCkpKVxuICAgICAgICAgICAgLnJlcGxhY2UoJ21tJywgcGFkKHRpbWUuZ2V0TWludXRlcygpKSk7XG5cbiAgICB0aGlzLmVsLnZhbHVlID0gdGltZVN0cjtcbiAgICByZXR1cm4gdGltZVN0cjtcblxuICAgIGZ1bmN0aW9uIHBhZChuKSB7cmV0dXJuIG4gPCAxMCA/ICcwJyArIG4gOiBuOyB9XG59XG5cblxuZnVuY3Rpb24gTUxUaW1lX2RlbCgpIHtcbiAgICB0aGlzLmVsLnZhbHVlID0gJyc7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzO1xuXG5cbnZhciBNTFdyYXBwZXIgPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MV3JhcHBlcicsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogJ21sLXVpLXdyYXBwZXInXG4gICAgfVxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxXcmFwcGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTFdyYXBwZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxuXG52YXIgQUxFUlRfQ1NTX0NMQVNTRVMgPSB7XG4gICAgc3VjY2VzczogJ2FsZXJ0LXN1Y2Nlc3MnLFxuICAgIHdhcm5pbmc6ICdhbGVydC13YXJuaW5nJyxcbiAgICBpbmZvOiAnYWxlcnQtaW5mbycsXG4gICAgZGFuZ2VyOiAnYWxlcnQtZGFuZ2VyJyxcbiAgICBmaXhlZDogJ2FsZXJ0LWZpeGVkJ1xufTtcblxuXG52YXIgTUxBbGVydCA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxBbGVydCcsIHtcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiBbJ21sLWJzLWFsZXJ0JywgJ2FsZXJ0JywgJ2ZhZGUnXSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgJ3JvbGUnOiAnYWxlcnQnLFxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnXFxcbiAgICAgICAgICAgIHt7PyBpdC5jbG9zZSB9fVxcXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiW2V2ZW50c106Y2xvc2VCdG5cIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvYnV0dG9uPlxcXG4gICAgICAgICAgICB7ez99fVxcXG4gICAgICAgICAgICB7ez0gaXQubWVzc2FnZX19J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MQWxlcnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MQWxlcnQ7XG5cblxuXy5leHRlbmQoTUxBbGVydCwge1xuICAgIGNyZWF0ZUFsZXJ0OiBNTEFsZXJ0JCRjcmVhdGVBbGVydCxcbiAgICBvcGVuQWxlcnQ6IE1MQWxlcnQkJG9wZW5BbGVydCxcbn0pO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxBbGVydCwge1xuICAgIG9wZW5BbGVydDogTUxBbGVydCRvcGVuQWxlcnQsXG4gICAgY2xvc2VBbGVydDogTUxBbGVydCRjbG9zZUFsZXJ0XG59KTtcblxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBuZXcgYWxlcnQgaW5zdGFuY2UuIFRvIGNyZWF0ZSBhbmQgb3BlbiBhdCB0aGUgc2FtZSB0aW1lIHVzZSBbb3BlbkFsZXJ0XSgjTUxBbGVydCQkb3BlbkFsZXJ0KVxuICogYG9wdGlvbnNgIGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgICAgIG1lc3NhZ2U6IHN0cmluZyBhbGVydCBtZXNzYWdlXG4gKiAgICAgIHR5cGU6ICAgIG9wdGlvbmFsIHN0cmluZyB0aGUgdHlwZSBvZiBhbGVydCBtZXNzYWdlLCBvbmUgb2Ygc3VjY2Vzcywgd2FybmluZywgaW5mbywgZGFuZ2VyLCBmaXhlZFxuICogICAgICAgICAgICAgICBkZWZhdWx0ICdpbmZvJ1xuICogICAgICBjbG9zZTogICBvcHRpb25hbCBmYWxzZSB0byBwcmV2ZW50IHVzZXIgZnJvbSBjbG9zaW5nXG4gKiAgICAgICAgICAgICAgIG9yIHRydWUgKGRlZmF1bHQpIHRvIGVuYWJsZSBjbG9zaW5nIGFuZCByZW5kZXIgYSBjbG9zZSBidXR0b25cbiAqICAgICAgdGltZW91dDogb3B0aW9uYWwgdGltZXIsIGluIG1pbGxpc2Vjb25kcyB0byBhdXRvbWF0aWNhbGx5IGNsb3NlIHRoZSBhbGVydFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIGFsZXJ0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZnVuY3Rpb24gTUxBbGVydCQkY3JlYXRlQWxlcnQob3B0aW9ucykge1xuICAgIGNoZWNrKG9wdGlvbnMsIHtcbiAgICAgICAgbWVzc2FnZTogU3RyaW5nLFxuICAgICAgICB0eXBlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBjbG9zZTogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgIHRpbWVvdXQ6IE1hdGNoLk9wdGlvbmFsKE51bWJlcilcbiAgICB9KTtcblxuICAgIHZhciBhbGVydCA9IE1MQWxlcnQuY3JlYXRlT25FbGVtZW50KCk7XG5cbiAgICBvcHRpb25zID0gX3ByZXBhcmVPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgdmFyIGFsZXJ0Q2xzID0gQUxFUlRfQ1NTX0NMQVNTRVNbb3B0aW9ucy50eXBlXTtcbiAgICBhbGVydC5kb20uYWRkQ3NzQ2xhc3NlcyhhbGVydENscyk7XG5cbiAgICBhbGVydC5fYWxlcnQgPSB7XG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcblxuICAgIGFsZXJ0LnRlbXBsYXRlLnJlbmRlcihvcHRpb25zKS5iaW5kZXIoKTtcblxuICAgIHZhciBhbGVydFNjb3BlID0gYWxlcnQuY29udGFpbmVyLnNjb3BlO1xuXG4gICAgaWYgKG9wdGlvbnMuY2xvc2UpXG4gICAgICAgIGFsZXJ0U2NvcGUuY2xvc2VCdG4uZXZlbnRzLm9uKCdjbGljaycsXG4gICAgICAgICAgICB7IHN1YnNjcmliZXI6IF9vbkNsb3NlQnRuQ2xpY2ssIGNvbnRleHQ6IGFsZXJ0IH0pO1xuXG4gICAgaWYgKG9wdGlvbnMudGltZW91dClcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoYWxlcnQuX2FsZXJ0LnZpc2libGUpXG4gICAgICAgICAgICAgICAgYWxlcnQuY2xvc2VBbGVydCgpO1xuICAgICAgICB9LCBvcHRpb25zLnRpbWVvdXQpO1xuXG4gICAgcmV0dXJuIGFsZXJ0O1xufVxuXG5cbi8qKlxuICogQ3JlYXRlIGFuZCBzaG93IGFsZXJ0IHBvcHVwXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0IHdpdGggbWVzc2FnZSwgdHlwZSwgY2xvc2UgYW5kIHRpbWVvdXRcbiAqIEByZXR1cm4ge01MQWxlcnR9IHRoZSBhbGVydCBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JCRvcGVuQWxlcnQob3B0aW9ucykge1xuICAgIHZhciBhbGVydCA9IE1MQWxlcnQuY3JlYXRlQWxlcnQob3B0aW9ucyk7XG4gICAgYWxlcnQub3BlbkFsZXJ0KCk7XG4gICAgcmV0dXJuIGFsZXJ0O1xufVxuXG5cbmZ1bmN0aW9uIF9vbkNsb3NlQnRuQ2xpY2sodHlwZSwgZXZlbnQpIHtcbiAgICB0aGlzLmNsb3NlQWxlcnQoKTtcbn1cblxuXG5mdW5jdGlvbiBfcHJlcGFyZU9wdGlvbnMob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBfLmNsb25lKG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuY2xvc2UgPSB0eXBlb2Ygb3B0aW9ucy5jbG9zZSA9PSAndW5kZWZpbmVkJyB8fCBvcHRpb25zLmNsb3NlID09PSB0cnVlO1xuICAgIG9wdGlvbnMudGltZW91dCA9IE1hdGguZmxvb3Iob3B0aW9ucy50aW1lb3V0KTtcbiAgICBvcHRpb25zLnR5cGUgPSBvcHRpb25zLnR5cGUgfHwgJ2luZm8nO1xuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59XG5cblxuLyoqXG4gKiBPcGVuIHRoZSBhbGVydFxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JG9wZW5BbGVydCgpIHtcbiAgICBfdG9nZ2xlQWxlcnQuY2FsbCh0aGlzLCB0cnVlKTtcbn1cblxuXG4vKipcbiAqIENsb3NlIHRoZSBhbGVydFxuICovXG5mdW5jdGlvbiBNTEFsZXJ0JGNsb3NlQWxlcnQoKSB7XG4gICAgX3RvZ2dsZUFsZXJ0LmNhbGwodGhpcywgZmFsc2UpO1xuICAgIHRoaXMuZGVzdHJveSgpO1xufVxuXG5cbmZ1bmN0aW9uIF90b2dnbGVBbGVydChkb1Nob3cpIHtcbiAgICBkb1Nob3cgPSB0eXBlb2YgZG9TaG93ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgPyAhIHRoaXMuX2FsZXJ0LnZpc2libGVcbiAgICAgICAgICAgICAgICA6ICEhIGRvU2hvdztcblxuICAgIHZhciBhZGRSZW1vdmUgPSBkb1Nob3cgPyAnYWRkJyA6ICdyZW1vdmUnXG4gICAgICAgICwgYXBwZW5kUmVtb3ZlID0gZG9TaG93ID8gJ2FwcGVuZENoaWxkJyA6ICdyZW1vdmVDaGlsZCc7XG5cbiAgICB0aGlzLl9hbGVydC52aXNpYmxlID0gZG9TaG93O1xuXG4gICAgZG9jdW1lbnQuYm9keVthcHBlbmRSZW1vdmVdKHRoaXMuZWwpO1xuICAgIHRoaXMuZG9tLnRvZ2dsZShkb1Nob3cpO1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFkb1Nob3cpO1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0W2FkZFJlbW92ZV0oJ2luJyk7XG4gICAgdGhpcy5lbFtkb1Nob3cgPyAnZm9jdXMnIDogJ2JsdXInXSgpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gbWlsby5Db21wb25lbnRcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgY29tcG9uZW50TmFtZSA9IG1pbG8udXRpbC5jb21wb25lbnROYW1lXG4gICAgLCBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyXG4gICAgLCBjaGVjayA9IG1pbG8udXRpbC5jaGVja1xuICAgICwgTWF0Y2ggPSBjaGVjay5NYXRjaDtcblxuXG52YXIgREVGQVVMVF9CVVRUT05TID0gWyB7IHR5cGU6ICdkZWZhdWx0JywgbGFiZWw6ICdPSycsIHJlc3VsdDogJ09LJyB9IF07XG5cbnZhciBDTE9TRV9PUFRJT05TID0gWydiYWNrZHJvcCcsICdrZXlib2FyZCcsICdidXR0b24nXTtcblxuLyogVE9ETyAtIHVzZSBpbiB0ZW1wbGF0ZVxudmFyIEJVVFRPTl9DU1NfQ0xBU1NFUyA9IHtcbiAgICBkZWZhdWx0OiAnYnRuLWRlZmF1bHQnLFxuICAgIHByaW1hcnk6ICdidG4tcHJpbWFyeScsXG4gICAgc3VjY2VzczogJ2J0bi1zdWNjZXNzJyxcbiAgICBpbmZvOiAnYnRuLWluZm8nLFxuICAgIHdhcm5pbmc6ICdidG4td2FybmluZycsXG4gICAgZGFuZ2VyOiAnYnRuLWRhbmdlcicsXG4gICAgbGluazogJ2J0bi1saW5rJ1xufTtcbi8vKi9cblxuLyoqXG4gKiBEaWFsb2cgY2xhc3MgdG8gc2hvdyBjdXN0b20gZGlhbG9nIGJveGVzIGJhc2VkIG9uIGNvbmZpZ3VyYXRpb24gLSBzZWUgW2NyZWF0ZURpYWxvZ10oI01MRGlhbG9nJCRjcmVhdGVEaWFsb2cpIG1ldGhvZC5cbiAqIE9ubHkgb25lIGRpYWxvZyBjYW4gYmUgb3BlbmVkIGF0IGEgdGltZSAtIHRyeWluZyB0byBvcGVuIGFub3RoZXIgd2lsbCBsb2cgZXJyb3IgdG8gY29uc29sZS4gQ3VycmVudGx5IG9wZW5lZCBkaWFsb2cgY2FuIGJlIHJldHJpZXZlZCB1c2luZyBbZ2V0Q3VycmVudERpYWxvZ10oI01MRGlhbG9nJCRnZXRDdXJyZW50RGlhbG9nKSBjbGFzcyBtZXRob2QuXG4gKi9cbnZhciBNTERpYWxvZyA9IENvbXBvbmVudC5jcmVhdGVDb21wb25lbnRDbGFzcygnTUxEaWFsb2cnLCB7XG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgZG9tOiB7XG4gICAgICAgIGNsczogWydtbC1icy1kaWFsb2cnLCAnbW9kYWwnLCAnZmFkZSddLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAncm9sZSc6ICdkaWFsb2cnLFxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIHRlbXBsYXRlOiAnXFxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1kaWFsb2cge3s9IGl0LmNzc0NsYXNzIH19XCI+XFxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxcXG4gICAgICAgICAgICAgICAgICAgIHt7PyBpdC50aXRsZSB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez8gaXQuY2xvc2UuYnV0dG9uIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBtbC1iaW5kPVwiW2V2ZW50c106Y2xvc2VCdG5cIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiPiZ0aW1lczs8L2J1dHRvbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJtb2RhbC10aXRsZVwiPnt7PSBpdC50aXRsZSB9fTwvaDQ+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAge3s/IGl0Lmh0bWwgfHwgaXQudGV4dCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtYm9keVwiIG1sLWJpbmQ9XCJbY29udGFpbmVyXTpkaWFsb2dCb2R5XCI+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez8gaXQuaHRtbCB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7PSBpdC5odG1sIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ez8/fX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD57ez0gaXQudGV4dCB9fTwvcD5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICAgICAge3s/IGl0LmJ1dHRvbnMgJiYgaXQuYnV0dG9ucy5sZW5ndGggfX1cXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWZvb3RlclwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3t+IGl0LmJ1dHRvbnMgOmJ0biB9fVxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYnRuIGJ0bi17ez0gYnRuLnR5cGUgfX17ez8gYnRuLmNscyB9fSB7ez0gYnRuLmNscyB9fXt7P319XCJcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWwtYmluZD1cIltldmVudHNdOnt7PSBidG4ubmFtZSB9fVwiPnt7PSBidG4ubGFiZWwgfX08L2J1dHRvbj5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7fn19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICAgICAgICAgICAgIHt7P319XFxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgPC9kaXY+J1xuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MRGlhbG9nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTERpYWxvZztcblxuXG5fLmV4dGVuZChNTERpYWxvZywge1xuICAgIGNyZWF0ZURpYWxvZzogTUxEaWFsb2ckJGNyZWF0ZURpYWxvZyxcbiAgICBvcGVuRGlhbG9nOiBNTERpYWxvZyQkb3BlbkRpYWxvZyxcbiAgICBnZXRPcGVuZWREaWFsb2c6IE1MRGlhbG9nJCRnZXRPcGVuZWREaWFsb2dcbn0pO1xuXG5cbl8uZXh0ZW5kUHJvdG8oTUxEaWFsb2csIHtcbiAgICBvcGVuRGlhbG9nOiBNTERpYWxvZyRvcGVuRGlhbG9nLFxuICAgIGNsb3NlRGlhbG9nOiBNTERpYWxvZyRjbG9zZURpYWxvZyxcbiAgICBkZXN0cm95OiBNTERpYWxvZyRkZXN0cm95XG59KTtcblxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIHJldHVybnMgZGlhbG9nIGluc3RhbmNlLiBUbyBjcmVhdGUgYW5kIG9wZW4gYXQgdGhlIHNhbWUgdGltZSBbb3BlbkRpYWxvZ10oI01MRGlhbG9nJCRvcGVuRGlhbG9nKVxuICogYG9wdGlvbnNgIGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgICAgdGl0bGU6IG9wdGlvbmFsIGRpYWxvZyB0aXRsZVxuICogICAgIGh0bWw6IG9wdGlvbmFsIGRpYWxvZyB0ZXh0IGFzIGh0bWwgKHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGV4dCBpZiBib3RoIHRleHQgbmQgaHRtbCBhcmUgcGFzc2VkKVxuICogICAgICAgb3JcbiAqICAgICB0ZXh0OiBvcHRpb25hbCBkaWFsb2cgdGV4dFxuICogICAgIGNsb3NlOiBvcHRpb25hbCBmYWxzZSB0byBwcmV2ZW50IGJhY2tkcm9wIGFuZCBlc2Mga2V5IGZyb20gY2xvc2luZyB0aGUgZGlhbG9nIGFuZCByZW1vdmluZyBjbG9zZSBidXR0b24gaW4gdG9wIHJpZ2h0IGNvcm5lclxuICogICAgICAgICAgICBvciB0cnVlIChkZWZhdWx0KSB0byBlbmFibGUgYWxsIGNsb3NlIG9wdGlvbnNcbiAqICAgICAgICAgICAgb3Igb2JqZWN0IHdpdGggcHJvcGVydGllc1xuICogICAgICAgICBiYWNrZHJvcDogZmFsc2Ugb3IgdHJ1ZSAoZGVmYXVsdCksIGNsb3NlIGRpYWxvZyB3aGVuIGJhY2tkcm9wIGNsaWNrZWRcbiAqICAgICAgICAga2V5Ym9hcmQ6IGZhbHNlIG9yIHRydWUgKGRlZmF1bHQpLCBjbG9zZSBkaWFsb2cgd2hlbiBlc2Mga2V5IGlzIHByZXNzZWRcbiAqICAgICAgICAgYnV0dG9uOiBmYWxzZSBvciB0cnVlIChkZWZhdWx0KSwgc2hvdyBjbG9zZSBidXR0b24gaW4gdGhlIGhlYWRlciAod29uJ3QgYmUgc2hvd24gaWYgdGhlcmUgaXMgbm8gaGVhZGVyIHdoZW4gdGl0bGUgaXMgbm90IHBhc3NlZClcbiAqICAgICBidXR0b25zOiBvcHRpb25hbCBhcnJheSBvZiBidXR0b25zIGNvbmZpZ3VyYXRpb25zLCB3aGVyZSBlYWNoIGJ1dHRvbiBjb25maWcgaXMgYW4gb2JqZWN0XG4gKiAgICAgICAgIG5hbWU6ICAgb3B0aW9uYWwgbmFtZSBvZiBjb21wb25lbnQsIHNob3VsZCBiZSB1bmlxdWUgYW5kIHNob3VsZCBub3QgYmUgYGNsb3NlQnRuYCwgaWYgbm90IHBhc3NlZCBhIHRpbWVzdGFtcCBiYXNlZCBuYW1lIHdpbGwgYmUgdXNlZFxuICogICAgICAgICB0eXBlOiAgIGJ1dHRvbiB0eXBlLCB3aWxsIGRldGVybWluZSBidXR0b24gQ1NTIHN0eWxlLiBQb3NzaWJsZSB0eXBlcyBhcmU6IGRlZnVsdCwgcHJpbWFyeSwgc3VjY2VzcywgaW5mbywgd2FybmluZywgZGFuZ2VyLCBsaW5rIChtYXAgdG8gcmVsYXRlZCBib290c3RyYXAgYnV0dG9uIHN0eWxlcylcbiAqICAgICAgICAgbGFiZWw6ICBidXR0b24gbGFiZWxcbiAqICAgICAgICAgY2xvc2U6ICBvcHRpb25hbCBmYWxzZSB0byBwcmV2ZW50IHRoaXMgYnV0dG9uIGZyb20gY2xvc2luZyBkaWFsb2dcbiAqICAgICAgICAgcmVzdWx0OiBzdHJpbmcgd2l0aCBkaWFsb2cgY2xvc2UgcmVzdWx0IHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gZGlhbG9nIHN1YnNjcmliZXIgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuICogICAgICAgICBkYXRhOiAgIGFueSB2YWx1ZS9vYmplY3Qgb3IgZnVuY3Rpb24gdG8gY3JlYXRlIGRhdGEgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byBkaWFsb2cgc3Vic2NyaWJlciBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlci5cbiAqICAgICAgICAgICAgICAgICBJZiBmdW5jdGlvbiBpcyBwYXNzZWQgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCBkaWFsb2cgYXMgY29udGV4dCBhbmQgYnV0dG9uIG9wdGlvbnMgYXMgcGFyYW1ldGVyLlxuICpcbiAqICAgICBJZiBgdGl0bGVgIGlzIG5vdCBwYXNzZWQsIGRpYWxvZyB3aWxsIG5vdCBoYXZlIHRpdGxlIHNlY3Rpb25cbiAqICAgICBJZiBuZWl0aGVyIGB0ZXh0YCBub3IgYGh0bWxgIGlzIHBhc3NlZCwgZGlhbG9nIHdpbGwgbm90IGhhdmUgYm9keSBzZWN0aW9uLlxuICogICAgIElmIGBidXR0b25zYCBhcmUgbm90IHBhc3NlZCwgdGhlcmUgd2lsbCBvbmx5IGJlIE9LIGJ1dHRvbi5cbiAqXG4gKiBXaGVuIGRpYWxvZyBpcyBjbG9zZWQsIHRoZSBzdWJzY3JpYmVyIGlzIGNhbGxlZCB3aXRoIHJlYXVsdCBhbmQgb3B0aW9uYWwgZGF0YSBhcyBkZWZpbmVkIGluIGJ1dHRvbnMgY29uZmlndXJhdGlvbnMuXG4gKiBJZiBiYWNrZHJvcCBpcyBjbGlja2VkIG9yIEVTQyBrZXkgaXMgcHJlc3NlZCB0aGUgcmVzdWx0IHdpbGwgYmUgJ2Rpc21pc3NlZCdcbiAqIElmIGNsb3NlIGJ1dHRvbiBpbiB0aGUgdG9wIHJpZ2h0IGNvcm5lciBpcyBjbGlja2VkLCB0aGUgcmVzdWx0IHdpbGwgYmUgJ2Nsb3NlZCcgKGRlZmF1bHQgcmVzdWx0KVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIGRpYWxvZyBjb25maWd1cmF0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpbml0aWFsaXplIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHRvIGluaXRpYWxpemUgdGhlIGRpYWxvZ1xuICovXG5mdW5jdGlvbiBNTERpYWxvZyQkY3JlYXRlRGlhbG9nKG9wdGlvbnMsIGluaXRpYWxpemUpIHtcbiAgICBjaGVjayhvcHRpb25zLCB7XG4gICAgICAgIHRpdGxlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBodG1sOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICB0ZXh0OiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBjbG9zZTogTWF0Y2guT3B0aW9uYWwoTWF0Y2guT25lT2YoQm9vbGVhbiwge1xuICAgICAgICAgICAgYmFja2Ryb3A6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgICAgICAga2V5Ym9hcmQ6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgICAgICAgYnV0dG9uOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKVxuICAgICAgICB9KSksXG4gICAgICAgIGJ1dHRvbnM6IE1hdGNoLk9wdGlvbmFsKFsge1xuICAgICAgICAgICAgbmFtZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgICAgIGxhYmVsOiBTdHJpbmcsXG4gICAgICAgICAgICBjbG9zZTogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgICAgICByZXN1bHQ6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgICAgICBkYXRhOiBNYXRjaC5PcHRpb25hbChNYXRjaC5BbnkpLFxuICAgICAgICAgICAgY2xzOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpXG4gICAgICAgIH0gXSksXG4gICAgICAgIGNzc0NsYXNzOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpXG4gICAgfSk7XG5cbiAgICB2YXIgZGlhbG9nID0gTUxEaWFsb2cuY3JlYXRlT25FbGVtZW50KCk7XG5cbiAgICBvcHRpb25zID0gX3ByZXBhcmVPcHRpb25zKG9wdGlvbnMpO1xuICAgIGRpYWxvZy5fZGlhbG9nID0ge1xuICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG5cbiAgICBkaWFsb2cudGVtcGxhdGVcbiAgICAgICAgLnJlbmRlcihvcHRpb25zKVxuICAgICAgICAuYmluZGVyKCk7XG5cbiAgICB2YXIgZGlhbG9nU2NvcGUgPSBkaWFsb2cuY29udGFpbmVyLnNjb3BlO1xuXG4gICAgaWYgKG9wdGlvbnMuY2xvc2UuYmFja2Ryb3ApXG4gICAgICAgIGRpYWxvZy5ldmVudHMub24oJ2NsaWNrJyxcbiAgICAgICAgICAgIHsgc3Vic2NyaWJlcjogX29uQmFja2Ryb3BDbGljaywgY29udGV4dDogZGlhbG9nIH0pO1xuXG4gICAgaWYgKG9wdGlvbnMudGl0bGUgJiYgb3B0aW9ucy5jbG9zZS5idXR0b24pXG4gICAgICAgIGRpYWxvZ1Njb3BlLmNsb3NlQnRuLmV2ZW50cy5vbignY2xpY2snLFxuICAgICAgICAgICAgeyBzdWJzY3JpYmVyOiBfb25DbG9zZUJ0bkNsaWNrLCBjb250ZXh0OiBkaWFsb2cgfSk7XG5cbiAgICBvcHRpb25zLmJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbihidG4pIHtcbiAgICAgICAgdmFyIGJ1dHRvblN1YnNjcmliZXIgPSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyOiBfLnBhcnRpYWwoX2RpYWxvZ0J1dHRvbkNsaWNrLCBidG4pLFxuICAgICAgICAgICAgY29udGV4dDogZGlhbG9nXG4gICAgICAgIH07XG4gICAgICAgIGRpYWxvZ1Njb3BlW2J0bi5uYW1lXS5ldmVudHMub24oJ2NsaWNrJywgYnV0dG9uU3Vic2NyaWJlcik7XG4gICAgfSk7XG5cbiAgICBpZiAoaW5pdGlhbGl6ZSkgaW5pdGlhbGl6ZShkaWFsb2cpO1xuICAgIHJldHVybiBkaWFsb2c7XG59XG5cblxuZnVuY3Rpb24gX2RpYWxvZ0J1dHRvbkNsaWNrKGJ1dHRvbikge1xuICAgIGlmIChidXR0b24uY2xvc2UgIT09IGZhbHNlKVxuICAgICAgICBfdG9nZ2xlRGlhbG9nLmNhbGwodGhpcywgZmFsc2UpO1xuXG4gICAgdmFyIGRhdGEgPSBfLnJlc3VsdChidXR0b24uZGF0YSwgdGhpcywgYnV0dG9uKTtcbiAgICBfZGlzcGF0Y2hSZXN1bHQuY2FsbCh0aGlzLCBidXR0b24ucmVzdWx0LCBkYXRhKTtcbn1cblxuXG5mdW5jdGlvbiBfZGlzcGF0Y2hSZXN1bHQocmVzdWx0LCBkYXRhKSB7XG4gICAgdmFyIHN1YnNjcmliZXIgPSB0aGlzLl9kaWFsb2cuc3Vic2NyaWJlcjtcbiAgICBpZiAodHlwZW9mIHN1YnNjcmliZXIgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgc3Vic2NyaWJlci5jYWxsKHRoaXMsIHJlc3VsdCwgZGF0YSk7XG4gICAgZWxzZVxuICAgICAgICBzdWJzY3JpYmVyLnN1YnNjcmliZXIuY2FsbChzdWJzY3JpYmVyLmNvbnRleHQsIHJlc3VsdCwgZGF0YSk7XG59XG5cblxuZnVuY3Rpb24gX29uQmFja2Ryb3BDbGljayhldmVudFR5cGUsIGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldCA9PSB0aGlzLmVsKVxuICAgICAgICB0aGlzLmNsb3NlRGlhbG9nKCdkaXNtaXNzZWQnKTtcbn1cblxuXG5mdW5jdGlvbiBfb25DbG9zZUJ0bkNsaWNrKCkge1xuICAgIHRoaXMuY2xvc2VEaWFsb2coJ2Nsb3NlZCcpO1xufVxuXG5cbmZ1bmN0aW9uIF9vbktleURvd24oZXZlbnQpIHtcbiAgICBpZiAob3BlbmVkRGlhbG9nXG4gICAgICAgICAgICAmJiBvcGVuZWREaWFsb2cuX2RpYWxvZy5vcHRpb25zLmNsb3NlLmtleWJvYXJkXG4gICAgICAgICAgICAmJiBldmVudC5rZXlDb2RlID09IDI3KSAvLyBlc2Mga2V5XG4gICAgICAgIG9wZW5lZERpYWxvZy5jbG9zZURpYWxvZygnZGlzbWlzc2VkJyk7XG59XG5cblxuZnVuY3Rpb24gX3ByZXBhcmVPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gXy5jbG9uZShvcHRpb25zKTtcbiAgICBvcHRpb25zLmJ1dHRvbnMgPSBfLmNsb25lKG9wdGlvbnMuYnV0dG9ucyB8fCBERUZBVUxUX0JVVFRPTlMpO1xuICAgIG9wdGlvbnMuYnV0dG9ucy5mb3JFYWNoKGZ1bmN0aW9uKGJ0bikge1xuICAgICAgICBidG4ubmFtZSA9IGJ0bi5uYW1lIHx8IGNvbXBvbmVudE5hbWUoKTtcbiAgICB9KTtcblxuICAgIG9wdGlvbnMuY2xvc2UgPSB0eXBlb2Ygb3B0aW9ucy5jbG9zZSA9PSAndW5kZWZpbmVkJyB8fCBvcHRpb25zLmNsb3NlID09PSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IF8ub2JqZWN0KENMT1NFX09QVElPTlMsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHR5cGVvZiBvcHRpb25zLmNsb3NlID09ICdvYmplY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfLm1hcFRvT2JqZWN0KENMT1NFX09QVElPTlMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG9wdCkgeyByZXR1cm4gb3B0aW9ucy5jbG9zZVtvcHRdICE9PSBmYWxzZTsgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF8ub2JqZWN0KENMT1NFX09QVElPTlMsIGZhbHNlKTtcblxuICAgIHJldHVybiBvcHRpb25zO1xufVxuXG5cbi8qKlxuICogQ3JlYXRlIGFuZCBzaG93IGRpYWxvZyBwb3B1cFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIG9iamVjdCB3aXRoIHRpdGxlLCB0ZXh0IGFuZCBidXR0b25zLiBTZWUgW2NyZWF0ZURpYWxvZ10oI01MRGlhbG9nJCRjcmVhdGVEaWFsb2cpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IHN1YnNjcmliZXIgb3B0aW9uYWwgc3Vic2NyaWJlciBmdW5jdGlvbiBvciBvYmplY3QgdGhhdCBpcyBwYXNzZWQgcmVzdWx0IGFuZCBvcHRpb25hbCBkYXRhLiBVbmxlc3MgY29udGV4dCBpcyBkZWZpbmVkLCBkaWFsb2cgd2lsbCBiZSB0aGUgY29udGV4dC5cbiAqL1xuZnVuY3Rpb24gTUxEaWFsb2ckJG9wZW5EaWFsb2cob3B0aW9ucywgc3Vic2NyaWJlciwgaW5pdGlhbGl6ZSkge1xuICAgIHZhciBkaWFsb2cgPSBNTERpYWxvZy5jcmVhdGVEaWFsb2cob3B0aW9ucywgaW5pdGlhbGl6ZSk7XG4gICAgZGlhbG9nLm9wZW5EaWFsb2coc3Vic2NyaWJlcik7XG4gICAgcmV0dXJuIGRpYWxvZztcbn1cblxuXG5cbmZ1bmN0aW9uIF90b2dnbGVEaWFsb2coZG9TaG93KSB7XG4gICAgZG9TaG93ID0gdHlwZW9mIGRvU2hvdyA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgID8gISB0aGlzLl9kaWFsb2cudmlzaWJsZVxuICAgICAgICAgICAgICAgIDogISEgZG9TaG93O1xuXG4gICAgdmFyIGFkZFJlbW92ZSA9IGRvU2hvdyA/ICdhZGQnIDogJ3JlbW92ZSdcbiAgICAgICAgLCBhcHBlbmRSZW1vdmUgPSBkb1Nob3cgPyAnYXBwZW5kQ2hpbGQnIDogJ3JlbW92ZUNoaWxkJztcblxuICAgIHRoaXMuX2RpYWxvZy52aXNpYmxlID0gZG9TaG93O1xuXG4gICAgaWYgKGRvU2hvdyAmJiAhIGRpYWxvZ3NJbml0aWFsaXplZClcbiAgICAgICAgX2luaXRpYWxpemVEaWFsb2dzKCk7XG5cbiAgICBkb2N1bWVudC5ib2R5W2FwcGVuZFJlbW92ZV0odGhpcy5lbCk7XG4gICAgaWYgKGJhY2tkcm9wRWwpXG4gICAgICAgIGRvY3VtZW50LmJvZHlbYXBwZW5kUmVtb3ZlXShiYWNrZHJvcEVsKTtcbiAgICB0aGlzLmRvbS50b2dnbGUoZG9TaG93KTtcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAhZG9TaG93KTtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdFthZGRSZW1vdmVdKCdtb2RhbC1vcGVuJyk7XG4gICAgdGhpcy5lbC5jbGFzc0xpc3RbYWRkUmVtb3ZlXSgnaW4nKTtcblxuICAgIG9wZW5lZERpYWxvZyA9IGRvU2hvdyA/IHRoaXMgOiB1bmRlZmluZWQ7XG4gICAgdGhpcy5lbFtkb1Nob3cgPyAnZm9jdXMnIDogJ2JsdXInXSgpO1xufVxuXG5cbnZhciBkaWFsb2dzSW5pdGlhbGl6ZWQsIGJhY2tkcm9wRWw7XG5cbmZ1bmN0aW9uIF9pbml0aWFsaXplRGlhbG9ncygpIHtcbiAgICBiYWNrZHJvcEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYmFja2Ryb3BFbC5jbGFzc05hbWUgPSAnbW9kYWwtYmFja2Ryb3AgZmFkZSBpbic7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9vbktleURvd24pO1xuICAgIGRpYWxvZ3NJbml0aWFsaXplZCA9IHRydWU7XG59XG5cblxudmFyIG9wZW5lZERpYWxvZztcblxuLyoqXG4gKiBPcGVucyBkaWFsb2cgaW5zdGFuY2UuXG4gKiBTdWJzY3JpYmVyIG9iamVjdCBzaG91bGQgaGF2ZSB0aGUgc2FtZSBmb3JtYXQgYXMgdGhlIHN1YnNjcmliZXIgZm9yIHRoZSBNZXNzZW5nZXIgKGFsdGhvdWdoIE1lc3NlbmdlciBpcyBub3QgdXNlZCkgLSBlaXRoZXIgZnVuY3Rpb24gb3Igb2JqZWN0IHdpdGggc3Vic2NyaWJlciBhbmQgY29udGV4dCBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBzdWJzY3JpYmVyIHN1YnNjcmliZXIgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIE1MRGlhbG9nJG9wZW5EaWFsb2coc3Vic2NyaWJlcikge1xuICAgIGNoZWNrKHN1YnNjcmliZXIsIE1hdGNoLk9uZU9mKEZ1bmN0aW9uLCB7IHN1YnNjcmliZXI6IEZ1bmN0aW9uLCBjb250ZXh0OiBNYXRjaC5BbnkgfSkpO1xuXG4gICAgaWYgKG9wZW5lZERpYWxvZylcbiAgICAgICAgcmV0dXJuIGxvZ2dlci53YXJuKCdNTERpYWxvZyBvcGVuRGlhbG9nOiBjYW5cXCd0IG9wZW4gZGlhbG9nLCBhbm90aGVyIGRpYWxvZyBpcyBhbHJlYWR5IG9wZW4nKTtcblxuICAgIHRoaXMuX2RpYWxvZy5zdWJzY3JpYmVyID0gc3Vic2NyaWJlcjtcbiAgICBfdG9nZ2xlRGlhbG9nLmNhbGwodGhpcywgdHJ1ZSk7XG59XG5cblxuLyoqXG4gKiBDbG9zZXMgZGlhbG9nIGluc3RhbmNlLCBvcHRpb25hbGx5IHBhc3NpbmcgcmVzdWx0IGFuZCBkYXRhIHRvIGRpYWxvZyBzdWJzY3JpYmVyLlxuICogSWYgbm8gcmVzdWx0IGlzIHBhc3NlZCwgJ2Nsb3NlZCcgd2lsbCBiZSBwYXNzZWQgdG8gc3Vic2NyaWJlci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcmVzdWx0IGRpYWxvZyByZXN1bHQsIHBhc3NlZCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyIHRvIHN1YmNzcmliZXJcbiAqIEBwYXJhbSB7QW55fSBkYXRhIG9wdGlvbmFsIGRpYWxvZyBkYXRhLCBwYXNzZWQgYXMgdGhlIHNlY29uZCBwYXJhbWV0ZXIgdG8gc3Vic2NyaWJlclxuICovXG5mdW5jdGlvbiBNTERpYWxvZyRjbG9zZURpYWxvZyhyZXN1bHQsIGRhdGEpIHtcbiAgICBpZiAoISBvcGVuZWREaWFsb2cpXG4gICAgICAgIHJldHVybiBsb2dnZXIud2FybignTUxEaWFsb2cgY2xvc2VEaWFsb2c6IGNhblxcJ3QgY2xvc2UgZGlhbG9nLCBubyBkaWFsb2cgb3BlbicpO1xuXG4gICAgcmVzdWx0ID0gcmVzdWx0IHx8ICdjbG9zZWQnO1xuXG4gICAgX3RvZ2dsZURpYWxvZy5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICBfZGlzcGF0Y2hSZXN1bHQuY2FsbCh0aGlzLCByZXN1bHQsIGRhdGEpO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBjdXJyZW50bHkgb3BlbmVkIGRpYWxvZ1xuICpcbiAqIEByZXR1cm4ge01MRGlhbG9nfVxuICovXG5mdW5jdGlvbiBNTERpYWxvZyQkZ2V0T3BlbmVkRGlhbG9nKCkge1xuICAgIHJldHVybiBvcGVuZWREaWFsb2c7XG59XG5cblxuZnVuY3Rpb24gTUxEaWFsb2ckZGVzdHJveSgpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX29uS2V5RG93bik7XG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSBtaWxvLkNvbXBvbmVudFxuICAgICwgY29tcG9uZW50c1JlZ2lzdHJ5ID0gbWlsby5yZWdpc3RyeS5jb21wb25lbnRzXG4gICAgLCBsb2dnZXIgPSBtaWxvLnV0aWwubG9nZ2VyXG4gICAgLCBET01MaXN0ZW5lcnMgPSBtaWxvLnV0aWwuZG9tTGlzdGVuZXJzO1xuXG5cbnZhciBUT0dHTEVfQ1NTX0NMQVNTID0gJ2Ryb3Bkb3duLXRvZ2dsZSdcbiAgICAsIE1FTlVfQ1NTX0NMQVNTID0gJ2Ryb3Bkb3duLW1lbnUnO1xuXG5cbnZhciBNTERyb3Bkb3duID0gQ29tcG9uZW50LmNyZWF0ZUNvbXBvbmVudENsYXNzKCdNTERyb3Bkb3duJywge1xuICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgIGRvbToge1xuICAgICAgICBjbHM6IFsnbWwtYnMtZHJvcGRvd24nLCAnZHJvcGRvd24nXVxuICAgIH1cbn0pO1xuXG5jb21wb25lbnRzUmVnaXN0cnkuYWRkKE1MRHJvcGRvd24pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1MRHJvcGRvd247XG5cblxuXy5leHRlbmRQcm90byhNTERyb3Bkb3duLCB7XG4gICAgc3RhcnQ6IE1MRHJvcGRvd24kc3RhcnQsXG4gICAgZGVzdHJveTogTUxEcm9wZG93biRkZXN0cm95LFxuICAgIHRvZ2dsZU1lbnU6IE1MRHJvcGRvd24kdG9nZ2xlTWVudSxcbiAgICBzaG93TWVudTogTUxEcm9wZG93biRzaG93TWVudSxcbiAgICBoaWRlTWVudTogTUxEcm9wZG93biRoaWRlTWVudVxufSk7XG5cblxuZnVuY3Rpb24gTUxEcm9wZG93biRzdGFydCgpIHtcbiAgICB2YXIgdG9nZ2xlRWwgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy4nICsgVE9HR0xFX0NTU19DTEFTUylcbiAgICAgICAgLCBtZW51RWwgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy4nICsgTUVOVV9DU1NfQ0xBU1MpO1xuXG4gICAgaWYgKCEgKHRvZ2dsZUVsICYmIG1lbnVFbCkpXG4gICAgICAgIHJldHVybiBsb2dnZXIuZXJyb3IoJ01MRHJvcGRvd246JywgVE9HR0xFX0NTU19DTEFTUywgJ29yJywgTUVOVV9DU1NfQ0xBU1MsICdpc25cXCd0IGZvdW5kJyk7XG5cbiAgICB2YXIgZG9jID0gd2luZG93LmRvY3VtZW50XG4gICAgICAgICwgY2xpY2tIYW5kbGVyID0gdGhpcy50b2dnbGVNZW51LmJpbmQodGhpcywgdW5kZWZpbmVkKTtcblxuICAgIHZhciBsaXN0ZW5lcnMgPSBuZXcgRE9NTGlzdGVuZXJzO1xuICAgIHRoaXMuX2Ryb3Bkb3duID0ge1xuICAgICAgICBtZW51OiBtZW51RWwsXG4gICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICBsaXN0ZW5lcnM6IGxpc3RlbmVyc1xuICAgIH07XG4gICAgdGhpcy5oaWRlTWVudSgpO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGxpc3RlbmVycy5hZGQodG9nZ2xlRWwsICdjbGljaycsIGNsaWNrSGFuZGxlcik7XG4gICAgLy9tYXliZSBvbmx5IGFkZCB0aGlzIGV2ZW50cyBpZiBpcyBvcGVuP1xuICAgIGxpc3RlbmVycy5hZGQoZG9jLCAnbW91c2VvdXQnLCBvbkRvY091dCk7XG4gICAgbGlzdGVuZXJzLmFkZChkb2MsICdjbGljaycsIG9uQ2xpY2spO1xuXG5cbiAgICBmdW5jdGlvbiBvbkRvY091dChldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0XG4gICAgICAgICAgICAsIHJlbGF0ZWRUYXJnZXQgPSBldmVudC5yZWxhdGVkVGFyZ2V0XG4gICAgICAgICAgICAsIGxpc3RlbmVycyA9IHNlbGYuX2Ryb3Bkb3duLmxpc3RlbmVycztcblxuICAgICAgICBpZiAoaXNJZnJhbWUodGFyZ2V0KSlcbiAgICAgICAgICAgIGxpc3RlbmVycy5yZW1vdmUodGFyZ2V0LmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQsICdjbGljaycsIG9uQ2xpY2spO1xuXG4gICAgICAgIGlmIChpc0lmcmFtZShyZWxhdGVkVGFyZ2V0KSlcbiAgICAgICAgICAgIGxpc3RlbmVycy5hZGQocmVsYXRlZFRhcmdldC5jb250ZW50V2luZG93LmRvY3VtZW50LCAnY2xpY2snLCBvbkNsaWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkNsaWNrKGV2ZW50KSB7XG4gICAgICAgIGlmICghc2VsZi5lbC5jb250YWlucyhldmVudC50YXJnZXQpKVxuICAgICAgICAgICAgc2VsZi5oaWRlTWVudSgpO1xuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBpc0lmcmFtZShlbCkge1xuICAgIHJldHVybiBlbCAmJiBlbC50YWdOYW1lID09ICdJRlJBTUUnO1xufVxuXG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kZGVzdHJveSgpIHtcbiAgICB0aGlzLl9kcm9wZG93bi5saXN0ZW5lcnMucmVtb3ZlQWxsKCk7XG4gICAgZGVsZXRlIHRoaXMuX2Ryb3Bkb3duO1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kc2hvd01lbnUoKSB7XG4gICAgdGhpcy50b2dnbGVNZW51KHRydWUpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRHJvcGRvd24kaGlkZU1lbnUoKSB7XG4gICAgdGhpcy50b2dnbGVNZW51KGZhbHNlKTtcbn1cblxuXG5mdW5jdGlvbiBNTERyb3Bkb3duJHRvZ2dsZU1lbnUoZG9TaG93KSB7XG4gICAgZG9TaG93ID0gdHlwZW9mIGRvU2hvdyA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgID8gISB0aGlzLl9kcm9wZG93bi52aXNpYmxlXG4gICAgICAgICAgICAgICAgOiAhISBkb1Nob3c7XG5cbiAgICB0aGlzLl9kcm9wZG93bi52aXNpYmxlID0gZG9TaG93O1xuXG4gICAgdmFyIG1lbnUgPSB0aGlzLl9kcm9wZG93bi5tZW51O1xuICAgIG1lbnUuc3R5bGUuZGlzcGxheSA9IGRvU2hvd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2Jsb2NrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ25vbmUnO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZm9ybUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vZ2VuZXJhdG9yJylcbiAgICAsIENvbXBvbmVudCA9IG1pbG8uQ29tcG9uZW50XG4gICAgLCBjb21wb25lbnRzUmVnaXN0cnkgPSBtaWxvLnJlZ2lzdHJ5LmNvbXBvbmVudHNcbiAgICAsIGxvZ2dlciA9IG1pbG8udXRpbC5sb2dnZXJcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKVxuICAgICwgYXN5bmMgPSByZXF1aXJlKCdhc3luYycpO1xuXG5cbnZhciBGT1JNX1ZBTElEQVRJT05fRkFJTEVEX0NTU19DTEFTUyA9ICdoYXMtZXJyb3InO1xuXG4vKipcbiAqIEEgY29tcG9uZW50IGNsYXNzIGZvciBnZW5lcmF0aW5nIGZvcm1zIGZyb20gc2NoZW1hXG4gKiBUbyBjcmVhdGUgZm9ybSBjbGFzcyBtZXRob2QgW2NyZWF0ZUZvcm1dKCNNTEZvcm0kJGNyZWF0ZUZvcm0pIHNob3VsZCBiZSB1c2VkLlxuICogRm9ybSBzY2hlbWEgaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICogYGBgXG4gKiB2YXIgc2NoZW1hID0ge1xuICogICAgIGNzczoge1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wdGlvbmFsIENTUyBmYWNldCBjb25maWd1cmF0aW9uXG4gKiAgICAgICAgIGNsYXNzZXM6IHsgLi4uIH1cbiAqICAgICB9LFxuICogICAgIGl0ZW1zOiBbXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICAgIHR5cGU6ICc8dHlwZSBvZiB1aSBjb250cm9sPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FuIGJlIGdyb3VwLCBzZWxlY3QsIGlucHV0LCBidXR0b24sIHJhZGlvLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh5cGVybGluaywgY2hlY2tib3gsIGxpc3QsIHRpbWUsIGRhdGVcbiAqICAgICAgICAgICAgIGNvbXBOYW1lOiAnPGNvbXBvbmVudCBuYW1lPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgbmFtZSBvZiBjb21wb25lbnQsIHNob3VsZCBiZSB1bmlxdWUgd2l0aGluIHRoZSBmb3JtXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKG9yIGZvcm0gZ3JvdXApLCBvbmx5IG5lZWRzIHRvYmUgdXNlZCB3aGVuIGNvbXBvbmVudCBuZWVkcyB0byBiZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1hbmlwaWxhdGVkIGluIHNvbWUgZXZlbnQgaGFuZGxlciBhbmQgaXQgY2Fubm90IGJlIGFjY2Vzc2VkIHZpYSBtb2RlbFBhdGhcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2luZyBgbW9kZWxQYXRoQ29tcG9uZW50YCBtZXRob2RcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAod2hpY2ggaXMgYSBwcmVmZXJyZWQgd2F5IHRvIGFjY2VzcyBjb25wb25lbnRzIGluIGZvcm0pXG4gKiAgICAgICAgICAgICBsYWJlbDogJzx1aSBjb250cm9sIGxhYmVsPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgbGFiZWwsIHdpbGwgbm90IGJlIGFkZGVkIGlmIG5vdCBkZWZpbmVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3IgZW1wdHkgc3RyaW5nXG4gKiAgICAgICAgICAgICBhbHRUZXh0OiAnPGFsdCB0ZXh0IG9yIHRpdGxlPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgYWx0IHRleHQgc3RyaW5nIG9uIGJ1dHRvbnMgYW5kIGh5cGVybGlua3NcbiAqICAgICAgICAgICAgIG1vZGVsUGF0aDogJzxtb2RlbCBtYXBwaW5nPicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGF0aCBpbiBtb2RlbCB3aGVyZSB0aGUgdmFsdWUgd2lsbCBiZSBzdG9yZWQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW9zdCB0eXBlcyBvZiBpdGVtcyByZXF1aXJlIHRoaXMgcHJvcGVydHksXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc29tZSBpdGVtcyBtYXkgaGF2ZSB0aGlzIHByb3BlcnR5IChidXR0b24sIGUuZy4pLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiZ3JvdXBcIiBtdXN0IE5PVCBoYXZlIHRoaXMgcHJvcGVydHkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FybmluZyB3aWxsIGJlIGxvZ2dlZCBpZiB0aGVzZSBydWxlcyBhcmUgbm90IGZvbGxvd2VkLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0ZW1zIHdpdGhvdXQgdGhpcyBwcm9wZXJ0eSB3aWxsIG5vdCBiZSBpbiBtb2RlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIChhcGFydCBmcm9tIFwiZ3JvdXAgd2hpY2ggc3ViaXRlbXMgd2lsbCBiZSBpbiBtb2RlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXkgaGF2ZSB0aGlzIHByb3BlcnR5KVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcHJvcGVydHkgYWxsb3dzIHRvIGhhdmUgZml4ZWQgZm9ybSBtb2RlbCBzdHJ1Y3R1cmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGlsZSBjaGFuZ2luZyB2aWV3IHN0cnVjdHVyZSBvZiB0aGUgZm9ybVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlZSBNb2RlbC5cbiAqICAgICAgICAgICAgIG1vZGVsUGF0dGVybjogJ21hcHBpbmcgZXh0ZW5zaW9uIHBhdHRlcm4nLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKHN0cmluZylcbiAqICAgICAgICAgICAgIG5vdEluTW9kZWw6IHRydWUsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbGxvd3MgdG8gTk9UIGluY2x1ZGUgbW9kZWxQYXRoIHdoZXJlIG90aGVyd2lzZSBpdCB3b3VsZCBiZSByZXF1aXJlZFxuICogICAgICAgICAgICAgbWVzc2FnZXM6IHsgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gc3Vic2NyaWJlIHRvIG1lc3NhZ2VzIG9uIGl0ZW0ncyBjb21wb25lbnQgZmFjZXRzXG4gKiAgICAgICAgICAgICAgICAgZXZlbnRzOiB7ICAgICAgICAgICAgICAgICAgICAvLyBmYWNldCB0byBzdWJzY3JpYmUgdG9cbiAqICAgICAgICAgICAgICAgICAgICAgJzxtZXNzYWdlMT4nOiBvbk1lc3NhZ2UxIC8vIG1lc3NhZ2UgYW5kIHN1YnNjcmliZXIgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICAgJzxtc2cyPiA8bXNnMz4nOiB7ICAgICAgIC8vIHN1YnNjcmliZSB0byAyIG1lc3NhZ2VzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyOiBvbk1lc3NhZ2UyLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCAgICAgLy8gY29udGV4dCBjYW4gYmUgYW4gb2JqZWN0IG9yIGEgc3RyaW5nOlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJmYWNldFwiOiBmYWNldCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJvd25lclwiOiBpdGVtIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJmb3JtXCI6IHRoZSBmb3JtIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJob3N0XCI6IGhvc3Qgb2JqZWN0IHBhc3NlZCB0byBjcmVhdGVGb3JtIG1ldGhvZCB3aWxsIGJlIHVzZWQgYXMgY29udGV4dFxuICogICAgICAgICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICAgICAgICAgfVxuICogICAgICAgICAgICAgfSxcbiAqICAgICAgICAgICAgIHRyYW5zbGF0ZTogeyAgICAgICAgICAvLyBvcHRpb25hbCBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9uc1xuICogICAgICAgICAgICAgICAgIGNvbnRleHQ6IE9iamVjdCAgIC8vIG9wdGlvbmFsIGNvbnRleHQgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byB0cmFuc2xhdGUgZnVuY3Rpb25zLCAnaG9zdCcgbWVhbnMgdGhlIGhvc3RPYmplY3QgcGFzc2VkIHRvIEZvcm0uY3JlYXRlRm9ybVxuICogICAgICAgICAgICAgICAgIHRvTW9kZWw6IGZ1bmMxLCAgIC8vIHRyYW5zbGF0ZXMgaXRlbSBkYXRhIGZyb20gdmlldyB0byBtb2RlbFxuICogICAgICAgICAgICAgICAgIGZyb21Nb2RlbDogZnVuYzIgIC8vIHRyYW5zbGF0ZXMgaXRlbSBkYXRhIGZyb20gbW9kZWwgdG8gdmlld1xuICogICAgICAgICAgICAgfSxcbiAqICAgICAgICAgICAgIHZhbGlkYXRlOiB7ICAgICAgICAgICAvLyBvcHRpb25hbCBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKiAgICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0ICAgLy8gb3B0aW9uYWwgY29udGV4dCB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHZhbGlkYXRlIGZ1bmN0aW9ucywgJ2hvc3QnIG1lYW5zIHRoZSBob3N0T2JqZWN0IHBhc3NlZCB0byBGb3JtLmNyZWF0ZUZvcm1cbiAqICAgICAgICAgICAgICAgICB0b01vZGVsOiAgIGZ1bmMxIHwgW2Z1bmMxLCBmdW5jMiwgLi4uXSwvLyB2YWxpZGF0ZXMgaXRlbSBkYXRhIHdoZW4gaXQgaXMgY2hhbmdlZCBpbiBmb3JtXG4gKiAgICAgICAgICAgICAgICAgZnJvbU1vZGVsOiBmdW5jMiB8IFtmdW5jMywgZnVuYzQsIC4uLl0gLy8gb3Bwb3NpdGUsIGJ1dCBub3QgcmVhbGx5IHVzZWQgYW5kIGRvZXMgbm90IG1ha2UgZm9ybSBpbnZhbGlkIGlmIGl0IGZhaWxzLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbiBiZSB1c2VkIHRvIHByZXZlbnQgZGF0YSBiZWluZyBzaG93biBpbiB0aGUgZm9ybS5cbiAqICAgICAgICAgICAgIH0sICAgICAgICAgICAgICAgICAgICAvLyBkYXRhIHZhbGlkYXRpb24gZnVuY3Rpb25zIHNob3VsZCBhY2NlcHQgdHdvIHBhcmFtZXRlcnM6IGRhdGEgYW5kIGNhbGxiYWNrICh0aGV5IGFyZSBhc3luY2hyb25vdXMpLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdmFsaWRhdGlvbiBpcyBmaW5pc2hlZCwgY2FsbGJhY2sgc2hvdWxkIGJlIGNhbGxlZCB3aXRoIChlcnJvciwgcmVzcG9uc2UpIHBhcmFtZXRlcnMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzcG9uc2Ugc2hvdWxkIGhhdmUgcHJvcGVydGllcyB2YWxpZCAoQm9vbGVhbikgYW5kIG9wdGlvbmFsIHJlYXNvbiAoU3RyaW5nIC0gcmVhc29uIG9mIHZhbGlkYXRpb24gZmFpbHVyZSkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSE6IGF0IHRoZSBtb21lbnQsIGlmIGNhbGxiYWNrIGlzIGNhbGxlZCB3aXRoIGVycm9yIHBhcmFtZXRlciB3aGljaCBpcyBub3QgZmFsc3ksIHZhbGlkYXRpb24gd2lsbCBiZSBwYXNzZWQuXG4gKiAgICAgICAgICAgICA8aXRlbSBzcGVjaWZpYz46IHs8aXRlbSBjb25maWd1cmF0aW9uPn1cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcInNlbGVjdFwiIHN1cHBvcnRzIFwic2VsZWN0T3B0aW9uc1wiIC0gYXJyYXkgb2Ygb2JqZWN0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggcHJvcGVydGllcyBcInZhbHVlXCIgYW5kIFwibGFiZWxcIlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwicmFkaW9cIiBzdXBwb3J0cyBcInJhZGlvT3B0aW9uc1wiIHdpdGggdGhlIHNhbWUgZm9ybWF0XG4gKiAgICAgICAgICAgICBpdGVtczogW1xuICogICAgICAgICAgICAgICAgIHsgLi4uIH0gLy8sIC4uLiAtIGl0ZW1zIGluc2lkZSBcImdyb3VwXCIgb3IgXCJ3cmFwcGVyXCIgaXRlbVxuICogICAgICAgICAgICAgXVxuICogICAgICAgICB9IC8vICwgLi4uIG1vcmUgaXRlbXNcbiAqICAgICBdXG4gKiB9XG4gKi9cbnZhciBNTEZvcm0gPSBDb21wb25lbnQuY3JlYXRlQ29tcG9uZW50Q2xhc3MoJ01MRm9ybScsIHtcbiAgICBkb206IHtcbiAgICAgICAgY2xzOiAnbWwtZm9ybSdcbiAgICB9LFxuICAgIGNzczogdW5kZWZpbmVkLCAvLyBGYWNldCBjb25maWcgY2FuIGJlIHNldCB2aWEgZm9ybSBzY2hlbWFcbiAgICBtb2RlbDogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICBldmVudHM6IHVuZGVmaW5lZFxufSk7XG5cbmNvbXBvbmVudHNSZWdpc3RyeS5hZGQoTUxGb3JtKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNTEZvcm07XG5cblxuXy5leHRlbmQoTUxGb3JtLCB7XG4gICAgY3JlYXRlRm9ybTogTUxGb3JtJCRjcmVhdGVGb3JtLFxuICAgIHJlZ2lzdGVyU2NoZW1hS2V5OiBNTEZvcm0kJHJlZ2lzdGVyU2NoZW1hS2V5LFxuICAgIHJlZ2lzdGVyVmFsaWRhdGlvbjogTUxGb3JtJCRyZWdpc3RlclZhbGlkYXRpb24sXG4gICAgdmFsaWRhdG9yUmVzcG9uc2U6IE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UsXG4gICAgZ2VuZXJhdG9yOiBmb3JtR2VuZXJhdG9yLFxuICAgIHJlZ2lzdHJ5OiBmb3JtUmVnaXN0cnlcbn0pO1xuXG5fLmV4dGVuZFByb3RvKE1MRm9ybSwge1xuICAgIGdldEhvc3RPYmplY3Q6IE1MRm9ybSRnZXRIb3N0T2JqZWN0LFxuICAgIGlzVmFsaWQ6IE1MRm9ybSRpc1ZhbGlkLFxuICAgIHZhbGlkYXRlTW9kZWw6IE1MRm9ybSR2YWxpZGF0ZU1vZGVsLFxuICAgIGdldEludmFsaWRDb250cm9sczogTUxGb3JtJGdldEludmFsaWRDb250cm9scyxcbiAgICBnZXRJbnZhbGlkUmVhc29uczogTUxGb3JtJGdldEludmFsaWRSZWFzb25zLFxuICAgIGdldEludmFsaWRSZWFzb25zVGV4dDogTUxGb3JtJGdldEludmFsaWRSZWFzb25zVGV4dCxcbiAgICBtb2RlbFBhdGhDb21wb25lbnQ6IE1MRm9ybSRtb2RlbFBhdGhDb21wb25lbnQsXG4gICAgbW9kZWxQYXRoU2NoZW1hOiBNTEZvcm0kbW9kZWxQYXRoU2NoZW1hLFxuICAgIHZpZXdQYXRoQ29tcG9uZW50OiBNTEZvcm0kdmlld1BhdGhDb21wb25lbnQsXG4gICAgdmlld1BhdGhTY2hlbWE6IE1MRm9ybSR2aWV3UGF0aFNjaGVtYSxcbiAgICBnZXRNb2RlbFBhdGg6IE1MRm9ybSRnZXRNb2RlbFBhdGgsXG4gICAgZ2V0Vmlld1BhdGg6IE1MRm9ybSRnZXRWaWV3UGF0aCxcbiAgICBkZXN0cm95OiBNTEZvcm0kZGVzdHJveSxcbn0pO1xuXG5cbnZhciBTQ0hFTUFfS0VZV09SRFMgPSBfLm9iamVjdChbXG4gICAgJ3R5cGUnLCAnY29tcE5hbWUnLCAnbGFiZWwnLCAnYWx0VGV4dCcsXG4gICAgJ21vZGVsUGF0aCcsICdtb2RlbFBhdHRlcm4nLCAnbm90SW5Nb2RlbCcsXG4gICAgJ21lc3NhZ2VzJywgJ3RyYW5zbGF0ZScsICd2YWxpZGF0ZScsICdpdGVtcycsXG4gICAgJ3NlbGVjdE9wdGlvbnMnLCAncmFkaW9PcHRpb25zJywgJ2NvbWJvT3B0aW9ucycsXG4gICAgJ2NvbWJvT3B0aW9uc1VSTCcsICdhZGRJdGVtUHJvbXB0JywgJ3BsYWNlSG9sZGVyJyxcbiAgICAndmFsdWUnLCAnZGF0YVZhbGlkYXRpb24nLCAnYXN5bmNIYW5kbGVyJywgJ2F1dG9yZXNpemUnLFxuICAgICdtYXhMZW5ndGgnXG5dLCB0cnVlKTtcblxuLyoqXG4gKiBNTEZvcm0gY2xhc3MgbWV0aG9kXG4gKiBDcmVhdGVzIGZvcm0gZnJvbSBzY2hlbWEuXG4gKiBGb3JtIGRhdGEgY2FuIGJlIG9idGFpbmVkIGZyb20gaXRzIE1vZGVsIChgZm9ybS5tb2RlbGApLCByZWFjdGl2ZSBjb25uZWN0aW9uIHRvIGZvcm0ncyBtb2RlbCBjYW4gYWxzbyBiZSB1c2VkLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgZm9ybSBzY2hlbWEsIGFzIGRlc2NyaWJlZCBhYm92ZVxuICogQHBhcmFtIHtPYmplY3R9IGhvc3RPYmplY3QgZm9ybSBob3N0IG9iamVjdCwgdXNlZCB0byBkZWZpbmUgYXMgbWVzc2FnZSBzdWJzY3JpYmVyIGNvbnRleHQgaW4gc2NoZW1hIC0gYnkgY29udmVudGlvbiB0aGUgY29udGV4dCBzaG91bGQgYmUgZGVmaW5lZCBhcyBcImhvc3RcIlxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1EYXRhIGRhdGEgdG8gaW5pdGlhbGl6ZSB0aGUgZm9ybSB3aXRoXG4gKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGUgb3B0aW9uYWwgZm9ybSB0ZW1wbGF0ZSwgd2lsbCBiZSB1c2VkIGluc3RlYWQgb2YgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgZnJvbSBzY2hlbWEuIE5vdCByZWNvbW1lbmRlZCB0byB1c2UsIGFzIGl0IHdpbGwgaGF2ZSB0byBiZSBtYWludGFpbmVkIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCBzY2hlbWEgZm9yIGJpbmRpbmdzLlxuICogQHJldHVybiB7TUxGb3JtfVxuICovXG5mdW5jdGlvbiBNTEZvcm0kJGNyZWF0ZUZvcm0oc2NoZW1hLCBob3N0T2JqZWN0LCBmb3JtRGF0YSwgdGVtcGxhdGUpIHtcbiAgICB2YXIgRm9ybUNsYXNzID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IF9jcmVhdGVGb3JtQ29tcG9uZW50KEZvcm1DbGFzcyk7XG4gICAgXy5kZWZpbmVQcm9wZXJ0eShmb3JtLCAnX2hvc3RPYmplY3QnLCBob3N0T2JqZWN0KTtcbiAgICB2YXIgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zO1xuICAgIF9wcm9jZXNzRm9ybVNjaGVtYSgpO1xuICAgIF9jcmVhdGVGb3JtQ29ubmVjdG9ycygpO1xuICAgIF9tYW5hZ2VGb3JtVmFsaWRhdGlvbigpO1xuXG4gICAgLy8gc2V0IG9yaWdpbmFsIGZvcm0gZGF0YVxuICAgIGlmIChmb3JtRGF0YSlcbiAgICAgICAgZm9ybS5tb2RlbC5tLnNldChmb3JtRGF0YSk7XG5cbiAgICBpZiAoc2NoZW1hLmNzcylcbiAgICAgICAgZm9ybS5jc3MuY29uZmlnID0gc2NoZW1hLmNzcztcblxuICAgIHJldHVybiBmb3JtO1xuXG5cbiAgICBmdW5jdGlvbiBfY3JlYXRlRm9ybUNvbXBvbmVudChGb3JtQ2xhc3MpIHtcbiAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZSB8fCBmb3JtR2VuZXJhdG9yKHNjaGVtYSk7XG4gICAgICAgIHJldHVybiBGb3JtQ2xhc3MuY3JlYXRlT25FbGVtZW50KHVuZGVmaW5lZCwgdGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9wcm9jZXNzRm9ybVNjaGVtYSgpIHtcbiAgICAgICAgLy8gbW9kZWwgcGF0aHMgdHJhbnNsYXRpb24gcnVsZXNcbiAgICAgICAgZm9ybVZpZXdQYXRocyA9IHt9O1xuICAgICAgICBmb3JtTW9kZWxQYXRocyA9IHt9O1xuICAgICAgICBtb2RlbFBhdGhUcmFuc2xhdGlvbnMgPSB7fTtcbiAgICAgICAgZGF0YVRyYW5zbGF0aW9ucyA9IHsgZnJvbU1vZGVsOiB7fSwgdG9Nb2RlbDoge30gfTtcbiAgICAgICAgZGF0YVZhbGlkYXRpb25zID0geyBmcm9tTW9kZWw6IHt9LCB0b01vZGVsOiB7fSB9O1xuXG4gICAgICAgIC8vIHByb2Nlc3MgZm9ybSBzY2hlbWFcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb2Nlc3NTY2hlbWEuY2FsbChmb3JtLCBmb3JtLCBzY2hlbWEsICcnLCBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ2Zvcm1WaWV3UGF0aHMgYmVmb3JlIGVycm9yOiAnLCBmb3JtVmlld1BhdGhzKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZm9ybU1vZGVsUGF0aHMgYmVmb3JlIGVycm9yOiAnLCBmb3JtTW9kZWxQYXRocyk7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ21vZGVsUGF0aFRyYW5zbGF0aW9ucyBiZWZvcmUgZXJyb3I6ICcsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucyk7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ2RhdGFUcmFuc2xhdGlvbnMgYmVmb3JlIGVycm9yOiAnLCBkYXRhVHJhbnNsYXRpb25zKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnZGF0YVZhbGlkYXRpb25zIGJlZm9yZSBlcnJvcjogJywgZGF0YVZhbGlkYXRpb25zKTtcbiAgICAgICAgICAgIHRocm93IChlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcm0uX2Zvcm1WaWV3UGF0aHMgPSBmb3JtVmlld1BhdGhzO1xuICAgICAgICBmb3JtLl9mb3JtTW9kZWxQYXRocyA9IGZvcm1Nb2RlbFBhdGhzO1xuICAgICAgICBmb3JtLl9tb2RlbFBhdGhUcmFuc2xhdGlvbnMgPSBtb2RlbFBhdGhUcmFuc2xhdGlvbnM7XG4gICAgICAgIGZvcm0uX2RhdGFUcmFuc2xhdGlvbnMgPSBkYXRhVHJhbnNsYXRpb25zO1xuICAgICAgICBmb3JtLl9kYXRhVmFsaWRhdGlvbnMgPSBkYXRhVmFsaWRhdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2NyZWF0ZUZvcm1Db25uZWN0b3JzKCkge1xuICAgICAgICB2YXIgY29ubmVjdG9ycyA9IGZvcm0uX2Nvbm5lY3RvcnMgPSBbXTtcblxuICAgICAgICAvLyBjb25uZWN0IGZvcm0gdmlldyB0byBmb3JtIG1vZGVsIHVzaW5nIHRyYW5zbGF0aW9uIHJ1bGVzIGZyb20gbW9kZWxQYXRoIHByb3BlcnRpZXMgb2YgZm9ybSBpdGVtc1xuICAgICAgICBjb25uZWN0b3JzLnB1c2gobWlsby5taW5kZXIoZm9ybS5kYXRhLCAnPC0+JywgZm9ybS5tb2RlbCwgeyAvLyBjb25uZWN0aW9uIGRlcHRoIGlzIGRlZmluZWQgb24gZmllbGQgYnkgZmllbGQgYmFzaXMgYnkgcGF0aFRyYW5zbGF0aW9uXG4gICAgICAgICAgICBwYXRoVHJhbnNsYXRpb246IG1vZGVsUGF0aFRyYW5zbGF0aW9ucyxcbiAgICAgICAgICAgIGRhdGFUcmFuc2xhdGlvbjoge1xuICAgICAgICAgICAgICAgICc8LSc6IGRhdGFUcmFuc2xhdGlvbnMuZnJvbU1vZGVsLFxuICAgICAgICAgICAgICAgICctPic6IGRhdGFUcmFuc2xhdGlvbnMudG9Nb2RlbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGFWYWxpZGF0aW9uOiB7XG4gICAgICAgICAgICAgICAgJzwtJzogZGF0YVZhbGlkYXRpb25zLmZyb21Nb2RlbCxcbiAgICAgICAgICAgICAgICAnLT4nOiBkYXRhVmFsaWRhdGlvbnMudG9Nb2RlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgaWYgKHNjaGVtYS5jc3MpIHtcbiAgICAgICAgICAgIGNvbm5lY3RvcnMucHVzaChtaWxvLm1pbmRlcihmb3JtLm1vZGVsLCAnLT4+PicsIGZvcm0uY3NzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFuYWdlRm9ybVZhbGlkYXRpb24oKSB7XG4gICAgICAgIGZvcm0uX2ludmFsaWRGb3JtQ29udHJvbHMgPSB7fTtcblxuICAgICAgICBmb3JtLm1vZGVsLm9uKCd2YWxpZGF0ZWQnLCBjcmVhdGVPblZhbGlkYXRlZCh0cnVlKSk7XG4gICAgICAgIGZvcm0uZGF0YS5vbigndmFsaWRhdGVkJywgY3JlYXRlT25WYWxpZGF0ZWQoZmFsc2UpKTtcblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVPblZhbGlkYXRlZChpc0Zyb21Nb2RlbCkge1xuICAgICAgICAgICAgdmFyIHBhdGhDb21wTWV0aG9kID0gaXNGcm9tTW9kZWwgPyAnbW9kZWxQYXRoQ29tcG9uZW50JzogJ3ZpZXdQYXRoQ29tcG9uZW50J1xuICAgICAgICAgICAgICAgICwgcGF0aFNjaGVtYU1ldGhvZCA9IGlzRnJvbU1vZGVsID8gJ21vZGVsUGF0aFNjaGVtYSc6ICd2aWV3UGF0aFNjaGVtYSc7XG5cbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihtc2csIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGZvcm1bcGF0aENvbXBNZXRob2RdKHJlc3BvbnNlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICwgc2NoZW1hID0gZm9ybVtwYXRoU2NoZW1hTWV0aG9kXShyZXNwb25zZS5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAsIGxhYmVsID0gc2NoZW1hLmxhYmVsXG4gICAgICAgICAgICAgICAgICAgICwgbW9kZWxQYXRoID0gc2NoZW1hLm1vZGVsUGF0aDtcblxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudEVsID0gY29tcG9uZW50LmVsLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsLmNsYXNzTGlzdC50b2dnbGUoRk9STV9WQUxJREFUSU9OX0ZBSUxFRF9DU1NfQ0xBU1MsICEgcmVzcG9uc2UudmFsaWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWFzb247XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS52YWxpZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBmb3JtLl9pbnZhbGlkRm9ybUNvbnRyb2xzW21vZGVsUGF0aF07XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFzb246IHJlc3BvbnNlLnJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFzb25Db2RlOiByZXNwb25zZS5yZWFzb25Db2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5faW52YWxpZEZvcm1Db250cm9sc1ttb2RlbFBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBfLmNsb25lKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRnJvbU1vZGVsKSBkYXRhLnBhdGggPSBmb3JtLmdldE1vZGVsUGF0aChkYXRhLnBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucmVhc29uID0gcmVhc29uOyAvLyBhIGJpdCBoYWNreSwgcmVwbGFjaW5nIHN0cmluZyB3aXRoIG9iamVjdCBjcmVhdGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5yZWFzb25Db2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvcm0ucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRpb24nLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdGb3JtOiBjb21wb25lbnQgZm9yIHBhdGggJyArIHJlc3BvbnNlLnBhdGggKyAnIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vKipcbiAqIEN1c3RvbSBzY2hlbWEga2V5d29yZHNcbiAqL1xudmFyIHNjaGVtYUtleXdvcmRzUmVnaXN0cnkgPSB7fTtcbmZ1bmN0aW9uIE1MRm9ybSQkcmVnaXN0ZXJTY2hlbWFLZXkoa2V5d29yZCwgcHJvY2Vzc0tleXdvcmRGdW5jLCByZXBsYWNlS2V5d29yZCkge1xuICAgIGlmIChTQ0hFTUFfS0VZV09SRFNba2V5d29yZF0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5d29yZCcsIGtleXdvcmQsICdpcyB1c2VkIGJ5IE1MRm9ybSBjbGFzcyBvciBvbmUgb2YgcHJlLXJlZ2lzdGVyZWQgZm9ybSBpdGVtcyBhbmQgY2Fubm90IGJlIG92ZXJyaWRkZW4nKTtcblxuICAgIGlmICghcmVwbGFjZUtleXdvcmQgJiYgc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXl3b3JkJywga2V5d29yZCwgJ2lzIGFscmVhZHkgcmVnaXN0ZXJlZC4gUGFzcyB0cnVlIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXIgdG8gcmVwbGFjZSBpdCcpO1xuXG4gICAgc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXSA9IHByb2Nlc3NLZXl3b3JkRnVuYztcbn1cblxuXG4vKipcbiAqIFByZWRlZmluZWQgZm9ybSB2YWxpZGF0aW9uIGZ1bmN0aW9uc1xuICovXG52YXIgdmFsaWRhdGlvbkZ1bmN0aW9ucyA9IHtcbiAgICAncmVxdWlyZWQnOiB2YWxpZGF0ZVJlcXVpcmVkXG59O1xuZnVuY3Rpb24gTUxGb3JtJCRyZWdpc3RlclZhbGlkYXRpb24obmFtZSwgZnVuYywgcmVwbGFjZUZ1bmMpIHtcbiAgICBpZiAoIXJlcGxhY2VGdW5jICYmIHZhbGlkYXRpb25GdW5jdGlvbnNbbmFtZV0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsaWRhdGluZyBmdW5jdGlvbicsIG5hbWUsICdpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuIFBhc3MgdHJ1ZSBhcyB0aGUgdGhpcmQgcGFyYW1ldGVyIHRvIHJlcGxhY2UgaXQnKTtcblxuICAgIHZhbGlkYXRpb25GdW5jdGlvbnNbbmFtZV0gPSBmdW5jO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZm9ybSBob3N0IG9iamVjdC5cbiAqIEByZXR1cm4ge0NvbXBvbmVudH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGdldEhvc3RPYmplY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hvc3RPYmplY3Q7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGN1cnJlbnQgdmFsaWRhdGlvbiBzdGF0dXMgb2YgdGhlIGZvcm1cbiAqIFdpbGwgbm90IHZhbGlkYXRlIGZpZWxkcyB0aGF0IHdlcmUgbmV2ZXIgY2hhbmdlZCBpbiB2aWV3XG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJGlzVmFsaWQoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2ludmFsaWRGb3JtQ29udHJvbHMpLmxlbmd0aCA9PSAwO1xufVxuXG5cbi8qKlxuICogUnVucyAndG9Nb2RlbCcgdmFsaWRhdG9ycyBkZWZpbmVkIGluIHNjaGVtYSBvbiB0aGUgY3VycmVudCBtb2RlbCBvZiB0aGUgZm9ybVxuICogY2FuIGJlIHVzZWQgdG8gbWFyayBhcyBpbnZhaWQgYWxsIHJlcXVpcmVkIGZpZWxkcyBvciB0byBleHBsaWNpdGVseSB2YWxpZGF0ZVxuICogZm9ybSB3aGVuIGl0IGlzIHNhdmVkLiBSZXR1cm5zIHZhbGlkYXRpb24gc3RhdGUgb2YgdGhlIGZvcm0gdmlhIGNhbGxiYWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gTUxGb3JtJHZhbGlkYXRlTW9kZWwoY2FsbGJhY2spIHtcbiAgICB2YXIgdmFsaWRhdGlvbnMgPSBbXVxuICAgICAgICAsIHNlbGYgPSB0aGlzO1xuXG4gICAgXy5lYWNoS2V5KHRoaXMuX2RhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwsIGZ1bmN0aW9uKHZhbGlkYXRvcnMsIG1vZGVsUGF0aCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMubW9kZWwubShtb2RlbFBhdGgpLmdldCgpO1xuICAgICAgICB2YWxpZGF0b3JzID0gQXJyYXkuaXNBcnJheSh2YWxpZGF0b3JzKSA/IHZhbGlkYXRvcnMgOiBbdmFsaWRhdG9yc107XG5cbiAgICAgICAgaWYgKHZhbGlkYXRvcnMgJiYgdmFsaWRhdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIG1vZGVsUGF0aDogbW9kZWxQYXRoLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuXG4gICAgdmFyIGFsbFZhbGlkID0gdHJ1ZTtcbiAgICBhc3luYy5lYWNoKHZhbGlkYXRpb25zLFxuICAgICAgICBmdW5jdGlvbih2YWxpZGF0aW9uLCBuZXh0VmFsaWRhdGlvbikge1xuICAgICAgICAgICAgdmFyIGxhc3RSZXNwb25zZTtcbiAgICAgICAgICAgIGFzeW5jLmV2ZXJ5KHZhbGlkYXRpb24udmFsaWRhdG9ycyxcbiAgICAgICAgICAgICAgICAvLyBjYWxsIHZhbGlkYXRvclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHZhbGlkYXRvciwgbmV4dCkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3IodmFsaWRhdGlvbi5kYXRhLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0UmVzcG9uc2UgPSByZXNwb25zZSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQobGFzdFJlc3BvbnNlLnZhbGlkIHx8IGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBwb3N0IHZhbGlkYXRpb24gcmVzdWx0IG9mIGl0ZW0gdG8gZm9ybVxuICAgICAgICAgICAgZnVuY3Rpb24odmFsaWQpIHtcbiAgICAgICAgICAgICAgICBsYXN0UmVzcG9uc2UucGF0aCA9IHZhbGlkYXRpb24ubW9kZWxQYXRoO1xuICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZS52YWxpZCA9IHZhbGlkO1xuICAgICAgICAgICAgICAgIHNlbGYubW9kZWwucG9zdE1lc3NhZ2UoJ3ZhbGlkYXRlZCcsIGxhc3RSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZCkgYWxsVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBuZXh0VmFsaWRhdGlvbihudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgIC8vIHBvc3QgZm9ybSB2YWxpZGF0aW9uIHJlc3VsdFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKCd2YWxpZGF0aW9uY29tcGxldGVkJywgeyB2YWxpZDogYWxsVmFsaWQgfSk7XG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGFsbFZhbGlkKTtcbiAgICB9KTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgbWFwIG9mIGludmFsaWQgY29udHJvbHMgYW5kIHJlYXNvbnMgKHZpZXcgcGF0aHMgYXJlIGtleXMpXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SW52YWxpZENvbnRyb2xzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbnZhbGlkRm9ybUNvbnRyb2xzO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3RzIHdpdGggYWxsIHJlYXNvbnMgZm9yIHRoZSBmb3JtIGJlaW5nIGludmFsaWRcbiAqXG4gKiBAcmV0dXJuIHtBcnJheVtPYmplY3RdfVxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0SW52YWxpZFJlYXNvbnMoKSB7XG4gICAgdmFyIGludmFsaWRDb250cm9scyA9IHRoaXMuZ2V0SW52YWxpZENvbnRyb2xzKCk7XG4gICAgdmFyIHJlYXNvbnMgPSBfLnJlZHVjZUtleXMoaW52YWxpZENvbnRyb2xzLFxuICAgICAgICBmdW5jdGlvbihtZW1vLCBpbnZhbGlkQ29udHJvbCwgY29tcE5hbWUpIHtcbiAgICAgICAgICAgIG1lbW8ucHVzaChpbnZhbGlkQ29udHJvbC5yZWFzb24pO1xuICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgIH0sIFtdLCB0aGlzKTtcbiAgICByZXR1cm4gcmVhc29ucztcbn1cblxuXG4vKipcbiAqIFJldHVybnMgYSBtdWx0aWxpbmUgc3RyaW5nIHdpdGggYWxsIHJlYXNvbnMgZm9yIHRoZSBmb3JtIGJlaW5nIGludmFsaWRcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRJbnZhbGlkUmVhc29uc1RleHQoKSB7XG4gICAgdmFyIHJlYXNvbnMgPSB0aGlzLmdldEludmFsaWRSZWFzb25zKCk7XG4gICAgcmV0dXJuIHJlYXNvbnMucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIHJlYXNvbikge1xuICAgICAgICByZXR1cm4gbWVtbyArIChyZWFzb24ubGFiZWwgfHwgJycpICsgJyAtICcgKyByZWFzb24ucmVhc29uICsgJ1xcbic7XG4gICAgfSwgJycpO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBjb21wb25lbnQgZm9yIGEgZ2l2ZW4gbW9kZWxQYXRoXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1vZGVsUGF0aFxuICogQHJldHVybiB7Q29tcG9uZW50fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kbW9kZWxQYXRoQ29tcG9uZW50KG1vZGVsUGF0aCkge1xuICAgIHZhciBtb2RlbFBhdGhPYmogPSB0aGlzLl9mb3JtTW9kZWxQYXRoc1ttb2RlbFBhdGhdO1xuICAgIHJldHVybiBtb2RlbFBhdGhPYmogJiYgbW9kZWxQYXRoT2JqLmNvbXBvbmVudDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgZm9ybSBzY2hlbWEgZm9yIGEgZ2l2ZW4gbW9kZWxQYXRoXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1vZGVsUGF0aFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBNTEZvcm0kbW9kZWxQYXRoU2NoZW1hKG1vZGVsUGF0aCkge1xuICAgIHZhciBtb2RlbFBhdGhPYmogPSB0aGlzLl9mb3JtTW9kZWxQYXRoc1ttb2RlbFBhdGhdO1xuICAgIHJldHVybiBtb2RlbFBhdGhPYmogJiYgbW9kZWxQYXRoT2JqLnNjaGVtYTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgY29tcG9uZW50IGZvciBhIGdpdmVuIHZpZXcgcGF0aCAocGF0aCBhcyBkZWZpbmVkIGluIERhdGEgZmFjZXQpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZpZXdQYXRoXG4gKiBAcmV0dXJuIHtDb21wb25lbnR9XG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSR2aWV3UGF0aENvbXBvbmVudCh2aWV3UGF0aCkge1xuICAgIHZhciB2aWV3UGF0aE9iaiA9IHRoaXMuX2Zvcm1WaWV3UGF0aHNbdmlld1BhdGhdO1xuICAgIHJldHVybiB2aWV3UGF0aE9iaiAmJiB2aWV3UGF0aE9iai5jb21wb25lbnQ7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGZvcm0gc2NoZW1hIGZvciBhIGdpdmVuIHZpZXcgcGF0aCBpdGVtIChwYXRoIGFzIGRlZmluZWQgaW4gRGF0YSBmYWNldClcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGhcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gTUxGb3JtJHZpZXdQYXRoU2NoZW1hKHZpZXdQYXRoKSB7XG4gICAgdmFyIHZpZXdQYXRoT2JqID0gdGhpcy5fZm9ybVZpZXdQYXRoc1t2aWV3UGF0aF07XG4gICAgcmV0dXJuIHZpZXdQYXRoT2JqICYmIHZpZXdQYXRoT2JqLnNjaGVtYTtcbn1cblxuXG4vKipcbiAqIENvbnZlcnRzIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50IGluIHRoZSBmb3JtIHRvIHRoZSBtb2RlbCBwYXRoIG9mIHRoZSBjb25uZWN0ZWQgZGF0YVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2aWV3UGF0aCB2aWV3IHBhdGggb2YgdGhlIGNvbXBvbmVudFxuICogQHJldHVybiB7c3RyaW5nfSBtb2RlbCBwYXRoIG9mIGNvbm5lY3RlZCBkYXRhXG4gKi9cbmZ1bmN0aW9uIE1MRm9ybSRnZXRNb2RlbFBhdGgodmlld1BhdGgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWxQYXRoVHJhbnNsYXRpb25zW3ZpZXdQYXRoXTtcbn1cblxuXG4vKipcbiAqIENvbnZlcnRzIG1vZGVsIHBhdGggb2YgdGhlIGNvbm5lY3RlZCBkYXRhIHRvIHZpZXcgcGF0aCBvZiB0aGUgY29tcG9uZW50IGluIHRoZSBmb3JtXG4gKiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbFBhdGggbW9kZWwgcGF0aCBvZiBjb25uZWN0ZWQgZGF0YVxuICogQHJldHVybiB7c3RyaW5nfSB2aWV3IHBhdGggb2YgdGhlIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBNTEZvcm0kZ2V0Vmlld1BhdGgobW9kZWxQYXRoKSB7XG4gICAgcmV0dXJuIF8uZmluZEtleSh0aGlzLl9tb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGZ1bmN0aW9uKG1QYXRoLCB2UGF0aCkge1xuICAgICAgICByZXR1cm4gbVBhdGggPT0gbW9kZWxQYXRoO1xuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIE1MRm9ybSRkZXN0cm95KCkge1xuICAgIENvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5fY29ubmVjdG9ycyAmJiB0aGlzLl9jb25uZWN0b3JzLmZvckVhY2gobWlsby5taW5kZXIuZGVzdHJveUNvbm5lY3Rvcik7XG4gICAgdGhpcy5fY29ubmVjdG9ycyA9IG51bGw7XG59XG5cblxuLyoqXG4gKiBQcm9jZXNzZXMgZm9ybSBzY2hlbWEgdG8gc3Vic2NyaWJlIGZvciBtZXNzYWdlcyBhcyBkZWZpbmVkIGluIHNjaGVtYS4gUGVyZm9ybXMgc3BlY2lhbCBwcm9jZXNzaW5nIGZvciBzb21lIHR5cGVzIG9mIGl0ZW1zLlxuICogUmV0dXJucyB0cmFuc2xhdGlvbiBydWxlcyBmb3IgQ29ubmVjdG9yIG9iamVjdC5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHJlY3Vyc2l2ZWx5IGZvciBncm91cHMgKGFuZCBzdWJncm91cHMpXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wIGZvcm0gb3IgZ3JvdXAgY29tcG9uZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIGZvcm0gb3IgZ3JvdXAgc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1NjaGVtYShjb21wLCBzY2hlbWEsIHZpZXdQYXRoLCBmb3JtVmlld1BhdGhzLCBmb3JtTW9kZWxQYXRocywgbW9kZWxQYXRoVHJhbnNsYXRpb25zLCBkYXRhVHJhbnNsYXRpb25zLCBkYXRhVmFsaWRhdGlvbnMpIHtcbiAgICB2aWV3UGF0aCA9IHZpZXdQYXRoIHx8ICcnO1xuICAgIGZvcm1WaWV3UGF0aHMgPSBmb3JtVmlld1BhdGhzIHx8IHt9O1xuICAgIGZvcm1Nb2RlbFBhdGhzID0gZm9ybU1vZGVsUGF0aHMgfHwge307XG4gICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zID0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMgPSBkYXRhVHJhbnNsYXRpb25zIHx8IHt9O1xuICAgIGRhdGFUcmFuc2xhdGlvbnMuZnJvbU1vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy5mcm9tTW9kZWwgfHwge307XG4gICAgZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsID0gZGF0YVRyYW5zbGF0aW9ucy50b01vZGVsIHx8IHt9O1xuXG4gICAgZGF0YVZhbGlkYXRpb25zID0gZGF0YVZhbGlkYXRpb25zIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy5mcm9tTW9kZWwgPSBkYXRhVmFsaWRhdGlvbnMuZnJvbU1vZGVsIHx8IHt9O1xuICAgIGRhdGFWYWxpZGF0aW9ucy50b01vZGVsID0gZGF0YVZhbGlkYXRpb25zLnRvTW9kZWwgfHwge307XG5cbiAgICBpZiAoc2NoZW1hLml0ZW1zKVxuICAgICAgICBfcHJvY2Vzc1NjaGVtYUl0ZW1zLmNhbGwodGhpcywgY29tcCwgc2NoZW1hLml0ZW1zLCB2aWV3UGF0aCwgZm9ybVZpZXdQYXRocywgZm9ybU1vZGVsUGF0aHMsIG1vZGVsUGF0aFRyYW5zbGF0aW9ucywgZGF0YVRyYW5zbGF0aW9ucywgZGF0YVZhbGlkYXRpb25zKTtcblxuICAgIGlmIChzY2hlbWEubWVzc2FnZXMpXG4gICAgICAgIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMuY2FsbCh0aGlzLCBjb21wLCBzY2hlbWEubWVzc2FnZXMpO1xuXG4gICAgdmFyIGl0ZW1SdWxlID0gc2NoZW1hLnR5cGUgJiYgZm9ybVJlZ2lzdHJ5LmdldChzY2hlbWEudHlwZSk7XG4gICAgdmFyIGhvc3RPYmplY3QgPSB0aGlzLmdldEhvc3RPYmplY3QoKTtcblxuICAgIGlmICh2aWV3UGF0aCkge1xuICAgICAgICBmb3JtVmlld1BhdGhzW3ZpZXdQYXRoXSA9IHtcbiAgICAgICAgICAgIHNjaGVtYTogc2NoZW1hLFxuICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGl0ZW1SdWxlKSB7XG4gICAgICAgICAgICAvL2NoZWNrKGNvbXAuY29uc3RydWN0b3IsIGl0ZW1UeXBlc1tzY2hlbWEudHlwZV0uQ29tcENsYXNzKTtcbiAgICAgICAgICAgIGl0ZW1SdWxlLml0ZW1GdW5jdGlvbiAmJiBpdGVtUnVsZS5pdGVtRnVuY3Rpb24uY2FsbChob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICAgICAgX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zLmNhbGwodGhpcywgdmlld1BhdGgsIHNjaGVtYSk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleXdvcmQgaW4gc2NoZW1hS2V5d29yZHNSZWdpc3RyeSkge1xuICAgICAgICBpZiAoc2NoZW1hLmhhc093blByb3BlcnR5KGtleXdvcmQpKSB7XG4gICAgICAgICAgICB2YXIgcHJvY2Vzc0tleXdvcmRGdW5jID0gc2NoZW1hS2V5d29yZHNSZWdpc3RyeVtrZXl3b3JkXTtcbiAgICAgICAgICAgIHByb2Nlc3NLZXl3b3JkRnVuYyhob3N0T2JqZWN0LCBjb21wLCBzY2hlbWEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVsUGF0aFRyYW5zbGF0aW9ucztcblxuXG4gICAgZnVuY3Rpb24gX3Byb2Nlc3NJdGVtVHJhbnNsYXRpb25zKHZpZXdQYXRoLCBzY2hlbWEpIHtcbiAgICAgICAgdmFyIG1vZGVsUGF0aCA9IHNjaGVtYS5tb2RlbFBhdGhcbiAgICAgICAgICAgICwgbW9kZWxQYXR0ZXJuID0gc2NoZW1hLm1vZGVsUGF0dGVybiB8fCAnJ1xuICAgICAgICAgICAgLCBub3RJbk1vZGVsID0gc2NoZW1hLm5vdEluTW9kZWxcbiAgICAgICAgICAgICwgdHJhbnNsYXRlID0gc2NoZW1hLnRyYW5zbGF0ZVxuICAgICAgICAgICAgLCB2YWxpZGF0ZSA9IHNjaGVtYS52YWxpZGF0ZTtcblxuICAgICAgICBpZiAodmlld1BhdGgpIHtcbiAgICAgICAgICAgIF9hZGREYXRhVHJhbnNsYXRpb24uY2FsbCh0aGlzLCB0cmFuc2xhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGl0ZW1SdWxlLm1vZGVsUGF0aFJ1bGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdwcm9oaWJpdGVkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbW9kZWxQYXRoIGlzIHByb2hpYml0ZWQgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZXF1aXJlZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghIChtb2RlbFBhdGggfHwgbm90SW5Nb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21vZGVsUGF0aCBpcyByZXF1aXJlZCBmb3IgaXRlbSB0eXBlICcgKyBzY2hlbWEudHlwZSArICcgLiBBZGQgXCJub3RJbk1vZGVsOiB0cnVlXCIgdG8gb3ZlcnJpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmFsbGluZyB0aHJvdWdoIHRvICdvcHRpb25hbCdcbiAgICAgICAgICAgICAgICBjYXNlICdvcHRpb25hbCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1Nb2RlbFBhdGhzW21vZGVsUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hOiBzY2hlbWEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISBub3RJbk1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIG1vZGVsUGF0dGVybik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFUcmFuc2xhdGlvbi5jYWxsKHRoaXMsIHRyYW5zbGF0ZSwgJ2Zyb21Nb2RlbCcsIG1vZGVsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FkZERhdGFWYWxpZGF0aW9uLmNhbGwodGhpcywgdmFsaWRhdGUsICd0b01vZGVsJywgdmlld1BhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hZGREYXRhVmFsaWRhdGlvbi5jYWxsKHRoaXMsIHZhbGlkYXRlLCAnZnJvbU1vZGVsJywgbW9kZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gbW9kZWxQYXRoIHJ1bGUgZm9yIGl0ZW0gdHlwZSAnICsgc2NoZW1hLnR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZE1vZGVsUGF0aFRyYW5zbGF0aW9uKHZpZXdQYXRoLCBtb2RlbFBhdGgsIHBhdGhQYXR0ZXJuKSB7XG4gICAgICAgIGlmICh2aWV3UGF0aCBpbiBtb2RlbFBhdGhUcmFuc2xhdGlvbnMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtcbiAgICAgICAgZWxzZSBpZiAoXy5rZXlPZihtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIG1vZGVsUGF0aCkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBtb2RlbCBwYXRoICcgKyBtb2RlbFBhdGggKyAnIGZvciB2aWV3IHBhdGggJyArIHZpZXdQYXRoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbW9kZWxQYXRoVHJhbnNsYXRpb25zW3ZpZXdQYXRoICsgcGF0aFBhdHRlcm5dID0gbW9kZWxQYXRoICsgcGF0aFBhdHRlcm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZERhdGFUcmFuc2xhdGlvbih0cmFuc2xhdGUsIGRpcmVjdGlvbiwgcGF0aCkge1xuICAgICAgICB2YXIgdHJhbnNsYXRlRnVuYyA9IHRyYW5zbGF0ZSAmJiB0cmFuc2xhdGVbZGlyZWN0aW9uXTtcbiAgICAgICAgaWYgKCF0cmFuc2xhdGVGdW5jKSByZXR1cm47XG4gICAgICAgIGlmICh0eXBlb2YgdHJhbnNsYXRlRnVuYyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNsYXRlLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IGdldEZ1bmN0aW9uQ29udGV4dC5jYWxsKHRoaXMsIHRyYW5zbGF0ZS5jb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZUZ1bmMgPSB0cmFuc2xhdGVGdW5jLmJpbmQoY29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhVHJhbnNsYXRpb25zW2RpcmVjdGlvbl1bcGF0aF0gPSB0cmFuc2xhdGVGdW5jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpcmVjdGlvbiArICcgdHJhbnNsYXRvciBmb3IgJyArIHBhdGggKyAnIHNob3VsZCBiZSBmdW5jdGlvbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZERhdGFWYWxpZGF0aW9uKHZhbGlkYXRlLCBkaXJlY3Rpb24sIHBhdGgpIHtcbiAgICAgICAgdmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0ZSAmJiB2YWxpZGF0ZVtkaXJlY3Rpb25dO1xuICAgICAgICBpZiAoISB2YWxpZGF0b3JzKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGZvcm0gPSB0aGlzO1xuICAgICAgICB2YXIgZm9ybVZhbGlkYXRvcnMgPSBkYXRhVmFsaWRhdGlvbnNbZGlyZWN0aW9uXVtwYXRoXSA9IFtdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbGlkYXRvcnMpKVxuICAgICAgICAgICAgdmFsaWRhdG9ycy5mb3JFYWNoKF9hZGRWYWxpZGF0b3JGdW5jKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9ycyk7XG5cbiAgICAgICAgZnVuY3Rpb24gX2FkZFZhbGlkYXRvckZ1bmModmFsaWRhdG9yKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICB2YXIgdmFsRnVuYyA9IGdldFZhbGlkYXRvckZ1bmN0aW9uKHZhbGlkYXRvcik7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWxpZGF0b3IgaW5zdGFuY2VvZiBSZWdFeHApXG4gICAgICAgICAgICAgICAgdmFsRnVuYyA9IG1ha2VSZWdleFZhbGlkYXRvcih2YWxpZGF0b3IpO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbGlkYXRvciA9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIHZhbEZ1bmMgPSB2YWxpZGF0b3I7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpcmVjdGlvbiArICcgdmFsaWRhdG9yIGZvciAnICsgcGF0aCArICcgc2hvdWxkIGJlIGZ1bmN0aW9uIG9yIHN0cmluZycpO1xuXG4gICAgICAgICAgICBpZiAodmFsaWRhdGUuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgdmFsaWRhdGUuY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICB2YWxGdW5jID0gdmFsRnVuYy5iaW5kKGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3JtVmFsaWRhdG9ycy5wdXNoKHZhbEZ1bmMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGdldFZhbGlkYXRvckZ1bmN0aW9uKHZhbGlkYXRvck5hbWUpIHtcbiAgICB2YXIgdmFsRnVuYyA9IHZhbGlkYXRpb25GdW5jdGlvbnNbdmFsaWRhdG9yTmFtZV07XG4gICAgaWYgKCEgdmFsRnVuYylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3JtOiB1bmtub3duIHZhbGlkYXRvciBmdW5jdGlvbiBuYW1lICcgKyB2YWxpZGF0b3JOYW1lKTtcbiAgICByZXR1cm4gdmFsRnVuYztcbn1cblxuXG5mdW5jdGlvbiBtYWtlUmVnZXhWYWxpZGF0b3IodmFsaWRhdG9yUmVnRXhwKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdmFsaWQgPSB2YWxpZGF0b3JSZWdFeHAudGVzdChkYXRhKVxuICAgICAgICAgICAgLCByZXNwb25zZSA9IE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UodmFsaWQsICdzaG91bGQgbWF0Y2ggcGF0dGVybicpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG4gICAgfTtcbn1cblxuXG4vKipcbiAqIFByb2Nlc3NlcyBpdGVtcyBvZiB0aGUgZm9ybSAob3IgZ3JvdXApLlxuICogQ29tcG9uZW50IHRoYXQgaGFzIGl0ZW1zIHNob3VsZCBoYXZlIENvbnRhaW5lciBmYWNldC5cbiAqIFJldHVybnMgdHJhbnNsYXRpb24gcnVsZXMgZm9yIENvbm5lY3Rvci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXAgZm9ybSBvciBncm91cCBjb21wb25lbnRcbiAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zIGxpc3Qgb2YgaXRlbXMgaW4gc2NoZW1hXG4gKiBAcGFyYW0ge1N0cmluZ30gdmlld1BhdGggY3VycmVudCB2aWV3IHBhdGgsIHVzZWQgdG8gZ2VuZXJhdGUgQ29ubmVjdG9yIHRyYW5zbGF0aW9uIHJ1bGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZm9ybVZpZXdQYXRocyB2aWV3IHBhdGhzIGFjY3VtdWxhdGVkIHNvIGZhciAoaGF2ZSBjb21wb25lbnQgYW5kIHNjaGVtYSBwcm9wZXJ0aWVzKVxuICogQHBhcmFtIHtPYmplY3R9IGZvcm1Nb2RlbFBhdGhzIHZpZXcgcGF0aHMgYWNjdW11bGF0ZWQgc28gZmFyIChoYXZlIGNvbXBvbmVudCBhbmQgc2NoZW1hIHByb3BlcnRpZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxQYXRoVHJhbnNsYXRpb25zIG1vZGVsIHBhdGggdHJhbnNsYXRpb24gcnVsZXMgYWNjdW11bGF0ZWQgc28gZmFyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVRyYW5zbGF0aW9ucyBkYXRhIHRyYW5zbGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmFsaWRhdGlvbnMgZGF0YSB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gX3Byb2Nlc3NTY2hlbWFJdGVtcyhjb21wLCBpdGVtcywgdmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucykge1xuICAgIGlmICghIGNvbXAuY29udGFpbmVyKVxuICAgICAgICByZXR1cm4gbG9nZ2VyLndhcm4oJ0Zvcm0gV2FybmluZzogc2NoZW1hIGhhcyBpdGVtcyBidXQgY29tcG9uZW50IGhhcyBubyBjb250YWluZXIgZmFjZXQnKTtcblxuICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoIWl0ZW0uY29tcE5hbWUpIHJldHVybjsgLy8gTm8gY29tcG9uZW50LCBvbmx5IG1hcmt1cFxuXG4gICAgICAgIHZhciBpdGVtQ29tcCA9IGNvbXAuY29udGFpbmVyLnNjb3BlW2l0ZW0uY29tcE5hbWVdXG4gICAgICAgICAgICAsIGNvbXBWaWV3UGF0aCA9IHZpZXdQYXRoICsgJy4nICsgaXRlbS5jb21wTmFtZTtcbiAgICAgICAgaWYgKCEgaXRlbUNvbXApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbXBvbmVudCBcIicgKyBpdGVtLmNvbXBOYW1lICsgJ1wiIGlzIG5vdCBpbiBzY29wZSAob3Igc3Vic2NvcGUpIG9mIGZvcm0nKTtcbiAgICAgICAgcHJvY2Vzc1NjaGVtYS5jYWxsKHRoaXMsIGl0ZW1Db21wLCBpdGVtLCBjb21wVmlld1BhdGgsIGZvcm1WaWV3UGF0aHMsIGZvcm1Nb2RlbFBhdGhzLCBtb2RlbFBhdGhUcmFuc2xhdGlvbnMsIGRhdGFUcmFuc2xhdGlvbnMsIGRhdGFWYWxpZGF0aW9ucyk7XG4gICAgfSwgdGhpcyk7XG59XG5cblxuLyoqXG4gKiBTdWJzY3JpYmVzIHRvIG1lc3NhZ2VzIG9uIGZhY2V0cyBvZiBpdGVtcycgY29tcG9uZW50IGFzIGRlZmluZWQgaW4gc2NoZW1hXG4gKi9cbmZ1bmN0aW9uIF9wcm9jZXNzU2NoZW1hTWVzc2FnZXMoY29tcCwgbWVzc2FnZXMpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG4gICAgXy5lYWNoS2V5KG1lc3NhZ2VzLCBmdW5jdGlvbihmYWNldE1lc3NhZ2VzLCBmYWNldE5hbWUpIHtcbiAgICAgICAgdmFyIGZhY2V0ID0gY29tcFtmYWNldE5hbWVdO1xuICAgICAgICBpZiAoISBmYWNldClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2NoZW1hIGhhcyBzdWJzY3JpcHRpb25zIGZvciBmYWNldCBcIicgKyBmYWNldE5hbWUgKyAnXCIgb2YgZm9ybSBjb21wb25lbnQgXCInICsgY29tcC5uYW1lICsgJ1wiLCBidXQgY29tcG9uZW50IGhhcyBubyBmYWNldCcpO1xuICAgICAgICBmYWNldE1lc3NhZ2VzID0gXy5jbG9uZShmYWNldE1lc3NhZ2VzKTtcbiAgICAgICAgXy5lYWNoS2V5KGZhY2V0TWVzc2FnZXMsIGZ1bmN0aW9uKHN1YnNjcmliZXIsIG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHR5cGVvZiBzdWJzY3JpYmVyID09ICdvYmplY3QnID8gc3Vic2NyaWJlci5jb250ZXh0IDogbnVsbDtcblxuICAgICAgICAgICAgLy8gQXZvaWQgY2hhbmdpbmcgZXZlbnQgc3Vic2NyaXB0aW9ucyB3aG9zZSBjb250ZXh0IGlzICdmYWNldCcgb3IgJ293bmVyJy5cbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT0gJ2ZhY2V0JyAmJiBjb250ZXh0ICE9ICdvd25lcicpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gZ2V0RnVuY3Rpb25Db250ZXh0LmNhbGwoZm9ybSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBmYWNldE1lc3NhZ2VzW21lc3NhZ2VUeXBlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcjogc3Vic2NyaWJlci5zdWJzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZhY2V0Lm9uQ29uZmlnTWVzc2FnZXMoZmFjZXRNZXNzYWdlcyk7XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvYmplY3QgdG8gYmluZCBhIGZ1bmN0aW9uIHRvIGFzIGRlZmluZWQgYnkgYSBzZWN0aW9uIG9mIHRoZSBmb3JtIHNjaGVtYS5cbiAqXG4gKiBDdXJyZW50bHkgc3VwcG9ydGVkIGlucHV0cyBhcmU6XG4gKiAgLSB7T2JqZWN0fSAtIEFueSBvYmplY3RcbiAqICAtIHtTdHJpbmd9ICdmb3JtJyAtIFRoZSBmb3JtXG4gKiAgLSB7U3RyaW5nfSAnaG9zdCcgLSBUaGUgZm9ybSdzIGhvc3Qgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uQ29udGV4dChjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQgPT0gJ2Zvcm0nKVxuICAgICAgICBjb250ZXh0ID0gdGhpcztcbiAgICBlbHNlIGlmIChjb250ZXh0ID09ICdob3N0JylcbiAgICAgICAgY29udGV4dCA9IHRoaXMuZ2V0SG9zdE9iamVjdCgpO1xuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgIT0gJ29iamVjdCcpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb250ZXh0IHN1cHBsaWVkIC0gRXhwZWN0ZWQge1N0cmluZ30gW2hvc3QsZm9ybV0sIG9yIHtPYmplY3R9Jyk7XG5cbiAgICByZXR1cm4gY29udGV4dDtcbn1cblxuXG4vKipcbiAqIFZhbGlkYXRpb24gZnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlUmVxdWlyZWQoZGF0YSwgY2FsbGJhY2spIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgZGF0YSAhPSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICYmICh0eXBlb2YgZGF0YSAhPSAnc3RyaW5nJyB8fCBkYXRhLnRyaW0oKSAhPSAnJyk7XG4gICAgdmFyIHJlc3BvbnNlID0gTUxGb3JtJCR2YWxpZGF0b3JSZXNwb25zZSh2YWxpZCwgJ3BsZWFzZSBlbnRlciBhIHZhbHVlJywgJ1JFUVVJUkVEJyk7XG4gICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xufVxuXG5cbmZ1bmN0aW9uIE1MRm9ybSQkdmFsaWRhdG9yUmVzcG9uc2UodmFsaWQsIHJlYXNvbiwgcmVhc29uQ29kZSkge1xuICAgIHJldHVybiB2YWxpZFxuICAgICAgICAgICAgPyB7IHZhbGlkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyB2YWxpZDogZmFsc2UsIHJlYXNvbjogcmVhc29uLCByZWFzb25Db2RlOiByZWFzb25Db2RlIH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb1QgPSBtaWxvLnV0aWwuZG9UXG4gICAgLCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAsIGNvbXBvbmVudHNSZWdpc3RyeSA9IG1pbG8ucmVnaXN0cnkuY29tcG9uZW50c1xuICAgICwgbWlsb0NvdW50ID0gbWlsby51dGlsLmNvdW50XG4gICAgLCBjb21wb25lbnROYW1lID0gbWlsby51dGlsLmNvbXBvbmVudE5hbWVcbiAgICAsIGZvcm1SZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnknKTtcblxudmFyIGNhY2hlZEl0ZW1zID0ge307XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JtR2VuZXJhdG9yO1xuXG5cbnZhciBwYXJ0aWFscyA9IHtcbiAgICBsYWJlbDogXCJ7ez8gaXQuaXRlbS5sYWJlbCB9fVxcbiAgICA8bGFiZWw+e3s9IGl0Lml0ZW0ubGFiZWx9fTwvbGFiZWw+XFxue3s/fX1cXG5cIixcbiAgICBmb3JtR3JvdXA6IFwiPGRpdlxcbiAgICB7ez8gaXQuaXRlbS5hbHRUZXh0IH19dGl0bGU9XFxcInt7PSBpdC5pdGVtLmFsdFRleHR9fVxcXCIge3s/fX1cXG4gICAgY2xhc3M9XFxcImZvcm0tZ3JvdXB7ez8gaXQuaXRlbS53cmFwQ3NzQ2xhc3N9fSB7ez0gaXQuaXRlbS53cmFwQ3NzQ2xhc3MgfX17ez99fVxcXCJcXG4+XFxuXCJcbn07XG5cbnZhciBkb3REZWYgPSB7XG4gICAgcGFydGlhbHM6IHBhcnRpYWxzXG59O1xuXG5cbi8qXG4gKiBHZW5lcmF0ZXMgZm9ybSBIVE1MIGJhc2VkIG9uIHRoZSBzY2hlbWEuXG4gKiBJdCBkb2VzIG5vdCBjcmVhdGUgY29tcG9uZW50cyBmb3IgdGhlIGZvcm0gRE9NLCBtaWxvLmJpbmRlciBzaG91bGQgYmUgY2FsbGVkIHNlcGFyYXRlbHkgb24gdGhlIGZvcm0ncyBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHNjaGVtYSBhcnJheSBvZiBmb3JtIGVsZW1lbnRzIGRlc2NyaXB0b3JzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1HZW5lcmF0b3Ioc2NoZW1hKSB7XG4gICAgLy9nZXRJdGVtc0NsYXNzZXMoKTtcblxuICAgIHZhciByZW5kZXJlZEl0ZW1zID0gc2NoZW1hLml0ZW1zLm1hcChyZW5kZXJJdGVtKTtcbiAgICByZXR1cm4gcmVuZGVyZWRJdGVtcy5qb2luKCcnKTtcblxuICAgIGZ1bmN0aW9uIHJlbmRlckl0ZW0oaXRlbSkge1xuICAgICAgICB2YXIgaXRlbVR5cGUgPSBjYWNoZWRJdGVtc1tpdGVtLnR5cGVdO1xuXG4gICAgICAgIGlmICghaXRlbVR5cGUpIHtcbiAgICAgICAgICAgIHZhciBuZXdJdGVtVHlwZSA9IGZvcm1SZWdpc3RyeS5nZXQoaXRlbS50eXBlKTtcbiAgICAgICAgICAgIGl0ZW1UeXBlID0gY2FjaGVkSXRlbXNbaXRlbS50eXBlXSA9IHtcbiAgICAgICAgICAgICAgICBDb21wQ2xhc3M6IG5ld0l0ZW1UeXBlLmNvbXBDbGFzcyAmJiBjb21wb25lbnRzUmVnaXN0cnkuZ2V0KG5ld0l0ZW1UeXBlLmNvbXBDbGFzcyksXG4gICAgICAgICAgICAgICAgY29tcENsYXNzOiBuZXdJdGVtVHlwZS5jb21wQ2xhc3MsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IGRvVC5jb21waWxlKG5ld0l0ZW1UeXBlLnRlbXBsYXRlLCBkb3REZWYpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaXRlbS5jb21wTmFtZSA9IGl0ZW1UeXBlLkNvbXBDbGFzcyA/IGl0ZW0uY29tcE5hbWUgfHwgY29tcG9uZW50TmFtZSgpIDogbnVsbDtcblxuICAgICAgICB2YXIgZG9tRmFjZXRDb25maWcgPSBpdGVtVHlwZS5Db21wQ2xhc3MgJiYgaXRlbVR5cGUuQ29tcENsYXNzLmdldEZhY2V0Q29uZmlnKCdkb20nKVxuICAgICAgICAgICAgLCB0YWdOYW1lID0gZG9tRmFjZXRDb25maWcgJiYgZG9tRmFjZXRDb25maWcudGFnTmFtZSB8fCAnZGl2JztcblxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBpdGVtVHlwZS50ZW1wbGF0ZTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlKHtcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICBjb21wTmFtZTogaXRlbS5jb21wTmFtZSxcbiAgICAgICAgICAgIGNvbXBDbGFzczogaXRlbVR5cGUuY29tcENsYXNzLFxuICAgICAgICAgICAgdGFnTmFtZTogdGFnTmFtZSxcbiAgICAgICAgICAgIGZvcm1HZW5lcmF0b3I6IGZvcm1HZW5lcmF0b3IsXG4gICAgICAgICAgICBtaWxvQ291bnQ6IG1pbG9Db3VudCxcbiAgICAgICAgICAgIGRpc2FibGVkOiBpdGVtLmRpc2FibGVkLFxuICAgICAgICAgICAgbXVsdGlwbGU6IGl0ZW0ubXVsdGlwbGVcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nZ2VyID0gbWlsby51dGlsLmxvZ2dlclxuICAgICwgY2hlY2sgPSBtaWxvLnV0aWwuY2hlY2tcbiAgICAsIE1hdGNoID0gY2hlY2suTWF0Y2g7XG5cbnZhciBmb3JtVHlwZXMgPSB7fTtcbnZhciBkZWZhdWx0cyA9IHt9O1xuXG52YXIgZm9ybVJlZ2lzdHJ5ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0OiByZWdpc3RyeV9nZXQsXG4gICAgYWRkOiByZWdpc3RyeV9hZGQsXG4gICAgc2V0RGVmYXVsdHM6IHJlZ2lzdHJ5X3NldERlZmF1bHRzXG59O1xuXG5cbnZhciBERUZBVUxUX1RFTVBMQVRFID0gJ3t7IyBkZWYucGFydGlhbHMuZm9ybUdyb3VwIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyMgZGVmLnBhcnRpYWxzLmxhYmVsIH19XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8e3s9IGl0LnRhZ05hbWV9fSBtbC1iaW5kPVwie3s9IGl0LmNvbXBDbGFzc319Ont7PSBpdC5jb21wTmFtZSB9fVwiPlxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC97ez0gaXQudGFnTmFtZX19PlxcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xuXG5mb3JtUmVnaXN0cnkuc2V0RGVmYXVsdHMoe1xuICAgIHRlbXBsYXRlOiBERUZBVUxUX1RFTVBMQVRFLFxuICAgIG1vZGVsUGF0aFJ1bGU6ICdyZXF1aXJlZCcsXG4gICAgaXRlbUZ1bmN0aW9uOiBudWxsXG59KTtcblxuXG5mdW5jdGlvbiByZWdpc3RyeV9nZXQobmFtZSkge1xuICAgIHZhciBmb3JtSXRlbSA9IG5hbWUgJiYgZm9ybVR5cGVzW25hbWVdO1xuXG4gICAgaWYgKCFmb3JtSXRlbSkgXG4gICAgICAgIHJldHVybiBsb2dnZXIuZXJyb3IoJ0Zvcm0gaXRlbSAnICsgbmFtZSArICcgbm90IHJlZ2lzdGVyZWQnKTtcblxuICAgIHJldHVybiBmb3JtSXRlbTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0cnlfYWRkKG5hbWUsIG5ld0Zvcm1JdGVtKSB7XG4gICAgY2hlY2sobmFtZSwgU3RyaW5nKTtcbiAgICBjaGVjayhuZXdGb3JtSXRlbSwge1xuICAgICAgICBjb21wQ2xhc3M6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICAgIHRlbXBsYXRlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBtb2RlbFBhdGhSdWxlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICBpdGVtRnVuY3Rpb246IE1hdGNoLk9wdGlvbmFsKEZ1bmN0aW9uKVxuICAgIH0pO1xuXG4gICAgdmFyIGZvcm1JdGVtID0gXy5jbG9uZShkZWZhdWx0cyk7XG4gICAgXy5leHRlbmQoZm9ybUl0ZW0sIG5ld0Zvcm1JdGVtKTtcblxuICAgIGlmIChuYW1lICYmIGZvcm1UeXBlc1tuYW1lXSkgXG4gICAgICAgIHJldHVybiBsb2dnZXIuZXJyb3IoJ0Zvcm0gaXRlbSAnICsgbmFtZSArICcgYWxyZWFkeSByZWdpc3RlcmVkJyk7XG5cbiAgICBmb3JtVHlwZXNbbmFtZV0gPSBmb3JtSXRlbTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0cnlfc2V0RGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBjaGVjayhkZWZhdWx0cywgT2JqZWN0KTtcbiAgICBkZWZhdWx0cyA9IG5ld0RlZmF1bHRzO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbmlmICghKHdpbmRvdy5taWxvICYmIHdpbmRvdy5taWxvLm1pbG9fdmVyc2lvbikpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaWxvIGlzIG5vdCBhdmFpbGFibGUnKTtcblxuLyoqXG4gKiBgbWlsby11aWBcbiAqXG4gKiBUaGlzIGJ1bmRsZSB3aWxsIHJlZ2lzdGVyIGFkZGl0aW9uYWwgY29tcG9uZW50IGNsYXNzZXMgZm9yIFVJXG4gKi9cblxucmVxdWlyZSgnLi91c2VfY29tcG9uZW50cycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvR3JvdXAnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9XcmFwcGVyJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGV4dCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1NlbGVjdCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0lucHV0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvSW5wdXRMaXN0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGV4dGFyZWEnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9SYWRpb0dyb3VwJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvQ2hlY2tHcm91cCcpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0J1dHRvbicpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0h5cGVybGluaycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0xpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9MaXN0SXRlbVNpbXBsZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0xpc3RJdGVtJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvVGltZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0RhdGUnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Db21ibycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL1N1cGVyQ29tYm8nKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Db21ib0xpc3QnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9JbWFnZScpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL0Ryb3BUYXJnZXQnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9Gb2xkVHJlZScpO1xuXG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvYm9vdHN0cmFwL0FsZXJ0Jyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvYm9vdHN0cmFwL0RpYWxvZycpO1xucmVxdWlyZSgnLi9jb21wb25lbnRzL2Jvb3RzdHJhcC9Ecm9wZG93bicpO1xuXG5yZXF1aXJlKCcuL2Zvcm1zL0Zvcm0nKTtcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKSxnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oy8qIVxuICogYXN5bmNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IENhb2xhbiBNY01haG9uXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBhc3luYyA9IHt9O1xuICAgIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHYpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvQm9vbCh2KSB7XG4gICAgICAgIHJldHVybiAhIXY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vdElkKHYpIHtcbiAgICAgICAgcmV0dXJuICF2O1xuICAgIH1cblxuICAgIC8vIGdsb2JhbCBvbiB0aGUgc2VydmVyLCB3aW5kb3cgaW4gdGhlIGJyb3dzZXJcbiAgICB2YXIgcHJldmlvdXNfYXN5bmM7XG5cbiAgICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCAoYHNlbGZgKSBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbiAgICAvLyBvbiB0aGUgc2VydmVyLCBvciBgdGhpc2AgaW4gc29tZSB2aXJ0dWFsIG1hY2hpbmVzLiBXZSB1c2UgYHNlbGZgXG4gICAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgICB2YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fFxuICAgICAgICAgICAgdGhpcztcblxuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBjcm9zcy1icm93c2VyIGNvbXBhdGlibGl0eSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgdmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICB2YXIgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIF90b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIC8vIFBvcnRlZCBmcm9tIHVuZGVyc2NvcmUuanMgaXNPYmplY3RcbiAgICB2YXIgX2lzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9pc0FycmF5TGlrZShhcnIpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5KGFycikgfHwgKFxuICAgICAgICAgICAgLy8gaGFzIGEgcG9zaXRpdmUgaW50ZWdlciBsZW5ndGggcHJvcGVydHlcbiAgICAgICAgICAgIHR5cGVvZiBhcnIubGVuZ3RoID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoID49IDAgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggJSAxID09PSAwXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FycmF5RWFjaChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JhbmdlKGNvdW50KSB7XG4gICAgICAgIHJldHVybiBfbWFwKEFycmF5KGNvdW50KSwgZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGk7IH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWR1Y2UoYXJyLCBpdGVyYXRvciwgbWVtbykge1xuICAgICAgICBfYXJyYXlFYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvcihtZW1vLCB4LCBpLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mb3JFYWNoT2Yob2JqZWN0LCBpdGVyYXRvcikge1xuICAgICAgICBfYXJyYXlFYWNoKF9rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5kZXhPZihhcnIsIGl0ZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICB2YXIgX2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfa2V5SXRlcmF0b3IoY29sbCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB2YXIgbGVuO1xuICAgICAgICB2YXIga2V5cztcbiAgICAgICAgaWYgKF9pc0FycmF5TGlrZShjb2xsKSkge1xuICAgICAgICAgICAgbGVuID0gY29sbC5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBpIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gX2tleXMoY29sbCk7XG4gICAgICAgICAgICBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNpbWlsYXIgdG8gRVM2J3MgcmVzdCBwYXJhbSAoaHR0cDovL2FyaXlhLm9maWxhYnMuY29tLzIwMTMvMDMvZXM2LWFuZC1yZXN0LXBhcmFtZXRlci5odG1sKVxuICAgIC8vIFRoaXMgYWNjdW11bGF0ZXMgdGhlIGFyZ3VtZW50cyBwYXNzZWQgaW50byBhbiBhcnJheSwgYWZ0ZXIgYSBnaXZlbiBpbmRleC5cbiAgICAvLyBGcm9tIHVuZGVyc2NvcmUuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzIxNDApLlxuICAgIGZ1bmN0aW9uIF9yZXN0UGFyYW0oZnVuYywgc3RhcnRJbmRleCkge1xuICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCByZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEN1cnJlbnRseSB1bnVzZWQgYnV0IGhhbmRsZSBjYXNlcyBvdXRzaWRlIG9mIHRoZSBzd2l0Y2ggc3RhdGVtZW50OlxuICAgICAgICAgICAgLy8gdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICAgICAgICAvLyBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBleHBvcnRlZCBhc3luYyBtb2R1bGUgZnVuY3Rpb25zIC8vLy9cblxuICAgIC8vLy8gbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gd2l0aCBicm93c2VyLWNvbXBhdGlibGUgZmFsbGJhY2sgLy8vL1xuXG4gICAgLy8gY2FwdHVyZSB0aGUgZ2xvYmFsIHJlZmVyZW5jZSB0byBndWFyZCBhZ2FpbnN0IGZha2VUaW1lciBtb2Nrc1xuICAgIHZhciBfc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG5cbiAgICB2YXIgX2RlbGF5ID0gX3NldEltbWVkaWF0ZSA/IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0gOiBmdW5jdGlvbihmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBfZGVsYXk7XG4gICAgfVxuICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IF9zZXRJbW1lZGlhdGUgPyBfZGVsYXkgOiBhc3luYy5uZXh0VGljaztcblxuXG4gICAgYXN5bmMuZm9yRWFjaCA9XG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9XG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPVxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPVxuICAgIGFzeW5jLmVhY2hPZiA9IGZ1bmN0aW9uIChvYmplY3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmplY3QgPSBvYmplY3QgfHwgW107XG5cbiAgICAgICAgdmFyIGl0ZXIgPSBfa2V5SXRlcmF0b3Iob2JqZWN0KTtcbiAgICAgICAgdmFyIGtleSwgY29tcGxldGVkID0gMDtcblxuICAgICAgICB3aGlsZSAoKGtleSA9IGl0ZXIoKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbXBsZXRlZCA9PT0gMCkgY2FsbGJhY2sobnVsbCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgICAgIGNvbXBsZXRlZC0tO1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBrZXkgaXMgbnVsbCBpbiBjYXNlIGl0ZXJhdG9yIGlzbid0IGV4aGF1c3RlZFxuICAgICAgICAgICAgLy8gYW5kIGRvbmUgcmVzb2x2ZWQgc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gbnVsbCAmJiBjb21wbGV0ZWQgPD0gMCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZlNlcmllcyA9XG4gICAgYXN5bmMuZWFjaE9mU2VyaWVzID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoaXRlcmF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRlKCk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5mb3JFYWNoT2ZMaW1pdCA9XG4gICAgYXN5bmMuZWFjaE9mTGltaXQgPSBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9lYWNoT2ZMaW1pdChsaW1pdCkob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZWFjaE9mTGltaXQobGltaXQpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBydW5uaW5nID0gMDtcbiAgICAgICAgICAgIHZhciBlcnJvcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiByZXBsZW5pc2ggKCkge1xuICAgICAgICAgICAgICAgIGlmIChkb25lICYmIHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHJ1bm5pbmcgPCBsaW1pdCAmJiAhZXJyb3JlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBydW5uaW5nICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxlbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWwoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZiwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsTGltaXQoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihfZWFjaE9mTGltaXQobGltaXQpLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvU2VyaWVzKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2ZTZXJpZXMsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXN5bmNNYXAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKGFycikgPyBbXSA6IHt9O1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5tYXAgPSBkb1BhcmFsbGVsKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwU2VyaWVzID0gZG9TZXJpZXMoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfYXN5bmNNYXApO1xuXG4gICAgLy8gcmVkdWNlIG9ubHkgaGFzIGEgc2VyaWVzIHZlcnNpb24sIGFzIGRvaW5nIHJlZHVjZSBpbiBwYXJhbGxlbCB3b24ndFxuICAgIC8vIHdvcmsgaW4gbWFueSBzaXR1YXRpb25zLlxuICAgIGFzeW5jLmluamVjdCA9XG4gICAgYXN5bmMuZm9sZGwgPVxuICAgIGFzeW5jLnJlZHVjZSA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBmdW5jdGlvbiAoeCwgaSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHgsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICBtZW1vID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5mb2xkciA9XG4gICAgYXN5bmMucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJldmVyc2VkID0gX21hcChhcnIsIGlkZW50aXR5KS5yZXZlcnNlKCk7XG4gICAgICAgIGFzeW5jLnJlZHVjZShyZXZlcnNlZCwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudHJhbnNmb3JtID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGl0ZXJhdG9yO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSBtZW1vO1xuICAgICAgICAgICAgbWVtbyA9IF9pc0FycmF5KGFycikgPyBbXSA6IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgYXN5bmMuZWFjaE9mKGFyciwgZnVuY3Rpb24odiwgaywgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHYsIGssIGNiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZpbHRlcihlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtpbmRleDogaW5kZXgsIHZhbHVlOiB4fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soX21hcChyZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgICAgICB9KSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuc2VsZWN0ID1cbiAgICBhc3luYy5maWx0ZXIgPSBkb1BhcmFsbGVsKF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0TGltaXQgPVxuICAgIGFzeW5jLmZpbHRlckxpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0U2VyaWVzID1cbiAgICBhc3luYy5maWx0ZXJTZXJpZXMgPSBkb1NlcmllcyhfZmlsdGVyKTtcblxuICAgIGZ1bmN0aW9uIF9yZWplY3QoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZmlsdGVyKGVhY2hmbiwgYXJyLCBmdW5jdGlvbih2YWx1ZSwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgY2IoIXYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgYXN5bmMucmVqZWN0ID0gZG9QYXJhbGxlbChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RTZXJpZXMgPSBkb1NlcmllcyhfcmVqZWN0KTtcblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVUZXN0ZXIoZWFjaGZuLCBjaGVjaywgZ2V0UmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2IpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNiKSBjYihnZXRSZXN1bHQoZmFsc2UsIHZvaWQgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZWUoeCwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNiKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2IgJiYgY2hlY2sodikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKGdldFJlc3VsdCh0cnVlLCB4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGxpbWl0LCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3I7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBsaW1pdDtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMuYW55ID1cbiAgICBhc3luYy5zb21lID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuc29tZUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5hbGwgPVxuICAgIGFzeW5jLmV2ZXJ5ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIG5vdElkLCBub3RJZCk7XG5cbiAgICBhc3luYy5ldmVyeUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgbm90SWQsIG5vdElkKTtcblxuICAgIGZ1bmN0aW9uIF9maW5kR2V0UmVzdWx0KHYsIHgpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIGFzeW5jLmRldGVjdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdFNlcmllcyA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mU2VyaWVzLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdExpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcblxuICAgIGFzeW5jLnNvcnRCeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5tYXAoYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uIChlcnIsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge3ZhbHVlOiB4LCBjcml0ZXJpYTogY3JpdGVyaWF9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgX21hcChyZXN1bHRzLnNvcnQoY29tcGFyYXRvciksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBjb21wYXJhdG9yKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWEsIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5hdXRvID0gZnVuY3Rpb24gKHRhc2tzLCBjb25jdXJyZW5jeSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGNvbmN1cnJlbmN5IGlzIG9wdGlvbmFsLCBzaGlmdCB0aGUgYXJncy5cbiAgICAgICAgICAgIGNhbGxiYWNrID0gY29uY3VycmVuY3k7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSByZW1haW5pbmdUYXNrcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG4gICAgICAgIHZhciBydW5uaW5nVGFza3MgPSAwO1xuXG4gICAgICAgIHZhciBoYXNFcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgdmFyIGlkeCA9IF9pbmRleE9mKGxpc3RlbmVycywgZm4pO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBsaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGFza0NvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLTtcbiAgICAgICAgICAgIF9hcnJheUVhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9hcnJheUVhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIGlmIChoYXNFcnJvcikgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBfaXNBcnJheSh0YXNrc1trXSkgPyB0YXNrc1trXTogW3Rhc2tzW2tdXTtcbiAgICAgICAgICAgIHZhciB0YXNrQ2FsbGJhY2sgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfZm9yRWFjaE9mKHJlc3VsdHMsIGZ1bmN0aW9uKHZhbCwgcmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNbcmtleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgdGFzay5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVhZC1sb2Nrc1xuICAgICAgICAgICAgdmFyIGxlbiA9IHJlcXVpcmVzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkZXA7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShkZXAgPSB0YXNrc1tyZXF1aXJlc1tsZW5dXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgbm9uZXhpc3RlbnQgZGVwZW5kZW5jeSBpbiAnICsgcmVxdWlyZXMuam9pbignLCAnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfaXNBcnJheShkZXApICYmIF9pbmRleE9mKGRlcCwgaykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmdUYXNrcyA8IGNvbmN1cnJlbmN5ICYmIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKSAmJiAhcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzKys7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBydW5uaW5nVGFza3MrKztcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gICAgYXN5bmMucmV0cnkgPSBmdW5jdGlvbih0aW1lcywgdGFzaywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIERFRkFVTFRfVElNRVMgPSA1O1xuICAgICAgICB2YXIgREVGQVVMVF9JTlRFUlZBTCA9IDA7XG5cbiAgICAgICAgdmFyIGF0dGVtcHRzID0gW107XG5cbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICB0aW1lczogREVGQVVMVF9USU1FUyxcbiAgICAgICAgICAgIGludGVydmFsOiBERUZBVUxUX0lOVEVSVkFMXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gcGFyc2VUaW1lcyhhY2MsIHQpe1xuICAgICAgICAgICAgaWYodHlwZW9mIHQgPT09ICdudW1iZXInKXtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgdCA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQudGltZXMsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgICAgIGFjYy5pbnRlcnZhbCA9IHBhcnNlSW50KHQuaW50ZXJ2YWwsIDEwKSB8fCBERUZBVUxUX0lOVEVSVkFMO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGFyZ3VtZW50IHR5cGUgZm9yIFxcJ3RpbWVzXFwnOiAnICsgdHlwZW9mIHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPCAxIHx8IGxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudHMgLSBtdXN0IGJlIGVpdGhlciAodGFzayksICh0YXNrLCBjYWxsYmFjayksICh0aW1lcywgdGFzaykgb3IgKHRpbWVzLCB0YXNrLCBjYWxsYmFjayknKTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPD0gMiAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdGFzaztcbiAgICAgICAgICAgIHRhc2sgPSB0aW1lcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRpbWVzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBwYXJzZVRpbWVzKG9wdHMsIHRpbWVzKTtcbiAgICAgICAgfVxuICAgICAgICBvcHRzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIG9wdHMudGFzayA9IHRhc2s7XG5cbiAgICAgICAgZnVuY3Rpb24gd3JhcHBlZFRhc2sod3JhcHBlZENhbGxiYWNrLCB3cmFwcGVkUmVzdWx0cykge1xuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlBdHRlbXB0KHRhc2ssIGZpbmFsQXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrKGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKCFlcnIgfHwgZmluYWxBdHRlbXB0LCB7ZXJyOiBlcnIsIHJlc3VsdDogcmVzdWx0fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHdyYXBwZWRSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUludGVydmFsKGludGVydmFsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spe1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlIChvcHRzLnRpbWVzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmluYWxBdHRlbXB0ID0gIShvcHRzLnRpbWVzLT0xKTtcbiAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5QXR0ZW1wdChvcHRzLnRhc2ssIGZpbmFsQXR0ZW1wdCkpO1xuICAgICAgICAgICAgICAgIGlmKCFmaW5hbEF0dGVtcHQgJiYgb3B0cy5pbnRlcnZhbCA+IDApe1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5SW50ZXJ2YWwob3B0cy5pbnRlcnZhbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMuc2VyaWVzKGF0dGVtcHRzLCBmdW5jdGlvbihkb25lLCBkYXRhKXtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICh3cmFwcGVkQ2FsbGJhY2sgfHwgb3B0cy5jYWxsYmFjaykoZGF0YS5lcnIsIGRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBpcyBwYXNzZWQsIHJ1biB0aGlzIGFzIGEgY29udHJvbGwgZmxvd1xuICAgICAgICByZXR1cm4gb3B0cy5jYWxsYmFjayA/IHdyYXBwZWRUYXNrKCkgOiB3cmFwcGVkVGFzaztcbiAgICB9O1xuXG4gICAgYXN5bmMud2F0ZXJmYWxsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHRhc2tzKSkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gd2F0ZXJmYWxsIG11c3QgYmUgYW4gYXJyYXkgb2YgZnVuY3Rpb25zJyk7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gd3JhcEl0ZXJhdG9yKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2god3JhcEl0ZXJhdG9yKG5leHQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5zdXJlQXN5bmMoaXRlcmF0b3IpLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdyYXBJdGVyYXRvcihhc3luYy5pdGVyYXRvcih0YXNrcykpKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9wYXJhbGxlbChlYWNoZm4sIHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKHRhc2tzKSA/IFtdIDoge307XG5cbiAgICAgICAgZWFjaGZuKHRhc2tzLCBmdW5jdGlvbiAodGFzaywga2V5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdGFzayhfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5wYXJhbGxlbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZiwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uKHRhc2tzLCBsaW1pdCwgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKF9lYWNoT2ZMaW1pdChsaW1pdCksIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcmllcyA9IGZ1bmN0aW9uKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mU2VyaWVzLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5pdGVyYXRvciA9IGZ1bmN0aW9uICh0YXNrcykge1xuICAgICAgICBmdW5jdGlvbiBtYWtlQ2FsbGJhY2soaW5kZXgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZuKCkge1xuICAgICAgICAgICAgICAgIGlmICh0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFza3NbaW5kZXhdLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmbi5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmbi5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaW5kZXggPCB0YXNrcy5sZW5ndGggLSAxKSA/IG1ha2VDYWxsYmFjayhpbmRleCArIDEpOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFrZUNhbGxiYWNrKDApO1xuICAgIH07XG5cbiAgICBhc3luYy5hcHBseSA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChjYWxsQXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KFxuICAgICAgICAgICAgICAgIG51bGwsIGFyZ3MuY29uY2F0KGNhbGxBcmdzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBfY29uY2F0KGVhY2hmbiwgYXJyLCBmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNiKSB7XG4gICAgICAgICAgICBmbih4LCBmdW5jdGlvbiAoZXJyLCB5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh5IHx8IFtdKTtcbiAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmNvbmNhdCA9IGRvUGFyYWxsZWwoX2NvbmNhdCk7XG4gICAgYXN5bmMuY29uY2F0U2VyaWVzID0gZG9TZXJpZXMoX2NvbmNhdCk7XG5cbiAgICBhc3luYy53aGlsc3QgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgaWYgKHRlc3QoKSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3QuYXBwbHkodGhpcywgYXJncykpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgW251bGxdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvV2hpbHN0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICsrY2FsbHMgPD0gMSB8fCB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnVudGlsID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvVW50aWwgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5kb1doaWxzdChpdGVyYXRvciwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kdXJpbmcgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcblxuICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGNoZWNrKTtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbihlcnIsIHRydXRoKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHJ1dGgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGVzdChjaGVjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvRHVyaW5nID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICBhc3luYy5kdXJpbmcoZnVuY3Rpb24obmV4dCkge1xuICAgICAgICAgICAgaWYgKGNhbGxzKysgPCAxKSB7XG4gICAgICAgICAgICAgICAgbmV4dChudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcXVldWUod29ya2VyLCBjb25jdXJyZW5jeSwgcGF5bG9hZCkge1xuICAgICAgICBpZiAoY29uY3VycmVuY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uY3VycmVuY3kgbXVzdCBub3QgYmUgemVybycpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcG9zLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwICYmIHEuaWRsZSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrIHx8IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX25leHQocSwgdGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcblxuICAgICAgICAgICAgICAgIHZhciByZW1vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgX2FycmF5RWFjaCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgX2FycmF5RWFjaCh3b3JrZXJzTGlzdCwgZnVuY3Rpb24gKHdvcmtlciwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXIgPT09IHRhc2sgJiYgIXJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0YXNrLmNhbGxiYWNrLmFwcGx5KHRhc2ssIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd29ya2VycyA9IDA7XG4gICAgICAgIHZhciB3b3JrZXJzTGlzdCA9IFtdO1xuICAgICAgICB2YXIgcSA9IHtcbiAgICAgICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5OiBjb25jdXJyZW5jeSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG5vb3AsXG4gICAgICAgICAgICBlbXB0eTogbm9vcCxcbiAgICAgICAgICAgIGRyYWluOiBub29wLFxuICAgICAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluID0gbm9vcDtcbiAgICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdoaWxlKCFxLnBhdXNlZCAmJiB3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLnRhc2tzLmxlbmd0aCl7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2tzID0gcS5wYXlsb2FkID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKDAsIHEucGF5bG9hZCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS50YXNrcy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gX21hcCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Vyc0xpc3QucHVzaCh0YXNrc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXIoZGF0YSwgY2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdvcmtlcnNMaXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnNMaXN0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkgeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bWVDb3VudCA9IE1hdGgubWluKHEuY29uY3VycmVuY3ksIHEudGFza3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIHcgPSAxOyB3IDw9IHJlc3VtZUNvdW50OyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcTtcbiAgICB9XG5cbiAgICBhc3luYy5xdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIHZhciBxID0gX3F1ZXVlKGZ1bmN0aW9uIChpdGVtcywgY2IpIHtcbiAgICAgICAgICAgIHdvcmtlcihpdGVtc1swXSwgY2IpO1xuICAgICAgICB9LCBjb25jdXJyZW5jeSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLnByaW9yaXR5UXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlVGFza3MoYSwgYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYmluYXJ5U2VhcmNoKHNlcXVlbmNlLCBpdGVtLCBjb21wYXJlKSB7XG4gICAgICAgICAgICB2YXIgYmVnID0gLTEsXG4gICAgICAgICAgICAgICAgZW5kID0gc2VxdWVuY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChiZWcgPCBlbmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWlkID0gYmVnICsgKChlbmQgLSBiZWcgKyAxKSA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZShfYmluYXJ5U2VhcmNoKHEudGFza3MsIGl0ZW0sIF9jb21wYXJlVGFza3MpICsgMSwgMCwgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBhc3luYy5xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KTtcblxuICAgICAgICAvLyBPdmVycmlkZSBwdXNoIHRvIGFjY2VwdCBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyBwcmlvcml0eVxuICAgICAgICBxLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHVuc2hpZnQgZnVuY3Rpb25cbiAgICAgICAgZGVsZXRlIHEudW5zaGlmdDtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY2FyZ28gPSBmdW5jdGlvbiAod29ya2VyLCBwYXlsb2FkKSB7XG4gICAgICAgIHJldHVybiBfcXVldWUod29ya2VyLCAxLCBwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbnNvbGVfZm4obmFtZSkge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmxvZyA9IF9jb25zb2xlX2ZuKCdsb2cnKTtcbiAgICBhc3luYy5kaXIgPSBfY29uc29sZV9mbignZGlyJyk7XG4gICAgLyphc3luYy5pbmZvID0gX2NvbnNvbGVfZm4oJ2luZm8nKTtcbiAgICBhc3luYy53YXJuID0gX2NvbnNvbGVfZm4oJ3dhcm4nKTtcbiAgICBhc3luYy5lcnJvciA9IF9jb25zb2xlX2ZuKCdlcnJvcicpOyovXG5cbiAgICBhc3luYy5tZW1vaXplID0gZnVuY3Rpb24gKGZuLCBoYXNoZXIpIHtcbiAgICAgICAgdmFyIG1lbW8gPSB7fTtcbiAgICAgICAgdmFyIHF1ZXVlcyA9IHt9O1xuICAgICAgICB2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGlkZW50aXR5O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIG1lbW9pemVkKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGhhcy5jYWxsKG1lbW8sIGtleSkpIHsgICBcbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaGFzLmNhbGwocXVldWVzLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0ucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XSA9IFtjYWxsYmFja107XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtb1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHEgPSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxW2ldLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBtZW1vaXplZC5tZW1vID0gbWVtbztcbiAgICAgICAgbWVtb2l6ZWQudW5tZW1vaXplZCA9IGZuO1xuICAgICAgICByZXR1cm4gbWVtb2l6ZWQ7XG4gICAgfTtcblxuICAgIGFzeW5jLnVubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChmbi51bm1lbW9pemVkIHx8IGZuKS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfdGltZXMobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY291bnQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgbWFwcGVyKF9yYW5nZShjb3VudCksIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMudGltZXMgPSBfdGltZXMoYXN5bmMubWFwKTtcbiAgICBhc3luYy50aW1lc1NlcmllcyA9IF90aW1lcyhhc3luYy5tYXBTZXJpZXMpO1xuICAgIGFzeW5jLnRpbWVzTGltaXQgPSBmdW5jdGlvbiAoY291bnQsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLm1hcExpbWl0KF9yYW5nZShjb3VudCksIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXEgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHZhciBmbnMgPSBhcmd1bWVudHM7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gbm9vcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMucmVkdWNlKGZucywgYXJncywgZnVuY3Rpb24gKG5ld2FyZ3MsIGZuLCBjYikge1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIG5ld2FyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIG5leHRhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNiKGVyciwgbmV4dGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGF0LCBbZXJyXS5jb25jYXQocmVzdWx0cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5jb21wb3NlID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICByZXR1cm4gYXN5bmMuc2VxLmFwcGx5KG51bGwsIEFycmF5LnByb3RvdHlwZS5yZXZlcnNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuXG4gICAgZnVuY3Rpb24gX2FwcGx5RWFjaChlYWNoZm4pIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24oZm5zLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZ28gPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWFjaGZuKGZucywgZnVuY3Rpb24gKGZuLCBfLCBjYikge1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzLmNvbmNhdChbY2JdKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnby5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBnbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuYXBwbHlFYWNoID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2YpO1xuICAgIGFzeW5jLmFwcGx5RWFjaFNlcmllcyA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mU2VyaWVzKTtcblxuXG4gICAgYXN5bmMuZm9yZXZlciA9IGZ1bmN0aW9uIChmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRvbmUgPSBvbmx5X29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciB0YXNrID0gZW5zdXJlQXN5bmMoZm4pO1xuICAgICAgICBmdW5jdGlvbiBuZXh0KGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXNrKG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIG5leHQoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZW5zdXJlQXN5bmMoZm4pIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICBhcmdzLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbm5lckFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGlubmVyQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGlubmVyQXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuZW5zdXJlQXN5bmMgPSBlbnN1cmVBc3luYztcblxuICAgIGFzeW5jLmNvbnN0YW50ID0gX3Jlc3RQYXJhbShmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbbnVsbF0uY29uY2F0KHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFzeW5jLndyYXBTeW5jID1cbiAgICBhc3luYy5hc3luY2lmeSA9IGZ1bmN0aW9uIGFzeW5jaWZ5KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHJlc3VsdCBpcyBQcm9taXNlIG9iamVjdFxuICAgICAgICAgICAgaWYgKF9pc09iamVjdChyZXN1bHQpICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyci5tZXNzYWdlID8gZXJyIDogbmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gTm9kZS5qc1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGFzeW5jO1xuICAgIH1cbiAgICAvLyBBTUQgLyBSZXF1aXJlSlNcbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlZCBkaXJlY3RseSB2aWEgPHNjcmlwdD4gdGFnXG4gICAgZWxzZSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBhc3luYztcbiAgICB9XG5cbn0oKSk7XG4iLCJcbi8vIG5vdCBpbXBsZW1lbnRlZFxuLy8gVGhlIHJlYXNvbiBmb3IgaGF2aW5nIGFuIGVtcHR5IGZpbGUgYW5kIG5vdCB0aHJvd2luZyBpcyB0byBhbGxvd1xuLy8gdW50cmFkaXRpb25hbCBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIG1vZHVsZS5cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiJdfQ==
;