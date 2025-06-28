"use client";

export default function HomeTitle() {
  return (
    <div className="text-center mt-16">
      <h1 className="text-5xl font-bold mb-4">
        Découvrir les entreprises
      </h1>
      <div className="text-xl">
        ou{" "}
        <span className="text-blue-500 hover:text-blue-700 font-medium transition duration-300">
          partagez votre propre expérience
        </span>
      </div>
    </div>
  );
}
