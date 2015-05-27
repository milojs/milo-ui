'use strict';

module.exports = ElementLock;

_.extendProto(ElementLock, {
    unlock: ElementLock$unlock
});

function ElementLock(element, options) {
    var opts = typeof options == 'object' ? options : { timeout: options };
    var timeout = opts.timeout || 20000;
    var position = opts.position || 'absolute';
    var backgroundColor = opts.backgroundColor || 'rgba(255, 255, 255, 0.85)';

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

