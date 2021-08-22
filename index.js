const express = require("express");
const MySQLUsersService = require("./services/MySQL/MySQLUsersService");
const ServiceLocator = require("./services/ServiceLocator");
const UsersService = require("./services/UsersService");
const app = express();
app.use(express.json());
const port = 5050;

const databaseSetup = async () => {
	const exec = require("child_process").exec;

	const mysqlCMD = new Promise((resolve, reject) => {
		exec("mysql -u root < schema.sql", (error, stdout, stderr) => {
			if(stderr) {
				console.log("stderr");
				reject(new Error(stderr))
				return console.error(stderr);
			}
	
			if(error) {
				console.log("error");
				reject(error);
				return console.error(error);
			}

			resolve();
		});
	});

	try {
		await mysqlCMD;

		const connection = require("mysql").createConnection({
			host: "localhost",
			user: "root",
			database: "bitr"
		});

		const usersService = new MySQLUsersService(connection);

		await usersService.init();

		ServiceLocator.setService(UsersService.name, usersService);

		console.log("UsersService Intialized.");

		console.log("Database setup complete.");
	} catch (e) {
		throw new Error("Failed to setup database.");
	}
};

const main = () => {
	app.post("/users", async (req, res) => {
		/**
		 * @type {UsersService}
		 */
		const usersService = ServiceLocator.getService(UsersService.name);

		try {
			const { payload: user, error } = await usersService.createUser(req.body);

			if(error) {
				res.status(400).json(error);
			} else {
				res
					.status(201)
					.json(
						user
					);
			}
	
		} catch(e) {
			console.log(e);
			res.status(500).end();
		}
	});

	app.delete("/users/:user_id", async (req, res) => {
		/**
		 * @type {UsersService}
		 */
		const usersService = ServiceLocator.getService(UsersService.name);

		try {
			const { payload, error } = await usersService.deleteUser(Number.parseInt(req.params.user_id));

			if(error) {
				// we relay a 404 since the resource does not exist,
				// how do you delete something that does not exist?
				res.status(404).json(error);
			} else {
				// we relay a 204 No Content, as this api
				// does not send anything back for confirmation the record deleted
				// that is what the status code is for.
				// Remember, 200s is a GOOD thing, 400s, and 500s are BAD.
				res.status(204).json(payload);

				// alternatively you could send back a 200 Ok
				// and a JSON message with some information, however,
				// for us it was not needed or nessesary.
			}
		} catch(e) {
			console.log(e);
			// something catastrophic happened and is not the fault of the user (pending)
			// but it is ours as developers, therefore return nothing and relay a 500 Internal Server Error.
			res.status(500).end();
		}
	});

	app.listen(port, () => {
		console.log(`Listening on port ${port}.`);
	});
};

// IIFE - Immediatly invoked function expression

(
	async () => {
		try {
			await databaseSetup();
			main();
		} catch(e) {
			console.log(e);
			
			process.exit(-1);
		}
	}
)();

// databaseSetup()
// 	.then(() => {
// 		console.log("Database setup success!");

// 		app.post("/users", (req, res) => {
// 			const connection = require("mysql").createConnection({
// 				host: "localhost",
// 				user: "root",
// 				database: "bitr"
// 			});

// 			const usersService = new MySQLUsersService(connection);

// 			usersService.createUser(req.body);

// 			res.end();
// 		});

// 		app.listen(port, () => {
// 			console.log(`Listening on port ${port}`);
// 		});
// 	})
// 	.catch((reason) => {
// 		console.log(reason);
// 	});