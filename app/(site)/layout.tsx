import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
