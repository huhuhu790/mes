import { Db, GridFSBucket, ObjectId } from "mongodb";
import { dbConnection } from "./connection";
import { Readable } from "stream";

export async function uploadFile(name: string, file: File, db: Db) {
    if (!name) throw new Error('文件名不能为空')
    const bucket = new GridFSBucket(db)
    let filename = name
    // 检查文件是否存在
    const existFile = await bucket.find({ filename }).toArray();
    if (existFile.length > 0) {
        filename = `${new Date().getTime()}_${filename}`
    }
    const uploadStream = bucket.openUploadStream(filename)
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
    return filename
}

export async function downloadFile(fileId: string) {
    const db = dbConnection()
    const bucket = new GridFSBucket(db)
    const file = await getFile(fileId, bucket)
    if (!file) throw new Error('文件不存在')
    const id = new ObjectId(file._id)
    const stream = bucket.openDownloadStream(id)
    return stream
}


export async function deleteFile(filename: string, db: Db) {
    const bucket = new GridFSBucket(db)
    const file = await getFile(filename, bucket)
    if (!file) throw new Error('文件不存在')
    await bucket.delete(new ObjectId(file._id))
}

export async function getFile(filename: string, bucket: GridFSBucket) {
    const files = await bucket.find({ filename }).toArray()
    return files[0]
}
