import * as crypto from "crypto";

export const sha512 = (x) => {
    const hash = crypto.createHash("sha512");
    hash.update(x);
    return hash.digest("hex");
}