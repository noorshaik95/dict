const config = require('config');
const request = require('request');

module.exports = {
    requestAPI(url) {
        let options = this.setOptions(url);
        return this.promisifyRequest(options);
    },
    setOptions(extendedUrl, method = 'get') {
        return {
            uri: config.baseUrl+extendedUrl,
            qs: {api_key: config.apiKey},
            rejectUnauthorized: false,
            json: true,
            method
        }
    },
    promisifyRequest(options) {
        return new Promise((resolve, reject) => {
            request[options.method](options, function(err, res, body) {
                if(err) {
                    return reject(err);
                }
                resolve({err, res, body});
            })
        });
    },
    getExtendedUrl(type, word) {
        return config[config.mappedUrl[type]].replace(/:word/g, word);
    },

};