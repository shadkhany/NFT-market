import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Verification script for deployed contracts on Etherscan
 * Reads deployment info from deployments directory
 */
async function main() {
  const network = process.env.HARDHAT_NETWORK || "localhost";
  const chainId = network === "mainnet" ? 1 : network === "sepolia" ? 11155111 : 31337;

  console.log(`Verifying contracts on ${network}...`);

  // Load deployment info
  const filename = `${network}-${chainId}.json`;
  const filepath = path.join(__dirname, "../deployments", filename);

  if (!fs.existsSync(filepath)) {
    throw new Error(
      `Deployment file not found: ${filepath}\nPlease deploy contracts first.`
    );
  }

  const deployment = JSON.parse(fs.readFileSync(filepath, "utf8"));

  // Verify NFT721
  console.log("\nVerifying NFT721...");
  try {
    await run("verify:verify", {
      address: deployment.contracts.NFT721.address,
      constructorArguments: deployment.contracts.NFT721.constructorArgs,
    });
    console.log("✓ NFT721 verified");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ NFT721 already verified");
    } else {
      console.error("✗ NFT721 verification failed:", error.message);
    }
  }

  // Verify NFT1155
  console.log("\nVerifying NFT1155...");
  try {
    await run("verify:verify", {
      address: deployment.contracts.NFT1155.address,
      constructorArguments: deployment.contracts.NFT1155.constructorArgs,
    });
    console.log("✓ NFT1155 verified");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ NFT1155 already verified");
    } else {
      console.error("✗ NFT1155 verification failed:", error.message);
    }
  }

  // Verify Marketplace
  console.log("\nVerifying Marketplace...");
  try {
    await run("verify:verify", {
      address: deployment.contracts.Marketplace.address,
      constructorArguments: deployment.contracts.Marketplace.constructorArgs,
    });
    console.log("✓ Marketplace verified");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ Marketplace already verified");
    } else {
      console.error("✗ Marketplace verification failed:", error.message);
    }
  }

  console.log("\nVerification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
