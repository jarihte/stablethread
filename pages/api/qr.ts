/* eslint-disable max-len */
import { createTransfer } from '@solana/pay';
import { Connection, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Helius } from 'helius-sdk';
import { NextApiRequest, NextApiResponse } from 'next/types';
import NextCors from 'nextjs-cors';

async function get(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    // Options
    methods: ['GET'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  res.status(200).json({
    label: 'StableThread',
    icon: 'https://stablethread.com/images/stablethread-icon.png',
  });
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    // Options
    methods: ['POST'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

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
    to,
    reference,
    splToken,
    partner,
  } = req.query;

  // get the receiver from the database by name
  const recipient = new PublicKey(to as string);

  // Create a transaction to transfer the amount to the receiver.
  let transaction;
  if (splToken) {
    transaction = await createTransfer(connection, sender, {
      recipient,
      amount: new BigNumber(amount as string),
      reference: new PublicKey(reference as string),
      splToken: new PublicKey(splToken as string),
    }, { commitment: 'confirmed' });
  } else {
    transaction = await createTransfer(connection, sender, {
      recipient,
      amount: new BigNumber(amount as string),
      reference: new PublicKey(reference as string),
    }, { commitment: 'confirmed' });
  }

  // Charge a fee in SOL.
  const totalFee = new BigNumber(process.env.FEE_AMOUNT as string);

  // If there is a partner, split the fee between the two.
  if (partner) {
    const stFee = totalFee.multipliedBy(process.env.FEE_PERCENTAGE as string);
    const partnerFee = totalFee.minus(stFee);

    const stFeeTransaction = await createTransfer(connection, sender, {
      recipient: new PublicKey(process.env.BANK_ADDRESS as string),
      amount: stFee,
    }, { commitment: 'confirmed' });

    const partnerFeeTransaction = await createTransfer(connection, sender, {
      recipient: new PublicKey(partner as string),
      amount: partnerFee,
    }, { commitment: 'confirmed' });

    transaction.add(stFeeTransaction);
    transaction.add(partnerFeeTransaction);
  } else {
    const stFeeTransaction = await createTransfer(connection, sender, {
      recipient,
      amount: totalFee,
    }, { commitment: 'confirmed' });

    transaction.add(stFeeTransaction);
  }

  // Serialize and return the unsigned transaction.
  const serializedTransaction = transaction.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });

  // Convert the serialized transaction to base64.
  const base64Transaction = serializedTransaction.toString('base64');

  // Append the address to the webhook.
  const helius = new Helius(process.env.HELIUS_API_KEY as string);
  await helius.appendAddressesToWebhook(process.env.HELIUS_WEBHOOK_ID as string, [to as string]);

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
