import { MigrationInterface, QueryRunner, Table, TableUnique } from "typeorm";

export class WorkPlaceUser1750654254470 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
        foreignKeys: [
          {
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
          },
          {
            columnNames: ["workplaceId"],
            referencedColumnNames: ["id"],
            referencedTableName: "workplace",
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      "workplace_user",
      new TableUnique({
        name: "UQ_user_workplace",
        columnNames: ["userId", "workplaceId"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("workplace_user");
  }
}
