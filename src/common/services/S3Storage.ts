import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { FileData, FileStorage } from "../types/storage";
import config from "config"

export class S3Storage implements FileStorage {
    private client: S3Client

    constructor() {
        this.client = new S3Client({
            region: config.get("aws.region"),
            credentials: {
                accessKeyId: config.get("aws.accessKeyId"),
                secretAccessKey: config.get("aws.secretAccessKey")
            }
        })
    }

    upload = async (data: FileData) => {
        const objectParams = {
            Bucket: config.get("aws.bucket"),
            Key: data.filename,
            Body: data.filedata
        }

        // @ts-ignore
        return await this.client.send(new PutObjectCommand(objectParams))

    };

    delete = async (filename: string) => {
        const objectParams = {
            Bucket: config.get("aws.bucket"),
            Key: filename
        }

        // @ts-ignore
        return await this.client.send(new DeleteObjectCommand(objectParams))
    }

    getObjectUri: (data: string) => void

}