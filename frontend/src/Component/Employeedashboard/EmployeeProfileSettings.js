import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Header/Sidebar";

const API_BASE_URL = "http://localhost:8081";

export default function EmployeeProfileSettings() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // UI tabs
  const [activeTab, setActiveTab] = useState("profile"); // profile | security

  // ---- PROFILE FORM ----
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
  });

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // ---- SECURITY FORM ----
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ---------- existing functions pattern ----------
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (tab) => {
    // keeps your sidebar nav working
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/userinfo`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const u = response.data.userData;
        setUserData(u);

        // map your returned fields safely
        setProfileForm((prev) => ({
          ...prev,
          first_name: u.first_name || u.firstname || "",
          last_name: u.last_name || u.lastname || "",
          email: u.email || "",
          phone: u.phone || u.phoneNumber || "",
          address: u.address || "",
          position: u.position || u.role_name || "",
          department: u.department || "",
        }));

        // If you already store avatar URL in DB (optional)
        const avatarUrl = u.avatar_url || u.profile_image || "";
        if (avatarUrl) {
          setAvatarPreview(
            avatarUrl.startsWith("http") ? avatarUrl : `${API_BASE_URL}${avatarUrl}`
          );
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        await fetchUserData();
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Session check error:", error);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- helpers ----------
  const initials = useMemo(() => {
    const a = (profileForm.first_name || "E")[0] || "E";
    const b = (profileForm.last_name || "M")[0] || "M";
    return `${a}${b}`.toUpperCase();
  }, [profileForm.first_name, profileForm.last_name]);

  const tabBtn = (key) =>
    [
      "px-4 py-2 rounded-lg text-sm font-semibold transition",
      activeTab === key
        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ].join(" ");

  // ---------- ACTIONS (connect to your backend endpoints) ----------
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);

      const form = new FormData();
      form.append("first_name", profileForm.first_name);
      form.append("last_name", profileForm.last_name);
      form.append("phone", profileForm.phone);
      form.append("address", profileForm.address);
      form.append("position", profileForm.position);
      form.append("department", profileForm.department);

      if (avatarFile) form.append("avatar", avatarFile);

      const res = await axios.put(`${API_BASE_URL}/api/employee/profile`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        alert("Profile updated successfully!");
        await fetchUserData();
        setAvatarFile(null);
      } else {
        alert(res.data?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Server error while saving profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!securityForm.newPassword || securityForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.put(
        `${API_BASE_URL}/api/employee/change-password`,
        {
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        alert("Password updated successfully!");
        setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(res.data?.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      alert("Server error while changing password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="m-auto bg-white rounded-xl shadow-lg p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-600">Loading profile settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          userData={userData}
          onLogout={handleLogout}
          isLoading={isLoading}
          onNavigate={handleNavigate}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2">
                Manage your profile details and reset your password.
              </p>
            </div>

            {/* Tabs card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <button className={tabBtn("profile")} onClick={() => setActiveTab("profile")}>
                    Overview
                  </button>
                  <button className={tabBtn("security")} onClick={() => setActiveTab("security")}>
                    Reset Password
                  </button>
                </div>

                {/* user summary */}
                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-700">{initials}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {profileForm.first_name} {profileForm.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{profileForm.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Profile Photo */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Photo</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload a clear photo for your account.
                  </p>

                  <div className="mt-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-700">{initials}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setAvatarFile(file);
                            setAvatarPreview(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        JPG/PNG recommended. Small file size is better.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600">Account Role</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {userData?.role || userData?.user_type || "Employee"}
                    </p>
                  </div>
                </div>

                {/* Right: Personal Info */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Update your details. Email is fixed for security.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <input
                        value={profileForm.first_name}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, first_name: e.target.value }))
                        }
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        value={profileForm.last_name}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, last_name: e.target.value }))
                        }
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <input
                        value={profileForm.email}
                        readOnly
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Email"
                      />
                      <p className="mt-2 text-xs text-gray-500">Email is not editable.</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <input
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, address: e.target.value }))
                        }
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter address"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Position</label>
                      <input
                        value={profileForm.position}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, position: e.target.value }))
                        }
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Permit Clerk"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <input
                        value={profileForm.department}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, department: e.target.value }))
                        }
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Permits Office"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Use a strong password to keep your account safe.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleChangePassword}
                      className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Update Password
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={securityForm.currentPassword}
                        onChange={(e) =>
                          setSecurityForm((p) => ({
                            ...p,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          value={securityForm.newPassword}
                          onChange={(e) =>
                            setSecurityForm((p) => ({
                              ...p,
                              newPassword: e.target.value,
                            }))
                          }
                          className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={securityForm.confirmPassword}
                          onChange={(e) =>
                            setSecurityForm((p) => ({
                              ...p,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600">
                        Tip: Use at least 8 characters with a mix of letters and numbers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
