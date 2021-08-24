const express = require("express");
const ServiceLocator = require("../services/ServiceLocator");
const TagsService = require("../services/TagsService");
const route = express.Router();

route.get("/", async (req, res) => {
	/**
	 * @type {TagsService}
	 */
	const tagsService = ServiceLocator.getService(TagsService.name);

	try {
		const { payload: tags, error } = await tagsService.all();

		if(error) {
			console.log(error);
			res.status(500).end();
		} else {
			res.status(200).json({
				count: tags.length,
				tags
			});
		}
	} catch(e) {
		console.log(e);
		res.status(500).end();
	}
});

route.get("/:tag_id", async (req, res) => {
	/**
	 * @type {TagsService}
	 */
	 const tagsService = ServiceLocator.getService(TagsService.name);

	 try {
		const {payload:tag, error} = await tagsService.get(req.params.tag_id);

		if(error) {
			res.status(400).json(error);
		} else {
			res.status(200).json(tag);
		}
	 } catch(e) {
		console.log(e);
		res.status(500).end();
	 }
});

route.post("/", async (req, res) => {
	/**
	 * @type {TagsService}
	 */
	const tagsService = ServiceLocator.getService(TagsService.name);

	try {
		const { payload: tag, error } = await tagsService.create(req.body.text);

		if(error) {
			res.status(400).json(error);
		} else {
			res.status(201).json(tag);
		}
	} catch(e) {
		console.log(e);
		res.status(500).end();
	}
});

route.delete("/:tag_id", async (req, res) => {
	/**
	 * @type {TagsService}
	 */
	const tagsService = ServiceLocator.getService(TagsService.name);

	try {
		const {payload, error} = await tagsService.delete(req.params.tag_id);

		if(error) {
			res.status(400).json(error);
		} else {
			res.status(204).json(payload);
		}
	} catch(e) {
		console.log(e);
		res.status(500).end();
	}
});

route.put("/:tag_id", async (req, res) => {
	/**
	 * @type {TagsService}
	 */
	const tagsService = ServiceLocator.getService(TagsService.name);

	try {
		const {payload: tag, error} = await tagsService.update(req.params.tag_id, req.body.text);

		if(error) {
			res.status(400).json(error);
		} else {
			res.status(200).json(tag);
		}
	} catch(e) {
		console.log(e);
		res.status(500).end();
	 }
});

module.exports = {
	path: "/tags",
	route
};