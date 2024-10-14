import ImageUploader from "quill-image-uploader";
import ImageCompress from "quill-image-compress";
import MagicUrl from "quill-magic-url";
import BlotFormatter from "quill-blot-formatter/dist/BlotFormatter";
import { ImageDrop } from "quill-image-drop-module";

import "quill-image-uploader/dist/quill.imageUploader.min.css";

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      ImageUploader: ImageUploader,
      ImageCompress: ImageCompress,
      MagicUrl: MagicUrl,
      BlotFormatter: BlotFormatter,
      ImageDrop: ImageDrop,
    },
  };
});
