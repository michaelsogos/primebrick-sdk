import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { AudibleEntity } from "../../../db";
import { User } from "./User.entity";

@Entity("core_logins")
export class Login extends AudibleEntity {
	@Column({ unique: true })
	username: string;

	@Column()
	password: string;

	@OneToOne((type) => User, (T) => T.login)
	@JoinColumn({ name: "user_id" })
	user: User;
}
