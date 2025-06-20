import { GetRelativePathApiProps } from '@/types/projects/auditTestProgramme';
import { existsSync, promises } from 'fs';
import { join } from 'path';
const tmpPath = process.env.TEST_PROGRAMME_TMP_PATH!
const basePath = process.env.TEST_PROGRAMME_BASE_PATH!
const backupBasePath = process.env.TEST_PROGRAMME_BASE_PATH_BACKUP!

export function checkFileExists(fileName: string) {
    return checkPathExists(fileName, tmpPath);
}

export function checkFileExistsOrigin(fileName: string) {
    return checkPathExists(fileName, basePath);
}

function checkPathExists(filename: string, basePath: string) {
    const path = join(basePath, filename);
    console.log(path);
    
    if (!existsSync(path)) {
        throw new Error(`路径不存在: ${filename}`);
    }
    return path;
}

async function moveFileToTargetPath(from: string, to: string, fileName: string, newFileName?: string) {
    const fromPath = join(from, fileName);

    const destinationPath = join(to, newFileName || fileName);

    // 确保目标文件夹存在，不存在则创建
    if (!existsSync(to)) {
        await promises.mkdir(to, { recursive: true });
    }
    // 确保原文件存在
    if (!existsSync(fromPath)) {
        throw new Error(`原文件不存在: ${fileName}`);
    }
    // 确保目标文件不存在重名
    if (existsSync(destinationPath)) {
        throw new Error(`目标文件已存在: ${destinationPath}`);
    }


    console.log(`开始移动文件: ${fromPath} -> ${destinationPath}`);

    try {
        // 移动文件到目标路径
        await promises.rename(fromPath, destinationPath);
    } catch (error) {
        console.error(error);
        const message = (error as Error).message || '移动文件失败'
        throw new Error(message);
    }
}

export async function moveFileFromTmpToTargetPath(targetPath: string, fileName: string) {
    const realTargetPath = join(basePath, targetPath);
    // 将生成唯一的文件名修改为原本文件名
    const originalFileName = fileName.split('-').slice(1).join('-');
    await moveFileToTargetPath(tmpPath, realTargetPath, fileName, originalFileName);
    return originalFileName
}

export async function moveFileFromOriginToBackupPath(originPath: string, backupPath: string, fileName: string) {
    const realBackupPath = join(backupBasePath, backupPath);
    const realOriginPath = join(basePath, originPath);
    await moveFileToTargetPath(realOriginPath, realBackupPath, fileName);
}

export async function deleteFile(fileName: string) {
    const filePath = checkFileExists(fileName);
    if (!filePath) return;
    try {
        await promises.unlink(filePath);
    } catch (error) {
        console.error(error);
        const message = (error as Error).message || '删除文件失败'
        throw new Error(message);
    }
}

// 读取目录下的所有子目录
async function getSubDirs(relative: string, path: string, needFile: boolean = false) {
    const basePath = join(relative, path);
    if (!existsSync(basePath)) {
        throw new Error(`路径不存在: ${path}`);
    }
    if (!promises.stat(basePath).then(stat => stat.isDirectory())) {
        throw new Error(`路径不是目录: ${path}`);
    }
    // 读取目录下的所有子目录
    const files = await promises.readdir(basePath);
    const subDirs = [];
    for (const file of files) {
        const filePath = join(basePath, file);
        const stat = await promises.stat(filePath);
        const relativePath = filePath.replaceAll("\\", "/").replace(relative, '');
        if (stat.isDirectory()) {
            subDirs.push({
                type: 'folder',
                name: relativePath
            });
        } else if (needFile && stat.isFile()) {
            subDirs.push({
                type: 'file',
                name: relativePath
            });
        }
    }
    return subDirs;
}

export async function getRelativePath({ path, type }: GetRelativePathApiProps) {
    switch (type) {
        case 'save':
            return await getSubDirs(basePath, path, true)
        case 'savePath':
            return await getSubDirs(basePath, path);
        case 'backup':
            return await getSubDirs(backupBasePath, path);
        default:
            throw new Error('无效的路径类型');
    }
}