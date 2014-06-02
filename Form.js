'use strict';

var formGenerator = require('./generator')
    , Component = milo.Component
    , componentsRegistry = milo.registry.components
    , itemTypes = require('./item_types')
    , check = milo.util.check
    , FormError = milo.util.error.createClass('Form')
    , logger = milo.util.logger
    , Promise = milo.util.promise
    , modelChangedCommand = require('../commands/model_changed')
    , async = require('async');


var FORM_VALIDATION_FAILED_CSS_CLASS = 'has-error';

/**
 * A component class for generating forms from schema
 * To create form class method [createForm](#CCForm$$createForm) should be used.
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
 *             messages: {                      // to subscribe to messages on item's component facets
 *                 events: {                    // facet to subscribe to
 *                     '<message1>': onMessage1 // message and subscriber function
 *                     '<msg2> <msg3>': {       // subscribe to 2 messages
 *                         subscriber: onMessage2,
 *                         context: context     // context can be an object or a string:
 *                                              //    "facet": facet instance will be used as context
 *                                              //    "owner": item component instance will be used as context
 *                                              //    "host": host object passed to createForm method will be used as context
 *                     }
 *                 }
 *             },
 *             translate: {          // optional data translation functions
 *                 toModel: func1,   // translates item data from view to model
 *                 fromModel: func2  // translates item data from model to view
 *             },
 *             validate: {           // optional data validation functions
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
var CCForm = Component.createComponentClass('CCForm', {
    dom: {
        cls: 'cc-module-inspector'
    },
    model: undefined,
    container: undefined,
    data: undefined,
    events: undefined
});

componentsRegistry.add(CCForm);

module.exports = CCForm;


_.extend(CCForm, {
    createForm: CCForm$$createForm
});

_.extendProto(CCForm, {
    isValid: CCForm$isValid,
    getInvalidControls: CCForm$getInvalidControls,
    getInvalidReason: CCForm$getInvalidReason,
    modelPathComponent: CCForm$modelPathComponent,
    modelPathSchema: CCForm$modelPathSchema,
    viewPathComponent: CCForm$viewPathComponent,
    viewPathSchema: CCForm$viewPathSchema,
    destroy: CCForm$destroy
});


/**
 * CCForm class method
 * Creates form from schema.
 * Form data can be obtained from its Model (`form.model`), reactive connection to form's model can also be used.
 *
 * @param {Object} schema form schema, as described above
 * @param {Object} hostObject form host object, used to define as message subscriber context in schema - by convention the context should be defined as "host"
 * @param {Object} formData data to initialize the form with
 * @param {String} template optional form template, will be used instead of automatically generated from schema. Not recommended to use, as it will have to be maintained to be consistent with schema for bindings.
 * @return {CCForm}
 */
function CCForm$$createForm(schema, hostObject, formData, template) {
    var form = _createFormComponent();
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
        return CCForm.createOnElement(undefined, template);
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
            processSchema.call(hostObject, form, schema, '', formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations);
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
        
        form.model.on('validated', createOnValidated(false));
        form.data.on('validated', createOnValidated(true));

        function createOnValidated(isToModel) {
            var pathCompMethod = isToModel ? 'viewPathComponent' : 'modelPathComponent'
                , pathSchemaMethod = isToModel ? 'viewPathSchema' : 'modelPathSchema';

            return function(msg, response) {
                var component = form[pathCompMethod](response.path)
                    , schema = form[pathSchemaMethod](response.path)
                    , label = schema.label
                    , modelPath = schema.modelPath;

                if (component) {
                    var parentEl = component.el.parentNode;
                    parentEl.classList.toggle(FORM_VALIDATION_FAILED_CSS_CLASS, ! response.valid);

                    if (response.valid) {
                        parentEl.title = '';
                        delete form._invalidFormControls[modelPath];
                    } else {
                        var reason = {
                            label: label || '',
                            reason: response.reason
                        };
                        parentEl.title = reason.label + ' : ' + reason.reason;
                        form._invalidFormControls[modelPath] = {
                            component: component,
                            reason: reason
                        };
                    }
                } else
                    logger.error('Form: component for path ' + response.path + ' not found');
            };
        }
    }
}


/**
 * Returns current validation status of the form
 * Will not validate fields that were never changed in view
 *
 * @return {Boolean}
 */
function CCForm$isValid() {
    return Object.keys(this._invalidFormControls).length == 0;
}


/**
 * Returns map of invalid controls and reasons (view paths are keys)
 *
 * @return {Object}
 */
function CCForm$getInvalidControls() {
    return this._invalidFormControls;
}


/**
 * Returns an array of strings with all reasons for the form being invalid
 *
 * @return {Array[String]}
 */
function CCForm$getInvalidReason() {
    var invalidControls = this.getInvalidControls();
    var reason = _.reduceKeys(invalidControls,
        function(memo, invalidControl, compName) {
            invalidControl.reason.modelPath = this.viewPathSchema(compName).modelPath;
            memo.push(invalidControl.reason);
            return memo;
        }, [], this);
    return reason;
}


