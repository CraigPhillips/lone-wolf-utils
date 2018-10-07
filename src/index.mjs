import bunyan from 'bunyan';
import bunyanFormat from 'bunyan-format';
import yargs from 'yargs';

let log;
try {
  log = bunyan.createLogger({
    name: 'FE Lone Wolf Utilities',
    level: 'trace',
    stream: bunyanFormat({ outputMode: 'short' }),
  });
  const { argv } = yargs;

  log.trace({ argv }, 'dummy log message');
} catch (error) {
  (log || console).error(error, 'fatal error');
}
