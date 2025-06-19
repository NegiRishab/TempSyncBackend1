import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class AddedInvitationTable1750328895213 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "invitation",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "email",
            type: "varchar",
          },
          {
            name: "token",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "organizationId",
            type: "uuid",
          },
          {
            name: "status",
            type: "varchar",
            default: "'pending'",
          },
          {
            name: "expiresAt",
            type: "timestamp",
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

    await queryRunner.createForeignKey(
      "invitation",
      new TableForeignKey({
        columnNames: ["organizationId"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
