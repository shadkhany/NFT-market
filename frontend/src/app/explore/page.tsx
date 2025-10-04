'use client';

import { useState } from 'react';
import { NFTCard } from '@/components/NFTCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

// Mock data
const nfts = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: `Artwork #${i + 1}`,
  image: 'https://via.placeholder.com/400',
  price: (Math.random() * 5 + 0.1).toFixed(2),
  collection: ['Cosmic Dreams', 'Digital Horizons', 'Neon Nights'][i % 3],
  likes: Math.floor(Math.random() * 200),
  seller: {
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
  },
}));

export default function ExplorePage() {
  const [filter, setFilter] = useState({
    status: 'all',
    priceMin: '',
    priceMax: '',
    collection: 'all',
  });
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Explore NFTs</h1>
          <p className="text-gray-600">Discover, collect, and sell extraordinary NFTs</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>

              {/* Status Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Items</option>
                  <option value="buy-now">Buy Now</option>
                  <option value="auction">On Auction</option>
                  <option value="offers">Has Offers</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (ETH)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filter.priceMin}
                    onChange={(e) => setFilter({ ...filter, priceMin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filter.priceMax}
                    onChange={(e) => setFilter({ ...filter, priceMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Collections */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collections
                </label>
                <div className="space-y-2">
                  {['all', 'cosmic-dreams', 'digital-horizons', 'neon-nights'].map((col) => (
                    <label key={col} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="collection"
                        value={col}
                        checked={filter.collection === col}
                        onChange={(e) => setFilter({ ...filter, collection: e.target.value })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {col.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() =>
                  setFilter({
                    status: 'all',
                    priceMin: '',
                    priceMax: '',
                    collection: 'all',
                  })
                }
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* NFT Grid */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{nfts.length}</span> items
            </p>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Recently Listed</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Liked</option>
              <option>Oldest</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <NFTCard key={nft.id} {...nft} />
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 text-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
