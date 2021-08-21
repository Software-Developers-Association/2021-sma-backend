/**
 * @template T
 */
class Result {
	/**
	 * 
	 * @param {T} payload 
	 * @param {IError} error 
	 */
	constructor(payload, error) {
		/**
		 * @type {T}
		 */
		this.payload = payload;
		/**
		 * @type {IError}
		 */
		this.error = error;
	}
};

class IError {
	/**
	 * @param {string} message 
	 * @param {number} code 
	 */
	constructor(message, code) {
		/**
		 * @type {string}
		 */
		this.message = message;
		/**
		 * @type {number}
		 */
		this.code = code;
	}
};

module.exports = {
	Result,
	IError
};