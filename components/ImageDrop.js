'use strict';

var componentRegistry = milo.registry.components
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


function CCImageDrop_onDragEnter() {

}


function CCImageDrop_onDragOver() {
	
}


function CCImageDrop_leaveImage() {
	
}


function CCImageDrop_onDrop() {

}
