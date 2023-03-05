import React from 'react';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout';
import terms from '../markdown/terms';
import { NextPageWithLayout } from './_app';

const component : NextPageWithLayout = () => (
  <>
    <meta name="robots" content="noindex, follow" />
    <div className="mb-5" data-testid="external">
      <div data-testid="external-text">
        <p className="lead">
          <ReactMarkdown>
            {terms}
          </ReactMarkdown>
        </p>
      </div>
    </div>
  </>
);

component.getLayout = (page) => (
  <Layout>{page}</Layout>
);

export default component;
