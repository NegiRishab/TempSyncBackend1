import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class Card1750654266353 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "card_status_enum" AS ENUM ('PENDING', 'ONGOING', 'COMPLETED')`,
    );

    await queryRunner.createTable(
      new Table({
        name: "card",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "card_status_enum",
            default: `'PENDING'`,
          },
          {
            name: "workplaceId",
            type: "uuid",
          },
          {
            name: "assigneeId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "createdById",
            type: "uuid",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys("card", [
      new TableForeignKey({
        columnNames: ["workplaceId"],
        referencedTableName: "workplace",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["assigneeId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      }),
      new TableForeignKey({
        columnNames: ["createdById"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("card");
    await queryRunner.query(`DROP TYPE "card_status_enum"`);
  }
}
