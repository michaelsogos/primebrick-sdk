import {MigrationInterface, QueryRunner} from "typeorm";

export class coordinatorSchemaUpdate1599932624166 implements MigrationInterface {
    name = 'coordinatorSchemaUpdate1599932624166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_db_configs" ADD "enable_auto_migration" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tenant_db_configs" ADD "enable_auto_seed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_db_configs" DROP COLUMN "enable_auto_seed"`);
        await queryRunner.query(`ALTER TABLE "tenant_db_configs" DROP COLUMN "enable_auto_migration"`);
    }

}
