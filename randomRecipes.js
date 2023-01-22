const fs = require('fs');
const path = require('path');
const process = require('process');

let inputFolder, outputFolder;
const recipes = {
    'minecraft:recipe_shapeless': [],
    'minecraft:recipe_shaped': [],
    'minecraft:recipe_furnace': [],
    'minecraft:recipe_brewing_container': [],
    'minecraft:recipe_brewing_mix': []
};

async function main() {
    inputFolder = path.normalize(await askForInput('What is the original recipe folder?'));
    outputFolder = path.normalize(await askForInput('What is the folder you want the shuffled recipes in?'));

    const fileNames = getFileNames(inputFolder);
    fileNames.forEach((fileName) => {
        const recipeCode = JSON.parse(fs.readFileSync(path.join(inputFolder,fileName)).toString());
        recipes[getRecipeType(recipeCode)].push(recipeCode);
    });
    fileNames.forEach((fileName) => {
        const recipeOutputCode = JSON.parse(fs.readFileSync(path.join(inputFolder,fileName)).toString());
        const recipeType = getRecipeType(recipeOutputCode);
        const randomIndex = randInt(0,recipes[recipeType].length - 1);
        const recipeInputCode = recipes[recipeType][randomIndex];
        recipes[recipeType].splice(randomIndex,1);
        switch(recipeType) {
            case 'minecraft:recipe_shapeless':
                recipeOutputCode[recipeType].ingredients = recipeInputCode[recipeType].ingredients;
                break;
            case 'minecraft:recipe_shaped':
                recipeOutputCode[recipeType].pattern = recipeInputCode[recipeType].pattern;
                recipeOutputCode[recipeType].key = recipeInputCode[recipeType].key;
                break;
            case 'minecraft:recipe_furnace':
                recipeOutputCode[recipeType].input = recipeInputCode[recipeType].input;
                break;
            case 'minecraft:recipe_brewing_mix':
            case 'minecraft:recipe_brewing_container':
                recipeOutputCode[recipeType].input = recipeInputCode[recipeType].input;
                recipeOutputCode[recipeType].reagant = recipeInputCode[recipeType].reagant;
                break;
        }
        console.log(recipeOutputCode);
        
        const finalOutputFile = path.join(outputFolder,fileName);
        const finalOutputFolder = path.dirname(finalOutputFile);
        console.log(`Saving File: ${finalOutputFile}`);
        fs.mkdirSync(finalOutputFolder,{recursive:true});
        fs.writeFileSync(finalOutputFile,JSON.stringify(recipeOutputCode,null,2));
    });
}

async function askForInput(message) {
    return new Promise((resolve => {
        process.stdout.write(message + '\n');
        process.stdin.once('data', data => resolve(data.toString().trim()));
    }));
}

function getFileNames(directory) {
    let fileNames = [];
    fs.readdirSync(directory, { withFileTypes: true }).forEach(file => {
        if (file.isFile() && path.extname(file.name) === '.json') {
            fileNames.push(file.name);
        } else if (file.isDirectory()) {
            fileNames = fileNames.concat(getFileNames(path.join(directory, file.name)).map(s => path.join(file.name, s)));
        }
    });
    return fileNames
}

function randInt(min, max) {
    return Math.floor(Math.random() * (1 + max - min) + min);
}

function getRecipeType(recipeCode) {
    if (recipeCode['minecraft:recipe_shapeless'] != null) return 'minecraft:recipe_shapeless';
    if (recipeCode['minecraft:recipe_shaped'] != null) return 'minecraft:recipe_shaped';
    if (recipeCode['minecraft:recipe_furnace'] != null) return 'minecraft:recipe_furnace';
    if (recipeCode['minecraft:recipe_brewing_container'] != null) return 'minecraft:recipe_brewing_container'
    if (recipeCode['minecraft:recipe_brewing_mix'] != null) return 'minecraft:recipe_brewing_mix';
}

main();