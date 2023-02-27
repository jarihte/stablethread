import React, { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next/types';
import '@fortawesome/fontawesome-svg-core/styles.css';
import SubLayout from './SubLayout';

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
};

type AppPropsWithLayout = {
  children: ReactNode;
};

export default function Layout({ children }: AppPropsWithLayout) {
  return (
    <SubLayout>
      {children}
    </SubLayout>
  );
}
