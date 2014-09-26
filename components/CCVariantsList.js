'use strict';


var componentsRegistry = milo.registry.components
    , formRegistry = require('../registry')
    , Component = componentsRegistry.get('Component')
    , logger = milo.util.logger
    , countries = require('../../countries').toArray();


var variantsTemplate = '<div> \
                            <span>All regions</span> \
                            <span ml-bind=":defaultVisible">Visible</span> \
                            <span ml-bind=":defaultExcludedWrapper"> \
                                <input ml-bind="MLInput:defaultExcluded" type="checkbox"> \
                                Excluded \
                            </span> \
                        </div> \
                        <ul ml-bind="MLList:variants"> \
                            <li ml-bind="MLListItem:variant"> \
                                <span class="cc-icon cc-delete-icon" ml-bind="[events]:deleteBtn"></span> \
                                <span ml-bind="[data]:label"></span> \
                                <input ml-bind="MLInput:excluded" type="checkbox"> \
                                Excluded \
                            </li> \
                        </ul> \
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
    this._list.model.onMessages({
        '': { subscriber: onListChange, context: this }, // splice events
        '[*].excluded': {subscriber: onVariantExcluded, context: this }
    });
}


function onAddCountry(msg, data) {
    var country = _.clone(data.newValue);
    this._list.model.push(country);
}


function onListChange(msg, data) {
    // console.log('onListChange', msg, data);
}


function onVariantExcluded(msg, data) {
    // console.log('onVariantExcluded', msg, data);
}


function processVariantsListSchema(comp, schema) {
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
