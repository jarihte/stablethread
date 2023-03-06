/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPythProgramKeyForCluster, PythHttpClient } from '@pythnetwork/client';
import { createTransfer } from '@solana/pay';
import { PublicKey, Connection, Transaction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import pino from 'pino';

type FeeParams = {
  logger: pino.Logger,
  connection: Connection,
  sender: PublicKey,
  recipient: PublicKey,
  partner: PublicKey,
  transaction: Transaction,
};

export default async function createFee({
  logger,
  connection,
  sender,
  recipient,
  partner,
  transaction,
}: FeeParams) : Promise<Transaction> {
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
    recipient: partner,
    amount: partnerFee,
  }, { commitment: 'confirmed' });

  const merchantFeeTransaction = await createTransfer(connection, sender, {
    recipient,
    amount: merchantFee,
  }, { commitment: 'confirmed' });

  transaction.add(stFeeTransaction);
  transaction.add(partnerFeeTransaction);
  transaction.add(merchantFeeTransaction);
  return transaction;
}
