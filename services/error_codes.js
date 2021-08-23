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
		},
		MISSING_FIELD: {
			NUM: 1030,
			TXT: "MISSING_FIELD"
		}
	}
};

module.exports = ERROR_CODES;