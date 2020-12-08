export function RegisterBrick(name: string) {
    global['appModuleName'] = name;
    //TODO: @mso -> Change all names around apps to not confuse MODULE with BRICK (MODULE should an exclusive of NestJS, so we should use onlt BRICK as global term)
    //TODO: @mso -> change global['appModuleName'] to contains [Brick] model in order to save time on making Brick entity for registration and also to collect APP INFO (as endpoint of any brick)
    return function (constructor: Function): any {};
}
