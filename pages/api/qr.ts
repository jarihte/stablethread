/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPythProgramKeyForCluster, PythHttpClient } from '@pythnetwork/client';
import { createTransfer } from '@solana/pay';
import {
  Connection, PublicKey, Transaction,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Helius } from 'helius-sdk';
import { NextApiRequest, NextApiResponse } from 'next/types';
import NextCors from 'nextjs-cors';
import pino from 'pino';
import pretty from 'pino-pretty';
import qs from 'qs';

/* eslint-disable max-len */
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

async function swap(sender: string, receiver: string, inputMint: string, outputMint: string, amount: string, slippageBps: number) {
  // create query string
  const asLegacyTransaction = true;
  const swapMode = 'ExactOut';
  const qString = qs.stringify({
    inputMint, outputMint, amount, slippageBps, asLegacyTransaction, swapMode,
  });

  // get quote
  const quoteRes = await fetch(`https://quote-api.jup.ag/v4/quote?${qString}`);
  const quoteData : APIResponse = await quoteRes.json();

  // get serialized transactions for the swap
  const swapResponse = await fetch('https://quote-api.jup.ag/v4/swap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: quoteData.data[0],
      asLegacyTransaction: true,
      userPublicKey: sender,
      destinationWallet: receiver,
    }),
  });
  const transactions : SwapTransaction = await swapResponse.json();

  // deserialize and return the transaction
  const { swapTransaction } = transactions;
  const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
  return Transaction.from(swapTransactionBuf);
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  await NextCors(req, res, {
    // Options
    methods: ['GET'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  res.status(200).json({
    label: 'ArchPaid',
    icon: 'https://archapid.com/images/archpaid-icon.png',
  });
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  // setup logging
  const stream = pretty({
    colorize: true,
  });
  const logger = pino(stream);

  await NextCors(req, res, {
    // Options
    methods: ['POST'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  try {
  // Account provided in the transaction request body by the wallet.
    const accountField = req.body?.account;
    if (!accountField) {
      logger.error('missing accountField', req.body);
      throw new Error('missing account');
    }

    // Create a PublicKey from the account field.
    const sender = new PublicKey(accountField);

    // Create a connection to the cluster
    const connection = new Connection(process.env.HELIUS_RPC as string);

    // Get values from the query string
    const {
      amount,
      merchant,
      reference,
      splToken,
      partner,
      settlement,
    } = req.query;

    // Check that all required values are present.
    if (!amount) {
      logger.error('missing amount', req.query);
      throw new Error('missing amount');
    }
    if (!merchant) {
      logger.error('missing merchant', req.query);
      throw new Error('missing merchant');
    }
    if (!reference) {
      logger.error('missing reference', req.query);
      throw new Error('missing reference');
    }
    if (!partner) {
      logger.error('missing partner', req.query);
      throw new Error('missing partner');
    }

    // Check that all values are valid.
    if (new PublicKey(partner as string).equals(new PublicKey(merchant as string))) {
      logger.error('partner address cannot be the same as the merchant address', req.query);
      throw new Error('partner address cannot be the same as the merchant address');
    }

    // get the receiver from the database by name
    const recipient = new PublicKey(merchant as string);

    // Create a transaction to transfer the amount to the receiver.
    let transaction;
    if (splToken && settlement) {
      // if the token is the same as the settlement token, then just transfer the token
      if (splToken === settlement) {
        transaction = await createTransfer(connection, sender, {
          recipient,
          amount: new BigNumber(amount as string).decimalPlaces(9, BigNumber.ROUND_UP),
          reference: new PublicKey(reference as string),
          splToken: new PublicKey(splToken as string),
        }, { commitment: 'confirmed' });
      } else {
        // otherwise, swap the token to the settlement token
        transaction = await swap(sender.toBase58(), recipient.toBase58(), splToken as string, settlement as string, new BigNumber(amount as string).multipliedBy(1000000).toString(), 50);
      }
    } else if (splToken && !settlement) {
      // if the token is provided, but the settlement token is not, then just transfer the token
      transaction = await createTransfer(connection, sender, {
        recipient,
        amount: new BigNumber(amount as string).decimalPlaces(9, BigNumber.ROUND_UP),
        reference: new PublicKey(reference as string),
        splToken: new PublicKey(splToken as string),
      }, { commitment: 'confirmed' });
    } else if (!splToken && settlement) {
      // if the settlement token is provided, but the token is not, then swap SOL to the settlement token
      transaction = await swap(sender.toBase58(), recipient.toBase58(), 'So11111111111111111111111111111111111111112', settlement as string, new BigNumber(amount as string).multipliedBy(1000000).toString(), 50);
    } else {
      // otherwise, just transfer SOL
      transaction = await createTransfer(connection, sender, {
        recipient,
        amount: new BigNumber(amount as string).decimalPlaces(9, BigNumber.ROUND_UP),
        reference: new PublicKey(reference as string),
      }, { commitment: 'confirmed' });
    }

    // Charge a fee in USD for the transaction.
    const totalFee = new BigNumber('0.75');

    // Get the price of SOL/USD from Pyth.
    const solanaClusterName = 'mainnet-beta';
    const pythClient = new PythHttpClient(
      connection,
      getPythProgramKeyForCluster(solanaClusterName),
    );
    const solUSD = new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG');
    const data = await pythClient.getAssetPricesFromAccounts([solUSD]);
    if (data[0].confidence! > 2000000) {
      logger.error('Price is not confident enough', data[0].confidence);
      throw new Error('Price is not confident enough');
    }

    // Calculate the fee in SOL.
    const { price } = data[0];
    const fee = totalFee
      .dividedBy(price?.toString() as string)
      .decimalPlaces(9, BigNumber.ROUND_UP);

    // Create transactions to transfer the fee to the bank, partner, and merchant.
    const partnerFee = fee.multipliedBy('0.2').decimalPlaces(9, BigNumber.ROUND_UP);
    const merchantFee = fee.multipliedBy('0.1').decimalPlaces(9, BigNumber.ROUND_UP);
    const stFee = fee.minus(partnerFee).minus(merchantFee).decimalPlaces(9, BigNumber.ROUND_UP);

    const stFeeTransaction = await createTransfer(connection, sender, {
      recipient: new PublicKey(process.env.BANK_ADDRESS as string),
      amount: stFee,
    }, { commitment: 'confirmed' });

    const partnerFeeTransaction = await createTransfer(connection, sender, {
      recipient: new PublicKey(partner as string),
      amount: partnerFee,
    }, { commitment: 'confirmed' });

    const merchantFeeTransaction = await createTransfer(connection, sender, {
      recipient,
      amount: merchantFee,
    }, { commitment: 'confirmed' });

    transaction.add(stFeeTransaction);
    transaction.add(partnerFeeTransaction);
    transaction.add(merchantFeeTransaction);

    // Serialize and return the unsigned transaction.
    const serializedTransaction = transaction.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    });

    // Convert the serialized transaction to base64.
    const base64Transaction = serializedTransaction.toString('base64');

    // Append the address to the webhook.
    try {
      const helius = new Helius(process.env.HELIUS_API_KEY as string);
      await helius.appendAddressesToWebhook(
        process.env.HELIUS_WEBHOOK_ID as string,
        [merchant as string],
      );
    } catch (e) {
      logger.error('failed to append address to webhook', e);
      throw new Error('failed to append address to webhook');
    }

    // Return the base64 encoded transaction.
    res.status(200).send({ transaction: base64Transaction });
  } catch (e) {
    logger.error('failed to create transaction', e);
    res.status(400).send({ message: e });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return get(req, res);
  }
  if (req.method === 'POST') {
    return post(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
