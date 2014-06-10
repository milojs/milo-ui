'use strict';

var componentRegistry = milo.registry.components
    , Component = milo.Component
    , MLImage = componentRegistry.get('MLImage');


var CCPreviewImage = MLImage.createComponentClass('CCPreviewImage', {
    data: {
        get: CCPreviewImage_get,
        set: CCPreviewImage_set,
        del: CCPreviewImage_del
    },
    model: undefined,
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

function CCPreviewImage_set(value) {
    this.model.set(value);
}

function CCPreviewImage_get() {
    return this.model.get();
}

function CCPreviewImage_del() {
    this.model.del();
    this.container.scope.image.el.removeAttribute(src);
}

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
    this.container.scope.image.el.src = data.url;
}


function CCPreviewImage$setImageSrc(url) {
    this.container.scope.image.el.src = url;
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
