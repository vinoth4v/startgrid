import RequestForm from "./RequestForm";

export default function RequestAccessPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const role = searchParams.role === "investor" ? "investor" : "startup";
  return <RequestForm defaultRole={role} />;
}
