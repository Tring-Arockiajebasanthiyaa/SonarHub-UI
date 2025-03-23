import React from "react";
import { Sankey } from "@nivo/sankey";

const CommitSankeyChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const links = data.map((commit) => ({
    source: commit.repo,
    target: commit.date ? commit.date.split("T")[0] : "Unknown Date",
    value: typeof commit.commits?.length === "number" ? commit.commits.length : 1,
  }));
  

  // Ensure nodes only include elements in links
  const nodes = Array.from(
    new Set(links.flatMap(({ source, target }) => [source, target]))
  ).map((id) => ({ id }));

  console.log("Generated Nodes:", nodes);
  console.log("Generated Links:", links);

  return (
    <div style={{ height: 300, width: "100%" }}>
      <Sankey
        width={600}
        height={300}
        data={{ nodes, links }}
        align="justify"
        colors={{ scheme: "category10" }}
      />
    </div>
  );
};

export default CommitSankeyChart;
