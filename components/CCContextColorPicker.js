'use strict';

var componentsRegistry = milo.registry.components
    , MLRadioGroup = componentsRegistry.get('MLRadioGroup');


var CCContextColorPicker = MLRadioGroup.createComponentClass('CCContextColorPicker', {
    dom: {
        cls: 'ml-ui-context-radio-group'
    },
    template: {
        template: '{{~ it.radioOptions :option }} \
                        {{##def.elID:{{= it.elementName }}-{{= option.value }}#}} \
                        <span class="ml-radio-group-option color"> \
                            <label for="{{# def.elID }}" style="background-color: {{= option.value }}"> \
                                <input id="{{# def.elID }}" type="radio" value="{{= option.value }}" name="{{= it.elementName }}"> \
                            </label> \
                        </span> \
                   {{~}}'
    }
});

componentsRegistry.add(CCContextColorPicker);

module.exports = CCContextColorPicker;

