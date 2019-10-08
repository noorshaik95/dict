const config = require('config');
const request = require('request');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
    preText(type = 'word', word = '') {
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
        return `${string} for the word ${word.trim()} are: `;
    },
    printLine() {
        console.log('----------------------------------------------------------------');
    },
    getRandomString(word = '') {
        return word.split('').sort(() => 0.5 - Math.random()).join('');
    },
    getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
    },
    getRandomData(antonyms, synonyms, definitions, word) {
        let that = module.exports;
        return [{
            type: 'def',
            data: definitions,
            toCall: function () {
                that.printLine();
                console.log(that.printDetails(this.type, [definitions[that.getRandomNumber(0, this.data.length - 1)]], that.preText(this.type)));
            }
        }, {
            type: 'ant',
            data: antonyms,
            toCall: function () {
                that.printLine();
                console.log(that.printDetails(this.type, {antonyms: [antonyms[that.getRandomNumber(0, this.data.length - 1)]]}, that.preText(this.type)));
            }
        }, {
            type: 'syn',
            data: synonyms,
            toCall: function (showedSynonyms = []) {
                that.printLine();
                let synonym = synonyms[that.getRandomNumber(0, this.data.length - 1)];
                showedSynonyms.push(synonym);
                console.log(that.printDetails(this.type, {synonyms: [synonym]}, that.preText(this.type)));
            }
        }, {
            type: 'jumbled',
            word: word,
            toCall: function() {
                console.log(`Jumbled Word: ${that.getRandomString(this.word)}`);
            }
        }]
    },
    displayRandomData(randomData = [], showedSynonyms = []) {
        randomData[this.getRandomNumber(0, randomData.length - 1)].toCall(showedSynonyms);
    },
    checkAnswer(answer, showedSynonym = [], synonym = [], word) {
        answer = answer.trim();
        return answer === word || (synonym.indexOf(answer) > -1 && showedSynonym.indexOf(answer) === -1);

    },
    getQuestionTemplate() {
        return 'Please select any one option: \n 1. To enter the word \n 2. Ask for hint \n 3. To quit\n';
    },
    askQuestion(question) {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer);
            });
        })
    },
    async onAnswer(randomDisplay, showedSynonyms) {
        let answer =  (await this.askQuestion(this.getQuestionTemplate())).trim();
        if (answer === '1') {
            answer = await this.askQuestion('Guess the word:');
        } else if (answer === '2') {
            this.displayRandomData(randomDisplay, showedSynonyms);
            answer = await this.askQuestion('Guess the word:');
        } else if (answer === '3') {
            return true;
        } else {
            console.log('Invalid input');
            answer = await this.onAnswer(randomDisplay, showedSynonyms)
        }
        return answer;
    }

};