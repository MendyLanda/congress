SELECT  "UserObjects"."id", "UserObjects"."firstName", "UserObjects"."lastName", "UserObjects"."projectId", SUM("PaymentObjects"."amount")
FROM "UserObjects"
JOIN "NeedyObjects" ON "NeedyObjects"."creatorId" = "UserObjects"."id"
JOIN "PaymentObjects" ON "PaymentObjects"."needyId" = "NeedyObjects"."id"
WHERE "UserObjects"."projectId" = 10
GROUP BY "UserObjects"."id", "UserObjects"."firstName", "UserObjects"."lastName"
