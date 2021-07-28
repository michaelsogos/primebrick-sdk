export enum ModuleRpcAction {
    IMPORT_DATA = 'data:import',
    DATA_FIND_MANY = 'data:findMany',
    DATA_FIND_ONE = 'data:findOne',
    DATA_SAVE = 'data:save',
    DATA_INFO = 'data:info',
    DATA_DELETE = 'data:delete',
    DATA_DELETE_MANY = 'data:deleteMany',
}

export function ComposeModuleRpcAction(moduleName: String, rpcAction: ModuleRpcAction) {
    if (!moduleName) throw new Error('Cannot compose ModuleRpcAction with empty or invalid brick name!');
    if (!rpcAction) throw new Error('Cannot compose ModuleRpcAction with empty or invalid action!');
    return `${moduleName}.${rpcAction}`;
}
