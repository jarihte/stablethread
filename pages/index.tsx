/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-children-prop */
import React from 'react';
import Link from 'next/link';
import { Button } from 'reactstrap';
import Hero from '../components/Hero';
import Content from '../components/Content';
import { NextPageWithLayout } from './_app';
import Layout from '../components/Layout';

const meldUSDCURL = 'https://fluidmoney.xyz/?publicKey=WGuE3CWry1j4o3R9t48HYN:3b7Vi66ub2NFjbAYH3WsLzQMZ2Vp8gDjQQDv&destinationCurrencyCodeLocked=USDC_SOLANA';
const meldUSDTURL = 'https://fluidmoney.xyz/?publicKey=WGuE3CWry1j4o3R9t48HYN:3b7Vi66ub2NFjbAYH3WsLzQMZ2Vp8gDjQQDv&destinationCurrencyCodeLocked=USDT_SOLANA';

const component : NextPageWithLayout = function Page() {
  return (
    <>
      <Hero />
      <hr />
      <Content />

      <div className="text-center hero" style={{ marginTop: '100px' }}>
        <h2>CodeSandbox Example</h2>
        <div style={{ marginTop: '50px' }}>
          <a href="https://codesandbox.io/s/stablethead-example-3v04oe?file=/src/App.tsx" target="_blank" rel="noreferrer">
            <img src="/images/codesandbox.svg" alt="CodeSandbox" width="20%" />
          </a>
        </div>
      </div>
      <div className="text-center hero" style={{ marginTop: '100px' }}>
        <h2>Live Example</h2>
        <a href="https://www.circlesub.com/tip/komdodx" target="_blank" rel="noreferrer">
          <img src="/images/circlesub.svg" alt="CircleSub" width="60%" />
        </a>
      </div>
      <div className="text-center hero" style={{ marginTop: '50px', marginBottom: '100px' }}>
        <div style={{ marginBottom: '30px' }}>
          <Link href={meldUSDCURL} target="_blank">
            <Button className="rounded" style={{ width: '50%', height: '50px', fontSize: '1.5rem' }}>Buy Solana USDC</Button>
          </Link>
        </div>
        <div>
          <Link href={meldUSDTURL} target="_blank">
            <Button className="rounded" style={{ width: '50%', height: '50px', fontSize: '1.5rem' }}>Buy Solana USDT</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

component.getLayout = (page) => (
  <Layout>{page}</Layout>
);

export default component;
