'use strict';


var fs = require('fs')
    , formRegistry = require('./registry');


var group_dot = fs.readFileSync(__dirname + '/items/group.dot')
    , wrapper_dot = fs.readFileSync(__dirname + '/items/wrapper.dot')
    , select_dot = fs.readFileSync(__dirname + '/items/select.dot')
    , input_dot = fs.readFileSync(__dirname + '/items/input.dot')
    , textarea_dot = fs.readFileSync(__dirname + '/items/textarea.dot')
    , button_dot = fs.readFileSync(__dirname + '/items/button.dot')
    , fabutton_dot = fs.readFileSync(__dirname + '/items/fabutton.dot')
    , hyperlink_dot = fs.readFileSync(__dirname + '/items/hyperlink.dot')
    , checkbox_dot = fs.readFileSync(__dirname + '/items/checkbox.dot')
    , list_dot = fs.readFileSync(__dirname + '/items/list.dot')
    , time_dot = fs.readFileSync(__dirname + '/items/time.dot')
    , date_dot = fs.readFileSync(__dirname + '/items/date.dot')
    , combo_dot = fs.readFileSync(__dirname + '/items/combo.dot')
    , image_dot = fs.readFileSync(__dirname + '/items/image.dot')
    , previewimage_dot = fs.readFileSync(__dirname + '/items/previewimage.dot')
    , previewcropall_dot = fs.readFileSync(__dirname + '/items/previewcropall.dot')
    , droptarget_dot = fs.readFileSync(__dirname + '/items/droptarget.dot')
    , text_dot = fs.readFileSync(__dirname + '/items/text.dot')
    , previewlist_dot = fs.readFileSync(__dirname + '/items/previewlist.dot')
    , linklist_dot = fs.readFileSync(__dirname + '/items/linklist.dot')
    , relatedlist_dot = fs.readFileSync(__dirname + '/items/relatedlist.dot')
    , imagegroupcaptionlist_dot = fs.readFileSync(__dirname + '/items/imagegroupcaptionlist.dot')
    , clear_dot = '<div class="cc-clear"></div>'
    , cc_channel_select_dot = fs.readFileSync(__dirname + '/items/channelselect.dot')
    , cc_article_status_select_dot = fs.readFileSync(__dirname + '/items/articlestatusselect.dot');


formRegistry.add('group',                 { compClass: 'MLGroup',                 template: group_dot,                 modelPathRule: 'prohibited'                                           });
formRegistry.add('wrapper',               { compClass: 'MLWrapper',               template: wrapper_dot,               modelPathRule: 'prohibited'                                           });
formRegistry.add('select',                { compClass: 'MLSelect',                template: select_dot,                                             itemFunction: processSelectSchema        });
formRegistry.add('input',                 { compClass: 'MLInput',                 template: input_dot,                                              itemFunction: processInputSchema         });
formRegistry.add('inputlist',             { compClass: 'MLInputList',                                                                               itemFunction: processInputListSchema     });
formRegistry.add('textarea',              { compClass: 'MLTextarea',              template: textarea_dot,                                           itemFunction: processTextareaSchema      });
formRegistry.add('button',                { compClass: 'MLButton',                template: button_dot,                modelPathRule: 'optional'                                             });
formRegistry.add('fabutton',              { compClass: 'MLButton',                template: fabutton_dot,              modelPathRule: 'optional'                                             });
formRegistry.add('radio',                 { compClass: 'MLRadioGroup',                                                                              itemFunction: processRadioSchema         });
formRegistry.add('hyperlink',             { compClass: 'MLHyperlink',             template: hyperlink_dot,             modelPathRule: 'optional'                                             });
formRegistry.add('checkbox',              { compClass: 'MLInput',                 template: checkbox_dot                                                                                     });
formRegistry.add('list',                  { compClass: 'MLList',                  template: list_dot                                                                                         });
formRegistry.add('time',                  { compClass: 'MLTime',                  template: time_dot,                                               itemFunction: setValue                   });
formRegistry.add('date',                  { compClass: 'MLDate',                  template: date_dot                                                                                         });
formRegistry.add('combo',                 { compClass: 'MLCombo',                 template: combo_dot,                                              itemFunction: processComboSchema         });
formRegistry.add('supercombo',            { compClass: 'MLSuperCombo',                                                                              itemFunction: processSuperComboSchema    });
formRegistry.add('combolist',             { compClass: 'MLComboList',                                                                               itemFunction: processComboListSchema     });
formRegistry.add('image',                 { compClass: 'MLImage',                 template: image_dot                                                                                        });
formRegistry.add('previewimage',          { compClass: 'CCPreviewImage',          template: previewimage_dot,                                       itemFunction: processSchema              });
formRegistry.add('previewcropall',        { compClass: 'CCPreviewCropAll',        template: previewcropall_dot,        modelPathRule: 'prohibited'                                           });
formRegistry.add('droptarget',            { compClass: 'MLDropTarget',            template: droptarget_dot,            modelPathRule: 'prohibited'                                           });
formRegistry.add('text',                  { compClass: 'MLText',                  template: text_dot,                  modelPathRule: 'optional'                                             });
formRegistry.add('imagelist',             { compClass: 'CCPreviewList',           template: previewlist_dot                                                                                  });
formRegistry.add('articlehistory',        { compClass: 'CCArticleHistory',                                             modelPathRule: 'prohibited'                                           });
formRegistry.add('linklist',              { compClass: 'CCLinkList',              template: linklist_dot,                                           itemFunction: processLinkListSchema      });
formRegistry.add('relatedlist',           { compClass: 'CCRelatedList',           template: relatedlist_dot,                                        itemFunction: processRelatedListSchema   });
formRegistry.add('imagegroupcaptionlist', { compClass: 'CCImageGroupCaptionList', template: imagegroupcaptionlist_dot                                                                        });
formRegistry.add('clear',                 {                                       template: clear_dot                                                                                        });
formRegistry.add('contextradio',          { compClass: 'CCContextRadioGroup',                                                                       itemFunction: processRadioSchema         });
formRegistry.add('contextcolorpicker',    { compClass: 'CCContextColorPicker',                                                                      itemFunction: processRadioSchema         });
formRegistry.add('channelselect',         { compClass: 'CCChannelSelect',         template: cc_channel_select_dot,                                  itemFunction: processChannelSelectSchema });
formRegistry.add('articlestatusselect',   { compClass: 'CCArticleStatusSelect',   template: cc_article_status_select_dot,                                                                    });


