import { Net } from './ps/Net';
import { PsList } from './ps/PsList';
import { Shell } from './Shell';
export { restartSelf } from './util/restartSelf'

export { Shell }
export const run = Shell.run;
export const utils = {
    process: {
        getAll: PsList.getAll,
        getByPort: Net.findByPort,
        kill: PsList.kill,
    }
};
