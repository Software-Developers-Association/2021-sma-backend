const ERROR_CODES = require("../error_codes");
const { Result } = require("../Result");
const TagService = require("../TagsService");

class MySQLTagsService extends TagService {
	/**
	 * @param {import("mysql").Connection} connection 
	 */
	constructor(connection) {
		super();

		/**
		 * @type {import("mysql").Connection}
		 * @private
		 */
		this.connection = connection;
	}

	/**
	 * @param {string} text 
	 * @returns {Promise<Result<import("../TagsService").Tag>>}
	 */
	async create(text) {
		try {
			await new Promise((resolve, reject) => {
				this.connection.query({
					sql: "INSERT INTO `tags` (text) VALUES (?);",
					values: [text]
				},
				(err, results, fields) => {
					if(err) {
						reject(err);
						return;
					}
	
					resolve();
				});
			});

			/**
			 * @type {import("../TagsService").Tag}
			 */
			const tag = await new Promise((resolve, reject) => {
				const query = this.connection.query({
					sql: "SELECT * FROM `tags` WHERE `text`=?;",
					values: text
				});

				query.on("result", (row, index) => {
					resolve(row);
				});

				query.on("error", (err) => {
					reject(err);
				});

				query.on("end", () => { });
			});

			return new Result(tag, null);
		} catch(e) {
			return new Result(null, e);
		}
	}

	/**
	 * @param {number} tag_id 
	 * @returns {Promise<Result<Object>>}
	 */
	async delete(tag_id) {
		try {
			await new Promise((resolve, reject) => {
				const query = this.connection.query({
					sql: "DELETE FROM `tags` WHERE `tag_id`=?;",
					values: tag_id
				});
	
				query.on("result", (row, index) => {
					if(row.affectedRows === 0) {
						return reject({
							code: ERROR_CODES.DATABASE.NOT_EXIST.NUM,
							message: `Could not delete tag with id "${tag_id}", does not exist.`
						});
					}
	
					resolve();
				});
			});

			return new Result({}, null);
		} catch(e) {
			return new Result(null, e);
		}
	}

	/**
	 * @param {number} tag_id 
	 * @param {string} text 
	 * @returns {Promise<Result<import("../TagsService").Tag>>}
	 */
	async update(tag_id, text) {
		try {
			await new Promise((resolve, reject) => {
				this.connection.query({
					sql: "UPDATE `tags` SET `text`=? WHERE `tag_id`=?;",
					values: [text, tag_id]
				}, (err, results, fields) => {
					if(err) {
						return reject(err);
					}
	
					resolve();
				});
			});

			// TODO
			const { payload: updatedTag, error } = await this.get(tag_id);

			if(error) {
				// THIS SHOULD NEVER HAPPEN BUT WE ARE GOING TO TEST
				// AGAINST IT ANYWAYS FOR SANITY SAKE!!!!!!!!!
				return new Result(null, error);
			}

			return new Result(updatedTag, null);
		} catch(e) {
			return new Result(null, e);
		}
	}

	/**
	 * @param {number} tag_id 
	 * @returns {Promise<Result<import("../TagsService").Tag>>}
	 */
	async get(tag_id) {
		try {
			const tag = await new Promise((resolve, reject) => {
				this.connection.query({
					sql: "SELECT * FROM tags WHERE tag_id=?;",
					values: [tag_id]
				}, (err, results, fields) => {
					if(err) {
						return reject(err);
					}
					
					if(!results || results.length === 0) {
						return reject({
							code: ERROR_CODES.DATABASE.NOT_EXIST.NUM,
							message: `Tag with "tag_id" "${tag_id}", does not exist.`
						});
					}
	
					resolve(results[0]);
				});
			});

			return new Result(tag, null);
		} catch(e) {
			return new Result(null, e);
		}
	}

	/**
	 * @returns {Promise<Result<Array<import("../TagsService").Tag>>>}
	 */
	async all() {
		try {
			const tags = await new Promise((resolve, reject) => {
				/**
				 * @type {Array<import("../TagsService").Tag>}
				 */
				const tags = [];
	
				const query = this.connection.query({
					sql: "SELECT * FROM tags;"
				});
	
				query.on("result", (row, index) => {
					tags.push(row);
				});
	
				query.on("error", (err) => {
					reject(err);
				});
	
				query.on("end", () => {
					resolve(tags);
				});
			});

			return new Result(tags, null);
		} catch(e) {
			return new Result(null, e);
		}
	}
};

module.exports = MySQLTagsService;