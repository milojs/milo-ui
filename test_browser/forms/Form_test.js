'use strict';

const assert = require('assert');
const MLForm = milo.registry.components.get('MLForm');
const formRegistry = MLForm.registry;

describe.only('Forms', () => {
    describe('Registry', () => {
        it('should register new form type with defaults', () => {
            formRegistry.add('testreg_defaults', {
                compClass: 'Component'
            });

            const formItem = formRegistry.get('testreg_defaults');

            assert.equal(formItem.compClass, 'Component');
            assert.equal(formItem.modelPathRule, 'required');
            assert(formItem.template, 'has default template');
            assert.equal(formItem.itemFunction, null);
        });

        it('should throw with bad config', () => {
            assert.throws(() => {
                formRegistry.add('testreg_throws', {
                    compClass: milo.Component
                });
            }, 'throws after type checking');
        });
    });
});
