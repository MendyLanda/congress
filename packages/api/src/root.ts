import { authRouter } from "./router/auth";
import { beneficiaryAuthRouter } from "./router/beneficiary-auth";
import { locationRouter } from "./router/location";
import { postRouter } from "./router/post";
import { uploadRouter } from "./router/upload";
import { publicProcedure } from "./orpc";

export const appRouter = {
  auth: authRouter,
  beneficiaryAuth: beneficiaryAuthRouter,
  location: locationRouter,
  post: postRouter,
  health: publicProcedure({ captcha: false }).handler(() => {
    return "ok";
  }),
  upload: uploadRouter,
};

export type AppRouter = typeof appRouter;
