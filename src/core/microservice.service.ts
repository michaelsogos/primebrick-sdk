import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { MessagePayload } from '../modules/ProcessorManager/models/MessagePayload';
import { ProcessorManagerService } from '../modules/ProcessorManager/processormanager.service';
import { RpcAction } from './enums/RpcAction';
import { AdvancedLogger } from './logger.service';
import { InstallBrickResponse } from './models/InstallBrickResponse';
import { ViewDefinition } from './models/ViewDefinition';
import { CommonHelper } from './utils/CommonHelper';

@Injectable()
export class MicroserviceService {
    constructor(private readonly processorManagerService: ProcessorManagerService, private readonly logger: AdvancedLogger) {}

    async installBrick() {
        const response = new InstallBrickResponse();
        const modulesPath = path.join(process.cwd(), CommonHelper.isDebugMode() ? 'src' : 'dist', 'modules');
        const moduleFolders = fs
            .readdirSync(modulesPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        for (const folder of moduleFolders) {
            const viewFolderPath = path.join(modulesPath, folder, 'resources', 'imports');

            if (fs.existsSync(viewFolderPath)) {
                const viewFiles = fs
                    .readdirSync(modulesPath, { withFileTypes: true })
                    .filter((dirent) => dirent.isFile())
                    .map((dirent) => dirent.name);

                for (const view of viewFiles) {
                    const viewFilePath = path.resolve(viewFolderPath, view);
                    const viewFileContent = fs.readFileSync(viewFilePath).toString();
                    const viewJson = JSON.parse(viewFileContent);

                    if (!viewJson || !viewJson['name']) throw new Error(`View definition at "${viewFilePath}" is malformed!`);

                    const viewDefintion = new ViewDefinition();
                    viewDefintion.name = viewJson['name'];
                    viewDefintion.definition = viewFileContent;

                    const result: MessagePayload<boolean> = await this.processorManagerService.sendMessage<ViewDefinition>(
                        RpcAction.REGISTER_VIEW,
                        viewDefintion,
                    );

                    if (result.data) {
                        this.logger.info(`The view [${viewDefintion.name}] registered succesfully!`);
                        response.views.done += 1;
                    } else {
                        this.logger.error(`The view [${viewDefintion.name}] registration failed!`);
                        response.views.failed += 1;
                    }
                }
            }
        }

        return response;
    }
}
