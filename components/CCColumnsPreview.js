'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger;

var CCColumnsPreview = Component.createComponentClass('CCColumnsPreview', {
    container: undefined,
    events: {
        messages: {
            'click': { subscriber: onClick, context: 'owner' }
        }
    },
    data: {
        messages: {
            '.colItems': {subscriber: onColsChanged, context:'owner'}
        }
    },
    dom: {
        cls: 'cc-ui-columns'
    },
    template: {
        template: '<div ml-bind="[list, events]:colItems" class="cc-cols-preview">\
                            <div ml-bind="[item]:col" class="cc-col-preview">\
                                <div class="cc-col-preview-content">\
                                    <button class="cc-del-col fa fa-trash-o"> </button>\
                                    <span ml-bind="[data]:name"></span>\
                                </div>\
                            </div>\
                   </div>'
    }
});

componentsRegistry.add(CCColumnsPreview);
module.exports = CCColumnsPreview;

/**
 * Public Api
 */
_.extendProto(CCColumnsPreview, {
    init: MLColumns$init
});

function onClick (msg, event){
    var target = event.target;
    if(isDelColBtn(target)){
        console.log('ABOUT TO DELETE A COLUMN', this);
    }

}

function isDelColBtn(elem){
    return elem.classList.contains('cc-del-col')
}


function onColsChanged(){
    var self = this;
    _.defer(function () {
        var colList = self.container.scope.colItems.list;
        var colCount = colList.count()
        var columnClass = 'cc-col-span' + 12 / colCount;

        colList.each(function (column) {
            column.dom.removeCssClasses(['cc-col-span12', 'cc-col-span6', 'cc-col-span4', 'cc-col-span3']);
            column.dom.addCssClasses(columnClass);
        });
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

function onChildrenBound () {
    this.off('childrenbound');
    this.template.render().binder();
}
