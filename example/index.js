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
                },

                // Event subscriptions go in here
                messages: {

                    // these are native events
                    events: {

                        // subscriber can be a function, or an object that
                        // configures the context of the subscriber like so
                        'input': { context: 'owner', subscriber: function (e) {
                            console.log(event);
                        }}
                    },

                    // these are data changes
                    data: {
                        // empty string because we are subscribing to this
                        // level, not deeper, otherwise '.prop'
                        '': function (msg, data) {
                            console.log(msg, data);
                        }
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

            // Combolist - Type ahead list composition
            {
                type: 'combolist',
                label: 'Combo list',
                modelPath: '.comboList',

                // options can also be a promise that returns array of objects
                comboOptions: fetch('https://jsonplaceholder.typicode.com/users')
                    .then((res) => res.json())
                    .then((data) => data.map((u) => ({label: u.name, value: u.username}))),

                // This translation transforms list of objects to list of strings
                translate: {
                    toModel: function (val) {
                        return val && val.map(function (v) { return v.value; });
                    }
                }
            },

            // Time type
            {
                type: 'time',
                label: 'Time',
                modelPath: '.time'
            },

            // Date type
            {
                type: 'date',
                label: 'Date',
                modelPath: '.date'
            },

            // Any native input type can be realised with inputType option
            {
                type: 'input',
                label: 'Colour',
                inputType: 'color',
                modelPath: '.color'
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
