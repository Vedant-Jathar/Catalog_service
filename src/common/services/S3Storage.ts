import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { FileData, FileStorage } from "../types/storage";
import config from "config"
import createHttpError from "http-errors";

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

    getObjectUri = (filename: string) => {
        // https://pizza-delivery-app-mern.s3.eu-north-1.amazonaws.com/9665fa3a-c1e6-4cfc-9e5c-b0c6baf17621z

        const bucket = config.get("aws.bucket")
        const region = config.get("aws.region")

        if (typeof bucket === "string" && typeof region === "string") {
            return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`
        }

        throw createHttpError(400, "Invalid  storage config")
    }
}