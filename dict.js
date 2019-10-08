const utils = require('./utils');
const config = require('config');

module.exports = {
    async getDefinition(word, extendedUrl) {
        if(!extendedUrl) {
            extendedUrl = utils.getExtendedUrl('def', word);
        }
        return await utils.requestAPI(extendedUrl);
    },
    async getRelatedWord(word, extendedUrl) {
        if(!extendedUrl) {
            extendedUrl = utils.getExtendedUrl('syn', word);
        }
        return await utils.requestAPI(extendedUrl);
    },
    async getExample(word, extendedUrl) {
        if(!extendedUrl) {
            extendedUrl = utils.getExtendedUrl('ex', word);
        }
        return await utils.requestAPI(extendedUrl);
    },
    async getRandomWord(extendedUrl) {
        if(!extendedUrl) {
            extendedUrl = config.randomWordUrl;
        }
        return await utils.requestAPI(extendedUrl);
    }
};