import { AppSession } from "../types";
import { formatDuration, formatTime } from "../utils/formatters";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface AppSessionsTableProps {
  sessions: AppSession[];
}

const getAppColor = (appName: string): string => {
  const colors: Record<string, string> = {
    Chrome: "bg-blue-100 text-blue-800",
    VSCode: "bg-purple-100 text-purple-800",
    Discord: "bg-indigo-100 text-indigo-800",
    Slack: "bg-green-100 text-green-800",
    Figma: "bg-pink-100 text-pink-800",
  };
  return colors[appName] || "bg-gray-100 text-gray-800";
};

export function AppSessionsTable({ sessions }: AppSessionsTableProps) {
  const totalDuration = sessions.reduce(
    (sum, session) => sum + session.duration_seconds,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Sessions</CardTitle>
        <CardDescription>
          Recent application usage sessions. Total time:{" "}
          {formatDuration(totalDuration)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application</TableHead>
              <TableHead>Window Title</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <Badge
                    className={getAppColor(session.app_name)}
                    variant="secondary"
                  >
                    {session.app_name}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {session.window_title}
                </TableCell>
                <TableCell>{formatTime(session.start_time)}</TableCell>
                <TableCell>{formatTime(session.end_time)}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatDuration(session.duration_seconds)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
