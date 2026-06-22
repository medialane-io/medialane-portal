"use client";

import { useState } from "react";
import { useAdminReports } from "@/src/hooks/use-admin";
import { adminFetch } from "@/src/lib/admin-fetch";
import {
  ExternalLink, Flag, ChevronLeft, ChevronRight,
  ShieldAlert, Eye, EyeOff, XCircle, RotateCcw, Clock,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { toast } from "sonner";
import { timeAgo, ipfsToHttp } from "@/src/lib/utils";
import type { AdminReport, ReportStatus } from "@/src/types/admin";

const PAGE_SIZE = 20;

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Pending",      value: "PENDING" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Hidden",       value: "HIDDEN" },
  { label: "Dismissed",    value: "DISMISSED" },
  { label: "All",          value: "" },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING:      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  HIDDEN:       "bg-red-500/20 text-red-400 border-red-500/30",
  DISMISSED:    "bg-gray-500/20 text-gray-400 border-gray-500/30",
  RESTORED:     "bg-green-500/20 text-green-400 border-green-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  COPYRIGHT_PIRACY:  "Copyright / Piracy",
  VIOLENCE_GRAPHIC:  "Violence / Graphic",
  HATE_SPEECH:       "Hate Speech",
  SCAM_FRAUD:        "Scam / Fraud",
  SPAM:              "Spam",
  NSFW:              "NSFW",
  OTHER:             "Other",
};

const HIGH_SEVERITY = new Set(["HATE_SPEECH", "VIOLENCE_GRAPHIC", "SCAM_FRAUD"]);

function targetPageUrl(report: AdminReport): string {
  if (report.targetType === "TOKEN" && report.targetContract && report.targetTokenId)
    return `/asset/${report.targetContract}/${report.targetTokenId}`;
  if (report.targetType === "COLLECTION" && report.targetContract)
    return `/collection/${report.targetContract}`;
  if (report.targetType === "CREATOR" && report.targetAddress)
    return `/creator/${report.targetAddress}`;
  return "#";
}

function ReportSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" /></div>
      <Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-16" />
    </div>
  );
}

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const { reports, total, isLoading, mutate } = useAdminReports(statusFilter || undefined, page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [acting, setActing] = useState(false);

  function openReport(report: AdminReport) { setSelected(report); setAdminNotes(report.adminNotes ?? ""); }
  function closeDialog() { setSelected(null); setAdminNotes(""); }
  function switchTab(value: string) { setStatusFilter(value); setPage(1); }

  const handleAction = async (newStatus: ReportStatus) => {
    if (!selected) return;
    if ((newStatus === "HIDDEN" || newStatus === "DISMISSED") && !adminNotes.trim()) {
      toast.error("Admin notes are required for Hide / Dismiss"); return;
    }
    setActing(true);
    try {
      const res = await adminFetch(`/api/admin/reports/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNotes: adminNotes.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Report ${newStatus.toLowerCase().replace(/_/g, " ")}`);
      closeDialog(); await mutate();
    } catch { toast.error("Action failed. Please try again."); }
    finally { setActing(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2"><Flag className="h-5 w-5" />Community Reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : `${total.toLocaleString()} report${total !== 1 ? "s" : ""}${statusFilter ? ` · ${statusFilter.toLowerCase().replace("_", " ")}` : ""}`}
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border pb-1">
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => switchTab(tab.value)}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${statusFilter === tab.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <ReportSkeleton key={i} />)}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShieldAlert className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No reports</p>
          <p className="text-sm mt-1">Nothing here for the current filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const img = report.targetImage ? ipfsToHttp(report.targetImage) : null;
            const isHigh = report.categories.some(c => HIGH_SEVERITY.has(c));
            return (
              <div key={report.id}
                className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors ${isHigh ? "border-red-500/40" : "border-border"}`}
                onClick={() => openReport(report)}>
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                  {img ? <img src={img} alt="" className="h-full w-full object-cover" /> :
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20"><Flag className="h-4 w-4 text-muted-foreground/50" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{report.targetName ?? report.targetKey}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">{report.targetType.toLowerCase()}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{timeAgo(report.createdAt)}</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-[180px]">
                  {report.categories.slice(0, 2).map((cat) => (
                    <Badge key={cat} variant={HIGH_SEVERITY.has(cat) ? "destructive" : "secondary"} className="text-[10px]">{CATEGORY_LABELS[cat] ?? cat}</Badge>
                  ))}
                  {report.categories.length > 2 && <Badge variant="outline" className="text-[10px]">+{report.categories.length - 2}</Badge>}
                </div>
                <Badge variant="outline" className={`shrink-0 text-[10px] ${STATUS_STYLE[report.status] ?? ""}`}>{report.status.replace(/_/g, " ")}</Badge>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" />Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
          {selected?.targetImage && (
            <div className="relative h-40 w-full bg-muted overflow-hidden shrink-0">
              <img src={ipfsToHttp(selected.targetImage)} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <Badge variant="outline" className={`absolute bottom-3 left-4 text-[10px] ${STATUS_STYLE[selected.status] ?? ""}`}>{selected.status.replace(/_/g, " ")}</Badge>
            </div>
          )}
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="truncate">{selected?.targetName ?? selected?.targetKey}</span>
                {selected && (
                  <a href={targetPageUrl(selected)} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </a>
                )}
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <Badge variant="outline" className="capitalize text-[10px]">{selected.targetType.toLowerCase()}</Badge>
                  {!selected.targetImage && (
                    <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[selected.status] ?? ""}`}>{selected.status.replace(/_/g, " ")}</Badge>
                  )}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(selected.createdAt)}</span>
                  {selected.reviewedAt && <span>Reviewed {timeAgo(selected.reviewedAt)}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.categories.map((cat) => (
                    <Badge key={cat} variant={HIGH_SEVERITY.has(cat) ? "destructive" : "secondary"}>{CATEGORY_LABELS[cat] ?? cat}</Badge>
                  ))}
                </div>
                {selected.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Reporter note</Label>
                    <p className="text-sm bg-muted rounded-lg p-3 italic">&ldquo;{selected.description}&rdquo;</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="admin-notes" className="text-sm font-medium">
                    Admin notes <span className="text-muted-foreground font-normal text-xs">(required for Hide / Dismiss)</span>
                  </Label>
                  <Textarea id="admin-notes" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal note about this decision…" className="resize-none h-20" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-wrap gap-2 px-6 pb-6 pt-0">
            {selected?.status !== "UNDER_REVIEW" && (
              <Button variant="outline" size="sm" disabled={acting} onClick={() => handleAction("UNDER_REVIEW")}><Eye className="h-3.5 w-3.5 mr-1.5" />Under Review</Button>
            )}
            {selected?.status !== "DISMISSED" && (
              <Button variant="ghost" size="sm" disabled={acting} onClick={() => handleAction("DISMISSED")}><XCircle className="h-3.5 w-3.5 mr-1.5" />Dismiss</Button>
            )}
            {selected?.status === "HIDDEN" ? (
              <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" disabled={acting} onClick={() => handleAction("RESTORED")}><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Restore</Button>
            ) : (
              <Button variant="destructive" size="sm" disabled={acting} onClick={() => handleAction("HIDDEN")}><EyeOff className="h-3.5 w-3.5 mr-1.5" />Hide from Platform</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
