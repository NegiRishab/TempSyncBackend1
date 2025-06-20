import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class RefreshTokenCreate1746511054963 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "refresh_tokens",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
          },
          {
            name: "token",
            type: "text",
          },
          {
            name: "ip_address",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "user_agent",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "is_revoked",
            type: "boolean",
            default: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "expires_at",
            type: "timestamp",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
