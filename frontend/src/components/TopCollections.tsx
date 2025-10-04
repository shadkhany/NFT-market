'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

const collections = [
  {
    id: '1',
    name: 'Cosmic Dreams',
    image: 'https://via.placeholder.com/100',
    floorPrice: '2.5',
    volume: '1,250',
    change: 15.3,
    verified: true,
  },
  {
    id: '2',
    name: 'Digital Horizons',
    image: 'https://via.placeholder.com/100',
    floorPrice: '1.8',
    volume: '890',
    change: -5.2,
    verified: true,
  },
  {
    id: '3',
    name: 'Neon Nights',
    image: 'https://via.placeholder.com/100',
    floorPrice: '3.2',
    volume: '2,100',
    change: 22.7,
    verified: true,
  },
];

export function TopCollections() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Top Collections</h2>
            <p className="text-gray-600 mt-2">Most popular collections by volume</p>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>24 Hours</option>
            <option>7 Days</option>
            <option>30 Days</option>
            <option>All Time</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Floor Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    24h %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collections.map((collection, index) => (
                  <tr key={collection.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/collection/${collection.id}`}
                        className="flex items-center space-x-3"
                      >
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-900">
                              {collection.name}
                            </span>
                            {collection.verified && (
                              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.floorPrice} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.volume} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`flex items-center space-x-1 ${collection.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {collection.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.abs(collection.change)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
