import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Shield, Clock, Megaphone } from "lucide-react";
import Uheader from "../Header/User_header";
import UFooter from "../Footer/User_Footer";
import axios from "axios";

const API_BASE_URL = "http://localhost:8081";

const MunicipalLandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 text-sm text-slate-100 shadow-2xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-700 via-slate-400 to-slate-700"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Top navigation */}
      <Uheader />

      <main className="flex-1">
        {/* HERO SECTION – text only, no video/card */}
        <section className="max-w-5xl mx-auto px-4 pt-8 md:pt-10 pb-12 md:pb-16">
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 shadow-2xl px-6 py-10 md:px-10 md:py-14 text-center text-white">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-slate-300 mb-3">
              Online Municipal Services
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-md">
              Online Document Processing{" "}
              <span className="text-blue-300">Municipality of Hinigaran</span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-slate-200 max-w-3xl mx-auto leading-relaxed">
              Request municipal documents, track their status, and receive
              updates without visiting the municipal hall. Secure, simple, and
              accessible from your home.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 rounded-full text-sm md:text-base font-medium shadow-lg shadow-blue-900/40 transition">
                Get Started
              </button>
            </div>
          </div>
        </section>

        {/* ANNOUNCEMENTS */}
        <section className="bg-white/5 border-y border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 shadow-sm">
                <Megaphone className="text-blue-600 mr-2 h-4 w-4" />
                <span className="text-xs font-semibold text-slate-800 tracking-wide">
                  Municipality Announcements
                </span>
              </div>
              <p className="mt-2 text-[11px] md:text-xs text-slate-200">
                Stay updated on processing schedules and important reminders.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100/80 overflow-hidden">
              <div className="border-l-4 border-blue-500 px-5 py-4 md:px-6 md:py-5 bg-slate-50">
                <h3 className="text-base md:text-lg font-semibold text-slate-900">
                  Document Processing Schedule
                </h3>
                <span className="text-[11px] md:text-xs text-slate-500">
                  Posted: May 1, 2025
                </span>
                <p className="mt-2 text-sm md:text-[13px] text-slate-700 leading-relaxed">
                  The Municipal Office processes online document requests from{" "}
                  <span className="font-semibold">7:00 AM to 5:00 PM</span>,{" "}
                  Monday to Friday. While our system accepts submissions 24/7,
                  requests submitted after office hours will be processed on the
                  next business day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-8">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-slate-300">
              Why use the system
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-white">
              Designed for secure and efficient public service
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xl border border-slate-100/80 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-50 mb-3 md:mb-4 h-11 w-11">
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

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xl border border-slate-100/80 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-50 mb-3 md:mb-4 h-11 w-11">
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

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xl border border-slate-100/80 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-indigo-50 mb-3 md:mb-4 h-11 w-11">
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
