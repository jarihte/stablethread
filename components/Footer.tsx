/* eslint-disable max-len */
import Link from 'next/link';
import React from 'react';

function Footer() {
  return (
    <div className="bg-light p-3 text-center" data-testid="footer">
      <p data-testid="footer-text">
        <Link href="/terms">Terms of Service</Link>
      </p>
      <p>
        <Link href="/privacy">Privacy Policy</Link>
      </p>
    </div>
  );
}

export default Footer;
