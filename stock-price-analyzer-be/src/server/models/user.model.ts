import { pool } from '@/db';
import { User } from '@/types/core/user/user.types';
import GenericModel from './generic.model';
export const USER_TABLE = 'user';
export const USER_PK = 'id_user';

export class UserModel extends GenericModel<User> {
  constructor() {
    super(USER_TABLE, USER_PK);
  }

  /**
   * Return any user that match provided username.
   * @param username
   * @returns user which match username
   */
  public async findByUsername(username: string): Promise<User> {
    const rows: User[] = await pool.query(`SELECT * FROM user WHERE username = ?;`, username);
    return rows[0];
  }
}
