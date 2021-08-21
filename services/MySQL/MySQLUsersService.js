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
};

module.exports = MySQLUsersService;