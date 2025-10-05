'use client';

import Image from 'next/image';
import { ArrowRightLeft, ShoppingCart, Tag, Flame } from 'lucide-react';
import { NFT_PLACEHOLDER, PLACEHOLDER_AVATAR } from '@/lib/placeholder';

type ActivityType = 'sale' | 'listing' | 'transfer' | 'mint';

const activities = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  type: ['sale', 'listing', 'transfer', 'mint'][i % 4] as ActivityType,
  nft: {
    name: `NFT #${i + 1}`,
    image: NFT_PLACEHOLDER,
    collection: ['Cosmic Dreams', 'Digital Horizons', 'Neon Nights'][i % 3],
  },
  from: {
    address: `0x${Math.random().toString(16).substr(2, 8)}...`,
    avatar: PLACEHOLDER_AVATAR,
  },
  to: {
    address: `0x${Math.random().toString(16).substr(2, 8)}...`,
    avatar: PLACEHOLDER_AVATAR,
  },
  price: (Math.random() * 5 + 0.1).toFixed(2),
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
}));

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'sale':
      return <ShoppingCart className="h-5 w-5 text-green-600" />;
    case 'listing':
      return <Tag className="h-5 w-5 text-blue-600" />;
    case 'transfer':
      return <ArrowRightLeft className="h-5 w-5 text-purple-600" />;
    case 'mint':
      return <Flame className="h-5 w-5 text-orange-600" />;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case 'sale':
      return 'bg-green-100 text-green-800';
    case 'listing':
      return 'bg-blue-100 text-blue-800';
    case 'transfer':
      return 'bg-purple-100 text-purple-800';
    case 'mint':
      return 'bg-orange-100 text-orange-800';
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Activity</h1>
          <p className="text-gray-600">Latest marketplace transactions</p>
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.type)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={activity.nft.image}
                            alt={activity.nft.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.nft.name}</p>
                          <p className="text-sm text-gray-500">{activity.nft.collection}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.type !== 'transfer' && (
                        <span className="font-semibold">{activity.price} ETH</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            src={activity.from.avatar}
                            alt="From"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-600">{activity.from.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            src={activity.to.avatar}
                            alt="To"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-600">{activity.to.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(activity.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={activity.nft.image}
                      alt={activity.nft.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{activity.nft.name}</p>
                    <p className="text-sm text-gray-500">{activity.nft.collection}</p>
                  </div>
                  {activity.type !== 'transfer' && (
                    <span className="font-semibold text-gray-900">{activity.price} ETH</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{activity.from.address} → {activity.to.address}</span>
                  <span className="text-gray-500">{formatTime(activity.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
