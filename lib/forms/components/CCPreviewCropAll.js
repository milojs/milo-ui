'use strict';

var componentRegistry = milo.registry.components
    , Component = milo.Component;


var CCPreviewCropAll = Component.createComponentClass('CCPreviewCropAll', {
    drop: {
        allow: {
            components: {
                'CMImageGroup': true
            }
        }
    }
});


module.exports = CCPreviewCropAll;

componentRegistry.add(CCPreviewCropAll);