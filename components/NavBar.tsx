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
                <PageLink href="/" className="nav-link" testId="navbar-home" icon={null} tabIndex={undefined}>
                  <img src="/images/archpaid-icon.png" alt="logo" height="50px" />
                </PageLink>
              </NavItem>
              <NavItem style={{ paddingTop: '18px' }}>
                <PageLink href="/" className="nav-link" testId="navbar-home" icon={null} tabIndex={undefined}>
                  Home
                </PageLink>
              </NavItem>
              <NavItem style={{ paddingTop: '18px' }}>
                <PageLink href="https://github.com/bevanhunt/archpaid" className="nav-link" testId="navbar-home" icon={null} tabIndex={undefined}>
                  GitHub
                </PageLink>
              </NavItem>
              <NavItem style={{ paddingTop: '18px' }}>
                <PageLink href="https://www.canva.com/design/DAFb850S5Ho/xr63Lzlgi-rrxIgGx5Q5Ew/view?utm_content=DAFb850S5Ho&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" className="nav-link" testId="navbar-home" icon={null} tabIndex={undefined}>
                  Pitch Deck
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
