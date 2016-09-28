'use strict';

var MLList = module.exports = milo.createComponentClass({
    className: 'MLList',
    facets: {
        dom: {
            cls: 'ml-ui-list'
        },
        data: undefined,
        events: undefined,
        model: undefined,
        list: undefined
    },
    methods: {
        init: MLList$init,
        destroy: MLList$destroy,
        removeItem: MLList$removeItem,
        moveItem: MLList$moveItem
    }
});


function MLList$init() {
    MLList.super.init.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
}


function MLList$destroy() {
    if (this._connector) milo.minder.destroyConnector(this._connector);
    this._connector = null;
    MLList.super.destroy.apply(this, arguments);
}


function MLList$removeItem(index) {
    this.model.splice(index, 1);
}


function MLList$moveItem(from, to) {
    var splicedData = this.model.splice(from, 1);
    return this.model.splice(to, 0, splicedData[0]);
}


function onChildrenBound() {
    this.model.set([]);
    this._connector = milo.minder(this.model, '<<<-', this.data).deferChangeMode('<<<->>>');
}
