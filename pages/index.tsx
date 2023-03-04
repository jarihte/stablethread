/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-children-prop */
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import Hero from '../components/Hero';
import Content from '../components/Content';
import { NextPageWithLayout } from './_app';
import Layout from '../components/Layout';

const markdown = `
### React TypeScript Example
~~~ts
import { createQR, encodeURL } from '@solana/pay';
import { Keypair } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import qs from 'qs';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

type TxData = {
  accounts: string[];
};

export default async function Component() {
  // create the state to hold the QR code and socket connection
  const [qr, setQR] = useState<string>();
  const [msgSocket, setMsgSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>();

  // create the socket connection
  useEffect(() => {
    let socket: Socket | null = null;
    fetch('https://stablethread.com/api/socket').finally(() => {
      socket = io('https://stablethread.com', { path: '/api/socket' });
      setMsgSocket(socket);
    });
  });

  // the reference to track the transfer (must be unique per transaction) - required parameter
  const reference = new Keypair().publicKey.toBase58();

  // the amount to transfer - required parameter
  const amount = '0.01';
  
  // the address to receive the transfer - required parameter
  const to = '2LRnpYKkfGQBBGAJbU5V6uKrYVH57uH5gx75ksbbNbLn';
  
  // the SPL token to transfer - in this case USDC - optional parameter
  const splToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  // the partner address to collect 20% of the StableThread fee (must be not to or merchant) - required parameter
  const partner = '6otdmKAVQXrYFWjM1mueg61bFnTHARimH7jfGX4WxpgV';

  // the merchant address to collect 10% of the StableThread fee (must be not partner - can be to) - required parameter
  const merchant = 'BS2AHiggYfEgLswZBRzQhCG6xkaYphdFxqGN2xL5hCMd';
  
  // create the query string
  const qString = qs.stringify({ amount, to, reference, splToken, partner, merchant });

  // create the QR code
  const qrLink = createQR(encodeURL({
    link: new URL(\`https://stablethread.com/api/qr?\${qString}\`),
  }));

  // get the raw data to create QR code image
  const pngRaw = await qrLink.getRawData();

  // if the QR code is created, set state the QR code 
  // and wait for the transfer to complete
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
  // render the QR code
  if (qr) {
    return (
      <div>
        <img src={qr} alt="QR" />
      </div>
    );
  }
  return null;
}
~~~
`;

const component : NextPageWithLayout = function Page() {
  const [style, setStyle] = useState({});
  useEffect(() => {
    import('react-syntax-highlighter/dist/esm/styles/prism/atom-dark')
      .then((mod) => setStyle(mod.default));
  });

  return (
    <>
      <Hero />
      <hr />
      <Content />
      <div className="text-center" style={{ marginTop: '100px' }}>
        <ReactMarkdown
          children={markdown}
          components={{
            code({
              node, inline, className, children, ...props
            }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={style}
                  children={String(children).replace(/\n$/, '')}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
        ,
      </div>
      <div className="text-center hero" style={{ marginTop: '100px' }}>
        <h2>Customers</h2>
        <a href="https://www.circlesub.com/">
          <img src="/images/circlesub.svg" alt="CircleSub" width="80%" />
        </a>
      </div>
    </>
  );
};

component.getLayout = (page) => (
  <Layout>{page}</Layout>
);

export default component;
