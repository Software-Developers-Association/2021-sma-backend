const ERROR_CODES = require("../error_codes");
const { Result, IError } = require("../Result");
const UsersService = require("../UsersService");

class MySQLUsersService extends UsersService {
	/**
	 * 
	 * @param {import("mysql").Connection} connection 
	 */
	constructor(connection) {
		super();
		
		/**
		 * @private
		 * @type {import("mysql").Connection}
		 */
		this.connection = connection;
	}

	/**
	 * @param {number} user_id 
	 * @returns {Promise<Result<import("../UsersService").User>>}
	 */
	async getUser(user_id) {
		/**
		 * @type {Promise<import("../UsersService").User>}
		 */
		const getUserCMD = new Promise((resolve, reject) => {
			this.connection.query({
				sql: "SELECT * FROM `users` WHERE `user_id`=?;",
				values: [user_id]
			}, (err, results, fields) => {
				if(err) {
					return reject(err);
				}

				if(!results || results.length === 0) {
					return reject({
						code: ERROR_CODES.DATABASE.NOT_EXIST.NUM,
						message: `User with id "${user_id}" does not exist.`
					});
				}

				resolve(results[0]);
			});
		});
		
		try {
			const user = await getUserCMD;

			return new Result(user, null);
		} catch(e) {
			return new Result(null, e);
		}
	}

	/**
	 * @returns {Promise<Result<Array<import("../UsersService").User>>}
	 */
	async getAllUsers() {
		/**
		 * @type { Array<UsersService.User> }
		 */
		const users = []; // keeps track of all of the users we extracted

		try {
			await new Promise((resolve, reject) => {
				// Keep in mind that this retrieves everything.
				// This is BAD!
				const query = this.connection.query({
					sql: "SELECT * FROM `users`;"
				});

				// Going about it this way with the events,
				// only gets you a row at a time. As the row data
				// is fetched this event will be called so,
				// we have to keep track of the users come in.

				// Alternativly, you could easily do this without the events as we did before
				// the "results" variable will contain all of the records (if there are any) in an
				// Array.
				query.on("result", (row, index) => {
					//console.log(row, index);
					users.push(row);
				});
	
				query.on("fields", (fields, index) => {
	
				});
	
				query.on("error", (err) => {
	
				});
	
				query.on("packet", (packet) => {
	
				});
	
				query.on("end", () => {
					//console.log("done");
					resolve(users);
				});
			});

			return new Result(users, null);
		} catch(e) {
			console.log(e);
			return new Result(null, {
				code: ERROR_CODES.DATABASE.UNKNOWN.NUM,
				message: "Something went wrong."
			})
		}
	}
	
	/**
	 * @param {import("../UsersService").UserDTO} userDTO 
	 * @returns {Promise<Result<import("../UsersService").User>>}
	 */
	async createUser(userDTO) {
		const createUserCMD = new Promise((resolve, reject) => {
			this.connection.query({
				sql: `INSERT INTO users (username, fName, lName, email, password) VALUES ('${userDTO.username}', '${userDTO.fName}', '${userDTO.lName}', '${userDTO.email}', '${userDTO.password}');`
			}, (err, results, fields) => {
				if(err) {
					return reject(err);
				}

				resolve(results);
			});
		});
	

		/**
		 * @type {Promise<import("../UsersService").User>}
		 */
		const getUserCMD = new Promise((resolve, reject) => {
			this.connection.query({
				sql: "SELECT * FROM users WHERE username=?;",
				values: [userDTO.username]
			}, (err, results, fields) => {
				if(err) {
					return reject(err);
				}

				if(!results || results.length === 0) {
					// da heck....how is this possible....
					return reject(new Error("Unexpected result, user should exist but does not!"));
				}

				resolve(results[0]);
			});
		});

		try {
			await createUserCMD;

			const newUser = await getUserCMD;

			return new Result(newUser, null);
		} catch(e) {
			switch(e.errno) {
				// duplicate entry
				case 1062: {
					return new Result(
						null,
						new IError(
							`Error ${ERROR_CODES.DATABASE.DUPLICATE.TXT}.`,
							ERROR_CODES.DATABASE.DUPLICATE.NUM
						));
				}
			}

			console.log(e.code, e.errno);

			return new IError(`Unhandled error ${e.code} - ${e.errno}`, e.errno);
		}
	}

