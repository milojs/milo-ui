'use strict';

var formGenerator = require('./generator')
	, componentsRegistry = milo.registry.components
	, check = milo.util.check;

/**
 * A component class for generating forms
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
 * Creates form from schema and optional template 
 */
function CCForm$$createForm(schema, hostObject, formData, template) {
	// get form HTML
	template = template || formGenerator(schema);

	// create form component
	var form = CCForm.createOnElement(undefined, template);

	// process form schema
	processSchema.call(hostObject, form, schema);

	// connect form view to form model
	form._connector = milo.minder(form.data, '<<<->>>', form.model.m);

	// set original form data
	if (formData)
		form.model.m.set(formData);

	return form;
}


var _processItemSchemaFuncs = {
	group: {
		CompClass: componentsRegistry.get('MLGroup'),
		func: doNothing
	},
	select: {
		CompClass: componentsRegistry.get('MLSelect'),
		func: _processSelectSchema
	},
	input: {
		CompClass: componentsRegistry.get('MLInput'),
		func: doNothing
	},
	button: {
		CompClass: componentsRegistry.get('MLButton'),
		func: doNothing
	},
	radio: {
		CompClass: componentsRegistry.get('MLRadioGroup'),
		func: _processRadioSchema
	},
	hyperlink: {
		CompClass: componentsRegistry.get('MLHyperlink'),
		func: doNothing
	},
	checkbox: {
		CompClass: componentsRegistry.get('MLCheckbox'),
		func: doNothing
	},
	list: {
		CompClass: componentsRegistry.get('MLList'),
		func: doNothing
	},
	time: {
		CompClass: componentsRegistry.get('MLTime'),
		func: doNothing
	},
	date: {
		CompClass: componentsRegistry.get('MLDate'),
		func: doNothing
	}
}

function doNothing() {}


function processSchema(comp, schema) {
	if (schema.items)
		_processSchemaItems.call(this, comp, schema.items);

	if (schema.messages)
		_processSchemaMessages.call(this, comp, schema.messages);

	var processItem = _processItemSchemaFuncs[schema.type];
	if (processItem) {
		check(comp, processItem.CompClass);
		processItem.func.call(this, comp, schema);
	}
}

function _processSchemaItems(comp, items) {
	if (! comp.container)
		throw new InspectorError('schema has items but inspector component has no container facet');

	items.forEach(function(item) {
		var itemComp = comp.container.scope[item.compName];
		if (! itemComp)
			throw new InspectorError('component "' + item.compName + '" is not in scope (or subscope) of inspector');
		processSchema.call(this, itemComp, item);
	}, this);
}

function _processSchemaMessages(comp, messages) {
	var component = this.owner;
	_.eachKey(messages, function(facetMessages, facetName) {
		var facet = comp[facetName];
		if (! facet)
			throw new InspectorError('schema has subscriptions for facet "' + facetName + '" of inspector component "' + comp.name + '", but component has no facet');
		facetMessages = _.clone(facetMessages);
		_.eachKey(facetMessages, function(subscriber, messageType) {
			if (typeof subscriber == 'object' && subscriber.context == 'component') {
				subscriber = _.clone(subscriber);
				subscriber.context = component;
				facetMessages[messageType] = subscriber;
			}
		});
		facet.onMessages(facetMessages);
	});
}

function _processSelectSchema(comp, schema) {
	if (schema.selectOptions)
		comp.model.set(schema.selectOptions);
}

function _processRadioSchema(comp, schema) {
	if (schema.radioOptions)
		comp.model.set(schema.radioOptions);
}
