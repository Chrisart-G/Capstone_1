import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Shield, Clock, Megaphone } from "lucide-react";
import Uheader from "../Header/User_header";
import UFooter from "../Footer/User_Footer";
import axios from "axios";

const API_BASE_URL = "http://localhost:8081";

// ✅ logo path
const HINIGARAN_LOGO = "img/logo.png";

const MunicipalLandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 NEW: announcements as an array
  const [announcements, setAnnouncements] = useState([]);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementError, setAnnouncementError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
          withCredentials: true,
        });

        setIsAuthenticated(response.data.loggedIn);

        if (!response.data.loggedIn) {
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // 🔹 Fetch ALL latest announcements once user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAnnouncement = async () => {
      try {
        setAnnouncementLoading(true);
        setAnnouncementError("");

        const res = await axios.get(`${API_BASE_URL}/api/home-announcement`, {
          withCredentials: true,
        });

        if (
          res.data &&
          res.data.success &&
          Array.isArray(res.data.announcements)
        ) {
          setAnnouncements(res.data.announcements);
        } else {
          setAnnouncements([]);
        }
      } catch (err) {
        console.error("Error loading announcement:", err);
        setAnnouncementError("Failed to load latest announcements.");
        setAnnouncements([]);
      } finally {
        setAnnouncementLoading(false);
      }
    };

    fetchAnnouncement();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="rounded-2xl px-6 py-4 text-sm text-slate-700 bg-white border border-slate-200 shadow-lg">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-white"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Top navigation */}
      <Uheader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 pb-10 md:pb-14">
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-[0_20px_60px_-30px_rgba(2,132,199,0.45)] px-6 py-10 md:px-12 md:py-14 text-center">
            {/* subtle blue glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

            {/* ✅ Watermark logo behind titles */}
            <img
              src={HINIGARAN_LOGO}
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 m-auto w-[850px] md:w-[1000px] lg:w-[1150px] opacity-10 blur-[0.1px] drop-shadow-2xl"
            />
            <p className="relative z-10 text-[11px] md:text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">
              Online Municipal Services
            </p>

            <h1 className="relative z-10 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
              Online Document Processing{" "}
              <span className="text-blue-600">Municipality of Hinigaran</span>
            </h1>

            <p className="relative z-10 mt-4 text-sm md:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Request municipal documents, track their status, and receive
              updates without visiting the municipal hall. Secure, simple, and
              accessible from your home.
            </p>

            <div className="relative z-10 mt-7 flex flex-col items-center gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-8 py-3 rounded-full text-sm md:text-base font-semibold shadow-md shadow-blue-600/25 transition focus:outline-none focus:ring-4 focus:ring-blue-200">
                Get Started
              </button>
              <p className="text-[11px] md:text-xs text-slate-500">
                Fast submission. Real-time status tracking.
              </p>
            </div>
          </div>
        </section>

        {/* ANNOUNCEMENTS */}
        <section className="border-y border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 border border-blue-100 shadow-sm">
                <Megaphone className="text-blue-600 mr-2 h-4 w-4" />
                <span className="text-xs font-semibold text-slate-900 tracking-wide">
                  Municipality Announcements
                </span>
              </div>
              <p className="mt-2 text-[11px] md:text-xs text-slate-600">
                Stay updated on processing schedules and important reminders.
              </p>
            </div>

            {announcementError && (
              <p className="mb-3 text-xs text-red-500 text-center">
                {announcementError}
              </p>
            )}

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="border-l-4 border-blue-600 px-5 py-4 md:px-6 md:py-5 bg-gradient-to-r from-blue-50 to-white">
                {announcementLoading ? (
                  <>
                    <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-3" />
                    <div className="h-3 w-full bg-slate-100 rounded animate-pulse mb-1" />
                    <div className="h-3 w-5/6 bg-slate-100 rounded animate-pulse" />
                  </>
                ) : announcements.length > 0 ? (
                  <div className="space-y-5">
                    {announcements.map((item) => (
                      <div
                        key={item.id}
                        className="border border-slate-200/60 rounded-xl bg-white/70 px-4 py-3 shadow-sm"
                      >
                        <h3 className="text-base md:text-lg font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <span className="text-[11px] md:text-xs text-slate-500">
                          Posted: {item.postedAt}
                        </span>
                        <p className="mt-2 text-sm md:text-[13px] text-slate-700 leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <h3 className="text-base md:text-lg font-semibold text-slate-900">
                      No Active Announcements
                    </h3>
                    <p className="mt-2 text-sm md:text-[13px] text-slate-600 leading-relaxed">
                      There are currently no municipal announcements. Please
                      check back later.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-8">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-slate-500">
              Why use the system
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900">
              Designed for secure and efficient public service
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
              A streamlined experience for citizens—clear steps, safer data
              handling, and better transparency through status updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-slate-200 text-center hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-50 mb-3 md:mb-4 h-11 w-11 border border-blue-100">
                <FileText className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Easy Requests
              </h3>
              <p className="text-sm text-slate-600">
                Guided, step-by-step document request process that’s simple even
                for first-time users.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-slate-200 text-center hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-50 mb-3 md:mb-4 h-11 w-11 border border-emerald-100">
                <Shield className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Secure Processing
              </h3>
              <p className="text-sm text-slate-600">
                Your personal information and official records are handled with
                strict data privacy and security controls.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-slate-200 text-center hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center rounded-full bg-indigo-50 mb-3 md:mb-4 h-11 w-11 border border-indigo-100">
                <Clock className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Quick Approvals
              </h3>
              <p className="text-sm text-slate-600">
                Reduced waiting time with digital tracking of your request
                status from submission to release.
              </p>
            </div>
          </div>
        </section>
      </main>

      <UFooter />
    </div>
  );
};

export default MunicipalLandingPage;
