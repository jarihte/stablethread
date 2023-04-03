import React from 'react';
import Layout from '../components/Layout';
import { NextPageWithLayout } from './_app';

const component : NextPageWithLayout = () => (
  <>
    <meta name="robots" content="noindex, follow" />
    <div className="mb-5" data-testid="external">
      <h2>Providers</h2>
      <div data-testid="external-text">
        <ul>
          <li>
            <a href="https://helius.xyz" target="_blank" rel="noopener noreferrer">Helius</a>
          </li>
          <li>
            <a href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer">Cloudflare</a>
          </li>
          <li>
            <a href="https://render.com/" target="_blank" rel="noopener noreferrer">Render</a>
          </li>
          <li>
            <a href="https://jup.ag" target="_blank" rel="noopener noreferrer">Jupiter Aggregator</a>
          </li>
          <li>
            <a href="https://solanapay.com" target="_blank" rel="noopener noreferrer">SolanaPay</a>
          </li>
          <li>
            <a href="https://www.solana.com" target="_blank" rel="noopener noreferrer">Solana</a>
          </li>
          <li>
            <a href="https://pyth.network" target="_blank" rel="noopener noreferrer">Pyth Network</a>
          </li>
          <li>
            <a href="https://meld.io" target="_blank" rel="noopener noreferrer">Meld</a>
          </li>
        </ul>
      </div>
    </div>
  </>
);

component.getLayout = (page) => (
  <Layout>{page}</Layout>
);

export default component;
