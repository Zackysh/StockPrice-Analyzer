import dbConfig from '@/configs/db/db_dev.json';
import chalk from 'chalk';
import { createPool } from 'mariadb';

export const pool = createPool({
  host: dbConfig.URI,
  port: dbConfig.PORT,
  database: dbConfig.DB,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  connectionLimit: 5,
  permitSetMultiParamEntries: true,
});

pool
  .getConnection()
  .then(conn => {
    console.log(chalk.cyan('Connected to MariaDB! connection id is ' + conn.threadId));
    conn.release(); // release to pool
  })
  .catch(err => {
    console.log('MarkiaDB not connected due to error: ' + err);
    pool.end();
  });
