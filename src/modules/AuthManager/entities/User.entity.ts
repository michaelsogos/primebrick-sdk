import { Entity, Column, OneToOne } from "typeorm";
import { AudibleEntity } from "../../../db";
import { Login } from "./Login.entity";

@Entity("core_users")
export class User extends AudibleEntity {
	@Column({ unique: true })
	code: string;

	@Column({ unique: true })
	first_name: string;

	@Column()
	last_name: string;

	@Column()
	email: string;

	@OneToOne((type) => Login, (T) => T.user)
	login: Login;
}
