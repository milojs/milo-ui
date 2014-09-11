'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger
    , formRegistry = require('../registry');

var COLS_FULL_CLASS = 'cc-cols-full';

var CCColumnsPreview = Component.createComponentClass('CCColumnsPreview', {
    container: undefined,
    events: {
        messages: {
            'click': { subscriber: onClick, context: 'owner' }
        }
    },
    data: {
        messages: {
            '.colItems': {subscriber: onColsChanged, context: 'owner'}
        }
    },
    dom: {
        cls: 'cc-ui-columns'
    },
    template: {
        template: '<div class="cc-cols-preview-container">\
                        <div ml-bind="[list, events]:colItems" class="cc-cols-preview">\
                                <div ml-bind="[item]:col" class="cc-col-preview">\
                                    <div class="cc-col-preview-content">\
                                        <button class="cc-del-col fa fa-trash-o"> </button>\
                                        <span ml-bind="[data]:name"></span>\
                                    </div>\
                                </div>\
                        </div>\
                        <div class="cc-col-preview-add">\
                            <button class="cc-add-col fa fa-plus"> </button>\
                            <span>Add column</span>\
                        </div>\
                   </div>'
    }
});

componentsRegistry.add(CCColumnsPreview);
module.exports = CCColumnsPreview;

formRegistry.add('columns', {
    compClass: 'CCColumnsPreview',
    modelPathRule: 'required'
});


/**
 * Public Api
 */
_.extendProto(CCColumnsPreview, {
    init: MLColumns$init
});

function onClick(msg, event) {
    var target = event.target;
    var colItem;

    if (isDelColBtn(target)) {
        colItem = Component.getContainingComponent(target);
        this.events.postMessage('ccColsPreview_deleteColumn', { index: colItem.item.index });

    } else if(isAddColBtn(target)) {
        var colList = this.container.scope.colItems.list;
        var colCount = colList.count();
        this.events.postMessage('ccColsPreview_addColumn', {name: colCount + 1});
    }


}

function isDelColBtn(elem) {
    return elem.classList.contains('cc-del-col')
}

function isAddColBtn(elem) {
    return elem.classList.contains('cc-add-col');
}

function onColsChanged() {
    var self = this;
    var containerEl = self.el.querySelector('.cc-cols-preview-container');

    _.defer(function () {
        var colList = self.container.scope.colItems.list;
        var colCount = colList.count();
        var columnClass = 'cc-col-span' + 12 / colCount;

        colList.each(function (column, index) {
            column.dom.removeCssClasses(['cc-col-span12', 'cc-col-span6', 'cc-col-span4', 'cc-col-span3']);
            column.dom.addCssClasses(columnClass);
            column.data.set({name: index + 1});
        });

        if(colCount === 4) {
            containerEl.classList.add(COLS_FULL_CLASS);
        } else {
            containerEl.classList.remove(COLS_FULL_CLASS);
        }

    });
}

/**
 * Component instance method
 * Initialise the component, wait for childrenbound, setup empty options arrays.
 */
function MLColumns$init() {
    Component.prototype.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}

function onChildrenBound() {
    this.off('childrenbound');
    this.template.render().binder();
}