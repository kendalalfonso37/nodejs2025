import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1740445784111 implements MigrationInterface {
    name = 'InitialSchema1740445784111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE \`routes\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`routes\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`routes\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`routes\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`routes\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`routes\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}
