import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RpcAction } from '../../core/enums/RpcAction';
import { AdvancedLogger } from '../../core/logger.service';
import { InstallBrickResponse } from '../../core/models/InstallBrickResponse';
import { ViewDefinition } from '../../core/models/ViewDefinition';
import { CommonHelper } from '../../core/utils/CommonHelper';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { ProcessorManagerService } from '../ProcessorManager/processormanager.service';

@Injectable()
export class MicroserviceManagerService {
    constructor(private readonly processorManagerService: ProcessorManagerService, private readonly logger: AdvancedLogger) {
        logger.setContext(MicroserviceManagerService.name);
    }

    async installBrick() {
        const response = new InstallBrickResponse();
        const modulesPath = path.join(process.cwd(), CommonHelper.isDebugMode() ? 'src' : 'dist', 'modules');
        const moduleFolders = fs
            .readdirSync(modulesPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        for (const folder of moduleFolders) {
            const viewFolderPath = path.join(modulesPath, folder, 'resources', 'views');

            if (fs.existsSync(viewFolderPath)) {
                const viewFiles = fs
                    .readdirSync(viewFolderPath, { withFileTypes: true })
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

                    try {
                        const result: MessagePayload<boolean> = await this.processorManagerService.sendMessage<ViewDefinition>(
                            RpcAction.REGISTER_VIEW,
                            viewDefintion,
                            2000
                        );

                        if (result.data) {
                            this.logger.info(`The view [${viewDefintion.name}] registered succesfully!`);
                            response.viewsRegistration.done.push(viewDefintion.name);
                        } else {
                            this.logger.error(`The view [${viewDefintion.name}] registration failed!`);
                            response.viewsRegistration.failed.push(viewDefintion.name);
                        }
                    } catch (ex) {
                        this.logger.error(ex);
                        this.logger.error(`The view [${viewDefintion.name}] registration failed!`);
                        response.viewsRegistration.failed.push(viewDefintion.name);
                    }
                }
            }
        }

        return response;
    }
}
