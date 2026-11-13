
 // api/education-application.js
 // Only a Firebase-authenticated, SMS-verified phone owner may retrieve their own course.
 import { cert, getApps, initializeApp } from "firebase-admin/app";
 import { getAuth } from "firebase-admin/auth";
 import { getFirestore } from "firebase-admin/firestore";

 function adminServices() {
   if (!getApps().length) {
     const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
     if (!raw) throw new Error("Firebase server credentials are not configured");
     initializeApp({ credential: cert(JSON.parse(raw)) });
   }
   return { auth: getAuth(), db: getFirestore() };
 }

 function koreanPhone(value) {
   const digits = String(value || "").replace(/\D/g, "");
   if (/^82(?:10\d{8}|1[16789]\d{7,8})$/.test(digits)) return `0${digits.slice(2)}`;
   if (/^01(?:0\d{8}|[16789]\d{7,8})$/.test(digits)) return digits;
   return null;
 }

 export default async function handler(req, res) {
   res.setHeader("Cache-Control", "no-store");
   res.setHeader("Vary", "Authorization");
   if (req.method !== "POST") {
     res.setHeader("Allow", "POST");
     return res.status(405).json({ error: "POST only" });
   }
   const token = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || "")?.[1];
   if (!token) return res.status(401).json({ error: "Authentication required" });

   try {
     const { auth, db } = adminServices();
     const decoded = await auth.verifyIdToken(token, true);
     // The phone must belong to the authenticated Firebase account, not the request body.
     const verifiedPhone = koreanPhone(decoded.phone_number);
     if (!verifiedPhone) {
       return res.status(403).json({ error: "Verified Korean phone number required" });
     }
     const snapshot = await db.collection("sharedData").doc("integratedApplyList").get();
     const items = snapshot.data()?.items;
     const matches = (Array.isArray(items) ? items : [])
       .filter((item) => item && item.group === "교육원" &&
         koreanPhone(item.phone) === verifiedPhone &&
         typeof item.course === "string" && item.course.trim())
       .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

     if (!matches.length) return res.status(200).json({ found: false });
     // Return only course identification; do not disclose applicant names, notes or lists.
     return res.status(200).json({
       found: true,
       course: matches[0].course.trim(),
       applicationId: String(matches[0].id ?? ""),
     });
   } catch (error) {
     console.error("education-application:", error?.code || error?.message);
     if (String(error?.code || "").startsWith("auth/")) {
       return res.status(401).json({ error: "Authentication failed" });
     }
     return res.status(500).json({ error: "Unable to verify application" });
   }
 }
