import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { IrisFocus } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

interface FocusChartProps {
  focusData: IrisFocus[];
}

const chartConfig = {
  duration: {
    label: "Duration",
    color: "hsl(142, 76%, 36%)", // Green for focused
  },
} satisfies ChartConfig;

export function FocusChart({ focusData }: FocusChartProps) {
  // Transform data for the chart - single line with color coding
  const chartData = focusData.map((item) => {
    const time = new Date(item.timestamp);
    const timeString = time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return {
      time: timeString,
      timestamp: item.timestamp,
      duration: item.duration,
      state: item.state,
      // Use different colors based on state
      color:
        item.state === "focused" ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
    };
  });

  // Calculate stats
  const totalFocusedTime = focusData
    .filter((item) => item.state === "focused")
    .reduce((sum, item) => sum + item.duration, 0);

  const totalUnfocusedTime = focusData
    .filter((item) => item.state === "unfocused")
    .reduce((sum, item) => sum + item.duration, 0);

  const totalTime = totalFocusedTime + totalUnfocusedTime;
  const focusPercentage =
    totalTime > 0 ? Math.round((totalFocusedTime / totalTime) * 100) : 0;

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Custom dot component to handle different colors
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color =
      payload.state === "focused" ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)";

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke={color}
        strokeWidth={2}
      />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Focus Duration Over Time</CardTitle>
        <CardDescription>
          Eye tracking focus duration throughout the day - {focusPercentage}%
          focused
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                label={{
                  value: "Duration (seconds)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "hsl(var(--muted-foreground))",
                  },
                }}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Time
                            </span>
                            <span className="font-bold">{label}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Duration
                            </span>
                            <span className="font-bold">
                              {formatDuration(data.duration)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                data.state === "focused"
                                  ? "hsl(142, 76%, 36%)"
                                  : "hsl(0, 84%, 60%)",
                            }}
                          />
                          <span className="text-sm font-medium capitalize">
                            {data.state}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                dataKey="duration"
                type="monotone"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={<CustomDot />}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <div className="flex items-center gap-4 px-6 pb-4">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "hsl(142, 76%, 36%)" }}
          />
          <span className="text-sm text-muted-foreground">
            Focused: {formatDuration(totalFocusedTime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "hsl(0, 84%, 60%)" }}
          />
          <span className="text-sm text-muted-foreground">
            Unfocused: {formatDuration(totalUnfocusedTime)}
          </span>
        </div>
        <div className="ml-auto text-sm font-medium">
          Focus Rate: {focusPercentage}%
        </div>
      </div>
    </Card>
  );
}
