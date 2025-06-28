// businessData.js
export const businesses = [
    {
      business_id: 1,
      name: "DuGood Credit Union",
      description: "Good business",
      logo: "/hero-desktop.png",
      location: "CA",
      average_rating: 4.8,
      reviews: 4317,
      category_id: 2
    },
    {
      business_id: 2,
      name: "EECU Credit Union",
      description: "Bad business",
      logo: "/hero-mobile.jpg",
      location: "Japan",
      average_rating: 4.8,
      reviews: 1653,
      category_id: 2
    },
    {
      business_id: 3,
      name: "Panacea Financial",
      description: "Medium business",
      logo: "/hero-desktop.jpg",
      location: "Sousse",
      average_rating: 4.8,
      reviews: 557,
      category_id: 1
    },
    {
      business_id: 4,
      name: "MAJORITY - Mobile Banking",
      description: "Smol business",
      logo: "/hero-desktop.png",
      location: "Bizerte",
      average_rating: 3.5,
      reviews: 11202,
      category_id: 4
    }
  ];

// categories mock data
export const categories = [
  { category_id: 1, name: "Restaurants", description: "Resataurant businesses", icon: "🌐" },
  { category_id: 2, name: "Salle de sports", icon: "🍕" },
  { category_id: 3, name: "Spa", icon: "🌮" },
  { category_id: 4, name: "Electronique", description: "electricity",icon: "🍣" },
];
