'use strict';

var Component = milo.Component
    , componentsRegistry = milo.registry.components;

var MLDate = Component.createComponentClass('MLDate', {
    events: undefined,
    data: {
        get: MLDate_get,
        set: MLDate_set,
        del: MLDate_del,
    },
    dom: {
        cls: 'ml-ui-date'
    }
});

_.extendProto(MLDate, {
    getMin: MLDate$getMin,
    setMin: MLDate$setMin,
    getMax: MLDate$getMax,
    setMax: MLDate$setMax
});

componentsRegistry.add(MLDate);

module.exports = MLDate;


function MLDate$getMin() {
    return fromISO8601Format(this.el.min, this.utc);
}


function MLDate$setMin(value) {
    var date = _.toDate(value);

    this.el.min = date ? toISO8601Format(date, this.utc) : '';
}


function MLDate$getMax() {
    return fromISO8601Format(this.el.max, this.utc);
}


function MLDate$setMax(value) {
    var date = _.toDate(value);

    this.el.max = date ? toISO8601Format(date, this.utc) : '';
}


function MLDate_get() {
    return fromISO8601Format(this.el.value, this.utc);
}


function MLDate_set(value) {
    var date = _.toDate(value);

    this.el.value = date ? toISO8601Format(date, this.utc) : '';

    dispatchInputMessage.call(this);
}

function MLDate_del() {
    this.el.value = '';

    dispatchInputMessage.call(this);
}


function dispatchInputMessage() {
    this.data.dispatchSourceMessage('input'); // Dispatch the 'input' (usually dispatched by the underlying <input> element) event so that the data change can be listened to
}


function toISO8601Format(date, utc) {
    var dateStr = [
        get('FullYear'),
        pad(get('Month') + 1), // JS Date API indexes month from 0
        pad(get('Date'))
    ].join('-');

    return dateStr;

    function pad(n) { return n < 10 ? '0' + n : n; }
    function get(field) { return date['get' + (utc ? 'UTC' : '') + field ](); }
}


function fromISO8601Format(dateStr, utc) {
    var date = null;

    if (dateStr && utc) {
        var values = dateStr.split('-').map(function (v) { return +v; }); // [ year, month, date ]
        values[1]--; // Month is indexed from 0 in the js date API.

        date = new Date(Date.UTC(values[0], values[1], values[2]));
    } else {
        date = _.toDate(dateStr);
    }

    return date;
}
