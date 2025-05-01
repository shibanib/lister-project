import type { Metadata } from "next";
import { Saira } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const saira = Saira({ 
  subsets: ["latin"], 
  variable: '--font-saira',
  display: 'swap'
});

const fogtwo = localFont({
  src: './fonts/FogtwoNo5.otf',
  variable: '--font-fogtwo',
  display: 'swap'
});

const vg5000 = localFont({
  src: './fonts/VG5000-Regular.otf',
  variable: '--font-vg5000',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Listfully - Simple List Maker',
  description: 'Create, rearrange, and style lists with ease. Cross items out with a crayon and save automatically.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="favicon.ico" type="image/x-icon" sizes="16x16" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`
        ${saira.variable} 
        ${fogtwo.variable}
        ${vg5000.variable}
      `}>
        {children}
      </body>
    </html>
  );
}
