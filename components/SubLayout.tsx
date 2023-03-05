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
        <title>ArchPaid - Solana Pay made simple</title>
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="description" content="ArchPaid - Solana Pay made simple" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="content-language" content="en" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
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
