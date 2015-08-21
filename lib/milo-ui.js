'use strict';

if (!(window.milo && window.milo.milo_version))
    throw new Error('milo is not available');

/**
 * `milo-ui`
 *
 * This bundle will register additional component classes for UI
 */

require('./use_components');
