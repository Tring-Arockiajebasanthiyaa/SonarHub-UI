import { useQuery } from "@apollo/client";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import { useState } from "react";
import { GET_SCAN_RESULTS} from "../graphql/queries"

const COLORS = ["#FF5733", "#33FF57", "#5733FF", "#FFD700"];

const Dashboard = () => {
  const [username] = useState("current_logged_in_user"); // Replace with auth context

  const { loading, error, data } = useQuery(GET_SCAN_RESULTS, {
    variables: { username },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const latestScan = data.getUserScanResults[0]; // Get latest scan data

  const pieData = [
    { name: "Bugs", value: latestScan.totalBugs },
    { name: "Vulnerabilities", value: latestScan.vulnerabilities },
    { name: "Code Smells", value: latestScan.codeSmells },
    { name: "Duplications", value: latestScan.duplications },
  ];

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">SonarQube Scan Results</h1>
      <PieChart width={400} height={400}>
        <Pie
          data={pieData}
          cx={200}
          cy={200}
          label
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default Dashboard;
