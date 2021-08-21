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