import { pool } from '@/db';
import { UpsertResult } from 'mariadb';

/**
 * Class that can be extended or instanced.
 * It provides a plain CRUD API.
 * @type E entity just for safety
 */
export default abstract class GenericModel<E> {
  table: string;
  pk: string;

  constructor(table: string, pk: string) {
    this.table = table;
    this.pk = pk;
  }

  // @ Static methods

  /**
   * This method execute a generic SELECT statement given PK value.
   * Note that sql error will not be handled.
   *
   * @param table target table
   * @param pk target table pk
   * @param ID target table record
   * @returns record that match ID or undefined
   */
  public static async staticFindById<E>(table: string, pk: string, ID: number): Promise<E> {
    const rows: E[] = await pool.query(`SELECT * FROM ${table} WHERE ${pk} = ?`, ID);
    return rows[0];
  }

  /**
   * This method execute a generic SELECT statement.
   * Note that sql error will not be handled.
   * @param table target table
   * @returns record that match ID or undefined
   */
  public static async staticfindAll<E>(table: string): Promise<E[]> {
    const rows: E[] = await pool.query(`SELECT * FROM ${table}`);
    return rows;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Data Fetch
  // -----------------------------------------------------------------------------------------------------

  public async findAll(): Promise<E[]> {
    const rows = await pool.query(`SELECT * FROM ${this.table}`);
    return rows;
  }

  public async findById(ID: number): Promise<E> {
    const rows: E[] = await pool.query(`SELECT * FROM ${this.table} WHERE ${this.pk} = ?`, ID);
    return rows[0];
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Data Manipulation
  // -----------------------------------------------------------------------------------------------------

  public async create(object: E | object): Promise<number> {
    const query: UpsertResult = await pool.query(`INSERT INTO ${this.table} SET ?`, object);
    return Number(`${query.insertId}`);
  }

  /**
   * Updates a record with provided data.
   * @param ID target record
   * @param object object with data
   * @return affected rows
   */
  public async update(ID: number, object: E | object): Promise<number> {
    const query = await pool.query(`UPDATE ${this.table} SET ? WHERE ${this.pk} = ?`, [object, ID]);
    return query.affectedRows;
  }

  /**
   * Removes a record.
   * @param ID target record
   * @return affected rows
   */
  public async delete(ID: number): Promise<number> {
    const query: UpsertResult = await pool.query(`DELETE FROM ${this.table} WHERE ${this.pk} = ?`, ID);
    return query.affectedRows;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Builds pagination query. If search is provided, it will be
   * executed. If not, a simple select * will be executed.
   * @param {*} search optional search
   * @param {*} selectFrom if true select-from will not be omitted
   * @returns requested query
   */
}
