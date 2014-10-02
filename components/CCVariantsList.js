'use strict';


var componentsRegistry = milo.registry.components
    , formRegistry = require('../registry')
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger
    , countries = require('../../countries').toArray();


var variantsTemplate = '<div class="ml-ui-list cc-variants-all-regions"> \
                            <div class="list-item"> \
                                <span class="cc-variant-label">All regions</span> \
                                <span class="cc-variant-excluded"> \
                                    <span ml-bind="[dom]:defaultVisible" class="cc-variant-status">Visible</span> \
                                    <span ml-bind="[dom]:defaultExcludedWrapper" class="cc-variant-status"> \
                                        <input ml-bind="MLInput:defaultExcluded" type="checkbox"> \
                                        Excluded \
                                    </span> \
                                </span> \
                            </div> \
                        </div> \
                        <div ml-bind="MLList:variants"> \
                            <div ml-bind="MLListItem:variant" class="list-item"> \
                                <span class="fa fa-trash-o cc-variant-icon" ml-bind="[events, dom]:deleteBtn"></span> \
                                <span ml-bind="[data]:label" class="cc-variant-label"></span> \
                                <span ml-bind="[dom]:visible" style="display:none;" class="cc-variant-status">Visible</span> \
                                <span ml-bind="[dom]:excludedWrapper" class="cc-variant-status"> \
                                    <input ml-bind="MLInput:excluded" type="checkbox"> \
                                    Excluded \
                                </span> \
                            </div> \
                        </div> \
                        <div ml-bind="MLSuperCombo:addCountry"></div>';


var CCVariantsList = Component.createComponentClass('CCVariantsList', {
    container: undefined,
    data: undefined,
    dom: {
        cls: ['cc-variants-list']
    },
    events: undefined,
    template: {
        template: variantsTemplate,
        interpolate: false
    }
});


module.exports = CCVariantsList;
componentsRegistry.add(CCVariantsList);
formRegistry.add('variantslist', {
    compClass: 'CCVariantsList',
    modelPathRule: 'required',
    itemFunction: processVariantsListSchema
});


_.extendProto(CCVariantsList, {
    init: CCVariantsList$init
});


function CCVariantsList$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
}


function onChildrenBound(msg, data) {
    this.template.render().binder();
    var scope = this.container.scope

    var addCountry = scope.addCountry;
    addCountry.setOptions(countries);
    addCountry.data.on('', { subscriber: onAddCountry, context: this });

    this._list = scope.variants;
    this._list.on('deleteitem', { subscriber: onDeleteCountry, context: this });

    this._list.model.onMessages({
        '': { subscriber: onListChange, context: this }, // splice events
        '[*].excluded': {subscriber: onVariantExcluded, context: this }
    });

    this.data.onMessages({
        '.defaultExcluded': {subscriber: onVariantExcluded, context: this }
    });
}


function onAddCountry(msg, data) {
    // check number of live variants, show excluded option if live variants became more than one
    toggleVariantsUI.call(this);

    var country = _.clone(data.newValue);
    this._list.model.push(country);
    this._article.postMessage('addvariant', { criteria: _getCriteria(country) });
}


function onDeleteCountry(msg, data) {
    // check number of live variants, do not allow to delete if it is the last live variant
    toggleVariantsUI.call(this);

    var country = data.itemData;
    this._article.postMessage('removevariant', { criteria: _getCriteria(country) });
}


function _getCriteria(country) {
    return { geo: country.value };
}


function onListChange(msg, data) {
    var count = this._list.model.m('.length').get()
        , showVisible = count == 0
        , scope = this.container.scope;

    scope.defaultVisible.dom.toggle(showVisible);
    scope.defaultExcludedWrapper.dom.toggle(!showVisible);

    _.deferMethod(this, toggleVariantsUI);
}


function onVariantExcluded(msg, data) {
    toggleVariantsUI.call(this);
}


function toggleVariantsUI() {
    // check number of live variants, if only one live variant remains, then hide its excluded option
    var notExcludedCount = getCountOfNotExcludedVariants.call(this);
    toggleAllNotExcludedUI.call(this, notExcludedCount > 1);
}


function getCountOfNotExcludedVariants() {
    var list = this._list.model.get()
        , scope = this.container.scope
        , count = !scope.defaultExcluded.data.get();
    list && list.forEach(function(variantData){
        count += !variantData.excluded;
    });

    return count;
}


function toggleAllNotExcludedUI(onOff) {
    var scope = this.container.scope
        , defaultExcluded = scope.defaultExcluded.data.get();

    if(!defaultExcluded) {
        scope.defaultExcludedWrapper.dom.toggle(onOff);
        scope.defaultVisible.dom.toggle(!onOff);
    }

    this._list.list.each(function(item){
        var itemScope = item.container.scope 
            , excluded = itemScope.excluded;

        if (!excluded.data.get()){
            itemScope.excludedWrapper.dom.toggle(onOff);
            itemScope.visible.dom.toggle(!onOff);
            itemScope.deleteBtn.dom.toggle(onOff);
        }
    });
}


function processVariantsListSchema(comp, schema) {
    comp._article = this;
}
