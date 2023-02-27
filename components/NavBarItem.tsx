/* eslint-disable max-len */
/* eslint-disable react/prop-types */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface INavBarItem {
  children: React.ReactNode;
  className: string | undefined;
  icon: IconProp | null;
  tabIndex: number | undefined;
  testId: string;
}

function NavBarItem({
  children, className, icon, tabIndex, testId,
}: INavBarItem) {
  return (
    <span className="d-inline-flex align-items-center navbar-item">
      {icon && <FontAwesomeIcon icon={icon} className="mr-3" />}
      <span className={className} tabIndex={tabIndex} data-testid={testId}>
        {children}
      </span>
    </span>
  );
}

export default NavBarItem;
