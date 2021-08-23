const express = require("express");
const route = express.Router();
const ServiceLocator = require("../services/ServiceLocator");
const UsersService = require("../services/UsersService");

route.get("/:user_id", async (req, res) => {
	/**
	 * @type { UsersService }
	 */
	const userService = ServiceLocator.getService(UsersService.name);

	try {
		const { payload: user, error } = await userService.getUser(Number.parseInt(req.params.user_id));

		if(error) {
			// we want to distinguish between IError, and Error
			// IError is what we created which is just a typedef
			// it's not a real type, just a JSObject with code & message properties.
			// Error is a real class so the 'name' property will infact exist.
			// The reason why we want to distinguish is because if an error
			// is thrown, we do not want to leak information to the client this can be
			// a security problem.
			// This should be handled better.
			if(error.name) {
				// we need to be storying the req and error to an internal log file
				// so that we can reproduce and also address any errors.
				console.log(error);

				// For now, let's assume that if an error has occured that we have yet to see and handle,
				// let's panic with a 500.
				res.status(500).end();
			} else {
				// The user's request could not be fullfilled thus, we fallback
				// to a 400 Bad Request.
				res.status(400).json(error);
			}

		} else {
			res.status(200).json(user);
		}
	} catch(e) {
		// As mentioned above, these types of error need to be dealt with
		// by logging the request and also the error so we can address them
		// to prevent issues. For now, we will simply log to the console, so always come back
		// and check on the console and see if there are any issues.
		console.log(e);

		// As usual something terrible has happened here
		// we panic and relay a 500 error.
		res.status(500).end();
	}
});

route.get("/", async (req, res) => {
	/**
	 * @type { UsersService }
	 */
	const usersService = ServiceLocator.getService(UsersService.name);

	try {
		const { payload: users, error } = await usersService.getAllUsers();

		if(error) {
			// This is bad, we don't have a way to determine what
			// went wrong at this point. We need to test different situtations
			// to see what could cause an error when trying to fetch data.
			// At this current point, we can say the user did nothing wrong, so this
			// is on us, ergo, 500 Internal Server Error is appropriate.
			res.status(500).json(error);
		} else {
			// When you start to have lots and lots of records
			// you should start thinking about "pagination" either
			// cursor or offet based.
			res
				.status(200)
				.json({
					count: users.length,
					users
				});
		}
	} catch(e) {
		// Something went VERY wrong, inspect the log
		// and add guards to prevent this from happening and
		// fail gracefully.
		console.log(e);
		res.status(500).end();
	}
});

route.post("/", async (req, res) => {
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

route.delete("/:user_id", async (req, res) => {
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

route.put("/:user_id", async (req, res) => {
	/**
	 * @type {UsersService}
	 */
	const usersService = ServiceLocator.getService(UsersService.name);

	try {
		const { payload: updatedUser, error } = await usersService.updateUser(req.params.user_id, req.body);

		if(error) {
			res.status(400).json(error);
		} else {
			res.status(200).json(updatedUser);
		}
	} catch(e) {
		console.log(e);
		res.status(500).end();
	}
});

module.exports = {
	route,
	path: "/users"
}