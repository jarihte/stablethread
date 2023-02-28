import React from 'react';
import { Container } from 'reactstrap';
import Head from 'next/head';
import NavBar from './NavBar';
import Footer from './Footer';

type ILayout = {
  children: React.ReactNode;
};

function SubLayout({ children }: ILayout) {
  return (
    <>
      <Head>
        <title>StableThread - Simple Solana Pay</title>
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="description" content="Use Solana Pay simply!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="content-language" content="en" />
      </Head>
      <main id="app" className="d-flex flex-column h-100" data-testid="layout">
        <NavBar />
        <Container className="flex-grow-1 mt-5">{children}</Container>
        <Footer />
      </main>
    </>
  );
}

export default SubLayout;
