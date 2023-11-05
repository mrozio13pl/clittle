/**
 * Error that is fired when some flag is missing.
 * @param {string} message Error message.
 */
export const MissingFlagsError = class extends Error {
    constructor(message = '') {
        super(message);
        this.name = 'Missing Flags';
        this.message = message;
    }
};

/**
 * Error that is fired when an argument is missing.
 * @param {string} message Error message.
 */
export const MissingArgumentsError = class extends Error {
    constructor(message = '') {
        super(message);
        this.name = 'Missing Arguments';
        this.message = message;
    }
};

/**
 * Error that is fired when some not defined argument is passed.
 * @param {string} message Error message.
 */
export const InvalidArgumentsError = class extends Error {
    constructor(message = '') {
        super(message);
        this.name = 'Invalid Arguments';
        this.message = message;
    }
};