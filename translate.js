'use strict';


var translate = {
	Boolean: {
		to: Boolean_to,
		from: Boolean_from
	}
};

module.exports = translate;


function Boolean_to(trueFalse) {
	return function(boolVal) {
		return boolVal
				? trueFalse['true']
				: trueFalse['false'];
	};
}


function Boolean_from(trueFalse) {
	return function(strVal) {
		return strVal == trueFalse['true']
				? true
				: strVal == trueFalse['false']
					? false
					: undefined;
	};
}
