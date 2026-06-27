import os
import re
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
import io
import json

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "matrimonial")
JWT_SECRET = os.environ.get("JWT_SECRET", "rvr_luxury_matrimony_secret_key_2024")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@rvrluxury.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@123456")

app = FastAPI(title="RVR Luxury Matrimony Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
admins_col = db["admins"]
users_col = db["users"]
profiles_col = db["profiles"]
subscriptions_col = db["subscriptions"]
profile_boosts_col = db["profileboosts"]
matches_col = db["successfulmatches"]
reported_profiles_col = db["reportedprofiles"]
notifications_col = db["notifications"]
contact_us_col = db["contactus"]


def serialize_doc(doc):
    if doc is None:
        return None
    doc = dict(doc)
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
        elif isinstance(v, datetime):
            doc[k] = v.isoformat()
        elif isinstance(v, dict):
            doc[k] = serialize_doc(v)
        elif isinstance(v, list):
            doc[k] = [serialize_doc(i) if isinstance(i, dict) else str(i) if isinstance(i, ObjectId) else i.isoformat() if isinstance(i, datetime) else i for i in v]
    return doc


async def get_admin_from_token(request: Request):
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token, Admin access denied")
    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if decoded.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Access denied. Not an Admin.")
        admin = await admins_col.find_one({"_id": ObjectId(decoded["id"])})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin account no longer exists.")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.InvalidTokenError, Exception):
        raise HTTPException(status_code=401, detail="Not authorized, token failed")


# --- Seed admin on startup ---
@app.on_event("startup")
async def seed_admin():
    existing = await admins_col.find_one({"email": ADMIN_EMAIL})
    if not existing:
        hashed = bcrypt.hashpw(ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt())
        await admins_col.insert_one({
            "name": "Super Admin",
            "email": ADMIN_EMAIL,
            "password": hashed.decode("utf-8"),
            "role": "admin",
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        })
        print(f"Admin seeded: {ADMIN_EMAIL}")

    # Ensure indexes for successfulmatches
    await matches_col.create_index("createdAt")
    await reported_profiles_col.create_index("createdAt")


# ===================== AUTH ROUTES =====================

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminRegisterRequest(BaseModel):
    name: str
    email: str
    password: str


@app.post("/api/admin/login")
async def admin_login(req: AdminLoginRequest):
    admin = await admins_col.find_one({"email": req.email})
    if not admin:
        return JSONResponse(status_code=401, content={"success": False, "message": "Invalid Admin Credentials"})
    stored_password = admin["password"]
    if isinstance(stored_password, str):
        stored_password = stored_password.encode("utf-8")
    if not bcrypt.checkpw(req.password.encode("utf-8"), stored_password):
        return JSONResponse(status_code=401, content={"success": False, "message": "Invalid Admin Credentials"})
    token = jwt.encode(
        {"id": str(admin["_id"]), "role": "admin", "exp": datetime.now(timezone.utc) + timedelta(days=1)},
        JWT_SECRET, algorithm="HS256"
    )
    return {"success": True, "token": token, "admin": {"id": str(admin["_id"]), "name": admin["name"], "role": "admin"}}


@app.post("/api/admin/register")
async def admin_register(req: AdminRegisterRequest):
    existing = await admins_col.find_one({"email": req.email})
    if existing:
        return JSONResponse(status_code=409, content={"success": False, "message": "Admin already exists with this email"})
    hashed = bcrypt.hashpw(req.password.encode("utf-8"), bcrypt.gensalt())
    result = await admins_col.insert_one({
        "name": req.name, "email": req.email, "password": hashed.decode("utf-8"),
        "role": "admin", "createdAt": datetime.now(timezone.utc), "updatedAt": datetime.now(timezone.utc),
    })
    return {"success": True, "message": "Admin registered successfully",
            "admin": {"id": str(result.inserted_id), "name": req.name, "email": req.email, "role": "admin"}}


@app.get("/api/admin/token-status")
async def check_token_status(request: Request):
    auth_header = request.headers.get("authorization", "")
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else None
    if not token:
        return {"success": False, "valid": False, "expired": False, "message": "Authorization token is required"}
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if decoded.get("role") != "admin":
            return {"success": True, "valid": False, "expired": False, "message": "Token is not an admin token"}
        admin = await admins_col.find_one({"_id": ObjectId(decoded["id"])}, {"_id": 1, "role": 1})
        if not admin:
            return {"success": True, "valid": False, "expired": False, "message": "Admin account no longer exists"}
        return {"success": True, "valid": True, "expired": False, "adminId": str(admin["_id"]),
                "role": admin.get("role", "admin"), "expiresAt": datetime.fromtimestamp(decoded["exp"], tz=timezone.utc).isoformat() if decoded.get("exp") else None}
    except jwt.ExpiredSignatureError:
        return {"success": True, "valid": False, "expired": True, "role": "admin", "message": "Token expired"}
    except Exception:
        return {"success": True, "valid": False, "expired": False, "message": "Invalid token"}


# ===================== ENHANCED STATS =====================

@app.get("/api/admin/stats")
async def get_admin_stats(admin=Depends(get_admin_from_token)):
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Parallel queries
    total_users = await users_col.count_documents({})

    # Active users in last 30 days (accounts with status active + approved profile)
    active_pipeline = [
        {"$match": {"accountStatus": "active"}},
        {"$lookup": {"from": "profiles", "localField": "_id", "foreignField": "userId", "as": "profile"}},
        {"$match": {"profile.adminStatus": "approved"}},
        {"$count": "total"}
    ]
    active_result = await users_col.aggregate(active_pipeline).to_list(1)
    active_users = active_result[0]["total"] if active_result else 0

    # Premium members breakdown by membershipType
    membership_pipeline = [
        {"$group": {"_id": "$membershipType", "count": {"$sum": 1}}}
    ]
    membership_result = await profiles_col.aggregate(membership_pipeline).to_list(100)
    membership_counts = {item["_id"]: item["count"] for item in membership_result if item["_id"]}

    # Boost counts by planType
    boost_pipeline = [
        {"$match": {"status": "Success"}},
        {"$group": {"_id": "$planType", "count": {"$sum": 1}}}
    ]
    boost_result = await profile_boosts_col.aggregate(boost_pipeline).to_list(100)
    boost_counts = {item["_id"]: item["count"] for item in boost_result if item["_id"]}

    # Gender ratio
    gender_pipeline = [
        {"$match": {"gender": {"$in": ["Male", "Female"]}}},
        {"$group": {"_id": "$gender", "count": {"$sum": 1}}}
    ]
    gender_result = await profiles_col.aggregate(gender_pipeline).to_list(10)
    gender_counts = {item["_id"]: item["count"] for item in gender_result}

    # Today's registrations
    todays_registrations = await users_col.count_documents({"createdAt": {"$gte": today_start}})

    # Successful matches count
    total_matches = await matches_col.count_documents({})

    # Revenue: subscriptions
    sub_revenue_pipeline = [
        {"$match": {"paymentStatus": "completed", "planName": {"$in": ["Gold", "Premium"]}}},
        {"$group": {"_id": "$planName", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    sub_revenue = await subscriptions_col.aggregate(sub_revenue_pipeline).to_list(10)
    revenue_by_plan = {item["_id"]: {"revenue": item["total"], "count": item["count"]} for item in sub_revenue}

    # Revenue: boosts
    boost_revenue_pipeline = [
        {"$match": {"status": "Success"}},
        {"$group": {"_id": "$planType", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    boost_revenue = await profile_boosts_col.aggregate(boost_revenue_pipeline).to_list(10)
    revenue_by_boost = {item["_id"]: {"revenue": item["total"], "count": item["count"]} for item in boost_revenue}

    total_sub_revenue = sum(item.get("revenue", 0) for item in revenue_by_plan.values())
    total_boost_revenue = sum(item.get("revenue", 0) for item in revenue_by_boost.values())

    # Pending verification count
    pending_verification = await profiles_col.count_documents({"adminStatus": "pending"})

    # Reported profiles count
    reported_profiles = await reported_profiles_col.count_documents({"status": {"$ne": "resolved"}})

    # Paid users (unique)
    paid_sub_ids = await subscriptions_col.distinct("userId", {"planName": {"$in": ["Gold", "Premium"]}, "paymentStatus": "completed"})
    paid_boost_ids = await profile_boosts_col.distinct("userId", {"status": "Success"})
    paid_users = len(set(str(i) for i in paid_sub_ids) | set(str(i) for i in paid_boost_ids))

    return {
        "success": True,
        "data": {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "paidUsers": paid_users,
            "totalRevenue": total_sub_revenue + total_boost_revenue,
            "premiumMembers": {
                "Gold": membership_counts.get("Gold", 0),
                "Premium": membership_counts.get("Premium", 0),
                "Free": membership_counts.get("Free", 0),
            },
            "boostCounts": {
                "24 Hours": boost_counts.get("24 Hours", 0),
                "3 Days": boost_counts.get("3 Days", 0),
                "7 Days": boost_counts.get("7 Days", 0),
            },
            "genderRatio": {
                "Male": gender_counts.get("Male", 0),
                "Female": gender_counts.get("Female", 0),
            },
            "todaysRegistrations": todays_registrations,
            "successfulMatches": total_matches,
            "revenueBreakdown": {
                "subscriptions": total_sub_revenue,
                "boostProfiles": total_boost_revenue,
                "byPlan": {
                    "Gold": revenue_by_plan.get("Gold", {"revenue": 0, "count": 0}),
                    "Premium": revenue_by_plan.get("Premium", {"revenue": 0, "count": 0}),
                },
                "byBoost": {
                    "24 Hours": revenue_by_boost.get("24 Hours", {"revenue": 0, "count": 0}),
                    "3 Days": revenue_by_boost.get("3 Days", {"revenue": 0, "count": 0}),
                    "7 Days": revenue_by_boost.get("7 Days", {"revenue": 0, "count": 0}),
                }
            },
            "pendingVerification": pending_verification,
            "reportedProfiles": reported_profiles,
        }
    }


# ===================== USERS =====================

@app.get("/api/admin/users")
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query("", alias="search"),
    status: str = Query(""),
    approveStatus: str = Query(""),
    membershipType: str = Query(""),
    gender: str = Query(""),
    admin=Depends(get_admin_from_token)
):
    skip = (page - 1) * limit
    query = {"isVerified": True}
    profile_filters = {}

    if status:
        query["accountStatus"] = status
    if approveStatus:
        profile_filters["adminStatus"] = approveStatus
    if membershipType:
        profile_filters["membershipType"] = membershipType
    if gender:
        profile_filters["gender"] = gender

    if profile_filters:
        filtered_profiles = await profiles_col.find(profile_filters, {"userId": 1}).to_list(None)
        filtered_user_ids = [p["userId"] for p in filtered_profiles]
        if not filtered_user_ids:
            return {"success": True, "count": 0, "totalUsers": 0, "totalPages": 0, "currentPage": page, "data": []}
        query["_id"] = {"$in": filtered_user_ids}

    if search and search.strip():
        search_regex = {"$regex": search.strip(), "$options": "i"}
        profile_search_q = {"fullName": search_regex}
        if "_id" in query:
            profile_search_q["userId"] = query["_id"]
        matched = await profiles_col.find(profile_search_q, {"userId": 1}).to_list(None)
        matched_ids = [p["userId"] for p in matched]
        or_conditions = [{"email": search_regex}, {"phone": search_regex}]
        if matched_ids:
            or_conditions.append({"_id": {"$in": matched_ids}})
        query["$or"] = or_conditions

    users = await users_col.find(query, {"otp": 0, "otpExpires": 0, "lastOtpSentAt": 0}).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await users_col.count_documents(query)

    results = []
    for user in users:
        profile = await profiles_col.find_one({"userId": user["_id"]})
        results.append({"account": serialize_doc(user), "profile": serialize_doc(profile) if profile else "No profile created yet"})

    return {
        "success": True,
        "count": len(results),
        "totalUsers": total,
        "totalPages": max(1, -(-total // limit)),
        "currentPage": page,
        "data": results,
    }


@app.get("/api/admin/user-details/{user_id}")
async def get_user_details(user_id: str, admin=Depends(get_admin_from_token)):
    user = await users_col.find_one({"_id": ObjectId(user_id)}, {"otp": 0, "otpExpires": 0, "lastOtpSentAt": 0})
    if not user:
        return JSONResponse(status_code=404, content={"success": False, "message": "User not found"})
    profile = await profiles_col.find_one({"userId": user["_id"]})
    subs = await subscriptions_col.find({"userId": user["_id"]}).sort("createdAt", -1).to_list(None)
    boosts = await profile_boosts_col.find({"userId": user["_id"]}).sort("createdAt", -1).to_list(None)
    return {"success": True, "data": {
        "account": serialize_doc(user),
        "profile": serialize_doc(profile) if profile else "Profile not created yet",
        "subscriptions": [serialize_doc(s) for s in subs],
        "boosts": [serialize_doc(b) for b in boosts],
    }}


@app.get("/api/admin/user-details/profile/{profile_id}")
async def get_user_details_by_profile(profile_id: str, admin=Depends(get_admin_from_token)):
    profile = await profiles_col.find_one({"_id": ObjectId(profile_id)})
    if not profile:
        return JSONResponse(status_code=404, content={"success": False, "message": "Profile not found"})
    user = await users_col.find_one({"_id": profile["userId"]}, {"otp": 0, "otpExpires": 0, "lastOtpSentAt": 0})
    if not user:
        return JSONResponse(status_code=404, content={"success": False, "message": "User not found for this profile"})
    subs = await subscriptions_col.find({"userId": profile["userId"]}).sort("createdAt", -1).to_list(None)
    boosts = await profile_boosts_col.find({"userId": profile["userId"]}).sort("createdAt", -1).to_list(None)
    return {"success": True, "data": {
        "account": serialize_doc(user), "profile": serialize_doc(profile),
        "subscriptions": [serialize_doc(s) for s in subs], "boosts": [serialize_doc(b) for b in boosts],
    }}


# ===================== VERIFY PROFILE =====================

class VerifyProfileRequest(BaseModel):
    status: str
    remarks: str = ""

@app.put("/api/admin/verify-profile/{profile_id}")
async def verify_profile(profile_id: str, req: VerifyProfileRequest, admin=Depends(get_admin_from_token)):
    if req.status not in ["approved", "rejected"]:
        return JSONResponse(status_code=400, content={"success": False, "message": "Invalid status value"})
    result = await profiles_col.find_one_and_update(
        {"_id": ObjectId(profile_id)},
        {"$set": {"adminStatus": req.status, "adminRemarks": req.remarks if req.status == "rejected" else ""}},
        return_document=True
    )
    if not result:
        return JSONResponse(status_code=404, content={"success": False, "message": "Profile not found"})
    await notifications_col.insert_one({
        "recipientId": result["userId"],
        "type": "verification_reminder",
        "title": "Profile Approved!" if req.status == "approved" else "Profile Rejected",
        "message": "Congratulations! Your profile is now live." if req.status == "approved" else f"Your profile was rejected. Reason: {req.remarks}",
        "isRead": False, "createdAt": datetime.now(timezone.utc), "updatedAt": datetime.now(timezone.utc),
    })
    return {"success": True, "message": f"Profile has been {req.status} successfully", "data": serialize_doc(result)}


# ===================== ACCOUNT STATUS =====================

class AccountStatusRequest(BaseModel):
    accountStatus: str

@app.put("/api/admin/users/{user_id}/account-status")
async def update_account_status(user_id: str, req: AccountStatusRequest, admin=Depends(get_admin_from_token)):
    allowed = ["pending", "active", "suspended", "deleted"]
    if req.accountStatus not in allowed:
        return JSONResponse(status_code=400, content={"success": False, "message": f"Invalid accountStatus. Allowed: {', '.join(allowed)}"})
    user = await users_col.find_one_and_update(
        {"_id": ObjectId(user_id)}, {"$set": {"accountStatus": req.accountStatus}}, return_document=True
    )
    if not user:
        return JSONResponse(status_code=404, content={"success": False, "message": "User not found"})
    return {"success": True, "message": "User account status updated successfully", "data": serialize_doc(user)}


# ===================== SUCCESSFUL MATCHES =====================

class MatchRequest(BaseModel):
    brideProfileId: str
    groomProfileId: str
    matchDate: Optional[str] = None
    status: str = "confirmed"
    notes: str = ""

@app.post("/api/admin/matches")
async def create_match(req: MatchRequest, admin=Depends(get_admin_from_token)):
    bride = await profiles_col.find_one({"_id": ObjectId(req.brideProfileId)})
    groom = await profiles_col.find_one({"_id": ObjectId(req.groomProfileId)})
    if not bride:
        return JSONResponse(status_code=404, content={"success": False, "message": "Bride profile not found"})
    if not groom:
        return JSONResponse(status_code=404, content={"success": False, "message": "Groom profile not found"})

    match_date = datetime.fromisoformat(req.matchDate) if req.matchDate else datetime.now(timezone.utc)

    match_doc = {
        "brideProfileId": ObjectId(req.brideProfileId),
        "groomProfileId": ObjectId(req.groomProfileId),
        "brideName": bride.get("fullName", "Unknown"),
        "groomName": groom.get("fullName", "Unknown"),
        "bridePhoto": bride.get("profilePhotos", [{}])[0].get("url", "") if bride.get("profilePhotos") else "",
        "groomPhoto": groom.get("profilePhotos", [{}])[0].get("url", "") if groom.get("profilePhotos") else "",
        "matchDate": match_date,
        "status": req.status,
        "notes": req.notes,
        "createdBy": str(admin["_id"]),
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = await matches_col.insert_one(match_doc)
    match_doc["_id"] = result.inserted_id
    return {"success": True, "message": "Match created successfully", "data": serialize_doc(match_doc)}


@app.get("/api/admin/matches")
async def get_matches(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(""),
    status: str = Query(""),
    admin=Depends(get_admin_from_token)
):
    skip = (page - 1) * limit
    query = {}
    if status:
        query["status"] = status
    if search and search.strip():
        search_regex = {"$regex": search.strip(), "$options": "i"}
        query["$or"] = [{"brideName": search_regex}, {"groomName": search_regex}, {"notes": search_regex}]
    matches = await matches_col.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await matches_col.count_documents(query)
    return {
        "success": True, "count": len(matches), "totalMatches": total,
        "totalPages": max(1, -(-total // limit)), "currentPage": page,
        "data": [serialize_doc(m) for m in matches],
    }


@app.put("/api/admin/matches/{match_id}")
async def update_match(match_id: str, request: Request, admin=Depends(get_admin_from_token)):
    body = await request.json()
    update_data = {}
    if "status" in body:
        update_data["status"] = body["status"]
    if "notes" in body:
        update_data["notes"] = body["notes"]
    if "matchDate" in body:
        update_data["matchDate"] = datetime.fromisoformat(body["matchDate"])
    update_data["updatedAt"] = datetime.now(timezone.utc)
    result = await matches_col.find_one_and_update(
        {"_id": ObjectId(match_id)}, {"$set": update_data}, return_document=True
    )
    if not result:
        return JSONResponse(status_code=404, content={"success": False, "message": "Match not found"})
    return {"success": True, "message": "Match updated", "data": serialize_doc(result)}


@app.delete("/api/admin/matches/{match_id}")
async def delete_match(match_id: str, admin=Depends(get_admin_from_token)):
    result = await matches_col.delete_one({"_id": ObjectId(match_id)})
    if result.deleted_count == 0:
        return JSONResponse(status_code=404, content={"success": False, "message": "Match not found"})
    return {"success": True, "message": "Match deleted"}


# ===================== PENDING VERIFICATION =====================

@app.get("/api/admin/pending-verification")
async def get_pending_verification(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(""),
    admin=Depends(get_admin_from_token)
):
    skip = (page - 1) * limit
    query = {"adminStatus": "pending"}
    if search and search.strip():
        query["fullName"] = {"$regex": search.strip(), "$options": "i"}
    profiles = await profiles_col.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await profiles_col.count_documents(query)
    results = []
    for p in profiles:
        user = await users_col.find_one({"_id": p["userId"]}, {"otp": 0, "otpExpires": 0})
        results.append({"profile": serialize_doc(p), "account": serialize_doc(user) if user else None})
    return {
        "success": True, "count": len(results), "total": total,
        "totalPages": max(1, -(-total // limit)), "currentPage": page, "data": results,
    }


# ===================== REPORTED PROFILES =====================

class ReportProfileRequest(BaseModel):
    reportedProfileId: str
    reportedBy: str = ""
    reason: str
    description: str = ""

@app.post("/api/admin/reported-profiles")
async def create_report(req: ReportProfileRequest, admin=Depends(get_admin_from_token)):
    profile = await profiles_col.find_one({"_id": ObjectId(req.reportedProfileId)})
    if not profile:
        return JSONResponse(status_code=404, content={"success": False, "message": "Profile not found"})
    report = {
        "reportedProfileId": ObjectId(req.reportedProfileId),
        "reportedName": profile.get("fullName", "Unknown"),
        "reportedPhoto": profile.get("profilePhotos", [{}])[0].get("url", "") if profile.get("profilePhotos") else "",
        "reportedBy": req.reportedBy,
        "reason": req.reason,
        "description": req.description,
        "status": "pending",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = await reported_profiles_col.insert_one(report)
    report["_id"] = result.inserted_id
    return {"success": True, "message": "Report created", "data": serialize_doc(report)}


@app.get("/api/admin/reported-profiles")
async def get_reported_profiles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(""),
    status: str = Query(""),
    admin=Depends(get_admin_from_token)
):
    skip = (page - 1) * limit
    query = {}
    if status:
        query["status"] = status
    if search and search.strip():
        query["reportedName"] = {"$regex": search.strip(), "$options": "i"}
    reports = await reported_profiles_col.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await reported_profiles_col.count_documents(query)
    return {
        "success": True, "count": len(reports), "total": total,
        "totalPages": max(1, -(-total // limit)), "currentPage": page,
        "data": [serialize_doc(r) for r in reports],
    }


@app.put("/api/admin/reported-profiles/{report_id}")
async def update_report_status(report_id: str, request: Request, admin=Depends(get_admin_from_token)):
    body = await request.json()
    update = {"updatedAt": datetime.now(timezone.utc)}
    if "status" in body:
        update["status"] = body["status"]
    if "adminNotes" in body:
        update["adminNotes"] = body["adminNotes"]
    result = await reported_profiles_col.find_one_and_update(
        {"_id": ObjectId(report_id)}, {"$set": update}, return_document=True
    )
    if not result:
        return JSONResponse(status_code=404, content={"success": False, "message": "Report not found"})
    return {"success": True, "message": "Report updated", "data": serialize_doc(result)}


# ===================== SUBSCRIBERS LIST =====================

@app.get("/api/admin/subscribers")
async def get_subscribers(
    planName: str = Query(""),
    boostType: str = Query(""),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(""),
    admin=Depends(get_admin_from_token)
):
    skip = (page - 1) * limit

    if boostType:
        # Fetch boost subscribers
        query = {"status": "Success", "planType": boostType}
        boosts = await profile_boosts_col.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
        total = await profile_boosts_col.count_documents(query)
        results = []
        for b in boosts:
            user = await users_col.find_one({"_id": b["userId"]}, {"otp": 0, "otpExpires": 0})
            profile = await profiles_col.find_one({"userId": b["userId"]})
            results.append({
                "subscription": serialize_doc(b),
                "account": serialize_doc(user) if user else None,
                "profile": serialize_doc(profile) if profile else None,
            })
    elif planName:
        # Fetch plan subscribers
        query = {"paymentStatus": "completed", "planName": planName}
        subs = await subscriptions_col.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
        total = await subscriptions_col.count_documents(query)
        results = []
        for s in subs:
            user = await users_col.find_one({"_id": s["userId"]}, {"otp": 0, "otpExpires": 0})
            profile = await profiles_col.find_one({"userId": s["userId"]})
            results.append({
                "subscription": serialize_doc(s),
                "account": serialize_doc(user) if user else None,
                "profile": serialize_doc(profile) if profile else None,
            })
    else:
        # Fetch users by membershipType
        query = {"membershipType": {"$ne": "Free"}} if not planName else {"membershipType": planName}
        profiles = await profiles_col.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
        total = await profiles_col.count_documents(query)
        results = []
        for p in profiles:
            user = await users_col.find_one({"_id": p["userId"]}, {"otp": 0, "otpExpires": 0})
            results.append({"profile": serialize_doc(p), "account": serialize_doc(user) if user else None})

    return {
        "success": True, "count": len(results), "total": total,
        "totalPages": max(1, -(-total // limit)), "currentPage": page, "data": results,
    }


# ===================== REVENUE ANALYTICS =====================

@app.get("/api/admin/revenue")
async def get_revenue_analytics(
    period: str = Query("all"),
    admin=Depends(get_admin_from_token)
):
    now = datetime.now(timezone.utc)
    date_filter = {}
    if period == "today":
        date_filter = {"createdAt": {"$gte": now.replace(hour=0, minute=0, second=0, microsecond=0)}}
    elif period == "week":
        date_filter = {"createdAt": {"$gte": now - timedelta(days=7)}}
    elif period == "month":
        date_filter = {"createdAt": {"$gte": now - timedelta(days=30)}}
    elif period == "year":
        date_filter = {"createdAt": {"$gte": now - timedelta(days=365)}}

    # Monthly revenue trend (last 12 months)
    twelve_months_ago = now - timedelta(days=365)
    monthly_pipeline = [
        {"$match": {"paymentStatus": "completed", "createdAt": {"$gte": twelve_months_ago}}},
        {"$group": {
            "_id": {"year": {"$year": "$createdAt"}, "month": {"$month": "$createdAt"}},
            "total": {"$sum": "$amount"}, "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]
    monthly_sub = await subscriptions_col.aggregate(monthly_pipeline).to_list(12)

    monthly_boost_pipeline = [
        {"$match": {"status": "Success", "createdAt": {"$gte": twelve_months_ago}}},
        {"$group": {
            "_id": {"year": {"$year": "$createdAt"}, "month": {"$month": "$createdAt"}},
            "total": {"$sum": "$amount"}, "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]
    monthly_boost = await profile_boosts_col.aggregate(monthly_boost_pipeline).to_list(12)

    # Combine monthly data
    monthly_data = {}
    for item in monthly_sub:
        key = f"{item['_id']['year']}-{item['_id']['month']:02d}"
        monthly_data[key] = {"subscriptions": item["total"], "boosts": 0, "month": key}
    for item in monthly_boost:
        key = f"{item['_id']['year']}-{item['_id']['month']:02d}"
        if key not in monthly_data:
            monthly_data[key] = {"subscriptions": 0, "boosts": 0, "month": key}
        monthly_data[key]["boosts"] = item["total"]

    sorted_monthly = sorted(monthly_data.values(), key=lambda x: x["month"])

    return {
        "success": True,
        "data": {
            "monthlyTrend": sorted_monthly,
        }
    }


# ===================== NOTIFICATIONS (ADMIN) =====================

@app.get("/api/admin/notifications")
async def get_admin_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin=Depends(get_admin_from_token)
):
    skip = (page - 1) * limit
    query = {"recipientId": "admin"}
    notifs = await notifications_col.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await notifications_col.count_documents(query)
    return {"success": True, "data": [serialize_doc(n) for n in notifs], "total": total, "currentPage": page, "totalPages": max(1, -(-total // limit))}


@app.put("/api/admin/notifications/mark-all-read")
async def mark_all_read(admin=Depends(get_admin_from_token)):
    await notifications_col.update_many({"recipientId": "admin", "isRead": False}, {"$set": {"isRead": True}})
    return {"success": True, "message": "All notifications marked as read"}


@app.put("/api/admin/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, admin=Depends(get_admin_from_token)):
    await notifications_col.update_one({"_id": ObjectId(notif_id)}, {"$set": {"isRead": True}})
    return {"success": True, "message": "Notification marked as read"}


@app.delete("/api/admin/notifications/{notif_id}")
async def delete_notification(notif_id: str, admin=Depends(get_admin_from_token)):
    await notifications_col.delete_one({"_id": ObjectId(notif_id)})
    return {"success": True, "message": "Notification deleted"}


# ===================== CONTACT US =====================

@app.get("/api/admin/contact-us")
async def get_contact_us(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    admin=Depends(get_admin_from_token)
):
    skip = (page - 1) * limit
    contacts = await contact_us_col.find().sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await contact_us_col.count_documents({})
    return {"success": True, "data": [serialize_doc(c) for c in contacts], "total": total, "currentPage": page, "totalPages": max(1, -(-total // limit))}


# ===================== MANUAL USER CREATE =====================

class ManualUserRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    fullName: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    accountStatus: str = "active"

@app.post("/api/admin/users/manual")
async def create_user_manual(req: ManualUserRequest, admin=Depends(get_admin_from_token)):
    email = req.email.strip().lower() if req.email else None
    phone = req.phone.strip() if req.phone else None
    if not email and not phone:
        return JSONResponse(status_code=400, content={"success": False, "message": "Either email or phone is required."})
    if email:
        existing = await users_col.find_one({"email": email})
        if existing:
            return JSONResponse(status_code=400, content={"success": False, "message": f"User already exists with email: {email}"})
    if phone:
        existing = await users_col.find_one({"phone": phone})
        if existing:
            return JSONResponse(status_code=400, content={"success": False, "message": f"User already exists with phone: {phone}"})

    user_doc = {"accountStatus": req.accountStatus, "isVerified": True, "createdAt": datetime.now(timezone.utc), "updatedAt": datetime.now(timezone.utc)}
    if email:
        user_doc["email"] = email
    if phone:
        user_doc["phone"] = phone
    user_result = await users_col.insert_one(user_doc)

    profile_doc = {"userId": user_result.inserted_id, "adminStatus": "approved", "createdAt": datetime.now(timezone.utc), "updatedAt": datetime.now(timezone.utc)}
    if req.fullName:
        profile_doc["fullName"] = req.fullName
    if req.gender:
        profile_doc["gender"] = req.gender
    if req.dob:
        profile_doc["dob"] = datetime.fromisoformat(req.dob)
    await profiles_col.insert_one(profile_doc)

    return {"success": True, "message": "User and profile created successfully by admin"}


# ===================== EXPORT ENDPOINTS =====================

@app.get("/api/admin/export/users")
async def export_users(format: str = Query("csv"), admin=Depends(get_admin_from_token)):
    users = await users_col.find({}, {"otp": 0, "otpExpires": 0, "password": 0}).to_list(None)
    profiles_list = await profiles_col.find({}).to_list(None)
    profiles_map = {str(p["userId"]): p for p in profiles_list}

    rows = []
    for u in users:
        p = profiles_map.get(str(u["_id"]), {})
        rows.append({
            "Name": p.get("fullName", ""),
            "Email": u.get("email", ""),
            "Phone": u.get("phone", ""),
            "Gender": p.get("gender", ""),
            "Membership": p.get("membershipType", "Free"),
            "Account Status": u.get("accountStatus", ""),
            "Approval Status": p.get("adminStatus", ""),
            "City": p.get("city", ""),
            "State": p.get("state", ""),
            "Registered": str(u.get("createdAt", "")),
        })

    if format == "csv":
        output = io.StringIO()
        if rows:
            import csv
            writer = csv.DictWriter(output, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users_export.csv"}
        )
    elif format == "xlsx":
        from openpyxl import Workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Users"
        if rows:
            ws.append(list(rows[0].keys()))
            for row in rows:
                ws.append(list(row.values()))
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=users_export.xlsx"}
        )
    elif format == "pdf":
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
        from reportlab.lib import colors
        output = io.BytesIO()
        doc = SimpleDocTemplate(output, pagesize=landscape(A4))
        if rows:
            table_data = [list(rows[0].keys())] + [list(r.values()) for r in rows[:500]]
            t = Table(table_data)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6E2F2F")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            doc.build([t])
        else:
            doc.build([])
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=users_export.pdf"}
        )

    return JSONResponse(status_code=400, content={"success": False, "message": "Invalid format"})


# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "matrimonial-admin-api"}

@app.get("/")
async def root():
    return {"message": "Matrimonial API is running..."}
