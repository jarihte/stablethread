/* eslint-disable max-len */
import { createTransfer } from '@solana/pay';
import {
  Connection, PublicKey, Transaction, AccountMeta,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import pino from 'pino';
import swap from './swap';

type TxParams = {
  logger: pino.Logger,
  connection: Connection,
  payment: PublicKey | undefined,
  settlement: PublicKey | undefined,
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
  if (payment && settlement) {
  // if the token is the same as the settlement token, then just transfer the token
    if (payment.equals(settlement)) {
      transaction = await createTransfer(connection, sender, {
        recipient,
        amount,
        splToken: payment,
        reference,
      }, { commitment: 'confirmed' });
    } else {
    // otherwise, swap the token to the settlement token
      transaction = await swap({
        logger,
        sender,
        recipient,
        inputMint: payment.toBase58(),
        outputMint: settlement.toBase58(),
        amount: amount.multipliedBy(1000000).toString(),
        slippageBps: slippage,
      });
      const accountMeta : AccountMeta = {
        pubkey: reference,
        isSigner: false,
        isWritable: true,
      };
      transaction.instructions[0].keys.push(accountMeta);
    }
  } else if (payment && !settlement) {
  // if the token is provided, but the settlement token is not, then just transfer the token
    transaction = await createTransfer(connection, sender, {
      recipient,
      amount,
      splToken: payment,
      reference,
    }, { commitment: 'confirmed' });
  } else if (!payment && settlement) {
  // if the settlement token is provided, but the token is not, then swap SOL to the settlement token
    transaction = await swap({
      logger,
      sender,
      recipient,
      inputMint: 'So11111111111111111111111111111111111111112',
      outputMint: settlement.toBase58(),
      amount: amount.multipliedBy(1000000).toString(),
      slippageBps: slippage,
    });
    const accountMeta : AccountMeta = {
      pubkey: reference,
      isSigner: false,
      isWritable: true,
    };
    transaction.instructions[0].keys.push(accountMeta);
  } else {
  // otherwise, just transfer SOL
    transaction = await createTransfer(connection, sender, {
      recipient,
      reference,
      amount: new BigNumber(amount).decimalPlaces(9, BigNumber.ROUND_UP),
    }, { commitment: 'confirmed' });
  }

  return transaction;
}
