// Centralized mock data for the frontend-only phase.
// Each selector at the bottom maps to a future API endpoint, so pages only
// need their data source swapped when the backend is connected.

import type {
  Payment,
  Property,
  RentalRequest,
  RentalRequestDetails,
  Review,
  Role,
  User,
} from "./types";

const photo = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const avatar = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&w=200&h=200&q=80`;

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export const users: User[] = [
  {
    id: "u-a1",
    name: "Raisa Haque",
    email: "raisa.haque@rentnest.com",
    phone: "+880 1711-000001",
    role: "ADMIN",
    avatarUrl: avatar("1544005313-94ddf0286df2"),
    status: "ACTIVE",
    createdAt: "2025-01-04T09:00:00Z",
  },
  // Landlords
  {
    id: "u-l1",
    name: "Tanvir Ahmed",
    email: "tanvir.ahmed@example.com",
    phone: "+880 1712-345678",
    role: "LANDLORD",
    avatarUrl: avatar("1500648767791-00dcc994a43e"),
    status: "ACTIVE",
    createdAt: "2025-02-11T10:30:00Z",
  },
  {
    id: "u-l2",
    name: "Nusrat Jahan",
    email: "nusrat.jahan@example.com",
    phone: "+880 1819-224466",
    role: "LANDLORD",
    avatarUrl: avatar("1494790108377-be9c29b29330"),
    status: "ACTIVE",
    createdAt: "2025-03-02T08:15:00Z",
  },
  {
    id: "u-l3",
    name: "Imran Chowdhury",
    email: "imran.chowdhury@example.com",
    phone: "+880 1913-778899",
    role: "LANDLORD",
    avatarUrl: avatar("1507003211169-0a1dd7228f2d"),
    status: "ACTIVE",
    createdAt: "2025-03-20T14:45:00Z",
  },
  {
    id: "u-l4",
    name: "Sabrina Karim",
    email: "sabrina.karim@example.com",
    phone: "+880 1556-102030",
    role: "LANDLORD",
    avatarUrl: avatar("1438761681033-6461ffad8d80"),
    status: "ACTIVE",
    createdAt: "2025-05-08T11:00:00Z",
  },
  // Tenants
  {
    id: "u-t1",
    name: "Arif Hossain",
    email: "arif.hossain@example.com",
    phone: "+880 1715-998877",
    role: "TENANT",
    avatarUrl: avatar("1472099645785-5658abf4ff4e"),
    status: "ACTIVE",
    createdAt: "2025-04-14T16:20:00Z",
  },
  {
    id: "u-t2",
    name: "Mehjabin Akter",
    email: "mehjabin.akter@example.com",
    phone: "+880 1816-443322",
    role: "TENANT",
    avatarUrl: avatar("1534528741775-53994a69daeb"),
    status: "ACTIVE",
    createdAt: "2025-05-21T12:00:00Z",
  },
  {
    id: "u-t3",
    name: "Rafiq Islam",
    email: "rafiq.islam@example.com",
    phone: "+880 1911-556677",
    role: "TENANT",
    avatarUrl: avatar("1506794778202-cad84cf45f1d"),
    status: "ACTIVE",
    createdAt: "2025-06-03T09:40:00Z",
  },
  {
    id: "u-t4",
    name: "Sadia Rahman",
    email: "sadia.rahman@example.com",
    phone: "+880 1717-121314",
    role: "TENANT",
    avatarUrl: avatar("1517841905240-472988babdf9"),
    status: "ACTIVE",
    createdAt: "2025-06-27T18:05:00Z",
  },
  {
    id: "u-t5",
    name: "Kamrul Hasan",
    email: "kamrul.hasan@example.com",
    phone: "+880 1818-909090",
    role: "TENANT",
    avatarUrl: avatar("1539571696357-5a69c17a67c6"),
    status: "ACTIVE",
    createdAt: "2025-07-15T07:30:00Z",
  },
  {
    id: "u-t6",
    name: "Tahmina Sultana",
    email: "tahmina.sultana@example.com",
    phone: "+880 1612-505050",
    role: "TENANT",
    avatarUrl: avatar("1531123897727-8f129e1688ce"),
    status: "ACTIVE",
    createdAt: "2025-08-09T13:10:00Z",
  },
  {
    id: "u-t7",
    name: "Zubair Alam",
    email: "zubair.alam@example.com",
    phone: "+880 1913-616161",
    role: "TENANT",
    avatarUrl: avatar("1599566150163-29194dcaad36"),
    status: "BANNED",
    createdAt: "2025-08-30T10:00:00Z",
  },
  {
    id: "u-t8",
    name: "Anika Chowdhury",
    email: "anika.chowdhury@example.com",
    phone: "+880 1714-787878",
    role: "TENANT",
    avatarUrl: avatar("1580489944761-15a19d654956"),
    status: "ACTIVE",
    createdAt: "2025-09-12T15:25:00Z",
  },
];

/** Stand-ins for the signed-in user of each role until real auth exists. */
export const CURRENT_USER_IDS = {
  TENANT: "u-t1",
  LANDLORD: "u-l1",
  ADMIN: "u-a1",
} as const;

/* ------------------------------------------------------------------ */
/* Properties                                                          */
/* ------------------------------------------------------------------ */

export const properties: Property[] = [
  {
    id: "p-1001",
    title: "Sunlit 3-Bed Apartment near Gulshan Lake",
    description:
      "A bright, south-facing apartment on the 7th floor with an open living and dining area, a fully fitted kitchen and lake views from the master bedroom. The building has a staffed reception, two lifts and full generator backup. Walking distance to Gulshan 2 circle, cafés and international schools.",
    location: { address: "Road 71, Gulshan 2", area: "Gulshan", city: "Dhaka" },
    price: 85000,
    type: "APARTMENT",
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1850,
    amenities: ["Air conditioning", "Wi-Fi", "Parking", "Lift", "Generator backup", "24/7 security", "Balcony"],
    images: [
      photo("1502672260266-1c1ef2d93688"),
      photo("1493809842364-78817add7ffb"),
      photo("1484154218962-a197022b5858"),
      photo("1505691938895-1758d7feb511"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: true,
    landlordId: "u-l1",
    createdAt: "2026-07-02T10:00:00Z",
  },
  {
    id: "p-1002",
    title: "Modern Family House with Private Garden",
    description:
      "A two-storey family home on a quiet residential lane with a landscaped garden, covered parking for two cars and a separate study. Large windows keep the living spaces bright through the day. Close to Uttara's metro station, markets and parks.",
    location: { address: "Road 12, Sector 7", area: "Uttara", city: "Dhaka" },
    price: 120000,
    type: "HOUSE",
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 2600,
    amenities: ["Parking", "Garden", "Generator backup", "24/7 security", "Air conditioning", "Balcony"],
    images: [
      photo("1568605114967-8130f3a36994"),
      photo("1556912173-3bb406ef7e77"),
      photo("1600607687939-ce8a6c25118c"),
      photo("1631049307264-da0ec9d70304"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: true,
    landlordId: "u-l2",
    createdAt: "2026-06-18T09:30:00Z",
  },
  {
    id: "p-1003",
    title: "Cozy Studio for Young Professionals",
    description:
      "A compact, well-planned studio with a kitchenette, built-in storage and a work nook by the window. Fully furnished and ready to move in. Ideal for a single professional working in the Banani–Gulshan business district.",
    location: { address: "Road 11, Block E", area: "Banani", city: "Dhaka" },
    price: 22000,
    type: "STUDIO",
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 520,
    amenities: ["Furnished", "Wi-Fi", "Air conditioning", "Lift", "24/7 security"],
    images: [
      photo("1536376072261-38c75010e6c9"),
      photo("1554995207-c18c203602cb"),
      photo("1552321554-5fefe8c9ef14"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: false,
    landlordId: "u-l1",
    createdAt: "2026-08-05T12:00:00Z",
  },
  {
    id: "p-1004",
    title: "Spacious Duplex with Rooftop Terrace",
    description:
      "Top-floor duplex spread over two levels with a private rooftop terrace, double-height living room and four generous bedrooms. Comes with dedicated parking and a servant's quarter. Minutes from Dhanmondi Lake and Road 27 shopping.",
    location: { address: "Road 9A", area: "Dhanmondi", city: "Dhaka" },
    price: 150000,
    type: "DUPLEX",
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 3200,
    amenities: ["Rooftop access", "Parking", "Lift", "Generator backup", "Air conditioning", "24/7 security"],
    images: [
      photo("1600596542815-ffad4c1539a9"),
      photo("1600566753190-17f0baa2a6c3"),
      photo("1586023492125-27b2c045efd7"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: true,
    landlordId: "u-l3",
    createdAt: "2026-05-27T15:00:00Z",
  },
  {
    id: "p-1005",
    title: "Furnished 2-Bed Apartment in Bashundhara",
    description:
      "A furnished two-bedroom apartment with modern fittings, a balcony overlooking a green courtyard and high-speed internet already installed. Close to North South University, AIUB and Jamuna Future Park.",
    location: { address: "Road 5, Block D", area: "Bashundhara R/A", city: "Dhaka" },
    price: 42000,
    type: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1250,
    amenities: ["Furnished", "Wi-Fi", "Lift", "Balcony", "Generator backup", "24/7 security"],
    images: [
      photo("1522708323590-d24dbb6b0267"),
      photo("1560185007-cde436f6a4d0"),
      photo("1507089947368-19c1da9775ae"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: true,
    landlordId: "u-l2",
    createdAt: "2026-07-21T08:00:00Z",
  },
  {
    id: "p-1006",
    title: "Lakeview Villa with Pool in Baridhara",
    description:
      "A private villa in the diplomatic zone with a swimming pool, landscaped lawn and staff quarters. Five en-suite bedrooms, a formal dining room and a modern open kitchen. Round-the-clock security and backup power.",
    location: { address: "Road 4, Baridhara DOHS", area: "Baridhara", city: "Dhaka" },
    price: 280000,
    type: "VILLA",
    bedrooms: 5,
    bathrooms: 5,
    areaSqft: 5400,
    amenities: ["Swimming pool", "Garden", "Parking", "Gym", "Generator backup", "24/7 security", "Air conditioning"],
    images: [
      photo("1613490493576-7fde63acd811"),
      photo("1600585154340-be6161a56a0c"),
      photo("1600210492486-724fe5c67fb0"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: true,
    landlordId: "u-l3",
    createdAt: "2026-04-30T10:00:00Z",
  },
  {
    id: "p-1007",
    title: "Affordable 2-Bed Flat near Mirpur 10",
    description:
      "A practical two-bedroom flat close to the Mirpur 10 metro station, bus routes and local markets. Gas, water and lift service are reliable, and the building has a caretaker on site.",
    location: { address: "Section 10, Block C", area: "Mirpur", city: "Dhaka" },
    price: 24000,
    type: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1050,
    amenities: ["Lift", "Generator backup", "Balcony"],
    images: [
      photo("1560448204-e02f11c3d0e2"),
      photo("1493809842364-78817add7ffb"),
      photo("1552321554-5fefe8c9ef14"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: false,
    landlordId: "u-l4",
    createdAt: "2026-08-14T11:30:00Z",
  },
  {
    id: "p-1008",
    title: "Hillside Apartment in Khulshi",
    description:
      "A calm, airy apartment on the hills of Khulshi with views over the city. Three bedrooms, a large drawing room and a covered parking space. A short drive to GEC circle and the port area.",
    location: { address: "Khulshi Hill R/A", area: "Khulshi", city: "Chattogram" },
    price: 48000,
    type: "APARTMENT",
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 1600,
    amenities: ["Parking", "Lift", "Balcony", "Generator backup", "24/7 security"],
    images: [
      photo("1545324418-cc1a3fa10c00"),
      photo("1515263487990-61b07816b324"),
      photo("1484154218962-a197022b5858"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: true,
    landlordId: "u-l4",
    createdAt: "2026-06-09T13:00:00Z",
  },
  {
    id: "p-1009",
    title: "Quiet Studio near Dhanmondi Lake",
    description:
      "A quiet studio in a well-kept building two minutes from Dhanmondi Lake. Includes a kitchenette, wardrobe and a small balcony. Suits students and young professionals.",
    location: { address: "Road 8A", area: "Dhanmondi", city: "Dhaka" },
    price: 26000,
    type: "STUDIO",
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 600,
    amenities: ["Wi-Fi", "Balcony", "Lift", "Furnished"],
    images: [
      photo("1574362848149-11496d93a7c7"),
      photo("1554995207-c18c203602cb"),
    ],
    isAvailable: false,
    status: "APPROVED",
    featured: false,
    landlordId: "u-l1",
    createdAt: "2026-03-12T09:00:00Z",
  },
  {
    id: "p-1010",
    title: "Garden House in Sylhet Uposhohor",
    description:
      "A single-storey house with a front garden and a spacious veranda in one of Sylhet's most peaceful neighbourhoods. Three bedrooms, a separate dining area and parking for one car.",
    location: { address: "Block B, Uposhohor", area: "Uposhohor", city: "Sylhet" },
    price: 55000,
    type: "HOUSE",
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2100,
    amenities: ["Garden", "Parking", "Generator backup", "Balcony"],
    images: [
      photo("1570129477492-45c003edd2be"),
      photo("1556912173-3bb406ef7e77"),
      photo("1631049307264-da0ec9d70304"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: false,
    landlordId: "u-l2",
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "p-1011",
    title: "Executive Apartment on Banani Road 11",
    description:
      "A finished executive apartment with premium fittings, a gym and rooftop lounge in the building. Three bedrooms with attached baths, a formal living area and a separate family lounge.",
    location: { address: "Road 11, Block H", area: "Banani", city: "Dhaka" },
    price: 95000,
    type: "APARTMENT",
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2000,
    amenities: ["Gym", "Rooftop access", "Lift", "Parking", "Air conditioning", "Generator backup", "24/7 security"],
    images: [
      photo("1600210492486-724fe5c67fb0"),
      photo("1586023492125-27b2c045efd7"),
      photo("1552321554-5fefe8c9ef14"),
    ],
    isAvailable: true,
    status: "APPROVED",
    featured: false,
    landlordId: "u-l3",
    createdAt: "2026-08-28T16:00:00Z",
  },
  {
    id: "p-1012",
    title: "Family House near Agrabad Commercial Area",
    description:
      "A three-bedroom family house close to Agrabad's banks and offices, with a small front yard and covered parking. Recently repainted with new kitchen fittings.",
    location: { address: "Agrabad R/A", area: "Agrabad", city: "Chattogram" },
    price: 40000,
    type: "HOUSE",
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 1800,
    amenities: ["Parking", "Garden", "Generator backup"],
    images: [
      photo("1564013799919-ab600027ffc6"),
      photo("1576941089067-2de3c901e126"),
    ],
    isAvailable: true,
    status: "PENDING",
    featured: false,
    landlordId: "u-l4",
    createdAt: "2026-09-26T09:15:00Z",
  },
  {
    id: "p-1013",
    title: "New Townhouse in Uttara Sector 4",
    description:
      "A newly built townhouse with three bedrooms, a rooftop sitting area and private parking. Short walk to Uttara's lake park and the airport road.",
    location: { address: "Road 18, Sector 4", area: "Uttara", city: "Dhaka" },
    price: 68000,
    type: "HOUSE",
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2200,
    amenities: ["Rooftop access", "Parking", "Generator backup", "24/7 security"],
    images: [
      photo("1599809275671-b5942cabc7a2"),
      photo("1600607687939-ce8a6c25118c"),
    ],
    isAvailable: true,
    status: "PENDING",
    featured: false,
    landlordId: "u-l1",
    createdAt: "2026-09-30T14:00:00Z",
  },
];

/* ------------------------------------------------------------------ */
/* Rental requests                                                     */
/* ------------------------------------------------------------------ */

export const rentalRequests: RentalRequest[] = [
  {
    id: "r-5001",
    propertyId: "p-1001",
    tenantId: "u-t1",
    landlordId: "u-l1",
    moveInDate: "2026-11-01",
    durationMonths: 12,
    message: "Hi, I work in Gulshan and would like to move in at the start of November. I can share employment documents if needed.",
    monthlyRent: 85000,
    status: "APPROVED",
    createdAt: "2026-09-18T10:00:00Z",
  },
  {
    id: "r-5002",
    propertyId: "p-1003",
    tenantId: "u-t1",
    landlordId: "u-l1",
    moveInDate: "2026-11-15",
    durationMonths: 6,
    message: "Looking for a short-term place for a six-month project. Is the studio available mid-November?",
    monthlyRent: 22000,
    status: "PENDING",
    createdAt: "2026-09-29T08:30:00Z",
  },
  {
    id: "r-5003",
    propertyId: "p-1005",
    tenantId: "u-t1",
    landlordId: "u-l2",
    moveInDate: "2026-07-01",
    durationMonths: 12,
    message: "We are a family of three and would love to rent this apartment.",
    monthlyRent: 42000,
    status: "ACTIVE",
    createdAt: "2026-06-10T12:00:00Z",
  },
  {
    id: "r-5004",
    propertyId: "p-1009",
    tenantId: "u-t1",
    landlordId: "u-l1",
    moveInDate: "2026-08-01",
    durationMonths: 12,
    message: "Interested in the studio near the lake. Please let me know if viewing is possible.",
    monthlyRent: 26000,
    status: "REJECTED",
    landlordNote: "Thank you for your interest. The studio has already been let to another tenant for this period.",
    createdAt: "2026-07-05T09:00:00Z",
  },
  {
    id: "r-5005",
    propertyId: "p-1010",
    tenantId: "u-t1",
    landlordId: "u-l2",
    moveInDate: "2025-12-01",
    durationMonths: 6,
    message: "Requesting the house for a six-month posting in Sylhet.",
    monthlyRent: 55000,
    status: "COMPLETED",
    createdAt: "2025-11-10T11:00:00Z",
  },
  {
    id: "r-5006",
    propertyId: "p-1002",
    tenantId: "u-t2",
    landlordId: "u-l2",
    moveInDate: "2026-11-01",
    durationMonths: 24,
    message: "Our family is relocating to Uttara and the garden is perfect for our kids.",
    monthlyRent: 120000,
    status: "PENDING",
    createdAt: "2026-09-27T14:00:00Z",
  },
  {
    id: "r-5007",
    propertyId: "p-1004",
    tenantId: "u-t3",
    landlordId: "u-l3",
    moveInDate: "2026-10-15",
    durationMonths: 12,
    message: "Would like to rent the duplex. Can we discuss the parking arrangement?",
    monthlyRent: 150000,
    status: "APPROVED",
    createdAt: "2026-09-20T16:30:00Z",
  },
  {
    id: "r-5008",
    propertyId: "p-1001",
    tenantId: "u-t4",
    landlordId: "u-l1",
    moveInDate: "2026-12-01",
    durationMonths: 12,
    message: "Hello! I'm a doctor at a nearby hospital and looking for a long-term rental.",
    monthlyRent: 85000,
    status: "PENDING",
    createdAt: "2026-09-30T09:45:00Z",
  },
  {
    id: "r-5009",
    propertyId: "p-1006",
    tenantId: "u-t5",
    landlordId: "u-l3",
    moveInDate: "2026-06-01",
    durationMonths: 24,
    message: "Requesting the villa for my family on a two-year lease.",
    monthlyRent: 280000,
    status: "ACTIVE",
    createdAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "r-5010",
    propertyId: "p-1008",
    tenantId: "u-t6",
    landlordId: "u-l4",
    moveInDate: "2026-11-01",
    durationMonths: 12,
    message: "I've just joined a company in Agrabad and the Khulshi location works well.",
    monthlyRent: 48000,
    status: "PENDING",
    createdAt: "2026-10-01T13:20:00Z",
  },
  {
    id: "r-5011",
    propertyId: "p-1007",
    tenantId: "u-t8",
    landlordId: "u-l4",
    moveInDate: "2026-09-01",
    durationMonths: 12,
    message: "Looking for an affordable flat close to the metro.",
    monthlyRent: 24000,
    status: "ACTIVE",
    createdAt: "2026-08-16T08:00:00Z",
  },
  {
    id: "r-5012",
    propertyId: "p-1011",
    tenantId: "u-t2",
    landlordId: "u-l3",
    moveInDate: "2026-10-01",
    durationMonths: 12,
    message: "Interested in the executive apartment for my parents.",
    monthlyRent: 95000,
    status: "REJECTED",
    landlordNote: "Sorry, we're looking for a tenant who can commit to a 24-month lease.",
    createdAt: "2026-09-02T15:00:00Z",
  },
  {
    id: "r-5013",
    propertyId: "p-1003",
    tenantId: "u-t3",
    landlordId: "u-l1",
    moveInDate: "2026-11-01",
    durationMonths: 12,
    message: "Is the studio still available? I'd like to schedule a viewing this weekend.",
    monthlyRent: 22000,
    status: "PENDING",
    createdAt: "2026-10-02T17:10:00Z",
  },
  {
    id: "r-5014",
    propertyId: "p-1009",
    tenantId: "u-t6",
    landlordId: "u-l1",
    moveInDate: "2026-07-15",
    durationMonths: 12,
    message: "I'm a graduate student at Dhaka University and would love a quiet place near the lake to study.",
    monthlyRent: 26000,
    status: "ACTIVE",
    createdAt: "2026-06-20T10:30:00Z",
  },
];

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export const payments: Payment[] = [
  {
    id: "pay-9001",
    rentalRequestId: "r-5003",
    tenantId: "u-t1",
    amount: 42000,
    currency: "BDT",
    method: "SSLCOMMERZ",
    status: "PAID",
    transactionId: "SSL-7F3K29QX",
    createdAt: "2026-06-20T10:05:00Z",
  },
  {
    id: "pay-9002",
    rentalRequestId: "r-5005",
    tenantId: "u-t1",
    amount: 55000,
    currency: "BDT",
    method: "STRIPE",
    status: "PAID",
    transactionId: "pi_3QbX7cLk2N8sTq",
    createdAt: "2025-11-20T15:40:00Z",
  },
  {
    id: "pay-9003",
    rentalRequestId: "r-5001",
    tenantId: "u-t1",
    amount: 85000,
    currency: "BDT",
    method: "SSLCOMMERZ",
    status: "CANCELLED",
    transactionId: "SSL-9M2P41RB",
    createdAt: "2026-09-25T19:12:00Z",
  },
  {
    id: "pay-9004",
    rentalRequestId: "r-5009",
    tenantId: "u-t5",
    amount: 280000,
    currency: "BDT",
    method: "STRIPE",
    status: "PAID",
    transactionId: "pi_3QaZ1mFp9R4vWe",
    createdAt: "2026-05-18T09:30:00Z",
  },
  {
    id: "pay-9005",
    rentalRequestId: "r-5011",
    tenantId: "u-t8",
    amount: 24000,
    currency: "BDT",
    method: "SSLCOMMERZ",
    status: "PAID",
    transactionId: "SSL-4H8T62LN",
    createdAt: "2026-08-22T12:00:00Z",
  },
  {
    id: "pay-9006",
    rentalRequestId: "r-5014",
    tenantId: "u-t6",
    amount: 26000,
    currency: "BDT",
    method: "SSLCOMMERZ",
    status: "PAID",
    transactionId: "SSL-2K7W53DM",
    createdAt: "2026-06-28T11:15:00Z",
  },
];

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export const reviews: Review[] = [
  {
    id: "rv-1",
    propertyId: "p-1010",
    tenantId: "u-t1",
    rating: 5,
    comment: "Peaceful neighbourhood and a very responsive landlord. The garden was a highlight.",
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    id: "rv-2",
    propertyId: "p-1006",
    tenantId: "u-t5",
    rating: 5,
    comment: "Exactly as described. The pool and security made it perfect for our family.",
    createdAt: "2026-08-01T11:00:00Z",
  },
  {
    id: "rv-3",
    propertyId: "p-1007",
    tenantId: "u-t8",
    rating: 4,
    comment: "Great value for the location. Lift is a bit slow at peak hours, otherwise no complaints.",
    createdAt: "2026-09-20T09:00:00Z",
  },
  {
    id: "rv-4",
    propertyId: "p-1001",
    tenantId: "u-t2",
    rating: 5,
    comment: "Lovely light all day and the building management is excellent.",
    createdAt: "2026-03-14T14:00:00Z",
  },
  {
    id: "rv-5",
    propertyId: "p-1004",
    tenantId: "u-t3",
    rating: 4,
    comment: "The rooftop terrace is fantastic. Some fittings needed minor repairs at move-in.",
    createdAt: "2026-02-10T12:00:00Z",
  },
  {
    id: "rv-6",
    propertyId: "p-1005",
    tenantId: "u-t6",
    rating: 4,
    comment: "Well furnished and close to the university. Internet was already set up which saved time.",
    createdAt: "2026-01-22T08:30:00Z",
  },
];

/* ------------------------------------------------------------------ */
/* Selectors — swap these for API calls later                          */
/* ------------------------------------------------------------------ */

/** Future: GET /api/properties (public listings only) */
export function getPublicProperties(): Property[] {
  return properties.filter((p) => p.status === "APPROVED");
}

export function getFeaturedProperties(limit = 6): Property[] {
  return getPublicProperties()
    .filter((p) => p.featured && p.isAvailable)
    .slice(0, limit);
}

/** Future: GET /api/properties/:id */
export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getPropertyReviews(propertyId: string): Review[] {
  return reviews.filter((r) => r.propertyId === propertyId);
}

export function getPropertyRating(propertyId: string): { average: number; count: number } {
  const list = getPropertyReviews(propertyId);
  if (list.length === 0) return { average: 0, count: 0 };
  const total = list.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / list.length) * 10) / 10, count: list.length };
}

/** Distinct areas with public listing counts, most listings first. */
export function getPopularAreas(): { area: string; city: string; count: number; image: string }[] {
  const map = new Map<string, { area: string; city: string; count: number; image: string }>();
  for (const p of getPublicProperties()) {
    const key = p.location.area;
    const entry = map.get(key);
    if (entry) entry.count += 1;
    else map.set(key, { area: p.location.area, city: p.location.city, count: 1, image: p.images[0] });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}


/** Distinct areas and cities for location autocomplete. */
export function getLocationOptions(): string[] {
  const set = new Set<string>();
  for (const p of getPublicProperties()) {
    set.add(p.location.area);
    set.add(p.location.city);
  }
  return [...set].sort();
}

/** Future: GET /api/landlord/properties */
export function getLandlordProperties(landlordId: string): Property[] {
  return properties.filter((p) => p.landlordId === landlordId);
}

export function getSimilarProperties(property: Property, limit = 3): Property[] {
  return getPublicProperties()
    .filter((p) => p.id !== property.id && p.isAvailable && p.location.city === property.location.city)
    .sort((a, b) => Math.abs(a.price - property.price) - Math.abs(b.price - property.price))
    .slice(0, limit);
}

/** Stand-in for the signed-in user until real auth exists. */
export function getCurrentUser(role: Role): User {
  return getUserById(CURRENT_USER_IDS[role])!;
}

/** Future: GET /api/rentals/:id */
export function getRentalRequestDetails(id: string): RentalRequestDetails | undefined {
  const request = rentalRequests.find((r) => r.id === id);
  if (!request) return undefined;
  const property = getPropertyById(request.propertyId);
  const landlord = getUserById(request.landlordId);
  const tenant = getUserById(request.tenantId);
  if (!property || !landlord || !tenant) return undefined;
  return {
    ...request,
    property,
    landlord,
    tenant,
    payments: payments
      .filter((p) => p.rentalRequestId === request.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    review: reviews.find((r) => r.propertyId === request.propertyId && r.tenantId === request.tenantId),
  };
}

/** Future: GET /api/rentals (as tenant) — newest first. */
export function getTenantRequests(tenantId: string): RentalRequestDetails[] {
  return rentalRequests
    .filter((r) => r.tenantId === tenantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => getRentalRequestDetails(r.id))
    .filter((r) => r !== undefined);
}

/** Future: GET /api/payments (as tenant) — newest first, with the property paid for. */
export function getTenantPayments(tenantId: string): (Payment & { property?: Property })[] {
  return payments
    .filter((p) => p.tenantId === tenantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => {
      const request = rentalRequests.find((r) => r.id === p.rentalRequestId);
      return { ...p, property: request ? getPropertyById(request.propertyId) : undefined };
    });
}

/** A request only if it belongs to the given tenant (the API will enforce this server-side). */
export function getTenantRequestById(tenantId: string, id: string): RentalRequestDetails | undefined {
  const request = getRentalRequestDetails(id);
  return request?.tenantId === tenantId ? request : undefined;
}

/** Future: part of GET /api/payments (as landlord) — payments received for the landlord's rentals. */
export function getLandlordPayments(landlordId: string): Payment[] {
  const requestIds = new Set(rentalRequests.filter((r) => r.landlordId === landlordId).map((r) => r.id));
  return payments.filter((p) => requestIds.has(p.rentalRequestId));
}
