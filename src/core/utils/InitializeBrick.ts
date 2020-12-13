export function InitializeBrick(name: string) {
    if (!name) throw new Error('Cannot initialize brick with empty or invalid name! InitializeBrick({name}) must receive a valid name.');
    process.brickName = name;
}