function setValue(comp, schema) {
    var options = schema.selectOptions;
    if (schema.hasOwnProperty('value')) {
        comp.data.set(schema.value);
    }
}

function processSelectSchema(comp, schema) {
    var options = schema.selectOptions;
    setComponentOptions(comp, options, setComponentModel);
}


function processRadioSchema(comp, schema) {
    var options = schema.radioOptions;
    setComponentOptions(comp, options, setComponentModel);
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
        if(optionsURL)
            comp.initOptionsURL(optionsURL);
    }, 2);
}


function processComboListSchema(comp, schema) {
    var options = schema.comboOptions
        , addItemPrompt = schema.addItemPrompt
        , placeHolder = schema.placeHolder;

    _.deferTicks(function() {
        if (addItemPrompt) comp.setAddItemPrompt(addItemPrompt);
        if (placeHolder) comp.setPlaceholder(placeHolder);
        comp.setDataValidation(schema.dataValidation);
        setComponentOptions(comp, options, setComboOptions);
    }, 2);
}


function processInputListSchema(comp, schema) {
    comp.setAsync(schema.asyncHandler);
    comp.setPlaceHolder(schema.placeHolder);
}


function processTextareaSchema(comp, schema) {
    if (schema.autoresize)
        _.deferMethod(comp, 'startAutoresize', schema.autoresize);
}


function processLinkListSchema(comp, schema) {
    comp.setHostComponent(this);
}


function processRelatedListSchema(comp, schema) {
    comp.setLinkDefaults(schema.defaultLinkData);
}


function processInputSchema(comp, schema) {
    if (_.isNumeric(schema.maxLength)) comp.setMaxLength(schema.maxLength);
}

function processChannelSelectSchema(comp, schema) {
    comp.setChannelList(schema.channelList, schema.defaultChannel);
}

function setComponentOptions(comp, options, setModelFunc) {
    if (options) {
        if (typeof options.then == 'function') {
            setModelFunc(comp, [{ value: 0, label: 'loading...' }]);
            options
                .then(
                    function(data) { setModelFunc(comp, data); },
                    function() { setModelFunc(comp, [{ value: 0, label: 'loading error' }]); }
                );
        } else
            setModelFunc(comp, options);
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


function processSchema(comp, schema) {
    comp.processFormSchema(schema);
}
