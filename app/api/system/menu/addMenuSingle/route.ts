import { checkPermission } from "@/db/mongodb/userCollection";
import { ApiResponse } from "@/types/api";
import { getHeadUserData } from "@/utils/getHeadUserData";
import { NextResponse } from "next/server";
import { createSingleMenu } from "@/db/mongodb/menuCollection";
import { LocalMenu } from "@/types/api";
import { addMenuSinglePermission } from "../permission";

export async function POST(request: Request) {
    try {
        const userData = await getHeadUserData()
        const userId = await checkPermission(addMenuSinglePermission, userData)
        const data: Partial<LocalMenu> = await request.json()
        const result = await createSingleMenu(data, userId)
        // 成功响应
        const response: ApiResponse<LocalMenu> = {
            status: 200,
            success: true,
            message: '添加成功',
            data: {
                id: result.insertedId.toString(),
                parentId: data.parentId!,
                name: data.name!,
                path: data.path!,
                iconPath: data.iconPath!,
                type: data.type!,
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error(error);
        const message = (error as Error).message || '添加目录失败'
        const response: ApiResponse = {
            status: 500,
            success: false,
            message
        };
        return NextResponse.json(response);
    }
}