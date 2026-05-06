"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

// 🔥 Add projectId as a prop
export default function ExportExcelButton({ projectId }: { projectId: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // 🔥 Send the projectId in the query string
      const res = await fetch(`/api/teacher/export?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch export data");
      
      const { data } = await res.json();

      if (!data || data.length === 0) {
        toast.warning("No teams found to export for this project.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 30 }, // Team Name
        { wch: 30 }, // Leader Name
        { wch: 60 }, // Pitched Idea
      ];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Team Ideas Summary");

      XLSX.writeFile(workbook, `ProTrack_Ideas_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
      
      toast.success("Excel summary downloaded successfully!");

    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Excel file.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-70 dark:bg-emerald-700 dark:hover:bg-emerald-600"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isExporting ? "Generating..." : "Download Ideas Summary"}
    </button>
  );
}