'use strict';


module.exports = {
	filterNodeListByType: filterNodeListByType,
	selectElementContents: selectElementContents
};

/**
 * filterNodeListByType
 * Filters the list of nodes by type
 * @param {NodeList} nodeList the list of nodes, for example childNodes property of DOM element
 * @param {Integer} nodeType an integer constant [defined by DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType), e.g. `Node.ELEMENT_NODE` or `Node.TEXT_NODE`
 */
function filterNodeListByType(nodeList, nodeType) {
	return Array.prototype.filter.call(nodeList, function (node) {
		return node.nodeType == nodeType;
	});
}


/**
 * selectElementContents
 * Selects inner contents of DOM element
 * @param {Element} el DOM element
 */
function selectElementContents(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}