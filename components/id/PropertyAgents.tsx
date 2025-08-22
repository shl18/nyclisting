import React from "react";

interface Agent {
  name: string;
  title: string;
  company?: string;
  phone: string;
  image: string;
}

interface PropertyAgentsProps {
  agents: Agent[];
}

const PropertyAgents: React.FC<PropertyAgentsProps> = ({ agents }) => {
  // Filter out unknown agents
  const validAgents = agents.filter((agent) => agent.name !== "Unknown Agent");

  // If no valid agents, don't render anything
  if (validAgents.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-4">LISTED BY:</h2>
      <div className="space-y-3">
        {validAgents.map((agent, index) => (
          <div key={index} className="border-2 border-[#CBCBFA] rounded-xl p-4">
            <div className="flex gap-4 items-center">
              <div className="bg-gray-200 w-12 h-12 rounded-md flex-shrink-0">
                {agent.image && (
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                )}
              </div>
              <div>
                <div className="font-medium font-sans uppercase text-gray-800">
                  {agent.name}
                </div>
                <div className="text-xs text-gray-500 mb-1">{agent.title}</div>
                <div className="text-xs text-gray-600">
                  <span className="inline-block mr-1">
                    {agent.company ? "◎" : " "}
                  </span>
                  {agent.company || ""}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyAgents;
