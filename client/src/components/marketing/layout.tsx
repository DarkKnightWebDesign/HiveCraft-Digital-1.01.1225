import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col hex-pattern">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
