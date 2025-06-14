import { checkPermission } from "@/db/mongodb/userCollection";
import { getHeadUserData } from "@/utils/getHeadUserData";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { updateOneAuditTestProgrammePermission } from "../permission";
import { LocalAuditTestProgramme } from "@/types/projects/auditTestProgramme";
import { updateOneAuditTestProgramme } from "@/db/mongodb/auditTestProgrammeCollection";
import { checkFileExists, deleteFile, checkFileExistsOrigin } from "@/utils/fileOperations";
import { buildResponse } from "@/utils/buildResponse";
import { checkProps } from "@/utils/checkProps";
import { join } from "path";

export async function POST(request: NextRequest) {
    try {
        const headersList = await headers()
        const userData = await getHeadUserData(headersList);
        const userId = await checkPermission(updateOneAuditTestProgrammePermission, userData)
        const data: LocalAuditTestProgramme = await request.json()
        checkProps(data, ['id', 'newFileName', 'originFileName', 'name', 'originFilePath', 'newFilePath', 'backupPath']);
        try {
            checkFileExistsOrigin(join(data.originFilePath, data.originFileName));
            checkFileExists(data.newFileName);
            await updateOneAuditTestProgramme(data, userId)
        } catch (error) {
            await deleteFile(data.newFileName);
            throw error;
        }

        return buildResponse({
            status: 200,
            message: '更新成功',
        });
    } catch (error) {
        console.error(error);
        const message = (error as Error).message || '更新失败'
        return buildResponse({
            status: 400,
            message
        });
    }
}  