'use strict';
const async = require('async');
const FORMLIST_CHANGE_MESSAGE = 'mlformlistchange';

const MLFormList = module.exports = milo.createComponentClass({
    className: 'MLFormList',
    facets: {
        container: undefined,
        data: {
            get: MLFormList_get,
            set: MLFormList_set,
            del: MLFormList_del,
            splice: MLFormList_splice,
            event: FORMLIST_CHANGE_MESSAGE
        },
        model: undefined,
        dom: {
            cls: [ 'form-list', 'ml-ui-form-list' ]
        },
        events: {
            messages: {
                click: { subscriber: handleClick, context: 'owner' }
            }
        }
    },
    methods: {
        init: MLFormList$init,
        moveItem: MLFormList$moveItem,
        setItemSchema: MLFormList$setItemSchema,
        destroy: MLFormList$destroy,
        validateModel: MLFormList$validateModel,
        clearSubSchemaValidation: MLFormList$clearSubSchemaValidation
    }
});

function handleClick (type, event) {
    const component = milo.Component.getContainingComponent(event.target);
    if (component && component.name) {
        const formList = component.getScopeParentWithClass('MLFormList');
        const formItem = component.getScopeParentWithClass('MLFormListItem');
        if (formItem) {
            const item = formItem.item;
            if (component.name === 'downBtn') {
                formList.moveItem(item.index, item.index + 1);
            } else if (component.name === 'upBtn') {
                formList.moveItem(item.index, item.index - 1);
            } else if (component.name === 'deleteBtn') {
                item.removeItem();
            }
        }
    }
}

function MLFormList$init () {
    MLFormList.super.init.apply(this, arguments);
    this.once('childrenbound', onChildrenBound);
    this._invalidFormControls = {};
}

function MLFormList$setItemSchema (schema) {
    this._subFormSchema = schema.subSchema;
    this._movable = !!schema.allowMove;
    this._deletable = !!schema.allowDelete;
    this._itemLabel = schema.itemLabel;
    this._prepend = schema.allowPrepend;
    showHidePrepend.call(this);
}

function MLFormList$moveItem (fromIndex, toIndex) {
    const toInsert = this.model.m.splice(fromIndex, 1);
    if (toInsert) return this.model.m.splice(toIndex, 0, toInsert[0]);
}

function MLFormList$destroy () {
    if (this._connector) milo.minder.destroyConnector(this._connector);
    this._connector = null;
    MLFormList.super.destroy.apply(this, arguments);
}

function onChildrenBound () {
    const scope = this.container.scope;
    this._connector = milo.minder(this.model, '->>>', scope.list.data).deferChangeMode('<<<->>>');
    scope.addBtn && scope.addBtn.events.on('click', { subscriber: addItem, context: this });
    if (scope.addBtnBefore) {
        scope.addBtnBefore.events.on('click', { subscriber: addItemBefore, context: this });
        showHidePrepend.call(this);
    }
    this.model.m.on('*', { subscriber: _triggerExternalPropagation, context: this });
}

function showHidePrepend() {
    const scope = this.container.scope;
    if (!scope.addBtnBefore) return;
    const model = this.model.get();
    scope.addBtnBefore.el.classList.toggle('hidden', !this._prepend || !model || model.length === 0);
}

function addItem () {
    this.model.m.push({});
}

function addItemBefore () {
    this.model.m.unshift({});
}

function MLFormList_get () {
    const model = this.model.get();
    return model ? _.clone(model) : undefined;
}

function MLFormList_set (value) {
    this.model.set(value);
    _triggerExternalPropagation.call(this);
}

function MLFormList_del () {
    const res = this.model.set([]);
    _triggerExternalPropagation.call(this);
    return res;
}

function MLFormList_splice (index, howmany) {
    const args = [ index, howmany ].concat(Array.prototype.slice.call(arguments, 2));
    this.model.splice.apply(this.model, args);
    _triggerExternalPropagation.call(this);
}

function _triggerExternalPropagation () {
    this.data.dispatchSourceMessage(FORMLIST_CHANGE_MESSAGE);
    showHidePrepend.call(this);
}

function MLFormList$clearSubSchemaValidation () {
    this._invalidFormControls = {};
}

function MLFormList$validateModel (callback, invalidControls) {
    const validations = [];
    const self = this;
    this._dataValidations = { fromModel: {} };
    this.model.m().get().forEach((data, index) => {
        this._subFormSchema.items.forEach((item) => {
            if (item.validate && item.validate.fromModel && item.validate.fromModel[0] === 'required') {
                this._dataValidations.fromModel[`${index}${item.modelPath}`] = [validateRequired];
            }
        });
    });

    _.eachKey(this._dataValidations.fromModel, function (validators, modelPath) {
        const [index, path] = modelPath.split('.');
        const data = this.model.m().get()[index][path];
        validators = Array.isArray(validators) ? validators : [validators];

        if (validators && validators.length) {
            validations.push({
                modelPath: modelPath,
                data: data,
                validators: validators
            });
        }
    }, this);


    let allValid = true;
    async.each(validations,
        function (validation, nextValidation) {
            let lastResponse;
            async.every(validation.validators,
                function (validator, next) {
                    validator(validation.data, function (err, response) {
                        lastResponse = response || {};
                        next(err, lastResponse.valid);
                    });
                },
                function (err, valid) {
                    lastResponse.path = validation.modelPath;
                    lastResponse.valid = valid;
                    handleValidatedComponents.call(self, lastResponse, invalidControls);
                    if (!valid) allValid = false;
                    nextValidation(null);
                }
            );
        },
        function (err) {
            invalidControls = Object.assign({}, invalidControls, self._invalidFormControls);
            callback && callback({allValid, invalidControls});
        }
    );
}

function validateRequired(data, callback) {
    const valid = typeof data != 'undefined'
        && (typeof data != 'string' || data.trim() != '');
    const response = MLForm$$validatorResponse(valid, 'please enter a value', 'REQUIRED');
    callback(null, response);
}

function MLForm$$validatorResponse(valid, reason, reasonCode) {
    return valid
        ? { valid: true }
        : { valid: false, reason: reason, reasonCode: reasonCode };
}

function handleValidatedComponents(response) {
    if (response.valid) {
        delete this._invalidFormControls[response.path];
    } else {
        const [index, modelPath] = response.path.split('.');
        let reason = {
            label: `List Item ${Number(index)+1}. ${modelPath}`,
            reason: response.reason,
            reasonCode: response.reasonCode
        };
        this._invalidFormControls[response.path] = {
            reason: reason
        };
    }
}

