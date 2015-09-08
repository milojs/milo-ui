'use strict';

var componentsRegistry = milo.registry.components
    , MLRadioGroup = componentsRegistry.get('MLRadioGroup');


var ELEMENT_CSS_CLASS = 'ml-radio-group-option';

var CCContextRadioGroup = MLRadioGroup.createComponentClass('CCContextRadioGroup', {
    dom: {
        cls: 'ml-ui-context-radio-group'
    }
});

componentsRegistry.add(CCContextRadioGroup);

module.exports = CCContextRadioGroup;


_.extendProto(CCContextRadioGroup, {
    init: CCContextRadioGroup$init
});


function CCContextRadioGroup$init() {
    MLRadioGroup.prototype.init.apply(this, arguments);
    this.setRenderOptions({
        optionCssClass: ELEMENT_CSS_CLASS
    });
}
