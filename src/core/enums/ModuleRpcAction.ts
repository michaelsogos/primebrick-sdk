export enum ModuleRpcAction {
    IMPORT_DATA = 'data:import',
}

export function ComposeModuleRpcAction(moduleName: String, rpcAction: ModuleRpcAction) {
    return `${moduleName}.${rpcAction}`;
}