/**
 * Returns component for a given modelPath
 *
 * @param {String} modelPath
 * @return {Component}
 */
function CCForm$modelPathComponent(modelPath) {
    var modelPathObj = this._formModelPaths[modelPath];
    return modelPathObj && modelPathObj.component;
}


/**
 * Returns form schema for a given modelPath
 *
 * @param {String} modelPath
 * @return {Object}
 */
function CCForm$modelPathSchema(modelPath) {
    var modelPathObj = this._formModelPaths[modelPath];
    return modelPathObj && modelPathObj.schema;
}


/**
 * Returns component for a given view path (path as defined in Data facet)
 *
 * @param {String} viewPath
 * @return {Component}
 */
function CCForm$viewPathComponent(viewPath) {
    var viewPathObj = this._formViewPaths[viewPath];
    return viewPathObj && viewPathObj.component;
}


/**
 * Returns form schema for a given view path item (path as defined in Data facet)
 *
 * @param {String} viewPath
 * @return {Object}
 */
function CCForm$viewPathSchema(viewPath) {
    var viewPathObj = this._formViewPaths[viewPath];
    return viewPathObj && viewPathObj.schema;
}


function CCForm$destroy() {
    Component.prototype.destroy.apply(this, arguments);
    this._connector && milo.minder.destroyConnector(this._connector);
    this._connector = null;
}


/**
 * See item_types.js for item classes and templates
 * Map of items types to items components classes
 * UI components are defined in `milo`
 */


/**
 * modelPath translation rules for item types.
 * Default is "required"
 */
var modelPathRules = {
    group: 'prohibited',
    wrapper: 'prohibited',
    button: 'optional',
    hyperlink: 'optional',
    text: 'optional',
    droptarget: 'prohibited',
    previewcropall: 'prohibited',
    articlehistory: 'prohibited'
};

/**
 * Special processing functions for some types of items
 */
var itemsFunctions = {
    select: _processSelectSchema,
    radio: _processRadioSchema,
    combo: _processComboSchema,
    supercombo: _processSuperComboSchema,
    combolist: _processComboListSchema,
    inputlist: _processInputListSchema,
    textarea: _processTextareaSchema
    //linkedlist: _processLinkedList

};

/**
 * Predefined for validation functions
 */
var validationFunctions = {
    'required': validateRequired,

    'url': validateUrl
};


var _itemsSchemaRules = _.mapKeys(itemTypes, function(className, itemType) {
    return {
        // CompClass: componentsRegistry.get(className),
        func: itemsFunctions[itemType] || doNothing,
        modelPathRule: modelPathRules[itemType] || 'required'
    };
});

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

    var itemRules = _itemsSchemaRules[schema.type];

    if (viewPath) {
        formViewPaths[viewPath] = {
            schema: schema,
            component: comp
        };

        if (itemRules) {
            check(comp, itemTypes[schema.type].CompClass);
            itemRules.func.call(this, comp, schema);
            _processItemTranslations(viewPath, schema);
        } else
            throw new FormError('unknown item type ' + schema.type);
    }

    if (schema.undoable)
        _manageUndoable(this, comp, schema.modelPath);

    return modelPathTranslations;


    function _processItemTranslations(viewPath, schema) {
        var modelPath = schema.modelPath
            , notInModel = schema.notInModel
            , translate = schema.translate
            , validate = schema.validate;

        if (viewPath) {
            _addDataTranslation(translate, 'toModel', viewPath);
            _addDataValidation(validate, 'toModel', viewPath);
            _addDataValidation(validate, 'fromModel', modelPath);

            switch (itemRules.modelPathRule) {
                case 'prohibited':
                    if (modelPath)
                        throw new FormError('modelPath is prohibited for item type ' + schema.type);
                    break;
                case 'required':
                    if (! (modelPath || notInModel))
                        throw new FormError('modelPath is required for item type ' + schema.type + ' . Add "noModelPath: true" to override');
                    // falling through to 'optional'
                case 'optional':
                    if (modelPath) {
                        formModelPaths[modelPath] = {
                            schema: schema,
                            component: comp
                        };

                        if (! notInModel) {
                            _addModelPathTranslation(viewPath, modelPath);
                            _addDataTranslation(translate, 'fromModel', modelPath);
                            _addDataValidation(validate, 'fromModel', modelPath);
                        }
                    }
                    break;
                default:
                    throw new FormError('unknown modelPath rule for item type ' + schema.type);
            }
        }
    }

    function _manageUndoable(hostObject, inspComp, modelPath) {
        var oldValue;

        inspComp.data.on('', function(msg, data) {
            // Keep old value up to date to be used by the change event handler
            oldValue = data.oldValue;
        });

        inspComp.events.on('change', function(type, event) {
            var newValue = inspComp.data.get();
            if (newValue === oldValue) return;

            var cmd = modelChangedCommand.createWithUndo(hostObject, 'inspector', modelPath, newValue, oldValue)
                , rootContent = hostObject.editor.get();

            rootContent.editor.storeCommand(cmd);
        });
    }

    function _addModelPathTranslation(viewPath, modelPath) {
        if (viewPath in modelPathTranslations)
            throw new FormError('duplicate view path ' + viewPath);
        else if (_.keyOf(modelPathTranslations, modelPath))
            throw new FormError('duplicate model path ' + modelPath + ' for view path ' + viewPath);
        else
            modelPathTranslations[viewPath] = modelPath;
    }

    function _addDataTranslation(translate, direction, path) {
        var translateFunc = translate && translate[direction];
        if (! translateFunc) return;
        if (typeof translateFunc == 'function')
            dataTranslations[direction][path] = translateFunc;
        else
            throw new FormError(direction + ' translator for ' + path + ' should be function');
    }

    function _addDataValidation(validate, direction, path) {
        var validators = validate && validate[direction];
        if (! validators) return;

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
                throw new FormError(direction + ' validator for ' + path + ' should be function or string');
            formValidators.push(valFunc);
        }
    }
}


