import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Calculator } from "@/components/Calculator";
import { Impact } from "@/components/Impact";
import { Benefits } from "@/components/Benefits";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Calculator />
        <Impact />
        <Benefits />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
