'use strict';

var logger = milo.util.logger
    , componentsRegistry = milo.registry.components
    , CCStatesContainer = componentsRegistry.get('CCStatesContainer');


var CCModuleArticleModulePreview = CCStatesContainer.createComponentClass('CCModuleArticleModulePreview', {
    dom: {
        cls: 'cc-module-articlemodule-preview'
    },
    drag: {
        allowedEffects: 'copy',
        meta: {
            params: getMetaParams
        }
    },
    model: {
        messages: {
            '.styles': { context: 'owner', subscriber: onStyleGroupChange },
            '.styles[*].group': { context: 'owner', subscriber: onStyleGroupChange }
        }
    },
    events: {
        messages: {
            'dblclick': { context: 'owner', subscriber: onModuleClick }
        }
    }
});

componentsRegistry.add(CCModuleArticleModulePreview);


module.exports = CCModuleArticleModulePreview;


_.extendProto(CCModuleArticleModulePreview, {
    dataFacetSet: CCModuleArticleModulePreview$dataFacetSet
});


function CCModuleArticleModulePreview$dataFacetSet(value) {
    var self = this;
    var stylesPromise = window.CC.config.data.itemStyles;
    stylesPromise.then(function (dontUse, data) {
        value = parseData(value, data);
        CCStatesContainer.prototype.dataFacetSet.call(self, value);
    }).error(function (error) {
        milo.util.logger.error('itemStyles config returned with an error.');
    });
}


function parseData(value, styleData) {
    var fields = value._source = value._source || {};
    // var linkListGroupIds = fields['linkListGroups.linkListGroupId'];
    var linkListGroups = fields.linkListGroups ? fields.linkListGroups.map(mapGroup) : [];

    fields.moduleStyle = fields.moduleStyle || fields.galleryPreviewStyle || fields.pollPreviewStyle || fields.path
        || (linkListGroups[0] && linkListGroups.style) || '';

    var moduleType = getModuleType(value._type);
    var moduleId = linkListGroups.length ? linkListGroups[0].id : value._id;
    var moduleStyle = linkListGroups.length ? linkListGroups[0].style : fields.moduleStyle;

    // Set state
    if (!styleData.linklist) styleData.linklist = styleData.linkListGroup;
    try { var styleArr = styleData[moduleType][moduleStyle]; } catch(e) {}
    styleArr = styleArr || [];
    styleArr = styleArr.map(function (style) {
        return {
            group: style.group_name,
            id: style.id,
            name: style.jsp_name
        };
    });

    try { var isLive = fields.status.toLowerCase() == 'live'; } catch(e){}

    var data = {
        id: moduleId,
        title: stripHtml(fields.title || fields.name || fields.headline),
        type: moduleType,
        styles: styleArr,
        styleName: moduleStyle.replace(/_/g, ' '),
        styleKey: moduleStyle,
        isLive: !!isLive,
        linkListGroups: linkListGroups,
        linkListId: linkListGroups.length ? value._id : null
    };
    data.cc_transfer = {
        itemType: 'module',
        itemData: _.clone(data)
    };
    return data;


    function getModuleType(moduleType) {
        if (moduleType == 'linklist')
            return 'linkListGroup';
        else if (moduleType == 'standardmodule')
            return 'standardModule';
        else
            return moduleType;
    }
}


function mapGroup(group) {
    return {
        id: group.linkListGroupId,
        style: group.linkListGroupStyle,
        title: group.title
    };
}


function onStyleGroupChange(msg, data) {
    if (! Array.isArray(data.newValue)) return;

    var done = [];
    var str = data.newValue.reduce(function (prev, style) {
        if (done.indexOf(style.group) == -1) {
            done.push(style.group);
            var box = '<span class="cc-width ' + style.group + '">'
                        + style.group.charAt(0).toUpperCase() + '</span>';
            return prev + box;
        }
        return prev;
    }, '');

    this.container.scope.width.el.innerHTML = str;
}


function stripHtml(text) {
    var tmp = document.createElement('div');
    tmp.innerHTML = text;
    return tmp.textContent || tmp.innerText || '';
}


function getMetaParams () {
    return {
        styles: JSON.stringify(this.model.m('.styles').get()),
        isLive: this.model.m('.isLive').get()
    };
}


function onModuleClick(msg, event) {
    this.performAction('open');
}
