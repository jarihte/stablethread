/* eslint-disable max-len */
import { createTransfer } from '@solana/pay';
import {
  Connection, PublicKey, Transaction, AccountMeta,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import pino from 'pino';
import swap from './swap';

type Token = {
  name: string,
  key: PublicKey,
};

type TxParams = {
  logger: pino.Logger,
  connection: Connection,
  payment: Token,
  settlement: Token,
  sender: PublicKey,
  recipient: PublicKey,
  amount: BigNumber,
  slippage: number,
  reference: PublicKey,
};

export default async function createTransaction({
  logger,
  connection,
  payment,
  settlement,
  sender,
  recipient,
  amount,
  slippage,
  reference,
}: TxParams) : Promise<Transaction> {
// Create a transaction to transfer the amount to the receiver.
  let transaction : Transaction;
  // if the payment token is the same as the settlement token, then just transfer the payment token
  if (payment.name === settlement.name) {
    transaction = await createTransfer(connection, sender, {
      recipient,
      amount,
      splToken: payment.key,
      reference,
    }, { commitment: 'confirmed' });
  } else {
    // otherwise, swap the payment token to the settlement token
    transaction = await swap({
      logger,
      sender,
      recipient,
      inputMint: payment.key.toBase58(),
      outputMint: settlement.key.toBase58(),
      amount: amount.multipliedBy(1000000).decimalPlaces(0, BigNumber.ROUND_UP).toString(),
      slippageBps: slippage,
    });
    const accountMeta : AccountMeta = {
      pubkey: reference,
      isSigner: false,
      isWritable: true,
    };
    transaction.instructions[0].keys.push(accountMeta);
  }

  return transaction;
}
