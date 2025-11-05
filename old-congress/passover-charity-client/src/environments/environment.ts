// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { UserRole } from "../../../shared/enums/user-role.enum";

export const environment = {
  production: false,
  apiServerURL: "http://localhost:3000",
  cookies: {
    authToken: {
      title: "Authorization"
    }
  },
  studentSupportAmount: 2000,
  recaptchaSiteKey: "6LeSsJgeAAAAALUULd9c1iq4eLjrsE3qi-w4A68i",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
