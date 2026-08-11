import "./globals.css";

export const metadata = {
  title: "Platform B | Kilimo Quote v2 Portal",
  description: "Simulated market-data API for regional agricultural crop quotes with TZS and USD values."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
