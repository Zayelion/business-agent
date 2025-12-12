import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Business Agent Console',
  description: 'Trigger and observe agents within the business system.'
};

/**
 * Root layout for the Business Agent Next.js application.
 * @param {{ children: React.ReactNode }} props Component properties containing child routes.
 * @returns {JSX.Element} React root layout element.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
