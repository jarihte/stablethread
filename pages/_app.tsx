/* eslint-disable max-len */
/* eslint-disable react/jsx-props-no-spreading */
import React, { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next/types';
import initFontAwesome from '../utils/initFontAwesome';
import '../styles/globals.css';

initFontAwesome();

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
};

type AppPropsWithLayout = {
  Component: NextPageWithLayout,
};

export default function MyApp({ Component }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(<Component />);
}
