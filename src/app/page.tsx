import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { Navbar } from "~/app/_components/landing/navbar";
import { HeroSection } from "~/app/_components/landing/hero-section";
import { CategoryGrid } from "~/app/_components/landing/category-grid";
import { FeatureSection } from "~/app/_components/landing/feature-section";
import { WhyChooseUs } from "~/app/_components/landing/why-choose-us";
import { Footer } from "~/app/_components/landing/footer";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="min-h-screen bg-white">
      <Navbar session={session} />
      <HeroSection session={session} />
      <CategoryGrid />
      <FeatureSection />
      <WhyChooseUs />
      <Footer />
    </main>
  );
}
