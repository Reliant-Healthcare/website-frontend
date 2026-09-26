import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBanner from "@/components/TopBanner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBanner />
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
