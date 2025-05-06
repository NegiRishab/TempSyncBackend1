import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateUserTable1746515422075 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('users', [
          new TableColumn({
            name: 'first_name',
            type: 'varchar',
            isNullable: false, 
          }),
          new TableColumn({
            name: 'last_name',
            type: 'varchar',
            isNullable: false,
          }),
        ]);
        await queryRunner.dropColumn('users', 'name');
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
          'users',
          new TableColumn({
            name: 'name',
            type: 'varchar',
            isNullable: false,
          })
        );
    
        // Drop firstName and lastName columns
        await queryRunner.dropColumn('users', 'first_name');
        await queryRunner.dropColumn('users', 'last_name');
      }

}
