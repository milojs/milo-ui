'use strict';

var formGenerator = require('./generator')
	, componentsRegistry = milo.registry.components
	, check = milo.util.check
	, FormError = milo.util.error.createClass('Form')
	, logger = milo.util.logger
	, Promise = milo.util.promise;


var FORM_VALIDATION_FAILED_CSS_CLASS = 'has-error';

/**
 * A component class for generating forms from schema
 * To create form class method [createForm](#CCForm$$createForm) should be used.
 * Form schema has the following format:
 * ```
 * var schema = {
 *     items: [
 *         {
 *	           type: '<type of ui control>',
 *                             // can be group, select, input, button, radio,
 *                             // hyperlink, checkbox, list, time, date
 *             compName: '<component name>',
 *                             // name of component, should be unique within the form
 *                             // (or form group)
 *             label: '<ui control label>',
 *                             // optional label, will not be added if not defined
 *                             // or empty string
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
 *	                   '<message1>': onMessage1 // message and subscriber function
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
 *	               toModel: func1,   // translates item data from view to model
 *                 fromModel: func2  // translates item data from model to view
 *             }
 *             <item specific>: {<item configuration>}
 *                             // "select" supports "selectOptions" - array of objects
 *                             // with properties "value" and "label"
 *                             // "radio" supports "radioOptions" with the same format
 *             items: [
 *                 { ... } //, ... - items inside "group" item
 *             ]
 *         } // , ... more items
 *     ]	
 * }
 */
