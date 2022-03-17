import { Shell } from '../Shell';

export function restartSelf () {
    let command = process
        .argv
        .map(x => x.includes(' ') ? `"${x}"` : x)
        .join(' ');

    let shell = new Shell({
        command,
        detached: true,
    });
    shell.onStart(() => {
        console.log('Exit self.')
        process.exit();
    });
    console.log('Cloning this process.');
    shell.run();
};
