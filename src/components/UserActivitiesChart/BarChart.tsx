import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = ({ sonarIssues }: { sonarIssues: any[] }) => {
  const issueCounts = sonarIssues.reduce((acc: Record<string, number>, issue: { severity: string }) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(issueCounts),
    datasets: [
      {
        label: "Sonar Issues",
        data: Object.values(issueCounts),
        backgroundColor: ["red", "orange", "yellow", "green"],
      },
    ],
  };

  return <Bar data={data} />;
};

export default BarChart; // Default export