	/**
	 * NOTE: This method should be changed to allow for permission checking
	 * @override
	 * @param {number} user_id
	 * @returns {Promise<Result<{}>>}
	 */
	async deleteUser(user_id) {
		// This promise will resolve with a boolean value
		// true if the record was deleted, false if not.
		const deleted = await new Promise(
			(resolve, reject) => {
				// In this example we are going to demonstrate an other
				// way to run a query
				const query = this.connection.query(
					{
						sql: 'DELETE FROM `users` WHERE `user_id`=?;',
						values: user_id
					}
				);

				/**
				 * Query smits events that we can listen in on.
				 * In this example we are going to listen in on every
				 * event that Query emits.
				 */

				query.on("result", (row, index) => {
					// uncomment to see what is returned.
					// console.log("Row", row, "Index", index);

					// no record was deleted, perhaps the user_id does not exist?
					if(row.affectedRows === 0) {
						return resolve(false);
					}
					
					resolve(true);
				});

				query.on("error", (err) => {
					//console.log("Error", err);
				});

				query.on("packet", (packet) => {
					//console.log("Packet", packet);
				});

				query.on("fields", (fields, index) => {
					//console.log("Fields", fields, "Index", index);
				});

				query.on("end", () => {
					//console.log("Query complete.");
				});
			}
		);

		if(deleted) {
			// We deleted the record successfully, however,
			// we respond with an empty object as there is nothing
			// more to convey to the the consumer of this API. The status
			// code will relay whether or not this request succeeded.
			// Read: https://restfulapi.net/http-methods/#:~:text=HTTP%20DELETE,-As%20the%20name&text=A%20successful%20response%20of%20DELETE,does%20not%20include%20an%20entity.
			return new Result({}, null);
		} else {
			// The MySQL request object contains a property 'affectedRows`
			// which is the number of rows that were affected by the query.
			// (For SELECT, this property does not exist as the result is an Array
			// of the rows.)
			// So, the number of affected rows, in this context, is not 1 then we assume,
			// the user_id provided does not exist in the table users

			// We have new error code we can refer to now.
			return new Result(null, {
				code: ERROR_CODES.DATABASE.NOT_EXIST.NUM,
				message: `Could not delete user with id "${user_id}", user does not exist.`
			})
		}
	}

	/**
	 * @param {number} user_id 
	 * @param {import("../UsersService").UserDTO} userDTO 
	 * @returns {Promise<Result<import("../UsersService").User>>}
	 */
	async updateUser(user_id, userDTO) {
		// we just want to know if the user even exist...
		const { error } = await this.getUser(user_id);

		if(error) {
			return new Result(null, error);
		}

		try {
			await new Promise(async (resolve, reject) => {
				// prevent a user from changing their own user_id
				userDTO.user_id && delete userDTO.user_id;

				// Extract the keys from the object as they are
				// corresponding to the fields on the table
				const keys = Object.keys(userDTO);
				
				if(keys.length === 0) {
					// they sent an empty object, abort
					return reject({
						code: ERROR_CODES.DATABASE.MISSING_FIELD.NUM,
						message: "Empty update request."
					});
				}

				// we want to ensure that the order of the key=value pairing
				// is in the same order as our generated listing below.
				const values = keys.map(key => userDTO[key]);
				
				// The issue here now is that we have some properties but we have not verified
				// if those properties are not columns in our table. This will error out
				// if you try to update on a column that does not exist.

				// In an UPDATE command the syntax is as follows:
				// UPDATE <table_name> SET field1=value1, field2=value2, ... WHERE <condition>;
				// We want to generate the field=value comma deliminated list.

				// you will note that '?' in the string literal, this is because
				// the mysql module will esacpe '?' values for us.

				// READ: https://www.npmjs.com/package/mysql#escaping-query-values
				const set = keys.map((key) => `${key}=?`).join(",");

				this.connection.query({
					sql: `UPDATE users SET ${set} WHERE user_id=?;`,

					// The elipses (...) is known as the "spread" operator
					// this allows us to copy the array of "values" into the
					// surrounding array.
					values: [...values, user_id]
				}, (err, results, fields) => {
					if(err) {
						return reject(err);
					}

					resolve();
				});
			});

			// Let's get the user we just updated and return that.
			const { payload: user } = await this.getUser(user_id);

			return new Result(user, null);
		} catch(e) {
			switch(e.errno) {
				// This error will be tripped if a user attempts
				// to update a column that is marked UNIQUE and the value
				// they are attempting to update already exists in an other record
				// in the table. Example, email, username.
				case 1062: {
					return new Result(null, {
						code: ERROR_CODES.DATABASE.DUPLICATE.NUM,
						message: e.sqlMessage // We SHOULD parse this out ourselves and genrate a generic message but for now this is fine.
					});
				}
				// Try to break this and add more case errors!
			}

			return new Result(null, e);
		}
	}
};

module.exports = MySQLUsersService;