const Minio = require("minio");
require("dotenv").config();

const client = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_API_PORT),
    useSSL: process.env.MINIO_SSL === "true",
    bucket: process.env.MINIO_BUCKET,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD,
});

async function connectMinio() {
    try {

        await client.listBuckets();

        console.log("🟢 MinIO conectado");

        const exists = await client.bucketExists(process.env.MINIO_BUCKET);

        if (!exists) {
            throw new Error(`Bucket ${process.env.MINIO_BUCKET} não encontrado.`);
        }
        console.log(`🟢 Bucket ${process.env.MINIO_BUCKET} OK`);

    } catch (err) {

        console.error("🔴 Erro ao conectar ao MinIO");
        console.error(err);

        process.exit(1);

    }
}

module.exports = {
    client,
    connectMinio
};