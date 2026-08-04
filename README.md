# NeuronPay: Pay-per-Token AI Micro-Billing Protocol

NeuronPay is a decentralized pay-as-you-go micro-billing protocol designed for generative AI services and LLM computing. By integrating the Stellar blockchain network, it replaces rigid and expensive monthly AI subscriptions with frictionless, instant micro-payments. Users connect their Web3 wallets to purchase exactly the amount of prompt and response tokens they consume, enabling truly open and pay-per-use computing resources.

---

## ✨ Key Features

- **Pay-per-Token Micro-Billing**: Bypasses expensive flat-rate subscriptions by charging users micro-amounts of XLM corresponding to the exact number of prompt and response tokens processed.
- **Wallet-Based Session Keys**: Connects securely via Freighter Wallet on the Stellar Testnet, allowing passwordless and card-free user authentication.
- **Interactive Prompt Terminal**: A retro-cyberpunk typewriter console that visualizes the token delivery sequence, mock AI compiler configurations, and transaction feedback logs in real-time.
- **On-Chain Consensus Pipeline**: Visualizes step-by-step transaction validation status lights (sequence loading ➜ signature confirmation ➜ Horizon node broadcasting).
- **Testnet Friendbot Refueling**: Instantly funds unfunded/new Stellar accounts with 10,000 Testnet XLM directly inside the client dashboard.

