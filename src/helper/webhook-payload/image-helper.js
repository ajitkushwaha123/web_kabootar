import axios from "axios";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // ✅ Initialize S3 Client once
});

/**
 * 1️⃣ Get WhatsApp media metadata (temporary URL + mime type)
 */
export const getWhatsAppMediaMeta = async (mediaId) => {
  const baseUrl =
    process.env.META_BASE_API_URL || "https://graph.facebook.com/v23.0";
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!mediaId) throw new Error("Media ID is required");
  if (!accessToken) throw new Error("Missing META_ACCESS_TOKEN");

  const res = await axios.get(`${baseUrl}/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.data?.url) {
    throw new Error("No media URL found in metadata response");
  }

  return {
    url: res.data.url,
    mime_type: res.data.mime_type,
  };
};

export const downloadWhatsAppMedia = async (url) => {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: "arraybuffer",
  });
  return Buffer.from(res.data, "binary");
};

/**
 * 3️⃣ Upload media to S3 and return permanent URL
 */
export const uploadToS3 = async (buffer, mimeType, keyPrefix, mediaId) => {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) throw new Error("Missing S3_BUCKET_NAME");

  const extension = mimeType?.split("/")[1] || "bin";
  const key = `${keyPrefix}/${mediaId}.${extension}`;

  const uploadRes = await s3
    .upload({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
    .promise();

  return uploadRes.Location;
};

export const getMediaUrl = async (mediaId, mimeType, folder = "whatsapp") => {
  try {
    const baseUrl =
      process.env.META_BASE_API_URL || "https://graph.facebook.com/v23.0";
    const accessToken = process.env.META_ACCESS_TOKEN;
    const bucket = process.env.S3_BUCKET_NAME;

    if (!mediaId) throw new Error("Media ID is required");
    if (!accessToken) throw new Error("Missing META_ACCESS_TOKEN");
    if (!bucket) throw new Error("Missing S3_BUCKET_NAME");

    // ✅ Step 1: Get temporary WhatsApp URL
    const metaRes = await axios.get(`${baseUrl}/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { url } = metaRes.data || {};
    if (!url) throw new Error("No media URL found in metadata response");

    // ✅ Step 2: Download binary data
    const fileRes = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(fileRes.data, "binary");

    // ✅ Step 3: Upload to S3
    const extension = mimeType?.split("/")[1] || "bin";
    const key = `${folder}/${mediaId}.${extension}`;

    const uploadRes = await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
      .promise();

    console.log(`✅ Uploaded ${folder} to S3:`, uploadRes.Location);

    return uploadRes.Location;
  } catch (err) {
    console.error("❌ Error fetching/uploading media:", err.message);
    throw err;
  }
};
