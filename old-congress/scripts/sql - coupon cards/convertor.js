const fs = require("fs");

// const _file = fs.readFileSync("2023.json", { encoding: "utf-8" });
const file = require("./cards_2025.json")
// const file = JSON.parse(_file);
const PROJECT_ID = 26;

const data = file.map((c, i) => ({
    ...c,
    cardId: +c.cardId,
    id: i + 18001,
}))


// IMPORTANT: NEED TO CHANGE ID TO cardId AND ADD projectId

const sql = data.reduce((str, curr) => {
    str += `INSERT INTO "public"."CouponCardObjects" ("id", "cardId", "serialNumber", "value", "projectId", "createdAt", "updatedAt") VALUES (${curr.id}, ${curr.cardId}, ${curr.serialNumber}, ${curr.value}, ${PROJECT_ID}, '2025-03-31 12:00:19', '2025-03-31 12:00:19');\n`;
    return str;
}, "")


fs.writeFileSync("cards_sql_2025.sql",sql, { encoding: "utf-8" });
