"""
Admin Dashboard API Tests
Tests for: Authentication, Stats, Users, Matches CRUD, Verification, Reports, Subscribers, Export
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('NEXT_PUBLIC_API_URL', 'https://d78808ca-7e8c-471f-a704-805115dcd608.preview.emergentagent.com/api')

# Test credentials from backend/.env
ADMIN_EMAIL = "admin@rvrluxury.com"
ADMIN_PASSWORD = "Admin@123456"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✓ Health check passed")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        response = requests.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert len(data["token"]) > 0
        assert "admin" in data
        assert data["admin"]["role"] == "admin"
        print(f"✓ Admin login successful, token received")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/admin/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.json()
        assert data["success"] == False
        print("✓ Invalid credentials rejected correctly")
    
    def test_token_status_valid(self, auth_token):
        """Test token status check with valid token"""
        response = requests.get(f"{BASE_URL}/admin/token-status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["valid"] == True
        print("✓ Token status check passed")
    
    def test_token_status_invalid(self):
        """Test token status check with invalid token"""
        response = requests.get(f"{BASE_URL}/admin/token-status", headers={
            "Authorization": "Bearer invalid_token_here"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
        print("✓ Invalid token rejected correctly")


class TestAdminStats:
    """Admin dashboard stats tests"""
    
    def test_get_stats(self, auth_token):
        """Test fetching dashboard stats"""
        response = requests.get(f"{BASE_URL}/admin/stats", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        stats = data["data"]
        # Verify all required stat fields exist
        assert "totalUsers" in stats
        assert "activeUsers" in stats
        assert "todaysRegistrations" in stats
        assert "totalRevenue" in stats
        assert "successfulMatches" in stats
        assert "premiumMembers" in stats
        assert "boostCounts" in stats
        assert "genderRatio" in stats
        assert "revenueBreakdown" in stats
        assert "pendingVerification" in stats
        assert "reportedProfiles" in stats
        
        # Verify premium members breakdown
        assert "Gold" in stats["premiumMembers"]
        assert "Premium" in stats["premiumMembers"]
        assert "Free" in stats["premiumMembers"]
        
        # Verify boost counts
        assert "24 Hours" in stats["boostCounts"]
        assert "3 Days" in stats["boostCounts"]
        assert "7 Days" in stats["boostCounts"]
        
        # Verify gender ratio
        assert "Male" in stats["genderRatio"]
        assert "Female" in stats["genderRatio"]
        
        print(f"✓ Stats fetched: {stats['totalUsers']} users, {stats['activeUsers']} active, Revenue: {stats['totalRevenue']}")
    
    def test_stats_unauthorized(self):
        """Test stats endpoint without auth"""
        response = requests.get(f"{BASE_URL}/admin/stats")
        assert response.status_code == 401
        print("✓ Stats endpoint requires authentication")


class TestAdminUsers:
    """Admin users management tests"""
    
    def test_get_users_list(self, auth_token):
        """Test fetching users list with pagination"""
        response = requests.get(f"{BASE_URL}/admin/users?page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert "totalUsers" in data
        assert "totalPages" in data
        assert "currentPage" in data
        print(f"✓ Users list fetched: {data['totalUsers']} total users, page {data['currentPage']}/{data['totalPages']}")
    
    def test_get_users_with_search(self, auth_token):
        """Test users search functionality"""
        response = requests.get(f"{BASE_URL}/admin/users?search=test&page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Users search works, found {data['count']} results")
    
    def test_get_users_with_filters(self, auth_token):
        """Test users filtering by status"""
        response = requests.get(f"{BASE_URL}/admin/users?status=active&page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Users filter by status works, found {data['count']} active users")


class TestAdminMatches:
    """Successful matches CRUD tests"""
    
    created_match_id = None
    
    def test_get_matches_list(self, auth_token):
        """Test fetching matches list"""
        response = requests.get(f"{BASE_URL}/admin/matches?page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert "totalMatches" in data
        print(f"✓ Matches list fetched: {data['totalMatches']} total matches")
        return data["data"]
    
    def test_matches_search(self, auth_token):
        """Test matches search functionality"""
        response = requests.get(f"{BASE_URL}/admin/matches?search=test&page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Matches search works, found {data['count']} results")


class TestPendingVerification:
    """Pending verification tests"""
    
    def test_get_pending_verification(self, auth_token):
        """Test fetching pending verification profiles"""
        response = requests.get(f"{BASE_URL}/admin/pending-verification?page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert "total" in data
        print(f"✓ Pending verification fetched: {data['total']} profiles pending")


class TestReportedProfiles:
    """Reported profiles tests"""
    
    def test_get_reported_profiles(self, auth_token):
        """Test fetching reported profiles"""
        response = requests.get(f"{BASE_URL}/admin/reported-profiles?page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert "total" in data
        print(f"✓ Reported profiles fetched: {data['total']} reports")
    
    def test_reported_profiles_filter_by_status(self, auth_token):
        """Test filtering reported profiles by status"""
        response = requests.get(f"{BASE_URL}/admin/reported-profiles?status=pending&page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Reported profiles filter works, found {data['count']} pending reports")


class TestSubscribers:
    """Subscribers list tests"""
    
    def test_get_subscribers(self, auth_token):
        """Test fetching subscribers list"""
        response = requests.get(f"{BASE_URL}/admin/subscribers?page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        print(f"✓ Subscribers fetched: {data['count']} subscribers")
    
    def test_get_subscribers_by_plan(self, auth_token):
        """Test fetching subscribers by plan name"""
        response = requests.get(f"{BASE_URL}/admin/subscribers?planName=Gold&page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Gold subscribers fetched: {data['count']} subscribers")
    
    def test_get_subscribers_by_boost(self, auth_token):
        """Test fetching subscribers by boost type"""
        response = requests.get(f"{BASE_URL}/admin/subscribers?boostType=24%20Hours&page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ 24h Boost subscribers fetched: {data['count']} subscribers")


class TestRevenueAnalytics:
    """Revenue analytics tests"""
    
    def test_get_revenue_analytics(self, auth_token):
        """Test fetching revenue analytics"""
        response = requests.get(f"{BASE_URL}/admin/revenue", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert "monthlyTrend" in data["data"]
        print(f"✓ Revenue analytics fetched, {len(data['data']['monthlyTrend'])} months of data")
    
    def test_get_revenue_by_period(self, auth_token):
        """Test fetching revenue by period"""
        response = requests.get(f"{BASE_URL}/admin/revenue?period=month", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Revenue by period filter works")


class TestExport:
    """Export functionality tests"""
    
    def test_export_csv(self, auth_token):
        """Test CSV export"""
        response = requests.get(f"{BASE_URL}/admin/export/users?format=csv", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        assert len(response.content) > 0
        print("✓ CSV export works")
    
    def test_export_xlsx(self, auth_token):
        """Test Excel export"""
        response = requests.get(f"{BASE_URL}/admin/export/users?format=xlsx", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert "spreadsheet" in response.headers.get("content-type", "")
        assert len(response.content) > 0
        print("✓ Excel export works")
    
    def test_export_pdf(self, auth_token):
        """Test PDF export"""
        response = requests.get(f"{BASE_URL}/admin/export/users?format=pdf", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert "pdf" in response.headers.get("content-type", "")
        assert len(response.content) > 0
        print("✓ PDF export works")


# Fixtures
@pytest.fixture(scope="session")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(f"{BASE_URL}/admin/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("token"):
            return data["token"]
    pytest.fail("Failed to get auth token for tests")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
