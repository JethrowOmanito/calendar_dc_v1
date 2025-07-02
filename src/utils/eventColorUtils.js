export const getEventColorClass = (event) => {
  const extra = Array.isArray(event.Extra_Service) ? event.Extra_Service : [];
  if (extra.includes("Tenancy") || extra.includes("Renovation")) return "event-blue";
  if (extra.includes("Disinfection")) return "event-red";
  if (extra.includes("Formaldehyde")) return "event-black";
  if (extra.includes("Aircon")) return "event-green";
  if (extra.includes("Scrubbing")) return "event-violet";
  if (extra.includes("1x Session") || extra.includes("4x Session")) return "event-yellow";
  if (extra.includes("Coating")) return "event-brown";

  if (event.Service_Type && event.Service_Type.trim().toLowerCase() === "curtain") {
    if (event.Extra_Service?.includes("Collect")) return "event-lightgreen";
    if (event.Extra_Service?.includes("Hangback")) return "event-red";
  }
  
  if (event.Service_Type && event.Service_Type.trim().toLowerCase() === "upholstery") return "event-pink";

  return "";
};

export const getEventGradient = (event) => {
  const extra = Array.isArray(event.Extra_Service) ? event.Extra_Service : [];
  if (extra.length < 2) return undefined;

  const colorMap = {
    "Tenancy": "#90caf9",         // Light Blue
    "Renovation": "#90caf9",      // Light Blue
    "Disinfection": "#ff8a80",    // Light Red
    "Formaldehyde": "#bdbdbd",    // Light Grey
    "Aircon": "#a5d6a7",          // Light Green
    "Scrubbing": "#b39ddb",       // Light Purple
    "1x Session": "#fff59d",      // Light Yellow
    "4x Session": "#fff59d",      // Light Yellow
    "Coating": "#ffe082",         // Light Orange
    "Extra Ladder (>1200sqft)": "#bcaaa4" // Light Brown
  };

  const colors = extra.map(e => colorMap[e] || "#ccc");
  const percent = 100 / colors.length;
  let stops = [];
  for (let i = 0; i < colors.length; i++) {
    const start = i * percent;
    const end = (i + 1) * percent;
    stops.push(`${colors[i]} ${start}% ${end}%`);
  }
  return `linear-gradient(90deg, ${stops.join(", ")})`;
};