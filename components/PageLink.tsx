import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import React from 'react';

import NavBarItem from './NavBarItem';

type PageLinkProps = {
  href: string;
  children: React.ReactNode;
  className: string | undefined;
  icon: IconProp | null;
  tabIndex: number | undefined;
  testId: string;
};

function PageLink({
  children, href, className, icon, tabIndex, testId,
}: PageLinkProps) {
  return (
    <Link href={href}>
      <NavBarItem className={className} icon={icon} tabIndex={tabIndex} testId={testId}>
        {children}
      </NavBarItem>
    </Link>
  );
}

export default PageLink;
