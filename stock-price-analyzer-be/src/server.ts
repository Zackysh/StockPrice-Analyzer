process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';
import 'dotenv/config';
import 'reflect-metadata';
import App from '@/app';
import { AuthController } from './server/controllers/auth.controller';
import { UserController } from './server/controllers/user.controller';

// validateEnv();
const app = new App([UserController, AuthController]);
app.listen();
