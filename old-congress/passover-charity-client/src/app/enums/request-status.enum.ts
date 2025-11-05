export enum RequestStatus {
    ToManager = "ממתין למנהל",
    Pending = "ממתין להשלמת מסמכים",
    Approved = "מאושר",
    Coupon = "הונפק שובר",
    Paid = "הועבר תשלום",
    Card = "הוקצה כרטיס",
    Rejected = "נדחה",
    // temp for 2024 issue
    EmailMissing = "חסר מייל",
}