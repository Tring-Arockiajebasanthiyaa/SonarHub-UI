import React from "react";
import { Line } from "react-chartjs-2";

const LineChart = ({ commitHistory }: { commitHistory: any[] }) => {
    const commitsByDate = commitHistory.reduce((acc: Record<string, number>, commit: { date: string; commits: any[] }) => {
      const date = commit.date.split("T")[0];
      acc[date] = (acc[date] || 0) + commit.commits.length;
      return acc;
    }, {});
  

  const data = {
    labels: Object.keys(commitsByDate),
    datasets: [
      {
        label: "Commits Over Time",
        data: Object.values(commitsByDate),
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return <Line data={data} />;
};

export default LineChart;
