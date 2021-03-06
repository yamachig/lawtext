import webpack from "webpack";
import JSZip from "jszip";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import fsExtra from "fs-extra";

async function *iterDirTree(dir: string, ignore: string[] = []): AsyncGenerator<string> {
    for (const item of await promisify(fs.readdir)(dir, { withFileTypes: true })) {
        const itemStr = path.join(dir, item.name);
        if (ignore.includes(itemStr)) continue;
        if (item.isDirectory()) yield* iterDirTree(itemStr, ignore);
        if (item.isFile()) yield itemStr;
    }
}

export default class CreateAppZipPlugin {
    public apply(compiler: webpack.Compiler): void {
        compiler.hooks.afterEmit.tapPromise("CreateAppZipPlugin", async () => {
            const relAppPath = path.join("media", "Lawtext-app.zip");
            const ignore = [
                "data",
                relAppPath,
            ].map(p => path.join(compiler.outputPath, p));

            console.info(`Creating ${relAppPath} ...`);

            const zip = new JSZip();
            for await (const file of iterDirTree(compiler.outputPath, ignore)) {
                const relPath = path.relative(compiler.outputPath, file);
                const buf = await promisify(fs.readFile)(file);
                console.info(`   Add ${relPath} (${buf.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} bytes) ...`);
                zip.file(relPath, buf);
            }
            const buf = await zip.generateAsync({
                type: "nodebuffer",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 9,
                },
            });

            const absAppPath = path.join(compiler.outputPath, relAppPath);
            await promisify(fsExtra.ensureDir)(path.dirname(absAppPath));
            await promisify(fs.writeFile)(absAppPath, buf);

            console.info(`Created ${relAppPath} (${buf.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} bytes)`);
        });
    }
}
