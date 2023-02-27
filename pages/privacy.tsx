import React from 'react';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout';
import privacy from '../markdown/privacy';
import { NextPageWithLayout } from './_app';

const component : NextPageWithLayout = () => (
  <div className="mb-5" data-testid="external">
    <div data-testid="external-text">
      <p className="lead">
        <ReactMarkdown>
          {privacy}
        </ReactMarkdown>
      </p>
    </div>
  </div>
);

component.getLayout = (page) => (
  <Layout>{page}</Layout>
);

export default component;
