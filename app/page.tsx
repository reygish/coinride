import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex bg-gradient-to-b from-secondary to-background">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24  m-auto">
        <h1 className="text-5xl font-bold text-primary mb-4">CoinRide</h1>
        <p className="text-xl text-muted-foreground max-w-xl mb-8">
          Your AI-powered money manager. Track spending, log transactions, and
          let AI do the categorizing for you.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-secondary transition"
          >
            Sign Up
          </Link>
        </div>
      </section>
    </main>
  );
}
