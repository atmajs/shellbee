const { File } = require('atma-io');


(async function () {

    await File.appendAsync('./test/tmp/restart.log', `started\n`);
    console.log('STARTED');

    setInterval(() => {
        // prevent exit
    }, 1_000);
}());
