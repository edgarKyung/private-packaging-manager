let loading = null;
function start(intro) {
    process.stdout.write(intro);
    if (loading === null) {
        loading = setInterval(() => {
            process.stdout.write('.');
        }, 1000);
    }
}
function stop(outro) {
    if (loading !== null) {
        learInterval(loading);
        process.stdout.write(`${outro}\n`);
        loading = null;
    }
}
module.exports = {
    "start": start,
    "stop": stop
};
