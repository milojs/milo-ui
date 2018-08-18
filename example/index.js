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
        // You can define css styles here and use them below in your form
        // elements with the wrapCssClass property
        style: {
            '.some-class label': {
                color: 'blue'
            }
        },

        // Css class rules based on data changes
        css: {
            classes: {
                '.textArea': 'css-$'
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
                maxLength: 25,

                // The corresponding data property, can be complex like
                // .title[0].some.other.thing
                modelPath: '.textInput',

                // Wrapping css class
                wrapCssClass: 'some-class',

                // Standard alt text, shows on rollover
                altText: 'Some cool alt text',

                // Sets out validation rules, can be preset string rules
                // or functions.
                // Optionally select context, or "this" will be undefined.
                validate: {
                    context: 'form', // context can be used for conditional validation
                    fromModel: ['required', customValidationFunction],
                    toModel: ['required', customValidationFunction]
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

                    // these are data changes, in general it is better to subscribe
                    // to the form model above like this
                    // form.model.m.on('.prop', subscriber)
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

            // Supercombo, can take thousands of items
            {
                type: 'supercombo',
                label: 'Combo label',
                modelPath: '.combo',

                // Combo options list
                comboOptions: [
                    { label: 'select', value: '' },
                    { label: 'Option 1', value: 'opt1' },
                    { label: 'Option 2', value: 'opt2' },
                    { label: 'Option 3', value: 'opt3' }
                ]
            },

            // Combolist - Type ahead list composition
            {
                type: 'combolist',
                label: 'Combo list',
                modelPath: '.comboList',

                // options can also be a promise that returns array of objects
                comboOptions: fetch('https://jsonplaceholder.typicode.com/users')
                    .then(r => r.json())
                    .then(d => d.map((u) => ({label: u.name, value: u.username}))),

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
            },

            // Check box group with select all option
            {
                type: 'checkgroup',
                label: 'Check group',
                modelPath: '.checkGroup',
                selectAll: true,
                checkOptions: [
                    { label: 'Option 1', value: 'opt1' },
                    { label: 'Option 2', value: 'opt2' },
                    { label: 'Option 3', value: 'opt3' }
                ]
            },

            // Non input items

            // Clear
            {
                type: 'clear'
            },

            // Groups
            {
                type: 'group',
                label: 'A group',
                items: [
                    { type: 'input', label: 'Sub item 1', modelPath: '.group.item1' },
                    { type: 'input', label: 'Sub item 2', modelPath: '.group.item2' },
                    { type: 'input', label: 'Sub item 3', modelPath: '.group.item3' }
                ]
            },

            // Wrapper, similar to group but with simpler markup and no title
            {
                type: 'wrapper',
                items: [
                    { type: 'input', label: 'Wrap item 1', modelPath: '.wrapper.item1' },
                    { type: 'input', label: 'Wrap item 2', modelPath: '.wrapper.item2' },
                    { type: 'input', label: 'Wrap item 3', modelPath: '.wrapper.item3' }
                ]
            }
        ]
    };
}

function customValidationFunction(data, done) {
    // Using context we can create validation functions that are dependant
    // on other fields in the model. However, this field won't revalidate
    // when the dependant field changes, so other logic would be needed.
    const textAreaValue = this.model.m('.textArea').get();

    const maxLength = textAreaValue ? 20 : 10;
    const valid = !(data && data.length > maxLength);
    const reason = `String should be ${maxLength} chars or shorter.`;
    const reasonCode = 'TOO_LONG';

    // Should call the callback with a valid property and the reason which
    // will be used when invalid
    done(null, { valid, reason, reasonCode });

    // You can then call form.getInvalidControls() or
    // form.getInvalidReasons() to get info about validity.
}
