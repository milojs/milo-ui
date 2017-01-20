'use strict';

const MLForm = milo.registry.components.get('MLForm');
const form = MLForm.createForm(getFormSchema());
const dataEl = document.getElementById('data');
const formEl = document.getElementById('form');

formEl.appendChild(form.el);
form.validateModel();

form.model.m.on('***', function () {
    const data = form.model.get();
    dataEl.innerHTML = JSON.stringify(data, null, '  ');
});

function getFormSchema() {
    return {
        // Css class rules based on data changes
        css: {
            classes: {
                
            }
        },

        // Items that make up the form
        items: [
            // Standard input with all common config values
            {
                // The type of the item input|radio|checkbox etc
                type: 'input',

                // The label
                label: 'Input label',

                // Standard html input name attribute
                inputName: 'inputName',

                // Standard html input type attribute, defaults to text
                // but supports all the usual types, like number and date
                inputType: 'text',

                // Standard html placeholder text
                placeholder: 'Some placeholder text',

                // Standard html input max length
                maxLength: 20,

                // The corresponding data property, can be complex like
                // .title[0].some.other.thing
                modelPath: '.textInput',

                // Wrapping css class
                wrapCssClass: 'some-class',

                // Standard alt text, shows on rollover
                altText: 'Some cool alt text',

                // Sets out validation rules, can be preset string rules
                // or functions
                validate: {
                    fromModel: ['required'],
                    toModel: ['required']
                },

                // Sets out translation rules for the data
                translate: {
                    toModel: function (val) {
                        return val && val.toUpperCase()
                    }
                }
            },

            {
                type: 'textarea',
                label: 'Textarea',
                modelPath: '.textArea',

                // Autoresizes the text area as content grows
                autoresize: {
                    minHeight: 80,
                    maxHeight: 360
                }
            },

            // Radio type
            {
                type: 'radio',
                label: 'Radio label',
                modelPath: '.radio',

                // Radio options list
                radioOptions: [
                    { label: 'Option 1', value: 'opt1' },
                    { label: 'Option 2', value: 'opt2' },
                    { label: 'Option 3', value: 'opt3' }
                ]
            },

            // Select type
            {
                type: 'select',
                label: 'Select label',
                modelPath: '.select',

                // Radio options list
                selectOptions: [
                    { label: 'select', value: '' },
                    { label: 'Option 1', value: 'opt1' },
                    { label: 'Option 2', value: 'opt2' },
                    { label: 'Option 3', value: 'opt3' }
                ]
            },

            // Clears floats
            { type: 'clear' },

//https://raw.githubusercontent.com/milojs/slack-clone/master/client/taglist.json
            // Combolist - Type ahead list composition
            {
                type: 'combolist',
                label: 'Combo list',
                modelPath: '.comboList',
                comboOptions: [
                    { label: 'eclipse1', value: 'eclipse1' },
                    { label: 'string2', value: 'string2' },
                    { label: 'windows3', value: 'windows3' },
                    { label: 'eclipse4', value: 'eclipse4' },
                    { label: 'string5', value: 'string5' },
                    { label: 'windows6', value: 'windows6' },
                    { label: 'eclipse7', value: 'eclipse7' },
                    { label: 'string8', value: 'string8' },
                    { label: 'windows9', value: 'windows9' },
                    { label: 'eclipse10', value: 'eclipse10' },
                    { label: 'string11', value: 'string11' },
                    { label: 'windows12', value: 'windows12' }
                ],
                translate: {
                    toModel: function (val) {
                        return val && val.map(function (v) { return v.value; });
                    }
                }
            },

            {
                type: 'time',
                label: 'Time',
                modelPath: '.time'
            },

            {
                type: 'date',
                label: 'Date',
                modelPath: '.date'
            },

            // Checkbox type
            {
                type: 'checkbox',
                label: 'Checkbox',
                wrapCssClass: 'checkbox',
                modelPath: '.isCheckbox'
            }
        ]
    };
}
