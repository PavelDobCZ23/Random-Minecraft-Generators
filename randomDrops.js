const fs = require('fs');
const path = require('path');
const process = require('process');

let inputFolder, outputFolder;
const loots = {
    'entities': [],
    'chests': []
};

async function main() {
    inputFolder = path.normalize(await askForInput('What is the original loot table folder?'));
    outputFolder = path.normalize(await askForInput('What is the folder you want the shuffled loot tables in?'));

    const chestFileNames = getFileNames(path.join(inputFolder,'chests'));
    const entityFileNames = getFileNames(path.join(inputFolder,'entities'));
    chestFileNames.forEach((fileName) => {
        const lootTableCode = fs.readFileSync(path.join(inputFolder,'chests',fileName)).toString();
        loots.chests.push(lootTableCode);
    });

    entityFileNames.forEach((fileName) => {
        const lootTableCode = fs.readFileSync(path.join(inputFolder,'entities',fileName)).toString();
        loots.entities.push(lootTableCode);
    });

    chestFileNames.forEach((fileName) => {
        const randomIndex = randInt(0,loots.chests.length - 1);
        const newLootTableCode = loots.chests[randomIndex];
        loots.chests.splice(randomIndex,1);
        
        const finalOutputFile = path.join(outputFolder,'chests',fileName);
        const finalOutputFolder = path.dirname(finalOutputFile);
        console.log(`Saving File: ${finalOutputFile}`);
        fs.mkdirSync(finalOutputFolder,{recursive:true});
        fs.writeFileSync(finalOutputFile,newLootTableCode);
    });

    entityFileNames.forEach((fileName) => {
        const randomIndex = randInt(0,loots.entities.length - 1);
        const newLootTableCode = loots.entities[randomIndex];
        loots.entities.splice(randomIndex,1);
        
        const finalOutputFile = path.join(outputFolder,'entities',fileName);
        const finalOutputFolder = path.dirname(finalOutputFile);
        console.log(`Saving File: ${finalOutputFile}`);
        fs.mkdirSync(finalOutputFolder,{recursive:true});
        fs.writeFileSync(finalOutputFile,newLootTableCode);
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
        if (file.isFile() && path.extname(file.name) === '.json' && !file.name.startsWith('armor_set_')) {
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

main();