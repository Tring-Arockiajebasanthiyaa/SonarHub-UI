import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale, // Import the missing scale
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale, // Register it here
  Title,
  Tooltip,
  Legend
);

interface Commit {
  repo: string;
}

interface ActivityRadarChartProps {
  data: Commit[];
}

const ActivityRadarChart: React.FC<ActivityRadarChartProps> = ({ data }) => {
  const labels = [...new Set(data.map((commit) => commit.repo))];
  const commitCounts = labels.map(
    (repo) => data.filter((commit) => commit.repo === repo).length
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Commits per Repo",
        data: commitCounts,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  return <Radar data={chartData} />;
};

export default ActivityRadarChart;
