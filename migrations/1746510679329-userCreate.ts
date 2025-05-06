import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class UserCreate1746510679329 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'users',
              columns: [
                {
                  name: 'id',
                  type: 'uuid',
                  isPrimary: true,
                  default: 'uuid_generate_v4()',
                },
                {
                  name: 'name',
                  type: 'varchar',
                },
                {
                  name: 'email',
                  type: 'varchar',
                  isUnique: true,
                },
                {
                  name: 'password',
                  type: 'varchar',
                },
                {
                  name: 'role',
                  type: 'varchar',
                },
                {
                  name: 'organization_id',
                  type: 'uuid',
                },
                {
                  name: 'is_active',
                  type: 'boolean',
                  default: false,
                },
                {
                  name: 'created_at',
                  type: 'timestamp',
                  default: 'now()',
                },
                {
                  name: 'updated_at',
                  type: 'timestamp',
                  default: 'now()',
                  onUpdate: 'CURRENT_TIMESTAMP',
                },
              ],
              foreignKeys: [
                {
                  columnNames: ['organization_id'],
                  referencedTableName: 'organizations',
                  referencedColumnNames: ['id'],
                  onDelete: 'CASCADE',
                },
              ],
            })
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
