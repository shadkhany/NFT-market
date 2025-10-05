import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

/**
 * Blockchain Service
 * Handles all blockchain interactions via ethers.js
 * Note: Contract ABIs and addresses should be configured when smart contracts are deployed
 */
@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;

  constructor(private config: ConfigService) {
    // Initialize provider if RPC URL is configured
    const rpcUrl = this.config.get('ETHEREUM_RPC_URL');
    if (rpcUrl && rpcUrl !== '' && !rpcUrl.includes('YOUR_INFURA_KEY')) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }
  }

  /**
   * Check if blockchain service is configured
   */
  isConfigured(): boolean {
    return this.provider !== null;
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string) {
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Verify if address is a contract
   */
  async isContract(address: string): Promise<boolean> {
    const code = await this.provider.getCode(address);
    return code !== '0x';
  }

  /**
   * Get ETH balance
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas(tx);
  }
}
