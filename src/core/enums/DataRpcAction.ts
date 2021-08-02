export enum DataRpcAction {
    DATA_IMPORT = 'data:import',
    DATA_FIND_MANY = 'data:findMany',
    DATA_FIND_ONE = 'data:findOne',
    DATA_SAVE = 'data:save',
    DATA_INFO = 'data:info',
    DATA_DELETE = 'data:delete',
    DATA_DELETE_MANY = 'data:deleteMany',
    DATA_ARCHIVE = 'data:archive',
    DATA_ARCHIVE_MANY = 'data:archiveMany',
    DATA_RESTORE = 'data:restore',
    DATA_RESTORE_MANY = 'data:restoreMany',
}

export function ComposeModuleRpcAction(moduleName: String, rpcAction: DataRpcAction) {
    if (!moduleName) throw new Error('Cannot compose ModuleRpcAction with empty or invalid brick name!');
    if (!rpcAction) throw new Error('Cannot compose ModuleRpcAction with empty or invalid action!');
    return `${moduleName}.${rpcAction}`;
}
