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
                                    <span ml-bind="[dom]:defaultVisible">Visible</span> \
                                    <span ml-bind="[dom]:defaultExcludedWrapper"> \
                                        <input ml-bind="MLInput:defaultExcluded" type="checkbox"> \
                                        Excluded \
                                    </span> \
                                </span> \
                            </div> \
                        </div> \
                        <div ml-bind="MLList:variants"> \
                            <div ml-bind="MLListItem:variant" class="list-item"> \
                                <span class="fa fa-trash-o cc-variant-icon" ml-bind="[events]:deleteBtn"></span> \
                                <span ml-bind="[data]:label" class="cc-variant-label"></span> \
                                <span class="cc-variant-excluded"> \
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
}


function onAddCountry(msg, data) {
    var country = _.clone(data.newValue);
    this._list.model.push(country);
    this._article.postMessage('addvariant', { criteria: _getCriteria(country) });
}


function onDeleteCountry(msg, data) {
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
}


function onVariantExcluded(msg, data) {
    // console.log('onVariantExcluded', data);
}


function processVariantsListSchema(comp, schema) {
    comp._article = this;
    // if (this.hasVariants()) {
    //     var variants = comp._variants = this.getSecondaryVariants();
    //     if (variants && variants.length) {
    //         var listData = [];
    //         variants.forEach(function(variant) {
    //             var criteria = variant.getCriteria()
    //                 , country = _.find(countries, function(c) {
    //                     return criteria.geo == c.value;
    //                 });
    //             if (country) {
    //                 var country = _.clone(country);
    //                 country.excluded = variant.isExcluded();
    //                 listData.push(country);
    //             }
    //         });

    //         _.deferMethod(comp._list.model, 'set', listData);
    //     }
    // }
}
