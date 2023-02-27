import { createQR, encodeURL } from '@solana/pay';
import { Keypair } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

type TxData = {
  accounts: string[];
};

export default async function Component() {
  const [qr, setQR] = useState<string>();
  const [msgSocket, setMsgSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>();

  useEffect(() => {
    let socket: Socket | null = null;
    fetch('https://stablethread.com/api/socket').finally(() => {
      socket = io('https://stablethread.com', { path: '/api/socket' });
      setMsgSocket(socket);
    });
  });

  const reference = new Keypair().publicKey.toBase58();
  const amount = '0.01';
  const address = '2LRnpYKkfGQBBGAJbU5V6uKrYVH57uH5gx75ksbbNbLn';
  const qrLink = createQR(encodeURL({
    link: new URL(`https://stablethread.com/api/qr?amount=${amount}&address=${address}&reference=${reference}`),
  }));

  const pngRaw = await qrLink.getRawData();

  if (pngRaw && msgSocket) {
    const png = URL.createObjectURL(pngRaw);
    setQR(png);
    msgSocket.on('transfer', async (txData: TxData) => {
      if (txData.accounts.includes(reference)) {
        console.log('Transfer complete');
        setQR('');
      }
    });
  }
  if (qr) {
    return (
      <div>
        <img src={qr} alt="QR" />
      </div>
    );
  }
  return null;
}