var CCForm = milo.Component.createComponentClass('CCForm', {
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
	// get form HTML
	template = template || formGenerator(schema);

	// create form component
	var form = CCForm.createOnElement(undefined, template);

	// model paths translation rules
	var modelPathTranslations = {}
		, dataTranslations = { fromModel: {}, toModel: {} }
		, dataValidations = { fromModel: {}, toModel: {} } ;

	// process form schema
	try {
		processSchema.call(hostObject, form, schema, '', modelPathTranslations, dataTranslations, dataValidations);
	} catch (e) {
		logger.debug('modelPathTranslations before error: ', modelPathTranslations);
		logger.debug('dataTranslations before error: ', dataTranslations);
		logger.debug('dataValidations before error: ', dataValidations);
		throw (e);
	}

	// connect form view to form model using translation rules from modelPath properties of form items
	form._connector = milo.minder(form.data, '<<<->>>', form.model, {
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

	form.data.on('validated', function(msg, response) {
		var dataFacet = form.data.path(response.path);
		if (dataFacet) {
			var component = dataFacet.owner
				, parentEl = component.el.parentNode;
			parentEl.classList.toggle(FORM_VALIDATION_FAILED_CSS_CLASS, ! response.valid);
			parentEl.title = response.valid ? '' : response.reason;
		} else
			logger.error('Form: component for path ' + response.path + ' not found');
	});

	// set original form data
	if (formData)
		form.model.m.set(formData);

	return form;
}


/**
 * Map of items types to items components classes
 * UI components are defined in `milo`
 */
var itemsClasses = {
	group: 'MLGroup',
	wrapper: 'MLWrapper',
	select: 'MLSelect',
	input: 'MLInput',
	textarea: 'MLTextarea',
	button: 'MLButton',
	radio: 'MLRadioGroup',
	hyperlink: 'MLHyperlink',
	checkbox: 'MLInput',
	list: 'MLList',
	time: 'MLTime',
	date: 'MLDate',
	combo: 'MLCombo',
	combolist: 'MLComboList'
};

/**
 * modelPath translation rules for item types.
 * Default is "required"
 */
var modelPathRules = {
	group: 'prohibited',
	wrapper: 'prohibited',
	button: 'optional',
	hyperlink: 'optional'
}

/**
 * Special processing functions for some types of items
 */
var itemsFunctions = {
	select: _processSelectSchema,
	radio: _processRadioSchema,
	combo: _processComboSchema,
	combolist: _processComboListSchema
};

/**
 * Predefined for validation functions
 */
var validationFunctions = {
	'required': validateRequired,
	'validurl': validateValidUrl
}


var _itemsSchemaRules = _.mapKeys(itemsClasses, function(className, itemType) {
	return {
		CompClass: componentsRegistry.get(className),
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
 * @param {Object} modelPathTranslations model path translation rules accumulated so far
 * @param {Object} dataTranslations data translation functions so far
 * @param {Object} dataValidations data validation functions so far
 * @return {Object}
 */
function processSchema(comp, schema, viewPath, modelPathTranslations, dataTranslations, dataValidations) {
	viewPath = viewPath || '';
	modelPathTranslations = modelPathTranslations || {};
	dataTranslations = dataTranslations || {};
	dataTranslations.fromModel = dataTranslations.fromModel || {};
	dataTranslations.toModel = dataTranslations.toModel || {};

	dataValidations = dataValidations || {};
	dataValidations.fromModel = dataValidations.fromModel || {};
	dataValidations.toModel = dataValidations.toModel || {};

	if (schema.items) 
		_processSchemaItems.call(this, comp, schema.items, viewPath, modelPathTranslations, dataTranslations, dataValidations);

	if (schema.messages)
		_processSchemaMessages.call(this, comp, schema.messages);

	var itemRules = _itemsSchemaRules[schema.type];

	if (viewPath) {
		if (itemRules) {
			check(comp, itemRules.CompClass);
			itemRules.func.call(this, comp, schema);
			_processItemTranslations(viewPath, schema.modelPath, schema.translate, schema.validate)
		} else
			throw new FormError('unknown item type ' + schema.type);
	}

	return modelPathTranslations;


	function _processItemTranslations(viewPath, modelPath, translate, validate) {
		if (viewPath) {
			_addDataTranslation(translate, 'toModel', viewPath);
			_addDataValidation(validate, 'toModel', viewPath);

			switch (itemRules.modelPathRule) {
				case 'prohibited':
					if (modelPath)
						throw new FormError('modelPath is prohibited for item type ' + schema.type);
					break;
				case 'required':
					if (! modelPath)
						throw new FormError('modelPath is required for item type ' + schema.type);
					// falling through to 'optional'
				case 'optional':
					if (modelPath) {
						_addModelPathTranslation(viewPath, modelPath);
						_addDataTranslation(translate, 'fromModel', modelPath);
						_addDataValidation(validate, 'fromModel', modelPath);
					}
					break;
				default:
					throw new FormError('unknown modelPath rule for item type ' + schema.type);
			}
		}
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
 * @param {Object} modelPathTranslations model path translation rules accumulated so far
 * @param {Object} dataTranslations data translation functions so far
 * @param {Object} dataValidations data validation functions so far 
 * @return {Object}
 */
function _processSchemaItems(comp, items, viewPath, modelPathTranslations, dataTranslations, dataValidations) {
	if (! comp.container)
		throw new FormError('schema has items but component has no container facet');

	items.forEach(function(item) {
		var itemComp = comp.container.scope[item.compName]
			, compViewPath = viewPath + '.' + item.compName;
		if (! itemComp)
			throw new FormError('component "' + item.compName + '" is not in scope (or subscope) of form');
		processSchema.call(this, itemComp, item, compViewPath, modelPathTranslations, dataTranslations, dataValidations);
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
	setComponentOptions(comp, options, setComponentModel)
}

function _processRadioSchema(comp, schema) {
	var options = schema.radioOptions;
	setComponentOptions(comp, options, setComponentModel);
}

function _processComboSchema(comp, schema) {
	var options = schema.comboOptions;
	setComponentOptions(comp, options, setComponentModel);
}

function _processComboListSchema(comp, schema) {
	var options = schema.comboOptions;
	setComponentOptions(comp, options, setComboListOptions);
}

function setComponentOptions(comp, options, setModelFunc) {
	if (options) {
		if (options instanceof Promise){
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
}

function setComboListOptions(comp, data) {
	comp.setOptions(data);
}

function validateRequired(data, callback) {
	var valid = typeof data != 'undefined' && data != ''
		, response = _validatorResponse(valid, 'value is required');
	callback(null, response);
}

function validateValidUrl(data, callback) {
	var valid = typeof data == 'string' && /^http\:\/\//.test(data)
		, response = _validatorResponse(valid, 'should be valid URL');
	callback(null, response);
}

function _validatorResponse(valid, reason) {
	return valid
			? { valid: true }
			: { valid: false, reason: reason };
}

