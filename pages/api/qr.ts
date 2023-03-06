import { Connection, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Helius } from 'helius-sdk';
import { NextApiRequest, NextApiResponse } from 'next/types';
import NextCors from 'nextjs-cors';
import pino from 'pino';
import pretty from 'pino-pretty';
import createFee from './modules/qr/fee';
import createTransaction from './modules/qr/tx';

async function get(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    label: 'ArchPaid',
    icon: 'https://archpaid.com/images/archpaid-icon.png',
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
      amount: amountParam,
      merchant: merchantParam,
      reference: referenceParam,
      splToken: splTokenParam,
      partner: partnerParam,
      settlement: settlementParam,
    } = req.query;

    // Check that all required values are present.
    if (!amountParam) {
      logger.error('missing amount', req.query);
      throw new Error('missing amount');
    }
    if (!merchantParam) {
      logger.error('missing merchant', req.query);
      throw new Error('missing merchant');
    }
    if (!referenceParam) {
      logger.error('missing reference', req.query);
      throw new Error('missing reference');
    }
    if (!partnerParam) {
      logger.error('missing partner', req.query);
      throw new Error('missing partner');
    }

    const partner = new PublicKey(partnerParam as string);
    const merchant = new PublicKey(merchantParam as string);
    const reference = new PublicKey(referenceParam as string);

    let settlement: PublicKey | undefined;
    if (settlementParam) {
      settlement = new PublicKey(settlementParam as string);
    }
    let splToken: PublicKey | undefined;
    if (splTokenParam) {
      splToken = new PublicKey(splTokenParam as string);
    }

    const amount = new BigNumber(amountParam as string).decimalPlaces(9, BigNumber.ROUND_UP);

    // Check that all values are valid.
    if (partner === merchant) {
      logger.error('partner address cannot be the same as the merchant address', req.query);
      throw new Error('partner address cannot be the same as the merchant address');
    }

    // Create the transaction with 50bps slippage.
    const transaction = await createTransaction({
      logger,
      connection,
      splToken,
      settlement,
      sender,
      recipient: merchant,
      amount,
      slippage: 50,
    });

    // Add fee
    const transactionwithFee = await createFee({
      logger,
      connection,
      sender,
      recipient: merchant,
      partner,
      transaction,
      reference,
    });

    // Serialize and return the unsigned transaction.
    const serializedTransaction = transactionwithFee.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    });

    // Convert the serialized transaction to base64.
    const base64Transaction = serializedTransaction.toString('base64');

    // // Append the address to the webhook.
    // try {
    //   const helius = new Helius(process.env.HELIUS_API_KEY as string);
    //   await helius.appendAddressesToWebhook(
    //     process.env.HELIUS_WEBHOOK_ID as string,
    //     [merchant.toBase58()],
    //   );
    // } catch (e) {
    //   logger.error('failed to append address to webhook', e);
    //   throw new Error('failed to append address to webhook');
    // }

    // Return the base64 encoded transaction.
    res.status(200).send({ transaction: base64Transaction });
  } catch (e) {
    logger.error('failed to create transaction');
    logger.error(e);
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
