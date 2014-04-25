'use strict';


var fs = require('fs');


var itemTypes = {
    group:          { compClass: 'MLGroup',             template: fs.readFileSync(__dirname + '/items/group.dot') },
    wrapper:        { compClass: 'MLWrapper',           template: fs.readFileSync(__dirname + '/items/wrapper.dot') },
    select:         { compClass: 'MLSelect',            template: fs.readFileSync(__dirname + '/items/select.dot') },
    input:          { compClass: 'MLInput',             template: fs.readFileSync(__dirname + '/items/input.dot') },
    inputlist:      { compClass: 'MLInputList' },
    textarea:       { compClass: 'MLTextarea',          template: fs.readFileSync(__dirname + '/items/textarea.dot') },
    button:         { compClass: 'MLButton',            template: fs.readFileSync(__dirname + '/items/button.dot') },
    radio:          { compClass: 'MLRadioGroup' },
    hyperlink:      { compClass: 'MLHyperlink',         template: fs.readFileSync(__dirname + '/items/hyperlink.dot') },
    checkbox:       { compClass: 'MLInput',             template: fs.readFileSync(__dirname + '/items/checkbox.dot') },
    list:           { compClass: 'MLList',              template: fs.readFileSync(__dirname + '/items/list.dot') },
    time:           { compClass: 'MLTime',              template: fs.readFileSync(__dirname + '/items/time.dot') },
    date:           { compClass: 'MLDate',              template: fs.readFileSync(__dirname + '/items/date.dot') },
    combo:          { compClass: 'MLCombo',             template: fs.readFileSync(__dirname + '/items/combo.dot') },
    combolist:      { compClass: 'MLComboList' },
    image:          { compClass: 'MLImage',             template: fs.readFileSync(__dirname + '/items/image.dot') },
    previewimage:   { compClass: 'CCPreviewImage',      template: fs.readFileSync(__dirname + '/items/previewimage.dot') },
    previewcropall: { compClass: 'CCPreviewCropAll',    template: fs.readFileSync(__dirname + '/items/previewcropall.dot') },
    droptarget:     { compClass: 'MLDropTarget',        template: fs.readFileSync(__dirname + '/items/droptarget.dot') },
    text:           { compClass: 'MLText',              template: fs.readFileSync(__dirname + '/items/text.dot') },
    imagelist:      { compClass: 'CCImagePreviewList' },
    articlehistory: { compClass: 'CCArticleHistory' },
    linklist:       { compClass: 'CCLinkList',          template: fs.readFileSync(__dirname + '/items/linklist.dot') }
};


module.exports = itemTypes;
