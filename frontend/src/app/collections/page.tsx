'use client';

import Image from 'next/image';
import Link from 'next/link';
import { VerifiedIcon } from 'lucide-react';
import { NFT_PLACEHOLDER } from '@/lib/placeholder';

const collections = [
  {
    id: '1',
    name: 'Cosmic Dreams',
    image: NFT_PLACEHOLDER,
    banner: NFT_PLACEHOLDER,
    description: 'Explore the infinite cosmos through vibrant digital art',
    floorPrice: '2.5',
    volume: '1,250',
    items: 1024,
    owners: 512,
    verified: true,
  },
  {
    id: '2',
    name: 'Digital Horizons',
    image: NFT_PLACEHOLDER,
    banner: NFT_PLACEHOLDER,
    description: 'Where digital meets reality in stunning NFT collections',
    floorPrice: '1.8',
    volume: '890',
    items: 2048,
    owners: 890,
    verified: true,
  },
  {
    id: '3',
    name: 'Neon Nights',
    image: NFT_PLACEHOLDER,
    banner: NFT_PLACEHOLDER,
    description: 'Cyberpunk aesthetics meet blockchain technology',
    floorPrice: '3.2',
    volume: '2,100',
    items: 512,
    owners: 345,
    verified: true,
  },
  {
    id: '4',
    name: 'Abstract Minds',
    image: NFT_PLACEHOLDER,
    banner: NFT_PLACEHOLDER,
    description: 'Abstract art reimagined for the digital age',
    floorPrice: '0.9',
    volume: '456',
    items: 768,
    owners: 234,
    verified: false,
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Collections</h1>
          <p className="text-gray-600">Discover unique NFT collections</p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Banner */}
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                <Image
                  src={collection.banner}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Collection Image */}
              <div className="relative px-6 -mt-12">
                <div className="relative w-24 h-24 rounded-xl border-4 border-white overflow-hidden">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-6 pt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{collection.name}</h3>
                  {collection.verified && (
                    <VerifiedIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {collection.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Floor Price</p>
                    <p className="font-semibold">{collection.floorPrice} ETH</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Volume</p>
                    <p className="font-semibold">{collection.volume} ETH</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="font-semibold">{collection.items}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Owners</p>
                    <p className="font-semibold">{collection.owners}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
