import DashboardShell from "@/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      workspaceName="V3NJA WRLD"
      instagramUsername="v3nja2.0"
      instagramAccountCount={1}
    >
      {children}
    </DashboardShell>
  );
}
