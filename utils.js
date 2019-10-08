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
                if(res.statusCode !== 200) {
                    return reject(body)
                }
                resolve({err, res, body});
            })
        });
    },
    getExtendedUrl(type, word) {
        return config[config.mappedUrl[type]].replace(/:word/g, word);
    },
    printDetails(type, data, printData = '') {
        if(['def', 'ex'].indexOf(type) > -1) {
            return printData + '\n' + data.map((s, index) => {
                return `${index + 1}. ${s}`;
            }).join('\n');
        }
        if(['ant', 'syn'].indexOf(type) > -1) {
            return printData + data[type === 'syn' ? 'synonyms' : 'antonyms'].join(', ');
        }
    },
    preText(type = 'word', word) {
        let string;
        switch (type) {
            case 'def':
                string = 'Definition';
                break;
            case 'ex':
                string = 'Example';
                break;
            case 'syn':
                string = 'Synonym';
                break;
            case 'ant':
                string = 'Antonym';
                break;
            case 'word':
                string = 'Details';
                break;
        }
        return `${string} for the word: ${word}`;
    },
    printLine() {
        console.log('----------------------------------------------------------------');
    }
};