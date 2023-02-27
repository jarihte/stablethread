/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';

import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
} from 'reactstrap';

import PageLink from './PageLink';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="nav-container" data-testid="navbar">
      <Navbar color="light" light expand="md">
        <Container>
          <NavbarToggler onClick={toggle} data-testid="navbar-toggle" />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="mr-auto" navbar data-testid="navbar-items">
              <NavItem style={{ paddingTop: '5px' }}>
                <PageLink href="https://stablethread.com" className="nav-link" testId="navbar-home" icon={null} tabIndex={undefined}>
                  <img src="/stablethread-icon.png" alt="logo" height="50px" />
                </PageLink>
              </NavItem>
              <NavItem style={{ paddingTop: '18px' }}>
                <PageLink href="/" className="nav-link" testId="navbar-home" icon={null} tabIndex={undefined}>
                  Home
                </PageLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default NavBar;
