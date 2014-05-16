'use strict';

var componentsRegistry = milo.registry.components
    , Component = componentsRegistry.get('Component');


var CMARTICLE_GROUP_TEMPLATE = '\
    <div ml-bind="CMRelatedGroup:newRelated" class="cc-module-related-group">\
        <div class="relatedItemsTopBorder">&nbsp;</div>\
        <div class="relatedItems">\
            <h4 ml-bind="[data]:relatedCaption"></h4>\
            <ul ml-bind="[list]:relatedList">\
                <li ml-bind="CMRelated[item]:result">\
                    <a ml-bind="[data]:title" target="_blank">\
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


_.extendProto(CCModuleArticlePreview, {
    init: CCModuleArticlePreview$init
});


function CCModuleArticlePreview$init() {
    Component.prototype.init.apply(this, arguments);
    this.once('stateready', function(){
        this.container.scope.scratchBtn.events.on('click', 
            { subscriber: sendToScratch, context: this });
    });
}


function sendToScratch(type, event) {
    event.stopPropagation();

    var state = this.transfer.getState();
    var data = this.data.get();

    var scratchData = {
        data: state,
        meta: {
            compClass: state.compClass,
            compName: state.compName,
            metaData: {
                description: '<strong>' + data.title + '</strong> - ' + data.previewText,
                preview: data.thumb && data.thumb.hostUrl,
                typeTitle: 'Article'
            }
        }
    };

    milo.mail.postMessage('addtoscratch', scratchData);
    milo.mail.once('addedtoscratch', { subscriber: onAddedToScratch,  context: this });
}


function onAddedToScratch(msg, data) {
    //TODO: refactor this icon animation into a nifty little reusable component/service.
    var div = document.createElement('div');
    if (data.err)
        div.innerHTML = '<span class="glyphicon glyphicon-remove-sign cc-fade-in-out"></span>';
    else
        div.innerHTML = '<span class="glyphicon glyphicon-ok-sign cc-fade-in-out"></span>';
    this.dom.append(div);

    div.addEventListener('webkitAnimationEnd', function() {
        div.parentNode.removeChild(div);
    });
}


function CCModuleArticlePreview_set(value) {
    CCModuleArticlePreview_setChannel.call(this, value.channel);
    this.data._set(value);
    this.model.set(value);
    this.transfer.setState(_constructRelatedGroupState(value));
}


function CCModuleArticlePreview_setChannel(newChannel) {
    if (this._channel)
        this.el.classList.remove(this._channel);

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
            model: {
                state: {
                    transferData: [
                        {
                            url: value.url,
                            title: value.title,

                            //is not using previewText because the text that appears in relatedArticles
                            //is the title not the previewText
                            previewText: value.title,
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
            headline: value.title,
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
