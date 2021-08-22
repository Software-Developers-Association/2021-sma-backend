const ERROR_CODES = {
	DATABASE: {
		DUPLICATE: {
			NUM: 1000,
			TXT: "DUPLICATE"
		},
		NOT_EXIST: {
			NUM: 1010,
			TXT: "NOT_EXIST"
		},
		UNKNOWN: {
			NUM: 1020,
			TXT: "UNKNOWN"
		}
	}
};

module.exports = ERROR_CODES;