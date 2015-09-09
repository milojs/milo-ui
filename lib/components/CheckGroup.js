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
        template: '{{~ it.checkOptions :option }} \
                        {{##def.elID:{{= it.elementName }}-{{= option.value }}#}} \
                        <span class="{{= it._renderOptions.optionCssClass || "' + ELEMENT_NAME_PREFIX + 'option" }}"> \
                            <input id="{{# def.elID }}" type="checkbox" value="{{= option.value }}" name="{{= it.elementName }}"> \
                            <label for="{{# def.elID }}">{{= option.label }}</label> \
                        </span> \
                   {{~}}'
    }
});

componentsRegistry.add(MLCheckGroup);

module.exports = MLCheckGroup;


_.extendProto(MLCheckGroup, {
    init: MLCheckGroup$init,
    destroy: MLCheckGroup$destroy,
    setRenderOptions: MLCheckGroup$setRenderOptions
});


/**
 * Component instance method
 * Initialize radio group and setup
 */
function MLCheckGroup$init() {
    _.defineProperty(this, '_checkList', [], _.CONF);
    _.defineProperty(this, ELEMENT_NAME_PROPERTY, ELEMENT_NAME_PREFIX + uniqueId());
    this._renderOptions = {};
    Component.prototype.init.apply(this, arguments);
}


function MLCheckGroup$setRenderOptions(options) {
    this._renderOptions = options;
}


/**
 * Sets group value
 * Replaces the data set operation to deal with radio buttons
 *
 * @param {Mixed} value The value to be set
 */
function MLCheckGroup_set(value) {
    var options = this._checkList
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
function MLCheckGroup_get() {
    return this._checkList.map(function (checkbox) {
        return checkbox.checked && checkbox.value;
    }).filter(_.identity);
}


/**
 * Deleted group value
 * Deletes the value of the group, setting it to empty
 */
function MLCheckGroup_del() {
    var options = this._checkList;
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
    if (event.target.type == 'checkbox')
        dispatchChangeMessage.call(this);
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

    var radioEls = this.el.querySelectorAll('input[type="checkbox"]')
        , options = _.toArray(radioEls);

    this._checkList.length = 0;
    this._checkList.splice.apply(this._checkList, [0, 0].concat(options));
}


function MLCheckGroup$destroy() {
    delete this._checkList;
    Component.prototype.destroy.apply(this, arguments);
}
