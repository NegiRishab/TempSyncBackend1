import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class NotificationTable1750939413463 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notifications",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "type",
            type: "text",
            isNullable: false,
          },
          {
            name: "message",
            type: "text",
            isNullable: false,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "isRead",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "notifications",
      new TableIndex({
        name: "IDX_notifications_userId",
        columnNames: ["userId"],
      }),
    );

    await queryRunner.createIndex(
      "notifications",
      new TableIndex({
        name: "IDX_notifications_isRead",
        columnNames: ["isRead"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("notifications", "IDX_notifications_isRead");
    await queryRunner.dropIndex("notifications", "IDX_notifications_userId");
    await queryRunner.dropTable("notifications");
  }
}
