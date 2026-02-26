import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

const poppinsDisplay = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

export const metadata = {
  title: "BOND International Olympiad",
  description: "International-standard olympiad for ambitious students."
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${poppins.variable} ${poppinsDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
