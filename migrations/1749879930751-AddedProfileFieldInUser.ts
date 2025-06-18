import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddedProfileFieldInUser1749879930751
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("users", [
      new TableColumn({
        name: "profile_image_url",
        type: "varchar",
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "profile_image_url");
  }
}
