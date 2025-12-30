# NFT Marketplace Example

This example demonstrates generating an NFT marketplace program using Coda.

## Overview

This marketplace allows users to:
- List NFTs for sale
- Purchase listed NFTs
- Cancel listings
- Collect marketplace fees

## Generation Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "NFT marketplace with listing and purchasing",
    "features": [
      "List NFT for sale with price",
      "Purchase listed NFT",
      "Cancel listing and return NFT",
      "Marketplace fee (2.5%)",
      "Escrow for secure transactions"
    ],
    "customInstructions": "Use Metaplex token metadata standard"
  }'
```

## Architecture

### Accounts

1. **Listing Account**: Stores listing information
```rust
#[account]
pub struct Listing {
    pub seller: Pubkey,
    pub nft_mint: Pubkey,
    pub price: u64,
    pub created_at: i64,
}
```

2. **Escrow Account**: Holds NFT during listing
```rust
pub struct EscrowAccount {
    pub listing: Pubkey,
    pub nft_token_account: Pubkey,
}
```

3. **Marketplace Config**: Global marketplace settings
```rust
#[account]
pub struct MarketplaceConfig {
    pub authority: Pubkey,
    pub fee_percentage: u16, // basis points (250 = 2.5%)
    pub treasury: Pubkey,
}
```

### Instructions

1. **Initialize Marketplace**
2. **List NFT**
3. **Purchase NFT**
4. **Cancel Listing**
5. **Update Fee**

## Build and Deploy

```bash
anchor build
anchor deploy --provider.cluster devnet
```

## Usage Examples

### List NFT

```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

async function listNFT(
  nftMint: PublicKey,
  price: number
) {
  const [listing] = PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), nftMint.toBuffer()],
    PROGRAM_ID
  );

  await program.methods
    .listNft(new BN(price))
    .accounts({
      listing,
      nftMint,
      seller: wallet.publicKey,
    })
    .rpc();
}
```

### Purchase NFT

```typescript
async function purchaseNFT(listingAddress: PublicKey) {
  const listing = await program.account.listing.fetch(listingAddress);

  await program.methods
    .purchaseNft()
    .accounts({
      listing: listingAddress,
      buyer: wallet.publicKey,
      seller: listing.seller,
      nftMint: listing.nftMint,
    })
    .rpc();
}
```

### Cancel Listing

```typescript
async function cancelListing(listingAddress: PublicKey) {
  await program.methods
    .cancelListing()
    .accounts({
      listing: listingAddress,
      seller: wallet.publicKey,
    })
    .rpc();
}
```

## Frontend Integration

### React Component

```typescript
import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

function MarketplaceUI() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const allListings = await program.account.listing.all();
    setListings(allListings);
  };

  const buyNFT = async (listing) => {
    await program.methods
      .purchaseNft()
      .accounts({
        listing: listing.publicKey,
        buyer: wallet.publicKey,
      })
      .rpc();
    
    await loadListings();
  };

  return (
    <div>
      {listings.map(listing => (
        <NFTCard
          key={listing.publicKey.toString()}
          listing={listing}
          onBuy={() => buyNFT(listing)}
        />
      ))}
    </div>
  );
}
```

## Testing

```typescript
import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";

describe("nft-marketplace", () => {
  it("Lists an NFT", async () => {
    const price = new anchor.BN(1000000000); // 1 SOL
    
    await program.methods
      .listNft(price)
      .accounts({
        listing,
        nftMint,
        seller: seller.publicKey,
      })
      .signers([seller])
      .rpc();

    const listingAccount = await program.account.listing.fetch(listing);
    expect(listingAccount.price.toString()).to.equal(price.toString());
  });

  it("Purchases an NFT", async () => {
    await program.methods
      .purchaseNft()
      .accounts({
        listing,
        buyer: buyer.publicKey,
        seller: seller.publicKey,
      })
      .signers([buyer])
      .rpc();

    // Verify NFT transferred
    const buyerTokenAccount = await getAccount(connection, buyerNftAccount);
    expect(buyerTokenAccount.amount).to.equal(1n);
  });
});
```

## Advanced Features

### Auction System

```rust
#[account]
pub struct Auction {
    pub nft_mint: Pubkey,
    pub seller: Pubkey,
    pub highest_bid: u64,
    pub highest_bidder: Pubkey,
    pub end_time: i64,
}

pub fn place_bid(
    ctx: Context<PlaceBid>,
    amount: u64,
) -> Result<()>
```

### Offers System

```rust
#[account]
pub struct Offer {
    pub buyer: Pubkey,
    pub nft_mint: Pubkey,
    pub amount: u64,
    pub expiry: i64,
}

pub fn make_offer(
    ctx: Context<MakeOffer>,
    amount: u64,
    expiry: i64,
) -> Result<()>
```

### Royalty Enforcement

```rust
pub fn purchase_with_royalty(
    ctx: Context<Purchase>,
) -> Result<()> {
    // Read royalty from metadata
    let royalty_percentage = get_royalty(&metadata);
    
    // Calculate and transfer royalty
    let royalty_amount = price * royalty_percentage / 10000;
    transfer_royalty(royalty_amount, creator)?;
    
    Ok(())
}
```

## Security Checklist

- [ ] Verify NFT ownership before listing
- [ ] Validate price is greater than zero
- [ ] Check buyer has sufficient funds
- [ ] Prevent self-purchase
- [ ] Implement reentrancy guards
- [ ] Validate token metadata
- [ ] Secure escrow implementation
- [ ] Authority checks on all instructions

## Deployment Checklist

- [ ] Test all features on localnet
- [ ] Deploy to devnet
- [ ] Conduct security audit
- [ ] Test with real NFTs on devnet
- [ ] Set appropriate marketplace fees
- [ ] Configure treasury address
- [ ] Document all features
- [ ] Create user guide

## Resources

- Metaplex Documentation: https://docs.metaplex.com
- Token Metadata: https://github.com/metaplex-foundation/metaplex-program-library
- Solana NFT Guide: https://solanacookbook.com/references/nfts.html

