// permitsData.js

export const permits = {
    business: [
      { name: "Business Permit", description: "Required to legally operate a business within the municipality." },
      { name: "Mayor's Permit", description: "A general permit issued by the mayor's office for businesses, events, or special activities." },
      { name: "Market Stall Permit", description: "Allows vendors to operate in public markets." },
      { name: "Special Sales Permit", description: "Required for promotional sales, discounts, or special selling activities." }
    ],
    construction: [
      { name: "Building Permit", description: "Necessary before constructing, repairing, or renovating a structure." },
      { name: "Occupancy Permit", description: "Required before a newly constructed building can be occupied." },
      { name: "Zoning Permit", description: "Ensures compliance with local zoning laws for land use." },
      { name: "Demolition Permit", description: "Needed before demolishing a building or structure." },
      { name: "Excavation Permit", description: "Required for digging, road works, or underground installations." }
    ],
    health: [
      { name: "Health/Sanitary Permit", description: "Ensures compliance with hygiene and health regulations for businesses." },
      { name: "Food Handler's Permit", description: "Required for workers in food establishments." },
      { name: "Medical Certificate Permit", description: "Needed for employment, school, or travel purposes." }
    ],
    environmental: [
      { name: "Tree Cutting Permit", description: "Required for cutting trees in public or private areas." },
      { name: "Waste Disposal Permit", description: "For businesses that need proper waste management approval." },
      { name: "Environmental Compliance Certificate (ECC)", description: "Ensures projects comply with environmental laws." }
    ],
    event: [
      { name: "Parade or Public Gathering Permit", description: "Needed for processions, demonstrations, or gatherings in public spaces." },
      { name: "Fireworks Display Permit", description: "Required for pyrotechnic displays during celebrations." },
      { name: "Fiesta or Festival Permit", description: "Necessary for organizing local events and festivals." }
    ],
    transportation: [
      { name: "Tricycle/Jeepney Franchise Permit", description: "Required for public utility vehicles to operate legally." },
      { name: "Loading/Unloading Zone Permit", description: "Given to businesses for designated loading/unloading areas." },
      { name: "Road Closure Permit", description: "Needed for temporary roadblocks due to events or repairs." }
    ]
  };
  
  export const categories = [
    { id: 'business', name: 'Business & Commercial' },
    { id: 'construction', name: 'Construction & Land Use' },
    { id: 'health', name: 'Health & Sanitation' },
    { id: 'environmental', name: 'Environmental' },
    { id: 'event', name: 'Event & Public Gathering' },
    { id: 'transportation', name: 'Transportation & Vehicle' }
  ];
  