import {MigrationInterface, QueryRunner} from "typeorm";

export class coordinatorSchemaUpdate1596878923626 implements MigrationInterface {
    name = 'coordinatorSchemaUpdate1596878923626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenant_theme_configs" ("id" SERIAL NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "deleted_on" TIMESTAMP, "theme" character varying NOT NULL, "primary" character varying NOT NULL, "secondary" character varying NOT NULL, "tertiary" character varying NOT NULL, "accent" character varying NOT NULL, "error" character varying NOT NULL, "warning" character varying NOT NULL, "info" character varying NOT NULL, "success" character varying NOT NULL, "tenant_id" integer, CONSTRAINT "REL_f06dc6396e35f31fee06799606" UNIQUE ("tenant_id"), CONSTRAINT "PK_0d71504690d4bce8b6b7ec23bc7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tenant_theme_configs" ADD CONSTRAINT "FK_f06dc6396e35f31fee067996061" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_theme_configs" DROP CONSTRAINT "FK_f06dc6396e35f31fee067996061"`);
        await queryRunner.query(`DROP TABLE "tenant_theme_configs"`);
    }

}
