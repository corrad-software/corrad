export default [
  {
    header: "",
    description: "",
    child: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "ic:outline-dashboard",
        child: [],
        meta: {},
      },
    ],
  },
  {
    header: "NIISe",
    description: "Enforcement Module",
    child: [
      {
        title: "Aduan",
        icon: "ph:chat-teardrop-dots-duotone",
        child: [
          {
            title: "Senarai Aduan",
            path: "/aduan",
          },
          {
            title: "Jana Laporan",
            path: "/aduan/laporan",
          },
        ],
      },
    ],
  },
];
