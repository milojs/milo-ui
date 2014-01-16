'use strict';

var doT = require('dot')
	, fs =require('fs');


module.exports = formGenerator;


var partials = {
	label: fs.readFileSync(__dirname + '/items/partials/label.dot')
};

var dotDef = {
	partials: partials
};

var itemTemplatesText = {
	group: fs.readFileSync(__dirname + '/items/group.dot'),
	select: fs.readFileSync(__dirname + '/items/select.dot'),
	input: fs.readFileSync(__dirname + '/items/input.dot'),
	textarea: fs.readFileSync(__dirname + '/items/textarea.dot'),
	button: fs.readFileSync(__dirname + '/items/button.dot'),
	radio: fs.readFileSync(__dirname + '/items/radio.dot'),
	hyperlink: fs.readFileSync(__dirname + '/items/hyperlink.dot')
}

var itemTemplates = _.mapKeys(itemTemplatesText, function(templateStr) {
	return doT.compile(templateStr, dotDef);
});


/*
 * Generates form HTML based on the schema.
 * It does not create components for the form DOM, milo.binder should be called separately on the form's element.
 *
 * @param {Array} schema array of form elements descriptors
 * @return {String}
 */
function formGenerator(schema) {
	var renderedItems = schema.items.map(renderItem);
	return renderedItems.join('');

	function renderItem(item) {
		return itemTemplates[item.type]({
			item: item,
			compName: item.compName, // milo.util.componentName(),
			formGenerator: formGenerator,
			disabled: item.disabled
		});
	}
}
