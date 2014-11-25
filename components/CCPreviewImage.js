'use strict';

var componentRegistry = milo.registry.components
    , Component = milo.Component
    , MLImage = componentRegistry.get('MLImage')
    , ccCommon = require('cc-common')
    , imagesConfig = require('../../config/images')
    , DragDrop = milo.util.dragDrop
    , logger = milo.util.logger
    , PREVIEW_IMAGE_CHANGE_MESSAGE = 'previewimagechange';

var IMAGE_LOADING_CLASS = 'cc-image-loading';

var CCPreviewImage = MLImage.createComponentClass('CCPreviewImage', {
    model: {
        messages: {
            '.croppable.wpsImage.hostUrl': { subscriber: updateSrc, context: 'owner' },
            '**': { subscriber: onModelChange, context: 'owner' }
        }
    },
    drop: {
        allow: {
            components: {
                'CMImageGroup': canAcceptDroppedImage
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
    },
    dom: {
        cls: 'ml-ui-image'
    }
});


module.exports = CCPreviewImage;

componentRegistry.add(CCPreviewImage);


_.extend(CCPreviewImage, {
    onPreviewImageDrop: CCPreviewImage$$onPreviewImageDrop,
    onPreviewImageClick: CCPreviewImage$$onPreviewImageClick,
    onCropAllDrop: CCPreviewImage$$onCropAllDrop,
    translate: {
        fromModel: imageFromModel,
        toModel: imageToModel
    }
});


function imageFromModel(modelValue) {
    var src;
    try {
        src = modelValue.wpsImage.hostUrl;
    }
    catch (e) {
        src = '';
    }
    return {
        src: src,
        croppable: modelValue
    };
}


function imageToModel(viewValue) {
    var data = viewValue && viewValue.croppable;
    return data;
}


function canAcceptDroppedImage(info, dt) {
    return !info.params.imageFromArticle;
}


function CCPreviewImage$$onPreviewImageDrop(imageType, msg, event) {
    event.target.parentNode.classList.add(IMAGE_LOADING_CLASS);
    var dt = new DragDrop(event);
    var cropType = _getPreviewImageCropType.call(this, imageType);
    var transferState = dt.getComponentState();

    var droppedImage = getDroppedImageComponent(transferState);

    if (droppedImage) {
        var previewImage = this;
        var targetWidth = cropType.width;
        var targetHeight = cropType.height;

        droppedImage.croppable.autoCropImageToFit(targetWidth, targetHeight, { imageType: imageType }, function (err, settings, wpsImage){
            event.target.parentNode.classList.remove(IMAGE_LOADING_CLASS);
            if (err) return logger.error('Error cropping image: ', err);

            droppedImage.croppable.applyCropDetails(settings, wpsImage);
            _applyCropToInspectorImage(droppedImage.model.get(), previewImage);
            _cropLinkedTypes.call(previewImage, previewImage, imageType, settings);
        });
    } else
        logger.error('CMArticle onPreviewImageDrop: no image dropped');
}


function getDroppedImageComponent(state) {
    try { var imageModel = state.facetsStates.container.scope.img0.facetsStates.model} catch(e) {}
    if (!imageModel) return;

    return Component.createFromState(_constructCroppableImageState(imageModel), undefined, true);
}


function CCPreviewImage$$onPreviewImageClick(imageType, msg, event) {
    var cropType = _getPreviewImageCropType.call(this, imageType);
    var previewImage = this;
    previewImage.croppable.showImageEditor([cropType], function(err, cropResponses) {
        if (err) return logger.error('Error cropping image: ', err);
        var imageData = previewImage.croppable.getImageData();
        _applyCropToInspectorImage(imageData, previewImage);
        _cropAnyLinkedTypes.call(previewImage, previewImage, imageType, cropResponses);
    });
}


function CCPreviewImage$$onCropAllDrop(imageTypes, msg, event) {
    var CCForm = componentRegistry.get('CCForm');
    var dt = new DragDrop(event)
        , cropTypes = imageTypes.map(_getPreviewImageCropType, this)
        , transferState = dt.getComponentState();

    var droppedImage = getDroppedImageComponent(transferState);

    if (droppedImage) {
        var self = this;
        droppedImage.croppable.showImageEditor(cropTypes, function(err, cropResponses) {
            var transferItem = droppedImage.model.m('.transferItem').get();
            var form = self.getScopeParentWithClass(CCForm);

            imageTypes.forEach(function(imageType, index) {
                var cropType = cropTypes[index];
                var cropResponse = cropResponses[cropType.name];
                if (!cropResponse) return;

                var modelPath = imagesConfig(imageType).inspectorModelPath;
                var inspectorImage = form.modelPathComponent(modelPath);

                _setPreviewImageAfterCrop(inspectorImage, cropResponse, transferItem, imageType);
                _cropAnyLinkedTypes.call(self, droppedImage, imageType, cropResponses);
            });
        });
    } else
        logger.error('CMArticle onPreviewImageDrop: no image dropped');

    // imageGroup.destroy();
}


function _setPreviewImageAfterCrop(previewImage, cropResponse, transferItem, imageType) {
    if (! cropResponse) return logger.warn('CMArticle onCropAllDrop: No crop response found for:', imageType);

    var imageData = {
        wpsImage: _.omitKeys(cropResponse.wpsImage),
        crop: {
            settings: cropResponse.settings
        },
        transferItem: transferItem
    };
    previewImage.croppable.setImageData(imageData);
    previewImage.model.m('.src').set(imageData.wpsImage.hostUrl);
}


function _cropLinkedTypes(image, imageType, settings) {
    var CCForm = componentRegistry.get('CCForm');
    var form = this.getScopeParentWithClass(CCForm);

    var imageTypeConfig = imagesConfig(imageType);
    var linkedImageTypes = imageTypeConfig.linkedImageTypes;
    if (linkedImageTypes) {
        linkedImageTypes.forEach(function(linkedImageType) {
            var linkedImageTypeConfig = imagesConfig(linkedImageType);
            var size = { h: linkedImageTypeConfig.height, w: linkedImageTypeConfig.width};

            var modelPath = imagesConfig(linkedImageType).inspectorModelPath;
            var linkedImage = form.modelPathComponent(modelPath)
                , imageModel = image.croppable.getImageData();

            linkedImage.croppable.setImageData({
                transferItem: imageModel.transferItem,
                wpsImage: imageModel.wpsImage
            });

            linkedImage.croppable.cropImage(settings.coords, size, { imageType: linkedImageType }, function(err, coords, wpsImage) {
                var imageModel = linkedImage.model.get();
                var imageData = {
                    transferItem: imageModel.transferItem,
                    wpsImage: wpsImage,
                    crop: { settings: settings }
                };

                _applyCropToInspectorImage(imageData, linkedImage);
            });
        });
    }
}


function _cropAnyLinkedTypes(image, imageType, cropResponses) {
    var imageTypeConfig = imagesConfig(imageType);
    var cropResponse = cropResponses[imageTypeConfig.label];
    var settings = cropResponse.settings;

    _cropLinkedTypes.call(this, image, imageType, settings);
}


function _constructCroppableImageState(modelState) {
    return {
        compClass: 'Component',
        compName: 'img0',
        extraFacets: ['croppable'],
        outerHTML: '<div></div>',
        facetsStates: {
            model: modelState
        }
    }
}


function _applyCropToInspectorImage(imageData, inspectorImage) {
    inspectorImage.croppable.setImageData(imageData);
    inspectorImage.model.m('.src').set(imageData.wpsImage.hostUrl);
}


function _getPreviewImageCropType(imageType) {
    var CCForm = componentRegistry.get('CCForm');
    var form = this.getScopeParentWithClass(CCForm);
    if (! form) throw new Error('CMArticle _getPreviewImageCropType: no form found');

    var imageTypeConfig = imagesConfig(imageType);
    var modelPath = imageTypeConfig.inspectorModelPath;
    var inspectorImage = form.modelPathComponent(modelPath);

    var cropType = imageTypeConfig.cropSettings();

    var cropData = inspectorImage.croppable.getCropData();
    if (cropData && cropData.settings) {
        _.extend(cropType, cropData.settings);
    }

    var wpsImage = inspectorImage.croppable.getWpsImage();
    if (wpsImage) {
        cropType.description = wpsImage.description;
    }
    return cropType;
}


_.extendProto(CCPreviewImage, {
    init: CCPreviewImage$init,
    setImageSrc: CCPreviewImage$setImageSrc
});


function CCPreviewImage$init() {
    MLImage.prototype.init.apply(this, arguments);

    var imgEls = this.el.getElementsByTagName('img');
    if (imgEls.length)
        this._imageElement = imgEls[0];
}


function CCPreviewImage$setImageSrc(url) {
    this.container.scope.image.el.src = url || '';
}


function updateSrc(msg, data) {
    var src = data.newValue;
    if (src) this.setImageSrc(src);
}


function onModelChange(path, data) {
    var src = this.model.m('.src').get();
    if (src) this.setImageSrc(src);
    this.data.dispatchSourceMessage(this.data.config.event);
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
