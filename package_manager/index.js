const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const spinner = require('../lib/spinner');
const execPromise = util.promisify(child_process.exec);

function printMessage(message) {
    let changedMessage = message;
    changedMessage = changedMessage.split('WARN').join(`\x1b[33mWARN\x1b[0m`);
    changedMessage = changedMessage.split('ERR').join(`\x1b[33mERR\x1b[0m`);
    console.log(changedMessage);
}

async function install() {
    try {
        spinner.start('Installing NPM Modules');
        const npmResult = await execPromise('npm install');
        spinner.stop(' Finish');
        printMessage(`${npmResult.stderr}${npmResult.stdout}`);
    } catch (e) {
        spinner.stop(' Finish');
        printMessage(`${e}`);
    }

    const packageJson = require(path.join(process.cwd(), 'package.json'));
    const ppmList = packageJson.ppm;
    for (const property in ppmList) {
        const name = property;
        const repository = ppmList[property];
        try {
            spinner.start(`Installing ${name} Module`);
            const ppmResult = await execPromise(`git clone ${repository} node_modules/${name}`);
            spinner.stop(' Finish');
            printMessage(`${ppmResult.stderr}${ppmResult.stdout}`);
        } catch (e) {
            spinner.stop(' Finish');
            printMessage(`${e}`);
        }
    }
}

async function add(name, repository) {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packagePath);
    packageJson.ppm = packageJson.ppm || {};
    if (packageJson.ppm[name] === undefined) {
        packageJson.ppm[name] = repository;
        try {
            spinner.start(`Installing ${name} Module`);
            const ppmResult = await execPromise(`git clone ${repository} node_modules/${name}`);
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));
            spinner.stop(' Finish');
            printMessage(`${ppmResult.stderr}${ppmResult.stdout}`);
        } catch (e) {
            spinner.stop(' Finish');
            printMessage(`${e}`);
        }
    } else {
        printMessage(`${name} Module is already exist`);
    }
}

async function remove(name) {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packagePath);
    if (packageJson.ppm[name]) {
        try {
            spinner.start(`Removing ${name}`);
            await execPromise(`cmd /c if exist node_modules\\${name} (rmdir /s /q node_modules\\${name})`);
            delete packageJson.ppm[name];
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));
            spinner.stop(' Finish');
        } catch (e) {
            spinner.stop(' Finish');
            printMessage(`${e}`);
        }
    } else {
        printMessage(`${name} Module is not exist`);
    }
}

async function clean() {
    try {
        spinner.start('Removing node_modules');
        await execPromise('cmd /c if exist node_modules (rmdir /s /q node_modules)');
        spinner.stop(' Finish');
    } catch (e) {
        spinner.stop(' Finish');
        printMessage(`${e}`);
    }
}

module.exports = {
    "install": install,
    "add": add,
    "remove": remove,
    "clean": clean
};
