
export const LINE_OF_BUSINESS_CATEGORIES = [
  {
    code: "A",
    label: "A. Agriculture, forestry and fishing",
    examples: [
      "Rice farming / palay production",
      "Hog raising / piggery",
      "Poultry farm (chicken, eggs)",
      "Fishpond / aquaculture operation",
      "Mango / sugarcane / banana plantation",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // livestock, poultry, food handling
      environmentalCertificate: true,    // farms, piggeries, aquaculture, plantations
      marketClearance: true,            // only if selling via public market stall
      agriRegistration: true,           // aquaculture / fish cage / oyster, etc.
    },
  },
  {
    code: "B",
    label: "B. Mining and quarrying",
    examples: [
      "Sand and gravel quarrying",
      "Limestone quarrying",
      "Small-scale gold mining",
      "Nickel mining operation",
      "Coal mining operation",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: true,    // high environmental impact
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "C",
    label: "C. Manufacturing",
    examples: [
      "Bread and pastry manufacturing / bakery plant",
      "Ice manufacturing (ice plant)",
      "Furniture manufacturing (wood/metal furniture)",
      "Garments / clothing factory",
      "Bottled water manufacturing plant",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // food handling / workers’ health
      environmentalCertificate: true,    // emissions, waste, noise, etc.
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "D",
    label: "D. Electricity, gas, steam and air conditioning supply",
    examples: [
      "Electric power distribution utility / electric cooperative",
      "Solar power generation company",
      "LPG refilling plant",
      "Industrial gas supply (oxygen, nitrogen, etc.)",
      "District cooling / central air conditioning service for buildings",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: true,    // hazardous / energy facilities
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "E",
    label:
      "E. Water supply; sewerage, waste management and remediation activities",
    examples: [
      "Water utility / waterworks company",
      "Septic tank desludging service",
      "Garbage collection and hauling company",
      "Materials Recovery Facility (MRF) / recycling center",
      "Waste treatment and disposal facility",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // strong public-health component
      environmentalCertificate: true,    // waste / pollution-related
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "F",
    label: "F. Construction",
    examples: [
      "General building contractor (houses, buildings)",
      "Road and highway construction contractor",
      "Electrical works contractor",
      "Plumbing and sanitary contractor",
      "Residential housing developer / contractor",
    ],
    requirements: {
      occupancyPermit: true,             // office / yard
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: true,    // for major projects / batching plants, etc.
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "G",
    label:
      "G. Wholesale and retail trade; repair of motor vehicles and motorcycles",
    examples: [
      "Sari-sari store",
      "Grocery / supermarket / mini-mart",
      "Pharmacy / drugstore",
      "Hardware and construction materials store",
      "Auto repair and vulcanizing shop",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // especially food, drugs, etc.
      environmentalCertificate: false,
      marketClearance: true,            // if stall holder in public market
      agriRegistration: false,
    },
  },
  {
    code: "H",
    label: "H. Transport and storage",
    examples: [
      "Trucking and cargo hauling services",
      "Bus company / public transport operator",
      "Taxi / TNVS operator",
      "Tricycle-for-hire association/operator",
      "Warehouse and cold storage operator",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,             // except if terminal has food/CR (LGU may add)
      environmentalCertificate: true,    // depots, garages, fuel, emissions
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "I",
    label: "I. Accommodation and food service activities",
    examples: [
      "Hotel / resort",
      "Pension house / lodging house",
      "Restaurant",
      "Carinderia / eatery / turo-turo",
      "Catering services",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // food handling & lodging
      environmentalCertificate: true,    // kitchens, wastewater, resorts
      marketClearance: true,            // if stall / food stall inside public market
      agriRegistration: false,
    },
  },
  {
    code: "J",
    label: "J. Information and communication",
    examples: [
      "Internet café / computer shop",
      "Telecommunications company (phone/internet provider)",
      "Software development services",
      "Web design / web development services",
      "Cable TV / internet service provider (ISP)",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "K",
    label: "K. Financial and insurance activities",
    examples: [
      "Rural bank / thrift bank",
      "Pawnshop",
      "Microfinance / lending company",
      "Money remittance center",
      "Insurance agency / insurance brokerage",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "L",
    label: "L. Real estate activities",
    examples: [
      "Apartment / boarding house rental business",
      "Commercial building lessor (renting spaces to stores/offices)",
      "Subdivision / housing project developer",
      "Condominium leasing business",
      "Real estate brokerage / agency",
    ],
    requirements: {
      occupancyPermit: true,             // buildings / apartments
      zoningClearance: true,
      sanitaryPermit: true,              // esp. boarding houses, dorms
      environmentalCertificate: true,    // subdivisions, big developments
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "M",
    label: "M. Professional, scientific and technical activities",
    examples: [
      "Law office / legal services",
      "Accounting / auditing firm",
      "Engineering consultancy firm",
      "Architectural design firm",
      "Surveying / geodetic engineering services",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "N",
    label: "N. Administrative and support service activities",
    examples: [
      "Manpower / staffing agency",
      "Security agency",
      "Janitorial and cleaning services",
      "Call center / BPO company",
      "Travel agency / ticketing office",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "O",
    label:
      "O. Public administration and defence; compulsory social security",
    examples: [
      "City / municipal government office",
      "Barangay hall / barangay government",
      "Bureau of Internal Revenue (BIR) office",
      "Philippine National Police (PNP) station",
      "SSS / GSIS branch office",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "P",
    label: "P. Education",
    examples: [
      "Private elementary or high school",
      "College / university",
      "Tutorial center",
      "Daycare / early childhood learning center",
      "Review center (board exam, civil service, etc.)",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // classrooms, canteens, CRs
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "Q",
    label: "Q. Human health and social work activities",
    examples: [
      "Hospital (public or private)",
      "Medical clinic",
      "Dental clinic",
      "Diagnostic laboratory (X-ray, lab tests)",
      "Home for the aged / orphanage / rehabilitation center",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // health facilities
      environmentalCertificate: true,    // medical waste, x-ray, etc.
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "R",
    label: "R. Arts, entertainment and recreation",
    examples: [
      "Cinema / movie theater",
      "Karaoke bar / KTV",
      "Amusement arcade / game center",
      "Gym / fitness center",
      "Events organizing / party planning services",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // gyms, KTV, crowding
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "S",
    label: "S. Other service activities",
    examples: [
      "Beauty salon / barbershop",
      "Spa / massage clinic",
      "Laundry and dry-cleaning shop",
      "Funeral parlor / memorial services",
      "Repair of appliances and gadgets",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: true,              // personal-care, laundry, funeral
      environmentalCertificate: true,    // chemicals, embalming, etc.
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "T",
    label:
      "T. Activities of households as employers; household production for own use",
    examples: [
      "Household employing a kasambahay",
      "Household employing a family driver",
      "Household employing a caregiver / yaya",
      "Household employing a gardener",
      "Household producing goods for own consumption (family backyard garden only for family use)",
    ],
    // Typically not covered by LGU business permits
    requirements: {
      occupancyPermit: false,
      zoningClearance: false,
      sanitaryPermit: false,
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
  {
    code: "U",
    label: "U. Activities of extraterritorial organizations and bodies",
    examples: [
      "Embassy of a foreign country",
      "Consulate office",
      "United Nations (UN) office in the Philippines",
      "ASEAN or other international organization office",
      "International NGO’s country mission/representation office",
    ],
    requirements: {
      occupancyPermit: true,
      zoningClearance: true,
      sanitaryPermit: false,
      environmentalCertificate: false,
      marketClearance: false,
      agriRegistration: false,
    },
  },
];
// src/Component/businesspermit/lineOfBusinessConfig.js

export function getRequirementsForLine(lineLabelOrCode) {
  if (!lineLabelOrCode) return null;
  const s = String(lineLabelOrCode).toLowerCase().trim();

  const match = LINE_OF_BUSINESS_CATEGORIES.find((cat) => {
    // 1) match code, e.g. "A"
    if (String(cat.code || "").toLowerCase() === s) return true;

    // 2) match full label
    const full = String(cat.label || "").toLowerCase().trim();
    if (full === s) return true;

    // 3) allow partial label
    if (full.includes(s) || s.includes(full)) return true;

    // 4) NEW: match against examples text
    if (Array.isArray(cat.examples)) {
      const exHit = cat.examples.some((ex) => {
        const e = String(ex || "").toLowerCase().trim();
        return e === s || e.includes(s) || s.includes(e);
      });
      if (exHit) return true;
    }

    return false;
  });

  return match?.requirements || null;
}

