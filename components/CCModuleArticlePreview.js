'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMARTICLE_GROUP_TEMPLATE = '<div ml-bind="CMRelatedGroup:newRelated" class="cc-module-related">\
        <div class="relatedItemsTopBorder">&nbsp;</div>\
        <div class="relatedItems">\
            <h4>More...</h4>\
            <ul ml-bind="[list]:relatedList">\
            <li ml-bind="CMRelated[item]:result">\
            <a ml-bind="[data]:previewText" target="_blank">\
            </a>\
            </li>\
            </ul>\
        </div>\
    </div>';


var CCModuleArticlePreview = Component.createComponentClass('CCModuleArticlePreview', {
    dom: {
        cls: 'cc-module-article-preview'
    },
    drag: {
        allowedEffects: 'copy'
    },
    data: {
        set: CCModuleArticlePreview_set
    },
    model: undefined,
    events: undefined,
    transfer: undefined
});

componentsRegistry.add(CCModuleArticlePreview);

module.exports = CCModuleArticlePreview;

function CCModuleArticlePreview_set(value) {
    CCModuleArticlePreview_setChannel.call(this, value.channel);
    this.data._set(value);
    this.model.set(value);
    this.transfer.setState(_constructRelatedGroupState(value));
}


function CCModuleArticlePreview_setChannel(newChannel) {
    if (this._channel) {
        this.el.classList.remove(this._channel);
    }

    this._channel = newChannel;
    this.el.classList.add(this._channel);
}

function _constructRelatedGroupState(value) {
    if (!value) return;

    return {
        outerHTML: CMARTICLE_GROUP_TEMPLATE,
        compClass: 'CMRelatedGroup',
        compName: milo.util.componentName(),
        facetsStates: {
            data: undefined,
            model: {
                state: {
                    transferData: [
                        {
                            url: value.url,
                            previewText: value.previewText,
                            transferItem: value,
                            wpsRelated: createWpsData(value)
                        }
                    ]
                }
            }
        }
    };

    function createWpsData(value) {
        return  {
            headline: value.headline,
            newWindow: false,
            previewLink: false,
            relatedArticleTypeId: 1,
            relatedId: Number(value.id),
            relatedUrl: value.url,
            target: null,
            voteFollow: false
        };
    }
}
