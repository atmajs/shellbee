console.log('starting');


(async function () {

    const { File } = require('atma-io');
    await File.appendAsync('./test/tmp/restart.log', `started\n`);

    console.log('nothing after');
    setInterval(() => {
        // prevent exit
    }, 1_000);
}());
