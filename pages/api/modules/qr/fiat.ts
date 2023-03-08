/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPythProgramKeyForCluster, PythHttpClient } from '@pythnetwork/client';
import { PublicKey, Connection } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import pino from 'pino';

type Token = {
  name: string,
  key: PublicKey,
};

type FiatParams = {
  logger: pino.Logger,
  connection: Connection,
  fiat: string,
  payment: Token,
  fiatAmount: BigNumber,
};

export default async function createPaymentAmountFromFiat({
  logger,
  connection,
  fiat,
  payment,
  fiatAmount,
}: FiatParams) : Promise<BigNumber> {
// Charge a fee in USD for the transaction.

  // Get the price of SOL/USD from Pyth.
  const solanaClusterName = 'mainnet-beta';
  const pythClient = new PythHttpClient(
    connection,
    getPythProgramKeyForCluster(solanaClusterName),
  );

  let priceKeys;
  switch (payment.name) {
    case 'USDC':
      switch (fiat) {
        case 'USD':
          priceKeys = ['Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD'];
          break;
        case 'CAD':
          priceKeys = ['Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD', '4JZWJpMYPvNyADn2BgVwy8Z3zTgXfyWiaV2gvKNda4Hw'];
          break;
        default:
          throw new Error('Unsupported fiat');
      }
      break;
    case 'USDT':
      switch (fiat) {
        case 'USD':
          priceKeys = ['3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'];
          break;
        case 'CAD':
          priceKeys = ['3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL', '4JZWJpMYPvNyADn2BgVwy8Z3zTgXfyWiaV2gvKNda4Hw'];
          break;
        default:
          throw new Error('Unsupported fiat');
      }
      break;
    default:
      throw new Error('Unsupported payment token');
  }

  // Get the price data from Pyth.
  priceKeys = priceKeys.map((key) => new PublicKey(key));
  const priceData = await pythClient.getAssetPricesFromAccounts(priceKeys);
  for (let i = 0; i < priceData.length; i++) {
    if (priceData[i].confidence! > 2000000) {
      logger.error('Price is not confident enough');
      throw new Error('Price is not confident enough');
    }
  }

  // Convert the fiat amount to the payment token amount.
  let amount = fiatAmount.toNumber();
  for (let i = 0; i < priceData.length; i++) {
    amount *= (1 / priceData[i].price!);
  }

  // Round up the amount to the correct decimal places.
  let decAmount: BigNumber;
  switch (payment.name) {
    case 'USDC':
      decAmount = new BigNumber(amount).decimalPlaces(6, BigNumber.ROUND_UP);
      break;
    case 'USDT':
      decAmount = new BigNumber(amount).decimalPlaces(6, BigNumber.ROUND_UP);
      break;
    default:
      throw new Error('Unsupported payment token');
  }

  return decAmount;
}
