import CurrentYear from "@/components/currentYear";
import features from "@/lib/features";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-green-50 to-white">
        <h1 className="text-5xl font-bold text-green-600 mb-4">CoinRide</h1>
        <p className="text-xl text-gray-500 max-w-xl mb-8">
          Your AI-powered money manager. Track spending, log transactions, and
          let AI do the categorizing for you.
        </p>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/auth/register"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition"
          >
            Sign Up
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-20 bg-green-50">
        <h2 className="text-3xl font-bold mb-4">Ready to take control?</h2>
        <p className="text-gray-500 mb-8">
          Start tracking your finances smarter with AI.
        </p>
        <Link
          href="/auth/register"
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition"
        >
          Create an Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        © <CurrentYear/> CoinRide. Built by Regis, Andrey, Darren & Alin.
      </footer>
    </main>
  );
}