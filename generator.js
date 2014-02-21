'use strict';

var doT = require('dot')
    , fs =require('fs')
    , miloCount = milo.util.count
    , componentName = milo.util.componentName;


module.exports = formGenerator;


var partials = {
    label: fs.readFileSync(__dirname + '/items/partials/label.dot'),
    formGroup: fs.readFileSync(__dirname + '/items/partials/form_group.dot')
};

var dotDef = {
    partials: partials
};

var itemTemplatesText = {
    group: fs.readFileSync(__dirname + '/items/group.dot'),
    wrapper: fs.readFileSync(__dirname + '/items/wrapper.dot'),
    select: fs.readFileSync(__dirname + '/items/select.dot'),
    input: fs.readFileSync(__dirname + '/items/input.dot'),
    inputlist: fs.readFileSync(__dirname + '/items/inputlist.dot'),
    textarea: fs.readFileSync(__dirname + '/items/textarea.dot'),
    button: fs.readFileSync(__dirname + '/items/button.dot'),
    radio: fs.readFileSync(__dirname + '/items/radio.dot'),
    hyperlink: fs.readFileSync(__dirname + '/items/hyperlink.dot'),
    checkbox: fs.readFileSync(__dirname + '/items/checkbox.dot'),
    list: fs.readFileSync(__dirname + '/items/list.dot'),
    time: fs.readFileSync(__dirname + '/items/time.dot'),
    date: fs.readFileSync(__dirname + '/items/date.dot'),
    combo: fs.readFileSync(__dirname + '/items/combo.dot'),
    combolist: fs.readFileSync(__dirname + '/items/combolist.dot'),
    image: fs.readFileSync(__dirname + '/items/image.dot'),
    previewimage: fs.readFileSync(__dirname + '/items/previewimage.dot'),
    previewcropall: fs.readFileSync(__dirname + '/items/previewcropall.dot'),
    droptarget: fs.readFileSync(__dirname + '/items/droptarget.dot')
};

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
        item.compName = item.compName || componentName();
        return itemTemplates[item.type]({
            item: item,
            compName: item.compName,
            formGenerator: formGenerator,
            miloCount: miloCount,
            disabled: item.disabled
        });
    }
}
