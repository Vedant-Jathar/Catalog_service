import { DeleteObjectCommandOutput, PutObjectCommandOutput } from "@aws-sdk/client-s3"

export interface FileData {
    filename: string
    filedata: ArrayBuffer
}

export interface FileStorage {
    upload: (data: FileData) => Promise<PutObjectCommandOutput>
    delete: (filename: string) => Promise<DeleteObjectCommandOutput>
    getObjectUri: (data: string) => void
}