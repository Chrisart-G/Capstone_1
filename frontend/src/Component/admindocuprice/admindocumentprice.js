// src/Admin/admindocumentprice.js
import React, { useCallback, useEffect, useState } from "react";
import { Save, RefreshCcw, AlertCircle } from "lucide-react";
import AdminSidebar from "../Header/Adminsidebar";

const API = "http://localhost:8081/api/document-prices";

// For label display
const PERMIT_LABELS = {
  business: "Business Permit",
  electrical: "Electrical Permit",
  cedula: "Cedula Permit",
  mayors: "Mayor's Permit",
  building: "Building Permit",
  plumbing: "Plumbing Permit",
  fencing: "Fencing Permit",
  electronics: "Electronics Permit",
  renewal_business: "Business Renewal Permit",
};

export default function AdminDocumentPrice() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingMap, setSavingMap] = useState({}); // { application_type: boolean }

  const loadPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API, {
        method: "GET",
        credentials: "include", // send session cookie
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load document prices.");
        setRows([]);
        return;
      }

      const normalized = (json.data || []).map((r) => ({
        ...r,
        default_price: Number(r.default_price ?? 0),
        current_price: Number(r.current_price ?? 0),
        payment_percentage: Number(r.payment_percentage ?? 100),
      }));

      setRows(normalized);
    } catch (err) {
      console.error("Error loading document prices:", err);
      setError("Unexpected error while loading document prices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const updateRowField = (application_type, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.application_type === application_type
          ? { ...row, [field]: value }
          : row
      )
    );
  };

  const handleSave = async (row) => {
    const { application_type, current_price, payment_percentage } = row;
    if (!application_type) return;

    const priceNum = Number(current_price);
    const percentNum =
      payment_percentage === "" || payment_percentage === null
        ? 100
        : Number(payment_percentage);

    if (Number.isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid non-negative price.");
      return;
    }

    if (Number.isNaN(percentNum) || percentNum <= 0 || percentNum > 100) {
      alert("Payment percentage must be between 0 and 100.");
      return;
    }

    try {
      setSavingMap((prev) => ({ ...prev, [application_type]: true }));

      const res = await fetch(`${API}/${application_type}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_price: priceNum,
          payment_percentage: percentNum,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Failed to update document price.");
        return;
      }

      const updated = json.data;
      setRows((prev) =>
        prev.map((r) =>
          r.application_type === application_type
            ? {
                ...r,
                default_price: Number(updated.default_price ?? r.default_price),
                current_price: Number(updated.current_price ?? priceNum),
                payment_percentage: Number(
                  updated.payment_percentage ?? percentNum
                ),
                updated_at: updated.updated_at || r.updated_at,
              }
            : r
        )
      );

      alert("Document price updated successfully.");
    } catch (err) {
      console.error("Error saving document price:", err);
      alert("Unexpected error while saving document price.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [application_type]: false }));
    }
  };

  const isSaving = (application_type) => !!savingMap[application_type];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0">
        <AdminSidebar />
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Document Price Control</h1>
          <button
            onClick={loadPrices}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded shadow-sm text-sm hover:bg-gray-100"
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Admin can adjust <span className="font-semibold">current price</span>{" "}
          and <span className="font-semibold">payment percentage</span> per
          document type. Comparison is shown against the original{" "}
          <span className="font-semibold">default price</span>.
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="bg-white rounded shadow overflow-hidden">
          <div className="border-b px-4 py-2 bg-gray-100 text-sm font-semibold text-gray-700">
            Document Price List
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              Loading document prices...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              No document price configuration found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Document Type</th>
                    <th className="px-4 py-2 text-right">Default Price (₱)</th>
                    <th className="px-4 py-2 text-right">Current Price (₱)</th>
                    <th className="px-4 py-2 text-right">Difference (₱)</th>
                    <th className="px-4 py-2 text-right">
                      Payment % (collected)
                    </th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const diff =
                      Number(row.current_price) - Number(row.default_price);
                    const diffClass =
                      diff === 0
                        ? "text-gray-500"
                        : diff > 0
                        ? "text-red-600"
                        : "text-green-600";

                    return (
                      <tr key={row.application_type} className="border-t">
                        {/* Document type */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {PERMIT_LABELS[row.application_type] ||
                              row.application_type}
                          </div>
                          <div className="text-xs text-gray-500">
                            key: {row.application_type}
                          </div>
                        </td>

                        {/* Default price */}
                        <td className="px-4 py-3 text-right">
                          ₱{Number(row.default_price).toFixed(2)}
                        </td>

                        {/* Current price (editable) */}
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-28 border rounded px-2 py-1 text-right text-sm"
                            value={row.current_price}
                            onChange={(e) =>
                              updateRowField(
                                row.application_type,
                                "current_price",
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        {/* Difference */}
                        <td className="px-4 py-3 text-right">
                          <span className={diffClass}>
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(2)}
                          </span>
                        </td>

                        {/* Payment percentage */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              step="1"
                              className="w-20 border rounded px-2 py-1 text-right text-sm"
                              value={row.payment_percentage}
                              onChange={(e) =>
                                updateRowField(
                                  row.application_type,
                                  "payment_percentage",
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1">
                            Collected from client
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSave(row)}
                            disabled={isSaving(row.application_type)}
                            className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-60"
                          >
                            <Save className="w-3 h-3" />
                            {isSaving(row.application_type)
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Tip: later you can make the payment module read directly from{" "}
          <code className="bg-gray-100 px-1 rounded">tbl_document_prices</code>{" "}
          instead of the hard-coded <code>DOCUMENT_PRICES</code> object.
        </p>
      </main>
    </div>
  );
}
