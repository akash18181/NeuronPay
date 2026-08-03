# NeuronPay: Pay-per-Token AI Micro-Billing DApp (Level 1)

NeuronPay is a pay-per-token micro-billing interface built for Next.js and integrated with the Stellar blockchain network. This implementation serves as the Level 1 (White Belt) submission, establishing wallet integration, Horizon Testnet connection, and secure payment flows.

---

## 🚀 Features Implemented

1. **Freighter Wallet Integration**:
   - Automated detection of Freighter extension installation.
   - Interactive, styled `Connect Wallet` and `Disconnect Wallet` toggles.
   - Automated polling for Stellar network validation (forces Testnet selection).
2. **On-Chain Balance Retrieval**:
   - Connects to the Horizon Testnet RPC node (`https://horizon-testnet.stellar.org`) to fetch and display the connected account's XLM balance.
   - Includes real-time formatted updates after transaction execution or manually triggered refreshes.
3. **Friendbot Faucet Integration**:
   - Features a one-click faucet trigger using the Stellar Friendbot API to fund new testnet accounts with 10,000 XLM directly within the application dashboard.
4. **AI Token Billing Simulator**:
   - Interactive panel offering users selectable Prompt/Token Tiers corresponding to prompt usage, with options for custom XLM payment amounts.
   - Triggers signature requests via Freighter Wallet, signs, and submits payment transactions to the Testnet ledger.
   - Fully animated feedback cycle: `Idle` ➜ `Signing` ➜ `Broadcasting` ➜ `Success` / `Error`.
   - Displays transactions hashes with clickable anchor links to the **Stellar Expert Testnet Explorer**.
5. **Secure Error Handling & UX**:
   - Beautiful error indicators mapping and categorizing signature cancellations, underfunded wallets, and network errors.

---

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4, Vanilla CSS
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
cd d:\NeuronPay
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
5. If your balance displays `0.0000 XLM`, click the **"Fund 10,000 XLM Faucet"** button inside the wallet dashboard card to automatically instantiate and fund your account.

---

## 📸 Level 1 Rubric Screenshots

Here are the designated slots for screenshots verifying the Level 1 requirements:

### 1. Wallet Connection State
*Slot demonstrating the wallet address successfully connected and truncated in the topbar.*
<!-- Place screenshot here: e.g. ![Connected State](/screenshots/connected_state.png) -->

### 2. Live XLM Balance Displayed
*Slot showing the balance retrieved from the Horizon Testnet API displayed next to the wallet details.*
<!-- Place screenshot here: e.g. ![Balance Displayed](/screenshots/balance_displayed.png) -->

### 3. Transaction Approval Prompt
*Slot showing Freighter Wallet pop-up prompting for signature confirmation.*
<!-- Place screenshot here: e.g. ![Freighter Prompt](/screenshots/freighter_prompt.png) -->

### 4. Successful Testnet Transaction & Feedback
*Slot showing the green success card with the generated Transaction Hash and Stellar Expert Explorer link.*
<!-- Place screenshot here: e.g. ![Successful Tx](/screenshots/successful_tx.png) -->
