import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MetricsChartProps {
  data: {
    name: string;
    "License Utilization": number;
    "User Health": number;
    "System Capacity": number;
  }[];
  variant?: "line" | "bar";
}

export const MetricsChart = ({ data, variant = "line" }: MetricsChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      {variant === "line" ? (
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
          <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="License Utilization"
            stroke="#3b82f6"
            strokeWidth={2}
            dot
          />
          <Line
            type="monotone"
            dataKey="User Health"
            stroke="#10b981"
            strokeWidth={2}
            dot
          />
          <Line
            type="monotone"
            dataKey="System Capacity"
            stroke="#f59e0b"
            strokeWidth={2}
            dot
          />
        </LineChart>
      ) : (
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
          <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend />
          <Bar dataKey="License Utilization" fill="#3b82f6" />
          <Bar dataKey="User Health" fill="#10b981" />
          <Bar dataKey="System Capacity" fill="#f59e0b" />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};
