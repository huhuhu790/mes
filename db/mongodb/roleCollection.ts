import { Filter, WithId, ObjectId } from "mongodb";
import { dbConnectionMes } from "./connection";
import { RoleItem, RoleItemWithID } from "@/types/system/role";
import { PaginationRequest } from "@/types/database";
import { User } from "@/types/system/user";
import { LocalRole } from "@/types/api";

function dbRolesToLocalRoles(dbRoles: WithId<RoleItem>[]): RoleItemWithID[] {
    return dbRoles.map(({ _id, ...rest }) => {
        return {
            id: _id.toString(),
            ...rest,
        };
    });
}


export async function getRoleByPage(options?: Partial<PaginationRequest>) {
    const db = await dbConnectionMes()
    const usersCollection = db.collection<RoleItem>('roles');
    const query: Filter<RoleItem> = {};
    if (options?.keyword) {
        query.$or = [
            { name: { $regex: options.keyword, $options: 'i' } },
            { description: { $regex: options.keyword, $options: 'i' } }
        ];
    }
    const currentPage = options?.currentPage
    const pageSize = options?.pageSize
    const total = await usersCollection.countDocuments(query);
    const roles = currentPage && pageSize ? await usersCollection.find(query)
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .toArray() : await usersCollection.find(query).toArray();
    return {
        data: dbRolesToLocalRoles(roles),
        total,
        currentPage,
        pageSize
    };
}

export async function createRoleSingle(data: LocalRole, operatorId: string) {
    if (!data.name) throw new Error("角色名称不能为空")
    const db = await dbConnectionMes()
    const date = new Date();
    const collection = db.collection<RoleItem>("roles");
    const result = await collection.insertOne({
        name: data.name,
        description: data.description || "",
        permissions: [],
        users: [],
        createdAt: date,
        updatedAt: date,
        createdBy: operatorId,
        updatedBy: operatorId,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        isActive: true
    });
    return result;
}

export async function updateRoleSingle(data: LocalRole, operatorId: string) {
    if (!data.id) throw new Error("角色ID不能为空")
    if (!data.name) throw new Error("角色名称不能为空")
    const db = await dbConnectionMes()
    const date = new Date();
    const collection = db.collection<RoleItem>("roles");
    const roleItem = await collection.findOne({ _id: new ObjectId(data.id) })
    if (!roleItem) throw new Error("角色不存在")
    const result = await collection.updateOne(
        { _id: new ObjectId(data.id) },
        {
            $set: {
                name: data.name,
                description: data.description || "",
                updatedAt: date,
                updatedBy: operatorId,
            }
        }
    );
    return result;
}

export async function updateRolePermissionById(id: string, permissions: string[], operatorId: string) {
    if (!id) throw new Error("角色ID不能为空")
    if (!permissions) throw new Error("权限不能为空")
    const db = await dbConnectionMes()
    const date = new Date();
    const collection = db.collection<RoleItem>("roles");
    const roleItem = await collection.findOne({ _id: new ObjectId(id) })
    if (!roleItem) throw new Error("角色不存在")
    const result = await collection.updateOne({ _id: new ObjectId(id) }, {
        $set: {
            permissions,
            updatedAt: date,
            updatedBy: operatorId,
        }
    });
    return result;
}
export async function deleteRoleSingle(id: string, operatorId: string) {
    if (!id) throw new Error("角色ID不能为空")
    const db = await dbConnectionMes()
    const collection = db.collection<RoleItem>("roles");
    const roleItem = await collection.findOne({ _id: new ObjectId(id) })
    if (!roleItem) throw new Error("角色不存在")
    const userList = roleItem.users
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    const userCollection = db.collection<User>("users");
    const date = new Date();
    await userCollection.updateMany({
        _id: { $in: userList.map(id => new ObjectId(id)) }
    }, {
        $pull: {
            roles: id
        },
        $set: {
            updatedAt: date,
            updatedBy: operatorId,
        }
    });
    return result;
}

export async function addUserToRoleById(id: string, userIds: string[], operatorId: string) {
    if (!id) throw new Error("角色ID不能为空")
    if (!userIds) throw new Error("用户ID不能为空")
    const db = await dbConnectionMes()
    const collection = db.collection<RoleItem>("roles");
    const roleItem = await collection.findOne({ _id: new ObjectId(id) })
    if (!roleItem) throw new Error("角色不存在")
    const date = new Date();
    await collection.updateOne({ _id: new ObjectId(id) }, {
        $addToSet: {
            users: { $each: userIds }
        },
        $set: {
            updatedAt: date,
            updatedBy: operatorId,
        }
    });
    const userCollection = db.collection<User>("users");
    await userCollection.updateMany({
        _id: { $in: userIds.map(id => new ObjectId(id)) }
    }, {
        $push: {
            roles: id
        },
        $set: {
            updatedAt: date,
            updatedBy: operatorId,
        }
    });
}

export async function removeUserFromRoleById(id: string, userIds: string[], operatorId: string) {
    if (!id) throw new Error("角色ID不能为空")
    if (!userIds) throw new Error("用户ID不能为空")
    const db = await dbConnectionMes()
    const collection = db.collection<RoleItem>("roles");
    const roleItem = await collection.findOne({ _id: new ObjectId(id) })
    if (!roleItem) throw new Error("角色不存在")
    const date = new Date();
    await collection.updateOne({ _id: new ObjectId(id) }, {
        $pull: {
            users: { $in: userIds }
        },
        $set: {
            updatedAt: date,
            updatedBy: operatorId,
        }
    });
    const userCollection = db.collection<User>("users");
    await userCollection.updateMany({
        _id: { $in: userIds.map(id => new ObjectId(id)) }
    }, {
        $pull: {
            roles: id
        },
        $set: {
            updatedAt: date,
            updatedBy: operatorId,
        }
    });
}
