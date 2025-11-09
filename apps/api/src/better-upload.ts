// when using a separate backend server, make sure to update the `api` option on the client hooks.
import type { Router } from "@better-upload/server";
import { route } from "@better-upload/server";
import { aws } from "@better-upload/server/clients";

export const betterUploadRouter: Router = {
  client: aws(),
  bucketName: "my-bucket",
  routes: {
    images: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 4,
    }),
  },
};

export { handleRequest as handleBetterUploadRequest } from "@better-upload/server";
