import { AppSession, IrisFocus } from "../types";
import { formatDuration } from "../utils/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Clock, Eye, Monitor, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  sessions: AppSession[];
  focusData: IrisFocus[];
}

export function StatsOverview({ sessions, focusData }: StatsOverviewProps) {
  const totalDuration = sessions.reduce(
    (sum, session) => sum + session.duration_seconds,
    0,
  );
  const averageSessionDuration =
    sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;
  const focusedCount = focusData.filter((item) => item.focused).length;
  const focusPercentage =
    focusData.length > 0
      ? Math.round((focusedCount / focusData.length) * 100)
      : 0;

  // Calculate app usage distribution
  const appUsage = sessions.reduce(
    (acc, session) => {
      acc[session.app_name] =
        (acc[session.app_name] || 0) + session.duration_seconds;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topApp = Object.entries(appUsage).sort(([, a], [, b]) => b - a)[0];

  const stats = [
    {
      title: "Total Screen Time",
      value: formatDuration(totalDuration),
      description: "Across all applications",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Focus Rate",
      value: `${focusPercentage}%`,
      description: `${focusedCount}/${focusData.length} focused events`,
      icon: Eye,
      color: "text-green-600",
    },
    {
      title: "Active Sessions",
      value: sessions.length.toString(),
      description: `Avg: ${formatDuration(averageSessionDuration)}`,
      icon: Monitor,
      color: "text-purple-600",
    },
    {
      title: "Top Application",
      value: topApp ? topApp[0] : "N/A",
      description: topApp ? formatDuration(topApp[1]) : "No data",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.title === "Focus Rate" && (
                <Progress value={focusPercentage} className="mt-2" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
