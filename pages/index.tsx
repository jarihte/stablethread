/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-children-prop */
import React from 'react';
import Hero from '../components/Hero';
import Content from '../components/Content';
import { NextPageWithLayout } from './_app';
import Layout from '../components/Layout';

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
    </>
  );
};

component.getLayout = (page) => (
  <Layout>{page}</Layout>
);

export default component;
