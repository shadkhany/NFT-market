'use client';

import { NFTCard } from './NFTCard';
import { NFT_PLACEHOLDER } from '@/lib/placeholder';

// Mock data - replace with actual API call
const featuredNFTs = [
  {
    id: '1',
    name: 'Cosmic Dreams #4521',
    image: NFT_PLACEHOLDER,
    price: '2.5',
    collection: 'Cosmic Dreams',
    likes: 142,
    seller: { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
  },
  {
    id: '2',
    name: 'Digital Horizons #891',
    image: NFT_PLACEHOLDER,
    price: '1.8',
    collection: 'Digital Horizons',
    likes: 98,
    seller: { address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72' },
  },
  {
    id: '3',
    name: 'Neon Nights #2341',
    image: NFT_PLACEHOLDER,
    price: '3.2',
    collection: 'Neon Nights',
    likes: 203,
    seller: { address: '0x1234567890123456789012345678901234567890' },
  },
  {
    id: '4',
    name: 'Abstract Minds #7654',
    image: NFT_PLACEHOLDER,
    price: '0.9',
    collection: 'Abstract Minds',
    likes: 67,
    seller: { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' },
  },
];

export function FeaturedNFTs() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Featured NFTs</h2>
          <p className="text-gray-600 mt-2">Hand-picked collection of trending digital art</p>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium">View All →</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredNFTs.map((nft) => (
          <NFTCard key={nft.id} {...nft} />
        ))}
      </div>
    </section>
  );
}
