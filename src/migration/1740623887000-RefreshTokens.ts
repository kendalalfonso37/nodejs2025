import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshTokens1740623887000 implements MigrationInterface {
  name = "RefreshTokens1740623887000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`refresh_tokens\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`refresh_token\` text NOT NULL, \`issued_time\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`expiration_time\` datetime NOT NULL, \`user_id\` bigint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_3ddc983c5f7bcf132fd8732c3f4\``
    );
    await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
  }
}
