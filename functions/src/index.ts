import { logger } from "firebase-functions";
import { onObjectFinalized } from "firebase-functions/v2/storage";

export const onRecordingFinalize = onObjectFinalized(
  {
    region: "europe-west1",
    memory: "256MiB",
  },
  async (event) => {
    logger.info("Storage finalize skeleton", {
      name: event.data.name,
      bucket: event.data.bucket,
      contentType: event.data.contentType,
    });
  }
);
