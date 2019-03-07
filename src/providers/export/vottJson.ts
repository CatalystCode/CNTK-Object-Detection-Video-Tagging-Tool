import _ from "lodash";
import { ExportProvider } from "./exportProvider";
import { IProject, IExportProviderOptions } from "../../models/applicationState";
import Guard from "../../common/guard";
import { constants } from "../../common/constants";
import HtmlFileReader from "../../common/htmlFileReader";

/**
 * @name - Vott Json Export Provider
 * @description - Exports a project into a single JSON file that include all configured assets
 */
export class VottJsonExportProvider extends ExportProvider {
    constructor(project: IProject, options: IExportProviderOptions) {
        super(project, options);
        Guard.null(options);
    }

    /**
     * Export project to VoTT JSON format
     */
    public async export(): Promise<void> {
        const results = await this.getAssetsForExport();

        await results.forEachAsync(async (assetMetadata) => {
            return new Promise<void>(async (resolve) => {
                const blob = await HtmlFileReader.getAssetBlob(assetMetadata.asset);
                const assetFilePath = `vott-json-export/${assetMetadata.asset.id}.jpg`;
                const fileReader = new FileReader();
                fileReader.onload = async () => {
                    const buffer = Buffer.from(fileReader.result as ArrayBuffer);
                    await this.storageProvider.writeBinary(assetFilePath, buffer);
                    resolve();
                };
                fileReader.readAsArrayBuffer(blob);
            });
        });

        const exportObject: any = { ...this.project };
        exportObject.assets = _.keyBy(results, (assetMetadata) => assetMetadata.asset.id);

        const fileName = `vott-json-export/${this.project.name.replace(" ", "-")}${constants.exportFileExtension}`;
        await this.storageProvider.writeText(fileName, JSON.stringify(exportObject, null, 4));
    }
}
