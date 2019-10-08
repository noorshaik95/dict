const readline = require('readline');
const yargs = require('yargs');
const argv = yargs.argv;
const config = require('config');
const utils = require('./utils');
const dict = require('./dict');
let type, word;
if (config.commandsWithWord.indexOf(argv._[0]) > -1) {
    if(!argv._[1]) {
        console.log("Invalid input");
        process.exit(1);
    }
    type = argv._[0];
    word = argv._[1];
} else if (argv._[0] === 'dict' && argv._[1]){
    word = argv._[1];
    type = argv._[0];
} else if (argv._[0] && !argv._[1]) {
    word = argv._[0];
}
let response;
process(type, word);
async function process(type, word = '') {
    if(!type) {
        let response = await dict.getRandomWord();
        if(response.res.statusCode === 200) {
            word = response.body.word;
        }
    }
    switch (type) {
        case 'def':
            response = await dict.getDefinition(word, config.extendUrl + utils.getExtendedUrl(type, word));
            return response.body;
        case 'syn':
            response = await dict.getRelatedWord(word, config.extendUrl + utils.getExtendedUrl(type, word));
            return response.body;
        case 'ant':
            response = await dict.getRelatedWord(word, config.extendUrl + utils.getExtendedUrl(type, word));
            return response.body;
        case 'ex':
            response = await dict.getExample(word, config.extendUrl + utils.getExtendedUrl(type, word));
            return response.body;
        case 'play':
            console.log('play');
            break;
        case 'dict':
        default:
            let responses = [];
            for(let type of config.commandsWithWord) {
                if(type !== 'ant') {
                    responses.push(process(type, word));
                }
            }
            console.log(await Promise.all(responses));
    }
}