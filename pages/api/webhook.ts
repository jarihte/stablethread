/* eslint-disable no-restricted-syntax */
import { NextApiRequest, NextApiResponse } from 'next/types';
import type { Socket as NetSocket } from 'net';
import type { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

interface SocketServer extends HTTPServer {
  io: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

interface TransferTransaction {
  accountData: {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: never[];
  }[];
  description: string;
  events: Record<string, never>;
  fee: number;
  feePayer: string;
  instructions: {
    accounts: string[];
    data: string;
    innerInstructions:
    {
      accounts: string[];
      data: string;
      programId: string;
    }[],
    programId: string;
  }[];
  nativeTransfers: {
    amount: number;
    fromUserAccount: string;
    toUserAccount: string;
  }[];
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: never[];
  transactionError: null;
  type: string;
}

async function post(req: NextApiRequest, res: NextApiResponseWithSocket) {
  // get the authorization header
  const { headers } = req;
  const { authorization } = headers;

  // check if the authorization header is valid
  if (authorization !== process.env.HELIUS_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'access denied' });
  }

  // get the body of the request and log it
  const { body } = req;
  const json : TransferTransaction[] = body;

  // get the socket
  await fetch(`https://${process.env.DOMAIN_URL}/api/socket`);

  // loop through the transactions and emit them to the socket
  // for both swaps and transfers the first instruction is the one we want
  for (const tx of json) {
    res.socket.server.io?.emit('transfer', tx.instructions[0].accounts);
  }

  return res.status(200).json({ success: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method === 'POST') {
    return post(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
