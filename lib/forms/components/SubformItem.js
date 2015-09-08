'use strict';

var componentsRegistry = milo.registry.components
    , CCForm = require('../Form')
    , MLListItem = componentsRegistry.get('MLListItem');


var SubformItem = MLListItem.createComponentClass('SubformItem', {
    dom: undefined
});

componentsRegistry.add(SubformItem);

module.exports = SubformItem;

_.extendProto(SubformItem, {
    setFormSchema: SubformItem$setFormSchema,
    renderSubform: SubformItem$renderSubform
});


function SubformItem$setFormSchema(schema) {
    this._subformSchema = schema;
}


function SubformItem$renderSubform(schema) {
    var CCForm = componentsRegistry.get('CCForm');
    var formHost = getFormHost(this);
    var newForm = CCForm.createForm(schema, formHost);
    newForm.insertInto(this.el);
    newForm.container.unwrap(false);
    return formHost;
}

function getFormHost(comp) {
    var CCForm = componentsRegistry.get('CCForm');
    var form = CCForm && comp.getScopeParentWithClass(CCForm);
    return form && form.getHostObject();
}