import { MigrationInterface, QueryRunner } from "typeorm";

export class UserChanges1741490953690 implements MigrationInterface {
  name = "UserChanges1741490953690";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`token\` \`tokenVersion\` text NULL`);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`tokenVersion\``);
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`tokenVersion\` int NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`tokenVersion\``);
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`tokenVersion\` text NULL`);
    await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`tokenVersion\` \`token\` text NULL`);
  }
}
