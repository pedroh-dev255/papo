const crypto = require("crypto");
const path = require("path");
const { client } = require("../configs/minio");
const redis = require("../configs/redis");

const BUCKET = process.env.MINIO_BUCKET;

/**
 * Upload genérico
 */
async function upload(file, folder) {

    const ext = path.extname(file.originalname);

    const objectName =
        `${folder}/${crypto.randomUUID()}${ext}`;

    await client.putObject(
        BUCKET,
        objectName,
        file.buffer,
        file.size,
        {
            "Content-Type": file.mimetype
        }
    );

    return objectName;

}

/**
 * Avatar
 */
async function uploadAvatar(file, tenantId) {

    return upload(file, `avatars/${tenantId}`);

}

/**
 * Arquivos enviados no chat
 */
async function uploadChatFile(file, tenantId, conversationId) {

    return upload(
        file,
        `chats/${tenantId}/${conversationId}`
    );

}

/**
 * Avatar de grupo
 */
async function uploadGroupAvatar(file, tenantId, groupId) {

    return upload(
        file,
        `groups/${tenantId}/${groupId}`
    );

}

/**
 * Remove um arquivo
 */
async function deleteObject(objectName) {

    await client.removeObject(
        BUCKET,
        objectName
    );

}

/**
 * Verifica se existe
 */
async function objectExists(objectName) {

    try {

        await client.statObject(
            BUCKET,
            objectName
        );

        return true;

    } catch {

        return false;

    }

}

/**
 * URL assinada
 */
async function getSignedUrl(objectName, expires = 3600) {
    const redisUrl = await redis.get(`midiaObj:${objectName}:url`);
    
    if(redisUrl){
        return redisUrl
    }
    

    const url = await client.presignedGetObject(
        BUCKET,
        objectName,
        expires
    );

    const cacheExpires = Math.max(expires - 300, 1);

    await redis.set(
        `midiaObj:${objectName}:url`,
        url,
        "EX",
        cacheExpires,
    );
    return url

}

/**
 * Copia um arquivo
 */
async function copyObject(sourceObject, destinationObject) {

    await client.copyObject(
        BUCKET,
        destinationObject,
        `/${BUCKET}/${sourceObject}`
    );

    return destinationObject;

}

/**
 * Move um arquivo
 */
async function moveObject(sourceObject, destinationObject) {

    await copyObject(
        sourceObject,
        destinationObject
    );

    await deleteObject(sourceObject);

    return destinationObject;

}

/**
 * Faz download em stream
 */
async function getObjectStream(objectName) {

    return await client.getObject(
        BUCKET,
        objectName
    );

}

/**
 * Informações do arquivo
 */
async function getObjectInfo(objectName) {

    return await client.statObject(
        BUCKET,
        objectName
    );

}

module.exports = {

    upload,

    uploadAvatar,
    uploadChatFile,
    uploadGroupAvatar,

    deleteObject,
    objectExists,

    getSignedUrl,

    copyObject,
    moveObject,

    getObjectStream,
    getObjectInfo

};