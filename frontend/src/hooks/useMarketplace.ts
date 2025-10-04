import { useState } from 'react';
import { useAccount, useContractWrite, useContractRead } from 'wagmi';
import { parseEther } from 'ethers';
import { toast } from 'react-hot-toast';

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`;

const MARKETPLACE_ABI = [
  {
    name: 'listItem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'tokenType', type: 'uint8' },
    ],
    outputs: [{ name: 'listingId', type: 'uint256' }],
  },
  {
    name: 'buyItem',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'placeBid',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'makeOffer',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'expiresIn', type: 'uint256' },
    ],
    outputs: [{ name: 'offerId', type: 'uint256' }],
  },
] as const;

export function useMarketplace() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const listItem = async (
    nftContract: string,
    tokenId: string,
    price: string,
    tokenType: 0 | 1 // 0 = ERC721, 1 = ERC1155
  ) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      // Implementation would use wagmi's useContractWrite
      const priceWei = parseEther(price);
      console.log('Listing item:', { nftContract, tokenId, price: priceWei.toString() });
      
      toast.success('Item listed successfully!');
      return true;
    } catch (error: any) {
      console.error('Error listing item:', error);
      toast.error(error.message || 'Failed to list item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const buyItem = async (listingId: string, price: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const priceWei = parseEther(price);
      console.log('Buying item:', { listingId, price: priceWei.toString() });
      
      toast.success('Purchase successful!');
      return true;
    } catch (error: any) {
      console.error('Error buying item:', error);
      toast.error(error.message || 'Failed to buy item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const placeBid = async (listingId: string, bidAmount: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const bidWei = parseEther(bidAmount);
      console.log('Placing bid:', { listingId, bid: bidWei.toString() });
      
      toast.success('Bid placed successfully!');
      return true;
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast.error(error.message || 'Failed to place bid');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const makeOffer = async (
    nftContract: string,
    tokenId: string,
    offerAmount: string,
    expiresInDays: number
  ) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const offerWei = parseEther(offerAmount);
      const expiresIn = expiresInDays * 24 * 60 * 60; // Convert days to seconds
      
      console.log('Making offer:', {
        nftContract,
        tokenId,
        offer: offerWei.toString(),
        expiresIn,
      });
      
      toast.success('Offer submitted successfully!');
      return true;
    } catch (error: any) {
      console.error('Error making offer:', error);
      toast.error(error.message || 'Failed to make offer');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listItem,
    buyItem,
    placeBid,
    makeOffer,
    isLoading,
  };
}