function getValidatorFunction(validatorName) {
    var valFunc = validationFunctions[validatorName];
    if (! valFunc)
        throw new FormError('Form: unknown validator function name ' + validatorName);
    return valFunc;
}

function makeRegexValidator(validatorRegExp) {
    return function (data, callback) {
        var valid = validatorRegExp.test(data)
            , response = _validatorResponse(valid, 'should match pattern');
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
        throw new FormError('schema has items but component has no container facet');

    items.forEach(function(item) {
        var itemComp = comp.container.scope[item.compName]
            , compViewPath = viewPath + '.' + item.compName;
        if (! itemComp)
            throw new FormError('component "' + item.compName + '" is not in scope (or subscope) of form');
        processSchema.call(this, itemComp, item, compViewPath, formViewPaths, formModelPaths, modelPathTranslations, dataTranslations, dataValidations);
    }, this);
}


/**
 * Subscribes to messages on facets of items' component as defiend in schema
 */
function _processSchemaMessages(comp, messages) {
    var hostObject = this;
    _.eachKey(messages, function(facetMessages, facetName) {
        var facet = comp[facetName];
        if (! facet)
            throw new FormError('schema has subscriptions for facet "' + facetName + '" of form component "' + comp.name + '", but component has no facet');
        facetMessages = _.clone(facetMessages);
        _.eachKey(facetMessages, function(subscriber, messageType) {
            if (typeof subscriber == 'object' && subscriber.context == 'host') {
                subscriber = {
                    subscriber: subscriber.subscriber,
                    context: hostObject
                },
                facetMessages[messageType] = subscriber;
            }
        });
        facet.onConfigMessages(facetMessages);
    });
}


function _processSelectSchema(comp, schema) {
    var options = schema.selectOptions;
    setComponentOptions(comp, options, setComponentModel);
}


function _processRadioSchema(comp, schema) {
    var options = schema.radioOptions;
    setComponentOptions(comp, options, setComponentModel);
}


function _processComboSchema(comp, schema) {
    var options = schema.comboOptions;
    setComponentOptions(comp, options, setComponentModel);
}


function _processSuperComboSchema(comp, schema) {
    var options = schema.comboOptions
        , hasAddBtn = schema.hasAddBtn;

    _.deferTicks(function() {
        comp.toggleAddButton(hasAddBtn);
        setComponentOptions(comp, options, setComboOptions);
    }, 2);
}


function _processComboListSchema(comp, schema) {
    var options = schema.comboOptions
        , hasAddBtn = schema.hasAddBtn;

    _.deferTicks(function() {
        comp.toggleAddButton(hasAddBtn);
        comp.setDataValidation(schema.dataValidation);
        setComponentOptions(comp, options, setComboOptions);
    }, 2);
}


function _processInputListSchema(comp, schema) {
    comp.setAsync(schema.asyncHandler);
    comp.setPlaceHolder(schema.placeHolder);
}


function _processLinkedList(comp, schema) {

//    comp.setOnEdit(schema.onEdit);
}

function _processTextareaSchema(comp, schema) {
    if (schema.autoresize)
        _.deferMethod(comp, 'startAutoresize', schema.autoresize);
}


function setComponentOptions(comp, options, setModelFunc) {
    if (options) {
        if (Promise.isPromise(options)) {
            setModelFunc(comp, [{ value: 0, label: 'loading...' }]);
            options
                .then(function(err, data) {
                    setModelFunc(comp, data);
                })
                .error(function() {
                    setModelFunc(comp, [{ value: 0, label: 'loading error' }]);
                });
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


function validateRequired(data, callback) {
    var valid = typeof data != 'undefined'
                && (typeof data != 'string' || data.trim() != '');
    var response = _validatorResponse(valid, 'value is required');
    callback(null, response);
}


function validateUrl(data, callback) {
    var valid = typeof data == 'string' && /^http\:\/\//.test(data)
        , response = _validatorResponse(valid, 'should be valid URL');
    callback(null, response);
}


function _validatorResponse(valid, reason) {
    return valid
            ? { valid: true }
            : { valid: false, reason: reason };
}
