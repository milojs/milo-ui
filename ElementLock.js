'use strict';

module.exports = ElementLock;

_.extendProto(ElementLock, {
    unlock: ElementLock$unlock
});

function ElementLock(element, options) {
    var timeout = (typeof options == 'object' ? options.timeout : options) || 20000;
    var position = options.position || 'absolute';
    var backgroundColor = options.backgroundColor || 'rgba(255, 255, 255, 0.85)';

    var blankDiv = document.createElement('div');
    this.blankDiv = blankDiv;
    element.appendChild(blankDiv);
    var style = blankDiv.style;
    style.position = position;
    style.zIndex = 20;
    style.top = style.left = 0;
    style.width = style.height = '100%';
    blankDiv.style.backgroundColor = backgroundColor;

    var spinner = document.createElement('div');
    blankDiv.appendChild(spinner);
    var spinnerStyle = spinner.style;
    spinner.className = 'cc-loading-spinner';
    spinnerStyle.position = position;
    spinnerStyle.top = spinnerStyle.left = 'calc(50% - 10px)';
    spinnerStyle.width = spinnerStyle.height = '20px';

    _.delayMethod(this, 'unlock', timeout);

    return this;
}

function ElementLock$unlock() {
    this && this.blankDiv && this.blankDiv.parentNode && this.blankDiv.parentNode.removeChild(this.blankDiv);
}

