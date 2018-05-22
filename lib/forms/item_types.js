'use strict';


var fs = require('fs')
    , formRegistry = require('./registry');


var group_dot = fs.readFileSync(__dirname + '/items/group.dot', 'utf-8')
    , wrapper_dot = fs.readFileSync(__dirname + '/items/wrapper.dot', 'utf-8')
    , select_dot = fs.readFileSync(__dirname + '/items/select.dot', 'utf-8')
    , input_dot = fs.readFileSync(__dirname + '/items/input.dot', 'utf-8')
    , textarea_dot = fs.readFileSync(__dirname + '/items/textarea.dot', 'utf-8')
    , button_dot = fs.readFileSync(__dirname + '/items/button.dot', 'utf-8')
    , hyperlink_dot = fs.readFileSync(__dirname + '/items/hyperlink.dot', 'utf-8')
    , checkbox_dot = fs.readFileSync(__dirname + '/items/checkbox.dot', 'utf-8')
    , list_dot = fs.readFileSync(__dirname + '/items/list.dot', 'utf-8')
    , time_dot = fs.readFileSync(__dirname + '/items/time.dot', 'utf-8')
    , date_dot = fs.readFileSync(__dirname + '/items/date.dot', 'utf-8')
    , combo_dot = fs.readFileSync(__dirname + '/items/combo.dot', 'utf-8')
    , image_dot = fs.readFileSync(__dirname + '/items/image.dot', 'utf-8')
    , droptarget_dot = fs.readFileSync(__dirname + '/items/droptarget.dot', 'utf-8')
    , text_dot = fs.readFileSync(__dirname + '/items/text.dot', 'utf-8')
    , formlist_dot = fs.readFileSync(__dirname + '/items/formlist.dot', 'utf-8')
    , clear_dot = '<div class="cc-clear"></div>';


module.exports = formRegistry;

formRegistry.add('group',                 { compClass: 'MLGroup',                 template: group_dot,                 modelPathRule: 'prohibited'                                                  });
formRegistry.add('wrapper',               { compClass: 'MLWrapper',               template: wrapper_dot,               modelPathRule: 'prohibited'                                                  });
formRegistry.add('select',                { compClass: 'MLSelect',                template: select_dot,                                             itemFunction: processSelectSchema               });
formRegistry.add('input',                 { compClass: 'MLInput',                 template: input_dot,                                              itemFunction: processInputSchema                });
formRegistry.add('inputlist',             { compClass: 'MLInputList',                                                                               itemFunction: processInputListSchema            });
formRegistry.add('textarea',              { compClass: 'MLTextarea',              template: textarea_dot,                                           itemFunction: processTextareaSchema             });
formRegistry.add('button',                { compClass: 'MLButton',                template: button_dot,                modelPathRule: 'optional'                                                    });
formRegistry.add('radio',                 { compClass: 'MLRadioGroup',                                                                              itemFunction: processRadioSchema                });
formRegistry.add('checkgroup',            { compClass: 'MLCheckGroup',                                                                              itemFunction: processCheckGroupSchema           });
formRegistry.add('hyperlink',             { compClass: 'MLHyperlink',             template: hyperlink_dot,             modelPathRule: 'optional'                                                    });
formRegistry.add('checkbox',              { compClass: 'MLInput',                 template: checkbox_dot                                                                                            });
formRegistry.add('list',                  { compClass: 'MLList',                  template: list_dot                                                                                                });
formRegistry.add('time',                  { compClass: 'MLTime',                  template: time_dot,                                               itemFunction: processDateTimeSchema             });
formRegistry.add('date',                  { compClass: 'MLDate',                  template: date_dot,                                               itemFunction: processDateTimeSchema             });
formRegistry.add('combo',                 { compClass: 'MLCombo',                 template: combo_dot,                                              itemFunction: processComboSchema                });
formRegistry.add('supercombo',            { compClass: 'MLSuperCombo',                                                                              itemFunction: processSuperComboSchema           });
formRegistry.add('combolist',             { compClass: 'MLComboList',                                                                               itemFunction: processComboListSchema            });
formRegistry.add('image',                 { compClass: 'MLImage',                 template: image_dot                                                                                               });
formRegistry.add('droptarget',            { compClass: 'MLDropTarget',            template: droptarget_dot,            modelPathRule: 'prohibited'                                                  });
formRegistry.add('text',                  { compClass: 'MLText',                  template: text_dot,                  modelPathRule: 'optional'                                                    });
formRegistry.add('clear',                 {                                       template: clear_dot                                                                                               });
formRegistry.add('formlist',              { compClass: 'MLFormList',              template: formlist_dot,                                           itemFunction: prepareFormListSchema             });


