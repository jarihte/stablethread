import { PublicKey, Transaction } from '@solana/web3.js';
import qs from 'qs';
import pino from 'pino';

interface MarketInfo {
  id: string;
  label: string;
  inputMint: string;
  outputMint: string;
  notEnoughLiquidity: boolean;
  inAmount: string;
  outAmount: string;
  minInAmount: string;
  minOutAmount: string;
  priceImpactPct: number;
  lpFee: {
    amount: string;
    mint: string;
    pct: number;
  };
  platformFee: {
    amount: string;
    mint: string;
    pct: number;
  };
}

interface Fees {
  signatureFee: number;
  openOrdersDeposits: number[];
  ataDeposits: number[];
  totalFeeAndDeposits: number;
  minimumSOLForTransaction: number;
}

interface MarketData {
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  marketInfos: MarketInfo[];
  amount: string;
  slippageBps: number;
  otherAmountThreshold: string;
  swapMode: string;
  fees: Fees;
}

interface APIResponse {
  data: MarketData[];
  timeTaken: number;
  contextSlot: number;
}

interface SwapTransaction {
  swapTransaction: string;
}

type SwapParams = {
  logger: pino.Logger,
  sender: PublicKey,
  recipient: PublicKey,
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps: number,
};

export default async function swap({
  logger,
  sender,
  recipient,
  inputMint,
  outputMint,
  amount,
  slippageBps,
}: SwapParams) : Promise<Transaction> {
  // create query string
  const asLegacyTransaction = true;
  const onlyDirectRoutes = true;
  const swapMode = 'ExactOut';
  const qString = qs.stringify({
    inputMint, outputMint, amount, slippageBps, asLegacyTransaction, swapMode, onlyDirectRoutes,
  });

  // get quote
  const quoteRes = await fetch(`https://quote-api.jup.ag/v4/quote?${qString}`);
  const quoteData : APIResponse = await quoteRes.json();

  // check for errors
  if (!quoteRes.ok) {
    logger.error('Error getting quote', quoteData);
    throw new Error('Error getting quote');
  }

  // get serialized transactions for the swap
  const swapResponse = await fetch('https://quote-api.jup.ag/v4/swap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: quoteData.data[0],
      asLegacyTransaction: true,
      userPublicKey: sender.toBase58(),
      destinationWallet: recipient.toBase58(),
    }),
  });
  const transactions : SwapTransaction = await swapResponse.json();

  // check for errors
  if (!swapResponse.ok) {
    logger.error('Error getting swap transaction', transactions);
    throw new Error('Error getting swap transaction');
  }

  // deserialize and return the transaction
  const { swapTransaction } = transactions;
  const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
  return Transaction.from(swapTransactionBuf);
}
