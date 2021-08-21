const BaseService = require("./BaseService");

class ServiceLocator {
	constructor() {
		/**
		 * @private
		 */
		this.services = { };
	}

	/**
	 * 
	 * @param {string} serviceID
	 * @returns {BaseService | undefined}
	 */
	getService(serviceID) {
		return this.services[serviceID];
	}

	/**
	 * @param {string} serviceID 
	 * @param {BaseService} service 
	 */
	setService(serviceID, service) {
		this.services[serviceID] = service;
	}
};

module.exports = new ServiceLocator();