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
};

module.exports = MySQLUsersService;