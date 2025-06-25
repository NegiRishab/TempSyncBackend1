import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from "typeorm";

export class AddCardWorkPlaceWorkPlaceUserTables1750830382792
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Safely create ENUM for card status
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'card_status_enum') THEN
          CREATE TYPE "card_status_enum" AS ENUM ('PENDING', 'ONGOING', 'COMPLETED');
        END IF;
      END
      $$;
    `);

    // Workplace Table
    await queryRunner.createTable(
      new Table({
        name: "workplace",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "organizationId",
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
    );

    await queryRunner.createForeignKey(
      "workplace",
      new TableForeignKey({
        columnNames: ["organizationId"],
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    // WorkplaceUser Table
    await queryRunner.createTable(
      new Table({
        name: "workplace_user",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "userId",
            type: "uuid",
          },
          {
            name: "workplaceId",
            type: "uuid",
          },
          {
            name: "isOwner",
            type: "boolean",
            default: false,
          },
          {
            name: "joinedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys("workplace_user", [
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["workplaceId"],
        referencedTableName: "workplace",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    ]);

    await queryRunner.createUniqueConstraint(
      "workplace_user",
      new TableUnique({
        name: "UQ_user_workplace",
        columnNames: ["userId", "workplaceId"],
      }),
    );

    // Card Table
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
    await queryRunner.dropUniqueConstraint(
      "workplace_user",
      "UQ_user_workplace",
    );
    await queryRunner.dropTable("workplace_user");
    await queryRunner.dropTable("workplace");
    await queryRunner.query(`DROP TYPE IF EXISTS "card_status_enum"`);
  }
}