function processSelectSchema(comp, schema) {
    var options = schema.selectOptions;
    setComponentOptions(comp, options, setComboOptions);
}


function processRadioSchema(comp, schema) {
    var options = schema.radioOptions;
    setComponentOptions(comp, options, setComponentModel);
}


function processCheckGroupSchema(comp, schema) {
    var options = schema.checkOptions;
    comp.setSelectAll(!!schema.selectAll);
    setComponentOptions(comp, options, setComponentModel);
}


function processDateTimeSchema(comp, schema) {
    comp.utc = schema.utc;
}


function processComboSchema(comp, schema) {
    var options = schema.comboOptions;
    setComponentOptions(comp, options, setComponentModel);
}


function processSuperComboSchema(comp, schema) {
    var options = schema.comboOptions
        , optionsURL = schema.comboOptionsURL
        , addItemPrompt = schema.addItemPrompt
        , placeHolder = schema.placeHolder;

    _.deferTicks(function() {
        if (addItemPrompt) comp.setAddItemPrompt(addItemPrompt);
        if (placeHolder) comp.setPlaceholder(placeHolder);
        setComponentOptions(comp, options, setComboOptions);
        if (optionsURL) comp.initOptionsURL(optionsURL);
    }, 2);
}


function processComboListSchema(comp, schema) {
    var options = schema.comboOptions
        , optionsURL = schema.comboOptionsURL
        , addItemPrompt = schema.addItemPrompt
        , placeHolder = schema.placeHolder;

    _.deferTicks(function() {
        if (addItemPrompt) comp.setAddItemPrompt(addItemPrompt);
        if (placeHolder) comp.setPlaceholder(placeHolder);
        if (!optionsURL) comp.setDataValidation(schema.dataValidation);
        setComponentOptions(comp, options, setComboOptions);
        if (optionsURL) comp.container.scope.combo.initOptionsURL(optionsURL);
    }, 2);
}


function processInputListSchema(comp, schema) {
    comp.setAsync(schema.asyncHandler);
    comp.setPlaceHolder(schema.placeHolder);
}


function processTextareaSchema(comp, schema) {
    if (schema.autoresize)
        _.defer(function() {
            if (!comp.isDestroyed()) {
                comp.startAutoresize(schema.autoresize);
            }
        });
}


function processInputSchema(comp, schema) {
    if (_.isNumeric(schema.maxLength)) comp.setMaxLength(schema.maxLength);
}

function prepareFormListSchema(comp, schema) {
    comp.setItemSchema(schema);
}

function setComponentOptions(comp, options, setModelFunc) {
    function trySetModelFunc(comp, data) {
        if (! comp.isDestroyed()) setModelFunc(comp, data);
    }

    if (options) {
        if (typeof options.then == 'function') {
            trySetModelFunc(comp, [{ value: 0, label: 'loading...' }]);
            options
                .then(
                    function(data) { trySetModelFunc(comp, data); },
                    function() { trySetModelFunc(comp, [{ value: 0, label: 'loading error' }]); }
                );
        } else {
            trySetModelFunc(comp, options);
        }
    }
}


function setComponentModel(comp, data) {
    comp.model.set(data);
    // _.deferMethod(comp.model, 'set', data);
    // doing it with defer makes channel not set when the article is opened
}


function setComboOptions(comp, data) {
    comp.setOptions(data);
}
