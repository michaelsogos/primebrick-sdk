module.exports = {
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "postgres",
	password: "postgres",
	database: "primebrick_coordinator",
	entities: ["dist/modules/TenantManager/entities/*.js"],
	synchronize: false,
	subscribers: [],
	autoLoadEntities: true,
	migrationsTableName: "db_migration_history",
	migrations: ["dist/db/migrations/*.js"],
	cli: {
		migrationsDir: "src/db/migrations",
	},
};
