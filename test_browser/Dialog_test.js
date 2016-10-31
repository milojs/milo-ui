'use strict';

/* eslint-env browser, commonjs, node, mocha */

var assert = require('assert')
    , MLDialog = milo.registry.components.get('MLDialog');

var options = {
    title: 'Test',
    html: '<div><button ml-bind="[events]:button">Click me</button></div>',
    buttons: [
        { type: 'default', label: 'Cancel', name: 'cancel' },
        { type: 'primary', label: 'Ok', result: 'ok', name: 'ok' }
    ]
};


describe('Dialog', function() {
    it('should have createDialog class method', function() {
        var dialog = MLDialog.createDialog(options);
        assert(dialog instanceof MLDialog);
        var button = dialog.container.path('.dialogBody.button');
        assert(button instanceof milo.Component);
        dialog.destroy();
    });


    it('should allow custom initialization', function(done) {
        var button, clicked;
        var dialog = MLDialog.createDialog(options, initialize);
        dialog.openDialog(_.noop);
        button.events.postMessage('click');
        _.defer(function() {
            assert(clicked);
            dialog.closeDialog();
            dialog.destroy();
            done();
        });

        function initialize(dialog) {
            button = dialog.container.path('.dialogBody.button');
            button.events.on('click', function() {
                clicked = true;
            });
        }
    });

    it('should open and close', (done) => {
        const dialog = createDialog("dialog");

        dialog.openDialog((result) => {
            done();
            dialog.closeDialog();
            assert(document.querySelector('#dialog') == null);
        });

        assert(document.querySelector('#dialog') != null);

        document.querySelector('.close').click();
    });

    it('should not allow multiple dialogs to be open', () => {
        const dialog = createDialog("dialog");
        const dialog2 = createDialog("dialog2");

        dialog.openDialog(() => {});
        dialog2.openDialog(() => {});

        assert(document.querySelector('#dialog') != null);
        assert(document.querySelector('#dialog2') == null);
    });
});

function createDialog(id) {
    return MLDialog.createDialog({
        title: 'Dialog title',
        html: `<p id="${id}">Dialog body</p>`
    });
}
