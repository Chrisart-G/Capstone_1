// components/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  CheckSquare,
  Clock,
  Archive,
  LogOut,
  User,
} from "lucide-react";

const Dot = ({ show }) =>
  show ? (
    <span
      className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-red-500"
      aria-label="new notifications"
      title="New items"
    />
  ) : null;

const Sidebar = ({ userData, onLogout, isLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [badges, setBadges] = useState({ applications: 0, payments: 0 });
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
    let timer;
    let alive = true;

    const load = () => {
      setLoadingBadges(true);
      fetch("http://localhost:8081/api/employee/sidebar/badges", {
        credentials: "include",
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          if (!alive) return;
          setBadges(data?.badges || { applications: 0, payments: 0 });
        })
        .catch(() => {
          if (alive) setBadges({ applications: 0, payments: 0 });
        })
        .finally(() => {
          if (alive) setLoadingBadges(false);
        });
    };

    load();
    timer = setInterval(load, 15000);

    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // ✅ reactive pathname (updates when route changes)
  const pathname = useMemo(() => location.pathname || "", [location.pathname]);
  const activePath = (href) => pathname === href;

  const dept = (userData?.department || "").toUpperCase().trim();
  const pos = (userData?.position || "").toUpperCase().trim();

  // ✅ Treasurer (MTO) – walang Applications menu at siya lang may Payment Verifications
  const isTreasury = useMemo(() => {
    if (!dept && !pos) return false;
    if (dept === "MTO") return true;
    if (dept.includes("TREASURER")) return true;
    if (pos.includes("TREASURER")) return true;
    return false;
  }, [dept, pos]);

  // ✅ decide kung old dash o new dash gagamitin (non-MTO lang)
  const isLegacyApplications = useMemo(() => {
    if (isTreasury) return false; // irrelevant, MTO doesn't see Applications
    // BPLO or MPDO by department OR position
    if (dept === "BPLO" || dept === "MPDO") return true;
    if (pos.includes("BPLO") || pos.includes("MPDO")) return true;
    return false;
  }, [dept, pos, isTreasury]);

  const applicationsHref = isLegacyApplications
    ? "/EmployDash" // old dashboard
    : "/Newemployeedash"; // new dashboard

  // Only MTO / Treasurer can see Payment Verifications
  const canSeePayments = isTreasury;

  const Item = ({
    href,
    icon: Icon,
    label,
    right,
    active,
    accent = "indigo",
  }) => {
    // Accent maps for active state
    const accentMap = {
      indigo: {
        bg: "bg-indigo-500/15",
        ring: "border-indigo-300/25",
        bar: "bg-indigo-400",
        icon: "text-indigo-200",
        glow: "shadow-[0_18px_35px_-25px_rgba(99,102,241,0.9)]",
      },
      emerald: {
        bg: "bg-emerald-500/15",
        ring: "border-emerald-300/25",
        bar: "bg-emerald-400",
        icon: "text-emerald-200",
        glow: "shadow-[0_18px_35px_-25px_rgba(16,185,129,0.9)]",
      },
      amber: {
        bg: "bg-amber-500/15",
        ring: "border-amber-300/25",
        bar: "bg-amber-400",
        icon: "text-amber-200",
        glow: "shadow-[0_18px_35px_-25px_rgba(245,158,11,0.9)]",
      },
      rose: {
        bg: "bg-rose-500/15",
        ring: "border-rose-300/25",
        bar: "bg-rose-400",
        icon: "text-rose-200",
        glow: "shadow-[0_18px_35px_-25px_rgba(244,63,94,0.9)]",
      },
    };

    const a = accentMap[accent] || accentMap.indigo;

    return (
      <button
        type="button"
        onClick={() => navigate(href)}
        className="w-full text-left"
      >
        <div
          className={[
            "relative mx-4 my-1 px-4 py-2.5 rounded-2xl flex items-center gap-3 transition",
            "border",
            active
              ? `${a.bg} ${a.ring} ${a.glow}`
              : "border-transparent hover:bg-white/5 hover:border-white/10",
          ].join(" ")}
        >
          {/* Left active indicator */}
          <span
            className={[
              "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1.5 rounded-r-full transition-opacity",
              active ? `${a.bar} opacity-100` : "opacity-0",
            ].join(" ")}
          />

          <Icon size={18} className={active ? a.icon : "text-white/90"} />
          <span className="font-semibold text-[15px] text-white">{label}</span>
          <div className="ml-auto flex items-center">{right}</div>
        </div>
      </button>
    );
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-gradient-to-b from-[#0B1633] via-[#071024] to-[#050B1A] text-white border-r border-white/10">
      <div className="h-full flex flex-col">
        {/* Brand */}
        <div className="px-6 pt-5 pb-3 text-center">
          <div className="flex justify-center">
            {/* keep your logo as-is */}
            <img src="/img/logo.png" alt="Logo" className="w-45 h-45" />
          </div>

          <h1 className="text-xl font-extrabold mt-3 tracking-tight">
            Employee Dashboard
          </h1>
          <p className="text-white/70 text-sm mt-0.5">Hinigaran Municipality</p>
          <div className="mt-4 h-px bg-white/10" />
        </div>

        {/* Nav */}
        <nav className="px-1">
          {/* ✅ Applications – hidden for MTO / Treasurer */}
          {!isTreasury && (
            <Item
              href={applicationsHref}
              icon={FileText}
              label="Applications"
              active={activePath(applicationsHref)}
              accent="indigo"
              right={
                !loadingBadges ? (
                  <Dot show={badges.applications > 0} />
                ) : null
              }
            />
          )}

          {/* ✅ Payment Verifications – ONLY for MTO / Treasurer */}
          {canSeePayments && (
            <Item
              href="/employeepayment"
              icon={CheckSquare}
              label="Payment Verifications"
              active={activePath("/employeepayment")}
              accent="emerald"
              right={
                !loadingBadges ? <Dot show={badges.payments > 0} /> : null
              }
            />
          )}

          <Item
            href="/Employeehistory"
            icon={Clock}
            label="History"
            active={activePath("/Employeehistory")}
            accent="amber"
          />

          <Item
            href="/Achrive"
            icon={Archive}
            label="Archives"
            active={activePath("/Achrive")}
            accent="rose"
          />
        </nav>

        {/* Footer */}
        <div className="mt-auto px-6 pb-4">
          <div className="h-px bg-white/10" />

          {/* Profile strip (click -> profile settings) */}
          <button
            type="button"
            onClick={() => navigate("/Employeeprofile")}
            className={[
              "mt-3 w-full text-left rounded-2xl p-3 transition flex items-center gap-3 border",
              activePath("/EmployeeProfileSettings")
                ? "bg-indigo-500/15 border-indigo-300/25"
                : "border-transparent hover:bg-white/5 hover:border-white/10",
            ].join(" ")}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>

            <div className="min-w-0">
              {isLoading ? (
                <p className="text-xs text-white/70">Loading...</p>
              ) : userData ? (
                <>
                  <p className="font-semibold text-white truncate max-w-[160px]">
                    {userData.fullName || "User"}
                  </p>
                  <p className="text-[11px] text-white/60 truncate max-w-[160px]">
                    {userData.position || "Employee"} (
                    {userData.department || "Department"})
                  </p>
                </>
              ) : (
                <p className="text-xs text-white/70">No user data</p>
              )}
            </div>

            <div className="ml-auto text-white/50 text-xs">›</div>
          </button>

          {/* Logout */}
          <div className="mt-3 grid gap-2">
            <button
              onClick={onLogout}
              disabled={isLoading}
              className="w-full mx-auto px-3.5 py-2.5 rounded-2xl hover:bg-white/5 transition flex items-center gap-3 disabled:opacity-60 border border-transparent hover:border-white/10"
            >
              <LogOut size={17} className="text-red-300" />
              <span className="font-semibold text-[14px] text-white">
                Log Out
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
