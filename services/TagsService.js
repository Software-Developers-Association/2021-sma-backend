/**
 * @typedef {Object} Tag
 * @property {number} tag_id
 * @property {string} text
 */

const BaseService = require("./BaseService");
const { Result } = require("./Result");

class TagsService extends BaseService {
	/**
	 * @param {string} text 
	 * @returns {Promise<Result<Tag>>}
	 */
	create(text) { }

	/**
	 * @param {number} tag_id 
	 * @returns {Promise<Result<Object>>}
	 */
	delete(tag_id) { }

	/**
	 * 
	 * @param {number} tag_id 
	 * @param {string} text
	 * @returns {Promise<Result<Tag>>} 
	 */
	update(tag_id, text) { }

	/**
	 * @param {number} tag_id 
	 * @returns {Promise<Result<Tag>>}
	 */
	get(tag_id) { }

	/**
	 * @returns {Promise<Result<Array<Tag>>>}
	 */
	all() { }
};

module.exports = TagsService;