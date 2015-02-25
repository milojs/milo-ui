'use strict';

var doT = milo.util.doT
    , fs = require('fs');


var CMVIDEO_GROUP_TEMPLATE = '<div>this video</div>';
var LISTITEM_TEMPLATE = doT.compile(fs.readFileSync(__dirname + '/../article/listItem.dot'));


module.exports = {
    videoInstanceState: videoInstanceState,
    pageItemVideoState: pageItemVideoState,
    videoLinkItemState: videoLinkItemState,
    openVideo: openVideo
};


function videoInstanceState(value) {
    if (!value) return;
    return {
        outerHTML: CMVIDEO_GROUP_TEMPLATE,
        compClass: 'MIVideoInstance',
        compName: milo.util.componentName(),
        facetsStates: {
            model: {
                state: {
                    instance: {
                        videoId: +value.id
                    },
                    src: value.stillImage && value.stillImage.hostUrl,
                    width: value.stillImage && value.stillImage.width,
                    height: value.stillImage && value.stillImage.height,
                    headline: value.headline,
                    titleEndDate: value.titleEndDate,
                    modifiedDate: value.modifiedDate,
                    createdDate: value.createdDate,
                    tag: {
                        id: undefined,
                        name: 'video',
                        style: 2
                    },
                    cc_scratch: {
                        itemType: 'video',
                        itemData: value
                    }
                }
            }
        }
    };
}


function pageItemVideoState(value) {
    if (!value) return;
    return {
        outerHTML: '<div></div>',
        compClass: 'CIPageItemVideo',
        compName: milo.util.componentName(),
        facetsStates: {
            model: {
                state: {
                    asset: {
                        id: +value.id
                    },
                    wpsData: {
                        itemType: 'video',
                        itemId: null
                    }
                }
            }
        }
    };
}


function videoLinkItemState(value) {
    if (!value) return;

    var compName = milo.util.componentName();

    return {
        outerHTML: LISTITEM_TEMPLATE({compName: compName}),
        compName: compName,
        compClass: 'LELinkItem',
        facetsStates: {
            model: {
                state: {
                    videoId: +value.id,
                    description: value.headline,
                    status: value.status,
                    cc_scratch: {
                        itemType: 'video',
                        itemData: value
                    }
                }
            }
        }
    };
}


function openVideo(data) {
    if (window.CC.config.urlToggles.video)
        milo.mail.postMessage('loadasset', {
            editorApp: 'videoEditor',
            assetType: 'video',
            assetId: +data.id
        });
    else
        window.open('/video/preview/' + data.id, '_blank');
}
