export function EntityModule(brickModuleName: string) {
    return function (constructor: Function): any {
        constructor.prototype.brickModuleName = brickModuleName;
    };
}
