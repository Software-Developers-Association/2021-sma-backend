/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} username
 * @property {string} fName
 * @property {string} lName 
 * @property {string} email
 */

/**
 * @typedef {Object} UserDTO
 * @property {string} username
 * @property {string} fName
 * @property {string} lName 
 * @property {string} email
 * @property {string} password
 */

const BaseService = require("./BaseService");
const Result = require("./Result").Result;

class UsersService extends BaseService {
	/**
	 * @param {UserDTO} userDTO
	 * @returns {Promise<Result<User>>}
	 */
	createUser(userDTO) { }

	/**
	 * @param {number} user_id
	 * @returns {Promise<Result<Object>>}
	 */
	deleteUser(user_id) { }

	/**
	 * @param {number} user_id 
	 * @param {UserDTO} userDTO 
	 * @returns {Promise<User>}
	 */
	updateUser(user_id, userDTO) { }

	/**
	 * @param {number} user_id 
	 * @returns {Promise<User>}
	 */
	getUser(user_id) { }

	/**
	 * @returns {Promise<Result<Array<User>>>}
	 */
	getAllUsers() { }
};

module.exports = UsersService;