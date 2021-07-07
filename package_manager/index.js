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
    // try {
    //     spinner.start('Installing NPM Modules');
    //     const npmResult = await execPromise('npm install');
    //     spinner.stop(' Finish');
    //     printMessage(`${npmResult.stderr}${npmResult.stdout}`);
    // } catch (e) {
    //     spinner.stop(' Finish');
    //     printMessage(`${e}`);
    // }

    const packageJson = require(path.join(process.cwd(), 'package.json'));
    const ppmList = packageJson.ppm;
    for (const property in ppmList) {
        const destination = property;
        const repository = ppmList[property];
        try {
            spinner.start(`Installing ${destination} Module`);
            const ppmResult = await execPromise(`git clone ${repository} ${destination} && cd ${destination} && npm install`);
            spinner.stop(' Finish');
            printMessage(`${ppmResult.stderr}${ppmResult.stdout}`);
        } catch (e) {
            spinner.stop(' Finish');
            printMessage(`${e}`);
        }
    }
}

async function add(destination, repository) {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packagePath);
    packageJson.ppm = packageJson.ppm || {};
    if (packageJson.ppm[destination] === undefined) {
        packageJson.ppm[destination] = repository;
        try {
            spinner.start(`Installing ${destination} Module`);
            const ppmResult = await execPromise(`git clone ${repository} ${destination} && cd ${destination} && npm install`);
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));
            spinner.stop(' Finish');
            printMessage(`${ppmResult.stderr}${ppmResult.stdout}`);
        } catch (e) {
            spinner.stop(' Finish');
            printMessage(`${e}`);
        }
    } else {
        printMessage(`${destination} Module is already exist`);
    }
}

async function remove(destination) {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packagePath);
    if (packageJson.ppm[destination]) {
        try {
            spinner.start(`Removing ${destination}`);
            await execPromise(`cmd /c if exist ${destination} (rmdir /s /q ${destination.split('/').join('\\')})`);
            delete packageJson.ppm[destination];
            if (Object.keys(packageJson.ppm).length === 0) {
                delete packageJson.ppm;
            }
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));
            spinner.stop(' Finish');
        } catch (e) {
            spinner.stop(' Finish');
            printMessage(`${e}`);
        }
    } else {
        printMessage(`${destination} Module is not exist`);
    }
}

async function clean() {
    const packageJson = require(path.join(process.cwd(), 'package.json'));
    const ppmList = packageJson.ppm;
    for (const property in ppmList) {
        const destination = property;
        const repository = ppmList[property];
        try {
            spinner.start(`Removing ${destination} Module`);
            const ppmResult = await execPromise(`cmd /c if exist ${destination} (rmdir /s /q ${destination.split('/').join('\\')})`);
            spinner.stop(' Finish');
            printMessage(`${ppmResult.stderr}${ppmResult.stdout}`);
        } catch (e) {
            spinner.stop(' Finish');
            printMessage(`${e}`);
        }
    }
}

module.exports = {
    "install": install,
    "add": add,
    "remove": remove,
    "clean": clean
};
