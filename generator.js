'use strict';

var doT = milo.util.doT
    , fs = require('fs')
    , componentsRegistry = milo.registry.components
    , miloCount = milo.util.count
    , componentName = milo.util.componentName
    , itemTypes = require('./item_types');


var DEFAULT_TEMPLATE = '{{# def.partials.formGroup }}\
                            {{# def.partials.label }}\
                            <{{= it.tagName}} ml-bind="{{= it.compClass}}:{{= it.compName }}">\
                            </{{= it.tagName}}>\
                        </div>';


module.exports = formGenerator;


var partials = {
    label: fs.readFileSync(__dirname + '/items/partials/label.dot'),
    formGroup: fs.readFileSync(__dirname + '/items/partials/form_group.dot')
};

var dotDef = {
    partials: partials
};


_.eachKey(itemTypes, function(itemType) {
    var templateStr = getTemplate(itemType);
    itemType.template = doT.compile(templateStr, dotDef);
});


function getTemplate(itemType) {
    return itemType.template || DEFAULT_TEMPLATE;
} 


getItemsClasses = _.once(getItemsClasses);
function getItemsClasses() {
    _.eachKey(itemTypes, function(itemType) {
        itemType.CompClass = componentsRegistry.get(itemType.compClass);
    });
}


/*
 * Generates form HTML based on the schema.
 * It does not create components for the form DOM, milo.binder should be called separately on the form's element.
 *
 * @param {Array} schema array of form elements descriptors
 * @return {String}
 */
function formGenerator(schema) {
    getItemsClasses();

    var renderedItems = schema.items.map(renderItem);
    return renderedItems.join('');

    function renderItem(item) {
        var itemType = itemTypes[item.type];

        item.compName = item.compName || componentName();
        // item.CompClass = itemType.CompClass;
        var domFacetConfig = itemType.CompClass.getFacetConfig('dom')
            , tagName = domFacetConfig && domFacetConfig.tagName || 'div';

        var template = itemType.template;
        return template({
            item: item,
            compName: item.compName,
            compClass: itemType.compClass,
            tagName: tagName,
            formGenerator: formGenerator,
            miloCount: miloCount,
            disabled: item.disabled
        });
    }
}
