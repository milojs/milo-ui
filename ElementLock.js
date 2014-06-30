'use strict';

module.exports = ElementLock;

_.extendProto(ElementLock, {
    unlock: ElementLock$unlock
});

function ElementLock(element, timeout) {
    var timeout = timeout || 20000;

    var blankDiv = document.createElement('div');
    this.blankDiv = blankDiv;
    element.insertBefore(blankDiv);
    var style = blankDiv.style;
    style.position = 'absolute';
    style.top = style.left = 0;
    style.width = style.height = '100%';
    blankDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';

    var spinner = document.createElement('div');
    blankDiv.insertBefore(spinner);
    var spinnerStyle = spinner.style;
    spinner.className = 'cc-loading-spinner';
    spinnerStyle.position = 'absolute';
    spinnerStyle.top = spinnerStyle.left = 'calc(50% - 10px)';
    spinnerStyle.width = spinnerStyle.height = '20px';

    setTimeout(function(){ this.unlock(5000); }.bind(this), 5000);

    return this;
}

function ElementLock$unlock() {
    this && this.blankDiv && this.blankDiv.parentNode && this.blankDiv.parentNode.removeChild(this.blankDiv);
}

