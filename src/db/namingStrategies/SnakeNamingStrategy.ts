import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils";

export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
	tableName(className: string, customName: string): string {
		return customName ? customName : snakeCase(className);
	}

	columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
		const columnName = customName ? customName : snakeCase(propertyName);

		return embeddedPrefixes.length ? `${snakeCase(embeddedPrefixes.join("_"))}_${columnName}` : columnName;
	}

	relationName(propertyName: string): string {
		return snakeCase(propertyName);
	}

	joinColumnName(relationName: string, referencedColumnName: string): string {
		return `${relationName}_${referencedColumnName}`;
	}

	joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
		return `${firstTableName}_${secondTableName}`;
	}

	joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
		return `${tableName}_${columnName || propertyName}`;
	}

	classTableInheritanceParentColumnName(parentTableName: any, parentTableIdPropertyName: any): string {
		return `${parentTableName}_${parentTableIdPropertyName}`;
	}

	eagerJoinRelationAlias(alias: string, propertyPath: string): string {
		return `${alias}__${propertyPath.replace(".", "_")}`;
	}
}
