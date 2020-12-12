export enum ModuleRpcAction {
    IMPORT_DATA = 'data:import',
    DATA_FIND_MANY = 'data:findMany',
    DATA_FIND_ONE = 'data:findOne',
    DATA_SAVE = 'data:save',
    DATA_INFO = 'data:info',
}

export function ComposeModuleRpcAction(moduleName: String, rpcAction: ModuleRpcAction) {
    return `${moduleName}.${rpcAction}`;
}
