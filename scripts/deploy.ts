import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deployment script for NFT Marketplace contracts
 * Deploys NFT721, NFT1155, and Marketplace contracts
 * Saves deployment addresses to a JSON file
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("====================================");
  console.log("NFT Marketplace Deployment");
  console.log("====================================");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );
  console.log("====================================\n");

  // Deployment parameters
  const PLATFORM_FEE_BPS = 250; // 2.5%
  const ROYALTY_FEE_BPS = 500; // 5%
  const MINT_PRICE = ethers.parseEther("0.01"); // 0.01 ETH
  const MAX_SUPPLY = 10000; // 0 for unlimited

  // Deploy NFT721
  console.log("Deploying NFT721...");
  const NFT721 = await ethers.getContractFactory("NFT721");
  const nft721 = await NFT721.deploy(
    "Marketplace NFT",
    "MNFT",
    "ipfs://", // Base URI
    MAX_SUPPLY,
    MINT_PRICE,
    deployer.address, // Royalty receiver
    ROYALTY_FEE_BPS
  );
  await nft721.waitForDeployment();
  const nft721Address = await nft721.getAddress();
  console.log("✓ NFT721 deployed to:", nft721Address);
  console.log();

  // Deploy NFT1155
  console.log("Deploying NFT1155...");
  const NFT1155 = await ethers.getContractFactory("NFT1155");
  const nft1155 = await NFT1155.deploy(
    "Marketplace Multi-Token",
    "MMULTI",
    "ipfs://", // Base URI
    deployer.address, // Default royalty receiver
    ROYALTY_FEE_BPS
  );
  await nft1155.waitForDeployment();
  const nft1155Address = await nft1155.getAddress();
  console.log("✓ NFT1155 deployed to:", nft1155Address);
  console.log();

  // Deploy Marketplace
  console.log("Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    PLATFORM_FEE_BPS,
    deployer.address // Fee recipient
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✓ Marketplace deployed to:", marketplaceAddress);
  console.log();

  // Verify deployment
  console.log("Verifying deployments...");
  console.log("NFT721 owner:", await nft721.owner());
  console.log("NFT1155 owner:", await nft1155.owner());
  console.log(
    "Marketplace platform fee:",
    await marketplace.platformFeeBps(),
    "bps"
  );
  console.log("Marketplace fee recipient:", await marketplace.feeRecipient());
  console.log();

  // Save deployment info
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      NFT721: {
        address: nft721Address,
        constructorArgs: [
          "Marketplace NFT",
          "MNFT",
          "ipfs://",
          MAX_SUPPLY,
          MINT_PRICE.toString(),
          deployer.address,
          ROYALTY_FEE_BPS,
        ],
      },
      NFT1155: {
        address: nft1155Address,
        constructorArgs: [
          "Marketplace Multi-Token",
          "MMULTI",
          "ipfs://",
          deployer.address,
          ROYALTY_FEE_BPS,
        ],
      },
      Marketplace: {
        address: marketplaceAddress,
        constructorArgs: [PLATFORM_FEE_BPS, deployer.address],
      },
    },
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${network.name}-${network.chainId}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));

  console.log("====================================");
  console.log("Deployment Summary");
  console.log("====================================");
  console.log("NFT721:", nft721Address);
  console.log("NFT1155:", nft1155Address);
  console.log("Marketplace:", marketplaceAddress);
  console.log();
  console.log("Deployment info saved to:", filepath);
  console.log();
  console.log("Next steps:");
  console.log("1. Verify contracts on block explorer");
  console.log("   yarn verify:sepolia (or verify:mainnet)");
  console.log("2. Update .env files with contract addresses");
  console.log("3. Update subgraph/subgraph.yaml with addresses");
  console.log("4. Deploy subgraph");
  console.log("====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
