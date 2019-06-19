'use strict';

var MLList = module.exports = milo.createComponentClass({
    className: 'MLList',
    facets: {
        dom: {
            cls: 'ml-ui-list'
        },
        data: undefined,
        events: undefined,
        model: {
            messages: {
                '*': { subscriber: onListChange, context: 'owner' }
            }
        },
        list: undefined
    },
    methods: {
        init: MLList$init,
        destroy: MLList$destroy,
        removeItem: MLList$removeItem,
        moveItem: MLList$moveItem,
        setListLimit: MLList$setListLimit,
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

function MLList$setListLimit(limit) {
    this._listLimit = Number.isInteger(limit) && limit !== 0 && limit;
}


function onChildrenBound() {
    this.model.set([]);
    this._connector = milo.minder(this.model, '<<<-', this.data).deferChangeMode('<<<->>>');
}

function onListChange(_msg, { type }) {
    const { _listLimit, list } = this;
    const currentItemCount = list.count();
    if(type === 'added' && _listLimit && currentItemCount >= _listLimit){
        const diff = Math.abs(currentItemCount - _listLimit) + 1;
        list.removeItems(0, diff);
    }
}
