'use strict';

var componentRegistry = milo.registry.components
    , Component = milo.Component
    , MLImage = componentRegistry.get('MLImage')
    , ccCommon = require('cc-common')
    , imagesConfig = require('../../config/images')
    , DragDrop = milo.util.dragDrop
    , logger = milo.util.logger
    , check = milo.util.check
    , Match = check.Match
    , PREVIEW_IMAGE_CHANGE_MESSAGE = 'previewimagechange';

var IMAGE_LOADING_CLASS = 'cc-image-loading',
    REPLACE_CLASS = 'cc-drop-method-replace';

var CCPreviewImage = MLImage.createComponentClass('CCPreviewImage', {
    model: {
        messages: {
            '.croppable.wpsImage.hostUrl': { subscriber: updateSrc, context: 'owner' },
            '.src': { subscriber: onModelChange, context: 'owner' }
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
            'dragleave': {context: 'owner', subscriber: _.partial(_toggleReplaceState, false)},
            'drop': {context: 'owner', subscriber: _.partial(_toggleReplaceState, false)}
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


_.extendProto(CCPreviewImage, {
    init: CCPreviewImage$init,
    setImageSrc: CCPreviewImage$setImageSrc,
    autocrop: CCPreviewImage$autocrop,
    processFormSchema: CCPreviewImage$processFormSchema,
    setOptions: CCPreviewImage$setOptions,
    _setEvents: CCPreviewImage_setEvents,
    _toggleSubscribe: CCPreviewImage_toggleSubscribe
});


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


function CCPreviewImage$init() {
    MLImage.prototype.init.apply(this, arguments);

    var imgEls = this.el.getElementsByTagName('img');
    if (imgEls.length)
        this._imageElement = imgEls[0];

    this._subscriptions = { croppable: false, dragdrop: false };
    this._cropSettings = {};
}


function CCPreviewImage$setImageSrc(url) {
    this.model.m('.src').set(url);
}

function CCPreviewImage$processFormSchema(schema) {
    if (schema.options) this.setOptions(schema.options);
}


/**
 * Sets options for preview image
 * @param {Object} options see check below
 */
function CCPreviewImage$setOptions(options) {
    options.imageType = options.imageType || this._imageType
    check(options, {
        imageType: String,
        croppable: Match.Optional(Boolean),
        cropSettings: Match.Optional(Object),
        dragdrop: Match.Optional(Boolean),
        showCropperOnDrop: Match.Optional(Boolean)
    });
    this._imageType = options.imageType;
    this._showCropperOnDrop = options.showCropperOnDrop;
    if (options.cropSettings) this._cropSettings = options.cropSettings;
    this._setEvents(options);
}

function CCPreviewImage_setEvents(options) {
    this._toggleSubscribe(options, 'croppable', 'events', 'click', CCPreviewImage.onPreviewImageClick);
    this._toggleSubscribe(options, 'dragdrop', 'drop', 'drop', CCPreviewImage.onPreviewImageDrop);
}

function CCPreviewImage_toggleSubscribe(options, optKey, facet, event, subscriber) {
    var opt = options[optKey];
    if (this._subscriptions[optKey] != opt) {
        this[facet][opt ? 'on' : 'off'](event, { subscriber: _.partial(subscriber, this._imageType), context: this });
        this._subscriptions[optKey] = opt;
    }
}

function CCPreviewImage$$onPreviewImageDrop(imageType, msg, event, customTarget) {
    var previewImage = this;
    var droppedImage = getDroppedImageComponent(new DragDrop(event).getComponentState());

    if (droppedImage) {
        // Settings for the crop which is to take place
        var cropType = _.deepClone(_getPreviewImageCropType(imageType, this));
        _.extend(cropType, this._cropSettings || {});

        // Toggles the loading CSS class during the crop operation.
        var toggleLoading = function(isLoading) {
            (customTarget || event.target.parentNode).classList.toggle(IMAGE_LOADING_CLASS, isLoading);
        }

        // Applies the crop to the previewImage.
        var applyCropDetails = function(err, settings, wpsImage) {
            if(!err) {
                previewImage.croppable.getImageModel().del(); // remove old wpsImage so it doesn't interfere with new crop (of scratched images)
                previewImage.croppable.applyCropDetails(settings, wpsImage, false, function(err) {
                    if(!err) {
                        var imageData = previewImage.croppable.getImageData();

                        _applyCropToInspectorImage(imageData, previewImage);
                        _cropLinkedTypes.call(previewImage, previewImage, imageType, settings);
                    }

                    toggleLoading(false);
                });
            } else {
                toggleLoading(false);
            }
        }

        toggleLoading(true);

        if(previewImage._showCropperOnDrop) {
            droppedImage.croppable.showImageEditor([cropType], function(err, cropResponses) {
                var response = err ? {} : cropResponses[cropType.name];

                applyCropDetails(err, response.settings, response.wpsImage);
            });
        } else {
            droppedImage.croppable.autoCropImageToFit(cropType.width, cropType.height, { imageType: imageType }, applyCropDetails);
        }
    } else {
        logger.error('CMArticle onPreviewImageDrop: no image dropped');
    }
}

function CCPreviewImage$autocrop(imageType) {
    var self = this;
    self.el.classList.add(IMAGE_LOADING_CLASS);

    var cropType = _getPreviewImageCropType(imageType, self);
    var targetWidth = cropType.width;
    var targetHeight = cropType.height;

    self.croppable.autoCropImageToFit(targetWidth, targetHeight, { imageType: imageType }, function (err, settings, wpsImage){
        self.el.classList.remove(IMAGE_LOADING_CLASS);
        if (err) return logger.error('Error cropping image: ', err);

        self.croppable.getImageModel().del(); // remove old wpsImage so it doesn't interfere with new crop
        self.croppable.applyCropDetails(settings, wpsImage, null, function(err) {
            if (err) {
                return logger.error("Failed to apply crop details on drop: " + err);
            }
        });
    });
}


function getDroppedImageComponent(state) {
    try { var imageModel = state.facetsStates.container.scope.img0.facetsStates.model} catch(e) {}
    if (!imageModel) return;

    return Component.createFromState(_constructCroppableImageState(imageModel), undefined, true);
}


function CCPreviewImage$$onPreviewImageClick(imageType, msg, event) {
    var cropType = _getPreviewImageCropType(imageType, this);
    if (this._cropSettings) {
        cropType = _.deepClone(cropType);
        _.extend(cropType, this._cropSettings);
    }
    var previewImage = this;
    this.croppable.showImageEditor([cropType], function(err, cropResponses) {
        if (err) return logger.error('Error cropping image: ', err);
        var imageData = previewImage.croppable.getImageData();
        _applyCropToInspectorImage(imageData, previewImage);
        _cropAnyLinkedTypes.call(previewImage, previewImage, imageType, cropResponses);
    });
}


function CCPreviewImage$$onCropAllDrop(imageTypes, msg, event) {
    var CCForm = componentRegistry.get('CCForm');
    var dt = new DragDrop(event)
        , cropTypes = _getPreviewImageCropTypes.call(this, imageTypes)
        , transferState = dt.getComponentState();

    var droppedImage = getDroppedImageComponent(transferState);

    if (droppedImage) {
        var self = this;
        droppedImage.croppable.showImageEditor(cropTypes, function(err, cropResponses) {
            var transferItem = droppedImage.model.m('.transferItem').get();
            var form = self.getScopeParentWithClass(CCForm);
            if (!form) return;

            imageTypes.forEach(function(imageType, index) {
                var cropType = cropTypes[index];
                var cropResponse = cropResponses[cropType.name];
                if (!cropResponse) return;

                var modelPath = imagesConfig(imageType).inspectorModelPath;
                var inspectorImage = form.modelPathComponent(modelPath);

                _setPreviewImageAfterCrop(inspectorImage, cropResponse, transferItem, imageType);
                _cropAnyLinkedTypes.call(self, droppedImage, imageType, cropResponses);
            });
        })
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
    if (!form) return;

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
                if (err) return logger.error('Error cropping linked image: ', imageType, err);

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
    if (!imageData.wpsImage) throw new Error("No wpsImage data in provided imageData");
    inspectorImage.croppable.setImageData(imageData);
    if (! imageData.wpsImage) return;
    inspectorImage.model.m('.src').set(imageData.wpsImage.hostUrl);
}


function _getPreviewImageCropType(imageType, previewImage) {
    var imageTypeConfig = imagesConfig(imageType);
    var cropType = imageTypeConfig.cropSettings();

    var cropData = previewImage.croppable.getCropData();
    if (cropData && cropData.settings) {
        _.extend(cropType, cropData.settings);
    }

    var wpsImage = previewImage.croppable.getWpsImage();
    if (wpsImage) {
        cropType.description = wpsImage.description;

        if(wpsImage.cropRequest) cropType.userSettings = wpsImage.cropRequest.userSettings;
    }

    return cropType;
}


function _getPreviewImageCropTypes(imageTypes) {
    return imageTypes.map(function(imageType) {
        var previewImage = _getPreviewImageComponent.call(this, imageType);
        return _getPreviewImageCropType(imageType, previewImage);
    }, this);
}


function _getPreviewImageComponent(imageType) {
    var CCForm = componentRegistry.get('CCForm');
    var form = this.getScopeParentWithClass(CCForm);
    if (! form) throw new Error('CMArticle _getPreviewImageCropType: no form found');
    var imageTypeConfig = imagesConfig(imageType);
    var modelPath = imageTypeConfig.inspectorModelPath;
    return form.modelPathComponent(modelPath);
}


function updateSrc(msg, data) {
    var src = data.newValue;
    this.setImageSrc(src);
}


function onModelChange(path, data) {
    var src = data.newValue;
    this.container.scope.image.el.src = src || '';
    this.data.dispatchSourceMessage(this.data.config.event);
}


function CCPreviewImage_onDragEnter(eventType, event) {
    event.preventDefault();
    _toggleReplaceState.call(this, true);
}


function CCPreviewImage_onDragOver(eventType, event) {
    event.preventDefault();
}


function _toggleReplaceState(isReplaceState) {
    this.el.classList.toggle(REPLACE_CLASS, isReplaceState);
}

