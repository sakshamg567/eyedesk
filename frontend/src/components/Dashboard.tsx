import { mockAppSessions, mockIrisFocus } from "../mockdata";
import { StatsOverview } from "./StatsOverview";
import { AppSessionsTable } from "./AppSessionsTable";
import { FocusChart } from "./FocusChart";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            EyeDesk Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your application usage and focus patterns
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview sessions={mockAppSessions} focusData={mockIrisFocus} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Focus Chart */}
          <FocusChart focusData={mockIrisFocus} />

          {/* Additional Stats or Charts can go here */}
          <div className="space-y-6">
            {/* You can add more components here like productivity metrics, etc. */}
          </div>
        </div>

        {/* App Sessions Table */}
        <AppSessionsTable sessions={mockAppSessions} />
      </div>
    </div>
  );
}
