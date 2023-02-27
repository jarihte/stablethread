/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable max-len */
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React from 'react';

import NavBarItem from './NavBarItem';

interface IAnchorLink {
  children: React.ReactNode;
  className: string | undefined;
  icon: IconProp | null;
  tabIndex: number | undefined;
  testId: string;
  onClick: () => void;
}

function AnchorLink({
  // eslint-disable-next-line react/prop-types
  children, className, icon, tabIndex, testId, onClick,
}: IAnchorLink): JSX.Element | null {
  const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    onClick();
  };

  return (
    <a onClick={handleClick} href="">
      <NavBarItem className={className} icon={icon} tabIndex={tabIndex} testId={testId}>
        {children}
      </NavBarItem>
    </a>
  );
}

export default AnchorLink;
