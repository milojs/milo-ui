'use strict';

var componentRegistry = milo.registry.components
    , Component = milo.Component
	, MLImage = componentRegistry.get('MLImage');


var CCImageDrop = MLImage.createComponentClass('CCImageDrop', {
	drop: {
		messages: {
			'dragenter': {context: 'owner', subscriber: CCImageDrop_onDragEnter},
			'dragover': {context: 'owner', subscriber: CCImageDrop_onDragOver},
			'dragleave': CCImageDrop_leaveImage,
			'drop': {context: 'owner', subscriber: CCImageDrop_onDrop}
		}
	},
	croppable: {
        modelRootPath: '.croppable'
    }
});


module.exports = CCImageDrop;

componentRegistry.add(CCImageDrop);


_.extendProto(CCImageDrop, {
    setImageData: CCImageDrop$setImageData,
    setImageSrc: CCImageDrop$setImageSrc
});


function CCImageDrop$setImageData(data) {
    var modelRootPath = this.croppable.config.modelRootPath;
    this.model.m(modelRootPath).set(data);
}


function CCImageDrop$setImageSrc(url) {
    this.model.m('.src').set(url);
}


function CCImageDrop_onDragEnter(eventType, event) {
    event.preventDefault();
}


function CCImageDrop_onDragOver(eventType, event) {
    event.preventDefault();
}


function CCImageDrop_leaveImage(eventType, event) {
	
}


function CCImageDrop_onDrop(eventType, event) {

}
