/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
import { getPythProgramKeyForCluster, PythHttpClient } from '@pythnetwork/client';
import { createTransfer } from '@solana/pay';
import { Connection, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Helius } from 'helius-sdk';
import { NextApiRequest, NextApiResponse } from 'next/types';
import NextCors from 'nextjs-cors';
import pino from 'pino';
import pretty from 'pino-pretty';

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
  // Enable CORS
  await NextCors(req, res, {
    // Options
    methods: ['POST'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  // setup logging
  const stream = pretty({
    colorize: true,
  });
  const logger = pino(stream);

  // Account provided in the transaction request body by the wallet.
  const accountField = req.body?.account;
  if (!accountField) throw new Error('missing account');

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
  if (splToken) {
    transaction = await createTransfer(connection, sender, {
      recipient,
      amount: new BigNumber(amount as string).decimalPlaces(9, BigNumber.ROUND_UP),
      reference: new PublicKey(reference as string),
      splToken: new PublicKey(splToken as string),
    }, { commitment: 'confirmed' });
  } else {
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
  const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(solanaClusterName));
  const data = await pythClient.getAssetPricesFromAccounts([new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG')]);
  if (data[0].confidence! > 2000000) {
    throw new Error('Price is not confident enough');
  }

  // Calculate the fee in SOL.
  const { price } = data[0];
  const fee = totalFee.dividedBy(price?.toString() as string).decimalPlaces(9, BigNumber.ROUND_UP);

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
  const helius = new Helius(process.env.HELIUS_API_KEY as string);
  await helius.appendAddressesToWebhook(process.env.HELIUS_WEBHOOK_ID as string, [merchant as string]);

  // Return the base64 encoded transaction.
  res.status(200).send({ transaction: base64Transaction });
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
