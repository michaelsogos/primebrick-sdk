import {MigrationInterface, QueryRunner} from "typeorm";

export class coordinatorSchemaUpdate1596358156265 implements MigrationInterface {
    name = 'coordinatorSchemaUpdate1596358156265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenant_aliases" ("id" SERIAL NOT NULL, "alias" character varying NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "deleted_on" TIMESTAMP, "tenant_id" integer, CONSTRAINT "UQ_f77af859e3178adb08fdcd6de9b" UNIQUE ("alias"), CONSTRAINT "PK_bfe6807cc09a87ffc21e084c3b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenant_db_configs" ("id" SERIAL NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "deleted_on" TIMESTAMP, "db_host" character varying NOT NULL, "db_port" integer NOT NULL, "db_username" character varying NOT NULL, "db_password" character varying NOT NULL, "db_name" character varying NOT NULL, "tenant_id" integer, CONSTRAINT "REL_92942ce3911dd3936daa4b8b84" UNIQUE ("tenant_id"), CONSTRAINT "PK_40e7bedb00643ccc59b1c8828be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenant_auth_configs" ("id" SERIAL NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "deleted_on" TIMESTAMP, "auth_type" character varying NOT NULL, "auth_config" json NOT NULL, "tenant_id" integer, CONSTRAINT "REL_4a7d072287359cb0654e7f74bf" UNIQUE ("tenant_id"), CONSTRAINT "PK_ca48f616293e7c6997668299751" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "deleted_on" TIMESTAMP, CONSTRAINT "UQ_3021c18db2b363ae9324c826c5a" UNIQUE ("code"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tenant_aliases" ADD CONSTRAINT "FK_a659bb036463844764252d51902" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_db_configs" ADD CONSTRAINT "FK_92942ce3911dd3936daa4b8b845" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_auth_configs" ADD CONSTRAINT "FK_4a7d072287359cb0654e7f74bfb" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_auth_configs" DROP CONSTRAINT "FK_4a7d072287359cb0654e7f74bfb"`);
        await queryRunner.query(`ALTER TABLE "tenant_db_configs" DROP CONSTRAINT "FK_92942ce3911dd3936daa4b8b845"`);
        await queryRunner.query(`ALTER TABLE "tenant_aliases" DROP CONSTRAINT "FK_a659bb036463844764252d51902"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TABLE "tenant_auth_configs"`);
        await queryRunner.query(`DROP TABLE "tenant_db_configs"`);
        await queryRunner.query(`DROP TABLE "tenant_aliases"`);
    }

}
