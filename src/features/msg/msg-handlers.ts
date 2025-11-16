import { stats } from "../stats/stats.store";
import { statsWsHandler } from "../stats/stats.ws-handler";

const statsHandlers = Object.keys(stats).map(room => ({ [room]: statsWsHandler })).reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const msgHandlers = {
  ...statsHandlers
}