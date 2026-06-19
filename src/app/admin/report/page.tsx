import { getReportHistory } from "@/app/actions/admin-report";
import ReportClient from "./ReportClient";

export default async function AdminReportPage() {
  const history = await getReportHistory();
  return <ReportClient history={history} />;
}
