'use strict';

var componentRegistry = milo.registry.components
    , Component = milo.Component
    , MLImage = componentRegistry.get('MLImage');


var CCPreviewImage = MLImage.createComponentClass('CCPreviewImage', {
    drop: {
        allow: {
            components: {
                'CMImageGroup': true
            }
        },
        messages: {
            'dragenter': {context: 'owner', subscriber: CCPreviewImage_onDragEnter},
            'dragover': {context: 'owner', subscriber: CCPreviewImage_onDragOver},
            'dragleave': CCPreviewImage_leaveImage,
            'drop': {context: 'owner', subscriber: CCPreviewImage_onDrop}
        }
    },
    croppable: {
        modelRootPath: '.croppable'
    },
    drag: {
        off: true
    }
});


module.exports = CCPreviewImage;

componentRegistry.add(CCPreviewImage);


_.extendProto(CCPreviewImage, {
    setImageData: CCPreviewImage$setImageData,
    getImageData: CCPreviewImage$getImageData,
    setImageSrc: CCPreviewImage$setImageSrc,
    setSize: CCPreviewImage$setSize,
    getSize: CCPreviewImage$getSize
});

function CCPreviewImage$setSize() {
    //noop - just to satisfy Croppable interface
}

function CCPreviewImage$getSize() {
    //noop - just to satisfy Croppable interface
}


function CCPreviewImage$getImageData() {
    var modelRootPath = this.croppable.config.modelRootPath;
    return this.model.m(modelRootPath).get();
}


function CCPreviewImage$setImageData(data) {
    var modelRootPath = this.croppable.config.modelRootPath;
    this.model.m(modelRootPath).set(data);
}


function CCPreviewImage$setImageSrc(url) {
    this.model.m('.src').set(url);
}


function CCPreviewImage_onDragEnter(eventType, event) {
    event.preventDefault();
}


function CCPreviewImage_onDragOver(eventType, event) {
    event.preventDefault();
}


function CCPreviewImage_leaveImage(eventType, event) {
    
}


function CCPreviewImage_onDrop(eventType, event) {

}
