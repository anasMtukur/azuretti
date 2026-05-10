import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/helpers";
import { buildPeriod, buildExporterReport, reportToCsv } from "@/lib/reports";
import type { PeriodMode } from "@/lib/reports";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const p = new URL(req.url).searchParams;
  const period = buildPeriod({
    mode:  (p.get("mode")  ?? "all") as PeriodMode,
    year:  p.get("year")  ? parseInt(p.get("year")!)  : undefined,
    month: p.get("month") ? parseInt(p.get("month")!) : undefined,
    from:  p.get("from")  ?? undefined,
    to:    p.get("to")    ?? undefined,
  });

  const report = await buildExporterReport(params.id, period);

  const format = p.get("format") ?? "json";
  if (format === "csv") {
    return new NextResponse(reportToCsv(report as any), {
      headers: {
        "Content-Type":        "text/csv",
        "Content-Disposition": `attachment; filename="exporter-report-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json(report);
}