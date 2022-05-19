import { logger, stream } from '@utils/logger';
import chalk from 'chalk';
import compression from 'compression';
import config from 'config';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { useExpressServer } from 'routing-controllers';
import authMiddleware from './server/middlewares/auth.middleware';
import errorMiddleware from './server/middlewares/error.middleware';

process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  // eslint-disable-next-line @typescript-eslint/ban-types
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(Controllers: Function[]) {
    this.app = express();
    this.port = 3555; /* process.env.PORT || 3555 */
    this.env = process.env.NODE_ENV || 'development';
    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(chalk.magenta(`=================================`));
      logger.info(chalk.magenta(`======= ENV: ${this.env} =======`));
      logger.info(chalk.magenta(`🚀 App listening on the port ${this.port}`));
      logger.info(chalk.magenta(`=================================`));
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.get('log.format'), { stream }));
    this.app.use(hpp());
    this.app.use(
      helmet({
        crossOriginResourcePolicy: {
          policy: 'cross-origin',
        },
      }),
    );
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(express.static('/src/resources'));
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  // eslint-disable-next-line @typescript-eslint/ban-types
  private initializeRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: config.get('cors.origin'),
        credentials: config.get('cors.credentials'),
      },
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
