import { Hero } from '@/components/Hero';
import { FeaturedNFTs } from '@/components/FeaturedNFTs';
import { TopCollections } from '@/components/TopCollections';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedNFTs />
      <TopCollections />
    </main>
  );
}