---

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4, Vanilla CSS (Premium Dark Cyberpunk Theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Web3 Integrations**:
  - `@stellar/freighter-api` (Wallet communication)
  - `@stellar/stellar-sdk` (Stellar Horizon interactions)

---

## 📁 Repository Structure

```text
d:\NeuronPay\
├── src/
│   ├── app/
│   │   ├── globals.css      # Custom cyberpunk styles & Tailwind theme overrides
│   │   ├── layout.tsx       # Root Next.js metadata and body configuration
│   │   └── page.tsx         # Main dashboard layout and history component
│   ├── components/
│   │   ├── WalletConnect.tsx # Topbar wallet logic and balance management
│   │   └── TransactionCard.tsx # Token tier purchase and execution panel
│   └── lib/
│       └── stellar.ts       # Stellar Horizon network connection and tx builder
├── package.json             # Build dependencies and scripts
└── README.md                # Submission guide (this file)
```

---

## ⚙️ Local Setup Instructions

Ensure you have [Node.js (v18 or higher)](https://nodejs.org/) installed on your machine.

### 1. Clone & Enter Project Root
```bash
# Clone the repository
git clone https://github.com/akash18181/NeuronPay.git

# Enter the project directory
cd NeuronPay
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Connect Freighter Wallet
1. Install the [Freighter Browser Extension](https://www.freighter.app/).
2. In Freighter settings, ensure your network selection is set to **Testnet**.
3. Create or import an account.
4. Click **"Connect Wallet"** on the NeuronPay topbar.
5. If your balance displays `0.0000 XLM`, click the **"Request 10,000 XLM Faucet"** button inside the wallet dashboard card to automatically instantiate and fund your account.

---

## 🏆 Submission Milestones

---

### Level 1: Core Wallet & Payment Infrastructure

This section contains the implementation details and verification proof for the Level 1 (White Belt) submission.

#### 🚀 Features Implemented
1. **Freighter Wallet Integration**:
   - Automated detection of Freighter extension installation.
   - Interactive, styled `Connect Wallet` and `Disconnect Wallet` toggles.
   - Automated polling for Stellar network validation (forces Testnet selection).
2. **On-Chain Balance Retrieval**:
   - Connects to the Horizon Testnet RPC node (`https://horizon-testnet.stellar.org`) to fetch and display the connected account's XLM balance.
   - Handles unfunded new accounts (returns `0.0000 XLM` gracefully on Horizon 404).
   - Real-time updates after transaction execution or manually triggered refreshes.
3. **Friendbot Faucet Integration**:
   - Features a one-click faucet trigger using the Stellar Friendbot API to fund new testnet accounts with 10,000 XLM directly within the application dashboard.
4. **AI Token Billing Simulator**:
   - Interactive panel offering users selectable Prompt/Token Tiers corresponding to prompt usage, with options for custom XLM payment amounts.
   - Triggers signature requests via Freighter Wallet, signs, and submits payment transactions to the Testnet ledger.
   - Fully animated feedback cycle: `Idle` ➜ `Signing` ➜ `Broadcasting` ➜ `Success` / `Error`.
   - Displays transactions hashes with clickable anchor links to the **Stellar Expert Testnet Explorer**.
   - Triggers isolated typewriter log stream and token count animations on success.
5. **Secure Error Handling & UX**:
   - Beautiful error indicators mapping and categorizing signature cancellations, underfunded wallets, and network errors.

#### 📸 Verification Screenshots
*(Screenshots to be attached manually for verification)*

##### 1. Wallet Connection State
*Proof of wallet successfully connecting and displaying address in topbar:*
<img width="1858" height="1040" alt="{548C59E2-48A8-4E90-AE5D-E5F40F502E5E}" src="https://github.com/user-attachments/assets/8d4827f4-6727-45b0-a495-c44e13db0b74" />
<!-- Place connected state screenshot here -->

##### 2. Live XLM Balance Displayed
*Proof of live XLM balance fetched from Horizon Testnet API:*
<img width="1858" height="1040" alt="{548C59E2-48A8-4E90-AE5D-E5F40F502E5E}" src="https://github.com/user-attachments/assets/77460ba1-f214-4508-8716-fa3cba40f418" />
<!-- Place balance displayed screenshot here -->

##### 3. Transaction Approval Prompt
*Proof of Freighter Wallet signature prompt request:*
<img width="1896" height="1085" alt="{95FFB3D7-A0F7-4809-904E-6DC1A6A0A34B}" src="https://github.com/user-attachments/assets/a851aeb6-43c0-4df1-93f5-dcfbc2925272" />
<!-- Place freighter prompt screenshot here -->

##### 4. Successful Testnet Transaction & Feedback
*Proof of successful transaction hash feedback card with Stellar Expert Explorer link:*
<img width="1859" height="1037" alt="{594AF477-284C-43B5-9829-98B34C695D55}" src="https://github.com/user-attachments/assets/7b314662-02fd-4f4f-bd43-6cbb303f56e5" />
<!-- Place successful tx screenshot here -->

---

### Level 2: Soroban Smart Contract Billing

This section contains implementation details and verification proof for the Level 2 (Yellow Belt) submission.

#### 📜 Deployed Smart Contract Address (Stellar Testnet)
- **Deployed Contract ID**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Explorer Link**: [View Deployed Soroban Contract on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)

#### ⚡ Transaction Hash for Contract Interaction
- **Sample Contract Call Tx Hash**: `b48047271c00742b74bf10f3177cf3d64ef3c1caaf618d07d0cc60da2e8e57b3`
- **Explorer Link**: [View Contract Call Transaction on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/tx/b48047271c00742b74bf10f3177cf3d64ef3c1caaf618d07d0cc60da2e8e57b3)

#### 🧪 Running the Automated CLI Test Suite
Verify connection channels, contract IDs, and the 3 distinct error types:
```bash
node scripts/test_stellar.js
```

#### 📸 Verification Screenshots
*(Screenshots to be attached manually for verification)*

##### 1. Wallet Options Available
*Proof of wallet options available (e.g. Freighter Integration):*
<!-- Place wallet options screenshot here -->

##### 2. Deployed Contract Address
*Proof of the deployed Soroban contract address on Stellar Expert Explorer:*
<!-- Place deployed contract address screenshot here -->

##### 3. Contract Call Transaction Hash
*Proof of the successful contract call transaction hash on Stellar Expert Explorer:*
<!-- Place contract call tx hash screenshot here -->

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

