const readline = require('readline');
const yargs = require('yargs');
const argv = yargs.argv;
const config = require('config');
const utils = require('./utils');
const dict = require('./dict');
let type, word;
let definitions = [], antonyms = [], synonyms = [], examples = [];

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
} else if (argv._[0] !== 'play' && !argv._[1]) {
    word = argv._[0];
} else {
    type = 'play'
}

async function getDetails(type, word = '') {
    let response;
    try {
        switch (type) {
            case 'def':
                response = await dict.getDefinition(word, config.extendUrl + utils.getExtendedUrl(type, word));
                for(let ex of response.body) {
                    definitions.push(ex.text);
                }
                return definitions;
            case 'syn':
            case 'ant':
                response = await dict.getRelatedWord(word, config.extendUrl + utils.getExtendedUrl(type, word));
                for(let data of response.body) {
                    if(data.relationshipType === 'antonym') {
                        antonyms = [...data.words];
                    }
                    if(data.relationshipType === 'synonym') {
                        synonyms = [...data.words];
                    }
                }
                return {antonyms, synonyms};
            case 'ex':
                response = await dict.getExample(word, config.extendUrl + utils.getExtendedUrl(type, word));
                for(let ex of response.body.examples) {
                    examples.push(ex.text);
                }
                return examples;
            case 'play':
                await getAllDetails(word);
                let randomDisplay = utils.getRandomData(antonyms, synonyms, definitions, word);
                let showedSynonyms = [];
                utils.displayRandomData(randomDisplay, showedSynonyms);
                let answer = await utils.askQuestion('Guess the word:');
                while (!utils.checkAnswer(answer, synonyms, showedSynonyms, word)) {
                    answer = await utils.onAnswer(randomDisplay, showedSynonyms);
                    if(typeof answer === 'boolean' && answer) {
                        break;
                    }
                }
            case 'dict':
            default:
                await getAllDetails(word);
        }
    } catch (e) {
        console.error(`Error: ${e}`);
        process.exit(1);
    }
}

async function getAllDetails(word) {
    let responses = [];
    for(let type of config.commandsWithWord) {
        if(type !== 'ant') {
            responses.push(getDetails(type, word));
        }
    }
    return await Promise.all(responses);
}

async function startApp() {
    if((!type || type === 'play') && !word) {
        let response = await dict.getRandomWord();
        if(response.res.statusCode === 200) {
            word = response.body.word;
        }
    }
    let data = await getDetails(type, word);
    if (config.commandsWithWord.indexOf(type) > -1) {
        utils.printLine();
        console.log(utils.printDetails(type, data, utils.preText(type, word)))
    } else {
        console.log(utils.preText('word', word));
        utils.printLine();
        for(let type of config.commandsWithWord) {
            if(type === 'def') {
                console.log(utils.printDetails(type, definitions, utils.preText(type, word)));
            }
            if(type === 'ex') {
                console.log(utils.printDetails(type, examples, utils.preText(type, word)));
            }
            if(type === 'syn') {
                console.log(utils.printDetails(type, {synonyms}, utils.preText(type, word)));
            }
            if(type === 'ant') {
                console.log(utils.printDetails(type, {antonyms}, utils.preText(type, word)));
            }
            utils.printLine();
        }
    }
    process.exit(1);
}

startApp();