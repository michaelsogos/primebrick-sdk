export class AppManifest {
    name: string;
    version: string;
    author: string;
    copyright: string;
    supportURL: string;
    documentationURL: string;
    installedBricks: InstalledBrick[];
}

class InstalledBrick {
    code: string;
    name: string;
    version: string;
}
