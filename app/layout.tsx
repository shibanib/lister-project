import type { Metadata } from "next";
import { Saira } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const saira = Saira({ subsets: ["latin"], variable: '--font-saira' });
const fogtwo = localFont({
  src: './fonts/FogtwoNo5.otf',
  variable: '--font-fogtwo'
});
const vg5000 = localFont({
  src: './fonts/VG5000-Regular.otf',
  variable: '--font-vg5000'
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
